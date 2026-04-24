export default {
  id: 'routines',
  name: 'Rutine',
  stat: 'discipline',
  icon: 'Routines',
  color: 'var(--coin)',
  soft: 'var(--coin-soft)',
  order: 30,
  flavor: 'Navike koje rade za tebe',
  defaultQuests: [
    { name: 'Popij 2L vode',           difficulty: 'easy',   schedule: 'daily' },
    { name: 'Lezi u krevet pre 23h',   difficulty: 'medium', schedule: 'daily' },
    { name: 'Jutarnja rutina',          difficulty: 'easy',   schedule: 'daily' },
    { name: 'Bez telefona pre spavanja', difficulty: 'hard',  schedule: 'daily' },
  ],
};
