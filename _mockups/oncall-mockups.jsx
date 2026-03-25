const sampleMonths = [
  { name: "JAN", weeks: [2, 9, 16, 23, 30], oncall: [23] },
  { name: "FEB", weeks: [6, 13, 20, 27], oncall: [20] },
  { name: "MAR", weeks: [6, 13, 20, 27], oncall: [20], extra: [13] },
  { name: "APR", weeks: [3, 10, 17, 24], oncall: [17] },
];

function CalIcon() {
  return (
    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    </div>
  );
}

function CloseBtn() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>
  );
}

function YearNav() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button style={{ border: "none", background: "#f1f5f9", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", minWidth: 36, textAlign: "center" }}>2026</span>
      <button style={{ border: "none", background: "#f1f5f9", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
    </div>
  );
}

function MonthRows() {
  return (
    <>
      {sampleMonths.map((m, i) => (
        <div key={m.name} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: i < sampleMonths.length - 1 ? "1px dashed #e2e8f0" : "none", gap: 10 }}>
          <div style={{ width: 36, fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5 }}>{m.name}</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {m.weeks.map(w => {
              const isOncall = m.oncall?.includes(w);
              const isExtra = m.extra?.includes(w);
              return (
                <div key={w} style={{
                  width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: isOncall || isExtra ? 700 : 500,
                  background: isOncall ? "#3b82f6" : isExtra ? "#f59e0b" : "#f1f5f9",
                  color: isOncall || isExtra ? "#fff" : "#64748b",
                  border: "1px solid", borderColor: isOncall ? "#3b82f6" : isExtra ? "#f59e0b" : "#e2e8f0",
                }}>
                  {w}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: 24, background: "#e8edf3", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 300 }}>

        {/* White card — everything inside */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>

          {/* Header: icon + title + close */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 12px" }}>
            <CalIcon />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>On-Call Schedule</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, marginTop: 3 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
                  <strong style={{ color: "#3b82f6" }}>13</strong>
                  <span style={{ color: "#94a3b8" }}>Weeks</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                  <strong style={{ color: "#f59e0b" }}>3</strong>
                  <span style={{ color: "#94a3b8" }}>Extra</span>
                </span>
              </div>
            </div>
            <CloseBtn />
          </div>

          {/* Year nav row */}
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 16px", borderTop: "1px dashed #e2e8f0", borderBottom: "1px dashed #e2e8f0" }}>
            <YearNav />
          </div>

          {/* Month grid */}
          <MonthRows />

        </div>

        {/* Hint — outside white card */}
        <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginTop: 10 }}>
          Tap = on-call · Long-press = extra shift
        </div>

      </div>
    </div>
  );
}
