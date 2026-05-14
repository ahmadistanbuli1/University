import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { http } from '../api/http.js';
import { useBooksQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';

const BOOKS_PAGE_SIZE = 10;

type Book = {
  id: string;
  title: string;
  readsCount?: number;
  downloadsCount?: number;
  department?: { name?: string };
};

export function LibraryPage() {
  const { t } = useTranslation('nav');
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useBooksQuery(page);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = data.items as Book[];

  return (
    <section>
      <PageHeader title={t('headings.publicLibrary')} />
      <DataTable<Book>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 't', header: t('labels.title'), render: (r) => r.title },
          { key: 'd', header: t('labels.department'), render: (r) => r.department?.name ?? '—' },
          {
            key: 'r',
            header: t('labels.reads'),
            render: (r) => (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await http.patch(`/api/library/books/${r.id}/read`);
                    void qc.invalidateQueries({ queryKey: ['books'] });
                    toast.success('+1');
                  } catch {
                    toast.error(t('messages.loadError'));
                  }
                }}
              >
                +1 ({r.readsCount ?? 0})
              </Button>
            ),
          },
        ]}
        rows={rows}
      />
      <Pagination
        page={page}
        pageSize={BOOKS_PAGE_SIZE}
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
