import { useState, useRef } from "react";

const DARK = "#1A2B3C";
const ACCENT = "#F5A623";
const CODE_COLOR = "#6B8CAE";
const TEXT_MUTED = "#8A97AB";
const PAGE_BG = "#F0F3F8";

const activeSummary = [
  { code: "MXY0002A10", label: "Maintenance Power RSU",            ord: 8,  ot: 0 },
  { code: "MXY0005A10", label: "Routine Power RSU",                ord: 8,  ot: 0 },
  { code: "RLB0003A10", label: "COW-Escort; ESAT",                 ord: 8,  ot: 1 },
  { code: "UWO0001A99", label: "Other Unworked Leave; Meetings",   ord: 8,  ot: 1 },
  { code: "MLE0004A10", label: "Routine AXE RSU",                  ord: 8,  ot: 0 },
  { code: "CYP6011U24", label: "Field – NGN Access Orders (P/M)", ord: 0,  ot: 8 },
  { code: "ICD0004H14", label: "Cease/Cancel – NGN Customer Circuits", ord: 3, ot: 0 },
  { code: "MCY0002A10", label: "Maintenance DSL",                  ord: 4,  ot: 0 },
];
const totalOrd = activeSummary.reduce((s, r) => s + r.ord, 0);
const totalOT  = activeSummary.reduce((s, r) => s + r.ot,  0);

const days = [
  { name: "Friday",    date: "27 Feb", tasks: 4, ord: 7, ot: 1 },
  { name: "Saturday",  date: "28 Feb", tasks: 0, ord: 0, ot: 0 },
  { name: "Sunday",    date: "1 Mar",  tasks: 1, ord: 0, ot: 8 },
  { name: "Monday",    date: "2 Mar",  tasks: 2, ord: 8, ot: 0 },
  { name: "Tuesday",   date: "3 Mar",  tasks: 2, ord: 8, ot: 0 },
  { name: "Wednesday", date: "4 Mar",  tasks: 2, ord: 8, ot: 1 },
  { name: "Thursday",  date: "5 Mar",  tasks: 1, ord: 8, ot: 1 },
];

/* ─── shared sub-components ─────────────────────────────────── */

function PhoneShell({ children, label, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 320, height: 640,
        background: PAGE_BG,
        borderRadius: 36,
        boxShadow: `0 32px 64px rgba(0,0,0,0.32), 0 0 0 7px #1a2030, 0 0 0 9px ${accent}44`,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {children}
      </div>
      <div style={{
        fontSize: 12, fontWeight: 700, color: accent,
        background: `${accent}18`, borderRadius: 20,
        padding: "5px 14px", letterSpacing: 0.3,
      }}>{label}</div>
    </div>
  );
}

function AppHeader() {
  return (
    <div style={{ background: DARK, padding: "14px 16px 0", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 18, cursor: "pointer" }}>‹</span>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>27 Feb – 5 Mar</div>
          <div style={{ fontSize: 10, color: "#6FCF97" }}>✓ Synced · v3.6.35</div>
        </div>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 18, cursor: "pointer" }}>›</span>
      </div>
      <div style={{ display: "flex", marginTop: 4 }}>
        {["Timesheet","Notes","Finder"].map((t,i) => (
          <div key={t} style={{
            flex:1, textAlign:"center", padding:"7px 0 8px",
            fontSize:11, fontWeight: i===0?700:500,
            color: i===0 ? ACCENT : "rgba(255,255,255,0.38)",
            borderBottom: i===0 ? `2px solid ${ACCENT}` : "2px solid transparent",
          }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

function DayList({ bottomPad = 70 }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: bottomPad }}>
      {days.map(day => (
        <div key={day.name} style={{
          display:"flex", alignItems:"center", padding:"11px 14px",
          background: day.tasks===0 ? "#F5F7FC" : "#fff",
          borderBottom:"1px solid #ECEEF5", gap:8,
        }}>
          <span style={{ color: day.tasks===0 ? "#CBD5E1":"#4A6CF7", fontSize:10, width:10 }}>▶</span>
          <span style={{ fontWeight:700, fontSize:13, color: day.tasks===0?TEXT_MUTED:DARK, minWidth:76 }}>{day.name}</span>
          <span style={{ fontSize:11, color:TEXT_MUTED, flex:1 }}>{day.date}</span>
          <div style={{ display:"flex", gap:4 }}>
            {day.tasks>0 && <Pill bg="#ECEEF5" color="#5A6480">{day.tasks} task{day.tasks>1?"s":""}</Pill>}
            {day.ord>0  && <Pill bg="#ECEEF5" color="#5A6480">{day.ord}h</Pill>}
            {day.ot>0   && <Pill bg="#FFF3DC" color={ACCENT}>+{day.ot} OT</Pill>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Pill({ bg, color, children }) {
  return (
    <span style={{ background:bg, color, borderRadius:20, padding:"2px 7px", fontSize:10, fontWeight:600 }}>
      {children}
    </span>
  );
}

function StatsBar({ onClick, label = "↑ Weekly Summary" }) {
  return (
    <div style={{
      cursor:"pointer", background:DARK, borderRadius:12,
      padding:"9px 12px", display:"flex", alignItems:"center", gap:8,
      boxShadow:"0 -2px 16px rgba(26,34,51,0.2), 0 4px 12px rgba(26,34,51,0.2)",
    }} onClick={onClick}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:34 }}>
        <span style={{ fontSize:15, fontWeight:800, color:"#fff", lineHeight:1 }}>{totalOrd}</span>
        <span style={{ fontSize:8, color:"rgba(255,255,255,0.38)", marginTop:2 }}>ORD</span>
      </div>
      <div style={{ width:1, height:22, background:"rgba(255,255,255,0.1)" }}/>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:34 }}>
        <span style={{ fontSize:15, fontWeight:800, color:ACCENT, lineHeight:1 }}>+{totalOT}</span>
        <span style={{ fontSize:8, color:"rgba(245,166,35,0.45)", marginTop:2 }}>OT</span>
      </div>
      <div style={{ width:1, height:22, background:"rgba(255,255,255,0.1)" }}/>
      <div style={{ flex:1, display:"flex", gap:4, overflow:"hidden", WebkitMaskImage:"linear-gradient(to right,black 60%,transparent 100%)" }}>
        {activeSummary.map(r => (
          <div key={r.code} style={{ flexShrink:0, background:"rgba(255,255,255,0.08)", borderRadius:6, padding:"2px 6px", display:"flex", flexDirection:"column", alignItems:"center" }}>
            <span style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.7)", whiteSpace:"nowrap" }}>
              {r.ord>0?`${r.ord}h`:""}{r.ot>0?` +${r.ot}OT`:""}
            </span>
            <span style={{ fontSize:7, color:"rgba(163,185,255,0.55)", whiteSpace:"nowrap" }}>{r.code}</span>
          </div>
        ))}
      </div>
      <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", whiteSpace:"nowrap" }}>{label}</span>
    </div>
  );
}

function SummaryTable() {
  return (
    <>
      <div style={{ display:"flex", padding:"6px 0", borderBottom:"1px solid #F0F2F7" }}>
        <div style={{ flex:1, fontSize:8, fontWeight:700, color:TEXT_MUTED, letterSpacing:1.1 }}>WORK CODE / DESCRIPTION</div>
        <div style={{ width:34, textAlign:"right", fontSize:8, fontWeight:700, color:TEXT_MUTED, letterSpacing:1.1 }}>ORD</div>
        <div style={{ width:32, textAlign:"right", fontSize:8, fontWeight:700, color:ACCENT, letterSpacing:1.1 }}>OT</div>
      </div>
      {activeSummary.map((row,i) => (
        <div key={row.code} style={{
          display:"flex", padding:"9px 0", alignItems:"center",
          borderBottom: i<activeSummary.length-1 ? "1px solid #F4F5FA" : "none",
        }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:8, color:CODE_COLOR, fontWeight:700, fontFamily:"monospace" }}>{row.code}</div>
            <div style={{ fontSize:11, color:DARK, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.label}</div>
          </div>
          <div style={{ width:34, textAlign:"right", fontWeight:700, color:DARK, fontSize:12 }}>
            {row.ord>0 ? row.ord : <span style={{color:"#D0D5E8"}}>—</span>}
          </div>
          <div style={{ width:32, textAlign:"right", fontWeight:700, color:ACCENT, fontSize:12 }}>
            {row.ot>0 ? `+${row.ot}` : <span style={{color:"#D0D5E8"}}>—</span>}
          </div>
        </div>
      ))}
      <div style={{ display:"flex", padding:"10px 0 0", borderTop:"2px solid #E8EBF5", marginTop:2 }}>
        <div style={{ flex:1, fontWeight:800, color:TEXT_MUTED, fontSize:9, letterSpacing:1.1 }}>TOTAL</div>
        <div style={{ width:34, textAlign:"right", fontWeight:900, color:DARK, fontSize:15 }}>{totalOrd}</div>
        <div style={{ width:32, textAlign:"right", fontWeight:900, color:ACCENT, fontSize:15 }}>+{totalOT}</div>
      </div>
    </>
  );
}

function BottomNav() {
  return (
    <div style={{
      position:"absolute", bottom:0, left:0, right:0, height:50,
      background:DARK, display:"flex",
      borderTop:"1px solid rgba(255,255,255,0.07)", zIndex:100,
    }}>
      {["💼 Timesheet","📝 Notes","🔍 Finder"].map((t,i) => (
        <div key={t} style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:2,
          fontSize:10, fontWeight:500, cursor:"pointer",
          color: i===0 ? ACCENT : "rgba(255,255,255,0.38)",
        }}>
          {i===0 && <div style={{ position:"absolute", top:0, height:2, width:30, background:ACCENT, borderRadius:"0 0 2px 2px" }}/>}
          <span style={{ fontSize:15 }}>{t.split(" ")[0]}</span>
          <span>{t.split(" ").slice(1).join(" ")}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Option A: Inline scroll ────────────────────────────────── */
function OptionA() {
  const summaryRef = useRef(null);
  const scrollRef  = useRef(null);

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PhoneShell label="A — Inline scroll" accent="#4A90D9">
      <AppHeader />
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", paddingBottom:58 }}>
        {/* Day rows */}
        {days.map(day => (
          <div key={day.name} style={{
            display:"flex", alignItems:"center", padding:"11px 14px",
            background: day.tasks===0 ? "#F5F7FC" : "#fff",
            borderBottom:"1px solid #ECEEF5", gap:8,
          }}>
            <span style={{ color: day.tasks===0?"#CBD5E1":"#4A6CF7", fontSize:10, width:10 }}>▶</span>
            <span style={{ fontWeight:700, fontSize:13, color: day.tasks===0?TEXT_MUTED:DARK, minWidth:76 }}>{day.name}</span>
            <span style={{ fontSize:11, color:TEXT_MUTED, flex:1 }}>{day.date}</span>
            <div style={{ display:"flex", gap:4 }}>
              {day.tasks>0 && <Pill bg="#ECEEF5" color="#5A6480">{day.tasks} task{day.tasks>1?"s":""}</Pill>}
              {day.ord>0  && <Pill bg="#ECEEF5" color="#5A6480">{day.ord}h</Pill>}
              {day.ot>0   && <Pill bg="#FFF3DC" color={ACCENT}>+{day.ot} OT</Pill>}
            </div>
          </div>
        ))}

        {/* Inline summary section */}
        <div ref={summaryRef} style={{ background:"#fff", margin:"10px 12px 10px", borderRadius:16, padding:"14px 14px", boxShadow:"0 1px 8px rgba(0,0,0,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", marginBottom:12 }}>
            <span style={{ flex:1, fontWeight:800, fontSize:14, color:DARK }}>Weekly Summary</span>
            <span style={{ fontSize:11, color:TEXT_MUTED }}>27 Feb – 5 Mar</span>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <div style={{ flex:1, background:"#F0F4FF", borderRadius:10, padding:"10px 0", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:DARK }}>{totalOrd}</div>
              <div style={{ fontSize:9, color:TEXT_MUTED, fontWeight:600, letterSpacing:0.5 }}>ORDINARY HRS</div>
            </div>
            <div style={{ flex:1, background:"#FFF8EC", borderRadius:10, padding:"10px 0", textAlign:"center", border:"1px solid rgba(245,166,35,0.2)" }}>
              <div style={{ fontSize:22, fontWeight:800, color:ACCENT }}>+{totalOT}</div>
              <div style={{ fontSize:9, color:"rgba(245,166,35,0.7)", fontWeight:600, letterSpacing:0.5 }}>OVERTIME HRS</div>
            </div>
          </div>
          <SummaryTable />
        </div>
      </div>

      {/* Fixed stats bar that scrolls you down */}
      <div style={{ position:"absolute", bottom:50, left:0, right:0, padding:"0 12px 8px", zIndex:90 }}>
        <StatsBar onClick={scrollToSummary} label="↓ Summary" />
      </div>
      <BottomNav />
    </PhoneShell>
  );
}

/* ─── Option B: Thin bar only, inline table ──────────────────── */
function OptionB() {
  const [open, setOpen] = useState(true);
  return (
    <PhoneShell label="B — Slim bar + inline" accent="#22C55E">
      <AppHeader />
      <div style={{ flex:1, overflowY:"auto", paddingBottom:58 }}>
        {days.map(day => (
          <div key={day.name} style={{
            display:"flex", alignItems:"center", padding:"11px 14px",
            background: day.tasks===0?"#F5F7FC":"#fff",
            borderBottom:"1px solid #ECEEF5", gap:8,
          }}>
            <span style={{ color:day.tasks===0?"#CBD5E1":"#4A6CF7", fontSize:10, width:10 }}>▶</span>
            <span style={{ fontWeight:700, fontSize:13, color:day.tasks===0?TEXT_MUTED:DARK, minWidth:76 }}>{day.name}</span>
            <span style={{ fontSize:11, color:TEXT_MUTED, flex:1 }}>{day.date}</span>
            <div style={{ display:"flex", gap:4 }}>
              {day.tasks>0&&<Pill bg="#ECEEF5" color="#5A6480">{day.tasks} task{day.tasks>1?"s":""}</Pill>}
              {day.ord>0&&<Pill bg="#ECEEF5" color="#5A6480">{day.ord}h</Pill>}
              {day.ot>0&&<Pill bg="#FFF3DC" color={ACCENT}>+{day.ot} OT</Pill>}
            </div>
          </div>
        ))}

        {/* Inline collapsible summary — sits in page flow */}
        <div style={{ margin:"10px 12px 10px", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 8px rgba(0,0,0,0.07)" }}>
          <div
            onClick={() => setOpen(o => !o)}
            style={{
              background: DARK, padding:"11px 14px",
              display:"flex", alignItems:"center", cursor:"pointer", gap:10,
            }}
          >
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:34 }}>
              <span style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{totalOrd}</span>
              <span style={{ fontSize:8, color:"rgba(255,255,255,0.38)" }}>ORD</span>
            </div>
            <div style={{ width:1, height:24, background:"rgba(255,255,255,0.1)" }}/>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:34 }}>
              <span style={{ fontSize:16, fontWeight:800, color:ACCENT }}>+{totalOT}</span>
              <span style={{ fontSize:8, color:"rgba(245,166,35,0.45)" }}>OT</span>
            </div>
            <div style={{ width:1, height:24, background:"rgba(255,255,255,0.1)" }}/>
            <span style={{ flex:1, fontWeight:700, fontSize:12, color:"rgba(255,255,255,0.7)" }}>Weekly Summary</span>
            <span style={{ color:"rgba(255,255,255,0.4)", fontSize:14, transition:"transform 0.2s", transform: open?"rotate(180deg)":"rotate(0deg)" }}>▾</span>
          </div>
          {open && (
            <div style={{ background:"#fff", padding:"12px 14px" }}>
              <SummaryTable />
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneShell>
  );
}

/* ─── Option C: Popover from bar ─────────────────────────────── */
function OptionC() {
  const [open, setOpen] = useState(false);
  return (
    <PhoneShell label="C — Popover from bar" accent="#A855F7">
      <AppHeader />
      <DayList bottomPad={72} />

      {/* Popover */}
      {open && (
        <div
          style={{
            position:"absolute", bottom:108, left:12, right:12,
            background:"#fff", borderRadius:18,
            boxShadow:"0 -4px 32px rgba(26,34,51,0.2), 0 8px 24px rgba(26,34,51,0.15)",
            zIndex:150, padding:"14px 14px 4px",
            maxHeight:340, display:"flex", flexDirection:"column",
          }}
        >
          {/* Arrow pointing down toward the bar */}
          <div style={{
            position:"absolute", bottom:-8, left:"50%", transform:"translateX(-50%)",
            width:16, height:8, overflow:"hidden",
          }}>
            <div style={{ width:16, height:16, background:"#fff", transform:"rotate(45deg) translateY(-8px)", boxShadow:"2px 2px 4px rgba(0,0,0,0.08)" }}/>
          </div>

          <div style={{ display:"flex", alignItems:"center", marginBottom:10 }}>
            <span style={{ flex:1, fontWeight:800, fontSize:13, color:DARK }}>Weekly Summary</span>
            <button onClick={()=>setOpen(false)} style={{ background:"none", border:"none", color:TEXT_MUTED, fontSize:18, cursor:"pointer", padding:"0 0 0 8px" }}>×</button>
          </div>

          {/* Compact totals inline */}
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <div style={{ flex:1, background:"#F0F4FF", borderRadius:9, padding:"8px 0", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:800, color:DARK }}>{totalOrd}</div>
              <div style={{ fontSize:8, color:TEXT_MUTED, fontWeight:600, letterSpacing:0.5 }}>ORDINARY HRS</div>
            </div>
            <div style={{ flex:1, background:"#FFF8EC", borderRadius:9, padding:"8px 0", textAlign:"center", border:"1px solid rgba(245,166,35,0.2)" }}>
              <div style={{ fontSize:18, fontWeight:800, color:ACCENT }}>+{totalOT}</div>
              <div style={{ fontSize:8, color:"rgba(245,166,35,0.7)", fontWeight:600, letterSpacing:0.5 }}>OVERTIME HRS</div>
            </div>
          </div>

          <div style={{ overflowY:"auto", flex:1, paddingBottom:10 }}>
            <SummaryTable />
          </div>
        </div>
      )}

      {/* Tap outside to close */}
      {open && (
        <div onClick={()=>setOpen(false)} style={{ position:"absolute", inset:0, zIndex:140 }}/>
      )}

      <div style={{ position:"absolute", bottom:50, left:0, right:0, padding:"0 12px 8px", zIndex:160 }}>
        <StatsBar onClick={()=>setOpen(o=>!o)} label={open?"▾ Close":"▴ Summary"} />
      </div>
      <BottomNav />
    </PhoneShell>
  );
}

/* ─── Option D: Dedicated Summary tab ───────────────────────── */
function OptionD() {
  const [tab, setTab] = useState("timesheet");
  const tabs = [
    { id:"timesheet", icon:"💼", label:"Timesheet" },
    { id:"summary",   icon:"📊", label:"Summary"   },
    { id:"notes",     icon:"📝", label:"Notes"     },
    { id:"finder",    icon:"🔍", label:"Finder"    },
  ];
  return (
    <PhoneShell label="D — Dedicated tab" accent="#F43F5E">
      <AppHeader />

      {tab === "timesheet" && <DayList bottomPad={58} />}

      {tab === "summary" && (
        <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 70px" }}>
          <div style={{ fontWeight:800, fontSize:16, color:DARK, marginBottom:12 }}>Weekly Summary</div>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, background:"#F0F4FF", borderRadius:12, padding:"12px 0", textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:800, color:DARK }}>{totalOrd}</div>
              <div style={{ fontSize:9, color:TEXT_MUTED, fontWeight:600, letterSpacing:0.5 }}>ORDINARY HRS</div>
            </div>
            <div style={{ flex:1, background:"#FFF8EC", borderRadius:12, padding:"12px 0", textAlign:"center", border:"1px solid rgba(245,166,35,0.2)" }}>
              <div style={{ fontSize:26, fontWeight:800, color:ACCENT }}>+{totalOT}</div>
              <div style={{ fontSize:9, color:"rgba(245,166,35,0.7)", fontWeight:600, letterSpacing:0.5 }}>OVERTIME HRS</div>
            </div>
          </div>
          <div style={{ background:"#fff", borderRadius:16, padding:"14px", boxShadow:"0 1px 8px rgba(0,0,0,0.07)" }}>
            <SummaryTable />
          </div>
        </div>
      )}

      {(tab === "notes" || tab === "finder") && (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:TEXT_MUTED, fontSize:13 }}>
          {tab === "notes" ? "📝 Notes" : "🔍 Finder"} view
        </div>
      )}

      {/* 4-tab bottom nav */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:54,
        background:DARK, display:"flex",
        borderTop:"1px solid rgba(255,255,255,0.07)", zIndex:100,
      }}>
        {tabs.map(t => (
          <div key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:2,
            fontSize:9, fontWeight:500, cursor:"pointer",
            color: tab===t.id ? ACCENT : "rgba(255,255,255,0.38)",
          }}>
            {tab===t.id && <div style={{ position:"absolute", top:0, height:2, width:28, background:ACCENT, borderRadius:"0 0 2px 2px" }}/>}
            <span style={{ fontSize:14 }}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>
    </PhoneShell>
  );
}

/* ─── Main layout ─────────────────────────────────────────────── */
export default function AllOptions() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg, #1a2030 0%, #2d3a50 100%)",
      padding:"40px 24px 60px",
      fontFamily:"'Inter', system-ui, sans-serif",
    }}>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <h1 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:0 }}>Weekly Summary — 4 Options</h1>
        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:13, marginTop:6 }}>All interactive · tap buttons to see each behaviour</p>
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",
        gap:40,
        justifyItems:"center",
        maxWidth:1400,
        margin:"0 auto",
      }}>
        <OptionA />
        <OptionB />
        <OptionC />
        <OptionD />
      </div>

      <div style={{ marginTop:40, maxWidth:900, margin:"40px auto 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {[
          { letter:"A", color:"#4A90D9", title:"Inline scroll", desc:"Stats bar scrolls you to the summary table at the bottom of the page. No overlay. Table always there." },
          { letter:"B", color:"#22C55E", title:"Slim bar + inline toggle", desc:"A dark header row in the page collapses/expands the table. Totals always visible. No fixed bar needed." },
          { letter:"C", color:"#A855F7", title:"Popover from bar", desc:"Stats bar stays fixed. Tapping it opens a compact card above it — covers ~45% of screen. Tap anywhere to close." },
          { letter:"D", color:"#F43F5E", title:"Dedicated tab", desc:"Summary gets its own tab in the nav. Totally separate from the timesheet scroll. Cleanest separation." },
        ].map(o => (
          <div key={o.letter} style={{
            background:"rgba(255,255,255,0.06)", borderRadius:14, padding:"14px 16px",
            borderLeft:`3px solid ${o.color}`,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontWeight:800, fontSize:14, color:o.color }}>Option {o.letter}</span>
              <span style={{ fontWeight:700, fontSize:13, color:"#fff" }}>— {o.title}</span>
            </div>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:12, margin:0, lineHeight:1.6 }}>{o.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
