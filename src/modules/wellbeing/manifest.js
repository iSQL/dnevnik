export default {
  id: 'wellbeing',
  name: 'Blagostanje',
  stat: 'wellbeing',
  icon: 'Meditation',
  color: 'var(--lavender)',
  soft: 'var(--violet-soft)',
  order: 60,
  flavor: 'Pauza nije slabost',
  defaultQuests: [
    { name: 'Meditiraj 10 minuta',          difficulty: 'easy',   schedule: 'daily'  },
    { name: 'Spavaj bar 8 sati',            difficulty: 'medium', schedule: 'daily'  },
    { name: 'Šetnja u prirodi',             difficulty: 'easy',   schedule: 'daily'  },
    { name: 'Digital detox 1 sat',          difficulty: 'medium', schedule: 'daily'  },
    { name: 'Dan bez ekrana',               difficulty: 'epic',   schedule: 'epic'   },
  ],
};
