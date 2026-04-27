import { useState } from "react";

const BUILT_IN = [
  { name: "Job", icon: "🏢", color: "#2D6BE4", enabled: true },
  { name: "Fault", icon: "⚠️", color: "#e8453c", enabled: true },
  { name: "Follow-up", icon: "🔄", color: "#F59E0B", enabled: true },
  { name: "Meeting", icon: "👥", color: "#8B5CF6", enabled: true },
  { name: "Personal", icon: "👤", color: "#22c55e", enabled: true },
  { name: "Idea", icon: "💡", color: "#F59E0B", enabled: true },
];

const CUSTOM = [
  { name: "Test", icon: "📋", color: "#e8453c", enabled: true },
  { name: "Tab no 2", icon: "", color: "#F97316", enabled: true },
];

const NOTES = [
  { title: "INTRUDERALARM – INT01", cat: "Fault", catColor: "#e8453c", date: "18 Apr", pinned: true },
  { title: "Clara - (Clara RSU)(CCRB)", cat: "Job", catColor: "#2D6BE4", date: "17 Apr", pinned: false },
  { title: "Kilbeggan (KBNB)", cat: "Job", catColor: "#2D6BE4", date: "17 Apr", pinned: false },
  { title: "IP Training notes", cat: "Meeting", catColor: "#8B5CF6", date: "16 Apr", pinned: false },
  { title: "Routines To Do", cat: "Follow-up", catColor: "#F59E0B", date: "15 Apr", pinned: true },
];

function Toggle({ on }) {
  return (
    <div
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: on ? "#2D6BE4" : "#ccc",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          background: "#fff",
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}

function TagBadge({ name, color, small }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: small ? "2px 8px" : "4px 12px",
        borderRadius: 20,
        background: color,
        color: "#fff",
        fontSize: small ? 11 : 13,
        fontWeight: 600,
      }}
    >
      {name}
    </span>
  );
}

export default function TagManagerOptionC() {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EEF1F6",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: "#0f1624",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
          17 Apr – 23 Apr
        </span>
      </div>

      {/* Tab nav */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e6ed",
          display: "flex",
          justifyContent: "center",
          gap: 48,
          padding: "0 24px",
        }}
      >
        {["TIMESHEET", "NOTES", "JOURNAL", "FINDER"].map((t) => (
          <button
            key={t}
            style={{
              padding: "14px 0",
              background: "none",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              color: t === "NOTES" ? "#2D6BE4" : "#8896A6",
              borderBottom:
                t === "NOTES"
                  ? "2px solid #2D6BE4"
                  : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Three-panel Notes layout with tag manager as overlay panel */}
      <div style={{ display: "flex", height: "calc(100vh - 96px)" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 200,
            borderRight: "1px solid #e2e6ed",
            background: "#fff",
            padding: "12px 0",
          }}
        >
          <div style={{ padding: "8px 16px" }}>
            {["Active", "Archive", "Bin"].map((tab) => (
              <div
                key={tab}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: tab === "Active" ? 700 : 500,
                  color: tab === "Active" ? "#2D6BE4" : "#5f6b7a",
                  background:
                    tab === "Active"
                      ? "rgba(45,107,228,0.08)"
                      : "transparent",
                  cursor: "pointer",
                  marginBottom: 2,
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          <div
            style={{
              height: 1,
              background: "#e2e6ed",
              margin: "8px 16px",
            }}
          />

          <div
            style={{
              padding: "4px 16px",
              fontSize: 10,
              fontWeight: 700,
              color: "#8896A6",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Categories
          </div>
          {BUILT_IN.concat(CUSTOM).map((tag) => (
            <div
              key={tag.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 28px",
                fontSize: 12,
                color: "#5f6b7a",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: tag.color,
                }}
              />
              {tag.name}
            </div>
          ))}

          <div
            style={{
              height: 1,
              background: "#e2e6ed",
              margin: "8px 16px",
            }}
          />
          <div
            style={{
              padding: "8px 16px",
            }}
          >
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                background: panelOpen
                  ? "rgba(45,107,228,0.08)"
                  : "transparent",
                fontSize: 12,
                fontWeight: 600,
                color: "#2D6BE4",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>◇</span> Manage Tags
            </button>
          </div>
        </div>

        {/* Notes list */}
        <div
          style={{
            width: 380,
            borderRight: "1px solid #e2e6ed",
            background: "#fff",
            overflow: "auto",
          }}
        >
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #e2e6ed" }}>
            <input
              placeholder="Search notes..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e2e6ed",
                background: "#F4F7FA",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {NOTES.map((note, i) => (
            <div
              key={i}
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid #f0f2f5",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: note.catColor,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a2332",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {note.title}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#8896A6" }}>
                {note.date}
              </div>
            </div>
          ))}
        </div>

        {/* Editor / Tag Manager Panel */}
        <div style={{ flex: 1, background: "#fff", position: "relative" }}>
          {panelOpen && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#fff",
                zIndex: 10,
                overflow: "auto",
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: "1px solid #e2e6ed",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 15, color: "#8896A6" }}>◇</span>
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#1a2332",
                    }}
                  >
                    Tag Manager
                  </span>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 20,
                    color: "#8896A6",
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Built-in */}
              <div style={{ padding: "0 24px" }}>
                <div
                  style={{
                    padding: "16px 0 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#8896A6",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Built-in Tags
                </div>
                {BUILT_IN.map((tag, i) => (
                  <div
                    key={tag.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 0",
                      borderBottom:
                        i < BUILT_IN.length - 1
                          ? "1px solid #f0f2f5"
                          : "none",
                    }}
                  >
                    <Toggle on={tag.enabled} />
                    <TagBadge name={tag.name} color={tag.color} />
                  </div>
                ))}

                <div
                  style={{
                    height: 1,
                    background: "#e2e6ed",
                    margin: "8px 0",
                  }}
                />

                <div
                  style={{
                    padding: "16px 0 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#8896A6",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Custom Tags
                </div>
                {CUSTOM.map((tag, i) => (
                  <div
                    key={tag.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 0",
                      borderBottom:
                        i < CUSTOM.length - 1
                          ? "1px solid #f0f2f5"
                          : "none",
                    }}
                  >
                    <Toggle on={tag.enabled} />
                    <TagBadge name={tag.name} color={tag.color} />
                    <div
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "#8896A6",
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      >
                        ✎
                      </button>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "#8896A6",
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ padding: "16px 0" }}>
                  <button
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 10,
                      border: "1px dashed #ccd3dc",
                      background: "none",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#2D6BE4",
                      cursor: "pointer",
                    }}
                  >
                    + Add New Tag
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Normal editor state (shown when panel closed) */}
          {!panelOpen && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#8896A6",
                fontSize: 14,
              }}
            >
              Select a note to edit
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 24px",
          background: "rgba(45,107,228,0.06)",
          borderRadius: 12,
          fontSize: 13,
          color: "#2D6BE4",
          fontWeight: 500,
          border: "1px solid rgba(45,107,228,0.15)",
          backdropFilter: "blur(8px)",
        }}
      >
        Option C — Tag manager opens in the editor panel within the Notes three-panel layout. Click "Manage Tags" in sidebar to toggle.
      </div>
    </div>
  );
}