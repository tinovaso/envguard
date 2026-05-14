import type { CastTarget, CastOptions, CastResult, CastEnvOptions, CastEnvResult } from './cast.types';

export function castValue(raw: string, options: CastOptions): CastResult {
  const { target, delimiter = ',', strict = false } = options;

  switch (target) {
    case 'string':
      return { value: raw, original: raw, target, changed: false };

    case 'number': {
      const n = Number(raw);
      if (isNaN(n)) {
        if (strict) throw new Error(`Cannot cast "${raw}" to number`);
        return { value: raw, original: raw, target, changed: false };
      }
      return { value: n, original: raw, target, changed: raw !== String(n) };
    }

    case 'boolean': {
      const lower = raw.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower))
        return { value: true, original: raw, target, changed: true };
      if (['false', '0', 'no', 'off'].includes(lower))
        return { value: false, original: raw, target, changed: true };
      if (strict) throw new Error(`Cannot cast "${raw}" to boolean`);
      return { value: raw, original: raw, target, changed: false };
    }

    case 'json': {
      try {
        const parsed = JSON.parse(raw);
        return { value: parsed, original: raw, target, changed: true };
      } catch {
        if (strict) throw new Error(`Cannot cast "${raw}" to JSON`);
        return { value: raw, original: raw, target, changed: false };
      }
    }

    case 'array': {
      const arr = raw.split(delimiter).map((s) => s.trim()).filter(Boolean);
      return { value: arr, original: raw, target, changed: true };
    }

    case 'date': {
      const d = new Date(raw);
      if (isNaN(d.getTime())) {
        if (strict) throw new Error(`Cannot cast "${raw}" to Date`);
        return { value: raw, original: raw, target, changed: false };
      }
      return { value: d, original: raw, target, changed: true };
    }

    default:
      return { value: raw, original: raw, target: 'string', changed: false };
  }
}

export function castEnv(
  env: Record<string, string | undefined>,
  options: CastEnvOptions
): CastEnvResult {
  const { map, delimiter = ',', strict = false, skipMissing = true } = options;
  const values: Record<string, unknown> = {};
  const results: Record<string, CastResult> = {};
  const errors: Array<{ key: string; message: string }> = [];

  for (const [key, target] of Object.entries(map)) {
    if (!target) continue;
    const raw = env[key];

    if (raw === undefined || raw === '') {
      if (skipMissing) continue;
      errors.push({ key, message: `Key "${key}" is missing from environment` });
      continue;
    }

    try {
      const result = castValue(raw, { target, delimiter, strict });
      results[key] = result;
      values[key] = result.value;
    } catch (err) {
      errors.push({ key, message: (err as Error).message });
    }
  }

  return { values, results, errors };
}
