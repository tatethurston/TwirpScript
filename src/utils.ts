import { dirname, relative } from "path";
import type { CodeGeneratorRequest } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import type {
  DescriptorProto,
  FileDescriptorProto,
  EnumDescriptorProto,
} from "google-protobuf/google/protobuf/descriptor_pb";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { BinaryReader, BinaryWriter } from "google-protobuf";

export function lowerCase(str: string): string {
  return str[0].toLowerCase() + str.slice(1);
}

function titleCase(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

function camelCase(str: string): string {
  const [first, ...rest] = str.split("_");
  return first + rest.map(titleCase).join("");
}

const FileLabel = {
  Message: 4,
  Enum: 5,
  Service: 6,
};

const ServiceLabel = {
  Method: 2,
};

const EnumLabel = {
  Value: 2,
};

const MessageLabel = {
  Field: 2,
  Nested: 3,
  Enum: 4,
};

type ReaderMethod = keyof BinaryReader | "map";
type WriterMethod = keyof BinaryWriter | "map";

interface Descriptor {
  defaultValue: string;
  map: boolean;
  optional: boolean;
  read: ReaderMethod;
  readPacked: ReaderMethod | undefined;
  repeated: boolean;
  tsType: string;
  write: WriterMethod;
}

export function getDescriptor(
  field: FieldDescriptorProto,
  identifierTable: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto
): Descriptor | undefined {
  const repeated =
    field.getLabel() === FieldDescriptorProto.Label.LABEL_REPEATED;

  const optional = field.hasProto3Optional() || field.hasOneofIndex();

  const _type = field.getType();
  if (!_type) {
    throw new Error("Field has no type");
  }

  switch (_type) {
    case FieldDescriptorProto.Type.TYPE_DOUBLE: {
      return {
        defaultValue: "0",
        map: false,
        optional,
        read: "readDouble",
        readPacked: "readPackedDouble",
        repeated,
        tsType: "number",
        write: repeated ? "writePackedDouble" : "writeDouble",
      };
    }
    case FieldDescriptorProto.Type.TYPE_FLOAT: {
      return {
        defaultValue: "0",
        map: false,
        optional,
        read: "readFloat",
        readPacked: "readPackedFloat",
        repeated,
        tsType: "number",
        write: repeated ? "writePackedFloat" : "writeFloat",
      };
    }
    case FieldDescriptorProto.Type.TYPE_INT64: {
      return {
        defaultValue: "0n",
        map: false,
        optional,
        read: "readInt64String",
        readPacked: "readPackedInt64String",
        repeated,
        tsType: "bigint",
        write: repeated ? "writePackedInt64String" : "writeInt64String",
      };
    }
    case FieldDescriptorProto.Type.TYPE_UINT64: {
      return {
        defaultValue: "0n",
        map: false,
        optional,
        read: "readUint64String",
        readPacked: "readPackedUint64String",
        repeated,
        tsType: "bigint",
        write: repeated ? "writePackedUint64String" : "writeUint64String",
      };
    }
    case FieldDescriptorProto.Type.TYPE_INT32: {
      return {
        defaultValue: "0",
        map: false,
        optional,
        read: "readInt32",
        readPacked: "readPackedInt32",
        repeated,
        tsType: "number",
        write: repeated ? "writePackedInt32" : "writeInt32",
      };
    }
    case FieldDescriptorProto.Type.TYPE_FIXED64: {
      return {
        defaultValue: "0n",
        map: false,
        optional,
        read: "readFixed64String",
        readPacked: "readPackedFixed64String",
        repeated,
        tsType: "bigint",
        write: repeated ? "writePackedFixed64String" : "writeFixed64String",
      };
    }
    case FieldDescriptorProto.Type.TYPE_ENUM: {
      const _type = field.getTypeName() ?? "";
      const name = removePackagePrefix(
        _type,
        identifierTable,
        fileDescriptorProto
      );

      return {
        defaultValue: `${name}._fromInt(0)`,
        map: false,
        optional,
        read: "readEnum",
        readPacked: "readPackedEnum",
        repeated,
        tsType: name,
        write: repeated ? "writePackedEnum" : "writeEnum",
      };
    }
    case FieldDescriptorProto.Type.TYPE_FIXED32: {
      return {
        defaultValue: "0",
        map: false,
        optional,
        read: "readFixed32",
        readPacked: "readPackedFixed32",
        repeated,
        tsType: "number",
        write: repeated ? "writePackedFixed32" : "writeFixed32",
      };
    }
    case FieldDescriptorProto.Type.TYPE_BOOL: {
      return {
        defaultValue: "false",
        map: false,
        optional,
        read: "readBool",
        readPacked: "readPackedBool",
        repeated,
        tsType: "boolean",
        write: repeated ? "writePackedBool" : "writeBool",
      };
    }
    case FieldDescriptorProto.Type.TYPE_GROUP: {
      const name = field.getName() ?? "";
      console.error(`Groups are not supported. Found group ${name}`);
      return undefined;
    }
    case FieldDescriptorProto.Type.TYPE_MESSAGE: {
      const _type = field.getTypeName() ?? "";
      const name = removePackagePrefix(
        _type,
        identifierTable,
        fileDescriptorProto
      );
      // Hack until better option:
      // https://github.com/protocolbuffers/protobuf/issues/9369
      const isMap =
        _type.endsWith("Entry") && !field.toArray()[0].endsWith("Entry");

      if (isMap) {
        return {
          defaultValue: "{}",
          map: true,
          optional,
          read: "readMessage",
          readPacked: undefined,
          repeated: false,
          tsType: name.slice(0, name.lastIndexOf("Entry")),
          write: "writeRepeatedMessage",
        };
      }

      return {
        defaultValue: "undefined",
        map: false,
        optional,
        read: "readMessage",
        readPacked: undefined,
        repeated,
        tsType: name,
        write: repeated ? "writeRepeatedMessage" : "writeMessage",
      };
    }
    case FieldDescriptorProto.Type.TYPE_STRING: {
      return {
        defaultValue: "''",
        map: false,
        optional,
        read: "readString",
        readPacked: undefined,
        repeated,
        tsType: "string",
        write: repeated ? "writeRepeatedString" : "writeString",
      };
    }
    case FieldDescriptorProto.Type.TYPE_BYTES: {
      return {
        defaultValue: "new Uint8Array()",
        map: false,
        optional,
        read: "readBytes",
        readPacked: undefined,
        repeated,
        tsType: "Uint8Array",
        write: repeated ? "writeRepeatedBytes" : "writeBytes",
      };
    }
    case FieldDescriptorProto.Type.TYPE_UINT32: {
      return {
        defaultValue: "0",
        map: false,
        optional,
        read: "readUint32",
        readPacked: "readPackedUint32",
        repeated,
        tsType: "number",
        write: repeated ? "writePackedUint32" : "writeUint32",
      };
    }
    case FieldDescriptorProto.Type.TYPE_SFIXED32: {
      return {
        defaultValue: "0",
        map: false,
        optional,
        read: "readSfixed32",
        readPacked: "readPackedSfixed32",
        repeated,
        tsType: "number",
        write: repeated ? "writePackedSfixed32" : "writeSfixed32",
      };
    }
    case FieldDescriptorProto.Type.TYPE_SFIXED64: {
      return {
        defaultValue: "0n",
        map: false,
        optional,
        read: "readSfixed64String",
        readPacked: "readPackedSfixed64String",
        repeated,
        tsType: "bigint",
        write: repeated ? "writePackedSfixed64String" : "writeSfixed64String",
      };
    }
    case FieldDescriptorProto.Type.TYPE_SINT32: {
      return {
        defaultValue: "0",
        map: false,
        optional,
        read: "readSint32",
        readPacked: "readPackedSint32",
        repeated,
        tsType: "number",
        write: repeated ? "writePackedSint32" : "writeSint32",
      };
    }
    case FieldDescriptorProto.Type.TYPE_SINT64: {
      return {
        defaultValue: "0n",
        map: false,
        optional,
        read: "readSint64String",
        readPacked: "readPackedSint64String",
        repeated,
        tsType: "bigint",
        write: repeated ? "writePackedSint64String" : "writeSint64String",
      };
    }
    default: {
      const _exhaust: never = _type;
      return _exhaust;
    }
  }
}

function stripProtoExtension(protoFileName: string): string {
  return protoFileName.replace(".proto", "");
}

function stripTSExtension(filename: string): string {
  return filename.replace(".ts", "");
}

function stripJSExtension(filename: string): string {
  return filename.replace(".js", "");
}

export function getProtobufTSFileName(protoFileName: string): string {
  return stripProtoExtension(protoFileName) + ".pb.ts";
}

export function getProtobufJSFileName(protoFileName: string): string {
  return stripProtoExtension(protoFileName) + ".pb.js";
}

function getImportPath(importPath: string) {
  return importPath.startsWith("..") ? importPath : `./${importPath}`;
}

function applyNamespace(
  namespacing: string,
  name: string,
  { removeLeadingPeriod }: { removeLeadingPeriod: boolean } = {
    removeLeadingPeriod: false,
  }
): string {
  let _namespace = namespacing + "." + name;
  if (removeLeadingPeriod && _namespace.startsWith(".")) {
    _namespace = _namespace.slice(1);
  }
  return _namespace;
}

/**
 * [namespacedIdentifier, file, package, publicImport]
 */
export type IdentifierTable = {
  namespacedIdentifier: string;
  file: string;
  package: string;
  publicImport: string | undefined;
}[];

/**
 * Example
 * '.protobuf_unittest_import.PublicImportMessage', 'google/protobuf/unittest_import_public.proto', 'protobuf_unittest_import', 'protobuf_unittest_import_public'
 */
export function buildIdentifierTable(
  request: CodeGeneratorRequest
): IdentifierTable {
  const table: IdentifierTable = [];

  request.getProtoFileList().forEach((fileDescriptorProto) => {
    const protoFilePath = fileDescriptorProto.getName();
    if (!protoFilePath) {
      return;
    }

    const _package = fileDescriptorProto.getPackage() ?? "";
    function addEntry(namespacing: string, name: string): void {
      table.push({
        namespacedIdentifier: applyNamespace(namespacing, name),
        file: protoFilePath as string,
        package: _package,
        publicImport: undefined,
      });
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

  request.getProtoFileList().forEach((fileDescriptorProto) => {
    const publicImports = fileDescriptorProto
      .getDependencyList()
      .filter((_, idx) =>
        fileDescriptorProto.getPublicDependencyList().includes(idx)
      );

    const protoFilePath = fileDescriptorProto.getName();
    if (!protoFilePath || publicImports.length === 0) {
      return;
    }

    const forwardedImports = table
      .filter(({ file }) => publicImports.includes(file))
      .map((row) => {
        const newRow: IdentifierTable[0] = { ...row };
        newRow.file = protoFilePath;
        newRow.publicImport = row.file;
        return newRow;
      });

    table.push(...forwardedImports);
  });

  return table;
}

export interface Import {
  identifier: string;
  path: string;
}

interface Comments {
  leading: string | undefined;
  trailing: string | undefined;
}

interface EnumOpts {
  name: string;
  fullyQualifiedName: string;
  values: {
    name: string;
    value: number;
    comments?: Comments;
  }[];
  comments?: Comments;
}

interface Field extends Descriptor {
  comments?: Comments;
  index: number;
  jsonName: string | undefined;
  name: string;
  protoName: string;
}

interface MessageOpts {
  name: string;
  fullyQualifiedName: string;
  fields: Field[];
  comments?: Comments;
  isMap: boolean;
}

export type EnumType = { type: "enum"; content: EnumOpts };
export type MessageType = {
  type: "message";
  content: MessageOpts;
  children: ProtoTypes[];
};
export type ProtoTypes = EnumType | MessageType;

export interface Service {
  name: string;
  methods: {
    name: string;
    input: string | undefined;
    output: string | undefined;
    comments?: Comments;
  }[];
  comments?: Comments;
}

interface TypeFile {
  packageName: string | undefined;
  imports: {
    identifiers: string[];
    path: string;
  }[];
  types: ProtoTypes[];
  services: Service[];
}

function getIdentifierEntryFromTable(
  identifier: string,
  identifiers: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto
): IdentifierTable[0] {
  const file = fileDescriptorProto.getName();
  const dependencyFiles = [file].concat(
    fileDescriptorProto.getDependencyList()
  );

  const dep = identifiers.find(({ namespacedIdentifier, file }) => {
    return (
      namespacedIdentifier === identifier && dependencyFiles.includes(file)
    );
  });

  if (!dep) {
    console.error(identifiers);
    console.error(`Unknown identifier: ${identifier}`);
    throw new Error(`Unknown identifier: ${identifier}`);
  }

  return dep;
}

function getImportForIdentifier(
  identifier: string,
  identifiers: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto,
  isTypescript: boolean
): Import {
  const dep = getIdentifierEntryFromTable(
    identifier,
    identifiers,
    fileDescriptorProto
  );
  const sourceFile = fileDescriptorProto.getName() ?? "";
  const dependencyImportPath = dep.publicImport ?? dep.file;

  const importPath = isTypescript
    ? stripTSExtension(
        relative(
          dirname(sourceFile),
          getProtobufTSFileName(dependencyImportPath)
        )
      )
    : stripJSExtension(
        relative(
          dirname(sourceFile),
          getProtobufJSFileName(dependencyImportPath)
        )
      );
  const path = getImportPath(importPath);

  const dependencyIdentifier = identifier.split(".").pop() ?? "";
  return { identifier: dependencyIdentifier, path };
}

function identifierIsDefinedInFile(
  identifier: string,
  identifierTable: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto
): boolean {
  return (
    identifierTable.find(
      ({ namespacedIdentifier, file }) =>
        identifier === namespacedIdentifier &&
        file === fileDescriptorProto.getName()
    ) !== undefined
  );
}

function removePackagePrefix(
  identifier: string,
  identifiers: IdentifierTable,
  fileDescriptorProto: FileDescriptorProto
): string {
  const dep = getIdentifierEntryFromTable(
    identifier,
    identifiers,
    fileDescriptorProto
  );
  const packagePrefix = "." + dep.package;

  let name = identifier;
  if (name.startsWith(packagePrefix)) {
    name = name.slice(packagePrefix.length);
  }
  if (name.startsWith(".")) {
    name = name.slice(1);
  }
  return name;
}

function isNotBlank<T>(x: T): x is NonNullable<T> {
  return x != undefined;
}

export function processTypes(
  fileDescriptorProto: FileDescriptorProto,
  identifierTable: IdentifierTable,
  isTypescript: boolean
): TypeFile {
  const typeFile: TypeFile = {
    packageName: fileDescriptorProto.getPackage(),
    imports: [],
    services: [],
    types: [],
  };

  function addIdentiferToImports(identifier: string) {
    const _import = getImportForIdentifier(
      identifier,
      identifierTable,
      fileDescriptorProto,
      isTypescript
    );
    const exisitingImport = typeFile.imports.find(
      ({ path }) => path === _import.path
    );
    if (exisitingImport) {
      if (!exisitingImport.identifiers.find((x) => x === _import.identifier)) {
        exisitingImport.identifiers.push(_import.identifier);
      }
    } else {
      typeFile.imports.push({
        identifiers: [_import.identifier],
        path: _import.path,
      });
    }
  }
  function getEnum(namespacing: string, node: EnumDescriptorProto): EnumOpts {
    const name = node.getName();
    if (!name) {
      throw new Error(`Expected name for ${node}`);
    }
    const opts: EnumOpts = {
      name,
      fullyQualifiedName: applyNamespace(namespacing, name, {
        removeLeadingPeriod: true,
      }),
      values: node.getValueList().map((value) => ({
        name: value.getName() ?? "",
        value: value.getNumber() ?? 0,
      })),
    };

    return opts;
  }

  function getMessage(namespacing: string, node: DescriptorProto): MessageOpts {
    let name = node.getName();
    if (!name) {
      throw new Error(`Expected name for ${node}`);
    }

    // Hack until better option:
    // https://github.com/protocolbuffers/protobuf/issues/9369
    const isMap = name.endsWith("Entry") && node.getFieldList().length == 2;
    name = isMap ? name.slice(0, name.lastIndexOf("Entry")) : name;

    const opts: MessageOpts = {
      name,
      fullyQualifiedName: applyNamespace(namespacing, name, {
        removeLeadingPeriod: true,
      }),
      isMap,
      fields: node
        .getFieldList()
        .map((value) => {
          const descriptor = getDescriptor(
            value,
            identifierTable,
            fileDescriptorProto
          );
          if (!descriptor) {
            return;
          }
          const _type = value.getType();
          if (
            _type === FieldDescriptorProto.Type.TYPE_MESSAGE ||
            _type === FieldDescriptorProto.Type.TYPE_ENUM
          ) {
            processIdentifier(value.getTypeName() ?? "");
          }
          return {
            name: camelCase(value.getName() ?? ""),
            protoName: value.getName() ?? "",
            jsonName: value.getJsonName(),
            index: value.getNumber() ?? 0,
            ...descriptor,
          };
        })
        .filter(isNotBlank),
    };
    return opts;
  }

  function processIdentifier(identifier: string) {
    if (
      identifierIsDefinedInFile(
        identifier,
        identifierTable,
        fileDescriptorProto
      )
    ) {
      return;
    }

    addIdentiferToImports(identifier);
  }

  function walk(
    namespacing: string,
    descriptorProto: DescriptorProto
  ): ProtoTypes[] {
    const types: ProtoTypes[] = [];
    const enums = descriptorProto.getEnumTypeList();
    enums.forEach((enumDescriptorProto) => {
      const enumName = enumDescriptorProto.getName();
      if (enumName) {
        types.push({
          type: "enum",
          content: getEnum(namespacing, enumDescriptorProto),
        });
      }
    });

    const messages = descriptorProto.getNestedTypeList();
    messages.forEach((descriptor) => {
      const messageName = descriptor.getName();
      if (messageName) {
        const children = walk(
          applyNamespace(namespacing, messageName),
          descriptor
        );
        types.push({
          type: "message",
          content: getMessage(namespacing, descriptor),
          children,
        });
      }
    });

    return types;
  }

  const enums = fileDescriptorProto.getEnumTypeList();
  enums.forEach((enumDescriptorProto) => {
    typeFile.types.push({
      type: "enum",
      content: getEnum("", enumDescriptorProto),
    });
  });

  const messages = fileDescriptorProto.getMessageTypeList();
  messages.forEach((descriptor) => {
    const messageName = descriptor.getName();
    if (messageName) {
      const children = walk(applyNamespace("", messageName), descriptor);
      typeFile.types.push({
        type: "message",
        content: getMessage("", descriptor),
        children,
      });
    }
  });

  typeFile.services = fileDescriptorProto.getServiceList().map((service) => ({
    name: service.getName() ?? "",
    methods: service.getMethodList().map((method) => {
      processIdentifier(method.getInputType() ?? "");
      processIdentifier(method.getOutputType() ?? "");

      return {
        name: method.getName() ?? "",
        input: removePackagePrefix(
          method.getInputType() ?? "",
          identifierTable,
          fileDescriptorProto
        ),
        output: removePackagePrefix(
          method.getOutputType() ?? "",
          identifierTable,
          fileDescriptorProto
        ),
      };
    }),
  }));

  // add comments
  const comments = fileDescriptorProto
    .getSourceCodeInfo()
    ?.getLocationList()
    .filter((x) => x.hasLeadingComments() || x.hasTrailingComments());

  comments?.forEach((comment) => {
    const content = {
      leading: comment.getLeadingComments(),
      trailing: comment.getTrailingComments(),
    };
    const path = comment.getPathList();
    const first = path.shift();
    let types = typeFile.types;

    function addCommentToEnum() {
      const idx = path.shift();
      if (idx === undefined) {
        return;
      }

      const _enum = types.filter((t) => t.type === "enum")[idx]
        .content as EnumOpts;

      // enum comment
      if (path.length === 0) {
        _enum.comments = content;
        // value comment
      } else if (path.shift() === EnumLabel.Value) {
        const valueIdx = path.shift();
        if (valueIdx === undefined) {
          return;
        }

        _enum.values[valueIdx].comments = content;
      }
    }

    function addCommentToMessage() {
      const idx = path.shift();
      if (idx === undefined) {
        return;
      }

      const message = types.filter((t) => t.type === "message")[
        idx
      ] as MessageType;

      // message comment
      if (path.length === 0) {
        message.content.comments = content;
      } else {
        const next = path.shift();
        if (next === undefined) {
          return;
        }

        if (next === MessageLabel.Field) {
          const fieldIdx = path.shift();
          if (fieldIdx === undefined) {
            return;
          }
          message.content.fields[fieldIdx].comments = content;
        } else if (next === MessageLabel.Enum) {
          types = message.children;
          addCommentToEnum();
        } else if (next === MessageLabel.Nested) {
          types = message.children;
          addCommentToMessage();
        }
      }
    }

    if (first === FileLabel.Enum) {
      addCommentToEnum();
    } else if (first === FileLabel.Service) {
      const idx = path.shift();
      if (idx === undefined) {
        return;
      }

      const service = typeFile.services[idx];

      // service comment
      if (path.length === 0) {
        service.comments = content;
        // method comment
      } else if (path.shift() === ServiceLabel.Method) {
        const methodIdx = path.shift();
        if (methodIdx === undefined) {
          return;
        }

        service.methods[methodIdx].comments = content;
      }
    } else if (first === FileLabel.Message) {
      addCommentToMessage();
    }
  });

  return typeFile;
}
