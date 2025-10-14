/**
 * Card condition options
 */
export const CARD_CONDITIONS = [
  'mint',
  'near-mint',
  'excellent',
  'good',
  'played',
  'poor',
] as const;

export type CardCondition = typeof CARD_CONDITIONS[number];
