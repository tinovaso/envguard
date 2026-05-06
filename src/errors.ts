export type ErrorCode =
  | 'MISSING_REQUIRED'
  | 'INVALID_TYPE'
  | 'INVALID_VALUE'
  | 'COERCE_FAILED'
  | 'SCHEMA_INVALID';

export interface EnvError {
  key: string;
  code: ErrorCode;
  message: string;
  expected?: string;
  received?: string;
}

export class EnvValidationError extends Error {
  public readonly errors: EnvError[];

  constructor(errors: EnvError[]) {
    const summary = errors
      .map((e) => `  [${e.code}] ${e.key}: ${e.message}`)
      .join('\n');
    super(`Environment validation failed:\n${summary}`);
    this.name = 'EnvValidationError';
    this.errors = errors;
  }

  public getErrorsByKey(key: string): EnvError[] {
    return this.errors.filter((e) => e.key === key);
  }

  public hasCode(code: ErrorCode): boolean {
    return this.errors.some((e) => e.code === code);
  }

  public toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors,
    };
  }
}

export function createMissingError(key: string): EnvError {
  return {
    key,
    code: 'MISSING_REQUIRED',
    message: `Required environment variable "${key}" is not set`,
  };
}

export function createTypeError(
  key: string,
  expected: string,
  received: string
): EnvError {
  return {
    key,
    code: 'INVALID_TYPE',
    message: `Expected type "${expected}" but received "${received}"`,
    expected,
    received,
  };
}

export function createCoerceError(key: string, targetType: string): EnvError {
  return {
    key,
    code: 'COERCE_FAILED',
    message: `Failed to coerce value of "${key}" to type "${targetType}"`,
    expected: targetType,
  };
}

export function createInvalidValueError(
  key: string,
  message: string
): EnvError {
  return {
    key,
    code: 'INVALID_VALUE',
    message,
  };
}
