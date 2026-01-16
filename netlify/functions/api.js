const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "API Key não configurada no servidor" })
        };
    }

    if (event.httpMethod && event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Método não permitido" })
        };
    }

    let body;
    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Body inválido" })
        };
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
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Ação inválida" })
        };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markdown: text })
        };
    } catch (e) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: String(e.message || e) })
        };
    }
};

