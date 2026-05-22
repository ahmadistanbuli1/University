import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  useAffairsStudentsQuery,
  useDepartmentsQuery,
  usePatchAffairsStudentMutation,
  type AffairsStudentRow,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { Field } from '../components/ui/Field.js';
import { Input } from '../components/ui/Input.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Select } from '../components/ui/Select.js';
import { buildAcademicYearOptions } from '../lib/academic-options.js';

export function AffairsStudentsPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [editing, setEditing] = useState<AffairsStudentRow | null>(null);
  const [form, setForm] = useState({
    departmentId: '',
    academicNumber: '',
    currentSemester: 1,
    academicYear: '2025-2026',
  });

  const { data: departments } = useDepartmentsQuery();
  const { data, isLoading, isError } = useAffairsStudentsQuery({
    page,
    search: search || undefined,
    departmentId: departmentId || undefined,
  });
  const patch = usePatchAffairsStudentMutation();
  const academicYears = buildAcademicYearOptions();

  const openEdit = (row: AffairsStudentRow) => {
    setEditing(row);
    setForm({
      departmentId: row.department.id,
      academicNumber: row.academicNumber,
      currentSemester: row.currentSemester,
      academicYear: row.academicYear,
    });
  };

  const save = () => {
    if (!editing) return;
    patch.mutate(
      {
        id: editing.id,
        body: {
          departmentId: form.departmentId,
          academicNumber: form.academicNumber,
          currentSemester: form.currentSemester,
          academicYear: form.academicYear,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('messages.studentUpdated'));
          setEditing(null);
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

  if (isLoading && !data) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.affairsStudents')} description={t('messages.affairsStudentsLead')} />

      <Card className="flex flex-wrap gap-3">
        <Field label={t('labels.search')} className="min-w-[12rem] flex-1">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('labels.searchStudentHint')}
          />
        </Field>
        <Field label={t('labels.department')}>
          <Select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t('labels.allDepartments')}</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {editing ? (
        <Card>
          <h2 className="m-0 mb-2 text-lg font-semibold">
            {editing.user.name} · {editing.user.email}
          </h2>
          <div className="grid max-w-md gap-3">
            <Field label={t('labels.department')}>
              <Select
                value={form.departmentId}
                onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
              >
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('profile.academicNumber')}>
              <Input
                value={form.academicNumber}
                onChange={(e) => setForm((f) => ({ ...f, academicNumber: e.target.value }))}
              />
            </Field>
            <Field label={t('profile.studyLevel')}>
              <Input
                type="number"
                min={1}
                max={10}
                value={form.currentSemester}
                onChange={(e) =>
                  setForm((f) => ({ ...f, currentSemester: Number(e.target.value) }))
                }
              />
            </Field>
            <Field label={t('labels.academicYear')}>
              <Select
                value={form.academicYear}
                onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              >
                {academicYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>
            <p className="m-0 text-sm text-zinc-500">
              {t('labels.enrolledCourses')}:{' '}
              {editing.enrollments.map((e) => e.course.code).join(', ') || '—'}
            </p>
            <div className="flex gap-2">
              <Button type="button" disabled={patch.isPending} onClick={save}>
                {t('labels.save')}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                {t('labels.cancel')}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <DataTable<AffairsStudentRow>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'n', header: t('labels.fullName'), render: (r) => r.user.name },
          { key: 'num', header: t('profile.academicNumber'), render: (r) => r.academicNumber },
          { key: 'd', header: t('labels.department'), render: (r) => r.department.name },
          { key: 'y', header: t('labels.academicYear'), render: (r) => r.academicYear },
          { key: 's', header: t('profile.studyLevel'), render: (r) => String(r.currentSemester) },
          {
            key: 'c',
            header: t('labels.enrolledCourses'),
            render: (r) => String(r.enrollments.length),
          },
          {
            key: 'a',
            header: t('labels.actions'),
            render: (r) => (
              <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(r)}>
                {t('labels.edit')}
              </Button>
            ),
          },
        ]}
        rows={data.items}
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
