import { describe, it, expect } from 'vitest';
import { redactEnv, stripSensitive, isSensitiveKey } from './redact';
import type { SchemaShape } from './schema.types';

const schema: SchemaShape = {
  API_KEY: { type: 'string', sensitive: true },
  DB_PASSWORD: { type: 'string', sensitive: true },
  PORT: { type: 'number', sensitive: false },
  APP_ENV: { type: 'string' },
};

const env = {
  API_KEY: 'secret-api-key',
  DB_PASSWORD: 'hunter2',
  PORT: 3000,
  APP_ENV: 'production',
};

describe('redactEnv', () => {
  it('replaces sensitive values with default placeholder', () => {
    const result = redactEnv(env, schema);
    expect(result.API_KEY).toBe('***REDACTED***');
    expect(result.DB_PASSWORD).toBe('***REDACTED***');
  });

  it('preserves non-sensitive values', () => {
    const result = redactEnv(env, schema);
    expect(result.PORT).toBe(3000);
    expect(result.APP_ENV).toBe('production');
  });

  it('accepts a custom placeholder', () => {
    const result = redactEnv(env, schema, '[hidden]');
    expect(result.API_KEY).toBe('[hidden]');
    expect(result.DB_PASSWORD).toBe('[hidden]');
  });

  it('returns an empty object when env is empty', () => {
    expect(redactEnv({}, schema)).toEqual({});
  });
});

describe('stripSensitive', () => {
  it('removes sensitive keys entirely', () => {
    const result = stripSensitive(env, schema);
    expect(result).not.toHaveProperty('API_KEY');
    expect(result).not.toHaveProperty('DB_PASSWORD');
  });

  it('keeps non-sensitive keys', () => {
    const result = stripSensitive(env, schema);
    expect(result.PORT).toBe(3000);
    expect(result.APP_ENV).toBe('production');
  });
});

describe('isSensitiveKey', () => {
  it('returns true for sensitive keys', () => {
    expect(isSensitiveKey('API_KEY', schema)).toBe(true);
    expect(isSensitiveKey('DB_PASSWORD', schema)).toBe(true);
  });

  it('returns false for non-sensitive keys', () => {
    expect(isSensitiveKey('PORT', schema)).toBe(false);
    expect(isSensitiveKey('APP_ENV', schema)).toBe(false);
  });

  it('returns false for unknown keys', () => {
    expect(isSensitiveKey('UNKNOWN_KEY', schema)).toBe(false);
  });
});
