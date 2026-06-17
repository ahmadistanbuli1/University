import { ImagePlus, Trash2 } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveMediaUrl } from '../../lib/mediaUrl.js';
import { cn } from '../../lib/cn.js';
import { Button } from '../ui/Button.js';

export type ExistingGalleryImage = {
  id: string;
  imageUrl: string;
};

type NewsGalleryUploadProps = {
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  existing?: ExistingGalleryImage[];
  removedIds: string[];
  onToggleRemoveExisting: (id: string) => void;
  disabled?: boolean;
};

export function NewsGalleryUpload({
  newFiles,
  onNewFilesChange,
  existing = [],
  removedIds,
  onToggleRemoveExisting,
  disabled,
}: NewsGalleryUploadProps) {
  const { t } = useTranslation('nav');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleExisting = existing.filter((img) => !removedIds.includes(img.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {t('news.galleryImages')}
        </span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden />
          {t('news.addGalleryImages')}
        </Button>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('news.galleryImagesHint')}</p>

      {(visibleExisting.length > 0 || newFiles.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleExisting.map((img) => (
            <div
              key={img.id}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200/90 dark:border-white/10"
            >
              <img
                src={resolveMediaUrl(img.imageUrl)}
                alt=""
                className="size-full object-cover"
              />
              <Button
                type="button"
                size="sm"
                variant="danger"
                className="absolute end-2 top-2"
                disabled={disabled}
                onClick={() => onToggleRemoveExisting(img.id)}
                aria-label={t('news.removeImage')}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {newFiles.map((file, index) => {
            const preview = URL.createObjectURL(file);
            return (
              <div
                key={`${file.name}-${index}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brand/30"
              >
                <img src={preview} alt="" className="size-full object-cover" />
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  className="absolute end-2 top-2"
                  disabled={disabled}
                  onClick={() => {
                    onNewFilesChange(newFiles.filter((_, i) => i !== index));
                  }}
                  aria-label={t('news.removeImage')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {!visibleExisting.length && !newFiles.length ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200/90 px-4 py-6 transition',
            'hover:border-brand/35 hover:bg-brand/5 dark:border-white/10 dark:hover:border-brand-light/35',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          <ImagePlus className="size-8 text-zinc-400" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{t('news.galleryEmpty')}</span>
        </button>
      ) : null}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          if (picked.length) onNewFilesChange([...newFiles, ...picked]);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
    </div>
  );
}
