/**
 * VYXFOTOS.IA - PROMPTS DE ELITE (V11.0 - CALIBRAGEM THIAGO)
 * 
 * Regra: FIDELIDADE TOTAL BASEADA NO GUIA DO USUÁRIO.
 * Traduzido para Inglês técnico para máxima performance do motor Imagen 3.
 */

const FIDELIDADE_BLINDADA = "Brazilian person with warm skin tone and dark features. CRITICAL: this person MUST be EXACTLY the same as the reference photo [1] — same face, same hair, same eyes, same nose, same mouth, same eyebrows, same skin texture and visible pores, same facial symmetry. Same person, same face, same features as reference photo [1]. No distortion, no idealization, 100% photorealistic identity preservation.";

const themePrompts = {

  // 01 - CLASSICO (PROMPT SAGRADO)
  'executivo': `${FIDELIDADE_BLINDADA} Outfit: premium black or anthracite executive suit, white dress shirt, discrete cufflinks. High-level board of directors look. Natural authoritative posture. Lighting: Mixed lighting: dramatic and elegant natural window light combined with professional professional fill light. Real skin texture, visible pores, natural reflections. Background: modern corporate office completely blurred in bokeh (bookshelves, glass windows, warm ambient lighting). Extremely shallow depth of field. Camera: 85mm lens at f/1.8, eyes in critical focus with natural catchlights. Mid-bust shot. 4K, RAW quality, zero artificiality, zero artifacts.`,

  // 02 - MODERNO
  'moderno': `${FIDELIDADE_BLINDADA} Outfit: contemporary charcoal gray suit, light blue or white dress shirt, no tie — modern and sophisticated. Lighting: High-key studio lighting: broad soft main light, warm skin tone preserved. Background: soft off-white (#F5F5F0), seamless. Camera: 85mm lens at f/2.0, shoulder-up framing. 4K RAW, zero skin smoothing.`,

  // 03 - PREMIUM
  'premium': `${FIDELIDADE_BLINDADA} Outfit: premium executive suit, white dress shirt, discrete luxury watch and cufflinks. Lighting: Dramatic and elegant natural lateral window light. Background: Blurred modern corporate office with circular bokeh. Camera: 85mm lens at f/1.8, mid-bust shot. 4K RAW quality.`,

  // 04 - INTERNACIONAL
  'internacional': `${FIDELIDADE_BLINDADA} Outfit: dark brown or forest green suit, neutral dress shirt. Lighting: Dramatic lateral Rembrandt lighting. Background: Blurred textured concrete or exposed brick wall. Camera: 85mm lens at f/2.2, three-quarter framing. 4K RAW total realism.`,

  // 05 - FEMININO
  'feminino': `${FIDELIDADE_BLINDADA} Outfit: tailored women's blazer in off-white or navy, silk shirt, discrete jewelry. Lighting: Soft three-point studio lighting. Background: neutral gray or soft beige seamless. Camera: 85mm lens at eye level. 4K, RAW finish.`,

  // 06 - SMART CASUAL
  'smart_casual': `${FIDELIDADE_BLINDADA} Outfit: structured blazer over premium basic t-shirt, no tie. C-level tech style. Lighting: Broad and diffuse natural studio lighting. Background: pure white or very light gray seamless. Camera: 85mm lens at f/2.5. 4K RAW realism.`,

  // 07 - LUXO
  'luxo': `${FIDELIDADE_BLINDADA} Outfit: deep black suit, white shirt, discrete golden accessories. Lighting: Key light with soft amber gel, warm dramatic golden light. Background: deep black or dark gray seamless. Camera: 85mm lens at f/2.0, slightly tilted bust shot. 4K maximum resolution.`,

  // 08 - FINANCEIRO
  'financeiro': `${FIDELIDADE_BLINDADA} Outfit: navy blue pinstripe or dark gray suit, white button-down shirt, classic tie. Lighting: Traditional three-point studio lighting. Background: neutral blue-gray or medium gray. Camera: 85mm lens at f/2.8, centered eye-level framing. 4K RAW quality.`,

  // 09 - LINKEDIN
  'linkedin': `${FIDELIDADE_BLINDADA} Outfit: well-fitted suit or blazer, light shirt. Optimized for professional headshot. Lighting: Soft studio lighting with abundant fill. Background: soft gray-blue or blue-gray gradient. Camera: 85mm lens at f/2.2. 4K premium headshot quality.`,

  // 10 - URBANO
  'urbano': `${FIDELIDADE_BLINDADA} Outfit: elegant navy or gray suit, t-shirt or open shirt underneath. Lighting: Simulated golden hour natural outdoor light. Background: completely blurred modern metropolis bokeh. Camera: 85mm lens at f/1.8, mid-bust shot. 4K RAW total realism.`,

  'sonhos': `${FIDELIDADE_BLINDADA}. No skin smoothing, no distortion.`,
  'custom': `${FIDELIDADE_BLINDADA}. No skin smoothing, no distortion.`

};

module.exports = themePrompts;
