/** Practical component is out of 40; pass minimum is 16. */
export const PRACTICAL_PASS_MIN = 16;
export const PRACTICAL_MAX = 40;
export const THEORY_MAX = 60;

/** Raw sum (practical + theory) at or above 58 receives assistance up to 60. */
export const PASS_RAW_SUM_MIN = 58;
export const PASS_TOTAL_MIN = 60;

export function isPracticalPass(practical: number): boolean {
  return practical >= PRACTICAL_PASS_MIN;
}

export function computePublishedTotal(practical: number, theory: number): {
  rawTotal: number;
  assistanceBonus: number;
  total: number;
} {
  const rawTotal = Math.round((practical + theory) * 100) / 100;
  if (rawTotal >= PASS_RAW_SUM_MIN && rawTotal < PASS_TOTAL_MIN) {
    const assistanceBonus = Math.round((PASS_TOTAL_MIN - rawTotal) * 100) / 100;
    return { rawTotal, assistanceBonus, total: PASS_TOTAL_MIN };
  }
  return { rawTotal, assistanceBonus: 0, total: rawTotal };
}
