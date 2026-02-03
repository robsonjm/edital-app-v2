import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button.jsx';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    // Here you would trigger analytics/ads loading if they were blocked
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md text-white p-6 shadow-2xl z-50 border-t border-slate-700 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="font-bold text-lg">🍪 Nós valorizamos sua privacidade</p>
          <p className="text-sm text-slate-300 max-w-2xl">
            Utilizamos cookies para melhorar sua experiência, analisar o tráfego e personalizar anúncios. 
            Ao continuar navegando, você concorda com nossa <a href="/privacidade" className="text-blue-400 hover:underline font-bold">Política de Privacidade</a>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" onClick={handleDecline} className="text-slate-300 hover:text-white hover:bg-slate-800">
            Recusar Opcionais
          </Button>
          <Button onClick={handleAccept} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/50 border-none">
            Aceitar Todos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;