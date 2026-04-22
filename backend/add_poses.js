const fs = require('fs');

// Pool de 30 poses únicas - variadas e profissionais
const POSES_PROFISSIONAL = [
  "POSE: Standing confidently, arms relaxed at sides, slight natural weight shift.",
  "POSE: One hand resting in jacket pocket, other arm relaxed, grounded stance.",
  "POSE: Seated leaning slightly forward, forearms resting on knees, engaged.",
  "POSE: Standing turned 3/4 to camera, head facing forward, open shoulders.",
  "POSE: Leaning lightly against desk or surface, arms loosely at sides.",
  "POSE: Standing, hands clasped loosely in front at waist level.",
  "POSE: Seated at desk, arms resting naturally on surface, composed lean forward.",
  "POSE: Standing, one hand in pocket, other arm relaxed, confident body tilt.",
  "POSE: Seated, leaning back in chair, one arm on armrest, commanding presence.",
  "POSE: Standing, both hands in trouser pockets, shoulders relaxed and open.",
  "POSE: Standing near window, one shoulder angled, natural relaxed posture.",
  "POSE: Seated, legs loosely crossed, one hand resting on knee, composed.",
  "POSE: Standing, slight forward lean toward camera, warm and approachable.",
  "POSE: Standing, arms loosely behind back, upright and authoritative.",
  "POSE: Three-quarter body, standing, one hand adjusting jacket cuff naturally.",
  "POSE: Seated, hands folded on table, direct eye contact, poised.",
  "POSE: Standing, one hand resting lightly on back of chair beside them.",
  "POSE: Standing with slight profile angle, face turned confidently to camera.",
  "POSE: Seated at edge of desk, one foot grounded, relaxed yet commanding.",
  "POSE: Standing, fingers loosely interlaced at waist, calm and centered.",
  "POSE: Leaning forward with one hand on desk surface, dynamic stance.",
  "POSE: Standing, open posture, arms slightly away from body, approachable.",
  "POSE: Seated, body angled 3/4, face direct to camera, hand on armrest.",
  "POSE: Standing, weight on back leg, slight natural body lean, relaxed.",
  "POSE: Standing, one hand lightly touching lapel or collar, natural gesture.",
  "POSE: Seated forward, elbows on knees, hands clasped, focused intensity.",
  "POSE: Standing near surface, side profile body, face to camera, elegant.",
  "POSE: Standing, chin slightly lifted, chest open, strong upright posture.",
  "POSE: Seated, relaxed, one arm draped casually over chair back.",
  "POSE: Standing, half-turn to camera, one shoulder forward, dynamic energy.",
];

// Pool de poses para aniversário - mais festivas e variadas
const POSES_ANIVERSARIO = [
  "POSE: Standing elegantly, one hand holding a champagne glass at chest level.",
  "POSE: Seated gracefully on decorative chair, hands folded on lap, poised.",
  "POSE: Standing, one hand on hip, other arm relaxed, confident celebratory stance.",
  "POSE: Standing turned slightly sideways, glancing at camera with warm expression.",
  "POSE: Seated, legs crossed elegantly, hands resting on knee, refined.",
  "POSE: Standing, both hands holding clutch bag in front at waist, elegant.",
  "POSE: Standing near decorated element, one hand lightly touching it, natural.",
  "POSE: Standing, weight on one leg, slight hip tilt, graceful and feminine.",
  "POSE: Seated at table, hands loosely clasped, leaning slightly forward.",
  "POSE: Standing, one hand raised elegantly near shoulder, celebratory moment.",
  "POSE: Standing, arms loosely at sides, full gown on display, regal presence.",
  "POSE: Standing, holding small bouquet or accessory at waist level.",
  "POSE: Seated, elbows resting on surface, chin near clasped hands, dreamy.",
  "POSE: Standing, one hand in hair, other at side, candid glamour shot.",
  "POSE: Standing, slight three-quarter turn, looking over shoulder at camera.",
  "POSE: Seated on stairs or step, gown spread naturally, elegant and composed.",
  "POSE: Standing, arms softly in front, hands lightly clasped, graceful.",
  "POSE: Standing profile with face to camera, gown flowing, editorial feel.",
  "POSE: Standing, slight forward lean, hands clasped below waist, intimate.",
  "POSE: Seated, back straight, one hand on armrest, other on lap, regal.",
  "POSE: Standing near window light, arm resting against frame, cinematic.",
  "POSE: Standing, holding glass of champagne raised slightly, toasting gesture.",
  "POSE: Seated, crossed legs, elbow on knee, chin resting on hand, thoughtful.",
  "POSE: Standing, one hand on hip, other holding accessory, commanding.",
  "POSE: Standing turned 3/4, head toward camera, shoulders open, editorial.",
  "POSE: Seated, leaning back with quiet confidence, one arm along chair back.",
  "POSE: Standing, looking slightly upward, aspirational and celebratory.",
  "POSE: Standing, hands loosely at sides, full look visible, effortless poise.",
  "POSE: Seated on chaise or sofa, legs angled, arm along back, luxurious.",
  "POSE: Standing, slight smile in posture, champagne flute in one hand, festive.",
];

// Lê o arquivo original
let content = fs.readFileSync('./constants/themePrompts.js', 'utf8');

// Função para adicionar pose a um prompt
function addPoseToPrompt(prompt, posePool, index) {
  const pose = posePool[index % posePool.length];
  // Adiciona POSE no início, antes de qualquer outra coisa
  return pose + ' ' + prompt;
}

// Temas profissionais (executivo + luxo)
const TEMAS_PROFISSIONAL = [
  'executivo_classico', 'executivo_moderno', 'executivo_premium', 'executivo_internacional',
  'luxo_classico', 'luxo_dourado', 'luxo_noir', 'luxo_branco'
];

// Temas de aniversário
const TEMAS_ANIVERSARIO = [
  'aniversario_vip', 'aniversario_princesa', 'aniversario_debutante', 'aniversario_moderno',
  'aniversario_vip_masculino', 'aniversario_moderno_masculino', 
  'aniversario_princesa_masculino', 'aniversario_debutante_masculino'
];

const { themePrompts } = require('./constants/themePrompts');

let updatedCount = 0;

// Processa cada tema
[...TEMAS_PROFISSIONAL, ...TEMAS_ANIVERSARIO].forEach(tema => {
  const prompts = themePrompts[tema];
  if (!prompts) return;
  
  const isAniversario = TEMAS_ANIVERSARIO.includes(tema);
  const posePool = isAniversario ? POSES_ANIVERSARIO : POSES_PROFISSIONAL;
  
  prompts.forEach((originalPrompt, i) => {
    // Evita adicionar pose dupla se já tiver POSE:
    if (originalPrompt.startsWith('POSE:')) return;
    
    const newPrompt = addPoseToPrompt(originalPrompt, posePool, i);
    
    // Escapa aspas para replace seguro
    const escaped = originalPrompt.replace(/[.*+?^${}()|[\]\]/g, '\$&').substring(0, 60);
    content = content.replace(originalPrompt, newPrompt);
    updatedCount++;
  });
});

fs.writeFileSync('./constants/themePrompts.js', content, 'utf8');
console.log('✅ Poses adicionadas: ' + updatedCount + ' prompts atualizados');
