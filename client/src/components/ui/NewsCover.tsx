import { ImageIcon } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/mediaUrl.js';
import { cn } from '../../lib/cn.js';

type NewsCoverProps = {
  imageUrl?: string | null;
  alt: string;
  /** Tailwind height class, e.g. h-48 */
  heightClass?: string;
  className?: string;
};

export function NewsCover({
  imageUrl,
  alt,
  heightClass = 'h-48',
  className,
}: NewsCoverProps) {
  const src = imageUrl ? resolveMediaUrl(imageUrl) : '';
  if (!src) return null;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800',
        heightClass,
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

type NewsCoverPlaceholderProps = {
  heightClass?: string;
  className?: string;
};

/** Decorative placeholder when authoring preview has no image yet */
export function NewsCoverPlaceholder({
  heightClass = 'h-32',
  className,
}: NewsCoverPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-brand/5 via-zinc-50 to-brand/10 dark:from-brand/10 dark:via-zinc-900 dark:to-zinc-950',
        heightClass,
        className
      )}
    >
      <ImageIcon className="size-10 text-brand/40 dark:text-brand-light/40" aria-hidden />
    </div>
  );
}
