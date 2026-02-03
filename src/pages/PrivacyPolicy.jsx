import React from 'react';
import SEO from '../components/SEO';
import { Card } from '../components/ui/Card';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <SEO 
        title="Política de Privacidade" 
        description="Leia nossa política de privacidade e entenda como o Edital Master protege seus dados conforme a LGPD e GDPR." 
      />
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Voltar para o Início
        </Link>
        
        <Card className="p-10 shadow-xl border-none">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Política de Privacidade</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">1. Introdução</h2>
            <p>O Edital Master ("nós", "nosso") compromete-se a proteger a sua privacidade. Esta Política de Privacidade explica como coletamos, usamos e compartilhamos suas informações pessoais ao utilizar nosso site e serviços.</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">2. Dados Coletados</h2>
            <p>Coletamos as seguintes informações:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de Conta:</strong> Nome, e-mail e foto de perfil (via autenticação Google ou cadastro direto).</li>
              <li><strong>Dados de Uso:</strong> Editais enviados, histórico de estudos, respostas de simulados e interações com a IA.</li>
              <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador e cookies (para análises e segurança).</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">3. Uso dos Dados</h2>
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e personalizar nossos serviços de análise de editais e geração de estudos.</li>
              <li>Processar autenticação e garantir a segurança da conta.</li>
              <li>Melhorar nossos algoritmos de IA (dados anonimizados).</li>
              <li>Exibir anúncios relevantes (via Google AdSense).</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">4. Compartilhamento de Dados</h2>
            <p>Não vendemos seus dados pessoais. Compartilhamos informações apenas com:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Provedores de Serviço:</strong> Firebase (Google) para hospedagem e autenticação, Google Gemini para processamento de IA.</li>
              <li><strong>Parceiros de Publicidade:</strong> Google AdSense (pode usar cookies para exibir anúncios personalizados).</li>
              <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou ordem judicial.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">5. Seus Direitos (LGPD e GDPR)</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar seus dados pessoais.</li>
              <li>Corrigir dados imprecisos.</li>
              <li>Solicitar a exclusão de seus dados (disponível diretamente nas configurações da conta).</li>
              <li>Revogar o consentimento para uso de cookies.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">6. Cookies e Publicidade</h2>
            <p>Utilizamos cookies essenciais para o funcionamento do site e cookies de terceiros (Google AdSense/Analytics) para marketing. Você pode gerenciar suas preferências no banner de cookies ou nas configurações do navegador.</p>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8">7. Contato</h2>
            <p>Para questões sobre privacidade, entre em contato conosco através do e-mail de suporte.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;