/**
 * Coercion utilities for environment variable values.
 * Converts raw string values into typed primitives.
 */

export type CoerceType = 'string' | 'number' | 'boolean' | 'json';

export class CoercionError extends Error {
  constructor(public readonly key: string, public readonly type: CoerceType, value: string) {
    super(`Cannot coerce "${key}" value "${value}" to type "${type}"`);
    this.name = 'CoercionError';
  }
}

export function coerceValue(key: string, value: string, type: CoerceType): unknown {
  switch (type) {
    case 'string':
      return value;

    case 'number': {
      const num = Number(value);
      if (isNaN(num)) {
        throw new CoercionError(key, type, value);
      }
      return num;
    }

    case 'boolean': {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
      throw new CoercionError(key, type, value);
    }

    case 'json': {
      try {
        return JSON.parse(value);
      } catch {
        throw new CoercionError(key, type, value);
      }
    }

    default:
      throw new Error(`Unknown coerce type: ${type satisfies never}`);
  }
}
