import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn.js';

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  children?: ReactNode;
};

type ParsedOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type ParsedGroup = {
  label: string;
  options: ParsedOption[];
};

function parseOptionElement(el: ReactElement): ParsedOption {
  const props = el.props as { value?: string | number; disabled?: boolean; children?: ReactNode };
  return {
    value: props.value != null ? String(props.value) : '',
    label: props.children,
    disabled: props.disabled,
  };
}

function parseSelectChildren(children: ReactNode): { flat: ParsedOption[]; groups: ParsedGroup[] } {
  const flat: ParsedOption[] = [];
  const groups: ParsedGroup[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === 'option') {
      flat.push(parseOptionElement(child));
      return;
    }
    if (child.type === 'optgroup') {
      const props = child.props as { label?: string; children?: ReactNode };
      const options: ParsedOption[] = [];
      Children.forEach(props.children, (inner) => {
        if (isValidElement(inner) && inner.type === 'option') {
          options.push(parseOptionElement(inner));
        }
      });
      groups.push({ label: props.label ?? '', options });
    }
  });

  return { flat, groups };
}

function allOptions(flat: ParsedOption[], groups: ParsedGroup[]): ParsedOption[] {
  return [...flat, ...groups.flatMap((g) => g.options)];
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

const triggerClassName =
  'flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-100 dark:focus:border-brand-light dark:focus:ring-brand-light/25';

const menuItemsClassName =
  'z-[100] max-h-60 overflow-auto rounded-xl border border-zinc-200/90 bg-white py-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] dark:border-white/10 dark:bg-zinc-900 dark:ring-white/10';

const itemClassName =
  'block w-full px-3 py-2 text-start text-sm text-zinc-900 transition data-disabled:cursor-not-allowed data-disabled:opacity-40 data-focus:bg-brand/10 data-focus:text-brand-dark dark:text-zinc-100 dark:data-focus:bg-brand/20 dark:data-focus:text-brand-light';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    children,
    value,
    defaultValue,
    onChange,
    onBlur,
    disabled,
    name,
    id,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref
) {
  const nativeRef = useRef<HTMLSelectElement>(null);
  const { flat, groups } = useMemo(() => parseSelectChildren(children), [children]);
  const options = useMemo(() => allOptions(flat, groups), [flat, groups]);

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    () => String(defaultValue ?? flat[0]?.value ?? groups[0]?.options[0]?.value ?? '')
  );

  const currentValue = String(isControlled ? (value ?? '') : uncontrolledValue);

  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setUncontrolledValue(String(defaultValue));
    }
  }, [defaultValue, isControlled]);

  const selectedLabel = useMemo(() => {
    const hit = options.find((o) => o.value === currentValue);
    if (hit) return hit.label;
    if (currentValue === '') {
      const empty = options.find((o) => o.value === '');
      if (empty) return empty.label;
    }
    return currentValue || '—';
  }, [options, currentValue]);

  const commitValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);

      const el = nativeRef.current;
      if (el) {
        el.value = next;
        const event = new Event('change', { bubbles: true });
        el.dispatchEvent(event);
      }

      // Native change event triggers the select's onChange (register / controlled handlers).
      if (onBlur && el) {
        const blur = {
          target: el,
          currentTarget: el,
        } as React.FocusEvent<HTMLSelectElement>;
        onBlur(blur);
      }
    },
    [isControlled, onBlur]
  );

  const renderOption = (opt: ParsedOption) => (
    <MenuItem key={`${opt.value}-${String(opt.label)}`} disabled={opt.disabled}>
      <button
        type="button"
        className={cn(
          itemClassName,
          opt.value === currentValue && 'bg-brand/5 font-medium text-brand-dark dark:bg-brand/15 dark:text-brand-light'
        )}
        onClick={() => commitValue(opt.value)}
      >
        {opt.label}
      </button>
    </MenuItem>
  );

  return (
    <div className="relative w-full">
      <Menu>
        <MenuButton
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            triggerClassName,
            'data-active:border-brand data-active:ring-2 data-active:ring-brand/25',
            className
          )}
        >
          <span className="min-w-0 flex-1 truncate text-start">{selectedLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </MenuButton>
        <MenuItems
          anchor="bottom start"
          transition
          className={cn(menuItemsClassName, 'w-[var(--button-width)] min-w-[var(--button-width)]')}
        >
          {flat.map(renderOption)}
          {groups.map((group) => (
            <div key={group.label} role="presentation">
              {group.label ? (
                <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {group.label}
                </p>
              ) : null}
              {group.options.map(renderOption)}
            </div>
          ))}
        </MenuItems>
      </Menu>

      <select
        {...rest}
        ref={mergeRefs(ref, nativeRef)}
        name={name}
        value={currentValue}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-hidden
        tabIndex={-1}
        className="sr-only"
        onChange={onChange}
        onBlur={onBlur}
      >
        {children}
      </select>
    </div>
  );
});
