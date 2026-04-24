export const STATS = ['fitness', 'intellect', 'discipline', 'creativity', 'social', 'wellbeing'];

export const STAT_LABELS = {
  fitness:    'Kondicija',
  intellect:  'Intelekt',
  discipline: 'Disciplina',
  creativity: 'Kreativnost',
  social:     'Društvenost',
  wellbeing:  'Blagostanje',
};

export const STAT_COLORS = {
  fitness:    'var(--fire)',
  intellect:  'var(--violet)',
  discipline: 'var(--coin)',
  creativity: 'var(--mint)',
  social:     'var(--pink)',
  wellbeing:  'var(--lavender)',
};

export const STAT_TINTS = {
  fitness:    'fire',
  intellect:  'violet',
  discipline: 'coin',
  creativity: 'mint',
  social:     'pink',
  wellbeing:  'violet',
};

export const DIFFICULTIES = [
  { id: 'easy',   label: 'Lako',     xp: 10,  tint: 'var(--leaf)'  },
  { id: 'medium', label: 'Srednje',  xp: 25,  tint: 'var(--coin)'  },
  { id: 'hard',   label: 'Teško',    xp: 60,  tint: 'var(--fire)'  },
  { id: 'epic',   label: 'Epsko',    xp: 150, tint: 'var(--violet)'},
];

export const xpForDifficulty = (id) =>
  DIFFICULTIES.find((d) => d.id === id)?.xp ?? 10;

// Quadratic-ish curve: cheap early, compounding later.
//   level 1 → 200 XP, level 2 → 600, level 3 → 1200, level 4 → 2000…
export const xpForLevel = (n) => 100 * n * (n + 1);

export const levelFromXp = (xp) => {
  let lvl = 0;
  while (xpForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
};

export const xpProgress = (xp) => {
  const lvl = levelFromXp(xp);
  const base = xpForLevel(lvl);
  const next = xpForLevel(lvl + 1);
  return {
    level: lvl,
    intoLevel: xp - base,
    span: next - base,
    pct: ((xp - base) / (next - base)) * 100,
    nextAt: next,
  };
};
