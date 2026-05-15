import { omitKeys, omitSchema, omitWhere, formatOmitReport } from './omit';

describe('omitKeys', () => {
  it('removes specified keys from env', () => {
    const env = { PORT: '3000', HOST: 'localhost', SECRET: 'abc' };
    const result = omitKeys(env, ['SECRET']);
    expect(result).toEqual({ PORT: '3000', HOST: 'localhost' });
    expect('SECRET' in result).toBe(false);
  });

  it('returns a new object without mutating the original', () => {
    const env = { A: '1', B: '2' };
    const result = omitKeys(env, ['A']);
    expect(env).toHaveProperty('A');
    expect(result).not.toHaveProperty('A');
  });

  it('handles empty keys array', () => {
    const env = { X: '1' };
    expect(omitKeys(env, [])).toEqual({ X: '1' });
  });
});

describe('omitSchema', () => {
  it('removes specified keys from schema', () => {
    const schema = {
      PORT: { type: 'number' as const },
      SECRET: { type: 'string' as const, sensitive: true },
    };
    const result = omitSchema(schema, ['SECRET']);
    expect(result).toHaveProperty('PORT');
    expect(result).not.toHaveProperty('SECRET');
  });

  it('does not mutate the original schema', () => {
    const schema = { A: { type: 'string' as const }, B: { type: 'boolean' as const } };
    omitSchema(schema, ['A']);
    expect(schema).toHaveProperty('A');
  });
});

describe('omitWhere', () => {
  it('removes keys matching predicate', () => {
    const env = { PORT: '3000', DEBUG: 'true', SECRET_KEY: 'xyz' };
    const result = omitWhere(env, (key) => key.startsWith('SECRET'));
    expect(result).toEqual({ PORT: '3000', DEBUG: 'true' });
  });

  it('removes keys based on value predicate', () => {
    const env = { A: undefined, B: 'hello', C: undefined };
    const result = omitWhere(env, (_, v) => v === undefined);
    expect(result).toEqual({ B: 'hello' });
  });

  it('returns all keys if predicate never matches', () => {
    const env = { X: '1', Y: '2' };
    expect(omitWhere(env, () => false)).toEqual({ X: '1', Y: '2' });
  });
});

describe('formatOmitReport', () => {
  it('reports removed keys', () => {
    const original = { A: '1', B: '2', C: '3' };
    const result = { A: '1' };
    const report = formatOmitReport(original, result);
    expect(report).toContain('removed 2 key(s)');
    expect(report).toContain('B');
    expect(report).toContain('C');
  });

  it('reports no keys removed when result equals original', () => {
    const env = { A: '1' };
    expect(formatOmitReport(env, env)).toBe('omit: no keys removed');
  });
});
