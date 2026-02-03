import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image }) => {
  const siteName = 'Edital Master';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Analise editais de concursos com IA, gere planos de estudo personalizados e simulados automaticamente. Sua aprovação começa aqui.';
  const defaultKeywords = 'concursos, edital, inteligência artificial, plano de estudos, simulados, edital master';
  const defaultImage = '/vite.svg'; // Replace with a real OG image later

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content="Edital Master" />
      <meta name="robots" content="index, follow" />

      {/* Open Graph (Facebook/LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Canonical URL - dynamic based on location if needed, but for now standard */}
      {/* <link rel="canonical" href={window.location.href} /> */}
    </Helmet>
  );
};

export default SEO;