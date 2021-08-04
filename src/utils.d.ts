import { CodeGeneratorRequest } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto, FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { BinaryReader, BinaryWriter } from 'google-protobuf';
export declare function lowerCase(str: string): string;
export declare function commandIsInPath(cmd: string): boolean;
declare type ReaderMethod = keyof BinaryReader;
declare type WriterMethod = keyof BinaryWriter;
interface Descriptor {
    defaultValue: string;
    read: ReaderMethod;
    repeated: boolean;
    tsType: string;
    write: WriterMethod;
}
export declare function getDescriptor(field: FieldDescriptorProto, identifierTable: IdentifierTable, fileDescriptorProto: FileDescriptorProto): Descriptor;
export declare function stripProtoExtension(protoFileName: string): string;
export declare function stripTSExtension(filename: string): string;
export declare function getTypesFileName(protoFileName: string): string;
export declare function getServiceFileName(protoFileName: string): string;
export declare function getClientFileName(protoFileName: string): string;
export declare function getImportPath(sourceFile: string, dependencyFile: string): string;
export declare type IdentifierTable = [namespacedIdentifier: string, file: string, _package: string][];
/**
 * Example
 *
 * '.google.protobuf.Timestamp', 'google/protobuf/timestamp.proto',jj
 * '.foo.Tate', 'foo.proto',
 * '.Person', 'bob.proto',
 * '.Person.PhoneType', 'bob.proto',
 * '.AddressBook', 'bob.proto'
 */
export declare function buildIdentifierTable(request: CodeGeneratorRequest): IdentifierTable;
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
export declare type ProtoTypes = {
    type: 'enum';
    content: EnumOpts;
} | {
    type: 'message';
    content: MessageOpts;
    children: ProtoTypes[];
};
export interface Service {
    name: string;
    methods: {
        name: string;
        input: string | undefined;
        output: string | undefined;
    }[];
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
export declare function processTypes(fileDescriptorProto: FileDescriptorProto, identifierTable: IdentifierTable): TypeFile;
export {};
