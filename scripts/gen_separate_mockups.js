const fs = require('fs');
const path = require('path');

const sharedCss = `
  :root {
    --bg-page: #f8fafc;
    --bg-header: #0f172a;
    --bg-card: #ffffff;
    --bg-card-alt: #f1f5f9;
    --bg-input: #f8fafc;
    --bg-code-group: #e2e8f0;
    --bg-segment-active: #ffffff;
    --border: #e2e8f0;
    --border-input: #cbd5e1;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    --text-input: #0f172a;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --accent-rgb: 37, 99, 235;
    --shadow-rgb: 0, 0, 0;
    --ot-color: #d97706;
    --ot-bg: #fef3c7;
    --amber-rgb: 217, 119, 6;
    --priority-high: #dc2626;
    --priority-high-bg: #fef2f2;
    --priority-high-border: #fecaca;
    --priority-low: #16a34a;
    --priority-low-bg: #f0fdf4;
    --font-mono: 'DM Mono', monospace;
    --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  [data-theme="dark"] {
    --bg-page: #0b1120;
    --bg-header: #070d18;
    --bg-card: #131d31;
    --bg-card-alt: #1a2742;
    --bg-input: #0e1726;
    --bg-code-group: #192338;
    --bg-segment-active: #223252;
    --border: #1e293b;
    --border-input: #293952;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --text-input: #f8fafc;
    --accent: #3b82f6;
    --accent-light: rgba(59, 130, 246, 0.15);
    --accent-rgb: 59, 130, 246;
    --shadow-rgb: 0, 0, 0;
    --ot-color: #f59e0b;
    --ot-bg: rgba(245, 158, 11, 0.15);
    --amber-rgb: 245, 158, 11;
    --priority-high: #ef4444;
    --priority-high-bg: rgba(239, 68, 68, 0.15);
    --priority-high-border: rgba(239, 68, 68, 0.3);
    --priority-low: #22c55e;
    --priority-low-bg: rgba(34, 197, 94, 0.15);
  }

  [data-theme="champagne"] {
    --bg-page: #fdfbf7;
    --bg-header: #2c2523;
    --bg-card: #ffffff;
    --bg-card-alt: #f5efe6;
    --bg-input: #faf6f0;
    --bg-code-group: #ede4d8;
    --bg-segment-active: #ffffff;
    --border: #e6dcce;
    --border-input: #d8cbba;
    --text-primary: #2c2523;
    --text-secondary: #635752;
    --text-muted: #9c8e87;
    --text-input: #2c2523;
    --accent: #b45309;
    --accent-light: #fef3c7;
    --accent-rgb: 180, 83, 9;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--font-sans);
    background: var(--bg-page);
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Top Navigation Bar */
  .nav-header {
    background: var(--bg-header);
    color: #fff;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-shrink: 0;
    z-index: 50;
  }
  .nav-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .nav-brand {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .nav-brand span {
    background: var(--accent);
    color: #fff;
    padding: 2px 7px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
  }
  .page-nav-links {
    display: flex;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 3px;
    gap: 3px;
  }
  .page-nav-link {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.7);
    padding: 6px 14px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    font-family: inherit;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .page-nav-link:hover { color: #fff; }
  .page-nav-link.active {
    background: #fff;
    color: #0f172a;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .theme-select {
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    outline: none;
  }
  .theme-select option {
    background: #1e293b;
    color: #fff;
  }

  /* Secondary Page Header (Unified Style across Secondary Pages) */
  .secondary-page-hdr {
    padding: 14px 22px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }
  .hist-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--bg-input);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .hist-icon-btn:hover {
    background: var(--bg-card);
    border-color: rgba(var(--accent-rgb), 0.45);
    color: var(--accent);
    box-shadow: 0 2px 8px rgba(var(--shadow-rgb), 0.08);
  }
  .secondary-page-title h1 {
    font-size: 18px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.15;
  }
  .secondary-page-title p {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 3px;
  }
  .secondary-page-action {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Main Workspace */
  .main-workspace {
    flex: 1;
    display: flex;
    height: calc(100vh - 120px);
    background: var(--bg-page);
    overflow: hidden;
  }

  .panel-left {
    width: 280px;
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }
  .panel-mid {
    width: 380px;
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }
  .panel-detail {
    flex: 1;
    background: var(--bg-card);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .panel-hdr {
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    background: var(--bg-card);
  }
  .panel-hdr-title {
    font-size: 13px;
    font-weight: 800;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .panel-hdr-badge {
    font-size: 11px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 12px;
    background: var(--accent-light);
    color: var(--accent);
  }
  .panel-hdr-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--accent-light);
    color: var(--accent);
    border: 1px solid transparent;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .panel-hdr-btn:hover {
    background: var(--accent);
    color: #fff;
  }

  .stats-2x2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px 14px;
    background: var(--bg-card-alt);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .stat-box {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
  }
  .stat-label {
    font-size: 10px;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 2px;
  }
  .stat-val {
    font-size: 16px;
    font-weight: 800;
    color: var(--text-primary);
  }
  .stat-note {
    font-size: 10px;
    color: var(--text-muted);
    margin-top: 1px;
  }

  .seg-bar {
    display: flex;
    background: var(--bg-code-group);
    border-radius: 12px;
    padding: 3px;
    gap: 2px;
    margin: 10px 14px 6px;
    flex-shrink: 0;
  }
  .seg-btn {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 700;
    padding: 5px 4px;
    border-radius: 9px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    text-align: center;
  }
  .seg-btn.active {
    background: var(--bg-segment-active);
    color: var(--text-primary);
    box-shadow: 0 1px 3px rgba(var(--shadow-rgb), 0.1);
  }

  .search-wrap {
    position: relative;
    margin: 6px 14px 10px;
    flex-shrink: 0;
  }
  .search-input {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border-input);
    border-radius: 10px;
    padding: 7px 10px 7px 32px;
    font-size: 12px;
    color: var(--text-primary);
    outline: none;
    font-family: inherit;
  }
  .search-input:focus { border-color: var(--accent); }
  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }

  .scroll-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0 16px;
  }

  .list-sec-hdr {
    padding: 10px 14px 4px;
    font-size: 10px;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .item-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin: 2px 8px;
    border-radius: 10px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .item-card:hover { background: var(--bg-card-alt); }
  .item-card.selected {
    background: linear-gradient(to right, rgba(var(--accent-rgb), 0.12), rgba(var(--accent-rgb), 0.03));
    border-color: rgba(var(--accent-rgb), 0.25);
    border-left: 3px solid var(--accent);
  }

  .badge-pill {
    font-size: 10px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 6px;
  }
  .badge-blue { background: var(--accent-light); color: var(--accent); }
  .badge-amber { background: var(--ot-bg); color: var(--ot-color); }
  .badge-red { background: var(--priority-high-bg); color: var(--priority-high); }
  .badge-green { background: var(--priority-low-bg); color: var(--priority-low); }

  .detail-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-card);
    flex-shrink: 0;
  }
  .detail-head-left h2 {
    font-size: 17px;
    font-weight: 800;
    color: var(--text-primary);
  }
  .detail-head-left p {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }
  .detail-actions {
    display: flex;
    gap: 8px;
  }
  .btn-primary {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .btn-secondary {
    background: var(--bg-card-alt);
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .detail-body-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .summary-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .summary-card-title {
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
  }
  .cat-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .cat-table th {
    text-align: left;
    font-weight: 700;
    color: var(--text-muted);
    padding: 6px 8px;
    border-bottom: 1px solid var(--border);
  }
  .cat-table td {
    padding: 8px 8px;
    border-bottom: 1px solid var(--border);
    color: var(--text-primary);
  }
  .cat-table tr:last-child td { border-bottom: none; }
  .cat-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }
`;

// ==========================================
// 1. WEEK HISTORY MOCKUP
// ==========================================
const historyHtml = `<!DOCTYPE html>
<html lang="en" data-theme="codex">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rian — Week History (Desktop Redesign Mockup)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${sharedCss}
    .days-grid-7 {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .day-mini-card {
      background: var(--bg-card-alt);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      text-align: center;
    }
    .day-mini-name {
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .day-mini-date {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 2px 0 6px;
    }
    .day-mini-hrs {
      font-size: 15px;
      font-weight: 800;
      color: var(--accent);
      font-family: var(--font-mono);
    }
    .breakdown-bar-wrap {
      height: 10px;
      border-radius: 5px;
      background: var(--bg-card-alt);
      overflow: hidden;
      display: flex;
      margin-bottom: 14px;
    }
    .bar-seg { height: 100%; }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 16px;
    }
    .form-full { grid-column: 1 / -1; }
    .field-lbl {
      font-size: 10px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .field-input {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-input);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      color: var(--text-primary);
      font-family: inherit;
    }
    .notes-box {
      background: var(--bg-input);
      border: 1px solid var(--border-input);
      border-radius: 10px;
      padding: 12px 14px;
      min-height: 110px;
      font-size: 13px;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <!-- App Header -->
  <header class="nav-header">
    <div class="nav-left">
      <div class="nav-brand">RIAN <span>DESKTOP</span></div>
      <div class="page-nav-links">
        <a href="history_mockup.html" class="page-nav-link active">📅 Week History</a>
        <a href="callouts_mockup.html" class="page-nav-link">📞 Callouts</a>
      </div>
    </div>
    <div class="nav-right">
      <div style="display:flex;background:rgba(255,255,255,0.15);border-radius:8px;padding:2px">
        <button id="btn-opt1" onclick="setHistoryOption(1)" style="border:none;background:#fff;color:#0f172a;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;cursor:pointer">Option 1: 3-Panel</button>
        <button id="btn-opt2" onclick="setHistoryOption(2)" style="border:none;background:transparent;color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;cursor:pointer">Option 2: 2-Panel</button>
      </div>
      <select class="theme-select" onchange="document.documentElement.setAttribute('data-theme', this.value)">
        <option value="codex">Codex Light</option>
        <option value="dark">Dark Theme</option>
        <option value="champagne">Champagne</option>
      </select>
    </div>
  </header>

  <!-- Secondary Page Heading (Matches Callouts Page Header with Select Week icon on far right) -->
  <div class="secondary-page-hdr">
    <button class="hist-icon-btn" title="Back to Timesheet">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <div class="secondary-page-title">
      <h1>Week History</h1>
      <p>Search saved tasks and callouts, or select a week</p>
    </div>
    <div class="secondary-page-action">
      <button class="hist-icon-btn" title="Select Week Calendar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Main 3-Panel Workspace -->
  <div id="hist-workspace-opt1" class="main-workspace">
    <!-- Panel 1: Weeks List -->
    <div class="panel-left">
      <div class="stats-2x2">
        <div class="stat-box">
          <div class="stat-label">Weeks Worked</div>
          <div class="stat-val" style="color:var(--accent)">11</div>
          <div class="stat-note">in 2026</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Ordinary Hrs</div>
          <div class="stat-val" style="color:var(--accent)">412.5h</div>
          <div class="stat-note">avg 37.5h / wk</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">On-Call Shifts</div>
          <div class="stat-val" style="color:var(--ot-color)">3</div>
          <div class="stat-note">scheduled</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Callouts</div>
          <div class="stat-val" style="color:#818cf8">7</div>
          <div class="stat-note">incidents</div>
        </div>
      </div>

      <div class="seg-bar">
        <button class="seg-btn active">All</button>
        <button class="seg-btn">On-Call</button>
        <button class="seg-btn">With OT</button>
        <button class="seg-btn">Callouts</button>
      </div>

      <div class="search-wrap">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="search" class="search-input" placeholder="Search tasks, sites, notes...">
      </div>

      <div class="scroll-list">
        <div class="list-sec-hdr">This Week</div>
        <div class="item-card selected">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">06 Mar – 12 Mar 2026</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">14 tasks · 3 sites</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
            <span class="badge-pill badge-blue">37.5h</span>
            <span class="badge-pill badge-green">Active</span>
          </div>
        </div>

        <div class="list-sec-hdr">Upcoming</div>
        <div class="item-card">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">13 Mar – 19 Mar 2026</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">On-Call primary</div>
          </div>
          <span class="badge-pill badge-amber">On-Call</span>
        </div>

        <div class="list-sec-hdr">Previous Weeks</div>
        <div class="item-card">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">27 Feb – 05 Mar 2026</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">16 tasks · 4 sites</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
            <span class="badge-pill badge-blue">37.5h</span>
            <span class="badge-pill badge-amber">+4.0h OT</span>
          </div>
        </div>

        <div class="item-card">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">20 Feb – 26 Feb 2026</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">12 tasks · 3 callouts</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
            <span class="badge-pill badge-blue">37.5h</span>
            <span class="badge-pill badge-red">3 Callouts</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 2: Days & Activities for Selected Week -->
    <div class="panel-mid">
      <div class="panel-hdr">
        <div class="panel-hdr-title">
          <span>06 Mar – 12 Mar</span>
          <span class="panel-hdr-badge">14 Tasks</span>
        </div>
        <button class="panel-hdr-btn">Open Timesheet</button>
      </div>

      <div class="scroll-list">
        <div style="padding:10px 14px 6px;font-size:11px;font-weight:800;color:var(--text-muted);display:flex;justify-content:space-between">
          <span>FRIDAY 06 MAR</span>
          <span style="color:var(--accent)">7.5h</span>
        </div>
        <div class="item-card selected" style="flex-direction:column;align-items:stretch;gap:4px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;font-weight:700;color:var(--priority-high)">📍 Athlone Exchange</span>
            <span style="font-size:10px;font-weight:700;font-family:var(--font-mono);background:var(--bg-card-alt);padding:1px 5px;border-radius:4px">M101 · 7.5h</span>
          </div>
          <div style="font-size:13px;font-weight:700">Quarterly DC Power Plant & Battery Discharge Inspection</div>
          <div style="font-size:11px;color:var(--text-muted)">24-string battery check completed</div>
        </div>

        <div class="item-card" style="flex-direction:column;align-items:stretch;gap:4px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;font-weight:700;color:var(--priority-high)">📍 Athlone Exchange</span>
            <span style="font-size:10px;font-weight:700;font-family:var(--font-mono);background:var(--bg-card-alt);padding:1px 5px;border-radius:4px">F204 · 2.0h OT</span>
          </div>
          <div style="font-size:13px;font-weight:700">High Temperature Fan Failure Alarm Investigation</div>
          <div style="font-size:11px;color:var(--text-muted)">Replaced extraction contactor</div>
        </div>

        <div style="padding:10px 14px 6px;font-size:11px;font-weight:800;color:var(--text-muted);display:flex;justify-content:space-between;margin-top:6px">
          <span>MONDAY 09 MAR</span>
          <span style="color:var(--accent)">7.5h</span>
        </div>
        <div class="item-card" style="flex-direction:column;align-items:stretch;gap:4px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;font-weight:700;color:var(--priority-high)">📍 Moate Exchange</span>
            <span style="font-size:10px;font-weight:700;font-family:var(--font-mono);background:var(--bg-card-alt);padding:1px 5px;border-radius:4px">R102 · 7.5h</span>
          </div>
          <div style="font-size:13px;font-weight:700">Routine AC Maintenance & Filter Replacement</div>
          <div style="font-size:11px;color:var(--text-muted)">Main Hall unit A & B cleaned</div>
        </div>
      </div>
    </div>

    <!-- Panel 3: Activity & Weekly Inspection -->
    <div class="panel-detail">
      <div class="detail-head">
        <div class="detail-head-left">
          <h2>Task Details: Quarterly DC Power Plant Inspection</h2>
          <p>Athlone Exchange · Friday 06 Mar 2026</p>
        </div>
        <div class="detail-actions">
          <button class="btn-secondary">Export Week</button>
          <button class="btn-primary">Open in Timesheet</button>
        </div>
      </div>

      <div class="detail-body-scroll">
        <!-- 7 Day Strip -->
        <div class="days-grid-7">
          <div class="day-mini-card" style="border-color:var(--accent);background:var(--accent-light)">
            <div class="day-mini-name" style="color:var(--accent)">Fri</div>
            <div class="day-mini-date">06 Mar</div>
            <div class="day-mini-hrs">7.5h</div>
          </div>
          <div class="day-mini-card">
            <div class="day-mini-name">Sat</div>
            <div class="day-mini-date">07 Mar</div>
            <div class="day-mini-hrs" style="color:var(--text-muted)">0.0h</div>
          </div>
          <div class="day-mini-card">
            <div class="day-mini-name">Sun</div>
            <div class="day-mini-date">08 Mar</div>
            <div class="day-mini-hrs" style="color:var(--text-muted)">0.0h</div>
          </div>
          <div class="day-mini-card">
            <div class="day-mini-name">Mon</div>
            <div class="day-mini-date">09 Mar</div>
            <div class="day-mini-hrs">7.5h</div>
          </div>
          <div class="day-mini-card">
            <div class="day-mini-name">Tue</div>
            <div class="day-mini-date">10 Mar</div>
            <div class="day-mini-hrs">7.5h</div>
          </div>
          <div class="day-mini-card">
            <div class="day-mini-name">Wed</div>
            <div class="day-mini-date">11 Mar</div>
            <div class="day-mini-hrs">7.5h</div>
          </div>
          <div class="day-mini-card">
            <div class="day-mini-name">Thu</div>
            <div class="day-mini-date">12 Mar</div>
            <div class="day-mini-hrs">7.5h</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-card-title">Activity Information</div>
          <div class="form-grid-2">
            <div>
              <div class="field-lbl">Location</div>
              <input class="field-input" readonly value="Athlone Exchange">
            </div>
            <div>
              <div class="field-lbl">Date</div>
              <input class="field-input" readonly value="Friday 06 Mar 2026">
            </div>
            <div class="form-full">
              <div class="field-lbl">Description</div>
              <input class="field-input" readonly value="Quarterly DC Power Plant & Battery Discharge Inspection">
            </div>
            <div>
              <div class="field-lbl">Work Code</div>
              <input class="field-input" style="font-family:var(--font-mono);font-weight:700" readonly value="M101 (Power Systems)">
            </div>
            <div>
              <div class="field-lbl">Hours</div>
              <input class="field-input" style="font-family:var(--font-mono);font-weight:700;color:var(--accent)" readonly value="7.5h Ordinary + 0.0h OT">
            </div>
            <div class="form-full">
              <div class="field-lbl">Notes Log (TipTap Rich Text)</div>
              <div class="notes-box">
                <p>• Rectifier modules 1 through 4 load sharing balanced within 2% tolerance.</p>
                <p>• Float voltage verified at 54.2V across string A and string B.</p>
                <p>• Cell impedance check completed on 24x 2V SBS cells. All within baseline.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-card-title">Weekly Category Breakdown</div>
          <div class="breakdown-bar-wrap">
            <div class="bar-seg" style="width: 45%; background: var(--accent);"></div>
            <div class="bar-seg" style="width: 30%; background: #10b981;"></div>
            <div class="bar-seg" style="width: 15%; background: #f59e0b;"></div>
            <div class="bar-seg" style="width: 10%; background: #8b5cf6;"></div>
          </div>
          <table class="cat-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align:right">Ord</th>
                <th style="text-align:right">OT</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="cat-dot" style="background:var(--accent)"></span>M101 DC Power Systems</td>
                <td style="text-align:right;font-family:var(--font-mono)">15.0h</td>
                <td style="text-align:right;font-family:var(--font-mono)">2.0h</td>
                <td style="text-align:right;font-weight:700;font-family:var(--font-mono)">17.0h</td>
              </tr>
              <tr>
                <td><span class="cat-dot" style="background:#10b981"></span>R102 Routine HVAC</td>
                <td style="text-align:right;font-family:var(--font-mono)">11.5h</td>
                <td style="text-align:right;font-family:var(--font-mono)">—</td>
                <td style="text-align:right;font-weight:700;font-family:var(--font-mono)">11.5h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    function setHistoryOption(opt) {
      if (opt === 1) {
        document.getElementById('btn-opt1').style.background = '#fff';
        document.getElementById('btn-opt1').style.color = '#0f172a';
        document.getElementById('btn-opt2').style.background = 'transparent';
        document.getElementById('btn-opt2').style.color = '#fff';
        document.querySelector('.panel-mid').style.display = 'flex';
      } else {
        document.getElementById('btn-opt2').style.background = '#fff';
        document.getElementById('btn-opt2').style.color = '#0f172a';
        document.getElementById('btn-opt1').style.background = 'transparent';
        document.getElementById('btn-opt1').style.color = '#fff';
        document.querySelector('.panel-mid').style.display = 'none';
      }
    }
  </script>
</body>
</html>`;

// ==========================================
// 2. CALLOUTS MOCKUP
// ==========================================
const calloutsHtml = `<!DOCTYPE html>
<html lang="en" data-theme="codex">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rian — Callouts Page (Desktop Modernization Mockup)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${sharedCss}
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 16px;
    }
    .form-full { grid-column: 1 / -1; }
    .field-lbl {
      font-size: 10px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .field-input {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-input);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      color: var(--text-primary);
      font-family: inherit;
      outline: none;
    }
    .field-input:focus { border-color: var(--accent); }
    .notes-box {
      background: var(--bg-input);
      border: 1px solid var(--border-input);
      border-radius: 10px;
      padding: 12px 14px;
      min-height: 120px;
      font-size: 13px;
      line-height: 1.5;
    }
    .idx-circle {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--accent-light);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .item-card.selected .idx-circle {
      background: var(--accent);
      color: #fff;
    }
  </style>
</head>
<body>

  <!-- App Header -->
  <header class="nav-header">
    <div class="nav-left">
      <div class="nav-brand">RIAN <span>DESKTOP</span></div>
      <div class="page-nav-links">
        <a href="history_mockup.html" class="page-nav-link">📅 Week History</a>
        <a href="callouts_mockup.html" class="page-nav-link active">📞 Callouts</a>
      </div>
    </div>
    <div class="nav-right">
      <select class="theme-select" onchange="document.documentElement.setAttribute('data-theme', this.value)">
        <option value="codex">Codex Light</option>
        <option value="dark">Dark Theme</option>
        <option value="champagne">Champagne</option>
      </select>
    </div>
  </header>

  <!-- Secondary Page Heading for Callouts -->
  <div class="secondary-page-hdr">
    <button class="hist-icon-btn" title="Back to Timesheet">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <div class="secondary-page-title">
      <h1>Callouts</h1>
      <p>On-call incident log and schedule</p>
    </div>
    <div class="secondary-page-action">
      <button class="hist-icon-btn" title="On-Call Schedule">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>
    </div>
  </div>

  <div class="main-workspace">
    <!-- Panel 1: On-Call Weeks & Stats -->
    <div class="panel-left">
      <div class="stats-2x2">
        <div class="stat-box">
          <div class="stat-label">On-Call Weeks</div>
          <div class="stat-val" style="color:var(--accent)">3</div>
          <div class="stat-note">scheduled</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Extra Shifts</div>
          <div class="stat-val" style="color:var(--ot-color)">1</div>
          <div class="stat-note">cover shift</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Incidents</div>
          <div class="stat-val" style="color:var(--text-primary)">7</div>
          <div class="stat-note">in 2026</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Avg / Week</div>
          <div class="stat-val" style="color:#818cf8">2.3</div>
          <div class="stat-note">incidents / wk</div>
        </div>
      </div>

      <div class="scroll-list">
        <div class="list-sec-hdr">Current Week</div>
        <div class="item-card selected">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">06 Mar – 12 Mar 2026</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">2 incidents logged</div>
          </div>
          <span class="badge-pill badge-red">2 Incidents</span>
        </div>

        <div class="list-sec-hdr">Upcoming Scheduled</div>
        <div class="item-card">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">13 Mar – 19 Mar 2026</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">On-Call Primary</div>
          </div>
          <span class="badge-pill badge-amber">On-Call</span>
        </div>

        <div class="list-sec-hdr">Previous Callouts</div>
        <div class="item-card">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">20 Feb – 26 Feb 2026</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">3 incidents logged</div>
          </div>
          <span class="badge-pill badge-red">3 Incidents</span>
        </div>

        <div class="item-card">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">06 Feb – 12 Feb 2026</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">2 incidents · Extra shift</div>
          </div>
          <span class="badge-pill badge-amber">Extra (2)</span>
        </div>
      </div>
    </div>

    <!-- Panel 2: Incident List for Selected Week -->
    <div class="panel-mid">
      <div class="panel-hdr">
        <div class="panel-hdr-title">
          <span>06 Mar – 12 Mar</span>
          <span class="panel-hdr-badge">2 Callouts</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="panel-hdr-btn" style="background:var(--accent);color:#fff">+ Add</button>
          <button class="panel-hdr-btn">Paste</button>
        </div>
      </div>

      <div class="scroll-list">
        <div class="list-sec-hdr">Friday 06 Mar 2026</div>
        <div class="item-card selected">
          <div class="idx-circle">1</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">EXTERNAL ALARM: AC MAINS FAIL</div>
            <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;margin-top:3px">
              <span style="color:var(--priority-high);font-weight:600">📍 Athlone</span>
              <span style="font-family:var(--font-mono);background:var(--bg-card-alt);padding:1px 5px;border-radius:4px">R23901182</span>
            </div>
          </div>
        </div>

        <div class="list-sec-hdr">Sunday 08 Mar 2026</div>
        <div class="item-card">
          <div class="idx-circle">2</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">HIGH TEMP STAGE 2 ALARM: 34°C</div>
            <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;margin-top:3px">
              <span style="color:var(--priority-high);font-weight:600">📍 Moate</span>
              <span style="font-family:var(--font-mono);background:var(--bg-card-alt);padding:1px 5px;border-radius:4px">R23901450</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 3: Incident Editor & Console -->
    <div class="panel-detail">
      <div class="detail-head">
        <div class="detail-head-left">
          <h2>Callout #1: EXTERNAL ALARM: AC MAINS FAIL</h2>
          <p>Athlone Exchange · Friday 06 Mar 2026 · Remedy Ticket R23901182</p>
        </div>
        <div class="detail-actions">
          <button class="btn-secondary">Copy Ticket</button>
          <button class="btn-primary" style="background:var(--priority-low)">Saved</button>
        </div>
      </div>

      <div class="detail-body-scroll">
        <div class="summary-card">
          <div class="summary-card-title">Incident Details & Form</div>
          <div class="form-grid-2">
            <div>
              <div class="field-lbl">Date of Callout</div>
              <input type="date" class="field-input" value="2026-03-06">
            </div>
            <div>
              <div class="field-lbl">Ticket Number</div>
              <input class="field-input" style="font-family:var(--font-mono)" value="R23901182">
            </div>
            <div class="form-full">
              <div class="field-lbl">Location / Exchange</div>
              <div style="display:flex;gap:8px">
                <input class="field-input" style="flex:1" value="Athlone Exchange">
                <button class="btn-secondary">Map</button>
              </div>
            </div>
            <div class="form-full">
              <div class="field-lbl">Fault Description</div>
              <input class="field-input" value="EXTERNAL ALARM: AC MAINS FAIL">
            </div>
            <div>
              <div class="field-lbl">Engineer On Site</div>
              <input class="field-input" value="Mark Owens (Primary)">
            </div>
            <div>
              <div class="field-lbl">Times</div>
              <input class="field-input" value="21:40 Arrived · 23:15 Cleared">
            </div>
            <div class="form-full">
              <div class="field-lbl">Actions Taken (Rich TipTap Log)</div>
              <div class="notes-box">
                <p><strong>NOC Dispatch Note:</strong> Mains power failed following ESB local feeder trip.</p>
                <p style="margin-top:6px">1. Arrived on site at 21:40. Verified standby diesel generator operating at 50.1Hz.</p>
                <p>2. ESB restored grid supply at 22:50. ATS auto-transferred back to mains smoothly.</p>
                <p>3. Reset alarm contacts and handed back clear to NOC at 23:15.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'history_mockup.html'), historyHtml, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'callouts_mockup.html'), calloutsHtml, 'utf8');
console.log('Successfully updated history_mockup.html and callouts_mockup.html');
