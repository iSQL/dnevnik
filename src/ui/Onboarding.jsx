import { useState } from 'react';
import { db, seedQuestsForChoice } from '../core/db.js';
import { moduleRegistry } from '../core/module-registry.js';
import { IcoSparkles, IcoStar, IcoBolt } from './icons.jsx';

const CHOICES = [
  {
    id: 'empty',
    label: 'Prazno',
    sub: 'Krenuću od nule',
    detail: 'Bez podrazumevanih zadataka. Sve dodaješ ručno.',
    Icon: IcoStar,
    bg: 'var(--cream)',
    fg: 'var(--ink)',
  },
  {
    id: 'minimal',
    label: 'Minimalno',
    sub: '1 zadatak po grani · 6 ukupno',
    detail: 'Po jedan jednostavan zadatak za svaku od šest veština.',
    Icon: IcoBolt,
    bg: 'var(--coin)',
    fg: 'var(--ink)',
  },
  {
    id: 'recommended',
    label: 'Preporučeno',
    sub: '3 + 4 epska · 22 ukupno',
    detail: 'Po tri zadatka po grani plus četiri velika epska izazova.',
    Icon: IcoSparkles,
    bg: 'var(--violet)',
    fg: '#fff',
    badge: 'POPULARNO',
  },
];

export default function Onboarding() {
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);

  async function pick(choice) {
    setBusy(choice);
    setErr(null);
    try {
      await seedQuestsForChoice(moduleRegistry.list(), choice);
      await db.settings.put({ key: 'onboardingChoice', value: choice });
      // useLiveQuery in App.jsx will see the new setting and unmount this overlay.
    } catch (e) {
      setErr(String(e?.message ?? e));
      setBusy(null);
    }
  }

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={{ padding: '20px 20px 8px', textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--violet)' }}>Dobrodošao u Dnevnik</div>
          <h1 className="title" style={{ fontSize: 24, marginTop: 4 }}>
            Sa čim ćeš krenuti?
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.5, marginTop: 6 }}>
            Možeš da kreneš prazno ili da uzmeš predefinisani set zadataka.
            Uvek možeš da dodaješ i brišeš kasnije.
          </p>
        </div>

        <div style={{ padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHOICES.map((c) => {
            const Icon = c.Icon;
            const isBusy = busy === c.id;
            const disabled = busy !== null;
            return (
              <button
                key={c.id}
                onClick={() => pick(c.id)}
                disabled={disabled}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 16px',
                  borderRadius: 16,
                  border: '2.5px solid var(--line)',
                  background: c.bg, color: c.fg,
                  boxShadow: isBusy ? '2px 2px 0 var(--line)' : '4px 4px 0 var(--line)',
                  fontFamily: 'inherit', textAlign: 'left',
                  cursor: disabled ? 'wait' : 'pointer',
                  opacity: disabled && !isBusy ? 0.55 : 1,
                  transform: isBusy ? 'translate(2px, 2px)' : 'none',
                  transition: 'transform 80ms, box-shadow 80ms',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: '#fff', border: '2px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={28} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 17 }}>{c.label}</span>
                    {c.badge && (
                      <span className="mono" style={{
                        fontSize: 9, fontWeight: 900, letterSpacing: 0.5,
                        padding: '2px 6px', borderRadius: 6,
                        background: 'var(--coin)', color: 'var(--ink)',
                        border: '1.5px solid var(--line)',
                      }}>
                        {c.badge}
                      </span>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.85, marginTop: 2 }}>
                    {c.sub}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginTop: 4, lineHeight: 1.4 }}>
                    {c.detail}
                  </div>
                </div>
                <span style={{ fontSize: 22, fontWeight: 900, opacity: isBusy ? 0.4 : 0.85 }}>
                  {isBusy ? '…' : '›'}
                </span>
              </button>
            );
          })}

          {err && (
            <div style={{ color: 'var(--fire)', marginTop: 6, fontSize: 12, fontWeight: 800, textAlign: 'center' }}>
              Greška: {err}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, zIndex: 200,
  background: 'rgba(31,26,20,0.72)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16,
};

const panel = {
  background: 'var(--cream)',
  width: '100%', maxWidth: 480,
  maxHeight: '92vh', overflow: 'auto',
  borderRadius: 20,
  border: '2.5px solid var(--line)',
  boxShadow: '6px 6px 0 var(--line)',
};
