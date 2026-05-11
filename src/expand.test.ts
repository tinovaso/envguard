import { expandValue, expandAll } from './expand';

describe('expandValue', () => {
  it('returns plain strings unchanged', () => {
    expect(expandValue('hello', {})).toBe('hello');
  });

  it('expands a simple variable reference', () => {
    const env = { HOST: 'localhost' };
    expect(expandValue('http://${HOST}:3000', env)).toBe('http://localhost:3000');
  });

  it('expands multiple references in one string', () => {
    const env = { HOST: 'localhost', PORT: '8080' };
    expect(expandValue('${HOST}:${PORT}', env)).toBe('localhost:8080');
  });

  it('returns empty string for unknown variable when fallback disabled', () => {
    const result = expandValue('${UNKNOWN}', {}, { fallbackToProcessEnv: false });
    expect(result).toBe('');
  });

  it('falls back to process.env when enabled', () => {
    process.env.TEST_EXPAND_VAR = 'from-process';
    const result = expandValue('${TEST_EXPAND_VAR}', {}, { fallbackToProcessEnv: true });
    expect(result).toBe('from-process');
    delete process.env.TEST_EXPAND_VAR;
  });

  it('does not fall back to process.env when disabled', () => {
    process.env.TEST_EXPAND_VAR2 = 'should-not-appear';
    const result = expandValue('${TEST_EXPAND_VAR2}', {}, { fallbackToProcessEnv: false });
    expect(result).toBe('');
    delete process.env.TEST_EXPAND_VAR2;
  });

  it('recursively expands nested references', () => {
    const env = { BASE: 'http://localhost', URL: '${BASE}/api' };
    expect(expandValue('${URL}/v1', env)).toBe('http://localhost/api/v1');
  });

  it('throws when max depth is exceeded (circular reference)', () => {
    const env = { A: '${B}', B: '${A}' };
    expect(() => expandValue('${A}', env, { maxDepth: 3 })).toThrow(
      /exceeded max depth/
    );
  });
});

describe('expandAll', () => {
  it('expands all values in the env record', () => {
    const env = {
      HOST: 'localhost',
      PORT: '3000',
      DATABASE_URL: 'postgres://${HOST}:${PORT}/mydb',
    };
    const result = expandAll(env);
    expect(result.DATABASE_URL).toBe('postgres://localhost:3000/mydb');
    expect(result.HOST).toBe('localhost');
    expect(result.PORT).toBe('3000');
  });

  it('leaves undefined values as undefined', () => {
    const env: Record<string, string | undefined> = { KEY: undefined };
    const result = expandAll(env);
    expect(result.KEY).toBeUndefined();
  });

  it('does not mutate the original env object', () => {
    const env = { A: 'hello', B: '${A} world' };
    const result = expandAll(env);
    expect(env.B).toBe('${A} world');
    expect(result.B).toBe('hello world');
  });

  it('handles env with no expandable values', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    expect(expandAll(env)).toEqual(env);
  });
});
