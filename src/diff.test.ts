import { describe, it, expect } from 'vitest';
import { diffEnv, formatDiff } from './diff';

describe('diffEnv', () => {
  it('detects added keys', () => {
    const result = diffEnv({}, { NEW_KEY: 'hello' });
    expect(result.added).toContain('NEW_KEY');
    expect(result.hasChanges).toBe(true);
  });

  it('detects removed keys', () => {
    const result = diffEnv({ OLD_KEY: 'bye' }, {});
    expect(result.removed).toContain('OLD_KEY');
    expect(result.hasChanges).toBe(true);
  });

  it('detects changed keys', () => {
    const result = diffEnv({ PORT: '3000' }, { PORT: '4000' });
    expect(result.changed).toContain('PORT');
    const entry = result.entries.find((e) => e.key === 'PORT');
    expect(entry?.prev).toBe('3000');
    expect(entry?.next).toBe('4000');
  });

  it('marks unchanged keys correctly', () => {
    const result = diffEnv({ HOST: 'localhost' }, { HOST: 'localhost' });
    expect(result.unchanged).toContain('HOST');
    expect(result.hasChanges).toBe(false);
  });

  it('masks sensitive keys', () => {
    const result = diffEnv(
      { SECRET: 'old-secret' },
      { SECRET: 'new-secret' },
      { sensitiveKeys: ['SECRET'] }
    );
    const entry = result.entries.find((e) => e.key === 'SECRET');
    expect(entry?.prev).toBe('***');
    expect(entry?.next).toBe('***');
    expect(result.changed).toContain('SECRET');
  });

  it('uses custom mask string', () => {
    const result = diffEnv(
      { TOKEN: 'abc' },
      { TOKEN: 'xyz' },
      { sensitiveKeys: ['TOKEN'], mask: '[REDACTED]' }
    );
    const entry = result.entries.find((e) => e.key === 'TOKEN');
    expect(entry?.prev).toBe('[REDACTED]');
  });

  it('excludes unchanged entries when changesOnly is true', () => {
    const result = diffEnv(
      { A: '1', B: '2' },
      { A: '1', B: '3' },
      { changesOnly: true }
    );
    expect(result.entries.some((e) => e.key === 'A')).toBe(false);
    expect(result.entries.some((e) => e.key === 'B')).toBe(true);
  });

  it('returns hasChanges false for identical envs', () => {
    const env = { A: '1', B: '2' };
    const result = diffEnv(env, { ...env });
    expect(result.hasChanges).toBe(false);
  });
});

describe('formatDiff', () => {
  it('returns no-change message when identical', () => {
    const result = diffEnv({ A: '1' }, { A: '1' });
    expect(formatDiff(result)).toBe('No changes detected.');
  });

  it('formats added, removed, and changed lines', () => {
    const result = diffEnv(
      { OLD: 'x', SAME: 'y', PORT: '3000' },
      { SAME: 'y', PORT: '4000', NEW: 'z' }
    );
    const output = formatDiff(result);
    expect(output).toContain('+ NEW=z');
    expect(output).toContain('- OLD=x');
    expect(output).toContain('~ PORT: 3000 → 4000');
    expect(output).not.toContain('SAME');
  });
});
