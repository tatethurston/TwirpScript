#!/usr/bin/env node

import { spawnSync } from "child_process";
import { existsSync, readFileSync, mkdirSync } from "fs";
import { join, relative, resolve } from "path";
import { findFiles, commandIsInPath, isWindows } from "../utils";
import { createHash } from "crypto";

const logger: Pick<Console, "info" | "warn" | "error"> = {
  info: (str: string) => console.info("[TwirpScript] " + str),
  warn: (str: string) => console.warn("[TwirpScript] " + str),
  error: (str: string) => console.error("[TwirpScript] " + str),
};

function checksum(file: string): string {
  const hash = createHash("md5");
  return hash.update(readFileSync(file, "utf8"), "utf8").digest("hex");
}

function pluralize(str: string, count: number): string {
  return count === 1 ? str : str + "s";
}

function onCliError(error: string): void {
  logger.error("Protobuf Compiler Error: \n");
  console.error(error);
  console.error();
  console.error("No .pb.ts files were created or updated.");
  process.exit(1);
}

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
   * // twirp.json
   * ```json
   * {
   *   root: "src"
   * }
   * ```
   *
   * A.proto would `import` B.proto as follows:
   *
   * ```proto
   * import "B.proto";
   * ```
   *
   * TypeScript projects will generally want to set this value to match their `rootDir`, particularly when using [Protocol Buffers Well-Known Types](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf) so that the generated well-known type files are under the `rootDir`.
   */
  root: string;
  /**
   * An array of patterns that should be skipped when searching for `.proto` files.
   *
   * Example:
   *
   * If we have the following project structure:
   * /src
   *   /foo
   *     A.proto
   *   /bar
   *     B.proto
   *
   * Setting `exclude` to `["/bar/"]`:
   *
   * // twirp.json
   * ```json
   * {
   *   exclude: ["/bar/"]
   * }
   * ```
   *
   * Will only process A.proto (B.proto) will be excluded from TwirpScript's code generation.
   *
   */
  exclude: string[];
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
   * // twirp.json
   * {
   *   dest: 'out',
   * }
   *
   * /src
   *   A.proto
   *   B.proto
   * /out
   *   /src
   *     A.pb.ts
   *     B.pb.ts
   *
   * Note that the generated directory structure will mirror the `proto` paths exactly as is, only nested under the `dest` directory. If you want to change this, for instance, to omit `src` from the `out` directory above, you can set the `root`.
   *
   * Setting `root` to `src`:
   *
   * // twirp.json
   * {
   *   root: 'src',
   *   dest: 'out',
   * }
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
    exclude: [],
    dest: ".",
    language: existsSync(join(projectRoot, "tsconfig.json"))
      ? "typescript"
      : "javascript",
  };

  const configFilePath = join(projectRoot, ".twirp.json");

  let userConfig: UserConfig = {};
  if (existsSync(configFilePath)) {
    logger.info(`Using configuration file at '${configFilePath}'.`);
    const userConfigFile = readFileSync(configFilePath);
    try {
      userConfig = JSON.parse(userConfigFile.toString());
    } catch {
      logger.error(`Failed to parse configuration file.`);
      process.exit(1);
    }

    const unknownKeys = Object.keys(userConfig).filter(
      (key) => !defaultConfig.hasOwnProperty(key)
    );
    if (unknownKeys.length) {
      logger.warn(
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

const config = getConfig();

const excludes = config.exclude.map((pattern) => RegExp(pattern));

const protos = findFiles(config.root, ".proto")
  .map((filepath) => relative(config.root, filepath))
  .filter((file) => !excludes.some((exclude) => exclude.exec(file)));

if (!commandIsInPath("protoc")) {
  logger.error(
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

if (protos.length === 0) {
  logger.info("No '.proto' files found.");
  process.exit(0);
}

try {
  const destination = config.dest === "." ? "." : resolve(config.dest);

  if (!existsSync(destination)) {
    logger.info(`Created destination folder '${destination}'.`);
    mkdirSync(destination, { recursive: true });
  }

  process.chdir(config.root);

  const protoExt = config.language === "typescript" ? "pb.ts" : "pb.js";
  const protosBeforeCompile = Object.fromEntries(
    findFiles(destination, protoExt).map((file) => [file, checksum(file)])
  );

  const protoc = spawnSync(
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
    { shell: true, encoding: "utf8" }
  );

  if (protoc.stderr) {
    onCliError(protoc.stderr);
  }

  const protosAfterCompile = findFiles(destination, protoExt).map((file) => [
    file,
    checksum(file),
  ]);

  const created = protosAfterCompile.filter(
    (file) => !protosBeforeCompile[file[0]]
  );
  const updated = protosAfterCompile.filter(
    (file) =>
      protosBeforeCompile[file[0]] && protosBeforeCompile[file[0]] !== file[1]
  );
  const unchanged = protosAfterCompile.filter(
    (file) => protosBeforeCompile[file[0]] === file[1]
  );

  logger.info("\n");
  if (created.length > 0) {
    console.info(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Created:\n${created.map((f) => `  - ${f[0]}`).join("\n")}\n`
    );
  }
  if (updated.length > 0) {
    console.info(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Updated:\n${updated.map((f) => `  - ${f[0]}`).join("\n")}\n`
    );
  }
  console.info(
    `${created.length} ${pluralize("file", created.length)} created, ${
      updated.length
    } ${pluralize("file", updated.length)} updated, ${
      unchanged.length
    } ${pluralize("file", unchanged.length)} unchanged. ${
      protos.length
    } ${pluralize("file", protos.length)} found.`
  );
} catch (error) {
  onCliError(error as string);
}
