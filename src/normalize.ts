/**
 * normalize.ts
 * Normalize environment variable values by applying
 * trimming, casing, and other string transformations.
 */

export type NormalizeRule =
  | "trim"
  | "lowercase"
  | "uppercase"
  | "trimStart"
  | "trimEnd"
  | "collapseWhitespace";

export interface NormalizeOptions {
  rules: NormalizeRule[];
}

export interface NormalizeResult {
  key: string;
  original: string;
  normalized: string;
  changed: boolean;
}

/**
 * Apply a single normalization rule to a string value.
 */
export function applyNormalizeRule(value: string, rule: NormalizeRule): string {
  switch (rule) {
    case "trim":
      return value.trim();
    case "trimStart":
      return value.trimStart();
    case "trimEnd":
      return value.trimEnd();
    case "lowercase":
      return value.toLowerCase();
    case "uppercase":
      return value.toUpperCase();
    case "collapseWhitespace":
      return value.replace(/\s+/g, " ").trim();
    default:
      return value;
  }
}

/**
 * Normalize a single value by applying all rules in order.
 */
export function normalizeValue(value: string, options: NormalizeOptions): string {
  return options.rules.reduce(
    (acc, rule) => applyNormalizeRule(acc, rule),
    value
  );
}

/**
 * Normalize all matching keys in an env record.
 * Returns both the updated env and a per-key result report.
 */
export function normalizeEnv(
  env: Record<string, string>,
  keys: string[],
  options: NormalizeOptions
): { env: Record<string, string>; results: NormalizeResult[] } {
  const updated: Record<string, string> = { ...env };
  const results: NormalizeResult[] = [];

  for (const key of keys) {
    if (!(key in env)) continue;
    const original = env[key];
    const normalized = normalizeValue(original, options);
    updated[key] = normalized;
    results.push({ key, original, normalized, changed: original !== normalized });
  }

  return { env: updated, results };
}

/**
 * Format a human-readable summary of normalization changes.
 */
export function formatNormalizeReport(results: NormalizeResult[]): string {
  const changed = results.filter((r) => r.changed);
  if (changed.length === 0) return "No normalization changes.";
  const lines = changed.map(
    (r) => `  ${r.key}: ${JSON.stringify(r.original)} → ${JSON.stringify(r.normalized)}`
  );
  return `Normalized ${changed.length} key(s):\n${lines.join("\n")}`;
}
