import React, { useState } from 'react';
import { TVGLogo } from './TVGLogo';
import {
  LayoutDashboard,
  Building2,
  PieChart,
  Target,
  Sparkles,
  Calculator,
  Bell,
  Plus,
  ShieldCheck,
  ChevronDown,
  User,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SmartNotification } from '../types';

interface HeaderNavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  totalWealth: number;
  availableCash: number;
  healthScore: number;
  notifications: SmartNotification[];
  userProfile?: { name: string; email: string };
  onOpenNewTransaction: () => void;
  onOpenNewGoal: () => void;
  onOpenConnectBank: () => void;
  onOpenLanding: () => void;
  onLogout: () => void;
  onMarkNotificationsRead: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentTab,
  onTabChange,
  totalWealth,
  availableCash,
  healthScore,
  notifications,
  userProfile = { name: 'Usuário', email: '' },
  onOpenNewTransaction,
  onOpenNewGoal,
  onOpenConnectBank,
  onOpenLanding,
  onLogout,
  onMarkNotificationsRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'banks', label: 'Bancos & Contas', icon: Building2 },
    { id: 'budget', label: 'Receitas & Despesas', icon: PieChart },
    { id: 'goals', label: 'Metas & Planejamento', icon: Target },
    { id: 'copilot', label: 'Copiloto IA', icon: Sparkles, badge: 'IA' },
    { id: 'simulator', label: 'Simulador', icon: Calculator },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md">
      {/* Top micro bar with system status & security seal */}
      <div className="hidden md:flex items-center justify-between px-6 py-1 text-xs border-b border-slate-800/40 text-slate-400 bg-slate-950/40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open Finance Brasil Conectado
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Criptografia de Ponta a Ponta 256-bit
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Patrimônio Líquido:</span>
            <span className="font-semibold text-slate-200">
              R$ {totalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Sobra do Mês:</span>
            <span className="font-semibold text-emerald-400">
              +R$ {availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Saúde:</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {healthScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center hover:opacity-90 transition-opacity focus:outline-none"
          >
            <TVGLogo size="sm" />
          </button>

          {/* Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-slate-800/90 shadow-sm border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Adicionar</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-2 z-50">
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewTransaction();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2.5"
                >
                  <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    R$
                  </span>
                  <div>
                    <p className="font-semibold">Nova Movimentação</p>
                    <p className="text-[11px] text-slate-400">Entrada ou Despesa</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewGoal();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2.5"
                >
                  <Target className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="font-semibold">Novo Objetivo</p>
                    <p className="text-[11px] text-slate-400">Meta financeira personalizada</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenConnectBank();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2.5 border-t border-slate-800 mt-1"
                >
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="font-semibold">Conectar Banco</p>
                    <p className="text-[11px] text-slate-400">Via Open Finance Brasil</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
              title="Notificações da IA"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0b0f17]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-semibold text-sm text-slate-200">Alertas do Copiloto</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">{notifications.length} notificações</span>
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          {notif.type === 'opportunity' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                          {notif.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                          {notif.type === 'achievement' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-500">{notif.date}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{notif.description}</p>
                      {notif.actionText && (
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            onTabChange('copilot');
                          }}
                          className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                        >
                          {notif.actionText} →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs uppercase">
                {userProfile.name.slice(0, 2) || 'TG'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-semibold text-slate-200">{userProfile.name}</p>
                <p className="text-[10px] text-emerald-400">Pro Wealth</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-200">{userProfile.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{userProfile.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onTabChange('budget');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" /> Situação Financeira
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenLanding();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Ver Apresentação TVG
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sair da Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 bg-[#0b0f17]/95 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
