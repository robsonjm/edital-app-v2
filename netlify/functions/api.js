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

    // Inicializa o SDK
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Ação para listar modelos (Debug)
    if (action === "list_models") {
        try {
            const models = await ai.models.list();
            return new Response(JSON.stringify(models), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: String(e.message || e) }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    let prompt;
    let isJsonMode = false;

    if (action === "plano") {
        prompt = `
Aja como um tutor especialista. O objetivo é criar um plano de estudos de ALTA PRECISÃO baseado no edital.

1. Identifique no texto as seções de CONTEÚDO PROGRAMÁTICO (geralmente em Anexos).
2. Para cada matéria, liste os tópicos EXATOS exigidos.
3. Crie um cronograma semanal que cubra esses tópicos.

Saída em Markdown (Tabela e Lista de Tópicos Detalhada).
Use o seguinte formato:

## 📋 Conteúdo Programático Identificado
(Liste aqui o que você encontrou no edital, confirmando que leu o anexo correto)

## 📅 Cronograma Semanal
| Dia | Matéria | Tópicos a Estudar |
|---|---|---|
...

## 💡 Dicas de Estudo
...

Texto do Edital:
${texto_edital}
`;
    } else if (action === "quiz") {
        const topico = body.topic || "Geral";
        prompt = `
Com base no CONTEÚDO PROGRAMÁTICO do edital fornecido, crie um QUIZ de 5 questões múltipla escolha sobre o tópico: ${topico}.
Foque nos detalhes específicos mencionados nos anexos do edital.

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
ATENÇÃO: Procure minuciosamente por ANEXOS ou seções de CONTEÚDO PROGRAMÁTICO (syllabus) que detalham o que cairá na prova.
Desmembre os tópicos de cada matéria para termos uma visão detalhada do que estudar.

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "nome_concurso": "Nome do Órgão / Cargo",
  "banca": "Nome da Banca (ou 'Não identificada')",
  "data_prova": "Data da prova (ou 'A definir')",
  "salario": "Valor do salário/remuneração (ou 'Ver edital')",
  "escolaridade": "Nível de escolaridade exigido",
  "vagas": "Número de vagas (ou 'CR')",
  "resumo_materias": ["Matéria 1", "Matéria 2", "Matéria 3", "etc"],
  "conteudo_programatico": {
      "Nome da Matéria 1": ["Tópico 1", "Tópico 2", "Detalhe do Anexo..."],
      "Nome da Matéria 2": ["Tópico A", "Tópico B"]
  },
  "etapas": ["Prova Objetiva", "Redação", "Títulos", "etc"]
}

Texto do Edital:
${texto_edital}
`;
    } else if (action === "simulado_real") {
        isJsonMode = true;
        prompt = `
Analise o texto do edital fornecido, ESPECIALMENTE O CONTEÚDO PROGRAMÁTICO (ANEXOS), e crie um SIMULADO GAMIFICADO.
As questões devem ser baseadas nos tópicos REAIS que cairão na prova.

Gere 10 questões de múltipla escolha (A, B, C, D, E) seguindo a proporção de matérias do edital.
Cada questão deve ter um nível de dificuldade variado (Fácil, Médio, Difícil).

Retorne APENAS um JSON válido com esta estrutura:
{
  "exam_config": {
    "title": "Simulado - [Nome do Cargo]",
    "duration_minutes": 120,
    "total_questions": 10,
    "difficulty_level": "Misto"
  },
  "questions": [
    {
      "id": 1,
      "subject": "Nome da Matéria (Ex: Português)",
      "difficulty": "Médio",
      "question": "Enunciado da questão (baseado no conteúdo programático)...",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D", "Alternativa E"],
      "correct_answer": 0,
      "explanation": "Explicação detalhada."
    }
  ]
}

Texto do Edital:
${texto_edital}
`;
    } else {
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // Configuração de Segurança (Permissiva para evitar bloqueios em editais)
        const safetySettings = [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ];

        // Configuração do modelo
        const requestConfig = {
            response_mime_type: isJsonMode ? "application/json" : "text/plain",
            safetySettings: safetySettings
        };
        
        // Se for JSON (Simulado/Análise), usa generateContent normal
        if (isJsonMode) {
            const result = await ai.models.generateContent({
                model: "gemini-pro",
                contents: prompt,
                config: requestConfig
            });
            
            // Novo SDK: response.text é uma propriedade, não função
            let responseText = result.text;
            
            // Limpeza robusta de Markdown (remove ```json e ```)
            if (responseText) {
                responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            }
            
            return new Response(responseText, {
                headers: { "Content-Type": "application/json" }
            });

        } else {
            // Se for Texto/Markdown (Plano, Quiz simples), usa Stream
            const result = await ai.models.generateContentStream({
                model: "gemini-pro",
                contents: prompt,
                config: requestConfig
            });

            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of result.stream) {
                            // Novo SDK: verifica se chunk.text é propriedade ou função
                            let chunkText = chunk.text;
                            if (typeof chunkText === 'function') {
                                chunkText = chunkText();
                            }
                            
                            if (chunkText) {
                                controller.enqueue(new TextEncoder().encode(chunkText));
                            }
                        }
                        controller.close();
                    } catch (err) {
                        console.error("Stream error:", err);
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
