/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import {
  client,
  JSONrequest,
  PBrequest,
  RpcTransportResponse,
} from "./index.js";
import { mockRpcTransportResponse } from "./test.mocks.js";

const mockRpcTransport = jest.fn(() =>
  Promise.resolve(mockRpcTransportResponse),
);
client.rpcTransport = mockRpcTransport;

function mockRpcResponse(mock: Partial<RpcTransportResponse>): void {
  mockRpcTransport.mockImplementationOnce(() =>
    Promise.resolve({
      ...mockRpcTransportResponse,
      ...mock,
    }),
  );
}

describe("JSONrequest", () => {
  it("stringifies the request body", async () => {
    await JSONrequest("/foo", JSON.stringify({ foo: "bar" }));

    expect(mockRpcTransport).toHaveBeenCalledWith(
      "/twirp/foo",
      expect.objectContaining({
        body: '{"foo":"bar"}',
      }),
    );
  });

  it("returns the response json", async () => {
    const response = JSON.stringify({ foo: "bar" });
    mockRpcResponse({
      ok: true,
      text: () => Promise.resolve(response),
    });

    const res = await JSONrequest("/foo");

    expect(res).toEqual(response);
  });

  it("sets the request headers", async () => {
    await JSONrequest("/foo");

    expect(mockRpcTransport).toHaveBeenCalledWith(
      "/twirp/foo",
      expect.objectContaining({
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
      }),
    );
  });
});

describe("PBrequest", () => {
  it("returns the response Uint8Array", async () => {
    const response = new Uint8Array([1, 2]);
    mockRpcResponse({
      ok: true,
      arrayBuffer: () => Promise.resolve(Buffer.from(response)),
    });

    const res = await PBrequest("/foo");

    expect(res).toEqual(response);
  });

  it("sets the request headers", async () => {
    await PBrequest("/foo");

    expect(mockRpcTransport).toHaveBeenCalledWith(
      "/twirp/foo",
      expect.objectContaining({
        headers: {
          accept: "application/protobuf",
          "content-type": "application/protobuf",
        },
      }),
    );
  });
});

describe("PBrequest and JSONrequest", () => {
  it("throw a Twirp Error when status is not ok", async () => {
    const twirpError = { code: "malformed", msg: "malformed" };
    mockRpcResponse({
      ok: false,
      text: () => Promise.resolve(JSON.stringify(twirpError)),
    });

    let error;
    try {
      await PBrequest("/foo");
    } catch (e) {
      error = e;
    }

    expect(error).toEqual(twirpError);
  });
});

describe("client (global)", () => {
  describe("#use", () => {
    it("schedules middleware in order of registration", async () => {
      const m1 = jest.fn((config, next) => {
        return next({
          ...config,
          headers: {
            ...config.headers,
            m1: "true",
          },
        });
      });
      const m2 = jest.fn((config, next) => {
        return next({
          ...config,
          headers: {
            ...config.headers,
            m2: "true",
          },
        });
      });
      const m3 = jest.fn((config, next) => {
        return next({
          ...config,
          headers: {
            ...config.headers,
            m3: "true",
          },
        });
      });

      client.use(m1).use(m2).use(m3);
      await PBrequest("/foo");

      expect(m1).toHaveBeenCalledTimes(1);
      expect(m1).toHaveBeenCalledWith(
        expect.objectContaining({ headers: {} }),
        expect.any(Function),
      );

      expect(m2).toHaveBeenCalledTimes(1);
      expect(m2).toHaveBeenCalledWith(
        expect.objectContaining({ headers: { m1: "true" } }),
        expect.any(Function),
      );

      expect(m3).toHaveBeenCalledTimes(1);
      expect(m3).toHaveBeenCalledWith(
        expect.objectContaining({ headers: { m1: "true", m2: "true" } }),
        expect.any(Function),
      );

      expect(mockRpcTransport).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            m1: "true",
            m2: "true",
            m3: "true",
          }),
        }),
      );
    });
  });

  describe("#on", () => {
    it("requestPrepared", async () => {
      const onEvent = jest.fn();

      client.on("requestPrepared", onEvent);
      await PBrequest("/foo");

      expect(onEvent).toHaveBeenCalledTimes(1);

      client.off("requestPrepared", onEvent);
    });

    it("responseReceived", async () => {
      const onEvent = jest.fn();

      client.on("responseReceived", onEvent);
      await PBrequest("/foo");

      expect(onEvent).toHaveBeenCalledTimes(1);

      client.off("responseReceived", onEvent);
    });

    it("error", async () => {
      const onEvent = jest.fn();
      mockRpcTransport.mockImplementationOnce(() => {
        throw new Error("Oh Noes");
      });

      client.on("error", onEvent);
      try {
        await PBrequest("/foo");
        // eslint-disable-next-line no-empty
      } catch {}

      expect(onEvent).toHaveBeenCalledTimes(1);

      client.off("error", onEvent);
    });
  });

  describe("#off", () => {
    it("removes", async () => {
      const onEvent = jest.fn();

      client.on("requestPrepared", onEvent);
      client.off("requestPrepared", onEvent);
      await PBrequest("/foo");

      expect(onEvent).toHaveBeenCalledTimes(0);
    });
  });

  describe(".rpcTransport", () => {
    it("can provide a custom transport", async () => {
      const transport = jest.fn(() =>
        Promise.resolve(mockRpcTransportResponse),
      );
      (client.rpcTransport as jest.Mock).mockImplementationOnce(transport);

      await PBrequest("/foo");

      expect(transport).toHaveBeenCalledTimes(1);
    });
  });
});

describe("config", () => {
  describe("local", () => {
    it("additional headers", async () => {
      await PBrequest("/foo", undefined, { headers: { foo: "bar" } });

      expect(mockRpcTransport).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ foo: "bar" }),
        }),
      );
    });

    it("can configure the RPC baseURL", async () => {
      await PBrequest("/foo", undefined, {
        baseURL: "https://api.example.com",
      });

      expect(mockRpcTransport).toHaveBeenCalledWith(
        "https://api.example.com/twirp/foo",
        expect.any(Object),
      );
    });

    describe("can configure the RPC prefix", () => {
      it("remove the prefix", async () => {
        await PBrequest("/foo", undefined, { prefix: "" });

        expect(mockRpcTransport).toHaveBeenCalledWith(
          "/foo",
          expect.any(Object),
        );
      });

      it("set a custom prefix", async () => {
        await PBrequest("/foo", undefined, { prefix: "/twirpscript" });

        expect(mockRpcTransport).toHaveBeenCalledWith(
          "/twirpscript/foo",
          expect.any(Object),
        );
      });
    });

    it("can provide a custom transport", async () => {
      const transport = jest.fn(() =>
        Promise.resolve(mockRpcTransportResponse),
      );

      await PBrequest("/foo", undefined, { rpcTransport: transport });

      expect(transport).toHaveBeenCalledTimes(1);
      expect(mockRpcTransport).toHaveBeenCalledTimes(0);
    });
  });

  describe("global", () => {
    it("additional headers", async () => {
      client.headers = {
        foo: "bar",
      };

      await PBrequest("/foo");

      expect(mockRpcTransport).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ foo: "bar" }),
        }),
      );

      client.headers = undefined;
    });

    it("can configure the RPC baseURL", async () => {
      client.baseURL = "https://api.example.com";

      await PBrequest("/foo");

      expect(mockRpcTransport).toHaveBeenCalledWith(
        "https://api.example.com/twirp/foo",
        expect.any(Object),
      );

      client.baseURL = undefined;
    });

    describe("can configure the RPC prefix", () => {
      it("remove the prefix", async () => {
        client.prefix = undefined;

        await PBrequest("/foo");

        expect(mockRpcTransport).toHaveBeenCalledWith(
          "/foo",
          expect.any(Object),
        );

        client.prefix = undefined;
      });

      it("set a custom prefix", async () => {
        client.prefix = "/twirpscript";

        await PBrequest("/foo");

        expect(mockRpcTransport).toHaveBeenCalledWith(
          "/twirpscript/foo",
          expect.any(Object),
        );

        client.prefix = undefined;
      });
    });
  });

  describe("overrides", () => {
    it("local overrides global", async () => {
      client.headers = {
        foo: "bar",
      };

      await PBrequest("/foo", undefined, { headers: { foo: "baz" } });

      expect(mockRpcTransport).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ foo: "baz" }),
        }),
      );

      client.headers = undefined;
    });

    it("middleware overrides local", async () => {
      client.headers = {
        foo: "bar",
      };

      client.use((config, next) => {
        config.headers.foo = "foo";
        return next(config);
      });

      await PBrequest("/foo", undefined, { headers: { foo: "baz" } });

      expect(mockRpcTransport).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ foo: "foo" }),
        }),
      );

      client.headers = undefined;
    });
  });
});
