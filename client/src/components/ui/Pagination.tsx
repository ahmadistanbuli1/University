import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  prevLabel,
  nextLabel,
}: PaginationProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const canPrev = page > 1;
  const canNext = page * pageSize < total;

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
        aria-label={typeof prevLabel === 'string' ? prevLabel : undefined}
        className="inline-flex items-center gap-1"
      >
        <PrevIcon className="size-4 shrink-0" aria-hidden />
        {prevLabel ?? null}
      </Button>
      <span className="text-sm text-slate-500">{summary}</span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
        aria-label={typeof nextLabel === 'string' ? nextLabel : undefined}
        className="inline-flex items-center gap-1"
      >
        {nextLabel ?? null}
        <NextIcon className="size-4 shrink-0" aria-hidden />
      </Button>
    </div>
  );
}
