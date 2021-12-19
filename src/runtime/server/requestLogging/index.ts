import { TwirpServerRuntime } from "..";

const timingField = "__twirpRequestStartMs__";

export function withRequestLogging(
  app: TwirpServerRuntime<unknown, unknown>
): typeof app {
  app.on("requestReceived", (ctx) => {
    (ctx as any)[timingField] = Date.now();
    console.info(
      `[TwirpScript] Started ${ctx.request.method} "${ctx.request.url}"`
    );
  });

  app.on("requestRouted", (ctx) => {
    console.info(
      `[TwirpScript] Processing by ${ctx.service}#${ctx.method} as ${ctx.contentType}`
    );
  });

  app.on("responseSent", (ctx) => {
    const time = Date.now() - (ctx as any)[timingField];
    console.info(
      `[TwirpScript] Completed ${ctx.response?.statusCode} in ${time} ms.`
    );
  });

  app.on("error", (_ctx, error) => {
    console.error("[TwirpScript] Error:");
    console.error(error);
  });

  return app;
}
