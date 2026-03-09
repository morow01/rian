import { useState } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #F0F0ED;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  }

  .card {
    background: #FFFFFF;
    border-radius: 20px;
    width: 340px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08);
    overflow: hidden;
  }

  /* Header */
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 20px;
    border-bottom: 1px solid #F0F0ED;
  }

  .card-index {
    width: 28px;
    height: 28px;
    background: #1A1A1A;
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .card-title-group {
    flex: 1;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #1A1A1A;
    line-height: 1.2;
  }

  .card-subtitle {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #8A8A88;
    margin-top: 2px;
  }

  .card-subtitle svg {
    color: #F04E3E;
  }

  .card-hours-badge {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: #1A1A1A;
    background: #F5F5F3;
    padding: 4px 10px;
    border-radius: 8px;
  }

  .toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #BBBBB8;
    padding: 2px;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }

  .toggle-btn:hover { color: #1A1A1A; }

  /* Body */
  .card-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Field */
  .field-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #BBBBB8;
    margin-bottom: 6px;
  }

  .field-input {
    width: 100%;
    border: 1.5px solid #EBEBEA;
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1A1A1A;
    outline: none;
    transition: border-color 0.15s;
    background: #FAFAFA;
  }

  .field-input:focus {
    border-color: #1A1A1A;
    background: #fff;
  }

  /* Work codes */
  .codes-area {
    background: #F8F8F6;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .code-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: white;
    border: 1.5px solid #EBEBEA;
    border-radius: 7px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    color: #1A1A1A;
  }

  .code-chip-ref {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #8A8A88;
    font-weight: 400;
  }

  .chip-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: #BBBBB8;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    transition: color 0.15s;
    display: flex;
    align-items: center;
  }

  .chip-remove:hover { color: #F04E3E; }

  .add-code-btn {
    background: none;
    border: 1.5px dashed #D0D0CE;
    border-radius: 7px;
    padding: 4px 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #8A8A88;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .add-code-btn:hover {
    border-color: #1A1A1A;
    color: #1A1A1A;
  }

  /* Hours row */
  .hours-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .hours-block { display: flex; flex-direction: column; }

  .stepper {
    display: flex;
    align-items: center;
    gap: 0;
    background: #F5F5F3;
    border-radius: 10px;
    overflow: hidden;
    height: 40px;
  }

  .stepper.overtime {
    background: #FFF8F0;
    outline: 1.5px solid #FFD88A;
  }

  .stepper-btn {
    background: none;
    border: none;
    cursor: pointer;
    width: 38px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8A8A88;
    font-size: 16px;
    font-weight: 300;
    transition: all 0.12s;
    flex-shrink: 0;
    user-select: none;
  }

  .stepper-btn:hover { color: #1A1A1A; background: rgba(0,0,0,0.04); }
  .stepper-btn:active { transform: scale(0.9); }

  .stepper.overtime .stepper-btn:hover { color: #C27A00; }

  .stepper-val {
    flex: 1;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    color: #1A1A1A;
    line-height: 1;
  }

  .stepper.overtime .stepper-val { color: #C27A00; }

  .overtime-dot {
    width: 5px;
    height: 5px;
    background: #F5A623;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
    margin-bottom: 1px;
  }

  /* Stats strip */
  .stats-strip {
    display: flex;
    gap: 0;
    border: 1.5px solid #EBEBEA;
    border-radius: 10px;
    overflow: hidden;
  }

  .stat-item {
    flex: 1;
    padding: 8px 12px;
    text-align: center;
    border-right: 1.5px solid #EBEBEA;
  }

  .stat-item:last-child { border-right: none; }

  .stat-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #BBBBB8;
    margin-bottom: 3px;
  }

  .stat-val {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: #1A1A1A;
  }

  .stat-val.muted { color: #D0D0CE; }

  /* Notes */
  .notes-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: 1.5px solid #EBEBEA;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .notes-row:hover { border-color: #1A1A1A; }

  .notes-placeholder {
    font-size: 13px;
    color: #BBBBB8;
    flex: 1;
  }

  /* Footer */
  .card-footer {
    padding: 0 20px 20px;
  }

  .delete-btn {
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #D0D0CE;
    padding: 10px;
    border-radius: 10px;
    transition: all 0.15s;
  }

  .delete-btn:hover {
    color: #F04E3E;
    background: #FFF5F4;
  }
`;

export default function TaskCard() {
  const [ordinaryHrs, setOrdinaryHrs] = useState(2);
  const [overtimeHrs, setOvertimeHrs] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const clamp = (val, min = 0, max = 24) => Math.max(min, Math.min(max, val));

  return (
    <>
      <style>{style}</style>
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="card-index">1</div>
          <div className="card-title-group">
            <div className="card-title">General Admin</div>
            <div className="card-subtitle">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <path d="M5 0C3.07 0 1.5 1.57 1.5 3.5c0 2.63 3.5 8.5 3.5 8.5s3.5-5.87 3.5-8.5C8.5 1.57 6.93 0 5 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" fill="currentColor"/>
              </svg>
              Naas (NAS)
            </div>
          </div>
          <div className="card-hours-badge">{ordinaryHrs + overtimeHrs}h</div>
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d={collapsed ? "M3 5l4 4 4-4" : "M3 9l4-4 4 4"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        {!collapsed && (
          <>
            <div className="card-body">
              {/* Description */}
              <div>
                <div className="field-label">Description</div>
                <input className="field-input" defaultValue="General Admin" />
              </div>

              {/* Location */}
              <div>
                <div className="field-label">Location</div>
                <input className="field-input" defaultValue="Naas (NAS)" />
              </div>

              {/* Work Codes */}
              <div>
                <div className="field-label">Work Codes</div>
                <div className="codes-area">
                  <div className="code-chip">
                    General Admin COps FE
                    <span className="code-chip-ref">WWO0001A99</span>
                    <button className="chip-remove">×</button>
                  </div>
                  <button className="add-code-btn">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Code
                  </button>
                </div>
              </div>

              {/* Hours */}
              <div className="hours-row">
                <div className="hours-block">
                  <div className="field-label">Ordinary Hrs</div>
                  <div className="stepper">
                    <button className="stepper-btn" onClick={() => setOrdinaryHrs(v => clamp(v - 1))}>−</button>
                    <div className="stepper-val">{ordinaryHrs}</div>
                    <button className="stepper-btn" onClick={() => setOrdinaryHrs(v => clamp(v + 1))}>+</button>
                  </div>
                </div>
                <div className="hours-block">
                  <div className="field-label">
                    <span className="overtime-dot" />
                    Overtime Hrs
                  </div>
                  <div className="stepper overtime">
                    <button className="stepper-btn" onClick={() => setOvertimeHrs(v => clamp(v - 1))}>−</button>
                    <div className="stepper-val">{overtimeHrs}</div>
                    <button className="stepper-btn" onClick={() => setOvertimeHrs(v => clamp(v + 1))}>+</button>
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="stats-strip">
                <div className="stat-item">
                  <div className="stat-label">Tasks</div>
                  <div className="stat-val">1</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Hrs/Task</div>
                  <div className="stat-val">{(ordinaryHrs).toFixed(2)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">OT/Task</div>
                  <div className={`stat-val ${overtimeHrs === 0 ? 'muted' : ''}`}>
                    {overtimeHrs === 0 ? '—' : overtimeHrs.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="notes-row">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 10.5L3.5 9H11V1H2v9.5z" stroke="#BBBBB8" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M4 4.5h5M4 6.5h3" stroke="#BBBBB8" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className="notes-placeholder">Add a note…</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 3l3 3-3 3" stroke="#D0D0CE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer">
              <button className="delete-btn">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 3.5h9M4.5 3.5V2.5h4v1M5 6v3.5M8 6v3.5M3 3.5l.5 7h6l.5-7H3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete task
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
