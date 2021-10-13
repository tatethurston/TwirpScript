// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: src/protos/authentication.proto
import {
  BinaryReader,
  BinaryWriter,
  JSONrequest,
  PBrequest,
  createMethodHandler,
} from "twirpscript";
import type {
  ByteSource,
  ClientConfiguration,
  ServiceHandler,
} from "twirpscript";

//========================================//
//     Authentication Protobuf Client     //
//========================================//

/**
 * Login in a user
 */
export async function Login(
  credentials: Credentials,
  config?: ClientConfiguration
): Promise<CurrentUser> {
  const response = await PBrequest(
    "/twirp/Authentication/Login",
    Credentials.encode(credentials),
    config
  );
  return CurrentUser.decode(response);
}

//========================================//
//       Authentication JSON Client       //
//========================================//

/**
 * Login in a user
 */
export async function LoginJSON(
  credentials: Credentials,
  config?: ClientConfiguration
): Promise<CurrentUser> {
  const response = await JSONrequest<CurrentUser>(
    "/twirp/Authentication/Login",
    credentials,
    config
  );
  return response;
}

//========================================//
//         Authentication Service         //
//========================================//

export interface AuthenticationService<Context = unknown> {
  /**
   * Login in a user
   */
  Login: (
    credentials: Credentials,
    context: Context
  ) => Promise<CurrentUser> | CurrentUser;
}

export function createAuthenticationHandler<Context>(
  service: AuthenticationService<Context>
): ServiceHandler<Context> {
  return {
    path: "Authentication",
    methods: {
      Login: createMethodHandler({
        handler: service.Login,
        encode: CurrentUser.encode,
        decode: Credentials.decode,
      }),
    },
  };
}

//========================================//
//                 Types                  //
//========================================//

export interface CurrentUser {
  username: string;
  token: string;
}

export interface Credentials {
  username: string;
  password: string;
}

//========================================//
//        Protobuf Encode / Decode        //
//========================================//

export const CurrentUser = {
  writeMessage: function (msg: CurrentUser, writer: BinaryWriter): void {
    if (msg.username) {
      writer.writeString(1, msg.username);
    }
    if (msg.token) {
      writer.writeString(2, msg.token);
    }
  },

  encode: function (currentUser: CurrentUser): Uint8Array {
    const writer = new BinaryWriter();
    CurrentUser.writeMessage(currentUser, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<CurrentUser>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.username = reader.readString();
          break;
        }
        case 2: {
          msg.token = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    if (!msg.username) {
      msg.username = "";
    }
    if (!msg.token) {
      msg.token = "";
    }
  },

  decode: function (bytes: ByteSource): CurrentUser {
    const reader = new BinaryReader(bytes);
    const message = {};
    CurrentUser.readMessage(message, reader);
    return message as CurrentUser;
  },
};

export const Credentials = {
  writeMessage: function (msg: Credentials, writer: BinaryWriter): void {
    if (msg.username) {
      writer.writeString(1, msg.username);
    }
    if (msg.password) {
      writer.writeString(2, msg.password);
    }
  },

  encode: function (credentials: Credentials): Uint8Array {
    const writer = new BinaryWriter();
    Credentials.writeMessage(credentials, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<Credentials>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.username = reader.readString();
          break;
        }
        case 2: {
          msg.password = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    if (!msg.username) {
      msg.username = "";
    }
    if (!msg.password) {
      msg.password = "";
    }
  },

  decode: function (bytes: ByteSource): Credentials {
    const reader = new BinaryReader(bytes);
    const message = {};
    Credentials.readMessage(message, reader);
    return message as Credentials;
  },
};
