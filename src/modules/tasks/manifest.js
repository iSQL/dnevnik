export default {
  id: 'tasks',
  name: 'Zadaci',
  stat: 'discipline',
  icon: 'Notes',
  color: 'var(--sky)',
  soft: '#D5F1FF',
  order: 40,
  flavor: 'Sitne pobede se broje',
  defaultQuests: [
    { name: 'Isprazni inbox',    difficulty: 'easy',   schedule: 'daily' },
    { name: 'Plati račune',      difficulty: 'medium', schedule: 'weekly' },
    { name: 'Pospremi radni sto', difficulty: 'easy',   schedule: 'weekly' },
  ],
};
