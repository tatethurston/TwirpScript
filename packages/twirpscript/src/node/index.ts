import * as http from "http";
import * as https from "https";
import {
  RpcTransportOpts,
  RpcTransportResponse,
} from "../runtime/client/index.js";

type NodeHTTPTransport = (
  url: string,
  options: RpcTransportOpts & Omit<http.RequestOptions, "method">,
) => Promise<RpcTransportResponse>;

/**
 * Transport for Node.js environments.
 *
 * This overrides `fetch` as the default transport (client.rpcTransport) when TwirpScript
 * is imported into a Node.js environment.
 */
export const nodeHttpTransport: NodeHTTPTransport = (url, options) => {
  const request = url.startsWith("https") ? https.request : http.request;
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const req = request(
      url,
      { ...options, method: options.method, headers: options.headers },
      (res) => {
        const onResolve = () => {
          const statusCode = res.statusCode ?? 500;
          return resolve({
            arrayBuffer: () => Promise.resolve(Buffer.concat(chunks)),
            json: () => Promise.resolve(JSON.parse(chunks.toString())),
            headers: {
              get: (name: string) => {
                const val = res.headers[name] ?? null;
                return Array.isArray(val) ? val[0] : val;
              },
            },
            ok: statusCode >= 200 && statusCode < 300,
            status: statusCode,
            text: () => Promise.resolve(chunks.toString()),
          });
        };
        res.on("error", reject);
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", onResolve);
      },
    ).on("error", reject);

    req.end(
      options.body instanceof Uint8Array
        ? Buffer.from(options.body)
        : options.body,
    );
  });
};
