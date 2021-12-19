import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { HaberdasherHandler } from "./services";

const PORT = 8080;

const app = createTwirpServer([HaberdasherHandler], { debug: false });

// CORS
app.use(async (req, _ctx, next) => {
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
});

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
