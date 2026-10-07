import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
} from 'lucide-react';
import {
  BankAccount,
  IncomeCategory,
  ExpenseCategory,
  FinancialGoal,
  FinancialHealthScore,
  SmartNotification,
} from '../types';
import { WEALTH_HISTORY_12_MONTHS } from '../data/initialData';

interface DashboardViewProps {
  banks: BankAccount[];
  incomes: IncomeCategory[];
  expenses: ExpenseCategory[];
  goals: FinancialGoal[];
  healthScore: FinancialHealthScore;
  notifications: SmartNotification[];
  onNavigate: (tab: string) => void;
  onOpenNewTransaction: () => void;
  onOpenNewGoal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  banks,
  incomes,
  expenses,
  goals,
  healthScore,
  notifications,
  onNavigate,
  onOpenNewTransaction,
  onOpenNewGoal,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'mensal' | 'trimestral' | 'anual'>('mensal');
  const [hoveredExpense, setHoveredExpense] = useState<string | null>(null);
  const [hoveredHistoryIndex, setHoveredHistoryIndex] = useState<number | null>(null);

  // Calculations
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const availableCash = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((availableCash / totalIncome) * 100).toFixed(1) : '0';

  const totalBankBalances = banks.reduce((acc, curr) => acc + curr.balance, 0);
  const totalGoalsWealth = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalInvestedInGoals = goals.reduce((acc, g) => acc + (g.totalInvested !== undefined ? g.totalInvested : g.currentAmount || 0), 0);
  const totalYieldsInGoals = goals.reduce((acc, g) => acc + (g.accumulatedYield || 0), 0);
  const totalInvestments = totalGoalsWealth + banks.reduce((acc, curr) => acc + (curr.investmentsTotal || 0), 0);
  const totalWealth = totalBankBalances + totalInvestments;

  // Top 5 Expenses for Donut and summary list
  const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
  const topExpenses = sortedExpenses.slice(0, 6);
  const otherExpensesSum = sortedExpenses.slice(6).reduce((acc, curr) => acc + curr.amount, 0);

  // Donut chart angles calculation
  let cumulativeAngle = 0;
  const donutSegments = topExpenses.map((exp) => {
    const percentage = totalExpenses > 0 ? exp.amount / totalExpenses : 0;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...exp,
      percentage: (percentage * 100).toFixed(1),
      startAngle,
      angle,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Greeting, IA Quick Insight & Period Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Copiloto Ativo
            </span>
            <span className="text-xs text-slate-400">Atualizado há 3 minutos via Open Finance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
            Painel Financeiro Inteligente
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Você tem <strong className="text-emerald-400">R$ {availableCash.toLocaleString('pt-BR')}</strong> livres este mês. Sua taxa de poupança está em <strong className="text-emerald-400">{savingsRate}%</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch lg:self-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/80 text-xs">
            {(['mensal', 'trimestral', 'anual'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  selectedTimeframe === period
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('copilot')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consultar IA</span>
          </button>
        </div>
      </div>

      {/* Onboarding Guide Banner for Fresh Accounts */}
      {banks.length === 0 && incomes.length === 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Primeiros Passos na TVG INVESTMENT</span>
              </div>
              <h2 className="text-lg font-bold text-white">Sua conta individual foi inicializada com sucesso!</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Seus dados são 100% privados e isolados. Para começar a aproveitar as análises em tempo real e o Copiloto IA, conecte seu primeiro banco ou cadastre suas receitas e metas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigate('banks')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>Conectar Banco</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('budget')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Cadastrar Orçamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Receita Mensal */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Receita Mensal</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-100">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{incomes.length} fontes registradas</span>
          </div>
        </div>

        {/* 2. Despesas Totais */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Despesas Totais</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-100">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>{expenses.length} categorias cadastradas</span>
          </div>
        </div>

        {/* 3. Investimentos & Metas */}
        <div
          onClick={() => onNavigate('goals')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all shadow-sm cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium group-hover:text-emerald-300 transition-colors">Investimentos & Metas</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-100">
            R$ {totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{goals.length} meta(s) ativas (+R$ {totalYieldsInGoals.toLocaleString('pt-BR')} rendimentos)</span>
          </div>
        </div>

        {/* 4. Valor Disponível / Sobra */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-emerald-300">Valor Disponível</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-400">
            R$ {availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-emerald-300/80">
            {savingsRate}% da sua renda líquida
          </div>
        </div>

        {/* 5. Aporte Planejado */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Aporte Planejado</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-100">
            R$ {goals.reduce((acc, g) => acc + (g.monthlyContribution || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-amber-400">
            {goals.length} {goals.length === 1 ? 'meta ativa' : 'metas ativas'}
          </div>
        </div>

        {/* 6. Evolução do Patrimônio */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Patrimônio Total</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-100">
            R$ {totalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-purple-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Patrimônio consolidado</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Financial Health Score & Interactive Net Worth Evolution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Score Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Saúde Financeira</h3>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {healthScore.level}
              </span>
            </div>

            {/* Circular Gauge / Score Display */}
            <div className="my-6 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="url(#healthGradient)"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - healthScore.score / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
                    {healthScore.score}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    de 100 pts
                  </span>
                </div>
              </div>
            </div>

            {/* Pillar Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Taxa de Poupança</span>
                <span className="font-semibold text-emerald-400">{healthScore.savingsRate}% (Meta &gt;20%)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Reserva Acumulada</span>
                <span className="font-semibold text-cyan-400">{healthScore.emergencyReserveMonths} meses de custo</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Comprometimento Fixo</span>
                <span className="font-semibold text-slate-200">{healthScore.fixedCommitmentRate}% (Ideal &lt;50%)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Copiloto TVG Engine</span>
            <button
              onClick={() => onNavigate('copilot')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Ver Diagnóstico Completo →
            </button>
          </div>
        </div>

        {/* Interactive Patrimônio Evolution Chart (Last 12 months) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Evolução do Patrimônio Líquido</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Crescimento consistente impulsionado por aportes mensais e rendimentos compostos.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Investido
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Saldo em Contas
              </span>
            </div>
          </div>

          {/* SVG Interactive Area Chart */}
          <div className="relative my-4 h-56 w-full flex items-end">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="wealthAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Area path */}
              {(() => {
                const minVal = 130000;
                const maxVal = 240000;
                const range = maxVal - minVal;
                const points = WEALTH_HISTORY_12_MONTHS.map((item, idx) => {
                  const x = (idx / (WEALTH_HISTORY_12_MONTHS.length - 1)) * 600;
                  const y = 190 - ((item.total - minVal) / range) * 160;
                  return `${x},${y}`;
                });
                const d = `M 0,190 L ${points.join(' L ')} L 600,190 Z`;
                const strokePath = `M ${points.join(' L ')}`;

                return (
                  <>
                    <path d={d} fill="url(#wealthAreaGradient)" />
                    <path d={strokePath} fill="none" stroke="#10b981" strokeWidth="3" />
                    {WEALTH_HISTORY_12_MONTHS.map((item, idx) => {
                      const x = (idx / (WEALTH_HISTORY_12_MONTHS.length - 1)) * 600;
                      const y = 190 - ((item.total - minVal) / range) * 160;
                      const isHovered = hoveredHistoryIndex === idx;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r={isHovered ? 6 : 4}
                          className="cursor-pointer transition-all fill-slate-900 stroke-emerald-400 stroke-2"
                          onMouseEnter={() => setHoveredHistoryIndex(idx)}
                          onMouseLeave={() => setHoveredHistoryIndex(null)}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* Hover Tooltip */}
            {hoveredHistoryIndex !== null && (
              <div
                className="absolute -top-12 z-20 pointer-events-none transform -translate-x-1/2 bg-slate-950 border border-slate-700 text-slate-100 px-3 py-1.5 rounded-lg shadow-xl text-xs"
                style={{
                  left: `${(hoveredHistoryIndex / (WEALTH_HISTORY_12_MONTHS.length - 1)) * 100}%`,
                }}
              >
                <div className="font-bold text-emerald-400">
                  R$ {WEALTH_HISTORY_12_MONTHS[hoveredHistoryIndex].total.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-slate-400">
                  {WEALTH_HISTORY_12_MONTHS[hoveredHistoryIndex].month}
                </div>
              </div>
            )}
          </div>

          {/* Month labels under chart */}
          <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
            {WEALTH_HISTORY_12_MONTHS.map((item, idx) => (
              <span
                key={idx}
                className={idx % 2 === 0 ? 'inline' : 'hidden sm:inline'}
              >
                {item.month}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Where the money is going (interactive categories) & Metas Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Where money goes: Expenses Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  Distribuição de Despesas do Mês
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total de R$ {totalExpenses.toLocaleString('pt-BR')} divididos por categorias
                </p>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Editar Orçamento →
              </button>
            </div>

            {/* List of top categories with amounts and progress bars */}
            <div className="space-y-3.5 my-4">
              {topExpenses.map((exp) => {
                const percentage = totalExpenses > 0 ? (exp.amount / totalExpenses) * 100 : 0;
                return (
                  <div
                    key={exp.id}
                    onMouseEnter={() => setHoveredExpense(exp.id)}
                    onMouseLeave={() => setHoveredExpense(null)}
                    className="p-2.5 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: exp.color }}
                        />
                        <span className="font-medium text-slate-200">{exp.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{percentage.toFixed(0)}%</span>
                        <span className="font-semibold text-slate-100">
                          R$ {exp.amount.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: exp.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick AI Alert Box */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-slate-300 leading-snug">
                {totalIncome > 0 ? (
                  <>
                    Sua taxa de poupança está em <strong className="text-emerald-400">{savingsRate}%</strong> com margem livre de <strong className="text-emerald-400">R$ {availableCash.toLocaleString('pt-BR')}</strong> para investimentos e metas.
                  </>
                ) : (
                  <>
                    Cadastre suas receitas e despesas para visualizar o diagnóstico de capacidade de poupança e investimentos.
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => onNavigate('copilot')}
              className="text-emerald-400 hover:text-emerald-300 whitespace-nowrap font-semibold text-xs"
            >
              Ver Análise →
            </button>
          </div>
        </div>

        {/* Metas Financeiras - Progresso Dinâmico */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  Progresso das Metas Financeiras
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acompanhamento dos seus objetivos de curto, médio e longo prazo
                </p>
              </div>
              <button
                onClick={onOpenNewGoal}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Meta</span>
              </button>
            </div>

            {/* Goals Interactive Progress Cards */}
            <div className="space-y-4 my-4">
              {goals.map((goal) => {
                const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const remaining = goal.targetAmount - goal.currentAmount;
                return (
                  <div
                    key={goal.id}
                    onClick={() => onNavigate('goals')}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-emerald-300 transition-colors">
                          {goal.title}
                        </h4>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-emerald-400">
                        {percentage}%
                      </span>
                    </div>

                    {/* Progress Bar (Requested in prompt: Apartamento 78%, Reserva 60%, etc.) */}
                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Atual: R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
                      <span>Meta: R$ {goal.targetAmount.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Planejamento Estratégico Ativo</span>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Simular Aceleração de Metas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
