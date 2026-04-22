require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = "Você é o Assistente Virtual Oficial da Vyxfotos.IA.";

const formattedContents = [
  { role: 'user', parts: [{ text: "realmente vai se parecer comigo?" }] }
];

async function test() {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction });
    
    console.log("Chamando o modelo...");
    const response = await model.generateContent({
      contents: formattedContents,
      generationConfig: { temperature: 0.5 }
    });
    console.log("SUCESSO:", response.response.text());
  } catch (error) {
    console.error("ERRO COMPLETO:", error);
  }
}

test();
