require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name));
  } catch (error) {
    console.error("ERRO:", error);
  }
}

test();
