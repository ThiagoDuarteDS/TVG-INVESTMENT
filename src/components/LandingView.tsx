import React, { useState } from 'react';
import { TVGLogo } from './TVGLogo';
import { BankLogo } from './BankLogo';
import {
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  PieChart,
  Target,
  Building2,
  Lock,
  ChevronRight,
  DollarSign,
  Activity,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface LandingViewProps {
  onEnter: () => void;
  onSignUp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnter, onSignUp }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: 'Conexão Open Finance Unificada',
      desc: 'Reúna todas as suas contas bancárias, cartões, investimentos e transações em tempo real com criptografia de padrão bancário.',
      icon: Building2,
      tag: 'Conectividade',
      stat: '9+ Bancos Suportados',
    },
    {
      title: 'Copiloto IA Generativo Pessoal',
      desc: 'Um consultor financeiro de ponta analisando seu orçamento, apontando vazamentos de dinheiro e respondendo dúvidas instantaneamente.',
      icon: Sparkles,
      tag: 'Inteligência Artificial',
      stat: 'Gemini 3.8 Flash Integrado',
    },
    {
      title: 'Metas e Projeção de Riqueza',
      desc: 'Simule cenários reais para comprar imóveis, veículos, atingir a independência financeira e aposentadoria com cálculo de juros compostos.',
      icon: Target,
      tag: 'Estratégia',
      stat: 'Cálculo de Juros Compostos',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Tech Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand in Prominence */}
      <header className="relative z-10 w-full px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between border-b border-slate-800/60 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <TVGLogo size="lg" />
        </div>

        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={onEnter}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all shadow-sm"
          >
            Entrar
          </button>
          <button
            onClick={onSignUp}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 group active:scale-95"
          >
            <span>Criar minha conta</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20 flex-1 flex flex-col items-center text-center">
        {/* Badge of trust and intelligence */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-inner animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plataforma Inteligente de Controle Financeiro & Investimentos</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl leading-[1.15]">
          O verdadeiro <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Copiloto Financeiro</span> para a sua vida e patrimônio.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Esqueça planilhas manuais e gráficos estáticos. A <strong className="text-slate-200">TVG INVESTMENT</strong> conecta seus bancos, organiza receitas e despesas, projeta suas metas e usa inteligência artificial para orientar cada decisão.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onSignUp}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>Criar minha conta grátis</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={onEnter}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Acessar Demonstração Interativa</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Trust & Security Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Open Finance Brasil Regulamentado</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Criptografia de Ponta a Ponta 256-bit</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Sincronização Automática Contínua</span>
          </div>
        </div>

        {/* Interactive Feature Cockpit Showcase */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xl shadow-2xl text-left">
          {/* Mock Window Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">
                tvg-wealth-engine // cockpit.live
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              IA Ativa & Conectada
            </div>
          </div>

          {/* Interactive Feature Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              const isSelected = activeFeature === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveFeature(idx)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-slate-800 text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">{f.tag}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-200 mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  <div className="mt-3 text-[11px] font-mono text-cyan-400 font-medium">{f.stat}</div>
                </div>
              );
            })}
          </div>

          {/* Interactive Preview of the Active Feature */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
            {activeFeature === 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Visão de Bancos Conectados
                  </div>
                  <h4 className="text-lg font-bold text-slate-100">
                    Sincronização em 1 clique com os maiores bancos do país
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Nubank, Itaú, BTG Pactual, XP Investimentos e Inter sincronizados em tempo real com controle total de permissões.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                    <BankLogo bankName="Nubank" size="sm" />
                    <div>
                      <div className="text-xs text-slate-400">Nubank</div>
                      <div className="text-sm font-bold text-emerald-400">R$ 4.250,40</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                    <BankLogo bankName="XP Investimentos" size="sm" />
                    <div>
                      <div className="text-xs text-slate-400">XP Investimentos</div>
                      <div className="text-sm font-bold text-cyan-400">R$ 96.400,00</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                    <BankLogo bankName="Itaú Unibanco" size="sm" />
                    <div>
                      <div className="text-xs text-slate-400">Itaú Unibanco</div>
                      <div className="text-sm font-bold text-amber-400">R$ 12.840,10</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeature === 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Copiloto IA Gemini 3.8
                  </div>
                  <h4 className="text-lg font-bold text-slate-100">
                    Diagnósticos humanos e conselhos estratégicos
                  </h4>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-cyan-500/20 text-xs text-slate-300 italic">
                    “Você gasta 32% com moradia. Se economizar R$ 200/mês em lazer, antecipa a compra do seu apartamento em 7 meses!”
                  </div>
                </div>
                <button
                  onClick={onEnter}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold whitespace-nowrap"
                >
                  Experimentar Copiloto →
                </button>
              </div>
            )}

            {activeFeature === 2 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Planejamento & Objetivos
                  </div>
                  <h4 className="text-lg font-bold text-slate-100">
                    Acompanhe cada conquista com barras de progresso reais
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Apartamento (78%), Reserva de Emergência (60%), Liberdade Financeira (40%).
                  </p>
                </div>
                <div className="w-full md:w-64 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Apartamento Próprio</span>
                      <span className="text-emerald-400 font-bold">78%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Reserva de Emergência</span>
                      <span className="text-cyan-400 font-bold">60%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TVGLogo size="sm" />
          <span>© 2026 TVG INVESTMENT. Todos os direitos reservados.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hover:text-slate-200 cursor-pointer">Segurança & Privacidade</span>
          <span>•</span>
          <span className="hover:text-slate-200 cursor-pointer">Termos de Uso</span>
          <span>•</span>
          <span className="hover:text-slate-200 cursor-pointer">Open Finance Brasil</span>
        </div>
      </footer>
    </div>
  );
};
