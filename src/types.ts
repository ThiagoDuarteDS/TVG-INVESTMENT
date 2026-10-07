export interface BankAccount {
  id: string;
  name: string;
  code: string;
  logo: string;
  accountType: 'corrente' | 'investimento' | 'poupanca';
  balance: number;
  creditLimit?: number;
  creditUsed?: number;
  investmentsTotal?: number;
  lastSync: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  color: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'mensal' | 'variavel';
  category: 'salario' | 'extra' | 'dividendos' | 'beneficios' | 'outros';
}

export interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  budgetLimit: number;
  category: 
    | 'moradia'
    | 'financiamento'
    | 'energia'
    | 'agua'
    | 'internet_telefone'
    | 'alimentacao'
    | 'transporte'
    | 'lazer'
    | 'assinaturas'
    | 'cartao'
    | 'saude'
    | 'outras';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  bankName: string;
  status: 'confirmado' | 'pendente';
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: 'imovel' | 'veiculo' | 'viagem' | 'reserva' | 'liberdade' | 'aposentadoria' | 'empresa' | 'personalizado';
  targetAmount: number;
  currentAmount: number; // Patrimônio total acumulado nesta meta (Aportes + Rendimentos)
  totalInvested: number; // Total aportado
  accumulatedYield: number; // Rendimentos acumulados
  monthlyContribution: number;
  targetMonths: number;
  initialAmount?: number;
  investmentStrategy?: string;
  estimatedReturnRate: number; // % annual
  contributions: GoalContribution[];
  createdAt: string;
  icon: string;
  color: string;
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  level: 'Excelente' | 'Bom' | 'Moderado' | 'Atenção' | 'Crítico';
  savingsRate: number; // %
  fixedCommitmentRate: number; // %
  emergencyReserveMonths: number;
  investmentPace: 'Acelerado' | 'Estável' | 'Lento' | 'Estagnado';
  insights: string[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  metricsHighlight?: {
    label: string;
    value: string;
  }[];
}

export interface SmartNotification {
  id: string;
  type: 'alert' | 'opportunity' | 'achievement' | 'tip';
  title: string;
  description: string;
  date: string;
  read: boolean;
  actionText?: string;
}
