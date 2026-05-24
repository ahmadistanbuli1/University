import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyActivityLogQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';

const PAGE_SIZE = 20;

type LogRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
};

function formatDetails(details: Record<string, unknown> | null | undefined): string {
  if (!details || typeof details !== 'object') return '—';
  const parts: string[] = [];
  if (details.departmentCode) parts.push(String(details.departmentCode));
  if (details.studyYear != null) parts.push(`Y${String(details.studyYear)}`);
  if (details.term) parts.push(String(details.term));
  if (details.studentName) parts.push(String(details.studentName));
  if (details.academicNumber) parts.push(String(details.academicNumber));
  if (details.reason) parts.push(String(details.reason));
  if (details.note) parts.push(String(details.note));
  if (details.courseCount != null) parts.push(`${details.courseCount} courses`);
  return parts.length > 0 ? parts.join(' · ') : JSON.stringify(details);
}

export function ActivityLogPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMyActivityLogQuery(page);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = data.items as LogRow[];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.activityLog')}
        description={t('activityLog.lead')}
      />
      <DataTable<LogRow>
        rowKey={(r) => r.id}
        emptyMessage={t('activityLog.empty')}
        columns={[
          {
            key: 'at',
            header: t('labels.at'),
            render: (r) => new Date(r.createdAt).toLocaleString(),
          },
          {
            key: 'a',
            header: t('labels.action'),
            render: (r) => t(`activityLog.actions.${r.action}`, { defaultValue: r.action }),
          },
          {
            key: 'e',
            header: t('labels.entity'),
            render: (r) => r.entity,
          },
          {
            key: 'd',
            header: t('labels.details'),
            render: (r) => (
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {formatDetails(r.details as Record<string, unknown> | null)}
              </span>
            ),
          },
        ]}
        rows={rows}
      />
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={data.total}
        onPageChange={setPage}
        summary={
          <>
            {t('labels.page')} {page}
          </>
        }
      />
    </section>
  );
}
