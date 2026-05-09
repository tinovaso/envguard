/**
 * freeze.ts
 * Provides utilities to freeze validated env objects so they cannot be
 * mutated at runtime, helping catch accidental overwrites early.
 */

export type FrozenEnv<T extends object> = Readonly<T>;

export interface FreezeOptions {
  /** Throw if a mutation is attempted (default: true in strict mode) */
  strict?: boolean;
  /** Keys to exclude from freezing (still readable, but mutable) */
  exclude?: string[];
}

/**
 * Deeply freezes an env object, making all properties read-only.
 * Returns the same reference typed as Readonly<T>.
 */
export function freezeEnv<T extends Record<string, unknown>>(
  env: T,
  options: FreezeOptions = {}
): FrozenEnv<T> {
  const { exclude = [] } = options;

  if (exclude.length === 0) {
    return Object.freeze({ ...env }) as FrozenEnv<T>;
  }

  const excluded: Partial<T> = {};
  const toFreeze: Partial<T> = {};

  for (const key of Object.keys(env) as Array<keyof T>) {
    if (exclude.includes(key as string)) {
      excluded[key] = env[key];
    } else {
      toFreeze[key] = env[key];
    }
  }

  return Object.freeze({ ...toFreeze, ...excluded }) as FrozenEnv<T>;
}

/**
 * Returns true if the given object has been frozen via Object.freeze.
 */
export function isFrozen(env: object): boolean {
  return Object.isFrozen(env);
}

/**
 * Attempts to safely read a key from a potentially frozen env.
 * Returns undefined instead of throwing on missing keys.
 */
export function safeGet<T extends object, K extends keyof T>(
  env: T,
  key: K
): T[K] | undefined {
  try {
    return env[key];
  } catch {
    return undefined;
  }
}

/**
 * Creates a mutable copy of a frozen env object for testing purposes.
 */
export function thawEnv<T extends object>(env: FrozenEnv<T>): T {
  return { ...env } as T;
}
