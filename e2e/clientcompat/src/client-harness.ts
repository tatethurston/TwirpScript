import { readFileSync, writeFileSync } from "fs";
import {
  Method,
  NoopMethod,
  ClientCompatMessage,
  Empty,
  Req,
  Resp,
} from "./clientcompat.pb.js";
import { TwirpError } from "twirpscript";

const input = readFileSync(0);
const message = ClientCompatMessage.decode(input);

switch (message.method) {
  case ClientCompatMessage.CompatServiceMethod.NOOP: {
    try {
      const res = await NoopMethod(Empty.decode(message.request), {
        baseURL: message.serviceAddress,
      });
      writeFileSync(1, Empty.encode(res));
    } catch (e) {
      writeFileSync(2, (e as TwirpError).code);
    }
    break;
  }
  case ClientCompatMessage.CompatServiceMethod.METHOD: {
    try {
      const res = await Method(Req.decode(message.request), {
        baseURL: message.serviceAddress,
      });
      writeFileSync(1, Resp.encode(res));
    } catch (e) {
      writeFileSync(2, (e as TwirpError).code);
    }
    break;
  }
  default: {
    const _exhaust: never = message.method;
    process.exit(_exhaust);
  }
}
