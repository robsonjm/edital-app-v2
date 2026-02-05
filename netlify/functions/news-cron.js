
import Parser from 'rss-parser';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import slugify from 'slugify';

// Initialize RSS Parser
const parser = new Parser();

// Initialize Firebase Admin
// Note: We need FIREBASE_SERVICE_ACCOUNT environment variable containing the JSON
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : null;

if (!getApps().length && serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = serviceAccount ? getFirestore() : null;

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const config = {
  schedule: "@hourly"
};

export default async (req) => {
  console.log("Starting News Cron Job...");

  if (!db) {
    console.error("Firebase Admin not initialized. Missing FIREBASE_SERVICE_ACCOUNT.");
    return new Response("Firebase configuration missing", { status: 500 });
  }

  if (!apiKey) {
    console.error("Gemini API Key missing.");
    return new Response("Gemini configuration missing", { status: 500 });
  }

  // 1. Define Sources / Queries
  const queries = [
    'concurso público edital lançado',
    'concurso prefeitura inscrições abertas',
    'concurso tribunal'
  ];

  let newArticlesCount = 0;

  try {
    for (const q of queries) {
      const encodedQuery = encodeURIComponent(q);
      const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
      
      const feed = await parser.parseURL(rssUrl);
      
      // Process only the first 5 items to avoid spam/quota limits per run
      const itemsToProcess = feed.items.slice(0, 5);

      for (const item of itemsToProcess) {
        // 2. Check Deduplication
        const newsRef = db.collection('news');
        const snapshot = await newsRef.where('originalLink', '==', item.link).limit(1).get();

        if (!snapshot.empty) {
          console.log(`Skipping existing: ${item.title}`);
          continue;
        }

        // 3. Generate Content with AI
        console.log(`Processing new: ${item.title}`);
        
        const prompt = `
          Você é um jornalista especializado em concursos públicos no Brasil.
          Escreva uma notícia completa e original para um blog, baseada nas informações abaixo.
          
          Título Original: ${item.title}
          Resumo Original: ${item.contentSnippet}
          Fonte: ${item.source || 'Google News'}
          Data: ${item.pubDate}
          
          Diretrizes:
          1. Crie um Título chamativo e otimizado para SEO (h1).
          2. Escreva o conteúdo em formato HTML (sem tag <html> ou <body>, apenas o conteúdo interno). Use <h2>, <p>, <ul> onde apropriado.
          3. O tom deve ser informativo, profissional e encorajador.
          4. Inclua informações sobre cargos, salários e prazos se possível.
          5. Extraia a UF (Sigla do Estado) e a Cidade se mencionado. Se for nacional, UF="BR".
          6. No final, adicione uma chamada para ação para o usuário estudar com o Edital Master.
          
          Retorne APENAS um objeto JSON com este formato (sem markdown code blocks):
          {
            "title": "Novo Título",
            "content": "<p>Conteúdo HTML...</p>",
            "summary": "Resumo curto para card",
            "uf": "SP", 
            "city": "São Paulo" (ou null)
          }
        `;

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          let text = response.text();
          
          // Clean up if AI returns markdown code blocks
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          
          const article = JSON.parse(text);

          // 4. Save to Firestore
          const slug = slugify(article.title, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-4);
          
          await newsRef.add({
            title: article.title,
            slug: slug,
            content: article.content,
            summary: article.summary,
            uf: article.uf || 'BR',
            city: article.city || null,
            originalTitle: item.title,
            originalLink: item.link,
            originalSource: item.source || 'Google News',
            pubDate: new Date(item.pubDate),
            createdAt: new Date(),
            category: 'Concursos', // Can be improved with AI classification
            views: 0
          });

          newArticlesCount++;
          console.log(`Saved: ${article.title}`);

        } catch (aiError) {
          console.error(`Error generating content for ${item.title}:`, aiError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, processed: newArticlesCount }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
