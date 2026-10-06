import React, { useState } from 'react';
import { TVGLogo } from './TVGLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  User,
  Building2,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (userProfile?: { name: string; email: string }) => void;
  onRegisterSuccess: (userProfile: { name: string; email: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  // Login form states
  const [email, setEmail] = useState('thiago007.org@gmail.com');
  const [password, setPassword] = useState('tvg2026wealth');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot password field
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: email.split('@')[0] || 'Usuário',
      email: email.trim(),
    });
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      alert('As senhas não coincidem. Por favor, verifique.');
      return;
    }
    onRegisterSuccess({
      name: regName.trim() || 'Usuário',
      email: regEmail.trim() || 'usuario@tvgwealth.com',
    });
  };

  // Submit Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setMode('login');
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Tech Gradients and Atmospheric Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-emerald-500/12 via-cyan-500/8 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative ambient subtle graph grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top subtle status bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">TVG INVESTMENT</span>
        </div>
        <div className="flex items-center gap-4 hidden sm:flex">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Criptografia Bancária 256-bit
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-medium">Open Finance Brasil</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md sm:max-w-lg flex flex-col items-center">
          {/* 
            LOGO TVG INVESTMENT — GRANDE E BRANCA
            Centralizada horizontalmente, na parte superior da tela, perfeitamente legível,
            com bastante destaque e integrada diretamente ao fundo do projeto (sem fundo branco artificial).
          */}
          <div className="w-full flex justify-center mb-6 sm:mb-8 text-center">
            <TVGLogo
              size="login"
              alt="TVG INVESTMENT"
              className="hover:scale-[1.01] transition-transform duration-300"
            />
          </div>

          {/* Main Card with Glassmorphism and Elegant Accent */}
          <div className="w-full relative rounded-2xl sm:rounded-3xl bg-slate-900/85 border border-slate-800/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300">
            {/* Top decorative glow accent */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

            {/* 1. TELA DE LOGIN */}
            {mode === 'login' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 text-center mb-6 sm:mb-8">
                  Bem-vindo à TVG INVESTMENT
                </h1>

                {/* Formulário de Login */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Campo de e-mail */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      E-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-500 text-sm transition-all focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Campo de senha */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-500 text-sm transition-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Botão Entrar */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                    >
                      <span>Entrar</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Esqueceu sua senha? */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>

                  {/* Ainda não possui uma conta? Criar conta */}
                  <div className="pt-4 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                      Ainda não possui uma conta?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
                      >
                        Criar conta
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* 2. TELA DE CADASTRO (CRIAR CONTA) */}
            {mode === 'register' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 text-center mb-6 sm:mb-8">
                  Crie sua conta
                </h1>

                {/* Formulário de Cadastro */}
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Campo de nome */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nome
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Campo de e-mail */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      E-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Campo de senha */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Crie uma senha segura"
                        className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Campo de confirmação de senha */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repita sua senha"
                        className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Botão Criar conta */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                    >
                      <span>Criar conta</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Já possui uma conta? Entrar */}
                  <div className="pt-4 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                      Já possui uma conta?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
                      >
                        Entrar
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* 3. RECUPERAR SENHA */}
            {mode === 'forgot_password' && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 text-center mb-2">
                  Recuperar senha
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 text-center mb-6">
                  Informe seu e-mail cadastrado para redefinir seu acesso.
                </p>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotSent ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h3 className="font-bold text-sm text-slate-100">Instruções enviadas!</h3>
                      <p className="text-xs text-slate-300">
                        Enviamos um link seguro de recuperação para <strong className="text-white">{forgotEmail || email}</strong>. Verifique sua caixa de entrada.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Seu e-mail cadastrado
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            required
                            value={forgotEmail || email}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-emerald-500 text-slate-100 text-sm focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Enviar link de recuperação</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </>
                  )}

                  <div className="pt-3 border-t border-slate-800 text-center">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
                    >
                      ← Voltar para o Login
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Micro-badges de segurança e confiabilidade abaixo do card */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 text-center">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Ambiente Seguro LGPD
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Copiloto IA Conectado
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Open Finance Brasil
            </span>
          </div>
        </div>
      </main>

      {/* Rodapé institucional */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-slate-500 max-w-7xl mx-auto px-6">
        © 2026 TVG INVESTMENT. Todos os direitos reservados.
      </footer>
    </div>
  );
};
