import { execSync, spawnSync, SpawnSyncReturns } from "child_process";

const PROTOC_GEN_TS_TWIRP_CLIENT_PATH = "./node_modules/.bin/ts-twirp-client";

function protocInPath(): boolean {
  try {
    execSync("which protoc");
    return true;
  } catch {
    return false;
  }
}

type Config = Partial<{
  /**
   * The output directory. Defaults to 'src/services'.
   */
  out: string;
}>;

export function execProtoc({ out = "src/services" }: Config): void {
  if (!protocInPath) {
    console.error(
      `Could not find the protocol buffer compiler. Please make sure 'protoc' is installed and in your '$PATH'.`
    );
    process.exit(1);
  }

  try {
    const res = spawnSync(
      `protoc \
  --plugin="protoc-gen-ts-twirp-client=${PROTOC_GEN_TS_TWIRP_CLIENT_PATH}" \
  --js_out="import_style=commonjs_strict,binary:${out}" \
  --ts_out="${out}" \
  users.proto base.proto
`,
      { encoding: "utf8" }
    );
    console.error(res.stderr);
    console.log(res.stdout);
  } catch (error) {
    const e: SpawnSyncReturns<string> = error;
    console.log(`protoc error:\n${e.output}`);
    process.exit(e.status ?? 1);
  }
}

execProtoc();
