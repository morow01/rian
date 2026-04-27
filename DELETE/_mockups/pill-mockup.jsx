import { useState } from "react";

const NOTE_CATEGORIES = [
  { key: 'job',      label: 'Job',      color: '#3b82f6' },
  { key: 'fault',    label: 'Fault',    color: '#ef4444' },
  { key: 'followup', label: 'Follow-up',color: '#f59e0b' },
  { key: 'meeting',  label: 'Meeting',  color: '#8b5cf6' },
  { key: 'personal', label: 'Personal', color: '#10b981' },
  { key: 'idea',     label: 'Idea',     color: '#f97316' },
];

const PRIORITIES = [
  { key: 'all',    label: 'All (12)',  color: '#64748b' },
  { key: 'high',   label: 'High (4)', color: '#ef4444' },
  { key: 'medium', label: 'Med (5)',  color: '#f97316' },
  { key: 'low',    label: 'Low (3)',  color: '#22c55e' },
  { key: 'done',   label: 'Done (6)', color: '#94a3b8' },
];

function hex2rgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ── OPTION A: Subtle bg + stronger border (user's suggestion) ──
function OptionA({ label }) {
  const [activeCat, setActiveCat] = useState(null);
  const [activePri, setActivePri] = useState(null);
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>CATEGORY</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {NOTE_CATEGORIES.map(cat => {
          const active = activeCat === cat.key;
          return (
            <button key={cat.key} onClick={() => setActiveCat(active ? null : cat.key)}
              style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:500,
                cursor:'pointer', border:'none', outline:'none',
                background: active
                  ? cat.color
                  : `rgba(${hex2rgb(cat.color)},0.10)`,
                border: active
                  ? `1.5px solid ${cat.color}`
                  : `1.5px solid rgba(${hex2rgb(cat.color)},0.45)`,
                color: active ? '#fff' : cat.color,
                transition:'all 0.15s',
              }}>
              {cat.label} (3)
            </button>
          );
        })}
      </div>
      <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>PRIORITY</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {PRIORITIES.map(p => {
          const active = activePri === p.key;
          return (
            <button key={p.key} onClick={() => setActivePri(active ? null : p.key)}
              style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:500,
                cursor:'pointer', outline:'none',
                background: active
                  ? p.color
                  : `rgba(${hex2rgb(p.color)},0.10)`,
                border: active
                  ? `1.5px solid ${p.color}`
                  : `1.5px solid rgba(${hex2rgb(p.color)},0.45)`,
                color: active ? '#fff' : p.color,
                transition:'all 0.15s',
              }}>
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── OPTION B: Gray border + colored text (current approach) ──
function OptionB() {
  const [activeCat, setActiveCat] = useState(null);
  const [activePri, setActivePri] = useState(null);
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>CATEGORY</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {NOTE_CATEGORIES.map(cat => {
          const active = activeCat === cat.key;
          return (
            <button key={cat.key} onClick={() => setActiveCat(active ? null : cat.key)}
              style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:500,
                cursor:'pointer', outline:'none',
                background: active ? cat.color : '#fff',
                border: `1.5px solid ${active ? cat.color : '#e2e8f0'}`,
                color: active ? '#fff' : cat.color,
                transition:'all 0.15s',
              }}>
              {cat.label} (3)
            </button>
          );
        })}
      </div>
      <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>PRIORITY</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {PRIORITIES.map(p => {
          const active = activePri === p.key;
          return (
            <button key={p.key} onClick={() => setActivePri(active ? null : p.key)}
              style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:500,
                cursor:'pointer', outline:'none',
                background: active ? p.color : '#fff',
                border: `1.5px solid ${active ? p.color : '#e2e8f0'}`,
                color: active ? '#fff' : p.color,
                transition:'all 0.15s',
              }}>
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── OPTION C: Colored border + colored text, subtle bg on hover only ──
function OptionC() {
  const [activeCat, setActiveCat] = useState(null);
  const [activePri, setActivePri] = useState(null);
  const [hov, setHov] = useState(null);
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>CATEGORY</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {NOTE_CATEGORIES.map(cat => {
          const active = activeCat === cat.key;
          const hovering = hov === cat.key;
          return (
            <button key={cat.key}
              onClick={() => setActiveCat(active ? null : cat.key)}
              onMouseEnter={() => setHov(cat.key)}
              onMouseLeave={() => setHov(null)}
              style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:500,
                cursor:'pointer', outline:'none',
                background: active
                  ? cat.color
                  : hovering ? `rgba(${hex2rgb(cat.color)},0.08)` : '#fff',
                border: `1.5px solid ${active ? cat.color : `rgba(${hex2rgb(cat.color)},0.6)`}`,
                color: active ? '#fff' : cat.color,
                transition:'all 0.15s',
              }}>
              {cat.label} (3)
            </button>
          );
        })}
      </div>
      <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>PRIORITY</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {PRIORITIES.map(p => {
          const active = activePri === p.key;
          const hovering = hov === p.key;
          return (
            <button key={p.key}
              onClick={() => setActivePri(active ? null : p.key)}
              onMouseEnter={() => setHov(p.key)}
              onMouseLeave={() => setHov(null)}
              style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:500,
                cursor:'pointer', outline:'none',
                background: active
                  ? p.color
                  : hovering ? `rgba(${hex2rgb(p.color)},0.08)` : '#fff',
                border: `1.5px solid ${active ? p.color : `rgba(${hex2rgb(p.color)},0.6)`}`,
                color: active ? '#fff' : p.color,
                transition:'all 0.15s',
              }}>
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const options = [
    {
      id: 'A',
      title: 'Option A — Subtle tinted bg + stronger border',
      desc: 'Inactive: light colour wash background + semi-opaque coloured border. Active: solid fill.',
      Component: OptionA,
    },
    {
      id: 'B',
      title: 'Option B — White bg + gray border (current)',
      desc: 'Inactive: plain white background + gray border + coloured text. Active: solid fill.',
      Component: OptionB,
    },
    {
      id: 'C',
      title: 'Option C — White bg + coloured border',
      desc: 'Inactive: white background + coloured semi-opaque border + coloured text. Subtle bg on hover. Active: solid fill.',
      Component: OptionC,
    },
  ];

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', background:'#f8fafc', minHeight:'100vh', padding:24 }}>
      <h2 style={{ fontSize:15, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Filter Pill Styles</h2>
      <p style={{ fontSize:12, color:'#64748b', marginBottom:24 }}>Click any pill to toggle active state and preview all states.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {options.map(({ id, title, desc, Component }) => (
          <div key={id} style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:20 }}>
            <div style={{ marginBottom:14 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{title}</span>
              <p style={{ fontSize:11, color:'#94a3b8', margin:'2px 0 0' }}>{desc}</p>
            </div>
            <Component />
          </div>
        ))}
      </div>
    </div>
  );
}
