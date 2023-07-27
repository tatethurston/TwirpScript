import { createServer, IncomingMessage } from "http";
import { createTwirpServer } from "twirpscript";
import { authenticationHandler, habderdasherHandler } from "./services";
import { Context } from "./context";
import { cors, requireAuthentication } from "./middleware";

const PORT = 8080;
const services = [authenticationHandler, habderdasherHandler];

const app = createTwirpServer<Context, typeof services, IncomingMessage>(
  services,
)
  .use(cors)
  .use(requireAuthentication({ exceptions: [authenticationHandler.name] }));

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`),
);
