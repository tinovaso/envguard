import { EnvSnapshot } from './watch.types';

/**
 * Captures a snapshot of all current environment variables.
 */
export function captureSnapshot(): EnvSnapshot {
  const snapshot: EnvSnapshot = {};
  for (const key of Object.keys(process.env)) {
    snapshot[key] = process.env[key];
  }
  return snapshot;
}

/**
 * Restores environment variables from a snapshot.
 * Keys present in the snapshot are set; keys not in the snapshot are deleted.
 */
export function restoreSnapshot(snapshot: EnvSnapshot, keys: string[]): void {
  for (const key of keys) {
    if (snapshot[key] !== undefined) {
      process.env[key] = snapshot[key] as string;
    } else {
      delete process.env[key];
    }
  }
}

/**
 * Returns a diff between two snapshots.
 */
export function snapshotDiff(
  before: EnvSnapshot,
  after: EnvSnapshot
): Record<string, { before: string | undefined; after: string | undefined }> {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const diff: Record<string, { before: string | undefined; after: string | undefined }> = {};
  for (const key of allKeys) {
    if (before[key] !== after[key]) {
      diff[key] = { before: before[key], after: after[key] };
    }
  }
  return diff;
}
