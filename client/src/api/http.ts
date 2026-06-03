import type { InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { toast } from 'sonner';

const baseURL = import.meta.env.VITE_API_URL ?? '';

export const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/** Dedicated client for multipart uploads (no JSON Content-Type). */
const formHttp = axios.create({ baseURL });

const TOKEN_KEY = 'university_token';

function attachAuth(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

axiosInstance.interceptors.request.use(attachAuth);

formHttp.interceptors.request.use((config) => {
  attachAuth(config);
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

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function postFormData<T = unknown>(path: string, body: FormData) {
  return formHttp.post<T>(path, body);
}

export function patchFormData<T = unknown>(path: string, body: FormData) {
  return formHttp.patch<T>(path, body);
}
