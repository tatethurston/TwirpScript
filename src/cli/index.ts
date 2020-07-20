import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { parse } from "protocol-buffers-schema";
import TypeTemplate from "./templates/types";
import JSONClientTemplate from "./templates/json-client";
import { Schema } from "./utils";

function validateSchema(schema: ReturnType<typeof parse>): schema is Schema {
  if (!schema.services) {
    console.warn(`No services listed in ${proto}.`);
    return false;
  }

  return true;
}

const proto = "./example/service.proto";
const schema = parse(readFileSync(proto));

if (!validateSchema(schema)) {
  process.exit(1);
}

const OUT = `${process.cwd()}/twirp`;
if (!existsSync(OUT)) {
  mkdirSync(OUT);
}

const types = TypeTemplate(schema);
writeFileSync(`${OUT}/types.ts`, types);

const jsonClient = JSONClientTemplate(schema);
writeFileSync(`${OUT}/json-client.ts`, jsonClient);
