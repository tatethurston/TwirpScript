import { IncomingMessage, ServerResponse } from "http";
import { TwirpError, statusCodeForErrorCode } from "../error";
import { Emitter, createEventEmitter } from "../eventEmitter";

interface Response {
  body: string | Buffer;
  headers: {
    "Content-Type": "application/json" | "application/protobuf";
    [key: string]: string | undefined;
  };
  status: number;
}

interface Request {
  body: Buffer;
  headers: {
    "Content-Type": "application/json" | "application/protobuf";
    [key: string]: string | undefined;
  };
  url: string;
}

interface ServiceMethod<Context = unknown> {
  handler: (req: any, context: Context) => Promise<unknown> | unknown;
  encode: any;
  decode: any;
}

type Handler<Context> = (
  req: Request,
  ctx: Context
) => Promise<TwirpError | string | Buffer> | TwirpError | string | Buffer;

export interface ServiceHandler<Context> {
  path: string;
  methods: Record<string, Handler<Context> | undefined>;
}

export function TwirpErrorResponse(error: TwirpError): Response {
  return {
    status: statusCodeForErrorCode[error.code],
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(error),
  };
}

function parseJSON<Result>(json: string): Result | undefined {
  try {
    return JSON.parse(json) as Result;
  } catch (e) {
    return undefined;
  }
}

function parseProto<T>(
  proto: Uint8Array,
  decode: (proto: Uint8Array) => T
): T | undefined {
  try {
    return decode(proto);
  } catch (e) {
    return undefined;
  }
}

export function createMethodHandler<T, Context>({
  handler,
  encode,
  decode,
}: ServiceMethod<Context>): Handler<Context> {
  return async (req, context) => {
    try {
      switch (req.headers["Content-Type"]) {
        case "application/json": {
          const body = parseJSON<T>(req.body.toString());
          if (!body) {
            return new TwirpError({
              code: "invalid_argument",
              msg: `failed to deserialize argument as JSON`,
            });
          }
          const response = await handler(body, context);
          return JSON.stringify(response);
        }
        case "application/protobuf": {
          const body = parseProto<T>(req.body, decode);
          if (!body) {
            return new TwirpError({
              code: "invalid_argument",
              msg: `failed to deserialize argument as Protobuf`,
            });
          }
          const response = await handler(body, context);
          return Buffer.from(encode(response));
        }
        default: {
          const _exhaust: never = req.headers["Content-Type"];
          return _exhaust;
        }
      }
    } catch (error) {
      if (error instanceof TwirpError) {
        return error;
      } else {
        return new TwirpError({
          code: "internal",
          msg: "server error",
        });
      }
    }
  };
}

async function getBody(req: IncomingMessage): Promise<Buffer> {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const body = Buffer.concat(buffers);
  return body;
}

function parseRequest(
  req: IncomingMessage
): TwirpError | Omit<Request, "body"> {
  if (!req.url) {
    return new TwirpError({
      code: "malformed",
      msg: `no request url provided`,
    });
  }

  if (!req.method) {
    return new TwirpError({
      code: "malformed",
      msg: `no request method provided`,
    });
  }

  const method = req.method.toUpperCase();
  if (method !== "POST") {
    return new TwirpError({
      code: "malformed",
      msg: `unexpected request method ${method}`,
    });
  }

  const contentType = req.headers["content-type"];

  if (!contentType) {
    return new TwirpError({
      code: "malformed",
      msg: `no request content-type provided`,
    });
  }

  if (
    contentType !== "application/json" &&
    contentType !== "application/protobuf"
  ) {
    return new TwirpError({
      code: "malformed",
      msg: `unexpected request content-type ${contentType}`,
    });
  }

  return {
    url: req.url,
    headers: {
      "Content-Type": contentType,
    },
  };
}

type Next = () => Promise<Response>;

interface TwirpServerConfig {
  /**
   * A path prefix such as "/my/custom/prefix". Defaults to "/twirp", but can be set to "".
   */
  prefix: string;
}

export type Middleware<Context = unknown> = (
  req: IncomingMessage,
  ctx: Partial<Context>,
  next: Next
) => Promise<Response>;

function twirpHandler<Context>(
  services: ServiceHandler<Context>[],
  ee: Emitter<ServerHooks<Context>>,
  config: TwirpServerConfig
) {
  return async (req: IncomingMessage, ctx: Context): Promise<Response> => {
    const parsed = parseRequest(req);
    if (parsed instanceof TwirpError) {
      ee.emit("error", ctx, parsed);
      return TwirpErrorResponse(parsed);
    }

    const body = await getBody(req);
    const request: Request = {
      ...parsed,
      body,
    };

    const prefix = config.prefix + "/";
    const methodIdx = request.url.lastIndexOf("/");
    const servicePath = request.url.slice(prefix.length, methodIdx);
    const serviceMethod = request.url.slice(methodIdx + 1);

    const service = services.find(
      (service) =>
        servicePath === service.path && service.methods[serviceMethod]
    );
    const method = service?.methods[serviceMethod];

    if (!request.url.startsWith(prefix) || !method) {
      const error = new TwirpError({
        code: "bad_route",
        msg: `no handler for path POST ${req.url ?? ""}.`,
      });
      ee.emit("error", ctx, error);
      return TwirpErrorResponse(error);
    }

    ee.emit("requestRouted", ctx);

    const response = await method(request, ctx);

    ee.emit("responsePrepared", ctx);

    if (response instanceof TwirpError) {
      return TwirpErrorResponse(response);
    } else {
      return {
        status: 200,
        headers: parsed.headers,
        body: response,
      };
    }
  };
}

type HookListener<Context> = (ctx: Readonly<Context>) => void;

type ErrorHookListener<Context> = (
  ctx: Readonly<Context>,
  err: TwirpError
) => void;

type ServerHooks<Context> = {
  requestReceived: HookListener<Context>;
  requestRouted: HookListener<Context>;
  responsePrepared: HookListener<Context>;
  responseSent: HookListener<Context>;
  error: ErrorHookListener<Context>;
};

type TwirpServerEvent<Context> = Emitter<ServerHooks<Context>>;

interface TwirpServer<Context> {
  (req: IncomingMessage, res: ServerResponse): void;
  /**
   * Registers middleware to manipulate the server request / response lifecycle.
   *
   * The middleware handler will receive `req`, `ctx` and `next` parameters. `req` is the incoming request. `ctx` is a request context object which will be passed to each middleware handler and finally the Twirp service handler you implemented. `ctx` enables you to pass extra parameters to your service handlers that are not available via your service's defined request parameters, and can be used to implement things such as authentication or rate limiting. `next` invokes the next handler in the chain -- either the next registered middleware, or the Twirp service handler you implemented.
   *
   * Middleware is called in order of registration, with the Twirp service handler you implemented invoked last.
   */
  use: (middleware: Middleware<Context>) => TwirpServer<Context>;
  /**
   * Registers event handler that can instrument a Twirp-generated server.
   * These callbacks all accept the current request `Context`.
   *
   * `requestReceived` is called as soon as a request enters the Twirp
   * server at the earliest available moment.
   *
   * `requestRouted` is called when a request has been routed to a
   * particular method of the Twirp server.
   *
   * `responsePrepared` is called when a request has been handled and a
   * response is ready to be sent to the client.
   *
   * `responseSent` is called when all bytes of a response (including an error
   * response) have been written.
   *
   * `error` is called when an error occurs while handling a request. In
   * addition to `Context`, the error is also passed as an argument.
   */
  on: (...args: Parameters<TwirpServerEvent<Context>["on"]>) => this;
  /**
   * Removes a registered event handler
   */
  off: (...args: Parameters<TwirpServerEvent<Context>["off"]>) => this;
}

export function createTwirpServer<Context = unknown>(
  services: ServiceHandler<Context>[],
  config: TwirpServerConfig = { prefix: "/twirp" }
): TwirpServer<Context> {
  const serverMiddleware: Middleware<Context>[] = [];
  const ee = createEventEmitter<ServerHooks<Context>>();
  const twirp = twirpHandler(services, ee, config);

  async function app(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const ctx: Context = {} as Context;
    ee.emit("requestReceived", ctx);

    let response: Response;
    try {
      let idx = 1;
      const middleware = [...serverMiddleware, twirp];
      response = await middleware[0](req, ctx, function next() {
        const nxt = middleware[idx];
        idx++;
        return nxt(req, ctx, next);
      });
    } catch (e) {
      const error =
        e instanceof TwirpError
          ? e
          : new TwirpError({ code: "internal", msg: "server error" });
      ee.emit("error", ctx, error);
      response = TwirpErrorResponse(error);
    }

    res.writeHead(response.status, response.headers);
    res.end(response.body);

    ee.emit("responseSent", ctx);
  }

  app.use = (handler: Middleware<Context>) => {
    serverMiddleware.push(handler);
    return app;
  };

  app.on = (...args: Parameters<TwirpServerEvent<Context>["on"]>) => {
    ee.on(...args);
    return app;
  };

  app.off = (...args: Parameters<TwirpServerEvent<Context>["off"]>) => {
    ee.off(...args);
    return app;
  };

  return app;
}
