import type { ReactNode } from 'react';

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: ReactNode;
};

export function DataTable<T>({ columns, rows, rowKey, emptyMessage }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage ?? '—'}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200/90 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-none">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/90 dark:border-white/10 dark:bg-white/5">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 dark:border-white/5 dark:hover:bg-white/[0.04]"
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 align-top text-zinc-700 dark:text-zinc-200">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
