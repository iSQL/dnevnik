export default {
  id: 'workout',
  name: 'Trening',
  stat: 'fitness',
  icon: 'Workout',
  color: 'var(--fire)',
  soft: 'var(--fire-soft)',
  order: 10,
  flavor: 'Umereno nabildovan',
  defaultQuests: [
    { name: 'Uradi 20 sklekova', difficulty: 'easy',   schedule: 'daily' },
    { name: 'Trčanje 30 minuta', difficulty: 'medium', schedule: 'daily' },
    { name: 'Večernje istezanje', difficulty: 'easy',   schedule: 'daily' },
    { name: 'Plank 2 minuta',    difficulty: 'hard',   schedule: 'weekly' },
  ],
};
