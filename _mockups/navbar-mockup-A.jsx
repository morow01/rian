// Mockup A — Minimal frosted glass sticky bar
// Thin, lightweight, semi-transparent with blur effect

export default function NavbarMockupA() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#E8EEF5", minHeight: "100vh" }}>

      {/* ── STICKY NAV ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
        background: "rgba(15,28,46,0.82)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 24px",
        display: "flex", alignItems: "center",
        height: 52,
        gap: 16,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #2D6BE4, #7c73e6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#fff",
          }}>F</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>FieldLog</span>
          {/* Version badge */}
          <span style={{
            fontSize: 10, fontWeight: 600,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.4)",
            padding: "2px 7px", borderRadius: 20,
          }}>v3.6.75</span>
        </div>

        {/* Launch App button */}
        <a style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#2D6BE4",
          color: "#fff",
          padding: "7px 16px", borderRadius: 8,
          fontSize: 13, fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 2px 10px rgba(45,107,228,0.4)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Launch App
        </a>
      </div>

      {/* ── PAGE CONTENT (simulated) ── */}
      <div style={{
        background: "#0F1C2E",
        textAlign: "center",
        padding: "64px 24px",
        color: "#fff",
      }}>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Mobile First · Field Ready</div>
        <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.15, marginBottom: 14 }}>
          Everything you need<br/><span style={{ color: "#7EB3FF" }}>on the job site</span>
        </div>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 480, margin: "0 auto 32px" }}>
          FieldLog keeps your timesheets, field notes, and site finder in one fast, cloud-synced app.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {["Timesheet", "Notes", "Finder"].map((t, i) => (
            <div key={t} style={{
              padding: "7px 18px", borderRadius: 24, fontSize: 13, fontWeight: 600,
              background: i === 0 ? "#2D6BE4" : "rgba(255,255,255,0.08)",
              border: `1px solid ${i === 0 ? "#2D6BE4" : "rgba(255,255,255,0.15)"}`,
              color: "#fff",
            }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Simulated section */}
      <div style={{ padding: "48px 32px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D6BE4", marginBottom: 8 }}>01 — Timesheet</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Track every hour, every day</div>
        <div style={{ fontSize: 15, color: "#4A6580", lineHeight: 1.7 }}>
          Log your ordinary and overtime hours against work codes for each day of the week.
        </div>
      </div>

    </div>
  );
}
