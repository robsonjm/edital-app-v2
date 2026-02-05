import React, { useEffect, useRef, useState } from 'react';

const AdsterraNativeBanner = ({ placementId = "4f94c235f19692ff0869b0fed85e691f", forceLoad = false }) => {
  const bannerRef = useRef(null); // Ref for the wrapper
  const adContainerRef = useRef(null); // Ref for the ad container (unmanaged by React)
  const [isLoaded, setIsLoaded] = useState(forceLoad);
  const [debugStatus, setDebugStatus] = useState('Initializing...');

  // 1. Trigger Logic: Use IntersectionObserver to detect visibility
  useEffect(() => {
    if (forceLoad) {
      setIsLoaded(true);
      return;
    }

    if (isLoaded) return; // Already triggered

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log(`[Adsterra] Banner ${placementId} is visible. Triggering load.`);
            setIsLoaded(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Load when within 200px of viewport
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [forceLoad, isLoaded, placementId]);

  // 2. Script Injection Logic: Runs only when isLoaded becomes true
  useEffect(() => {
    if (!isLoaded) return;

    const containerId = `container-${placementId}`;
    const scriptId = `adsterra-native-script-${placementId.slice(0, 8)}`; 
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout;

    const cleanupScript = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
      // Also clear container content to be safe
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };

    const loadScript = () => {
      // Don't full cleanup here to avoid flashing if retrying, 
      // but we do need to remove the old script tag if it exists.
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();

      setDebugStatus('Loading script...');

      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = `//controlslaverystuffing.com/${placementId}/invoke.js`;

      script.onload = () => {
        console.log(`[Adsterra] Native Banner script loaded for ${placementId}`);
        setDebugStatus('Script loaded. Rendering...');
      };

      script.onerror = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          const msg = `[Adsterra] Native Banner failed. Retrying (${retryCount}/${maxRetries})...`;
          console.warn(msg);
          setDebugStatus(msg);
          retryTimeout = setTimeout(loadScript, 3000 * retryCount);
        } else {
            const msg = '[Adsterra] Native Banner failed. 403/Network Error.';
            console.error(msg);
            setDebugStatus(msg);
        }
      };

      if (adContainerRef.current) {
         // Only clear and recreate structure if it's the first attempt
         // or if we need to ensure a clean slate. 
         // For Adsterra, invoke.js writes to where it is, or document.write.
         // We'll stick to the "append div + append script" pattern.
         
         adContainerRef.current.innerHTML = '';
         const innerDiv = document.createElement('div');
         innerDiv.id = containerId;
         adContainerRef.current.appendChild(innerDiv);
         adContainerRef.current.appendChild(script);
      }
    };

    loadScript();

    return () => {
      clearTimeout(retryTimeout);
      cleanupScript();
    };
  }, [isLoaded, placementId]); // Dependency only on isLoaded state and ID

  return (
    <div 
        ref={bannerRef} 
        className="my-8 flex flex-col justify-center items-center min-h-[250px] w-full bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 overflow-hidden"
    >
      {/* React Managed Status Indicator */}
      {!isLoaded && (
          <span className="text-slate-400 text-xs animate-pulse">
              Carregando publicidade...
          </span>
      )}
      
      {/* React Managed Debug Info (Dev only) */}
      <div style={{display: 'none'}} className="text-[10px] text-red-500 mt-2">{debugStatus}</div>

      {/* UNMANAGED Container for Ad Script - React never touches children of this div */}
      <div ref={adContainerRef} className="w-full flex justify-center items-center"></div>
    </div>
  );
};

export default AdsterraNativeBanner;
