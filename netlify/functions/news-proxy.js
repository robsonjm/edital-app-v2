import Parser from 'rss-parser';

const parser = new Parser();

export default async (request, context) => {
    // Apenas GET é permitido para busca simples
    if (request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Método não permitido" }), {
            status: 405,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });
    }

    const url = new URL(request.url);
    const uf = url.searchParams.get('uf') || '';
    const city = url.searchParams.get('city') || '';
    
    // Construir query de busca
    // Termos base: "concurso público"
    // Adiciona UF e Cidade se existirem
    let query = 'concurso público';
    if (city) query += ` "${city}"`;
    if (uf) query += ` ${uf}`;
    
    // Encode para URL
    const encodedQuery = encodeURIComponent(query.trim());
    
    // URL do RSS do Google News (Brasil)
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

    try {
        const feed = await parser.parseURL(rssUrl);
        
        // Formata os itens para um padrão limpo
        const newsItems = feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet,
            source: item.source || 'Google News'
        }));

        return new Response(JSON.stringify({ 
            query: query,
            count: newsItems.length,
            items: newsItems 
        }), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Permitir CORS para o frontend local/prod
            }
        });

    } catch (error) {
        console.error('Erro ao buscar RSS:', error);
        return new Response(JSON.stringify({ error: "Erro ao buscar notícias", details: error.message }), {
            status: 500,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });
    }
};
