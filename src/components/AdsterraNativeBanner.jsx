import React, { useEffect, useRef, useState } from 'react';

const AdsterraNativeBanner = ({ placementId = "4f94c235f19692ff0869b0fed85e691f" }) => {
  const bannerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://controlslaverystuffing.com/${placementId}/invoke.js?t=${Date.now()}`;
      script.setAttribute('data-cfasync', 'false');

      script.onload = () => {
        console.log(`[Adsterra] Native Banner script loaded for ${placementId}`);
        setDebugStatus('Script loaded. Waiting for render...');
      };

      script.onerror = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          const msg = `[Adsterra] Native Banner failed. Retrying (${retryCount}/${maxRetries})...`;
          console.warn(msg);
          setDebugStatus(msg);
          retryTimeout = setTimeout(loadScript, 2000 * retryCount); // Increased backoff
        } else {
            const msg = '[Adsterra] Native Banner failed to load after multiple attempts. Check network/antivirus.';
            console.error(msg);
            setDebugStatus(msg);
        }
      };

      if (bannerRef.current) {
         bannerRef.current.innerHTML = ''; // Clear previous content
         
         // Create container
         const containerDiv = document.createElement('div');
         containerDiv.id = containerId;
         containerDiv.style.minHeight = '250px'; // Force height
         containerDiv.style.minWidth = '300px';
         bannerRef.current.appendChild(containerDiv);
         
         // Append script
         bannerRef.current.appendChild(script);
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

    if (document.body.offsetHeight <= window.innerHeight + 100) {
         setIsLoaded(true);
         loadScript();
    } else {
        window.addEventListener('scroll', handleScroll);
    }
    
    // Relaxed Auto-hide logic (Log warning only for now to debug)
    const checkVisibility = setTimeout(() => {
        const container = document.getElementById(containerId);
        if (container && container.offsetHeight < 10) {
            console.warn(`[Adsterra] Container ${containerId} is empty (height < 10px). Ad likely blocked.`);
            setDebugStatus('Ad container empty (Blocked?)');
            // bannerRef.current.style.display = 'none'; // DISABLED AUTO-HIDE FOR DEBUGGING
        }
    }, 8000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(retryTimeout);
      clearTimeout(checkVisibility);
      cleanupScript();
    };
  }, [placementId, isLoaded]); 

  return (
    <div 
        ref={bannerRef} 
        className="my-8 flex flex-col justify-center items-center min-h-[250px] w-full bg-slate-50 rounded-lg border-2 border-dashed border-slate-200"
    >
      {/* Debug Info (Visible only if empty or in dev) */}
      {!isLoaded && <span className="text-slate-400 text-xs">Waiting for scroll...</span>}
      <div style={{display: 'none'}} className="text-[10px] text-red-500 mt-2">{debugStatus}</div>
    </div>
  );
};

export default AdsterraNativeBanner;
