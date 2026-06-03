import { ImagePlus, Trash2 } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button.js';
import { NewsCover } from './NewsCover.js';
import { cn } from '../../lib/cn.js';

type NewsImageUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  previewUrl?: string | null;
  /** When set, hides the existing server image until a new file is chosen */
  previewCleared?: boolean;
  onClearPreview?: () => void;
  disabled?: boolean;
};

export function NewsImageUpload({
  file,
  onFileChange,
  previewUrl,
  previewCleared,
  onClearPreview,
  disabled,
}: NewsImageUploadProps) {
  const { t } = useTranslation('nav');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const objectPreview = file ? URL.createObjectURL(file) : null;
  const displaySrc = objectPreview ?? (previewCleared ? null : previewUrl ?? null);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {t('news.coverImage')}
      </span>
      {displaySrc ? (
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-white/10">
          <NewsCover imageUrl={displaySrc} alt={t('news.coverPreviewAlt')} heightClass="h-44" />
          <div className="absolute end-2 top-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              {t('news.changeImage')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={disabled}
              onClick={() => {
                if (file) {
                  onFileChange(null);
                  if (inputRef.current) inputRef.current.value = '';
                } else if (previewUrl && !previewCleared) {
                  onClearPreview?.();
                } else {
                  onFileChange(null);
                  if (inputRef.current) inputRef.current.value = '';
                }
              }}
              aria-label={t('news.removeImage')}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'group flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-brand/25 bg-brand/5 px-4 py-8 transition',
            'hover:border-brand/45 hover:bg-brand/10 dark:border-brand/30 dark:bg-brand/10 dark:hover:border-brand-light/40',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-white shadow-md ring-1 ring-brand/15 transition group-hover:scale-105 dark:bg-zinc-900 dark:ring-brand/25">
            <ImagePlus className="size-7 text-brand dark:text-brand-light" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-brand-dark dark:text-brand-light">
            {t('news.addCoverImage')}
          </span>
          <span className="max-w-xs text-center text-xs text-zinc-500 dark:text-zinc-400">
            {t('news.coverImageHint')}
          </span>
        </button>
      )}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null;
          onFileChange(next);
        }}
      />
    </div>
  );
}
