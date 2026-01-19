import { GoogleGenAI } from "@google/genai";

export default async (request, context) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: "API Key não configurada no servidor" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Método não permitido" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "Body inválido" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const texto_edital = body.text || "";
    const action = body.action || "plano";

    let prompt;
    let isJsonMode = false;

    if (action === "plano") {
        prompt = `
Aja como um tutor especialista. Com base no texto deste edital:
${texto_edital.slice(0, 30000)}

Crie um cronograma de estudos semanal detalhado e tabelado.
Saída em Markdown.
`;
    } else if (action === "quiz") {
        const topico = body.topic || "Geral";
        prompt = `
Com base no edital fornecido, crie um QUIZ de 5 questões múltipla escolha sobre o tópico: ${topico}.
Formate a saída assim:
**Pergunta**
a) ...
b) ...
...
**Resposta Correta:** X
**Explicação:** ...
`;
    } else if (action === "analisar_edital") {
        isJsonMode = true;
        prompt = `
Analise o texto do edital fornecido e extraia as informações principais para criar um "Perfil do Concurso".
Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "nome_concurso": "Nome do Órgão / Cargo",
  "banca": "Nome da Banca (ou 'Não identificada')",
  "data_prova": "Data da prova (ou 'A definir')",
  "salario": "Valor do salário/remuneração (ou 'Ver edital')",
  "escolaridade": "Nível de escolaridade exigido",
  "vagas": "Número de vagas (ou 'CR')",
  "resumo_materias": ["Matéria 1", "Matéria 2", "Matéria 3", "etc"],
  "etapas": ["Prova Objetiva", "Redação", "Títulos", "etc"]
}

Texto do Edital:
${texto_edital.slice(0, 30000)}
`;
    } else if (action === "simulado_real") {
        isJsonMode = true;
        prompt = `
Analise o texto do edital fornecido e extraia informações sobre a estrutura da prova (tempo, número de questões, matérias).
Com base nisso, crie um SIMULADO REALÍSTICO.
Se o edital não especificar número de questões, gere 10 questões seguindo a proporção de matérias.
Retorne APENAS um JSON válido com esta estrutura, sem markdown:
{
  "exam_config": {
    "title": "Nome do Concurso/Cargo",
    "duration_minutes": 240,
    "total_questions": 10
  },
  "questions": [
    {
      "id": 1,
      "subject": "Português",
      "question": "Texto da pergunta...",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D", "Opção E"],
      "correct_option_index": 2,
      "explanation": "Explicação detalhada..."
    }
  ]
}

Texto do Edital:
${texto_edital.slice(0, 30000)}
`;
    } else {
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const genAI = new GoogleGenAI({ 
            apiKey: apiKey, 
            apiVersion: 'v1' 
        });
        
        // Configuração do modelo
        const config = isJsonMode ? { response_mime_type: "application/json" } : {};
        
        // Se for JSON (Simulado/Análise), usa generateContent normal
        if (isJsonMode) {
            const result = await genAI.models.generateContent({
                model: "gemini-1.5-flash",
                contents: prompt,
                config: config
            });
            
            return new Response(result.text, {
                headers: { "Content-Type": "application/json" }
            });

        } else {
            // Se for Texto/Markdown (Plano, Quiz simples), usa Stream
            const result = await genAI.models.generateContentStream({
                model: "gemini-1.5-flash",
                contents: prompt,
                config: config
            });

            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of result.stream) {
                            const chunkText = chunk.text();
                            if (chunkText) {
                                controller.enqueue(new TextEncoder().encode(chunkText));
                            }
                        }
                        controller.close();
                    } catch (err) {
                        controller.error(err);
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/markdown; charset=utf-8",
                    "Transfer-Encoding": "chunked"
                }
            });
        }

    } catch (e) {
        console.error("Erro na API:", e);
        return new Response(JSON.stringify({ error: String(e.message || e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};