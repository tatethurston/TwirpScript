import { client } from "twirpscript";
import { MakeHat, MakeHatJSON } from "./protos/haberdasher.pb";

client.baseURL = "http://localhost:8080";

async function main() {
  const hat = await MakeHat({ inches: 12 });
  console.log("Response from server (application/protobuf): ");
  console.log(hat);
  console.log();

  const hatJSON = await MakeHatJSON({ inches: 11 });
  console.log("Response from server (application/json):");
  console.log(hatJSON);
  console.log();
}

void main();
