import { EnvSnapshot, WatchHandle, WatchOptions } from './watch.types';
import { SchemaShape } from './schema.types';
import { validate } from './validate';
import { coerceValue } from './coerce';

function takeSnapshot(keys: string[]): EnvSnapshot {
  const snapshot: EnvSnapshot = {};
  for (const key of keys) {
    snapshot[key] = process.env[key];
  }
  return snapshot;
}

function diffSnapshots(
  prev: EnvSnapshot,
  next: EnvSnapshot
): Array<{ key: string; prev: string | undefined; next: string | undefined }> {
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const changes: Array<{ key: string; prev: string | undefined; next: string | undefined }> = [];
  for (const key of allKeys) {
    if (prev[key] !== next[key]) {
      changes.push({ key, prev: prev[key], next: next[key] });
    }
  }
  return changes;
}

export function watchEnv<T extends SchemaShape>(
  schema: T,
  options: WatchOptions = {}
): WatchHandle {
  const { interval = 5000, onChange, onError, verbose = false } = options;
  const keys = Object.keys(schema);
  let snapshot = takeSnapshot(keys);
  let isActive = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  function check(): void {
    const current = takeSnapshot(keys);
    const changes = diffSnapshots(snapshot, current);

    if (changes.length === 0) return;

    const errors: Array<{ key: string; message: string }> = [];

    for (const { key, prev, next } of changes) {
      const fieldDef = schema[key];
      if (fieldDef && next !== undefined) {
        const result = coerceValue(next, fieldDef.type ?? 'string');
        if (!result.ok) {
          errors.push({ key, message: result.error });
          continue;
        }
        const valErrors = validate({ [key]: next }, { [key]: fieldDef } as T);
        if (valErrors.length > 0) {
          errors.push(...valErrors.map((e) => ({ key, message: e.message })));
          continue;
        }
      }

      if (verbose) {
        console.log(`[envguard:watch] ${key} changed: ${prev} → ${next}`);
      }

      onChange?.(key, prev, next);
    }

    if (errors.length > 0) {
      onError?.(errors);
    }

    snapshot = current;
  }

  function stop(): void {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    isActive = false;
  }

  timer = setInterval(check, interval);
  isActive = true;

  return {
    stop,
    check,
    get active() {
      return isActive;
    },
  };
}
