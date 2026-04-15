/**
 * VYXFOTOS.IA - PROMPTS DE SUBSTITUIÇÃO ATÔMICA (V20.0 - WIPE MODE)
 * 
 * Regra: Forçar a deleção do fundo original e neutralizar iluminação rosa/amadora.
 * Foco: Remoção de objetos (cadeira gamer, cortinas) e cenário 100% novo.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A professional business portrait of [1] DRESSED IN a navy blue executive suit. AUTHENTIC STUDIO LIGHTING. Visible skin pores, natural unretouched skin texture, sharp focus on eyes. NO SKIN SMOOTHING. The entire original background and clothing of [1] is DELETED and replaced by a luxury office. 8k RAW photography.",

  // 02 - MODERNO
  'moderno': "A modern professional studio photo of [1] DRESSED IN a gray blazer and crisp white shirt. AUTHENTIC RAW RELIGHTING. Visible skin textures, unretouched character details. NO BEAUTY FILTERS. REMOVE all elements of [1]'s original background and clothes. Realistic DSLR style.",

  // 03 - PREMIUM
  'premium': "A high-fidelity RAW photo of [1] teletransported to a NEW luxury office setting. AUTHENTIC STUDIO LIGHTING. Cinematic contrast, deep bokeh background. NO AIRBRUSHING on face. DISCARD original gaming chair, clothes, and curtains. DRESSED IN a black executive suit and tie.",

  // 04 - INTERNACIONAL
  'internacional': "The person [1] in a COMPLETELY NEW urban architectural background. AUTHENTIC professional lighting. NO SKIN FILTER. REMOVE original selfie context and clothes. DRESSED IN a professional dark suit, absolute subject separation, RAW photography.",

  // 05 - FEMININO
  'feminino': "A high-end professional photo of [1] in a NEW elegant studio office. AUTHENTIC soft lighting, sharp eye focus. NO BEAUTY RETOUCHING. REMOVE all original background objects and clothes from [1]. DRESSED IN a tailored blazer, natural skin character.",

  // 06 - SMART CASUAL
  'smart_casual': "A candid-style professional photo of [1] in a NEW tech office. AUTHENTIC street lighting mixed with flash. NO SKIN SMOOTHING. DELETE original home background and clothes of [1]. DRESSED IN a structured blazer and white shirt, RAW texture.",

  // 07 - LUXO
  'luxo': "A prestigious RAW portrait of [1] DRESSED IN a black suit and tie. AUTHENTIC dramatic professional lighting, high contrast. NO FACE ALTERATIONS. DISCARD [1]'s original context and clothes. Realistic commercial photography.",

  // 08 - FINANCEIRO
  'financeiro': "A formal RAW portrait of [1] DRESSED IN a navy pinstripe suit and tie. AUTHENTIC studio illumination. NO BEAUTY FILTERS. DELETE [1]'s original lighting, clothes, and background objects. Identity mirror, natural skin.",

  // 09 - LINKEDIN
  'linkedin': "A clean professional LinkedIn headshot of [1] DRESSED IN a business suit and tie. AUTHENTIC natural skin texture, visible pores, crisp details. NO SKIN SMOOTHING. REMOVE [1]'s original selfie background, clothes, and gaming chair.",

  // 10 - URBANO
  'urbano': "Realistic RAW photo of [1] DRESSED IN a navy suit and white shirt. AUTHENTIC cinematic lighting. NO BEAUTY RETOUCHING. DELETE [1]'s original home environment and clothes. Natural character style.",

  'sonhos': "A realistic RAW photo of [1] DRESSED IN elegant clothes in a new scene, authentic lighting, natural skin.",
  'custom': "A realistic RAW photo of [1] DRESSED IN elegant clothes in a new scene, authentic lighting, natural skin."
};

module.exports = themePrompts;
