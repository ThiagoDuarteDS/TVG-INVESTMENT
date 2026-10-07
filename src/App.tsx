import React, { useState, useEffect } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { LoginView } from './components/LoginView';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { BankConnectionsView } from './components/BankConnectionsView';
import { IncomeExpensesView } from './components/IncomeExpensesView';
import { GoalsPlanningView } from './components/GoalsPlanningView';
import { AICopilotView } from './components/AICopilotView';
import { ScenarioSimulatorView } from './components/ScenarioSimulatorView';
import { NewTransactionModal, OnboardingModal } from './components/GlobalModals';
import { authService, UserProfile } from './services/authService';

import {
  BankAccount,
  IncomeCategory,
  ExpenseCategory,
  Transaction,
  FinancialGoal,
  GoalContribution,
  FinancialHealthScore,
  SmartNotification,
} from './types';

export default function App() {
  // Navigation State - Login é a tela inicial mandatória
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isInitializingAuth, setIsInitializingAuth] = useState<boolean>(true);

  // Estados Financeiros Isolados por Usuário
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [incomes, setIncomes] = useState<IncomeCategory[]>([]);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  // Modal Visibility States
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Inicialização da Sessão do Usuário
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await authService.getMe();
        if (session && session.user) {
          setUserProfile(session.user);
          if (session.data) {
            setBanks(session.data.banks || []);
            setIncomes(session.data.incomes || []);
            setExpenses(session.data.expenses || []);
            setGoals(session.data.goals || []);
            setTransactions(session.data.transactions || []);
            setNotifications(session.data.notifications || []);
          }
          setCurrentTab('dashboard');
        } else {
          setUserProfile(null);
          setCurrentTab('login');
        }
      } catch (err) {
        console.warn('Erro ao restaurar sessão:', err);
        setUserProfile(null);
        setCurrentTab('login');
      } finally {
        setIsInitializingAuth(false);
      }
    }
    checkSession();
  }, []);

  // Sincronização automática para o banco de dados individual do usuário autenticado
  useEffect(() => {
    if (!userProfile || isInitializingAuth) return;
    authService.syncUserData(userProfile.id, {
      banks,
      incomes,
      expenses,
      goals,
      transactions,
      notifications,
    });
  }, [userProfile, banks, incomes, expenses, goals, transactions, notifications, isInitializingAuth]);

  // Handler de Login com Sucesso
  const handleLoginSuccess = (profile: UserProfile, data?: any) => {
    setUserProfile(profile);
    setBanks(data?.banks || []);
    setIncomes(data?.incomes || []);
    setExpenses(data?.expenses || []);
    setGoals(data?.goals || []);
    setTransactions(data?.transactions || []);
    setNotifications(data?.notifications || []);
    setCurrentTab('dashboard');
  };

  // Handler de Cadastro com Sucesso (Inicialização limpa e individual)
  const handleRegisterSuccess = (profile: UserProfile, data?: any) => {
    setUserProfile(profile);
    setBanks(data?.banks || []);
    setIncomes(data?.incomes || []);
    setExpenses(data?.expenses || []);
    setGoals(data?.goals || []);
    setTransactions(data?.transactions || []);
    setNotifications(
      data?.notifications || [
        {
          id: `notif-${Date.now()}`,
          type: 'achievement',
          title: 'Bem-vindo à TVG INVESTMENT!',
          description: 'Sua conta foi criada com segurança. Conecte sua primeira conta ou informe seus dados para começar.',
          date: 'Agora',
          read: false,
        },
      ]
    );
    setCurrentTab('dashboard');
  };

  // Handler de Logout Seguro (Limpeza total e retorno ao Login sem dados pré-preenchidos)
  const handleLogout = async () => {
    await authService.logout();
    setUserProfile(null);
    setBanks([]);
    setIncomes([]);
    setExpenses([]);
    setGoals([]);
    setTransactions([]);
    setNotifications([]);
    setCurrentTab('login');
  };

  // Cálculos Agregados Dinâmicos do Usuário Conectado
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const availableCash = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (availableCash / totalIncome) * 100 : 0;

  const totalBankBalances = banks.reduce((acc, curr) => acc + curr.balance, 0);
  const totalGoalsAmount = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalInvestments = totalGoalsAmount + banks.reduce((acc, curr) => acc + (curr.investmentsTotal || 0), 0);
  const totalWealth = totalBankBalances + totalInvestments;

  // Cálculo Dinâmico de Saúde Financeira
  const calculateHealthScore = (): FinancialHealthScore => {
    if (incomes.length === 0 && expenses.length === 0 && banks.length === 0) {
      return {
        score: 50,
        level: 'Moderado',
        savingsRate: 0,
        fixedCommitmentRate: 0,
        emergencyReserveMonths: 0,
        investmentPace: 'Estável',
        insights: [
          'Cadastre suas primeiras receitas e despesas para gerar o diagnóstico.',
          'Conecte suas contas via Open Finance para automação.',
        ],
      };
    }

    let score = 50;
    if (savingsRate >= 30) score += 25;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;
    else if (totalIncome > 0) score -= 10;

    const reserveGoal = goals.find((g) => g.category === 'reserva');
    const reserveMonths = totalExpenses > 0 ? (reserveGoal?.currentAmount || 0) / totalExpenses : 0;
    if (reserveMonths >= 6) score += 25;
    else if (reserveMonths >= 3) score += 15;
    else score += 5;

    score = Math.min(100, Math.max(20, Math.round(score)));

    let level: FinancialHealthScore['level'] = 'Moderado';
    if (score >= 85) level = 'Excelente';
    else if (score >= 70) level = 'Bom';
    else if (score >= 50) level = 'Moderado';
    else if (score >= 35) level = 'Atenção';
    else level = 'Crítico';

    return {
      score,
      level,
      savingsRate: parseFloat(savingsRate.toFixed(1)),
      fixedCommitmentRate: totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0,
      emergencyReserveMonths: parseFloat(reserveMonths.toFixed(1)),
      investmentPace: totalInvestments > 0 ? 'Acelerado' : 'Estável',
      insights: [
        `Taxa de poupança atual: ${savingsRate.toFixed(1)}%`,
        reserveMonths >= 3 ? 'Reserva de emergência em patamar seguro' : 'Priorize a formação da reserva de emergência',
        `${banks.length} instituições financeiras conectadas`,
      ],
    };
  };

  const healthScore = calculateHealthScore();

  // Handlers de Ações Financeiras
  const handleAddTransaction = (newTxData: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    bankName: string;
    date: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      ...newTxData,
      status: 'confirmado',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Atualiza saldo do banco respectivo
    setBanks((prev) =>
      prev.map((b) => {
        if (b.name === newTxData.bankName) {
          const delta = newTxData.type === 'income' ? newTxData.amount : -newTxData.amount;
          return { ...b, balance: Math.max(0, b.balance + delta), lastSync: 'Agora mesmo' };
        }
        return b;
      })
    );
  };

  const handleConnectNewBank = (bankName: string) => {
    const newBank: BankAccount = {
      id: `bank-${Date.now()}`,
      name: bankName,
      code: 'OPEN',
      logo: '🏛️',
      accountType: 'corrente',
      balance: 1000.0,
      lastSync: 'Conectado agora',
      status: 'connected',
      color: '#10b981',
    };
    setBanks((prev) => [...prev, newBank]);

    const notif: SmartNotification = {
      id: `notif-${Date.now()}`,
      type: 'achievement',
      title: `${bankName} conectado com sucesso`,
      description: 'Saldos sincronizados com segurança via Open Finance Brasil.',
      date: 'Agora',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleDisconnectBank = (bankId: string) => {
    setBanks((prev) => prev.filter((b) => b.id !== bankId));
  };

  const handleSyncBank = (bankId: string) => {
    setBanks((prev) =>
      prev.map((b) => (b.id === bankId ? { ...b, lastSync: 'Sincronizado agora' } : b))
    );
  };

  const handleSyncAll = () => {
    setBanks((prev) =>
      prev.map((b) => ({
        ...b,
        lastSync: 'Sincronizado agora',
      }))
    );
  };

  const handleAddGoal = (newGoalData: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoal: FinancialGoal = {
      id: `goal-${Date.now()}`,
      ...newGoalData,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdateGoalContribution = (id: string, newContribution: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, monthlyContribution: newContribution } : g))
    );
  };

  const handleAddMoneyToGoal = (goalId: string, amount: number, note?: string) => {
    if (amount <= 0) return;
    const today = new Date().toLocaleDateString('pt-BR');
    const newContrib: GoalContribution = {
      id: `contrib-${Date.now()}`,
      amount,
      date: today,
      note: note || 'Aporte realizado',
    };

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newInvested = (g.totalInvested !== undefined ? g.totalInvested : g.currentAmount || 0) + amount;
          const newCurrent = (g.currentAmount || 0) + amount;
          return {
            ...g,
            currentAmount: newCurrent,
            totalInvested: newInvested,
            contributions: [newContrib, ...(g.contributions || [])],
          };
        }
        return g;
      })
    );

    const targetGoal = goals.find((g) => g.id === goalId);
    const notif: SmartNotification = {
      id: `notif-${Date.now()}`,
      type: 'achievement',
      title: `Aporte de R$ ${amount.toLocaleString('pt-BR')} realizado!`,
      description: `Valor adicionado com sucesso ao seu patrimônio na meta "${targetGoal?.title || 'Investimento'}".`,
      date: 'Agora',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleWithdrawFromGoal = (goalId: string, amount: number) => {
    if (amount <= 0) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = Math.max(0, (g.currentAmount || 0) - amount);
          const newInvested = Math.max(0, (g.totalInvested !== undefined ? g.totalInvested : g.currentAmount || 0) - amount);
          return {
            ...g,
            currentAmount: newCurrent,
            totalInvested: newInvested,
          };
        }
        return g;
      })
    );
  };

  const handleUpdateGoal = (goalId: string, updatedFields: Partial<FinancialGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, ...updatedFields } : g))
    );
  };

  const handleUpdateIncome = (id: string, newAmount: number) => {
    setIncomes((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, amount: newAmount } : inc))
    );
  };

  const handleAddIncome = (name: string, amount: number, category: IncomeCategory['category']) => {
    const newInc: IncomeCategory = {
      id: `inc-${Date.now()}`,
      name,
      amount,
      frequency: 'mensal',
      category,
    };
    setIncomes((prev) => [...prev, newInc]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((inc) => inc.id !== id));
  };

  const handleUpdateExpense = (id: string, newAmount: number, newBudgetLimit?: number) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              amount: newAmount,
              budgetLimit: newBudgetLimit !== undefined ? newBudgetLimit : exp.budgetLimit,
            }
          : exp
      )
    );
  };

  const handleAddExpense = (
    name: string,
    amount: number,
    budgetLimit: number,
    category: ExpenseCategory['category']
  ) => {
    const newExp: ExpenseCategory = {
      id: `exp-${Date.now()}`,
      name,
      amount,
      budgetLimit,
      category,
      icon: 'MoreHorizontal',
      color: '#38bdf8',
    };
    setExpenses((prev) => [...prev, newExp]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleOnboardingComplete = (data: {
    name: string;
    monthlyIncome: number;
    primaryGoal: string;
  }) => {
    handleAddIncome('Salário / Renda Principal', data.monthlyIncome, 'salario');
    setIsOnboardingModalOpen(false);
    setCurrentTab('dashboard');
  };

  // 1. TELA INICIAL OBRIGATÓRIA: LOGIN (se não autenticado ou modo login)
  if (currentTab === 'login' || !userProfile) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  // Visualização de Landing Page institucional opcional
  if (currentTab === 'landing') {
    return (
      <>
        <LandingView
          onEnter={() => setCurrentTab('login')}
          onSignUp={() => setCurrentTab('login')}
        />
        <OnboardingModal
          isOpen={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          onComplete={handleOnboardingComplete}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header Navbar */}
      <HeaderNavbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        totalWealth={totalWealth}
        availableCash={availableCash}
        healthScore={healthScore.score}
        notifications={notifications}
        userProfile={userProfile || { name: 'Usuário', email: '' }}
        onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
        onOpenNewGoal={() => setCurrentTab('goals')}
        onOpenConnectBank={() => setCurrentTab('banks')}
        onOpenLanding={() => setCurrentTab('landing')}
        onLogout={handleLogout}
        onMarkNotificationsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            banks={banks}
            incomes={incomes}
            expenses={expenses}
            goals={goals}
            healthScore={healthScore}
            notifications={notifications}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
            onOpenNewGoal={() => setCurrentTab('goals')}
          />
        )}

        {currentTab === 'banks' && (
          <BankConnectionsView
            banks={banks}
            transactions={transactions}
            onConnectNewBank={handleConnectNewBank}
            onDisconnectBank={handleDisconnectBank}
            onSyncAll={handleSyncAll}
            onSyncBank={handleSyncBank}
          />
        )}

        {currentTab === 'budget' && (
          <IncomeExpensesView
            incomes={incomes}
            expenses={expenses}
            onUpdateIncome={handleUpdateIncome}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
            onUpdateExpense={handleUpdateExpense}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsPlanningView
            goals={goals}
            availableMonthlyCash={availableCash}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoalContribution={handleUpdateGoalContribution}
            onAddMoneyToGoal={handleAddMoneyToGoal}
            onWithdrawFromGoal={handleWithdrawFromGoal}
            onUpdateGoal={handleUpdateGoal}
          />
        )}

        {currentTab === 'copilot' && (
          <AICopilotView
            incomes={incomes}
            expenses={expenses}
            goals={goals}
            totalWealth={totalWealth}
          />
        )}

        {currentTab === 'simulator' && (
          <ScenarioSimulatorView
            currentIncome={totalIncome}
            currentExpenses={totalExpenses}
            goals={goals}
            onApplyScenario={(additionalSavings) => {
              alert(
                `Cenário simulado com sucesso! Uma economia extra estimada de R$ ${additionalSavings.toLocaleString(
                  'pt-BR'
                )} foi considerada para suas projeções.`
              );
              setCurrentTab('dashboard');
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        banks={banks}
        expenses={expenses}
        onAddTransaction={handleAddTransaction}
      />

      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
