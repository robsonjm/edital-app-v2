import React, { useEffect, useRef, useState } from 'react';

const AdsterraNativeBanner = ({ placementId = "4f94c235f19692ff0869b0fed85e691f", forceLoad = false }) => {
  const bannerRef = useRef(null); // Ref for the wrapper
  const adContainerRef = useRef(null); // Ref for the ad container (unmanaged by React)
  const [isLoaded, setIsLoaded] = useState(forceLoad);
  const [debugStatus, setDebugStatus] = useState('Initializing...');

  useEffect(() => {
    // Unique Container ID based on placement
    const containerId = `container-${placementId}`;
    const scriptId = `adsterra-native-script-${placementId.slice(0, 8)}`; 
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout;

    // Cleanup function
    const cleanupScript = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };

    const loadScript = () => {
      cleanupScript();
      setDebugStatus('Loading script...');

      // 1. Create the Script Element
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      // Remove timestamp if it's causing 403, or keep it. 
      // 403 Forbidden usually means domain block or invalid ID. 
      // We will try standard URL without cache busting param to be safe against firewall rules.
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
          retryTimeout = setTimeout(loadScript, 3000 * retryCount); // Slower backoff
        } else {
            const msg = '[Adsterra] Native Banner failed. 403/Network Error.';
            console.error(msg);
            setDebugStatus(msg);
        }
      };

      // 2. Inject into the UNMANAGED container
      if (adContainerRef.current) {
         adContainerRef.current.innerHTML = ''; // Safe: React doesn't manage children of this specific div
         
         // Create the specific div that Adsterra's invoke.js often looks for
         // (Though invoke.js usually writes to document.write or current script location)
         // We append the script *inside* our container so it writes there.
         
         const innerDiv = document.createElement('div');
         innerDiv.id = containerId; // Specific ID often required
         adContainerRef.current.appendChild(innerDiv);
         adContainerRef.current.appendChild(script);
         
         console.log(`[Adsterra] Injected script for ${placementId}`);
      }
    };

    // Lazy Loading Logic
    const handleScroll = () => {
      if (isLoaded) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 500; 

      if (scrollPosition >= threshold) {
        setIsLoaded(true);
        loadScript();
      }
    };

    if (forceLoad || document.body.offsetHeight <= window.innerHeight + 100) {
         if (!isLoaded) setIsLoaded(true);
         loadScript();
    } else {
        window.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(retryTimeout);
      cleanupScript();
    };
  }, [placementId, isLoaded, forceLoad]); 

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
