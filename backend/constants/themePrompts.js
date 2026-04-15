/**
 * VYXFOTOS.IA - GUIA COMPLETO DE PROMPTS (V9.1)
 * Tema: Fotos Executivas Profissionais
 * 
 * Este arquivo contém o Núcleo de Fidelidade Facial e as 10 variações temáticas
 * extraídas do Guia Oficial de Prompts da Vyxfotos.
 */

const FIDELIDADE_BASE = "Brazilian person with warm skin tone and dark features. CRITICAL: this person MUST be EXACTLY the same as the reference photo - same face, same hair, same eyes, same nose, same mouth, same eyebrows, same skin texture with visible pores, same facial symmetry. Same person, same face, same features as reference photo [1]. No skin smoothing, no fake filters, 100% photorealistic.";

const themePrompts = {
  // 01 - CLASSICO
  'executivo': `${FIDELIDADE_BASE} Outfit: tailored mens executive suit in deep navy blue, white dress shirt, silk tie. Confident and composed expression. Upright posture, shoulders slightly back. Lighting: Professional three-point studio lighting: 45-degree key light, soft fill light eliminating harsh shadows, subtle rim light separating subject from background. Rendering: Realistic skin texture - visible pores, natural imperfections, realistic subsurface scattering. Background: Seamless studio gradient in neutral light gray (#E8E8E8), shallow depth of field, full face focus, bokeh background. Camera: 85mm portrait lens, f/2.2, ISO 100, studio strobe, eye-level framing. Quality: 4K RAW quality, zero artificial retouching, zero AI artifacts. Professional high-level corporate studio photography.`,

  // 02 - MODERNO
  'moderno': `${FIDELIDADE_BASE} Outfit: contemporary mens executive suit in charcoal gray, light blue or white dress shirt, no tie - modern and sophisticated style. Slightly relaxed, accessible expression. Lighting: High-key studio lighting: broad and soft main light, almost total fill, very light shadows. Warm skin tone preserved. Pores and skin texture visible with photographic naturalness. Background: soft off-white (#F5F5F0), seamless, slight vignette gradient at edges. Absolute focus on face. Camera: 85mm f/2.0 lens, shoulder-up framing. 4K resolution, RAW finish, zero skin smoothing, zero duplicate elements.`,

  // 03 - PREMIUM
  'premium': `${FIDELIDADE_BASE} Outfit: premium executive suit in black or anthracite, white dress shirt, discrete cufflinks. High-level board of directors look. Natural authoritative posture. Lighting: Mixed lighting: natural lateral window light combined with professional fill light, creating dramatic and elegant lighting. Real skin texture, pores, natural reflections. Background: modern corporate office completely blurred in bokeh (bookshelves, glass windows, warm ambient lighting). Extremely shallow depth of field. Camera: 85mm f/1.8, eyes in critical focus with natural catchlights. Mid-bust shot. 4K, RAW quality, zero artificiality, zero artifacts.`,

  // 04 - INTERNACIONAL
  'internacional': `${FIDELIDADE_BASE} Outfit: mens executive suit in dark brown or forest green tones, neutral tone dress shirt. Discrete pocket square. Cosmopolitan and sophisticated look. Lighting: Dramatic lateral window light (adapted Rembrandt lighting), soft fill on the opposite side. Skin texture, pores and micro-expressions fully preserved. Background: textured concrete wall or exposed brick gently blurred, warm neutral tones. Shallow depth of field. Camera: 85mm f/2.2, three-quarter framing (torso slightly turned). Eyes with natural catchlights. 4K RAW, total photographic realism, no filters or smoothing.`,

  // 05 - FEMININO
  'feminino': `${FIDELIDADE_BASE} Outfit: womens tailored blazer in off-white, cream or navy blue with internal silk shirt. Discrete jewelry (small earrings, thin necklace). Naturally styled hair. Confident and charismatic expression. Lighting: Three-point studio lighting with soft key light at 45 degrees, diffuse fill, rim light outlining face and hair. Natural skin texture, pores visible, no retouch. Background: neutral gray or soft beige (#E5E2DD) seamless, light vignette. Full focus on features. Camera: 85mm f/2.2 at eye level. Natural catchlights in eyes. Bust shot. 4K, RAW finish, zero smoothing, professional business editorial quality.`,

  // 06 - SMART CASUAL
  'smart_casual': `${FIDELIDADE_BASE} Outfit: smart casual executive - structured blazer over premium basic t-shirt or casual shirt with open collar. Black, white or gray palette. No tie. High-level startup or tech C-level style. Lighting: Broad and diffuse natural studio lighting, almost shadowless. Natural skin tone, skin texture and pores preserved with photographic realism. Background: pure white or very light gray (#EFEFEF), seamless. Clean and contemporary image. Camera: 85mm f/2.5, shoulder-up framing. Light and accessible expression with natural confidence. 4K RAW, zero artificial processing, zero duplicate elements.`,

  // 07 - LUXO
  'luxo': `${FIDELIDADE_BASE} Outfit: executive suit in deep black, white shirt, discrete gold accessory (cufflinks, watch). High impact and prestige visual. Lighting: Key light with soft amber gel creating warm and dramatic golden light, white rim light outlining the profile. Controlled contrast. Flawless skin texture with visible natural pores. Background: deep black or very dark gray (#1A1A1A), seamless. Elegant dark bokeh. Camera: 85mm f/2.0, slightly tilted bust shot. Golden catchlights in eyes. 4K maximum resolution, RAW finish, luxury corporate advertising campaign quality.`,

  // 08 - FINANCEIRO
  'financeiro': `${FIDELIDADE_BASE} Outfit: strictly formal executive suit in thin navy blue or dark gray stripes, white button-down dress shirt, classic tie. Impeccable investment bank or law firm presentation. Lighting: Traditional three-point studio lighting, no drama - functional and professional. Real skin texture, pores, no retouching or artificial smoothing. Background: neutral blue-gray (#D8DCE0) or seamless medium gray. Traditional and sober. Camera: 85mm f/2.8, centered eye-level framing. Serious and reliable expression. 4K RAW, zero artifacts, high-standard corporate photography quality.`,

  // 09 - LINKEDIN
  'linkedin': `${FIDELIDADE_BASE} Outfit: well-fitted professional suit or blazer in navy blue or black, light shirt/blouse. Optimized LinkedIn profile photo look in high quality. Lighting: Soft studio lighting with abundant fill, light and natural shadows. Accessible, confident and friendly expression - direct look at camera. Natural skin texture, visible pores, no filters. Background: soft gray-blue (#C8D5E0) or soft blue-gray gradient, seamless. Clean and professional visual for digital environment. Camera: 85mm f/2.2, shoulder-to-shoulder framing, standardized head space. 4K, RAW, zero artificial processing. Premium headshot quality.`,

  // 10 - URBANO
  'urbano': `${FIDELIDADE_BASE} Outfit: elegant executive suit in navy blue or gray, t-shirt or open shirt underneath, no tie. Modern urban executive style. Lighting: Simulated natural outdoor light in studio (soft golden hour), warm lateral light with diffuse fill. Photojournalistic skin quality - real texture, pores, no retouching. Background: completely blurred modern metropolis in bokeh - skyscrapers, windows, urban lights in circular bokeh. Extremely shallow depth of field. Camera: 85mm f/1.8, mid-bust shot, subject slightly off-center to the right by rule of thirds. Warm catchlights in eyes. 4K RAW, total realism, zero AI artifacts.`,

  // Variação livre do usuário
  'sonhos': `${FIDELIDADE_BASE}`,
  'custom': `${FIDELIDADE_BASE}`
};

module.exports = themePrompts;
