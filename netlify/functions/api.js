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
    } else {
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const result = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result) {
                        const chunkText = chunk.text;
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

    } catch (e) {
        return new Response(JSON.stringify({ error: String(e.message || e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
