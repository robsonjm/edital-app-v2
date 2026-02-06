
import Parser from 'rss-parser';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log("🚀 Iniciando Teste Local do News Cron...");

  // 1. Load Service Account
  const serviceAccountPath = path.join(__dirname, '../service-account.local');
  if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ Arquivo service-account.local não encontrado!");
    process.exit(1);
  }
  
  let serviceAccount;
  try {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log("✅ Chave de Serviço carregada com sucesso.");
  } catch (e) {
      console.error("❌ Erro ao ler JSON da chave:", e.message);
      process.exit(1);
  }

  // 2. Initialize Firebase
  try {
      if (getApps().length === 0) {
        initializeApp({ credential: cert(serviceAccount) });
      }
      console.log("✅ Firebase Inicializado");
  } catch (e) {
      console.error("❌ Erro ao conectar no Firebase:", e.message);
      process.exit(1);
  }
  
  const db = getFirestore();

  // 3. Check Gemini Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY não definida nas variáveis de ambiente!");
    console.log("👉 Rode no terminal: $env:GEMINI_API_KEY='SUA_CHAVE_AQUI'; node scripts/test-cron.js");
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  console.log("✅ Gemini Configurado");

  // 4. Run Logic
  const parser = new Parser();
  const queries = [
    'concurso público edital lançado',
    'concurso prefeitura inscrições abertas'
  ];

  console.log("🔍 Buscando RSS...");

  try {
    for (const q of queries) {
      const encodedQuery = encodeURIComponent(q);
      const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
      
      console.log(`📡 Lendo feed: ${q}`);
      const feed = await parser.parseURL(rssUrl);
      
      // Process only 1 item for test
      const itemsToProcess = feed.items.slice(0, 1);

      for (const item of itemsToProcess) {
        console.log(`\n📄 Processando: ${item.title}`);
        
        // Check Deduplication
        const newsRef = db.collection('news');
        const snapshot = await newsRef.where('originalLink', '==', item.link).limit(1).get();

        if (!snapshot.empty) {
          console.log(`⚠️ Já existe no banco: ${item.title}`);
          continue;
        }

        // Generate Content
        console.log(`🤖 Gerando conteúdo com IA...`);
        
        const prompt = `
          Você é um jornalista especializado em concursos.
          Escreva uma notícia completa para blog baseada em:
          Título: ${item.title}
          Resumo: ${item.contentSnippet}
          
          Retorne JSON: { "title": "...", "content": "...", "summary": "...", "uf": "SP", "city": "São Paulo" }
        `;

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          let text = response.text();
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const article = JSON.parse(text);
          console.log("✅ IA gerou o conteúdo:", article.title);

          // Save
          const slug = slugify(article.title, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-4);
          await newsRef.add({
            title: article.title,
            slug: slug,
            content: article.content,
            summary: article.summary,
            uf: article.uf || 'BR',
            city: article.city || null,
            originalLink: item.link,
            originalSource: item.source || 'Google News',
            pubDate: new Date(item.pubDate),
            createdAt: new Date(),
            category: 'Concursos'
          });
          console.log(`💾 Salvo no Firestore com sucesso! Slug: ${slug}`);

        } catch (aiError) {
          console.error(`❌ Erro na IA/Banco:`, aiError);
        }
      }
    }
    console.log("\n🏁 Teste finalizado!");
  } catch (error) {
    console.error("❌ Erro fatal:", error);
  }
}

run();
