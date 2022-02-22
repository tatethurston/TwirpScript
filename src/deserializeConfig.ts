import { UserConfig } from "./cli";

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
