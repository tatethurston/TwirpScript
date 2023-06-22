import { spawnSync } from "child_process";
import { mkdirSync, readFileSync, readdirSync, rmdirSync } from "fs";
import { join } from "path";

describe("TwirpScript Compiler", () => {
  beforeAll(() => {
    mkdirSync(join(__dirname, "dist/typescript"), { recursive: true });
    mkdirSync(join(__dirname, "dist/javascript"), { recursive: true });
  });

  afterAll(() => {
    rmdirSync(join(__dirname, "dist/typescript"), { recursive: true });
    rmdirSync(join(__dirname, "dist/javascript"), { recursive: true });
  });

  it("generates TypeScript", () => {
    const child = spawnSync(
      `protoc \
         --plugin=protoc-gen-twirpscript=./node_modules/twirpscript/dist/compiler.js \
         --twirpscript_out=./dist/typescript \
         --twirpscript_opt=language=typescript \
         $(find . -name '*.proto')`,
      {
        encoding: "utf8",
        shell: true,
        cwd: __dirname,
      },
    );

    expect(child.output).toMatchSnapshot();
    const files = readdirSync(join(__dirname, "dist/typescript"), {
      recursive: true,
      withFileTypes: true,
    })
      .filter((f) => f.isFile())
      .map((f) => join(f.path, f.name));
    expect(files).toMatchSnapshot();
    files.forEach((file) =>
      expect(readFileSync(file, { encoding: "utf8" })).toMatchSnapshot(),
    );
  });

  it("generates JavaScript", () => {
    const child = spawnSync(
      `protoc \
         --plugin=protoc-gen-twirpscript=./node_modules/twirpscript/dist/compiler.js \
         --twirpscript_out=./dist/javascript  \
         --twirpscript_opt=language=javascript \
         $(find . -name '*.proto')`,
      {
        encoding: "utf8",
        shell: true,
        cwd: __dirname,
      },
    );

    expect(child.output).toMatchSnapshot();
    const files = readdirSync(join(__dirname, "dist/javascript"), {
      recursive: true,
      withFileTypes: true,
    })
      .filter((f) => f.isFile())
      .map((f) => join(f.path, f.name));
    expect(files).toMatchSnapshot();
    files.forEach((file) =>
      expect(readFileSync(file, { encoding: "utf8" })).toMatchSnapshot(),
    );
  });
});
