import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsListQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { FeedList, FeedListItem } from '../components/ui/FeedList.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: { name?: string };
};

export function AdminNewsPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNewsListQuery(page);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const items = data.items as NewsItem[];

  return (
    <section>
      <PageHeader title={t('headings.adminNews')} />
      <FeedList>
        {items.map((n) => (
          <FeedListItem
            key={n.id}
            title={n.title}
            meta={
              <>
                {new Date(n.createdAt).toLocaleString()} — {n.author?.name ?? ''}
              </>
            }
          >
            {n.content.slice(0, 400)}
            {n.content.length > 400 ? '…' : ''}
          </FeedListItem>
        ))}
      </FeedList>
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
