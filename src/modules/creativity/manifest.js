export default {
  id: 'creativity',
  name: 'Kreativnost',
  stat: 'creativity',
  icon: 'Creativity',
  color: 'var(--mint)',
  soft: 'var(--green-soft)',
  order: 40,
  flavor: 'Ne čekaj inspiraciju',
  defaultQuests: [
    { name: 'Skiciraj nešto 10 minuta',     difficulty: 'easy',   schedule: 'daily'  },
    { name: 'Zapiši ideju u beležnicu',     difficulty: 'easy',   schedule: 'daily'  },
    { name: 'Sviraj instrument 20 minuta',  difficulty: 'medium', schedule: 'daily'  },
    { name: 'Završi kreativni projekat',    difficulty: 'epic',   schedule: 'epic'   },
  ],
};
