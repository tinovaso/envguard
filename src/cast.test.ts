import { describe, it, expect } from 'vitest';
import { castValue, castEnv } from './cast';

describe('castValue', () => {
  it('returns string unchanged', () => {
    const r = castValue('hello', { target: 'string' });
    expect(r.value).toBe('hello');
    expect(r.changed).toBe(false);
  });

  it('casts to number', () => {
    const r = castValue('42', { target: 'number' });
    expect(r.value).toBe(42);
    expect(r.changed).toBe(true);
  });

  it('returns raw on invalid number (non-strict)', () => {
    const r = castValue('abc', { target: 'number' });
    expect(r.value).toBe('abc');
    expect(r.changed).toBe(false);
  });

  it('throws on invalid number in strict mode', () => {
    expect(() => castValue('abc', { target: 'number', strict: true })).toThrow();
  });

  it('casts truthy boolean strings', () => {
    for (const v of ['true', '1', 'yes', 'on']) {
      expect(castValue(v, { target: 'boolean' }).value).toBe(true);
    }
  });

  it('casts falsy boolean strings', () => {
    for (const v of ['false', '0', 'no', 'off']) {
      expect(castValue(v, { target: 'boolean' }).value).toBe(false);
    }
  });

  it('casts JSON', () => {
    const r = castValue('{"a":1}', { target: 'json' });
    expect(r.value).toEqual({ a: 1 });
  });

  it('returns raw on invalid JSON (non-strict)', () => {
    const r = castValue('not-json', { target: 'json' });
    expect(r.value).toBe('not-json');
  });

  it('casts comma-separated array', () => {
    const r = castValue('a,b,c', { target: 'array' });
    expect(r.value).toEqual(['a', 'b', 'c']);
  });

  it('casts array with custom delimiter', () => {
    const r = castValue('a|b|c', { target: 'array', delimiter: '|' });
    expect(r.value).toEqual(['a', 'b', 'c']);
  });

  it('casts to Date', () => {
    const r = castValue('2024-01-01', { target: 'date' });
    expect(r.value).toBeInstanceOf(Date);
  });

  it('throws on invalid date in strict mode', () => {
    expect(() => castValue('not-a-date', { target: 'date', strict: true })).toThrow();
  });
});

describe('castEnv', () => {
  const env = { PORT: '3000', DEBUG: 'true', TAGS: 'a,b', MISSING: undefined };

  it('casts multiple keys', () => {
    const { values } = castEnv(env, { map: { PORT: 'number', DEBUG: 'boolean', TAGS: 'array' } });
    expect(values.PORT).toBe(3000);
    expect(values.DEBUG).toBe(true);
    expect(values.TAGS).toEqual(['a', 'b']);
  });

  it('skips missing keys when skipMissing is true', () => {
    const { values, errors } = castEnv(env, { map: { MISSING: 'number' }, skipMissing: true });
    expect(values.MISSING).toBeUndefined();
    expect(errors).toHaveLength(0);
  });

  it('records error for missing key when skipMissing is false', () => {
    const { errors } = castEnv(env, { map: { MISSING: 'number' }, skipMissing: false });
    expect(errors[0].key).toBe('MISSING');
  });

  it('records error on cast failure in strict mode', () => {
    const { errors } = castEnv({ BAD: 'nope' }, { map: { BAD: 'number' }, strict: true });
    expect(errors[0].key).toBe('BAD');
  });
});
