import { formatCondition, capitalize, debounce } from './utils';

describe('formatCondition', () => {
  it('formats single word condition', () => {
    expect(formatCondition('mint')).toBe('Mint');
  });

  it('formats hyphenated condition', () => {
    expect(formatCondition('near-mint')).toBe('Near Mint');
  });

  it('formats multiple hyphenated words', () => {
    expect(formatCondition('very-near-mint')).toBe('Very Near Mint');
  });

  it('handles already capitalized words', () => {
    expect(formatCondition('Excellent')).toBe('Excellent');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('handles already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  it('delays function execution', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 500);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('cancels previous call when called again', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 500);

    debouncedFunc();
    jest.advanceTimersByTime(250);
    debouncedFunc();
    jest.advanceTimersByTime(250);

    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(250);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to debounced function', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 500);

    debouncedFunc('arg1', 'arg2');
    jest.advanceTimersByTime(500);

    expect(func).toHaveBeenCalledWith('arg1', 'arg2');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
