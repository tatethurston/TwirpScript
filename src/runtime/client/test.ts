import { describe, it } from "@jest/globals";
import { client, JSONrequest, PBrequest, RpcTransportResponse } from ".";
import { mockRpcTransportResponse } from "./mocks";

const mockRpcTransport = jest.fn(() =>
  Promise.resolve(mockRpcTransportResponse)
);
client.rpcTransport = mockRpcTransport;

function mockRpcResponse(mock: Partial<RpcTransportResponse>): void {
  mockRpcTransport.mockImplementationOnce(() =>
    Promise.resolve({
      ...mockRpcTransportResponse,
      ...mock,
    })
  );
}

describe("JSONrequest", () => {
  it("stringifies the request body", async () => {
    await JSONrequest("/foo", { foo: "bar" });

    expect(mockRpcTransport).toHaveBeenCalledWith(
      "/twirp/foo",
      expect.objectContaining({
        body: '{"foo":"bar"}',
      })
    );
  });

  it("returns the response json", async () => {
    const response = { foo: "bar" };
    mockRpcResponse({
      ok: true,
      json: () => Promise.resolve(response),
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
      })
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
      })
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
