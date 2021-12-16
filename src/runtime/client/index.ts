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
}

const clientMiddleware: ClientMiddleware[] = [];
const ee = createEventEmitter<ClientHooks<MiddlewareConfig>>();

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
  body?: Record<string, unknown>,
  config?: ClientConfiguration
): Promise<T> {
  return runMiddleware(
    mergeConfig(config, path),
    async (c: MiddlewareConfig) => {
      ee.emit("requestPrepared", c);
      const res = await fetch(c.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      const res = await fetch(c.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/protobuf",
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
