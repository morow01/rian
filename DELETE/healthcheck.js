/**
 * Rian App Health Check — paste into DevTools console on localhost:3000/app
 * Run before every push to catch missing elements or broken functions.
 */
const ELEMENTS = [
  'note-voice-confirm-modal', 'voice-confirm-modal', 'voice-listen-modal',
  'ai-fault-modal', 'remind-modal', 'rian-dialog-overlay', 'note-fs-modal',
  'nvc-heard-text', 'nvc-desc', 'nvc-loc', 'nvc-date-display',
  'nvc-priority-dots', 'nvc-category-chips', 'nvc-reminder-wrap',
  'tt-cell-popup', 'tt-cell-trigger',
  'tt-link-bubble', 'tt-link-bubble-input',
  'tt-link-bbl-confirm', 'tt-link-bbl-open', 'tt-link-bbl-remove',
  'note-voice-fab', 'voice-fab',
];

const FUNCTIONS = [
  'startNoteVoice', 'startVoiceEntry', 'cancelVoice',
  'confirmNoteVoice', 'showNoteVoiceConfirm',
  'renderNvcPriorityChips', 'renderNvcCategoryChips', 'renderNvcReminderField',
  'setNvcPriority', 'setNvcCategory',
  'openFieldNoteFullscreen', 'closeNoteFullscreen', 'openNoteFullscreen',
  'startFsDictation',
  '_ttCellAct', '_ttToggleCellPopup', '_ttUpdateLinkBubble',
  'scheduleNotesSave', 'fsSetNotes',
  'showRianDialog', 'showToast', 'render',
  'deleteNote', 'permanentDeleteNote', 'emptyBin',
  '_purgeRemindersForNote', 'fireReminder', 'checkMissedReminders',
  'scheduleReminderTimer',
];

const missingEl = ELEMENTS.filter(id => !document.getElementById(id));
// Use eval to check closure-scoped functions (not just window-level)
const missingFn = FUNCTIONS.filter(f => {
  try { return typeof eval(f) !== 'function'; } catch(e) { return true; }
});

if (missingEl.length === 0 && missingFn.length === 0) {
  console.log('%c✅ Health check PASSED — all elements and functions present', 'color:green;font-weight:bold');
} else {
  if (missingEl.length) console.error('❌ Missing elements:', missingEl);
  if (missingFn.length) console.error('❌ Missing functions:', missingFn);
}
