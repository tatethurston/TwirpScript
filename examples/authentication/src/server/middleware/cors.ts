import type { Middleware } from "twirpscript";

export const cors: Middleware = async (req, _ctx, next) => {
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
