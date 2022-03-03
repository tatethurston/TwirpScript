import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import {
  lowerCase,
  IdentifierTable,
  ProtoTypes,
  Service,
  processTypes,
} from "../utils";
import { RUNTIME_MIN_CODE_GEN_SUPPORTED_VERSION } from "../runtime";
import { UserConfig } from "../cli";

let hasMaps = false;

function writeTypes(types: ProtoTypes[], isTopLevel: boolean): string {
  let result = "";

  types.forEach((node) => {
    const name = node.content.name;
    if (node.content.comments?.leading) {
      result += printComments(node.content.comments?.leading);
    }
    if (node.type === "enum") {
      result += `export type ${name} = ${node.content.values
        .map((x) => `| '${x.name}'`)
        .join("\n")}\n\n`;
    } else if (node.content.isMap) {
      hasMaps = true;
      result += `export type ${name} = Record<
              ${node.content.fields[0].tsType},
              ${node.content.fields[1].tsType} | undefined>;\n\n`;
    } else {
      result += `export interface ${name} {\n`;
      node.content.fields.forEach(
        ({ name: fieldName, tsType, repeated, optional, comments }) => {
          if (comments?.leading) {
            result += printComments(comments?.leading);
          }

          result += `${fieldName}${printIf(optional, "?")}: ${tsType}`;
          if (optional) {
            result += "| null | undefined";
          } else if (repeated) {
            result += "[]";
          }
          result += ";\n";
        }
      );
      result += "}\n\n";

      if (node.children.length > 0) {
        result += `${printIf(isTopLevel, "declare")} namespace ${name} { \n`;
        result += writeTypes(node.children, false) + "\n\n";
        result += `}\n\n`;
      }
    }
  });

  return result;
}

const toMapMessage = (name: string) =>
  `Object.entries${printIfTypescript(
    "<any>"
  )}(${name}).map(([key, value]) => ({ key: key, value: value }))`;

const fromMapMessage = (x: string) =>
  `Object.fromEntries(${x}.map(({ key, value }) => [key, value]))`;

function writeSerializers(types: ProtoTypes[], isTopLevel: boolean): string {
  let result = "";

  types.forEach((node) => {
    result += isTopLevel
      ? `export const ${node.content.name} = {`
      : `${node.content.name}: {`;

    switch (node.type) {
      case "message": {
        const isEmpty = node.content.fields.length === 0;

        if (!node.content.isMap) {
          // encode (protobuf)
          result += `\
        /**
         * Serializes a ${node.content.fullyQualifiedName} to protobuf.
         */
          `;
          if (isEmpty) {
            result += `encode: function(_msg${printIfTypescript(
              `?: Partial<${node.content.fullyQualifiedName}>`
            )})${printIfTypescript(`: Uint8Array`)} {
            return new Uint8Array();`;
          } else {
            result += `encode: function(msg${printIfTypescript(
              `: Partial<${node.content.fullyQualifiedName}>`
            )})${printIfTypescript(`: Uint8Array`)} {
          return ${
            node.content.fullyQualifiedName
          }._writeMessage(msg, new BinaryWriter()).getResultBuffer();`;
          }
          result += "},\n\n";

          // decode (protobuf)
          result += `\
        /**
         * Deserializes a ${node.content.fullyQualifiedName} from protobuf.
         */
        `;
          if (isEmpty) {
            result += `decode: function(_bytes${printIfTypescript(
              `?: ByteSource`
            )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
            return {};`;
          } else {
            result += `decode: function(bytes${printIfTypescript(
              `: ByteSource`
            )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
          return ${node.content.fullyQualifiedName}._readMessage(${
              node.content.fullyQualifiedName
            }.initialize(), new BinaryReader(bytes));`;
          }
          result += "},\n\n";

          // encode (json)
          result += `\
        /**
         * Serializes a ${node.content.fullyQualifiedName} to JSON.
         */
        `;
          if (isEmpty) {
            result += `encodeJSON: function(_msg${printIfTypescript(
              `?: Partial<${node.content.fullyQualifiedName}>`
            )})${printIfTypescript(`: string`)} {
            return "{}";`;
          } else {
            result += `encodeJSON: function(msg${printIfTypescript(
              `: Partial<${node.content.fullyQualifiedName}>`
            )})${printIfTypescript(`: string`)} {
            return JSON.stringify(${
              node.content.fullyQualifiedName
            }._writeMessageJSON(msg));`;
          }
          result += "},\n\n";

          // decode (json)
          result += `\
        /**
         * Deserializes a ${node.content.fullyQualifiedName} from JSON.
         */
        `;
          if (isEmpty) {
            result += `decodeJSON: function(_json${printIfTypescript(
              `?: string`
            )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
            return {};`;
          } else {
            result += `decodeJSON: function(json${printIfTypescript(
              `: string`
            )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
          return ${node.content.fullyQualifiedName}._readMessageJSON(${
              node.content.fullyQualifiedName
            }.initialize(), JSON.parse(json));`;
          }
          result += "},\n\n";

          // initialize
          result += `\
        /**
         * Initializes a ${
           node.content.fullyQualifiedName
         } with all fields set to their default value.
         */
        initialize: function()${printIfTypescript(
          `: ${node.content.fullyQualifiedName}`
        )} {
          return {
            ${node.content.fields
              .map((field) => {
                if (field.repeated) {
                  return `${field.name}: [],`;
                } else if (field.read === "readMessage" && !field.map) {
                  return `${field.name}: ${field.tsType}.initialize(),`;
                } else if (!field.optional) {
                  return `${field.name}: ${field.defaultValue},`;
                }
              })
              .join("")}
          };`;
          result += "},\n\n";
        }

        if (!isEmpty) {
          // decode (protobuf, internal)
          result += `\
        /**
         * @private
         */
        _writeMessage: function(msg${printIfTypescript(
          `: ${
            node.content.isMap
              ? `MapMessage<${node.content.fullyQualifiedName}>`
              : `Partial<${node.content.fullyQualifiedName}>`
          }`
        )}, writer${printIfTypescript(`: BinaryWriter`)})${printIfTypescript(
            `: BinaryWriter`
          )} {
          ${node.content.fields
            .map((field) => {
              let res = "";
              if (field.repeated) {
                res += `if (msg.${field.name}?.length) {`;
              } else if (field.optional) {
                res += `if (msg.${field.name} != undefined) {`;
              } else if (field.read === "readEnum") {
                res += `if (msg.${field.name} && ${field.tsType}ToInt(msg.${field.name})) {`;
              } else {
                res += `if (msg.${field.name}) {`;
              }

              if (field.read === "readMessage") {
                res += `writer.${field.write}(${field.index}, 
                  ${
                    field.map
                      ? toMapMessage(`msg.${field.name}`)
                      : `msg.${field.name}`
                  } ${
                  field.write === "writeRepeatedMessage"
                    ? printIfTypescript("as any")
                    : ""
                }, ${field.tsType}._writeMessage);`;
              } else {
                res += `writer.${field.write}(${field.index}, `;
                if (field.tsType === "bigint") {
                  if (field.repeated) {
                    res += `msg.${field.name}.map(x => x.toString())`;
                  } else {
                    res += `msg.${field.name}.toString()`;
                  }
                } else if (field.read === "readEnum") {
                  if (field.repeated) {
                    res += `msg.${field.name}.map(${field.tsType}ToInt)`;
                  } else {
                    res += `${field.tsType}ToInt(msg.${field.name})`;
                  }
                } else {
                  res += `msg.${field.name}`;
                }
                res += ");";
              }

              res += "}";
              return res;
            })
            .join("\n")}
            return writer;`;
          result += "},\n\n";

          // encode (json, internal)
          result += `\
        /**
         * @private
         */
        _writeMessageJSON: function(msg${printIfTypescript(
          `: ${
            node.content.isMap
              ? `MapMessage<${node.content.fullyQualifiedName}>`
              : `Partial<${node.content.fullyQualifiedName}>`
          }`
        )})${printIfTypescript(`: Record<string, unknown>`)} {
          const json${printIfTypescript(": Record<string, unknown>")} = {};
          ${node.content.fields
            .map((field) => {
              let res = "";
              let setField = "";
              if (config.json.useProtoFieldName) {
                setField = `json.${field.protoName}`;
              } else {
                setField =
                  // use brackets to protect against unsafe json_name (eg 'foo bar').
                  field.jsonName !== field.name
                    ? `json["${field.jsonName}"]`
                    : `json.${field.name}`;
              }

              if (!config.json.emitFieldsWithDefaultValues) {
                if (field.repeated) {
                  res += `if (msg.${field.name}?.length) {`;
                } else if (field.optional) {
                  res += `if (msg.${field.name} != undefined) {`;
                } else if (field.read === "readEnum") {
                  res += `if (msg.${field.name} && ${field.tsType}ToInt(msg.${field.name})) {`;
                } else {
                  res += `if (msg.${field.name}) {`;
                }
              }

              if (field.read === "readMessage") {
                if (field.repeated) {
                  res += `${setField} = msg.${field.name}.map(${field.tsType}._writeMessageJSON)`;
                } else {
                  if (field.map) {
                    res += `const ${field.name} = ${fromMapMessage(
                      `${toMapMessage(`msg.${field.name}`)}.map(${
                        field.tsType
                      }._writeMessageJSON)`
                    )};`;
                  } else {
                    res += `const ${field.name} = ${field.tsType}._writeMessageJSON(msg.${field.name});`;
                  }
                  res += `if (Object.keys(${field.name}).length > 0) {`;
                  res += `${setField} = ${field.name};`;
                  res += `}`;
                }
              } else if (field.tsType === "bigint") {
                if (field.repeated) {
                  res += `${setField} = msg.${field.name}.map(x => x.toString());`;
                } else {
                  res += `${setField} = msg.${field.name}.toString();`;
                }
              } else {
                res += `${setField} = msg.${field.name};`;
              }

              if (!config.json.emitFieldsWithDefaultValues) {
                res += "}";
              }

              return res;
            })
            .join("\n")}
          return json;`;
          result += "},\n\n";

          // decode (protobuf, internal)
          result += `\
        /**
         * @private
         */
        _readMessage: function(msg${printIfTypescript(
          `: ${
            node.content.isMap
              ? `MapMessage<${node.content.fullyQualifiedName}>`
              : `${node.content.fullyQualifiedName}`
          }`
        )}, reader${printIfTypescript(`: BinaryReader`)})${printIfTypescript(
            `: ${
              node.content.isMap
                ? `MapMessage<${node.content.fullyQualifiedName}>`
                : `${node.content.fullyQualifiedName}`
            }`
          )}{
          while (reader.nextField()) {
            const field = reader.getFieldNumber();
            switch (field) {
              ${node.content.fields
                .map((field) => {
                  let res = "";
                  res += `case ${field.index}: {`;
                  if (field.read === "readMessage") {
                    if (field.map) {
                      res += `
                      const ${field.name} = {}${printIfTypescript(
                        ` as MapMessage<${field.tsType}>`
                      )};
                      reader.readMessage(${field.name}, ${
                        field.tsType
                      }._readMessage);
                      msg.${field.name}[${field.name}.key] = ${
                        field.name
                      }.value;
                    `;
                    } else if (field.repeated) {
                      res += `const m = ${field.tsType}.initialize();`;
                      res += `reader.readMessage(m, ${field.tsType}._readMessage);`;
                      res += `msg.${field.name}.push(m);`;
                    } else {
                      res += `
                      reader.readMessage(${
                        node.content.isMap
                          ? `${field.tsType}.initialize()`
                          : `msg.${field.name}`
                      }, ${field.tsType}._readMessage);
                    `;
                    }
                  } else if (field.read === "readEnum") {
                    if (field.repeated) {
                      res += `msg.${field.name}.push(${field.tsType}FromInt(reader.${field.read}()));`;
                    } else {
                      res += `msg.${field.name} = ${field.tsType}FromInt(reader.${field.read}());`;
                    }
                  } else if (field.tsType === "bigint") {
                    if (field.repeated) {
                      res += `msg.${field.name}.push(BigInt(reader.${field.read}()));`;
                    } else {
                      res += `msg.${field.name} = BigInt(reader.${field.read}());`;
                    }
                  } else {
                    if (field.repeated) {
                      res += `msg.${field.name}.push(reader.${field.read}());`;
                    } else {
                      res += `msg.${field.name} = reader.${field.read}();`;
                    }
                  }
                  res += "break;\n}";
                  return res;
                })
                .join("\n")}
              default: {
                reader.skipField();
                break;
              }
            }
          }
          return msg;`;
          result += "},\n\n";

          // decode (json, internal)
          result += `\
        /**
         * @private
         */
        _readMessageJSON: function(msg${printIfTypescript(
          `: ${
            node.content.isMap
              ? `MapMessage<${node.content.fullyQualifiedName}>`
              : `${node.content.fullyQualifiedName}`
          }`
        )}, json${printIfTypescript(`: any`)})${printIfTypescript(
            `: ${
              node.content.isMap
                ? `MapMessage<${node.content.fullyQualifiedName}>`
                : `${node.content.fullyQualifiedName}`
            }`
          )}{
          ${node.content.fields
            .map((field) => {
              let res = "";
              const name = `_${field.name}`;
              let getField;
              if (
                field.name === field.jsonName &&
                field.name === field.protoName
              ) {
                getField = `json.${field.name}`;
              } else if (field.jsonName !== field.name) {
                getField = `json["${field.jsonName}"] ?? json.${field.protoName}`;
              } else {
                getField = `json.${field.name} ?? json.${field.protoName}`;
              }

              res += `const ${name} = ${getField};`;
              res += `if (${name}) {`;
              if (field.read === "readMessage") {
                if (field.map) {
                  res += `msg.${field.name} = ${fromMapMessage(
                    `${toMapMessage(name)}.map(${
                      field.tsType
                    }._readMessageJSON)`
                  )};`;
                } else if (field.repeated) {
                  res += `for (const item of ${name}) {`;
                  res += `const m = ${field.tsType}.initialize();`;
                  res += `${field.tsType}._readMessageJSON(m, item);`;
                  res += `msg.${field.name}.push(m);`;
                  res += `}`;
                } else {
                  res += `const m = ${field.tsType}.initialize();`;
                  res += `${field.tsType}._readMessageJSON(m, ${name});`;
                  res += `msg.${field.name} = m;`;
                }
              } else if (field.tsType === "bigint") {
                if (field.repeated) {
                  res += `msg.${field.name} = ${name}.map(BigInt);`;
                } else {
                  res += `msg.${field.name} = BigInt(${name});`;
                }
              } else {
                res += `msg.${field.name} = ${name};`;
              }
              res += "}";
              return res;
            })
            .join("\n")}
          return msg;`;
          result += "},\n\n";
        }
        result += writeSerializers(node.children, false);
        result += `}${isTopLevel ? ";" : ","}\n\n`;
        break;
      }

      case "enum": {
        // constant map
        node.content.values.forEach(({ name, comments }) => {
          if (comments?.leading) {
            result += printComments(comments?.leading);
          }
          result += `${name}: '${name}',\n`;
        });
        result += `} ${printIfTypescript("as const")}${
          isTopLevel ? ";" : ","
        }\n\n`;

        // to enum
        result += isTopLevel
          ? `const ${node.content.name}FromInt = `
          : `${node.content.name}FromInt: `;
        result += `function(i${printIfTypescript(
          ": number"
        )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
          switch (i) {
        `;
        node.content.values.forEach(({ name, value }) => {
          result += `case ${value}: { return '${name}'; }\n`;
        });

        result += `// unknown values are preserved as numbers. this occurs when new enum values are introduced and the generated code is out of date.
        default: { return i${printIfTypescript(
          ` as unknown as ${node.content.fullyQualifiedName}`
        )}; }\n }\n }`;
        if (!isTopLevel) {
          result += ",";
        }
        result += "\n\n";

        // from enum
        result += isTopLevel
          ? `const ${node.content.name}ToInt = `
          : `${node.content.name}ToInt: `;
        result += `function(i${printIfTypescript(
          `: ${node.content.fullyQualifiedName}`
        )})${printIfTypescript(`: number`)} {
          switch (i) {
        `;
        node.content.values.forEach(({ name, value }) => {
          result += `case '${name}': { return ${value}; }\n`;
        });

        result += `// unknown values are preserved as numbers. this occurs when new enum values are introduced and the generated code is out of date.
        default: { return i${printIfTypescript(
          ` as unknown as number`
        )}; }\n }\n }`;
        if (!isTopLevel) {
          result += ",";
        }
        result += "\n\n";

        break;
      }
      default: {
        const _exhaust: never = node;
        return _exhaust;
      }
    }
  });
  return result;
}

/**
 * Escapes '*''/' which otherwise would terminate the block comment.
 */
function escapeComment(comment: string): string {
  return comment.replace(/\*\//g, "*" + "\\" + "/");
}

function printComments(comment: string): string {
  const lines = escapeComment(comment).split("\n");
  return `\
    /**
     *${lines.slice(0, -1).join("\n *") + lines.slice(-1).join(" *")}
     */
      `;
}

export function printHeading(heading: string): string {
  const width = Math.max(40, heading.length + 2);
  const padding = (width - heading.length) / 2;
  return `\
  //${"=".repeat(width)}//
  //${" ".repeat(Math.floor(padding))}${heading}${" ".repeat(
    Math.ceil(padding)
  )}//
  //${"=".repeat(width)}//
  
  `;
}

// Foo.Bar.Baz => baz
function formatParameterName(param: string): string {
  return lowerCase(param.split(".").pop() ?? "");
}

function writeClients(
  services: Service[],
  packageName: string | undefined
): string {
  let result = "";

  services.forEach((service) => {
    result += printHeading(`${service.name} Protobuf Client`);

    service.methods.forEach((method) => {
      if (method.comments?.leading) {
        result += printComments(method.comments.leading);
      }
      const input = formatParameterName(method.input ?? "");
      const path = `/${packageName ? packageName + "." : ""}${service.name}/${
        method.name
      }`;

      result += `\
export async function ${method.name}(${input}${printIfTypescript(
        `: ${method.input}`
      )}, config${printIfTypescript(
        `?: ClientConfiguration`
      )})${printIfTypescript(`: Promise<${method.output}>`)} {
  const response = await PBrequest('${path}', ${
        method.input
      }.encode(${input}), config);
  return ${method.output}.decode(response);
}

`;
    });
  });

  services.forEach((service) => {
    result += printHeading(`${service.name} JSON Client`);

    service.methods.forEach((method) => {
      if (method.comments?.leading) {
        result += printComments(method.comments.leading);
      }
      const input = formatParameterName(method.input ?? "");
      const path = `/${packageName ? packageName + "." : ""}${service.name}/${
        method.name
      }`;

      result += `\
export async function ${method.name}JSON(${input}${printIfTypescript(
        `: ${method.input}`
      )}, config${printIfTypescript(
        `?: ClientConfiguration`
      )})${printIfTypescript(`: Promise<${method.output}>`)} {
  const response = await JSONrequest${printIfTypescript(
    `<${method.output}>`
  )}('${path}', ${input}, config);
  return response;
}

`;
    });
  });

  return result;
}

function writeServers(
  services: Service[],
  packageName: string | undefined
): string {
  let result = "";

  services.forEach((service) => {
    // print service types
    if (config.isTS) {
      result += printHeading(`${service.name}`);

      if (service.comments?.leading) {
        result += printComments(service.comments.leading);
      }
      result += `export interface ${service.name}<Context = unknown> {\n`;
      service.methods.forEach((method) => {
        if (method.comments?.leading) {
          result += printComments(method.comments.leading);
        }
        const input = formatParameterName(method.input ?? "");
        result += `${method.name}: (${input}: ${method.input}, context: Context) => Promise<${method.output}> | ${method.output};\n`;
      });
      result += "}\n";
    }

    result += "\n";

    result += `export function create${service.name}${printIfTypescript(
      "<Context>"
    )}(service${printIfTypescript(`: ${service.name}<Context>`)}) { return {
    name: '${[packageName, service.name].filter(Boolean).join(".")}',
    methods: {\n`;
    service.methods.forEach((method) => {
      result += `${method.name}: { name: '${method.name}', handler: service.${method.name}, input: ${method.input}, output: ${method.output} },`;
    });
    result += "}\n";
    result += `} ${printIfTypescript("as const")}\n`;
    result += "}\n";
    result += "\n";
  });

  return result;
}

let config = {
  isTS: false,
  json: {
    emitFieldsWithDefaultValues: false,
    useProtoFieldName: false,
  },
};

function printIfTypescript(str: string): string {
  return printIf(config.isTS, str);
}

function printIf(cond: boolean, str: string): string {
  return cond ? str : "";
}

export function generate(
  fileDescriptorProto: FileDescriptorProto,
  identifierTable: IdentifierTable,
  options: Pick<UserConfig, "language" | "json">
): string {
  config = {
    isTS: options.language === "typescript",
    json: options.json as any,
  };

  const { imports, services, types, packageName } = processTypes(
    fileDescriptorProto,
    identifierTable,
    config.isTS
  );
  const sourceFile = fileDescriptorProto.getName();
  if (!sourceFile) {
    return "";
  }

  const hasServices = services.length > 0;
  const hasTypes = types.length > 0;
  const hasNonEmptySerializer = !!types.find(
    (x) => x.type === "message" && x.content.fields.length > 0
  );

  const typeDefinitions =
    hasTypes && config.isTS ? writeTypes(types, true) : "";

  return `\
// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: ${sourceFile}


${printIf(
  config.isTS && (hasServices || hasTypes),
  `import type {
    ${printIf(hasTypes, "ByteSource,\n")}
    ${printIf(hasMaps, "MapMessage,\n")}
    ${printIf(hasServices, "ClientConfiguration")}} from 'twirpscript';`
)}
${printIf(
  hasServices || hasNonEmptySerializer,
  `import {
  ${printIf(hasNonEmptySerializer, "BinaryReader,\nBinaryWriter,\n")}
  ${printIf(hasServices, "JSONrequest,\nPBrequest")}} from 'twirpscript';`
)}
  ${printIf(
    hasServices,
    `\
// This is the minimum version supported by the current runtime.
// If this line fails typechecking, breaking changes have been introduced and this
// file needs to be regenerated by running \`yarn twirpscript\`.
export { ${RUNTIME_MIN_CODE_GEN_SUPPORTED_VERSION} } from "twirpscript";`
  )}

${imports
  .map(
    ({ identifiers, path }) =>
      `import { ${identifiers.join(", ")} } from '${path}';`
  )
  .join("\n")}

${writeClients(services, packageName)}

${writeServers(services, packageName)}

${printIf(
  hasTypes,
  `${printIfTypescript(printHeading("Types"))}
${typeDefinitions}
${printHeading("Protobuf Encode / Decode")}
${writeSerializers(types, true)}`
)}
`;
}
