/**
 * VYXFOTOS.IA - PROMPTS DE ANCORAGEM (V13.0 - FIDELIDADE ABSOLUTA)
 * 
 * Estratégia: Usar linguagem que proíbe a "standardization" da IA.
 * Foco em características reais e iluminação natural.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A high-quality 85mm dslr photo of [1] wearing a navy blue executive suit. This must be the EXACT person from [1] with the same elongated face shape, same nose, and same specific goatee. Natural daylight studio lighting, unretouched skin, authentic skin texture with pores. Professional office background, 4k resolution. No model-look filtering.",

  // 02 - MODERNO
  'moderno': "Natural office photo of [1] wearing a gray blazer, no tie. Realistic facial proportions of [1], natural lighting, soft background, 85mm lens. True to life identity preservation.",

  // 03 - PREMIUM
  'premium': "A realistic executive portrait of [1] in a black suit. High-end office setting, natural window lighting, extreme focus on the subject's original facial features from [1]. 4k RAW quality.",

  // 04 - INTERNACIONAL
  'internacional': "Authentic portrait of [1] in a professional suit. Natural lighting, blurred architecture, preserving the exact ethnic and facial characteristics of [1] without changes.",

  // 05 - FEMININO
  'feminino': "A realistic professional photo of [1] in a tailored blazer. Natural studio light, preserving the exact face shape and features of [1]. No smoothing, no beauty-filter effect.",

  // 06 - SMART CASUAL
  'smart_casual': "Real-life professional photo of [1] in a blazer and white shirt. Clean background, natural lighting, authentic skin and eyes. 85mm photography.",

  // 07 - LUXO
  'luxo': "A prestigious but realistic portrait of [1] in a black suit. Dark professional background, realistic skin highlights, exact facial match to [1].",

  // 08 - FINANCEIRO
  'financeiro': "A formal and true-to-life portrait of [1] in a pinstripe suit. Traditional gray background, natural professional lighting, zero face distortion.",

  // 09 - LINKEDIN
  'linkedin': "A natural LinkedIn profile headshot of [1] in a suit. Professional neutral background, soft daylight, preserving the exact likeness of [1].",

  // 10 - URBANO
  'urbano': "A realistic photo of [1] in a navy suit. City background in bokeh, natural golden hour light, authentic facial representation of [1].",

  'sonhos': "A realistic portrait of [1].",
  'custom': "A realistic portrait of [1]."
};

module.exports = themePrompts;
