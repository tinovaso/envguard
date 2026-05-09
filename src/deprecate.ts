import { EnvSchema } from "./schema.types";

export interface DeprecatedField {
  key: string;
  message: string;
  replacement?: string;
  removeInVersion?: string;
}

export interface DeprecationWarning {
  key: string;
  message: string;
  replacement?: string;
  removeInVersion?: string;
  currentValue?: string;
}

export function extractDeprecated<T extends EnvSchema>(
  schema: T
): DeprecatedField[] {
  return Object.entries(schema)
    .filter(([, field]) => field.deprecated !== undefined)
    .map(([key, field]) => ({
      key,
      message:
        typeof field.deprecated === "string"
          ? field.deprecated
          : `'${key}' is deprecated.`,
      replacement: field.deprecatedReplacement,
      removeInVersion: field.removeInVersion,
    }));
}

export function checkDeprecations<T extends EnvSchema>(
  schema: T,
  env: Record<string, string | undefined>
): DeprecationWarning[] {
  const deprecated = extractDeprecated(schema);
  return deprecated
    .filter(({ key }) => env[key] !== undefined)
    .map(({ key, message, replacement, removeInVersion }) => ({
      key,
      message,
      replacement,
      removeInVersion,
      currentValue: env[key],
    }));
}

export function formatDeprecationWarnings(
  warnings: DeprecationWarning[]
): string {
  if (warnings.length === 0) return "";
  const lines = ["[envguard] Deprecation warnings:"];
  for (const w of warnings) {
    let line = `  ⚠ ${w.key}: ${w.message}`;
    if (w.replacement) line += ` Use '${w.replacement}' instead.`;
    if (w.removeInVersion) line += ` (removed in v${w.removeInVersion})`;
    lines.push(line);
  }
  return lines.join("\n");
}
