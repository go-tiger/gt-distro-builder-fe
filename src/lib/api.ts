import { auth } from './auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  method?: string;
}

export const api = {
  async call(path: string, options: FetchOptions = {}) {
    const token = auth.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    } as Record<string, string>;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      auth.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('인증이 필요합니다');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || '요청 실패');
    }

    return response.json();
  },

  get(path: string) {
    return this.call(path, { method: 'GET' });
  },

  post(path: string, data?: Record<string, unknown>) {
    return this.call(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch(path: string, data?: Record<string, unknown>) {
    return this.call(path, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
};
