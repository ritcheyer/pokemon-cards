import { CARD_CONDITIONS } from './constants';
import type { CardCondition } from './types';

describe('CARD_CONDITIONS', () => {
  it('contains all expected conditions', () => {
    expect(CARD_CONDITIONS).toEqual([
      'mint',
      'near-mint',
      'excellent',
      'good',
      'played',
      'poor',
    ]);
  });

  it('has exactly 6 conditions', () => {
    expect(CARD_CONDITIONS).toHaveLength(6);
  });

  it('all values are valid CardCondition types', () => {
    CARD_CONDITIONS.forEach((condition) => {
      expect(typeof condition).toBe('string');
      expect(condition).toBeTruthy();
    });
  });

  it('contains no duplicates', () => {
    const uniqueConditions = new Set(CARD_CONDITIONS);
    expect(uniqueConditions.size).toBe(CARD_CONDITIONS.length);
  });

  it('is ordered from best to worst condition', () => {
    expect(CARD_CONDITIONS[0]).toBe('mint');
    expect(CARD_CONDITIONS[CARD_CONDITIONS.length - 1]).toBe('poor');
  });
});
