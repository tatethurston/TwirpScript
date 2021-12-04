import { Middleware, TwirpError } from "twirpscript";
import { Context } from "../context";
import { getCurrentUser, UnauthenticatedUser } from "../services";

interface RequireAuthenticationOpts {
  exceptions: string[];
}

export function requireAuthentication({
  exceptions,
}: RequireAuthenticationOpts): Middleware<Context> {
  return async (req, ctx, next) => {
    for (let exception of exceptions) {
      if (req.url?.startsWith("/twirp/" + exception)) {
        ctx.currentUser = UnauthenticatedUser;
        return next();
      }
    }

    const token = req.headers["authorization"]?.split("bearer")?.[1]?.trim();
    ctx.currentUser = getCurrentUser(token);
    if (!ctx.currentUser) {
      throw new TwirpError({
        code: "unauthenticated",
        msg: "Access denied",
      });
    } else {
      return next();
    }
  };
}
