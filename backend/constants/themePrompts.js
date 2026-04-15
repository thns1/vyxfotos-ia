/**
 * VYXFOTOS.IA - PROMPTS DE SUBSTITUIÇÃO ATÔMICA (V20.0 - WIPE MODE)
 * 
 * Regra: Forçar a deleção do fundo original e neutralizar iluminação rosa/amadora.
 * Foco: Remoção de objetos (cadeira gamer, cortinas) e cenário 100% novo.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A professional business portrait of [1] DRESSED IN a navy blue executive suit with a white shirt. NEUTRAL WHITE STUDIO LIGHTING. NO GAMING CHAIR. NO RED CURTAINS. NO PINK LIGHTING. The entire original background and clothing of [1] is DELETED and replaced by a luxury office and a suit. RAW photography, high resolution, 85mm lens.",

  // 02 - MODERNO
  'moderno': "A modern professional photo of [1] DRESSED IN a gray blazer and crisp white shirt. NEUTRAL DAYLIGHT illumination. IGNORE AND REMOVE all elements of [1]'s original background and original clothes. Pure identity of [1] in business attire. High-end DSLR style.",

  // 03 - PREMIUM
  'premium': "A high-fidelity RAW photo of [1] teletransported to a NEW luxury office setting. NEUTRAL STUDIO STROBE lighting. DISCARD original gaming chair, clothes, and curtains from [1]. DRESSED IN a black executive suit and tie, sharp cinematic focus on [1].",

  // 04 - INTERNACIONAL
  'internacional': "The person [1] in a COMPLETELY NEW urban architectural background. NEUTRAL WHITE lighting. REMOVE original selfie context and clothes. DRESSED IN a professional dark suit, 85mm portrait lens, absolute subject separation.",

  // 05 - FEMININO
  'feminino': "A high-end professional photo of [1] in a NEW elegant studio office. NEUTRAL soft lighting. REMOVE all original background objects and clothes from [1]. DRESSED IN a tailored blazer, unretouched features, sharp focus.",

  // 06 - SMART CASUAL
  'smart_casual': "A candid-style professional photo of [1] in a NEW tech office. NEUTRAL white light. DELETE original home background and clothes of [1]. DRESSED IN a structured blazer and white shirt. Sharp focus, realistic skin textures.",

  // 07 - LUXO
  'luxo': "A prestigious RAW portrait of [1] DRESSED IN a black suit and tie. NEW elegant dark background. NEUTRAL professional lighting. DISCARD [1]'s original gaming context, curtains, and clothes. High-end commercial photography.",

  // 08 - FINANCEIRO
  'financeiro': "A formal RAW portrait of [1] DRESSED IN a navy pinstripe suit and tie. NEW neutral gray office background. NEUTRAL white illumination. DELETE [1]'s original lighting, clothes, and background objects. Identity mirror.",

  // 09 - LINKEDIN
  'linkedin': "A clean professional LinkedIn headshot of [1] DRESSED IN a business suit and tie. NEW neutral backdrop. NEUTRAL daylight lighting. REMOVE [1]'s original selfie background, clothes, and gaming chair. Soft focus background, sharp identity.",

  // 10 - URBANO
  'urbano': "Realistic RAW photo of [1] DRESSED IN a navy suit and white shirt. NEW metropolitan skyscraper background. NEUTRAL sunset lighting. DELETE [1]'s original home environment and clothes. Cinematic editorial style.",

  'sonhos': "A realistic RAW photo of [1] DRESSED IN elegant clothes in a new scene, neutral lighting.",
  'custom': "A realistic RAW photo of [1] DRESSED IN elegant clothes in a new scene, neutral lighting."
};

module.exports = themePrompts;
