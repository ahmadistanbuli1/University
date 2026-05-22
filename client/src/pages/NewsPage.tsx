import { Newspaper } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsListQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import type { NewsCardItem } from '../components/ui/NewsCard.js';
import { NewsTimeline } from '../components/ui/NewsTimeline.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { NewsCardSkeleton } from '../components/ui/Skeleton.js';

export function NewsPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNewsListQuery(page);

  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const items = (data?.items ?? []) as NewsCardItem[];

  return (
    <section>
      <PageHeader
        title={t('headings.publicNews')}
        description={t('messages.newsTimelineLead')}
        icon={Newspaper}
      />
      {isLoading ? (
        <div className="max-w-3xl space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <Alert variant="info">{t('messages.noNews')}</Alert>
          ) : (
            <div className="mx-auto max-w-3xl">
              <NewsTimeline items={items} />
            </div>
          )}
          {data ? (
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
          ) : null}
        </>
      )}
    </section>
  );
}
