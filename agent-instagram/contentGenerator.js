const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * GERADOR DE CONTEÚDO ESTRATÉGICO V8.5 (SDK EDITION)
 */
async function generateSmartContent() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const today = new Date().getDay(); 
        
        let contextPrompt = "DIA DA FIDELIDADE TOTAL: Foco em provar que a IA mantém o rosto perfeito. Cenários de estúdio de alto luxo.";
        if (today === 1) contextPrompt = "DIA DA AUTORIDADE: Nicho Profissional (Advocacia, Medicina, Executivos).";
        if (today === 5) contextPrompt = "DIA DO LIFESTYLE: Luxo, Viagens, Mansões e Liberdade.";

        const prompt = `
            Você é o Diretor de Marketing da Vyxfotos-IA.
            ${contextPrompt}
            
            Crie uma pessoa fictícia realista e retorne UM JSON:
            {
              "person_name": "Nome",
              "prompt_before": "Casual selfie, raw photo, natural light",
              "prompt_after": "Professional detailed portrait, 8k, photorealistic, raw skin texture, suit or premium outfit",
              "top_text": "FOTO COMUM -> PROFISSIONAL\\nSEM ESTÚDIO.",
              "bottom_text": "Sua imagem é seu lucro.\\nLink na BIO.",
              "caption": "🔥 PARE DE PERDER OPORTUNIDADES! Sua imagem no Instagram é sua vitrine. Nossa IA de Elite transforma uma simples selfie em um retrato de autoridade em segundos. 🚀\\n\\n✅ 100% de Fidelidade Facial\\n✅ Qualidade de Estúdio Fotográfico\\n✅ Resultado Instantâneo\\n\\nClique no link da BIO e garanta seu ensaio agora! #vyxfotos #ia #sucesso #branding",
              "theme": "Mosaico de Fidelidade"
            }
            Retorne APENAS o JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // Limpeza de Markdown
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        
        return JSON.parse(text);

    } catch (error) {
        console.error('❌ [Content Agent] Fallback necessário.');
        return {
            person_name: "Gabriel",
            prompt_before: "Young Brazilian man, casual t-shirt, raw photo",
            prompt_after: "Professional 8k executive portrait",
            top_text: "1 FOTO SUA -> PROFISSIONAL\nSEM ESTÚDIO.",
            bottom_text: "LINK NA BIO\n100% FIDELIDADE",
            caption: "Sua imagem é o seu cartão de visitas. Transforme-se hoje! 🚀 Use o link na BIO.",
            theme: "Fidelidade (Fallback)"
        };
    }
}

module.exports = { generateSmartContent };
