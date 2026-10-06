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
} from 'lucide-react';
import { FinancialGoal } from '../types';

interface GoalsPlanningViewProps {
  goals: FinancialGoal[];
  availableMonthlyCash: number;
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalContribution: (id: string, newContribution: number) => void;
}

export const GoalsPlanningView: React.FC<GoalsPlanningViewProps> = ({
  goals,
  availableMonthlyCash,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoalContribution,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);

  // Form states for new goal
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<FinancialGoal['category']>('imovel');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newCurrentAmount, setNewCurrentAmount] = useState('');
  const [newMonths, setNewMonths] = useState('');
  const [newReturnRate, setNewReturnRate] = useState('10.5');

  // Currently selected goal for deep projection
  const currentGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];

  // Compound interest calculation function
  const calculateCompoundProjection = (
    current: number,
    monthly: number,
    months: number,
    annualRate: number
  ) => {
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    let balance = current;
    const history = [];

    // Sample at 6 intervals
    const interval = Math.max(1, Math.floor(months / 6));
    for (let m = 0; m <= months; m++) {
      if (m > 0) {
        balance = balance * (1 + monthlyRate) + monthly;
      }
      if (m % interval === 0 || m === months) {
        history.push({ month: m, amount: Math.round(balance) });
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
      // Calculate suggested monthly contribution: PMT approximation
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
        monthlyContribution: suggestedMonthly,
        targetMonths: months,
        estimatedReturnRate: rate,
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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Planejamento Estratégico
            </span>
            <span className="text-xs text-slate-400">
              Projeções baseadas em juros compostos reais
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            Metas Financeiras & Objetivos de Vida
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Defina seus sonhos e deixe o TVG Wealth Engine traçar o caminho exato para alcançá-los.
          </p>
        </div>

        <button
          onClick={() => setShowNewGoalModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Criar Novo Objetivo</span>
        </button>
      </div>

      {/* Goals Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((goal) => {
          const isSelected = currentGoal?.id === goal.id;
          const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const years = (goal.targetMonths / 12).toFixed(1).replace('.0', '');

          return (
            <div
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {years} {years === '1' ? 'ano' : 'anos'} ({goal.targetMonths}m)
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-100 mb-1 line-clamp-1">
                  {goal.title}
                </h3>
                <div className="text-xs text-slate-400">
                  Meta: R$ {goal.targetAmount.toLocaleString('pt-BR')}
                </div>

                {/* Progress Visual */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Progresso</span>
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
                <span className="text-slate-400">Aporte mensal:</span>
                <span className="font-semibold text-slate-200">
                  R$ {goal.monthlyContribution.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive Simulation & Strategy for the Selected Goal */}
      {currentGoal && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentGoal.color }}
                />
                <h2 className="text-lg font-bold text-slate-100">
                  Planejamento Detalhado: {currentGoal.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Estratégia personalizada calculada para o prazo de {currentGoal.targetMonths} meses com taxa estimada de {currentGoal.estimatedReturnRate}% a.a.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDeleteGoal(currentGoal.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Excluir meta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Dimension Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Valor Já Acumulado</span>
              <div className="text-lg font-bold text-slate-100 mt-1">
                R$ {currentGoal.currentAmount.toLocaleString('pt-BR')}
              </div>
              <span className="text-[11px] text-emerald-400">
                {((currentGoal.currentAmount / currentGoal.targetAmount) * 100).toFixed(1)}% do total
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Quanto Falta Acumular</span>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                R$ {(currentGoal.targetAmount - currentGoal.currentAmount).toLocaleString('pt-BR')}
              </div>
              <span className="text-[11px] text-slate-500">Distância até o sonho</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Aporte Mensal Recomendado</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                R$ {currentGoal.monthlyContribution.toLocaleString('pt-BR')}
              </div>
              <span className="text-[11px] text-slate-400">
                Sua folga atual: R$ {availableMonthlyCash.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Prazo Estimado</span>
              <div className="text-lg font-bold text-amber-400 mt-1">
                {(currentGoal.targetMonths / 12).toFixed(1)} Anos
              </div>
              <span className="text-[11px] text-slate-400">
                {currentGoal.targetMonths} meses restantes
              </span>
            </div>
          </div>

          {/* Interactive Simulation / What If adjustment */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Simular Ajuste no Aporte Mensal
                </h3>
                <p className="text-xs text-slate-400">
                  Veja como aumentar seu aporte reduz meses na sua jornada
                </p>
              </div>
              <div className="text-sm font-bold text-emerald-400">
                R$ {currentGoal.monthlyContribution.toLocaleString('pt-BR')}/mês
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="200"
              max={Math.max(6000, availableMonthlyCash + 2000)}
              step="100"
              value={currentGoal.monthlyContribution}
              onChange={(e) => onUpdateGoalContribution(currentGoal.id, parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Projeção calculada */}
            {(() => {
              const projectionData = calculateCompoundProjection(
                currentGoal.currentAmount,
                currentGoal.monthlyContribution,
                currentGoal.targetMonths,
                currentGoal.estimatedReturnRate
              );
              const finalProjected = projectionData[projectionData.length - 1]?.amount || 0;
              const willReach = finalProjected >= currentGoal.targetAmount;

              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${willReach ? 'text-emerald-400' : 'text-amber-400'}`}
                    />
                    <span className="text-slate-300">
                      Projeção final acumulada com juros:{' '}
                      <strong className={willReach ? 'text-emerald-400' : 'text-amber-400'}>
                        R$ {finalProjected.toLocaleString('pt-BR')}
                      </strong>
                    </span>
                  </div>
                  <span className="text-slate-400">
                    {willReach
                      ? 'Parabéns! Sua meta será alcançada no prazo.'
                      : 'Aumente o aporte para garantir o valor exato no prazo estipulado.'}
                  </span>
                </div>
              );
            })()}
          </div>
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
                <h3 className="font-bold text-slate-100">Criar Novo Objetivo Financeiro</h3>
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
                    placeholder="Ex: 20000 (ou 0)"
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
