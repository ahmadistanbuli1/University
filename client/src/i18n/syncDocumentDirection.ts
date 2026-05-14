const rtlPrimaryTags = new Set(['ar', 'he', 'fa', 'ur']);

export function syncDocumentDirection(language: string): void {
  const primary = (language || 'ar').split('-')[0] ?? 'ar';
  const dir = rtlPrimaryTags.has(primary) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', language || 'ar');
}
