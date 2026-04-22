const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
require('dotenv').config();

async function run() {
  try {
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const imgPath = 'c:/Users/User/OneDrive/Desktop/Meu projeto/meu-projeto/vyxfotos-ia/backend/uploads/0018de758ce231611eb013f807fc37f0';
    const base64 = fs.readFileSync(imgPath).toString('base64');
    
    // De acordo com o screenshot do usuário em AI Studio: 
    // gemini-3.1-flash-image-preview
    // Images & text output format
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
            { text: 'FACE (non-negotiable): Keep 100% identical — same eyes, same nose, same mouth, same jawline, same beard shape and density, same eyebrows, same skin tone, same hair color and texture. This must be recognizably the same real person.\\n\\nSTYLE: Executive professional headshot. Navy blue tailored suit, crisp white dress shirt, silk tie. Clean seamless light gray studio background. Three-point studio lighting, sharp focus on face and eyes, natural catchlights. 85mm lens, photorealistic, 8K quality, zero skin smoothing, zero beauty filter.\\n\\nOUTPUT: RAW photographic quality. The only things that change from the reference are the clothing and background. The face is preserved exactly.' }
          ]
        }
      ],
      config: {
        responseModalities: ["IMAGE"] // para forçar "Images only"
      }
    });

    console.log("Response:", response.candidates[0].content.parts);
  } catch (error) {
    console.error("ERRO:", error.message);
  }
}
run();
