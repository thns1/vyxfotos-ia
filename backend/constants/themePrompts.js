/**
 * VYXFOTOS.IA - PROMPTS V22.0 RESTAURADOS
 *
 * ÚNICA MUDANÇA EM RELAÇÃO À V22.0 APROVADA:
 * "portrait/headshot" → "full body photo, seated in a luxury leather armchair"
 *
 * Todo o resto (RAW, autenticidade, anti-filtro, delete background) está INTACTO.
 * NÃO ALTERAR SEM APROVAÇÃO DO USUÁRIO.
 */

const themePrompts = {
  // 01 - EXECUTIVO
  'executivo': "A professional full body photo of [1] seated in a luxury leather executive armchair. [1] DRESSED IN a navy blue executive suit. AUTHENTIC STUDIO LIGHTING. Visible skin pores, natural unretouched skin texture, sharp focus. NO SKIN SMOOTHING. The entire original background and clothing of [1] is DELETED and replaced by a luxury office. 8k RAW photography.",

  // 02 - MODERNO
  'moderno': "A modern professional full body studio photo of [1] seated in a contemporary luxury chair. [1] DRESSED IN a gray blazer and crisp white shirt. AUTHENTIC RAW RELIGHTING. Visible skin textures, unretouched character details. NO BEAUTY FILTERS. REMOVE all elements of [1]'s original background and clothes. Realistic DSLR style.",

  // 03 - PREMIUM
  'premium': "A high-fidelity RAW full body photo of [1] seated in a luxury office armchair. AUTHENTIC STUDIO LIGHTING. Cinematic contrast, deep bokeh background. NO AIRBRUSHING on face. DISCARD original gaming chair, clothes, and curtains. [1] DRESSED IN a black executive suit and tie.",

  // 04 - INTERNACIONAL
  'internacional': "Full body photo of [1] seated in a designer chair in a COMPLETELY NEW urban architectural background. AUTHENTIC professional lighting. NO SKIN FILTER. REMOVE original selfie context and clothes. [1] DRESSED IN a professional dark suit, absolute subject separation, RAW photography.",

  // 05 - FEMININO
  'feminino': "A high-end professional full body photo of [1] seated elegantly in a luxury chair in a NEW elegant studio office. AUTHENTIC soft lighting. NO BEAUTY RETOUCHING. REMOVE all original background objects and clothes from [1]. [1] DRESSED IN a tailored blazer, natural skin character.",

  // 06 - SMART CASUAL
  'smart_casual': "A candid-style professional full body photo of [1] seated casually in a modern office chair. AUTHENTIC lighting. NO SKIN SMOOTHING. DELETE original home background and clothes of [1]. [1] DRESSED IN a structured blazer and white shirt, RAW texture.",

  // 07 - LUXO
  'luxo': "A prestigious RAW full body photo of [1] seated in a velvet luxury sofa. [1] DRESSED IN a black suit and tie. AUTHENTIC dramatic professional lighting, high contrast. NO FACE ALTERATIONS. DISCARD [1]'s original context and clothes. Realistic commercial photography.",

  // 08 - FINANCEIRO
  'financeiro': "A formal RAW full body photo of [1] seated in a luxury executive chair. [1] DRESSED IN a navy pinstripe suit and tie. AUTHENTIC studio illumination. NO BEAUTY FILTERS. DELETE [1]'s original lighting, clothes, and background objects. Identity mirror, natural skin.",

  // 09 - LINKEDIN
  'linkedin': "A clean professional full body LinkedIn photo of [1] seated in a professional office armchair. [1] DRESSED IN a business suit and tie. AUTHENTIC natural skin texture, visible pores, crisp details. NO SKIN SMOOTHING. REMOVE [1]'s original selfie background, clothes, and gaming chair.",

  // 10 - URBANO
  'urbano': "Realistic RAW full body photo of [1] seated in a stylish urban lounge chair. [1] DRESSED IN a navy suit and white shirt. AUTHENTIC cinematic lighting. NO BEAUTY RETOUCHING. DELETE [1]'s original home environment and clothes. Natural character style.",

  'sonhos': "A realistic RAW full body photo of [1] seated in an elegant chair in a new scene, authentic lighting, natural skin.",
  'custom': "A realistic RAW full body photo of [1] seated in a luxury armchair in a new scene, authentic lighting, natural skin."
};

module.exports = themePrompts;
