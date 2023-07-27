import { TwirpServerRuntime } from "../index.js";

export const timingField = "__twirpRequestStartMs__";

export function withRequestLogging<App extends TwirpServerRuntime>(
  app: App,
): typeof app {
  app.on("requestReceived", (ctx, request) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (ctx as any)[timingField] = Date.now();
    console.info(`[TwirpScript] Started ${request.method} "${request.url}"`);
  });

  app.on("requestRouted", (ctx) => {
    console.info(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `[TwirpScript] Processing by ${ctx.service?.name}#${ctx.method?.name} as ${ctx.contentType}`,
    );
  });

  app.on("responseSent", (ctx, response) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const time = Date.now() - (ctx as any)[timingField];
    console.info(
      `[TwirpScript] Completed ${response.statusCode} in ${time} ms.`,
    );
  });

  app.on("error", (_ctx, error) => {
    console.error("[TwirpScript] Error:");
    console.error(error);
  });

  return app;
}
