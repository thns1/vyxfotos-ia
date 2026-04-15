/**
 * VYXFOTOS.IA - PROMPTS NATIVOS (V12.0 - MODO GEMINI PURO)
 * 
 * Estratégia: Usar o estilo de "Prompt Nativo" do Gemini.
 * Comandos curtos em Inglês para máxima fidelidade e zero artificialidade.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A professional and natural corporate portrait of [1], wearing a tailored executive suit, soft natural studio lighting, high resolution, 85mm lens photography, professional office background.",

  // 02 - MODERNO
  'moderno': "A modern and accessible business portrait of [1], wearing an executive suit without a tie, soft daylight studio lighting, clean background, 85mm lens.",

  // 03 - PREMIUM
  'premium': "A high-end executive portrait of [1], wearing a luxury suit and cufflinks, blurred corporate library background, cinematic business lighting, sharp focus on eyes.",

  // 04 - INTERNACIONAL
  'internacional': "A cosmopolitan business portrait of [1], wearing a dark brown suit, blurred architectural background, natural side lighting, realistic skin texture.",

  // 05 - FEMININO
  'feminino': "A professional corporate portrait of [1], wearing a tailored blazer, soft studio lighting, neutral background, 85mm portrait lens.",

  // 06 - SMART CASUAL
  'smart_casual': "A tech-style business portrait of [1], wearing a structured blazer over a premium shirt, clean startup office background, natural lighting.",

  // 07 - LUXO
  'luxo': "A prestigious executive portrait of [1], wearing a deep black suit, gold watch, dark elegant background, warm dramatic lighting.",

  // 08 - FINANCEIRO
  'financeiro': "A formal banking executive portrait of [1], wearing a navy blue pinstripe suit and classic tie, medium gray background, professional lighting.",

  // 09 - LINKEDIN
  'linkedin': "A clean professional LinkedIn profile headshot of [1], wearing a business suit, soft blue-gray background, direct eye contact, friendly professional expression.",

  // 10 - URBANO
  'urbano': "A modern executive portrait of [1], wearing a navy suit, blurred city metropolis background with circular bokeh, golden hour lighting.",

  'sonhos': "A cinematic artistic portrait of [1].",
  'custom': "A professional portrait of [1]."
};

module.exports = themePrompts;
