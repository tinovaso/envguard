/**
 * transform.ts
 * Applies user-defined transform functions to coerced environment values.
 */

import type { SchemaField } from './schema.types';

export type TransformFn<T = unknown> = (value: T) => T;

export interface TransformResult {
  key: string;
  original: unknown;
  transformed: unknown;
  changed: boolean;
}

/**
 * Apply a single transform function to a value.
 * Returns the original value if no transform is defined.
 */
export function applyTransform<T = unknown>(
  value: T,
  field: SchemaField
): T {
  if (typeof (field as any).transform !== 'function') {
    return value;
  }
  const fn = (field as any).transform as TransformFn<T>;
  return fn(value);
}

/**
 * Apply transforms across all keys in a parsed env object,
 * guided by the schema. Returns both the transformed record
 * and a list of per-key results for auditing.
 */
export function applyTransforms(
  parsed: Record<string, unknown>,
  schema: Record<string, SchemaField>
): { result: Record<string, unknown>; report: TransformResult[] } {
  const result: Record<string, unknown> = { ...parsed };
  const report: TransformResult[] = [];

  for (const key of Object.keys(schema)) {
    const field = schema[key];
    if (!(key in result)) continue;

    const original = result[key];
    const transformed = applyTransform(original, field);
    result[key] = transformed;

    report.push({
      key,
      original,
      transformed,
      changed: original !== transformed,
    });
  }

  return { result, report };
}

/**
 * Filter a transform report to only keys whose values changed.
 */
export function changedTransforms(report: TransformResult[]): TransformResult[] {
  return report.filter((r) => r.changed);
}
