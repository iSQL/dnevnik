// COPY ME to add a new life category.
//
//   1. Duplicate this folder and rename to e.g. `src/modules/reading/`
//   2. Change the `id` (must match folder name) and fill in the rest
//   3. `stat` must be one of the 6: fitness, intellect, discipline, creativity, social, wellbeing
//   4. `icon` must be a key from `src/ui/icons.jsx` ICONS map (or add a new icon there)
//   5. Reload the dev server — the new module auto-registers via module-registry.js
//
// The `_` prefix on `_template` keeps this entry out of the runtime registry.

export default {
  id: '_template',
  name: 'Template',
  stat: 'discipline',
  icon: 'Sparkles',
  color: 'var(--mint)',
  soft: 'var(--green-soft)',
  order: 999,
  flavor: 'Zameni ovaj tekst',
  defaultQuests: [
    // { name: 'Primer zadatka', difficulty: 'easy',   schedule: 'daily' },
    // { name: 'Epska misija',   difficulty: 'epic',   schedule: 'epic'  },
  ],
};
