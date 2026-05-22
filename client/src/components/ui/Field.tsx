import { type ReactNode } from 'react';
import { cn } from '../../lib/cn.js';
import { Label } from './Label.js';

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
  error?: string;
};

export function Field({ label, children, className, error }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
