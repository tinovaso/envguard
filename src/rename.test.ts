import { renameKeys, buildRenameMapFromSchema, formatRenameReport } from './rename';

describe('renameKeys', () => {
  it('renames a key and removes the old one by default', () => {
    const env = { OLD_KEY: 'hello', OTHER: 'world' };
    const { env: result, applied, skipped } = renameKeys(env, { OLD_KEY: 'NEW_KEY' });
    expect(result).toEqual({ NEW_KEY: 'hello', OTHER: 'world' });
    expect(applied).toHaveLength(1);
    expect(applied[0]).toMatchObject({ from: 'OLD_KEY', to: 'NEW_KEY', value: 'hello' });
    expect(skipped).toHaveLength(0);
  });

  it('keeps old key when dropOld is false', () => {
    const env = { OLD_KEY: 'hello' };
    const { env: result } = renameKeys(env, { OLD_KEY: 'NEW_KEY' }, { dropOld: false });
    expect(result).toHaveProperty('OLD_KEY', 'hello');
    expect(result).toHaveProperty('NEW_KEY', 'hello');
  });

  it('skips rename when source key is missing', () => {
    const env = { OTHER: 'x' };
    const { applied, skipped } = renameKeys(env, { MISSING: 'TARGET' });
    expect(applied).toHaveLength(0);
    expect(skipped[0].reason).toContain('not present');
  });

  it('skips rename when destination already exists and overwrite is false', () => {
    const env = { OLD: 'old_val', NEW: 'existing' };
    const { env: result, skipped } = renameKeys(env, { OLD: 'NEW' });
    expect(result['NEW']).toBe('existing');
    expect(skipped[0].reason).toContain('already exists');
  });

  it('overwrites destination when overwrite is true', () => {
    const env = { OLD: 'new_val', NEW: 'existing' };
    const { env: result, applied } = renameKeys(env, { OLD: 'NEW' }, { overwrite: true });
    expect(result['NEW']).toBe('new_val');
    expect(applied).toHaveLength(1);
  });

  it('handles multiple renames', () => {
    const env = { A: '1', B: '2', C: '3' };
    const { env: result } = renameKeys(env, { A: 'X', B: 'Y' });
    expect(result).toEqual({ X: '1', Y: '2', C: '3' });
  });
});

describe('buildRenameMapFromSchema', () => {
  it('extracts single alias', () => {
    const schema = { NEW_KEY: { type: 'string', alias: 'OLD_KEY' } };
    const map = buildRenameMapFromSchema(schema as never);
    expect(map).toEqual({ OLD_KEY: 'NEW_KEY' });
  });

  it('extracts multiple aliases', () => {
    const schema = { NEW_KEY: { type: 'string', alias: ['ALIAS_1', 'ALIAS_2'] } };
    const map = buildRenameMapFromSchema(schema as never);
    expect(map).toEqual({ ALIAS_1: 'NEW_KEY', ALIAS_2: 'NEW_KEY' });
  });

  it('returns empty map when no aliases defined', () => {
    const schema = { KEY: { type: 'string' } };
    const map = buildRenameMapFromSchema(schema as never);
    expect(map).toEqual({});
  });
});

describe('formatRenameReport', () => {
  it('formats applied and skipped entries', () => {
    const result = {
      env: {},
      applied: [{ from: 'OLD', to: 'NEW', value: 'val' }],
      skipped: [{ from: 'GONE', to: 'TARGET', reason: 'source key "GONE" not present' }],
    };
    const report = formatRenameReport(result);
    expect(report).toContain('OLD → NEW');
    expect(report).toContain('GONE → TARGET');
    expect(report).toContain('not present');
  });

  it('returns empty string when nothing happened', () => {
    const report = formatRenameReport({ env: {}, applied: [], skipped: [] });
    expect(report).toBe('');
  });
});
