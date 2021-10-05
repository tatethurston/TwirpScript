import { twirpErrorFromResponse } from "./error";

export type ClientConfiguration = Partial<{
  /**
   * The base URL for the RPC. The service path will be appended to this string
   */
  baseURL: string;
  headers: Record<string, string>;
}>;

interface MiddlewareConfig {
  /**
   * The URL for the RPC.
   */
  url: string;
  headers: Record<string, string>;
}

type ClientMiddleware = (
  config: MiddlewareConfig,
  next: (config: MiddlewareConfig) => Promise<unknown>
) => Promise<unknown>;

interface Client extends ClientConfiguration {
  use: (middleware: ClientMiddleware) => void;
}

const clientMiddleware: ClientMiddleware[] = [];

/**
 * Global configuration for the TwirpScript clients.
 */
export const client: Client = {
  baseURL: "",
  headers: {},
  use(middleware: ClientMiddleware) {
    clientMiddleware.push(middleware);
  },
};

function runMiddleware(
  config: MiddlewareConfig,
  request: (c: MiddlewareConfig) => Promise<unknown>
): Promise<unknown> {
  let idx = 1;
  const middleware = [...clientMiddleware, request];
  return middleware[0](config, function next(c: MiddlewareConfig) {
    const nxt = middleware[idx];
    idx++;
    return nxt(c, next);
  });
}

function getConfig(
  config: ClientConfiguration = {},
  path: string
): MiddlewareConfig {
  const baseURL = config?.baseURL ?? client.baseURL ?? "";
  return {
    url: baseURL + path,
    headers: {
      ...client.headers,
      ...config.headers,
    },
  };
}

export function JSONrequest<T = unknown>(
  path: string,
  body?: Record<string, any>,
  config?: ClientConfiguration
): Promise<T> {
  return runMiddleware(getConfig(config, path), async (c: MiddlewareConfig) => {
    const res = await fetch(c.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...c?.headers,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw await twirpErrorFromResponse(res);
    }

    return res.json();
  }) as Promise<T>;
}

export function PBrequest(
  path: string,
  body?: Uint8Array,
  config?: ClientConfiguration
): Promise<Uint8Array> {
  return runMiddleware(getConfig(config, path), async (c: MiddlewareConfig) => {
    const res = await fetch(c.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/protobuf",
        ...c.headers,
      },
      body,
    });

    if (!res.ok) {
      throw await twirpErrorFromResponse(res);
    }

    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  }) as Promise<Uint8Array>;
}
