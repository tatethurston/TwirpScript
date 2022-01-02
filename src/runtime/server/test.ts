import {
  RawRequest,
  Request,
  ServerHooks,
  ServiceMethod,
  TwirpContext,
  TwirpErrorResponse,
  executeServiceMethod,
  twirpHandler,
} from ".";
import { describe, it } from "@jest/globals";
import { TwirpError } from "..";
import { Emitter } from "../eventEmitter";

describe("TwirpErrorResponse", () => {
  it("converts a Twirp error to a Response", () => {
    expect(
      TwirpErrorResponse(
        new TwirpError({ code: "internal", msg: "Internal Error" })
      )
    ).toEqual({
      body: '{"code":"internal","msg":"Internal Error"}',
      headers: { "content-type": "application/json" },
      statusCode: 500,
    });
  });
});

describe("executeServiceMethod", () => {
  const handler = jest.fn();
  const encode = jest.fn();
  const decode = jest.fn();
  const methodHandler = {
    handler,
    input: { decode },
    output: { encode },
  } as unknown as ServiceMethod;

  describe("json", () => {
    it("handles json requests", async () => {
      const body = { foo: "bar" };
      const response = { bar: "baz" };
      handler.mockImplementationOnce(() => response);

      const res = await executeServiceMethod(
        methodHandler,
        { body: JSON.stringify(body) } as Request,
        {
          contentType: "JSON",
        } as TwirpContext
      );

      expect(handler).toBeCalledWith(body, expect.any(Object));
      expect(res).toEqual(JSON.stringify(response));
    });

    it("TwirpError  when deserialization fails", async () => {
      const res = await executeServiceMethod(
        methodHandler,
        { body: "not json" } as Request,
        {
          contentType: "JSON",
        } as TwirpContext
      );

      expect(res).toEqual(
        new TwirpError({
          code: "invalid_argument",
          msg: `failed to deserialize argument as JSON`,
        })
      );
    });
  });

  describe("protobuf", () => {
    it("handles protobuf requests", async () => {
      const body = { foo: "bar" };
      const response = { bar: "baz" };
      const encoded = new Uint8Array([1, 2]);
      handler.mockImplementationOnce(() => response);
      decode.mockImplementationOnce(() => body);
      encode.mockImplementationOnce(() => encoded);

      const res = await executeServiceMethod(
        methodHandler,
        { body: "" } as Request,
        {
          contentType: "Protobuf",
        } as TwirpContext
      );

      expect(decode).toBeCalledWith("");
      expect(handler).toBeCalledWith(body, expect.any(Object));
      expect(encode).toBeCalledWith(response);
      expect(res).toEqual(Buffer.from(encoded));
    });

    it("TwirpError when deserialization fails", async () => {
      const res = await executeServiceMethod(
        methodHandler,
        { body: "not protobuf" } as Request,
        {
          contentType: "Protobuf",
        } as TwirpContext
      );

      expect(res).toEqual(
        new TwirpError({
          code: "invalid_argument",
          msg: `failed to deserialize argument as Protobuf`,
        })
      );
    });
  });

  describe("error", () => {
    it("TwirpError when invalid contentType", async () => {
      const res = await executeServiceMethod(
        methodHandler,
        { body: "" } as Request,
        {
          contentType: "Unknown",
        } as TwirpContext
      );

      expect(res).toEqual(
        new TwirpError({
          code: "malformed",
          msg: `Unexpected or missing content-type`,
        })
      );
    });

    it("TwirpError when unknown exception thrown", async () => {
      handler.mockImplementationOnce(() => {
        throw new Error("Oh noes");
      });

      const res = await executeServiceMethod(
        methodHandler,
        { body: JSON.stringify({}) } as Request,
        {
          contentType: "JSON",
        } as TwirpContext
      );

      expect(res).toEqual(
        new TwirpError({
          code: "internal",
          msg: `server error`,
        })
      );
    });

    it("preserves TwirpError when handler throws TwirpError", async () => {
      const error = new TwirpError({
        code: "not_found",
        msg: `Hat not found`,
      });
      handler.mockImplementationOnce(() => {
        throw error;
      });

      const res = await executeServiceMethod(
        methodHandler,
        { body: JSON.stringify({}) } as Request,
        {
          contentType: "JSON",
        } as TwirpContext
      );

      expect(res).toEqual(error);
    });
  });
});

describe("twirpHandler", () => {
  const ee = { emit: jest.fn() };
  const services = {
    HaberdasherMakeHat: {
      handler: jest.fn(),
      request: { decode: jest.fn() },
      response: { encode: jest.fn() },
    },
  };
  const handler = twirpHandler(
    services as any,
    ee as unknown as Emitter<ServerHooks<any, any>>
  );
  const request = {
    url: "http://localhost:8080",
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  } as unknown as RawRequest;

  describe("request validation", () => {
    it("missing url", async () => {
      const { url, ...rest } = request;
      const res = await handler(rest as any, {});
      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `no request url provided`,
          })
        )
      );
    });

    it("missing method", async () => {
      const { method, ...rest } = request;
      const res = await handler(rest as any, {});
      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `no request method provided`,
          })
        )
      );
    });

    it("method other than POST", async () => {
      const res = await handler({ ...request, method: "GET" } as any, {});
      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `unexpected request method GET`,
          })
        )
      );
    });

    it("missing content-type", async () => {
      const req = {
        ...request,
        headers: {},
      };
      const res = await handler(req as any, {});

      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `no request content-type provided`,
          })
        )
      );
    });

    it("invalid content-type", async () => {
      const req = {
        ...request,
        headers: { "content-type": "text/html" },
      };
      const res = await handler(req as any, {});

      expect(res).toEqual(
        TwirpErrorResponse(
          new TwirpError({
            code: "malformed",
            msg: `unexpected request content-type text/html`,
          })
        )
      );
    });

    it("emits error", async () => {
      const { url, ...rest } = request;
      await handler(rest as any, {});

      expect(ee.emit).toBeCalledTimes(1);
      expect(ee.emit).toBeCalledWith(
        "error",
        expect.any(Object),
        new TwirpError({
          code: "malformed",
          msg: `no request url provided`,
        })
      );
    });
  });

  it("missing handler", async () => {
    const res = await handler(request, {
      service: "Haberdasher",
      method: "MakeScarf",
    });

    expect(res).toEqual(
      TwirpErrorResponse(
        new TwirpError({
          code: "bad_route",
          msg: `no handler for path POST ${request.url}.`,
        })
      )
    );

    expect(ee.emit).toBeCalledTimes(1);
    expect(ee.emit).toBeCalledWith(
      "error",
      expect.any(Object),
      new TwirpError({
        code: "bad_route",
        msg: `no handler for path POST ${request.url}.`,
      })
    );
  });

  it("returns TwirpError from handler", async () => {
    const body = JSON.stringify({ foo: "bar" });
    const req = { ...request, body };
    const response = new TwirpError({
      code: "internal",
      msg: "my handler errored",
    });
    services["HaberdasherMakeHat"].handler.mockImplementationOnce(() => {
      throw response;
    });

    const res = await handler(req, {
      service: "Haberdasher",
      method: "MakeHat",
      contentType: "JSON",
    });

    expect(res).toEqual(TwirpErrorResponse(response));

    expect(ee.emit).toBeCalledTimes(2);
    expect(ee.emit).toBeCalledWith("requestRouted", expect.any(Object), req);
    expect(ee.emit).toBeCalledWith("error", expect.any(Object), response);
  });

  it("processes the request (happy path)", async () => {
    const body = JSON.stringify({ foo: "bar" });
    const req = { ...request, body };
    services["HaberdasherMakeHat"].handler.mockImplementationOnce((x) => x);

    const res = await handler(req, {
      service: "Haberdasher",
      method: "MakeHat",
      contentType: "JSON",
    });
    const expectedResponse = {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body,
    };

    expect(res).toEqual(expectedResponse);

    expect(ee.emit).toBeCalledTimes(2);
    expect(ee.emit).toBeCalledWith("requestRouted", expect.any(Object), req);
    expect(ee.emit).toBeCalledWith(
      "responsePrepared",
      expect.any(Object),
      expectedResponse
    );
  });
});
