import type { SchemaShape } from './schema.types';

/**
 * Returns a new env object containing only the specified keys.
 */
export function pickEnv<T extends Record<string, unknown>>(
  env: T,
  keys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      result[key] = env[key];
    }
  }
  return result;
}

/**
 * Returns a new schema containing only the specified keys.
 */
export function pickSchema<S extends SchemaShape>(
  schema: S,
  keys: (keyof S)[]
): Pick<S, (typeof keys)[number]> {
  const result = {} as Pick<S, (typeof keys)[number]>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      (result as Record<keyof S, unknown>)[key] = schema[key];
    }
  }
  return result;
}

/**
 * Returns a new env object omitting the specified keys.
 */
export function omitEnv<T extends Record<string, unknown>>(
  env: T,
  keys: (keyof T)[]
): Partial<T> {
  const omitSet = new Set<keyof T>(keys);
  const result: Partial<T> = {};
  for (const key of Object.keys(env) as (keyof T)[]) {
    if (!omitSet.has(key)) {
      result[key] = env[key];
    }
  }
  return result;
}

/**
 * Returns a new schema omitting the specified keys.
 */
export function omitSchema<S extends SchemaShape>(
  schema: S,
  keys: (keyof S)[]
): Omit<S, (typeof keys)[number]> {
  const omitSet = new Set<keyof S>(keys);
  const result = {} as Omit<S, (typeof keys)[number]>;
  for (const key of Object.keys(schema) as (keyof S)[]) {
    if (!omitSet.has(key)) {
      (result as Record<keyof S, unknown>)[key] = schema[key];
    }
  }
  return result;
}
