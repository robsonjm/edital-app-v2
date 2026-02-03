import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import SEO from './components/SEO';
import CookieConsent from './components/CookieConsent';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { 
  FileText, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  BarChart2, 
  Upload, 
  Plus, 
  ChevronRight, 
  Brain, 
  Trophy,
  AlertCircle,
  Loader2, 
  Trash2, 
  Search,
  File,
  X,
  Paperclip,
  Clock,
  Timer,
  Dumbbell,
  ClipboardList,
  AlertTriangle,
  ChevronLeft,
  RefreshCw,
  Library,
  BookMarked,
  GraduationCap,
  Sparkles,
  MessageSquare,
  Zap,
  Send,
  History,
  TrendingUp,
  FileSearch
} from 'lucide-react';
import { Card } from './components/ui/Card.jsx';
import { Button } from './components/ui/Button.jsx';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  deleteDoc, 
  query,
  addDoc,
  where,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// --- FIREBASE CONFIG ---
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'edital-master-v3';

// --- UI COMPONENTS ---
// Card and Button are imported from ./components/ui/

const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);

    const handleGoogleLogin = async () => {
      setLocalLoading(true);
      setLocalError(null);
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (err) {
        console.error("Google Login Error:", err);
        setLocalError("Erro ao fazer login com Google. Tente novamente.");
      } finally {
        setLocalLoading(false);
      }
    };

    const handleEmailAuth = async (e) => {
      e.preventDefault();
      setLocalLoading(true);
      setLocalError(null);
      try {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
      } catch (err) {
        console.error("Email Auth Error:", err);
        const msg = err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential'
          ? "Email ou senha incorretos."
          : err.code === 'auth/email-already-in-use'
          ? "Este email já está em uso."
          : err.code === 'auth/weak-password'
          ? "A senha deve ter pelo menos 6 caracteres."
          : "Erro na autenticação: " + err.message;
        setLocalError(msg);
      } finally {
        setLocalLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Edital Master</h1>
            <p className="text-slate-500 mt-2">Sua jornada rumo à aprovação começa aqui.</p>
          </div>

          {localError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{localError}</p>
            </div>
          )}

          <Button 
            onClick={handleGoogleLogin} 
            variant="outline" 
            className="w-full mb-6 py-6 text-base"
            disabled={localLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">ou continue com email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
              <input 
                type="password" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full py-3" loading={localLoading}>
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            </span>
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 font-bold text-blue-600 hover:text-blue-700"
            >
              {isSignUp ? 'Fazer Login' : 'Criar Conta'}
            </button>
          </div>
        </Card>
      </div>
    );
  };

// --- MAIN APP ---

const MainApp = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [view, setView] = useState('dashboard'); 
  const [editais, setEditais] = useState([]);
  const [selectedEdital, setSelectedEdital] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizState, setQuizState] = useState(null); 
  const [studyContent, setStudyContent] = useState(null); 
  const [deepenedTopics, setDeepenedTopics] = useState([]); 
  const [simuladosHistory, setSimuladosHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Gemini API Key loaded:", GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + "..." : "undefined");
  }, []);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEditais([]);
      setSimuladosHistory([]);
      setView('dashboard');
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timer;
    if (quizState && quizState.mode === 'exam' && !quizState.finished && quizState.timeLeft > 0) {
      timer = setInterval(() => {
        setQuizState(prev => {
          if (!prev || prev.timeLeft <= 1) {
            clearInterval(timer);
            if (prev && !prev.finished) saveQuizResult(prev, 0);
            return prev ? { ...prev, timeLeft: 0, finished: true } : null;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState?.mode, quizState?.finished, quizState?.timeLeft]);

  // Fetch Data
  useEffect(() => {
    if (!user) return;
    
    // Tratamento de erros de permissão no Firestore
    const handleFirestoreError = (err) => {
      console.error("Firestore error:", err);
      if (err.code === 'permission-denied') {
        setError("⚠️ Permissão Negada: Configure as Regras de Segurança do Firestore no Console do Firebase.");
      }
    };

    const qEditais = collection(db, 'artifacts', appId, 'users', user.uid, 'editais');
    const unsubEditais = onSnapshot(qEditais, (snap) => {
      setEditais(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, handleFirestoreError);

    const qSimulados = collection(db, 'artifacts', appId, 'users', user.uid, 'simulados');
    const unsubSimulados = onSnapshot(qSimulados, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSimuladosHistory(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, handleFirestoreError);

    return () => { unsubEditais(); unsubSimulados(); };
  }, [user]);

  // Mentoria History
  useEffect(() => {
    if (!user || !selectedEdital || !studyContent) return;
    
    const handleFirestoreError = (err) => {
      console.error("Firestore error (Mentoria):", err);
      // Não exibe erro na UI aqui para não poluir, pois já é tratado no useEffect principal
    };

    const qMentoria = collection(db, 'artifacts', appId, 'users', user.uid, 'mentoria');
    const unsubMentoria = onSnapshot(qMentoria, (snap) => {
      const history = snap.docs
        .map(doc => doc.data())
        .filter(m => m.editalId === selectedEdital.id && m.discipline === studyContent.discipline)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setDeepenedTopics(history);
    }, handleFirestoreError);
    return () => unsubMentoria();
  }, [user, selectedEdital, studyContent?.discipline]);

  const cleanJsonString = (str) => {
    if (!str) return "";
    return str.replace(/```json/g, '').replace(/```/g, '').trim();
  };

  const fetchWithRetry = async (url, options, maxRetries = 5) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (response.status === 429 || response.status >= 500) {
          const wait = Math.pow(2, i) * 1000;
          await new Promise(res => setTimeout(res, wait));
          continue;
        }
        throw new Error(`Status ${response.status}`);
      } catch (err) {
        lastError = err;
        const wait = Math.pow(2, i) * 1000;
        await new Promise(res => setTimeout(res, wait));
      }
    }
    throw lastError;
  };

  const handleAnalyze = async (inputData) => {
    setIsProcessing(true);
    setError(null);
    try {
      const apiKey = GEMINI_API_KEY; 
      const systemPrompt = `Você é um Analista Especialista em Editais Brasileiros. 
      Sua missão é ler o documento fornecido e DECOMPOR as informações. 
      
      CRITÉRIOS DE BUSCA:
      1. NOME: Procure pelo órgão e cargo no cabeçalho (ex: Prefeitura de SP - Auditor).
      2. SALÁRIO: Procure por "Vencimentos", "Remuneração", "R$" ou "Salário-base".
      3. VAGAS: Busque no quadro de vagas por "Total", "AC" + "CR".
      4. DISCIPLINAS: Vá até o anexo de "Conteúdo Programático". Extraia os nomes das matérias como uma lista limpa.
      5. DATAS: Procure o cronograma. Identifique "Inscrições" e "Prova Objetiva".
      6. TAF: Procure por "Aptidão Física", "Capacidade Física" ou "Teste de Esforço". Descreva os exercícios.
      
      IMPORTANTE: Se não encontrar dados claros, tente inferir pelo contexto ou use "A Consultar". 
      A lista de DISCIPLINAS é o item MAIS IMPORTANTE para o app funcionar.
      Responda estritamente em JSON válido.`;

      const generationConfig = { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            nome: { type: "STRING" },
            salario: { type: "STRING" },
            vagas: { type: "STRING" },
            escolaridade: { type: "STRING" },
            datas: { 
              type: "OBJECT", 
              properties: { 
                inscricao: { type: "STRING" }, 
                prova: { type: "STRING" } 
              } 
            },
            disciplinas: { type: "ARRAY", items: { type: "STRING" } },
            requisitos: { type: "STRING" },
            taf: { type: "STRING" }
          },
          required: ["nome", "disciplinas"]
        }
      };

      const contents = inputData.type === 'file' 
        ? [{ parts: [{ text: "Analise detalhadamente este edital e extraia as informações estruturadas." }, { inlineData: { mimeType: inputData.mimeType, data: inputData.base64 } }] }]
        : [{ parts: [{ text: `Analise este texto de edital:\n\n${inputData.text}` }] }];

      const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig })
      });

      const result = await response.json();
      const rawRes = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawRes) throw new Error("A IA não retornou uma resposta processável.");
      
      const parsedData = JSON.parse(cleanJsonString(rawRes));
      
      // Validação básica pós-IA
      if (!parsedData.disciplinas || parsedData.disciplinas.length === 0) {
        throw new Error("A IA não conseguiu identificar as disciplinas. Tente colar o Conteúdo Programático manualmente.");
      }

      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'editais'), { 
        ...parsedData, 
        createdAt: new Date().toISOString() 
      });
      setView('dashboard');
    } catch (err) { 
      console.error(err);
      setError(`Falha na análise: ${err.message}. Dica: Se o PDF for muito grande ou tiver muitas imagens, tente copiar apenas o texto do conteúdo programático.`); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const generateStudyContent = async (discipline) => {
    setIsProcessing(true);
    setError(null);
    try {
      const apiKey = GEMINI_API_KEY;
      const systemPrompt = `Mentor de Concursos. Gere Guia de Estudos para "${discipline}": Resumo, Bibliografia e Dicas. JSON estrito.`;
      const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: "Gere o guia." }] }], 
          systemInstruction: { parts: [{ text: systemPrompt }] }, 
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                summary: { type: "STRING" },
                bibliography: { type: "ARRAY", items: { type: "STRING" } },
                tips: { type: "ARRAY", items: { type: "STRING" } }
              }
            }
          } 
        })
      });
      const result = await response.json();
      const parsed = JSON.parse(cleanJsonString(result.candidates[0].content.parts[0].text));
      setStudyContent({ discipline, ...parsed });
      setView('library-viewer');
    } catch (err) { setError("Falha ao carregar conteúdo."); } finally { setIsProcessing(false); }
  };

  const deepenStudyTopic = async (userQuery) => {
    if (!userQuery.trim()) return;
    setIsProcessing(true);
    try {
      const apiKey = GEMINI_API_KEY;
      const context = `Disciplina: ${studyContent.discipline}. Dúvida do aluno: "${userQuery}". Explique tecnicamente para concurso.`;
      const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: context }] }] })
      });
      const result = await response.json();
      const resText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (resText) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'mentoria'), {
          editalId: selectedEdital.id,
          discipline: studyContent.discipline,
          query: userQuery,
          response: resText,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) { setError("Falha no aprofundamento."); } finally { setIsProcessing(false); }
  };

  const saveQuizResult = async (state, score) => {
    if (!user || !selectedEdital) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'simulados'), {
        editalId: selectedEdital.id,
        editalNome: selectedEdital.nome,
        mode: state.mode,
        score,
        total: state.questions.length,
        timestamp: new Date().toISOString()
      });
    } catch (e) { console.error(e); }
  };

  const startStudySession = async (edital, mode = 'quiz') => {
    setIsProcessing(true);
    setError(null);
    try {
      const apiKey = GEMINI_API_KEY;
      const qCount = mode === 'exam' ? 10 : 5;
      const systemPrompt = `Gere ${qCount} questões de concurso para: ${edital.disciplinas.join(", ")}. Responda em JSON.`;
      const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: "Gere o simulado." }] }], 
          systemInstruction: { parts: [{ text: systemPrompt }] }, 
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                questions: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      text: { type: "STRING" },
                      options: { type: "ARRAY", items: { type: "STRING" } },
                      correctIndex: { type: "NUMBER" },
                      explanation: { type: "STRING" },
                      discipline: { type: "STRING" }
                    }
                  }
                }
              }
            } 
          } 
        })
      });
      const result = await response.json();
      const quizData = JSON.parse(cleanJsonString(result.candidates[0].content.parts[0].text));
      setQuizState({ mode, questions: quizData.questions, currentIndex: 0, answers: Array(quizData.questions.length).fill(null), finished: false, timeLeft: mode === 'exam' ? 45 * 60 : 0 });
      setView('quiz-interface');
    } catch (err) { setError("Falha ao gerar questões."); } finally { setIsProcessing(false); }
  };

  // --- VIEWS ---

  const Dashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Meus Editais</h1>
          <p className="text-slate-500">Transforme editais burocráticos em planos de estudo.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setView('history')} className="flex-1 sm:flex-none"><History className="w-4 h-4" /> Histórico</Button>
          <Button onClick={() => setView('analyze')} className="flex-1 sm:flex-none"><Plus className="w-4 h-4" /> Novo Edital</Button>
          <Button variant="ghost" onClick={handleLogout} className="flex-1 sm:flex-none text-red-500 hover:bg-red-50 hover:text-red-600"><X className="w-4 h-4" /> Sair</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editais.map(e => {
          const lastS = simuladosHistory.find(s => s.editalId === e.id);
          return (
            <Card key={e.id} className="p-6 border-b-4 border-b-blue-600 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-1 truncate text-slate-800 dark:text-white">{e.nome}</h3>
              <p className="text-green-600 font-bold mb-4 text-sm">{e.salario || 'A consultar'}</p>
              {lastS && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between border border-blue-100 dark:border-blue-800">
                  <span className="text-[10px] font-black text-blue-400 uppercase">Último Desempenho</span>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{lastS.score}/{lastS.total} acertos</span>
                </div>
              )}
              <div className="flex items-center gap-4 mb-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {e.disciplinas?.length || 0} Matérias</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { setSelectedEdital(e); setView('edital-view'); }}>Ver Detalhes</Button>
                <Button onClick={() => { setSelectedEdital(e); setView('study-center'); }}>Estudar</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const HistoryView = () => (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in">
      <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-sm mb-8 font-bold"><ChevronLeft className="w-4 h-4" /> Voltar ao Painel</button>
      <h2 className="text-3xl font-black mb-6 tracking-tight">Histórico de Performance</h2>
      <div className="space-y-4">
        {simuladosHistory.map((s, idx) => (
          <Card key={idx} className="p-5 flex items-center justify-between border-l-4 border-l-blue-500">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{s.mode === 'exam' ? 'Simulado Oficial' : 'Prática Guiada'}</p>
              <h4 className="font-bold text-slate-800 dark:text-white">{s.editalNome}</h4>
              <p className="text-[10px] text-slate-400">{new Date(s.timestamp).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{s.score}<span className="text-slate-300 font-normal text-sm">/{s.total}</span></p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${s.score/s.total >= 0.7 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>{Math.round((s.score/s.total)*100)}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const StudyCenterView = () => (
    <div className="max-w-5xl mx-auto py-10 space-y-12 animate-in slide-in-from-bottom-4">
      <div className="text-center">
        <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-blue-600 flex items-center gap-1 mx-auto text-sm mb-4 font-bold"><ChevronLeft className="w-4 h-4" /> Voltar</button>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Área de <span className="text-blue-600">Treinamento</span></h2>
        <p className="text-slate-500">Foco Total: <strong>{selectedEdital?.nome}</strong></p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 group hover:border-emerald-500" onClick={() => setView('library-index')}>
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"><Library className="w-8 h-8" /></div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight">Biblioteca</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Resumos teóricos e bibliografias personalizadas.</p>
          <div className="text-emerald-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">Abrir Conteúdos <ChevronRight className="w-4 h-4" /></div>
        </Card>
        <Card className="p-8 group hover:border-blue-500" onClick={() => startStudySession(selectedEdital, 'quiz')}>
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"><Brain className="w-8 h-8" /></div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight">Prática Guiada</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Fixação imediata com dicas da mentoria.</p>
          <div className="text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">Iniciar Agora <ChevronRight className="w-4 h-4" /></div>
        </Card>
        <Card className="p-8 group hover:border-indigo-600" onClick={() => startStudySession(selectedEdital, 'exam')}>
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"><Clock className="w-8 h-8" /></div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight">Simulado</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Avaliação real de prova com tempo cronometrado.</p>
          <div className="text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">Fazer Simulado <ChevronRight className="w-4 h-4" /></div>
        </Card>
      </div>
    </div>
  );

  const LibraryViewer = () => {
    const [deepenQuery, setDeepenQuery] = useState('');
    return (
      <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-right-4 duration-500">
        <button onClick={() => setView('library-index')} className="text-slate-400 hover:text-emerald-600 flex items-center gap-1 text-sm mb-8 font-bold"><ChevronLeft className="w-4 h-4" /> Voltar</button>
        <div className="space-y-8 pb-32">
          <header className="border-b pb-8">
            <div className="flex items-center gap-3 text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-2"><Sparkles className="w-4 h-4" /> Mentoria Inteligente</div>
            <h1 className="text-4xl font-black leading-tight text-slate-900 dark:text-white tracking-tight">{studyContent.discipline}</h1>
          </header>
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-500" /> Resumo Estruturado</h3>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm whitespace-pre-wrap text-sm md:text-base">
              {studyContent.summary}
            </div>
          </section>
          {deepenedTopics.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-2 text-blue-600 uppercase text-[12px] tracking-widest"><Zap className="w-5 h-5" /> Foco de Aprofundamento</h3>
              {deepenedTopics.map((item, idx) => (
                <div key={idx} className="bg-blue-50/50 dark:bg-blue-900/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-900 animate-in slide-in-from-left-4">
                  <p className="text-[10px] font-black text-blue-400 uppercase mb-3 tracking-widest italic">Dúvida: {item.query}</p>
                  <div className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">{item.response}</div>
                </div>
              ))}
            </section>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Library className="w-5 h-5 text-blue-500" /> Referências</h3>
              <ul className="space-y-2">
                {studyContent.bibliography?.map((b, i) => (<li key={i} className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-800">{b}</li>))}
              </ul>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-orange-500" /> Dicas Mentoria</h3>
              <ul className="space-y-2">
                {studyContent.tips?.map((t, i) => (<li key={i} className="p-4 bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-2xl text-xs font-medium border border-orange-100 dark:border-orange-800 italic">"{t}"</li>))}
              </ul>
            </section>
          </div>
        </div>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><MessageSquare className="w-5 h-5" /></div>
            <input 
              type="text" placeholder="Dúvida específica nesta matéria? Digite aqui..." 
              className="flex-grow bg-transparent outline-none text-sm font-medium text-slate-700 dark:text-white"
              value={deepenQuery} onChange={(e) => setDeepenQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && deepenStudyTopic(deepenQuery)}
            />
            <Button variant="emerald" className="rounded-xl px-6" onClick={() => { deepenStudyTopic(deepenQuery); setDeepenQuery(''); }} loading={isProcessing}>Aprofundar</Button>
          </div>
        </div>
      </div>
    );
  };

  const QuizInterfaceView = () => {
    if (!quizState) return null;
    const { mode, questions, currentIndex, answers, finished, timeLeft } = quizState;
    const isExam = mode === 'exam';
    const currentQ = questions[currentIndex];
    const isAnswered = answers[currentIndex] !== null;
    const handleFinish = () => {
      const score = answers.filter((ans, i) => ans === questions[i].correctIndex).length;
      saveQuizResult(quizState, score);
      setQuizState({ ...quizState, finished: true });
    };
    if (finished) {
      const score = answers.filter((ans, i) => ans === questions[i].correctIndex).length;
      return (
        <Card className="max-w-4xl mx-auto p-12 text-center shadow-2xl animate-in zoom-in">
          <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
          <h2 className="text-4xl font-black mb-2 tracking-tight">Fim da Sessão</h2>
          <p className="text-slate-500 text-xl mb-10">Você acertou <span className="font-bold text-slate-900">{score}</span> de <span className="font-bold text-slate-900">{questions.length}</span> questões.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10 max-h-96 overflow-y-auto pr-4">
            {questions.map((q, i) => (
              <div key={i} className={`p-5 rounded-2xl border-2 ${answers[i] === q.correctIndex ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                <p className="text-sm font-bold mb-2">{i+1}. {q.text}</p>
                <div className="text-[11px] p-2 bg-white/50 rounded border"><strong>Explicação:</strong> {q.explanation}</div>
              </div>
            ))}
          </div>
          <Button className="w-full py-4 text-lg font-bold" onClick={() => setView('study-center')}>Voltar ao Treino</Button>
        </Card>
      );
    }
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-20 z-10">
          <span className="font-black text-[10px] uppercase tracking-widest text-blue-600">Questão {currentIndex + 1} / {questions.length}</span>
          {isExam && <div className="font-mono font-bold text-red-600"><Timer className="w-4 h-4 inline mr-1" /> {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</div>}
          <Button variant="ghost" className="text-xs" onClick={() => setView('study-center')}>Sair</Button>
        </div>
        <Card className="p-10 min-h-[450px] flex flex-col shadow-lg">
          <div className="mb-4"><span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{currentQ.discipline}</span></div>
          <h2 className="text-xl md:text-2xl font-bold mb-10 leading-relaxed text-slate-800 dark:text-white tracking-tight">{currentQ.text}</h2>
          <div className="space-y-3 flex-grow">
            {currentQ.options?.map((opt, idx) => {
              const isSel = answers[currentIndex] === idx;
              let style = isSel ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-200';
              if (!isExam && isAnswered) {
                if (idx === currentQ.correctIndex) style = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                else if (isSel) style = 'border-red-500 bg-red-50 dark:bg-red-900/20 opacity-60';
              }
              return (
                <button key={idx} disabled={!isExam && isAnswered} onClick={() => { const newA = [...answers]; newA[currentIndex] = idx; setQuizState({ ...quizState, answers: newA }); }} className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${style}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${isSel ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{String.fromCharCode(65 + idx)}</div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm md:text-base">{opt}</span>
                </button>
              );
            })}
          </div>
          {!isExam && isAnswered && <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-sm italic text-indigo-800 dark:text-indigo-300 animate-in fade-in"><strong>Gabarito:</strong> {currentQ.explanation}</div>}
          <div className="mt-10 pt-8 border-t flex justify-between">
            <Button variant="ghost" className="px-6" onClick={() => setQuizState({...quizState, currentIndex: Math.max(0, currentIndex - 1)})} disabled={currentIndex === 0}>Anterior</Button>
            {currentIndex + 1 === questions.length ? <Button className="px-8" onClick={handleFinish}>Entregar</Button> : <Button className="px-8" onClick={() => setQuizState({...quizState, currentIndex: currentIndex + 1})}>Próxima</Button>}
          </div>
        </Card>
      </div>
    );
  };

  const AnalyzeView = () => {
    const [text, setText] = useState('');
    const fileInputRef = useRef(null);
    return (
      <Card className="max-w-3xl mx-auto p-12 text-center shadow-xl border-none">
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Análise de Edital</h2>
        <p className="text-slate-500 mb-10 text-sm font-medium">Extração de dados alimentada por IA.</p>
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-left animate-in fade-in">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <p className="text-xs font-bold text-red-700 leading-tight">{error}</p>
          </div>
        )}
        <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all hover:border-blue-400 bg-slate-50 dark:bg-slate-900/50 mb-6">
          <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = () => handleAnalyze({ type: 'file', mimeType: file.type, base64: reader.result.split(',')[1] }); reader.readAsDataURL(file); } }} className="hidden" accept=".pdf" />
          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="font-bold text-slate-600 dark:text-slate-400">Anexar Edital PDF</p>
          <p className="text-[10px] text-slate-400 mt-2 italic">A IA identificará as matérias e datas automaticamente.</p>
        </div>
        <div className="relative py-4 flex items-center gap-4">
          <div className="flex-grow h-px bg-slate-100"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou Texto Manual</span>
          <div className="flex-grow h-px bg-slate-100"></div>
        </div>
        <textarea className="w-full h-32 p-4 rounded-2xl border bg-slate-50 dark:bg-slate-900 mb-4 outline-none text-sm resize-none focus:ring-2 focus:ring-blue-500" placeholder="Cole aqui o conteúdo programático do concurso para maior precisão..." value={text} onChange={(e) => setText(e.target.value)} />
        <Button className="w-full py-5 text-xl font-black rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none" onClick={() => handleAnalyze({ type: 'text', text })} loading={isProcessing}>Iniciar Análise</Button>
      </Card>
    );
  };

  const EditalDetailsView = ({ edital }) => (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-sm font-bold transition-colors"><ChevronLeft className="w-4 h-4" /> Voltar</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-10 shadow-lg border-t-8 border-t-blue-600 border-none">
              <h1 className="text-4xl font-black mb-8 tracking-tight leading-tight text-slate-900 dark:text-white">{edital.nome}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                 <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Remuneração</p><p className="font-bold text-green-600">{edital.salario || 'A consultar'}</p></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Vagas</p><p className="font-bold text-slate-700 dark:text-slate-300">{edital.vagas || 'N/D'}</p></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nível</p><p className="font-bold truncate text-slate-700 dark:text-slate-300">{edital.escolaridade || 'N/D'}</p></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Data Prova</p><p className="font-bold text-red-600">{edital.datas?.prova || 'N/D'}</p></div>
              </div>
              <h3 className="font-black text-sm uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Disciplinas Extraídas</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {edital.disciplinas && edital.disciplinas.length > 0 ? (
                  edital.disciplinas.map((d, i) => (
                    <span key={i} className="px-4 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-black border border-slate-100 dark:border-slate-700 shadow-sm uppercase tracking-tighter">
                      {d}
                    </span>
                  ))
                ) : (
                  <div className="w-full p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-700 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Nenhuma disciplina identificada. Recomendamos re-analisar colando o Conteúdo Programático.
                  </div>
                )}
              </div>
              {edital.taf && edital.taf !== "Não aplicável" && (
                <div className="mb-8">
                  <h3 className="font-black text-sm uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2"><Dumbbell className="w-4 h-4" /> Preparação Física (TAF)</h3>
                  <p className="text-sm font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/30 p-4 rounded-xl border border-orange-100 dark:border-orange-900 leading-relaxed italic">{edital.taf}</p>
                </div>
              )}
              <h3 className="font-black text-sm uppercase text-slate-400 mb-4 tracking-widest">Resumo dos Requisitos</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm italic border-l-4 pl-4 border-blue-100 dark:border-blue-900">{edital.requisitos || "Verificar requisitos de investidura no edital original."}</p>
           </Card>
        </div>
        <div className="space-y-6 pt-10">
           <Card className="p-8 bg-slate-900 text-white shadow-2xl border-none">
              <Brain className="w-12 h-12 mb-6 text-blue-500" />
              <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tighter leading-tight">Módulo de Estudos</h3>
              <p className="text-slate-400 text-sm mb-10 leading-relaxed">Prepare-se com simulados dinâmicos e mentoria baseada nas matérias acima.</p>
              <Button variant="primary" className="w-full py-4 text-lg rounded-xl shadow-lg shadow-blue-900/50" onClick={() => setView('study-center')} disabled={!edital.disciplinas || edital.disciplinas.length === 0}>Entrar na Área de Treino</Button>
           </Card>
        </div>
      </div>
    </div>
  );

  const LibraryIndexView = () => (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in">
      <button onClick={() => setView('study-center')} className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-sm mb-8 font-bold"><ChevronLeft className="w-4 h-4" /> Voltar</button>
      <div className="mb-10"><h2 className="text-3xl font-black mb-2">Biblioteca do Edital</h2><p className="text-slate-500 font-medium">Selecione uma matéria para acessar o resumo teórico e tirar dúvidas.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedEdital?.disciplinas?.map((d, i) => (<button key={i} onClick={() => generateStudyContent(d)} className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-left flex items-center justify-between hover:border-emerald-500 transition-all group shadow-sm"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600"><BookMarked className="w-5 h-5" /></div><span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{d}</span></div><ChevronRight className="w-4 h-4 text-slate-300" /></button>))}
      </div>
    </div>
  );

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEO 
          title="Login" 
          description="Acesse sua conta no Edital Master para criar planos de estudo personalizados com IA." 
        />
        <LoginView />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100">
      <SEO 
        title="Dashboard" 
        description="Gerencie seus editais, acompanhe seu progresso e estude com inteligência artificial."
      />
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b h-16 sticky top-0 z-50 shadow-sm border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg transition-transform hover:scale-105"><Brain className="w-6 h-6 text-white" /></div>
            <span className="text-2xl font-black tracking-tighter italic uppercase">Edital<span className="text-blue-600">Master</span></span>
          </div>
          {user && (
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 border-2 border-white dark:border-slate-700 shadow-sm transition-transform hover:scale-110 overflow-hidden" title={user.displayName || user.email}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                (user.displayName || user.email || 'U').charAt(0).toUpperCase()
              )}
            </div>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 font-bold shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto hover:bg-red-100 p-1 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        )}
        {view === 'dashboard' && <Dashboard />}
        {view === 'history' && <HistoryView />}
        {view === 'analyze' && <AnalyzeView />}
        {view === 'edital-view' && <EditalDetailsView edital={selectedEdital} />}
        {view === 'study-center' && <StudyCenterView />}
        {view === 'library-index' && <LibraryIndexView />}
        {view === 'library-viewer' && <LibraryViewer />}
        {view === 'quiz-interface' && <QuizInterfaceView />}
      </main>
      {isProcessing && (
        <div className="fixed inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center">
          <div className="relative mb-6">
             <Loader2 className="w-24 h-24 text-blue-600 animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600 text-[10px] animate-pulse">IA</div>
          </div>
          <p className="font-black text-3xl text-slate-900 dark:text-white uppercase italic tracking-tighter animate-pulse text-center px-6">
            Analisando Documento...
          </p>
          <p className="text-[10px] text-slate-400 mt-4 uppercase font-black tracking-[0.5em]">Processamento Estruturado Ativo</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <>
      <CookieConsent />
      <Routes>
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfService />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </>
  );
}
