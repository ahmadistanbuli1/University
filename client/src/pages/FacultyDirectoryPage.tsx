import { useTranslation } from 'react-i18next';
import { useFacultyDirectoryQuery } from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { FeedList, FeedListItem } from '../components/ui/FeedList.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';

type Fc = {
  id: string;
  name: string;
  email: string;
  facultyCourses?: { course?: { name?: string; code?: string }; semester?: string; academicYear?: string }[];
};

export function FacultyDirectoryPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useFacultyDirectoryQuery();

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Fc[];

  return (
    <section>
      <PageHeader title={t('headings.publicFaculty')} />
      <FeedList>
        {rows.map((f) => (
          <FeedListItem
            key={f.id}
            title={
              <>
                {f.name}{' '}
                <span className="text-sm font-medium text-slate-500">{f.email}</span>
              </>
            }
          >
            <ul className="mt-1 list-disc ps-5 text-sm text-slate-500">
              {(f.facultyCourses ?? []).map((fc) => (
                <li key={`${f.id}-${fc.course?.code}-${fc.semester}`}>
                  {fc.course?.name} ({fc.course?.code}) — {fc.semester} {fc.academicYear}
                </li>
              ))}
            </ul>
          </FeedListItem>
        ))}
      </FeedList>
    </section>
  );
}
