"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateType = void 0;
const utils_1 = require("./utils");
function writeTypes(types) {
    let result = "";
    types.forEach((node) => {
        if (node.type === "enum") {
            result += `
export enum ${node.content.name} { 
  ${node.content.values.map(([key, value]) => `${key} = ${value},`).join("\n")}
 }\n\n`;
        }
        else {
            result += `
export interface ${node.content.name} { 
  ${node.content.fields
                .map(({ name, tsType, repeated }) => `${name}: ${tsType}${repeated ? "[]" : ""};`)
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
function writeSerializers(types) {
    let result = "";
    types.forEach((node) => {
        if (node.type === "message") {
            result += `export namespace ${node.content.name} {`;
            result += `
        export function writeMessage(msg: ${node.content.fullyQualifiedName}, writer: BinaryWriter): void {
          ${node.content.fields
                .map((field) => `\
                ${field.repeated
                ? `if (msg.${field.name}.length > 0) {`
                : `if (msg.${field.name}) {`}
                ${field.read === "readMessage"
                ? `writer.${field.write}(${field.index}, msg.${field.name} ${field.repeated ? "as any" : ""}, ${field.tsType}.writeMessage);`
                : `writer.${field.write}(${field.index}, msg.${field.name});`}
                }`)
                .join("\n")}
        }
        
        export function encode(${utils_1.lowerCase(node.content.name)}: ${node.content.fullyQualifiedName}): Uint8Array {
          const writer = new BinaryWriter();
          writeMessage(${utils_1.lowerCase(node.content.name)}, writer);
          return writer.getResultBuffer();
        };

        export function readMessage(msg: Partial<${node.content.fullyQualifiedName}>, reader: BinaryReader): void {
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
                .map((field) => `\
              case ${field.index}: {
                ${field.read === "readMessage"
                ? `\
                  const message = {};
                  reader.readMessage(message, ${field.tsType}.readMessage);
                  ${field.repeated
                    ? `msg.${field.name}.push(message as ${field.tsType});`
                    : `msg.${field.name} = message as ${field.tsType};`}`
                : `${field.repeated
                    ? `msg.${field.name}.push(reader.${field.read}());`
                    : `msg.${field.name} = reader.${field.read}();`}`}
                break;
              }`)
                .join("\n")}
              default: {
                reader.skipField();
                break;
              }
            }
          }
          ${node.content.fields
                .map((field) => `\
                ${!field.repeated && field.read !== "readMessage"
                ? `if (!msg.${field.name}) {
                      msg.${field.name} = ${field.defaultValue};
                    }
                    `
                : ""}`)
                .join("")}
        }

        export function decode(bytes: ByteSource): ${node.content.fullyQualifiedName} {
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
function writeServices(services, packageName) {
    let result = "";
    result += `\
  /*
   * Protobuf Client
   */
  `;
    services.forEach((service) => {
        service.methods.forEach((method) => {
            result += `\
export async function ${method.name}(url: string ${method.input ? `, ${utils_1.lowerCase(method.input)}: ${method.input}` : ""}): Promise<${method.output ? method.output : "void"}> {
  const response = await PBrequest(
    url + '/twirp/${packageName ? packageName + "." : ""}${service.name}/${method.name}'
    ${method.input ? `, ${method.input}.encode(${utils_1.lowerCase(method.input)})` : ""}
  );
  ${method.output ? `return ${method.output}.decode(response);` : ""}
}
`;
        });
    });
    result += `\
  /*
   * JSON Client
   */
  `;
    services.forEach((service) => {
        service.methods.forEach((method) => {
            result += `\
export async function ${method.name}JSON(url: string ${method.input ? `, ${utils_1.lowerCase(method.input)}: ${method.input}` : ""}): Promise<${method.output ? method.output : "void"}> {
  const response = await JSONrequest<${method.output ? method.output : ""}>(
    url + '/twirp/${packageName ? packageName + "." : ""}${service.name}/${method.name}'
    ${method.input ? `, ${utils_1.lowerCase(method.input)}` : ""}
  );
  ${method.output ? `return response;` : ""}
}
`;
        });
    });
    return result;
}
function generateType(fileDescriptorProto, identifierTable) {
    const { imports, services, types, packageName } = utils_1.processTypes(fileDescriptorProto, identifierTable);
    const sourceFile = fileDescriptorProto.getName();
    if (!sourceFile) {
        return "";
    }
    return `\
// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: ${sourceFile}
import { BinaryReader, BinaryWriter } from "google-protobuf";
import { JSONrequest, PBrequest } from 'twirpscript/dist/runtime';
${imports
        .map(({ identifiers, path }) => `import { ${identifiers.join(", ")} } from '${path}';`)
        .join("\n")}

type ByteSource = ArrayBuffer | Uint8Array | number[] | string;

${writeTypes(types)}

${writeSerializers(types)}

${writeServices(services, packageName)}
`;
}
exports.generateType = generateType;
