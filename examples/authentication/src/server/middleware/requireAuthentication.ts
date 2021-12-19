import { IncomingMessage } from "http";
import { Middleware, TwirpError } from "twirpscript";
import { Context } from "../context";
import { getCurrentUser, UnauthenticatedUser } from "../services";

interface RequireAuthenticationOpts {
  exceptions: string[];
}

export function requireAuthentication({
  exceptions,
}: RequireAuthenticationOpts): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    for (let exception of exceptions) {
      if (ctx.service === exception) {
        ctx.currentUser = UnauthenticatedUser;
        return next();
      }
    }

    const token = req.headers["authorization"]?.split("bearer")?.[1]?.trim();
    const currentUser = getCurrentUser(token);
    if (!currentUser) {
      throw new TwirpError({
        code: "unauthenticated",
        msg: "Access denied",
      });
    } else {
      ctx.currentUser = currentUser;
      return next();
    }
  };
}
