import { SliceOptions, SliceResult, SliceMap } from './slice.types';

/**
 * Extract a named subset of keys from an env object.
 */
export function sliceEnv<
  T extends Record<string, unknown>,
  K extends keyof T
>(
  env: T,
  keys: K[],
  options: Omit<SliceOptions, 'keys'> = {}
): SliceResult<SliceMap<T, K>> {
  const { strict = false } = options;
  const slice: Partial<SliceMap<T, K>> = {};
  const missing: string[] = [];
  const matched: string[] = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      (slice as Record<string, unknown>)[key as string] = env[key];
      matched.push(key as string);
    } else {
      missing.push(key as string);
    }
  }

  if (strict && missing.length > 0) {
    throw new Error(
      `[envguard] sliceEnv: missing keys in source: ${missing.join(', ')}`
    );
  }

  return { slice, missing, matched };
}

/**
 * Returns only the slice portion, discarding metadata.
 */
export function sliceOnly<
  T extends Record<string, unknown>,
  K extends keyof T
>(env: T, keys: K[]): SliceMap<T, K> {
  const { slice, missing } = sliceEnv(env, keys);
  if (missing.length > 0) {
    // Fill missing with undefined so shape is preserved
    for (const k of missing) {
      (slice as Record<string, unknown>)[k] = undefined;
    }
  }
  return slice as SliceMap<T, K>;
}

/**
 * Format a human-readable report of a slice operation.
 */
export function formatSliceReport<T extends Record<string, unknown>>(
  result: SliceResult<T>
): string {
  const lines: string[] = ['[envguard] Slice Report'];
  lines.push(`  Matched  (${result.matched.length}): ${result.matched.join(', ') || '—'}`);
  lines.push(`  Missing  (${result.missing.length}): ${result.missing.join(', ') || '—'}`);
  return lines.join('\n');
}
