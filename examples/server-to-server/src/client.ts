import { client } from "twirpscript";
import { nodeHttpTransport } from "twirpscript/dist/node";
import { MakeHat, MakeHatJSON } from "./protos/haberdasher.pb";

client.baseURL = "http://localhost:8080";
client.rpcTransport = nodeHttpTransport;

(async function () {
  try {
    let hat = await MakeHat({ inches: 12 });
    console.log(hat);
    hat = await MakeHatJSON({ inches: 11 });
    console.log(hat);
  } catch (e) {
    console.error(e);
  }
})();
