# TwirpScript

<blockquote>Autogenerate Twirp Clients and Servers in TypeScript</blockquote>

<br />

<a href="https://www.npmjs.com/package/twirpscript">
  <img src="https://img.shields.io/npm/v/twirpscript.svg">
</a>
<a href="https://github.com/tatethurston/twirpscript/blob/master/LICENSE">
  <img src="https://img.shields.io/npm/l/twirpscript.svg">
</a>
<a href="https://www.npmjs.com/package/twirpscript">
  <img src="https://img.shields.io/npm/dy/twirpscript.svg">
</a>
<a href="https://github.com/tatethurston/twirpscript/actions/workflows/ci.yml">
  <img src="https://github.com/tatethurston/twirpscript/actions/workflows/ci.yml/badge.svg">
</a>

## What is this? 🧐

TwirpScript is an implementation of the [Twirp wire protocol](https://github.com/twitchtv/twirp/blob/main/PROTOCOL.md) for TypeScript. It generates idiomatic TypeScript clients and servers from `.proto` service specifications. The generated clients can be used in the browser. This enables type safe communication between the client and server for web applications, as well as reduced payload sizes when using `protobuf` as the serialization format.

Twirp is a simple RPC framework built on [protocol buffers](https://developers.google.com/protocol-buffers/). You define a service in a `.proto` specification file, and Twirp will generate servers and clients for that service. You fill in the business logic that powers the server, and Twirp handles the boilerplate. In addition to abstracting away boilerplate, this provides type safe interactions between the client and the server.

To learn more about the motivation behind Twirp (and a comparison to REST APIs and gRPC), check out the [announcement blog](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/).

## Features 🛠

1. One runtime dependency: Google's [protobuf js](https://github.com/protocolbuffers/protobuf/tree/master/js) for protobuf serialization / deserialization.
2. A custom TypeScript plugin for `protoc` that generates idiomatic JavaScript interfaces. None of the Java idioms that `protoc --js_out` generates like the `{$field}List` naming for repeated fields or the various getter / setter methods. The TwirpScript plugin uses plain JavaScript objects over classes.
3. Comments in `proto` files become [TSDoc](https://github.com/microsoft/tsdoc) comments that will show documentation inline in supported editors.
4. Isomorphic clients that work server side\* and are also optimized for the browser. The clients are built with [tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) in mind. You you can drop the one runtime dependency, `protobuf js`, when using only the generated JSON clients and a bundler that supports tree shaking.

\* Requires that the runtime provides `fetch`. See [Compatibility](#compatibility-) for more details.

## Installation 📦

1. Install the [protocol buffers compiler](https://developers.google.com/protocol-buffers):
   `brew install protobuf` (MacOS. [See other installation options](https://grpc.io/docs/protoc-installation/))

1. Add this package to your project:
   `yarn add twirpscript`

## Getting Started

### Overview 📖

To make a Twirp service:

1. Define your service in a `.proto` file.
2. Run `yarn twirpscript` to generate TypeScript code from your `.proto` file. This will generate JSON and Protobuf clients, a service interface, and server utilities.
3. Implement the generated service interface to build your service.
4. Attach your implemented service to your application server.
5. Use the generated client to make requests to your server.

#### 1. Define your service

Create a `proto` specification file:

`src/server/haberdasher/haberdasher.proto`

```protobuf
syntax = "proto3";

// Haberdasher service makes hats for clients.
service Haberdasher {
  // MakeHat produces a hat of mysterious, randomly-selected color!
  rpc MakeHat(Size) returns (Hat);
}

// Size of a Hat, in inches.
message Size {
  int32 inches = 1; // must be > 0
}

// A Hat is a piece of headwear made by a Haberdasher.
message Hat {
  int32 inches = 1;
  string color = 2; // anything but "invisible"
  string name = 3; // i.e. "bowler"
}
```

#### 2. Run `yarn twirpscript`

This will generate `haberdasher.pb.ts` in the same directory as as `haberdasher.proto`. Any comments will become [TSDoc](https://github.com/microsoft/tsdoc) comments and will show inline in supported editors.

`yarn twirpscript` will compile all`.proto` files in your project.

#### 3. Implement the generated service interface to build your service.

`src/server/haberdasher/index.ts`

```ts
import { HaberdasherService, createHaberdasherHandler } from "./service.pb";

const Haberdasher: HaberdasherService = {
  MakeHat: (size) => {
    return {
      inches: size.inches,
      color: "red",
      name: "fedora",
    };
  },
};

export const HaberdasherHandler = createHaberdasherHandler(HaberdasherService);
```

#### 4. Attach your implemented service to your application server.

`src/server/index.ts`

```ts
import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { HaberdasherHandler } from "./haberdasher";

const PORT = 8080;

const app = createTwirpServer([HaberdasherHandler]);

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
```

#### 5. Client

That's it for the server! Now you can use the generated clients to make `json` or `protobuf` requests to your server:

`src/client.ts`

```ts
import { MakeHat } from "./server/haberdasher/haberdasher.pb";

const hat = await MakeHat({ inches: 12 }, { baseURL: "http://localhost:8080" });
console.log(hat);
```

#### Connecting to an existing Twirp server and only need a TypeScript client?

1. Get your service `.proto` file.
2. Run `yarn twirpscript` to generate TypeScript code from your `.proto` file.
3. Use the generated client to make requests to your server.

## Examples 🚀

The documentation is a work in progress. Checkout the examples in the examples directory:

- The [fullstack example](https://github.com/tatethurston/twirpscript/blob/main/examples/basic-fullstack) shows a minimal browser client and server implementation.
- The [authentication example](https://github.com/tatethurston/twirpscript/blob/main/examples/authentication) extends the fullstack example to demonstrate authentication using tokens.

The examples also include testing via [jest](https://jestjs.io/).

## Compatibility 🛠

The default clients use `fetch` so your runtime must include `fetch`. See an [example](https://github.com/tatethurston/TwirpScript/blob/main/examples/twirp-clientcompat/src/client-harness.ts#L11-L12) from the `clientcompat` test example.

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/twirpscript/blob/main/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/twirpscript/blob/main/LICENSE).
