#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { generate } from "./autogenerate";
import {
  getProtobufTSFileName,
  buildIdentifierTable,
  getProtobufJSFileName,
} from "./utils";
import { format } from "prettier";

const input = readFileSync(process.stdin.fd);
const request = CodeGeneratorRequest.deserializeBinary(input);
const isTypescript = request.getParameter()?.trim() === "typescript";
const response = new CodeGeneratorResponse();
const identifierTable = buildIdentifierTable(request);

function writeFile(name: string, content: string) {
  const file = new CodeGeneratorResponse.File();
  file.setName(name);
  file.setContent(
    format(content, { parser: isTypescript ? "typescript" : "babel" })
  );
  response.addFile(file);
}

request.getProtoFileList().forEach((fileDescriptorProto) => {
  const name = fileDescriptorProto.getName();
  if (!name) {
    return;
  }

  const protobufTs = generate(
    fileDescriptorProto,
    identifierTable,
    isTypescript
  );
  writeFile(
    isTypescript ? getProtobufTSFileName(name) : getProtobufJSFileName(name),
    protobufTs
  );
});

writeFileSync(process.stdout.fd, response.serializeBinary());
