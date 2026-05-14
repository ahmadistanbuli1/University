import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAppealsListQuery, usePatchAppealMutation } from '../api/hooks.js';
import { ActionRow, ActionStack } from '../components/ui/ActionGroup.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';
import { DataTable } from '../components/ui/DataTable.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PageHeader } from '../components/ui/PageHeader.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { Textarea } from '../components/ui/Textarea.js';

type Appeal = {
  id: string;
  reason: string;
  status: string;
  student?: { user?: { name?: string; email?: string } };
};

function AppealActions({ row, t }: { row: Appeal; t: (k: string) => string }) {
  const patch = usePatchAppealMutation();
  const [note, setNote] = useState('');

  function submit(status: 'APPROVED' | 'REJECTED') {
    patch.mutate(
      { id: row.id, status, adminResponse: note },
      {
        onSuccess: () => {
          toast.success(t('messages.appealUpdated'));
        },
        onError: () => {
          toast.error(t('messages.loadError'));
        },
      }
    );
  }

  return (
    <ActionStack>
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={t('labels.adminNote')} />
      <ActionRow>
        <Button type="button" variant="primary" size="sm" disabled={patch.isPending} onClick={() => submit('APPROVED')}>
          {t('labels.approve')}
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={patch.isPending} onClick={() => submit('REJECTED')}>
          {t('labels.reject')}
        </Button>
      </ActionRow>
    </ActionStack>
  );
}

export function AdminAppealsPage() {
  const { t } = useTranslation('nav');
  const { data, isLoading, isError } = useAppealsListQuery();

  if (isLoading) return <LoadingState />;
  if (isError) return <Alert variant="error">{t('messages.loadError')}</Alert>;

  const rows = (data ?? []) as Appeal[];

  return (
    <section>
      <PageHeader title={t('headings.adminAppeals')} />
      <DataTable<Appeal>
        rowKey={(r) => r.id}
        emptyMessage="—"
        columns={[
          { key: 'st', header: t('labels.status'), render: (r) => <StatusBadge status={r.status} /> },
          { key: 'who', header: t('labels.fullName'), render: (r) => r.student?.user?.name ?? '—' },
          { key: 'reason', header: t('labels.reason'), render: (r) => r.reason },
          {
            key: 'act',
            header: t('labels.action'),
            render: (r) => <AppealActions row={r} t={t} />,
          },
        ]}
        rows={rows}
      />
    </section>
  );
}
