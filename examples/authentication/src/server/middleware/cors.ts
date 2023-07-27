import { IncomingMessage } from "http";
import type { Middleware } from "twirpscript";
import { Context } from "../context";

export const cors: Middleware<Context, IncomingMessage> = async (
  req,
  _ctx,
  next,
) => {
  if (req.method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-request-method": "*",
        "access-control-allow-methods": "*",
        "access-control-allow-headers": "Content-Type, Authorization",
        "content-type": "application/json",
      },
      body: "",
    };
  }

  const { statusCode, headers, body } = await next();
  return {
    statusCode,
    body,
    headers: {
      "access-control-allow-origin": "*",
      ...headers,
    },
  };
};
