export default {
  id: 'social',
  name: 'Društvo',
  stat: 'social',
  icon: 'Social',
  color: 'var(--pink)',
  soft: 'var(--cream-2)',
  order: 50,
  flavor: 'Ljudi se ne pojave sami',
  defaultQuests: [
    { name: 'Pošalji poruku starom drugu',  difficulty: 'easy',   schedule: 'daily'  },
    { name: 'Pozovi nekoga na kafu',        difficulty: 'medium', schedule: 'weekly' },
    { name: 'Druženje uživo',               difficulty: 'hard',   schedule: 'weekly' },
    { name: 'Organizuj okupljanje',         difficulty: 'epic',   schedule: 'epic'   },
  ],
};
