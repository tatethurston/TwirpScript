#!/usr/bin/env node

import { spawnSync } from "child_process";
import { readdirSync, existsSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { commandIsInPath, isWindows } from "../utils";

export type UserConfig = Partial<Config>;

type Config = { src: string; target: "javascript" | "typescript" };

function getConfig(): Config {
  const cwd = process.cwd();

  const defaultConfig: Config = {
    src: cwd,
    target: existsSync(join(cwd, "tsconfig.json"))
      ? "typescript"
      : "javascript",
  };

  const configFilePath = join(cwd, ".twirp.json");

  let userConfig: UserConfig = {};
  if (existsSync(configFilePath)) {
    console.log(`Using configuration file at '${configFilePath}'.`);
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
const protos = findFiles(config.src, ".proto").map((filepath) =>
  relative(config.src, filepath)
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
  spawnSync(
    `\
protoc \
  --plugin=protoc-gen-twirpscript=${join(
    ".",
    "node_modules",
    "twirpscript",
    "dist",
    `compiler.${isWindows ? "cmd" : "js"}`
  )} \
  --twirpscript_out=. \
  --twirpscript_opt=${config.target} \
  ${protos.join(" ")}
`,
    { shell: true, stdio: "inherit" }
  );
} catch (error) {
  process.exit(1);
}
