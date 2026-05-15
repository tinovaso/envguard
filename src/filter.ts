import { SchemaShape } from './schema.types';

export type FilterPredicate<T> = (key: string, value: T) => boolean;

export interface FilterResult<T> {
  matched: Record<string, T>;
  excluded: Record<string, T>;
}

/**
 * Filter env values by a predicate function.
 * Returns both matched and excluded entries.
 */
export function filterEnv<T = string>(
  env: Record<string, T>,
  predicate: FilterPredicate<T>
): FilterResult<T> {
  const matched: Record<string, T> = {};
  const excluded: Record<string, T> = {};

  for (const [key, value] of Object.entries(env)) {
    if (predicate(key, value)) {
      matched[key] = value;
    } else {
      excluded[key] = value;
    }
  }

  return { matched, excluded };
}

/**
 * Filter env keys by a prefix string.
 */
export function filterByPrefix<T = string>(
  env: Record<string, T>,
  prefix: string
): FilterResult<T> {
  return filterEnv(env, (key) => key.startsWith(prefix));
}

/**
 * Filter env keys by a list of allowed keys.
 */
export function filterByKeys<T = string>(
  env: Record<string, T>,
  keys: string[]
): FilterResult<T> {
  const keySet = new Set(keys);
  return filterEnv(env, (key) => keySet.has(key));
}

/**
 * Filter env to only keys present in a given schema.
 */
export function filterBySchema<S extends SchemaShape>(
  env: Record<string, unknown>,
  schema: S
): FilterResult<unknown> {
  const schemaKeys = Object.keys(schema);
  return filterByKeys(env, schemaKeys);
}

/**
 * Format a filter result as a human-readable summary string.
 */
export function formatFilterResult<T>(result: FilterResult<T>): string {
  const matchedKeys = Object.keys(result.matched);
  const excludedKeys = Object.keys(result.excluded);
  const lines: string[] = [
    `Filter result: ${matchedKeys.length} matched, ${excludedKeys.length} excluded`,
  ];
  if (matchedKeys.length > 0) {
    lines.push(`  Matched: ${matchedKeys.join(', ')}`);
  }
  if (excludedKeys.length > 0) {
    lines.push(`  Excluded: ${excludedKeys.join(', ')}`);
  }
  return lines.join('\n');
}
