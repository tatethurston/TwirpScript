#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const plugin_pb_1 = require("google-protobuf/google/protobuf/compiler/plugin_pb");
const type_1 = require("./type");
const utils_1 = require("./utils");
const prettier_1 = require("prettier");
const input = fs_1.readFileSync(process.stdin.fd);
const request = plugin_pb_1.CodeGeneratorRequest.deserializeBinary(input);
const response = new plugin_pb_1.CodeGeneratorResponse();
const identifierTable = utils_1.buildIdentifierTable(request);
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
function writeFile(name, content) {
    const file = new plugin_pb_1.CodeGeneratorResponse.File();
    file.setName(name);
    file.setContent(prettier_1.format(content, { parser: "typescript" }));
    response.addFile(file);
}
request.getProtoFileList().forEach((fileDescriptorProto) => {
    const name = fileDescriptorProto.getName();
    if (!name) {
        return;
    }
    // Types
    const typeDefinition = type_1.generateType(fileDescriptorProto, identifierTable);
    writeFile(utils_1.getTypesFileName(name), typeDefinition);
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
fs_1.writeFileSync(process.stdout.fd, response.serializeBinary());
