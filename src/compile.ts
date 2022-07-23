import { compile as protocompile } from "protoscript/plugin";
import { plugin } from "./autogenerate/index";

export const compile: typeof protocompile = (input) =>
  protocompile(input, [plugin]);
