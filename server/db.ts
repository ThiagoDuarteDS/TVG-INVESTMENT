import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface UserFinancialData {
  banks: any[];
  incomes: any[];
  expenses: any[];
  goals: any[];
  transactions: any[];
  notifications: any[];
  updatedAt: string;
}

interface SessionRecord {
  userId: string;
  createdAt: number;
}

interface DatabaseSchema {
  users: UserRecord[];
  sessions: Record<string, SessionRecord>;
  userData: Record<string, UserFinancialData>;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      users: [],
      sessions: {},
      userData: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse database file, reinitializing', err);
    const initial: DatabaseSchema = {
      users: [],
      sessions: {},
      userData: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveDb(db: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function isValidEmailServer(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function registerUser(name: string, email: string, password: string) {
  const db = ensureDbFile();
  const normalizedEmail = email.trim().toLowerCase();

  if (!name.trim()) {
    throw new Error('Informe seu nome.');
  }

  if (!normalizedEmail || !isValidEmailServer(normalizedEmail)) {
    throw new Error('Digite um e-mail válido.');
  }

  if (password.length < 6) {
    throw new Error('A senha precisa ter pelo menos 6 caracteres.');
  }

  const existing = db.users.find((u) => u.email === normalizedEmail);
  if (existing) {
    throw new Error('Este e-mail já possui uma conta. Tente entrar.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const userId = `usr_${crypto.randomUUID()}`;

  const newUser: UserRecord = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Inicializar dados financeiros individuais, privados e zerados para o novo usuário
  const initialUserData: UserFinancialData = {
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

  db.userData[userId] = initialUserData;

  // Criar sessão autenticada
  const token = `sess_${crypto.randomBytes(32).toString('hex')}`;
  db.sessions[token] = {
    userId,
    createdAt: Date.now(),
  };

  saveDb(db);

  return {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    },
    data: initialUserData,
  };
}

export function loginUser(email: string, password: string) {
  const db = ensureDbFile();
  const normalizedEmail = email.trim().toLowerCase();

  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const calculatedHash = hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
    throw new Error('E-mail ou senha incorretos.');
  }

  // Token de sessão
  const token = `sess_${crypto.randomBytes(32).toString('hex')}`;
  db.sessions[token] = {
    userId: user.id,
    createdAt: Date.now(),
  };

  saveDb(db);

  const userData = db.userData[user.id] || {
    banks: [],
    incomes: [],
    expenses: [],
    goals: [],
    transactions: [],
    notifications: [],
    updatedAt: new Date().toISOString(),
  };

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    data: userData,
  };
}

export function getUserByToken(token: string) {
  if (!token) return null;
  const db = ensureDbFile();
  const session = db.sessions[token];
  if (!session) return null;

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return null;

  const userData = db.userData[user.id] || {
    banks: [],
    incomes: [],
    expenses: [],
    goals: [],
    transactions: [],
    notifications: [],
    updatedAt: new Date().toISOString(),
  };

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    data: userData,
  };
}

export function logoutUser(token: string) {
  if (!token) return;
  const db = ensureDbFile();
  if (db.sessions[token]) {
    delete db.sessions[token];
    saveDb(db);
  }
}

export function saveUserData(userId: string, data: Partial<UserFinancialData>) {
  const db = ensureDbFile();
  const current = db.userData[userId] || {
    banks: [],
    incomes: [],
    expenses: [],
    goals: [],
    transactions: [],
    notifications: [],
    updatedAt: new Date().toISOString(),
  };

  db.userData[userId] = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  saveDb(db);
  return db.userData[userId];
}
