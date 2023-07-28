import { IncomingMessage } from "http";
import { Middleware, TwirpErrorResponse } from "twirpscript";
import { Context } from "../context";
import { getCurrentUser, unauthenticatedUser } from "../services";

interface RequireAuthenticationOpts {
  exceptions: string[];
}

export function requireAuthentication({
  exceptions,
}: RequireAuthenticationOpts): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    for (const exception of exceptions) {
      if (ctx.service?.name === exception) {
        ctx.currentUser = unauthenticatedUser;
        return next();
      }
    }

    const token = req.headers["authorization"]?.split("bearer")?.[1]?.trim();
    const currentUser = getCurrentUser(token);
    if (!currentUser) {
      return TwirpErrorResponse({
        code: "unauthenticated",
        msg: "Access denied",
      });
    } else {
      ctx.currentUser = currentUser;
      return next();
    }
  };
}
