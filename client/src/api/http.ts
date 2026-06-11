import axios from 'axios';
import { toast } from 'sonner';

const baseURL = import.meta.env.VITE_API_URL ?? '';

export const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/** Dedicated client for multipart uploads (no JSON Content-Type). */
const formHttp = axios.create({
  baseURL,
  withCredentials: true,
});

formHttp.interceptors.request.use((config) => {
  const h = config.headers;
  if (h && 'delete' in h && typeof h.delete === 'function') {
    h.delete('Content-Type');
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (axios.isAxiosError(err) && !err.response) {
      toast.error('Network error — check API server and CORS.');
    }
    return Promise.reject(err);
  }
);

export async function logoutSession() {
  await axiosInstance.post('/api/auth/logout');
}

export function postFormData<T = unknown>(path: string, body: FormData) {
  return formHttp.post<T>(path, body);
}

export function patchFormData<T = unknown>(path: string, body: FormData) {
  return formHttp.patch<T>(path, body);
}
