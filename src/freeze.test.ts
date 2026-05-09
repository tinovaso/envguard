import { describe, it, expect } from 'vitest';
import { freezeEnv, isFrozen, safeGet, thawEnv } from './freeze';

describe('freezeEnv', () => {
  it('freezes all keys by default', () => {
    const env = { PORT: 3000, HOST: 'localhost', SECRET: 'abc' };
    const frozen = freezeEnv(env);
    expect(isFrozen(frozen)).toBe(true);
  });

  it('prevents mutation of frozen env', () => {
    const env = { PORT: 3000 };
    const frozen = freezeEnv(env);
    expect(() => {
      (frozen as Record<string, unknown>)['PORT'] = 9999;
    }).toThrow();
  });

  it('preserves all key values after freezing', () => {
    const env = { PORT: 8080, HOST: 'example.com', DEBUG: true };
    const frozen = freezeEnv(env);
    expect(frozen.PORT).toBe(8080);
    expect(frozen.HOST).toBe('example.com');
    expect(frozen.DEBUG).toBe(true);
  });

  it('excludes specified keys from the frozen copy (still readable)', () => {
    const env = { PORT: 3000, SECRET: 'hunter2', HOST: 'localhost' };
    const frozen = freezeEnv(env, { exclude: ['SECRET'] });
    expect(frozen.SECRET).toBe('hunter2');
    expect(frozen.PORT).toBe(3000);
  });

  it('does not mutate the original object', () => {
    const env = { PORT: 3000, HOST: 'localhost' };
    freezeEnv(env);
    expect(isFrozen(env)).toBe(false);
  });
});

describe('isFrozen', () => {
  it('returns true for frozen objects', () => {
    expect(isFrozen(Object.freeze({ a: 1 }))).toBe(true);
  });

  it('returns false for plain objects', () => {
    expect(isFrozen({ a: 1 })).toBe(false);
  });
});

describe('safeGet', () => {
  it('retrieves a value from a frozen env', () => {
    const frozen = freezeEnv({ PORT: 4000 });
    expect(safeGet(frozen, 'PORT')).toBe(4000);
  });

  it('returns undefined for missing keys', () => {
    const frozen = freezeEnv({ PORT: 4000 } as Record<string, unknown>);
    expect(safeGet(frozen, 'MISSING' as keyof typeof frozen)).toBeUndefined();
  });
});

describe('thawEnv', () => {
  it('returns a mutable copy of a frozen env', () => {
    const frozen = freezeEnv({ PORT: 3000, HOST: 'localhost' });
    const thawed = thawEnv(frozen);
    expect(isFrozen(thawed)).toBe(false);
    thawed.PORT = 9999;
    expect(thawed.PORT).toBe(9999);
    expect(frozen.PORT).toBe(3000);
  });

  it('preserves all values in the thawed copy', () => {
    const frozen = freezeEnv({ A: 'x', B: 'y' });
    const thawed = thawEnv(frozen);
    expect(thawed).toEqual({ A: 'x', B: 'y' });
  });
});
