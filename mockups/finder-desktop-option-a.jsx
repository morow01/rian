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

export default function FinderOptionA() {
  const [selected, setSelected] = useState("CVN");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Location");
  const [finderTab, setFinderTab] = useState("exchanges");

  const filtered = EXCHANGES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase())
  );
  const sel = EXCHANGES.find((e) => e.code === selected);

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

      {/* Three-panel layout */}
      <div style={{ display: "flex", height: "calc(100vh - 96px)" }}>
        {/* Panel 1: Exchange/Cabinet nav */}
        <div style={{ width: 220, borderRight: "1px solid #e2e6ed", background: "#fff", overflow: "auto" }}>
          <div style={{ padding: "10px 14px 8px", fontSize: 10, fontWeight: 800, color: "#8896A6", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #e2e6ed" }}>
            Finder
          </div>
          {/* Exchanges / Cabinets tabs */}
          <div style={{ display: "flex", margin: "10px 10px 6px", background: "#141c2b", borderRadius: 14, padding: 3, gap: 2 }}>
            {["exchanges", "cabinets"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFinderTab(tab)}
                style={{
                  flex: 1, padding: "7px 4px", borderRadius: 11, border: "none", fontSize: 12, fontWeight: 700,
                  background: finderTab === tab ? "#fff" : "transparent",
                  color: finderTab === tab ? "#1a2332" : "#8896A6",
                  cursor: "pointer", textTransform: "capitalize",
                }}
              >
                {tab === "exchanges" ? "📍 Exchanges" : "📦 Cabinets"}
              </button>
            ))}
          </div>
          {/* Quick stats */}
          <div style={{ padding: "6px 14px 10px", fontSize: 11, color: "#8896A6" }}>
            {EXCHANGES.length} exchanges loaded
          </div>
        </div>

        {/* Panel 2: Search + results */}
        <div style={{ width: 340, borderRight: "1px solid #e2e6ed", background: "#fff", overflow: "auto" }}>
          <div style={{ padding: "10px 14px 8px", fontSize: 10, fontWeight: 800, color: "#8896A6", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #e2e6ed" }}>
            Results
          </div>
          <div style={{ padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F4F7FA", borderRadius: 10, padding: "8px 12px", border: "1px solid #e2e6ed" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8896A6" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exchanges..."
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1, color: "#1a2332" }}
              />
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEF1F6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D6BE4" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
              </div>
            </div>
          </div>
          {/* Results list */}
          <div>
            {filtered.map((ex) => (
              <div
                key={ex.code}
                onClick={() => { setSelected(ex.code); setActiveTab("Location"); }}
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f2f5",
                  background: selected === ex.code ? "linear-gradient(to right, rgba(45,107,228,0.10), rgba(45,107,228,0.03))" : "transparent",
                  borderLeft: selected === ex.code ? "3px solid #2D6BE4" : "3px solid transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: selected === ex.code ? "rgba(45,107,228,0.12)" : "#F4F7FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: selected === ex.code ? "#2D6BE4" : "#8896A6" }}>
                    {ex.code}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a2332" }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: "#8896A6", marginTop: 1 }}>Exchange Code: {ex.code}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Detail */}
        <div style={{ flex: 1, background: "#fff", overflow: "auto" }}>
          <div style={{ padding: "10px 14px 8px", fontSize: 10, fontWeight: 800, color: "#8896A6", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #e2e6ed" }}>
            Details
          </div>
          {sel ? (
            <div style={{ padding: "20px 28px" }}>
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1a2332" }}>{sel.name}</div>
                <div style={{ fontSize: 13, color: "#8896A6", marginTop: 2 }}>Exchange Code: {sel.code}</div>
              </div>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 16px", borderRadius: 20, border: "1px solid " + (activeTab === tab ? "#2D6BE4" : "#e2e6ed"),
                      background: activeTab === tab ? "#2D6BE4" : "#fff",
                      color: activeTab === tab ? "#fff" : "#5f6b7a",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Content: two-column layout */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Fields */}
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
                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "#2D6BE4", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      📍 Open Map
                    </button>
                    <button style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "#22c55e", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      🧭 Navigate
                    </button>
                  </div>
                </div>
                {/* Map placeholder */}
                <div style={{ background: "#e8f0fe", borderRadius: 12, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#2D6BE4", fontSize: 14, fontWeight: 600 }}>
                  🗺️ Google Map
                  <br />
                  {sel.coords}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#8896A6", fontSize: 14 }}>
              Select an exchange to view details
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", padding: "10px 20px", background: "rgba(45,107,228,0.06)", borderRadius: 12, fontSize: 13, color: "#2D6BE4", fontWeight: 500, border: "1px solid rgba(45,107,228,0.15)" }}>
        Option A — Three-panel: Nav | Search + Results | Detail with map
      </div>
    </div>
  );
}