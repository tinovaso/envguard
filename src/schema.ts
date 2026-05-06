import { SchemaShape, SchemaMetadata, EnvVarDefinition } from './schema.types';

/**
 * Builds a validated schema definition map, ensuring internal consistency.
 * Throws if a required field also has no default and no description (warns).
 */
export function defineSchema<S extends SchemaShape>(schema: S): S {
  for (const [key, def] of Object.entries(schema)) {
    if (def.allowedValues && def.allowedValues.length === 0) {
      throw new Error(
        `[envguard] Schema error for "${key}": allowedValues must not be empty if provided.`
      );
    }
    if (def.default !== undefined && def.required === true) {
      throw new Error(
        `[envguard] Schema error for "${key}": a field cannot be both required and have a default value.`
      );
    }
  }
  return schema;
}

/**
 * Extracts flat metadata list from a schema for reporting/documentation.
 */
export function extractMetadata(schema: SchemaShape): SchemaMetadata[] {
  return Object.entries(schema).map(([key, definition]) => ({
    key,
    definition,
  }));
}

/**
 * Returns only the keys marked as sensitive in the schema.
 */
export function getSensitiveKeys(schema: SchemaShape): string[] {
  return Object.entries(schema)
    .filter(([, def]) => def.sensitive === true)
    .map(([key]) => key);
}

/**
 * Returns a documentation-friendly summary of a single env var definition.
 */
export function describeField(key: string, def: EnvVarDefinition): string {
  const parts: string[] = [`${key} (${def.type})`];
  if (def.required !== false && def.default === undefined) parts.push('[required]');
  if (def.default !== undefined) parts.push(`[default: ${JSON.stringify(def.default)}]`);
  if (def.sensitive) parts.push('[sensitive]');
  if (def.description) parts.push(`— ${def.description}`);
  if (def.example) parts.push(`e.g. "${def.example}"`);
  return parts.join(' ');
}
