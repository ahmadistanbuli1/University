/** Short label for crowded chart axes (RTL-safe). */
export function truncateChartLabel(text: string, maxLen = 20): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

export const chartTickStyle = (fill: string, fontSize = 11) => ({
  fill,
  fontSize,
  direction: 'ltr' as const,
});
