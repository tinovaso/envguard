export type EnvType = 'string' | 'number' | 'boolean';

export interface FieldDef {
  type: EnvType;
  required?: boolean;
  default?: string | number | boolean;
  description?: string;
  validator?: (value: string) => boolean | string;
}

export type EnvSchema = Record<string, FieldDef>;

export function coerce(value: string, type: EnvType): string | number | boolean {
  switch (type) {
    case 'number': {
      const n = Number(value);
      if (isNaN(n)) throw new Error(`Cannot coerce "${value}" to number`);
      return n;
    }
    case 'boolean': {
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      throw new Error(`Cannot coerce "${value}" to boolean`);
    }
    default:
      return value;
  }
}

export type ParsedEnv<S extends EnvSchema> = {
  [K in keyof S]: S[K]['type'] extends 'number'
    ? number
    : S[K]['type'] extends 'boolean'
    ? boolean
    : string;
};

export function parseEnv<S extends EnvSchema>(
  schema: S,
  env: Record<string, string | undefined> = process.env
): ParsedEnv<S> {
  const result: Record<string, unknown> = {};

  for (const [key, def] of Object.entries(schema)) {
    let raw = env[key];

    if ((raw === undefined || raw === '') && def.default !== undefined) {
      result[key] = def.default;
      continue;
    }

    if ((raw === undefined || raw === '') && def.required !== false) {
      throw new Error(`[envguard] Missing required environment variable: ${key}`);
    }

    if (raw === undefined || raw === '') {
      continue;
    }

    if (def.validator) {
      const outcome = def.validator(raw);
      if (outcome !== true) {
        const msg = typeof outcome === 'string' ? outcome : `Validation failed for ${key}`;
        throw new Error(`[envguard] ${msg}`);
      }
    }

    result[key] = coerce(raw, def.type);
  }

  return result as ParsedEnv<S>;
}

export { validate } from './validate';
export { formatReport } from './reporter';
export type { ValidationReport, FieldReport } from './reporter';
