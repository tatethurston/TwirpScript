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
    const content =
      ctx.request.headers["content-type"] === "application/json"
        ? "JSON"
        : "Protobuf";
    console.info(
      `[TwirpScript] Processing by ${ctx.service}#${ctx.method} as ${content}`
    );
  });

  app.on("responseSent", (ctx) => {
    const time = Date.now() - (ctx as any)[timingField];
    console.info(
      `[TwirpScript] Completed ${ctx.response?.statusCode} in ${time} ms.`
    );
  });

  app.on("error", (_ctx, error) => {
    console.error("[TwirpScript] encountered an error:");
    console.error(error);
  });

  return app;
}
