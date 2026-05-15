import { groupEnv, extractGroups, formatGroupReport } from './group';

const schema = {
  DB_HOST: { type: 'string' as const, group: 'database' },
  DB_PORT: { type: 'number' as const, group: 'database' },
  REDIS_URL: { type: 'string' as const, group: 'cache' },
  APP_PORT: { type: 'number' as const },
};

describe('extractGroups', () => {
  it('extracts groups from schema fields with group property', () => {
    const groups = extractGroups(schema);
    expect(groups['database']).toEqual(['DB_HOST', 'DB_PORT']);
    expect(groups['cache']).toEqual(['REDIS_URL']);
  });

  it('does not include keys without a group', () => {
    const groups = extractGroups(schema);
    expect(Object.values(groups).flat()).not.toContain('APP_PORT');
  });

  it('returns empty object when no groups are defined', () => {
    const groups = extractGroups({ FOO: { type: 'string' as const } });
    expect(groups).toEqual({});
  });
});

describe('groupEnv', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', REDIS_URL: 'redis://localhost' };

  it('returns grouped values for each group', () => {
    const groups = extractGroups(schema);
    const results = groupEnv(env, groups);
    const db = results.find((r) => r.group === 'database');
    expect(db?.values['DB_HOST']).toBe('localhost');
    expect(db?.values['DB_PORT']).toBe('5432');
  });

  it('marks missing keys as undefined', () => {
    const results = groupEnv({}, { database: ['DB_HOST', 'DB_PORT'] });
    const db = results.find((r) => r.group === 'database');
    expect(db?.values['DB_HOST']).toBeUndefined();
  });

  it('returns empty array for empty group map', () => {
    const results = groupEnv(env, {});
    expect(results).toEqual([]);
  });
});

describe('formatGroupReport', () => {
  it('returns fallback message when no results', () => {
    expect(formatGroupReport([])).toBe('No groups defined.');
  });

  it('formats group results into readable output', () => {
    const results = groupEnv(
      { DB_HOST: 'localhost', DB_PORT: '5432' },
      { database: ['DB_HOST', 'DB_PORT'] }
    );
    const report = formatGroupReport(results);
    expect(report).toContain('[database]');
    expect(report).toContain('DB_HOST: localhost');
    expect(report).toContain('DB_PORT: 5432');
  });

  it('shows (unset) for missing values', () => {
    const results = groupEnv({}, { database: ['DB_HOST'] });
    const report = formatGroupReport(results);
    expect(report).toContain('DB_HOST: (unset)');
  });
});
