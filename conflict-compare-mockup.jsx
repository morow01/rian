import { useState } from "react";
import { Monitor, Cloud, Check, X, ArrowLeftRight, Plus, Minus, AlertCircle, ChevronLeft } from "lucide-react";

// ── Mock data for 4 conflict scenarios ───────────────────────────────────────
const SCENARIOS = {
  "only-local": {
    label: "Only in yours",
    hint: "Activity exists on your device but cloud has no entry.",
    local:  { description: "Maintenance + tests", location: "Substation B", codes: ["NT"], ordinary: 8, overtime: 0, notes: "Switchgear + IR scan, all within tolerance." },
    remote: null,
  },
  "only-cloud": {
    label: "Only in cloud",
    hint: "Activity exists in the cloud but not on your device.",
    local: null,
    remote: { description: "Emergency callout — panel 3B", location: "Customer site B", codes: ["CO"], ordinary: 4, overtime: 1, notes: "HV fault, 2h travel." },
  },
  "hours-changed": {
    label: "Hours changed",
    hint: "Same activity, different hours + location.",
    local:  { description: "Panel install + commissioning", location: "Customer site A", codes: ["NT"], ordinary: 8, overtime: 2, notes: "Ran late, 2h OT." },
    remote: { description: "Panel install + commissioning", location: "Customer site A", codes: ["NT"], ordinary: 6, overtime: 0, notes: "Ran late, 2h OT." },
  },
  "codes-desc": {
    label: "Codes + description",
    hint: "Same hours, different work code and description wording.",
    local:  { description: "Routine work at Site C",             location: "Site C", codes: ["NT"], ordinary: 8, overtime: 0, notes: "" },
    remote: { description: "Routine work at Site C — travel day", location: "Site C", codes: ["DT"], ordinary: 8, overtime: 0, notes: "Travel counted as DT." },
  },
};

const FIELDS = [
  { key: "description", label: "Description" },
  { key: "location",    label: "Location" },
  { key: "codes",       label: "Work codes" },
  { key: "ordinary",    label: "Ordinary hrs", isNum: true },
  { key: "overtime",    label: "Overtime hrs", isNum: true },
  { key: "notes",       label: "Notes" },
];

function fmt(v, isNum) {
  if (v == null || v === "") return null;
  if (Array.isArray(v)) return v.length ? v.join(", ") : null;
  if (isNum) return v + "h";
  return String(v);
}

function fieldStatus(local, remote, key) {
  if (!local && !remote) return "missing-both";
  if (!local)  return "only-remote";
  if (!remote) return "only-local";
  const lv = local[key];
  const rv = remote[key];
  const a = Array.isArray(lv) ? lv.join("|") : (lv ?? "");
  const b = Array.isArray(rv) ? rv.join("|") : (rv ?? "");
  if (String(a) === String(b)) return "same";
  if (!a && b) return "added-remote";   // cloud has it, you don't
  if (a && !b) return "removed-remote"; // you have it, cloud doesn't
  return "changed";
}

function StatusPill({ status }) {
  const map = {
    same:            { text: "Same",           cls: "bg-slate-100 text-slate-500 border-slate-200" },
    changed:         { text: "Changed",        cls: "bg-amber-50 text-amber-700 border-amber-200" },
    "only-local":    { text: "Only yours",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    "only-remote":   { text: "Only in cloud",  cls: "bg-rose-50 text-rose-700 border-rose-200" },
    "added-remote":  { text: "Added in cloud", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    "removed-remote":{ text: "Missing in cloud", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  };
  const m = map[status] || map.same;
  return <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${m.cls}`}>{m.text}</span>;
}

function ValueCell({ value, side, status }) {
  const isLocal = side === "local";
  const isEmpty = value == null;
  if (isEmpty) {
    return (
      <div className={`flex items-center gap-1.5 text-xs italic ${isLocal ? "text-emerald-600/60" : "text-rose-600/60"}`}>
        <Minus size={12} />
        <span>Not set</span>
      </div>
    );
  }
  // Highlight changed / only-side values
  const highlight =
    status === "changed" ||
    (side === "local"  && (status === "only-local"  || status === "removed-remote")) ||
    (side === "remote" && (status === "only-remote" || status === "added-remote"));
  const color = isLocal ? "emerald" : "rose";
  return (
    <div className={`text-sm leading-snug ${highlight ? `font-semibold text-${color}-800` : "text-slate-700"}`}>
      {value}
    </div>
  );
}

function SideHeader({ side, exists, meta }) {
  const isLocal = side === "local";
  const Icon = isLocal ? Monitor : Cloud;
  const label = isLocal ? "Your version" : "Cloud version";
  const color = isLocal ? "emerald" : "rose";
  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b ${isLocal ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}>
      <Icon size={14} className={`text-${color}-600`} />
      <span className={`text-xs font-bold text-${color}-700 uppercase tracking-wide flex-1`}>{label}</span>
      {!exists && (
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          Empty
        </span>
      )}
      {exists && meta && <span className="text-[10px] text-slate-500">{meta}</span>}
    </div>
  );
}

function ComparisonCard({ scenario }) {
  const s = SCENARIOS[scenario];
  const { local, remote } = s;
  const hasLocal = !!local;
  const hasRemote = !!remote;

  const changedCount = FIELDS.reduce((n, f) => {
    const st = fieldStatus(local, remote, f.key);
    return n + (st !== "same" && st !== "missing-both" ? 1 : 0);
  }, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top row: activity title + change count */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-white border border-slate-300 text-slate-600 text-sm font-bold flex items-center justify-center">1</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">
            Activity 1 — {(local?.description || remote?.description || "Untitled")}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {changedCount === 0 ? "No differences" : `${changedCount} field${changedCount > 1 ? "s" : ""} differ`}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {!hasLocal && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">Only in cloud</span>}
          {!hasRemote && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Only in yours</span>}
        </div>
      </div>

      {/* Two-column headers */}
      <div className="grid grid-cols-2 border-b border-slate-200">
        <SideHeader side="local"  exists={hasLocal}  meta="This device · today" />
        <div className="border-l border-slate-200">
          <SideHeader side="remote" exists={hasRemote} meta="Cloud · 2 days ago" />
        </div>
      </div>

      {/* Field rows */}
      <div>
        {FIELDS.map((f) => {
          const status = fieldStatus(local, remote, f.key);
          if (status === "missing-both") return null;
          const lv = local  ? fmt(local[f.key],  f.isNum) : null;
          const rv = remote ? fmt(remote[f.key], f.isNum) : null;
          // Hide rows where both sides are empty (for fields like "notes")
          if (lv == null && rv == null) return null;
          return (
            <div key={f.key} className="border-b border-slate-100 last:border-b-0">
              {/* Label + status pill */}
              <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.label}</span>
                <StatusPill status={status} />
              </div>
              {/* Two-column values */}
              <div className="grid grid-cols-2">
                <div className={`px-4 py-2.5 ${status !== "same" && lv != null ? "bg-emerald-50/30" : ""}`}>
                  <ValueCell value={lv} side="local" status={status} />
                </div>
                <div className={`px-4 py-2.5 border-l border-slate-100 ${status !== "same" && rv != null ? "bg-rose-50/30" : ""}`}>
                  <ValueCell value={rv} side="remote" status={status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick summary strip */}
      {(!hasLocal || !hasRemote) && (
        <div className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-t ${!hasRemote ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}>
          <AlertCircle size={14} />
          {!hasRemote
            ? "This activity was saved on your device but never reached the cloud. Keeping yours will upload it."
            : "This activity is on another device but missing from yours. Use cloud will download it here."}
        </div>
      )}
    </div>
  );
}

export default function ConflictCompareMockup() {
  const [scenario, setScenario] = useState("only-local");
  const s = SCENARIOS[scenario];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Scenario picker */}
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Test scenario</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SCENARIOS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setScenario(k)}
                className={`text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  scenario === k
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-2">{s.hint}</div>
        </div>

        {/* Modal shell */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Modal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
            <button className="p-1 -ml-1 text-slate-400 hover:text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                Activity 1 — {(s.local?.description || s.remote?.description || "Untitled")}
              </div>
              <div className="text-[11px] text-slate-500">Side-by-side comparison</div>
            </div>
            <button className="p-1 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          {/* Comparison card */}
          <div className="p-4 bg-slate-50">
            <ComparisonCard scenario={scenario} />
          </div>

          {/* Action bar */}
          <div className="grid grid-cols-3 gap-2 px-4 py-3 border-t border-slate-200 bg-white">
            <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50">
              <X size={14} /> Later
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 border-rose-400 text-rose-700 text-sm font-semibold hover:bg-rose-50">
              <Cloud size={14} /> Use Cloud
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              <Check size={14} /> Keep Mine
            </button>
          </div>
        </div>

        {/* Explainer */}
        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-600 leading-relaxed">
          <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <ArrowLeftRight size={14} /> What&apos;s different about this layout
          </div>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Both sides are <b>always visible</b> — no hidden tabs. If one side is empty, you see it's empty.</li>
            <li>Every field gets its own row with a <b>status pill</b> (Same / Changed / Only yours / Only in cloud).</li>
            <li>Empty values show <i>&quot;Not set&quot;</i> in muted text instead of just disappearing.</li>
            <li>Changed fields get a subtle tinted background; unchanged fields stay neutral so the diff pops.</li>
            <li>A bottom strip explains the consequence in plain English when one whole side is missing.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
