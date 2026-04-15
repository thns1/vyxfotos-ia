/**
 * VYXFOTOS.IA - PROMPTS V31.0
 *
 * BASE: V22.0 aprovada (motor intacto).
 * ÚNICA MUDANÇA: Adicionado "WIDE ANGLE SHOT, camera pulled far back, show full body head to knees"
 * para forçar o afastamento da lente sem remover o Face Mesh.
 *
 * NÃO ALTERAR SEM APROVAÇÃO DO USUÁRIO.
 */

const themePrompts = {
  // 01 - EXECUTIVO
  'executivo': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a luxury leather executive armchair, showing head, torso, legs and feet. [1] DRESSED IN a navy blue executive suit. AUTHENTIC STUDIO LIGHTING. Visible skin pores, natural unretouched skin texture. NO SKIN SMOOTHING. The entire original background and clothing of [1] is DELETED and replaced by a luxury office. 8k RAW photography.",

  // 02 - MODERNO
  'moderno': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a contemporary luxury chair, showing head to knees. [1] DRESSED IN a gray blazer and crisp white shirt. AUTHENTIC RAW RELIGHTING. Visible skin textures, unretouched. NO BEAUTY FILTERS. REMOVE all elements of [1]'s original background and clothes. Realistic DSLR style.",

  // 03 - PREMIUM
  'premium': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a luxury office armchair, showing head to feet. AUTHENTIC STUDIO LIGHTING. Cinematic contrast, deep bokeh background. NO AIRBRUSHING on face. DISCARD original gaming chair, clothes, and curtains. [1] DRESSED IN a black executive suit and tie.",

  // 04 - INTERNACIONAL
  'internacional': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a designer chair, showing head to knees. COMPLETELY NEW urban architectural background. AUTHENTIC professional lighting. NO SKIN FILTER. REMOVE original selfie context and clothes. [1] DRESSED IN a professional dark suit, RAW photography.",

  // 05 - FEMININO
  'feminino': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated elegantly in a luxury chair, showing head to feet. AUTHENTIC soft lighting. NO BEAUTY RETOUCHING. REMOVE all original background objects and clothes from [1]. [1] DRESSED IN a tailored blazer, natural skin character.",

  // 06 - SMART CASUAL
  'smart_casual': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated casually in a modern office chair, showing head to knees. AUTHENTIC lighting. NO SKIN SMOOTHING. DELETE original home background and clothes of [1]. [1] DRESSED IN a structured blazer and white shirt, RAW texture.",

  // 07 - LUXO
  'luxo': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a velvet luxury sofa, showing head to feet. [1] DRESSED IN a black suit and tie. AUTHENTIC dramatic professional lighting, high contrast. NO FACE ALTERATIONS. DISCARD [1]'s original context and clothes. Realistic commercial photography.",

  // 08 - FINANCEIRO
  'financeiro': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a luxury executive chair, showing head to knees. [1] DRESSED IN a navy pinstripe suit and tie. AUTHENTIC studio illumination. NO BEAUTY FILTERS. DELETE [1]'s original lighting, clothes, and background objects. Natural skin.",

  // 09 - LINKEDIN
  'linkedin': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a professional office armchair, showing head to feet. [1] DRESSED IN a business suit and tie. AUTHENTIC natural skin texture, visible pores. NO SKIN SMOOTHING. REMOVE [1]'s original selfie background, clothes, and gaming chair.",

  // 10 - URBANO
  'urbano': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a stylish urban lounge chair, showing head to knees. [1] DRESSED IN a navy suit and white shirt. AUTHENTIC cinematic lighting. NO BEAUTY RETOUCHING. DELETE [1]'s original home environment and clothes.",

  'sonhos': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in an elegant chair, showing head to feet. Authentic lighting, natural skin.",
  'custom': "WIDE ANGLE SHOT, camera pulled far back. Full body photo of [1] seated in a luxury armchair, showing head to feet. Authentic lighting, natural skin."
};

module.exports = themePrompts;
