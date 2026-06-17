import { Newspaper } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCollegesQuery, useMeQuery, useNewsListQuery, type NewsListFilters } from '../api/hooks.js';
import { NewsFeedCard } from '../components/news/NewsFeedCard.js';
import { Alert } from '../components/ui/Alert.js';
import type { NewsCardItem } from '../components/ui/NewsCard.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Field } from '../components/ui/Field.js';
import { Select } from '../components/ui/Select.js';
import { NewsCardSkeleton } from '../components/ui/Skeleton.js';
import { NEWS_CATEGORIES, newsCategoryLabel } from '../lib/news-categories.js';
import { useAppSelector } from '../hooks/redux.js';

export function NewsPage() {
  const { t } = useTranslation('nav');
  const authUser = useAppSelector((s) => s.auth.user);
  const { data: me } = useMeQuery(!!authUser);
  const { data: colleges } = useCollegesQuery();

  const studentCollegeId = useMemo(() => {
    const profile = me as {
      studentProfile?: { department?: { college?: { id: string } } };
    } | undefined;
    return profile?.studentProfile?.department?.college?.id ?? '';
  }, [me]);

  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<NewsListFilters['category'] | ''>('');
  const [collegeId, setCollegeId] = useState('');

  useEffect(() => {
    if (studentCollegeId && !collegeId) {
      setCollegeId(studentCollegeId);
    }
  }, [studentCollegeId, collegeId]);

  useEffect(() => {
    setPage(1);
  }, [category, collegeId]);

  const filters: NewsListFilters = {
    collegeId: collegeId || undefined,
    category: category || undefined,
  };

  const { data, isLoading, isError } = useNewsListQuery(page, 9, filters);

  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const items = (data?.items ?? []) as NewsCardItem[];

  return (
    <section>
      <PageHeader
        title={t('headings.publicNews')}
        description={t('messages.newsFeedLead')}
        icon={Newspaper}
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <Field label={t('news.filterCategory')} className="min-w-[10rem]">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as NewsListFilters['category'] | '')}
          >
            <option value="">{t('news.allCategories')}</option>
            {NEWS_CATEGORIES.filter((c) => c !== 'TUITION').map((c) => (
              <option key={c} value={c}>
                {newsCategoryLabel(c, t)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('profile.college')} className="min-w-[12rem] flex-1">
          <Select value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
            <option value="">{t('news.allCollegesAndUniversity')}</option>
            {colleges?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {studentCollegeId && collegeId === studentCollegeId ? (
        <Alert variant="info" className="mb-6">
          {t('news.collegeFilterHint')}
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <Alert variant="info">{t('messages.noNews')}</Alert>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <NewsFeedCard key={item.id} item={item} featured={page === 1 && index === 0} />
              ))}
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
