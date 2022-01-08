#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";

const input = readFileSync(process.stdin.fd);
const response = new CodeGeneratorResponse();
response.setSupportedFeatures(
  CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL
);
const request = CodeGeneratorRequest.deserializeBinary(input);
const isTypescript = request.getParameter()?.trim() === "typescript";
const name = isTypescript
  ? "test-input-typescript.txt"
  : "test-input-javascript.txt";
writeFileSync(name, input);
process.stdout.write(response.serializeBinary());
