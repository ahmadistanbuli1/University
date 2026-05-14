type ResultRow = { facultyCourseId: string; attemptNumber: number; score: { toString(): string } };

export function computeGpaFromLatestAttempts(results: ResultRow[]): number {
  const best = new Map<string, { attempt: number; score: number }>();
  for (const r of results) {
    const scoreNum = Number(r.score.toString());
    const prev = best.get(r.facultyCourseId);
    if (
      !prev ||
      r.attemptNumber > prev.attempt ||
      (r.attemptNumber === prev.attempt && scoreNum > prev.score)
    ) {
      best.set(r.facultyCourseId, { attempt: r.attemptNumber, score: scoreNum });
    }
  }
  const scores = [...best.values()].map((v) => v.score);
  if (scores.length === 0) return 0;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 100) / 100;
}
