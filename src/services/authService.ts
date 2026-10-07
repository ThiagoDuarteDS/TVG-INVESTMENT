export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface UserFinancialState {
  banks: any[];
  incomes: any[];
  expenses: any[];
  goals: any[];
  transactions: any[];
  notifications: any[];
}

const TOKEN_KEY = 'tvg_auth_token';
const ACTIVE_USER_KEY = 'tvg_active_user';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACTIVE_USER_KEY);
  },

  getActiveUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(ACTIVE_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setActiveUser(user: UserProfile) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  },

  async register(name: string, email: string, password: string): Promise<{
    user: UserProfile;
    data: UserFinancialState;
    token: string;
  }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Erro ao criar conta.');
    }

    this.setToken(json.token);
    this.setActiveUser(json.user);
    // Cache user-specific data
    localStorage.setItem(`tvg_user_${json.user.id}_data`, JSON.stringify(json.data));
    return json;
  },

  async login(email: string, password: string): Promise<{
    user: UserProfile;
    data: UserFinancialState;
    token: string;
  }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'E-mail ou senha incorretos.');
    }

    this.setToken(json.token);
    this.setActiveUser(json.user);
    // Cache user-specific data
    localStorage.setItem(`tvg_user_${json.user.id}_data`, JSON.stringify(json.data));
    return json;
  },

  async getMe(): Promise<{ user: UserProfile; data: UserFinancialState } | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        this.clearToken();
        return null;
      }

      const json = await res.json();
      this.setActiveUser(json.user);
      return json;
    } catch {
      // Offline fallback: check active user
      const user = this.getActiveUser();
      if (user) {
        const cachedData = localStorage.getItem(`tvg_user_${user.id}_data`);
        const data = cachedData ? JSON.parse(cachedData) : {
          banks: [],
          incomes: [],
          expenses: [],
          goals: [],
          transactions: [],
          notifications: [],
        };
        return { user, data };
      }
      return null;
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        // Ignore network errors on logout
      }
    }
    this.clearToken();
  },

  async syncUserData(userId: string, data: Partial<UserFinancialState>): Promise<void> {
    // Always persist to user-isolated localStorage key first
    localStorage.setItem(`tvg_user_${userId}_data`, JSON.stringify(data));

    const token = this.getToken();
    if (!token) return;

    try {
      await fetch('/api/user/data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('Background sync failed, cached locally:', err);
    }
  },
};
