import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  registerUser,
  loginUser,
  getUserByToken,
  logoutUser,
  saveUserData,
} from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Helper middleware to extract Bearer token
  const getAuthToken = (req: express.Request): string => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return '';
  };

  // --- Rotas de Autenticação Real ---
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password } = req.body;
      const result = registerUser(name, email, password);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro ao registrar usuário' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      const result = loginUser(email, password);
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ error: err.message || 'Credenciais inválidas' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const token = getAuthToken(req);
    const session = getUserByToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' });
    }
    return res.json(session);
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = getAuthToken(req);
    logoutUser(token);
    return res.json({ success: true });
  });

  // --- Rotas de Dados Individuais do Usuário ---
  app.get('/api/user/data', (req, res) => {
    const token = getAuthToken(req);
    const session = getUserByToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    return res.json({ data: session.data });
  });

  app.put('/api/user/data', (req, res) => {
    const token = getAuthToken(req);
    const session = getUserByToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const updated = saveUserData(session.user.id, req.body);
    return res.json({ success: true, data: updated });
  });

  // Initialize Google GenAI
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }

  // Helper function to query Gemini with retry across standard models
  async function generateWithFallback(contents: any, systemInstruction?: string) {
    if (!ai) return null;
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
    for (const model of models) {
      try {
        const config: any = {};
        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }

        const callPromise = ai.models.generateContent({
          model,
          contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        // Fast timeout race: 6 seconds per attempt
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 6000)
        );

        const res: any = await Promise.race([callPromise, timeoutPromise]);
        if (res && res.text) {
          return res.text;
        }
      } catch (e: any) {
        console.warn(`Model ${model} call error:`, e?.message || e);
      }
    }
    return null;
  }

  // API Route: AI Copilot Strategic Analysis
  app.post('/api/copilot/analyze', async (req, res) => {
    try {
      const token = getAuthToken(req);
      const session = getUserByToken(token);

      const ctx = req.body || {};
      const userGoals = (session?.data?.goals && session.data.goals.length > 0) ? session.data.goals : (ctx.goals || []);
      const userIncomes = (session?.data?.incomes && session.data.incomes.length > 0) ? session.data.incomes : (ctx.incomes || []);
      const userExpenses = (session?.data?.expenses && session.data.expenses.length > 0) ? session.data.expenses : (ctx.expenses || []);
      const userBanks = (session?.data?.banks && session.data.banks.length > 0) ? session.data.banks : (ctx.banks || []);

      const totalIncome = userIncomes.reduce((acc: number, c: any) => acc + (c.amount || 0), 0) || ctx.totalIncome || 0;
      const totalExpenses = userExpenses.reduce((acc: number, c: any) => acc + (c.amount || 0), 0) || ctx.totalExpenses || 0;
      const availableCash = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? Math.round((availableCash / totalIncome) * 100) : 0;

      const totalGoalsAmount = userGoals.reduce((acc: number, g: any) => acc + (g.currentAmount || 0), 0);
      const totalBankBalances = userBanks.reduce((acc: number, b: any) => acc + (b.balance || 0), 0);
      const totalWealth = totalBankBalances + totalGoalsAmount;

      const userName = session?.user?.name || 'Investidor';

      const prompt = `Você é o Copiloto de Inteligência Financeira da plataforma TVG INVESTMENT.
Analise a situação financeira real de ${userName}:
- Receita Mensal: R$ ${totalIncome.toLocaleString('pt-BR')}
- Despesas Mensais: R$ ${totalExpenses.toLocaleString('pt-BR')}
- Saldo Livre Mensal: R$ ${availableCash.toLocaleString('pt-BR')} (Taxa de Poupança: ${savingsRate}%)
- Patrimônio Total: R$ ${totalWealth.toLocaleString('pt-BR')}
- Metas/Investimentos Ativos (${userGoals.length}):
${userGoals.map((g: any) => `  * ${g.title}: Patrimônio R$ ${Number(g.currentAmount || 0).toLocaleString('pt-BR')} / Objetivo R$ ${Number(g.targetAmount || 0).toLocaleString('pt-BR')} (Aporte: R$ ${Number(g.monthlyContribution || 0).toLocaleString('pt-BR')}/mês, Rendimento: R$ ${Number(g.accumulatedYield || 0).toLocaleString('pt-BR')})`).join('\n') || '  * Nenhuma meta cadastrada no momento'}

Elabore um diagnóstico financeiro executivo e prático em português:
1. Avaliação do orçamento e taxa de poupança atual.
2. Análise da distribuição dos aportes em relação às metas.
3. Sugestão estratégica de otimização de aportes para acelerar o patrimônio.
Seja direto, empático e sofisticado. Não invente números fora desse contexto.`;

      const aiText = await generateWithFallback(prompt);

      if (aiText) {
        return res.json({ analysis: aiText });
      }

      // Dynamic calculation fallback based on user's authentic data
      if (userGoals.length === 0 && totalIncome === 0) {
        return res.json({
          analysis: `Olá, ${userName}! Sua conta na TVG INVESTMENT está pronta. Para gerar seu diagnóstico estratégico de patrimônio, conecte seu banco ou cadastre sua primeira meta financeira.`,
        });
      }

      const topGoal = userGoals[0];
      const dynamicAnalysis = `Diagnóstico TVG INVESTMENT para ${userName}:
• Saúde do Orçamento: Sua receita mensal é de R$ ${totalIncome.toLocaleString('pt-BR')} com despesas de R$ ${totalExpenses.toLocaleString('pt-BR')}, resultando em uma capacidade de poupança mensal de R$ ${availableCash.toLocaleString('pt-BR')} (${savingsRate}%).
• Metas & Investimentos: Você possui ${userGoals.length} meta(s) ativa(s), somando R$ ${totalGoalsAmount.toLocaleString('pt-BR')} em patrimônio alocado.${topGoal ? ` Sua principal meta "${topGoal.title}" já atingiu ${Math.min(100, Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100))}% do objetivo de R$ ${Number(topGoal.targetAmount).toLocaleString('pt-BR')}.` : ''}
• Estratégia Recomendada: Mantendo seus aportes programados com disciplina e reinvestindo os rendimentos, você acelera a formação do seu patrimônio e a independência financeira.`;

      return res.json({ analysis: dynamicAnalysis });
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      res.status(500).json({
        analysis: 'Diagnóstico financeiro em atualização com seus dados recentes.',
      });
    }
  });

  // API Route: AI Copilot Chat Funcional e Conectado ao Banco de Dados
  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const { message, history, financialContext } = req.body;
      const userMessage = (message || '').trim();

      const token = getAuthToken(req);
      const session = getUserByToken(token);

      // Mesclar dados do banco do usuário com o contexto atual
      const ctx = financialContext || {};
      const userGoals: any[] = (session?.data?.goals && session.data.goals.length > 0)
        ? session.data.goals
        : (ctx.goals || []);
      const userIncomes: any[] = (session?.data?.incomes && session.data.incomes.length > 0)
        ? session.data.incomes
        : (ctx.incomes || []);
      const userExpenses: any[] = (session?.data?.expenses && session.data.expenses.length > 0)
        ? session.data.expenses
        : (ctx.expenses || []);
      const userBanks: any[] = (session?.data?.banks && session.data.banks.length > 0)
        ? session.data.banks
        : (ctx.banks || []);

      const userName = session?.user?.name || ctx.userName || 'Investidor';
      const userEmail = session?.user?.email || ctx.userEmail || '';

      // Cálculos agregados precisos
      const totalIncome = userIncomes.reduce((acc, c) => acc + (c.amount || 0), 0) || ctx.totalIncome || 0;
      const totalExpenses = userExpenses.reduce((acc, c) => acc + (c.amount || 0), 0) || ctx.totalExpenses || 0;
      const availableCash = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? ((availableCash / totalIncome) * 100).toFixed(1) : '0';

      const totalBankBalances = userBanks.reduce((acc, b) => acc + (b.balance || 0), 0);
      const totalGoalsAmount = userGoals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
      const totalInvestedInGoals = userGoals.reduce((acc, g) => acc + (g.totalInvested || g.currentAmount || 0), 0);
      const totalYieldsInGoals = userGoals.reduce((acc, g) => acc + (g.accumulatedYield || 0), 0);
      const totalWealth = totalBankBalances + totalGoalsAmount;

      // Calcular aportes realizados este mês
      const currentMonthYear = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
      let thisMonthContributions = 0;
      userGoals.forEach((g: any) => {
        (g.contributions || []).forEach((c: any) => {
          if (c.date && c.date.includes(currentMonthYear)) {
            thisMonthContributions += (c.amount || 0);
          }
        });
      });

      // Detalhamento das metas para a IA
      const goalsDetailed = userGoals.map((g: any) => {
        const prog = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(1) : '0';
        const contribsCount = (g.contributions || []).length;
        const lastContrib = g.contributions?.[0];
        return `- Meta: "${g.title}"
  * Objetivo: R$ ${Number(g.targetAmount || 0).toLocaleString('pt-BR')}
  * Patrimônio Acumulado: R$ ${Number(g.currentAmount || 0).toLocaleString('pt-BR')}
  * Total Aportado/Investido: R$ ${Number(g.totalInvested || g.currentAmount || 0).toLocaleString('pt-BR')}
  * Rendimentos Acumulados: R$ ${Number(g.accumulatedYield || 0).toLocaleString('pt-BR')} (${g.totalInvested > 0 ? ((g.accumulatedYield / g.totalInvested) * 100).toFixed(2) : 0}%)
  * Aporte Mensal Programado: R$ ${Number(g.monthlyContribution || 0).toLocaleString('pt-BR')}/mês
  * Prazo Restante: ${g.targetMonths || 12} meses
  * Progresso: ${prog}% do objetivo
  * Estratégia de Investimento: ${g.investmentStrategy || 'Renda Fixa'} (${g.estimatedReturnRate || 10.5}% a.a.)
  * Histórico: ${contribsCount} aporte(s)${lastContrib ? `, último de R$ ${Number(lastContrib.amount).toLocaleString('pt-BR')} em ${lastContrib.date}` : ''}`;
      }).join('\n\n');

      const systemInstruction = `Você é o Copiloto de Inteligência Financeira Oficial da plataforma TVG INVESTMENT.
Você tem acesso DIRETO e EM TEMPO REAL à base de dados do usuário autenticado no sistema.

DADOS REAIS E EXATOS DO USUÁRIO (${userName}):
• Usuário: ${userName} (${userEmail})
• Patrimônio Total: R$ ${totalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Dinheiro em Contas/Bancos: R$ ${totalBankBalances.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${userBanks.map(b => `${b.name}: R$ ${b.balance}`).join(', ') || 'Nenhum banco conectado'})
• Total Investido em Metas: R$ ${totalInvestedInGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Total de Rendimentos Acumulados: R$ ${totalYieldsInGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Receita Mensal: R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Despesas Mensais: R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Saldo Líquido Livre Mensal: R$ ${availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Taxa de Poupança: ${savingsRate}%
• Aportes Realizados no Mês Atual: R$ ${thisMonthContributions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

METAS E INVESTIMENTOS ATIVOS (${userGoals.length} METAS):
${goalsDetailed || 'O usuário ainda não cadastrou nenhuma meta financeira.'}

DIRETRIZES DE RESPOSTA OBRIGATÓRIAS:
1. RESPONDA EXATAMENTE AO QUE FOI PERGUNTADO: Se o usuário perguntar quanto tem hoje, responda com o patrimônio dele (R$ ${totalWealth.toLocaleString('pt-BR')}). Se perguntar sobre uma meta específica (ex: apartamento), localize essa meta e informe seus valores exatos.
2. NUNCA invente números, metas ou saldos que não estão nos dados acima.
3. Se o usuário perguntar "quanto posso guardar?" ou "quanto posso gastar?", use o saldo líquido disponível (R$ ${availableCash.toLocaleString('pt-BR')}).
4. Se perguntar "qual meta está mais próxima?", compare as porcentagens de progresso de cada meta e responda claramente.
5. Se perguntar "quanto preciso investir por mês?", calcule com base no objetivo e prazo restante.
6. Mantenha o contexto de perguntas anteriores (se ele perguntar "E quanto isso rendeu?", responda sobre o valor ou meta que estava discutindo).
7. Seja empático, sofisticado, direto e preciso, em português do Brasil.`;

      // Montar conteúdo com histórico de conversa
      const contentsPayload: any[] = [];
      if (Array.isArray(history)) {
        history.slice(-8).forEach((h: any) => {
          if (h.sender === 'user' && h.text) {
            contentsPayload.push({ role: 'user', parts: [{ text: h.text }] });
          } else if (h.sender === 'assistant' && h.text) {
            contentsPayload.push({ role: 'model', parts: [{ text: h.text }] });
          }
        });
      }
      contentsPayload.push({ role: 'user', parts: [{ text: userMessage }] });

      const aiText = await generateWithFallback(contentsPayload, systemInstruction);

      if (aiText) {
        return res.json({ text: aiText });
      }

      // Fallback Dinâmico Inteligente: Realiza cálculos precisos baseados na pergunta
      const q = userMessage.toLowerCase();
      let responseText = '';

      if (q.includes('quanto tenho') || q.includes('patrimonio') || q.includes('patrimônio') || q.includes('saldo total')) {
        responseText = `Atualmente, seu patrimônio total consolidado na TVG INVESTMENT é de **R$ ${totalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.\n\nDesse total:\n• **R$ ${totalGoalsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** está alocado nas suas metas e investimentos.\n• **R$ ${totalBankBalances.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** está em saldo nas suas contas correntes.`;
      } else if (q.includes('rendeu') || q.includes('rendimento')) {
        // Checar se refere a uma meta específica
        const matchedGoal = userGoals.find(g => q.includes(g.title.toLowerCase()) || q.includes((g.category || '').toLowerCase()));
        if (matchedGoal) {
          const yieldPct = matchedGoal.totalInvested > 0 ? ((matchedGoal.accumulatedYield / matchedGoal.totalInvested) * 100).toFixed(2) : '0';
          responseText = `Na meta **${matchedGoal.title}**:\n• Total investido (aportes): **R$ ${Number(matchedGoal.totalInvested || matchedGoal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n• Rendimentos acumulados: **+ R$ ${Number(matchedGoal.accumulatedYield || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** (+${yieldPct}%)\n• Patrimônio atual da meta: **R$ ${Number(matchedGoal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.`;
        } else {
          responseText = `Seus investimentos nas metas já renderam um total acumulado de **+ R$ ${totalYieldsInGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**, sobre um total investido de **R$ ${totalInvestedInGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.`;
        }
      } else if (q.includes('mais perto') || q.includes('mais próxima') || q.includes('mais proxima')) {
        if (userGoals.length === 0) {
          responseText = 'Você ainda não cadastrou nenhuma meta. Acesse a aba **Metas & Investimentos** para criar seu primeiro objetivo!';
        } else {
          const sorted = [...userGoals].sort((a, b) => (b.currentAmount / (b.targetAmount || 1)) - (a.currentAmount / (a.targetAmount || 1)));
          const closest = sorted[0];
          const pct = Math.min(100, Math.round((closest.currentAmount / (closest.targetAmount || 1)) * 100));
          const faltam = Math.max(0, closest.targetAmount - closest.currentAmount);
          responseText = `A sua meta mais próxima de ser alcançada é **"${closest.title}"**, com **${pct}%** concluído.\n• Acumulado: R$ ${Number(closest.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• Objetivo: R$ ${Number(closest.targetAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• Faltam apenas: R$ ${faltam.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
        }
      } else if (q.includes('quanto posso gastar') || q.includes('quanto posso guardar') || q.includes('este mês') || q.includes('este mes') || q.includes('orçamento')) {
        responseText = `Analisando suas receitas e despesas cadastradas:\n• Receita Líquida: **R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n• Despesas Totais: **R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n• Saldo Líquido Disponível: **R$ ${availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** (Taxa de poupança: ${savingsRate}%).\n\nVocê tem uma folga de segurança de **R$ ${availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** este mês para direcionar a novas metas ou lazer.`;
      } else if (q.includes('coloquei') || q.includes('aportei') || q.includes('adicionei')) {
        responseText = `No mês atual, você registrou um total de **R$ ${thisMonthContributions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** em aportes direcionados às suas metas.`;
      } else if (q.includes('cresceu') || q.includes('evolução') || q.includes('evolucao')) {
        responseText = `Seu patrimônio acumulado em metas é de **R$ ${totalGoalsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**, com **R$ ${totalYieldsInGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** gerados exclusivamente por rendimentos de juros compostos.`;
      } else {
        responseText = `Olá, ${userName}! Analisando seus dados em tempo real:\nSeu patrimônio total é de **R$ ${totalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** distribuído em ${userGoals.length} meta(s) de investimento e suas contas bancárias. Seu saldo livre mensal é de **R$ ${availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.\n\nComo posso ajudar você especificamente hoje? Você pode me perguntar sobre o rendimento de uma meta, prazos ou simulações de aportes!`;
      }

      return res.json({ text: responseText });
    } catch (error) {
      console.error('Error in chat route:', error);
      res.json({
        text: 'Analisei sua conta. Qual detalhe das suas metas ou do seu patrimônio você gostaria de consultar agora?',
      });
    }
  });

  // Serve Vite in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TVG INVESTMENT running on http://localhost:${PORT}`);
  });
}

startServer();
