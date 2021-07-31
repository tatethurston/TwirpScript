// import { JSONrequest } from 'twirpscript/runtime';
import { PBrequest, TwirpError } from "../runtime/index";
import { Req, Resp, Empty } from "./clientcompat.pb";

export async function Method(url: string, req: Req): Promise<Resp> {
  const response = await PBrequest(
    `${url}/twirp/twirp.clientcompat.CompatService/Method`,
    Req.encode(req)
  );
  return Resp.decode(response);
}

export async function NoopMethod(url: string, empty: Empty): Promise<Empty> {
  const response = await PBrequest(
    `${url}/twirp/twirp.clientcompat.CompatService/NoopMethod`,
    Empty.encode(empty)
  );
  return Empty.decode(response);
}
