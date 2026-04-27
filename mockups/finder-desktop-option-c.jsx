import { useState } from "react";

const EXCHANGES = [
  { name: "Cahirciveen", code: "CVN", coords: "51.947085,-10.223862", mprn: "—" },
  { name: "Tullamore", code: "TUL", coords: "53.274,-7.489", mprn: "10302271803" },
  { name: "Portlaoise", code: "PLA", coords: "53.034,-7.299", mprn: "10301992405" },
  { name: "Birr", code: "BIR", coords: "53.098,-7.913", mprn: "10301843702" },
  { name: "Athlone", code: "ATH", coords: "53.422,-7.940", mprn: "10301577901" },
  { name: "Clara", code: "CLA", coords: "53.340,-7.613", mprn: "10302015809" },
  { name: "Mountmellick", code: "MMK", coords: "53.118,-7.351", mprn: "—" },
  { name: "Kilbeggan", code: "KBN", coords: "53.369,-7.504", mprn: "10301920605" },
  { name: "Edenderry", code: "EDY", coords: "53.341,-7.049", mprn: "10302108301" },
  { name: "Banagher", code: "BNG", coords: "53.190,-7.988", mprn: "—" },
];

const TABS = ["Location", "Details", "Address", "Security", "Power", "Emergency", "Additional"];

export default function FinderOptionC() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Location");
  const [finderTab, setFinderTab] = useState("exchanges");

  const filtered = EXCHANGES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase())
  );
  const sel = selected ? EXCHANGES.find((e) => e.code === selected) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EEF1F6",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ background: "#0f1624", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>17 Apr – 23 Apr</span>
      </div>
      {/* Tab nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e6ed", display: "flex", justifyContent: "center", gap: 48, padding: "0 24px" }}>
        {["TIMESHEET", "NOTES", "JOURNAL", "FINDER"].map((t) => (
          <button key={t} style={{ padding: "14px 0", background: "none", border: "none", fontSize: 12, fontWeight: 700, letterSpacing: 1, color: t === "FINDER" ? "#2D6BE4" : "#8896A6", borderBottom: t === "FINDER" ? "2px solid #2D6BE4" : "2px solid transparent", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Dashboard layout */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
        {/* Top bar: tabs + search */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", background: "#141c2b", borderRadius: 14, padding: 3, gap: 2 }}>
            {["exchanges", "cabinets"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFinderTab(tab)}
                style={{
                  padding: "8px 20px", borderRadius: 11, border: "none", fontSize: 12, fontWeight: 700,
                  background: finderTab === tab ? "#fff" : "transparent",
                  color: finderTab === tab ? "#1a2332" : "#8896A6",
                  cursor: "pointer", textTransform: "capitalize",
                }}
              >
                {tab === "exchanges" ? "📍 Exchanges" : "📦 Cabinets"}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 12, padding: "10px 16px", border: "1px solid #e2e6ed" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8896A6" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exchanges by name or code..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, flex: 1, color: "#1a2332" }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#8896A6", whiteSpace: "nowrap" }}>{filtered.length} results</div>
        </div>

        {/* Results grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
          {filtered.map((ex) => (
            <div
              key={ex.code}
              onClick={() => { setSelected(ex.code); setActiveTab("Location"); }}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "16px",
                border: selected === ex.code ? "2px solid #2D6BE4" : "1px solid #e2e6ed",
                cursor: "pointer",
                transition: "border 0.15s, box-shadow 0.15s",
                boxShadow: selected === ex.code ? "0 0 0 3px rgba(45,107,228,0.12)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: selected === ex.code ? "rgba(45,107,228,0.12)" : "#F4F7FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: selected === ex.code ? "#2D6BE4" : "#8896A6" }}>
                  {ex.code}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2332" }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: "#8896A6" }}>{ex.coords.split(",")[0]}...</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#8896A6" }}>
                MPRN: {ex.mprn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-out detail panel */}
      {sel && (
        <div
          style={{
            position: "fixed", top: 96, right: 0, bottom: 0, width: 520,
            background: "#fff", borderLeft: "1px solid #e2e6ed",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
            overflow: "auto", zIndex: 100,
            animation: "slideIn 0.2s ease",
          }}
        >
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e2e6ed" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1a2332" }}>{sel.name}</div>
              <div style={{ fontSize: 13, color: "#8896A6", marginTop: 2 }}>Exchange Code: {sel.code}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: "#F4F7FA", border: "1px solid #e2e6ed", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#5f6b7a", fontSize: 16 }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "12px 20px", flexWrap: "wrap", borderBottom: "1px solid #f0f2f5" }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 12px", borderRadius: 20, border: "1px solid " + (activeTab === tab ? "#2D6BE4" : "#e2e6ed"),
                  background: activeTab === tab ? "#2D6BE4" : "#fff",
                  color: activeTab === tab ? "#fff" : "#5f6b7a",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Map */}
          <div style={{ margin: "16px 20px", background: "#e8f0fe", borderRadius: 12, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#2D6BE4", fontSize: 14, fontWeight: 600, flexDirection: "column", gap: 4 }}>
            🗺️ Google Map
            <span style={{ fontSize: 11, color: "#8896A6" }}>{sel.coords}</span>
          </div>

          {/* Fields */}
          <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#F4F7FA", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8896A6", textTransform: "uppercase", letterSpacing: 0.5 }}>Site Code</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1a2332", marginTop: 4 }}>{sel.code}</div>
            </div>
            <div style={{ background: "#F4F7FA", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8896A6", textTransform: "uppercase", letterSpacing: 0.5 }}>Location Coordinates</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1a2332", marginTop: 4 }}>{sel.coords}</div>
            </div>
            <div style={{ background: "#F4F7FA", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8896A6", textTransform: "uppercase", letterSpacing: 0.5 }}>MPRN Number</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1a2332", marginTop: 4 }}>{sel.mprn}</div>
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "#2D6BE4", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                📍 Open Map
              </button>
              <button style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "#22c55e", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                🧭 Navigate
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", padding: "10px 20px", background: "rgba(45,107,228,0.06)", borderRadius: 12, fontSize: 13, color: "#2D6BE4", fontWeight: 500, border: "1px solid rgba(45,107,228,0.15)", zIndex: 200 }}>
        Option C — Dashboard: search + card grid, detail slides out from right
      </div>
    </div>
  );
}