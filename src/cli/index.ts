#!/usr/bin/env node
import { main } from "protoscript/plugin";
import { join } from "path";
import { fileURLToPath } from "url";

export const isWindows = process.platform === "win32";

const compiler = join(
  fileURLToPath(import.meta.url),
  "..",
  "..",
  `compiler.${isWindows ? "cmd" : "js"}`
);

void main({ compiler: { path: compiler }, logger: { name: "TwirpScript" } });
