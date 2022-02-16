import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import {
  lowerCase,
  IdentifierTable,
  ProtoTypes,
  Service,
  processTypes,
  MessageType,
} from "../utils";
import { RUNTIME_MIN_CODE_GEN_SUPPORTED_VERSION } from "../runtimeCodegenCompat";

function writeTypes(types: ProtoTypes[]): string {
  let result = "";

  types.forEach((node) => {
    const name = node.content.name;
    if (node.content.comments?.leading) {
      result += printComments(node.content.comments?.leading);
    }
    if (node.type === "enum") {
      result += `export type ${name} = typeof ${node.content.fullyQualifiedName}[keyof typeof ${node.content.fullyQualifiedName}];\n\n`;
    } else {
      // map type is inlined
      if (node.content.isMap) {
        return;
      }
      result += `export interface ${name} {\n`;
      node.content.fields.forEach(
        ({ name: fieldName, tsType, repeated, optional, comments }) => {
          if (comments?.leading) {
            result += printComments(comments?.leading);
          }

          const maybeMap = node.children.find(
            (c) => c.content.fullyQualifiedName === tsType
          ) as MessageType;

          let _type = tsType;
          if (maybeMap?.content?.isMap) {
            _type = `Record<
              ${maybeMap.content.fields[0].tsType},
              ${maybeMap.content.fields[1].tsType} | undefined>`;
          }

          result += `${fieldName}${optional ? "?" : ""}: ${_type}${
            repeated ? "[]" : ""
          };\n`;
        }
      );
      result += "}\n\n";

      if (
        node.children.filter((x) => !(x.type === "message" && x.content.isMap))
          .length > 0
      ) {
        result += `export namespace ${name} { \n`;
        result += writeTypes(node.children) + "\n\n";
        result += `}\n\n`;
      }
    }
  });

  return result;
}

function writeSerializers(types: ProtoTypes[], isTopLevel = true): string {
  let result = "";

  types.forEach((node) => {
    result += isTopLevel
      ? `export const ${node.content.name} = {`
      : `${node.content.name}: {`;

    switch (node.type) {
      case "message": {
        const isEmpty = node.content.fields.length === 0;

        result += `\
        /**
         * Serializes a ${node.content.fullyQualifiedName} to protobuf.
         */
        ${printIf(
          !isEmpty,
          `encode: function(${lowerCase(node.content.name)}${printIfTypescript(
            `: Partial<${node.content.fullyQualifiedName}>`
          )})${printIfTypescript(`: Uint8Array`)} {
          return ${node.content.fullyQualifiedName}._writeMessage(${lowerCase(
            node.content.name
          )}, new BinaryWriter()).getResultBuffer();
        },`
        )}
        ${printIf(
          isEmpty,
          `encode: function(_${lowerCase(node.content.name)}${printIfTypescript(
            `?: Partial<${node.content.fullyQualifiedName}>`
          )})${printIfTypescript(`: Uint8Array`)} {
            return new Uint8Array();
        },`
        )}

        /**
         * Deserializes a ${node.content.fullyQualifiedName} from protobuf.
         */
        ${printIf(
          !isEmpty,
          `decode: function(bytes${printIfTypescript(
            `: ByteSource`
          )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
          return ${node.content.fullyQualifiedName}._readMessage(${
            node.content.fullyQualifiedName
          }.initialize(), new BinaryReader(bytes));
        },`
        )}
        ${printIf(
          isEmpty,
          `decode: function(_bytes${printIfTypescript(
            `?: ByteSource`
          )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
            return {};
        },`
        )}

        /**
         * Serializes a ${node.content.fullyQualifiedName} to JSON.
         */
        ${printIf(
          !isEmpty,
          `encodeJSON: function(${lowerCase(
            node.content.name
          )}${printIfTypescript(
            `: Partial<${node.content.fullyQualifiedName}>`
          )})${printIfTypescript(`: string`)} {
          return JSON.stringify(${
            node.content.fullyQualifiedName
          }._writeMessageJSON(${lowerCase(node.content.name)}));
        },`
        )}
        ${printIf(
          isEmpty,
          `encodeJSON: function(_${lowerCase(
            node.content.name
          )}${printIfTypescript(
            `?: Partial<${node.content.fullyQualifiedName}>`
          )})${printIfTypescript(`: string`)} {
            return "{}";
        },`
        )}

        /**
         * Deserializes a ${node.content.fullyQualifiedName} from JSON.
         */
        ${printIf(
          !isEmpty,
          `decodeJSON: function(json${printIfTypescript(
            `: string`
          )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
          return ${node.content.fullyQualifiedName}._readMessageJSON(${
            node.content.fullyQualifiedName
          }.initialize(), JSON.parse(json));
        },`
        )}
        ${printIf(
          isEmpty,
          `decodeJSON: function(_json${printIfTypescript(
            `?: string`
          )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
            return {};
        },`
        )}

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
                } else if (field.read === "readMessage") {
                  return `${field.name}: ${field.tsType}.initialize(),`;
                } else if (!field.optional) {
                  return `${field.name}: ${field.defaultValue},`;
                }
              })
              .join("")}
          };
        },

        ${printIf(
          !isEmpty,
          `/**
         * @private
         */
        _writeMessage: function(msg ${printIfTypescript(
          `: Partial<${node.content.fullyQualifiedName}>`
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
              } else {
                res += `if (msg.${field.name}) {`;
              }

              if (field.read === "readMessage") {
                res += `writer.${field.write}(${field.index}, msg.${
                  field.name
                } ${field.repeated ? printIfTypescript("as any") : ""}, ${
                  field.tsType
                }._writeMessage);`;
              } else if (field.read === "map") {
                const map = node.children.find(
                  (c) => c.content.fullyQualifiedName === field.tsType
                ) as MessageType;
                res += `for (const [key, value] of Object.entries(msg.${field.name})) {
                  if (value) {
                    writer.writeMessage(${field.index}, {}, (_, mapWriter) => {
                `;
                const [key, value] = map.content.fields;
                res += `mapWriter.${key.write}(1, key ${printIfTypescript(
                  `as any`
                )});`;
                if (value.read === "readMessage") {
                  res += `mapWriter.${value.write}(2, value, ${value.tsType}._writeMessage);`;
                } else if (value.read === "readEnum") {
                  res += `mapWriter.${value.write}(2, value ${printIfTypescript(
                    `as ${value.tsType}`
                  )});`;
                } else if (value.tsType === "bigint") {
                  res += `mapWriter.${value.write}(2, value.toString());`;
                } else {
                  res += `mapWriter.${value.write}(2, value);`;
                }
                res += "})\n}}";
              } else {
                res += `writer.${field.write}(${field.index}, msg.${
                  field.name
                }${printIf(field.tsType === "bigint", ".toString()")});`;
              }

              res += "}";
              return res;
            })
            .join("\n")}
            return writer;
        },`
        )}

        ${printIf(
          !isEmpty,
          `/**
         * @private
         */
        _writeMessageJSON: function(msg ${printIfTypescript(
          `: Partial<${node.content.fullyQualifiedName}>`
        )})${printIfTypescript(`: Record<string, unknown>`)} {
          const json${printIfTypescript(": Record<string, unknown>")} = {};
          ${node.content.fields
            .map((field) => {
              let res = "";
              const setField =
                field.jsonName !== field.name
                  ? `json["${field.jsonName}"]`
                  : `json.${field.name}`;

              if (field.repeated) {
                res += `if (msg.${field.name}?.length) {`;
              } else if (field.optional) {
                res += `if (msg.${field.name} != undefined) {`;
              } else {
                res += `if (msg.${field.name}) {`;
              }

              if (field.read === "readMessage") {
                if (field.repeated) {
                  res += `${setField} = msg.${field.name}.map(${field.tsType}._writeMessageJSON)`;
                } else {
                  res += `const ${field.name} = ${field.tsType}._writeMessageJSON(msg.${field.name});`;
                  res += `if (Object.keys(${field.name}).length > 0) {`;
                  res += `${setField} = ${field.name};`;
                  res += `}`;
                }
              } else if (field.read === "map") {
                const map = node.children.find(
                  (c) => c.content.fullyQualifiedName === field.tsType
                ) as MessageType;
                res += `const map${printIfTypescript(
                  `: Record<string, unknown>`
                )} = {};`;
                res += `for (const [key, value] of Object.entries(msg.${field.name})) {
                  if (value) {`;
                const [_key, value] = map.content.fields;
                res += `map[key] =`;
                if (value.read === "readMessage") {
                  res += `${value.tsType}._writeMessageJSON(value);`;
                } else if (value.read === "readEnum") {
                  res += `value;`;
                } else if (value.tsType === "bigint") {
                  res += `value.toString();`;
                } else {
                  res += `value;`;
                }
                res += `${setField} = map`;
                res += "}\n}";
              } else if (field.tsType === "bigint") {
                if (field.repeated) {
                  res += `${setField} = msg.${field.name}.map(x => x.toString());`;
                } else {
                  res += `${setField} = msg.${field.name}.toString();`;
                }
              } else {
                res += `${setField} = msg.${field.name};`;
              }

              res += "}";
              return res;
            })
            .join("\n")}
          return json;
        },`
        )}
        
        ${printIf(
          !isEmpty,
          `/**
         * @private
         */
        _readMessage: function(msg${printIfTypescript(
          `: ${node.content.fullyQualifiedName}`
        )}, reader${printIfTypescript(`: BinaryReader`)})${printIfTypescript(
            `: ${node.content.fullyQualifiedName} `
          )}{
          while (reader.nextField()) {
            const field = reader.getFieldNumber();
            switch (field) {
              ${node.content.fields
                .map((field) => {
                  let res = "";
                  res += `case ${field.index}: {`;
                  if (field.read == "map") {
                    const map = node.children.find(
                      (c) => c.content.fullyQualifiedName === field.tsType
                    ) as MessageType;
                    const [key, value] = map.content.fields;
                    res += `reader.readMessage(undefined, () => {
                      let key${printIfTypescript(
                        `: ${key.tsType} | undefined`
                      )};
                      let value = ${value.defaultValue};
                      while (reader.nextField()) {
                        const field = reader.getFieldNumber();
                        switch (field) {
                          case 1: {
                            key = reader.${key.read}();
                            break;
                          }
                          case 2: {
                        `;
                    if (value.read === "readMessage") {
                      res += `reader.readMessage(${value.tsType}.initialize(), ${value.tsType}._readMessage);`;
                    } else if (value.read === "readEnum") {
                      res += `value = reader.${value.read}()${printIfTypescript(
                        ` as ${value.tsType}`
                      )};`;
                    } else if (value.tsType === "bigint") {
                      res += `value = BigInt(reader.${value.read}());`;
                    } else {
                      res += `value = reader.${value.read}();`;
                    }

                    res += `break;
                          }
                        }
                      }
                      if (key) {
                        msg.${field.name}[key] = value;
                      }
                    });`;
                  } else if (field.read === "readMessage") {
                    if (field.repeated) {
                      res += `const m = ${field.tsType}.initialize();`;
                      res += `reader.readMessage(m, ${field.tsType}._readMessage);`;
                      res += `msg.${field.name}.push(m);`;
                    } else {
                      res += `
                      reader.readMessage(msg.${field.name}, ${field.tsType}._readMessage);
                    `;
                    }
                  } else if (field.read === "readEnum") {
                    if (field.repeated) {
                      res += `msg.${field.name}.push(reader.${
                        field.read
                      }() ${printIfTypescript(`as ${field.tsType}`)});`;
                    } else {
                      res += `msg.${field.name} = reader.${
                        field.read
                      }() ${printIfTypescript(`as ${field.tsType}`)};`;
                    }
                  } else if (field.tsType === "bigint") {
                    if (field.repeated) {
                      res += `msg.${field.name} = reader.${field.read}().map(BigInt);`;
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
          return msg;
        },`
        )}

        ${printIf(
          !isEmpty,
          `/**
         * @private
         */
        _readMessageJSON: function(msg${printIfTypescript(
          `: ${node.content.fullyQualifiedName}`
        )}, json${printIfTypescript(`: any`)})${printIfTypescript(
            `: ${node.content.fullyQualifiedName} `
          )}{
          ${node.content.fields
            .map((field) => {
              let res = "";
              const name = field.name;
              let getField =
                field.jsonName !== field.name
                  ? `json["${field.jsonName}"] ?? json.${field.protoName}`
                  : `json.${field.name} ?? json.${field.protoName}`;

              res += `const ${name} = ${getField};`;
              res += `if (${name}) {`;
              if (field.read == "map") {
                const map = node.children.find(
                  (c) => c.content.fullyQualifiedName === field.tsType
                ) as MessageType;
                const [_key, value] = map.content.fields;
                res += `for (const [key, value] of Object.entries${printIfTypescript(
                  `<${value.tsType}>`
                )}(${name})) {`;
                res += `msg.${name}[key] =`;
                if (value.read === "readMessage") {
                  res += `${value.tsType}._readMessageJSON(${value.tsType}.initialize(), value);`;
                } else if (value.read === "readEnum") {
                  res += `value;`;
                } else if (value.tsType === "bigint") {
                  res += `BigInt(value);`;
                } else {
                  res += `value;`;
                }
                res += "}";
              } else if (field.read === "readMessage") {
                if (field.repeated) {
                  res += `for (const item of ${name}) {`;
                  res += `const m = ${field.tsType}.initialize();`;
                  res += `${field.tsType}._readMessageJSON(m, item);`;
                  res += `msg.${name}.push(m);`;
                  res += `}`;
                } else {
                  res += `const m = ${field.tsType}.initialize();`;
                  res += `${field.tsType}._readMessageJSON(m, ${name});`;
                  res += `msg.${name} = m;`;
                }
              } else if (field.tsType === "bigint") {
                if (field.repeated) {
                  res += `msg.${name} = ${name}.map(BigInt);`;
                } else {
                  res += `msg.${name} = BigInt(${name});`;
                }
              } else {
                res += `msg.${name} = ${name};`;
              }
              res += "}";
              return res;
            })
            .join("\n")}
          return msg;
        },`
        )}

      `;
        const childrenWithouMaps = node.children.filter(
          (x) => x.type !== "message" || !x.content.isMap
        );

        if (childrenWithouMaps.length > 0) {
          result += writeSerializers(childrenWithouMaps, false);
        }
        result += `}${isTopLevel ? ";" : ","}\n\n`;
        break;
      }

      case "enum": {
        node.content.values.forEach(({ name, value, comments }) => {
          if (comments?.leading) {
            result += printComments(comments?.leading);
          }
          result += `${name}: ${value},\n`;
        });
        result += `} ${printIfTypescript("as const")}${
          isTopLevel ? ";" : ","
        }\n\n`;
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
  return comment.replace("*/", "*" + "\\" + "/");
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
    if (isTS) {
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

let isTS = false;
function printIfTypescript(str: string): string {
  return printIf(isTS, str);
}

function printIf(cond: boolean, str: string): string {
  return cond ? str : "";
}

export function generate(
  fileDescriptorProto: FileDescriptorProto,
  identifierTable: IdentifierTable,
  isTypescript: boolean
): string {
  isTS = isTypescript;

  const { imports, services, types, packageName } = processTypes(
    fileDescriptorProto,
    identifierTable,
    isTypescript
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

  return `\
// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: ${sourceFile}


${printIf(
  isTS && (hasServices || hasTypes),
  `import type {
    ${printIf(hasTypes, "ByteSource,\n")}
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
${printIfTypescript(writeTypes(types))}
${printHeading("Protobuf Encode / Decode")}
${writeSerializers(types)}`
)}
`;
}
