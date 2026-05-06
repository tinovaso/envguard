export type EnvVarType = 'string' | 'number' | 'boolean';

export interface EnvVarSchema {
  type?: EnvVarType;
  required?: boolean;
  default?: string | number | boolean;
  description?: string;
}

export type EnvSchema = Record<string, EnvVarSchema>;

export type ParsedEnv<T extends EnvSchema> = {
  [K in keyof T]: T[K]['type'] extends 'number'
    ? number
    : T[K]['type'] extends 'boolean'
    ? boolean
    : string;
};

export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Environment validation failed:\n${issues.map(i => `  - ${i}`).join('\n')}`);
    this.name = 'EnvValidationError';
  }
}

function coerce(key: string, raw: string, type: EnvVarType): string | number | boolean {
  if (type === 'number') {
    const n = Number(raw);
    if (isNaN(n)) throw new Error(`"${key}" must be a number, got "${raw}"`);
    return n;
  }
  if (type === 'boolean') {
    if (raw === 'true' || raw === '1') return true;
    if (raw === 'false' || raw === '0') return false;
    throw new Error(`"${key}" must be a boolean (true/false/1/0), got "${raw}"`);
  }
  return raw;
}

export function validateEnv<T extends EnvSchema>(
  schema: T,
  env: Record<string, string | undefined> = process.env
): ParsedEnv<T> {
  const issues: string[] = [];
  const result: Record<string, unknown> = {};

  for (const [key, def] of Object.entries(schema)) {
    const raw = env[key];
    const type = def.type ?? 'string';
    const required = def.required ?? def.default === undefined;

    if (raw === undefined || raw === '') {
      if (def.default !== undefined) {
        result[key] = def.default;
        continue;
      }
      if (required) {
        issues.push(`Missing required variable "${key}"${def.description ? ` (${def.description})` : ''}`);
        continue;
      }
      result[key] = undefined;
      continue;
    }

    try {
      result[key] = coerce(key, raw, type);
    } catch (e) {
      issues.push((e as Error).message);
    }
  }

  if (issues.length > 0) {
    throw new EnvValidationError(issues);
  }

  return result as ParsedEnv<T>;
}
