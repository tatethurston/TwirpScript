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

function parseSchema(proto: string): Schema | undefined {
  const schema = parse(readFileSync(proto));

  if (!schema.services) {
    console.warn(`No services listed in ${proto}.`);
    return;
  }

  return schema as Schema;
}

type Config = { src: string; dest: string };
function getConfig(): Config {
  const defaultConfig = {
    src: process.cwd(),
    dest: join(process.cwd(), "twirp"),
  };
  return defaultConfig;
}

const { src, dest } = getConfig();

if (!existsSync(dest)) {
  mkdirSync(dest);
}

const protos = readdirSync(src).filter((file) => file.endsWith(".proto"));

protos.forEach((proto) => {
  const schema = parseSchema(proto);
  if (!schema) {
    return;
  }

  const types = TypeTemplate(schema);
  writeFileSync(`${dest}/types.ts`, types);

  const jsonClient = JSONClientTemplate(schema);
  writeFileSync(`${dest}/json-client.ts`, jsonClient);
});
