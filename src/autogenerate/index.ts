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

const pkg = require("../../package.json");

function writeTypes(types: ProtoTypes[]): string {
  let result = "";

  types.forEach((node) => {
    const name = node.content.name;
    if (node.content.comments?.leading) {
      result += printComments(node.content.comments?.leading);
    }
    if (node.type === "enum") {
      result += `export type ${name} = typeof ${node.content.fullyQualifiedName}[keyof typeof ${node.content.fullyQualifiedName}];\n\n`;
    } else if (node.type === "message" && node.content.isMap) {
      result += `export type ${name} = Record<
        ${node.content.fields[0].tsType},
        ${node.content.fields[1].tsType} | undefined>;`;
      result += `\n\n`;
    } else {
      result += `export interface ${name} {\n`;
      node.content.fields.forEach(
        ({ name: fieldName, tsType, repeated, optional, comments }) => {
          if (comments?.leading) {
            result += printComments(comments?.leading);
          }
          result += `${fieldName}${optional ? "?" : ""}: ${tsType}${
            repeated ? "[]" : ""
          };\n`;
        }
      );
      result += "}\n\n";

      if (node.children.length > 0) {
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
        result += `
        writeMessage: function(msg ${printIfTypescript(
          `: ${node.content.fullyQualifiedName}`
        )}, writer${printIfTypescript(`: BinaryWriter`)})${printIfTypescript(
          `: void`
        )} {
          ${node.content.fields
            .map((field) => {
              let res = "";
              if (field.repeated) {
                res += `if (msg.${field.name}.length > 0) {`;
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
                }.writeMessage);`;
              } else if (field.read === "map") {
                const map = node.children.find(
                  (c) => c.content.fullyQualifiedName === field.tsType
                ) as MessageType;
                res += `for (const key in msg.${field.name}) {
                  writer.writeMessage(${field.index}, {}, (_, mapWriter) => {
                    mapWriter.${map.content.fields[0].write}(1, key as any);
                    mapWriter.${map.content.fields[1].write}(2, msg.foo[key]);
                  });
                }`;
              } else {
                res += `writer.${field.write}(${field.index}, msg.${field.name});`;
              }

              res += "}";
              return res;
            })
            .join("\n")}
        },
        
        encode: function(${lowerCase(node.content.name)}${printIfTypescript(
          `: ${node.content.fullyQualifiedName}`
        )})${printIfTypescript(`: Uint8Array`)} {
          const writer = new BinaryWriter();
          ${node.content.fullyQualifiedName}.writeMessage(${lowerCase(
          node.content.name
        )}, writer);
          return writer.getResultBuffer();
        },

        readMessage: function(msg${printIfTypescript(
          `: Partial<${node.content.fullyQualifiedName}>`
        )}, reader${printIfTypescript(`: BinaryReader`)})${printIfTypescript(
          ": void "
        )}{
          ${node.content.fields
            .map((field) => {
              if (field.repeated) {
                return `msg.${field.name} = [];`;
              } else if (field.read === "map") {
                return `msg.${field.name} = {};`;
              }
            })
            .filter(Boolean)
            .join("\n")}
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
                    res += `reader.readMessage(undefined, () => {
                      let key: ${map.content.fields[0].tsType};
                      let value: ${map.content.fields[1].tsType};
                      while (reader.nextField()) {
                        const field = reader.getFieldNumber();
                        switch (field) {
                          case 1: {
                            key = reader.${map.content.fields[0].read}();
                            break;
                          }
                          case 2: {
                            value = reader.${map.content.fields[1].read}();
                            break;
                          }
                        }
                      }
                      msg.${field.name}![key!] = value!;
                    });`;
                  } else if (field.read === "readMessage") {
                    res += `
                    const message = {};
                    reader.readMessage(message, ${field.tsType}.readMessage);
                  `;
                    if (field.repeated) {
                      res += `msg.${field.name}.push(message${printIfTypescript(
                        ` as ${field.tsType}`
                      )});`;
                    } else {
                      res += `msg.${field.name} = message ${printIfTypescript(
                        `as ${field.tsType}`
                      )};`;
                    }
                  } else {
                    if (field.repeated) {
                      res += `msg.${field.name}.push(reader.${field.read}() ${
                        field.read === "readEnum"
                          ? printIfTypescript(`as ${field.tsType}`)
                          : ""
                      });`;
                    } else {
                      res += `msg.${field.name} = reader.${field.read}() ${
                        field.read === "readEnum"
                          ? printIfTypescript(`as ${field.tsType}`)
                          : ""
                      };`;
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
          ${node.content.fields
            .map(
              (field) => `\
                ${
                  !field.repeated && !field.optional
                    ? `if (!msg.${field.name}) {
                      msg.${field.name} = ${
                        field.read === "readMessage"
                          ? `${field.tsType}.defaultValue();`
                          : field.defaultValue
                      };
                    }
                    `
                    : ""
                }`
            )
            .join("")}
        },

        decode: function(bytes${printIfTypescript(
          `: ByteSource`
        )})${printIfTypescript(`: ${node.content.fullyQualifiedName}`)} {
          const reader = new BinaryReader(bytes);
          const message = {};
          ${node.content.fullyQualifiedName}.readMessage(message, reader);
          return message ${printIfTypescript(
            `as ${node.content.fullyQualifiedName}`
          )};
        },

        defaultValue: function()${printIfTypescript(
          `: ${node.content.fullyQualifiedName}`
        )} {
          return {
            ${node.content.fields
              .map((field) => {
                if (field.repeated) {
                  return `${field.name}: [],`;
                } else if (field.read === "readMessage") {
                  return `${field.name}: ${field.tsType}.defaultValue(),`;
                } else if (!field.optional) {
                  return `${field.name}: ${field.defaultValue},`;
                }
              })
              .join("")}
          };
        },

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

function printComments(comment: string): string {
  const lines = comment.split("\n");
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
      result += printHeading(`${service.name} Service`);

      if (service.comments?.leading) {
        result += printComments(service.comments.leading);
      }
      result += `export interface ${service.name}Service<Context = unknown> {\n`;
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

    result += `export function create${service.name}Handler${printIfTypescript(
      "<Context>"
    )}(service${printIfTypescript(
      `: ${service.name}Service<Context>`
    )}) { return {
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
  return isTS ? str : "";
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

  return `\
// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Generated by TwirpScript v${pkg.version}
// Source: ${sourceFile}

${printIfTypescript(
  `import type { ByteSource ${
    hasServices ? ", ClientConfiguration" : ""
  }} from 'twirpscript';`
)};
import {
  BinaryReader,
  BinaryWriter
  ${
    hasServices
      ? `,\nJSONrequest,\nPBrequest,
// This is the minimum version supported by the current runtime.
// If this line fails typechecking, breaking changes have been introduced and this
// file needs to be regenerated by running \`yarn twirpscript\`.
\n${RUNTIME_MIN_CODE_GEN_SUPPORTED_VERSION}`
      : ""
  }} from 'twirpscript';

${imports
  .map(
    ({ identifiers, path }) =>
      `import { ${identifiers.join(", ")} } from '${path}';`
  )
  .join("\n")}

${writeClients(services, packageName)}

${writeServers(services, packageName)}

${printIfTypescript(printHeading("Types"))}
${printIfTypescript(writeTypes(types))}

${printHeading("Protobuf Encode / Decode")}
${writeSerializers(types)}
`;
}
