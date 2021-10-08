#!/usr/bin/env node

import { spawnSync } from "child_process";
import { readdirSync, existsSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { commandIsInPath } from "../utils";

export type UserConfig = Partial<Config>;

type Config = { src: string };

function getConfig(): Config {
  const cwd = process.cwd();

  const defaultConfig = {
    src: cwd,
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

const { src } = getConfig();
const protos = findFiles(src, ".proto").map((filepath) =>
  relative(src, filepath)
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
  const res = spawnSync(
    `\
protoc \
  --plugin=protoc-gen-twirpscript=${join(
    ".",
    "node_modules",
    "twirpscript",
    "dist",
    "compiler.js"
  )} \
  --twirpscript_out=. \
  ${protos.join(" ")}
`,
    { shell: true, stdio: "inherit" }
  );
} catch (error) {
  process.exit(1);
}
