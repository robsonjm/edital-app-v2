import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import AdsterraNativeBanner from './AdsterraNativeBanner';

const AdsterraSocialOverlay = ({ onComplete, isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [canClose, setCanClose] = useState(false);
  
  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setTimeLeft(10);
    setCanClose(false);

    // Countdown Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!canClose) return;
    onComplete(); // Execute the pending action
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[40] bg-white flex flex-col items-center justify-between p-6 transition-all duration-300">
        
      {/* Progress Bar (Top) */}
      <div className="absolute top-0 left-0 h-2 bg-blue-600 transition-all duration-1000 ease-linear" style={{ width: `${((10 - timeLeft) / 10) * 100}%` }}></div>

      {/* Header Section */}
      <div className="mt-8 text-center w-full max-w-2xl">
        <h2 className="text-3xl font-black text-slate-900 mb-2">
          {canClose ? "Pronto para continuar!" : "Apoie nosso projeto"}
        </h2>
        <p className="text-slate-500 text-lg">
          {canClose 
            ? "Obrigado por aguardar. Você já pode acessar seu recurso." 
            : "Aguarde alguns segundos enquanto carregamos nossos patrocinadores. Isso mantém o Edital Master gratuito."}
        </p>
        {/* Error hint for user context if they are stuck */}
        {!canClose && (
            <p className="text-xs text-slate-300 mt-2">
                Se o anúncio não carregar, o botão será liberado automaticamente em {timeLeft}s.
            </p>
        )}
      </div>

      {/* Main Content / Ad Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center my-8 min-h-[300px] max-w-4xl relative">
        
        {/* Central Timer/Status Indicator (Floating in the middle of ad space) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {!canClose && (
            <div className="w-16 h-16 bg-blue-100/90 backdrop-blur-sm text-blue-600 rounded-full flex items-center justify-center relative shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="absolute font-bold text-xs">{timeLeft}</span>
            </div>
          )}
        </div>

        {/* Adsterra Native Banner (replacing Interstitial) */}
        <div className="w-full h-full flex items-center justify-center">
             <AdsterraNativeBanner forceLoad={true} />
        </div>

      </div>

      {/* Footer / Action Button */}
      <div className="w-full max-w-xl mb-8">
        <button
          onClick={handleClose}
          disabled={!canClose}
          className={`w-full py-6 rounded-2xl font-bold text-xl transition-all transform ${
            canClose 
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01] shadow-xl shadow-blue-600/30 cursor-pointer' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {canClose ? "Continuar para o App" : `Aguarde ${timeLeft} segundos...`}
        </button>
        
        <p className="mt-6 text-center text-xs text-slate-400 uppercase tracking-widest">
          Edital Master Free Tier
        </p>
      </div>
    </div>
  );
};

export default AdsterraSocialOverlay;
