import { RpcTransportResponse } from "./index.js";

export const mockRpcTransportResponse: RpcTransportResponse = {
  arrayBuffer: () => Promise.resolve(Buffer.from([])),
  json: () => Promise.resolve({}),
  ok: true,
  status: 500,
  text: () => Promise.resolve(""),
  headers: { get: () => null },
};
