import { getSensitiveKeys } from './schema';
import type { SchemaShape } from './schema.types';

/**
 * Redacts sensitive values in a record based on the schema definition.
 * Replaces sensitive field values with a placeholder string.
 */
export function redactEnv(
  env: Record<string, unknown>,
  schema: SchemaShape,
  placeholder = '***REDACTED***'
): Record<string, unknown> {
  const sensitiveKeys = getSensitiveKeys(schema);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(env)) {
    result[key] = sensitiveKeys.includes(key) ? placeholder : value;
  }

  return result;
}

/**
 * Returns only the non-sensitive entries from an env record.
 */
export function stripSensitive(
  env: Record<string, unknown>,
  schema: SchemaShape
): Record<string, unknown> {
  const sensitiveKeys = getSensitiveKeys(schema);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(env)) {
    if (!sensitiveKeys.includes(key)) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Checks whether a given key is marked as sensitive in the schema.
 */
export function isSensitiveKey(key: string, schema: SchemaShape): boolean {
  return getSensitiveKeys(schema).includes(key);
}
