// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: src/clientcompat.proto

import type { ByteSource, ClientConfiguration } from "twirpscript";
import {
  BinaryReader,
  BinaryWriter,
  JSONrequest,
  PBrequest,
} from "twirpscript";
// This is the minimum version supported by the current runtime.
// If this line fails typechecking, breaking changes have been introduced and this
// file needs to be regenerated by running `yarn twirpscript`.
export { MIN_SUPPORTED_VERSION_0_0_34 } from "twirpscript";

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
//         CompatService Service          //
//========================================//

export interface CompatServiceService<Context = unknown> {
  Method: (req: Req, context: Context) => Promise<Resp> | Resp;
  NoopMethod: (empty: Empty, context: Context) => Promise<Empty> | Empty;
}

export function createCompatServiceHandler<Context>(
  service: CompatServiceService<Context>
) {
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
  service_address: string;
  method: ClientCompatMessage.CompatServiceMethod;
  request: Uint8Array;
}

export namespace ClientCompatMessage {
  export type CompatServiceMethod =
    typeof ClientCompatMessage.CompatServiceMethod[keyof typeof ClientCompatMessage.CompatServiceMethod];
}

//========================================//
//        Protobuf Encode / Decode        //
//========================================//

export const Empty = {
  /**
   * Serializes a Empty to protobuf.
   */
  encode: function (empty: Partial<Empty>): Uint8Array {
    return Empty._writeMessage(empty, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes a Empty from protobuf.
   */
  decode: function (bytes: ByteSource): Empty {
    return Empty._readMessage(Empty.initialize(), new BinaryReader(bytes));
  },

  /**
   * Initializes a Empty with all fields set to their default value.
   */
  initialize: function (): Empty {
    return {};
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<Empty>,
    writer: BinaryWriter
  ): BinaryWriter {
    return writer;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Empty, reader: BinaryReader): Empty {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  },
};

export const Req = {
  /**
   * Serializes a Req to protobuf.
   */
  encode: function (req: Partial<Req>): Uint8Array {
    return Req._writeMessage(req, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes a Req from protobuf.
   */
  decode: function (bytes: ByteSource): Req {
    return Req._readMessage(Req.initialize(), new BinaryReader(bytes));
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
   * Serializes a Resp to protobuf.
   */
  encode: function (resp: Partial<Resp>): Uint8Array {
    return Resp._writeMessage(resp, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes a Resp from protobuf.
   */
  decode: function (bytes: ByteSource): Resp {
    return Resp._readMessage(Resp.initialize(), new BinaryReader(bytes));
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
   * Serializes a ClientCompatMessage to protobuf.
   */
  encode: function (
    clientCompatMessage: Partial<ClientCompatMessage>
  ): Uint8Array {
    return ClientCompatMessage._writeMessage(
      clientCompatMessage,
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
   * Initializes a ClientCompatMessage with all fields set to their default value.
   */
  initialize: function (): ClientCompatMessage {
    return {
      service_address: "",
      method: 0,
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
    if (msg.service_address) {
      writer.writeString(1, msg.service_address);
    }
    if (msg.method) {
      writer.writeEnum(2, msg.method);
    }
    if (msg.request) {
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
          msg.service_address = reader.readString();
          break;
        }
        case 2: {
          msg.method =
            reader.readEnum() as ClientCompatMessage.CompatServiceMethod;
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

  CompatServiceMethod: { NOOP: 0, METHOD: 1 } as const,
};
