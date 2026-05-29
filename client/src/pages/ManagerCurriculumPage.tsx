import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCurriculumQuery,
  useDepartmentsQuery,
  useMeQuery,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { Field } from '../components/ui/Field.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { getStudyYearLabel } from '../lib/department-labels.js';
import type { CurriculumCourseRow } from '../api/hooks.js';

export function ManagerCurriculumPage() {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;
  const { data: me } = useMeQuery();
  const collegeId = typeof me?.collegeId === 'string' ? me.collegeId : '';
  const [departmentId, setDepartmentId] = useState('');
  const [studyYear, setStudyYear] = useState('');

  const { data: departments } = useDepartmentsQuery(collegeId || undefined);
  const { data, isLoading, isError } = useCurriculumQuery({
    departmentId: departmentId || undefined,
    studyYear: studyYear ? Number(studyYear) : undefined,
    enabled: !!departmentId,
  });

  const termLabel = (term: 'FIRST' | 'SECOND') =>
    term === 'FIRST' ? t('studyPlan.termFirst') : t('studyPlan.termSecond');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.managerCurriculum')}
        description={t('messages.managerCurriculumLead')}
      />

      <Card className="flex flex-wrap gap-3">
        <Field label={t('labels.department')}>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">{t('labels.allDepartments')}</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('admin.studyYear')}>
          <Select value={studyYear} onChange={(e) => setStudyYear(e.target.value)}>
            <option value="">{t('labels.allYears')}</option>
            {[1, 2, 3, 4, 5, 6].map((y) => (
              <option key={y} value={String(y)}>
                {getStudyYearLabel(y, lang)}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {!departmentId ? (
        <Alert variant="info">{t('messages.selectDepartmentFirst')}</Alert>
      ) : isLoading ? (
        <LoadingState />
      ) : isError ? (
        <Alert variant="error">{t('messages.loadError')}</Alert>
      ) : !data?.grouped.length ? (
        <Alert variant="info">{t('messages.noCurriculumCourses')}</Alert>
      ) : (
        data.grouped.map((yearBlock) => (
          <div key={yearBlock.studyYear} className="flex flex-col gap-4">
            <h2 className="m-0 text-lg font-semibold text-brand-dark dark:text-brand-light">
              {getStudyYearLabel(yearBlock.studyYear, lang)}
            </h2>
            {yearBlock.terms.map((termBlock) => (
              <Card key={`${yearBlock.studyYear}-${termBlock.term}`}>
                <h3 className="m-0 mb-3 text-base font-semibold">{termLabel(termBlock.term)}</h3>
                <DataTable<CurriculumCourseRow>
                  rowKey={(r) => r.id}
                  emptyMessage="—"
                  columns={[
                    { key: 'code', header: t('labels.courseCode'), render: (r) => r.code },
                    { key: 'name', header: t('studyPlan.courseName'), render: (r) => r.name },
                  ]}
                  rows={termBlock.courses}
                />
              </Card>
            ))}
          </div>
        ))
      )}
    </section>
  );
}
