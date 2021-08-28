import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import {
  lowerCase,
  IdentifierTable,
  ProtoTypes,
  Service,
  processTypes,
} from "./utils";

function writeTypes(types: ProtoTypes[]): string {
  let result = "";

  types.forEach((node) => {
    if (node.content.comments?.leading) {
      result += printComments(node.content.comments?.leading);
    }
    if (node.type === "enum") {
      result += `export enum ${node.content.name} {\n`;
      node.content.values.forEach(({ name, value, comments }) => {
        if (comments?.leading) {
          result += printComments(comments?.leading);
        }
        result += `${name} = ${value},\n`;
      });
      result += "}\n\n";
    } else {
      result += `export interface ${node.content.name} {\n`;
      node.content.fields.forEach(({ name, tsType, repeated, comments }) => {
        if (comments?.leading) {
          result += printComments(comments?.leading);
        }
        result += `${name}: ${tsType}${repeated ? "[]" : ""};\n`;
      });
      result += "}\n\n";

      if (node.children.length > 0) {
        result += `export namespace ${node.content.name} { \n`;
        result += writeTypes(node.children) + "\n\n";
        result += `}\n\n`;
      }
    }
  });

  return result;
}

function writeSerializers(types: ProtoTypes[]): string {
  let result = "";

  types.forEach((node) => {
    if (node.type === "message") {
      result += `export namespace ${node.content.name} {`;
      result += `
        export function writeMessage(msg: ${
          node.content.fullyQualifiedName
        }, writer: BinaryWriter): void {
          ${node.content.fields
            .map(
              (field) => `\
                ${
                  field.repeated
                    ? `if (msg.${field.name}.length > 0) {`
                    : `if (msg.${field.name}) {`
                }
                ${
                  field.read === "readMessage"
                    ? `writer.${field.write}(${field.index}, msg.${
                        field.name
                      } ${field.repeated ? "as any" : ""}, ${
                        field.tsType
                      }.writeMessage);`
                    : `writer.${field.write}(${field.index}, msg.${field.name});`
                }
                }`
            )
            .join("\n")}
        }
        
        export function encode(${lowerCase(node.content.name)}: ${
        node.content.fullyQualifiedName
      }): Uint8Array {
          const writer = new BinaryWriter();
          writeMessage(${lowerCase(node.content.name)}, writer);
          return writer.getResultBuffer();
        };

        export function readMessage(msg: Partial<${
          node.content.fullyQualifiedName
        }>, reader: BinaryReader): void {
          ${node.content.fields
            .filter(({ repeated }) => repeated)
            .map((field) => `msg.${field.name} = [];`)
            .join("\n")}
          while (reader.nextField()) {
            if (reader.isEndGroup()) {
              break;
            }
            const field = reader.getFieldNumber();
            switch (field) {
              ${node.content.fields
                .map(
                  (field) => `\
              case ${field.index}: {
                ${
                  field.read === "readMessage"
                    ? `\
                  const message = {};
                  reader.readMessage(message, ${field.tsType}.readMessage);
                  ${
                    field.repeated
                      ? `msg.${field.name}.push(message as ${field.tsType});`
                      : `msg.${field.name} = message as ${field.tsType};`
                  }`
                    : `${
                        field.repeated
                          ? `msg.${field.name}.push(reader.${field.read}());`
                          : `msg.${field.name} = reader.${field.read}();`
                      }`
                }
                break;
              }`
                )
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
                  !field.repeated && field.read !== "readMessage"
                    ? `if (!msg.${field.name}) {
                      msg.${field.name} = ${field.defaultValue};
                    }
                    `
                    : ""
                }`
            )
            .join("")}
        }

        export function decode(bytes: ByteSource): ${
          node.content.fullyQualifiedName
        } {
          const reader = new BinaryReader(bytes);
          const message = {};
          readMessage(message, reader);
          return message as ${node.content.fullyQualifiedName};
        };
      `;
      if (node.children.length > 0) {
        result += writeSerializers(node.children);
      }
      result += "}\n\n";
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

function printHeading(heading: string): string {
  const width = 40;
  const padding = (width - heading.length) / 2;
  return `\
  //${"=".repeat(width)}//
  //${" ".repeat(Math.floor(padding))}${heading}${" ".repeat(
    Math.ceil(padding)
  )}//
  //${"=".repeat(width)}//
  
  `;
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
      const input = lowerCase(method.input ?? "");
      const url = `/twirp/${packageName ? packageName + "." : ""}${
        service.name
      }/${method.name}`;

      result += `\
export async function ${method.name}(url: string, ${input}: ${method.input}): Promise<${method.output}> {
  const response = await PBrequest(url + '${url}', ${method.input}.encode(${input}));
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
      const input = lowerCase(method.input ?? "");
      const url = `/twirp/${packageName ? packageName + "." : ""}${
        service.name
      }/${method.name}`;

      result += `\
export async function ${method.name}JSON(url: string, ${input}: ${method.input}): Promise<${method.output}> {
  const response = await JSONrequest<${method.output}>(url + '${url}', ${input});
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
    result += printHeading(`${service.name} Service`);

    if (service.comments?.leading) {
      result += printComments(service.comments.leading);
    }
    result += `export interface ${service.name}<Context = unknown> {\n`;
    service.methods.forEach((method) => {
      if (method.comments?.leading) {
        result += printComments(method.comments.leading);
      }
      result += `${method.name}: (${lowerCase(method.input ?? "")}: ${
        method.input
      }, context?: Context) => Promise<${method.output}> | ${method.output};\n`;
    });
    result += "}\n";
  });

  result += "\n";

  services.forEach((service) => {
    result += `export function ${service.name}Handler(service: ${
      service.name
    }): ServiceHandler { return {
    path: '${[packageName, service.name].filter(Boolean).join(".")}',
    methods: {\n`;
    service.methods.forEach((method) => {
      result += `${method.name}: createMethodHandler({ handler: service.${method.name}, encode: ${method.output}.encode, decode: ${method.input}.decode }),`;
    });
  });
  result += "}\n";
  result += "}\n";
  result += "}\n";

  return result;
}

export function generate(
  fileDescriptorProto: FileDescriptorProto,
  identifierTable: IdentifierTable
): string {
  const { imports, services, types, packageName } = processTypes(
    fileDescriptorProto,
    identifierTable
  );
  const sourceFile = fileDescriptorProto.getName();
  if (!sourceFile) {
    return "";
  }

  return `\
// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: ${sourceFile}
import { BinaryReader, BinaryWriter } from "google-protobuf";
import { JSONrequest, PBrequest, createMethodHandler, ServiceHandler } from 'twirpscript';
${imports
  .map(
    ({ identifiers, path }) =>
      `import { ${identifiers.join(", ")} } from '${path}';`
  )
  .join("\n")}

type ByteSource = ArrayBuffer | Uint8Array | number[] | string;

${writeClients(services, packageName)}

${writeServers(services, packageName)}

${printHeading("Types")}
${writeTypes(types)}

${printHeading("Protobuf Encode / Decode")}
${writeSerializers(types)}
`;
}
