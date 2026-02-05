import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
// import AdsterraNativeBanner from './AdsterraNativeBanner';

const AdsterraSocialOverlay = ({ onComplete, isOpen, onClose, placementId = "6f8c2f808c585dbdb3bbbd5c5307aa4a" }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [canClose, setCanClose] = useState(false);
  const adContainerRef = React.useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setTimeLeft(10);
    setCanClose(false);

    // Inject Social Bar Script (SocialBar_Interstitial)
    const scriptId = `adsterra-social-bar-${placementId.slice(0, 8)}`;
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout;

    const cleanupScript = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };

    const loadScript = () => {
      cleanupScript();

      const script = document.createElement('script');
      script.id = scriptId;
      // Construct URL from placementId (chunked: 2/2/2/full)
      // Example: 6f8c2f80... -> 6f/8c/2f/6f8c2f80...
      const p1 = placementId.slice(0, 2);
      const p2 = placementId.slice(2, 4);
      const p3 = placementId.slice(4, 6);
      
      // Add timestamp to force reload (cache busting)
      script.src = `https://controlslaverystuffing.com/${p1}/${p2}/${p3}/${placementId}.js?t=${Date.now()}`;
      script.async = true;
      script.type = 'text/javascript';
      script.setAttribute('data-cfasync', 'false');
      
      script.onerror = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(`Adsterra Social Overlay (${placementId}) failed to load. Retrying (${retryCount}/${maxRetries})...`);
          retryTimeout = setTimeout(loadScript, 1000 * retryCount);
        } else {
            console.error('Adsterra Social Overlay failed to load after multiple attempts.');
            // Allow user to close immediately if ad fails completely
            setCanClose(true);
            setTimeLeft(0);
        }
      };

      // Append to body (standard for Social Bar/Interstitial)
      document.body.appendChild(script);
    };

    loadScript();

    // Fallback: If ad script loads but fails to render (silent failure/network block),
    // we can't easily detect it cross-origin, but we ensure the user isn't stuck forever
    // by sticking to the timer. However, if we could detect "no ad", we'd close earlier.
    // For now, the timer is the safe fallback.

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
      cleanupScript();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isOpen, placementId]);

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
