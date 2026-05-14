import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Alert } from '../components/ui/Alert.js';
import { useAuditLogsQuery } from '../api/hooks.js';

const AUDIT_PAGE_SIZE = 20;

type Log = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user?: { email?: string; name?: string } | null;
};

export function AdminLogsPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAuditLogsQuery(page);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = data.items as Log[];

  return (
    <section>
      <PageHeader title={t('headings.adminLogs')} />
      <DataTable<Log>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'at', header: t('labels.at'), render: (r) => new Date(r.createdAt).toLocaleString() },
          { key: 'who', header: t('labels.email'), render: (r) => r.user?.email ?? '—' },
          { key: 'a', header: t('labels.action'), render: (r) => r.action },
          { key: 'e', header: t('labels.entity'), render: (r) => r.entity },
        ]}
        rows={rows}
      />
      <Pagination
        page={page}
        pageSize={AUDIT_PAGE_SIZE}
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
