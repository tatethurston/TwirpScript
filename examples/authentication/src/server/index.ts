import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { AuthenticationHandler, HaberdasherHandler } from "./services";
import { Context } from "./context";
import { cors, requireAuthentication } from "./middleware";

const PORT = 8080;

const app = createTwirpServer<Context>([
  AuthenticationHandler,
  HaberdasherHandler,
]);

app.use(cors);
app.use(requireAuthentication({ exceptions: [AuthenticationHandler.path] }));

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
