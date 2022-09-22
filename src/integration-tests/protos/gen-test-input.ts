#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { type Config } from "protoscript";

function deserializeConfig(config: string): Config {
  const params = new URLSearchParams(config.replace(/,/g, "&"));
  return {
    language:
      params.get("language") === "typescript" ? "typescript" : "javascript",
    json: {
      emitFieldsWithDefaultValues: params
        .getAll("json")
        .includes("emitFieldsWithDefaultValues"),
      useProtoFieldName: params.getAll("json").includes("useProtoFieldName"),
    },
    typescript: {
      emitDeclarationOnly: params
        .getAll("typescript")
        .includes("emitDeclarationOnly"),
    },
  };
}

const input = readFileSync(0);
const response = new CodeGeneratorResponse();
response.setSupportedFeatures(
  CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL
);
const request = CodeGeneratorRequest.deserializeBinary(input);
const options = deserializeConfig(request.getParameter() ?? "");
const isTypescript = options.language === "typescript";
const name = isTypescript
  ? "test-input-typescript.txt"
  : "test-input-javascript.txt";
writeFileSync(name, input);
process.stdout.write(response.serializeBinary());
