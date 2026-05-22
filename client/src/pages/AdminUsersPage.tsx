import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  useCollegesQuery,
  useCreateUserMutation,
  useDeactivateUserMutation,
  useDepartmentsQuery,
  useUpdateUserMutation,
  useUsersListQuery,
  type UserListItem,
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
import {
  adminCreateUserFormSchema,
  adminEditUserFormSchema,
  type AdminCreateUserFormValues,
  type AdminEditUserFormValues,
} from '../lib/form-schemas.js';
import { buildAcademicYearOptions } from '../lib/academic-options.js';

const ROLES = ['ADMIN', 'STUDENT', 'FACULTY', 'LIBRARIAN', 'AFFAIRS', 'MANAGER'] as const;

function apiErrorToast(err: unknown, fallback: string) {
  if (isAxiosError(err)) {
    const body = err.response?.data as { error?: string } | undefined;
    if (body?.error) {
      toast.error(body.error);
      return;
    }
  }
  toast.error(fallback);
}

export function AdminUsersPage() {
  const { t } = useTranslation('nav');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('true');
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: colleges } = useCollegesQuery();
  const { data: departments } = useDepartmentsQuery();
  const { data, isLoading, isError } = useUsersListQuery({
    page,
    search: search || undefined,
    role: roleFilter || undefined,
    collegeId: collegeFilter || undefined,
    departmentId: deptFilter || undefined,
    active: activeFilter === '' ? undefined : activeFilter === 'true',
  });

  const createMut = useCreateUserMutation();
  const updateMut = useUpdateUserMutation();
  const deactivateMut = useDeactivateUserMutation();
  const academicYears = buildAcademicYearOptions();

  const createForm = useForm<AdminCreateUserFormValues>({
    resolver: zodResolver(adminCreateUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      collegeId: '',
      departmentId: '',
      academicNumber: '',
      currentSemester: 1,
      academicYear: academicYears[1] ?? '2025-2026',
    },
  });

  const editForm = useForm<AdminEditUserFormValues>({
    resolver: zodResolver(adminEditUserFormSchema),
  });

  const createRole = createForm.watch('role');
  const editRole = editForm.watch('role');

  const openEdit = (row: UserListItem) => {
    setShowCreate(false);
    setEditing(row);
    editForm.reset({
      name: row.name,
      email: row.email,
      role: row.role as AdminEditUserFormValues['role'],
      collegeId: row.collegeId ?? '',
      active: row.active as unknown as AdminEditUserFormValues['active'],
      password: '',
      departmentId: row.studentProfile?.department?.id ?? '',
      academicNumber: row.studentProfile?.academicNumber ?? '',
      currentSemester: row.studentProfile?.currentSemester ?? 1,
      academicYear: row.studentProfile?.academicYear ?? '2025-2026',
    });
  };

  const submitCreate = createForm.handleSubmit((vals) => {
    const body: Record<string, unknown> = {
      name: vals.name,
      email: vals.email,
      password: vals.password,
      role: vals.role,
      collegeId: vals.collegeId || null,
    };
    if (vals.role === 'STUDENT') {
      body.studentProfile = {
        departmentId: vals.departmentId,
        academicNumber: vals.academicNumber,
        currentSemester: vals.currentSemester ?? 1,
        academicYear: vals.academicYear || '2025-2026',
      };
    }
    createMut.mutate(body, {
      onSuccess: () => {
        toast.success(t('messages.userCreated'));
        setShowCreate(false);
        createForm.reset();
      },
      onError: (e) => apiErrorToast(e, t('messages.loadError')),
    });
  });

  const submitEdit = editForm.handleSubmit((vals) => {
    if (!editing) return;
    const body: Record<string, unknown> = {
      name: vals.name,
      email: vals.email,
      role: vals.role,
      collegeId: vals.collegeId || null,
      active: vals.active,
    };
    if (vals.password) body.password = vals.password;
    if (vals.role === 'STUDENT' && vals.departmentId) {
      body.studentProfile = {
        departmentId: vals.departmentId,
        academicNumber: vals.academicNumber,
        currentSemester: vals.currentSemester,
        academicYear: vals.academicYear,
      };
    }
    updateMut.mutate(
      { id: editing.id, body },
      {
        onSuccess: () => {
          toast.success(t('messages.userUpdated'));
          setEditing(null);
        },
        onError: (e) => apiErrorToast(e, t('messages.loadError')),
      }
    );
  });

  if (isLoading && !data) return <LoadingState />;
  if (isError || !data) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = data.items;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('headings.adminUsers')} description={t('messages.adminUsersLead')} />

      <Card className="flex flex-wrap items-end gap-3">
        <Field label={t('labels.search')} className="min-w-[12rem] flex-1">
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </Field>
        <Field label={t('labels.role')}>
          <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">{t('labels.allRoles')}</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label={t('profile.college')}>
          <Select value={collegeFilter} onChange={(e) => { setCollegeFilter(e.target.value); setPage(1); }}>
            <option value="">{t('labels.allColleges')}</option>
            {colleges?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label={t('labels.department')}>
          <Select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
            <option value="">{t('labels.allDepartments')}</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </Field>
        <Field label={t('labels.status')}>
          <Select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}>
            <option value="">{t('labels.allStatuses')}</option>
            <option value="true">{t('labels.active')}</option>
            <option value="false">{t('labels.inactive')}</option>
          </Select>
        </Field>
        <Button type="button" onClick={() => { setShowCreate(true); setEditing(null); }}>
          {t('labels.createUser')}
        </Button>
      </Card>

      {showCreate ? (
        <Card>
          <h2 className="m-0 mb-4 text-lg font-semibold">{t('labels.createUser')}</h2>
          <form className="grid max-w-xl gap-3" onSubmit={submitCreate}>
            <Field label={t('labels.fullName')} error={createForm.formState.errors.name?.message}>
              <Input {...createForm.register('name')} />
            </Field>
            <Field label={t('labels.email')} error={createForm.formState.errors.email?.message}>
              <Input type="email" {...createForm.register('email')} />
            </Field>
            <Field label={t('labels.password')} error={createForm.formState.errors.password?.message}>
              <Input type="password" {...createForm.register('password')} />
            </Field>
            <Field label={t('labels.role')} error={createForm.formState.errors.role?.message}>
              <Select {...createForm.register('role')}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
            {(createRole === 'MANAGER' || createRole === 'ADMIN') && (
              <Field label={t('profile.college')} error={createForm.formState.errors.collegeId?.message}>
                <Select {...createForm.register('collegeId')}>
                  <option value="">—</option>
                  {colleges?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            )}
            {createRole === 'STUDENT' && (
              <>
                <Field label={t('labels.department')} error={createForm.formState.errors.departmentId?.message}>
                  <Select {...createForm.register('departmentId')}>
                    <option value="">—</option>
                    {departments?.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label={t('profile.academicNumber')} error={createForm.formState.errors.academicNumber?.message}>
                  <Input {...createForm.register('academicNumber')} />
                </Field>
                <Field label={t('profile.studyLevel')}>
                  <Input type="number" min={1} max={10} {...createForm.register('currentSemester', { valueAsNumber: true })} />
                </Field>
                <Field label={t('labels.academicYear')}>
                  <Select {...createForm.register('academicYear')}>
                    {academicYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </Field>
              </>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={createMut.isPending}>{t('labels.save')}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>{t('labels.cancel')}</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {editing ? (
        <Card>
          <h2 className="m-0 mb-4 text-lg font-semibold">{t('labels.editUser')}</h2>
          <form className="grid max-w-xl gap-3" onSubmit={submitEdit}>
            <Field label={t('labels.fullName')} error={editForm.formState.errors.name?.message}>
              <Input {...editForm.register('name')} />
            </Field>
            <Field label={t('labels.email')} error={editForm.formState.errors.email?.message}>
              <Input type="email" {...editForm.register('email')} />
            </Field>
            <Field label={t('labels.newPassword')}>
              <Input type="password" placeholder={t('labels.passwordOptional')} {...editForm.register('password')} />
            </Field>
            <Field label={t('labels.role')}>
              <Select {...editForm.register('role')}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label={t('profile.college')}>
              <Select {...editForm.register('collegeId')}>
                <option value="">—</option>
                {colleges?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label={t('labels.status')}>
              <select
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/50"
                value={editForm.watch('active') ? 'true' : 'false'}
                onChange={(e) => editForm.setValue('active', e.target.value === 'true')}
              >
                <option value="true">{t('labels.active')}</option>
                <option value="false">{t('labels.inactive')}</option>
              </select>
            </Field>
            {editRole === 'STUDENT' && (
              <>
                <Field label={t('labels.department')}>
                  <Select {...editForm.register('departmentId')}>
                    <option value="">—</option>
                    {departments?.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label={t('profile.academicNumber')}>
                  <Input {...editForm.register('academicNumber')} />
                </Field>
                <Field label={t('profile.studyLevel')}>
                  <Input type="number" min={1} max={10} {...editForm.register('currentSemester', { valueAsNumber: true })} />
                </Field>
                <Field label={t('labels.academicYear')}>
                  <Input {...editForm.register('academicYear')} />
                </Field>
              </>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMut.isPending}>{t('labels.save')}</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>{t('labels.cancel')}</Button>
            </div>
          </form>
        </Card>
      ) : null}

      <DataTable<UserListItem>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'n', header: t('labels.fullName'), render: (r) => r.name },
          { key: 'e', header: t('labels.email'), render: (r) => r.email },
          { key: 'r', header: t('labels.role'), render: (r) => r.role },
          {
            key: 'c',
            header: t('profile.college'),
            render: (r) => r.college?.name ?? r.studentProfile?.department?.name ?? '—',
          },
          {
            key: 'st',
            header: t('labels.status'),
            render: (r) => (r.active ? t('labels.active') : t('labels.inactive')),
          },
          {
            key: 'act',
            header: t('labels.actions'),
            render: (r) => (
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(r)}>
                  {t('labels.edit')}
                </Button>
                {r.active ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={deactivateMut.isPending}
                    onClick={() => {
                      if (!window.confirm(t('messages.confirmDeactivate'))) return;
                      deactivateMut.mutate(r.id, {
                        onSuccess: () => toast.success(t('messages.userDeactivated')),
                        onError: (e) => apiErrorToast(e, t('messages.loadError')),
                      });
                    }}
                  >
                    {t('labels.deactivate')}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        rows={rows}
      />
      <Pagination
        page={page}
        pageSize={data.pageSize}
        total={data.total}
        onPageChange={setPage}
        summary={<>{t('labels.page')} {page}</>}
      />
    </section>
  );
}
