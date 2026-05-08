import { describe, it, expect } from 'vitest';
import { applyTransform, applyTransforms, changedTransforms } from './transform';
import type { SchemaField } from './schema.types';

const makeField = (overrides: Partial<SchemaField> & { transform?: (v: unknown) => unknown } = {}): SchemaField =>
  ({ type: 'string', ...overrides } as SchemaField);

describe('applyTransform', () => {
  it('returns the value unchanged when no transform is defined', () => {
    const field = makeField();
    expect(applyTransform('hello', field)).toBe('hello');
  });

  it('applies a transform function when present', () => {
    const field = makeField({ transform: (v: unknown) => (v as string).toUpperCase() });
    expect(applyTransform('hello', field)).toBe('HELLO');
  });

  it('works with numeric transforms', () => {
    const field = makeField({ transform: (v: unknown) => (v as number) * 2 });
    expect(applyTransform(5, field)).toBe(10);
  });

  it('handles transform returning a different type gracefully', () => {
    const field = makeField({ transform: () => 42 });
    expect(applyTransform('any', field)).toBe(42);
  });
});

describe('applyTransforms', () => {
  it('returns a copy of parsed with transforms applied', () => {
    const schema = {
      PORT: makeField({ type: 'number', transform: (v: unknown) => (v as number) + 1 }),
      HOST: makeField(),
    };
    const parsed = { PORT: 3000, HOST: 'localhost' };
    const { result } = applyTransforms(parsed, schema);
    expect(result.PORT).toBe(3001);
    expect(result.HOST).toBe('localhost');
  });

  it('skips keys not present in parsed', () => {
    const schema = {
      MISSING: makeField({ transform: () => 'x' }),
    };
    const { result, report } = applyTransforms({}, schema);
    expect(result.MISSING).toBeUndefined();
    expect(report).toHaveLength(0);
  });

  it('does not mutate the original parsed object', () => {
    const schema = { NAME: makeField({ transform: (v: unknown) => (v as string).trim() }) };
    const parsed = { NAME: '  alice  ' };
    applyTransforms(parsed, schema);
    expect(parsed.NAME).toBe('  alice  ');
  });

  it('reports changed and unchanged keys correctly', () => {
    const schema = {
      A: makeField({ transform: (v: unknown) => (v as string).toUpperCase() }),
      B: makeField(),
    };
    const { report } = applyTransforms({ A: 'hello', B: 'world' }, schema);
    const a = report.find((r) => r.key === 'A')!;
    const b = report.find((r) => r.key === 'B')!;
    expect(a.changed).toBe(true);
    expect(b.changed).toBe(false);
  });
});

describe('changedTransforms', () => {
  it('filters to only changed entries', () => {
    const report = [
      { key: 'A', original: 'a', transformed: 'A', changed: true },
      { key: 'B', original: 'b', transformed: 'b', changed: false },
    ];
    const changed = changedTransforms(report);
    expect(changed).toHaveLength(1);
    expect(changed[0].key).toBe('A');
  });

  it('returns empty array when nothing changed', () => {
    const report = [{ key: 'X', original: 1, transformed: 1, changed: false }];
    expect(changedTransforms(report)).toHaveLength(0);
  });
});
