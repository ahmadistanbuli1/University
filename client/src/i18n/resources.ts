import arCommon from '../locales/ar/common.json';
import arNav from '../locales/ar/nav.json';
import enCommon from '../locales/en/common.json';
import enNav from '../locales/en/nav.json';

export const resources = {
  ar: { common: arCommon, nav: arNav },
  en: { common: enCommon, nav: enNav },
} as const;

export type AppLocale = keyof typeof resources;
