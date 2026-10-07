-- ========================================================
-- TVG INVESTMENT - Schema do Supabase com Row Level Security (RLS)
-- ========================================================

-- 1. Tabela de Perfis de Usuários (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso para profiles (cada usuário só acessa o seu próprio perfil)
CREATE POLICY "Usuários podem visualizar apenas seu próprio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Tabela de Dados Financeiros Individuais (user_financial_data)
CREATE TABLE IF NOT EXISTS public.user_financial_data (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  banks JSONB DEFAULT '[]'::jsonb NOT NULL,
  incomes JSONB DEFAULT '[]'::jsonb NOT NULL,
  expenses JSONB DEFAULT '[]'::jsonb NOT NULL,
  goals JSONB DEFAULT '[]'::jsonb NOT NULL,
  transactions JSONB DEFAULT '[]'::jsonb NOT NULL,
  notifications JSONB DEFAULT '[]'::jsonb NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) na tabela de dados financeiros
ALTER TABLE public.user_financial_data ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso para user_financial_data (isolamento total entre usuários)
CREATE POLICY "Usuários podem visualizar apenas seus próprios dados financeiros"
  ON public.user_financial_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados financeiros"
  ON public.user_financial_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados financeiros"
  ON public.user_financial_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Trigger Automático para criar perfil e espaço financeiro ao cadastrar no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_financial_data (user_id, banks, incomes, expenses, goals, transactions, notifications, updated_at)
  VALUES (
    NEW.id,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    jsonb_build_array(
      jsonb_build_object(
        'id', 'notif-welcome',
        'type', 'achievement',
        'title', 'Bem-vindo à TVG INVESTMENT!',
        'description', 'Sua conta foi criada com segurança. Conecte sua primeira conta ou informe seus dados para começar.',
        'date', 'Hoje',
        'read', false
      )
    ),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparado após inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
