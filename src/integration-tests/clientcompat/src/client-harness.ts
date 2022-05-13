import { readFileSync, writeFileSync } from "fs";
import {
  Method,
  NoopMethod,
  ClientCompatMessage,
  Empty,
  Req,
  Resp,
} from "./clientcompat.pb";
import { TwirpError } from "twirpscript";

const input = readFileSync(process.stdin.fd);
const message = ClientCompatMessage.decode(input);

(async () => {
  switch (message.method) {
    case ClientCompatMessage.CompatServiceMethod.NOOP: {
      try {
        const res = await NoopMethod(Empty.decode(message.request), {
          baseURL: message.serviceAddress,
        });
        writeFileSync(process.stdout.fd, Empty.encode(res));
      } catch (e) {
        writeFileSync(process.stderr.fd, (e as TwirpError).code);
      }
      break;
    }
    case ClientCompatMessage.CompatServiceMethod.METHOD: {
      try {
        const res = await Method(Req.decode(message.request), {
          baseURL: message.serviceAddress,
        });
        writeFileSync(process.stdout.fd, Resp.encode(res));
      } catch (e) {
        writeFileSync(process.stderr.fd, (e as TwirpError).code);
      }
      break;
    }
    default: {
      const _exhaust: never = message.method;
      process.exit(_exhaust);
    }
  }
})();
