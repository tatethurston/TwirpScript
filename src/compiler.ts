#!/usr/bin/env node
import { compile } from "./compile.js";

function readStream(stream: NodeJS.ReadStream): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    stream.on("readable", () => {
      let chunk: Buffer;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      while ((chunk = process.stdin.read()) !== null) {
        chunks.push(chunk);
      }
    });
    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

const input = await readStream(process.stdin);
const response = compile(input);
process.stdout.write(response.serializeBinary());
