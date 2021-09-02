import { Middleware, TwirpErrorResponse } from "twirpscript";
import { Context } from "../context";
import { getCurrentUser } from "../services";

interface RequireAuthenticationOpts {
  exceptions: string[];
}

export function requireAuthentication({
  exceptions,
}: RequireAuthenticationOpts): Middleware<Context> {
  return async (req, ctx, next) => {
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
  };
}
