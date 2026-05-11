import type { MaskOptions, MaskResult, MaskMap } from './mask.types';

const DEFAULT_OPTIONS: Required<MaskOptions> = {
  char: '*',
  revealStart: 0,
  revealEnd: 0,
  minLength: 8,
  preserveLength: false,
};

/**
 * Masks a single string value according to the provided options.
 */
export function maskValue(value: string, options: MaskOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const len = value.length;

  if (len === 0) return '';

  const start = Math.min(opts.revealStart, len);
  const end = Math.min(opts.revealEnd, len - start);
  const maskLen = opts.preserveLength
    ? Math.max(len - start - end, 0)
    : Math.max(opts.minLength - start - end, len - start - end, 0);

  const prefix = value.slice(0, start);
  const suffix = end > 0 ? value.slice(len - end) : '';
  const masked = opts.char.repeat(maskLen);

  return `${prefix}${masked}${suffix}`;
}

/**
 * Masks multiple environment variable values by their keys.
 */
export function maskEnv(
  env: Record<string, string | undefined>,
  keys: string[],
  options: MaskOptions = {}
): MaskMap {
  const result: MaskMap = {};

  for (const key of keys) {
    const original = env[key] ?? '';
    const masked = original.length > 0 ? maskValue(original, options) : '';
    result[key] = { key, original, masked };
  }

  return result;
}

/**
 * Returns a copy of the env object with sensitive keys masked.
 */
export function applyMask(
  env: Record<string, string | undefined>,
  keys: string[],
  options: MaskOptions = {}
): Record<string, string | undefined> {
  const maskMap = maskEnv(env, keys, options);
  const result = { ...env };

  for (const key of keys) {
    if (key in maskMap) {
      result[key] = maskMap[key].masked || undefined;
    }
  }

  return result;
}

/**
 * Formats a MaskResult for display.
 */
export function formatMaskResult(result: MaskResult): string {
  return `${result.key}: ${result.masked}`;
}
