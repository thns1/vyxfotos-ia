const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSmartContent() {
    try {
        const dossierPath = path.join(__dirname, '..', 'marketing', 'Estrategia_Marketing_Persona.md');
        let dossierContent = "";
        if (fs.existsSync(dossierPath)) dossierContent = fs.readFileSync(dossierPath, 'utf8');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Você é um Copywriter Especialista em Marketing Direto para a Vyxfotos-IA.
            Sua tarefa é retornar APENAS UM JSON VÁLIDO. Sem conversas, sem markdown.
            O JSON deve seguir este formato estrito:
            {
              "top_text": "...",
              "bottom_text": "...",
              "caption": "...",
              "theme": "..."
            }
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Limpeza agressiva de JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        
        return JSON.parse(text);
    } catch (error) {
        return {
            top_text: "FOTO COMUM -> FOTO DE ESTÚDIO",
            bottom_text: "COMENTE 'EU QUERO'",
            caption: "Chega de gastar rios de dinheiro em estúdio. Vyxfotos-IA resolve seu perfil em 15 segundos. 📸",
            theme: "Executivo"
        };
    }
}

module.exports = { generateSmartContent };
