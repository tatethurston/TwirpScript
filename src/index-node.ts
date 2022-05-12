import { nodeHttpTransport } from "./node";
import { client } from "./index";

if (typeof fetch === "undefined") {
  client.rpcTransport = nodeHttpTransport;
}

export * from "./index";
