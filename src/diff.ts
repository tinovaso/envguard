import type { DiffEntry, DiffOptions, DiffResult } from './diff.types';

const DEFAULT_MASK = '***';

function maskIfSensitive(
  key: string,
  value: string | undefined,
  sensitiveKeys: string[],
  mask: string
): string | undefined {
  if (value === undefined) return undefined;
  return sensitiveKeys.includes(key) ? mask : value;
}

/**
 * Compute a diff between two flat env-like records.
 */
export function diffEnv(
  prev: Record<string, string>,
  next: Record<string, string>,
  options: DiffOptions = {}
): DiffResult {
  const { sensitiveKeys = [], changesOnly = false, mask = DEFAULT_MASK } = options;

  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const entries: DiffEntry[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  const unchanged: string[] = [];

  for (const key of allKeys) {
    const hasPrev = Object.prototype.hasOwnProperty.call(prev, key);
    const hasNext = Object.prototype.hasOwnProperty.call(next, key);

    const prevVal = maskIfSensitive(key, prev[key], sensitiveKeys, mask);
    const nextVal = maskIfSensitive(key, next[key], sensitiveKeys, mask);

    let entry: DiffEntry;

    if (!hasPrev && hasNext) {
      entry = { key, kind: 'added', next: nextVal };
      added.push(key);
    } else if (hasPrev && !hasNext) {
      entry = { key, kind: 'removed', prev: prevVal };
      removed.push(key);
    } else if (prev[key] !== next[key]) {
      entry = { key, kind: 'changed', prev: prevVal, next: nextVal };
      changed.push(key);
    } else {
      entry = { key, kind: 'unchanged', prev: prevVal, next: nextVal };
      unchanged.push(key);
    }

    if (!changesOnly || entry.kind !== 'unchanged') {
      entries.push(entry);
    }
  }

  return {
    entries,
    added,
    removed,
    changed,
    unchanged,
    hasChanges: added.length > 0 || removed.length > 0 || changed.length > 0,
  };
}

/**
 * Format a DiffResult as a human-readable string.
 */
export function formatDiff(result: DiffResult): string {
  if (!result.hasChanges) return 'No changes detected.';

  const lines: string[] = [];
  for (const entry of result.entries) {
    if (entry.kind === 'added') {
      lines.push(`+ ${entry.key}=${entry.next}`);
    } else if (entry.kind === 'removed') {
      lines.push(`- ${entry.key}=${entry.prev}`);
    } else if (entry.kind === 'changed') {
      lines.push(`~ ${entry.key}: ${entry.prev} → ${entry.next}`);
    }
  }
  return lines.join('\n');
}
