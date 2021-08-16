import { createServer } from "http";
import { createServerHandler } from "twirpscript";
import { HaberdasherServiceHandler } from "./haberdasher";

const PORT = 8080;

const twirpHandler = createServerHandler([HaberdasherServiceHandler]);
const server = createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  return twirpHandler(req, res);
});

console.log(`Server listening on port ${PORT}`);
server.listen(PORT);
