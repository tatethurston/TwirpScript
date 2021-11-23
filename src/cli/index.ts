#!/usr/bin/env node

import { spawnSync } from "child_process";
import { readdirSync, existsSync, readFileSync, statSync, mkdirSync } from "fs";
import { join, relative, resolve } from "path";
import { commandIsInPath, isWindows } from "../utils";

export type UserConfig = Partial<Config>;

type Config = {
  /**
   * The root directory. `.proto` files will be searched under this directory, and `proto` import paths will be resolved relative to this directory. TwirpScript will recursively search all subdirectories for `.proto` files.
   *
   * Defaults to the project root.
   *
   * Example:
   *
   * If we have the following project structure:
   *
   * /src
   *   A.proto
   *   B.proto
   *
   * Default:
   *
   * A.proto would `import` B.proto as follows:
   *
   * ```proto
   * import "src/B.proto";
   * ```
   *
   * Setting `root` to `src`:
   *
   * A.proto would `import` B.proto as follows:
   *
   * ```proto
   * import "B.proto";
   * ```
   */
  root: string;
  /** The destination folder for generated files.
   *
   * Defaults to colocating generated files with the corresponding `proto` definition.
   * Example:
   *
   * If we have the following project structure:
   *
   * /src
   *   A.proto
   *   B.proto
   *
   * Default:
   *
   * TwirpScript will generate the following:
   *
   * /src
   *   A.proto
   *   A.pb.ts
   *   B.proto
   *   B.pb.ts
   *
   * Setting `dest` to `out`:
   *
   * /src
   *   A.proto
   *   B.proto
   * /out
   *   A.pb.ts
   *   B.pb.ts
   */
  dest: string;
  /**
   * Whether to generate JavaScript or TypeScript.
   *
   * If omitted, TwirpScript will attempt to autodetect the language by looking for a `tsconfig.json` in the project root. If found, TwirpScript will generate TypeScript, otherwise JavaScript.
   */
  language: "javascript" | "typescript";
};

const projectRoot = process.cwd();

function getConfig(): Config {
  const defaultConfig: Config = {
    root: projectRoot,
    dest: ".",
    language: existsSync(join(projectRoot, "tsconfig.json"))
      ? "typescript"
      : "javascript",
  };

  const configFilePath = join(projectRoot, ".twirp.json");

  let userConfig: UserConfig = {};
  if (existsSync(configFilePath)) {
    console.info(`Using configuration file at '${configFilePath}'.`);
    const userConfigFile = readFileSync(configFilePath);
    try {
      userConfig = JSON.parse(userConfigFile.toString());
    } catch {
      console.error(`Failed to parse configuration file.`);
      process.exit(1);
    }

    const unknownKeys = Object.keys(userConfig).filter(
      (key) => !defaultConfig.hasOwnProperty(key)
    );
    if (unknownKeys.length) {
      console.warn(
        `Found unknown configuration options: ${unknownKeys
          .map((k) => `'${k}'`)
          .join(", ")}.`
      );
    }
  }

  return {
    ...defaultConfig,
    ...userConfig,
  };
}

function findFiles(entry: string, ext: string): string[] {
  return readdirSync(entry)
    .flatMap((file) => {
      const filepath = join(entry, file);
      if (
        statSync(filepath).isDirectory() &&
        !filepath.includes("node_modules")
      ) {
        return findFiles(filepath, ext);
      }
      return filepath;
    })
    .filter((file) => file.endsWith(ext));
}

const config = getConfig();

const protos = findFiles(config.root, ".proto").map((filepath) =>
  relative(config.root, filepath)
);

if (!commandIsInPath("protoc")) {
  console.error(
    `Could not find the protobuf compiler. Please make sure 'protoc' is installed and in your '$PATH'.

  MacOS:
    \`brew install protobuf\`

  Linux:
    \`apt install -y protobuf-compiler\` 

  Windows:
    \`choco install protoc\`

  Or install from a precompiled binary:
    https://github.com/protocolbuffers/protobuf/releases
`
  );
  process.exit(1);
}

try {
  const destination = config.dest === "." ? "." : resolve(config.dest);

  if (!existsSync(destination)) {
    console.info(`Created destination folder '${destination}'.`);
    mkdirSync(destination, { recursive: true });
  }

  process.chdir(config.root);

  spawnSync(
    `\
protoc \
  --plugin=protoc-gen-twirpscript=${join(
    projectRoot,
    "node_modules",
    "twirpscript",
    "dist",
    `compiler.${isWindows ? "cmd" : "js"}`
  )} \
  --twirpscript_out=${destination} \
  --twirpscript_opt=${config.language} \
  ${protos.join(" ")}
`,
    { shell: true, stdio: "inherit" }
  );
} catch (error) {
  process.exit(1);
}
