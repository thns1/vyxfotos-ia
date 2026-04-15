/**
 * VYXFOTOS.IA - PROMPTS DE SUBSTITUIÇÃO ATÔMICA (V20.0 - WIPE MODE)
 * 
 * Regra: Forçar a deleção do fundo original e neutralizar iluminação rosa/amadora.
 * Foco: Remoção de objetos (cadeira gamer, cortinas) e cenário 100% novo.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A professional business portrait of [1] in a NEW corporate office background. NEUTRAL WHITE STUDIO LIGHTING. NO GAMING CHAIR. NO RED CURTAINS. NO PINK LIGHTING. The entire original background of [1] is DELETED and replaced by a luxury office. RAW photography, high resolution, 85mm lens.",

  // 02 - MODERNO
  'moderno': "A modern professional photo of [1] in a NEW minimalist office. NEUTRAL DAYLIGHT illumination. IGNORE AND REMOVE all elements of [1]'s original background. Pure identity of [1] wearing a gray blazer. High-end DSLR style.",

  // 03 - PREMIUM
  'premium': "A high-fidelity RAW photo of [1] teletransported to a NEW luxury office setting. NEUTRAL STUDIO STROBE lighting. DISCARD original gaming chair and curtains from [1]. Black executive suit, sharp cinematic focus on [1].",

  // 04 - INTERNACIONAL
  'internacional': "The person [1] in a COMPLETELY NEW urban architectural background. NEUTRAL WHITE lighting. REMOVE original selfie context. Professional suit, 85mm portrait lens, absolute subject separation.",

  // 05 - FEMININO
  'feminino': "A high-end professional photo of [1] in a NEW elegant studio office. NEUTRAL soft lighting. REMOVE all original background objects from [1]. Tailored blazer, unretouched features, sharp focus.",

  // 06 - SMART CASUAL
  'smart_casual': "A candid-style professional photo of [1] in a NEW tech office. NEUTRAL white light. DELETE original bedroom or home office background of [1]. Sharp focus, realistic skin textures.",

  // 07 - LUXO
  'luxo': "A prestigious RAW portrait of [1] in a NEW elegant dark background. NEUTRAL professional lighting. DISCARD [1]'s original gaming context and curtains. Black suit, high-end commercial photography.",

  // 08 - FINANCEIRO
  'financeiro': "A formal RAW portrait of [1] in a NEW neutral gray office background. NEUTRAL white illumination. DELETE [1]'s original lighting and background objects. Navy suit, identity mirror.",

  // 09 - LINKEDIN
  'linkedin': "A clean professional LinkedIn headshot of [1] in a NEW neutral backdrop. NEUTRAL daylight lighting. REMOVE [1]'s original selfie background and gaming chair. Soft focus background, sharp identity.",

  // 10 - URBANO
  'urbano': "Realistic RAW photo of [1] in a NEW metropolitan skyscraper background. NEUTRAL sunset lighting. DELETE [1]'s original home environment. Navy suit, cinematic editorial style.",

  'sonhos': "A realistic RAW photo of [1] in a new scene, neutral lighting.",
  'custom': "A realistic RAW photo of [1] in a new scene, neutral lighting."
};

module.exports = themePrompts;
