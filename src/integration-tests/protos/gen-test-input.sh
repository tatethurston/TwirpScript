#!/usr/bin/env bash

# Run from src/integration-tests/protos to regnerate test-input-typescript and test-input-javascript.
#
# This only needs to be done when:
# - new or changed .proto files
# - new or changed compilar parameters ( --twirpscript_out=<PARAMETER> )

protoc \
  --plugin=protoc-gen-twirpscript=./dist/integration-tests/protos/gen-test-input.js \
  --twirpscript_out=. \
  --twirpscript_opt=language=typescript \
  $(find . -name '*.proto')

protoc \
  --plugin=protoc-gen-twirpscript=./dist/integration-tests/protos/gen-test-input.js \
  --twirpscript_out=. \
  --twirpscript_opt=language=javascript \
  $(find . -name '*.proto')

echo "Generated test-input-typescript and test-input-javascript"
