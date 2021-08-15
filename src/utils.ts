import { execSync } from 'child_process';
import { dirname, relative } from "path";
import { CodeGeneratorRequest } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import {
  DescriptorProto,
  FileDescriptorProto,
  EnumDescriptorProto,
  FieldDescriptorProto,
} from "google-protobuf/google/protobuf/descriptor_pb";
import { BinaryReader, BinaryWriter } from 'google-protobuf';

export function lowerCase(str: string): string {
  return str[0].toLowerCase() + str.slice(1);
}

export function commandIsInPath(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`);
    return true;
  } catch {
    return false;
  }
}

type ReaderMethod = keyof BinaryReader; 
type WriterMethod = keyof BinaryWriter; 

interface Descriptor {
  defaultValue: string;
  read: ReaderMethod;
  repeated: boolean;
  tsType: string;
  write: WriterMethod;
}

export function getDescriptor(field: FieldDescriptorProto, identifierTable: IdentifierTable, fileDescriptorProto: FileDescriptorProto): Descriptor {
  const repeated =
    field.getLabel() === FieldDescriptorProto.Label.LABEL_REPEATED;

  const _type = field.getType();
  if (!_type) {
    throw new Error("Field has no type");
  }

  switch (_type) {
    case FieldDescriptorProto.Type.TYPE_DOUBLE: {
      return {
        defaultValue: '0',
        repeated,
        tsType: "number",
        read: "readDouble",
        write: repeated? "writeRepeatedDouble" : "writeDouble",
      }
    }
    case FieldDescriptorProto.Type.TYPE_FLOAT: {
      return { 
        defaultValue: '0',
        repeated,
        tsType: "number",
        read: "readFloat",
        write: repeated ? "writeRepeatedFloat" : "writeFloat"
      };
    }
    case FieldDescriptorProto.Type.TYPE_INT64: {
      return {
        defaultValue: "''",
        repeated,
        tsType: "string",
        read: "readInt64String",
        write: repeated ? "writeRepeatedInt64String" : "writeInt64String"
      };
    }
    case FieldDescriptorProto.Type.TYPE_UINT64: {
      return {
        defaultValue: "''",
        repeated,
        tsType: "string",
        read: "readUint64String",
        write: repeated ? "writeRepeatedInt64String" : "writeUint64String"
      };
    }
    case FieldDescriptorProto.Type.TYPE_INT32: {
      return {
        defaultValue: '0',
        repeated,
        tsType: "number",
        read: "readInt32",
        write: repeated ? "writeRepeatedInt32" : "writeInt32"
      };
    }
    case FieldDescriptorProto.Type.TYPE_UINT64: {
      return {
        defaultValue: "''",
        repeated,
        tsType: "string",
        read: "readUint64String",
        write: repeated ? "writeRepeatedUint32String" : "writeUint64String"
      }
    }
    case FieldDescriptorProto.Type.TYPE_FIXED64: {
      return {
        defaultValue: repeated ? '[]' : "''",
        repeated,
        tsType: "string",
        read: "readFixed64String",
        write: repeated ? "writeRepeatedFixed64String" : "writeFixed64String"
      }
    }
    case FieldDescriptorProto.Type.TYPE_ENUM: {
      const _type = field.getTypeName() ?? '';
      const name = removePackagePrefix(_type, identifierTable, fileDescriptorProto);

      return {
        defaultValue: '0',
        repeated,
        tsType: name,
        read: "readEnum",
        write: repeated ? "writeRepeatedEnum" : "writeEnum"
      };
    }
    case FieldDescriptorProto.Type.TYPE_FIXED32: {
      return {
        defaultValue: '0',
        repeated,
        tsType: "number",
        read: "readFixed32",
        write: repeated ? "writeRepeatedFixed32" : "writeFixed32"
      }
    }
    case FieldDescriptorProto.Type.TYPE_BOOL: {
      return {
        defaultValue: 'false',
        repeated,
        tsType: "boolean",
        read: "readBool",
        write: repeated ? "writeRepeatedBool" : "writeBool"
      };
    }
    case FieldDescriptorProto.Type.TYPE_GROUP: {
      const name = field.getName() ?? '';
      throw new Error(`Groups are not supported. Found group ${name}`);
    }
    case FieldDescriptorProto.Type.TYPE_MESSAGE: {
      const _type = field.getTypeName() ?? '';
      const name = removePackagePrefix(_type, identifierTable, fileDescriptorProto);

      return {
        defaultValue: 'undefined',
        repeated,
        tsType: name,
        read: "readMessage",
        write: repeated ? "writeRepeatedMessage" : "writeMessage"
      };
    }
    case FieldDescriptorProto.Type.TYPE_STRING: {
      return {
        defaultValue: "''",
        repeated,
        tsType: "string",
        read: "readString",
        write: repeated ? "writeRepeatedString" : "writeString"
      }
    }
    case FieldDescriptorProto.Type.TYPE_BYTES: {
      return {
        defaultValue: "new Uint8Array()",
        repeated,
        tsType: "Uint8Array",
        read: "readBytes",
        write: repeated ? "writeRepeatedBytes" : "writeBytes"
      };
    }
    case FieldDescriptorProto.Type.TYPE_UINT32: {
      return {
        defaultValue: '0',
        repeated,
        tsType: "number",
        read: "readUint32",
        write: repeated ? "writeUint32" : "writeUint32",
      }
    }
    case FieldDescriptorProto.Type.TYPE_SFIXED32: {
      return {
        defaultValue: '0',
        repeated,
        tsType: "number",
        read: "readSfixed32",
        write: repeated ? "writeSfixed32" : "writeSfixed32",
      }
    }
    case FieldDescriptorProto.Type.TYPE_SFIXED64: {
      return {
        defaultValue: "''",
        repeated,
        tsType: "string",
        read: "readSfixed64",
        write: repeated ? "writeSfixed64" : "writeSfixed64",
      }
    }
    case FieldDescriptorProto.Type.TYPE_SINT32: {
      return {
        defaultValue:  '0',
        repeated,
        tsType:  "number",
        read: "readSint32",
        write: repeated ? "writeRepeatedSint32" : "writeSint32",
      }
    }
    case FieldDescriptorProto.Type.TYPE_SINT64: {
      return {
        defaultValue:  "''",
        repeated,
        tsType:  "string",
        read: "readSint64",
        write: repeated ? "writeRepeatedSint64String" : "writeSint64String",
      }
    }
    default: {
      const _exhaust: never = _type;
      return _exhaust;
    }
  }
}

export function stripProtoExtension(protoFileName: string): string {
  return protoFileName.replace(".proto", "");
}

export function stripTSExtension(filename: string): string {
  return filename.replace(".ts", "");
}

export function getProtobufTSFileName(protoFileName: string): string {
  return stripProtoExtension(protoFileName) + ".pb.ts";
}

export function getServerStubFileName(protoFileName: string): string {
  return stripProtoExtension(protoFileName) + ".ts";
}

export function getImportPath(sourceFile: string, dependencyFile: string) {
  const importPath = stripTSExtension(
    relative(dirname(sourceFile), dependencyFile)
  );
  return importPath.startsWith("..") ? importPath : `./${importPath}`;
}

function applyNamespace(namespacing: string, name: string, { removeLeadingPeriod}: { removeLeadingPeriod : boolean } = { removeLeadingPeriod: false}): string {
  let _namespace = namespacing + "." + name;
  if (removeLeadingPeriod && _namespace.startsWith('.')) {
    _namespace = _namespace.slice(1);

  }
  return _namespace;
}

export type IdentifierTable = [ namespacedIdentifier: string, file: string, _package: string][];

/**
 * Example
 *
 * '.google.protobuf.Timestamp', 'google/protobuf/timestamp.proto',jj
 * '.foo.Tate', 'foo.proto',
 * '.Person', 'bob.proto',
 * '.Person.PhoneType', 'bob.proto',
 * '.AddressBook', 'bob.proto'
 */
export function buildIdentifierTable(request: CodeGeneratorRequest): IdentifierTable {
  const table: IdentifierTable = [];

  request.getProtoFileList().forEach((fileDescriptorProto) => {
    const protoFilePath = fileDescriptorProto.getName();
    if (!protoFilePath) {
      return;
    }

    const _package = fileDescriptorProto.getPackage() ?? '';
    function addEntry(namespacing: string, name: string): void {
      table.push([applyNamespace(namespacing, name), protoFilePath as string, _package]);
    }

    function walk(namespacing: string, descriptorProto: DescriptorProto): void {
      const enums = descriptorProto.getEnumTypeList();
      enums.forEach((enumDescriptorProto) => {
        const enumName = enumDescriptorProto.getName();
        if (enumName) {
          addEntry(namespacing, enumName);
        }
      });

      const messages = descriptorProto.getNestedTypeList();
      messages.forEach((descriptor) => {
        const messageName = descriptor.getName();
        if (!messageName) {
          return;
        }
        addEntry(namespacing, messageName);
        walk(applyNamespace(namespacing, messageName), descriptor);
      });
    }

    const packageName = fileDescriptorProto.getPackage();
    const namespacing = packageName ? "." + packageName : "";

    const enums = fileDescriptorProto.getEnumTypeList();
    enums.forEach((enumDescriptorProto) => {
      const enumName = enumDescriptorProto.getName();
      if (enumName) {
        addEntry(namespacing, enumName);
      }
    });

    const messages = fileDescriptorProto.getMessageTypeList();
    messages.forEach((descriptorProto) => {
      const messageName = descriptorProto.getName();
      if (!messageName) {
        return;
      }
      addEntry(namespacing, messageName);
      walk(applyNamespace(namespacing, messageName), descriptorProto);
    });
  });

  return table;
}

export interface Import {
  identifier: string;
  path: string;
}

interface EnumOpts {
  name: string;
  fullyQualifiedName: string;
  values: [string, number][];
}

interface MessageOpts {
  name: string;
  fullyQualifiedName: string;
  fields: {
    defaultValue: string;
    index: number;
    name: string;
    read: string;
    repeated: boolean;
    tsType: string;
    write: string;
  }[];
}

export type ProtoTypes = 
  | { type: 'enum', content: EnumOpts }
  | { type: 'message', content: MessageOpts, children: ProtoTypes[] }

export interface Service {
    name: string;
    methods: {
      name: string;
      input: string | undefined;
      output: string | undefined,
    }[];
}

interface TypeFile {
  packageName: string | undefined;
  imports: {
    identifiers: string[];
    path: string
  }[];
  types: ProtoTypes[];
  services: Service[];
}

function getIdentifierEntryFromTable(
  identifier: string,
  identifiers: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto,
): IdentifierTable[0] {
  const file = fileDescriptorProto.getName();
  const dependencyFiles = [file].concat(fileDescriptorProto.getDependencyList());

  const dep = identifiers.find(([namespacedIdentifier, file]) => {
    return (
      namespacedIdentifier === identifier &&
      dependencyFiles.includes(file)
    );
  });

  if (!dep) {
    console.error(identifiers)
    console.error(`Unknown identifier: ${identifier}`);
    throw new Error(`Unknown identifier: ${identifier}`);
  }

  return dep;
}

function getImportForIdentifier(
  identifier: string,
  identifiers: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto,
): Import {
  const dep = getIdentifierEntryFromTable(identifier, identifiers, fileDescriptorProto); 
  const sourceFile = fileDescriptorProto.getName() ?? '';
  const path = getImportPath(sourceFile, getProtobufTSFileName(dep[1]));

  const dependencyIdentifier = identifier.split('.').pop() ?? '';
  return { identifier: dependencyIdentifier, path };
}

function identifierIsDefinedInFile(identifier: string, identifierTable: IdentifierTable, fileDescriptorProto: FileDescriptorProto): boolean {
  return identifierTable.find(([namespacedIdentifier, file]) => identifier === namespacedIdentifier && file === fileDescriptorProto.getName()) !== undefined;
}

function removePackagePrefix(
  identifier: string,
  identifiers: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto,
): string {
  const dep = getIdentifierEntryFromTable(identifier, identifiers, fileDescriptorProto); 
  const packagePrefix = '.' + dep[2];

  let name = identifier;
  if (name.startsWith(packagePrefix)) {
    name = name.slice(packagePrefix.length);
  }
  if (name.startsWith('.')) {
    name = name.slice(1);
  }
  return name;
}

export function processTypes(fileDescriptorProto: FileDescriptorProto, identifierTable: IdentifierTable): TypeFile {
  const typeFile: TypeFile = {
    packageName: fileDescriptorProto.getPackage(),
    imports: [],
    services: [],
    types: [],
  }
  function addIdentiferToImports(identifier: string) {
    const _import = getImportForIdentifier(identifier, identifierTable, fileDescriptorProto)
    const exisitingImport = typeFile.imports.find(({ path }) => path === _import.path)
    if (exisitingImport) {
      exisitingImport.identifiers.push(_import.identifier)
    } else {
      typeFile.imports.push({
        identifiers: [_import.identifier],
        path: _import.path
      })
    }
  }
  function getEnum(namespacing: string, node: EnumDescriptorProto): EnumOpts {
    const name = node.getName();
    if (!name) {
      throw new Error(`Expected name for ${node}`);
    }
    const opts: EnumOpts = {
      name,
      fullyQualifiedName: applyNamespace(namespacing, name, { removeLeadingPeriod: true }),
      values: node
        .getValueList()
        .map((value) => [value.getName() ?? "", value.getNumber() ?? 0]),
    };

    return opts;
  }


function getMessage(namespacing: string, node: DescriptorProto): MessageOpts {
  const name = node.getName();
  if (!name) {
    throw new Error(`Expected name for ${node}`);
  }
  const opts: MessageOpts = {
    name,
    fullyQualifiedName: applyNamespace(namespacing, name, { removeLeadingPeriod: true }),
    fields: node
      .getFieldList()
      .map((value) => {
        const descriptor = getDescriptor(value, identifierTable, fileDescriptorProto);
        if (value.getType() === FieldDescriptorProto.Type.TYPE_MESSAGE || value.getType() === FieldDescriptorProto.Type.TYPE_ENUM) {
          processIdentifier(value.getTypeName() ?? "");
        }
        return {
          name: value.getName() ?? '',
          index: value.getNumber() ?? 0,
          ...descriptor
        }
      }),
  };
  return opts;
}

  function processIdentifier(identifier: string) {
    if (identifierIsDefinedInFile(identifier, identifierTable, fileDescriptorProto)) {
      return;
    }

    addIdentiferToImports(identifier);
  }

    function walk(namespacing: string, descriptorProto: DescriptorProto): ProtoTypes[] {
      const types: ProtoTypes[] = [];
      const enums = descriptorProto.getEnumTypeList();
      enums.forEach((enumDescriptorProto) => {
        const enumName = enumDescriptorProto.getName();
        if (enumName) {
          types.push({
            type: 'enum',
            content: getEnum(namespacing, enumDescriptorProto)
          });
        }
      });

      const messages = descriptorProto.getNestedTypeList();
      messages.forEach((descriptor) => {
        const messageName = descriptor.getName();
        if (messageName) {
          const children = walk(applyNamespace(namespacing, messageName), descriptor);
          types.push({
            type: 'message',
            content: getMessage(namespacing, descriptor),
            children
          });
        }
      });

      return types;
    }

    const enums = fileDescriptorProto.getEnumTypeList();
    enums.forEach((enumDescriptorProto) => {
        typeFile.types.push({
          type: 'enum',
          content: getEnum("", enumDescriptorProto)
        });
    });

    const messages = fileDescriptorProto.getMessageTypeList();
    messages.forEach((descriptor) => {
        const messageName = descriptor.getName();
        if (messageName) {
        const children = walk(applyNamespace("", messageName), descriptor);
        typeFile.types.push({
          type: 'message',
          content: getMessage("", descriptor),
          children
        });
        }
    });

  typeFile.services = fileDescriptorProto.getServiceList().map(service => ({
    name: service.getName() ?? '',
    methods: service.getMethodList().map(method => ({
      name: method.getName() ?? '',
      input: removePackagePrefix(method.getInputType() ?? '',identifierTable, fileDescriptorProto),
      output: removePackagePrefix(method.getOutputType() ?? '', identifierTable, fileDescriptorProto),
    }))
  }));

  return typeFile;
}
