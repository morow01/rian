import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ts-root {
    font-family: 'Syne', sans-serif;
    background: #E8E8E4;
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px 16px;
  }

  .ts-shell {
    width: 380px;
    display: flex;
    flex-direction: column;
    gap: 0;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05);
    border: 1px solid #DDDDD8;
  }

  /* ── Top nav ── */
  .ts-nav {
    background: #FFFFFF;
    padding: 18px 20px 0;
    border-bottom: 1px solid #EBEBEA;
  }

  .ts-nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .ts-nav-arrow {
    background: none;
    border: none;
    color: #BBBBB8;
    cursor: pointer;
    font-size: 16px;
    padding: 4px 8px;
    border-radius: 6px;
    transition: color 0.15s;
  }
  .ts-nav-arrow:hover { color: #1A1A1A; }

  .ts-nav-title { text-align: center; }
  .ts-nav-title h2 { font-size: 16px; font-weight: 700; color: #1A1A1A; letter-spacing: -0.02em; }
  .ts-nav-synced {
    font-size: 11px;
    color: #22A35A;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 2px;
    font-family: 'DM Mono', monospace;
    font-weight: 400;
  }

  .ts-nav-tabs {
    display: flex;
    border-top: 1px solid #F0F0EE;
    margin-top: 4px;
  }

  .ts-tab {
    flex: 1;
    background: none;
    border: none;
    cursor: pointer;
    padding: 12px 8px;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: #BBBBB8;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
    letter-spacing: 0.04em;
  }
  .ts-tab.active { color: #1A1A1A; border-bottom-color: #1A1A1A; }
  .ts-tab:hover:not(.active) { color: #888; }

  /* ── Day list ── */
  .ts-days {
    background: #FAFAF8;
    padding: 8px 0;
  }

  .ts-day {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    gap: 10px;
    cursor: pointer;
    transition: background 0.1s;
    border-bottom: 1px solid #F0F0EE;
  }
  .ts-day:last-child { border-bottom: none; }
  .ts-day:hover { background: #F2F2F0; }

  .ts-day-arrow {
    font-size: 8px;
    color: #CCCCCA;
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .ts-day.expanded .ts-day-arrow { transform: rotate(90deg); }

  .ts-day-name {
    font-size: 14px;
    font-weight: 600;
    color: #1A1A1A;
    min-width: 90px;
  }

  .ts-day-date {
    font-size: 12px;
    color: #BBBBB8;
    flex: 1;
    font-weight: 400;
  }

  .ts-day-badges {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 20px;
    white-space: nowrap;
  }

  .badge-tasks { background: #EBEBEA; color: #888; }
  .badge-hrs { background: #1A1A1A; color: #fff; }
  .badge-ot { background: #FFF5E0; color: #B86E00; border: 1px solid #FFD88A; }
  .badge-dot {
    width: 8px; height: 8px;
    background: #F5A623;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── Weekly Summary ── */
  .ts-summary {
    background: #FFFFFF;
    border-top: 1px solid #EBEBEA;
  }

  .ts-summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid #F0F0EE;
  }

  .ts-summary-title {
    font-size: 13px;
    font-weight: 700;
    color: #1A1A1A;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ts-summary-totals {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ts-total-pill {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }

  .ts-total-num {
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    color: #1A1A1A;
  }

  .ts-total-num.ot { color: #B86E00; }

  .ts-total-label {
    font-size: 10px;
    color: #BBBBB8;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .ts-divider { width: 1px; height: 16px; background: #EBEBEA; }

  .ts-expand-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #BBBBB8;
    font-size: 12px;
    transition: color 0.15s;
  }
  .ts-expand-btn:hover { color: #1A1A1A; }

  /* Table */
  .ts-table {
    width: 100%;
    border-collapse: collapse;
  }

  .ts-table thead tr {
    border-bottom: 1px solid #F0F0EE;
    background: #FAFAF8;
  }

  .ts-table th {
    padding: 8px 20px;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #BBBBB8;
    text-align: left;
  }

  .ts-table th:nth-child(3),
  .ts-table th:nth-child(4) {
    text-align: right;
  }

  .ts-table th:nth-child(4) { padding-right: 20px; }

  .ts-table tbody tr {
    border-bottom: 1px solid #F5F5F3;
    transition: background 0.1s;
    animation: fadeRow 0.3s ease both;
  }

  @keyframes fadeRow {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ts-table tbody tr:hover { background: #F8F8F6; }

  .ts-table tbody tr.missing { background: rgba(239,68,68,0.04); }
  .ts-table tbody tr.missing:hover { background: rgba(239,68,68,0.07); }

  .ts-table td {
    padding: 10px 20px;
    vertical-align: top;
  }

  .ts-code {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: #3B7AE0;
    white-space: nowrap;
    padding-top: 11px;
  }

  .ts-code.missing-code {
    color: #DC2626;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .ts-desc {
    font-size: 12px;
    color: #888;
    font-weight: 400;
    line-height: 1.4;
  }

  .ts-desc.missing-desc { color: #DC2626; opacity: 0.8; }

  .ts-num {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: #2A2A2A;
    text-align: right;
    white-space: nowrap;
  }

  .ts-num.ot-val { color: #B86E00; }
  .ts-num.dash { color: #D8D8D4; }
  .ts-num.missing-val { color: #DC2626; }

  /* Totals row */
  .ts-totals-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-top: 1.5px solid #EBEBEA;
    background: #FAFAF8;
  }

  .ts-totals-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #BBBBB8;
  }

  .ts-totals-nums {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .ts-totals-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }

  .ts-totals-val {
    font-family: 'DM Mono', monospace;
    font-size: 16px;
    font-weight: 500;
    color: #1A1A1A;
  }

  .ts-totals-val.ot { color: #B86E00; }

  .ts-totals-sub {
    font-size: 9px;
    color: #BBBBB8;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
  }

  /* Progress bar */
  .ts-progress-bar {
    height: 3px;
    background: #EBEBEA;
    position: relative;
    overflow: hidden;
  }

  .ts-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3B7AE0, #22A35A);
    border-radius: 2px;
    transition: width 0.6s ease;
  }
`;

// helper — strips decimals for display (e.g. "8.00" → "8", "1.00" → "1")
const fmtH = (v) => v != null ? String(Math.round(parseFloat(v))) : null;

const rows = [
  { code: "ICD0004H14", desc: "Cease/Cancel – NGN Customer Circuits", ord: "8", ot: null },
  { code: "UWO0001A99", desc: "Other Unworked Leave; Meetings", ord: "8", ot: "1" },
  { code: "MXY0005A10", desc: "Routine Power RSU", ord: "5", ot: null },
  { code: "MCY0003A10", desc: "Routine DSL", ord: "4", ot: null },
  { code: "MNG7002A10", desc: "Maintenance NGN Core", ord: "3", ot: null },
  { code: "MXY0002A10", desc: "Maintenance Power RSU", ord: "3", ot: null },
  { code: "MLE0004A10", desc: "Routine AXE RSU", ord: "3", ot: null },
  { code: "WWO0001A99", desc: "General Admin COps FE", ord: "2", ot: null },
  { code: "WVM0001A99", desc: "Van Maintenance COps FE", ord: "2", ot: null },
  { code: "MCY0002A10", desc: "Maintenance DSL", ord: "1", ot: null },
  { code: "RLB0003A10", desc: "COW-Escort; ESAT", ord: "0", ot: "1" },
  { code: "CYP6011U24", desc: "Field – NGN Access Orders (P/M)", ord: "0", ot: "8" },
  { code: null, desc: "No Work Code selected", ord: "1", ot: "1", missing: true },
];

const days = [
  { name: "Friday", date: "27 Feb", tasks: 4, hrs: "7h", ot: "+1 OT" },
  { name: "Saturday", date: "28 Feb", tasks: null, hrs: null, ot: null },
  { name: "Sunday", date: "1 Mar", tasks: 1, hrs: null, ot: "+8 OT" },
  { name: "Monday", date: "2 Mar", tasks: 2, hrs: "8h", ot: null },
  { name: "Tuesday", date: "3 Mar", tasks: 2, hrs: "8h", ot: null },
  { name: "Wednesday", date: "4 Mar", tasks: 2, hrs: "8h", ot: null },
  { name: "Thursday", date: "5 Mar", tasks: 2, hrs: "9h", ot: "+2 OT", dot: true },
];

export default function WeeklySummary() {
  const [summaryOpen, setSummaryOpen] = useState(true);

  return (
    <>
      <style>{css}</style>
      <div className="ts-root">
        <div className="ts-shell">

          {/* Nav */}
          <div className="ts-nav">
            <div className="ts-nav-header">
              <button className="ts-nav-arrow">‹</button>
              <div className="ts-nav-title">
                <h2>27 Feb — 5 Mar</h2>
                <div className="ts-nav-synced">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Synced v3.3.10
                </div>
              </div>
              <button className="ts-nav-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 5h10M3 8h7M3 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="ts-nav-tabs">
              {[
                { label: "Timesheet", icon: "⏱" },
                { label: "Notes", icon: "✏" },
                { label: "Finder", icon: "⌕" },
              ].map((t, i) => (
                <button key={t.label} className={`ts-tab ${i === 0 ? "active" : ""}`}>
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar (40/48 hrs capacity) */}
          <div className="ts-progress-bar">
            <div className="ts-progress-fill" style={{ width: "83%" }} />
          </div>

          {/* Day list */}
          <div className="ts-days">
            {days.map((d) => (
              <div key={d.name} className="ts-day">
                <span className="ts-day-arrow">▶</span>
                <span className="ts-day-name">{d.name}</span>
                <span className="ts-day-date">{d.date}</span>
                <div className="ts-day-badges">
                  {d.tasks && <span className="badge badge-tasks">{d.tasks} {d.tasks === 1 ? "task" : "tasks"}</span>}
                  {d.hrs && <span className="badge badge-hrs">{d.hrs}</span>}
                  {d.ot && <span className="badge badge-ot">{d.ot}</span>}
                  {d.dot && <span className="badge-dot" />}
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Summary */}
          <div className="ts-summary">
            <div className="ts-summary-header">
              <span className="ts-summary-title">Weekly Summary</span>
              <div className="ts-summary-totals">
                <div className="ts-total-pill">
                  <span className="ts-total-num">40</span>
                  <span className="ts-total-label">hrs</span>
                </div>
                <div className="ts-divider" />
                <div className="ts-total-pill">
                  <span className="ts-total-num ot">11</span>
                  <span className="ts-total-label">OT</span>
                </div>
                <button className="ts-expand-btn" onClick={() => setSummaryOpen(o => !o)}>
                  {summaryOpen ? "▲" : "▼"}
                </button>
              </div>
            </div>

            {summaryOpen && (
              <table className="ts-table">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Code</th>
                    <th>Description</th>
                    <th style={{ width: 52 }}>Ord</th>
                    <th style={{ width: 52 }}>OT</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={r.missing ? "missing" : ""} style={{ animationDelay: `${i * 30}ms` }}>
                      <td className={`ts-code ${r.missing ? "missing-code" : ""}`}>
                        {r.code ?? "MISSING"}
                      </td>
                      <td className={`ts-desc ${r.missing ? "missing-desc" : ""}`}>{r.desc}</td>
                      <td className={`ts-num ${r.missing ? "missing-val" : ""}`}>{r.ord}</td>
                      <td className={`ts-num ${r.ot ? (r.missing ? "missing-val" : "ot-val") : "dash"}`}>
                        {r.ot ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="ts-totals-row">
              <span className="ts-totals-label">Total</span>
              <div className="ts-totals-nums">
                <div className="ts-totals-item">
                  <span className="ts-totals-val">40</span>
                  <span className="ts-totals-sub">Ordinary</span>
                </div>
                <div className="ts-totals-item">
                  <span className="ts-totals-val ot">11</span>
                  <span className="ts-totals-sub">Overtime</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
