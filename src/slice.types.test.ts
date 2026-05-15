import { SliceResult, SliceMap } from './slice.types';

describe('SliceResult type', () => {
  it('holds slice, missing, and matched fields', () => {
    const result: SliceResult<{ HOST: string; PORT: string }> = {
      slice: { HOST: 'localhost' },
      missing: ['PORT'],
      matched: ['HOST'],
    };
    expect(result.missing).toContain('PORT');
    expect(result.matched).toContain('HOST');
    expect(result.slice.HOST).toBe('localhost');
  });
});

describe('SliceMap type', () => {
  it('narrows to selected keys', () => {
    type Env = { HOST: string; PORT: string; SECRET: string };
    type Narrow = SliceMap<Env, 'HOST' | 'PORT'>;

    const narrow: Narrow = { HOST: 'localhost', PORT: '3000' };
    expect(narrow.HOST).toBe('localhost');
    expect(narrow.PORT).toBe('3000');
    // @ts-expect-error SECRET should not exist on Narrow
    expect(narrow.SECRET).toBeUndefined();
  });
});
