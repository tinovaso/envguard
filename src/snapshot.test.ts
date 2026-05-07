import { captureSnapshot, restoreSnapshot, snapshotDiff } from './snapshot';

describe('captureSnapshot', () => {
  it('captures current env variables', () => {
    process.env.TEST_SNAP = 'hello';
    const snap = captureSnapshot();
    expect(snap['TEST_SNAP']).toBe('hello');
    delete process.env.TEST_SNAP;
  });

  it('returns a plain object', () => {
    const snap = captureSnapshot();
    expect(typeof snap).toBe('object');
  });
});

describe('restoreSnapshot', () => {
  it('restores env variables from snapshot', () => {
    process.env.RESTORE_KEY = 'original';
    const snap = captureSnapshot();

    process.env.RESTORE_KEY = 'changed';
    restoreSnapshot(snap, ['RESTORE_KEY']);

    expect(process.env.RESTORE_KEY).toBe('original');
    delete process.env.RESTORE_KEY;
  });

  it('deletes keys not present in snapshot', () => {
    const snap = {};
    process.env.TEMP_KEY = 'value';
    restoreSnapshot(snap, ['TEMP_KEY']);
    expect(process.env.TEMP_KEY).toBeUndefined();
  });
});

describe('snapshotDiff', () => {
  it('detects changed values', () => {
    const before = { A: '1', B: '2' };
    const after = { A: '1', B: '3' };
    const diff = snapshotDiff(before, after);
    expect(diff).toEqual({ B: { before: '2', after: '3' } });
  });

  it('detects added keys', () => {
    const before = { A: '1' };
    const after = { A: '1', C: 'new' };
    const diff = snapshotDiff(before, after);
    expect(diff).toEqual({ C: { before: undefined, after: 'new' } });
  });

  it('detects removed keys', () => {
    const before = { A: '1', D: 'gone' };
    const after = { A: '1' };
    const diff = snapshotDiff(before, after);
    expect(diff).toEqual({ D: { before: 'gone', after: undefined } });
  });

  it('returns empty object when no changes', () => {
    const before = { X: 'same' };
    const after = { X: 'same' };
    const diff = snapshotDiff(before, after);
    expect(diff).toEqual({});
  });
});
