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
import { deserializeConfig } from "./deserializeConfig";

export function compile(input: Uint8Array): CodeGeneratorResponse {
  const request = CodeGeneratorRequest.deserializeBinary(input);
  const options = deserializeConfig(request.getParameter() ?? "");
  const isTypescript = options.language === "typescript";
  const response = new CodeGeneratorResponse();
  response.setSupportedFeatures(
    CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL
  );

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

    const protobufTs = generate(fileDescriptorProto, identifierTable, options);
    writeFile(
      isTypescript ? getProtobufTSFileName(name) : getProtobufJSFileName(name),
      protobufTs
    );
  });

  return response;
}
