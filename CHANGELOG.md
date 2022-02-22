# Changelog

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
- add exclude option to twirp.json by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/127
- add null to optional ts types by @tatethurston in https://github.com/tatethurston/TwirpScript/pull/128

**Full Changelog**: https://github.com/tatethurston/TwirpScript/compare/v0.0.45...v0.0.46

## v0.0.45

- no longer generate `_readMessageJSON` for empty messages
- fix map types in `_readMessageJSON`

## v0.0.44

This version has breaking changes between the generated code and the runtime. Run `yarn twrispcript` to update your generated `.pb.ts` when updating to this version.

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
  `yarn twirpscript` will regenerate your `.pb.ts` files with the correct casing. If you run into significant issues with this change or prefer snake_case, please open an issue.

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

## v0.034

This release includes breaking changes:

1. The generated `.pb.ts` files have been restructured. You'll need to run `yarn twirpscript` to regenerate your `.pb.ts` files after updating.
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
