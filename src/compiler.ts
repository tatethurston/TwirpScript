#!/usr/bin/env node
import { compiler } from "protoscript/plugin";
import { compile } from "./compile.js";
await compiler(compile);
