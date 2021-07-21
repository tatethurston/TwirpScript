import { spawnSync } from "child_process";
import { commandIsInPath } from "../utils";

if (!commandIsInPath("clientcompat")) {
  console.error(
    `Could not find the twirp clientcompat tool. Please make sure 'clientcompat' is installed and in your '$PATH'. Install via:

  go install github.com/twitchtv/twirp/clientcompat@latest

`
  );
  process.exit(1);
}

try {
  const res = spawnSync(
    `clientcompat -client=./src/twirp-client-compat-test/test`,
    {
      shell: true,
      stdio: "inherit",
    }
  );
} catch (error) {
  console.error(`Error:\n${error.output as string}`);
}
