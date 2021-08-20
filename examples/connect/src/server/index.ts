import { createServer } from "http";
import connect from "connect";
import { createServerHandler } from "twirpscript";
import { HaberdasherServiceHandler } from "./haberdasher";
import cors from "cors";

const PORT = 8080;

const app = connect();

app.use(cors());
app.use(createServerHandler([HaberdasherServiceHandler]));

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
