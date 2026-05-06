import { validateEnv, EnvValidationError } from './index';

const schema = {
  PORT: { type: 'number' as const, required: true, description: 'HTTP server port' },
  NODE_ENV: { type: 'string' as const, default: 'development' },
  ENABLE_CACHE: { type: 'boolean' as const, default: false },
  API_KEY: { type: 'string' as const, required: true },
};

describe('validateEnv', () => {
  it('parses valid environment variables correctly', () => {
    const env = { PORT: '3000', API_KEY: 'secret', ENABLE_CACHE: 'true' };
    const result = validateEnv(schema, env);
    expect(result.PORT).toBe(3000);
    expect(result.NODE_ENV).toBe('development');
    expect(result.ENABLE_CACHE).toBe(true);
    expect(result.API_KEY).toBe('secret');
  });

  it('applies default values when variable is absent', () => {
    const env = { PORT: '8080', API_KEY: 'key' };
    const result = validateEnv(schema, env);
    expect(result.NODE_ENV).toBe('development');
    expect(result.ENABLE_CACHE).toBe(false);
  });

  it('throws EnvValidationError for missing required variables', () => {
    const env = { PORT: '3000' }; // missing API_KEY
    expect(() => validateEnv(schema, env)).toThrow(EnvValidationError);
    try {
      validateEnv(schema, env);
    } catch (e) {
      expect((e as EnvValidationError).issues).toContain('Missing required variable "API_KEY"');
    }
  });

  it('throws EnvValidationError for invalid number', () => {
    const env = { PORT: 'not-a-number', API_KEY: 'key' };
    expect(() => validateEnv(schema, env)).toThrow(EnvValidationError);
    try {
      validateEnv(schema, env);
    } catch (e) {
      expect((e as EnvValidationError).issues[0]).toMatch(/must be a number/);
    }
  });

  it('throws EnvValidationError for invalid boolean', () => {
    const env = { PORT: '3000', API_KEY: 'key', ENABLE_CACHE: 'yes' };
    expect(() => validateEnv(schema, env)).toThrow(EnvValidationError);
  });

  it('collects multiple validation errors at once', () => {
    const env = { PORT: 'bad', ENABLE_CACHE: 'maybe' }; // missing API_KEY too
    try {
      validateEnv(schema, env);
    } catch (e) {
      expect((e as EnvValidationError).issues.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('accepts boolean truthy values 1 and 0', () => {
    const env = { PORT: '3000', API_KEY: 'k', ENABLE_CACHE: '0' };
    const result = validateEnv(schema, env);
    expect(result.ENABLE_CACHE).toBe(false);
  });
});
