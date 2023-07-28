#!/usr/bin/env node
import { compiler } from "protoscript/plugin";
import { compile } from "./compile.js";
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
await compiler(compile);
