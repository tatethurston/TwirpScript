/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
import {
  InboundRequest,
  Request,
  ServerRequest,
  ServerResponse,
  Service,
  ServiceMethod,
  TwirpContext,
  TwirpErrorResponse,
  createTwirpServer,
  executeServiceMethod,
  twirpHandler,
} from "./index.js";
import { TwirpError } from "../index.js";

describe("TwirpErrorResponse", () => {
  it("converts a Twirp error to a Response", () => {
    expect(
      TwirpErrorResponse(
        new TwirpError({ code: "internal", msg: "Internal Error" }),
      ),
    ).toEqual({
      body: '{"code":"internal","msg":"Internal Error"}',
      headers: { "content-type": "application/json" },
      statusCode: 500,
    });
  });
});

describe("executeServiceMethod", () => {
  const ee = { emit: jest.fn() } as any;
  const handler = jest.fn();
  const encode = jest.fn();
  const decode = jest.fn();
  const encodeJSON = jest.fn(JSON.stringify);
  const decodeJSON = jest.fn(JSON.parse);
  const methodHandler: ServiceMethod = {
    name: "foo",
    handler,
    input: {
      protobuf: { decode, encode },
      json: { encode: encodeJSON, decode: decodeJSON },
    },
    output: {
      protobuf: { decode, encode },
      json: { decode: decodeJSON, encode: encodeJSON },
    },
  };

  describe("json", () => {
    const context = { contentType: "JSON" } as TwirpContext;

    it("handles json requests", async () => {
      const body = { foo: "bar" };
      const response = { bar: "baz" };
      handler.mockImplementationOnce(() => response);

      const res = await executeServiceMethod(
        methodHandler,
        {
          body: new TextEncoder().encode(JSON.stringify(body)),
        } as Request,
        context,
        ee,
      );

      expect(handler).toBeCalledWith(body, context);
      expect(res).toEqual(JSON.stringify(response));
    });

    it("TwirpError when deserialization fails", async () => {
      let error;
      try {
        await executeServiceMethod(
          methodHandler,
          { body: new TextEncoder().encode("not json") } as Request,
          {
            contentType: "JSON",
          } as TwirpContext,
          ee,
        );
      } catch (e) {
        error = e;
      }

      expect(error).toEqual(
        new TwirpError({
          code: "invalid_argument",
          msg: `failed to deserialize argument as JSON`,
        }),
      );
    });
  });

  describe("protobuf", () => {
    const context = { contentType: "Protobuf" } as TwirpContext;

    it("handles protobuf requests", async () => {
      const body = { foo: "bar" };
      const response = { bar: "baz" };
      const encoded = new Uint8Array([1, 2]);
      handler.mockImplementationOnce(() => response);
      decode.mockImplementationOnce(() => body);
      encode.mockImplementationOnce(() => encoded);

      const res = await executeServiceMethod(
        methodHandler,
        { body: new TextEncoder().encode("") } as Request,
        context,
        ee,
      );

      expect(decode).toBeCalledTimes(1);
      expect(handler).toBeCalledWith(body, context);
      expect(encode).toBeCalledWith(response);
      expect(res).toEqual(Uint8Array.from(encoded));
    });

    it("TwirpError when deserialization fails", async () => {
      decode.mockImplementationOnce(() => {
        throw new Error();
      });
      let error;
      try {
        await executeServiceMethod(
          methodHandler,
          { body: new TextEncoder().encode("not protobuf") } as Request,
          context,
          ee,
        );
      } catch (e) {
        error = e;
      }

      expect(error).toEqual(
        new TwirpError({
          code: "invalid_argument",
          msg: `failed to deserialize argument as Protobuf`,
        }),
      );
    });
  });
});

describe("twirpHandler", () => {
  const ee = { emit: jest.fn() } as any;
  const handler = twirpHandler(ee);
  const request: InboundRequest = {
    url: "http://localhost:8080",
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: new TextEncoder().encode(""),
  };

  describe("request validation", () => {
    const context = {} as TwirpContext;
    it("missing url", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { url, ...rest } = request;
      const res = await handler(rest as any, context);
      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `no request url provided`,
          }),
        ),
      );
    });

    it("missing method", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { method, ...rest } = request;
      const res = await handler(rest as any, context);
      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `no request method provided`,
          }),
        ),
      );
    });

    it("method other than POST", async () => {
      const res = await handler({ ...request, method: "GET" } as any, context);
      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `unexpected request method GET`,
          }),
        ),
      );
    });

    it("missing content-type", async () => {
      const res = await handler(
        {
          ...request,
          headers: {},
        } as any,
        context,
      );
      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `no request content-type provided`,
          }),
        ),
      );
    });

    it("invalid content-type", async () => {
      const res = await handler(
        {
          ...request,
          headers: { "content-type": "text/html" },
        } as any,
        context,
      );
      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `unexpected request content-type text/html`,
          }),
        ),
      );
    });

    it("emits error", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { url, ...rest } = request;
      await handler(rest as any, {} as TwirpContext);

      expect(ee.emit).toBeCalledTimes(1);
      expect(ee.emit).toBeCalledWith(
        "error",
        context,
        new TwirpError({
          code: "malformed",
          msg: `no request url provided`,
        }),
      );
    });
  });

  describe("missing handler", () => {
    it("throws", async () => {
      const context: TwirpContext = {
        service: undefined,
        method: undefined,
        contentType: "JSON",
      };
      const res = await handler(request, context);

      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "bad_route",
            msg: `no handler for path POST ${request.url}.`,
          }),
        ),
      );

      expect(ee.emit).toBeCalledTimes(1);
      expect(ee.emit).toBeCalledWith(
        "error",
        context,
        new TwirpError({
          code: "bad_route",
          msg: `no handler for path POST ${request.url}.`,
        }),
      );
    });
  });

  describe("handler", () => {
    const service = {
      name: "Haberdasher",
      methods: {
        MakeHat: {
          name: "MakeHat",
          handler: jest.fn(),
          input: {
            protobuf: {
              decode: jest.fn(),
              encode: jest.fn(),
            },
            json: {
              decode: jest.fn(JSON.parse),
              encode: jest.fn(JSON.stringify),
            },
          },
          output: {
            protobuf: {
              decode: jest.fn(),
              encode: jest.fn(),
            },
            json: {
              decode: jest.fn(JSON.parse),
              encode: jest.fn(JSON.stringify),
            },
          },
        },
      },
    };

    describe("service errors", () => {
      it("TwirpError", async () => {
        const body = { foo: "bar" };
        const req = {
          ...request,
          body: new TextEncoder().encode(JSON.stringify(body)),
        };
        const error = new TwirpError({
          code: "internal",
          msg: "my handler errored",
        });
        service.methods["MakeHat"].handler.mockImplementationOnce(() => {
          throw error;
        });
        const context: TwirpContext = {
          service,
          method: service.methods.MakeHat,
          contentType: "JSON",
        };

        const res = await handler(req, context);

        expect(res).toEqual(TwirpErrorResponse(error));
        expect(ee.emit).toBeCalledTimes(2);
        expect(ee.emit).toBeCalledWith("requestRouted", context, body);
        expect(ee.emit).toBeCalledWith("error", context, error);
      });

      it("Unexpected Error", async () => {
        const body = { foo: "bar" };
        const req = {
          ...request,
          body: new TextEncoder().encode(JSON.stringify(body)),
        };
        const error = new Error("oh no");
        service.methods["MakeHat"].handler.mockImplementationOnce(() => {
          throw error;
        });
        const context: TwirpContext = {
          service,
          method: service.methods.MakeHat,
          contentType: "JSON",
        };

        const res = await handler(req, context);

        expect(res).toEqual(
          TwirpErrorResponse(
            new TwirpError({
              code: "internal",
              msg: "server error",
            }),
          ),
        );
        expect(ee.emit).toBeCalledTimes(2);
        expect(ee.emit).toBeCalledWith("requestRouted", context, body);
        expect(ee.emit).toBeCalledWith(
          "error",
          context,
          new TwirpError({
            code: "internal",
            msg: "server error",
            meta: { error: error as any },
          }),
        );
      });
    });

    it("processes the request (happy path)", async () => {
      const body = { foo: "bar" };
      const req = {
        ...request,
        body: new TextEncoder().encode(JSON.stringify(body)),
      };
      const resBody = { bar: "baz" };
      service.methods["MakeHat"].handler.mockImplementationOnce(() => resBody);
      const context: TwirpContext = {
        service,
        method: service.methods.MakeHat,
        contentType: "JSON",
      };
      const res = await handler(req, context);
      const expectedResponse = {
        statusCode: 200,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(resBody),
      };

      expect(res).toEqual(expectedResponse);

      expect(ee.emit).toBeCalledTimes(2);
      expect(ee.emit).toBeCalledWith("requestRouted", context, body);
      expect(ee.emit).toBeCalledWith("responsePrepared", context, resBody);
    });
  });
});

describe("createTwirpServer", () => {
  const mockService: Service = {
    name: "MockService",
    methods: {
      MockMethod: {
        name: "MockMethod",
        handler: jest.fn(),
        input: {
          protobuf: { decode: jest.fn(), encode: jest.fn() },
          json: { decode: jest.fn(), encode: jest.fn() },
        },
        output: {
          protobuf: { decode: jest.fn(), encode: jest.fn() },
          json: { decode: jest.fn(), encode: jest.fn() },
        },
      },
    },
  };

  it("accepts case insensitive headers", async () => {
    const app = createTwirpServer([mockService]);
    const req: ServerRequest = {
      headers: { "Content-Type": "application/json" },
      url: "/twirp/MockService/MockMethod",
      method: "POST",
      async *[Symbol.asyncIterator]() {
        await Promise.resolve();
        yield new Uint8Array();
      },
    };
    const res: ServerResponse = { writeHead: jest.fn(), end: jest.fn() };

    await (app(req, res) as any as Promise<void>);

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "content-type": "application/json",
    });
  });
});
