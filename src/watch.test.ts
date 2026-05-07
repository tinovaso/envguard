import { watchEnv } from './watch';
import { SchemaShape } from './schema.types';

const schema: SchemaShape = {
  PORT: { type: 'number', required: true },
  DEBUG: { type: 'boolean', required: false },
  APP_NAME: { type: 'string', required: true },
};

describe('watchEnv', () => {
  beforeEach(() => {
    process.env.PORT = '3000';
    process.env.DEBUG = 'false';
    process.env.APP_NAME = 'test-app';
  });

  afterEach(() => {
    delete process.env.PORT;
    delete process.env.DEBUG;
    delete process.env.APP_NAME;
  });

  it('returns a WatchHandle with active=true', () => {
    const handle = watchEnv(schema, { interval: 10000 });
    expect(handle.active).toBe(true);
    handle.stop();
  });

  it('stops watching after stop() is called', () => {
    const handle = watchEnv(schema, { interval: 10000 });
    handle.stop();
    expect(handle.active).toBe(false);
  });

  it('calls onChange when a value changes', () => {
    const onChange = jest.fn();
    const handle = watchEnv(schema, { interval: 10000, onChange });

    process.env.PORT = '4000';
    handle.check();

    expect(onChange).toHaveBeenCalledWith('PORT', '3000', '4000');
    handle.stop();
  });

  it('does not call onChange when nothing changes', () => {
    const onChange = jest.fn();
    const handle = watchEnv(schema, { interval: 10000, onChange });

    handle.check();

    expect(onChange).not.toHaveBeenCalled();
    handle.stop();
  });

  it('calls onError when a changed value is invalid type', () => {
    const onError = jest.fn();
    const handle = watchEnv(schema, { interval: 10000, onError });

    process.env.PORT = 'not-a-number';
    handle.check();

    expect(onError).toHaveBeenCalled();
    const errors = onError.mock.calls[0][0];
    expect(errors.some((e: { key: string }) => e.key === 'PORT')).toBe(true);
    handle.stop();
  });

  it('detects variable deletion', () => {
    const onChange = jest.fn();
    const handle = watchEnv(schema, { interval: 10000, onChange });

    delete process.env.APP_NAME;
    handle.check();

    expect(onChange).toHaveBeenCalledWith('APP_NAME', 'test-app', undefined);
    handle.stop();
  });
});
