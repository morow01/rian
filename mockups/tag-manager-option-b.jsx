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

function Toggle({ on }) {
  return (
    <div
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: on ? "#2D6BE4" : "#ccc",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          background: "#fff",
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}

function TagBadge({ name, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 12px",
        borderRadius: 20,
        background: color,
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {name}
    </span>
  );
}

function TagCard({ tags, title, isCustom }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e2e6ed",
        overflow: "hidden",
        flex: 1,
      }}
    >
      <div
        style={{
          padding: "16px 20px 8px",
          fontSize: 11,
          fontWeight: 700,
          color: "#8896A6",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          borderBottom: "1px solid #f0f2f5",
        }}
      >
        {title}
      </div>

      {tags.map((tag, i) => (
        <div
          key={tag.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 20px",
            borderBottom: i < tags.length - 1 ? "1px solid #f0f2f5" : "none",
          }}
        >
          <Toggle on={tag.enabled} />
          <TagBadge name={tag.name} color={tag.color} />
          {isCustom && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
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
          )}
        </div>
      ))}

      {isCustom && (
        <div style={{ padding: "12px 20px 16px" }}>
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
      )}
    </div>
  );
}

export default function TagManagerOptionB() {
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
              borderBottom: t === "NOTES" ? "2px solid #2D6BE4" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "20px 32px 0",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#555",
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: 13, color: "#8896A6" }}>◇</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1a2332" }}>
          Notes Tag Manager
        </span>
      </div>

      {/* Option B: Two-column layout */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: "24px 32px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <TagCard tags={BUILT_IN} title="Built-in Tags" isCustom={false} />
        <TagCard tags={CUSTOM} title="Custom Tags" isCustom={true} />
      </div>

      <div
        style={{
          textAlign: "center",
          margin: "0 32px",
          padding: "12px 24px",
          background: "rgba(45,107,228,0.06)",
          borderRadius: 12,
          fontSize: 13,
          color: "#2D6BE4",
          fontWeight: 500,
          maxWidth: 1100,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Option B — Two-column split. Built-in left, Custom right. Uses horizontal space.
      </div>
    </div>
  );
}