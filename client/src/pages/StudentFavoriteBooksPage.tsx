import { Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LibraryBooksExplorer } from '../components/library/LibraryBooksExplorer.js';

export function StudentFavoriteBooksPage() {
  const { t } = useTranslation('nav');
  return (
    <LibraryBooksExplorer
      icon={Bookmark}
      title={t('headings.studentFavoriteBooks')}
      description={t('messages.studentFavoriteBooksLead')}
      enableFavorites
      favoritesOnly
    />
  );
}
