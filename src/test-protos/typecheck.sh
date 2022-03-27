#!/usr/bin/env bash

# Run from src/test-protos to typecheck output from all compiled protos.
# TODO: Make this an integration test.

yarn twirpscript
yarn tsc --noEmit
