/**
 * VYXFOTOS.IA - PROTOCOLO DE FIDELIDADE GLOBAL (V17.0 - ESTÚDIO ELITE)
 * 
 * Regra: Aplicar iluminação de estúdio profissional e isolamento total em qualquer cenário.
 * Foco: Qualidade de Estúdio Fotográfico Comercial.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A high-end professional studio portrait of [1] wearing a navy blue executive suit. 3-point studio strobe lighting, softbox illumination, clean professional corporate background with deep bokeh. Professional DSLR 85mm lens, sharp focus on eyes, perfect subject separation from background. Discard original environment.",

  // 02 - MODERNO
  'moderno': "A professional corporate studio photo of [1] wearing a gray blazer. Modern minimalist office studio background, soft daylight studio lighting, realistic skin texture, professional composition. Identity of [1] preserved in a new professional light.",

  // 03 - PREMIUM
  'premium': "A prestigious RAW studio portrait of [1] wearing a custom black suit. Professional executive library studio setting, cinematic rim lighting, 85mm portrait lens, ultra-high resolution. Copy identity from [1] into this new elite light.",

  // 04 - INTERNACIONAL
  'internacional': "A cosmopolitan business studio portrait of [1] wearing a luxury suit. Blurred architectural studio backdrop, professional side lighting, authentic identity preservation. High-end commercial photography style.",

  // 05 - FEMININO
  'feminino': "A professional executive studio portrait of [1] wearing a luxury tailored blazer. Soft beauty studio lighting, elegant neutral background, sharp focus, consistent identity with [1].",

  // 06 - SMART CASUAL
  'smart_casual': "A modern tech-executive studio photo of [1] wearing a structured blazer. Clean startup studio environment, natural studio lighting, professional 85mm lens, clear separation of [1] from background.",

  // 07 - LUXO
  'luxo': "A prestigious high-contrast studio portrait of [1] wearing a black suit. Dark elegant studio background, warm dramatic professional lighting, realistic skin and hair texture. Absolute identity anchor.",

  // 08 - FINANCEIRO
  'financeiro': "A formal banking executive studio portrait of [1] wearing a navy suit. Traditional gray studio background, flat professional studio lighting, high resolution, faithful to [1].",

  // 09 - LINKEDIN
  'linkedin': "A clean professional LinkedIn studio headshot of [1] wearing a business suit. Neutral studio background, soft daylight illumination, direct professional gaze, unretouched identity.",

  // 10 - URBANO
  'urbano': "A modern professional studio portrait of [1] wearing a navy suit. Blurred city metropolis studio backdrop, golden hour studio lighting, cinematic 85mm look, realistic subject extraction.",

  'sonhos': "A realistic professional studio portrait of [1].",
  'custom': "A realistic professional studio portrait of [1]."
};

module.exports = themePrompts;
