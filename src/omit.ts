import { SchemaShape } from './schema.types';

/**
 * Omit specific keys from an env record.
 */
export function omitKeys<T extends Record<string, unknown>>(
  env: T,
  keys: (keyof T)[]
): Omit<T, (typeof keys)[number]> {
  const result = { ...env };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, (typeof keys)[number]>;
}

/**
 * Omit specific keys from a schema.
 */
export function omitSchema<S extends SchemaShape, K extends keyof S>(
  schema: S,
  keys: K[]
): Omit<S, K> {
  const result = { ...schema };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<S, K>;
}

/**
 * Omit keys from an env record that match a predicate.
 */
export function omitWhere<T extends Record<string, unknown>>(
  env: T,
  predicate: (key: string, value: unknown) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!predicate(key, value)) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}

/**
 * Format a summary of omitted keys for logging.
 */
export function formatOmitReport(
  original: Record<string, unknown>,
  result: Record<string, unknown>
): string {
  const omitted = Object.keys(original).filter((k) => !(k in result));
  if (omitted.length === 0) return 'omit: no keys removed';
  return `omit: removed ${omitted.length} key(s): ${omitted.join(', ')}`;
}
