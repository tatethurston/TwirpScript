import { RpcTransport } from ".";
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
        const onResolve = () =>
          resolve({
            arrayBuffer: () => Promise.resolve(Buffer.concat(chunks)),
            json: () => Promise.resolve(JSON.parse(chunks.toString())),
            headers: {
              get: (name: string) => res.headers[name] as string | null,
            },
            ok:
              !!res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode ?? 500,
            text: () => Promise.resolve(chunks.toString()),
          });

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
