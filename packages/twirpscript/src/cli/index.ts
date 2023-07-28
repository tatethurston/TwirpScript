#!/usr/bin/env node
import { main } from "protoscript/plugin";
import { join } from "path";
import { fileURLToPath } from "url";

export const isWindows = process.platform === "win32";

const compiler = join(
  fileURLToPath(import.meta.url),
  "..",
  "..",
  `compiler.${isWindows ? "cmd" : "js"}`,
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
void main({ compiler: { path: compiler }, logger: { name: "TwirpScript" } });
