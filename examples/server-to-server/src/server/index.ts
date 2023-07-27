import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { habderdasherHandler } from "./haberdasher";

const PORT = 8080;

const app = createTwirpServer([habderdasherHandler]);

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`),
);
