import { useMemo, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { axiosInstance } from '../api/http.js';
import {
  useDepartmentsQuery,
  useExamOfficerStudentsQuery,
  type AffairsStudentRow,
} from '../api/hooks.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { DataTable } from '../components/ui/DataTable.js';
import { Field } from '../components/ui/Field.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Select } from '../components/ui/Select.js';
import { excelExportButtonClass, exportStudentsToExcel } from '../lib/excel-export.js';
import {
  buildStudyYearOptions,
  getDepartmentLabel,
  getMaxStudyYears,
  getStudyYearLabel,
  studyYearFromSemester,
} from '../lib/department-labels.js';

export function ExamOfficerStudentsPage() {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;
  const [page, setPage] = useState(1);
  const [departmentId, setDepartmentId] = useState('');
  const [studyYear, setStudyYear] = useState<number | ''>('');
  const [exporting, setExporting] = useState(false);

  const { data: departments } = useDepartmentsQuery();
  const selectedDept = departments?.find((d) => d.id === departmentId);
  const maxYears = getMaxStudyYears(selectedDept?.code);
  const yearOptions = useMemo(() => buildStudyYearOptions(maxYears), [maxYears]);

  const filtersReady = Boolean(departmentId && studyYear);
  const { data, isLoading, isFetching, isError } = useExamOfficerStudentsQuery({
    page,
    departmentId: departmentId || undefined,
    studyYear: studyYear || undefined,
    enabled: filtersReady,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 50;

  const handleExport = async () => {
    if (!filtersReady || !selectedDept || !studyYear) {
      toast.error(t('excel.selectFiltersFirst'));
      return;
    }
    setExporting(true);
    try {
      const { data: exportData } = await axiosInstance.get<{
        items: AffairsStudentRow[];
        total: number;
      }>('/api/student-services/students', {
        params: {
          page: 1,
          pageSize: 500,
          departmentId,
          studyYear,
        },
      });
      if (!exportData.items.length) {
        toast.error(t('excel.noStudentsToExport'));
        return;
      }
      const deptLabel = getDepartmentLabel(selectedDept, lang);
      const yearLabel = getStudyYearLabel(studyYear, lang);
      await exportStudentsToExcel(exportData.items, {
        lang,
        departmentName: deptLabel,
        studyYearLabel: String(studyYear),
        generatedLabel: new Date().toLocaleString(lang),
        sheetTitle: t('excel.studentsSheetTitle'),
        subtitle: `${deptLabel} — ${yearLabel} · ${t('excel.generatedAt', {
          date: new Date().toLocaleString(lang),
        })} · ${t('excel.studentCount', { count: exportData.items.length })}`,
        headers: {
          index: '#',
          academicNumber: t('profile.academicNumber'),
          fullName: t('labels.fullName'),
          email: t('labels.email'),
          semester: t('labels.semester'),
          studyYear: t('labels.studyYear'),
          academicYear: t('labels.academicYear'),
          status: t('labels.status'),
        },
        activeLabel: t('labels.active'),
        inactiveLabel: t('labels.inactive'),
      });
      toast.success(t('excel.exportSuccess'));
    } catch {
      toast.error(t('messages.loadError'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('headings.examOfficerStudents')}
        description={t('examOfficer.studentsLead')}
      />

      <Card className="flex flex-wrap items-end gap-3">
        <Field label={t('labels.department')} className="min-w-[14rem] flex-1">
          <Select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setStudyYear('');
              setPage(1);
            }}
          >
            <option value="">{t('excel.selectDepartment')}</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {getDepartmentLabel(d, lang)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('labels.studyYear')} className="min-w-[10rem]">
          <Select
            value={studyYear === '' ? '' : String(studyYear)}
            disabled={!departmentId}
            onChange={(e) => {
              setStudyYear(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
          >
            <option value="">{t('excel.selectStudyYear')}</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {getStudyYearLabel(y, lang)}
              </option>
            ))}
          </Select>
        </Field>
        <Button
          type="button"
          disabled={!filtersReady || exporting}
          onClick={() => void handleExport()}
          className={`inline-flex items-center gap-2 ${excelExportButtonClass}`}
        >
          <FileSpreadsheet className="h-4 w-4" aria-hidden />
          {exporting ? t('excel.exporting') : t('excel.exportStudents')}
        </Button>
      </Card>

      {!filtersReady ? (
        <Alert variant="info">{t('examOfficer.studentsSelectHint')}</Alert>
      ) : isLoading && !data ? (
        <LoadingState />
      ) : isError ? (
        <Alert variant="error">{t('messages.loadError')}</Alert>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
              {t('excel.studentCount', { count: total })}
              {isFetching ? ` · ${t('notifications.loading')}` : ''}
            </p>
          </div>
          {rows.length === 0 ? (
            <Alert variant="info">{t('examOfficer.studentsEmpty')}</Alert>
          ) : (
            <DataTable<AffairsStudentRow>
              rowKey={(r) => r.id}
              emptyMessage="—"
              columns={[
                {
                  key: 'num',
                  header: '#',
                  render: (r) => (page - 1) * pageSize + rows.indexOf(r) + 1,
                },
                {
                  key: 'academicNumber',
                  header: t('profile.academicNumber'),
                  render: (r) => (
                    <span className="font-mono text-xs">{r.academicNumber}</span>
                  ),
                },
                {
                  key: 'name',
                  header: t('labels.fullName'),
                  render: (r) => r.user.name,
                },
                {
                  key: 'email',
                  header: t('labels.email'),
                  render: (r) => r.user.email,
                },
                {
                  key: 'sem',
                  header: t('labels.semester'),
                  render: (r) => {
                    const term = r.currentSemester % 2 === 0 ? 2 : 1;
                    return `${t('labels.semester')} ${term}`;
                  },
                },
                {
                  key: 'year',
                  header: t('labels.studyYear'),
                  render: (r) => getStudyYearLabel(studyYearFromSemester(r.currentSemester), lang),
                },
              ]}
              rows={rows}
            />
          )}
          {total > pageSize ? (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              summary={
                <>
                  {t('labels.page')} {page} · {t('excel.studentCount', { count: total })}
                </>
              }
            />
          ) : null}
        </>
      )}
    </section>
  );
}
