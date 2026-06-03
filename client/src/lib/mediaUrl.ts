/** Resolve API-hosted static paths (e.g. /uploads/file.pdf) to a full URL. */
export function resolveMediaUrl(filePath: string): string {
  if (!filePath) return '';
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('blob:') ||
    filePath.startsWith('data:')
  ) {
    return filePath;
  }
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return base ? `${base}${path}` : path;
}
