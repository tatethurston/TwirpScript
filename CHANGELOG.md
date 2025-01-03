# Changelog

## v0.0.71

- Fix Timestamp and Duration JSON serialization. Previously, when either seconds or nanos were 0, the Timestamp / Duration was omitted from the serialized json. Thanks @martynchamberlin!

## v0.0.70

- Fix compiler path on Windows. Thanks @l1b3r!

## v0.0.69

- Updates to [ProtoScript 0.0.20](https://github.com/tatethurston/ProtoScript/blob/main/CHANGELOG.md#v0020). This updates JSON serializtion of Timestamp and Duration well known types to conform to the Protobuf3 specification.

## v0.0.68

- All header names are now lowercased. This was already true for users using `createTwirpServer` in conjunction with Node.js' `createServer`, but previously users of `createTwirpServerless` did not receive this standardization.

## v0.0.67

- Updates to v0.0.18 of [ProtoScript](https://github.com/tatethurston/ProtoScript), which includes fixes for self-referncing (recursive) messages.

- Buf users will need to update their `buf.gen.yaml` path:
  `buf.gen.yaml`

  ```diff
  version: v1
  plugins:
    - name: protoc-gen-protoscript
  -    path: ./node_modules/protoscript/compiler.js
  +    path: ./node_modules/protoscript/dist/compiler.js
      out: .
      opt:
        - language=typescript
      strategy: all
  ```

## v0.0.66

- Fix intermittent EAGAIN issue encountered when compiling protos

- Use glob imports for generated messages instead of destructuring. This preserves tree shaking, but preserves module namespacing to disambiguate name collisions between protos. Previously, identically named messages in different modules could causes a name collision, eg:

  ```proto
  // foo.proto
  message Foo {}
  ```

  ```proto
  // bar.proto
  import "foo.proto";
  message Foo {}
  ```

  Would result in errors in the generated code. Now, this is namespaced and works correctly.

## v0.0.65

[Protocol Buffers Well-Known Types](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf) are now exported from `protoscript`. References to well-known types are now imported from `protoscript` rather than being generated. This is a non breaking change. If you have well-known types in your project, you can remove the `google/protobuf` directory that was generated in previous versions alongside your other `.pb.js/ts` files.

The output location of `google/protobuf` was a common reason for using `dest` in `proto.config.mjs` so this change should facilitate zero configuration for a greater number of projects.

## v0.0.64

- Revert `Include file extensions in generated file imports` introduced in `v0.0.61` for TypeScript users. Generated TypeScript imports will revert to the following:

```diff
- import { Foo } from './foo.pb.js';
+ import { Foo } from './foo.pb';
```

When targeting ESM, the TypeScript compiler expects `.js` extensions and not `.ts` extensions for imports because the compiler does not manipulate import paths: https://www.typescriptlang.org/docs/handbook/esm-node.html.

Including a full extension results in the following TypeScript error:

```
[tsserver 2691] [E] An import path cannot end with a '.ts' extension.
```

The TypeScript team's recommendation to use `.js` extensions for `.ts` file imports when targeting ESM causes a number of issues with the broader JavaScript ecosystem. Until this situation is rectified, TwirpScript will not emit ESM compliant extensions for TypeScript. This only impacts TypeScript users who wish to target ESM in Node.JS using the TypeScript compiler, as bundlers are not pedantic about file extensions. If you're impacted by this, please join the discussion in [#202](https://github.com/tatethurston/TwirpScript/issues/202.)

## v0.0.63

- Change configuration file format. Now, the configuration file is JS instead of JSON. This provides better discoverability and type checking for TypeScript users.

The following `.twirp.json`:

```json
{
  "root": "src"
}
```

Would be renamed to `proto.config.mjs` and changed to the following:

```js
/** @type {import('twirpscript').Config} */
export default {
  root: "src",
};
```

- Use relative file path for determining path to compiler instead of hard coding from project root. This should interop better with more exotic package tooling and repo setup.

- Fix: Improved `map` detection. Previously field types suffixed with `Entry` were incorrectly flagged as maps. This has been fixed.

## v0.0.62

- Allow `rpcTransport` overrides. See [#189](https://github.com/tatethurston/TwirpScript/pull/189) for more context.
- Remove `process.stdin.fd` usage to see if it resolves intermittent `Error: EAGAIN: resource temporarily unavailable`, read. See [#191](https://github.com/tatethurston/TwirpScript/issues/191) for more context.

## v0.0.61

- Fix JSON deserialization. #181 introduced a regression that caused TwirpScript servers' JSON serialization to fail.
- Distribute strict ESM. A CommonJS is runtime is included for legacy node clients. Code generation uses ESM and requires Node.js v14 or later. If you're using a compiler other than TypeScript such as `webpack`, please see [these instructions](https://github.com/tatethurston/TwirpScript#webpack-setup)
- Use [ProtoScript](https://github.com/tatethurston/ProtoScript) code generation. This will result in some generated imports coming from `protoscript` instead of `twirpscript`, but this is a non breaking change. These imports were previously delegated to ProtoScript via reexports inside TwirpScript, and that indirection has now been removed.

## v0.0.60

- Removes @types/node dependency. @types/node is no longer necessary when using a TwirpScript generated client.

## v0.0.59

- Fixes generated JSON client when using nested messages. The generated JSON serialization names were invalid for nested messages. See [#176](https://github.com/tatethurston/TwirpScript/issues/176) for more context.

## v0.0.58

- Better insight into internal server Errors. TwirpScript catches any errors thrown internally. Errors that aren't an `instanceof` `TwirpError` present to users as a generic Twirp `internal_error` for security so that internal details don't leak. This can hurt the DX for identifying issues during development, and also can hide important debugging information when relying on error reporting using `hooks`.

TwirpScript now includes the thrown error as an `error` property in the `TwirpError` that is passed to the error hook, but continues _not_ to the response.

Example:

If we have code that does the following in a service or middleware:

```js
throw new Error("uh oh.");
```

The error hook will be invoked with:

```
TwirpError {
  code: 'internal',
  msg: 'server error',
  meta: {
    // this is kept private to the error hook and not exposed to end users
    error: Error("uh oh")
  }
}
```

And the response will be:

```
TwirpError {
  code: 'internal',
  msg: 'server error',
  // note the error is kept private: it's not exposed to end users
  meta: undefined,
}
```

As before, any errors that should be surfaced to end users should be created by throwing `TwirpError`:

```js
throw new TwirpError({ code: "code", msg: "msg" });
```

## v0.0.57

- Generated `.pb` files now opt out of eslint via `eslint-disable` comments
- TwirpScript now uses [ProtoScript](https://github.com/tatethurston/ProtoScript) as the serialization runtime instead of `google-protobuf`. ProtoScript's runtime is 37KB (7.2KB gzipped) compared to google-protobuf's 231KB (46KB gzipped).

## v0.0.56

Users will need to `npx twirpscript` to regenerate their `.pb.ts` / `.pb.js` files when adopting this version.

- The generated message serializer/deserializer objects have been split into two separate objects: one for JSON and one for Protobuf. This enables smaller client bundles when using a bundler that supports tree shaking / dead code elimination. Many users will be unaffected by this change, but this is a breaking change for users that use message encode/decode methods directly in their source code.

Previously this `proto`:

```proto
// A Hat is a piece of headwear made by a Haberdasher.
message Hat {
  int32 inches = 1;
  // anything but "invisible"
  string color = 2;
  // i.e. "bowler"
  string name = 3;
}
```

would generate an object like this in the generated `pb.ts` or `pb.js` file:

```
export const Hat = {
  encode: ...
  decode: ...
  encodeJSON: ...
  decodeJSON: ...
}
```

now two objects are generated, one for Protobuf and one for JSON (with a `JSON` suffix appended to the message name):

```ts
export const Hat = {
  encode: ...
  decode: ...
}

export const HatJSON = {
  encode: ...
  decode: ...
}
```

- TwirpScript client code is now isomorphic: Node.js clients no longer require extra configuration (using the `client` `rpcTransport` attribute). TwirpScript now uses Node's [conditional exports](https://nodejs.org/api/packages.html#conditional-exports) internally.

  ```diff
  import { client } from "twirpscript";
  -import { nodeHttpTransport } from "twirpscript/node";
  import { MakeHat } from "../protos/haberdasher.pb";

  client.baseURL = "http://localhost:8080";

  -// This is provided as a convenience for Node.js clients. If you provide `fetch` globally, this isn't necessary and your client can look identical to the browser client above.
  -client.rpcTransport = nodeHttpTransport;

  const hat = await MakeHat({ inches: 12 });
  console.log(hat);
  ```

## v0.0.55

- Protobuf messages now always pack packable repeated fields when serializing and can read packed or unpacked when deserializing. This will slightly decrease the size of some protobuf messages over the wire, and enable better interop with messages encoded by other protobuf serializers.

## v0.0.54

- Fixes a regression introduced in v0.0.53 that caused JSON.parse to be invoked twice for JSON clients.
- Optional message deserialization had a bug impacting optional fields that are a message type. The default message value was always being supplied to the client, preventing clients from determining whether the field was set. This has been fixed. Now if a server omits or supplies an optional message field with a null value the client will read the field as undefined.

## v0.0.53

- client JSON request methods now use `encodeJSON` and `decodeJSON` helpers.

## v0.0.52

- Fixes a regression where nested types were not consumable:
  ```sh
  [tsserver 2702] [E] 'Foo' only refers to a type, but is being used as a namespace here.
  ```
- Removes `dist` from public import paths. This impacts users of `twirpscript/dist/node` and direct invocations of the compiler, like `buf` users. The following changes are necessary to migrate:
  ```diff
  -import { nodeHttpTransport } from "twirpscript/dist/node";
  +import { nodeHttpTransport } from "twirpscript/node";
  ```
  ```diff
  version: v1
  plugins:
    - name: protoc-gen-twirpscript
      -path: ./node_modules/twirpscript/dist/compiler.js
      +path: ./node_modules/twirpscript/compiler.js
      out: .
      opt:
        - language=typescript
      strategy: all
  ```

## v0.0.51

- When using protobuf `map` fields, map keys are now typed as strings: `Record<string, $SomeType>`. Previously other types were accepted, which would cause type checking to fail when the key was `boolean`, `bigint`, or `number`. This is also more correct because JavaScript always encodes object keys as strings. Generated type definitions for `map` types are no longer exported. See [#151](https://github.com/tatethurston/TwirpScript/issues/151) for more background.
- Empty messages now generate the full serialization interface implemented by other messages. This resolves an issue where messages with fields whose value was an empty message would fail code generation.
- Enum serializers now have two private serialization helpers. This resolves an issue where Enums imported into other protobuf files failed code generation. See [#150](https://github.com/tatethurston/TwirpScript/issues/150) for more background.

## v0.0.50

- Add `typescript.emitDeclarationOnly` only option. This will only emit TypeScript type definitions and not any runtime.

## v0.0.49

- Enums are now represented by the enum value specified in `proto` instead of an integer. Eg: "FOO_BAR" instead of 0. This improves the developer experience when printing messages. This is a breaking change, but users using protobuf serialization should be unimpacted unless their code directly references enums via their integer value instead of the generated constants.

Eg:

```typescript
// this code will now need to migrate to the string value instead of an integer
`if (foo.someEnum === 0)`;
```

```typescript
// this code will continue to work without change
`if (foo.someEnum === SomeEnum.Field)`.
```

JSON serialization now also uses the enum value instead of an integer value, as described by the [protobuf JSON specification](https://developers.google.com/protocol-buffers/docs/proto3#json). This is a breaking change for JSON clients.

- Bytes are now Base64 encoded when JSON serializing as described by the protobuf JSON specification above. This is a breaking change for JSON clients.

## v0.0.48

This version has the following bug fixes:

- Fix nested message definitions. Previously this would cause `"ReferenceError: Cannot access before initialization" error`.
- Fix repeated int64 generation. The generated code would not compile for repeated bigint cases
- Fix bigint json serialization for `map`s
- Fix comment escaping
- Fix reserved names for internal variables

Code generation for `map` types are no longer inlined. This is an internal refactor that should not impact consumption.

## v0.0.47

- Add json serialization options. See the README's [configuration section](https://github.com/tatethurston/TwirpScript#configuration-) for more context.

## v0.0.46

This version has 3 breaking changes:

1. (Only impacts TypeScript users) The 'Service' naming suffix has been removed from the generated TypeScript types for services. Given the following proto:

```proto
service Haberdasher {
  rpc MakeHat(Size) returns (Hat);
}
```

The generated service type will now be `Haberdasher` instead of `HaberdasherService`. This enables better out of the box compatibility with [buf](https://buf.build/) which expects all service names to end with `Service`. Following this recommendation would generate TwirpScript types with 'ServiceService' suffixes.

`<Service>Service => <Service>`

2. The 'Handler' suffix has been removed from the generated `create<Service>Handler` helper.

Given the proto above, the generated helper is now `createHaberdasher` instead of `createHaberdasherHandler`.

`create<Service>Handler=> create<Service>`

3. (Only impacts TypeScript users) `optional` types now accept `null` and `undefined`. This enables better compatibility with other tools that may type optionals as `some type | null`

Changes:

- remove naming suffixes by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/125
- add exclude option to `.twirp.json` by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/127
- add null to optional ts types by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/128

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.45...v0.0.46

## v0.0.45

- no longer generate `_readMessageJSON` for empty messages
- fix map types in `_readMessageJSON`

## v0.0.44

This version has breaking changes between the generated code and the runtime. Run `npx twrispcript` to update your generated `.pb.ts` when updating to this version.

TwirpScript now ships with JSON serializers and supports the `json_name` option described [here](https://developers.google.com/protocol-buffers/docs/proto3#json). This enables clients to specify custom JSON field names.

_Breaking change:_ int64 types were previously encoded as strings, but are now encoded as [bigint](https://caniuse.com/bigint https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Changes:

- add json_name support by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/116
- use bigint for int64 types by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/118

## v0.0.43

- Fix repeated message deserialization by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/112.

## v0.0.42

- More compact code generation for empty messages by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/101.

## v0.0.41

- Breaking Change: field names are now camelCased by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/97.
  `npx twirpscript` will regenerate your `.pb.ts` files with the correct casing. If you run into significant issues with this change or prefer snake_case, please open an issue.

## v0.0.40

- export MIN_SUPPORTED_VERSION_X by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/95

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.39...v0.0.40

## v0.0.39

- Add TSDoc comments to generated serializer/deserializers by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/90
- Bug Fix: invalid filepaths generated when using `root` by @arranf in https://github.com/tatethurston/TwirpScript/pull/89

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.38...v0.0.39

## v0.0.38

- Bug Fix: remove types from js map output by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/83
- The generated message protobuf encoders now accept partials by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/84
- TypeScript types for map are now inlined into the generated interface by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/85

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.37...v0.0.38

## v0.0.37

- Bug Fix: map generation for JavaScript clients by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/78
- Add comment literal escaping by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/79
- Remove version comment from generated code by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/80

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.36...v0.0.37

## v0.0.36

- bytesource refactor by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/70
- add version check by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/71
- add map type by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/75

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.35...v0.0.36

## v0.0.35

- add body to request type for middleware and hooks by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/67

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.34...v0.0.35

## v0.0.34

This release includes breaking changes:

1. The generated `.pb.ts` files have been restructured. You'll need to run `npx twirpscript` to regenerate your `.pb.ts` files after updating.
2. `context`'s `service` and `method` properties now point to generated objects instead of simply being strings (eg previously these were "Haberdasher" and "MakeHat" and now these properties point to generated objects. This enables more powerful runtime reflection, eg:

```
app.on('requestReceived', (ctx, req) => {
   console.log(`Received request body: ${ctx.contentType === 'Protobuf' ? ctx.method.input.decode(req.body) : req.body}`);
});
```

3. `requestRouted` and `responsePrepared` are now invoked with the JavaScript object input / output to your handler, rather than the serialized input / output. This should improve debugging workflows, because you may now simply console log the input / output instead of needing to deserialize protobuf human readable output.

- Bug Fix: client error hook by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/56
- improve types for context's method and service properties by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/61
- Tate/service object by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/62
- context service and method now point to implementation instead of string by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/63
- requestRouted and responsePrepared are now invoked with input/output by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/64
- remove unnecessary isEndGroup check in serializer by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/65
- format error output from protoc compiler by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/66

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.33...v0.0.34
