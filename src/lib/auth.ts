const TOKEN_KEY = 'distro_builder_token';

export const auth = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  isLoggedIn(): boolean {
    return !!this.getToken();
  },

  clearAll() {
    this.removeToken();
  },
};
