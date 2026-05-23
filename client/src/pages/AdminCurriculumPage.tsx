import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  useCollegesQuery,
  useCurriculumQuery,
  useDeleteCurriculumMutation,
  useDepartmentsQuery,
  useUpdateCurriculumMutation,
  type CurriculumCourseRow,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Select } from '../components/ui/Select.js';
import { getStudyYearLabel } from '../lib/department-labels.js';

export function AdminCurriculumPage() {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [studyYear, setStudyYear] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: colleges } = useCollegesQuery();
  const { data: departments } = useDepartmentsQuery(collegeId || undefined);
  const { data, isLoading, isError } = useCurriculumQuery({
    departmentId: departmentId || undefined,
    studyYear: studyYear ? Number(studyYear) : undefined,
    enabled: !!departmentId,
  });
  const update = useUpdateCurriculumMutation();
  const remove = useDeleteCurriculumMutation();

  const startEdit = (row: CurriculumCourseRow) => {
    setEditingId(row.id);
    setEditName(row.name);
  };

  const saveEdit = (id: string) => {
    const name = editName.trim();
    if (name.length < 2) return;
    update.mutate(
      { id, name },
      {
        onSuccess: () => {
          toast.success(t('messages.curriculumUpdated'));
          setEditingId(null);
        },
        onError: (err) => {
          const msg = isAxiosError(err)
            ? (err.response?.data as { error?: string })?.error
            : undefined;
          toast.error(msg ?? t('messages.loadError'));
        },
      }
    );
  };

  const confirmDelete = (row: CurriculumCourseRow) => {
    if (!window.confirm(t('messages.confirmDeleteCurriculum', { name: row.name }))) return;
    remove.mutate(row.id, {
      onSuccess: () => toast.success(t('messages.curriculumDeleted')),
      onError: (err) => {
        const msg = isAxiosError(err)
          ? (err.response?.data as { error?: string })?.error
          : undefined;
        toast.error(msg ?? t('messages.loadError'));
      },
    });
  };

  const termLabel = (term: 'FIRST' | 'SECOND') =>
    term === 'FIRST' ? t('studyPlan.termFirst') : t('studyPlan.termSecond');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.adminCurriculum')}
        description={t('messages.adminCurriculumLead')}
      />

      <Card className="flex flex-wrap gap-3">
        <Field label={t('profile.college')}>
          <Select
            value={collegeId}
            onChange={(e) => {
              setCollegeId(e.target.value);
              setDepartmentId('');
            }}
          >
            <option value="">{t('admin.selectCollege')}</option>
            {colleges?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('labels.department')}>
          <Select
            value={departmentId}
            disabled={!collegeId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
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
        <Alert variant="info">{t('admin.selectCollegeFirst')}</Alert>
      ) : isLoading ? (
        <LoadingState />
      ) : isError ? (
        <Alert variant="error">{t('messages.loadError')}</Alert>
      ) : !data?.grouped.length ? (
        <Alert variant="info">{t('messages.noCurriculumCourses')}</Alert>
      ) : (
        data.grouped.map((yearBlock) => (
          <div key={yearBlock.studyYear} className="flex flex-col gap-4">
            <h2 className="m-0 text-lg font-semibold text-violet-800 dark:text-violet-200">
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
                    {
                      key: 'name',
                      header: t('studyPlan.courseName'),
                      render: (r) =>
                        editingId === r.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="max-w-xs"
                          />
                        ) : (
                          r.name
                        ),
                    },
                    {
                      key: 'actions',
                      header: t('labels.actions'),
                      render: (r) =>
                        editingId === r.id ? (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={update.isPending}
                              onClick={() => saveEdit(r.id)}
                            >
                              {t('labels.save')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              {t('labels.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => startEdit(r)}
                            >
                              {t('labels.edit')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={remove.isPending}
                              onClick={() => confirmDelete(r)}
                            >
                              {t('librarian.deleteBook')}
                            </Button>
                          </div>
                        ),
                    },
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
