import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Target,
  PiggyBank,
  DollarSign,
  Loader2,
} from 'lucide-react';
import {
  IncomeCategory,
  ExpenseCategory,
  FinancialGoal,
  BankAccount,
  AIChatMessage,
} from '../types';
import { authService } from '../services/authService';

interface AICopilotViewProps {
  incomes: IncomeCategory[];
  expenses: ExpenseCategory[];
  goals: FinancialGoal[];
  banks?: BankAccount[];
  totalWealth: number;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  incomes,
  expenses,
  goals,
  banks = [],
  totalWealth,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Olá! Sou o seu Copiloto de Inteligência Financeira na TVG INVESTMENT. Estou conectado em tempo real aos seus dados de patrimônio, metas e orçamento. Pergunte qualquer coisa sobre suas finanças!',
      timestamp: 'Agora',
      suggestions: [
        'Quanto tenho hoje?',
        'Quanto minha meta do apartamento já rendeu?',
        'Quanto posso investir este mês?',
        'Qual meta está mais perto de ser atingida?',
        'Quanto eu coloquei nas minhas metas este mês?',
        'Quanto meu patrimônio cresceu?',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Cálculos consolidados locais
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const availableCash = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((availableCash / totalIncome) * 100).toFixed(1) : '0';
  const totalInvestedInGoals = goals.reduce((acc, g) => acc + (g.totalInvested || g.currentAmount || 0), 0);
  const totalYieldsInGoals = goals.reduce((acc, g) => acc + (g.accumulatedYield || 0), 0);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    runAIAnalysis();
  }, [totalWealth, goals.length, totalIncome]);

  const runAIAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    const token = authService.getToken();

    try {
      const res = await fetch('/api/copilot/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          totalIncome,
          totalExpenses,
          availableCash,
          savingsRate,
          topExpenses: expenses.slice(0, 5),
          goals,
          banks,
          totalWealth,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisText(data.analysis);
      }
    } catch (e) {
      console.warn('Fallback analysis used:', e);
      setAnalysisText(
        `Seu patrimônio total é de R$ ${totalWealth.toLocaleString('pt-BR')}. Sua margem livre mensal é de R$ ${availableCash.toLocaleString('pt-BR')} (${savingsRate}%). Continue aportando com consistência nas suas metas para acelerar os juros compostos.`
      );
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Agora',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    const token = authService.getToken();
    const userProfile = authService.getActiveUser();

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text.trim(),
          history: newMessages.slice(-10).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          financialContext: {
            userName: userProfile?.name || 'Investidor',
            userEmail: userProfile?.email || '',
            totalIncome,
            totalExpenses,
            availableCash,
            savingsRate,
            totalWealth,
            totalInvestedInGoals,
            totalYieldsInGoals,
            goals,
            banks,
          },
        }),
      });

      const data = await response.json();
      const assistantMessage: AIChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'Entendido. Estou à disposição para responder qualquer dúvida sobre suas metas e investimentos.',
        timestamp: 'Agora',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const assistantMessage: AIChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: `Com base nos seus dados atuais, seu patrimônio total é de R$ ${totalWealth.toLocaleString('pt-BR')} e sua margem livre mensal é de R$ ${availableCash.toLocaleString('pt-BR')}.`,
        timestamp: 'Agora',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner com Status da IA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              IA Conectada em Tempo Real
            </span>
            <span className="text-xs text-slate-400">Consultando banco de dados da sua conta</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
            Copiloto Financeiro Inteligente
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Respostas personalizadas calculadas com seus dados reais de patrimônio, metas e orçamento.
          </p>
        </div>

        <button
          onClick={runAIAnalysis}
          disabled={isGeneratingAnalysis}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAnalysis ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Atualizar Diagnóstico</span>
        </button>
      </div>

      {/* Grid: Diagnóstico Executivo & Chat Interativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Lateral: Diagnóstico Estratégico */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Diagnóstico Executivo</h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ao Vivo
              </span>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
              {isGeneratingAnalysis ? (
                <div className="flex items-center gap-2 text-slate-400 py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Analisando suas metas e patrimônio...</span>
                </div>
              ) : (
                analysisText || 'Seus dados financeiros estão sendo processados pela IA.'
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Resumo em Números
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Patrimônio Total</span>
                  <strong className="text-emerald-400 font-bold">
                    R$ {totalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Total em Metas</span>
                  <strong className="text-cyan-400 font-bold">
                    R$ {goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Rendimentos Totais</span>
                  <strong className="text-amber-400 font-bold">
                    + R$ {totalYieldsInGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Saldo Livre Mês</span>
                  <strong className="text-slate-200 font-bold">
                    R$ {availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Dica do Copiloto */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Privacidade Absoluta
            </span>
            <p className="text-[11px] leading-relaxed">
              A IA consulta exclusivamente os dados da sua conta. Suas informações nunca são compartilhadas ou misturadas com outros usuários.
            </p>
          </div>
        </div>

        {/* Painel Principal: Chat Interativo em Tempo Real */}
        <div className="lg:col-span-2 flex flex-col h-[640px] rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
          {/* Header do Chat */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Conversa com o Copiloto</h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Pronto para responder qualquer dúvida
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `msg-${Date.now()}`,
                    sender: 'assistant',
                    text: 'Conversa reiniciada. Em que posso ajudar você agora?',
                    timestamp: 'Agora',
                    suggestions: [
                      'Quanto tenho hoje?',
                      'Quanto minha meta do apartamento já rendeu?',
                      'Qual meta está mais perto de ser atingida?',
                    ],
                  },
                ]);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Limpar conversa
            </button>
          </div>

          {/* Lista de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-sm shadow-md'
                          : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Chips de sugestões abaixo da mensagem do assistente */}
                    {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(sug)}
                            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] text-slate-300 transition-colors cursor-pointer text-left"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-950/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Consultando sua conta e calculando resposta...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Campo de Envio de Mensagem */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pergunte qualquer coisa sobre seu patrimônio, metas ou aportes..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-cyan-500/20"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Pergunte: "Quanto tenho hoje?", "Quanto rendeu o apartamento?", "Quanto posso investir?"</span>
              <span className="hidden sm:inline">TVG INVESTMENT AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
