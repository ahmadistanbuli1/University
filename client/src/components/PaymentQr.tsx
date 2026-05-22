/** Decorative QR-style grid for simulated payment (not a scannable encoding). */
export function PaymentQr({ value, size = 160 }: { value: string; size?: number }) {
  const cells = 21;
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  const modules: boolean[][] = [];
  for (let y = 0; y < cells; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < cells; x++) {
      const corner =
        (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7);
      const finder =
        corner &&
        (x === 0 ||
          x === 6 ||
          y === 0 ||
          y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
          (x >= cells - 7 && x <= cells - 5 && y >= 2 && y <= 4) ||
          (x >= 2 && x <= 4 && y >= cells - 7 && y <= cells - 5));
      const pseudo = ((hash + x * 17 + y * 23) % 5) < 2;
      row.push(finder || (!corner && pseudo));
    }
    modules.push(row);
  }

  const cellSize = size / cells;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950"
      role="img"
      aria-label="Payment QR code"
    >
      {modules.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="currentColor"
              className="text-zinc-900 dark:text-white"
            />
          ) : null
        )
      )}
    </svg>
  );
}
