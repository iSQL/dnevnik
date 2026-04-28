import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/db.js';
import { xpEngine } from '../core/xp-engine.js';
import { xpForDifficulty } from '../core/stats.js';
import { moduleRegistry } from '../core/module-registry.js';
import { resolveIcon, IcoFire, IcoStar, IcoBolt, IcoPlus, IcoSend } from '../ui/icons.jsx';
import { Check } from '../ui/primitives.jsx';
import TabBar from '../ui/TabBar.jsx';
import SendQuestModal from '../ui/SendQuestModal.jsx';

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const FILTERS = [
  { id: 'all',  label: 'Sve' },
  { id: 'done', label: 'Obavljeni' },
];

export default function Quests() {
  const [filter, setFilter] = useState('all');
  const [sharing, setSharing] = useState(null);

  const quests = useLiveQuery(() => db.quests.where({ active: 1 }).toArray(), []) ?? [];
  const completions = useLiveQuery(() => db.completions.toArray(), []) ?? [];
  const identity = useLiveQuery(() => db.settings.get('identity'), [])?.value ?? null;

  const todayKey = dayKey(Date.now());
  const doneTodayIds = new Set(
    completions.filter((c) => dayKey(c.timestamp) === todayKey).map((c) => c.questId),
  );

  async function checkOff(q) {
    if (doneTodayIds.has(q.id)) return;
    const m = moduleRegistry.get(q.moduleId);
    if (!m) return;
    await xpEngine.award(m.stat, xpForDifficulty(q.difficulty), { source: 'quest', questId: q.id });
  }

  async function deleteQuest(q) {
    if (!confirm(`Obrisati "${q.name}"?`)) return;
    await db.quests.update(q.id, { active: 0 });
  }

  const byGroup = { daily: [], weekly: [], epic: [] };
  for (const q of quests) {
    const group = byGroup[q.schedule] ? q.schedule : 'daily';
    const done = doneTodayIds.has(q.id);
    if (filter === 'done' && !done) continue;
    byGroup[group].push({ ...q, done });
  }
  for (const g of Object.values(byGroup)) {
    g.sort((a, b) => Number(a.done) - Number(b.done));
  }

  const summary = {
    daily:  { done: quests.filter((q) => q.schedule === 'daily'  && doneTodayIds.has(q.id)).length, total: quests.filter((q) => q.schedule === 'daily').length },
    weekly: { done: quests.filter((q) => q.schedule === 'weekly' && doneTodayIds.has(q.id)).length, total: quests.filter((q) => q.schedule === 'weekly').length },
    epic:   { done: quests.filter((q) => q.schedule === 'epic'   && doneTodayIds.has(q.id)).length, total: quests.filter((q) => q.schedule === 'epic').length },
  };

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="scroll">
          <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="eyebrow">Knjiga zadataka</div>
              <h1 className="title" style={{ marginTop: 2 }}>Zadaci</h1>
            </div>
            <Link to="/add" style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--violet)', border: '2.5px solid var(--line)', boxShadow: '3px 3px 0 var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Dodaj zadatak">
              <IcoPlus size={20} stroke="#fff" />
            </Link>
          </div>

          <div style={{ padding: '0 20px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <QSum n={`${summary.daily.done}/${summary.daily.total}`} label="Dnevno" tint="var(--coin)" />
            <QSum n={`${summary.weekly.done}/${summary.weekly.total}`} label="Nedeljno" tint="var(--fire)" />
            <QSum n={`${summary.epic.done}/${summary.epic.total}`} label="Epsko" tint="var(--violet)" />
          </div>

          <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6 }}>
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    padding: '7px 14px', border: '2.5px solid var(--line)', borderRadius: 100,
                    background: active ? '#1F1A14' : '#fff', color: active ? '#fff' : 'var(--ink)',
                    fontWeight: 800, fontSize: 12,
                    boxShadow: active ? '2px 2px 0 var(--line)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <QGroup title="Dnevno" sub="Resetuje se u ponoć" icon={<IcoFire size={18} />} tint="var(--coin)">
            {byGroup.daily.map((q, i) => <QItem key={q.id} q={q} onCheck={() => checkOff(q)} onDelete={() => deleteQuest(q)} onShare={identity ? () => setSharing(q) : null} last={i === byGroup.daily.length - 1} />)}
            {byGroup.daily.length === 0 && <EmptyRow />}
          </QGroup>

          <QGroup title="Nedeljno" sub="Do kraja nedelje" icon={<IcoStar size={16} fill="#FF7A3D" />} tint="var(--fire)">
            {byGroup.weekly.map((q, i) => <QItem key={q.id} q={q} onCheck={() => checkOff(q)} onDelete={() => deleteQuest(q)} onShare={identity ? () => setSharing(q) : null} last={i === byGroup.weekly.length - 1} />)}
            {byGroup.weekly.length === 0 && <EmptyRow />}
          </QGroup>

          <QGroup title="Epsko" sub="Dugotrajno. Spremi grickalice." icon={<IcoBolt size={16} fill="#7C5CFF" />} tint="var(--violet)" last>
            {byGroup.epic.map((q, i) => <QItem key={q.id} q={q} onCheck={() => checkOff(q)} onDelete={() => deleteQuest(q)} onShare={identity ? () => setSharing(q) : null} last={i === byGroup.epic.length - 1} epic />)}
            {byGroup.epic.length === 0 && <EmptyRow />}
          </QGroup>
        </div>
        <TabBar />
      </div>
      {sharing && <SendQuestModal quest={sharing} onClose={() => setSharing(null)} />}
    </div>
  );
}

function QSum({ n, label, tint }) {
  return (
    <div className="chunk" style={{ padding: '10px 8px', textAlign: 'center', borderRadius: 14, boxShadow: '3px 3px 0 var(--line)' }}>
      <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: tint }}>{n}</div>
      <div className="eyebrow" style={{ fontSize: 10, marginTop: 1 }}>{label}</div>
    </div>
  );
}

function QGroup({ title, sub, icon, tint, children, last }) {
  return (
    <div style={{ padding: `0 20px ${last ? 24 : 14}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: tint, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="title" style={{ fontSize: 16 }}>{title}</h2>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' }}>{sub}</span>
      </div>
      <div className="tile" style={{ padding: '10px 12px' }}>
        {children}
      </div>
    </div>
  );
}

function QItem({ q, onCheck, onDelete, onShare, last, epic }) {
  const m = moduleRegistry.get(q.moduleId);
  const Icon = resolveIcon(m?.icon);
  const tint = m?.color || 'var(--violet)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 2px', borderBottom: last ? 'none' : '1.5px dashed rgba(31,26,20,0.12)' }}>
      <Check done={q.done} tint={tint} onClick={onCheck} />
      <div style={{ width: 30, height: 30, borderRadius: 9, background: tint, border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 13.5, textDecoration: q.done ? 'line-through' : 'none', opacity: q.done ? 0.5 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.name}</span>
          {epic && <span className="mono" style={{ fontSize: 9, fontWeight: 900, background: 'var(--violet)', color: '#fff', padding: '1px 5px', borderRadius: 4, letterSpacing: 0.5 }}>EPSKO</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>{m?.name}</span>
        </div>
      </div>
      {onShare && (
        <button onClick={onShare} aria-label="Pošalji prijatelju" title="Pošalji prijatelju" style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', alignItems: 'center' }}>
          <IcoSend size={15} stroke="currentColor" />
        </button>
      )}
      <button onClick={onDelete} aria-label="Obriši" style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 18, lineHeight: 1, padding: 4, cursor: 'pointer' }}>×</button>
      <div className="mono" style={{ fontWeight: 800, fontSize: 12.5, color: q.done ? 'var(--ink-3)' : 'var(--green-deep)', flexShrink: 0 }}>+{xpForDifficulty(q.difficulty)}</div>
    </div>
  );
}

function EmptyRow() {
  return <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, padding: '6px 2px' }}>Prazno.</div>;
}
