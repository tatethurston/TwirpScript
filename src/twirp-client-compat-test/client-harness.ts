import { readFileSync, writeFileSync } from "fs";

const input = readFileSync(process.stdin.fd);
console.error(input);

writeFileSync(process.stdout.fd, "");
