import { mergeSchemas, mergeFields, mergeEnv, overlappingKeys } from './merge';

const schemaA = {
  PORT: { type: 'number' as const, default: 3000 },
  HOST: { type: 'string' as const, default: 'localhost' },
};

const schemaB = {
  HOST: { type: 'string' as const, default: '0.0.0.0' },
  DEBUG: { type: 'boolean' as const, default: false },
};

describe('mergeSchemas', () => {
  it('combines fields from both schemas', () => {
    const merged = mergeSchemas(schemaA, schemaB);
    expect(merged).toHaveProperty('PORT');
    expect(merged).toHaveProperty('HOST');
    expect(merged).toHaveProperty('DEBUG');
  });

  it('later schema overrides earlier for overlapping keys', () => {
    const merged = mergeSchemas(schemaA, schemaB);
    expect((merged as any).HOST.default).toBe('0.0.0.0');
  });
});

describe('mergeFields', () => {
  it('merges multiple partial shapes', () => {
    const result = mergeFields(
      { PORT: { type: 'number' as const } },
      { HOST: { type: 'string' as const } }
    );
    expect(result).toHaveProperty('PORT');
    expect(result).toHaveProperty('HOST');
  });

  it('later fields override earlier ones', () => {
    const result = mergeFields(
      { PORT: { type: 'number' as const, default: 3000 } },
      { PORT: { type: 'number' as const, default: 8080 } }
    );
    expect((result as any).PORT.default).toBe(8080);
  });
});

describe('mergeEnv', () => {
  it('merges two env records', () => {
    const result = mergeEnv({ A: '1', B: '2' }, { B: '3', C: '4' });
    expect(result).toEqual({ A: '1', B: '3', C: '4' });
  });

  it('does not override defined values with undefined', () => {
    const result = mergeEnv({ A: 'hello' }, { A: undefined });
    expect(result.A).toBe('hello');
  });

  it('merges three or more env records', () => {
    const result = mergeEnv({ A: '1' }, { B: '2' }, { C: '3', A: '99' });
    expect(result).toEqual({ A: '99', B: '2', C: '3' });
  });
});

describe('overlappingKeys', () => {
  it('returns keys present in both schemas', () => {
    const keys = overlappingKeys(schemaA, schemaB);
    expect(keys).toEqual(['HOST']);
  });

  it('returns empty array when no overlap', () => {
    const keys = overlappingKeys({ A: { type: 'string' as const } }, { B: { type: 'number' as const } });
    expect(keys).toHaveLength(0);
  });
});
