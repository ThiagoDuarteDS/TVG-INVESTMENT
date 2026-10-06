import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  RefreshCw,
  Plus,
  CreditCard,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ExternalLink,
  Trash2,
  Sliders,
  Info,
  Check,
  Filter,
} from 'lucide-react';
import { BankAccount, Transaction } from '../types';
import { AVAILABLE_BANKS_CATALOG } from '../data/initialData';
import { BankLogo, getBankInfo } from './BankLogo';

interface BankConnectionsViewProps {
  banks: BankAccount[];
  transactions: Transaction[];
  onConnectNewBank: (bankName: string) => void;
  onDisconnectBank: (bankId: string) => void;
  onSyncAll: () => void;
  onSyncBank: (bankId: string) => void;
}

export const BankConnectionsView: React.FC<BankConnectionsViewProps> = ({
  banks,
  transactions,
  onConnectNewBank,
  onDisconnectBank,
  onSyncAll,
  onSyncBank,
}) => {
  const [isSyncingAll, setIsSyncAll] = useState(false);
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxType, setSelectedTxType] = useState<'all' | 'income' | 'expense'>('all');
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAddBankCatalog, setShowAddBankCatalog] = useState(false);

  // Catalog search and category filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('Todos');

  const handleSyncAll = () => {
    setIsSyncAll(true);
    onSyncAll();
    setTimeout(() => {
      setIsSyncAll(false);
    }, 1500);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesBank = selectedBankFilter === 'todos' || tx.bankName === selectedBankFilter;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTxType === 'all' || tx.type === selectedTxType;
    return matchesBank && matchesSearch && matchesType;
  });

  const totalBankBalance = banks.reduce((acc, curr) => acc + curr.balance, 0);
  const totalInvestments = banks.reduce((acc, curr) => acc + (curr.investmentsTotal || 0), 0);
  const totalCreditUsed = banks.reduce((acc, curr) => acc + (curr.creditUsed || 0), 0);

  // Filter Catalog Banks
  const filteredCatalogBanks = AVAILABLE_BANKS_CATALOG.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      b.code.includes(catalogSearch);
    const matchesCat =
      catalogCategory === 'Todos' ||
      (catalogCategory === 'Tradicionais' && b.category === 'Tradicional') ||
      (catalogCategory === 'Digitais' && b.category === 'Digital') ||
      (catalogCategory === 'Investimentos' && b.category?.includes('Invest'));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title & Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Open Finance Brasil
            </span>
            <span className="text-xs text-slate-400">Regulado pelo Banco Central do Brasil</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            Conexão com Instituições Bancárias
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Reúna contas correntes, cartões e investimentos em um único lugar seguro com suas logos oficiais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPermissionsModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Permissões</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Sincronizando...' : 'Sincronizar Todas'}</span>
          </button>

          <button
            onClick={() => setShowAddBankCatalog(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Conectar Banco</span>
          </button>
        </div>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Saldos em Conta Corrente</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            R$ {totalBankBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Distribuídos em {banks.filter((b) => b.balance > 0).length} instituições
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Investimentos Vinculados</span>
            <PiggyBank className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            R$ {totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">
            BTG Pactual & XP Investimentos
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Faturas de Cartão em Aberto</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            R$ {totalCreditUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total de gastos no ciclo atual
          </div>
        </div>
      </div>

      {/* Connected Bank Cards with Official Logos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Bancos Conectados ({banks.length})
          </h2>
          <span className="text-xs text-slate-400">
            Sincronização automática diária ativa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden"
            >
              {/* Subtle top brand accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: bank.color }}
              />

              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Official Bank Logo */}
                    <BankLogo bankName={bank.name} size="md" />
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{bank.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        Código {bank.code} • {bank.accountType === 'investimento' ? 'Investimentos' : 'Conta Corrente'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Ativo
                  </span>
                </div>

                {/* Account Details */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Saldo Disponível:</span>
                    <span className="font-bold text-slate-100">
                      R$ {bank.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {bank.investmentsTotal && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Investimentos:</span>
                      <span className="font-bold text-cyan-400">
                        R$ {bank.investmentsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {bank.creditLimit && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Cartão Usado:</span>
                      <span className="font-bold text-amber-400">
                        R$ {bank.creditUsed?.toLocaleString('pt-BR')} / {bank.creditLimit?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Last Sync footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{bank.lastSync}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSyncBank(bank.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Sincronizar este banco"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDisconnectBank(bank.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Desconectar banco"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Bank Transactions Section */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Extrato Unificado Open Finance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Todas as movimentações consolidadas com identificação da logo oficial do banco
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar lançamento..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="todos">Todos os Bancos</option>
              {banks.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTxType(type)}
                  className={`px-2 py-1 rounded text-[11px] font-medium capitalize ${
                    selectedTxType === type ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  {type === 'all' ? 'Tudo' : type === 'income' ? 'Entradas' : 'Saídas'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table / List with Official Bank Logos */}
        <div className="mt-4 divide-y divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhuma movimentação encontrada com os filtros selecionados.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-800/40 rounded-lg transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  {/* Official Bank Logo thumbnail */}
                  <BankLogo bankName={tx.bankName} size="sm" />

                  <div>
                    <h4 className="font-semibold text-slate-200">{tx.description}</h4>
                    <p className="text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">{tx.bankName}</span> • {tx.category} • {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} R${' '}
                    {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.2 rounded font-medium">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Transparência & Permissões Open Finance</h3>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O <strong className="text-emerald-400">TVG Wealth Engine</strong> opera estritamente sob as diretrizes de Open Finance e LGPD (Lei Geral de Proteção de Dados):
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">O que temos permissão para ler:</strong>
                  Saldos de contas, extrato de transações dos últimos 12 meses, limites e faturas de cartão de crédito e saldos consolidados de investimentos.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">O que NUNCA temos acesso:</strong>
                  Nunca solicitamos sua senha de transação, nunca realizamos transferências ou pagamentos em seu nome. A conexão é estritamente em modo de leitura (Read-Only).
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Você pode revogar o consentimento de qualquer instituição bancária a qualquer segundo com apenas um clique.
            </p>

            <button
              onClick={() => setShowPermissionsModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
            >
              Entendido e Seguro
            </button>
          </div>
        </div>
      )}

      {/* Catalog Modal with Search, Filters and Official Logos (Requirement 6) */}
      {showAddBankCatalog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                    Qual banco você deseja conectar?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecione ou pesquise sua instituição com a logo oficial para integrar com segurança
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBankCatalog(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="🔍 Pesquisar banco… (ex: Banco do Brasil, Bradesco, Itaú, Nubank, Santander...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  autoFocus
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['Todos', 'Tradicionais', 'Digitais', 'Investimentos'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      catalogCategory === cat
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="ml-auto text-[11px] text-slate-500 hidden sm:inline">
                  {filteredCatalogBanks.length} disponíveis
                </span>
              </div>
            </div>

            {/* Bank Cards Grid with Official Logos */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCatalogBanks.map((bank, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onConnectNewBank(bank.name);
                      setShowAddBankCatalog(false);
                    }}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/80 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-emerald-500/10 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      {/* Official Bank Logo */}
                      <BankLogo bankName={bank.name} size="md" />

                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-emerald-300 transition-colors">
                          {bank.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Cód: {bank.code} • {bank.category}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shrink-0">
                      Conectar
                    </span>
                  </div>
                ))}
              </div>

              {filteredCatalogBanks.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <p className="text-slate-400 text-sm">
                    Nenhum banco encontrado para "{catalogSearch}".
                  </p>
                  <p className="text-xs text-slate-500">
                    Verifique a ortografia ou tente buscar pelo código da instituição.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Conexão criptografada de ponta a ponta
              </span>
              <button
                onClick={() => setShowAddBankCatalog(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
