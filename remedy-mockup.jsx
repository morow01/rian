
import { useState } from "react";

const ticketIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z"/>
    <line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2"/>
  </svg>
);

const checkIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const pinIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#e8453c">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
  </svg>
);

function TaskCard({ task, mode, onToggleRemedy, onTicketInput }) {
  const hasRemedy = task.remedyPending;
  const hasTicket = task.remedyTicket;
  const isError = task.hoursWithoutCode;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: `1.5px solid ${isError && !hasRemedy ? "#f97316" : hasRemedy ? "#7c3aed" : "#e2e8f0"}`,
      boxShadow: hasRemedy ? "0 0 0 3px rgba(124,58,237,0.12)" : "0 1px 4px rgba(0,0,0,0.07)",
      padding: "12px 14px",
      position: "relative",
      transition: "all 0.2s",
    }}>
      {/* Top row: description + remedy button */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{task.description}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
            {pinIcon} {task.location}
          </div>
        </div>

        {/* OPTION A: Simple toggle */}
        {mode === "toggle" && (
          <button
            onClick={() => onToggleRemedy(task.id)}
            title={hasRemedy ? "Remedy ticket pending — tap to clear" : "Mark as needs Remedy ticket"}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 9px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 11, fontWeight: 700,
              background: hasRemedy ? "#7c3aed" : "#f1f5f9",
              color: hasRemedy ? "#fff" : "#94a3b8",
              transition: "all 0.18s",
              flexShrink: 0,
            }}>
            {ticketIcon}
            {hasRemedy ? "Remedy" : "Remedy"}
          </button>
        )}

        {/* OPTION B: Toggle + ticket number */}
        {mode === "ticket" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {hasRemedy && !hasTicket && (
              <input
                placeholder="INC#"
                defaultValue={task.remedyTicket}
                onBlur={e => onTicketInput(task.id, e.target.value)}
                style={{
                  width: 72, padding: "3px 7px", borderRadius: 8,
                  border: "1.5px solid #7c3aed", fontSize: 11, fontWeight: 600,
                  color: "#7c3aed", background: "#f5f3ff", outline: "none",
                }}
              />
            )}
            {hasTicket && (
              <span style={{
                padding: "3px 8px", borderRadius: 8, background: "#f0fdf4",
                border: "1.5px solid #22c55e", fontSize: 11, fontWeight: 700, color: "#16a34a"
              }}>
                {checkIcon} {task.remedyTicket}
              </span>
            )}
            <button
              onClick={() => onToggleRemedy(task.id)}
              title={hasRemedy ? "Remedy pending" : "Needs Remedy ticket"}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 9px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 700,
                background: hasTicket ? "#f0fdf4" : hasRemedy ? "#7c3aed" : "#f1f5f9",
                color: hasTicket ? "#16a34a" : hasRemedy ? "#fff" : "#94a3b8",
                transition: "all 0.18s",
              }}>
              {ticketIcon}
              Remedy
            </button>
          </div>
        )}
      </div>

      {/* Hour pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {task.codes.map(c => (
          <span key={c.code} style={{
            background: "#e0f2fe", color: "#0369a1",
            borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700
          }}>{c.code} · {c.hrs}h</span>
        ))}
        {isError && !hasRemedy && (
          <span style={{ fontSize: 11, color: "#f97316", fontWeight: 600 }}>⚠ Code missing</span>
        )}
        {hasRemedy && !hasTicket && (
          <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>
            🎫 Remedy ticket needed
          </span>
        )}
        {hasTicket && (
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
            ✓ {task.remedyTicket} created
          </span>
        )}
      </div>
    </div>
  );
}

function DayHeader({ tasks, dayLabel }) {
  const remedyCount = tasks.filter(t => t.remedyPending && !t.remedyTicket).length;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 14px", background: "#f8fafc",
      borderRadius: 10, marginBottom: 8,
      border: "1px solid #e2e8f0",
    }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{dayLabel}</span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {remedyCount > 0 && (
          <span style={{
            background: "#7c3aed", color: "#fff",
            borderRadius: 20, padding: "2px 10px",
            fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {ticketIcon} {remedyCount} Remedy pending
          </span>
        )}
        <span style={{ fontSize: 12, color: "#94a3b8" }}>8.5h</span>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("toggle");
  const [tasks, setTasks] = useState([
    {
      id: 1, description: "Spare parts collection", location: "Portlaoise",
      codes: [{ code: "MAINT", hrs: 2 }],
      remedyPending: false, remedyTicket: "", hoursWithoutCode: false,
    },
    {
      id: 2, description: "Cabinet installation", location: "Tullamore",
      codes: [],
      remedyPending: false, remedyTicket: "", hoursWithoutCode: true,
    },
    {
      id: 3, description: "Fault investigation", location: "Athlone",
      codes: [{ code: "FAULT", hrs: 3.5 }],
      remedyPending: false, remedyTicket: "", hoursWithoutCode: false,
    },
  ]);

  const toggle = (id) => {
    setTasks(ts => ts.map(t => {
      if (t.id !== id) return t;
      if (t.remedyTicket) return { ...t, remedyPending: false, remedyTicket: "" };
      return { ...t, remedyPending: !t.remedyPending, remedyTicket: "" };
    }));
  };

  const setTicket = (id, val) => {
    if (!val.trim()) return;
    setTasks(ts => ts.map(t => t.id === id ? { ...t, remedyTicket: val.trim() } : t));
  };

  const remedyTotal = tasks.filter(t => t.remedyPending && !t.remedyTicket).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui,sans-serif", padding: 20 }}>
      {/* Week bar */}
      {remedyTotal > 0 && (
        <div style={{
          background: "#7c3aed", color: "#fff", borderRadius: 12,
          padding: "10px 16px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700,
        }}>
          {ticketIcon}
          {remedyTotal} task{remedyTotal > 1 ? "s" : ""} need{remedyTotal === 1 ? "s" : ""} a Remedy ticket this week
          <span style={{ marginLeft: "auto", opacity: 0.7, fontSize: 11, fontWeight: 400 }}>Due by Thursday</span>
        </div>
      )}

      {/* Mode switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center", fontWeight: 600 }}>Mode:</span>
        {["toggle", "ticket"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 700,
            background: mode === m ? "#1e293b" : "#e2e8f0",
            color: mode === m ? "#fff" : "#64748b",
          }}>
            {m === "toggle" ? "A — Simple flag" : "B — Flag + ticket no."}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>
        {mode === "toggle"
          ? "Tap Remedy on any task to flag it. Tap again to clear."
          : "Flag a task, then enter the INC# once created in Remedy."}
      </div>

      <DayHeader tasks={tasks} dayLabel="Tuesday 1 Apr" />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} mode={mode} onToggleRemedy={toggle} onTicketInput={setTicket} />
        ))}
      </div>

      <div style={{ marginTop: 20, padding: 14, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
        <strong style={{ color: "#1e293b" }}>How it works:</strong><br/>
        • Tap <strong>Remedy</strong> on a task to flag it — purple border + badge appear<br/>
        • Purple bar at the top of the week counts all pending Remedy tasks<br/>
        {mode === "ticket" && <span>• In mode B: enter the INC# once created — turns green ✓<br/></span>}
        • No more faking validation errors to get a visual reminder
      </div>
    </div>
  );
}
