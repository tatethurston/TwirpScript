import { client } from "twirpscript";
import { MakeHat } from "./haberdasher.pb";

client.baseURL = "https://jr8wrw06og.execute-api.us-west-1.amazonaws.com";
client.prefix = "/prod/twirp";

void (async function () {
  try {
    const hat = await MakeHat({ inches: 12 });
    console.log(hat);
  } catch (e) {
    console.error(e);
  }
})();
