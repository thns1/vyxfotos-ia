/**
 * VYXFOTOS.IA - GUIA COMPLETO DE PROMPTS (V10.1)
 * Tema: Fotos Executivas Profissionais
 * 
 * V10.1: Correção de enquadramento (mid-bust shot) e bokeh aprimorado.
 * Removido "full face focus" que causava enquadramento de passaporte.
 */

// Núcleo de fidelidade - âncora do rosto na foto [1]
const FIDELIDADE_BASE = "The EXACT same person from reference photo [1]: same face shape, same eye color, same nose, same mouth, same skin tone, same hair color and style, same beard if present. PRESERVE all facial features and proportions identically — no distortion, no idealization. Photorealistic portrait with natural skin texture, visible pores, natural imperfections. SAME eye color as reference — do NOT change or enhance eyes.";

// Enquadramento padrão para todos os temas executivos
const ENQUADRAMENTO = "Framing: MID-BUST SHOT showing face, neck, shoulders and upper chest with suit visible. NOT a headshot. Natural, relaxed posture. Expression: serious and professional yet natural — relaxed neutral mouth, calm direct eye contact with camera, composed confident look without over-dramatization. Natural, candid feel.";

const themePrompts = {
  // 01 - CLASSICO (Default - Poder Executivo)
  'executivo': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: tailored executive suit in deep navy blue, crisp white dress shirt, silk tie. Lighting: soft natural window light from the side, gentle fill light on the opposite side — balanced, low-contrast, no harsh shadows. Think natural daylight studio, not dramatic stage lighting. Background: seamless neutral light gray (#E8E8E8), soft shallow depth of field bokeh. Camera: 85mm portrait lens, f/2.8, ISO 200. Quality: 4K photorealistic, natural skin color, zero over-processing. Corporate studio photography with a natural feel.`,

  // 02 - MODERNO
  'moderno': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: contemporary executive suit in charcoal gray, light blue dress shirt, no tie — modern sophisticated style. Relaxed accessible expression. Lighting: high-key studio lighting, broad soft main light, very light shadows. Background: soft off-white (#F5F5F0), seamless, slight vignette at edges. Camera: 85mm f/2.0, shoulder-up framing. 4K RAW finish, zero skin smoothing.`,

  // 03 - PREMIUM
  'premium': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: premium executive suit in black or anthracite, white dress shirt, discrete cufflinks. Board-of-directors look. Lighting: natural lateral window light combined with professional fill light, dramatic and elegant. Background: modern corporate office blurred in deep bokeh — bookshelves, glass windows, warm ambient lighting. Extremely shallow depth of field. Camera: 85mm f/1.8, eyes in critical focus with natural catchlights. 4K RAW quality.`,

  // 04 - INTERNACIONAL
  'internacional': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: executive suit in dark brown or forest green, neutral dress shirt, discrete pocket square. Cosmopolitan look. Lighting: dramatic lateral Rembrandt window light, soft fill opposite side. Background: blurred textured concrete wall or exposed brick, warm neutral tones. Shallow depth of field. Camera: 85mm f/2.2, three-quarter framing, torso slightly turned. 4K RAW total realism.`,

  // 05 - FEMININO
  'feminino': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: women's tailored blazer in off-white, cream or navy blue with silk shirt underneath. Discrete jewelry — small earrings, thin necklace. Naturally styled hair. Confident charismatic expression. Lighting: three-point studio lighting, soft 45-degree key light, diffuse fill, rim light outlining face and hair. Background: neutral gray or soft beige (#E5E2DD), seamless, light vignette. Camera: 85mm f/2.2 at eye level. 4K RAW, professional business editorial quality.`,

  // 06 - SMART CASUAL
  'smart_casual': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: smart casual — structured blazer over premium t-shirt or open collar shirt. Black, white or gray palette. No tie. Tech startup C-level style. Lighting: broad diffuse natural studio lighting, almost shadowless. Background: pure white or very light gray (#EFEFEF), seamless, clean contemporary image. Camera: 85mm f/2.5, shoulder-up framing. Light accessible expression with natural confidence. 4K RAW.`,

  // 07 - LUXO
  'luxo': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: executive suit in deep black, white shirt, discrete gold accessories — cufflinks, watch. High prestige visual. Lighting: key light with soft amber gel creating warm dramatic golden light, white rim light outlining the profile. Controlled contrast. Background: deep black (#1A1A1A), seamless studio, elegant dark bokeh. Camera: 85mm f/2.0, slightly tilted bust shot. Golden catchlights in eyes. 4K maximum resolution, luxury advertising campaign quality.`,

  // 08 - FINANCEIRO
  'financeiro': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: formal executive suit in navy blue pinstripes or dark gray, white button-down shirt, classic tie. Investment bank or law firm presentation. Lighting: traditional three-point studio lighting, functional professional. Background: neutral blue-gray (#D8DCE0) or seamless medium gray. Serious reliable expression. Camera: 85mm f/2.8, centered eye-level framing. 4K RAW, zero artifacts.`,

  // 09 - LINKEDIN
  'linkedin': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: well-fitted professional suit or blazer in navy blue or black, light shirt. Premium LinkedIn profile photo look. Lighting: soft studio lighting, abundant fill, natural shadows. Accessible confident friendly expression, direct eye contact with camera. Background: soft gray-blue (#C8D5E0) or soft blue-gray gradient, seamless. Camera: 85mm f/2.2, standardized headspace. 4K RAW. Premium headshot quality.`,

  // 10 - URBANO
  'urbano': `${FIDELIDADE_BASE} ${ENQUADRAMENTO} Outfit: executive suit in navy blue or gray, open shirt, no tie. Modern urban executive style. Lighting: simulated golden-hour natural outdoor light, warm lateral light with diffuse fill. Background: modern metropolis completely blurred in bokeh — skyscrapers, windows, urban lights in circular bokeh. Extremely shallow depth of field. Camera: 85mm f/1.8, subject slightly off-center by rule of thirds. 4K RAW total realism.`,

  // Variação livre do usuário
  'sonhos': `${FIDELIDADE_BASE} ${ENQUADRAMENTO}`,
  'custom': `${FIDELIDADE_BASE} ${ENQUADRAMENTO}`
};

module.exports = themePrompts;
