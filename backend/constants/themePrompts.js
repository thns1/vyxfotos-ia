/**
 * VYXFOTOS.IA - PROMPTS V34.0 (ULTRA-FIDELITY STUDIO RESTORATION)
 * 
 * BASE: O Prompt de Elite fornecido pelo usuário.
 * FOCO: Retrato executivo de altíssimo padrão, 85mm, RAW, sem filtros.
 */

const studioPromptBase = "Ultra-realistic professional executive portrait photograph of a Brazilian person with warm skin tone and dark features. CRITICAL: this person must be EXACTLY the same individual as in the reference photo [1] — identical facial structure, same hair texture, color and length, same eye shape and color, same nose bridge width and tip shape, same lip contour and thickness, same eyebrow arch, density and spacing, same ear shape and placement, same jawline, same cheekbones, same skin tone and visible pores, same facial symmetry. Every single facial feature must be a perfect match to the reference [1]. Same person, same face, same features as reference photo [1]. Subject wearing a tailored men executive suit in deep navy/charcoal, crisp white dress shirt, premium silk tie. Confident, composed expression with natural micro-expressions preserved. Posture: straight, authoritative, shoulders slightly back. Studio lighting setup: three-point professional lighting (key light at 45° angle, soft fill light eliminating harsh shadows, subtle rim light separating subject from background). Lighting renders skin texture with photographic realism — visible pores, natural skin imperfections, realistic subsurface scattering. Background: clean seamless studio gradient in neutral light gray (#E8E8E8), shallow depth of field with subject in razor-sharp focus, bokeh on background. Camera: 85mm portrait lens, f/2.2 aperture, ISO 100, studio strobe. Shot at eye level. Full sharpness on face, eyes in critical focus with natural catchlights. Output: 4K resolution, RAW-quality finish, zero artificial smoothing or skin retouching, no AI artifacts, no blurring of facial features, no duplicate elements in background. Professional headshot quality equivalent to top-tier corporate photography studio.";

const themePrompts = {
  'executivo': studioPromptBase,
  'moderno': studioPromptBase.replace("neutral light gray (#E8E8E8)", "modern luxury office blurred background"),
  'premium': studioPromptBase.replace("neutral light gray (#E8E8E8)", "high-end luxury penthouse blurred background"),
  'internacional': studioPromptBase.replace("neutral light gray (#E8E8E8)", "premium urban architectural background"),
  'feminino': studioPromptBase.replace("men executive suit", "women tailored blazer").replace("Brazilian person", "Brazilian woman"),
  'smart_casual': studioPromptBase.replace("men executive suit", "modern casual blazer").replace("neutral light gray (#E8E8E8)", "modern tech office"),
  'luxo': studioPromptBase.replace("neutral light gray (#E8E8E8)", "prestigious library background"),
  'financeiro': studioPromptBase,
  'linkedin': studioPromptBase,
  'urbano': studioPromptBase.replace("neutral light gray (#E8E8E8)", "cinematic urban background"),
  'sonhos': studioPromptBase,
  'custom': studioPromptBase
};

module.exports = themePrompts;
