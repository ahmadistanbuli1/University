import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StructureCourse } from '../../api/hooks.js';
import { parseCourseStudyMeta } from '../../lib/course-code.js';
import { buildStudyYearOptions, getCollegeLabel, getMaxStudyYears } from '../../lib/department-labels.js';
import { Button } from '../ui/Button.js';
import { Field } from '../ui/Field.js';
import { Select } from '../ui/Select.js';
import { cn } from '../../lib/cn.js';

type College = { id: string; name: string };
type Department = { id: string; name: string; code: string; collegeId: string };

type FacultyCourseAssignmentPickerProps = {
  colleges: College[] | undefined;
  departments: Department[] | undefined;
  courses: StructureCourse[] | undefined;
  value: string[];
  onChange: (courseIds: string[]) => void;
};

export function FacultyCourseAssignmentPicker({
  colleges,
  departments,
  courses,
  value,
  onChange,
}: FacultyCourseAssignmentPickerProps) {
  const { t, i18n } = useTranslation('nav');
  const lang = i18n.language;

  const [collegeId, setCollegeId] = useState('');
  const [studyYear, setStudyYear] = useState(1);
  const [term, setTerm] = useState<'FIRST' | 'SECOND'>('FIRST');
  const [courseToAdd, setCourseToAdd] = useState('');

  const collegeDepartments = useMemo(
    () => (departments ?? []).filter((d) => d.collegeId === collegeId),
    [departments, collegeId]
  );

  const maxYears = useMemo(() => {
    const codes = collegeDepartments.map((d) => d.code);
    if (codes.length === 0) return 4;
    return Math.max(...codes.map((c) => getMaxStudyYears(c)));
  }, [collegeDepartments]);

  const yearOptions = useMemo(() => buildStudyYearOptions(maxYears), [maxYears]);

  const availableCourses = useMemo(() => {
    if (!collegeId || !courses?.length) return [];
    const deptIds = new Set(collegeDepartments.map((d) => d.id));
    return courses.filter((c) => {
      if (!c.department?.id || !deptIds.has(c.department.id)) return false;
      const meta = parseCourseStudyMeta(c.code);
      if (!meta) return false;
      return meta.studyYear === studyYear && meta.term === term;
    });
  }, [collegeId, collegeDepartments, courses, studyYear, term]);

  const selectedCourses = useMemo(() => {
    const byId = new Map((courses ?? []).map((c) => [c.id, c]));
    return value.map((id) => byId.get(id)).filter((c): c is StructureCourse => Boolean(c));
  }, [value, courses]);

  const addCourse = () => {
    if (!courseToAdd || value.includes(courseToAdd)) return;
    onChange([...value, courseToAdd]);
    setCourseToAdd('');
  };

  const removeCourse = (id: string) => {
    onChange(value.filter((x) => x !== id));
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand/20 bg-brand/5/40 p-4 dark:border-brand/20 dark:bg-brand/10">
      <p className="m-0 text-sm font-medium text-brand-dark dark:text-brand-light">
        {t('admin.facultyCoursesTitle')}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t('profile.college')}>
          <Select
            value={collegeId}
            onChange={(e) => {
              setCollegeId(e.target.value);
              setCourseToAdd('');
              setStudyYear(1);
            }}
          >
            <option value="">{t('admin.selectCollege')}</option>
            {(colleges ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {getCollegeLabel(c.name, lang)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t('admin.studyYear')}>
          <Select
            value={String(studyYear)}
            onChange={(e) => {
              setStudyYear(Number(e.target.value));
              setCourseToAdd('');
            }}
            disabled={!collegeId}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {t('profile.studyLevelValue', { level: y })}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t('admin.studyTerm')}>
          <Select
            value={term}
            onChange={(e) => {
              setTerm(e.target.value as 'FIRST' | 'SECOND');
              setCourseToAdd('');
            }}
            disabled={!collegeId}
          >
            <option value="FIRST">{t('studyPlan.termFirst')}</option>
            <option value="SECOND">{t('studyPlan.termSecond')}</option>
          </Select>
        </Field>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Field label={t('labels.courseName')} className="min-w-0 flex-1">
          <Select
            value={courseToAdd}
            onChange={(e) => setCourseToAdd(e.target.value)}
            disabled={!collegeId || availableCourses.length === 0}
          >
            <option value="">
              {!collegeId
                ? t('admin.selectCollegeFirst')
                : availableCourses.length === 0
                  ? t('admin.noCoursesInSlot')
                  : t('labels.selectCourse')}
            </option>
            {availableCourses.map((c) => (
              <option key={c.id} value={c.id} disabled={value.includes(c.id)}>
                {c.name} ({c.code})
              </option>
            ))}
          </Select>
        </Field>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 gap-1.5"
          disabled={!courseToAdd}
          onClick={addCourse}
        >
          <Plus className="size-4" aria-hidden />
          {t('admin.addCourse')}
        </Button>
      </div>

      {selectedCourses.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('admin.selectedCourses', { count: selectedCourses.length })}
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {selectedCourses.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => removeCourse(c.id)}
                  className={cn(
                    'group flex max-w-full items-start gap-2 rounded-xl border border-brand/30 bg-white px-3 py-2 text-start shadow-sm',
                    'transition-colors hover:border-red-300 hover:bg-red-50 dark:border-brand/30 dark:bg-zinc-900/80',
                    'dark:hover:border-red-500/40 dark:hover:bg-red-950/30'
                  )}
                  title={t('admin.removeCourse')}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {c.name}
                    </span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">{c.code}</span>
                  </span>
                  <X
                    className="mt-0.5 size-4 shrink-0 text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">{t('admin.noCoursesSelected')}</p>
      )}
    </div>
  );
}
