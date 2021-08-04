"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTypes = exports.buildIdentifierTable = exports.getImportPath = exports.getClientFileName = exports.getServiceFileName = exports.getTypesFileName = exports.stripTSExtension = exports.stripProtoExtension = exports.getDescriptor = exports.commandIsInPath = exports.lowerCase = void 0;
const child_process_1 = require("child_process");
const path_1 = require("path");
const descriptor_pb_1 = require("google-protobuf/google/protobuf/descriptor_pb");
function lowerCase(str) {
    return str[0].toLowerCase() + str.slice(1);
}
exports.lowerCase = lowerCase;
function commandIsInPath(cmd) {
    try {
        child_process_1.execSync(`which ${cmd}`);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.commandIsInPath = commandIsInPath;
function getDescriptor(field, identifierTable, fileDescriptorProto) {
    var _a, _b, _c;
    const repeated = field.getLabel() === descriptor_pb_1.FieldDescriptorProto.Label.LABEL_REPEATED;
    const _type = field.getType();
    if (!_type) {
        throw new Error("Field has no type");
    }
    switch (_type) {
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_DOUBLE: {
            return {
                defaultValue: '0',
                repeated,
                tsType: "number",
                read: "readDouble",
                write: repeated ? "writeRepeatedDouble" : "writeDouble",
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_FLOAT: {
            return {
                defaultValue: '0',
                repeated,
                tsType: "number",
                read: "readFloat",
                write: repeated ? "writeRepeatedFloat" : "writeFloat"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_INT64: {
            return {
                defaultValue: "''",
                repeated,
                tsType: "string",
                read: "readInt64String",
                write: repeated ? "writeRepeatedInt64String" : "writeInt64String"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_UINT64: {
            return {
                defaultValue: "''",
                repeated,
                tsType: "string",
                read: "readUint64String",
                write: repeated ? "writeRepeatedInt64String" : "writeUint64String"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_INT32: {
            return {
                defaultValue: '0',
                repeated,
                tsType: "number",
                read: "readInt32",
                write: repeated ? "writeRepeatedInt32" : "writeInt32"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_UINT64: {
            return {
                defaultValue: "''",
                repeated,
                tsType: "string",
                read: "readUint64String",
                write: repeated ? "writeRepeatedUint32String" : "writeUint64String"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_FIXED64: {
            return {
                defaultValue: repeated ? '[]' : "''",
                repeated,
                tsType: "string",
                read: "readFixed64String",
                write: repeated ? "writeRepeatedFixed64String" : "writeFixed64String"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_ENUM: {
            const _type = (_a = field.getTypeName()) !== null && _a !== void 0 ? _a : '';
            const name = removePackagePrefix(_type, identifierTable, fileDescriptorProto);
            return {
                defaultValue: '0',
                repeated,
                tsType: name,
                read: "readEnum",
                write: repeated ? "writeRepeatedEnum" : "writeEnum"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_FIXED32: {
            return {
                defaultValue: '0',
                repeated,
                tsType: "number",
                read: "readFixed32",
                write: repeated ? "writeRepeatedFixed32" : "writeFixed32"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_BOOL: {
            return {
                defaultValue: 'false',
                repeated,
                tsType: "boolean",
                read: "readBool",
                write: repeated ? "writeRepeatedBool" : "writeBool"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_GROUP: {
            const name = (_b = field.getName()) !== null && _b !== void 0 ? _b : '';
            throw new Error(`Groups are not supported. Found group ${name}`);
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_MESSAGE: {
            const _type = (_c = field.getTypeName()) !== null && _c !== void 0 ? _c : '';
            const name = removePackagePrefix(_type, identifierTable, fileDescriptorProto);
            return {
                defaultValue: 'undefined',
                repeated,
                tsType: name,
                read: "readMessage",
                write: repeated ? "writeRepeatedMessage" : "writeMessage"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_STRING: {
            return {
                defaultValue: "''",
                repeated,
                tsType: "string",
                read: "readString",
                write: repeated ? "writeRepeatedString" : "writeString"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_BYTES: {
            return {
                defaultValue: "new Uint8Array()",
                repeated,
                tsType: "Uint8Array",
                read: "readBytes",
                write: repeated ? "writeRepeatedBytes" : "writeBytes"
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_UINT32: {
            return {
                defaultValue: '0',
                repeated,
                tsType: "number",
                read: "readUint32",
                write: repeated ? "writeUint32" : "writeUint32",
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_SFIXED32: {
            return {
                defaultValue: '0',
                repeated,
                tsType: "number",
                read: "readSfixed32",
                write: repeated ? "writeSfixed32" : "writeSfixed32",
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_SFIXED64: {
            return {
                defaultValue: "''",
                repeated,
                tsType: "string",
                read: "readSfixed64",
                write: repeated ? "writeSfixed64" : "writeSfixed64",
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_SINT32: {
            return {
                defaultValue: '0',
                repeated,
                tsType: "number",
                read: "readSint32",
                write: repeated ? "writeRepeatedSint32" : "writeSint32",
            };
        }
        case descriptor_pb_1.FieldDescriptorProto.Type.TYPE_SINT64: {
            return {
                defaultValue: "''",
                repeated,
                tsType: "string",
                read: "readSint64",
                write: repeated ? "writeRepeatedSint64String" : "writeSint64String",
            };
        }
        default: {
            const _exhaust = _type;
            return _exhaust;
        }
    }
}
exports.getDescriptor = getDescriptor;
function stripProtoExtension(protoFileName) {
    return protoFileName.replace(".proto", "");
}
exports.stripProtoExtension = stripProtoExtension;
function stripTSExtension(filename) {
    return filename.replace(".ts", "");
}
exports.stripTSExtension = stripTSExtension;
function getTypesFileName(protoFileName) {
    return stripProtoExtension(protoFileName) + ".pb.ts";
}
exports.getTypesFileName = getTypesFileName;
function getServiceFileName(protoFileName) {
    return stripProtoExtension(protoFileName) + ".service.ts";
}
exports.getServiceFileName = getServiceFileName;
function getClientFileName(protoFileName) {
    return stripProtoExtension(protoFileName) + ".client.ts";
}
exports.getClientFileName = getClientFileName;
function getImportPath(sourceFile, dependencyFile) {
    const importPath = stripTSExtension(path_1.relative(path_1.dirname(sourceFile), dependencyFile));
    return importPath.startsWith("..") ? importPath : `./${importPath}`;
}
exports.getImportPath = getImportPath;
function applyNamespace(namespacing, name, { removeLeadingPeriod } = { removeLeadingPeriod: false }) {
    let _namespace = namespacing + "." + name;
    if (removeLeadingPeriod && _namespace.startsWith('.')) {
        _namespace = _namespace.slice(1);
    }
    return _namespace;
}
/**
 * Example
 *
 * '.google.protobuf.Timestamp', 'google/protobuf/timestamp.proto',jj
 * '.foo.Tate', 'foo.proto',
 * '.Person', 'bob.proto',
 * '.Person.PhoneType', 'bob.proto',
 * '.AddressBook', 'bob.proto'
 */
function buildIdentifierTable(request) {
    const table = [];
    request.getProtoFileList().forEach((fileDescriptorProto) => {
        var _a;
        const protoFilePath = fileDescriptorProto.getName();
        if (!protoFilePath) {
            return;
        }
        const _package = (_a = fileDescriptorProto.getPackage()) !== null && _a !== void 0 ? _a : '';
        function addEntry(namespacing, name) {
            table.push([applyNamespace(namespacing, name), protoFilePath, _package]);
        }
        function walk(namespacing, descriptorProto) {
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
exports.buildIdentifierTable = buildIdentifierTable;
function getIdentifierEntryFromTable(identifier, identifiers, fileDescriptorProto) {
    const file = fileDescriptorProto.getName();
    const dependencyFiles = [file].concat(fileDescriptorProto.getDependencyList());
    const dep = identifiers.find(([namespacedIdentifier, file]) => {
        return (namespacedIdentifier === identifier &&
            dependencyFiles.includes(file));
    });
    if (!dep) {
        console.error(identifiers);
        console.error(`Unknown identifier: ${identifier}`);
        throw new Error(`Unknown identifier: ${identifier}`);
    }
    return dep;
}
function getImportForIdentifier(identifier, identifiers, fileDescriptorProto) {
    var _a, _b;
    const dep = getIdentifierEntryFromTable(identifier, identifiers, fileDescriptorProto);
    const sourceFile = (_a = fileDescriptorProto.getName()) !== null && _a !== void 0 ? _a : '';
    const path = getImportPath(sourceFile, getTypesFileName(dep[1]));
    const dependencyIdentifier = (_b = identifier.split('.').pop()) !== null && _b !== void 0 ? _b : '';
    return { identifier: dependencyIdentifier, path };
}
function identifierIsDefinedInFile(identifier, identifierTable, fileDescriptorProto) {
    return identifierTable.find(([namespacedIdentifier, file]) => identifier === namespacedIdentifier && file === fileDescriptorProto.getName()) !== undefined;
}
function removePackagePrefix(identifier, identifiers, fileDescriptorProto) {
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
function processTypes(fileDescriptorProto, identifierTable) {
    const typeFile = {
        packageName: fileDescriptorProto.getPackage(),
        imports: [],
        services: [],
        types: [],
    };
    function addIdentiferToImports(identifier) {
        const _import = getImportForIdentifier(identifier, identifierTable, fileDescriptorProto);
        const exisitingImport = typeFile.imports.find(({ path }) => path === _import.path);
        if (exisitingImport) {
            exisitingImport.identifiers.push(_import.identifier);
        }
        else {
            typeFile.imports.push({
                identifiers: [_import.identifier],
                path: _import.path
            });
        }
    }
    function getEnum(namespacing, node) {
        const name = node.getName();
        if (!name) {
            throw new Error(`Expected name for ${node}`);
        }
        const opts = {
            name,
            fullyQualifiedName: applyNamespace(namespacing, name, { removeLeadingPeriod: true }),
            values: node
                .getValueList()
                .map((value) => { var _a, _b; return [(_a = value.getName()) !== null && _a !== void 0 ? _a : "", (_b = value.getNumber()) !== null && _b !== void 0 ? _b : 0]; }),
        };
        return opts;
    }
    function getMessage(namespacing, node) {
        const name = node.getName();
        if (!name) {
            throw new Error(`Expected name for ${node}`);
        }
        const opts = {
            name,
            fullyQualifiedName: applyNamespace(namespacing, name, { removeLeadingPeriod: true }),
            fields: node
                .getFieldList()
                .map((value) => {
                var _a, _b, _c;
                const descriptor = getDescriptor(value, identifierTable, fileDescriptorProto);
                if (value.getType() === descriptor_pb_1.FieldDescriptorProto.Type.TYPE_MESSAGE || value.getType() === descriptor_pb_1.FieldDescriptorProto.Type.TYPE_ENUM) {
                    processIdentifier((_a = value.getTypeName()) !== null && _a !== void 0 ? _a : "");
                }
                return {
                    name: (_b = value.getName()) !== null && _b !== void 0 ? _b : '',
                    index: (_c = value.getNumber()) !== null && _c !== void 0 ? _c : 0,
                    ...descriptor
                };
            }),
        };
        return opts;
    }
    function processIdentifier(identifier) {
        if (identifierIsDefinedInFile(identifier, identifierTable, fileDescriptorProto)) {
            return;
        }
        addIdentiferToImports(identifier);
    }
    function walk(namespacing, descriptorProto) {
        const types = [];
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
    typeFile.services = fileDescriptorProto.getServiceList().map(service => {
        var _a;
        return ({
            name: (_a = service.getName()) !== null && _a !== void 0 ? _a : '',
            methods: service.getMethodList().map(method => {
                var _a, _b, _c;
                return ({
                    name: (_a = method.getName()) !== null && _a !== void 0 ? _a : '',
                    input: removePackagePrefix((_b = method.getInputType()) !== null && _b !== void 0 ? _b : '', identifierTable, fileDescriptorProto),
                    output: removePackagePrefix((_c = method.getOutputType()) !== null && _c !== void 0 ? _c : '', identifierTable, fileDescriptorProto),
                });
            })
        });
    });
    return typeFile;
}
exports.processTypes = processTypes;
