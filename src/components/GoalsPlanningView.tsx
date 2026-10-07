import React, { useState } from 'react';
import {
  Target,
  Plus,
  Building2,
  Car,
  Plane,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
  Briefcase,
  ChevronRight,
  Calculator,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Trash2,
  Edit3,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  History,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { FinancialGoal, GoalContribution } from '../types';

interface GoalsPlanningViewProps {
  goals: FinancialGoal[];
  availableMonthlyCash: number;
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalContribution: (id: string, newContribution: number) => void;
  onAddMoneyToGoal?: (goalId: string, amount: number, note?: string) => void;
  onWithdrawFromGoal?: (goalId: string, amount: number) => void;
  onUpdateGoal?: (goalId: string, updatedFields: Partial<FinancialGoal>) => void;
}

export const GoalsPlanningView: React.FC<GoalsPlanningViewProps> = ({
  goals,
  availableMonthlyCash,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoalContribution,
  onAddMoneyToGoal,
  onWithdrawFromGoal,
  onUpdateGoal,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states for new goal
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<FinancialGoal['category']>('imovel');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newCurrentAmount, setNewCurrentAmount] = useState('');
  const [newMonths, setNewMonths] = useState('');
  const [newReturnRate, setNewReturnRate] = useState('10.5');

  // Form states for Aporte Direto (Adicionar dinheiro)
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');

  // Form states for Resgate (Retirar dinheiro)
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Form states for Editar Parâmetros
  const [editTitle, setEditTitle] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editMonths, setEditMonths] = useState('');
  const [editReturnRate, setEditReturnRate] = useState('');
  const [editMonthlyContribution, setEditMonthlyContribution] = useState('');

  // Select target goal safely
  const currentGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];

  // Métricas Consolidadas do Usuário em Metas & Investimentos
  const totalGoalsWealth = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalInvestedInGoals = goals.reduce(
    (acc, g) => acc + (g.totalInvested !== undefined ? g.totalInvested : g.currentAmount || 0),
    0
  );
  const totalYieldsInGoals = goals.reduce((acc, g) => acc + (g.accumulatedYield || 0), 0);
  const totalMonthlyTarget = goals.reduce((acc, g) => acc + (g.monthlyContribution || 0), 0);
  const yieldPercentage =
    totalInvestedInGoals > 0
      ? ((totalYieldsInGoals / totalInvestedInGoals) * 100).toFixed(1)
      : '0.0';

  // Compound interest projection function
  const calculateCompoundProjection = (
    current: number,
    monthly: number,
    months: number,
    annualRate: number
  ) => {
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    let balance = current;
    let principal = current;
    const history = [];

    const interval = Math.max(1, Math.floor(months / 6));
    for (let m = 0; m <= months; m++) {
      if (m > 0) {
        balance = balance * (1 + monthlyRate) + monthly;
        principal += monthly;
      }
      if (m % interval === 0 || m === months) {
        history.push({
          month: m,
          total: Math.round(balance),
          invested: Math.round(principal),
          interest: Math.max(0, Math.round(balance - principal)),
        });
      }
    }
    return history;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTargetAmount);
    const current = parseFloat(newCurrentAmount) || 0;
    const months = parseInt(newMonths, 10);
    const rate = parseFloat(newReturnRate) || 10.5;

    if (newTitle.trim() && !isNaN(target) && target > 0 && !isNaN(months) && months > 0) {
      const r = Math.pow(1 + rate / 100, 1 / 12) - 1;
      const futureFromCurrent = current * Math.pow(1 + r, months);
      const remainingTarget = Math.max(0, target - futureFromCurrent);
      const factor = (Math.pow(1 + r, months) - 1) / r;
      const suggestedMonthly = remainingTarget > 0 ? Math.round(remainingTarget / factor) : 0;

      const categoryColors: Record<FinancialGoal['category'], string> = {
        imovel: '#3b82f6',
        veiculo: '#6366f1',
        viagem: '#06b6d4',
        reserva: '#10b981',
        liberdade: '#f59e0b',
        aposentadoria: '#8b5cf6',
        empresa: '#ec4899',
        personalizado: '#14b8a6',
      };

      onAddGoal({
        title: newTitle.trim(),
        category: newCategory,
        targetAmount: target,
        currentAmount: current,
        totalInvested: current,
        accumulatedYield: 0,
        monthlyContribution: suggestedMonthly,
        targetMonths: months,
        estimatedReturnRate: rate,
        investmentStrategy: 'Renda Fixa / Tesouro IPCA+',
        contributions: current > 0 ? [
          {
            id: `c-${Date.now()}`,
            amount: current,
            date: new Date().toLocaleDateString('pt-BR'),
            note: 'Saldo inicial cadastrado',
          }
        ] : [],
        icon: 'Target',
        color: categoryColors[newCategory] || '#10b981',
      });

      setNewTitle('');
      setNewTargetAmount('');
      setNewCurrentAmount('');
      setNewMonths('');
      setShowNewGoalModal(false);
    }
  };

  // Submeter Aporte Direto na Meta
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGoal) return;
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      if (onAddMoneyToGoal) {
        onAddMoneyToGoal(currentGoal.id, amount, depositNote.trim() || 'Aporte realizado');
      } else {
        // Fallback local se handler não fornecido
        const updatedCurrent = currentGoal.currentAmount + amount;
        const updatedInvested = (currentGoal.totalInvested || currentGoal.currentAmount) + amount;
        onUpdateGoal?.(currentGoal.id, {
          currentAmount: updatedCurrent,
          totalInvested: updatedInvested,
        });
      }
      setDepositAmount('');
      setDepositNote('');
      setShowAddMoneyModal(false);
    }
  };

  // Submeter Resgate da Meta
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGoal) return;
    const amount = parseFloat(withdrawAmount);
    if (!isNaN(amount) && amount > 0) {
      if (onWithdrawFromGoal) {
        onWithdrawFromGoal(currentGoal.id, amount);
      } else {
        const updatedCurrent = Math.max(0, currentGoal.currentAmount - amount);
        const updatedInvested = Math.max(0, (currentGoal.totalInvested || currentGoal.currentAmount) - amount);
        onUpdateGoal?.(currentGoal.id, {
          currentAmount: updatedCurrent,
          totalInvested: updatedInvested,
        });
      }
      setWithdrawAmount('');
      setShowWithdrawModal(false);
    }
  };

  // Abrir Modal de Edição com dados da meta atual
  const handleOpenEdit = () => {
    if (!currentGoal) return;
    setEditTitle(currentGoal.title);
    setEditTargetAmount(currentGoal.targetAmount.toString());
    setEditMonths(currentGoal.targetMonths.toString());
    setEditReturnRate((currentGoal.estimatedReturnRate || 10.5).toString());
    setEditMonthlyContribution(currentGoal.monthlyContribution.toString());
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGoal) return;
    const target = parseFloat(editTargetAmount);
    const months = parseInt(editMonths, 10);
    const rate = parseFloat(editReturnRate) || 10.5;
    const monthly = parseFloat(editMonthlyContribution) || 0;

    if (editTitle.trim() && !isNaN(target) && target > 0 && !isNaN(months) && months > 0) {
      onUpdateGoal?.(currentGoal.id, {
        title: editTitle.trim(),
        targetAmount: target,
        targetMonths: months,
        estimatedReturnRate: rate,
        monthlyContribution: monthly,
      });
      setShowEditModal(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Banner: Patrimônio em Metas & Investimentos */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Investimentos & Metas Integrados
              </span>
              <span className="text-xs text-slate-400">
                Cada meta é um veículo de investimento com rendimentos reais
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Metas & Patrimônio Investido
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Direcione aportes, acompanhe os rendimentos de juros compostos e conquiste seus objetivos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewGoalModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Nova Meta de Investimento</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs Consolidados no Topo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Patrimônio Total em Metas</span>
              <PiggyBank className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-100">
              R$ {totalGoalsWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              Acumulado em {goals.length} meta(s)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Aportado</span>
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-100">
              R$ {totalInvestedInGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Capital próprio direcionado
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Rendimentos Acumulados</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base sm:text-xl font-bold text-emerald-400">
              +R$ {totalYieldsInGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
              +{yieldPercentage}% de valorização
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Aporte Mensal Total</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-100">
              R$ {totalMonthlyTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Sua sobra mensal: R$ {availableMonthlyCash.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid de Metas Cadastradas */}
      {goals.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-100">Nenhum objetivo cadastrado ainda</h3>
            <p className="text-xs text-slate-400">
              Crie seu primeiro objetivo financeiro (ex: Imóvel, Reserva de Emergência, Aposentadoria) para começar a investir e acompanhar seus rendimentos.
            </p>
          </div>
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 inline-flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Meta</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal) => {
            const isSelected = currentGoal?.id === goal.id;
            const percentage = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
            const years = (goal.targetMonths / 12).toFixed(1).replace('.0', '');
            const goalYield = goal.accumulatedYield || 0;

            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                      <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        {goal.category}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {years} {years === '1' ? 'ano' : 'anos'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mb-1 line-clamp-1">
                    {goal.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Objetivo:</span>
                    <span className="font-semibold text-slate-200">
                      R$ {goal.targetAmount.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
                    <span>Patrimônio acumulado:</span>
                    <span className="font-bold text-emerald-400">
                      R$ {goal.currentAmount.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {goalYield > 0 && (
                    <div className="text-[11px] text-emerald-400/90 flex items-center justify-between mt-0.5">
                      <span>Rendimento:</span>
                      <span>+R$ {goalYield.toLocaleString('pt-BR')}</span>
                    </div>
                  )}

                  {/* Barra de Progresso */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Evolução</span>
                      <span className="font-bold text-emerald-400">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-slate-400">
                    Aporte: <strong className="text-slate-200">R$ {goal.monthlyContribution.toLocaleString('pt-BR')}/mês</strong>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGoalId(goal.id);
                      setShowAddMoneyModal(true);
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] border border-emerald-500/20"
                  >
                    + Aportar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Visão Aprofundada & Painel de Controle da Meta Selecionada */}
      {currentGoal && (
        <div className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 shadow-xl space-y-6">
          {/* Header da Meta Selecionada */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: currentGoal.color }}
                />
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                  {currentGoal.title}
                </h2>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {currentGoal.investmentStrategy || 'Renda Fixa'} ({currentGoal.estimatedReturnRate || 10.5}% a.a.)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Planejamento ativo para o prazo de {currentGoal.targetMonths} meses ({((currentGoal.targetMonths || 12) / 12).toFixed(1)} anos).
              </p>
            </div>

            {/* Ações da Meta: Aportar, Resgatar, Editar, Excluir */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAddMoneyModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Adicionar Dinheiro</span>
              </button>

              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                <span>Resgatar</span>
              </button>

              <button
                onClick={handleOpenEdit}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Editar parâmetros da meta"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir a meta "${currentGoal.title}"?`)) {
                    onDeleteGoal(currentGoal.id);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Excluir meta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Métricas Principais da Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Patrimônio Acumulado (Valor Atual)</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                R$ {currentGoal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-400">
                {((currentGoal.currentAmount / (currentGoal.targetAmount || 1)) * 100).toFixed(1)}% do objetivo
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Total Já Aportado (Investido)</span>
              <div className="text-xl font-bold text-slate-100 mt-1">
                R$ {(currentGoal.totalInvested !== undefined ? currentGoal.totalInvested : currentGoal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500">Seu capital investido</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Rendimento Acumulado (Juros)</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                +R$ {(currentGoal.accumulatedYield || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-400">
                Ganhos de juros compostos
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Falta para Atingir a Meta</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                R$ {Math.max(0, currentGoal.targetAmount - currentGoal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400">
                Objetivo final: R$ {currentGoal.targetAmount.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Gráfico / Projeção de Crescimento do Patrimônio com Juros Compostos */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Evolução do Patrimônio até o Objetivo
                </h3>
                <p className="text-xs text-slate-400">
                  Projeção mês a mês: Capital Aportado vs Rendimento de Juros Compostos a {currentGoal.estimatedReturnRate || 10.5}% ao ano.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Patrimônio Total
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Capital Aportado
                </span>
              </div>
            </div>

            {/* Slider de Aporte Mensal */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Simular ajuste no aporte mensal:</span>
                <span className="font-bold text-emerald-400">
                  R$ {currentGoal.monthlyContribution.toLocaleString('pt-BR')}/mês
                </span>
              </div>
              <input
                type="range"
                min="100"
                max={Math.max(10000, availableMonthlyCash + 3000)}
                step="100"
                value={currentGoal.monthlyContribution}
                onChange={(e) => onUpdateGoalContribution(currentGoal.id, parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Renderização da Projeção */}
            {(() => {
              const projectionData = calculateCompoundProjection(
                currentGoal.currentAmount,
                currentGoal.monthlyContribution,
                currentGoal.targetMonths,
                currentGoal.estimatedReturnRate || 10.5
              );
              const finalProjected = projectionData[projectionData.length - 1]?.total || 0;
              const willReach = finalProjected >= currentGoal.targetAmount;

              return (
                <div className="space-y-4">
                  {/* Tabela de Marcos da Projeção */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                    {projectionData.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center"
                      >
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">
                          {step.month === 0 ? 'Atual' : `${step.month}m (${(step.month / 12).toFixed(1)}a)`}
                        </div>
                        <div className="text-xs font-bold text-slate-100 mt-1">
                          R$ {(step.total / 1000).toFixed(0)}k
                        </div>
                        <div className="text-[10px] text-emerald-400/90 mt-0.5">
                          +{((step.interest / (step.invested || 1)) * 100).toFixed(0)}% juros
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${willReach ? 'text-emerald-400' : 'text-amber-400'}`}
                      />
                      <span className="text-slate-300">
                        Projeção final com juros compostos:{' '}
                        <strong className={willReach ? 'text-emerald-400' : 'text-amber-400'}>
                          R$ {finalProjected.toLocaleString('pt-BR')}
                        </strong>
                      </span>
                    </div>
                    <span className="text-slate-400">
                      {willReach
                        ? 'Meta perfeitamente atingível dentro do prazo estipulado!'
                        : 'Aumente o aporte para alcançar o objetivo exatamente no prazo.'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Histórico de Aportes Realizados */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Histórico de Aportes & Movimentações
              </h3>
              <span className="text-xs text-slate-400">
                {(currentGoal.contributions || []).length} registro(s)
              </span>
            </div>

            {(!currentGoal.contributions || currentGoal.contributions.length === 0) ? (
              <p className="text-xs text-slate-500 py-2">
                Nenhum aporte pontual registrado ainda. Clique em "Adicionar Dinheiro" para registrar seu primeiro aporte.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentGoal.contributions.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <span className="font-medium text-slate-200">{c.note || 'Aporte na meta'}</span>
                        <div className="text-[10px] text-slate-400">{c.date}</div>
                      </div>
                    </div>
                    <div className="font-bold text-emerald-400">
                      +R$ {c.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Adicionar Dinheiro / Aportar */}
      {showAddMoneyModal && currentGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleDepositSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Destinar Dinheiro para a Meta</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Meta: <strong className="text-slate-100">{currentGoal.title}</strong>
              <div className="text-slate-400 mt-0.5">
                Patrimônio atual: R$ {currentGoal.currentAmount.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Valor do Aporte (R$)
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Ex: 1000"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Descrição ou Origem (Opcional)
                </label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="Ex: Aporte do salário, Bônus semestral, Rendimento extra..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Confirmar Aporte
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Resgatar / Retirar Dinheiro */}
      {showWithdrawModal && currentGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleWithdrawSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-slate-100">Resgatar da Meta</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Meta: <strong className="text-slate-100">{currentGoal.title}</strong>
              <div className="text-slate-400 mt-0.5">
                Saldo disponível: R$ {currentGoal.currentAmount.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Valor a Retirar (R$)
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  min="1"
                  max={currentGoal.currentAmount}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Ex: 500"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Confirmar Resgate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Editar Parâmetros da Meta */}
      {showEditModal && currentGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleEditSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Editar Meta Financeira</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Título da Meta</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Valor Objetivo (R$)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={editTargetAmount}
                    onChange={(e) => setEditTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Prazo (Meses)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="600"
                    value={editMonths}
                    onChange={(e) => setEditMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Aporte Mensal (R$)</label>
                  <input
                    type="number"
                    step="50"
                    value={editMonthlyContribution}
                    onChange={(e) => setEditMonthlyContribution(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Taxa Estimada (% a.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editReturnRate}
                    onChange={(e) => setEditReturnRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Criar Nova Meta */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateGoal}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Criar Novo Objetivo de Investimento</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewGoalModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Qual é o seu objetivo?</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Comprar Apartamento em 5 anos, Liberdade Financeira..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoria do Objetivo</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="imovel">Imóvel / Apartamento</option>
                    <option value="veiculo">Carro / Veículo</option>
                    <option value="reserva">Reserva de Emergência</option>
                    <option value="viagem">Viagem / Intercâmbio</option>
                    <option value="liberdade">Liberdade Financeira (FIRE)</option>
                    <option value="aposentadoria">Aposentadoria</option>
                    <option value="empresa">Comprar Empresa</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Prazo Desejado (Meses)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="600"
                    value={newMonths}
                    onChange={(e) => setNewMonths(e.target.value)}
                    placeholder="Ex: 60 (5 anos)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quanto Precisa? (R$)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    placeholder="Ex: 300000"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Já possui algum valor? (R$)</label>
                  <input
                    type="number"
                    step="100"
                    value={newCurrentAmount}
                    onChange={(e) => setNewCurrentAmount(e.target.value)}
                    placeholder="Ex: 50000 (ou 0)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Taxa de Retorno Anual Esperada (% a.a.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newReturnRate}
                  onChange={(e) => setNewReturnRate(e.target.value)}
                  placeholder="Ex: 10.5 (Tesouro Selic / IPCA+)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewGoalModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Calcular & Salvar Meta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
