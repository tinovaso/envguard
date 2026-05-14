import { describe, it, expectTypeOf } from 'vitest';
import type { CastTarget, CastOptions, CastResult, CastEnvOptions, CastEnvResult, CastMap } from './cast.types';

describe('cast.types', () => {
  it('CastTarget covers expected literals', () => {
    const targets: CastTarget[] = ['string', 'number', 'boolean', 'json', 'array', 'date'];
    expect(targets).toHaveLength(6);
  });

  it('CastOptions has required target field', () => {
    expectTypeOf<CastOptions>().toHaveProperty('target');
  });

  it('CastResult has value, original, target, changed', () => {
    expectTypeOf<CastResult<number>>().toHaveProperty('value');
    expectTypeOf<CastResult<number>>().toHaveProperty('original');
    expectTypeOf<CastResult<number>>().toHaveProperty('target');
    expectTypeOf<CastResult<number>>().toHaveProperty('changed');
  });

  it('CastMap is a partial record of string to CastTarget', () => {
    const map: CastMap = { PORT: 'number', DEBUG: 'boolean' };
    expectTypeOf(map).toMatchTypeOf<Partial<Record<string, CastTarget>>>();
  });

  it('CastEnvOptions has map and optional fields', () => {
    expectTypeOf<CastEnvOptions>().toHaveProperty('map');
    expectTypeOf<CastEnvOptions>().toHaveProperty('delimiter');
    expectTypeOf<CastEnvOptions>().toHaveProperty('strict');
    expectTypeOf<CastEnvOptions>().toHaveProperty('skipMissing');
  });

  it('CastEnvResult has values, results, and errors', () => {
    expectTypeOf<CastEnvResult>().toHaveProperty('values');
    expectTypeOf<CastEnvResult>().toHaveProperty('results');
    expectTypeOf<CastEnvResult>().toHaveProperty('errors');
  });
});
