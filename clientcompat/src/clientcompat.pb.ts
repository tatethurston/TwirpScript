// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: src/clientcompat.proto

import type { ByteSource, ClientConfiguration } from "twirpscript";
import {
  BinaryReader,
  BinaryWriter,
  encodeBase64Bytes,
  decodeBase64Bytes,
  JSONrequest,
  PBrequest,
} from "twirpscript";
// This is the minimum version supported by the current runtime.
// If this line fails typechecking, breaking changes have been introduced and this
// file needs to be regenerated by running `yarn twirpscript`.
export { MIN_SUPPORTED_VERSION_0_0_48 } from "twirpscript";

//========================================//
//     CompatService Protobuf Client      //
//========================================//

export async function Method(
  req: Req,
  config?: ClientConfiguration
): Promise<Resp> {
  const response = await PBrequest(
    "/twirp.clientcompat.CompatService/Method",
    Req.encode(req),
    config
  );
  return Resp.decode(response);
}

export async function NoopMethod(
  empty: Empty,
  config?: ClientConfiguration
): Promise<Empty> {
  const response = await PBrequest(
    "/twirp.clientcompat.CompatService/NoopMethod",
    Empty.encode(empty),
    config
  );
  return Empty.decode(response);
}

//========================================//
//       CompatService JSON Client        //
//========================================//

export async function MethodJSON(
  req: Req,
  config?: ClientConfiguration
): Promise<Resp> {
  const response = await JSONrequest<Resp>(
    "/twirp.clientcompat.CompatService/Method",
    req,
    config
  );
  return response;
}

export async function NoopMethodJSON(
  empty: Empty,
  config?: ClientConfiguration
): Promise<Empty> {
  const response = await JSONrequest<Empty>(
    "/twirp.clientcompat.CompatService/NoopMethod",
    empty,
    config
  );
  return response;
}

//========================================//
//             CompatService              //
//========================================//

export interface CompatService<Context = unknown> {
  Method: (req: Req, context: Context) => Promise<Resp> | Resp;
  NoopMethod: (empty: Empty, context: Context) => Promise<Empty> | Empty;
}

export function createCompatService<Context>(service: CompatService<Context>) {
  return {
    name: "twirp.clientcompat.CompatService",
    methods: {
      Method: {
        name: "Method",
        handler: service.Method,
        input: Req,
        output: Resp,
      },
      NoopMethod: {
        name: "NoopMethod",
        handler: service.NoopMethod,
        input: Empty,
        output: Empty,
      },
    },
  } as const;
}

//========================================//
//                 Types                  //
//========================================//

export interface Empty {}

export interface Req {
  v: string;
}

export interface Resp {
  v: number;
}

export interface ClientCompatMessage {
  serviceAddress: string;
  method: ClientCompatMessage.CompatServiceMethod;
  request: Uint8Array;
}

declare namespace ClientCompatMessage {
  export type CompatServiceMethod = "NOOP" | "METHOD";
}

//========================================//
//        Protobuf Encode / Decode        //
//========================================//

export const Empty = {
  /**
   * Serializes a Empty to protobuf.
   */
  encode: function (_msg?: Partial<Empty>): Uint8Array {
    return new Uint8Array();
  },

  /**
   * Deserializes a Empty from protobuf.
   */
  decode: function (_bytes?: ByteSource): Empty {
    return {};
  },

  /**
   * Serializes a Empty to JSON.
   */
  encodeJSON: function (_msg?: Partial<Empty>): string {
    return "{}";
  },

  /**
   * Deserializes a Empty from JSON.
   */
  decodeJSON: function (_json?: string): Empty {
    return {};
  },

  /**
   * Initializes a Empty with all fields set to their default value.
   */
  initialize: function (): Empty {
    return {};
  },
};

export const Req = {
  /**
   * Serializes a Req to protobuf.
   */
  encode: function (msg: Partial<Req>): Uint8Array {
    return Req._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes a Req from protobuf.
   */
  decode: function (bytes: ByteSource): Req {
    return Req._readMessage(Req.initialize(), new BinaryReader(bytes));
  },

  /**
   * Serializes a Req to JSON.
   */
  encodeJSON: function (msg: Partial<Req>): string {
    return JSON.stringify(Req._writeMessageJSON(msg));
  },

  /**
   * Deserializes a Req from JSON.
   */
  decodeJSON: function (json: string): Req {
    return Req._readMessageJSON(Req.initialize(), JSON.parse(json));
  },

  /**
   * Initializes a Req with all fields set to their default value.
   */
  initialize: function (): Req {
    return {
      v: "",
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<Req>,
    writer: BinaryWriter
  ): BinaryWriter {
    if (msg.v) {
      writer.writeString(1, msg.v);
    }
    return writer;
  },

  /**
   * @private
   */
  _writeMessageJSON: function (msg: Partial<Req>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.v) {
      json.v = msg.v;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Req, reader: BinaryReader): Req {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.v = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  },

  /**
   * @private
   */
  _readMessageJSON: function (msg: Req, json: any): Req {
    const _v = json.v;
    if (_v) {
      msg.v = _v;
    }
    return msg;
  },
};

export const Resp = {
  /**
   * Serializes a Resp to protobuf.
   */
  encode: function (msg: Partial<Resp>): Uint8Array {
    return Resp._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes a Resp from protobuf.
   */
  decode: function (bytes: ByteSource): Resp {
    return Resp._readMessage(Resp.initialize(), new BinaryReader(bytes));
  },

  /**
   * Serializes a Resp to JSON.
   */
  encodeJSON: function (msg: Partial<Resp>): string {
    return JSON.stringify(Resp._writeMessageJSON(msg));
  },

  /**
   * Deserializes a Resp from JSON.
   */
  decodeJSON: function (json: string): Resp {
    return Resp._readMessageJSON(Resp.initialize(), JSON.parse(json));
  },

  /**
   * Initializes a Resp with all fields set to their default value.
   */
  initialize: function (): Resp {
    return {
      v: 0,
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<Resp>,
    writer: BinaryWriter
  ): BinaryWriter {
    if (msg.v) {
      writer.writeInt32(1, msg.v);
    }
    return writer;
  },

  /**
   * @private
   */
  _writeMessageJSON: function (msg: Partial<Resp>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.v) {
      json.v = msg.v;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Resp, reader: BinaryReader): Resp {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.v = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  },

  /**
   * @private
   */
  _readMessageJSON: function (msg: Resp, json: any): Resp {
    const _v = json.v;
    if (_v) {
      msg.v = _v;
    }
    return msg;
  },
};

export const ClientCompatMessage = {
  /**
   * Serializes a ClientCompatMessage to protobuf.
   */
  encode: function (msg: Partial<ClientCompatMessage>): Uint8Array {
    return ClientCompatMessage._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },

  /**
   * Deserializes a ClientCompatMessage from protobuf.
   */
  decode: function (bytes: ByteSource): ClientCompatMessage {
    return ClientCompatMessage._readMessage(
      ClientCompatMessage.initialize(),
      new BinaryReader(bytes)
    );
  },

  /**
   * Serializes a ClientCompatMessage to JSON.
   */
  encodeJSON: function (msg: Partial<ClientCompatMessage>): string {
    return JSON.stringify(ClientCompatMessage._writeMessageJSON(msg));
  },

  /**
   * Deserializes a ClientCompatMessage from JSON.
   */
  decodeJSON: function (json: string): ClientCompatMessage {
    return ClientCompatMessage._readMessageJSON(
      ClientCompatMessage.initialize(),
      JSON.parse(json)
    );
  },

  /**
   * Initializes a ClientCompatMessage with all fields set to their default value.
   */
  initialize: function (): ClientCompatMessage {
    return {
      serviceAddress: "",
      method: ClientCompatMessage.CompatServiceMethodFromInt(0),
      request: new Uint8Array(),
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<ClientCompatMessage>,
    writer: BinaryWriter
  ): BinaryWriter {
    if (msg.serviceAddress) {
      writer.writeString(1, msg.serviceAddress);
    }
    if (
      msg.method &&
      ClientCompatMessage.CompatServiceMethodToInt(msg.method)
    ) {
      writer.writeEnum(
        2,
        ClientCompatMessage.CompatServiceMethodToInt(msg.method)
      );
    }
    if (msg.request?.length) {
      writer.writeBytes(3, msg.request);
    }
    return writer;
  },

  /**
   * @private
   */
  _writeMessageJSON: function (
    msg: Partial<ClientCompatMessage>
  ): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.serviceAddress) {
      json.serviceAddress = msg.serviceAddress;
    }
    if (
      msg.method &&
      ClientCompatMessage.CompatServiceMethodToInt(msg.method)
    ) {
      json.method = msg.method;
    }
    if (msg.request?.length) {
      json.request = encodeBase64Bytes(msg.request);
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (
    msg: ClientCompatMessage,
    reader: BinaryReader
  ): ClientCompatMessage {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.serviceAddress = reader.readString();
          break;
        }
        case 2: {
          msg.method = ClientCompatMessage.CompatServiceMethodFromInt(
            reader.readEnum()
          );
          break;
        }
        case 3: {
          msg.request = reader.readBytes();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  },

  /**
   * @private
   */
  _readMessageJSON: function (
    msg: ClientCompatMessage,
    json: any
  ): ClientCompatMessage {
    const _serviceAddress = json.serviceAddress ?? json.service_address;
    if (_serviceAddress) {
      msg.serviceAddress = _serviceAddress;
    }
    const _method = json.method;
    if (_method) {
      msg.method = _method;
    }
    const _request = json.request;
    if (_request) {
      msg.request = decodeBase64Bytes(_request);
    }
    return msg;
  },

  CompatServiceMethod: { NOOP: "NOOP", METHOD: "METHOD" } as const,

  CompatServiceMethodFromInt: function (
    i: number
  ): ClientCompatMessage.CompatServiceMethod {
    switch (i) {
      case 0: {
        return "NOOP";
      }
      case 1: {
        return "METHOD";
      }
      // unknown values are preserved as numbers. this occurs when new enum values are introduced and the generated code is out of date.
      default: {
        return i as unknown as ClientCompatMessage.CompatServiceMethod;
      }
    }
  },

  CompatServiceMethodToInt: function (
    i: ClientCompatMessage.CompatServiceMethod
  ): number {
    switch (i) {
      case "NOOP": {
        return 0;
      }
      case "METHOD": {
        return 1;
      }
      // unknown values are preserved as numbers. this occurs when new enum values are introduced and the generated code is out of date.
      default: {
        return i as unknown as number;
      }
    }
  },
};
