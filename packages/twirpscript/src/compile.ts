import { compile as protocompile } from "protoscript/plugin";
import { plugin } from "./autogenerate/index.js";

export const compile: typeof protocompile = (input) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  protocompile(input, [plugin]);
