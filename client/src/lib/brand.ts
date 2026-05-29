/** SPU brand palette — primary #025692, secondary #F4853C */
export const BRAND = {
  primary: '#025692',
  primaryLight: '#0388BE',
  primaryDark: '#014A7A',
  secondary: '#F4853C',
  secondaryLight: '#F9A66B',
  glow: '#F4853C',
} as const;

/** Primary button / CTA gradient */
export const brandGradient =
  'bg-gradient-to-r from-brand to-brand-light text-white shadow-md shadow-brand/20 ring-1 ring-inset ring-white/10 hover:from-brand-dark hover:to-brand';

/** Sidebar active item, compact controls */
export const brandGradientSm =
  'bg-gradient-to-r from-brand to-brand-light text-white shadow-md shadow-brand/25';

/** Logo / avatar marks */
export const brandGradientBr =
  'bg-gradient-to-br from-brand via-brand-light to-brand-secondary';

/** Accent stripe (cards, timelines) */
export const brandGradientAccent =
  'bg-gradient-to-r from-brand via-brand-light to-brand-secondary';

/** Muted surfaces (replaces violet-50 panels) */
export const brandMutedSurface =
  'border-brand/20 bg-brand/5 dark:border-brand/25 dark:bg-brand/10';

/** Text link / highlight */
export const brandText = 'text-brand dark:text-brand-light';

/** Hover on neutral controls */
export const brandHover =
  'hover:bg-brand/5 hover:text-brand-dark dark:hover:bg-brand/15 dark:hover:text-brand-light';
