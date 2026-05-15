/**
 * rename.ts
 * Utilities for renaming environment variable keys — useful when migrating
 * from legacy variable names to new ones without breaking existing configs.
 */

import type { SchemaShape } from './schema.types';

export interface RenameMap {
  [oldKey: string]: string;
}

export interface RenameResult {
  env: Record<string, string | undefined>;
  applied: Array<{ from: string; to: string; value: string | undefined }>;
  skipped: Array<{ from: string; to: string; reason: string }>;
}

/**
 * Rename keys in an env object according to a rename map.
 * If the destination key already exists, the rename is skipped by default
 * unless `overwrite` is true.
 */
export function renameKeys(
  env: Record<string, string | undefined>,
  map: RenameMap,
  options: { overwrite?: boolean; dropOld?: boolean } = {}
): RenameResult {
  const { overwrite = false, dropOld = true } = options;
  const result: Record<string, string | undefined> = { ...env };
  const applied: RenameResult['applied'] = [];
  const skipped: RenameResult['skipped'] = [];

  for (const [from, to] of Object.entries(map)) {
    if (!(from in env)) {
      skipped.push({ from, to, reason: `source key "${from}" not present` });
      continue;
    }
    if (to in env && !overwrite) {
      skipped.push({ from, to, reason: `destination key "${to}" already exists` });
      continue;
    }
    const value = env[from];
    result[to] = value;
    if (dropOld) {
      delete result[from];
    }
    applied.push({ from, to, value });
  }

  return { env: result, applied, skipped };
}

/**
 * Build a rename map from a schema that carries `alias` metadata,
 * mapping each alias -> canonical field name.
 */
export function buildRenameMapFromSchema<S extends SchemaShape>(
  schema: S
): RenameMap {
  const map: RenameMap = {};
  for (const [key, field] of Object.entries(schema)) {
    const aliases: string[] = (field as Record<string, unknown>)['alias']
      ? Array.isArray((field as Record<string, unknown>)['alias'])
        ? ((field as Record<string, unknown>)['alias'] as string[])
        : [((field as Record<string, unknown>)['alias'] as string)]
      : [];
    for (const alias of aliases) {
      map[alias] = key;
    }
  }
  return map;
}

/**
 * Format a human-readable rename report.
 */
export function formatRenameReport(result: RenameResult): string {
  const lines: string[] = [];
  if (result.applied.length > 0) {
    lines.push('Renamed:');
    for (const { from, to } of result.applied) {
      lines.push(`  ${from} → ${to}`);
    }
  }
  if (result.skipped.length > 0) {
    lines.push('Skipped:');
    for (const { from, to, reason } of result.skipped) {
      lines.push(`  ${from} → ${to} (${reason})`);
    }
  }
  return lines.join('\n');
}
