import type { Middleware } from "twirpscript";
import { Context } from "../context";

export const cors: Middleware<Context> = async (req, _ctx, next) => {
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
};
