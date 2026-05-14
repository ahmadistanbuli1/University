import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Alert } from '../components/ui/Alert.js';
import { useUsersListQuery } from '../api/hooks.js';

type U = { id: string; name: string; email: string; role: string };

export function AdminUsersPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useUsersListQuery(page);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = data.items as U[];

  return (
    <section>
      <PageHeader title={t('headings.adminUsers')} />
      <DataTable<U>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'n', header: t('labels.fullName'), render: (r) => r.name },
          { key: 'e', header: t('labels.email'), render: (r) => r.email },
          { key: 'r', header: t('labels.role'), render: (r) => r.role },
        ]}
        rows={rows}
      />
      <Pagination
        page={page}
        pageSize={data.pageSize}
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
