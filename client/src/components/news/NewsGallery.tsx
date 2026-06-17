import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/mediaUrl.js';
import { cn } from '../../lib/cn.js';

type NewsLightboxProps = {
  images: string[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function NewsLightbox({ images, index, onClose, onChange }: NewsLightboxProps) {
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onChange(index - 1);
  }, [hasPrev, index, onChange]);

  const goNext = useCallback(() => {
    if (hasNext) onChange(index + 1);
  }, [hasNext, index, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, goPrev, goNext]);

  if (!images.length) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/92 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="size-6" />
      </button>

      {hasPrev ? (
        <button
          type="button"
          className="absolute start-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:start-4"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous image"
        >
          <ChevronLeft className="size-6" />
        </button>
      ) : null}

      {hasNext ? (
        <button
          type="button"
          className="absolute end-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:end-4"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next image"
        >
          <ChevronRight className="size-6" />
        </button>
      ) : null}

      <figure
        className="flex max-h-[88vh] max-w-5xl flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index]}
          alt=""
          className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />
        <figcaption className="text-sm font-medium text-white/80">
          {index + 1} / {images.length}
        </figcaption>
      </figure>
    </div>,
    document.body
  );
}

export type NewsGalleryImage = {
  id: string;
  imageUrl: string;
};

type NewsGalleryProps = {
  images: NewsGalleryImage[];
  className?: string;
};

export function NewsGallery({ images, className }: NewsGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const urls = images.map((img) => resolveMediaUrl(img.imageUrl));

  if (!images.length) return null;

  return (
    <>
      <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4', className)}>
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900"
            onClick={() => setLightboxIndex(i)}
          >
            <img
              src={resolveMediaUrl(img.imageUrl)}
              alt=""
              className="size-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-zinc-950/0 transition group-hover:bg-zinc-950/10" />
          </button>
        ))}
      </div>
      {lightboxIndex != null ? (
        <NewsLightbox
          images={urls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
