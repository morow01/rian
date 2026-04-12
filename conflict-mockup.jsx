import { useState } from "react";

const accent   = "#2D6BE4";
const bgPage   = "#E8EEF5";
const bgCard   = "#FFFFFF";
const bgAlt    = "#F4F7FA";
const border   = "#D4E0EC";
const txtPri   = "#0F1C2E";
const txtSec   = "#4A6580";
const txtMuted = "#8BA5BE";
const warn     = "#D97706";
const warnBg   = "#FEF3DC";
const warnBd   = "#F59E0B";
const danger   = "#DC2626";
const dangerBg = "#FEE2E2";
const success  = "#16A34A";
const successBg= "#DCFCE7";

const S = {
  shell:  { background: bgPage, minHeight:"100vh", fontFamily:"'DM Mono','Courier New',monospace", color:txtPri, display:"flex", flexDirection:"column", maxWidth:420, margin:"0 auto" },
  header: { background:bgCard, borderBottom:`1px solid ${border}`, padding:"14px 16px 12px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:20 },
  hTitle: { fontSize:17, fontWeight:800, flex:1, color:txtPri },
  hSub:   { fontSize:11, color:txtMuted },

  // global conflict banner (always visible across ALL screens)
  gBanner: { background:warnBg, borderBottom:`2px solid ${warnBd}`, padding:"9px 16px", display:"flex", alignItems:"center", gap:10 },
  gBannerTxt: { fontSize:13, color:warn, flex:1, fontWeight:700 },
  gBannerBtn: { background:warn, color:"#fff", border:"none", borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" },

  // menu icon with badge
  menuWrap: { position:"relative", cursor:"pointer" },
  menuBadge: { position:"absolute", top:-5, right:-6, background:danger, color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" },

  // conflicts screen
  secLabel: { fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:txtMuted, padding:"14px 16px 6px", background:bgAlt, borderBottom:`1px solid ${border}` },
  cRow: (hi) => ({ display:"flex", alignItems:"center", padding:"12px 16px", borderBottom:`1px solid ${border}`, background:hi ? warnBg : bgCard, gap:12, cursor:"pointer" }),
  cIcon: { fontSize:20, width:28, textAlign:"center" },
  cMeta: { flex:1 },
  cSection: { fontSize:13, fontWeight:700, color:txtPri },
  cDesc: { fontSize:11, color:txtSec, marginTop:2 },
  cTime: { fontSize:10, color:txtMuted },
  cBadge: { background:warn, color:"#fff", borderRadius:4, padding:"2px 7px", fontSize:10, fontWeight:800 },
  cChev: { fontSize:14, color:txtMuted },

  // resolution sheet
  overlay: { position:"fixed", inset:0, background:"rgba(15,28,46,0.45)", zIndex:100, display:"flex", alignItems:"flex-end" },
  sheet:   { background:bgCard, borderRadius:"18px 18px 0 0", width:"100%", maxHeight:"88vh", overflowY:"auto" },
  handle:  { width:36, height:4, background:border, borderRadius:2, margin:"12px auto 4px" },
  shTitle: { fontSize:16, fontWeight:800, padding:"10px 16px 2px", color:txtPri },
  shSub:   { fontSize:12, color:txtSec, padding:"0 16px 12px", borderBottom:`1px solid ${border}` },

  vCard: (hi) => ({ border:`1px solid ${hi ? accent : border}`, borderRadius:10, margin:"10px 12px", overflow:"hidden" }),
  vHead: (hi) => ({ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background:hi?"#EBF1FD":bgAlt, borderBottom:`1px solid ${hi?"#bdd0f7":border}` }),
  vLabel:(hi) => ({ fontSize:12, fontWeight:700, flex:1, color:hi?accent:txtPri }),
  vTime:  { fontSize:11, color:txtMuted },
  vBody:  { padding:"10px 12px" },

  splitGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:"10px 12px 4px" },
  pane: (hi) => ({ border:`1px solid ${hi?accent:border}`, borderRadius:8, padding:10, background:hi?"#EBF1FD":bgAlt }),
  paneTitle:(hi) => ({ fontSize:10, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:hi?accent:txtMuted, marginBottom:4 }),
  paneTime:  { fontSize:10, color:txtMuted, marginBottom:8 },
  paneContent: { fontSize:11, color:txtSec, lineHeight:1.6 },

  actionRow: { display:"flex", gap:8, padding:"10px 12px 20px" },
  btnGhost:  { flex:1, background:"none", color:txtMuted, border:`1px solid ${border}`, borderRadius:8, padding:"10px 0", fontSize:13, fontWeight:600, cursor:"pointer" },
  btnWarn:   { flex:1, background:"none", color:warn, border:`1px solid ${warnBd}`, borderRadius:8, padding:"10px 0", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnPrimary:{ flex:1, background:accent, color:"#fff", border:"none", borderRadius:8, padding:"10px 0", fontSize:13, fontWeight:700, cursor:"pointer" },

  // bottom nav
  nav: { background:bgCard, borderTop:`1px solid ${border}`, display:"flex", position:"sticky", bottom:0 },
  navItem:(a) => ({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"8px 0 6px", gap:3, background:"none", border:"none", cursor:"pointer", color:a?accent:txtMuted }),
  navIcon: { fontSize:20 },
  navLabel:(a) => ({ fontSize:9, fontWeight:a?700:400 }),

  ok: { background:successBg, borderBottom:`2px solid ${success}`, padding:"9px 16px", display:"flex", alignItems:"center", gap:8 },
  eRow:  { display:"flex", gap:8, marginBottom:5, fontSize:12, alignItems:"baseline" },
  diffAdd:  { background:successBg, borderLeft:`3px solid ${success}`, paddingLeft:6, borderRadius:"0 4px 4px 0" },
  diffMiss: { background:dangerBg,  borderLeft:`3px solid ${danger}`,  paddingLeft:6, borderRadius:"0 4px 4px 0" },

  tabs: { display:"flex", background:bgCard, borderBottom:`1px solid ${border}`, overflowX:"auto" },
  tab: (a) => ({ padding:"10px 14px", fontSize:12, fontWeight:a?700:400, color:a?accent:txtMuted, borderBottom:a?`2px solid ${accent}`:"2px solid transparent", background:"none", border:"none", cursor:"pointer", whiteSpace:"nowrap" }),
};

// ─── SHARED RESOLUTION SHEET ─────────────────────────────────────────────────
function ResolutionSheet({ conflict, onClose, onResolve }) {
  if (!conflict) return null;
  const { section, description, local, remote } = conflict;
  return (
    <div style={S.overlay}>
      <div style={S.sheet}>
        <div style={S.handle} />
        <div style={S.shTitle}>⚠️ {section} Conflict</div>
        <div style={S.shSub}>{description}</div>
        {conflict.type === "split" ? (
          <div style={S.splitGrid}>
            {[local, remote].map((v,i) => (
              <div key={i} style={S.pane(i===0)}>
                <div style={S.paneTitle(i===0)}>{v.label}</div>
                <div style={S.paneTime}>{v.time}</div>
                <div style={S.paneContent}>{v.content}</div>
              </div>
            ))}
          </div>
        ) : (
          [local, remote].map((v,i) => (
            <div key={i} style={S.vCard(i===0)}>
              <div style={S.vHead(i===0)}>
                <span>{i===0?"💻":"☁️"}</span>
                <span style={S.vLabel(i===0)}>{v.label}</span>
                <span style={S.vTime}>{v.time}</span>
              </div>
              <div style={S.vBody}>
                {(v.rows||[]).map((r,j) => (
                  <div key={j} style={{ ...S.eRow, ...(r.hi ? S.diffAdd : S.diffMiss) }}>
                    <span style={{ color:accent, fontWeight:700, minWidth:36 }}>{r.code||"—"}</span>
                    <span style={{ color:txtSec, minWidth:32 }}>{r.val}</span>
                    <span style={{ color:txtMuted, flex:1 }}>{r.note}</span>
                  </div>
                ))}
                {v.summary && <div style={{ fontSize:11, color:txtMuted, marginTop:6 }}>{v.summary}</div>}
              </div>
            </div>
          ))
        )}
        <div style={S.actionRow}>
          <button style={S.btnGhost}   onClick={onClose}>Later</button>
          <button style={S.btnWarn}    onClick={() => onResolve("cloud")}>Use Cloud</button>
          <button style={S.btnPrimary} onClick={() => onResolve("local")}>Keep Mine ✓</button>
        </div>
      </div>
    </div>
  );
}

// ─── CONFLICT DATA ────────────────────────────────────────────────────────────
const CONFLICTS_DATA = [
  {
    id:"ts1", section:"Timesheet", icon:"📅",
    description:"Thu 3 Apr and Fri 4 Apr differ between your device and cloud.",
    time:"3 Apr · 2 days affected", type:"rows",
    local:  { label:"Your version", time:"Today 07:42", rows:[{code:"DT",val:"7.5h",note:"Thu 3 Apr — overtime",hi:true},{code:"DT",val:"8h",note:"Fri 4 Apr — panel swap",hi:true}], summary:"Total: 40.5h" },
    remote: { label:"Cloud version", time:"Yesterday 18:15", rows:[{code:"—",val:"0h",note:"Thu 3 Apr — empty",hi:false},{code:"—",val:"0h",note:"Fri 4 Apr — empty",hi:false}], summary:"Total: 24h" },
  },
  {
    id:"no1", section:"Notes", icon:"📝",
    description:'"Panel replacement — Athy" has two versions.',
    time:"3 Apr · 1 note", type:"split",
    local:  { label:"Your version", time:"Today 07:45", content:"Panel swap completed.\n480V→400V step-down.\nL1=399V L2=401V L3=400V\nEarth continuity ✓\nIsolation >1GΩ\nAll docs signed off." },
    remote: { label:"Cloud version", time:"Yesterday 18:10", content:"Panel swap completed.\n480V→400V step-down.\nL1=399V L2=401V" },
  },
  {
    id:"nb1", section:"Notebooks", icon:"📓",
    description:'"Voltage readings WK13" page has two versions.',
    time:"3 Apr · 1 page", type:"split",
    local:  { label:"Your version", time:"Today 08:10", content:"WK13 readings:\nL1=399V L2=401V L3=400V\nNeutral: 0.3V\nEarth: <0.1Ω\nAll within tolerance ✓\nSigned: R.Morrow" },
    remote: { label:"Cloud version", time:"Yesterday 17:50", content:"WK13 readings:\nL1=399V L2=401V L3=400V" },
  },
  {
    id:"co1", section:"Callouts", icon:"🔧",
    description:"R. Morrow callout entry on 3 Apr differs — cloud version is missing hours and job details.",
    time:"3 Apr · 1 entry", type:"rows",
    local:  { label:"Your version", time:"Today 08:00", rows:[{code:"Who",val:"R. Morrow",note:"",hi:true},{code:"Hrs",val:"6h",note:"callout",hi:true},{code:"Job",val:"HV fault",note:"ESB Grid",hi:true}], summary:"1 callout entry" },
    remote: { label:"Cloud version", time:"Yesterday 19:00", rows:[{code:"Who",val:"R. Morrow",note:"",hi:false},{code:"Hrs",val:"—",note:"missing",hi:false},{code:"Job",val:"—",note:"missing",hi:false}], summary:"Partial entry" },
  },
  {
    id:"ro1", section:"Routines", icon:"📋",
    description:'"Weekly panel inspection" has two versions — cloud is missing 3 steps.',
    time:"2 Apr · 1 routine", type:"rows",
    local:  { label:"Your version", time:"Today 09:00", rows:[{code:"6.",val:"IR scan",note:"added",hi:true},{code:"7.",val:"Log readings",note:"added",hi:true},{code:"8.",val:"Sign off",note:"added",hi:true}], summary:"8 steps total" },
    remote: { label:"Cloud version", time:"Yesterday 20:00", rows:[{code:"6.",val:"—",note:"missing",hi:false},{code:"7.",val:"—",note:"missing",hi:false},{code:"8.",val:"—",note:"missing",hi:false}], summary:"5 steps total" },
  },
  {
    id:"tg1", section:"Note Tags", icon:"🏷️",
    description:"Your local tag list has 1 tag missing from the cloud version.",
    time:"2 Apr · 1 tag", type:"rows",
    local:  { label:"Your version", time:"Today 09:15", rows:[{code:"Tag",val:"Inspection",note:"new tag added locally",hi:true}], summary:"6 tags total" },
    remote: { label:"Cloud version", time:"Yesterday 21:00", rows:[{code:"Tag",val:"—",note:"Inspection tag missing",hi:false}], summary:"5 tags total" },
  },
];

// ─── VIEW 1: TIMESHEET (with global banner + menu badge) ──────────────────────
function TimesheetView({ conflicts, onGoToConflicts }) {
  const count = conflicts.length;
  return (
    <div style={S.shell}>
      <div style={S.header}>
        <div style={{ flex:1 }}>
          <div style={S.hTitle}>Week of Mar 31</div>
          <div style={S.hSub}>40.5 hrs · 5 entries</div>
        </div>
        {/* Menu icon with global conflict badge */}
        <div style={S.menuWrap} onClick={onGoToConflicts}>
          <span style={{ fontSize:22, color:txtMuted }}>☰</span>
          {count > 0 && <div style={S.menuBadge}>{count}</div>}
        </div>
      </div>

      {/* Global banner — visible on EVERY screen */}
      {count > 0 && (
        <div style={S.gBanner}>
          <span>⚠️</span>
          <span style={S.gBannerTxt}>{count} sync conflict{count>1?"s":""} need attention</span>
          <button style={S.gBannerBtn} onClick={onGoToConflicts}>View all</button>
        </div>
      )}

      <div style={S.secLabel}>Days</div>
      {["Mon 31 Mar · DT · 8h","Tue 1 Apr · DT · 8h","Wed 2 Apr · DT · 8h","Thu 3 Apr · DT · 7.5h ⚠","Fri 4 Apr · DT · 8h ⚠"].map((d,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", padding:"11px 16px", borderBottom:`1px solid ${border}`, background: i>2 ? warnBg : bgCard }}>
          <span style={{ flex:1, fontSize:13, color: i>2?warn:txtPri, fontWeight:i>2?700:400 }}>{d}</span>
          {i>2 && <span style={{ fontSize:11, color:warn, fontWeight:700 }}>CONFLICT</span>}
        </div>
      ))}
      <div style={{ flex:1 }} />
    </div>
  );
}

// ─── VIEW 2: CONFLICTS SCREEN ─────────────────────────────────────────────────
function ConflictsView({ conflicts, onResolve, onBack }) {
  const [active, setActive] = useState(null);
  const resolve = (id, choice) => {
    setActive(null);
    onResolve(id);
  };

  return (
    <div style={S.shell}>
      <div style={S.header}>
        <span style={{ color:accent, fontSize:14, fontWeight:700, cursor:"pointer" }} onClick={onBack}>← Back</span>
        <div style={S.hTitle}>Sync Conflicts</div>
        {conflicts.length > 0 && (
          <span style={{ background:danger, color:"#fff", borderRadius:10, padding:"2px 8px", fontSize:12, fontWeight:800 }}>{conflicts.length}</span>
        )}
      </div>

      {conflicts.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 24px", color:txtMuted }}>
          <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
          <div style={{ fontSize:16, fontWeight:700, color:txtPri, marginBottom:6 }}>All synced</div>
          <div style={{ fontSize:13 }}>No conflicts across any section.</div>
        </div>
      ) : (
        <>
          <div style={{ padding:"10px 16px 6px", fontSize:12, color:txtSec }}>
            These items differ between this device and the cloud. Tap each to review and choose which version to keep.
          </div>
          <div style={S.secLabel}>Unresolved — {conflicts.length} item{conflicts.length>1?"s":""}</div>
          {conflicts.map(c => (
            <div key={c.id} style={S.cRow(true)} onClick={() => setActive(c)}>
              <span style={S.cIcon}>{c.icon}</span>
              <div style={S.cMeta}>
                <div style={S.cSection}>{c.section}</div>
                <div style={S.cDesc}>{c.description}</div>
                <div style={S.cTime}>{c.time}</div>
              </div>
              <span style={S.cBadge}>CONFLICT</span>
              <span style={S.cChev}>›</span>
            </div>
          ))}
        </>
      )}

      <ResolutionSheet
        conflict={active}
        onClose={() => setActive(null)}
        onResolve={(choice) => resolve(active?.id, choice)}
      />
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("timesheet"); // "timesheet" | "conflicts"
  const [remaining, setRemaining] = useState(CONFLICTS_DATA.map(c => c.id));
  const [tab, setTab] = useState(0);

  const activeConflicts = CONFLICTS_DATA.filter(c => remaining.includes(c.id));
  const resolve = (id) => setRemaining(r => r.filter(x => x !== id));
  const reset = () => setRemaining(CONFLICTS_DATA.map(c => c.id));

  const DEMO_TABS = ["Screen 1: Timesheet", "Screen 2: Conflicts list"];

  return (
    <div style={{ background:"#d8e0ea", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <div style={S.tabs}>
        {DEMO_TABS.map((t,i) => <button key={i} style={S.tab(tab===i)} onClick={() => { setTab(i); setView(i===0?"timesheet":"conflicts"); }}>{t}</button>)}
        <button style={{ ...S.tab(false), marginLeft:"auto", color:txtMuted }} onClick={reset}>↺ Reset</button>
      </div>

      <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
        {view === "timesheet" && (
          <TimesheetView conflicts={activeConflicts} onGoToConflicts={() => { setView("conflicts"); setTab(1); }} />
        )}
        {view === "conflicts" && (
          <ConflictsView conflicts={activeConflicts} onResolve={resolve} onBack={() => { setView("timesheet"); setTab(0); }} />
        )}
      </div>

      <div style={{ textAlign:"center", padding:"6px 0 10px", fontSize:10, color:txtMuted }}>
        Screen 1: tap ☰ or "View all" → goes to Screen 2 · Screen 2: tap a conflict to resolve it
      </div>
    </div>
  );
}
