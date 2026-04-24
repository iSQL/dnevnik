export default {
  id: 'education',
  name: 'Učenje',
  stat: 'intellect',
  icon: 'Education',
  color: 'var(--violet)',
  soft: 'var(--violet-soft)',
  order: 20,
  flavor: 'Mozak voli izazov',
  defaultQuests: [
    { name: 'Pročitaj 20 strana',     difficulty: 'medium', schedule: 'daily' },
    { name: 'Reši 5 zadataka',        difficulty: 'medium', schedule: 'daily' },
    { name: 'Završi jednu lekciju',    difficulty: 'hard',   schedule: 'daily' },
    { name: 'Pogledaj jedan kurs do kraja', difficulty: 'epic', schedule: 'epic' },
  ],
};
