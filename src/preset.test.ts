import {
  registerPreset,
  getPreset,
  listPresets,
  mergePresets,
  clearPresets,
  Preset,
} from './preset';
import { describePreset } from './preset.types';

const dbPreset: Preset<any> = {
  name: 'database',
  description: 'Database connection settings',
  schema: {
    DB_HOST: { type: 'string', required: true },
    DB_PORT: { type: 'number', default: '5432' },
  },
  defaults: { DB_HOST: 'localhost' },
};

const cachePreset: Preset<any> = {
  name: 'cache',
  description: 'Cache layer settings',
  schema: {
    CACHE_URL: { type: 'string', required: true },
    CACHE_TTL: { type: 'number', default: '300' },
  },
  defaults: { CACHE_URL: 'redis://localhost:6379' },
};

beforeEach(() => clearPresets());

describe('registerPreset', () => {
  it('registers a preset without error', () => {
    expect(() => registerPreset(dbPreset)).not.toThrow();
  });

  it('throws when registering a duplicate preset name', () => {
    registerPreset(dbPreset);
    expect(() => registerPreset(dbPreset)).toThrow(
      'Preset "database" is already registered.'
    );
  });
});

describe('getPreset', () => {
  it('returns undefined for unknown preset', () => {
    expect(getPreset('unknown')).toBeUndefined();
  });

  it('returns the registered preset', () => {
    registerPreset(dbPreset);
    expect(getPreset('database')).toEqual(dbPreset);
  });
});

describe('listPresets', () => {
  it('returns empty array when no presets registered', () => {
    expect(listPresets()).toEqual([]);
  });

  it('lists all registered preset names', () => {
    registerPreset(dbPreset);
    registerPreset(cachePreset);
    expect(listPresets()).toEqual(expect.arrayContaining(['database', 'cache']));
  });
});

describe('mergePresets', () => {
  it('merges schemas and defaults from both presets', () => {
    const merged = mergePresets(dbPreset, cachePreset);
    expect(merged.name).toBe('database+cache');
    expect(merged.schema).toHaveProperty('DB_HOST');
    expect(merged.schema).toHaveProperty('CACHE_URL');
    expect(merged.defaults).toMatchObject({
      DB_HOST: 'localhost',
      CACHE_URL: 'redis://localhost:6379',
    });
  });

  it('override preset description takes precedence', () => {
    const merged = mergePresets(dbPreset, cachePreset);
    expect(merged.description).toBe('Cache layer settings');
  });
});

describe('describePreset', () => {
  it('returns correct metadata for a preset', () => {
    const meta = describePreset(dbPreset);
    expect(meta.name).toBe('database');
    expect(meta.fieldCount).toBe(2);
    expect(meta.defaultCount).toBe(1);
    expect(meta.description).toBe('Database connection settings');
  });
});
