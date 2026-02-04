import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-black tracking-tighter italic uppercase text-slate-800 dark:text-white">
              Edital<span className="text-blue-600">Master</span>
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs">
              Transformando editais complexos em planos de estudo estratégicos com Inteligência Artificial.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[11px]">
            <Link to="/termos" className="hover:text-blue-600 transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-blue-600 transition-colors">Política de Privacidade</Link>
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          </div>
          
          <div className="text-slate-400 text-[10px] text-center md:text-right font-medium uppercase tracking-widest">
            <p>&copy; {year} Edital Master.</p>
            <p>Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
