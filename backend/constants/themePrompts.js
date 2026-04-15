/**
 * VYXFOTOS.IA - PROMPTS DE SUBSTITUIÇÃO ATÔMICA (V20.0 - WIPE MODE)
 * 
 * Regra: Forçar a deleção do fundo original e neutralizar iluminação rosa/amadora.
 * Foco: Remoção de objetos (cadeira gamer, cortinas) e cenário 100% novo.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A high-end editorial studio portrait of [1] DRESSED IN a navy blue executive suit with a white shirt. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Cinematic 3-point lighting, dramatic shadows, softbox illumination. The entire original background and clothing of [1] is DELETED and replaced by a luxury office. 8k high-end photography.",

  // 02 - MODERNO
  'moderno': "A modern professional studio photo of [1] DRESSED IN a gray blazer and crisp white shirt. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. High-contrast commercial lighting, realistic skin textures. REMOVE all elements of [1]'s original background and clothes. High-end DSLR style.",

  // 03 - PREMIUM
  'premium': "A high-fidelity RAW photo of [1] teletransported to a NEW luxury office setting. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Cinematic rim lighting, deep bokeh background. DISCARD original gaming chair, clothes, and curtains. DRESSED IN a black executive suit and tie.",

  // 04 - INTERNACIONAL
  'internacional': "The person [1] in a COMPLETELY NEW urban architectural background. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Professional high-end editorial lighting. REMOVE original selfie context and clothes. DRESSED IN a professional dark suit, absolute subject separation.",

  // 05 - FEMININO
  'feminino': "A high-end professional photo of [1] in a NEW elegant studio office. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Soft beauty lighting, sharp eye focus. REMOVE all original background objects and clothes from [1]. DRESSED IN a tailored blazer.",

  // 06 - SMART CASUAL
  'smart_casual': "A candid-style professional photo of [1] in a NEW tech office. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Natural window light mixed with professional flash. DELETE original home background and clothes of [1]. DRESSED IN a structured blazer and white shirt.",

  // 07 - LUXO
  'luxo': "A prestigious RAW portrait of [1] DRESSED IN a black suit and tie. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Warm dramatic professional lighting, high contrast. DISCARD [1]'s original context and clothes. High-end commercial photography.",

  // 08 - FINANCEIRO
  'financeiro': "A formal RAW portrait of [1] DRESSED IN a navy pinstripe suit and tie. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Flat professional studio illumination. DELETE [1]'s original lighting, clothes, and background objects. Identity mirror.",

  // 09 - LINKEDIN
  'linkedin': "A clean professional LinkedIn headshot of [1] DRESSED IN a business suit and tie. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Soft daylight illumination, crisp details. REMOVE [1]'s original selfie background, clothes, and gaming chair.",

  // 10 - URBANO
  'urbano': "Realistic RAW photo of [1] DRESSED IN a navy suit and white shirt. PERFECT STUDIO RELIGHTING ON SUBJECT'S FACE. Golden hour cinematic lighting. DELETE [1]'s original home environment and clothes. Editorial style.",

  'sonhos': "A realistic RAW photo of [1] DRESSED IN elegant clothes in a new scene, perfect studio relighting on subject.",
  'custom': "A realistic RAW photo of [1] DRESSED IN elegant clothes in a new scene, perfect studio relighting on subject."
};

module.exports = themePrompts;
