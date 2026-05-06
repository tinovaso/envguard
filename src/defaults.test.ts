import { describe, it, expect } from 'vitest';
import { extractDefaults, applyDefaults, keysWithDefaults } from './defaults';
import { EnvSchema } from './index';

const schema: EnvSchema = {
  PORT: { type: 'number', default: 3000 },
  HOST: { type: 'string', default: 'localhost' },
  DEBUG: { type: 'boolean', default: false },
  API_KEY: { type: 'string', required: true },
  TIMEOUT: { type: 'number' },
};

describe('extractDefaults', () => {
  it('returns defaults for fields that have them', () => {
    const defaults = extractDefaults(schema);
    expect(defaults).toEqual({
      PORT: 3000,
      HOST: 'localhost',
      DEBUG: false,
    });
  });

  it('does not include fields without defaults', () => {
    const defaults = extractDefaults(schema);
    expect(defaults).not.toHaveProperty('API_KEY');
    expect(defaults).not.toHaveProperty('TIMEOUT');
  });

  it('returns empty object for schema with no defaults', () => {
    const emptySchema: EnvSchema = {
      KEY: { type: 'string', required: true },
    };
    expect(extractDefaults(emptySchema)).toEqual({});
  });
});

describe('applyDefaults', () => {
  it('fills in missing values with defaults', () => {
    const env = { API_KEY: 'secret' };
    const defaults = extractDefaults(schema);
    const result = applyDefaults(env, defaults);
    expect(result.PORT).toBe('3000');
    expect(result.HOST).toBe('localhost');
    expect(result.DEBUG).toBe('false');
  });

  it('does not overwrite existing env values', () => {
    const env = { PORT: '8080', API_KEY: 'secret' };
    const defaults = extractDefaults(schema);
    const result = applyDefaults(env, defaults);
    expect(result.PORT).toBe('8080');
  });

  it('treats empty string as missing and applies default', () => {
    const env = { PORT: '', API_KEY: 'secret' };
    const defaults = extractDefaults(schema);
    const result = applyDefaults(env, defaults);
    expect(result.PORT).toBe('3000');
  });
});

describe('keysWithDefaults', () => {
  it('returns keys that have default values', () => {
    const keys = keysWithDefaults(schema);
    expect(keys).toContain('PORT');
    expect(keys).toContain('HOST');
    expect(keys).toContain('DEBUG');
    expect(keys).not.toContain('API_KEY');
    expect(keys).not.toContain('TIMEOUT');
  });
});
