import { TwirpError, twirpErrorFromResponse } from "../error";
import { createEventEmitter, Emitter } from "../eventEmitter";

export type ClientConfiguration = Partial<{
  /**
   * The base URL for the RPC. The service path will be appended to this string.
   */
  baseURL: string;
  /**
   * HTTP headers to include in the RPC.
   */
  headers: Record<string, string>;
  /**
   * A path prefix such as "/my/custom/prefix". Defaults to "/twirp", but can be set to "".
   */
  prefix: string;
}>;

interface MiddlewareConfig {
  /**
   * The URL for the RPC. This is the full URL for the request: the baseURL + prefix + the service path.
   */
  url: string;
  /**
   * HTTP headers to include in the RPC.
   */
  headers: Record<string, string>;
}

type ClientMiddleware = (
  context: MiddlewareConfig,
  next: (context: MiddlewareConfig) => Promise<unknown>
) => Promise<unknown>;

type HookListener<MiddlewareConfig> = (
  context: Readonly<MiddlewareConfig>
) => void;

type ErrorHookListener<MiddlewareConfig> = (
  context: Readonly<MiddlewareConfig>,
  err: TwirpError
) => void;

type ClientHooks<MiddlewareConfig> = {
  requestPrepared: HookListener<MiddlewareConfig>;
  responseReceived: HookListener<MiddlewareConfig>;
  error: ErrorHookListener<MiddlewareConfig>;
};

type TwirpClientEvent<MiddlewareConfig> = Emitter<
  ClientHooks<MiddlewareConfig>
>;

interface Client extends ClientConfiguration {
  /**
   * Registers middleware to manipulate the client request / response lifecycle.
   *
   * The middleware handler will receive `context` and `next` parameters. `context` sets the headers and url for the RPC. `next` invokes the next handler in the chain -- either the next registered middleware, or the Twirp RPC.
   *
   * Middleware is called in order of registration, with the Twirp RPC invoked last.
   */
  use: (middleware: ClientMiddleware) => Client;
  /**
   * Registers event handler that can instrument a Twirp-generated client.
   * These callbacks all accept the current request `context`.
   *
   * `requestPrepared` is called as soon as a request has been created and before it has been sent to the Twirp server.
   *
   * `responseReceived` is called after a request has finished sending.
   *
   * `error` is called when an error occurs during the sending or receiving of a request. In addition to `context`, the error that occurred is passed as the second argument.
   */
  on: (...args: Parameters<TwirpClientEvent<MiddlewareConfig>["on"]>) => this;
  /**
   * Removes a registered event handler.
   */
  off: (...args: Parameters<TwirpClientEvent<MiddlewareConfig>["off"]>) => this;
  /**
   * The network transport to use for the RPC. Defaults to `fetch`. Overrides must conform to the narrow fetch interface `RpcTransport`.
   */
  rpcTransport: RpcTransport;
}

const clientMiddleware: ClientMiddleware[] = [];
const ee = createEventEmitter<ClientHooks<MiddlewareConfig>>();

export interface RpcTransportOpts {
  method: string;
  headers: Record<string, string>;
  body: string | Uint8Array | undefined | null;
}

/**
 * Subset of [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) from Fetch API. Redefined so that end users don't need to include lib.dom.d.ts in server only applications.
 */
interface Headers {
  get(name: string): string | null;
}

export interface RpcTransportResponse {
  arrayBuffer: () => Promise<ArrayBuffer>;
  json: () => Promise<unknown>;
  readonly headers: Headers;
  readonly ok: boolean;
  readonly status: number;
  text: () => Promise<string>;
}

export type RpcTransport = (
  url: string,
  opts: RpcTransportOpts
) => Promise<RpcTransportResponse>;

const fetchTransport: RpcTransport = async (url, opts) => {
  return fetch(url, opts);
};

/**
 * Global configuration for the TwirpScript clients.
 */
export const client: Client = {
  baseURL: "",
  headers: {},
  prefix: "/twirp",
  use(middleware: ClientMiddleware) {
    clientMiddleware.push(middleware);
    return client;
  },
  on: (...args) => {
    ee.on(...args);
    return client;
  },
  off: (...args) => {
    ee.off(...args);
    return client;
  },
  rpcTransport: fetchTransport,
};

function runMiddleware(
  config: MiddlewareConfig,
  request: (c: MiddlewareConfig) => Promise<unknown>
): Promise<unknown> {
  let cfg = config;
  let idx = 1;
  const middleware = [...clientMiddleware, request];
  try {
    return middleware[0](config, function next(c: MiddlewareConfig) {
      cfg = c;
      const nxt = middleware[idx];
      idx++;
      return nxt(c, next);
    });
  } catch (e) {
    const error =
      e instanceof TwirpError
        ? e
        : new TwirpError({
            code: "internal",
            msg: "client error",
          });
    ee.emit("error", cfg, error);
    throw e;
  }
}

function mergeConfig(
  config: ClientConfiguration = {},
  path: string
): MiddlewareConfig {
  const baseURL = config.baseURL ?? client.baseURL ?? "";
  const prefix = config.prefix ?? client.prefix ?? "";
  const url = baseURL + prefix + path;
  return {
    url,
    headers: {
      ...client.headers,
      ...config.headers,
    },
  };
}

export function JSONrequest<T = unknown>(
  path: string,
  body?: unknown,
  config?: ClientConfiguration
): Promise<T> {
  return runMiddleware(
    mergeConfig(config, path),
    async (c: MiddlewareConfig) => {
      ee.emit("requestPrepared", c);
      const res = await client.rpcTransport(c.url, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          ...c.headers,
        },
        body: JSON.stringify(body),
      });
      ee.emit("responseReceived", c);

      if (!res.ok) {
        throw await twirpErrorFromResponse(res);
      }

      return res.json();
    }
  ) as Promise<T>;
}

export function PBrequest(
  path: string,
  body?: Uint8Array,
  config?: ClientConfiguration
): Promise<Uint8Array> {
  return runMiddleware(
    mergeConfig(config, path),
    async (c: MiddlewareConfig) => {
      ee.emit("requestPrepared", c);
      const res = await client.rpcTransport(c.url, {
        method: "POST",
        headers: {
          accept: "application/protobuf",
          "content-type": "application/protobuf",
          ...c.headers,
        },
        body,
      });
      ee.emit("responseReceived", c);

      if (!res.ok) {
        throw await twirpErrorFromResponse(res);
      }

      const buffer = await res.arrayBuffer();
      return new Uint8Array(buffer);
    }
  ) as Promise<Uint8Array>;
}
