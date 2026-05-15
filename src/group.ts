import type { EnvSchema, SchemaShape } from './schema.types';

export type GroupMap<T extends SchemaShape> = Record<string, Array<keyof T>>;

export interface GroupResult<T extends SchemaShape> {
  group: string;
  keys: Array<keyof T>;
  values: Partial<Record<keyof T, string | undefined>>;
}

/**
 * Groups environment variable keys by a provided mapping.
 * Returns resolved values for each group from the given env object.
 */
export function groupEnv<T extends SchemaShape>(
  env: Partial<Record<keyof T, string | undefined>>,
  groups: GroupMap<T>
): GroupResult<T>[] {
  return Object.entries(groups).map(([group, keys]) => {
    const values: Partial<Record<keyof T, string | undefined>> = {};
    for (const key of keys) {
      values[key] = env[key];
    }
    return { group, keys, values };
  });
}

/**
 * Extracts groups from a schema based on a `group` metadata field.
 * Expects schema fields to optionally carry a `group` string property.
 */
export function extractGroups<T extends SchemaShape>(
  schema: EnvSchema<T>
): GroupMap<T> {
  const groups: GroupMap<T> = {};
  for (const key of Object.keys(schema) as Array<keyof T>) {
    const field = schema[key] as { group?: string };
    if (field.group) {
      if (!groups[field.group]) {
        groups[field.group] = [];
      }
      groups[field.group].push(key);
    }
  }
  return groups;
}

/**
 * Formats group results into a human-readable report string.
 */
export function formatGroupReport<T extends SchemaShape>(
  results: GroupResult<T>[]
): string {
  if (results.length === 0) return 'No groups defined.';
  return results
    .map(({ group, keys, values }) => {
      const lines = keys.map((k) => {
        const val = values[k];
        return `  ${String(k)}: ${val !== undefined ? val : '(unset)'}`;
      });
      return `[${group}]\n${lines.join('\n')}`;
    })
    .join('\n\n');
}
