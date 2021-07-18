import {
  readdirSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { parse } from "protocol-buffers-schema";
import TypeTemplate from "./templates/types";
import JSONClientTemplate from "./templates/json-client";
import { Schema } from "./utils";

export type UserConfig = Partial<Config>;

type Config = { src: string; dest: string };

function getConfig(): Config {
  const cwd = process.cwd();

  const defaultConfig = {
    src: cwd,
    dest: join(cwd, "twirp"),
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

function parseSchema(proto: string): Schema | undefined {
  const schema = parse(readFileSync(proto));

  if (!schema.services) {
    console.warn(`No services listed in '${proto}'.`);
    return;
  }

  return schema as Schema;
}

console.log();

const { src, dest } = getConfig();

if (!existsSync(dest)) {
  mkdirSync(dest);
}

const protos = readdirSync(src).filter((file) => file.endsWith(".proto"));

const created = new Set();
const updated = new Set();
const unchanged = new Set();
protos.forEach((proto) => {
  const schema = parseSchema(proto);
  if (!schema) {
    return;
  }

  function writeFileIfChange(
    name: string,
    filepath: string,
    contents: string
  ): void {
    if (!existsSync(filepath)) {
      writeFileSync(filepath, contents);
      created.add(name);
    } else if (contents !== readFileSync(filepath).toString()) {
      writeFileSync(filepath, contents);
      updated.add(name);
    } else {
      unchanged.add(name);
    }
  }

  const service = schema.services[0].name;
  const dir = join(dest, service);
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }

  const types = TypeTemplate(schema);
  const typesFile = join(dir, "types.ts");
  writeFileIfChange(service, typesFile, types);

  const jsonClient = JSONClientTemplate(schema);
  const jsonClientFile = join(dir, "json-client.ts");
  writeFileIfChange(service, jsonClientFile, jsonClient);

  return service;
});

if (created.size) {
  console.log(
    `Created:
${Array.from(created)
  .sort()
  .map((name) => ` - ${name}`)
  .join("\n")}
`
  );
}

if (updated.size) {
  console.log(
    `Updated:
${Array.from(updated)
  .sort()
  .map((name) => ` - ${name}`)
  .join("\n")}
`
  );
}

if (unchanged.size) {
  console.log(`Unchanged: ${unchanged.size}`);
}

console.log();
