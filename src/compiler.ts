#!/usr/bin/env node
import { readFileSync } from "fs";
import { compile } from "./compile";

const input = readFileSync(process.stdin.fd);
const response = compile(input);
process.stdout.write(response.serializeBinary());
