/**
 * VYXFOTOS.IA - PROMPTS DE TELETRANSPORTE (V16.1 - CENÁRIO FORÇADO)
 * 
 * Regra: Forçar a IA a ignorar o fundo original e teletransportar o rosto para um novo ambiente.
 */

const themePrompts = {
  // 01 - CLASSICO
  'executivo': "The person [1] in a COMPLETELY NEW SETTING: a High-end corporate office background. The person is wearing a navy blue executive suit. 85mm RAW photo, ignore original background of [1], zero retouching on face.",

  // 02 - MODERNO
  'moderno': "The person [1] in a NEW ENVIRONMENT: a modern office background. Wearing a gray blazer, no tie. RAW photo, ignore [1]'s original background, exact face preservation.",

  // 03 - PREMIUM
  'premium': "A high-fidelity RAW photo of [1] in a NEW SCENE: a luxury executive library background. Wearing a black suit. Discard [1]'s original background, identity mirror of [1].",

  // 04 - INTERNACIONAL
  'internacional': "The person [1] teletransported to a NEW SETTING: a modern architectural blurred city background. Wearing a professional suit. Ignore [1]'s selfie background.",

  // 05 - FEMININO
  'feminino': "The person [1] in a NEW PROFESSIONAL SETTING: elegant office background. Wearing a tailored blazer. RAW photo, ignore original background and clothing of [1].",

  // 06 - SMART CASUAL
  'smart_casual': "The person [1] in a NEW CORPORATE SETTING: clean startup office. Wearing a blazer and white shirt. Ignore [1]'s original gaming chair or bedroom background.",

  // 07 - LUXO
  'luxo': "A prestigious RAW portrait of [1] in a NEW ELEGANT SCENE: dark professional background. Wearing a black suit. Absolute identity mirror, discard selfie background.",

  // 08 - FINANCEIRO
  'financeiro': "The person [1] in a NEW FORMAL SETTING: traditional gray office background. Wearing a navy suit. Identity mirror, ignore original context of [1].",

  // 09 - LINKEDIN
  'linkedin': "A professional RAW headshot of [1] in a NEW NEUTRAL SETTING: soft office background. Wearing a business suit. Natural lighting, ignore original selfie background.",

  // 10 - URBANO
  'urbano': "The person [1] in a NEW URBAN SETTING: blurred metropolis metropolis background. Wearing a navy suit. Golden hour, ignore [1]'s original bedroom context.",

  'sonhos': "A RAW realistic photo of [1] in a new scene.",
  'custom': "A RAW realistic photo of [1] in a new scene."
};

module.exports = themePrompts;
