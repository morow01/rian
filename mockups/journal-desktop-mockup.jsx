import { useState } from "react";

// Sample data matching Rian's journal model
const notebooks = [
  { id: "nb1", title: "Field Notes", color: "#2D6BE4" },
  { id: "nb2", title: "Training Log", color: "#7c3aed" },
  { id: "nb3", title: "Site Audits", color: "#059669" },
];

const sections = [
  { id: "s1", notebookId: "nb1", title: "Tullamore Area", color: "#2D6BE4" },
  { id: "s2", notebookId: "nb1", title: "Portlaoise Area", color: "#f97316" },
  { id: "s3", notebookId: "nb1", title: "Birr Area", color: "#059669" },
  { id: "s4", notebookId: "nb2", title: "GDPR", color: "#7c3aed" },
  { id: "s5", notebookId: "nb2", title: "Health & Safety", color: "#ef4444" },
  { id: "s6", notebookId: "nb3", title: "Cabinet Inspections", color: "#059669" },
  { id: "s7", notebookId: "nb3", title: "Exchange Visits", color: "#2D6BE4" },
];

const pages = [
  { id: "p1", sectionId: "s1", title: "Ballinagar (BXGA)", date: "2026-03-31", noteContent: "<p>Cabinet inspection complete. All cards seated properly.</p><p>Voltage readings normal — 48.2V DC.</p><p>Fan unit replaced (noisy bearing).</p>" },
  { id: "p2", sectionId: "s1", title: "Mucklagh (MUKA)", date: "2026-03-18", noteContent: "<p>Routine maintenance. Cleaned filters.</p><p>Battery string 1: 24 cells, all above 2.1V</p>" },
  { id: "p3", sectionId: "s1", title: "Clara (CCRB)", date: "2026-04-02", noteContent: "<p>RSU site visit. Power alarm investigation.</p><p>Found tripped breaker on rectifier 2. Reset and monitored for 30 mins — stable.</p>" },
  { id: "p4", sectionId: "s1", title: "Kilbeggan (KBNB)", date: "2026-04-01", noteContent: "<p>New UPS installation check. Commissioning docs signed.</p>" },
  { id: "p5", sectionId: "s2", title: "Mountmellick (MMKA)", date: "2026-01-14", noteContent: "<p>Generator battery test — all 24 cells passed.</p>" },
  { id: "p6", sectionId: "s2", title: "Portarlington (PANA)", date: "2026-02-23", noteContent: "<p>Fibre splice work. 12-core ribbon completed.</p>" },
  { id: "p7", sectionId: "s3", title: "Birr Exchange", date: "2026-03-10", noteContent: "<p>Full rack audit. 3 unused patch leads removed.</p>" },
  { id: "p8", sectionId: "s4", title: "GDPR Course Notes", date: "2026-03-25", noteContent: "<p><strong>Key points:</strong></p><ul><li>Data retention: 6 years max</li><li>Right to erasure applies to field notes</li><li>Photos of customer equipment — get consent</li></ul>" },
  { id: "p9", sectionId: "s5", title: "Working at Heights", date: "2026-02-10", noteContent: "<p>Refresher course completed. Certificate valid until Feb 2028.</p>" },
  { id: "p10", sectionId: "s6", title: "Geashill (GHLB)", date: "2026-03-16", noteContent: "<p>Cabinet door seal needs replacement. Logged ticket #4521.</p>" },
];

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return dt.getDate() + " " + months[dt.getMonth()] + " '" + String(dt.getFullYear()).slice(2);
};

const stripHtml = (h) => h.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// ============ ICONS ============
const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const PageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const CalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const FolderIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color || "currentColor"} stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

// ============ LAYOUT A: THREE-PANEL (like Notes) ============
function LayoutA() {
  const [selNb, setSelNb] = useState("nb1");
  const [selSec, setSelSec] = useState("s1");
  const [selPage, setSelPage] = useState("p1");

  const nb = notebooks.find(n => n.id === selNb);
  const secs = sections.filter(s => s.notebookId === selNb);
  const pgs = pages.filter(p => p.sectionId === selSec);
  const pg = pages.find(p => p.id === selPage);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 160px)", border: "1px solid #dfe3ea", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      {/* Sidebar: Notebooks + Sections */}
      <div style={{ width: 220, minWidth: 220, borderRight: "1px solid #dfe3ea", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        <div style={{ padding: "14px 16px 8px", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#94a3b8", textTransform: "uppercase" }}>Notebooks</div>
        {notebooks.map(n => (
          <button key={n.id} onClick={() => { setSelNb(n.id); const firstSec = sections.find(s => s.notebookId === n.id); if (firstSec) { setSelSec(firstSec.id); const firstPg = pages.find(p => p.sectionId === firstSec.id); setSelPage(firstPg?.id || null); } }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", border: "none", background: n.id === selNb ? "linear-gradient(to right, rgba(45,107,228,0.10), rgba(45,107,228,0.03))" : "transparent", borderLeft: n.id === selNb ? "3px solid #2D6BE4" : "3px solid transparent", width: "100%", textAlign: "left", color: n.id === selNb ? "#2D6BE4" : "#64748b", fontSize: 13, fontWeight: n.id === selNb ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
            <BookIcon />{n.title}
          </button>
        ))}

        <div style={{ borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />
        <div style={{ padding: "4px 16px", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#94a3b8", textTransform: "uppercase" }}>Sections</div>
        {secs.map(s => (
          <button key={s.id} onClick={() => { setSelSec(s.id); const firstPg = pages.find(p => p.sectionId === s.id); setSelPage(firstPg?.id || null); }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", border: "none", background: s.id === selSec ? "linear-gradient(to right, rgba(45,107,228,0.06), transparent)" : "transparent", borderLeft: s.id === selSec ? `3px solid ${s.color}` : "3px solid transparent", width: "100%", textAlign: "left", color: s.id === selSec ? "#1e293b" : "#64748b", fontSize: 12, fontWeight: s.id === selSec ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            {s.title}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "0 12px 12px" }}>
          <button style={{ width: "100%", padding: 10, border: "1px dashed #2D6BE4", borderRadius: 8, background: "rgba(45,107,228,0.06)", color: "#2D6BE4", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>+ Add Notebook</button>
        </div>
      </div>

      {/* Pages list */}
      <div style={{ width: 340, minWidth: 340, borderRight: "1px solid #dfe3ea", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 10, top: 9, color: "#94a3b8" }}><SearchIcon /></span>
            <input placeholder="Search pages…" style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #dfe3ea", borderRadius: 8, fontSize: 13, background: "#f4f7fa", outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#1e293b" }} />
          </div>
        </div>
        <div style={{ padding: "0 14px 8px" }}>
          <button style={{ width: "100%", padding: 10, marginTop: 8, border: "1px dashed #2D6BE4", borderRadius: 10, background: "rgba(45,107,228,0.06)", color: "#2D6BE4", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><PlusIcon /> New Page</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
          {pgs.map(p => (
            <div key={p.id} onClick={() => setSelPage(p.id)}
              style={{ margin: "0 -12px", padding: "12px 14px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", borderLeft: p.id === selPage ? "3px solid #2D6BE4" : "3px solid transparent", background: p.id === selPage ? "linear-gradient(to right, rgba(45,107,228,0.10), rgba(45,107,228,0.03))" : "transparent", transition: "background 0.12s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.title}</span>
                <ChevronRight />
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <CalIcon /> {formatDate(p.date)}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 3 }}>
                {stripHtml(p.noteContent).slice(0, 80)}…
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {pg ? (
          <>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", flex: 1 }}>{pg.title}</div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(pg.date)}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Title</div>
                <input defaultValue={pg.title} style={{ width: "100%", padding: "10px 14px", border: "1px solid #dfe3ea", borderRadius: 12, fontSize: 14, background: "#f4f7fa", color: "#1e293b", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Content</div>
                <div style={{ minHeight: 120, maxHeight: 300, overflow: "hidden", padding: 14, border: "1px solid #dfe3ea", borderRadius: 12, background: "#f4f7fa", cursor: "pointer", fontSize: 13, color: "#1e293b", lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: pg.noteContent }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Date</div>
                <input type="date" defaultValue={pg.date} style={{ padding: "10px 14px", border: "1px solid #dfe3ea", borderRadius: 12, fontSize: 14, background: "#f4f7fa", color: "#1e293b", fontFamily: "inherit", outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1px solid #f1f5f9", flexWrap: "wrap", alignItems: "center" }}>
                <button style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #dfe3ea", background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>Copy / Move</button>
                <span style={{ flex: 1 }} />
                <button style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexDirection: "column", gap: 8 }}>
            <PageIcon /><p style={{ fontSize: 14 }}>Select a page to view</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ LAYOUT B: TWO-PANEL + TREE NAV ============
function LayoutB() {
  const [expanded, setExpanded] = useState({ nb1: true, nb2: false, nb3: false, s1: true, s2: false, s3: false, s4: false, s5: false, s6: false, s7: false });
  const [selPage, setSelPage] = useState("p1");

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const pg = pages.find(p => p.id === selPage);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 160px)", border: "1px solid #dfe3ea", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      {/* Tree sidebar */}
      <div style={{ width: 280, minWidth: 280, borderRight: "1px solid #dfe3ea", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", flex: 1 }}>Field Journal</div>
          <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #dfe3ea", background: "#fff", color: "#2D6BE4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><PlusIcon /></button>
        </div>
        <div style={{ padding: "8px 8px", position: "relative" }}>
          <span style={{ position: "absolute", left: 18, top: 17, color: "#94a3b8" }}><SearchIcon /></span>
          <input placeholder="Search…" style={{ width: "100%", padding: "7px 10px 7px 30px", border: "1px solid #dfe3ea", borderRadius: 8, fontSize: 12, background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#1e293b" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 4px" }}>
          {notebooks.map(nb => (
            <div key={nb.id}>
              <button onClick={() => toggle(nb.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", border: "none", background: "transparent", width: "100%", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#1e293b", cursor: "pointer", fontFamily: "inherit", borderRadius: 6 }}>
                <span style={{ transition: "transform 0.15s", transform: expanded[nb.id] ? "rotate(0)" : "rotate(-90deg)", display: "flex" }}><ChevronDown /></span>
                <BookIcon />
                {nb.title}
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{sections.filter(s => s.notebookId === nb.id).length}</span>
              </button>
              {expanded[nb.id] && sections.filter(s => s.notebookId === nb.id).map(sec => (
                <div key={sec.id} style={{ paddingLeft: 16 }}>
                  <button onClick={() => toggle(sec.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", border: "none", background: "transparent", width: "100%", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer", fontFamily: "inherit", borderRadius: 6 }}>
                    <span style={{ transition: "transform 0.15s", transform: expanded[sec.id] ? "rotate(0)" : "rotate(-90deg)", display: "flex" }}><ChevronDown /></span>
                    <FolderIcon color={sec.color} />
                    {sec.title}
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>{pages.filter(p => p.sectionId === sec.id).length}</span>
                  </button>
                  {expanded[sec.id] && pages.filter(p => p.sectionId === sec.id).map(p => (
                    <button key={p.id} onClick={() => setSelPage(p.id)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 28px", border: "none", background: p.id === selPage ? "rgba(45,107,228,0.08)" : "transparent", width: "100%", textAlign: "left", fontSize: 12, color: p.id === selPage ? "#2D6BE4" : "#64748b", fontWeight: p.id === selPage ? 600 : 400, cursor: "pointer", fontFamily: "inherit", borderRadius: 6, borderLeft: p.id === selPage ? "2px solid #2D6BE4" : "2px solid transparent" }}>
                      <PageIcon /> {p.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Full-width editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {pg ? (
          <>
            <div style={{ padding: "14px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
              {/* Breadcrumb */}
              <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                {(() => { const sec = sections.find(s => s.id === pg.sectionId); const nb = sec ? notebooks.find(n => n.id === sec.notebookId) : null; return <>{nb?.title} <ChevronRight /> {sec?.title}</>; })()}
              </span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(pg.date)}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", maxWidth: 800, width: "100%" }}>
              <input defaultValue={pg.title} style={{ width: "100%", padding: 0, border: "none", fontSize: 22, fontWeight: 700, color: "#1e293b", fontFamily: "inherit", outline: "none", background: "transparent", marginBottom: 20 }} />
              <div style={{ minHeight: 200, padding: 16, border: "1px solid #dfe3ea", borderRadius: 12, background: "#f4f7fa", cursor: "pointer", fontSize: 14, color: "#1e293b", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: pg.noteContent }} />
              <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Date</div>
                  <input type="date" defaultValue={pg.date} style={{ padding: "8px 12px", border: "1px solid #dfe3ea", borderRadius: 10, fontSize: 13, background: "#f4f7fa", color: "#1e293b", fontFamily: "inherit", outline: "none" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, paddingTop: 20, marginTop: 20, borderTop: "1px solid #f1f5f9", alignItems: "center" }}>
                <button style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #dfe3ea", background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Copy / Move</button>
                <span style={{ flex: 1 }} />
                <button style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexDirection: "column", gap: 8 }}>
            <PageIcon /><p style={{ fontSize: 14 }}>Select a page to view</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ MAIN: TOGGLE BETWEEN LAYOUTS ============
export default function JournalDesktopMockup() {
  const [layout, setLayout] = useState("A");

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "16px 20px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Journal Desktop Mockup</h2>
        <div style={{ display: "flex", background: "#e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <button onClick={() => setLayout("A")} style={{ padding: "8px 20px", border: "none", background: layout === "A" ? "#2D6BE4" : "transparent", color: layout === "A" ? "#fff" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Layout A — Three Panel
          </button>
          <button onClick={() => setLayout("B")} style={{ padding: "8px 20px", border: "none", background: layout === "B" ? "#2D6BE4" : "transparent", color: layout === "B" ? "#fff" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Layout B — Tree Nav
          </button>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>
        {layout === "A"
          ? "Three-panel layout (matches Notes desktop): Sidebar with notebooks + sections → page list → editor. Consistent with existing desktop patterns."
          : "Two-panel with collapsible tree: All hierarchy visible in one sidebar (notebook → section → page). Editor gets full width — better for content-heavy pages."}
      </div>

      {layout === "A" ? <LayoutA /> : <LayoutB />}
    </div>
  );
}
