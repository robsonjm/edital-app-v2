import React, { useEffect, useRef, useState } from 'react';

const AdsterraNativeBanner = ({ placementId = "4f94c235f19692ff0869b0fed85e691f" }) => {
  const bannerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Unique Container ID based on placement
    const containerId = `container-${placementId}`;
    
    // Inject container div if not present (handled by JSX below, but we need to target it)
    const scriptId = `adsterra-native-script-${placementId.slice(0, 8)}`; // Short hash for uniqueness
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout;

    // Cleanup function to remove script and configuration
    const cleanupScript = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
      // Remove global config for this placement to ensure clean reload
      if (window[`atOptions`]) {
          // Ideally we would only remove the specific key, but Adsterra uses specific variable names usually.
          // Native banners often use 'atOptions' object. We'll leave it for now as we want to reload.
      }
    };

    const loadScript = () => {
      cleanupScript();

      // Configure Adsterra Options
      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.innerHTML = `
        var atOptions = {
          'key' : '${placementId}',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      // Note: Native Banners usually use a different config structure (invoke.js usually expects a specific container).
      // Let's stick to the INVOKE pattern seen in previous code which didn't use atOptions but relied on the URL.
      // Wait, the previous code was: 
      // script.src = `https://controlslaverystuffing.com/${placementId}/invoke.js?t=${Date.now()}`;
      // And it looked for a container.
      
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://controlslaverystuffing.com/${placementId}/invoke.js?t=${Date.now()}`;
      script.setAttribute('data-cfasync', 'false');

      script.onerror = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(`Adsterra Native Banner (${placementId}) failed to load. Retrying (${retryCount}/${maxRetries})...`);
          retryTimeout = setTimeout(loadScript, 1000 * retryCount);
        } else {
            console.error('Adsterra Native Banner failed to load after multiple attempts.');
        }
      };

      if (bannerRef.current) {
         bannerRef.current.innerHTML = ''; // Clear previous content
         // Re-create the specific container div required by the invoke.js script
         const containerDiv = document.createElement('div');
         containerDiv.id = containerId;
         bannerRef.current.appendChild(containerDiv);
         bannerRef.current.appendChild(script);
      }
    };

    // Lazy Loading Logic
    const handleScroll = () => {
      if (isLoaded) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 500; // Load 500px before bottom

      if (scrollPosition >= threshold) {
        setIsLoaded(true);
        loadScript();
      }
    };

    // If page is short, load immediately
    if (document.body.offsetHeight <= window.innerHeight + 100) {
         setIsLoaded(true);
         loadScript();
    } else {
        window.addEventListener('scroll', handleScroll);
    }
    
    // Auto-hide logic (Check if container height is valid)
    const checkVisibility = setTimeout(() => {
        const container = document.getElementById(containerId);
        if (container && container.offsetHeight < 10) {
            console.warn('Adsterra banner likely blocked or failed to render. Hiding container.');
            if (bannerRef.current) bannerRef.current.style.display = 'none';
        }
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(retryTimeout);
      clearTimeout(checkVisibility);
      cleanupScript();
    };
  }, [placementId, isLoaded]); // Re-run if placementId changes

  return (
    <div 
        ref={bannerRef} 
        className="my-8 flex justify-center items-center min-h-[250px] w-full bg-slate-50 rounded-lg"
    >
      {/* Script injects here */}
    </div>
  );
};

export default AdsterraNativeBanner;
