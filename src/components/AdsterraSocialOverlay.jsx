import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const AdsterraSocialOverlay = ({ onComplete, isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setTimeLeft(5);
    setCanClose(false);

    // Inject Social Bar Script
    const scriptId = 'adsterra-social-bar';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://controlslaverystuffing.com/6f/8c/2f/6f8c2f808c585dbdb3bbbd5c5307aa4a.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Countdown Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          // Auto-complete if desired, or wait for user to click close
          // onComplete(); // Uncomment to auto-proceed
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      // Cleanup script to allow re-injection on next mount
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!canClose) return;
    onComplete(); // Execute the pending action
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-1000 ease-linear" style={{ width: `${((5 - timeLeft) / 5) * 100}%` }}></div>

        <div className="mb-6 flex justify-center">
          {canClose ? (
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-in zoom-in">
               <X className="w-8 h-8" />
             </div>
          ) : (
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center relative">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="absolute font-bold text-xs">{timeLeft}</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          {canClose ? "Pronto para continuar!" : "Preparando seu conteúdo..."}
        </h2>
        
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {canClose 
            ? "Obrigado por aguardar. Você já pode acessar seu recurso." 
            : "Estamos processando sua solicitação. Por favor, aguarde alguns segundos enquanto carregamos nossos patrocinadores."}
        </p>

        <button
          onClick={handleClose}
          disabled={!canClose}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${
            canClose 
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-lg shadow-blue-600/30 cursor-pointer' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {canClose ? "Continuar Agora" : `Aguarde ${timeLeft}s...`}
        </button>

        <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest">
          Edital Master Free Tier
        </p>
      </div>
    </div>
  );
};

export default AdsterraSocialOverlay;
