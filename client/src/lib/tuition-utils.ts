import type { TFunction } from 'i18next';

export type TuitionInstallmentRow = {
  id: string;
  label: string;
  semesterKey?: string;
  academicYear: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
  status: string;
};

export function isInstallmentFullyPaid(inst: Pick<TuitionInstallmentRow, 'status' | 'remaining'>) {
  return inst.status === 'PAID' || inst.remaining <= 0.01;
}

export function canPayInstallment(
  installments: TuitionInstallmentRow[],
  inst: TuitionInstallmentRow
) {
  if (inst.remaining <= 0.01) return false;
  if (inst.semesterKey === 'semester-2') {
    const first = installments.find((i) => i.semesterKey === 'semester-1');
    if (first && !isInstallmentFullyPaid(first)) return false;
  }
  return true;
}

export function installmentDisplayLabel(
  inst: Pick<TuitionInstallmentRow, 'semesterKey' | 'label'>,
  t: TFunction
) {
  if (inst.semesterKey === 'semester-1') return t('tuition.semesterFirstTitle');
  if (inst.semesterKey === 'semester-2') return t('tuition.semesterSecondTitle');
  return inst.label;
}

export function sortInstallments(installments: TuitionInstallmentRow[]) {
  return [...installments].sort((a, b) => {
    const order = (key?: string) => (key === 'semester-2' ? 2 : 1);
    return order(a.semesterKey) - order(b.semesterKey);
  });
}

export type TuitionNewsItem = {
  category?: string;
  enablePayNow?: boolean;
  tuitionSemesterKey?: string | null;
  title?: string;
  content?: string;
};

/** Admin published a TUITION notice that opens second-semester payment. */
export function isSecondSemesterPaymentOpen(news: TuitionNewsItem[]) {
  return news.some((n) => {
    if (n.category !== 'TUITION' || !n.enablePayNow) return false;
    if (n.tuitionSemesterKey === 'semester-2') return true;
    const text = `${n.title ?? ''} ${n.content ?? ''}`;
    return /second|الثاني|semester\s*2|فصل\s*2|الفصل الدراسي الثاني/i.test(text);
  });
}
