import React, { useState } from 'react';
import { BankLogo } from './BankLogo';
import { TVGLogo } from './TVGLogo';
import {
  X,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  User,
  Target,
} from 'lucide-react';
import { BankAccount, ExpenseCategory, IncomeCategory } from '../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  banks: BankAccount[];
  expenses: ExpenseCategory[];
  onAddTransaction: (tx: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    bankName: string;
    date: string;
  }) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  banks,
  expenses,
  onAddTransaction,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(expenses[0]?.name || 'Alimentação');
  const [bankName, setBankName] = useState(banks[0]?.name || 'Nubank');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (description.trim() && !isNaN(parsedAmount) && parsedAmount > 0) {
      onAddTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        bankName,
        date,
      });
      setDescription('');
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm">Registrar Nova Movimentação</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Saída (Despesa)</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Entrada (Receita)</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado Semanal, Freelance de Design..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 245.50"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {type === 'income' ? (
                  <>
                    <option value="Salário">Salário</option>
                    <option value="Renda Extra">Renda Extra</option>
                    <option value="Dividendos">Dividendos & FIIs</option>
                    <option value="Benefícios">Benefícios</option>
                    <option value="Outros">Outros</option>
                  </>
                ) : (
                  expenses.map((exp) => (
                    <option key={exp.id} value={exp.name}>
                      {exp.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Banco / Conta</label>
              <div className="flex items-center gap-2">
                <BankLogo bankName={bankName} size="sm" />
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Salvar Movimentação
          </button>
        </div>
      </form>
    </div>
  );
};

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profileData: {
    name: string;
    monthlyIncome: number;
    primaryGoal: string;
  }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('8500');
  const [primaryGoal, setPrimaryGoal] = useState('imovel');

  if (!isOpen) return null;

  const goalOptions = [
    { id: 'controle', title: 'Apenas Controle Financeiro', desc: 'Organizar entradas, saídas e cartões' },
    { id: 'reserva', title: 'Criar Reserva de Emergência', desc: 'Acumular 6 meses de segurança' },
    { id: 'imovel', title: 'Comprar Imóvel / Apartamento', desc: 'Planejamento de médio prazo' },
    { id: 'liberdade', title: 'Liberdade Financeira (FIRE)', desc: 'Multiplicação com juros compostos' },
  ];

  const handleFinish = () => {
    onComplete({
      name: name.trim() || 'Usuário',
      monthlyIncome: parseFloat(income) || 8500,
      primaryGoal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <TVGLogo size="sm" />
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">Bem-vindo à TVG Wealth Engine</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Para calibrarmos seu Copiloto Financeiro, conte-nos um pouco sobre você:
            </p>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Como devemos te chamar?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Thiago G."
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Renda Mensal Estimada (R$)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Ex: 8500"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Próximo Passo →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Qual é o seu objetivo prioritário no momento?
            </p>

            <div className="space-y-2">
              {goalOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setPrimaryGoal(opt.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    primaryGoal === opt.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-100">{opt.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Ativar Minha Plataforma 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
