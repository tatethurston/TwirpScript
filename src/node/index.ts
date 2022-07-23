import { RpcTransport } from "../index.js";
import * as http from "http";
import * as https from "https";

export const nodeHttpTransport: RpcTransport = (url, options) => {
  const request = url.startsWith("https") ? https.request : http.request;
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const req = request(
      url,
      { method: options.method, headers: options.headers },
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
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", onResolve);
      }
    ).on("error", reject);

    req.end(
      options.body instanceof Uint8Array
        ? Buffer.from(options.body)
        : options.body
    );
  });
};
