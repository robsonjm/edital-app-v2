
import Parser from 'rss-parser';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import slugify from 'slugify';

// Initialize RSS Parser
const parser = new Parser();

// Helper to safely initialize Firebase
function getFirebaseDb() {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT env var is missing");
    }

    // Check if already initialized to avoid "Default app already exists" error
    if (getApps().length > 0) {
      return getFirestore();
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: ${e.message}`);
    }

    // Sanitize private key
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    } else {
      throw new Error("FIREBASE_SERVICE_ACCOUNT missing private_key field");
    }

    initializeApp({
      credential: cert(serviceAccount)
    });

    return getFirestore();
  } catch (error) {
    console.error("Firebase Init Error:", error);
    throw error;
  }
}

export const config = {
  schedule: "@hourly"
};

export default async (req) => {
  console.log("Starting News Cron Job...");

  try {
    // Initialize DB inside handler to catch configuration errors explicitly
    const db = getFirebaseDb();

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 1. Define Sources / Queries
    const queries = [
      'concurso público edital lançado',
      'concurso prefeitura inscrições abertas',
      'concurso tribunal'
    ];
    
    let newArticlesCount = 0;
    const logs = [];

    for (const q of queries) {
      const encodedQuery = encodeURIComponent(q);
      const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
      
      const feed = await parser.parseURL(rssUrl);
      
      // Process only the first 3 items
      const itemsToProcess = feed.items.slice(0, 3);

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
          
          Título original: ${item.title}
          Conteúdo original (snippet): ${item.contentSnippet || item.content || ''}
          Link original: ${item.link}
          
          Regras:
          1. Use linguagem formal e informativa.
          2. Destaque salários, vagas, cargos e prazos se houver.
          3. IMPORTANTE: Extraia a UF (Estado com 2 letras) e a Cidade se possível. Se for nacional, UF="BR".
          4. NÃO invente dados. Se faltar informação, foque no que existe.
          
          Retorne APENAS um JSON válido neste formato (sem markdown, sem \`\`\`json):
          {
            "title": "Título Chamativo para SEO",
            "content": "<p>Texto da notícia em HTML...</p>",
            "summary": "Resumo curto para card...",
            "uf": "SP",
            "city": "São Paulo"
          }
        `;

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          let text = response.text();
          
          // Cleanup JSON
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          
          const article = JSON.parse(text);

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
            category: 'Concursos',
            views: 0
          });

          newArticlesCount++;
          logs.push(`Created: ${article.title} (${slug})`);

        } catch (error) {
          console.error(`Error processing item ${item.title}:`, error);
          logs.push(`Error on ${item.title}: ${error.message}`);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      newArticles: newArticlesCount,
      logs: logs 
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (fatalError) {
    console.error("Fatal Cron Error:", fatalError);
    return new Response(JSON.stringify({ 
      error: "Fatal Execution Error", 
      message: fatalError.message,
      stack: fatalError.stack 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
