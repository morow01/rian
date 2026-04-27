import { useState, useMemo } from "react";

const ACCENT = "#4A6CF7";
const ACCENT_LIGHT = "#EEF2FF";
const EXTRA_COLOR = "#F59E0B";
const EXTRA_LIGHT = "#FEF3C7";
const GREEN = "#22C55E";
const BG = "#F1F5F9";
const CARD = "#FFFFFF";
const BORDER = "#E2E8F0";
const TEXT = "#1E293B";
const MUTED = "#94A3B8";

// On-call weeks run Friday–Thursday
function getWeekStarts(year) {
  const weeks = [];
  let d = new Date(year, 0, 1);
  // Find first Friday
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
  while (d.getFullYear() <= year) {
    weeks.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return weeks;
}

function formatWeekRange(date) {
  const end = new Date(date);
  end.setDate(end.getDate() + 6); // Friday + 6 = Thursday
  return `${date.toLocaleDateString("en-IE", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IE", { day: "numeric", month: "short" })}`;
}

function formatShortRange(date) {
  const end = new Date(date);
  end.setDate(end.getDate() + 6);
  return `${date.getDate()} ${date.toLocaleDateString("en-IE", { month: "short" })} – ${end.getDate()} ${end.toLocaleDateString("en-IE", { month: "short" })}`;
}

function isCurrentWeek(weekStart) {
  const now = new Date(2026, 2, 23);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return now >= weekStart && now <= weekEnd;
}

function isPast(weekStart) {
  const now = new Date(2026, 2, 23);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd < now;
}

function getMonthIdx(date) {
  return date.getMonth();
}

// Month grid cell — just day number, colored by on-call/extra status
function WeekCell({ weekStart, isOn, isExtra, isCurrent, past, onTap, onLongPress }) {
  const dayNum = weekStart.getDate();
  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);

  let bg = "transparent";
  let color = past ? "#CBD5E1" : TEXT;
  let border = `1.5px solid ${past ? "#E8ECF0" : BORDER}`;
  let fontWeight = 500;

  if (isOn) { bg = ACCENT; color = "#fff"; border = `1.5px solid ${ACCENT}`; fontWeight = 700; }
  if (isExtra) { bg = EXTRA_COLOR; color = "#fff"; border = `1.5px solid ${EXTRA_COLOR}`; fontWeight = 700; }
  if (isCurrent && !isOn && !isExtra) { bg = "#DCFCE7"; color = GREEN; border = `2px solid ${GREEN}`; fontWeight = 700; }
  if (isCurrent && (isOn || isExtra)) { border = `2px solid ${GREEN}`; }

  return (
    <button
      onClick={onTap}
      onContextMenu={(e) => { e.preventDefault(); onLongPress(); }}
      style={{
        width: 36, height: 30, borderRadius: 7, background: bg, color, border,
        fontSize: 12, fontWeight, cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", transition: "all 0.15s", position: "relative",
        padding: 0, fontFamily: "inherit",
      }}
      title={`${formatWeekRange(weekStart)}${isExtra ? " (Extra)" : ""}`}
    >
      {dayNum}
    </button>
  );
}

export default function OnCallMockup() {
  const weeks = useMemo(() => getWeekStarts(2026), []);

  // Demo on-call weeks (roughly monthly, landing on Fridays)
  const [onCall, setOnCall] = useState(() => {
    const s = new Set();
    [
      new Date(2026, 0, 16), new Date(2026, 1, 13), new Date(2026, 2, 20),
      new Date(2026, 3, 17), new Date(2026, 4, 15), new Date(2026, 5, 12),
      new Date(2026, 6, 10), new Date(2026, 7, 7), new Date(2026, 8, 4),
      new Date(2026, 9, 2), new Date(2026, 10, 6), new Date(2026, 11, 4),
    ].forEach((d) => {
      while (d.getDay() !== 5) d.setDate(d.getDate() - 1);
      s.add(d.toISOString());
    });
    return s;
  });

  const [extras, setExtras] = useState(() => {
    const s = new Set();
    [new Date(2026, 1, 6), new Date(2026, 2, 6)].forEach((d) => {
      while (d.getDay() !== 5) d.setDate(d.getDate() - 1);
      s.add(d.toISOString());
    });
    return s;
  });

  // Demo incident counts per week
  const incidentCounts = useMemo(() => {
    const map = {};
    weeks.forEach((w) => {
      const key = w.toISOString();
      if (onCall.has(key) || extras.has(key)) {
        if (isPast(w)) map[key] = Math.floor(Math.random() * 6) + 1;
        else if (isCurrentWeek(w)) map[key] = 4;
        else map[key] = 0;
      }
    });
    return map;
  }, []);

  const toggle = (key) => {
    setOnCall((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else { next.add(key); setExtras((p) => { const n = new Set(p); n.delete(key); return n; }); }
      return next;
    });
  };

  const toggleExtra = (key) => {
    setExtras((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else { next.add(key); setOnCall((p) => { const n = new Set(p); n.delete(key); return n; }); }
      return next;
    });
  };

  // Group weeks by month
  const months = useMemo(() => {
    const m = {};
    weeks.forEach((w) => {
      const key = w.getMonth();
      if (!m[key]) m[key] = { label: w.toLocaleDateString("en-IE", { month: "short" }).toUpperCase(), weeks: [] };
      m[key].weeks.push(w);
    });
    return Object.values(m);
  }, [weeks]);

  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [view, setView] = useState("callouts"); // 'callouts' main view

  // Build past on-call weeks list (with incident counts)
  const pastOnCall = weeks
    .filter((w) => isPast(w) && (onCall.has(w.toISOString()) || extras.has(w.toISOString())))
    .reverse();

  const upcomingOnCall = weeks.filter(
    (w) => !isPast(w) && !isCurrentWeek(w) && (onCall.has(w.toISOString()) || extras.has(w.toISOString()))
  );

  const currentOnCall = weeks.find(
    (w) => isCurrentWeek(w) && (onCall.has(w.toISOString()) || extras.has(w.toISOString()))
  );

  const totalIncidents = Object.values(incidentCounts).reduce((a, b) => a + b, 0);
  const totalOnCallWeeks = onCall.size + extras.size;
  const pastWeeksCount = pastOnCall.length;

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", background: BG, minHeight: "100vh", fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif' }}>
      {/* Nav tabs — same as Rian */}
      <div style={{ display: "flex", background: "#2D3748", padding: "0", position: "sticky", top: 0, zIndex: 10 }}>
        {["TIMESHEET", "NOTES", "FINDER", "AI"].map((t) => (
          <div key={t} style={{ flex: 1, textAlign: "center", padding: "12px 0", fontSize: 11, fontWeight: 700, color: t === "TIMESHEET" ? "#fff" : "rgba(255,255,255,0.5)", letterSpacing: 0.5 }}>
            {t}
          </div>
        ))}
      </div>

      {/* Callouts section header */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 8px", gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: TEXT, flex: 1 }}>Callouts</span>
        <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          + On-Call Week
        </button>
      </div>

      {/* ── On-Call Schedule ── */}
      <div style={{ margin: "0 14px 10px", background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div
          onClick={() => setScheduleOpen(!scheduleOpen)}
          style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 9, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>On-Call Schedule 2026</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>
              {totalOnCallWeeks} weeks · {totalIncidents} incidents
              {extras.size > 0 && <span style={{ color: EXTRA_COLOR, fontWeight: 600 }}> · {extras.size} extra</span>}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.5"
            style={{ transition: "transform 0.2s", transform: scheduleOpen ? "rotate(90deg)" : "rotate(0)" }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {scheduleOpen && (
          <div style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 12px 14px" }}>
            {/* Legend */}
            <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 10, color: MUTED, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: ACCENT }} /> On-Call
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: EXTRA_COLOR }} /> Extra
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, border: `2px solid ${GREEN}` }} /> Now
              </span>
            </div>

            {/* Month grid — each row is a month label + week cells */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {months.map((month) => (
                <div key={month.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 32, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.3, flexShrink: 0 }}>
                    {month.label}
                  </div>
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {month.weeks.map((w) => {
                      const key = w.toISOString();
                      return (
                        <WeekCell
                          key={key}
                          weekStart={w}
                          isOn={onCall.has(key)}
                          isExtra={extras.has(key)}
                          isCurrent={isCurrentWeek(w)}
                          past={isPast(w)}
                          onTap={() => toggle(key)}
                          onLongPress={() => toggleExtra(key)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8, fontSize: 10, color: MUTED, fontStyle: "italic" }}>
              Tap = on-call · Long-press = extra shift
            </div>
          </div>
        )}
      </div>

      {/* ── Currently On-Call banner ── */}
      {currentOnCall && (
        <div style={{
          margin: "0 14px 8px", padding: "10px 14px", borderRadius: 10,
          background: `linear-gradient(135deg, ${ACCENT_LIGHT}, #DBEAFE)`,
          border: `1.5px solid ${ACCENT}40`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.5 }}>Currently On-Call</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{formatWeekRange(currentOnCall)}</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: ACCENT }}>{incidentCounts[currentOnCall.toISOString()] || 0}</div>
          <div style={{ fontSize: 10, color: MUTED, marginLeft: -6 }}>incidents</div>
        </div>
      )}

      {/* ── Week Cards (existing Rian style) ── */}
      <div style={{ padding: "0 14px" }}>
        {/* Current week card */}
        <div style={{
          background: CARD, borderRadius: 12, padding: "14px 16px", marginBottom: 8,
          border: `2px solid ${ACCENT}`, cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
                Currently On-Call
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>20 Mar – 26 Mar</div>
              <div style={{ fontSize: 12, color: MUTED }}>4 incidents</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>

        {/* Past week — on-call with incident count */}
        <div style={{
          background: CARD, borderRadius: 12, padding: "14px 16px", marginBottom: 8,
          border: `1px solid ${BORDER}`, cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>13 Feb – 19 Feb</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 12, color: MUTED }}>3 incidents</span>
                <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: ACCENT_LIGHT, color: ACCENT }}>ON-CALL</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>

        {/* Past week — extra shift */}
        <div style={{
          background: CARD, borderRadius: 12, padding: "14px 16px", marginBottom: 8,
          border: `1px solid ${BORDER}`, cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>6 Feb – 12 Feb</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 12, color: MUTED }}>5 incidents</span>
                <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: EXTRA_LIGHT, color: EXTRA_COLOR }}>EXTRA</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>

        {/* Past week — NOT on-call, no incidents (still accessible) */}
        <div style={{
          background: CARD, borderRadius: 12, padding: "14px 16px", marginBottom: 8,
          border: `1px solid ${BORDER}`, cursor: "pointer", opacity: 0.6,
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>30 Jan – 5 Feb</div>
              <div style={{ fontSize: 12, color: MUTED }}>0 incidents</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>
      </div>

      {/* ── Past On-Call History ── */}
      <div style={{ margin: "12px 14px 0" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, flex: 1 }}>
            On-Call History
          </span>
          <span style={{ fontSize: 11, color: MUTED }}>{pastWeeksCount} weeks · {totalIncidents} total incidents</span>
        </div>

        {/* Summary stats bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {[
            { label: "On-Call Weeks", value: totalOnCallWeeks, color: ACCENT, bg: ACCENT_LIGHT },
            { label: "Extra Shifts", value: extras.size, color: EXTRA_COLOR, bg: EXTRA_LIGHT },
            { label: "Total Incidents", value: totalIncidents, color: "#EF4444", bg: "#FEE2E2" },
            { label: "Avg / Week", value: pastWeeksCount ? (totalIncidents / pastWeeksCount).toFixed(1) : "–", color: "#8B5CF6", bg: "#EDE9FE" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: CARD, borderRadius: 10, padding: "10px 6px", textAlign: "center", border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: MUTED, fontWeight: 600, marginTop: 2, lineHeight: 1.2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Past on-call weeks as compact rows */}
        {pastOnCall.map((w) => {
          const key = w.toISOString();
          const isExtra = extras.has(key);
          const count = incidentCounts[key] || 0;
          return (
            <div
              key={key}
              style={{
                background: CARD, borderRadius: 10, padding: "10px 12px", marginBottom: 5,
                display: "flex", alignItems: "center", gap: 10,
                border: `1px solid ${BORDER}`, cursor: "pointer",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: isExtra ? EXTRA_LIGHT : ACCENT_LIGHT,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: isExtra ? EXTRA_COLOR : ACCENT,
              }}>
                {count}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{formatShortRange(w)}</div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>
                  {count} incident{count !== 1 ? "s" : ""}
                  {isExtra && <span style={{ color: EXTRA_COLOR, fontWeight: 600, marginLeft: 6 }}>Extra shift</span>}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          );
        })}
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}