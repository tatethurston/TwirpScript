import { createServer } from "http";
import { createTwirpServer, TwirpErrorResponse } from "twirpscript";
import { getCurrentUser } from "./models";
import { AuthenticationServiceHandler } from "./authentication";
import { HaberdasherServiceHandler } from "./haberdasher";
import { Context } from "./context";

const PORT = 8080;

const app = createTwirpServer<Context>([
  AuthenticationServiceHandler,
  HaberdasherServiceHandler,
]);

// CORS
app.use(async (req, _ctx, next) => {
  if (req.method === "OPTIONS") {
    return {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Request-Method": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json",
      },
      body: "",
    };
  }

  const { status, headers, body } = await next();
  return {
    status,
    body,
    headers: {
      "Access-Control-Allow-Origin": "*",
      ...headers,
    },
  };
});

// Auth
app.use(async (req, ctx, next) => {
  const exceptions = [AuthenticationServiceHandler.path];
  for (let exception of exceptions) {
    if (req.url?.startsWith("/twirp/" + exception)) {
      return next();
    }
  }

  const token = req.headers["authorization"]?.split("bearer")?.[1]?.trim();
  ctx.currentUser = getCurrentUser(token);
  if (!ctx.currentUser) {
    return TwirpErrorResponse({
      code: "unauthenticated",
      msg: "Access denied",
    });
  } else {
    return next();
  }
});

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
