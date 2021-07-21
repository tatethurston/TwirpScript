import { execSync } from 'child_process';
import { dirname, relative } from "path";
import { CodeGeneratorRequest } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import {
  DescriptorProto,
  FileDescriptorProto,
  EnumDescriptorProto,
  FieldDescriptorProto,
} from "google-protobuf/google/protobuf/descriptor_pb";
import _ from "lodash";


export function commandIsInPath(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`);
    return true;
  } catch {
    return false;
  }
}

type TsType = "Uint8Array" | "boolean" | "number" | "string";

// https://developers.google.com/protocol-buffers/docs/reference/cpp/google.protobuf.descriptor?hl=en

type UnimplementedType = FieldDescriptorProto.Type.TYPE_GROUP;
type ComplexType =
  | FieldDescriptorProto.Type.TYPE_ENUM
  | FieldDescriptorProto.Type.TYPE_MESSAGE;
type ScalarType = Exclude<
  FieldDescriptorProto.Type,
  ComplexType | UnimplementedType
>;

function getTSScalar(fieldType: ScalarType): TsType {
  switch (fieldType) {
    case FieldDescriptorProto.Type.TYPE_DOUBLE: {
      return "string";
    }
    case FieldDescriptorProto.Type.TYPE_FLOAT: {
      return "string";
    }
    case FieldDescriptorProto.Type.TYPE_INT64: {
      return "string";
    }
    case FieldDescriptorProto.Type.TYPE_UINT64: {
      return "string";
    }
    case FieldDescriptorProto.Type.TYPE_INT32: {
      return "number";
    }
    case FieldDescriptorProto.Type.TYPE_UINT64: {
      return "string";
    }
    case FieldDescriptorProto.Type.TYPE_FIXED64: {
      return "string";
    }
    case FieldDescriptorProto.Type.TYPE_FIXED32: {
      return "number";
    }
    case FieldDescriptorProto.Type.TYPE_BOOL: {
      return "boolean";
    }
    case FieldDescriptorProto.Type.TYPE_STRING: {
      return "string";
    }
    case FieldDescriptorProto.Type.TYPE_BYTES: {
      return "Uint8Array";
    }
    case FieldDescriptorProto.Type.TYPE_UINT32: {
      return "number";
    }
    case FieldDescriptorProto.Type.TYPE_SFIXED32: {
      return "number";
    }
    case FieldDescriptorProto.Type.TYPE_SFIXED64: {
      return "string";
    }
    case FieldDescriptorProto.Type.TYPE_SINT32: {
      return "number";
    }
    case FieldDescriptorProto.Type.TYPE_SINT64: {
      return "string";
    }
    default: {
      const _exhaust: never = fieldType;
      return _exhaust;
    }
  }
}

interface EnumOpts {
  name: string;
  values: [string, number][];
}

interface MessageOpts {
  name: string;
  values: [string, string][];
}

type TSType = { 
  value: string;
  repeated: boolean;
}

function getMessageType(value: FieldDescriptorProto): TSType {
  const _type = value.getType();
  if (!_type) {
    throw new Error("message type was undefined");
  }

  let tsType: string;
  switch (_type) {
    case FieldDescriptorProto.Type.TYPE_GROUP: {
      throw new Error("group is not implemented");
    }
    case FieldDescriptorProto.Type.TYPE_MESSAGE:
    case FieldDescriptorProto.Type.TYPE_ENUM: {
      const typename = value.getTypeName();
      if (!typename) {
        throw new Error("typename was undefined");
      }
      tsType = typename;
      break;
    }
    default: {
      tsType = getTSScalar(_type);
      break;
    }
  }
  const repeated =
    value.getLabel() === FieldDescriptorProto.Label.LABEL_REPEATED;

  return {
    value: tsType,
    repeated
  }
}

export function stripProtoExtension(protoFileName: string): string {
  return protoFileName.replace(".proto", "");
}

export function stripTSExtension(filename: string): string {
  return filename.replace(".ts", "");
}

export function getTypesFileName(protoFileName: string): string {
  return stripProtoExtension(protoFileName) + ".types.ts";
}

export function getServiceFileName(protoFileName: string): string {
  return stripProtoExtension(protoFileName) + ".service.ts";
}

export function getClientFileName(protoFileName: string): string {
  return stripProtoExtension(protoFileName) + ".client.ts";
}

export function getImportPath(sourceFile: string, dependencyFile: string) {
  const importPath = stripTSExtension(
    relative(dirname(sourceFile), dependencyFile)
  );
  return importPath.startsWith("..") ? importPath : `./${importPath}`;
}

// interface Visitor {
//   Message: (node: DescriptorProto) => void;
//   Enum: (node: EnumDescriptorProto) => void;
// }

// function walker({ Message, Enum }: Visitor): void {
//   function walk(descriptorProto: DescriptorProto): void {
//     const enums = descriptorProto.getEnumTypeList();
//     enums.forEach((node) => Enum(node));

//     const messages = descriptorProto.getNestedTypeList();
//     messages.forEach((descriptor) => {
//       Message(descriptorProto);
//       walk(descriptor);
//     });
//   }

//   const enums = fileDescriptorProto.getEnumTypeList();
//   enums.forEach((node) => Enum(node));

//   const messages = fileDescriptorProto.getMessageTypeList();
//   messages.forEach((descriptorProto) => {
//     Message(descriptorProto);
//     walk(descriptorProto);
//   });
// }

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

    function applyNamespace(namespacing: string, name: string): string {
      return namespacing + "." + name;
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


  export interface Namespacing {
    _type: 'namespace';
    name: string;
    children: Array<Namespacing | { _type: 'type', content: string }>
  }

interface TypeFile {
  imports: {
    identifiers: string[],
    path: string
  }[];
  types: { _namespace: string, content: string }[]
  namespacing: Namespacing;
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
  const path = getImportPath(sourceFile, getTypesFileName(dep[1]));

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

function getNamespace(
  identifier: string,
  identifiers: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto,
): string {
  const name = removePackagePrefix(identifier, identifiers, fileDescriptorProto);
  // get namespacing without the identifier name
  if (name.includes('.')) {
    const segments = name.split('.')
    segments.pop();
    return segments.join('.');
  }
  return '';
}

export function processTypes(fileDescriptorProto: FileDescriptorProto, identifierTable: IdentifierTable): TypeFile {
  const typeFile: TypeFile = {
    imports: [],
    types: [],
    namespacing: {} as Namespacing
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


  function serializeEnum(node: EnumDescriptorProto): string {
    const { name, values }: EnumOpts = {
      name: node.getName() ?? "",
      values: node
        .getValueList()
        .map((value) => [value.getName() ?? "", value.getNumber() ?? 0]),
    };

    return `\
export enum ${name} { 
  ${values.map(([key, value]) => `${key} = ${value},`).join("\n")}
}`;
  }

function serializeMessage(node: DescriptorProto): string {
  const { name, values }: MessageOpts = {
    name: node.getName() ?? "",
    values: node
      .getFieldList()
      .map((value) => {
        let messageType = getMessageType(value);
        if (value.getType() === FieldDescriptorProto.Type.TYPE_MESSAGE || value.getType() === FieldDescriptorProto.Type.TYPE_ENUM) {
          processIdentifier(value.getTypeName() ?? "");
          messageType.value = removePackagePrefix(messageType.value, identifierTable, fileDescriptorProto);
        }
        const _type = messageType.repeated ? messageType.value + '[]' : messageType.value
        return [value.getName() ?? "", _type]
      }),
  };

  return `\
export interface ${name} { 
  ${values.map(([key, value]) => `${key}: ${value};`).join("\n")}
}`;
}

    function applyNamespace(namespacing: string, name: string): string {
      return namespacing + "." + name;
    }

  function processIdentifier(identifier: string) {
    if (identifierIsDefinedInFile(identifier, identifierTable, fileDescriptorProto)) {
      return;
    }

    addIdentiferToImports(identifier);
  }

    function walk(namespacing: string, descriptorProto: DescriptorProto): void {
      const enums = descriptorProto.getEnumTypeList();
      enums.forEach((enumDescriptorProto) => {
        const enumName = enumDescriptorProto.getName();
        if (enumName) {
          typeFile.types.push({
            _namespace: getNamespace(applyNamespace(namespacing, enumName), identifierTable, fileDescriptorProto),
            content: serializeEnum(enumDescriptorProto)
          });
        }
      });

      const messages = descriptorProto.getNestedTypeList();
      messages.forEach((descriptor) => {
        const messageName = descriptor.getName();
        if (!messageName) {
          return;
        }
        if (messageName) {
          typeFile.types.push({
            _namespace: getNamespace(applyNamespace(namespacing, messageName), identifierTable, fileDescriptorProto),
            content: serializeMessage(descriptor)
          });
        }
        walk(applyNamespace(namespacing, messageName), descriptor);
      });
    }

    const packageName = fileDescriptorProto.getPackage();
    const namespacing = packageName ? "." + packageName : "";

    const enums = fileDescriptorProto.getEnumTypeList();
    enums.forEach((enumDescriptorProto) => {
      const enumName = enumDescriptorProto.getName();
      if (enumName) {
        typeFile.types.push({
            _namespace: '',
          content: serializeEnum(enumDescriptorProto)
        });
      }
    });

    const messages = fileDescriptorProto.getMessageTypeList();
    messages.forEach((descriptor) => {
      const messageName = descriptor.getName();
      if (messageName) {
        typeFile.types.push({
            _namespace: '',
          content: serializeMessage(descriptor)
        });
        walk(applyNamespace(namespacing, messageName), descriptor);
      }
    });

  // order so that we guarentee parent namespaces have already been 
  // processed
  const namespaces = _.chain(typeFile.types)
    .orderBy(t => t._namespace.split('.').length)
    .value();

  const root: Namespacing = { _type: 'namespace', name: '', children: [] };
  const seen = {
    [root.name]: root,
  };

  namespaces.forEach(t => {
    const segments =  t._namespace.split('.');
    const name = segments.pop() ?? '';
    const _parent = segments.pop() ?? '';
    
    if (!seen[name]) {
      seen[name] = { _type: 'namespace', name, children: [{ _type: 'type', content: t.content}] }
      seen[_parent].children.push(seen[name]);
    } else {
      seen[name].children.push({ _type: 'type', content: t.content })
    }
  });

  typeFile.namespacing = root;

  return typeFile;
}
