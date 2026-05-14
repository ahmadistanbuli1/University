import { type ReactNode } from 'react';
import { cn } from '../../lib/cn.js';
import { Label } from './Label.js';

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
