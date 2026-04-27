import { useState } from "react";

const accent = "#2D6BE4";
const ot = "#C07800";
const muted = "#8BA5BE";
const border = "#EAEFF5";
const cardBg = "#ffffff";
const pageBg = "#F1F5F9";
const textPrimary = "#1e293b";
const textSecondary = "#475569";
const textMuted = "#94a3b8";
const dash = "#C8D8E8";

const summary = [
  { code: "UWO0001A99", desc: "Other Unworked Leave; Meetings", ord: 10, ot: 1, pct: 26 },
  { code: "MCY0002A10", desc: "Maintenance DSL", ord: 8, ot: 4, pct: 21 },
  { code: "WTT0001A99", desc: "Training COps FE", ord: 8, ot: 0, pct: 21 },
  { code: "MXY0002A10", desc: "Maintenance Power RSU", ord: 6, ot: 2, pct: 15 },
  { code: "WWO0001A99", desc: "General Admin COps FE", ord: 2, ot: 0, pct: 5 },
  { code: "WVM0001A99", desc: "Van Maintenance COps FE", ord: 2, ot: 0, pct: 5 },
  { code: "MXY0006A10", desc: "Routine Power Core", ord: 2, ot: 0, pct: 5 },
  { code: "MXY0005A10", desc: "Routine Power RSU", ord: 1, ot: 0, pct: 3 },
];

const callouts = [
  { date: "23. Mar", ticket: "R24647003", location: "Carlow" },
  { date: "25. Mar", ticket: "R24653190", location: "Narraghmore" },
];

function Phone({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{
        width: 360,
        background: pageBg,
        borderRadius: 24,
        border: "1px solid #dde4f0",
        boxShadow: "0 8px 32px rgba(30,58,138,0.10)",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, Arial, sans-serif",
      }}>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ row }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 44px 44px", gap: 6, padding: "12px 16px", borderBottom: `1px solid ${border}`, background: cardBg }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, fontFamily: "monospace", color: accent, marginBottom: 2 }}>{row.code}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: textPrimary, marginBottom: 6 }}>{row.desc}</div>
        <div style={{ height: 3, background: border, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${row.pct}%`, height: "100%", background: "linear-gradient(90deg,#4f7aff,#7b5ea7)", borderRadius: 2 }} />
        </div>
        {row.ot > 0 && (
          <div style={{ height: 3, background: border, borderRadius: 2, overflow: "hidden", marginTop: 3 }}>
            <div style={{ width: `${Math.round((row.ot / 39) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#f59e0b,#f97316)", borderRadius: 2 }} />
          </div>
        )}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: textPrimary, textAlign: "right" }}>{row.ord}</div>
      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: row.ot > 0 ? ot : dash, textAlign: "right" }}>{row.ot > 0 ? row.ot : "—"}</div>
    </div>
  );
}

// ── Option A: Callouts as a separate card below ─────────────────
function OptionA() {
  return (
    <Phone label="A — Separate card below">
      <div style={{ overflowY: "auto", maxHeight: 600, padding: "12px 12px 20px" }}>

        {/* Weekly Summary card */}
        <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${border}`, overflow: "hidden", marginBottom: 8 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EBF1FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary }}>Weekly Summary</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ background: "#EBF1FD", color: accent, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>39h</div>
              <div style={{ background: "#FFF7ED", color: ot, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>+7 OT</div>
            </div>
          </div>
          {/* Col headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 44px 44px", gap: 6, padding: "6px 16px", background: "#F8FAFC", borderBottom: `1px solid ${border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Code / Description</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: "uppercase", textAlign: "right" }}>ORD</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: "uppercase", textAlign: "right" }}>OT</div>
          </div>
          {summary.map(r => <SummaryRow key={r.code} row={r} />)}
          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F8FAFC", borderTop: `1px solid ${border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>ORD</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: textPrimary }}>39</div>
              </div>
              <div style={{ width: 1, height: 30, background: border }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>OT</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: ot }}>7</div>
              </div>
            </div>
          </div>
        </div>

        {/* Callouts separator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 4px 8px" }}>
          <div style={{ flex: 1, height: 1, background: border }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Callouts</div>
          <div style={{ flex: 1, height: 1, background: border }} />
        </div>

        {/* Callouts card */}
        <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${border}`, overflow: "hidden" }}>
          {/* Col headers */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 0, background: "#F8FAFC", borderBottom: `1px solid ${border}` }}>
            {["Date", "Ticket Number", "Location"].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px" }}>{h}</div>
            ))}
          </div>
          {callouts.map((co, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", borderBottom: i < callouts.length - 1 ? `1px solid ${border}` : "none" }}>
              <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: accent, fontFamily: "monospace" }}>{co.date}</div>
              <div style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, color: textPrimary, fontFamily: "monospace", borderLeft: `1px solid ${border}` }}>{co.ticket}</div>
              <div style={{ padding: "10px 12px", fontSize: 13, color: textSecondary, borderLeft: `1px solid ${border}` }}>{co.location}</div>
            </div>
          ))}
          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#F8FAFC", borderTop: `1px solid ${border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Callouts</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: textPrimary }}>2</div>
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ── Option B: Callouts inside the same card, below the total ────
function OptionB() {
  return (
    <Phone label="B — Inside same card">
      <div style={{ overflowY: "auto", maxHeight: 600, padding: "12px 12px 20px" }}>
        <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${border}`, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EBF1FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary }}>Weekly Summary</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ background: "#EBF1FD", color: accent, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>39h</div>
              <div style={{ background: "#FFF7ED", color: ot, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>+7 OT</div>
              <div style={{ background: "#F0FDF4", color: "#16a34a", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>2 CO</div>
            </div>
          </div>
          {/* Col headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 44px 44px", gap: 6, padding: "6px 16px", background: "#F8FAFC", borderBottom: `1px solid ${border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Code / Description</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: "uppercase", textAlign: "right" }}>ORD</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: "uppercase", textAlign: "right" }}>OT</div>
          </div>
          {summary.map(r => <SummaryRow key={r.code} row={r} />)}
          {/* Hours total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F8FAFC", borderTop: `1px solid ${border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>ORD</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: textPrimary }}>39</div>
              </div>
              <div style={{ width: 1, height: 30, background: border }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>OT</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: ot }}>7</div>
              </div>
            </div>
          </div>

          {/* Callouts divider inside card */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderTop: `2px solid ${border}` }}>
            <div style={{ flex: 1, height: 1 }} />
            <div style={{ fontSize: 9, fontWeight: 800, color: muted, textTransform: "uppercase", letterSpacing: "0.12em", padding: "8px 0" }}>Callouts</div>
            <div style={{ flex: 1, height: 1 }} />
          </div>

          {/* Callouts col headers */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", background: "#F8FAFC", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
            {["Date", "Ticket Number", "Location"].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 12px" }}>{h}</div>
            ))}
          </div>
          {callouts.map((co, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", borderBottom: `1px solid ${border}`, background: cardBg }}>
              <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: accent, fontFamily: "monospace" }}>{co.date}</div>
              <div style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, color: textPrimary, fontFamily: "monospace", borderLeft: `1px solid ${border}` }}>{co.ticket}</div>
              <div style={{ padding: "10px 12px", fontSize: 13, color: textSecondary, borderLeft: `1px solid ${border}` }}>{co.location}</div>
            </div>
          ))}
          {/* Callouts total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#F8FAFC" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Callouts</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: textPrimary }}>2</div>
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#e8eef8", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px", gap: 40 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a8a", letterSpacing: "-0.01em" }}>Callouts in Weekly Summary — Options</div>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
        <OptionA />
        <OptionB />
      </div>
    </div>
  );
}
