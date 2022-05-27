// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: src/clientcompat.proto
/* eslint-disable */

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
export { MIN_SUPPORTED_VERSION_0_0_56 } from "twirpscript";

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
  const response = await JSONrequest(
    "/twirp.clientcompat.CompatService/Method",
    ReqJSON.encode(req),
    config
  );
  return RespJSON.decode(response);
}

export async function NoopMethodJSON(
  empty: Empty,
  config?: ClientConfiguration
): Promise<Empty> {
  const response = await JSONrequest(
    "/twirp.clientcompat.CompatService/NoopMethod",
    EmptyJSON.encode(empty),
    config
  );
  return EmptyJSON.decode(response);
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
        input: { protobuf: Req, json: ReqJSON },
        output: { protobuf: Resp, json: RespJSON },
      },
      NoopMethod: {
        name: "NoopMethod",
        handler: service.NoopMethod,
        input: { protobuf: Empty, json: EmptyJSON },
        output: { protobuf: Empty, json: EmptyJSON },
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

export declare namespace ClientCompatMessage {
  export type CompatServiceMethod = "NOOP" | "METHOD";
}

//========================================//
//        Protobuf Encode / Decode        //
//========================================//

export const Empty = {
  /**
   * Serializes Empty to protobuf.
   */
  encode: function (_msg?: Partial<Empty>): Uint8Array {
    return new Uint8Array();
  },

  /**
   * Deserializes Empty from protobuf.
   */
  decode: function (_bytes?: ByteSource): Empty {
    return {};
  },

  /**
   * Initializes Empty with all fields set to their default value.
   */
  initialize: function (): Empty {
    return {};
  },

  /**
   * @private
   */
  _writeMessage: function (
    _msg: Partial<Empty>,
    writer: BinaryWriter
  ): BinaryWriter {
    return writer;
  },

  /**
   * @private
   */
  _readMessage: function (_msg: Empty, _reader: BinaryReader): Empty {
    return _msg;
  },
};

export const Req = {
  /**
   * Serializes Req to protobuf.
   */
  encode: function (msg: Partial<Req>): Uint8Array {
    return Req._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes Req from protobuf.
   */
  decode: function (bytes: ByteSource): Req {
    return Req._readMessage(Req.initialize(), new BinaryReader(bytes));
  },

  /**
   * Initializes Req with all fields set to their default value.
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
};

export const Resp = {
  /**
   * Serializes Resp to protobuf.
   */
  encode: function (msg: Partial<Resp>): Uint8Array {
    return Resp._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes Resp from protobuf.
   */
  decode: function (bytes: ByteSource): Resp {
    return Resp._readMessage(Resp.initialize(), new BinaryReader(bytes));
  },

  /**
   * Initializes Resp with all fields set to their default value.
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
};

export const ClientCompatMessage = {
  /**
   * Serializes ClientCompatMessage to protobuf.
   */
  encode: function (msg: Partial<ClientCompatMessage>): Uint8Array {
    return ClientCompatMessage._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },

  /**
   * Deserializes ClientCompatMessage from protobuf.
   */
  decode: function (bytes: ByteSource): ClientCompatMessage {
    return ClientCompatMessage._readMessage(
      ClientCompatMessage.initialize(),
      new BinaryReader(bytes)
    );
  },

  /**
   * Initializes ClientCompatMessage with all fields set to their default value.
   */
  initialize: function (): ClientCompatMessage {
    return {
      serviceAddress: "",
      method: ClientCompatMessage.CompatServiceMethod._fromInt(0),
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
      ClientCompatMessage.CompatServiceMethod._toInt(msg.method)
    ) {
      writer.writeEnum(
        2,
        ClientCompatMessage.CompatServiceMethod._toInt(msg.method)
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
          msg.method = ClientCompatMessage.CompatServiceMethod._fromInt(
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

  CompatServiceMethod: {
    NOOP: "NOOP",
    METHOD: "METHOD",
    /**
     * @private
     */
    _fromInt: function (i: number): ClientCompatMessage.CompatServiceMethod {
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
    /**
     * @private
     */
    _toInt: function (i: ClientCompatMessage.CompatServiceMethod): number {
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
  } as const,
};

//========================================//
//          JSON Encode / Decode          //
//========================================//

export const EmptyJSON = {
  /**
   * Serializes Empty to JSON.
   */
  encode: function (_msg?: Partial<Empty>): string {
    return "{}";
  },

  /**
   * Deserializes Empty from JSON.
   */
  decode: function (_json?: string): Empty {
    return {};
  },

  /**
   * Initializes Empty with all fields set to their default value.
   */
  initialize: function (): Empty {
    return {};
  },

  /**
   * @private
   */
  _writeMessage: function (_msg: Partial<Empty>): Record<string, unknown> {
    return {};
  },

  /**
   * @private
   */
  _readMessage: function (msg: Empty, _json: any): Empty {
    return msg;
  },
};

export const ReqJSON = {
  /**
   * Serializes Req to JSON.
   */
  encode: function (msg: Partial<Req>): string {
    return JSON.stringify(ReqJSON._writeMessage(msg));
  },

  /**
   * Deserializes Req from JSON.
   */
  decode: function (json: string): Req {
    return ReqJSON._readMessage(ReqJSON.initialize(), JSON.parse(json));
  },

  /**
   * Initializes Req with all fields set to their default value.
   */
  initialize: function (): Req {
    return {
      v: "",
    };
  },

  /**
   * @private
   */
  _writeMessage: function (msg: Partial<Req>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.v) {
      json.v = msg.v;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Req, json: any): Req {
    const _v = json.v;
    if (_v) {
      msg.v = _v;
    }
    return msg;
  },
};

export const RespJSON = {
  /**
   * Serializes Resp to JSON.
   */
  encode: function (msg: Partial<Resp>): string {
    return JSON.stringify(RespJSON._writeMessage(msg));
  },

  /**
   * Deserializes Resp from JSON.
   */
  decode: function (json: string): Resp {
    return RespJSON._readMessage(RespJSON.initialize(), JSON.parse(json));
  },

  /**
   * Initializes Resp with all fields set to their default value.
   */
  initialize: function (): Resp {
    return {
      v: 0,
    };
  },

  /**
   * @private
   */
  _writeMessage: function (msg: Partial<Resp>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.v) {
      json.v = msg.v;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Resp, json: any): Resp {
    const _v = json.v;
    if (_v) {
      msg.v = _v;
    }
    return msg;
  },
};

export const ClientCompatMessageJSON = {
  /**
   * Serializes ClientCompatMessage to JSON.
   */
  encode: function (msg: Partial<ClientCompatMessage>): string {
    return JSON.stringify(ClientCompatMessageJSON._writeMessage(msg));
  },

  /**
   * Deserializes ClientCompatMessage from JSON.
   */
  decode: function (json: string): ClientCompatMessage {
    return ClientCompatMessageJSON._readMessage(
      ClientCompatMessageJSON.initialize(),
      JSON.parse(json)
    );
  },

  /**
   * Initializes ClientCompatMessage with all fields set to their default value.
   */
  initialize: function (): ClientCompatMessage {
    return {
      serviceAddress: "",
      method: ClientCompatMessage.CompatServiceMethod._fromInt(0),
      request: new Uint8Array(),
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<ClientCompatMessage>
  ): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.serviceAddress) {
      json.serviceAddress = msg.serviceAddress;
    }
    if (
      msg.method &&
      ClientCompatMessageJSON.CompatServiceMethod._toInt(msg.method)
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

  CompatServiceMethod: {
    NOOP: "NOOP",
    METHOD: "METHOD",
    /**
     * @private
     */
    _fromInt: function (i: number): ClientCompatMessage.CompatServiceMethod {
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
    /**
     * @private
     */
    _toInt: function (i: ClientCompatMessage.CompatServiceMethod): number {
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
  } as const,
};
