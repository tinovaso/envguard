import { SchemaShape } from './schema';
import { EnvSchema } from './schema.types';

export interface PresetMeta {
  name: string;
  description?: string;
  fieldCount: number;
  defaultCount: number;
}

/**
 * Extract lightweight metadata from a preset without loading its schema values.
 */
export function describePreset<T extends SchemaShape>(
  preset: import('./preset').Preset<T>
): PresetMeta {
  const fieldCount = Object.keys(preset.schema).length;
  const defaultCount = preset.defaults
    ? Object.keys(preset.defaults).length
    : 0;
  return {
    name: preset.name,
    description: preset.description,
    fieldCount,
    defaultCount,
  };
}

/**
 * Type helper: infer the environment shape from a Preset.
 */
export type InferPreset<P> = P extends import('./preset').Preset<infer T>
  ? { [K in keyof T]: string }
  : never;
