import os
import json
import google.generativeai as genai

def handler(event, context):
    # 1. Segurança e Configuração
    # A chave vem das variáveis de ambiente do Netlify (segredo!)
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'API Key não configurada no servidor'})
        }

    # Configura o Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    # 2. Ler os dados enviados pelo Frontend
    try:
        body = json.loads(event['body'])
        texto_edital = body.get('text', '')
        action = body.get('action', 'plano') # 'plano' ou 'quiz'
    except:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Body inválido'})
        }

    # 3. Lógica: Gerar Plano ou Quiz
    if action == 'plano':
        prompt = f"""
        Aja como um tutor especialista. Com base no texto deste edital:
        {texto_edital[:30000]} 
        
        Crie um cronograma de estudos semanal detalhado e tabelado.
        Saída em Markdown.
        """
    elif action == 'quiz':
        topico = body.get('topic', 'Geral')
        prompt = f"""
        Com base no edital fornecido, crie um QUIZ de 5 questões múltipla escolha sobre o tópico: {topico}.
        Formate a saída assim:
        **Pergunta**
        a) ...
        b) ...
        ...
        **Resposta Correta:** X
        **Explicação:** ...
        """

    # 4. Chama a IA
    try:
        response = model.generate_content(prompt)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'markdown': response.text})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
