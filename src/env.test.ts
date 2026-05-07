import { loadEnv } from './env';

const baseSchema = {
  PORT: { type: 'number' as const, default: '3000', description: 'Server port' },
  HOST: { type: 'string' as const, default: 'localhost', description: 'Server host' },
  API_KEY: { type: 'string' as const, required: true, sensitive: true, description: 'API key' },
  DEBUG: { type: 'boolean' as const, default: 'false', description: 'Debug mode' },
};

describe('loadEnv', () => {
  it('returns valid result with all required vars present', () => {
    const result = loadEnv(baseSchema, {
      source: { PORT: '8080', HOST: 'example.com', API_KEY: 'secret123' },
      silent: true,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.env.PORT).toBe(8080);
    expect(result.env.HOST).toBe('example.com');
    expect(result.env.DEBUG).toBe(false);
  });

  it('applies defaults when vars are missing', () => {
    const result = loadEnv(baseSchema, {
      source: { API_KEY: 'secret' },
      silent: true,
    });
    expect(result.env.PORT).toBe(3000);
    expect(result.env.HOST).toBe('localhost');
    expect(result.env.DEBUG).toBe(false);
  });

  it('collects errors for missing required fields', () => {
    const result = loadEnv(baseSchema, {
      source: {},
      strict: false,
      silent: true,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('throws by default in strict mode when required vars are missing', () => {
    expect(() =>
      loadEnv(baseSchema, {
        source: {},
        strict: true,
        silent: true,
      })
    ).toThrow('envguard: Environment validation failed');
  });

  it('calls onError callback instead of throwing', () => {
    const onError = jest.fn();
    loadEnv(baseSchema, {
      source: {},
      strict: true,
      silent: true,
      onError,
    });
    expect(onError).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining('API_KEY')]));
  });

  it('includes a report string in the result', () => {
    const result = loadEnv(baseSchema, {
      source: { API_KEY: 'topsecret' },
      silent: true,
    });
    expect(typeof result.report).toBe('string');
    expect(result.report.length).toBeGreaterThan(0);
  });
});
