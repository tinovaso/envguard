/**
 * expand.ts
 * Supports variable expansion within env values using ${VAR} syntax,
 * resolving references from the current env object or process.env fallback.
 */

export interface ExpandOptions {
  /** Allow referencing variables from process.env when not found in the provided env */
  fallbackToProcessEnv?: boolean;
  /** Maximum depth for recursive expansion to prevent circular references */
  maxDepth?: number;
}

const EXPAND_PATTERN = /\$\{([^}]+)\}/g;

/**
 * Expands a single string value by resolving ${VAR} references.
 */
export function expandValue(
  value: string,
  env: Record<string, string | undefined>,
  options: ExpandOptions = {},
  depth = 0
): string {
  const { fallbackToProcessEnv = true, maxDepth = 10 } = options;

  if (depth > maxDepth) {
    throw new Error(
      `envguard: Variable expansion exceeded max depth of ${maxDepth}. Possible circular reference.`
    );
  }

  return value.replace(EXPAND_PATTERN, (_, key: string) => {
    const trimmed = key.trim();
    let resolved: string | undefined = env[trimmed];

    if (resolved === undefined && fallbackToProcessEnv) {
      resolved = process.env[trimmed];
    }

    if (resolved === undefined) {
      return ``;
    }

    // Recursively expand resolved values
    if (EXPAND_PATTERN.test(resolved)) {
      EXPAND_PATTERN.lastIndex = 0;
      return expandValue(resolved, env, options, depth + 1);
    }

    return resolved;
  });
}

/**
 * Expands all string values in an env record, resolving ${VAR} references
 * against sibling keys and optionally process.env.
 */
export function expandAll(
  env: Record<string, string | undefined>,
  options: ExpandOptions = {}
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && EXPAND_PATTERN.test(value)) {
      EXPAND_PATTERN.lastIndex = 0;
      result[key] = expandValue(value, env, options);
    } else {
      result[key] = value;
    }
  }

  return result;
}
