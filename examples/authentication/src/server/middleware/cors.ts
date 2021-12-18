import { IncomingMessage } from "http";
import type { Middleware } from "twirpscript";
import { Context } from "../context";

export const cors: Middleware<Context, IncomingMessage> = async (
  req,
  _ctx,
  next
) => {
  if (req.method === "OPTIONS") {
    return {
      statusCode: 204,
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

  const { statusCode, headers, body } = await next();
  return {
    statusCode,
    body,
    headers: {
      "Access-Control-Allow-Origin": "*",
      ...headers,
    },
  };
};
