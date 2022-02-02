import { client } from "twirpscript";
import { nodeHttpTransport } from "twirpscript/dist/node";
import { MakeHat, MakeHatJSON } from "./protos/haberdasher.pb";

client.baseURL = "http://localhost:8080";
client.rpcTransport = nodeHttpTransport;

(async () => {
  const hat = await MakeHat({ inches: 12 });
  console.log(hat);

  const hatJSON = await MakeHatJSON({ inches: 11 });
  console.log(hatJSON);
})();
