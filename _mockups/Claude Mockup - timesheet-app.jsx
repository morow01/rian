import { useState } from "react";

const initialData = {
  weekLabel: "27 Feb – 5 Mar",
  days: [
    {
      id: "fri",
      name: "Friday",
      date: "27 Feb",
      tasks: [
        {
          id: 1,
          description: "Routines",
          location: "Daingean (DGN)",
          workCodes: [
            { code: "MXY0002A10", label: "Maintenance Power RSU" },
            { code: "MXY0005A10", label: "Routine Power RSU" },
            { code: "MCY0002A10", label: "Maintenance DSL" },
          ],
          ordHrs: 4,
          otHrs: 1,
        },
        {
          id: 2,
          description: "Cease/Cancel NGN",
          location: "Portarlington (PAN)",
          workCodes: [{ code: "ICD0004H14", label: "Cease/Cancel – NGN Customer Circuits" }],
          ordHrs: 3,
          otHrs: 0,
        },
        {
          id: 3,
          description: "Admin",
          location: "Office",
          workCodes: [{ code: "WWO0001A99", label: "General Admin COps FE" }],
          ordHrs: 0,
          otHrs: 0,
        },
        {
          id: 4,
          description: "Van Maintenance",
          location: "Depot",
          workCodes: [{ code: "WVM0001A99", label: "Van Maintenance COps FE" }],
          ordHrs: 0,
          otHrs: 0,
        },
      ],
    },
    { id: "sat", name: "Saturday", date: "28 Feb", tasks: [] },
    {
      id: "sun",
      name: "Sunday",
      date: "1 Mar",
      tasks: [
        {
          id: 5,
          description: "Field NGN",
          location: "Multiple",
          workCodes: [{ code: "CYP6011U24", label: "Field – NGN Access Orders (P/M)" }],
          ordHrs: 0,
          otHrs: 8,
        },
      ],
    },
    {
      id: "mon",
      name: "Monday",
      date: "2 Mar",
      tasks: [
        {
          id: 6,
          description: "Routines",
          location: "Daingean (DGN)",
          workCodes: [
            { code: "MXY0002A10", label: "Maintenance Power RSU" },
            { code: "MXY0005A10", label: "Routine Power RSU" },
            { code: "MCY0002A10", label: "Maintenance DSL" },
          ],
          ordHrs: 4,
          otHrs: 0,
        },
        {
          id: 7,
          description: "Routines",
          location: "Portarlington (PAN)",
          workCodes: [
            { code: "MXY0005A10", label: "Routine Power RSU" },
            { code: "MCY0003A10", label: "Routine DSL" },
          ],
          ordHrs: 4,
          otHrs: 0,
        },
      ],
    },
    {
      id: "tue",
      name: "Tuesday",
      date: "3 Mar",
      tasks: [
        {
          id: 8,
          description: "Routines",
          location: "Edenderry (EDY)",
          workCodes: [
            { code: "MLE0004A10", label: "Routine AXE RSU" },
            { code: "MNG7002A10", label: "Maintenance NGN Core" },
          ],
          ordHrs: 4,
          otHrs: 0,
        },
        {
          id: 9,
          description: "Meetings",
          location: "Office",
          workCodes: [{ code: "UWO0001A99", label: "Other Unworked Leave; Meetings" }],
          ordHrs: 4,
          otHrs: 0,
        },
      ],
    },
    {
      id: "wed",
      name: "Wednesday",
      date: "4 Mar",
      tasks: [
        {
          id: 10,
          description: "Routines",
          location: "Multiple",
          workCodes: [
            { code: "MNG7002A10", label: "Maintenance NGN Core" },
            { code: "MLE0004A10", label: "Routine AXE RSU" },
          ],
          ordHrs: 4,
          otHrs: 0,
        },
        {
          id: 11,
          description: "Meetings / Leave",
          location: "Office",
          workCodes: [{ code: "UWO0001A99", label: "Other Unworked Leave; Meetings" }],
          ordHrs: 4,
          otHrs: 1,
        },
      ],
    },
    {
      id: "thu",
      name: "Thursday",
      date: "5 Mar",
      tasks: [
        {
          id: 12,
          description: "COW-Escort ESAT",
          location: "Multiple",
          workCodes: [{ code: "RLB0003A10", label: "COW-Escort; ESAT" }],
          ordHrs: 8,
          otHrs: 1,
        },
      ],
    },
  ],
};

function getDayTotals(day) {
  const ord = day.tasks.reduce((s, t) => s + t.ordHrs, 0);
  const ot = day.tasks.reduce((s, t) => s + t.otHrs, 0);
  return { ord, ot };
}

function getWeeklySummary(days) {
  const map = {};
  days.forEach((day) => {
    day.tasks.forEach((task) => {
      task.workCodes.forEach((wc) => {
        if (!map[wc.code]) map[wc.code] = { code: wc.code, label: wc.label, ord: 0, ot: 0 };
        map[wc.code].ord += task.ordHrs / task.workCodes.length;
        map[wc.code].ot += task.otHrs / task.workCodes.length;
      });
    });
  });
  return Object.values(map).sort((a, b) => b.ord + b.ot - (a.ord + a.ot));
}

const ACCENT = "#F5A623";
const DARK = "#1A2233";
const CARD_BG = "#FFFFFF";
const PAGE_BG = "#F0F2F7";
const TEXT_MUTED = "#8A93A8";
const OT_COLOR = "#F5A623";
const CODE_COLOR = "#7B8FD4";

export default function TimesheetApp() {
  const [data] = useState(initialData);
  const [expandedDays, setExpandedDays] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("timesheet");

  const toggleDay = (id) => setExpandedDays((p) => ({ ...p, [id]: !p[id] }));
  const toggleTask = (id) => setExpandedTasks((p) => ({ ...p, [id]: !p[id] }));

  const totalOrd = data.days.reduce((s, d) => s + getDayTotals(d).ord, 0);
  const totalOT = data.days.reduce((s, d) => s + getDayTotals(d).ot, 0);
  const summary = getWeeklySummary(data.days);

  return (
    <div style={{
      minHeight: "100vh",
      background: PAGE_BG,
      fontFamily: "'DM Sans', 'Nunito', sans-serif",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pill { border-radius: 20px; padding: 3px 10px; font-size: 13px; font-weight: 600; }
        .pill-blue { background: #E8EEFF; color: #4A6CF7; }
        .pill-gray { background: #E8EBF3; color: #5A6480; }
        .pill-ot { background: #FFF3DC; color: #F5A623; }
        .pill-ord { background: #E8EBF3; color: #5A6480; }
        .chevron { transition: transform 0.2s; display: inline-block; }
        .chevron.open { transform: rotate(90deg); }
        .day-row { cursor: pointer; user-select: none; }
        .day-row:hover { background: rgba(74,108,247,0.04); }
        .task-card { border-radius: 14px; background: white; overflow: hidden; margin-bottom: 10px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .wc-chip { display: inline-flex; align-items: center; gap: 6px; background: #F4F5FA; border-radius: 8px; padding: 5px 10px; font-size: 12px; margin: 4px 4px 4px 0; border: 1px solid #E4E7F0; }
        .hr-ctrl { display: flex; align-items: center; gap: 12px; }
        .hr-btn { width: 28px; height: 28px; border-radius: 8px; border: 1.5px solid #E4E7F0; background: white; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; color: #5A6480; font-weight: 300; }
        .hr-btn:hover { background: #F4F5FA; }
        .hr-val { font-size: 20px; font-weight: 700; color: #1A2233; min-width: 24px; text-align: center; }
        .hr-val-ot { color: #F5A623; }
        .ot-box { border: 1.5px solid #F5A623; border-radius: 10px; padding: 8px 14px; }
        .delete-btn { width: 100%; padding: 14px; background: #FFF5F5; color: #E05353; font-size: 15px; font-weight: 600; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .delete-btn:hover { background: #FFE8E8; }
        .add-task-btn { width: 100%; padding: 14px; background: transparent; color: #4A6CF7; font-size: 15px; font-weight: 600; border: 2px dashed #C5CEEE; border-radius: 12px; cursor: pointer; }
        .add-task-btn:hover { background: #F0F3FF; }
        .summary-row { display: flex; padding: 11px 0; border-bottom: 1px solid #F0F2F7; align-items: center; }
        .tab-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 0; background: none; border: none; cursor: pointer; color: ${TEXT_MUTED}; font-family: inherit; font-size: 12px; font-weight: 500; }
        .tab-btn.active { color: ${ACCENT}; }
        .tab-icon { font-size: 20px; }
      `}</style>

      {/* Header */}
      <div style={{ background: DARK, padding: "16px 20px 0", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer" }}>‹</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{data.weekLabel}</div>
            <div style={{ fontSize: 12, color: "#6FCF97", display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
              <span>✓</span> Synced v3.6.19
            </div>
          </div>
          <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer" }}>›</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 8 }}>
          {[
            { id: "timesheet", label: "Timesheet", icon: "💼" },
            { id: "notes", label: "Notes", icon: "📝" },
            { id: "finder", label: "Finder", icon: "🔍" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ color: activeTab === tab.id ? ACCENT : "rgba(255,255,255,0.5)" }}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div style={{ height: 2, width: "60%", background: ACCENT, borderRadius: 2 }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Days */}
      <div style={{ padding: "8px 0 140px" }}>
        {data.days.map((day) => {
          const { ord, ot } = getDayTotals(day);
          const isExpanded = expandedDays[day.id];
          const isEmpty = day.tasks.length === 0;
          return (
            <div key={day.id}>
              {/* Day header row */}
              <div
                className="day-row"
                onClick={() => !isEmpty && toggleDay(day.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 20px",
                  background: isEmpty ? "#F5F7FC" : CARD_BG,
                  borderBottom: "1px solid #ECEEF5",
                  gap: 10,
                }}
              >
                <span
                  className={`chevron ${isExpanded ? "open" : ""}`}
                  style={{ color: isEmpty ? "#C5CEEE" : "#4A6CF7", fontSize: 12, width: 14 }}
                >
                  {isEmpty ? "▶" : "▶"}
                </span>
                <span style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isEmpty ? TEXT_MUTED : DARK,
                  minWidth: 90,
                }}>
                  {day.name}
                </span>
                <span style={{ fontSize: 13, color: TEXT_MUTED, flex: 1 }}>{day.date}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {day.tasks.length > 0 && (
                    <span className="pill pill-gray">{day.tasks.length} {day.tasks.length === 1 ? "task" : "tasks"}</span>
                  )}
                  {ord > 0 && <span className="pill pill-ord">{ord}h</span>}
                  {ot > 0 && <span className="pill pill-ot">+{ot} OT</span>}
                </div>
              </div>

              {/* Tasks */}
              {isExpanded && (
                <div style={{ padding: "10px 16px", background: "#F7F9FE" }}>
                  {day.tasks.map((task, ti) => {
                    const isTaskOpen = expandedTasks[task.id];
                    return (
                      <div key={task.id} className="task-card">
                        {/* Task header */}
                        <div
                          onClick={() => toggleTask(task.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "12px 14px",
                            cursor: "pointer",
                            gap: 10,
                          }}
                        >
                          <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: "#F0F3FF", color: "#4A6CF7",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 13, flexShrink: 0,
                          }}>
                            {ti + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: DARK }}>{task.description}</div>
                            <div style={{ fontSize: 12, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 3 }}>
                              <span>📍</span>{task.location}
                            </div>
                          </div>
                          <span className="pill pill-blue">{task.ordHrs}h</span>
                          <span style={{ color: TEXT_MUTED, fontSize: 18 }}>{isTaskOpen ? "∧" : "∨"}</span>
                        </div>

                        {/* Task detail */}
                        {isTaskOpen && (
                          <div style={{ padding: "0 14px 14px", borderTop: "1px solid #F0F2F7" }}>
                            <div style={{ paddingTop: 12 }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1 }}>DESCRIPTION</label>
                              <div style={{ marginTop: 6, padding: "10px 12px", border: "1.5px solid #E4E7F0", borderRadius: 10, fontSize: 15, color: DARK }}>
                                {task.description}
                              </div>
                            </div>
                            <div style={{ paddingTop: 12 }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1 }}>LOCATION</label>
                              <div style={{ marginTop: 6, padding: "10px 12px", border: "1.5px solid #E4E7F0", borderRadius: 10, fontSize: 15, color: DARK }}>
                                {task.location}
                              </div>
                            </div>
                            <div style={{ paddingTop: 12 }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1 }}>WORK CODES</label>
                              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap" }}>
                                {task.workCodes.map((wc) => (
                                  <div key={wc.code} className="wc-chip">
                                    <span style={{ fontWeight: 600, color: CODE_COLOR, fontSize: 11 }}>{wc.code}</span>
                                    <span style={{ color: DARK, fontSize: 12 }}>{wc.label}</span>
                                    <span style={{ color: TEXT_MUTED, cursor: "pointer" }}>×</span>
                                  </div>
                                ))}
                                <div className="wc-chip" style={{ cursor: "pointer", color: "#4A6CF7", border: "1.5px dashed #C5CEEE" }}>
                                  + Code
                                </div>
                              </div>
                            </div>
                            <div style={{ paddingTop: 14, display: "flex", gap: 12 }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1 }}>ORDINARY HRS</label>
                                <div className="hr-ctrl" style={{ marginTop: 8 }}>
                                  <button className="hr-btn">−</button>
                                  <span className="hr-val">{task.ordHrs}</span>
                                  <button className="hr-btn">+</button>
                                </div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: OT_COLOR, letterSpacing: 1 }}>OVERTIME HRS</label>
                                <div className="hr-ctrl ot-box" style={{ marginTop: 8 }}>
                                  <button className="hr-btn">−</button>
                                  <span className={`hr-val ${task.otHrs > 0 ? "hr-val-ot" : ""}`}>{task.otHrs}</span>
                                  <button className="hr-btn">+</button>
                                </div>
                              </div>
                            </div>
                            <div style={{ marginTop: 10, fontSize: 12, color: TEXT_MUTED, display: "flex", gap: 12 }}>
                              <span>Tasks: <b style={{ color: DARK }}>{day.tasks.length}</b></span>
                              <span>Hrs/Task: <b style={{ color: DARK }}>1</b></span>
                              <span>OT/Task: <b style={{ color: OT_COLOR }}>{task.otHrs > 0 ? task.otHrs : "—"}</b></span>
                            </div>
                            <div style={{ marginTop: 12, padding: "10px 12px", border: "1.5px solid #E4E7F0", borderRadius: 10, color: TEXT_MUTED, fontSize: 14 }}>
                              📝 Add a note...
                            </div>
                            <button className="delete-btn" style={{ marginTop: 12, borderRadius: 10 }}>
                              🗑 Delete task
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button className="add-task-btn">+ Add Task</button>
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* ── Stats bar (always visible above bottom nav) ── */}
      <div style={{
        position: "fixed",
        bottom: 56,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        zIndex: 90,
        padding: "0 16px 8px",
        pointerEvents: "none",
      }}>
        <div
          onClick={() => setSummaryOpen(true)}
          style={{
            pointerEvents: "all",
            cursor: "pointer",
            background: DARK,
            borderRadius: 14,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 -2px 20px rgba(26,34,51,0.18), 0 4px 16px rgba(26,34,51,0.2)",
          }}
        >
          {/* Total hours */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{totalOrd}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>ORD</span>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: OT_COLOR, lineHeight: 1 }}>+{totalOT}</span>
            <span style={{ fontSize: 10, color: "rgba(245,166,35,0.5)", marginTop: 2 }}>OT</span>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />

          {/* Code pills scroll */}
          <div style={{
            flex: 1,
            display: "flex",
            gap: 6,
            overflow: "hidden",
            maskImage: "linear-gradient(to right, black 70%, transparent 100%)",
          }}>
            {summary.filter(r => Math.round(r.ord) + Math.round(r.ot) > 0).map((row) => (
              <div key={row.code} style={{
                flexShrink: 0,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "3px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>
                  {Math.round(row.ord) > 0 ? `${Math.round(row.ord)}h` : ""}{Math.round(row.ot) > 0 ? ` +${Math.round(row.ot)}OT` : ""}
                </span>
                <span style={{ fontSize: 9, color: "rgba(163,185,255,0.6)", whiteSpace: "nowrap" }}>{row.code}</span>
              </div>
            ))}
          </div>

          {/* Up arrow hint */}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.4)", fontSize: 14,
          }}>↑</div>
        </div>
      </div>

      {/* ── Bottom sheet overlay ── */}
      {summaryOpen && (
        <div
          onClick={() => setSummaryOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(10,16,28,0.5)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Bottom sheet ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: `translateX(-50%) translateY(${summaryOpen ? "0" : "100%"})`,
        transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        width: "100%",
        maxWidth: 480,
        zIndex: 210,
        background: "#fff",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 40px rgba(26,34,51,0.18)",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Sheet handle + header */}
        <div style={{ padding: "12px 20px 0", textAlign: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E4E7F0", margin: "0 auto 16px" }} />
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <span style={{ flex: 1, fontWeight: 800, fontSize: 18, color: DARK, textAlign: "left" }}>Weekly Summary</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED }}>{data.weekLabel}</span>
          </div>
          {/* Big totals */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{
              flex: 1, background: "#F0F3FF", borderRadius: 12,
              padding: "12px 0", textAlign: "center",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: DARK }}>{totalOrd}</div>
              <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600, letterSpacing: 0.5 }}>ORDINARY HRS</div>
            </div>
            <div style={{
              flex: 1, background: "#FFF8EC", borderRadius: 12,
              padding: "12px 0", textAlign: "center",
              border: `1px solid rgba(245,166,35,0.2)`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: OT_COLOR }}>+{totalOT}</div>
              <div style={{ fontSize: 11, color: "rgba(245,166,35,0.7)", fontWeight: 600, letterSpacing: 0.5 }}>OVERTIME HRS</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", padding: "0 20px 32px", flex: 1 }}>
          {/* Column headers */}
          <div style={{ display: "flex", padding: "8px 0 6px", borderBottom: "1px solid #F0F2F7", marginBottom: 2 }}>
            <div style={{ flex: 1, fontSize: 10, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1.2 }}>DESCRIPTION</div>
            <div style={{ width: 44, textAlign: "right", fontSize: 10, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1.2 }}>ORD</div>
            <div style={{ width: 40, textAlign: "right", fontSize: 10, fontWeight: 700, color: OT_COLOR, letterSpacing: 1.2 }}>OT</div>
          </div>

          {summary.map((row, i) => (
            <div key={row.code} style={{
              display: "flex",
              padding: "11px 0",
              borderBottom: i < summary.length - 1 ? "1px solid #F4F5FA" : "none",
              alignItems: "center",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: CODE_COLOR, fontWeight: 700, letterSpacing: 0.3 }}>{row.code}</div>
                <div style={{ fontSize: 14, color: DARK, fontWeight: 500, marginTop: 1 }}>{row.label}</div>
              </div>
              <div style={{ width: 44, textAlign: "right", fontWeight: 700, color: DARK, fontSize: 15 }}>
                {Math.round(row.ord) || <span style={{ color: "#D0D5E8" }}>—</span>}
              </div>
              <div style={{ width: 40, textAlign: "right", fontWeight: 700, color: OT_COLOR, fontSize: 15 }}>
                {Math.round(row.ot) || <span style={{ color: "#D0D5E8" }}>—</span>}
              </div>
            </div>
          ))}

          {/* Total row */}
          <div style={{
            display: "flex", padding: "14px 0 0",
            borderTop: "2px solid #E8EBF5", marginTop: 4,
          }}>
            <div style={{ flex: 1, fontWeight: 800, color: TEXT_MUTED, fontSize: 11, letterSpacing: 1.2 }}>TOTAL</div>
            <div style={{ width: 44, textAlign: "right", fontWeight: 900, color: DARK, fontSize: 18 }}>{totalOrd}</div>
            <div style={{ width: 40, textAlign: "right", fontWeight: 900, color: OT_COLOR, fontSize: 18 }}>{totalOT}</div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: DARK,
        display: "flex",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        zIndex: 100,
      }}>
        {[
          { id: "timesheet", label: "Timesheet", icon: "💼" },
          { id: "notes", label: "Notes", icon: "📝" },
          { id: "finder", label: "Finder", icon: "🔍" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ color: activeTab === tab.id ? ACCENT : "rgba(255,255,255,0.4)", fontFamily: "inherit" }}
          >
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{ fontSize: 11 }}>{tab.label}</span>
            {activeTab === tab.id && (
              <div style={{ position: "absolute", top: 0, height: 2, width: 40, background: ACCENT, borderRadius: "0 0 2px 2px" }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
