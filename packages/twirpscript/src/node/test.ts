import { nodeHttpTransport } from "./index.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { RpcTransportOpts } from "../runtime/client/index.js";

const server = jest.fn((_req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, {});
  res.end("");
});
const mockServer = createServer((req, res) => {
  server(req, res);
});

describe("nodeHttpTransport", () => {
  beforeAll(() => {
    mockServer.listen(8080);
  });

  afterAll(() => {
    mockServer.close();
  });

  function setup(opts: Partial<RpcTransportOpts> = {}) {
    return nodeHttpTransport("http://localhost:8080", {
      method: "POST",
      headers: {},
      body: "",
      ...opts,
    });
  }

  it("makes requests", async () => {
    const res = await setup();
    expect(res.status).toEqual(200);
  });

  // Prevents:
  // TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be of type string or an instance of Buffer. Received an instance of Uint8Array
  it("converts Uint8Array to Buffer", async () => {
    const res = await setup({ body: new Uint8Array([34, 45]) });
    expect(res.status).toEqual(200);
  });

  describe("implements subset of fetch", () => {
    it("#arrayBuffer", async () => {
      const buffer = Buffer.from(new Uint8Array([1, 2]));
      server.mockImplementationOnce((_req, res) => {
        res.writeHead(200, {});
        res.end(buffer);
      });

      const res = await setup();

      expect(await res.arrayBuffer()).toEqual(buffer);
    });

    it("#json", async () => {
      const json = { foo: "bar" };
      server.mockImplementationOnce((_req, res) => {
        res.writeHead(200, {});
        res.end(JSON.stringify(json));
      });

      const res = await setup();

      expect(await res.json()).toEqual(json);
    });

    it("#text", async () => {
      const text = "hello world";
      server.mockImplementationOnce((_req, res) => {
        res.writeHead(200, {});
        res.end(text);
      });

      const res = await setup();

      expect(await res.text()).toEqual(text);
    });

    it("#status", async () => {
      const status = 503;
      server.mockImplementationOnce((_req, res) => {
        res.writeHead(status, {});
        res.end();
      });

      const res = await setup();

      expect(res.status).toEqual(status);
    });

    describe("#ok", () => {
      it("false when status code is not 2XX", async () => {
        server.mockImplementationOnce((_req, res) => {
          res.writeHead(300, {});
          res.end();
        });

        const res = await setup();

        expect(res.ok).toEqual(false);
      });

      it("true when status code 2XX", async () => {
        server.mockImplementationOnce((_req, res) => {
          res.writeHead(200, {});
          res.end();
        });

        const res = await setup();

        expect(res.ok).toEqual(true);
      });
    });

    describe("#headers", () => {
      it("returns header when present", async () => {
        server.mockImplementationOnce((_req, res) => {
          res.writeHead(200, { "content-type": "application/protobuf" });
          res.end();
        });

        const res = await setup();

        expect(res.headers.get("content-type")).toEqual("application/protobuf");
      });

      it("returns null when missing", async () => {
        server.mockImplementationOnce((_req, res) => {
          res.writeHead(200, { "content-type": "application/protobuf" });
          res.end();
        });

        const res = await setup();

        expect(res.headers.get("x-forwarded-by")).toEqual(null);
      });
    });
  });
});
