import { useState } from "react";

const mockNotes = [
  { id: 1, title: "Portlaoise Site Visit", preview: "Checked rectifier voltages, all within spec. Battery string 1 showing slight drift on cells 12-14...", date: "17 Apr", pinned: true, tags: ["PGS"] },
  { id: 2, title: "Naas Cabinet Upgrade", preview: "Replaced fan unit in Cabinet B. Old unit was drawing 2.1A vs rated 1.4A. Thermal paste on heatsink...", date: "16 Apr", pinned: false, tags: ["NAS"] },
  { id: 3, title: "Sallins Battery Test", preview: "24-cell string test complete. Overall voltage 51.2V. Cell 18 reading 1.98V — flagged for monitoring...", date: "15 Apr", pinned: false, tags: ["SLS"] },
  { id: 4, title: "Weekly Team Notes", preview: "Meeting with Carina re: Tetra responsibilities. Action items: update coverage map, schedule training...", date: "14 Apr", pinned: false, tags: [] },
  { id: 5, title: "Collins Lane Routines", preview: "Routine power check done. DC load normal. UPS firmware updated to v3.2.1. Next visit scheduled...", date: "12 Apr", pinned: false, tags: ["CSA"] },
];

const editorContent = `<h3>Portlaoise Site Visit</h3>
<p>Checked rectifier voltages, all within spec. Battery string 1 showing slight drift on cells 12-14.</p>
<table>
  <tr><th>Cell</th><th>Volts</th><th>Cell</th><th>Volts</th></tr>
  <tr><td>1</td><td>2.15</td><td>13</td><td>2.08</td></tr>
  <tr><td>2</td><td>2.14</td><td>14</td><td>2.07</td></tr>
  <tr><td>3</td><td>2.16</td><td>15</td><td>2.15</td></tr>
</table>
<p><strong>Action:</strong> Schedule follow-up for cells 12-14 in 2 weeks.</p>`;

// Color tokens matching Rian's design
const c = {
  accent: "#2D6BE4",
  accentRgb: "45,107,228",
  bgPage: "#F0F2F5",
  bgCard: "#ffffff",
  border: "#E2E8F0",
  borderSubtle: "#EDF2F7",
  textPrimary: "#1a202c",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  danger: "#e8453c",
  purple: "#7c3aed",
  amber: "#D97706",
};

function TabBar({ active, archive, bin, current, onSelect }) {
  const tabs = [
    { key: "active", label: "Active", count: null },
    { key: "archive", label: "Archive", count: archive },
    { key: "bin", label: "Bin", count: bin },
  ];
  return (
    <div style={{ display: "flex", gap: 2, background: "#141c2b14", borderRadius: 8, padding: 3 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onSelect(t.key)}
          style={{
            flex: 1, padding: "6px 12px", borderRadius: 6, border: "none",
            background: current === t.key ? "#fff" : "transparent",
            color: current === t.key ? c.textPrimary : c.textSecondary,
            fontWeight: current === t.key ? 700 : 500, fontSize: 12, cursor: "pointer",
            boxShadow: current === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {t.label}
          {t.count > 0 && (
            <span style={{
              fontSize: 10, padding: "1px 6px", borderRadius: 10, fontWeight: 700,
              background: t.key === "bin" ? "#FEE2E2" : "#FEF3C7",
              color: t.key === "bin" ? c.danger : c.amber,
            }}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function NoteRow({ note, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 14px",
        borderBottom: `1px solid ${c.borderSubtle}`,
        cursor: "pointer",
        background: selected
          ? `linear-gradient(to right, rgba(${c.accentRgb},0.10), rgba(${c.accentRgb},0.03))`
          : "transparent",
        borderLeft: selected ? `3px solid ${c.accent}` : "3px solid transparent",
        transition: "background 0.12s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        {note.pinned && <span style={{ fontSize: 10, color: c.accent }}>📌</span>}
        <span style={{ fontSize: 13, fontWeight: 700, color: c.textPrimary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {note.title}
        </span>
        <span style={{ fontSize: 11, color: c.textMuted, whiteSpace: "nowrap" }}>{note.date}</span>
      </div>
      <div style={{ fontSize: 12, color: c.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4 }}>
        {note.preview}
      </div>
      {note.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
          {note.tags.map((t) => (
            <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: `rgba(${c.accentRgb},0.08)`, color: c.accent, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorMock() {
  return (
    <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["B", "I", "U", "S", "H1", "H2", "—", "•", "1.", "☐", "</>", "📷", "🔗"].map((b) => (
          <button key={b} style={{ width: 30, height: 28, border: `1px solid ${c.border}`, borderRadius: 6, background: "#fff", fontSize: 11, cursor: "pointer", color: c.textSecondary, fontWeight: 600 }}>{b}</button>
        ))}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: c.textPrimary }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Portlaoise Site Visit</h3>
        <p style={{ marginBottom: 12 }}>Checked rectifier voltages, all within spec. Battery string 1 showing slight drift on cells 12-14.</p>
        <table style={{ borderCollapse: "collapse", marginBottom: 12, fontSize: 13 }}>
          <thead>
            <tr>{["Cell", "Volts", "Cell", "Volts"].map((h, i) => <th key={i} style={{ border: `1px solid ${c.border}`, padding: "6px 16px", background: c.bgPage, fontWeight: 700, textAlign: "left" }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {[[1, "2.15", 13, "2.08"], [2, "2.14", 14, "2.07"], [3, "2.16", 15, "2.15"]].map((r, i) => (
              <tr key={i}>{r.map((v, j) => <td key={j} style={{ border: `1px solid ${c.border}`, padding: "6px 16px" }}>{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
        <p><strong>Action:</strong> Schedule follow-up for cells 12-14 in 2 weeks.</p>
      </div>
    </div>
  );
}

function EmptyEditor() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: c.textMuted, flexDirection: "column", gap: 8 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span style={{ fontSize: 14 }}>Select a note to view</span>
    </div>
  );
}

// ─── LAYOUT A: Two-Panel (List + Editor) ───
function LayoutA() {
  const [sel, setSel] = useState(1);
  const [tab, setTab] = useState("active");
  return (
    <div style={{ display: "flex", height: "100%", background: c.bgPage }}>
      {/* Notes list */}
      <div style={{ width: 340, minWidth: 340, background: c.bgCard, borderRight: `1px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 14px 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: c.textMuted, textTransform: "uppercase", marginBottom: 10 }}>Notes</div>
          <TabBar current={tab} onSelect={setTab} archive={3} bin={2} />
          <div style={{ position: "relative", marginTop: 10 }}>
            <input placeholder="Search notes..." style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 13, background: c.bgPage, outline: "none", boxSizing: "border-box" }} />
            <svg style={{ position: "absolute", left: 10, top: 9, color: c.textMuted }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {mockNotes.map((n) => <NoteRow key={n.id} note={n} selected={sel === n.id} onClick={() => setSel(n.id)} />)}
        </div>
        <div style={{ padding: 12 }}>
          <button style={{ width: "100%", padding: 10, border: `1px dashed ${c.accent}`, borderRadius: 8, background: `rgba(${c.accentRgb},0.06)`, color: c.accent, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>+ New Note</button>
        </div>
      </div>
      {/* Editor */}
      <div style={{ flex: 1, background: c.bgCard, display: "flex", flexDirection: "column" }}>
        {sel ? <EditorMock /> : <EmptyEditor />}
      </div>
    </div>
  );
}

// ─── LAYOUT B: Three-Panel (Tabs + List + Editor) ───
function LayoutB() {
  const [sel, setSel] = useState(1);
  const [tab, setTab] = useState("active");
  return (
    <div style={{ display: "flex", height: "100%", background: c.bgPage }}>
      {/* Sidebar with tabs as vertical nav */}
      <div style={{ width: 200, minWidth: 200, background: c.bgCard, borderRight: `1px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 14px 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: c.textMuted, textTransform: "uppercase", marginBottom: 12 }}>Notes</div>
        </div>
        {[
          { key: "active", label: "Active", icon: "📝", count: 5 },
          { key: "archive", label: "Archive", icon: "📦", count: 3 },
          { key: "bin", label: "Bin", icon: "🗑️", count: 2 },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", border: "none",
              background: tab === t.key ? `linear-gradient(to right, rgba(${c.accentRgb},0.10), rgba(${c.accentRgb},0.03))` : "transparent",
              borderLeft: tab === t.key ? `3px solid ${c.accent}` : "3px solid transparent",
              color: tab === t.key ? c.accent : c.textSecondary, fontWeight: tab === t.key ? 700 : 500,
              fontSize: 13, cursor: "pointer", textAlign: "left", width: "100%",
            }}
          >
            <span>{t.icon}</span>
            <span style={{ flex: 1 }}>{t.label}</span>
            <span style={{ fontSize: 11, color: c.textMuted }}>{t.count}</span>
          </button>
        ))}
        <div style={{ borderTop: `1px solid ${c.borderSubtle}`, margin: "8px 0" }} />
        <div style={{ padding: "4px 16px", fontSize: 11, fontWeight: 800, letterSpacing: 1, color: c.textMuted, textTransform: "uppercase" }}>Tags</div>
        {["PGS", "NAS", "SLS", "CSA"].map((tag) => (
          <button key={tag} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", border: "none", background: "transparent", color: c.textSecondary, fontSize: 12, cursor: "pointer", textAlign: "left", width: "100%" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.accent }} />
            {tag}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: 12 }}>
          <button style={{ width: "100%", padding: 10, border: `1px dashed ${c.accent}`, borderRadius: 8, background: `rgba(${c.accentRgb},0.06)`, color: c.accent, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ New Note</button>
        </div>
      </div>
      {/* Notes list */}
      <div style={{ width: 300, minWidth: 300, background: c.bgCard, borderRight: `1px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 14px 8px" }}>
          <div style={{ position: "relative" }}>
            <input placeholder="Search notes..." style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 13, background: c.bgPage, outline: "none", boxSizing: "border-box" }} />
            <svg style={{ position: "absolute", left: 10, top: 9, color: c.textMuted }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {mockNotes.map((n) => <NoteRow key={n.id} note={n} selected={sel === n.id} onClick={() => setSel(n.id)} />)}
        </div>
      </div>
      {/* Editor */}
      <div style={{ flex: 1, background: c.bgCard, display: "flex", flexDirection: "column" }}>
        {sel ? <EditorMock /> : <EmptyEditor />}
      </div>
    </div>
  );
}

// ─── LAYOUT C: Consistent with Timesheet (Days-style sidebar) ───
function LayoutC() {
  const [sel, setSel] = useState(1);
  const [tab, setTab] = useState("active");
  return (
    <div style={{ display: "flex", height: "100%", background: c.bgPage }}>
      {/* Left panel — mirrors the Week Days column */}
      <div style={{ width: 280, minWidth: 280, background: c.bgPage, borderRight: `1px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 14px 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: c.textMuted, textTransform: "uppercase", marginBottom: 10 }}>Notes</div>
          <TabBar current={tab} onSelect={setTab} archive={3} bin={2} />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {mockNotes.map((n) => (
            <div
              key={n.id}
              onClick={() => setSel(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                borderBottom: `1px solid ${c.borderSubtle}`,
                borderLeft: sel === n.id ? `3px solid ${c.accent}` : "3px solid transparent",
                background: sel === n.id ? `linear-gradient(to right, rgba(${c.accentRgb},0.10), rgba(${c.accentRgb},0.03))` : "transparent",
                cursor: "pointer", transition: "background 0.12s",
              }}
            >
              <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 10, background: sel === n.id ? c.accent : "#E2E8F0", color: sel === n.id ? "#fff" : c.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                <div style={{ fontSize: 12, color: c.textMuted, display: "flex", gap: 8, alignItems: "center" }}>
                  <span>{n.date}</span>
                  {n.tags.length > 0 && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 6, background: `rgba(${c.accentRgb},0.08)`, color: c.accent, fontWeight: 600 }}>{n.tags[0]}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12 }}>
          <button style={{ width: "100%", padding: 10, border: `1px dashed ${c.accent}`, borderRadius: 8, background: `rgba(${c.accentRgb},0.06)`, color: c.accent, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>+ New Note</button>
        </div>
      </div>
      {/* Editor — full width like the detail panel */}
      <div style={{ flex: 1, background: c.bgCard, display: "flex", flexDirection: "column" }}>
        {sel ? <EditorMock /> : <EmptyEditor />}
      </div>
    </div>
  );
}

export default function NotesDesktopMockups() {
  const [layout, setLayout] = useState("A");
  const layouts = { A: LayoutA, B: LayoutB, C: LayoutC };
  const Layout = layouts[layout];
  const descriptions = {
    A: "Two-panel — Notes list + Editor. Clean, simple. Tab bar at top of list.",
    B: "Three-panel — Sidebar nav + Notes list + Editor. Tags and categories in sidebar. Good for heavy note users.",
    C: "Timesheet-consistent — Mirrors the Week Days column style with icon badges, gradient selection, left border accent. Two panels, same visual language.",
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Mockup switcher */}
      <div style={{ padding: "12px 20px", background: "#1a202c", color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Notes Desktop Mockups</span>
        <div style={{ display: "flex", gap: 4 }}>
          {["A", "B", "C"].map((k) => (
            <button
              key={k}
              onClick={() => setLayout(k)}
              style={{
                padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                background: layout === k ? c.accent : "rgba(255,255,255,0.1)",
                color: "#fff", fontWeight: 700, fontSize: 13,
              }}
            >
              Layout {k}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 8 }}>{descriptions[layout]}</span>
      </div>
      {/* Mock header */}
      <div style={{ padding: "10px 0", background: "#0f1117", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
          {["TIMESHEET", "NOTES", "JOURNAL", "FINDER"].map((t) => (
            <span key={t} style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: t === "NOTES" ? c.accent : "#64748B", cursor: "pointer" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      {/* Layout */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Layout />
      </div>
    </div>
  );
}