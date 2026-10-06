import React, { useState } from 'react';
import {
  Calculator,
  Sliders,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Target,
  Zap,
} from 'lucide-react';
import { FinancialGoal } from '../types';

interface ScenarioSimulatorViewProps {
  currentIncome: number;
  currentExpenses: number;
  goals: FinancialGoal[];
  onApplyScenario?: (additionalSavings: number) => void;
}

export const ScenarioSimulatorView: React.FC<ScenarioSimulatorViewProps> = ({
  currentIncome,
  currentExpenses,
  goals,
  onApplyScenario,
}) => {
  // Simulator sliders
  const [incomeBonusPercent, setIncomeBonusPercent] = useState<number>(0); // 0 to 50%
  const [expenseCutFood, setExpenseCutFood] = useState<number>(0); // R$ 0 to 500
  const [expenseCutSubscriptions, setExpenseCutSubscriptions] = useState<number>(0); // R$ 0 to 140
  const [extraMonthlyInvestment, setExtraMonthlyInvestment] = useState<number>(300); // R$ 0 to 3000

  // Calculations
  const simulatedNewIncome = currentIncome * (1 + incomeBonusPercent / 100);
  const simulatedExpenseCutTotal = expenseCutFood + expenseCutSubscriptions;
  const simulatedNewExpenses = Math.max(0, currentExpenses - simulatedExpenseCutTotal);
  const simulatedNewAvailable = simulatedNewIncome - simulatedNewExpenses;
  const extraGainPerMonth = simulatedNewAvailable - (currentIncome - currentExpenses);

  // 5 and 10 year compound wealth gain (assuming conservative 10% annual return)
  const calculateCompoundGain = (monthly: number, years: number) => {
    const r = Math.pow(1 + 0.10, 1 / 12) - 1;
    const months = years * 12;
    return Math.round(monthly * ((Math.pow(1 + r, months) - 1) / r));
  };

  const gain5Years = calculateCompoundGain(extraGainPerMonth + extraMonthlyInvestment, 5);
  const gain10Years = calculateCompoundGain(extraGainPerMonth + extraMonthlyInvestment, 10);

  const handleReset = () => {
    setIncomeBonusPercent(0);
    setExpenseCutFood(0);
    setExpenseCutSubscriptions(0);
    setExtraMonthlyInvestment(300);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Simulador Preditivo
            </span>
            <span className="text-xs text-slate-400">Modelagem Matemática em Tempo Real</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            Simulador de Cenários & Impacto Futuro
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Descubra o efeito multiplicador de pequenos ajustes no seu orçamento diário ao longo do tempo.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Redefinir Variáveis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base text-slate-100">Variáveis do Orçamento</h2>
          </div>

          {/* Slider 1: Aumento de Renda / Promoção */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">
                Aumento salarial ou novas fontes de renda
              </span>
              <span className="font-bold text-emerald-400">+{incomeBonusPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={incomeBonusPercent}
              onChange={(e) => setIncomeBonusPercent(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0% (atual)</span>
              <span>+25%</span>
              <span>+50% (+R$ {(currentIncome * 0.5).toLocaleString('pt-BR')})</span>
            </div>
          </div>

          {/* Slider 2: Otimização de Alimentação e Lazer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">
                Redução em delivery, restaurantes e compras supérfluas
              </span>
              <span className="font-bold text-cyan-400">-R$ {expenseCutFood}/mês</span>
            </div>
            <input
              type="range"
              min="0"
              max="600"
              step="50"
              value={expenseCutFood}
              onChange={(e) => setExpenseCutFood(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>R$ 0</span>
              <span>-R$ 300</span>
              <span>-R$ 600</span>
            </div>
          </div>

          {/* Slider 3: Cancelamento de Assinaturas Inúteis */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">
                Corte em assinaturas e streamings não utilizados
              </span>
              <span className="font-bold text-amber-400">-R$ {expenseCutSubscriptions}/mês</span>
            </div>
            <input
              type="range"
              min="0"
              max="140"
              step="20"
              value={expenseCutSubscriptions}
              onChange={(e) => setExpenseCutSubscriptions(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>R$ 0</span>
              <span>-R$ 70</span>
              <span>-R$ 140</span>
            </div>
          </div>

          {/* Slider 4: Aporte Direto Adicional */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">
                Aporte mensal adicional em investimentos
              </span>
              <span className="font-bold text-emerald-400">+R$ {extraMonthlyInvestment}/mês</span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={extraMonthlyInvestment}
              onChange={(e) => setExtraMonthlyInvestment(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>R$ 0</span>
              <span>+R$ 1.500</span>
              <span>+R$ 3.000</span>
            </div>
          </div>
        </div>

        {/* Results / Multiplier Impact Column */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-base text-slate-100">Resultado do Cenário Projetado</h2>
            </div>

            {/* Impact Metric Blocks */}
            <div className="grid grid-cols-2 gap-3.5 my-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400">Nova Sobra Mensal Livre</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  R$ {simulatedNewAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-emerald-500/80">
                  +{extraGainPerMonth > 0 ? `R$ ${extraGainPerMonth.toLocaleString('pt-BR')}` : 'R$ 0'}/mês a mais
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400">Nova Taxa de Poupança</span>
                <div className="text-xl font-bold text-cyan-400 mt-1">
                  {((simulatedNewAvailable / simulatedNewIncome) * 100).toFixed(1)}%
                </div>
                <span className="text-[11px] text-cyan-500/80">
                  Subiu de {(( (currentIncome - currentExpenses) / currentIncome ) * 100).toFixed(0)}% para o novo patamar
                </span>
              </div>
            </div>

            {/* Compound Gain Highlights */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/20 space-y-3">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Patrimônio Adicional Criado por este Cenário
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Em 5 Anos (a 10% a.a.):</span>
                  <div className="text-lg font-extrabold text-slate-100 mt-0.5">
                    +R$ {gain5Years.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Em 10 Anos (com juros compostos):</span>
                  <div className="text-lg font-extrabold text-emerald-400 mt-0.5">
                    +R$ {gain10Years.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
                O poder dos juros compostos transforma uma economia mensal modesta de R$ {(extraGainPerMonth + extraMonthlyInvestment).toLocaleString('pt-BR')} em uma verdadeira fortuna de mais de R$ {gain10Years.toLocaleString('pt-BR')} em 10 anos.
              </p>
            </div>

            {/* Impact on registered Goals */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-300">
                Antecipação estimada nas suas metas:
              </span>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span>Apartamento Próprio</span>
                  <span className="font-semibold text-emerald-400">Antecipa em até 8 meses</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span>Reserva de Emergência</span>
                  <span className="font-semibold text-cyan-400">Conclusão em 45 dias</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Simulação segura sem alteração automática</span>
            <button
              onClick={() => {
                if (onApplyScenario) {
                  onApplyScenario(extraGainPerMonth);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Aplicar Ajustes ao Orçamento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
