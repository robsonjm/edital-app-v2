import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
// import AdsterraNativeBanner from './AdsterraNativeBanner';

const AdsterraSocialOverlay = ({ onComplete, isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [canClose, setCanClose] = useState(false);
  const adContainerRef = React.useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setTimeLeft(10);
    setCanClose(false);

    // Inject Social Bar Script (SocialBar_Interstitial)
    const scriptId = 'adsterra-social-bar';
    
    // Cleanup previous script if exists to force reload
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://controlslaverystuffing.com/6f/8c/2f/6f8c2f808c585dbdb3bbbd5c5307aa4a.js";
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-cfasync', 'false');
    
    // Append to body (standard for Social Bar/Interstitial)
    document.body.appendChild(script);

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
      </div>

      {/* Main Content / Ad Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center my-8 min-h-[300px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl relative">
        
        {/* Central Timer/Status Indicator (Floating in the middle of ad space if needed, or just above) */}
        <div className="mb-8 scale-150 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-20">
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

        {/* Placeholder text (will be covered by ad if it loads) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-300 text-sm">Carregando patrocinador...</p>
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
