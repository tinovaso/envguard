import { EnvSchema } from './schema.types';
import { SchemaShape } from './schema';

export interface Preset<T extends SchemaShape> {
  name: string;
  description?: string;
  schema: EnvSchema<T>;
  defaults?: Partial<Record<keyof T, string>>;
}

const presetRegistry = new Map<string, Preset<SchemaShape>>();

/**
 * Register a named preset for reuse across environments.
 */
export function registerPreset<T extends SchemaShape>(
  preset: Preset<T>
): void {
  if (presetRegistry.has(preset.name)) {
    throw new Error(`Preset "${preset.name}" is already registered.`);
  }
  presetRegistry.set(preset.name, preset as unknown as Preset<SchemaShape>);
}

/**
 * Retrieve a registered preset by name.
 */
export function getPreset<T extends SchemaShape>(
  name: string
): Preset<T> | undefined {
  return presetRegistry.get(name) as Preset<T> | undefined;
}

/**
 * List all registered preset names.
 */
export function listPresets(): string[] {
  return Array.from(presetRegistry.keys());
}

/**
 * Merge two presets, with the override preset taking precedence.
 */
export function mergePresets<A extends SchemaShape, B extends SchemaShape>(
  base: Preset<A>,
  override: Preset<B>
): Preset<A & B> {
  return {
    name: `${base.name}+${override.name}`,
    description: override.description ?? base.description,
    schema: { ...base.schema, ...override.schema } as EnvSchema<A & B>,
    defaults: { ...base.defaults, ...override.defaults } as Partial<
      Record<keyof (A & B), string>
    >,
  };
}

/**
 * Clear all registered presets (useful in tests).
 */
export function clearPresets(): void {
  presetRegistry.clear();
}
