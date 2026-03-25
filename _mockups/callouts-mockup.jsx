import { useState, useRef, useEffect } from "react";

// ─── Mock site data (like Rian's location picker) ──────────────
const SITES = [
  "ATHGARVAN", "ATHY", "BALLYROAN", "BALLYTORE", "BORRIS-IN-OSSORY",
  "CARRAGH", "CASTLEDERMOT", "CLANE", "CLONASLEE", "CRINKILL",
  "DURROW", "EDENDERRY", "JOHNSTOWN", "KILMEAGUE CABINET", "KILDARE",
  "MONASTEREVIN", "MOUNTMELLICK", "MUCKLAGH", "NEWHALL", "PORTARLINGTON",
  "PORTLAOISE", "RATHCABBIN", "RATHDOWNEY", "ROSCREA", "ROSENALLIS",
  "STRADBALLY", "TERENURE", "TULLAMORE", "VICARSTOWN"
];

// ─── Common Fault Templates ────────────────────────────────────
const FAULT_TEMPLATES = [
  "EXTERNAL ALARM: HIGH TEMP",
  "EXTERNAL ALARM: AC MAINS FAIL",
  "EXTERNAL ALARM: RECTIFIER FAIL",
  "EXTERNAL ALARM: POWER REC FAIL",
  "DCPower Battery Fuse Failure",
  "03-Battery-Fault",
  "External Alarm, Battery Breaker Trip",
  "RECTIFIER at",
];

const Icons = {
  Chevron: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  MapPin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8453c" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
};

// ─── Site Picker Modal ─────────────────────────────────────────
function SitePicker({ open, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  if (!open) return null;
  const filtered = q ? SITES.filter(s => s.toLowerCase().includes(q.toLowerCase())) : SITES;
  return (
    <div style={{ position: "absolute", inset: 0, background: "white", zIndex: 100, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid #eee", gap: 8 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "#4A72FF" }}><Icons.Back /></button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#f5f5f3", borderRadius: 8, padding: "0 10px" }}>
          <Icons.Search />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search sites..." style={{ flex: 1, border: "none", background: "none", padding: "10px 8px", fontSize: 14, outline: "none" }} />
          {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#999" }}><Icons.X /></button>}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map(site => (
          <button key={site} onClick={() => { onSelect(site); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 16px", border: "none", borderBottom: "1px solid #f0f0f0", background: "white", fontSize: 14, cursor: "pointer", textAlign: "left" }}>
            <Icons.MapPin /> {site}
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "#999" }}>
            No sites matching "{q}"
            <button onClick={() => { onSelect(q.toUpperCase()); onClose(); }} style={{ display: "block", margin: "12px auto 0", padding: "8px 16px", background: "#4A72FF", color: "white", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              Use "{q.toUpperCase()}" as new site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Time Picker (scroll wheels) ───────────────────────────────
function TimePicker({ open, value, onSelect, onClose, label }) {
  const [h, setH] = useState(parseInt(value?.split(":")[0]) || 18);
  const [m, setM] = useState(parseInt(value?.split(":")[1]) || 0);
  if (!open) return null;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const mins = Array.from({ length: 12 }, (_, i) => i * 5);

  const wheelStyle = { flex: 1, height: 200, overflowY: "auto", scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" };
  const itemBase = { height: 44, display: "flex", alignItems: "center", justifyContent: "center", scrollSnapAlign: "center", fontSize: 20, cursor: "pointer", transition: "all 0.15s" };

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", background: "white", borderRadius: "16px 16px 0 0", padding: "0 0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #eee" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#999", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
          <button onClick={() => { onSelect(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`); onClose(); }} style={{ background: "none", border: "none", color: "#4A72FF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Done</button>
        </div>
        <div style={{ display: "flex", padding: "10px 20px", gap: 0 }}>
          {/* Hour wheel */}
          <div style={wheelStyle}>
            {hours.map(hr => (
              <div key={hr} onClick={() => setH(hr)} style={{ ...itemBase, fontWeight: h === hr ? 700 : 400, color: h === hr ? "#4A72FF" : "#bbb", background: h === hr ? "#EEF2FF" : "transparent", borderRadius: 10 }}>
                {String(hr).padStart(2, "0")}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 28, fontWeight: 700, color: "#333", padding: "0 4px" }}>:</div>
          {/* Minute wheel */}
          <div style={wheelStyle}>
            {mins.map(mn => (
              <div key={mn} onClick={() => setM(mn)} style={{ ...itemBase, fontWeight: m === mn ? 700 : 400, color: m === mn ? "#4A72FF" : "#bbb", background: m === mn ? "#EEF2FF" : "transparent", borderRadius: 10 }}>
                {String(mn).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>
        {/* Quick-set: NOW button */}
        <div style={{ textAlign: "center" }}>
          <button onClick={() => { const now = new Date(); setH(now.getHours()); setM(Math.round(now.getMinutes()/5)*5); }} style={{ padding: "8px 24px", background: "#f0f0f0", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555" }}>
            Set to NOW
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Date Picker (calendar style) ──────────────────────────────
function DatePickerModal({ open, value, onSelect, onClose, weekStart, weekEnd }) {
  const [selDate, setSelDate] = useState(value || "2026-03-22");
  if (!open) return null;

  // Generate 7 days of the on-call week
  const start = new Date(weekStart || "2026-03-22");
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fmt = (d) => d.toISOString().split("T")[0];
  const today = "2026-03-22";

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", background: "white", borderRadius: "16px 16px 0 0", padding: "0 0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #eee" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#999", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Select Date</span>
          <button onClick={() => { onSelect(selDate); onClose(); }} style={{ background: "none", border: "none", color: "#4A72FF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Done</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, padding: "16px 12px" }}>
          {days.map(d => {
            const ds = fmt(d);
            const isSelected = ds === selDate;
            const isToday = ds === today;
            return (
              <button key={ds} onClick={() => setSelDate(ds)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "10px 4px", border: isSelected ? "2px solid #4A72FF" : "1px solid #eee",
                background: isSelected ? "#EEF2FF" : "white", borderRadius: 12, cursor: "pointer",
              }}>
                <span style={{ fontSize: 11, color: isSelected ? "#4A72FF" : "#888", fontWeight: 500 }}>{dayNames[d.getDay()]}</span>
                <span style={{ fontSize: 18, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#4A72FF" : "#1a1a1a" }}>{d.getDate()}</span>
                <span style={{ fontSize: 10, color: "#aaa" }}>{monthNames[d.getMonth()]}</span>
                {isToday && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Fault Picker (templates + free text) ──────────────────────
function FaultPicker({ open, value, onSelect, onClose }) {
  const [text, setText] = useState(value || "");
  const inputRef = useRef(null);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: "white", zIndex: 100, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid #eee", gap: 8 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#4A72FF" }}><Icons.Back /></button>
        <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>Fault Description</span>
        <button onClick={() => { onSelect(text); onClose(); }} style={{ background: "none", border: "none", color: "#4A72FF", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Done</button>
      </div>
      <div style={{ padding: 12 }}>
        <textarea ref={inputRef} value={text} onChange={e => setText(e.target.value)} placeholder="Type or select a template below..." rows={3} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
      </div>
      <div style={{ padding: "0 12px 4px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#8a8a8a", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Common Faults</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
        {FAULT_TEMPLATES.map(tmpl => (
          <button key={tmpl} onClick={() => setText(tmpl)} style={{ display: "block", width: "100%", padding: "10px 12px", border: "1px solid #eee", borderRadius: 8, background: text === tmpl ? "#EEF2FF" : "white", fontSize: 13, cursor: "pointer", textAlign: "left", marginBottom: 6, color: "#333" }}>
            {tmpl}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── VIEW: Add/Edit Callout Form ───────────────────────────────
function AddCalloutView({ onBack, onSave }) {
  const [date, setDate] = useState("2026-03-22");
  const [ticket, setTicket] = useState("");
  const [site, setSite] = useState("");
  const [fault, setFault] = useState("");
  const [onSiteTime, setOnSiteTime] = useState("");
  const [leftTime, setLeftTime] = useState("");

  const [showSitePicker, setShowSitePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showOnSiteTimePicker, setShowOnSiteTimePicker] = useState(false);
  const [showLeftTimePicker, setShowLeftTimePicker] = useState(false);
  const [showFaultPicker, setShowFaultPicker] = useState(false);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const fmtDate = (iso) => {
    if (!iso) return "Select date";
    const d = new Date(iso + "T12:00:00");
    return `${dayNames[d.getDay()]} ${d.getDate()}. ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const rowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "white", borderBottom: "1px solid #f0f0f0", cursor: "pointer" };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 };
  const valStyle = { fontSize: 14, color: "#1a1a1a", marginTop: 2 };
  const emptyValStyle = { ...valStyle, color: "#ccc", fontStyle: "italic" };

  return (
    <div style={{ position: "relative", height: "100%", minHeight: 650 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 12px 12px 8px", borderBottom: "1px solid #eee", gap: 4, background: "white" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "#4A72FF" }}><Icons.Back /></button>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#1a1a1a", flex: 1 }}>Log Callout</h2>
      </div>

      {/* Date row */}
      <div onClick={() => setShowDatePicker(true)} style={rowStyle}>
        <div>
          <div style={labelStyle}><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icons.Calendar /> Date</span></div>
          <div style={date ? valStyle : emptyValStyle}>{fmtDate(date)}</div>
        </div>
        <Icons.Chevron />
      </div>

      {/* Ticket row — direct input */}
      <div style={{ ...rowStyle, cursor: "default" }}>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>Ticket Number</div>
          <input value={ticket} onChange={e => setTicket(e.target.value)} placeholder="e.g. R23482335" style={{ border: "none", outline: "none", fontSize: 14, fontFamily: "monospace", color: "#1a1a1a", width: "100%", padding: "2px 0 0", background: "transparent" }} />
        </div>
      </div>

      {/* Site row — opens picker */}
      <div onClick={() => setShowSitePicker(true)} style={rowStyle}>
        <div>
          <div style={labelStyle}><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icons.MapPin /> Site</span></div>
          <div style={site ? valStyle : emptyValStyle}>{site || "Select site"}</div>
        </div>
        <Icons.Chevron />
      </div>

      {/* Fault row — opens fault picker */}
      <div onClick={() => setShowFaultPicker(true)} style={rowStyle}>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>Fault</div>
          <div style={fault ? { ...valStyle, fontSize: 13, lineHeight: 1.4 } : emptyValStyle}>{fault || "Describe the fault"}</div>
        </div>
        <Icons.Chevron />
      </div>

      {/* Time row — side by side */}
      <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
        <div onClick={() => setShowOnSiteTimePicker(true)} style={{ ...rowStyle, flex: 1, borderBottom: "none" }}>
          <div>
            <div style={labelStyle}><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icons.Clock /> On Site</span></div>
            <div style={onSiteTime ? { ...valStyle, fontSize: 18, fontFamily: "monospace", fontWeight: 600 } : emptyValStyle}>{onSiteTime || "—:—"}</div>
          </div>
        </div>
        <div style={{ width: 1, background: "#f0f0f0" }} />
        <div onClick={() => setShowLeftTimePicker(true)} style={{ ...rowStyle, flex: 1, borderBottom: "none" }}>
          <div>
            <div style={labelStyle}><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icons.Clock /> Left Site</span></div>
            <div style={leftTime ? { ...valStyle, fontSize: 18, fontFamily: "monospace", fontWeight: 600 } : emptyValStyle}>{leftTime || "—:—"}</div>
          </div>
        </div>
      </div>

      {/* Duration display */}
      {onSiteTime && leftTime && (() => {
        const [h1, m1] = onSiteTime.split(":").map(Number);
        const [h2, m2] = leftTime.split(":").map(Number);
        let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (mins < 0) mins += 24 * 60;
        const dh = Math.floor(mins / 60);
        const dm = mins % 60;
        return (
          <div style={{ padding: "10px 16px", background: "#f8fdf8", borderBottom: "1px solid #f0f0f0", fontSize: 13, color: "#22863a", fontWeight: 500 }}>
            Duration: {dh}h {dm > 0 ? `${dm}m` : ""}
          </div>
        );
      })()}

      {/* Save button */}
      <div style={{ padding: "20px 16px" }}>
        <button onClick={onSave} style={{ width: "100%", padding: "14px", background: (!ticket || !site) ? "#ccc" : "#4A72FF", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: (!ticket || !site) ? "default" : "pointer" }}>
          Save Callout
        </button>
      </div>

      {/* Modals */}
      <SitePicker open={showSitePicker} onSelect={setSite} onClose={() => setShowSitePicker(false)} />
      <DatePickerModal open={showDatePicker} value={date} onSelect={setDate} onClose={() => setShowDatePicker(false)} weekStart="2026-03-22" weekEnd="2026-03-28" />
      <TimePicker open={showOnSiteTimePicker} value={onSiteTime} onSelect={setOnSiteTime} onClose={() => setShowOnSiteTimePicker(false)} label="Engineer On Site" />
      <TimePicker open={showLeftTimePicker} value={leftTime} onSelect={setLeftTime} onClose={() => setShowLeftTimePicker(false)} label="Left Site" />
      <FaultPicker open={showFaultPicker} value={fault} onSelect={setFault} onClose={() => setShowFaultPicker(false)} />
    </div>
  );
}

// ─── VIEW: Week Detail — Callout Log ───────────────────────────
const MOCK_CALLOUTS = [
  { id: 1, date: "2025-08-10", day: "Sun", ticket: "R23482335", site: "BALLYROAN", fault: "EXTERNAL ALARM: AC MAINS FAIL BAOA01", engineerOnSite: "16:05", leftSite: "17:30" },
  { id: 2, date: "2025-08-11", day: "Mon", ticket: "R23488079", site: "ATHGARVAN", fault: "EXTERNAL ALARM: AGN CAB HIGH TEMP AGNA", engineerOnSite: "16:09", leftSite: "17:00" },
  { id: 3, date: "2025-08-11", day: "Mon", ticket: "R23488853", site: "ATHGARVAN", fault: "EXTERNAL ALARM: AGN CAB HIGH TEMP AGNA", engineerOnSite: "18:16", leftSite: "19:00" },
  { id: 4, date: "2025-08-11", day: "Mon", ticket: "R23488883", site: "KILMEAGUE CABINET", fault: "EXTERNAL ALARM: HIGH TEMP KIMA", engineerOnSite: "19:07", leftSite: "20:15" },
  { id: 5, date: "2025-08-11", day: "Mon", ticket: "R23489300", site: "CLANE", fault: "DCPower (Power_One_PPS_2548) Battery Fuse Failure - POW60", engineerOnSite: "19:52", leftSite: "20:30" },
  { id: 6, date: "2025-08-11", day: "Mon", ticket: "R23489568", site: "BALLYTORE", fault: "RECTIFIER at BTRB -B01-A001", engineerOnSite: "20:46", leftSite: "22:00" },
];

function WeekDetailView({ week, onBack, onAdd, onEdit }) {
  const grouped = {};
  MOCK_CALLOUTS.forEach(c => {
    if (!grouped[c.date]) grouped[c.date] = { day: c.day, date: c.date, items: [] };
    grouped[c.date].items.push(c);
  });
  const days = Object.values(grouped);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 12px 12px 8px", borderBottom: "1px solid #eee", gap: 4 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "#4A72FF" }}><Icons.Back /></button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#1a1a1a" }}>{week.label}</h2>
          <div style={{ fontSize: 12, color: "#888" }}>{MOCK_CALLOUTS.length} callouts</div>
        </div>
        <button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", background: "#4A72FF", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          <Icons.Plus /> Add
        </button>
      </div>

      <div style={{ padding: "0 0 16px" }}>
        {days.map(dayGroup => (
          <div key={dayGroup.date}>
            <div style={{ padding: "12px 16px 6px", fontSize: 12, fontWeight: 600, color: "#4A72FF", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{dayGroup.day} {parseInt(dayGroup.date.split('-')[2])}. Aug</span>
              <span style={{ fontSize: 11, fontWeight: 400, color: "#aaa" }}>— {dayGroup.items.length} callout{dayGroup.items.length > 1 ? "s" : ""}</span>
            </div>
            {dayGroup.items.map(callout => (
              <div key={callout.id} onClick={() => onEdit(callout)} style={{ margin: "0 12px 6px", padding: "10px 14px", background: "white", borderRadius: 10, border: "1px solid #eee", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", padding: "2px 6px", background: "#f0f0f0", borderRadius: 4, color: "#555" }}>{callout.ticket}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{callout.site}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#888", fontSize: 12, whiteSpace: "nowrap" }}>
                    <Icons.Clock /> {callout.engineerOnSite}–{callout.leftSite}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{callout.fault}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIEW: Weeks List ──────────────────────────────────────────
const MOCK_WEEKS = [
  { id: "w1", label: "Week 10-16 Aug 2025", callouts: 16, status: "complete" },
  { id: "w2", label: "Week 27 Jul - 2 Aug 2025", callouts: 9, status: "complete" },
  { id: "w3", label: "Week 22-28 Mar 2026", callouts: 3, status: "active" },
];

function WeeksView({ onSelectWeek }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid #eee" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#1a1a1a" }}>Callouts</h2>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#4A72FF", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          <Icons.Plus /> On-Call Week
        </button>
      </div>
      <div style={{ margin: "12px 16px", padding: "12px 16px", background: "linear-gradient(135deg, #EEF2FF, #E8F0FE)", borderRadius: 12, border: "1px solid #C7D2FE", cursor: "pointer" }} onClick={() => onSelectWeek(MOCK_WEEKS[2])}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#4A72FF", textTransform: "uppercase", letterSpacing: 0.5 }}>Currently On-Call</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Week 22-28 Mar 2026</div>
        <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>3 callouts logged so far</div>
      </div>
      <div style={{ padding: "8px 16px 4px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#8a8a8a", textTransform: "uppercase", letterSpacing: 0.8 }}>Previous On-Call Weeks</div>
      </div>
      {MOCK_WEEKS.filter(w => w.status !== "active").map(week => (
        <div key={week.id} onClick={() => onSelectWeek(week)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", margin: "0 12px 8px", background: "white", borderRadius: 10, border: "1px solid #eee", cursor: "pointer" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{week.label}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><Icons.Phone /> {week.callouts} callouts</div>
          </div>
          <Icons.Chevron />
        </div>
      ))}
    </div>
  );
}

// ─── Main App Shell ────────────────────────────────────────────
export default function CalloutsMockup() {
  const [view, setView] = useState("weeks");
  const [selectedWeek, setSelectedWeek] = useState(null);

  const phoneFrame = {
    width: 375, minHeight: 720, background: "#FAFAF8", borderRadius: 20,
    overflow: "hidden", position: "relative",
    boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: "20px auto", border: "1px solid #e0e0e0",
  };

  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh", padding: "20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Callouts — Interactive Mockup</h1>
        <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Tap through all screens. Try the pickers!</p>
      </div>

      <div style={phoneFrame}>
        <div style={{ display: "flex", borderBottom: "1px solid #eee", background: "white" }}>
          {["Timesheet", "Notes", "Callouts", "Routines"].map((tab, i) => (
            <div key={tab} onClick={() => { if (i === 2) setView("weeks"); }} style={{ flex: 1, textAlign: "center", padding: "10px 0 8px", fontSize: 11, fontWeight: i === 2 ? 700 : 500, color: i === 2 ? "#4A72FF" : "#999", borderBottom: i === 2 ? "2px solid #4A72FF" : "2px solid transparent", cursor: "pointer" }}>
              {tab}
            </div>
          ))}
        </div>

        {view === "weeks" && <WeeksView onSelectWeek={(w) => { setSelectedWeek(w); setView("detail"); }} />}
        {view === "detail" && selectedWeek && (
          <WeekDetailView
            week={selectedWeek}
            onBack={() => setView("weeks")}
            onAdd={() => setView("add")}
            onEdit={() => setView("add")}
          />
        )}
        {view === "add" && (
          <AddCalloutView
            onBack={() => setView("detail")}
            onSave={() => setView("detail")}
          />
        )}
      </div>
    </div>
  );
}
