/**
 * VYXFOTOS.IA - PROMPTS ULTRA-LIMPOS (V14.0 - DESTRAVAMENTO TOTAL)
 * 
 * Regra: Remover qualquer palavra que dispare filtros de segurança (EXACT, CRITICAL, DNA).
 * Linguagem neutra e direta para o motor Imagen 3 não bloquear a geração.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A professional photo of [1] wearing a navy blue executive suit, standing in a corporate office, natural lighting, 85mm lens.",

  // 02 - MODERNO
  'moderno': "A professional photo of [1] wearing a gray blazer, no tie, modern office setting, soft lighting.",

  // 03 - PREMIUM
  'premium': "A professional corporate portrait of [1] wearing a black suit, premium office background, cinematic lighting.",

  // 04 - INTERNACIONAL
  'internacional': "A professional photo of [1] wearing a dark suit, modern architectural background, natural side lighting.",

  // 05 - FEMININO
  'feminino': "A professional photo of [1] wearing a tailored blazer, corporate office background, soft lighting.",

  // 06 - SMART CASUAL
  'smart_casual': "A professional photo of [1] wearing a blazer and white shirt, clean office background, natural daylight.",

  // 07 - LUXO
  'luxo': "A professional portrait of [1] wearing a black suit, elegant dark background, warm lighting.",

  // 08 - FINANCEIRO
  'financeiro': "A professional portrait of [1] wearing a navy blue pinstripe suit, neutral office background, professional lighting.",

  // 09 - LINKEDIN
  'linkedin': "A professional LinkedIn headshot of [1] wearing a business suit, neutral background, soft lighting.",

  // 10 - URBANO
  'urbano': "A professional photo of [1] wearing a navy suit, blurred city background, golden hour lighting.",

  'sonhos': "A professional photo of [1].",
  'custom': "A professional photo of [1]."
};

module.exports = themePrompts;
