import { createServer } from "http";
import { createServerHandler } from "twirpscript";
import { HaberdasherServiceHandler } from "./haberdasher";

const PORT = 8080;

const twirpHandler = createServerHandler([HaberdasherServiceHandler]);
const server = createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.writeHead(204);
    res.end();
    return;
  }

  return twirpHandler(req, res);
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
