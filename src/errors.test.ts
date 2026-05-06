import {
  EnvValidationError,
  createMissingError,
  createTypeError,
  createCoerceError,
  createInvalidValueError,
} from './errors';

describe('error factories', () => {
  it('createMissingError returns correct shape', () => {
    const err = createMissingError('DATABASE_URL');
    expect(err.key).toBe('DATABASE_URL');
    expect(err.code).toBe('MISSING_REQUIRED');
    expect(err.message).toContain('DATABASE_URL');
  });

  it('createTypeError includes expected and received', () => {
    const err = createTypeError('PORT', 'number', 'string');
    expect(err.code).toBe('INVALID_TYPE');
    expect(err.expected).toBe('number');
    expect(err.received).toBe('string');
  });

  it('createCoerceError sets expected to targetType', () => {
    const err = createCoerceError('TIMEOUT', 'number');
    expect(err.code).toBe('COERCE_FAILED');
    expect(err.expected).toBe('number');
    expect(err.message).toContain('TIMEOUT');
  });

  it('createInvalidValueError sets message correctly', () => {
    const err = createInvalidValueError('NODE_ENV', 'Must be one of: development, production');
    expect(err.code).toBe('INVALID_VALUE');
    expect(err.message).toBe('Must be one of: development, production');
  });
});

describe('EnvValidationError', () => {
  const errors = [
    createMissingError('DATABASE_URL'),
    createTypeError('PORT', 'number', 'string'),
  ];

  it('formats message with all errors', () => {
    const error = new EnvValidationError(errors);
    expect(error.message).toContain('MISSING_REQUIRED');
    expect(error.message).toContain('INVALID_TYPE');
    expect(error.name).toBe('EnvValidationError');
  });

  it('getErrorsByKey filters correctly', () => {
    const error = new EnvValidationError(errors);
    expect(error.getErrorsByKey('PORT')).toHaveLength(1);
    expect(error.getErrorsByKey('UNKNOWN')).toHaveLength(0);
  });

  it('hasCode returns true when code present', () => {
    const error = new EnvValidationError(errors);
    expect(error.hasCode('MISSING_REQUIRED')).toBe(true);
    expect(error.hasCode('COERCE_FAILED')).toBe(false);
  });

  it('toJSON returns serialisable object', () => {
    const error = new EnvValidationError(errors);
    const json = error.toJSON() as any;
    expect(json.name).toBe('EnvValidationError');
    expect(Array.isArray(json.errors)).toBe(true);
    expect(json.errors).toHaveLength(2);
  });

  it('is instanceof Error', () => {
    const error = new EnvValidationError(errors);
    expect(error instanceof Error).toBe(true);
  });
});
