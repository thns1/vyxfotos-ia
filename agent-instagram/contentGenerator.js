const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * GERADOR DE CONTEÚDO ESTRATÉGICO V8.0
 * Suporta pilares de conteúdo: Autoridade (SEG), Fidelidade (QUA), Lifestyle (SEX)
 */
async function generateSmartContent() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const today = new Date().getDay(); // 1=Segunda, 3=Quarta, 5=Sexta
        
        let contextPrompt = "";
        if (today === 1) { // SEGUNDA: Autoridade/Nicho
            const niches = ["Advocacia/Direito", "Corretagem de Imóveis", "Medicina/Saúde", "Tecnologia/SaaS", "Arquitetura/Design"];
            const selectedNiche = niches[Math.floor(Math.random() * niches.length)];
            contextPrompt = `HOJE É SEGUNDA-FEIRA: Dia da Autoridade Profissional.
            O nicho escolhido é: ${selectedNiche}.
            O "Depois" deve ser um retrato impecável dessa profissão, passando confiança e poder.
            Legenda: Foco em "Sua imagem é seu cartão de visitas".`;
        } else if (today === 5) { // SEXTA: Lifestyle
            const destinations = ["Amalfi Coast, Italy", "Santorini, Greece", "Dubai luxury rooftop", "New York City Times Square", "Swiss Alps luxury resort"];
            const selectedDest = destinations[Math.floor(Math.random() * destinations.length)];
            contextPrompt = `HOJE É SEXTA-FEIRA: Dia do Lifestyle e Sonhos.
            O cenário é: ${selectedDest}.
            O "Depois" deve ser cinematográfico, focado em luxo e liberdade.
            Legenda: Foco em "Viva a vida que você merece".`;
        } else { // QUARTA (ou outros dias): Fidelidade
            contextPrompt = `DIA DA FIDELIDADE TOTAL: Foco em provar que a IA mantém o rosto perfeito.
            Cenários de estúdio de alto luxo.
            Legenda: Curta e objetiva sobre a tecnologia.`;
        }

        const prompt = `
            Você é o Diretor de Marketing da Vyxfotos-IA.
            ${contextPrompt}
            
            Crie uma pessoa fictícia realista e retorne UM JSON:
            {
              "person_name": "Nome",
              "prompt_before": "Casual selfie, raw photo, natural light",
              "prompt_after": "Professional detailed portrait, 8k, photorealistic, raw skin texture, relevant to the theme",
              "top_text": "FOTO COMUM -> PROFISSIONAL\\nSEM ESTÚDIO.",
              "bottom_text": "COMENTE 'EU QUERO'\\n100% FIDELIDADE",
              "caption": "Legenda curta, objetiva, gerando desejo imediato.",
              "theme": "Descrição do tema"
            }
            Retorne APENAS o JSON.
        `;

        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        let text = response.data.candidates[0].content.parts[0].text;
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        
        const content = JSON.parse(text);
        console.log(`📝 [Content V8] Pilar: ${today === 1 ? 'Autoridade' : (today === 5 ? 'Lifestyle' : 'Fidelidade')} | Tema: ${content.theme}`);
        return content;
    } catch (error) {
        console.error('❌ [Content] Erro no Agente. Usando Fallback de Emergência.');
        return {
            person_name: "Gabriel",
            prompt_before: "Young Brazilian man, casual t-shirt, messy hair, home background, raw photo",
            top_text: "1 FOTO SUA -> PROFISSIONAL\nSEM ESTÚDIO.",
            bottom_text: "COMENTE 'EU QUERO'\n100% FIDELIDADE",
            caption: "Sua imagem é o seu cartão de visitas. Transforme-se hoje! 🚀 Link na BIO.",
            theme: "Geral"
        };
    }
}

module.exports = { generateSmartContent };
