import { TwirpError, statusCodeForErrorCode } from "../error/index.js";
import { Emitter, createEventEmitter } from "../eventEmitter/index.js";
import { withRequestLogging } from "./requestLogging/index.js";
import type { ByteSource } from "protoscript";

/**
 * This should never occur.
 *
 * If this error is encountered, please open an issue:
 * https://github.com/tatethurston/TwirpScript/issues/new
 */
const TWIRPSCRIPT_INVARIANT = "TwirpScript Invariant";

export interface Response {
  body: string | Uint8Array;
  headers: {
    [key: string]: string | undefined;
  };
  statusCode: number;
}

export interface Request {
  body: Uint8Array;
  headers: {
    [key: string]: string | undefined;
  };
  url: string;
}

export interface InboundRequest extends Request {
  method: string;
}

export interface ServerResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  end: (chunk: any, cb?: () => void) => void;
  writeHead: (statusCode: number, headers?: ServerRequest["headers"]) => void;
}

export interface ServerRequest {
  headers: Record<string, string | string[] | undefined>;
  method?: string | undefined;
  url?: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
}

type ServerRequestWithBody<SR extends ServerRequest> = SR &
  Pick<Request, "body">;

type ServiceContext<S extends readonly Service[]> =
  | {
      [Idx in keyof S]: {
        service: S[Idx];
        method: NonNullable<S[Idx]["methods"][keyof S[Idx]["methods"]]>;
      };
    }[number]
  | { service: undefined; method: undefined };

/**
 * The requested content-type for the request.
 */
type ContentType = "JSON" | "Protobuf" | "Unknown";

export type TwirpContext<
  ContextExt = unknown,
  Services extends readonly Service[] = Service[],
> = {
  contentType: ContentType;
} & ServiceContext<Services> &
  ContextExt;

interface Message<T> {
  protobuf: {
    encode: (message: T) => Uint8Array;
    decode: (bytes: ByteSource) => T;
  };
  json: {
    encode: (message: T) => string;
    decode: (str: string) => T;
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ServiceMethod<Context = any> {
  name: string;
  handler: (input: any, ctx: Context) => any;
  input: Message<any>;
  output: Message<any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface Service {
  name: string;
  methods: Record<string, ServiceMethod | undefined>;
}

export function TwirpErrorResponse(error: TwirpError): Response {
  return {
    statusCode: statusCodeForErrorCode[error.code],
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(error),
  };
}

export async function executeServiceMethod<Context extends TwirpContext>(
  method: ServiceMethod,
  req: Request,
  context: Context,
  ee: Emitter<ServerHooks<Context, Request>>,
): Promise<string | Uint8Array> {
  switch (context.contentType) {
    case "JSON": {
      let body;
      try {
        const utf8 = new TextDecoder().decode(req.body);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body = method.input.json.decode(utf8);
      } catch (e) {
        throw new TwirpError({
          code: "invalid_argument",
          msg: "failed to deserialize argument as JSON",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ee.emit("requestRouted", context, body);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await method.handler(body, context);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ee.emit("responsePrepared", context, response);
      return method.output.json.encode(response);
    }
    case "Protobuf": {
      let body;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion
        body = method.input.protobuf.decode(req.body);
      } catch (e) {
        throw new TwirpError({
          code: "invalid_argument",
          msg: "failed to deserialize argument as Protobuf",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ee.emit("requestRouted", context, body);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await method.handler(body, context);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ee.emit("responsePrepared", context, response);
      return method.output.protobuf.encode(response);
    }
    // This should never occur because we've processed the content type in
    // validateRequest
    // istanbul ignore: invariant
    case "Unknown": {
      throw new Error(TWIRPSCRIPT_INVARIANT);
    }
    // This should never occur because we've processed the content type in
    // validateRequest
    // istanbul ignore: invariant
    default: {
      const _exhaust: never = context.contentType;
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      throw new Error(TWIRPSCRIPT_INVARIANT + _exhaust);
    }
  }
}

function validateRequest(req: InboundRequest): TwirpError | undefined {
  if (!req.url) {
    return new TwirpError({
      code: "malformed",
      msg: "no request url provided",
    });
  }

  if (!req.method) {
    return new TwirpError({
      code: "malformed",
      msg: "no request method provided",
    });
  }

  if (req.method !== "POST") {
    return new TwirpError({
      code: "malformed",
      msg: `unexpected request method ${req.method}`,
    });
  }

  const contentType = req.headers["content-type"];
  if (!contentType) {
    return new TwirpError({
      code: "malformed",
      msg: "no request content-type provided",
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

function handleError<Context extends TwirpContext>(
  error: TwirpError,
  ctx: Context,
  ee: Emitter<ServerHooks<Context, Request>>,
): Response {
  ee.emit("error", ctx, error);
  return TwirpErrorResponse(error);
}

function handleUserSpaceError<Context extends TwirpContext>(
  error: unknown,
  ctx: Context,
  ee: Emitter<ServerHooks<Context, Request>>,
): Response {
  if (error instanceof TwirpError) {
    return handleError(error, ctx, ee);
  } else {
    ee.emit(
      "error",
      ctx,
      new TwirpError({
        code: "internal",
        msg: "server error",
        // Do expose internal error message in reporting
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        meta: { error: error as any },
      }),
    );
    // Don't expose internal error message in response
    return TwirpErrorResponse(
      new TwirpError({
        code: "internal",
        msg: "server error",
      }),
    );
  }
}

export type Middleware<Context = unknown, Request = unknown> = (
  request: Request,
  context: TwirpContext<Context>,
  next: Next,
) => Promise<Response>;

export function twirpHandler<Context extends TwirpContext>(
  ee: Emitter<ServerHooks<Context, Request>>,
) {
  return async (req: InboundRequest, ctx: Context): Promise<Response> => {
    const err = validateRequest(req);
    if (err) {
      return handleError(err, ctx, ee);
    }

    const handler = ctx.method;
    if (!handler) {
      return handleError(
        new TwirpError({
          code: "bad_route",
          msg: `no handler for path POST ${req.url}.`,
        }),
        ctx,
        ee,
      );
    }

    try {
      const response = await executeServiceMethod(handler, req, ctx, ee);
      return {
        statusCode: 200,
        headers: {
          "content-type": req.headers["content-type"],
        },
        body: response,
      };
    } catch (error) {
      return handleUserSpaceError(error, ctx, ee);
    }
  };
}

type ContextMethod<Context extends TwirpContext> = Exclude<
  Context["method"],
  undefined
>;

export type ServerHooks<Context extends TwirpContext, Request> = {
  requestReceived: (context: Context, request: Request) => void;
  requestRouted: (
    context: Context,
    input: ReturnType<ContextMethod<Context>["input"]["protobuf"]["decode"]>,
  ) => void;
  responsePrepared: (
    context: Context,
    output: ReturnType<ContextMethod<Context>["output"]["protobuf"]["decode"]>,
  ) => void;
  responseSent: (context: Context, response: Response) => void;
  error: (context: Context, error: TwirpError) => void;
};

export interface TwirpServerRuntime<
  Context extends TwirpContext = TwirpContext,
  Request = InboundRequest,
> {
  /**
   * Registers middleware to manipulate the server request / response lifecycle.
   *
   * The middleware handler will receive `request`, `context` and `next` parameters. `request` is the incoming request. `context` is a request context object which will be passed to each middleware handler and finally the Twirp service handler you implemented. `context` enables you to pass extra parameters to your service handlers that are not available via your service's defined request parameters, and can be used to implement things such as authentication or rate limiting. `next` invokes the next handler in the chain -- either the next registered middleware, or the Twirp service handler you implemented.
   *
   * Middleware is called in order of registration, with the Twirp service handler you implemented invoked last.
   */
  use: (middleware: Middleware<Context, Request>) => this;
  /**
   * Registers event handler that can instrument a Twirp-generated server. These callbacks all accept the current request `context` as their first argument.
   *
   * `requestReceived` is called as soon as a request enters the Twirp server at the earliest available moment. Called with the current `context` and the request.
   *
   * `requestRouted` is called when a request has been routed to a service method. Called with the current `context` and the input to the service method.
   *
   * `responsePrepared` is called when a request has been handled by a service method. Called with the current `context` and the response generated by the service method.
   *
   * `responseSent` is called when all bytes of a response (including an error response) have been written. Called with the current `context` and the response.
   *
   * `error` is called when an error occurs while handling a request. Called with the current `context` and the error that occurred.
   *
   */
  on: <Event extends keyof ServerHooks<Context, Request>>(
    event: Event,
    handler: ServerHooks<Context, Request>[Event],
  ) => this;
  /**
   * Removes a registered event handler.
   */
  off: <Event extends keyof ServerHooks<Context, Request>>(
    event: Event,
    handler: ServerHooks<Context, Request>[Event],
  ) => this;
}

interface TwirpServer<
  Context extends TwirpContext,
  Request extends ServerRequest,
> extends TwirpServerRuntime<Context, ServerRequestWithBody<Request>> {
  (req: Request, res: ServerResponse): void;
}

interface TwirpServerless<Context extends TwirpContext, Request>
  extends TwirpServerRuntime<Context, Request> {
  (req: Request): Promise<Response>;
}

function getContentType(contentType: string | undefined): ContentType {
  switch (contentType) {
    case "application/json":
      return "JSON";
    case "application/protobuf":
      return "Protobuf";
    default:
      return "Unknown";
  }
}

function getRequestContext<Services extends readonly Service[]>(
  req: InboundRequest,
  services: Services,
  config: Required<TwirpServerConfig>,
): TwirpContext {
  const ctx: TwirpContext = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment , @typescript-eslint/no-explicit-any
    service: undefined as any,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment , @typescript-eslint/no-explicit-any
    method: undefined as any,
    contentType: getContentType(req.headers["content-type"]),
  };

  const prefix = config.prefix + "/";
  const startsWithPrefix = req.url.startsWith(prefix);
  if (!startsWithPrefix) {
    return ctx;
  }
  const methodIdx = req.url.lastIndexOf("/");
  const serviceName = req.url.slice(prefix.length, methodIdx);
  const serviceMethod = req.url.slice(methodIdx + 1);
  const service = services.find((service) => service.name === serviceName);
  const handler = service?.methods[serviceMethod];
  if (handler) {
    ctx.service = service;
    ctx.method = handler;
  }
  return ctx;
}

function lowercaseHeaders(headers: Request["headers"]): Request["headers"] {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
}

export function createTwirpServerless<
  ContextExt,
  Services extends readonly Service[],
  Request extends InboundRequest = InboundRequest,
>(
  services: Services,
  config: TwirpServerConfig = {},
): TwirpServerless<TwirpContext<ContextExt, typeof services>, Request> {
  const configWithDefaults = {
    debug: true,
    prefix: "/twirp",
    ...config,
  };
  const serverMiddleware: Middleware<
    TwirpContext<ContextExt, typeof services>,
    Request
  >[] = [];
  const ee =
    createEventEmitter<
      ServerHooks<TwirpContext<ContextExt, Services>, Request>
    >();
  const twirp = twirpHandler<TwirpContext<ContextExt, Services>>(ee);

  async function app(rawRequest: Request): Promise<Response> {
    const req = {
      ...rawRequest,
      headers: lowercaseHeaders(rawRequest.headers),
    };
    const ctx = getRequestContext(
      req,
      services,
      configWithDefaults,
    ) as TwirpContext<ContextExt, Services>;
    ee.emit("requestReceived", ctx, req);

    let response: Response;
    let idx = 1;
    const middleware = [...serverMiddleware, twirp];
    try {
      response = await middleware[0](req, ctx, function next() {
        const nxt = middleware[idx];
        idx++;
        return nxt(req, ctx, next);
      });
    } catch (error) {
      response = handleUserSpaceError(error, ctx, ee);
    }
    ee.emit("responseSent", ctx, response);
    return response;
  }

  app.use = (
    handler: Middleware<TwirpContext<ContextExt, Services>, Request>,
  ) => {
    serverMiddleware.push(handler);
    return app;
  };

  app.on = (
    ...args: Parameters<
      Emitter<ServerHooks<TwirpContext<ContextExt, Services>, Request>>["on"]
    >
  ) => {
    ee.on(...args);
    return app;
  };

  app.off = (
    ...args: Parameters<
      Emitter<ServerHooks<TwirpContext<ContextExt, Services>, Request>>["off"]
    >
  ) => {
    ee.off(...args);
    return app;
  };

  if (configWithDefaults.debug !== false) {
    withRequestLogging(app);
  }

  return app;
}

async function getBody(req: ServerRequest): Promise<Uint8Array> {
  const buffers: Uint8Array[] = [];
  for await (const chunk of req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    buffers.push(chunk);
  }
  const length = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const body = new Uint8Array(length);
  let offset = 0;
  buffers.forEach((buffer) => {
    body.set(buffer, offset);
    offset += buffer.length;
  });
  return body;
}

export function createTwirpServer<
  ContextExt,
  Services extends readonly Service[],
  Request extends ServerRequest = ServerRequest,
>(
  services: Services,
  config: TwirpServerConfig = {},
): TwirpServer<TwirpContext<ContextExt, typeof services>, Request> {
  const _app = createTwirpServerless(services, config);

  async function app(req: Request, res: ServerResponse): Promise<void> {
    const body = await getBody(req);
    const request = req as unknown as InboundRequest;
    request.body = body;
    const response = await _app(request);
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
  }

  app.use = (
    handler: Middleware<
      TwirpContext<ContextExt, typeof services>,
      ServerRequestWithBody<Request>
    >,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any , @typescript-eslint/no-unsafe-argument
    _app.use(handler as any);
    return app;
  };

  app.on = (
    ...args: Parameters<
      Emitter<
        ServerHooks<
          TwirpContext<ContextExt, typeof services>,
          ServerRequestWithBody<Request>
        >
      >["on"]
    >
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _app.on(...(args as [any, any]));
    return app;
  };

  app.off = (
    ...args: Parameters<
      Emitter<
        ServerHooks<
          TwirpContext<ContextExt, typeof services>,
          ServerRequestWithBody<Request>
        >
      >["off"]
    >
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _app.off(...(args as [any, any]));
    return app;
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return app;
}
