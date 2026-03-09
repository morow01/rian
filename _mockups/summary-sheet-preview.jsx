import { useState } from "react";

const DARK = "#1A2B3C";
const ACCENT = "#F5A623";
const CODE_COLOR = "#6B8CAE";
const TEXT_MUTED = "#8A97AB";
const PAGE_BG = "#F0F3F8";

const summary = [
  { code: "MXY0002A10", label: "Maintenance Power RSU", ord: 8, ot: 0 },
  { code: "MXY0005A10", label: "Routine Power RSU", ord: 8, ot: 0 },
  { code: "MCY0002A10", label: "Maintenance DSL", ord: 4, ot: 0 },
  { code: "CYP6011U24", label: "Field – NGN Access Orders (P/M)", ord: 0, ot: 8 },
  { code: "RLB0003A10", label: "COW-Escort; ESAT", ord: 8, ot: 1 },
  { code: "ICD0004H14", label: "Cease/Cancel – NGN Customer Circuits", ord: 3, ot: 0 },
  { code: "UWO0001A99", label: "Other Unworked Leave; Meetings", ord: 8, ot: 1 },
  { code: "MCY0003A10", label: "Routine DSL", ord: 4, ot: 0 },
  { code: "MLE0004A10", label: "Routine AXE RSU", ord: 8, ot: 0 },
  { code: "MNG7002A10", label: "Maintenance NGN Core", ord: 8, ot: 0 },
  { code: "WWO0001A99", label: "General Admin COps FE", ord: 0, ot: 0 },
  { code: "WVM0001A99", label: "Van Maintenance COps FE", ord: 0, ot: 0 },
];

const activeSummary = summary.filter(r => r.ord + r.ot > 0);
const totalOrd = activeSummary.reduce((s, r) => s + r.ord, 0);
const totalOT  = activeSummary.reduce((s, r) => s + r.ot, 0);

const days = [
  { name: "Friday",    date: "27 Feb", tasks: 4, ord: 7,  ot: 1 },
  { name: "Saturday",  date: "28 Feb", tasks: 0, ord: 0,  ot: 0 },
  { name: "Sunday",    date: "1 Mar",  tasks: 1, ord: 0,  ot: 8 },
  { name: "Monday",    date: "2 Mar",  tasks: 2, ord: 8,  ot: 0 },
  { name: "Tuesday",   date: "3 Mar",  tasks: 2, ord: 8,  ot: 0 },
  { name: "Wednesday", date: "4 Mar",  tasks: 2, ord: 8,  ot: 1 },
  { name: "Thursday",  date: "5 Mar",  tasks: 1, ord: 8,  ot: 1 },
];

export default function Preview() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#CBD5E1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      padding: "32px 16px",
    }}>
      {/* Phone shell */}
      <div style={{
        width: 390,
        height: 750,
        background: PAGE_BG,
        borderRadius: 40,
        boxShadow: "0 40px 80px rgba(0,0,0,0.35), 0 0 0 8px #1a2030",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* ── Header ── */}
        <div style={{ background: DARK, padding: "18px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>‹</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>27 Feb – 5 Mar</div>
              <div style={{ fontSize: 11, color: "#6FCF97", display: "flex", alignItems: "center", gap: 4, justifyContent: "center", marginTop: 2 }}>
                <span>✓</span> Synced · v3.6.35
              </div>
            </div>
            <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>›</button>
          </div>
          {/* Nav tabs */}
          <div style={{ display: "flex", marginTop: 6 }}>
            {["Timesheet", "Notes", "Finder"].map((t, i) => (
              <div key={t} style={{
                flex: 1, textAlign: "center", padding: "8px 0 10px",
                fontSize: 12, fontWeight: i === 0 ? 700 : 500,
                color: i === 0 ? ACCENT : "rgba(255,255,255,0.4)",
                borderBottom: i === 0 ? `2px solid ${ACCENT}` : "2px solid transparent",
                cursor: "pointer",
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* ── Day list (scrollable area) ── */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 120 }}>
          {days.map((day) => (
            <div key={day.name} style={{
              display: "flex", alignItems: "center",
              padding: "14px 18px",
              background: day.tasks === 0 ? "#F5F7FC" : "#fff",
              borderBottom: "1px solid #ECEEF5",
              gap: 10,
            }}>
              <span style={{ color: day.tasks === 0 ? "#CBD5E1" : "#4A6CF7", fontSize: 11, width: 12 }}>▶</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: day.tasks === 0 ? TEXT_MUTED : DARK, minWidth: 88 }}>{day.name}</span>
              <span style={{ fontSize: 12, color: TEXT_MUTED, flex: 1 }}>{day.date}</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {day.tasks > 0 && (
                  <span style={{ background: "#ECEEF5", color: "#5A6480", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                    {day.tasks} {day.tasks === 1 ? "task" : "tasks"}
                  </span>
                )}
                {day.ord > 0 && <span style={{ background: "#ECEEF5", color: "#5A6480", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{day.ord}h</span>}
                {day.ot > 0 && <span style={{ background: "#FFF3DC", color: ACCENT, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>+{day.ot} OT</span>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Stats bar (always visible above nav) ── */}
        <div style={{
          position: "absolute",
          bottom: 56,
          left: 0, right: 0,
          padding: "0 14px 8px",
          pointerEvents: "none",
          zIndex: 90,
        }}>
          <div
            onClick={() => setOpen(true)}
            style={{
              pointerEvents: "all",
              cursor: "pointer",
              background: DARK,
              borderRadius: 14,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 -2px 20px rgba(26,34,51,0.22), 0 4px 16px rgba(26,34,51,0.22)",
            }}
          >
            {/* ORD */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 38 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{totalOrd}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginTop: 2, letterSpacing: 0.5 }}>ORD</span>
            </div>
            <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.1)" }} />
            {/* OT */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 38 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>+{totalOT}</span>
              <span style={{ fontSize: 9, color: "rgba(245,166,35,0.45)", marginTop: 2, letterSpacing: 0.5 }}>OT</span>
            </div>
            <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.1)" }} />
            {/* Code pills */}
            <div style={{
              flex: 1, display: "flex", gap: 5, overflow: "hidden",
              WebkitMaskImage: "linear-gradient(to right, black 60%, transparent 100%)",
            }}>
              {activeSummary.map((row) => (
                <div key={row.code} style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 7, padding: "3px 7px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.72)", whiteSpace: "nowrap" }}>
                    {row.ord > 0 ? `${row.ord}h` : ""}{row.ot > 0 ? ` +${row.ot}OT` : ""}
                  </span>
                  <span style={{ fontSize: 8, color: "rgba(163,185,255,0.55)", whiteSpace: "nowrap" }}>{row.code}</span>
                </div>
              ))}
            </div>
            {/* ↑ hint */}
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.35)", fontSize: 13,
            }}>↑</div>
          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 56,
          background: DARK, display: "flex",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          zIndex: 100,
        }}>
          {["Timesheet", "Notes", "Finder"].map((t, i) => (
            <div key={t} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              fontSize: 11, fontWeight: 500, cursor: "pointer",
              color: i === 0 ? ACCENT : "rgba(255,255,255,0.38)",
            }}>
              {i === 0 && <div style={{ position: "absolute", top: 0, height: 2, width: 36, background: ACCENT, borderRadius: "0 0 2px 2px" }} />}
              <span style={{ fontSize: 17 }}>{["💼","📝","🔍"][i]}</span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* ── Backdrop ── */}
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "absolute", inset: 0, zIndex: 200,
            background: "rgba(10,16,28,0.5)",
            backdropFilter: "blur(2px)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "all" : "none",
            transition: "opacity 0.28s ease",
          }}
        />

        {/* ── Bottom sheet ── */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          zIndex: 210,
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 40px rgba(26,34,51,0.2)",
          maxHeight: "78%",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        }}>

          {/* Handle + heading */}
          <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E4E7F0", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <span style={{ flex: 1, fontWeight: 800, fontSize: 17, color: DARK }}>Weekly Summary</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED }}>27 Feb – 5 Mar</span>
            </div>

            {/* Big ORD / OT boxes */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, background: "#F0F4FF", borderRadius: 12, padding: "12px 0", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: DARK }}>{totalOrd}</div>
                <div style={{ fontSize: 10, color: TEXT_MUTED, fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>ORDINARY HRS</div>
              </div>
              <div style={{ flex: 1, background: "#FFF8EC", borderRadius: 12, padding: "12px 0", textAlign: "center", border: "1px solid rgba(245,166,35,0.2)" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: ACCENT }}>+{totalOT}</div>
                <div style={{ fontSize: 10, color: "rgba(245,166,35,0.7)", fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>OVERTIME HRS</div>
              </div>
            </div>

            {/* Column headers */}
            <div style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #F0F2F7" }}>
              <div style={{ flex: 1, fontSize: 9, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1.2 }}>WORK CODE / DESCRIPTION</div>
              <div style={{ width: 40, textAlign: "right", fontSize: 9, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1.2 }}>ORD</div>
              <div style={{ width: 38, textAlign: "right", fontSize: 9, fontWeight: 700, color: ACCENT, letterSpacing: 1.2 }}>OT</div>
            </div>
          </div>

          {/* Scrollable rows */}
          <div style={{ overflowY: "auto", padding: "0 20px 32px", flex: 1 }}>
            {activeSummary.map((row, i) => (
              <div key={row.code} style={{
                display: "flex", padding: "10px 0",
                borderBottom: i < activeSummary.length - 1 ? "1px solid #F4F5FA" : "none",
                alignItems: "center",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: CODE_COLOR, fontWeight: 700, letterSpacing: 0.3, fontFamily: "monospace" }}>{row.code}</div>
                  <div style={{ fontSize: 13, color: DARK, fontWeight: 500, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.label}</div>
                </div>
                <div style={{ width: 40, textAlign: "right", fontWeight: 700, color: DARK, fontSize: 14 }}>
                  {row.ord > 0 ? row.ord : <span style={{ color: "#D0D5E8" }}>—</span>}
                </div>
                <div style={{ width: 38, textAlign: "right", fontWeight: 700, color: ACCENT, fontSize: 14 }}>
                  {row.ot > 0 ? `+${row.ot}` : <span style={{ color: "#D0D5E8" }}>—</span>}
                </div>
              </div>
            ))}

            {/* Total row */}
            <div style={{
              display: "flex", padding: "12px 0 0",
              borderTop: "2px solid #E8EBF5", marginTop: 4,
            }}>
              <div style={{ flex: 1, fontWeight: 800, color: TEXT_MUTED, fontSize: 10, letterSpacing: 1.2 }}>TOTAL</div>
              <div style={{ width: 40, textAlign: "right", fontWeight: 900, color: DARK, fontSize: 17 }}>{totalOrd}</div>
              <div style={{ width: 38, textAlign: "right", fontWeight: 900, color: ACCENT, fontSize: 17 }}>+{totalOT}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Label */}
      <div style={{ position: "fixed", bottom: 20, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
        Tap the dark stats bar to open the summary sheet · Tap backdrop to close
      </div>
    </div>
  );
}
