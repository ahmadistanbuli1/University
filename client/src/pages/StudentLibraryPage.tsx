import { Library } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LibraryBooksExplorer } from '../components/library/LibraryBooksExplorer.js';

export function StudentLibraryPage() {
  const { t } = useTranslation('nav');
  return (
    <LibraryBooksExplorer
      icon={Library}
      title={t('headings.studentLibrary')}
      description={t('messages.studentLibraryLead')}
      enableFavorites
    />
  );
}
