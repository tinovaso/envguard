import { sliceEnv, sliceOnly, formatSliceReport } from './slice';

const env = {
  HOST: 'localhost',
  PORT: '3000',
  DB_URL: 'postgres://localhost/mydb',
  SECRET: 'abc123',
};

describe('sliceEnv', () => {
  it('extracts requested keys', () => {
    const { slice, matched, missing } = sliceEnv(env, ['HOST', 'PORT']);
    expect(slice).toEqual({ HOST: 'localhost', PORT: '3000' });
    expect(matched).toEqual(['HOST', 'PORT']);
    expect(missing).toEqual([]);
  });

  it('reports missing keys', () => {
    const { missing } = sliceEnv(env, ['HOST', 'NONEXISTENT' as keyof typeof env]);
    expect(missing).toContain('NONEXISTENT');
  });

  it('does not throw by default when keys are missing', () => {
    expect(() =>
      sliceEnv(env, ['MISSING_KEY' as keyof typeof env])
    ).not.toThrow();
  });

  it('throws in strict mode when keys are missing', () => {
    expect(() =>
      sliceEnv(env, ['MISSING_KEY' as keyof typeof env], { strict: true })
    ).toThrow(/missing keys/);
  });

  it('returns empty slice for empty keys array', () => {
    const { slice, matched, missing } = sliceEnv(env, []);
    expect(slice).toEqual({});
    expect(matched).toEqual([]);
    expect(missing).toEqual([]);
  });
});

describe('sliceOnly', () => {
  it('returns only the slice object', () => {
    const result = sliceOnly(env, ['HOST', 'DB_URL']);
    expect(result).toEqual({ HOST: 'localhost', DB_URL: 'postgres://localhost/mydb' });
  });

  it('includes undefined for missing keys', () => {
    const result = sliceOnly(env, ['HOST', 'MISSING' as keyof typeof env]);
    expect(result).toHaveProperty('HOST', 'localhost');
    expect(result).toHaveProperty('MISSING', undefined);
  });
});

describe('formatSliceReport', () => {
  it('formats a report with matched and missing', () => {
    const result = sliceEnv(env, ['HOST', 'MISSING' as keyof typeof env]);
    const report = formatSliceReport(result);
    expect(report).toContain('Slice Report');
    expect(report).toContain('HOST');
    expect(report).toContain('MISSING');
  });

  it('shows dashes when lists are empty', () => {
    const report = formatSliceReport({ slice: {}, matched: [], missing: [] });
    expect(report).toContain('—');
  });
});
