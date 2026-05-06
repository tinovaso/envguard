/**
 * Utilities for handling default values in environment variable schemas.
 */

import { EnvSchema } from './index';

export type DefaultsMap = Record<string, string | number | boolean | undefined>;

/**
 * Extracts default values from a schema definition.
 * Returns a map of field names to their default values.
 */
export function extractDefaults(schema: EnvSchema): DefaultsMap {
  const defaults: DefaultsMap = {};

  for (const [key, field] of Object.entries(schema)) {
    if ('default' in field && field.default !== undefined) {
      defaults[key] = field.default as string | number | boolean;
    }
  }

  return defaults;
}

/**
 * Applies default values to an environment object for any missing keys.
 * Does not overwrite existing values.
 */
export function applyDefaults(
  env: Record<string, string | undefined>,
  defaults: DefaultsMap
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = { ...env };

  for (const [key, value] of Object.entries(defaults)) {
    if (result[key] === undefined || result[key] === '') {
      result[key] = value !== undefined ? String(value) : undefined;
    }
  }

  return result;
}

/**
 * Returns the list of keys that have default values defined in the schema.
 */
export function keysWithDefaults(schema: EnvSchema): string[] {
  return Object.entries(schema)
    .filter(([, field]) => 'default' in field && field.default !== undefined)
    .map(([key]) => key);
}
