# TwirpScript

<blockquote> A protobuf RPC framework for JavaScript and TypeScript</blockquote>

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

TwirpScript is an implementation of [Twirp](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f). TwirpScript autogenerates Javascript or TypeScript clients and servers from [protocol buffers](https://developers.google.com/protocol-buffers/).

| Language       | Clients | Servers |
| -------------- | ------- | ------- |
| **JavaScript** | ✅      | ✅      |
| **Typescript** | ✅      | ✅      |

[TwirpScript implements the latest Twirp Wire Protocol (v7)](https://twitchtv.github.io/twirp/docs/spec_v7.html)

## Table of Contents

- [Overview](#overview)
- [Highlights 🛠](#highlights---)
- [Installation 📦](#installation---)
- [Getting Started](#getting-started)
  - [Overview 📖](#overview---)
  - [Configuring your Twirp Runtime](#configuring-your-twirp-runtime)
    - [Clients](#clients)
    - [Servers](#servers)
  - [Middleware / Interceptors](#middleware---interceptors)
    - [Client](#client)
    - [Server](#server)
  - [Hooks](#hooks)
    - [Client](#client-1)
    - [Server](#server-1)
- [Configuration 🛠](#configuration---)
- [Examples 🚀](#examples---)
- [Caveats, Warnings and Issues ⚠️](#caveats--warnings-and-issues---)
- [FAQ](#faq)
- [Contributing 👫](#contributing---)
- [Licensing 📃](#licensing---)

## Overview

TwirpScript is an implementation of the [Twirp wire protocol](https://github.com/twitchtv/twirp/blob/main/PROTOCOL.md) for JavaScript and TypeScript. It generates clients and servers from `.proto` service specifications. The generated clients can be used in the browser or for server to server communication. This enables type safe communication between the client and server, as well as reduced payload sizes when using `protobuf` as the serialization format.

Twirp is a simple RPC framework built on [protocol buffers](https://developers.google.com/protocol-buffers/). You define your service in a `.proto` specification file, and Twirp will generate client and service handlers for that service. You fill in the business logic that powers the server, and Twirp handles the boilerplate.

To learn more about the motivation behind Twirp (and a comparison to REST APIs and gRPC), check out the [announcement blog](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/).

## Highlights 🛠

1. TwirpScript clients can be consumed in the browser (or server\*) and are built with [tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) in mind so only the service methods consumed by the client end up in the final bundle.

2. The only runtime dependency is Google's [protobuf js](https://github.com/protocolbuffers/protobuf/tree/master/js). If you decide to use JSON instead of Protobuf as the serialization format, this dependency will be removed from clients via tree shaking.

3. Clients get in-editor API documentation. Comments in your `.proto` files become [TSDoc](https://github.com/microsoft/tsdoc) comments in the generated code that will show inline documentation in supported editors.

4. Generates idiomatic JavaScript / TypeScript code. None of the Java idioms that `protoc --js_out` generates such as the `List` suffix naming for repeated fields or the various getter and setter methods. TwirpScript generates and consumes plain JavaScript objects over classes.

\* Requires that the runtime provides `fetch`. See [caveats, warnings and issues ](#fetch) for more details.

## Installation 📦

1. Install the [protocol buffers compiler](https://developers.google.com/protocol-buffers):

   MacOS:
   `brew install protobuf`

   Linux:
   `apt install -y protobuf-compiler`

   Windows:
   `choco install protoc`

   Or install from a [precompiled binary](https://github.com/protocolbuffers/protobuf/releases).

1. Add this package to your project:
   `yarn add twirpscript` or `npm install twirpscript`

## Getting Started

### Overview 📖

1. Define your service in a `.proto` file.
2. Run `yarn twirpscript` to generate JavaScript or TypeScript code from your `.proto` file. This will generate JSON and Protobuf clients, a service interface, and service utilities.
3. If you only need a client, you're done! Use the generated client to make requests to your server.
4. Implement the generated service interface.
5. Add your implemented service to your application server's routes.

#### 1. Define your service

Create a `proto` specification file:

`src/protos/haberdasher.proto`

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

This will generate `haberdasher.pb.ts` (or `haberdasher.pb.js` for JavaScript users) in the same directory as as `haberdasher.proto`. Any comments will become [TSDoc](https://github.com/microsoft/tsdoc) comments and will show inline in supported editors.

`yarn twirpscript` will compile all`.proto` files in your project.

#### 3. Use the client

Use the generated clients to make `json` or `protobuf` requests to your server:

`src/client.ts`

```ts
import { MakeHat } from "../protos/haberdasher.pb";

const hat = await MakeHat({ inches: 12 }, { baseURL: "http://localhost:8080" });
console.log(hat);
```

If you have an existing Twirp server you're connecting to and only need a client, that's it! You're done. If you're implementing a service as well, keep reading.

#### 4. Implement the generated service interface

`src/server/haberdasher/index.ts`

```ts
import {
  HaberdasherService,
  createHaberdasherHandler,
} from "../../protos/haberdasher.pb";

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

#### 5. Connect your service to your application server

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

### Configuring your Twirp Runtime

#### Clients

Clients can be configured globally, at the RPC callsite, or with [middleware](https://github.com/tatethurston/TwirpScript/blob/main/README.md#client). The order of precedence is _global configuration_ < _call site configuration_ < _middleware_.

##### Configuration Options

| Name    | Description                                                                            | Type                   | Example                      |
| ------- | -------------------------------------------------------------------------------------- | ---------------------- | ---------------------------- |
| baseURL | The base URL for the RPC. The service path will be appended to this string.            | string                 | "https://my.server.com/"     |
| headers | HTTP headers to include in the RPC.                                                    | Record<string, string> | { "idempotency-key": "foo" } |
| prefix  | A path prefix such as "/my/custom/prefix". Defaults to "/twirp", but can be set to "". | string                 | "/my/custom/prefix"          |

##### Example

`src/client.ts`

```ts
import { MakeHat } from "./protos/haberdasher.pb";

const hat = await MakeHat({ inches: 12 }, { baseURL: "http://localhost:8080" });
console.log(hat);
```

`baseURL` can be _globally configured_, instead of providing it for every RPC call site:

```ts
import { client } from "twirpscript";

// http://localhost:8080 is now the default `baseURL` for _all_ TwirpScript RPCs
client.baseURL = "http://localhost:8080";

const hat = await MakeHat({ inches: 12 }); // We can omit `baseURL` because it has already been set
console.log(hat);
```

You can override a globally configured `baseURL` at the RPC call site:

```ts
import { client } from "twirpscript";
client.baseURL = "http://localhost:8080";

// This RPC will make a request to https://api.example.com instead of http://localhost:8080
const hat = await MakeHat(
  { inches: 12 },
  { baseURL: "https://api.example.com" }
);
console.log(hat);

// This RPC will make a request to http://localhost:8080
const otherHat = await MakeHat({ inches: 12 });
console.log(otherHat);
```

Client middleware can override both global and call site settings:

```ts
import { client } from "twirpscript";

client.baseURL = "http://localhost:8080";

client.use((config, next) => {
  return next({ ...config, baseURL: "https://www.foo.com" });
});

// This will make a request to https://www.foo.com instead of http://localhost:8080 or https://api.example.com"
const hat = await MakeHat(
  { inches: 12 },
  { baseURL: "https://api.example.com" }
);
console.log(hat);
```

The order of precedence is _global configuration_ < _call site configuration_ < _middleware_.

In addtion to `baseUrl`, `headers` can also be set at via _global configuration_, _call site configuration_ and _middleware_. `headers` defines key value pairs that become HTTP headers for the RPC:

```ts
import { client } from "twirpscript";

client.baseURL = "http://localhost:8080";

// setting a (non standard) HTTP "device-id" header via global configuration. This header will be sent for every RPC.
client.headers = { "device-id": getOrGenerateDeviceId() };

// setting an HTTP "authorization" header via middleware. This header will also be sent for every RPC.
client.use((config, next) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    config.headers["authorization"] = `bearer ${auth}`;
  }
  return next(config);
});

// setting a (non standard) HTTP "idempotency-key" header for this RPC call. This header will only be sent for this RPC.
const hat = await MakeHat(
  { inches: 12 },
  { headers: { "idempotency-key": "foo" } }
);
console.log(hat);
```

#### Servers

Servers can be configured by passing a configuration object to `createTwirpServer`.

##### Configuration Options

| Name   | Description                                                                            | Type   | Example             |
| ------ | -------------------------------------------------------------------------------------- | ------ | ------------------- |
| prefix | A path prefix such as "/my/custom/prefix". Defaults to "/twirp", but can be set to "". | string | "/my/custom/prefix" |

##### Example

```ts
import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { HaberdasherHandler } from "./haberdasher";

const PORT = 8080;

// This removes the "/twirp" prefix in the RPC path
const app = createTwirpServer([HaberdasherHandler], { prefix: "" });

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
```

### Middleware / Interceptors

TwirpScript's client and server runtimes can be configured via middleware.

#### Client

Clients can be configured via the `client` export's `use` method. `use` registers middleware to manipulate the client request / response lifecycle. The middleware handler will receive `config` and `next` parameters. `config` sets the headers and url for the RPC. `next` invokes the next handler in the chain -- either the next registered middleware, or the Twirp RPC.

Middleware is called in order of registration, with the Twirp RPC invoked last.

Because each middleware is responsible for invoking the next handler, middleware can do things like short circuit and return a response before the RPC is made, or inspect the returned response, enabling powerful patterns such as caching.

##### Client Middleware Example

```ts
import { client } from "twirpscript";

client.use((config, next) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    config.headers["authorization"] = `bearer ${auth}`;
  }
  return next(config);
});
```

#### Server

Servers can be configured via your `server`'s `use` method. `use` registers middleware to manipulate the server request / response lifecycle.

The middleware handler will receive `req`, `ctx` and `next` parameters. `req` is the incoming request. `ctx` is a request context object which will be passed to each middleware handler and finally the Twirp service handler you implemented. `ctx` enables you to pass extra parameters to your service handlers that are not available via your service's defined request parameters, and can be used to implement things such as authentication or rate limiting. `next` invokes the next handler in the chain -- either the next registered middleware, or the Twirp service handler you implemented.

Middleware is called in order of registration, with the Twirp service handler you implemented invoked last.

Because each middleware is responsible for invoking the next handler, middleware can do things like short circuit and return a response before your service handler is invoked, or inspect the returned response, enabling powerful patterns such as caching.

##### Server Middleware Example

```ts
import { createServer } from "http";
import { createTwirpServer, TwirpError } from "twirpscript";
import { AuthenticationHandler } from "./authentication";

interface Context {
  currentUser: { username: string };
}

const app = createTwirpServer<Context>([AuthenticationHandler]);

app.use(async (req, ctx, next) => {
  if (req.url?.startsWith(`/twirp/${AuthenticationHandler.path}`)) {
    return next();
  }

  const token = req.headers["authorization"]?.split("bearer")?.[1]?.trim();
  ctx.currentUser = getCurrentUser(token);

  if (!ctx.currentUser) {
    throw new TwirpError({
      code: "unauthenticated",
      msg: "Access denied",
    });
  } else {
    return next();
  }
};

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
```

### Hooks

TwirpScript clients and servers can be instrumented by listening to events at key moments during the request / response life cycle.

#### Client

##### Events

`requestPrepared` is called as soon as a request has been created and before
it has been sent to the Twirp server.

`responseReceived` is called after a request has finished sending.

`error` is called when an error occurs during the sending or receiving of a
request. In addition to `Config`, the error is also passed as an argument.

##### Example

```ts
import { client } from "twirpscript";

client.on("responseReceived", (config) => {
  // log or report
});
```

#### Server

##### Events

`requestReceived` is called as soon as a request enters the Twirp
server at the earliest available moment.

`requestRouted` is called when a request has been routed to a
particular method of the Twirp server.

`responsePrepared` is called when a request has been handled and a
response is ready to be sent to the client.

`responseSent` is called when all bytes of a response (including an error
response) have been written.

`error` is called when an error occurs while handling a request. In
addition to `Context`, the error is also passed as an argument.

##### Example

```ts
import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { HaberdasherHandler } from "./haberdasher";

const PORT = 8080;

const app = createTwirpServer([HaberdasherHandler]);

app.on("responseSent", (ctx) => {
  // log or report
});

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
```

## Configuration 🛠

TwirpScript aims to be zero config, but can be configured by creating a `.twirp.json` file in your project root.

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
  <td>root</td>
<td>
  The root directory. `.proto` files will be searched under this directory, and `proto` import paths will be resolved relative to this directory. TwirpScript will recursively search all subdirectories for `.proto` files.
 
  Defaults to the project root.
 
  Example:
 
  If we have the following project structure:
 
  ```
  /src
    A.proto
    B.proto
  ```
 
  Default:
 
  A.proto would `import` B.proto as follows:
 
  ```protobuf
  import "src/B.proto";
  ```
 
  Setting `root` to `src`:
 
  A.proto would `import` B.proto as follows:
 
  ```protobuf
  import "B.proto";
  ```
</td>
<td>string (filepath)</td>
</tr>
<tr>
  <td>dest</td>
<td>
  The destination folder for generated files.
 
  Defaults to colocating generated files with the corresponding `proto` definition.
  Example:
 
  If we have the following project structure:
 
  ```
  /src
    A.proto
    B.proto
  ```
 
  Default:
 
  TwirpScript will generate the following:
 
  ```
  /src
    A.proto
    A.pb.ts
    B.proto
    B.pb.ts
  ```
 
  Setting `dest` to `out`:
 
  ```
  /src
    A.proto
    B.proto
  /out
    A.pb.ts
    B.pb.ts
  ```
</td>
  <td>string (filepath)</td>
</tr>
<tr>
  <td>language</td>
<td>
Whether to generate JavaScript or TypeScript.

If omitted, TwirpScript will attempt to autodetect the language by looking for a `tsconfig.json` in the project root. If found, TwirpScript will generate TypeScript, otherwise JavaScript.

</td>
  <td>javascript | typescript</td>
</tr>
</tbody>
</table>

## Examples 🚀

The documentation is a work in progress. Checkout the examples in the examples directory:

- The [JavaScript fullstack](https://github.com/tatethurston/twirpscript/blob/main/examples/typescript-fullstack) shows a minimal browser client and server implementation in JavaScript.
- The [TypeScript fullstack](https://github.com/tatethurston/twirpscript/blob/main/examples/javascript-fullstack) shows a minimal browser client and server implementation in TypeScript.
- The [authentication example](https://github.com/tatethurston/twirpscript/blob/main/examples/authentication) extends the fullstack example to demonstrate authentication using tokens.

The examples also demonstrate testing using [jest](https://jestjs.io/).

## Caveats, Warnings and Issues ⚠️

### Fetch

The autogenerated clients use `fetch` so your runtime must include `fetch`. See a [Node.js client example](https://github.com/tatethurston/TwirpScript/blob/main/twirp-clientcompat/src/client-harness.ts#L11-L12) from the `clientcompat` test.

### JavaScript Servers (does not apply to servers written in TypeScript)

JavaScript Server implementations require special consideration. The NodeJS ecosystem is in a transition period from CommonJS to modules. TwirpScript generates JavaScript modules to enable tree shaking for clients. This means that NodeJS servers either need to [opt-in to modules](https://nodejs.org/api/esm.html#esm_enabling), or use a bundler like Webpack or ESBuild. See the [JavaScript fullstack](https://github.com/tatethurston/twirpscript/blob/main/examples/typescript-fullstack) to see what this looks like.

This rough edge is under active consideration. If you have thoughts, feel free to open an issue or pull request.

Note that this does not apply to TypeScript servers, because TypeScript will compile the ES modules to CommonJS when targeting NodeJS. Servers written in TypeScript will "just work".

## FAQ

> Why use Twirp instead of GraphQL, gRPC or REST?

For multiple clients with distinct views, I would pull in GraphQL. For a single UI client I prefer the simpler architecture (and well defined optimization paths) found with a more traditional API server approach.

A REST or JSON API lacks type safety and the developer experience that comes from static typing. This can be mitigated to an extent with tools like JSON Schema, but that route requires stitching together (and maintaining) a suite of tools to achieve a similar developer experience.

gRPC is great, but has a large runtime (and corresponding complexity) that is unnecessary for some applications. Twirp offers many of the benefits of gRPC with a significantly reduced runtime. TwirpScript's developer experience is designed to be idiomatic for the JS/TS community, and TwirpScript's autogenerated clients are optimized for use in the browser.

To learn more about the motivation behind Twirp (and a comparison to REST APIs and gRPC), check out the [announcement blog](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/).

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/twirpscript/blob/main/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/twirpscript/blob/main/LICENSE).
