import { nodeHttpTransport } from "./node/index.js";
import { client } from "./index.js";

if (typeof fetch === "undefined") {
  client.rpcTransport = nodeHttpTransport;
}

export * from "./index.js";
