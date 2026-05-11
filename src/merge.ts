import { EnvSchema } from './index';
import { SchemaShape } from './schema.types';

/**
 * Merges two or more EnvSchemas into a single combined schema.
 * Later schemas take precedence for overlapping keys.
 */
export function mergeSchemas<
  A extends SchemaShape,
  B extends SchemaShape
>(
  schemaA: EnvSchema<A>,
  schemaB: EnvSchema<B>
): EnvSchema<A & B> {
  const merged = {
    ...schemaA,
    ...schemaB,
  } as EnvSchema<A & B>;
  return merged;
}

/**
 * Merges multiple schema field definitions, with later entries overriding earlier ones.
 */
export function mergeFields<T extends SchemaShape>(
  ...shapes: Partial<T>[]
): Partial<T> {
  return Object.assign({}, ...shapes);
}

/**
 * Merges environment variable records, with later entries overriding earlier ones.
 * Undefined values in later records do NOT override defined values.
 */
export function mergeEnv(
  ...envs: Array<Record<string, string | undefined>>
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const env of envs) {
    for (const [key, value] of Object.entries(env)) {
      if (value !== undefined) {
        result[key] = value;
      } else if (!(key in result)) {
        result[key] = undefined;
      }
    }
  }
  return result;
}

/**
 * Returns keys that exist in both schema shapes.
 */
export function overlappingKeys<A extends SchemaShape, B extends SchemaShape>(
  schemaA: A,
  schemaB: B
): Array<string & keyof A & keyof B> {
  const keysA = new Set(Object.keys(schemaA));
  return Object.keys(schemaB).filter((k) => keysA.has(k)) as Array<
    string & keyof A & keyof B
  >;
}
