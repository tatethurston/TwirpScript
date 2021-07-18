#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { generateType } from "./type";
import { getTypesFileName, buildIdentifierTable } from "./utils";
import { format } from "prettier";

const input = readFileSync(process.stdin.fd);
const request = CodeGeneratorRequest.deserializeBinary(input);
const response = new CodeGeneratorResponse();

const identifierTable = buildIdentifierTable(request);

// client
// haberdash
// my-service.proto
// my-service.types.ts
// my-service.client.ts

// server
// haberdash
// my-service.proto
// my-service.types.ts
// my-service.service.ts

function writeFile(name: string, content: string) {
  const file = new CodeGeneratorResponse.File();
  file.setName(name);
  file.setContent(format(content, { parser: "typescript" }));
  response.addFile(file);
}

request.getProtoFileList().forEach((fileDescriptorProto) => {
  const name = fileDescriptorProto.getName();
  if (!name) {
    return;
  }

  // Types
  const typeDefinition = generateType(fileDescriptorProto, identifierTable);
  writeFile(getTypesFileName(name), typeDefinition);

  // Service
  // needs to not overwrite exisiting service
  // should be toggle able
  // const service = generateService(fileDescriptorProto);
  // writeFile(getServerFileName(name), service);

  // Client
  // should be toggle able
  // const client = generateClient(fileDescriptorProto);
  // writeFile(getClientFileName(name), client);
});

writeFileSync(process.stdout.fd, response.serializeBinary());
