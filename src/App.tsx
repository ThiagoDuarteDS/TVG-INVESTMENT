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

import {
  BankAccount,
  IncomeCategory,
  ExpenseCategory,
  Transaction,
  FinancialGoal,
  FinancialHealthScore,
  SmartNotification,
} from './types';

import {
  INITIAL_BANKS,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
} from './data/initialData';

export default function App() {
  // Navigation State - Login is now the mandatory initial page (Requirement 2 & 5)
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string }>({
    name: 'Thiago G.',
    email: 'thiago007.org@gmail.com',
  });

  // App Data State with LocalStorage Persistence
  const [banks, setBanks] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('tvg_banks');
    if (!saved) return INITIAL_BANKS;
    try {
      const parsed: BankAccount[] = JSON.parse(saved);
      // Ensure official bank logos are always applied even if old session was cached
      return parsed.map((b) => {
        const initialMatch = INITIAL_BANKS.find(
          (ib) => ib.id === b.id || ib.name.toLowerCase().includes(b.name.toLowerCase().slice(0, 4))
        );
        return {
          ...b,
          logo: initialMatch ? initialMatch.logo : b.logo,
          color: initialMatch ? initialMatch.color : b.color,
        };
      });
    } catch {
      return INITIAL_BANKS;
    }
  });

  const [incomes, setIncomes] = useState<IncomeCategory[]>(() => {
    const saved = localStorage.getItem('tvg_incomes');
    return saved ? JSON.parse(saved) : INITIAL_INCOMES;
  });

  const [expenses, setExpenses] = useState<ExpenseCategory[]>(() => {
    const saved = localStorage.getItem('tvg_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('tvg_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tvg_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<SmartNotification[]>(() => {
    const saved = localStorage.getItem('tvg_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Modal Visibility States
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('tvg_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('tvg_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('tvg_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('tvg_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('tvg_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tvg_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Aggregate Calculations
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const availableCash = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (availableCash / totalIncome) * 100 : 0;

  const totalBankBalances = banks.reduce((acc, curr) => acc + curr.balance, 0);
  const totalInvestments = banks.reduce((acc, curr) => acc + (curr.investmentsTotal || 0), 0);
  const totalWealth = totalBankBalances + totalInvestments;

  // Dynamic Financial Health Score Calculation
  const calculateHealthScore = (): FinancialHealthScore => {
    let score = 50;

    // Savings rate effect (up to +25 points)
    if (savingsRate >= 30) score += 25;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;
    else score -= 10;

    // Emergency reserve coverage (up to +25 points)
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
      fixedCommitmentRate: totalIncome > 0 ? Math.round((2300 / totalIncome) * 100) : 30,
      emergencyReserveMonths: parseFloat(reserveMonths.toFixed(1)),
      investmentPace: 'Acelerado',
      insights: [
        'Taxa de poupança acima de 25%',
        'Reserva de emergência em estágio avançado',
        'Diversificação de contas ativas',
      ],
    };
  };

  const healthScore = calculateHealthScore();

  // Handlers
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

    // Update corresponding bank balance
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
      balance: 1500.0,
      lastSync: 'Conectado agora',
      status: 'connected',
      color: '#10b981',
    };
    setBanks((prev) => [...prev, newBank]);

    // Add smart notification
    const notif: SmartNotification = {
      id: `notif-${Date.now()}`,
      type: 'achievement',
      title: `${bankName} conectado com sucesso`,
      description: 'Saldos e extrato sincronizados via Open Finance Brasil.',
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
    // Update main income with user input
    setIncomes((prev) =>
      prev.map((inc) =>
        inc.category === 'salario' ? { ...inc, amount: data.monthlyIncome } : inc
      )
    );
    setHasCompletedOnboarding(true);
    setCurrentTab('dashboard');
  };

  // 1. Mandatory Initial Screen: Login (Requirements 2, 3, 4 & 5)
  if (currentTab === 'login') {
    return (
      <LoginView
        onLoginSuccess={(profile) => {
          if (profile) {
            setUserProfile((prev) => ({ ...prev, ...profile }));
          }
          setCurrentTab('dashboard');
        }}
        onRegisterSuccess={(profile) => {
          setUserProfile({ name: profile.name, email: profile.email });
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  // If user is on landing page presentation
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
        userProfile={userProfile}
        onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
        onOpenNewGoal={() => setCurrentTab('goals')}
        onOpenConnectBank={() => setCurrentTab('banks')}
        onOpenLanding={() => setCurrentTab('landing')}
        onLogout={() => setCurrentTab('login')}
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
              // Apply small optimization
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
