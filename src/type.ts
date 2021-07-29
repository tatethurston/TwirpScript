import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { lowerCase, IdentifierTable, ProtoTypes, processTypes } from "./utils";

function writeTypes(types: ProtoTypes[]): string {
  let result = "";

  types.forEach((node) => {
    if (node.type === "enum") {
      result += `
export enum ${node.content.name} { 
  ${node.content.values.map(([key, value]) => `${key} = ${value},`).join("\n")}
 }\n\n`;
    } else {
      result += `
export interface ${node.content.name} { 
  ${node.content.fields
    .map(
      ({ name, tsType, repeated }) =>
        `${name}: ${tsType}${repeated ? "[]" : ""};`
    )
    .join("\n")}
}\n\n`;

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

export function generateType(
  fileDescriptorProto: FileDescriptorProto,
  identifierTable: IdentifierTable
): string {
  const { imports, types } = processTypes(fileDescriptorProto, identifierTable);
  const sourceFile = fileDescriptorProto.getName();
  if (!sourceFile) {
    return "";
  }

  return `\
// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: ${sourceFile}
import { BinaryReader, BinaryWriter } from "google-protobuf";
${imports
  .map(
    ({ identifiers, path }) =>
      `import { ${identifiers.join(", ")} } from '${path}';`
  )
  .join("\n")}

type ByteSource = ArrayBuffer | Uint8Array | number[] | string;

${writeTypes(types)}

${writeSerializers(types)}
`;
}
