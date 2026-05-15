import {
  filterEnv,
  filterByPrefix,
  filterByKeys,
  filterBySchema,
  formatFilterResult,
} from './filter';

describe('filterEnv', () => {
  const env = { A: '1', B: '2', C: '3' };

  it('splits env into matched and excluded by predicate', () => {
    const result = filterEnv(env, (key) => key !== 'B');
    expect(result.matched).toEqual({ A: '1', C: '3' });
    expect(result.excluded).toEqual({ B: '2' });
  });

  it('returns all in matched when predicate always true', () => {
    const result = filterEnv(env, () => true);
    expect(result.matched).toEqual(env);
    expect(result.excluded).toEqual({});
  });

  it('returns all in excluded when predicate always false', () => {
    const result = filterEnv(env, () => false);
    expect(result.matched).toEqual({});
    expect(result.excluded).toEqual(env);
  });

  it('passes both key and value to predicate', () => {
    const result = filterEnv(env, (key, value) => key === 'A' && value === '1');
    expect(result.matched).toEqual({ A: '1' });
  });
});

describe('filterByPrefix', () => {
  const env = { APP_PORT: '3000', APP_HOST: 'localhost', DB_URL: 'postgres://...' };

  it('matches keys with given prefix', () => {
    const result = filterByPrefix(env, 'APP_');
    expect(result.matched).toEqual({ APP_PORT: '3000', APP_HOST: 'localhost' });
    expect(result.excluded).toEqual({ DB_URL: 'postgres://...' });
  });

  it('returns empty matched when no keys match prefix', () => {
    const result = filterByPrefix(env, 'UNKNOWN_');
    expect(result.matched).toEqual({});
  });
});

describe('filterByKeys', () => {
  const env = { X: '1', Y: '2', Z: '3' };

  it('returns only specified keys as matched', () => {
    const result = filterByKeys(env, ['X', 'Z']);
    expect(result.matched).toEqual({ X: '1', Z: '3' });
    expect(result.excluded).toEqual({ Y: '2' });
  });

  it('ignores keys not present in env', () => {
    const result = filterByKeys(env, ['X', 'MISSING']);
    expect(result.matched).toEqual({ X: '1' });
  });
});

describe('filterBySchema', () => {
  const schema = {
    PORT: { type: 'number' as const },
    HOST: { type: 'string' as const },
  };
  const env = { PORT: '3000', HOST: 'localhost', EXTRA: 'ignored' };

  it('filters env to only schema keys', () => {
    const result = filterBySchema(env, schema);
    expect(result.matched).toEqual({ PORT: '3000', HOST: 'localhost' });
    expect(result.excluded).toEqual({ EXTRA: 'ignored' });
  });
});

describe('formatFilterResult', () => {
  it('formats result with matched and excluded keys', () => {
    const result = { matched: { A: '1' }, excluded: { B: '2', C: '3' } };
    const output = formatFilterResult(result);
    expect(output).toContain('1 matched');
    expect(output).toContain('2 excluded');
    expect(output).toContain('Matched: A');
    expect(output).toContain('Excluded: B, C');
  });

  it('omits sections for empty groups', () => {
    const result = { matched: { A: '1' }, excluded: {} };
    const output = formatFilterResult(result);
    expect(output).not.toContain('Excluded:');
  });
});
