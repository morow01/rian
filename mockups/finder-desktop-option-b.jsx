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

export default function FinderOptionB() {
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

      {/* Two-panel layout */}
      <div style={{ display: "flex", height: "calc(100vh - 96px)" }}>
        {/* Left: Search + results list */}
        <div style={{ width: 320, borderRight: "1px solid #e2e6ed", background: "#fff", overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px 8px", fontSize: 10, fontWeight: 800, color: "#8896A6", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #e2e6ed" }}>
            Finder
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", margin: "10px 10px 0", background: "#141c2b", borderRadius: 14, padding: 3, gap: 2 }}>
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
          {/* Search */}
          <div style={{ padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F4F7FA", borderRadius: 10, padding: "8px 12px", border: "1px solid #e2e6ed" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8896A6" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exchanges..."
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1, color: "#1a2332" }}
              />
            </div>
          </div>
          {/* Results */}
          <div style={{ flex: 1, overflow: "auto" }}>
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
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a2332" }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: "#8896A6", marginTop: 2 }}>Code: {ex.code}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Wide detail area */}
        <div style={{ flex: 1, background: "#fff", overflow: "auto" }}>
          <div style={{ padding: "10px 14px 8px", fontSize: 10, fontWeight: 800, color: "#8896A6", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid #e2e6ed" }}>
            Details
          </div>
          {sel ? (
            <div style={{ padding: "20px 28px" }}>
              {/* Header row with name + map side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1a2332" }}>{sel.name}</div>
                  <div style={{ fontSize: 14, color: "#8896A6", marginTop: 4 }}>Exchange Code: {sel.code}</div>
                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 4, marginTop: 16, flexWrap: "wrap" }}>
                    {TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "7px 14px", borderRadius: 20, border: "1px solid " + (activeTab === tab ? "#2D6BE4" : "#e2e6ed"),
                          background: activeTab === tab ? "#2D6BE4" : "#fff",
                          color: activeTab === tab ? "#fff" : "#5f6b7a",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Map */}
                <div style={{ background: "#e8f0fe", borderRadius: 12, minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "#2D6BE4", fontSize: 14, fontWeight: 600, flexDirection: "column", gap: 4 }}>
                  🗺️ Google Map
                  <span style={{ fontSize: 11, color: "#8896A6" }}>{sel.coords}</span>
                </div>
              </div>

              {/* Fields in a 3-column grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div style={{ background: "#F4F7FA", borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#8896A6", textTransform: "uppercase", letterSpacing: 0.5 }}>Site Code</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a2332", marginTop: 4 }}>{sel.code}</div>
                </div>
                <div style={{ background: "#F4F7FA", borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#8896A6", textTransform: "uppercase", letterSpacing: 0.5 }}>Coordinates</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a2332", marginTop: 4 }}>{sel.coords}</div>
                </div>
                <div style={{ background: "#F4F7FA", borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#8896A6", textTransform: "uppercase", letterSpacing: 0.5 }}>MPRN Number</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a2332", marginTop: 4 }}>{sel.mprn}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 16, maxWidth: 400 }}>
                <button style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "#2D6BE4", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  📍 Open Map
                </button>
                <button style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "#22c55e", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  🧭 Navigate
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#8896A6" }}>
              Select an exchange to view
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", padding: "10px 20px", background: "rgba(45,107,228,0.06)", borderRadius: 12, fontSize: 13, color: "#2D6BE4", fontWeight: 500, border: "1px solid rgba(45,107,228,0.15)" }}>
        Option B — Two-panel: Search list | Wide detail with map + 3-column fields
      </div>
    </div>
  );
}