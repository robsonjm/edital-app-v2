import React, { useEffect, useRef, useState } from 'react';

const AdsterraNativeBanner = () => {
  const bannerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      // Check if user has scrolled to the bottom (with 100px buffer)
      // Or if the page is not scrollable (content fits in window)
      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      const isNotScrollable = document.body.offsetHeight <= window.innerHeight;
      
      if (isBottom || isNotScrollable) {
        setShouldLoad(true);
      }
    };

    // Initial check
    checkScroll();

    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    const scriptId = 'adsterra-native-script-4f94c235';
    
    // Always clean up existing script to force reload on route change
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    // Add timestamp to force reload (cache busting)
    script.src = `https://controlslaverystuffing.com/4f94c235f19692ff0869b0fed85e691f/invoke.js?t=${Date.now()}`;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    
    // Append to body
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [shouldLoad]);

  if (!shouldLoad) return null;

  return (
    <div className="w-full flex justify-center my-6" ref={bannerRef}>
      {/* Min-height added to reduce CLS and make it visible during loading */}
      <div id="container-4f94c235f19692ff0869b0fed85e691f" style={{ minHeight: '1px', minWidth: '1px' }}></div>
    </div>
  );
};

export default AdsterraNativeBanner;
