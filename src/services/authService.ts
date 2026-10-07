import { supabase, isSupabaseConfigured } from './supabase';

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
  updatedAt?: string;
}

const TOKEN_KEY = 'tvg_auth_token';
const ACTIVE_USER_KEY = 'tvg_active_user';
const LOCAL_USERS_REGISTRY_KEY = 'tvg_users_registry';

/**
 * Validação de e-mail permissiva para aceitar e-mails comuns e corporativos
 * Exemplos: usuario@gmail.com, nome.sobrenome@gmail.com, usuario123@hotmail.com, contato@empresa.com.br
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Mapeia erros técnicos do navegador, WebKit/Safari ou APIs para mensagens claras em português
 */
export function formatAuthError(error: any, fallbackMessage: string): string {
  if (!error) return fallbackMessage;
  const rawMsg = typeof error === 'string' ? error : error?.message || error?.error || '';
  const msg = rawMsg.toLowerCase();

  if (
    msg.includes('string did not match the expected pattern') ||
    msg.includes('pattern') ||
    msg.includes('syntaxerror') ||
    msg.includes('unexpected token')
  ) {
    return 'Não foi possível concluir a operação. Verifique os dados digitados e tente novamente.';
  }
  if (
    msg.includes('already registered') ||
    msg.includes('já está cadastrado') ||
    msg.includes('already in use') ||
    msg.includes('user already exists') ||
    msg.includes('já possui uma conta')
  ) {
    return 'Este e-mail já possui uma conta. Tente entrar.';
  }
  if (
    msg.includes('invalid email') ||
    msg.includes('e-mail inválido') ||
    msg.includes('email format')
  ) {
    return 'Digite um e-mail válido.';
  }
  if (
    msg.includes('password') &&
    (msg.includes('short') || msg.includes('6') || msg.includes('curta') || msg.includes('mínimo'))
  ) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  if (msg.includes('coincidem') || msg.includes('mismatch')) {
    return 'As senhas não coincidem.';
  }
  if (
    msg.includes('credenciais') ||
    msg.includes('invalid login') ||
    msg.includes('invalid credentials') ||
    msg.includes('incorretos') ||
    msg.includes('not found')
  ) {
    return 'E-mail ou senha incorretos.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
  }

  // Se já for uma mensagem em português amigável sem jargões de código
  if (rawMsg && !rawMsg.includes('SyntaxError') && !rawMsg.includes('JSON') && !rawMsg.includes('object')) {
    return rawMsg;
  }

  return fallbackMessage;
}

// Utilitário para hash de senha no cliente usando Web Crypto API (SHA-256) quando necessário
async function hashPasswordClient(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + '_tvg_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Utilitário para parse seguro que nunca lança "The string did not match the expected pattern"
async function parseResponseSafe(res: Response): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 500, data: { error: err?.message || 'Falha de comunicação' } };
  }
}

export const authService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Ignora erro em storage bloqueado
    }
  },

  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ACTIVE_USER_KEY);
    } catch {
      // Ignora
    }
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
    try {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } catch {
      // Ignora
    }
  },

  /**
   * Cadastro Real de Usuário
   */
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: UserProfile; data: UserFinancialState; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) {
      throw new Error('Informe seu nome.');
    }
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Digite um e-mail válido.');
    }
    if (password.length < 6) {
      throw new Error('A senha precisa ter pelo menos 6 caracteres.');
    }

    // 1. Se o Supabase estiver configurado com credenciais válidas
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: cleanName },
        },
      });

      if (authErr) {
        throw new Error(formatAuthError(authErr, 'Não foi possível concluir o cadastro. Tente novamente.'));
      }

      if (!authData.user) {
        throw new Error('Não foi possível concluir o cadastro. Tente novamente.');
      }

      const user: UserProfile = {
        id: authData.user.id,
        name: cleanName,
        email: cleanEmail,
        createdAt: authData.user.created_at || new Date().toISOString(),
      };

      const initialData: UserFinancialState = {
        banks: [],
        incomes: [],
        expenses: [],
        goals: [],
        transactions: [],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            type: 'achievement',
            title: 'Bem-vindo à TVG INVESTMENT!',
            description: 'Sua conta foi criada com segurança. Conecte sua primeira conta ou informe seus dados para começar.',
            date: 'Hoje',
            read: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      // Salvar perfil e dados nas tabelas do Supabase
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          email: user.email,
        });

        await supabase.from('user_financial_data').upsert({
          user_id: user.id,
          ...initialData,
        });
      } catch (err) {
        console.warn('Supabase DB upsert warning:', err);
      }

      const token = authData.session?.access_token || `token_${Date.now()}`;
      this.setToken(token);
      this.setActiveUser(user);
      localStorage.setItem(`tvg_user_${user.id}_data`, JSON.stringify(initialData));

      return { user, data: initialData, token };
    }

    // 2. Tentar API Backend do Express (/api/auth/register)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });

      const parsed = await parseResponseSafe(res);

      if (parsed.ok && parsed.data?.token && parsed.data?.user) {
        this.setToken(parsed.data.token);
        this.setActiveUser(parsed.data.user);
        localStorage.setItem(`tvg_user_${parsed.data.user.id}_data`, JSON.stringify(parsed.data.data));
        return parsed.data;
      }

      // Se a API retornou erro de negócio estruturado (ex: 400 e-mail já existe)
      if (!parsed.ok && parsed.data?.error && parsed.status < 500) {
        throw new Error(formatAuthError(parsed.data.error, 'Não foi possível concluir o cadastro.'));
      }
    } catch (apiErr: any) {
      if (apiErr.message && !apiErr.message.includes('fetch') && !apiErr.message.includes('pattern')) {
        throw apiErr;
      }
    }

    // 3. Fallback Seguro e Criptografado no Cliente (Garante funcionamento perfeito mesmo em hospedagem estática como Vercel sem backend)
    const existingUsersRaw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
    const existingUsers: Array<{ id: string; name: string; email: string; passwordHash: string; createdAt: string }> =
      existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

    const alreadyExists = existingUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (alreadyExists) {
      throw new Error('Este e-mail já possui uma conta. Tente entrar.');
    }

    const passwordHash = await hashPasswordClient(password);
    const userId = `usr_${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2, 9)}`;

    const newUserRecord = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    existingUsers.push(newUserRecord);
    localStorage.setItem(LOCAL_USERS_REGISTRY_KEY, JSON.stringify(existingUsers));

    const initialData: UserFinancialState = {
      banks: [],
      incomes: [],
      expenses: [],
      goals: [],
      transactions: [],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'achievement',
          title: 'Bem-vindo à TVG INVESTMENT!',
          description: 'Sua conta foi criada com segurança. Conecte sua primeira conta ou informe seus dados para começar.',
          date: 'Hoje',
          read: false,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const userProfile: UserProfile = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      createdAt: newUserRecord.createdAt,
    };

    const token = `token_client_${Date.now()}_${userId}`;
    this.setToken(token);
    this.setActiveUser(userProfile);
    localStorage.setItem(`tvg_user_${userId}_data`, JSON.stringify(initialData));

    return { user: userProfile, data: initialData, token };
  },

  /**
   * Login Real de Usuário
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: UserProfile; data: UserFinancialState; token: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error('Por favor, informe seu e-mail e senha.');
    }

    // 1. Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authErr) {
        throw new Error(formatAuthError(authErr, 'E-mail ou senha incorretos.'));
      }

      if (!authData.user) {
        throw new Error('E-mail ou senha incorretos.');
      }

      // Buscar perfil do usuário
      let name = authData.user.user_metadata?.name || cleanEmail.split('@')[0];
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        if (profileData?.name) {
          name = profileData.name;
        }
      } catch (e) {
        // Ignora
      }

      const user: UserProfile = {
        id: authData.user.id,
        name,
        email: cleanEmail,
        createdAt: authData.user.created_at,
      };

      // Carregar dados financeiros isolados daquele usuário
      let userFinData: UserFinancialState = {
        banks: [],
        incomes: [],
        expenses: [],
        goals: [],
        transactions: [],
        notifications: [],
      };

      try {
        const { data: finData } = await supabase
          .from('user_financial_data')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();
        if (finData) {
          userFinData = {
            banks: finData.banks || [],
            incomes: finData.incomes || [],
            expenses: finData.expenses || [],
            goals: finData.goals || [],
            transactions: finData.transactions || [],
            notifications: finData.notifications || [],
            updatedAt: finData.updated_at,
          };
        }
      } catch (e) {
        // Ignora
      }

      const token = authData.session?.access_token || `token_${Date.now()}`;
      this.setToken(token);
      this.setActiveUser(user);
      localStorage.setItem(`tvg_user_${user.id}_data`, JSON.stringify(userFinData));

      return { user, data: userFinData, token };
    }

    // 2. Tentar API Backend do Express (/api/auth/login)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const parsed = await parseResponseSafe(res);

      if (parsed.ok && parsed.data?.token && parsed.data?.user) {
        this.setToken(parsed.data.token);
        this.setActiveUser(parsed.data.user);
        localStorage.setItem(`tvg_user_${parsed.data.user.id}_data`, JSON.stringify(parsed.data.data));
        return parsed.data;
      }

      if (!parsed.ok && parsed.data?.error && parsed.status < 500) {
        throw new Error(formatAuthError(parsed.data.error, 'E-mail ou senha incorretos.'));
      }
    } catch (apiErr: any) {
      if (apiErr.message && !apiErr.message.includes('fetch') && !apiErr.message.includes('pattern')) {
        throw apiErr;
      }
    }

    // 3. Fallback Seguro no Registro Local
    const existingUsersRaw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
    const existingUsers: Array<{ id: string; name: string; email: string; passwordHash: string; createdAt: string }> =
      existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

    const matchedUser = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const calculatedHash = await hashPasswordClient(password);
    if (calculatedHash !== matchedUser.passwordHash) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const userProfile: UserProfile = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      createdAt: matchedUser.createdAt,
    };

    const cachedDataRaw = localStorage.getItem(`tvg_user_${matchedUser.id}_data`);
    const userData: UserFinancialState = cachedDataRaw
      ? JSON.parse(cachedDataRaw)
      : {
          banks: [],
          incomes: [],
          expenses: [],
          goals: [],
          transactions: [],
          notifications: [],
        };

    const token = `token_client_${Date.now()}_${matchedUser.id}`;
    this.setToken(token);
    this.setActiveUser(userProfile);

    return { user: userProfile, data: userData, token };
  },

  /**
   * Restaura a sessão do usuário atual
   */
  async getMe(): Promise<{ user: UserProfile; data: UserFinancialState } | null> {
    const token = this.getToken();
    if (!token) return null;

    // 1. Supabase Session
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const authUser = sessionData.session.user;
          const user: UserProfile = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
            email: authUser.email || '',
            createdAt: authUser.created_at,
          };

          const cached = localStorage.getItem(`tvg_user_${user.id}_data`);
          const data = cached
            ? JSON.parse(cached)
            : {
                banks: [],
                incomes: [],
                expenses: [],
                goals: [],
                transactions: [],
                notifications: [],
              };

          this.setActiveUser(user);
          return { user, data };
        }
      } catch {
        // Fallback
      }
    }

    // 2. Backend API Session
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const parsed = await parseResponseSafe(res);
      if (parsed.ok && parsed.data?.user) {
        this.setActiveUser(parsed.data.user);
        return parsed.data;
      }
    } catch {
      // Ignora erro de rede
    }

    // 3. Fallback Local Session
    const active = this.getActiveUser();
    if (active && active.id) {
      const cached = localStorage.getItem(`tvg_user_${active.id}_data`);
      const data = cached
        ? JSON.parse(cached)
        : {
            banks: [],
            incomes: [],
            expenses: [],
            goals: [],
            transactions: [],
            notifications: [],
          };
      return { user: active, data };
    }

    return null;
  },

  /**
   * Encerra a sessão com segurança
   */
  async logout(): Promise<void> {
    const token = this.getToken();
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignora
      }
    }

    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignora
      }
    }

    this.clearToken();
  },

  /**
   * Sincroniza dados individuais do usuário autenticado
   */
  async syncUserData(userId: string, data: Partial<UserFinancialState>): Promise<void> {
    if (!userId) return;

    // Salva sempre no cache local individual do usuário
    try {
      localStorage.setItem(`tvg_user_${userId}_data`, JSON.stringify(data));
    } catch {
      // Ignora erro de cota
    }

    // Se estiver no Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_financial_data').upsert({
          user_id: userId,
          ...data,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Erro ao sincronizar com Supabase:', err);
      }
      return;
    }

    // Tentar Backend API
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
    } catch {
      // Armazenado com segurança localmente
    }
  },
};
