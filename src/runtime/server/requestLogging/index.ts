import { TwirpServerRuntime, RawRequest } from "..";

const timingField = "__twirpRequestStartMs__";

export function withRequestLogging<Context, Request extends RawRequest>(
  app: TwirpServerRuntime<Context, Request>
): typeof app {
  app.on("requestReceived", (ctx, request) => {
    (ctx as any)[timingField] = Date.now();
    console.info(`[TwirpScript] Started ${request.method} "${request.url}"`);
  });

  app.on("requestRouted", (ctx) => {
    console.info(
      `[TwirpScript] Processing by ${ctx.service}#${ctx.method} as ${ctx.contentType}`
    );
  });

  app.on("responseSent", (ctx, response) => {
    const time = Date.now() - (ctx as any)[timingField];
    console.info(
      `[TwirpScript] Completed ${response?.statusCode} in ${time} ms.`
    );
  });

  app.on("error", (_ctx, error) => {
    console.error("[TwirpScript] Error:");
    console.error(error);
  });

  return app;
}
