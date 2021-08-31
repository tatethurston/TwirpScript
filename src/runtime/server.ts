import { IncomingMessage, ServerResponse } from "http";
import { TwirpError } from ".";
import { isTwirpError, statusCodeForErrorCode } from "./error";

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

type Handler = (req: Request, ctx: unknown) => Promise<Response> | Response;

export interface ServiceHandler {
  path: string;
  methods: Record<string, Handler>;
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

function parseJSON<T>(json: string): T | undefined {
  try {
    return JSON.parse(json);
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

export function createMethodHandler<T>({
  handler,
  encode,
  decode,
}: ServiceMethod): Handler {
  return async (req, context) => {
    try {
      switch (req.headers["Content-Type"]) {
        case "application/json": {
          const body = parseJSON<T>(req.body.toString());
          if (!body) {
            return TwirpErrorResponse({
              code: "invalid_argument",
              msg: `failed to deserialize argument as JSON`,
            });
          }
          const response = await handler(body, context);
          return {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          };
        }
        case "application/protobuf": {
          const body = parseProto<T>(req.body, decode);
          if (!body) {
            return TwirpErrorResponse({
              code: "invalid_argument",
              msg: `failed to deserialize argument as Protobuf`,
            });
          }
          const response = await handler(body, context);
          return {
            status: 200,
            headers: {
              "Content-Type": "application/protobuf",
            },
            body: Buffer.from(encode(response)),
          };
        }
        default: {
          const _exhaust: never = req.headers["Content-Type"];
          return _exhaust;
        }
      }
    } catch (error) {
      if (isTwirpError(error)) {
        return TwirpErrorResponse(error);
      } else {
        return TwirpErrorResponse({
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

type ParsedRequest =
  | { ok: true; result: Omit<Request, "body"> }
  | { ok: false; result: string };

function parseRequest(req: IncomingMessage): ParsedRequest {
  if (!req.url) {
    return { ok: false, result: `no request url provided` };
  }

  if (!req.method) {
    return { ok: false, result: `no request method provided` };
  }

  const method = req.method.toUpperCase();
  if (method !== "POST") {
    return { ok: false, result: `unexpected request method ${method}` };
  }

  const contentType = req.headers["content-type"];

  if (!contentType) {
    return { ok: false, result: `no request content-type provided` };
  }

  if (
    contentType !== "application/json" &&
    contentType !== "application/protobuf"
  ) {
    return {
      ok: false,
      result: `unexpected request content-type ${contentType}`,
    };
  }

  return {
    ok: true,
    result: {
      url: req.url,
      headers: {
        "Content-Type": contentType,
      },
    },
  };
}

type Next = () => Promise<Response>;

type Middleware<Context> = (
  req: IncomingMessage,
  ctx: Partial<Context>,
  next: Next
) => Promise<Response>;

function twirpHandler<Context>(services: ServiceHandler[]) {
  return async (req: IncomingMessage, ctx: Context): Promise<Response> => {
    const parsed = parseRequest(req);
    if (!parsed.ok) {
      return TwirpErrorResponse({ code: "malformed", msg: parsed.result });
    }

    const body = await getBody(req);
    const request: Request = {
      ...parsed.result,
      body,
    };

    const methodIdx = request.url.lastIndexOf("/");
    const prefix = "/twirp/";
    const servicePath = request.url.slice(prefix.length, methodIdx);
    const serviceMethod = request.url.slice(methodIdx + 1);

    const service = services.find(
      (service) =>
        servicePath === service.path && service.methods[serviceMethod]
    );

    if (!service) {
      return TwirpErrorResponse({
        code: "bad_route",
        msg: `no handler for path POST ${req.url}.`,
      });
    }

    const response = await service.methods[serviceMethod](request, ctx);
    return response;
  };
}

interface TwirpServer<Context> {
  (req: IncomingMessage, res: ServerResponse): void;
  use: (middleware: Middleware<Context>) => void;
}

export function createTwirpServer<Context = unknown>(
  services: ServiceHandler[]
): TwirpServer<Context> {
  const twirp = twirpHandler(services);
  const middleware: Middleware<Context>[] = [];

  async function app(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const ctx = {};

    let response: Response;
    try {
      let idx = 1;
      response = await middleware[0](req, ctx, function next() {
        const nxt = middleware[idx] ?? twirp;
        idx++;
        return nxt(req, ctx, next);
      });
    } catch (error) {
      response = TwirpErrorResponse({
        code: "internal",
        msg: "server error",
      });
    }

    res.writeHead(response.status, response.headers);
    res.end(response.body);
  }

  app.use = (handler: Middleware<Context>) => {
    middleware.push(handler);
  };

  return app;
}
