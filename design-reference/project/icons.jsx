// Hand-drawn-feeling chunky icons for Dnevnik categories.
// All use 2.5 strokeWidth, round caps/joins, currentColor for strokes.

const Ico = ({ children, size = 28, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// Routines — sunrise clock
const IcoRoutines = (p) => (
  <Ico {...p}>
    <circle cx="16" cy="16" r="9" fill="#FFD93D" stroke={p.stroke || 'currentColor'}/>
    <path d="M16 11 L16 16 L19.5 18.5" />
    <path d="M16 4 V6" /><path d="M4 16 H6" /><path d="M28 16 H26" /><path d="M16 28 V26" />
  </Ico>
);

// Workout — dumbbell
const IcoWorkout = (p) => (
  <Ico {...p}>
    <rect x="3" y="12" width="3.5" height="8" rx="1" fill="#FF7A3D"/>
    <rect x="25.5" y="12" width="3.5" height="8" rx="1" fill="#FF7A3D"/>
    <rect x="7.5" y="9" width="4" height="14" rx="1.5" fill="#FF7A3D"/>
    <rect x="20.5" y="9" width="4" height="14" rx="1.5" fill="#FF7A3D"/>
    <path d="M11.5 16 H20.5" strokeWidth="3.5"/>
  </Ico>
);

// Education — book
const IcoEducation = (p) => (
  <Ico {...p}>
    <path d="M5 7 C5 6, 6 5, 7 5 H14 C15 5, 16 6, 16 7 V26 C16 25, 15 24, 14 24 H7 C6 24, 5 25, 5 26 Z" fill="#7C5CFF"/>
    <path d="M27 7 C27 6, 26 5, 25 5 H18 C17 5, 16 6, 16 7 V26 C16 25, 17 24, 18 24 H25 C26 24, 27 25, 27 26 Z" fill="#B58CFF"/>
    <path d="M8 10 H12.5" strokeWidth="2" stroke="#fff"/>
    <path d="M19.5 10 H24" strokeWidth="2" stroke="#fff"/>
  </Ico>
);

// Notes/Tasks — clipboard
const IcoNotes = (p) => (
  <Ico {...p}>
    <rect x="7" y="6" width="18" height="22" rx="2.5" fill="#3DC9FF"/>
    <rect x="11" y="3.5" width="10" height="5" rx="1.5" fill="#fff"/>
    <path d="M11 14 H19" stroke="#fff" strokeWidth="2"/>
    <path d="M11 19 H21" stroke="#fff" strokeWidth="2"/>
    <path d="M11 24 H16" stroke="#fff" strokeWidth="2"/>
  </Ico>
);

// Nutrition — apple
const IcoNutrition = (p) => (
  <Ico {...p}>
    <path d="M16 10 C12 7, 6 9, 6 16 C6 22, 10 28, 14 27 C15 26.5, 17 26.5, 18 27 C22 28, 26 22, 26 16 C26 9, 20 7, 16 10 Z" fill="#FF5CA8"/>
    <path d="M17 9 C17 7, 18 5, 20 4" stroke="#1F1A14" strokeWidth="2.5"/>
    <path d="M20 7 C22 7, 23 8.5, 23 10" stroke="#8BD94C" strokeWidth="2.5" fill="#8BD94C"/>
  </Ico>
);

// Meditation — lotus / zen
const IcoMeditation = (p) => (
  <Ico {...p}>
    <circle cx="16" cy="10" r="3.5" fill="#B58CFF"/>
    <path d="M6 22 C6 17, 10 14, 16 14 C22 14, 26 17, 26 22 Z" fill="#B58CFF"/>
    <path d="M3 22 H29" />
    <path d="M11 22 C11 19, 13 17, 16 17 C19 17, 21 19, 21 22" stroke="#fff" strokeWidth="2"/>
  </Ico>
);

// Sleep — moon
const IcoSleep = (p) => (
  <Ico {...p}>
    <path d="M22 4 C14 5, 8 11, 8 19 C8 25, 13 29, 19 28 C24.5 27, 28 22, 28 17 C24 20, 18 18, 18 12 C18 8, 20 5, 22 4 Z" fill="#5A3FE0"/>
    <circle cx="8" cy="7" r="1.2" fill="#FFC83D"/>
    <circle cx="5" cy="13" r="1" fill="#FFC83D"/>
  </Ico>
);

// Reading — open book
const IcoReading = (p) => (
  <Ico {...p}>
    <path d="M4 8 C8 7, 13 7, 16 10 C19 7, 24 7, 28 8 V24 C24 23, 19 23, 16 26 C13 23, 8 23, 4 24 Z" fill="#E8C794"/>
    <path d="M16 10 V26" />
    <path d="M7 12 H13" stroke="#1F1A14" strokeWidth="1.8"/>
    <path d="M7 16 H13" stroke="#1F1A14" strokeWidth="1.8"/>
    <path d="M19 12 H25" stroke="#1F1A14" strokeWidth="1.8"/>
    <path d="M19 16 H25" stroke="#1F1A14" strokeWidth="1.8"/>
  </Ico>
);

// Social — two heads
const IcoSocial = (p) => (
  <Ico {...p}>
    <circle cx="11" cy="11" r="4" fill="#FF7B9C"/>
    <circle cx="21" cy="13" r="3.5" fill="#FFC83D"/>
    <path d="M4 25 C4 20, 7 18, 11 18 C15 18, 18 20, 18 25" fill="#FF7B9C" stroke={p.stroke || 'currentColor'}/>
    <path d="M15 25 C15 21, 18 19, 21 19 C24 19, 27 21, 27 25" fill="#FFC83D" stroke={p.stroke || 'currentColor'}/>
  </Ico>
);

// Finance — coin stack
const IcoFinance = (p) => (
  <Ico {...p}>
    <ellipse cx="16" cy="22" rx="10" ry="3.5" fill="#FFC83D"/>
    <path d="M6 22 V17 C6 19, 10.5 20.5, 16 20.5 C21.5 20.5, 26 19, 26 17 V22" fill="#FFC83D"/>
    <ellipse cx="16" cy="17" rx="10" ry="3.5" fill="#FFD93D"/>
    <path d="M6 17 V12 C6 14, 10.5 15.5, 16 15.5 C21.5 15.5, 26 14, 26 12 V17" fill="#FFC83D"/>
    <ellipse cx="16" cy="12" rx="10" ry="3.5" fill="#FFD93D"/>
    <text x="16" y="14" textAnchor="middle" fontSize="5" fontWeight="900" fill="#1F1A14" stroke="none" fontFamily="Nunito">$</text>
  </Ico>
);

// Creativity — paint palette
const IcoCreativity = (p) => (
  <Ico {...p}>
    <path d="M16 4 C8 4, 4 10, 4 16 C4 22, 9 26, 14 26 C15.5 26, 16 25, 16 23.5 C16 22, 17 21, 18.5 21 C22 21, 28 19, 28 14 C28 8, 23 4, 16 4 Z" fill="#5CE0B8"/>
    <circle cx="10" cy="11" r="1.8" fill="#FF5CA8"/>
    <circle cx="16" cy="9" r="1.8" fill="#FFC83D"/>
    <circle cx="22" cy="11" r="1.8" fill="#7C5CFF"/>
    <circle cx="22" cy="16" r="1.8" fill="#FF7A3D"/>
  </Ico>
);

// Career — briefcase
const IcoCareer = (p) => (
  <Ico {...p}>
    <rect x="4" y="10" width="24" height="17" rx="2.5" fill="#8BD94C"/>
    <path d="M11 10 V7 C11 6, 12 5, 13 5 H19 C20 5, 21 6, 21 7 V10" />
    <path d="M4 17 H28" />
    <rect x="14" y="15" width="4" height="4" rx="0.8" fill="#1F1A14" stroke="none"/>
  </Ico>
);

// Fire streak
const IcoFire = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2 C13 6, 17 7, 17 12 C20 11, 20 15, 20 17 C20 20.5, 16.5 23, 12 23 C7.5 23, 4 20.5, 4 17 C4 14, 6 11, 8 10 C8 13, 10 13, 10 11 C10 8, 9 6, 12 2 Z"
      fill="#FF7A3D" stroke="#1F1A14" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 14 C13 15, 15 15.5, 15 17.5 C15 19.5, 13.5 20.5, 12 20.5 C10.5 20.5, 9 19.5, 9 17.5 C9 16, 10 16, 10.5 15"
      fill="#FFD93D" stroke="#1F1A14" strokeWidth="1.5"/>
  </svg>
);

// Coin (XP/gold)
const IcoCoin = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#FFC83D" stroke="#1F1A14" strokeWidth="2"/>
    <circle cx="12" cy="12" r="7" fill="#FFD93D" stroke="#1F1A14" strokeWidth="1.5"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1F1A14" fontFamily="Nunito">XP</text>
  </svg>
);

// Star
const IcoStar = ({ size = 20, fill = '#FFC83D' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="#1F1A14" strokeWidth="2" strokeLinejoin="round">
    <path d="M12 2 L14.5 8.5 L21.5 9 L16 13.5 L17.8 20.5 L12 16.8 L6.2 20.5 L8 13.5 L2.5 9 L9.5 8.5 Z"/>
  </svg>
);

// Lightning
const IcoBolt = ({ size = 16, fill = '#FFC83D' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="#1F1A14" strokeWidth="2" strokeLinejoin="round">
    <path d="M14 2 L5 13 H11 L10 22 L19 11 H13 Z"/>
  </svg>
);

// Plus
const IcoPlus = ({ size = 16, stroke = '#1F1A14' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
    <path d="M12 5 V19 M5 12 H19"/>
  </svg>
);

// Check
const IcoCheck = ({ size = 18, stroke = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5 L10 17 L19 7"/>
  </svg>
);

// Chevron left/right
const IcoChev = ({ dir = 'left', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === 'left' ? 'M15 6 L9 12 L15 18' : 'M9 6 L15 12 L9 18'}/>
  </svg>
);

// Home tab icons — simple filled
const TabHome = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#7C5CFF' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
    <path d="M3 11 L12 3 L21 11 V20 C21 20.5, 20.5 21, 20 21 H15 V14 H9 V21 H4 C3.5 21, 3 20.5, 3 20 Z"/>
  </svg>
);
const TabQuests = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#7C5CFF' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
    <path d="M5 4 H19 L17 9 L19 14 H5 V4 Z"/>
    <path d="M5 14 V21"/>
  </svg>
);
const TabStats = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#7C5CFF' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="13" width="4" height="7" />
    <rect x="10" y="8" width="4" height="12" />
    <rect x="16" y="4" width="4" height="16" />
  </svg>
);
const TabAch = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#7C5CFF' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
    <path d="M6 3 H18 V10 C18 14, 15 17, 12 17 C9 17, 6 14, 6 10 Z"/>
    <path d="M6 5 H3 V7 C3 9, 5 10, 6 10"/>
    <path d="M18 5 H21 V7 C21 9, 19 10, 18 10"/>
    <path d="M9 17 V21 H15 V17"/>
    <path d="M7 21 H17"/>
  </svg>
);
const TabMe = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#7C5CFF' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21 C4 16, 7 13, 12 13 C17 13, 20 16, 20 21"/>
  </svg>
);

Object.assign(window, {
  IcoRoutines, IcoWorkout, IcoEducation, IcoNotes, IcoNutrition, IcoMeditation,
  IcoSleep, IcoReading, IcoSocial, IcoFinance, IcoCreativity, IcoCareer,
  IcoFire, IcoCoin, IcoStar, IcoBolt, IcoPlus, IcoCheck, IcoChev,
  TabHome, TabQuests, TabStats, TabAch, TabMe,
});
