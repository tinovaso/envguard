import { describe, it, expectTypeOf } from 'vitest';
import type { DiffChangeKind, DiffEntry, DiffResult, DiffOptions } from './diff.types';

describe('DiffChangeKind', () => {
  it('accepts valid change kinds', () => {
    const kind: DiffChangeKind = 'added';
    expectTypeOf(kind).toEqualTypeOf<DiffChangeKind>();
  });
});

describe('DiffEntry', () => {
  it('has required key and kind fields', () => {
    const entry: DiffEntry = { key: 'PORT', kind: 'changed', prev: '3000', next: '4000' };
    expectTypeOf(entry.key).toEqualTypeOf<string>();
    expectTypeOf(entry.kind).toEqualTypeOf<DiffChangeKind>();
  });

  it('allows optional prev and next', () => {
    const added: DiffEntry = { key: 'NEW', kind: 'added', next: 'value' };
    expectTypeOf(added.prev).toEqualTypeOf<string | undefined>();
  });
});

describe('DiffResult', () => {
  it('has correct shape', () => {
    expectTypeOf<DiffResult>().toHaveProperty('entries');
    expectTypeOf<DiffResult>().toHaveProperty('hasChanges');
    expectTypeOf<DiffResult['hasChanges']>().toEqualTypeOf<boolean>();
    expectTypeOf<DiffResult['added']>().toEqualTypeOf<string[]>();
  });
});

describe('DiffOptions', () => {
  it('all fields are optional', () => {
    const opts: DiffOptions = {};
    expectTypeOf(opts.sensitiveKeys).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(opts.changesOnly).toEqualTypeOf<boolean | undefined>();
    expectTypeOf(opts.mask).toEqualTypeOf<string | undefined>();
  });
});
