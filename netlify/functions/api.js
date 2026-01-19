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
    } else if (action === "analisar_metadados") {
        isJsonMode = true;
        prompt = `
Analise o texto do edital e extraia os METADADOS básicos.
Não se preocupe com o conteúdo programático agora.
Foque em: Nome, Banca, Datas, Vagas, Salário, Etapas.

Retorne APENAS um JSON válido:
{
  "nome_concurso": "Nome do Órgão / Cargo",
  "banca": "Nome da Banca (ou 'Não identificada')",
  "data_prova": "Data da prova (ou 'A definir')",
  "salario": "Valor do salário/remuneração",
  "escolaridade": "Nível de escolaridade",
  "vagas": "Número de vagas",
  "etapas": ["Prova Objetiva", "Títulos", "etc"]
}

Texto:
${texto_edital}
`;
    } else if (action === "analisar_materias") {
        isJsonMode = true;
        prompt = `
Analise o texto (focando nos ANEXOS/CONTEÚDO PROGRAMÁTICO) e extraia as MATÉRIAS e TÓPICOS.
Ignore cabeçalhos e regras gerais. Foque no que cai na prova.

Retorne APENAS um JSON válido:
{
  "resumo_materias": ["Português", "Matemática", "Direito X"],
  "conteudo_programatico": {
      "Matéria 1": ["Tópico 1", "Tópico 2"],
      "Matéria 2": ["Tópico A", "Tópico B"]
  }
}

Texto:
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
        
        // Força Stream para TODAS as requisições para evitar Timeout do Netlify
        const stream = new ReadableStream({
            async start(controller) {
                // 1. Envia um Keep-Alive IMEDIATO para o browser saber que a conexão foi aceita
                // Isso evita o timeout de "Response Headers"
                controller.enqueue(new TextEncoder().encode(" "));
                
                try {
                    console.log(`Iniciando geração com modelo models/gemini-pro-latest...`);
                    
                    // 2. A chamada da IA acontece DENTRO da stream, não bloqueando a resposta inicial
                    const result = await ai.models.generateContentStream({
                        model: "models/gemini-pro-latest",
                        contents: prompt,
                        config: requestConfig
                    });

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
                    // Se der erro no meio da stream, enviamos um JSON de erro que o frontend pode tentar detectar
                    // Ou apenas fechamos com erro, mas enviar texto ajuda no debug
                    const errorMsg = JSON.stringify({ error: "Erro durante geração: " + (err.message || String(err)) });
                    // Tenta enviar erro limpo se possível, mas provavelmente vai quebrar o JSON do frontend (o que é esperado nesse caso)
                    controller.enqueue(new TextEncoder().encode("\n\n" + errorMsg));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": isJsonMode ? "application/json" : "text/markdown; charset=utf-8",
                "Transfer-Encoding": "chunked"
            }
        });

    } catch (e) {
        console.error("Erro na API:", e);
        return new Response(JSON.stringify({ error: String(e.message || e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
