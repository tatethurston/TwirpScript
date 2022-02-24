import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import type { UserConfig } from ".";
import { createHash } from "crypto";
import { execSync } from "child_process";

export const isWindows = process.platform === "win32";

export function commandIsInPath(cmd: string): boolean {
  try {
    const check = isWindows ? "where" : "which";
    execSync(`${check} ${cmd}`);
    return true;
  } catch {
    return false;
  }
}

export function checksum(file: string): string {
  const hash = createHash("md5");
  return hash.update(readFileSync(file, "utf8"), "utf8").digest("hex");
}

export function pluralize(str: string, count: number): string {
  return count === 1 ? str : str + "s";
}

export function deserializeConfig(config: string): UserConfig {
  const params = new URLSearchParams(config.replace(/,/g, "&"));
  return {
    language:
      params.get("language") === "typescript" ? "typescript" : "javascript",
    json: {
      emitFieldsWithDefaultValues: params
        .getAll("json")
        .includes("emitFieldsWithDefaultValues"),
      useProtoFieldName: params.getAll("json").includes("useProtoFieldName"),
    },
  };
}

export function findFiles(entry: string, ext: string): string[] {
  return readdirSync(entry)
    .flatMap((file) => {
      const filepath = join(entry, file);
      if (
        statSync(filepath).isDirectory() &&
        !filepath.includes("node_modules")
      ) {
        return findFiles(filepath, ext);
      }
      return filepath;
    })
    .filter((file) => file.endsWith(ext));
}
