import { compile as protocompile } from "protoscript/plugin";
import { plugin } from "./autogenerate/index.js";

export const compile: typeof protocompile = (input) =>
  protocompile(input, [plugin]);
