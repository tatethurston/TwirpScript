import { IncomingMessage, ServerResponse } from "http";
import { TwirpError, statusCodeForErrorCode } from "../error";
import { Emitter, createEventEmitter } from "../eventEmitter";
import { withRequestLogging } from "./requestLogging";

interface Response {
  body: string | Buffer;
  headers: {
    "Content-Type": "application/json" | "application/protobuf";
    [key: string]: string | undefined;
  };
  statusCode: number;
}

interface Request {
  body: string | Buffer | undefined | null;
  headers: {
    "Content-Type": "application/json" | "application/protobuf";
    [key: string]: string | undefined;
  };
  url: string;
}

interface RawRequest {
  body: string | Buffer | undefined | null;
  headers: {
    [key: string]: string | undefined;
  };
  url: string;
  method: string;
}

interface TwirpContext {
  request: RawRequest;
  response?: Response;
  service?: string;
  method?: string;
}

interface ServiceMethod<Context = unknown> {
  handler: (req: any, context: Context) => Promise<unknown> | unknown;
  encode: any;
  decode: any;
}

type Handler<Context> = (
  req: Request,
  ctx: TwirpContext & Context
) => Promise<TwirpError | string | Buffer> | TwirpError | string | Buffer;

export interface ServiceHandler<Context> {
  path: string;
  methods: Record<string, Handler<Context> | undefined>;
}

export function TwirpErrorResponse(error: TwirpError): Response {
  return {
    statusCode: statusCodeForErrorCode[error.code],
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
          const body = parseJSON<T>(req.body as string);
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
          const body = parseProto<T>(req.body as Buffer, decode);
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

function parseRequest(req: RawRequest): TwirpError | Omit<Request, "body"> {
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

  const contentType =
    req.headers["Content-Type"] ?? req.headers["content-type"];

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
   * Puts the Twirp server runtime into debug mode when set to true. This enables request logging. Defaults to true.
   */
  debug?: boolean;
  /**
   * A path prefix such as "/my/custom/prefix". Defaults to "/twirp", but can be set to "".
   */
  prefix?: string;
}

export type Middleware<Context, Request = unknown> = (
  req: Request,
  ctx: TwirpContext & Context,
  next: Next
) => Promise<Response>;

function twirpHandler<Context extends TwirpContext>(
  services: ServiceHandler<Context>[],
  ee: Emitter<ServerHooks<Context>>,
  config: TwirpServerConfig
) {
  return async (req: RawRequest, ctx: Context): Promise<Response> => {
    const parsed = parseRequest(req);
    if (parsed instanceof TwirpError) {
      ee.emit("error", ctx, parsed);
      return TwirpErrorResponse(parsed);
    }

    const request: Request = {
      ...parsed,
      body: req.body,
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

    ctx.service = servicePath;
    ctx.method = serviceMethod;
    ee.emit("requestRouted", ctx);

    const response = await method(request, ctx);
    const res =
      response instanceof TwirpError
        ? TwirpErrorResponse(response)
        : {
            statusCode: 200,
            headers: parsed.headers,
            body: response,
          };

    ctx.response = res;
    ee.emit("responsePrepared", ctx);
    return res;
  };
}

type HookListener<Context> = (ctx: Readonly<TwirpContext & Context>) => void;

type ErrorHookListener<Context> = (
  ctx: Readonly<TwirpContext & Context>,
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

export interface TwirpServerRuntime<Context, Request> {
  /**
   * Registers middleware to manipulate the server request / response lifecycle.
   *
   * The middleware handler will receive `req`, `ctx` and `next` parameters. `req` is the incoming request. `ctx` is a request context object which will be passed to each middleware handler and finally the Twirp service handler you implemented. `ctx` enables you to pass extra parameters to your service handlers that are not available via your service's defined request parameters, and can be used to implement things such as authentication or rate limiting. `next` invokes the next handler in the chain -- either the next registered middleware, or the Twirp service handler you implemented.
   *
   * Middleware is called in order of registration, with the Twirp service handler you implemented invoked last.
   */
  use: (middleware: Middleware<Context, Request>) => this;
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
   * addition to `Context`, the error that occurred is passed as the second argument.
   */
  on: TwirpServerEvent<Context>["on"];
  /**
   * Removes a registered event handler.
   */
  off: TwirpServerEvent<Context>["off"];
}

interface TwirpServer<Context, Request>
  extends TwirpServerRuntime<Context, Request> {
  (req: Request, res: ServerResponse): void;
}

interface TwirpServerless<Context, Request>
  extends TwirpServerRuntime<Context, Request> {
  (req: Request): Promise<Response>;
}

export function createTwirpServer<
  Context = unknown,
  Request extends IncomingMessage = IncomingMessage
>(
  services: ServiceHandler<Context>[],
  config: TwirpServerConfig = {}
): TwirpServer<Context, Request> {
  const _app = createTwirpServerless(services, config);

  async function app(req: Request, res: ServerResponse): Promise<void> {
    const body = await getBody(req);
    const response = await _app({
      ...req,
      body,
    } as RawRequest);
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
  }

  app.use = _app.use;
  app.on = _app.on;
  app.off = _app.off;

  return app as unknown as TwirpServer<Context, Request>;
}

export function createTwirpServerless<
  Context = unknown,
  Request extends RawRequest = RawRequest
>(
  services: ServiceHandler<Context>[],
  config: TwirpServerConfig = {}
): TwirpServerless<Context, Request> {
  const configWithDefaults = {
    debug: true,
    prefix: "/twirp",
    ...config,
  };
  const serverMiddleware: Middleware<Context, Request>[] = [];
  const ee = createEventEmitter<ServerHooks<Context>>();
  const twirp = twirpHandler<TwirpContext & Context>(
    services,
    ee,
    configWithDefaults
  );

  async function app(req: Request): Promise<Response> {
    const ctx: TwirpContext & Context = {
      request: req,
    } as unknown as TwirpContext & Context;
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

    ctx.response = response;
    ee.emit("responseSent", ctx);
    return response;
  }

  app.use = (handler: Middleware<Context, Request>) => {
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

  if (configWithDefaults.debug !== false) {
    withRequestLogging(app);
  }

  return app;
}
