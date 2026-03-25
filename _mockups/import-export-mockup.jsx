import { useState } from "react";

const CheckboxItem = ({ label, count, checked, onChange, disabled }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid #e5e7eb",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1,
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: 20,
        height: 20,
        accentColor: "#2563eb",
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0,
      }}
    />
    <span style={{ flex: 1, fontSize: 15, color: disabled ? "#9ca3af" : "#1f2937", fontWeight: 500 }}>
      {label}
    </span>
    {count !== undefined && (
      <span style={{ fontSize: 13, color: "#6b7280" }}>{count}</span>
    )}
  </label>
);

const Modal = ({ children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "16px 16px 0 0",
        width: "100%",
        maxWidth: 420,
        maxHeight: "80vh",
        overflow: "auto",
        padding: "20px 24px 24px",
      }}
    >
      {children}
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState("none"); // 'none' | 'export' | 'importFile' | 'importPreview'

  // Export
  const [expTimesheet, setExpTimesheet] = useState(true);
  const [expNotes, setExpNotes] = useState(true);
  const [expReminders, setExpReminders] = useState(true);
  const [expCallouts, setExpCallouts] = useState(true);
  const [expSettings, setExpSettings] = useState(true);

  // Import
  const [impTimesheet, setImpTimesheet] = useState(true);
  const [impNotes, setImpNotes] = useState(true);
  const [impReminders, setImpReminders] = useState(true);
  const [impCallouts, setImpCallouts] = useState(true);
  const [impSettings, setImpSettings] = useState(false);

  const someExport = expTimesheet || expNotes || expReminders || expCallouts || expSettings;
  const someImport = impTimesheet || impNotes || impReminders || impCallouts;

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
      }}
    >
      <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Tap a button to preview each dialog</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setView("export")}
          style={{
            padding: "12px 28px",
            borderRadius: 10,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Export
        </button>
        <button
          onClick={() => setView("importFile")}
          style={{
            padding: "12px 28px",
            borderRadius: 10,
            border: "2px solid #2563eb",
            background: "#fff",
            color: "#2563eb",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Import
        </button>
      </div>

      {/* ── Export Dialog ── */}
      {view === "export" && (
        <Modal>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>
            Export Data
          </h2>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7280" }}>
            Choose what to include in your backup file.
          </p>

          <div style={{ marginBottom: 4 }}>
            <CheckboxItem label="Timesheet" count="847 entries" checked={expTimesheet} onChange={() => setExpTimesheet(!expTimesheet)} />
            <CheckboxItem label="Field Notes" count="23 notes" checked={expNotes} onChange={() => setExpNotes(!expNotes)} />
            <CheckboxItem label="Reminders" count="8 reminders" checked={expReminders} onChange={() => setExpReminders(!expReminders)} />
            <CheckboxItem label="Callouts" count="31 callouts" checked={expCallouts} onChange={() => setExpCallouts(!expCallouts)} />
            <CheckboxItem label="Settings" checked={expSettings} onChange={() => setExpSettings(!expSettings)} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={() => setView("none")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              disabled={!someExport}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: someExport ? "#2563eb" : "#d1d5db",
                color: someExport ? "#fff" : "#9ca3af",
                fontSize: 15,
                fontWeight: 600,
                cursor: someExport ? "pointer" : "default",
              }}
            >
              Export
            </button>
          </div>
        </Modal>
      )}

      {/* ── Import Dialog: Choose File ── */}
      {view === "importFile" && (
        <Modal>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>
            Import Data
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>
            Select a previously exported JSON backup file.
          </p>

          <button
            onClick={() => setView("importPreview")}
            style={{
              width: "100%",
              padding: "28px 20px",
              borderRadius: 12,
              border: "2px dashed #d1d5db",
              background: "#f9fafb",
              color: "#6b7280",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 24 }}>📁</span>
            <span style={{ fontWeight: 600, color: "#374151" }}>Choose File</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>JSON backup files only</span>
          </button>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={() => setView("none")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ── Import Dialog: Preview & Select ── */}
      {view === "importPreview" && (
        <Modal>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>
            Import Data
          </h2>

          {/* File chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#f3f4f6",
              margin: "8px 0 12px",
            }}
          >
            <span style={{ fontSize: 15 }}>📄</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>rian-backup-2026-03-20.json</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>142 KB</div>
            </div>
            <button
              onClick={() => setView("importFile")}
              style={{ background: "none", border: "none", color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Change
            </button>
          </div>

          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>
            Select what to import. Data will be merged with existing records.
          </p>

          {/* Warning */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              padding: "10px 12px",
              borderRadius: 8,
              background: "#fefce8",
              border: "1px solid #fde68a",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1.4 }}>⚠️</span>
            <span style={{ color: "#92400e", fontSize: 12, lineHeight: 1.4 }}>
              Duplicate entries may be created if the same data already exists.
            </span>
          </div>

          <div style={{ marginBottom: 4 }}>
            <CheckboxItem label="Timesheet" count="847 entries" checked={impTimesheet} onChange={() => setImpTimesheet(!impTimesheet)} />
            <CheckboxItem label="Field Notes" count="23 notes" checked={impNotes} onChange={() => setImpNotes(!impNotes)} />
            <CheckboxItem label="Reminders" count="8 reminders" checked={impReminders} onChange={() => setImpReminders(!impReminders)} />
            <CheckboxItem label="Callouts" count="31 callouts" checked={impCallouts} onChange={() => setImpCallouts(!impCallouts)} />
            <CheckboxItem label="Settings" count="Not in file" checked={false} onChange={() => {}} disabled={true} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={() => setView("none")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              disabled={!someImport}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: someImport ? "#16a34a" : "#d1d5db",
                color: someImport ? "#fff" : "#9ca3af",
                fontSize: 15,
                fontWeight: 600,
                cursor: someImport ? "pointer" : "default",
              }}
            >
              Import
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default App;