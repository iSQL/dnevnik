const manifestModules = import.meta.glob('../modules/*/manifest.js', { eager: true });
const detailModules = import.meta.glob('../modules/*/Detail.jsx');

const registry = new Map();

for (const [path, mod] of Object.entries(manifestModules)) {
  const manifest = mod.default ?? mod;
  if (!manifest || !manifest.id) continue;
  if (manifest.id.startsWith('_')) continue;

  const folder = path.match(/modules\/([^/]+)\/manifest\.js$/)?.[1];
  const detailPath = `../modules/${folder}/Detail.jsx`;
  const detailLoader = detailModules[detailPath];

  registry.set(manifest.id, {
    ...manifest,
    Detail: detailLoader ? () => detailLoader().then((m) => m.default ?? m) : null,
  });
}

export const moduleRegistry = {
  list() {
    return [...registry.values()].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  },
  get(id) {
    return registry.get(id);
  },
  byStat(stat) {
    return [...registry.values()].filter((m) => m.stat === stat);
  },
};
