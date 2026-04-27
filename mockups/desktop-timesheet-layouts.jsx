import { useState } from "react";

const DAYS = [
  { name: "Friday", date: "17", tasks: [
    { id: 1, desc: "GDPR Course", location: "", hours: "2h", codes: ["TRN-01"], color: "#2D6BE4" },
    { id: 2, desc: "Admin", location: "Naas (NAS)", hours: "3h", codes: ["ADM-01"], color: "#7c3aed" },
    { id: 3, desc: "Van", location: "Sallins (SLS)", hours: "2h", codes: ["VAN-01"], color: "#059669" },
  ]},
  { name: "Saturday", date: "18", tasks: [] },
  { name: "Sunday", date: "19", tasks: [] },
  { name: "Monday", date: "20", tasks: [
    { id: 4, desc: "Tetra Meeting 11:00 - 12:30", location: "Portlaoise (PGS)", hours: "1h", codes: ["MTG-01"], color: "#2D6BE4", remedy: true },
    { id: 5, desc: "Collins Lane", location: "", hours: "1h", codes: [], color: "#9ca3af" },
  ]},
  { name: "Tuesday", date: "21", tasks: [
    { id: 6, desc: "Collins Lane", location: "", hours: "1h", codes: [], color: "#9ca3af" },
  ]},
  { name: "Wednesday", date: "22", tasks: [] },
  { name: "Thursday", date: "23", tasks: [] },
];

const SUMMARY = [
  { code: "TRN-01", label: "GDPR Course", ord: 2, ot: 0 },
  { code: "ADM-01", label: "Admin", ord: 3, ot: 0 },
  { code: "VAN-01", label: "Van", ord: 2, ot: 0 },
  { code: "MTG-01", label: "Tetra Meeting", ord: 1, ot: 0 },
  { code: "—", label: "Collins Lane", ord: 2, ot: 0 },
];

const isToday = (name) => name === "Thursday";

// ─── Shared Components ───────────────────────────────────────
function Header({ layout, setLayout }) {
  return (
    <div style={{ background: "#090e1c", color: "#fff", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>‹</button>
      <div style={{ flex: 1, textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>17 Apr – 23 Apr</div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>✓ Synced v5.7.5</div>
      </div>
      <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>›</button>
      <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}>☰</button>
    </div>
  );
}

function NavTabs() {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
      {["TIMESHEET", "NOTES", "JOURNAL", "FINDER"].map((t, i) => (
        <div key={t} style={{
          flex: 1, textAlign: "center", padding: "10px 0", fontSize: 12, fontWeight: 700,
          color: i === 0 ? "#2D6BE4" : "#94a3b8",
          borderBottom: i === 0 ? "2px solid #2D6BE4" : "2px solid transparent",
          cursor: "pointer", letterSpacing: "0.5px"
        }}>{t}</div>
      ))}
    </div>
  );
}

function TaskCard({ task, compact }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: compact ? "10px 14px" : "14px 18px",
      border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", transition: "box-shadow 0.15s",
    }}>
      <div style={{ width: 6, height: compact ? 32 : 40, borderRadius: 3, background: task.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: compact ? 13 : 14, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.desc}</div>
        {task.location && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>📍 {task.location}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {task.remedy && <span style={{ background: "#7c3aed", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>Remedy</span>}
        <span style={{ fontSize: 13, fontWeight: 600, color: "#2D6BE4" }}>{task.hours}</span>
        <span style={{ color: "#cbd5e1", fontSize: 14 }}>›</span>
      </div>
    </div>
  );
}

function WeeklySummaryPanel({ vertical }) {
  const totalOrd = SUMMARY.reduce((s, r) => s + r.ord, 0);
  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
      padding: 16, ...(vertical ? {} : { marginTop: 16 })
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#1e293b" }}>Weekly Summary</div>
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div style={{ background: "#f0f7ff", borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2D6BE4" }}>{totalOrd}h</div>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>ORDINARY</div>
        </div>
        <div style={{ background: "#faf5ff", borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#7c3aed" }}>0h</div>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>OVERTIME</div>
        </div>
      </div>
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <th style={{ textAlign: "left", padding: "6px 0", color: "#94a3b8", fontWeight: 600, fontSize: 10 }}>CODE</th>
            <th style={{ textAlign: "left", padding: "6px 0", color: "#94a3b8", fontWeight: 600, fontSize: 10 }}>DESCRIPTION</th>
            <th style={{ textAlign: "right", padding: "6px 0", color: "#94a3b8", fontWeight: 600, fontSize: 10 }}>ORD</th>
            <th style={{ textAlign: "right", padding: "6px 0", color: "#94a3b8", fontWeight: 600, fontSize: 10 }}>OT</th>
          </tr>
        </thead>
        <tbody>
          {SUMMARY.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "6px 0", fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>{r.code}</td>
              <td style={{ padding: "6px 0", color: "#1e293b" }}>{r.label}</td>
              <td style={{ textAlign: "right", padding: "6px 0", fontWeight: 600, color: "#1e293b" }}>{r.ord}</td>
              <td style={{ textAlign: "right", padding: "6px 0", color: "#94a3b8" }}>{r.ot || "—"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid #e2e8f0" }}>
            <td colSpan={2} style={{ padding: "8px 0", fontWeight: 700, color: "#1e293b" }}>Total</td>
            <td style={{ textAlign: "right", padding: "8px 0", fontWeight: 700, color: "#2D6BE4" }}>{totalOrd}</td>
            <td style={{ textAlign: "right", padding: "8px 0", fontWeight: 700, color: "#94a3b8" }}>0</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Layout A: Wide cards + Summary Sidebar ──────────────────
function LayoutA() {
  const [expanded, setExpanded] = useState({ 0: true, 3: true, 4: true });
  return (
    <div style={{ display: "flex", gap: 24, padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {DAYS.map((day, di) => {
          const hasT = day.tasks.length > 0;
          const isOpen = expanded[di];
          const dayHrs = day.tasks.reduce((s, t) => s + parseInt(t.hours), 0);
          return (
            <div key={di} style={{ marginBottom: 12 }}>
              <div onClick={() => setExpanded(p => ({ ...p, [di]: !p[di] }))} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                background: isToday(day.name) ? "#f0f7ff" : "#f8fafc",
                borderRadius: 10, cursor: "pointer", border: "1px solid #e2e8f0"
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: isToday(day.name) ? "#2D6BE4" : hasT ? "#e2e8f0" : "#f1f5f9",
                  color: isToday(day.name) ? "#fff" : "#64748b", fontWeight: 700, fontSize: 14
                }}>{day.date}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{day.name}</span>
                  {hasT && <span style={{ marginLeft: 10, fontSize: 12, color: "#94a3b8" }}>{day.tasks.length} tasks · {dayHrs}h</span>}
                  {!hasT && <span style={{ marginLeft: 10, fontSize: 12, color: "#cbd5e1" }}>No entries</span>}
                </div>
                <span style={{ color: "#94a3b8", fontSize: 16, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>›</span>
              </div>
              {isOpen && hasT && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 0 0 48px" }}>
                  {day.tasks.map(t => <TaskCard key={t.id} task={t} />)}
                  <div style={{ textAlign: "center", padding: "6px 0", fontSize: 13, color: "#2D6BE4", cursor: "pointer", fontWeight: 600 }}>+ Add Task</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ width: 320, flexShrink: 0 }}>
        <div style={{ position: "sticky", top: 24 }}>
          <WeeklySummaryPanel vertical />
        </div>
      </div>
    </div>
  );
}

// ─── Layout B: Multi-column Grid ─────────────────────────────
function LayoutB() {
  const workdays = DAYS.filter((_, i) => i !== 1 && i !== 2); // skip Sat/Sun
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {workdays.map((day, i) => {
          const dayHrs = day.tasks.reduce((s, t) => s + parseInt(t.hours), 0);
          return (
            <div key={i} style={{
              background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
              overflow: "hidden", minHeight: 200
            }}>
              <div style={{
                padding: "10px 14px", borderBottom: "1px solid #e2e8f0",
                background: isToday(day.name) ? "#2D6BE4" : "#f8fafc",
                color: isToday(day.name) ? "#fff" : "#1e293b",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{day.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{day.date} Apr</div>
                </div>
                {dayHrs > 0 && <span style={{
                  fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: isToday(day.name) ? "rgba(255,255,255,0.2)" : "#f0f7ff",
                  color: isToday(day.name) ? "#fff" : "#2D6BE4"
                }}>{dayHrs}h</span>}
              </div>
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {day.tasks.map(t => (
                  <div key={t.id} style={{
                    padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0",
                    cursor: "pointer", fontSize: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 4, height: 20, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                      <div style={{ fontWeight: 600, color: "#1e293b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.desc}</div>
                      <span style={{ fontWeight: 600, color: "#2D6BE4", flexShrink: 0 }}>{t.hours}</span>
                    </div>
                    {t.location && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, paddingLeft: 10 }}>📍 {t.location}</div>}
                  </div>
                ))}
                {day.tasks.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#cbd5e1", fontSize: 12 }}>No entries</div>}
                <div style={{ textAlign: "center", padding: "4px 0", fontSize: 11, color: "#2D6BE4", cursor: "pointer", fontWeight: 600 }}>+ Add</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, cursor: "pointer" }}>› Weekend (no entries)</div>
      <WeeklySummaryPanel />
    </div>
  );
}

// ─── Layout C: Table / Spreadsheet ───────────────────────────
function LayoutC() {
  const allDays = DAYS.filter((_, i) => i !== 1 && i !== 2);
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, color: "#64748b", fontSize: 11, width: 90 }}>DAY</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, color: "#64748b", fontSize: 11 }}>DESCRIPTION</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, color: "#64748b", fontSize: 11, width: 160 }}>LOCATION</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, color: "#64748b", fontSize: 11, width: 100 }}>CODES</th>
              <th style={{ textAlign: "right", padding: "10px 16px", fontWeight: 700, color: "#64748b", fontSize: 11, width: 60 }}>ORD</th>
              <th style={{ textAlign: "right", padding: "10px 16px", fontWeight: 700, color: "#64748b", fontSize: 11, width: 60 }}>OT</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {allDays.map((day, di) => (
              day.tasks.length > 0 ? day.tasks.map((t, ti) => (
                <tr key={`${di}-${ti}`} style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: isToday(day.name) ? "#f0f7ff" : "#fff",
                  cursor: "pointer",
                }}>
                  {ti === 0 && <td rowSpan={day.tasks.length} style={{
                    padding: "10px 16px", fontWeight: 700, color: "#1e293b",
                    verticalAlign: "top", borderRight: "1px solid #f1f5f9",
                    background: isToday(day.name) ? "#e0ecff" : "#f8fafc"
                  }}>
                    <div>{day.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>{day.date} Apr</div>
                  </td>}
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 18, borderRadius: 2, background: t.color }} />
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>{t.desc}</span>
                      {t.remedy && <span style={{ background: "#7c3aed", color: "#fff", fontSize: 9, padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>Remedy</span>}
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#64748b" }}>{t.location || "—"}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>{t.codes.join(", ") || "—"}</td>
                  <td style={{ textAlign: "right", padding: "10px 16px", fontWeight: 600, color: "#1e293b" }}>{parseInt(t.hours)}</td>
                  <td style={{ textAlign: "right", padding: "10px 16px", color: "#94a3b8" }}>0</td>
                  <td style={{ textAlign: "center", padding: "10px 8px", color: "#cbd5e1", cursor: "pointer" }}>⋯</td>
                </tr>
              )) : (
                <tr key={di} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: "#1e293b", borderRight: "1px solid #f1f5f9", background: "#f8fafc" }}>
                    <div>{day.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>{day.date} Apr</div>
                  </td>
                  <td colSpan={5} style={{ padding: "10px 16px", color: "#cbd5e1", fontSize: 12 }}>No entries</td>
                  <td></td>
                </tr>
              )
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
              <td style={{ padding: "10px 16px", fontWeight: 700 }}>Total</td>
              <td colSpan={3}></td>
              <td style={{ textAlign: "right", padding: "10px 16px", fontWeight: 700, color: "#2D6BE4", fontSize: 15 }}>10</td>
              <td style={{ textAlign: "right", padding: "10px 16px", fontWeight: 700, color: "#94a3b8" }}>0</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 12, cursor: "pointer" }}>› Weekend (no entries)</div>
      <WeeklySummaryPanel />
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────
export default function DesktopTimesheetMockup() {
  const [layout, setLayout] = useState("A");
  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Header />
      <NavTabs />
      <div style={{
        display: "flex", justifyContent: "center", gap: 8, padding: "16px 24px 0",
        background: "#f1f5f9"
      }}>
        {[
          { key: "A", label: "Wide Cards + Sidebar" },
          { key: "B", label: "Multi-Column Grid" },
          { key: "C", label: "Table / Spreadsheet" },
        ].map(opt => (
          <button key={opt.key} onClick={() => setLayout(opt.key)} style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: "1px solid " + (layout === opt.key ? "#2D6BE4" : "#e2e8f0"),
            background: layout === opt.key ? "#2D6BE4" : "#fff",
            color: layout === opt.key ? "#fff" : "#64748b",
            cursor: "pointer"
          }}>{opt.label}</button>
        ))}
      </div>
      {layout === "A" && <LayoutA />}
      {layout === "B" && <LayoutB />}
      {layout === "C" && <LayoutC />}
    </div>
  );
}