import React from 'react';
import SEO from '../components/SEO';
import { Card } from '../components/ui/Card';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <SEO 
        title="Termos de Uso" 
        description="Termos e condições de uso do Edital Master." 
      />
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Voltar para o Início
        </Link>
        
        <Card className="p-10 shadow-xl border-none">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Termos de Uso</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">1. Aceitação dos Termos</h2>
            <p>Ao acessar e usar o Edital Master, você concorda em cumprir estes Termos de Uso e todas as leis aplicáveis.</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">2. Uso do Serviço</h2>
            <p>O Edital Master fornece ferramentas baseadas em Inteligência Artificial para análise de editais e auxílio nos estudos. O serviço é fornecido "como está", e não garantimos que a análise da IA esteja 100% livre de erros. É responsabilidade do usuário conferir as informações no edital original.</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">3. Contas de Usuário</h2>
            <p>Você é responsável por manter a confidencialidade de sua conta e senha. O Edital Master reserva-se o direito de encerrar contas que violem estes termos.</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">4. Propriedade Intelectual</h2>
            <p>Todo o conteúdo, design e código do Edital Master são de nossa propriedade ou licenciados. O conteúdo gerado pela IA para o usuário (planos de estudo) é de uso pessoal e intransferível.</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">5. Limitação de Responsabilidade</h2>
            <p>O Edital Master não se responsabiliza por quaisquer danos diretos, indiretos ou incidentais resultantes do uso ou incapacidade de usar o serviço, incluindo reprovações em concursos baseadas nos planos de estudo gerados.</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">6. Modificações</h2>
            <p>Podemos revisar estes termos a qualquer momento. Ao continuar a usar o site após as alterações, você concorda com os novos termos.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;