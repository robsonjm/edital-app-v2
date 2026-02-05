import React, { useEffect, useRef } from 'react';

const AdsterraPopunder = ({ isPremium }) => {
  const scriptRef = useRef(null);

  useEffect(() => {
    // If user is premium, remove any existing script and don't load
    if (isPremium) {
      const existing = document.getElementById('adsterra-popunder-script');
      if (existing) existing.remove();
      return;
    }

    // Check if script is already injected
    if (document.getElementById('adsterra-popunder-script')) return;

    const script = document.createElement('script');
    script.id = 'adsterra-popunder-script';
    // Popunder script from previous comments
    script.src = "//controlslaverystuffing.com/f5/64/d9/f564d94e9601b5005af8479903a53392.js"; 
    script.async = true;
    script.type = 'text/javascript';

    script.onload = () => {
        console.log('[Adsterra] Popunder script loaded.');
    };

    script.onerror = () => {
        console.warn('[Adsterra] Popunder script failed to load.');
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // We generally don't remove popunder scripts on unmount as they attach to window/document
      // allowing them to persist across internal navigation is usually desired.
      // But if premium status changes, we might want to remove it.
      if (isPremium && scriptRef.current) {
        scriptRef.current.remove();
      }
    };
  }, [isPremium]);

  return null; // This component doesn't render anything visible
};

export default AdsterraPopunder;