/**
 * VYXFOTOS.IA - PROMPTS EQUILIBRADOS (V12.1) 
 * 
 * Foco: Forçar a transformação do traje e cenário mantendo a identidade [1].
 * Prioridade: Ação/Outro cenário primeiro, identidade depois.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "A high-quality 85mm DSLR photo of [1] wearing an expensive deep navy blue executive suit, white dress shirt and silk tie. Professional corporate office background, natural lighting, blurred bokeh, 4k resolution.",

  // 02 - MODERNO
  'moderno': "A professional business portrait of [1] wearing a charcoal gray suit jacket, no tie, modern office setting, soft natural light, 85mm lens.",

  // 03 - PREMIUM
  'premium': "A prestigious executive portrait of [1] wearing a black tailor-made suit, gold cufflinks, blurred luxury office library, cinematic lighting, ultra-realistic.",

  // 04 - INTERNACIONAL
  'internacional': "A cosmopolitan executive portrait of [1] wearing a high-end brown suit, blurred modern architecture background, Rembrandt side lighting.",

  // 05 - FEMININO
  'feminino': "A professional business photo of [1] wearing a luxury tailored blazer, elegant office background, soft studio lighting, high resolution.",

  // 06 - SMART CASUAL
  'smart_casual': "A modern professional portrait of [1] wearing a structured blazer over a premium shirt, startup office background, clean minimal aesthetic.",

  // 07 - LUXO
  'luxo': "A luxury portrait of [1] wearing a deep black executive suit, elegant dark studio background, golden rim lighting, prestigious look.",

  // 08 - FINANCEIRO
  'financeiro': "A formal executive portrait of [1] wearing a navy pinstripe suit, traditional gray office background, professional flat lighting.",

  // 09 - LINKEDIN
  'linkedin': "A clean professional LinkedIn headshot of [1] wearing a sharp business suit, neutral background, direct gaze, professional corporate look.",

  // 10 - URBANO
  'urbano': "A modern executive photo of [1] wearing a navy suit, blurred city metropolis background, sunset golden hour lighting, cinematic bokeh.",

  'sonhos': "A cinematic artistic portrait of [1].",
  'custom': "A professional portrait of [1]."
};

module.exports = themePrompts;
