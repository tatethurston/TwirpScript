import { IncomingMessage, ServerResponse } from "http";
import { isTwirpError, statusCodeForErrorCode, TwirpError } from "./error";

interface Response {
  body: string;
  contentType: "application/json" | "application/protobuf";
  status: number;
}

interface Request {
  body: string;
  contentType: "application/json" | "application/protobuf";
  url: string;
}

interface ServiceMethod {
  handler: (req: any) => any;
  encode: any;
  decode: any;
}

type Handler = (req: Request) => Response;

interface ServiceHandler {
  path: string;
  methods: Record<string, Handler>;
}

function parseJSON<T>(json: string): T | undefined {
  try {
    return JSON.parse(json);
  } catch (e) {
    return undefined;
  }
}

function parseProto<T>(
  proto: string,
  decode: (proto: string) => T
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
  return (req: Request) => {
    try {
      switch (req.contentType) {
        case "application/json": {
          const body = parseJSON<T>(req.body);
          if (!body) {
            return {
              status: 400,
              contentType: "application/json",
              body: JSON.stringify({
                code: "invalid_argument",
                msg: `failed to deserialize argument as JSON`,
              }),
            };
          }
          return {
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(handler(body)),
          };
        }
        case "application/protobuf": {
          const body = parseProto<T>(req.body, decode);
          if (!body) {
            return {
              status: 400,
              contentType: "application/json",
              body: JSON.stringify({
                code: "invalid_argument",
                msg: `failed to deserialize argument as Protobuf`,
              }),
            };
          }
          return {
            status: 200,
            contentType: "application/protobuf",
            body: encode(handler(body)),
          };
        }
        default: {
          const _exhaust: never = req.contentType;
          return _exhaust;
        }
      }
    } catch (e) {
      if (isTwirpError(e)) {
        return {
          status: statusCodeForErrorCode[(e as TwirpError).code],
          contentType: "application/json",
          body: JSON.stringify(e),
        };
      }

      return {
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          code: "internal",
          msg: `server error`,
        }),
      };
    }
  };
}

async function getBody(req: IncomingMessage): Promise<string> {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const body = Buffer.concat(buffers).toString();
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
      contentType,
    },
  };
}

export function createServerHandler(
  services: ServiceHandler[]
): (req: IncomingMessage, res: ServerResponse) => void {
  return async (req, res) => {
    const parsed = parseRequest(req);
    if (!parsed.ok) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          code: "malformed",
          msg: parsed.result,
        })
      );
      return;
    }

    const body = await getBody(req);
    const request: Request = {
      ...parsed.result,
      body,
    };

    const methodIdx = request.url.lastIndexOf("/");
    const prefixIdx = request.url.indexOf("/twirp/");
    const servicePath = request.url.slice(prefixIdx, methodIdx);
    const serviceMethod = request.url.slice(methodIdx);

    const service = services.find(
      (service) =>
        servicePath === service.path && service.methods[serviceMethod]
    );

    if (!service) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          code: "bad_route",
          msg: `no handler for path POST ${req.url}.`,
        })
      );
      return;
    }

    const response = service.methods[serviceMethod](request);
    res.writeHead(response.status, {
      "Content-Type": request.contentType,
    });
    res.end(response.body);
  };
}
