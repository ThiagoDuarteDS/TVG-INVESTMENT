import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  Check,
  TrendingUp,
  TrendingDown,
  Wallet,
  Home,
  Car,
  Zap,
  Droplets,
  Wifi,
  Phone,
  ShoppingCart,
  Navigation,
  UtensilsCrossed,
  Tv,
  CreditCard,
  Activity,
  MoreHorizontal,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { IncomeCategory, ExpenseCategory } from '../types';

interface IncomeExpensesViewProps {
  incomes: IncomeCategory[];
  expenses: ExpenseCategory[];
  onUpdateIncome: (id: string, newAmount: number, newName?: string) => void;
  onAddIncome: (name: string, amount: number, category: IncomeCategory['category']) => void;
  onDeleteIncome: (id: string) => void;
  onUpdateExpense: (id: string, newAmount: number, newBudgetLimit?: number) => void;
  onAddExpense: (name: string, amount: number, budgetLimit: number, category: ExpenseCategory['category']) => void;
  onDeleteExpense: (id: string) => void;
}

export const IncomeExpensesView: React.FC<IncomeExpensesViewProps> = ({
  incomes,
  expenses,
  onUpdateIncome,
  onAddIncome,
  onDeleteIncome,
  onUpdateExpense,
  onAddExpense,
  onDeleteExpense,
}) => {
  // Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editAmountValue, setEditAmountValue] = useState<string>('');

  // New Income modal/form state
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [newIncName, setNewIncName] = useState('');
  const [newIncAmount, setNewIncAmount] = useState('');
  const [newIncCategory, setNewIncCategory] = useState<IncomeCategory['category']>('salario');

  // New Expense modal/form state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpName, setNewExpName] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpLimit, setNewExpLimit] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<ExpenseCategory['category']>('outras');

  // Calculations
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const availableCash = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((availableCash / totalIncome) * 100).toFixed(1) : '0';

  const handleStartEdit = (id: string, currentAmount: number) => {
    setEditingItemId(id);
    setEditAmountValue(currentAmount.toString());
  };

  const handleSaveIncomeEdit = (id: string) => {
    const val = parseFloat(editAmountValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateIncome(id, val);
    }
    setEditingItemId(null);
  };

  const handleSaveExpenseEdit = (id: string) => {
    const val = parseFloat(editAmountValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateExpense(id, val);
    }
    setEditingItemId(null);
  };

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newIncAmount);
    if (newIncName.trim() && !isNaN(amt) && amt > 0) {
      onAddIncome(newIncName.trim(), amt, newIncCategory);
      setNewIncName('');
      setNewIncAmount('');
      setShowAddIncome(false);
    }
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExpAmount);
    const limit = parseFloat(newExpLimit) || amt * 1.1;
    if (newExpName.trim() && !isNaN(amt) && amt > 0) {
      onAddExpense(newExpName.trim(), amt, limit, newExpCategory);
      setNewExpName('');
      setNewExpAmount('');
      setNewExpLimit('');
      setShowAddExpense(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Automatic Calculation Overview Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Cadastro da Situação Financeira
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Informe ou ajuste suas receitas e despesas. A TVG INVESTMENT calcula automaticamente seu saldo e capacidade de economia.
            </p>
          </div>
        </div>

        {/* Dynamic Calculation Strip */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Total de Receitas</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">{incomes.length} fontes cadastradas</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Total de Despesas</span>
            <div className="text-xl font-bold text-rose-400 mt-1">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">{expenses.length} categorias orçadas</span>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-950 border border-emerald-500/20">
            <span className="text-xs text-emerald-400 font-medium">Sobra Mensal Disponível</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              R$ {availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-500/80">Livre para metas e investimentos</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Taxa de Poupança</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {savingsRate}%
            </div>
            <span className="text-[11px] text-cyan-500/80">Excelente (Recomendado &gt; 20%)</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Incomes vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas (Incomes) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-base text-slate-100">Receitas Mensais</h2>
              </div>
              <button
                onClick={() => setShowAddIncome(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Receita</span>
              </button>
            </div>

            {/* Income items list */}
            <div className="space-y-3">
              {incomes.map((inc) => {
                const isEditing = editingItemId === inc.id;
                return (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-200">{inc.name}</h4>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {inc.category} • Frequência {inc.frequency}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editAmountValue}
                            onChange={(e) => setEditAmountValue(e.target.value)}
                            className="w-24 px-2 py-1 rounded bg-slate-800 border border-emerald-500 text-slate-100 text-xs focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveIncomeEdit(inc.id)}
                            className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="font-bold text-sm text-emerald-400">
                            R$ {inc.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-slate-500">
                        <button
                          onClick={() => handleStartEdit(inc.id, inc.amount)}
                          className="p-1.5 hover:text-slate-200 transition-colors"
                          title="Editar valor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {incomes.length > 1 && (
                          <button
                            onClick={() => onDeleteIncome(inc.id)}
                            className="p-1.5 hover:text-rose-400 transition-colors"
                            title="Remover receita"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Soma de Todas as Entradas</span>
            <span className="font-bold text-emerald-400">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Despesas (Expenses) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <h2 className="font-bold text-base text-slate-100">Despesas Orçadas</h2>
              </div>
              <button
                onClick={() => setShowAddExpense(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Despesa</span>
              </button>
            </div>

            {/* Expense items list */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {expenses.map((exp) => {
                const isEditing = editingItemId === exp.id;
                const percentBudget = exp.budgetLimit > 0 ? (exp.amount / exp.budgetLimit) * 100 : 100;
                const isOver = percentBudget > 100;

                return (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: exp.color }}
                        />
                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-200">
                            {exp.name}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Teto Orçado: R$ {exp.budgetLimit.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editAmountValue}
                              onChange={(e) => setEditAmountValue(e.target.value)}
                              className="w-24 px-2 py-1 rounded bg-slate-800 border border-rose-500 text-slate-100 text-xs focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveExpenseEdit(exp.id)}
                              className="p-1 rounded bg-rose-500 text-slate-950 hover:bg-rose-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="font-bold text-sm text-slate-100">
                              R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-slate-500">
                          <button
                            onClick={() => handleStartEdit(exp.id, exp.amount)}
                            className="p-1.5 hover:text-slate-200 transition-colors"
                            title="Editar valor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {expenses.length > 1 && (
                            <button
                              onClick={() => onDeleteExpense(exp.id)}
                              className="p-1.5 hover:text-rose-400 transition-colors"
                              title="Remover despesa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar vs limit */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percentBudget)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Soma de Todas as Saídas</span>
            <span className="font-bold text-rose-400">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Adicionar Receita */}
      {showAddIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateIncome}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100">Adicionar Nova Receita</h3>
              <button
                type="button"
                onClick={() => setShowAddIncome(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={newIncName}
                  onChange={(e) => setNewIncName(e.target.value)}
                  placeholder="Ex: Salário 13º, Freelance de Design"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newIncAmount}
                  onChange={(e) => setNewIncAmount(e.target.value)}
                  placeholder="Ex: 2500"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Categoria</label>
                <select
                  value={newIncCategory}
                  onChange={(e) => setNewIncCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="salario">Salário Fixo</option>
                  <option value="extra">Renda Extra / Freelance</option>
                  <option value="dividendos">Dividendos & Investimentos</option>
                  <option value="beneficios">Benefícios (VR/VA)</option>
                  <option value="outros">Outros Recebimentos</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddIncome(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Salvar Receita
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Adicionar Despesa */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateExpense}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100">Adicionar Nova Despesa</h3>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome da Despesa</label>
                <input
                  type="text"
                  required
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  placeholder="Ex: Seguro Residencial, Academia"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Valor Atual (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(e.target.value)}
                  placeholder="Ex: 180"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Teto Máximo Desejado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpLimit}
                  onChange={(e) => setNewExpLimit(e.target.value)}
                  placeholder="Ex: 200 (opcional)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Categoria</label>
                <select
                  value={newExpCategory}
                  onChange={(e) => setNewExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="moradia">Moradia</option>
                  <option value="financiamento">Financiamento</option>
                  <option value="alimentacao">Alimentação</option>
                  <option value="transporte">Transporte</option>
                  <option value="lazer">Lazer & Restaurantes</option>
                  <option value="assinaturas">Assinaturas</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="saude">Saúde</option>
                  <option value="energia">Energia</option>
                  <option value="outras">Outras Despesas</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
              >
                Salvar Despesa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
