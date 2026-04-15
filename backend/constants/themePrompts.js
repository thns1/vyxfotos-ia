/**
 * VYXFOTOS.IA - PROMPTS V32.0 (ELITE SEATED FINAL)
 * Foco: Destruir o espelhamento da foto original.
 * Regra: Câmera afastada a 5 metros para mostrar corpo inteiro sentado.
 */

const themePrompts = {
  // 01 - EXECUTIVO
  'executivo': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT, camera 5 meters from subject. Full body photo showing [1] from head to toe, seated comfortably in a luxury leather executive armchair. [1] DRESSED IN a premium navy blue corporate suit. THE ENTIRE SELFIE BACKGROUND AND CHAIR IS ERASED AND REPLACED BY A MINIMALIST LUXURY OFFICE. Soft natural light. 8k resolution, unretouched skin.",

  // 02 - MODERNO
  'moderno': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT, camera far away. Full body photo of [1] seated in a modern designer chair. [1] DRESSED IN a sharp gray blazer. COMPLETELY DISCARD THE ORIGINAL SELFIE BACKGROUND AND CLOTHES. Professional office at sunset. High-fidelity skin texture, 8k.",

  // 03 - PREMIUM
  'premium': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT, full body head to knees. [1] seated in a prestigiou office sofa. [1] DRESSED IN a black executive suit and tie. IGNORE ALL PIXELS OF THE ORIGINAL GAMING CHAIR AND BACKGROUND. Luxury penthouse setting. Cinematic depth of field.",

  // 04 - INTERNACIONAL
  'internacional': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT, head to toe. [1] seated in a designer urban chair. COMPLETELY NEW architectural background. [1] DRESSED IN a professional dark suit. DELETE original home environment context from [1]. Natural light.",

  // 05 - FEMININO
  'feminino': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT, full length. [1] seated elegantly in a luxury office chair. [1] DRESSED IN a tailored designer blazer. REMOVE all elements of the original selfie background. Luxury minimalist studio.",

  // 06 - SMART CASUAL
  'smart_casual': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT. [1] seated casually in a contemporary office armchair. [1] DRESSED IN a structured blazer and shirt. DELETE home-office background from [1]. Real skin character, visible pores.",

  // 07 - LUXO
  'luxo': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT, camera far back. [1] seated in a velvet luxury sofa. [1] DRESSED IN a black tailored suit. DISCARD original context and chair of [1]. Prestigious moody lighting. High contrast RAW photography.",

  // 08 - FINANCEIRO
  'financeiro': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT, head to knees. [1] seated in an executive chair. [1] DRESSED IN a pinstripe suit. DELETE original lighting and clothes from [1]. Professional financial district background.",

  // 09 - LINKEDIN
  'linkedin': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT. [1] seated in a professional office armchair. [1] DRESSED IN a business suit. REMOVE [1]'s original background and gaming chair completely. High-fidelity identity, natural skin.",

  // 10 - URBANO
  'urbano': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT. [1] seated in a stylish urban lounge armchair. [1] DRESSED IN a navy suit and white shirt. DELETE original home-office furniture and clothes. Natural cinematic photo.",

  'sonhos': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT. [1] seated in an elegant scenario, head to toe. NEW clothes, NEW background, authentic identity.",
  'custom': "AUTHENTIC RAW PHOTOGRAPHY, WIDE ANGLE SHOT. [1] seated in a luxury armchair, full body head to toe. NEW scenario, NEW clothes, high fidelity face."
};

module.exports = themePrompts;
