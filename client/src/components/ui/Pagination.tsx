import type { ReactNode } from 'react';
import { Button } from './Button.js';

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  summary: ReactNode;
  prevLabel?: ReactNode;
  nextLabel?: ReactNode;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  summary,
  prevLabel = '←',
  nextLabel = '→',
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page * pageSize < total;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <Button type="button" variant="secondary" size="sm" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
        {prevLabel}
      </Button>
      <span className="text-sm text-slate-500">{summary}</span>
      <Button type="button" variant="secondary" size="sm" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
        {nextLabel}
      </Button>
    </div>
  );
}
