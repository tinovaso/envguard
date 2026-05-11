import { describe, it, expect } from 'vitest';
import { maskValue, maskEnv, applyMask, formatMaskResult } from './mask';

describe('maskValue', () => {
  it('masks a full string with default options', () => {
    const result = maskValue('supersecret');
    expect(result).toBe('***********');
  });

  it('uses custom mask character', () => {
    expect(maskValue('abc', { char: '#', preserveLength: true })).toBe('###');
  });

  it('reveals start characters', () => {
    const result = maskValue('mysecretkey', { revealStart: 2, preserveLength: true });
    expect(result).toMatch(/^my/);
    expect(result).not.toContain('secret');
  });

  it('reveals end characters', () => {
    const result = maskValue('mysecretkey', { revealEnd: 3, preserveLength: true });
    expect(result).toMatch(/key$/);
  });

  it('reveals both start and end', () => {
    const result = maskValue('abcdefgh', { revealStart: 2, revealEnd: 2, preserveLength: true });
    expect(result).toBe('ab****gh');
  });

  it('returns empty string for empty input', () => {
    expect(maskValue('')).toBe('');
  });

  it('respects minLength padding', () => {
    const result = maskValue('hi', { minLength: 8 });
    expect(result.length).toBeGreaterThanOrEqual(8);
  });

  it('preserves length when flag is set', () => {
    const val = 'exactlen';
    const result = maskValue(val, { preserveLength: true });
    expect(result.length).toBe(val.length);
  });
});

describe('maskEnv', () => {
  const env = { API_KEY: 'abc123', DB_PASS: 'hunter2', HOST: 'localhost' };

  it('masks only specified keys', () => {
    const map = maskEnv(env, ['API_KEY', 'DB_PASS']);
    expect(map['API_KEY'].masked).not.toBe('abc123');
    expect(map['DB_PASS'].masked).not.toBe('hunter2');
    expect(map['HOST']).toBeUndefined();
  });

  it('preserves original value in result', () => {
    const map = maskEnv(env, ['API_KEY']);
    expect(map['API_KEY'].original).toBe('abc123');
  });

  it('handles missing keys gracefully', () => {
    const map = maskEnv(env, ['MISSING_KEY']);
    expect(map['MISSING_KEY'].masked).toBe('');
    expect(map['MISSING_KEY'].original).toBe('');
  });
});

describe('applyMask', () => {
  it('returns env with masked values for given keys', () => {
    const env = { SECRET: 'topsecret', PLAIN: 'visible' };
    const result = applyMask(env, ['SECRET'], { preserveLength: true });
    expect(result['SECRET']).not.toBe('topsecret');
    expect(result['PLAIN']).toBe('visible');
  });
});

describe('formatMaskResult', () => {
  it('formats key and masked value', () => {
    const result = formatMaskResult({ key: 'TOKEN', original: 'abc', masked: '***' });
    expect(result).toBe('TOKEN: ***');
  });
});
