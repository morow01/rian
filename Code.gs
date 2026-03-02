// ============================================================
// TimeSheet App — Google Apps Script Backend
// Paste this entire file into script.google.com
// ============================================================

const SPREADSHEET_NAME = 'TimeSheet App Data';
const TIMESHEETS_SHEET = 'TimeSheets';
const NOTES_SHEET      = 'Notes';

// ============================================================
// HTTP Handlers
// ============================================================

function doGet(e) {
  if (!e || !e.parameter) return ok({ error: 'no params' });
  const action = e.parameter.action;
  try {
    switch (action) {
      case 'ping':     return ok({ status: 'ok', time: new Date().toISOString() });
      case 'getCodes': return ok(WORK_CODES);
      case 'getWeek':  return ok(getWeek(e.parameter.date));
      case 'getWeeks': return ok(getWeeks());
      case 'getNotes': return ok(getNotes());
      default:         return ok({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return ok({ error: err.toString() });
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);

  switch (body.action) {
    case 'saveWeek':    return ok(saveWeek(body.weekStart, body.weekData));
    case 'saveNotes':   return ok(saveNotes(body.notes, body._updatedAt));
    case 'emailWeekly':
      MailApp.sendEmail(body.to, body.subject, body.body, { htmlBody: body.htmlBody });
      return ok({ ok: true });
    default:
      return ok({ error: 'Unknown action: ' + body.action });
  }
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Spreadsheet helpers
// ============================================================

function getOrCreateSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty('SPREADSHEET_ID');

  if (ssId) {
    try { return SpreadsheetApp.openById(ssId); } catch (e) { /* stale ID */ }
  }

  const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  props.setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('Created new spreadsheet: ' + ss.getUrl());
  return ss;
}

function getSheet() {
  const ss = getOrCreateSpreadsheet();
  let sheet = ss.getSheetByName(TIMESHEETS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(TIMESHEETS_SHEET);
    const defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet) ss.deleteSheet(defaultSheet);
    sheet.appendRow(['week_start', 'data', 'last_updated']);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }

  return sheet;
}

function getNotesSheet() {
  const ss = getOrCreateSpreadsheet();
  let sheet = ss.getSheetByName(NOTES_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(NOTES_SHEET);
    sheet.appendRow(['data']);
    sheet.getRange(1, 1).setFontWeight('bold');
  }

  return sheet;
}

function toDateStr(val) {
  if (val instanceof Date) return Utilities.formatDate(val, 'UTC', 'yyyy-MM-dd');
  return String(val);
}

// ============================================================
// Timesheet data operations
// ============================================================

function getWeek(dateStr) {
  if (!dateStr) return null;
  const data = getSheet().getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (toDateStr(data[i][0]) === dateStr) {
      try { return JSON.parse(data[i][1]); } catch (e) { return null; }
    }
  }
  return null;
}

function saveWeek(weekStart, weekData) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  const json = JSON.stringify(weekData);

  for (let i = 1; i < data.length; i++) {
    if (toDateStr(data[i][0]) === weekStart) {
      sheet.getRange(i + 1, 2).setValue(json);
      sheet.getRange(i + 1, 3).setValue(now);
      return { success: true, action: 'updated', weekStart };
    }
  }

  sheet.appendRow([weekStart, json, now]);
  return { success: true, action: 'created', weekStart };
}

function getWeeks() {
  const data = getSheet().getDataRange().getValues();
  const weeks = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      weeks.push({ weekStart: toDateStr(data[i][0]), lastUpdated: data[i][2] });
    }
  }

  return weeks.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

// ============================================================
// Notes data operations
// ============================================================

function getNotes() {
  const sheet = getNotesSheet();
  if (sheet.getLastRow() < 2) return { notes: [], _updatedAt: 0 };

  const raw = sheet.getRange(2, 1).getValue();
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { notes: [], _updatedAt: 0 };
  }
}

function saveNotes(notes, updatedAt) {
  const sheet   = getNotesSheet();
  const payload = JSON.stringify({ notes: notes || [], _updatedAt: updatedAt || Date.now() });

  if (sheet.getLastRow() < 2) {
    sheet.appendRow([payload]);
  } else {
    sheet.getRange(2, 1).setValue(payload);
  }

  return { success: true, count: (notes || []).length };
}
