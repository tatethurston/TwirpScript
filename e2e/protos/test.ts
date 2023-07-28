import { spawnSync } from "child_process";
import { mkdirSync, readFileSync, readdirSync, rmdirSync } from "fs";
import { join } from "path";

describe("TwirpScript Compiler", () => {
  const TYPESCRIPT_DEST = join(__dirname, "dist/typescript");
  const JAVASCRIPT_DEST = join(__dirname, "dist/javascript");

  beforeAll(() => {
    mkdirSync(TYPESCRIPT_DEST, { recursive: true });
    mkdirSync(JAVASCRIPT_DEST, { recursive: true });
  });

  afterAll(() => {
    rmdirSync(TYPESCRIPT_DEST, { recursive: true });
    rmdirSync(JAVASCRIPT_DEST, { recursive: true });
  });

  it("generates TypeScript", () => {
    const child = spawnSync(
      `protoc \
         --plugin=protoc-gen-twirpscript=./node_modules/twirpscript/dist/compiler.js \
         --twirpscript_out=${TYPESCRIPT_DEST} \
         --twirpscript_opt=language=typescript \
         $(find . -name '*.proto')`,
      {
        encoding: "utf8",
        shell: true,
        cwd: __dirname,
      },
    );

    expect(child.output).toMatchSnapshot();
    const files = readdirSync(join(TYPESCRIPT_DEST), {
      recursive: true,
      withFileTypes: true,
    })
      .filter((f) => f.isFile())
      .map((f) => join(f.path, f.name));
    expect(files.map((f) => f.replace(__dirname, ""))).toMatchSnapshot();
    files.forEach((file) =>
      expect(readFileSync(file, { encoding: "utf8" })).toMatchSnapshot(),
    );
  });

  it("generates JavaScript", () => {
    const child = spawnSync(
      `protoc \
         --plugin=protoc-gen-twirpscript=./node_modules/twirpscript/dist/compiler.js \
         --twirpscript_out=${JAVASCRIPT_DEST}  \
         --twirpscript_opt=language=javascript \
         $(find . -name '*.proto')`,
      {
        encoding: "utf8",
        shell: true,
        cwd: __dirname,
      },
    );

    expect(child.output).toMatchSnapshot();
    const files = readdirSync(JAVASCRIPT_DEST, {
      recursive: true,
      withFileTypes: true,
    })
      .filter((f) => f.isFile())
      .map((f) => join(f.path, f.name));
    expect(files.map((f) => f.replace(__dirname, ""))).toMatchSnapshot();
    files.forEach((file) =>
      expect(readFileSync(file, { encoding: "utf8" })).toMatchSnapshot(),
    );
  });
});
