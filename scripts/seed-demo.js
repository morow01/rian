// Seed demo data for rianfieldlog@gmail.com
// Run: node scripts/seed-demo.js

const admin = require('firebase-admin');
const serviceAccount = require('./eir-fieldlog-firebase-adminsdk-fbsvc-63e1079fd2.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const UID = 'UXZIDzLCQEU3EVKXjW6NK4FPKuz1';

function uid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

// Get Monday of a week offset by N weeks from today
function weekStart(offsetWeeks = 0) {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff + offsetWeeks * 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function dayDates(ws) {
  const dates = [];
  const base = new Date(ws + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function act(desc, location, code, ordinary, overtime = 0, notes = '') {
  return {
    id: uid(),
    description: desc,
    location,
    codes: code ? [{ c: code }] : [],
    ordinary: String(ordinary),
    overtime: String(overtime),
    notes,
    _updatedAt: Date.now()
  };
}

function buildWeek(ws, daysData) {
  const dates = dayDates(ws);
  const days = dates.map((date, i) => ({
    date,
    activities: daysData[i] || []
  }));
  return {
    weekStart: ws,
    days,
    _updatedAt: Date.now()
  };
}

async function seedWeeks() {
  const thisWeek = weekStart(0);
  const lastWeek = weekStart(-1);

  // ── Last week ──
  const lw = buildWeek(lastWeek, {
    0: [ // Monday
      act('Routine inspection — Portlaoise Exchange', 'Portlaoise (PGS)', 'RT', 8),
    ],
    1: [ // Tuesday
      act('Fault repair — cable damage on external plant', 'Tullow (TLWA)', 'FLT', 4, 2, 'Customer reported no service since Sunday. Found damaged duct on Main St. Repaired and tested — service restored.'),
      act('Routine visit — frame walk', 'Carlow (CRWA)', 'RT', 3),
    ],
    2: [ // Wednesday
      act('Fault — PSU alarm active on MDF', 'Portarlington (PANA)', 'FLT', 3, 1),
      act('Routine inspection', 'Mountmellick (MMKA)', 'RT', 4),
    ],
    3: [ // Thursday
      act('Generator battery test', 'Killeigh (KEHB)', 'PM', 3),
      act('Routine visit — general inspection', 'Geashill (GHLB)', 'RT', 2),
      act('Callout follow-up — rectifier swap', 'Daingean (DGNB)', 'FLT', 2, 1),
    ],
    4: [ // Friday
      act('Tetra meeting 09:00–11:00', 'Portlaoise (PGS)', 'ADM', 2),
      act('Routine inspection', 'Ballinagar (BXGA)', 'RT', 3),
      act('IP training — afternoon session', 'Portlaoise (PGS)', 'TRN', 3),
    ],
  });

  // ── This week ──
  const tw = buildWeek(thisWeek, {
    0: [ // Monday
      act('Fault — loss of power to cabinet', 'Killerig Cross (KGX)', 'FLT', 3, 1, 'AC mains failure. Ran on battery for 4h. ESB confirmed supply issue — resolved by 14:00.'),
      act('Routine inspection', 'Kinnity (KNTA)', 'RT', 4),
    ],
    1: [ // Tuesday
      act('Generator battery test — 24 cell', 'Clara (CCRB)', 'PM', 4),
      act('Fault investigation — high BER on fibre span', 'Mucklagh (MUKA)', 'FLT', 3),
    ],
    2: [ // Wednesday
      act('Routine visit', 'FiveAlley (FVAA)', 'RT', 4),
      act('Routine visit', 'Mountbolus (MBSB)', 'RT', 3),
    ],
    3: [ // Thursday
      act('Scheduled maintenance — battery swap', 'Gracefield (GCFA)', 'PM', 5),
    ],
  });

  await db.doc(`users/${UID}/weeks/${lastWeek}`).set(lw);
  console.log('✓ Last week seeded:', lastWeek);
  await db.doc(`users/${UID}/weeks/${thisWeek}`).set(tw);
  console.log('✓ This week seeded:', thisWeek);
}

async function seedCallouts() {
  const thisWeek = weekStart(0);
  const lastWeek = weekStart(-1);
  const lDates = dayDates(lastWeek);
  const tDates = dayDates(thisWeek);

  const data = {
    weeks: {
      [lastWeek]: {
        weekStart: lastWeek,
        oncall: true,
        callouts: [
          {
            id: uid(),
            date: lDates[3] + 'T02:15',
            ticket: 'INC-884421',
            location: 'Daingean (DGNB)',
            fault: 'Power alarm — rectifier module failed. Unit swapped on callout. Site running on backup PSU pending permanent fix.',
            engineer: 'Rob Morrow',
            notes: 'Cleared at 03:45. Follow-up visit scheduled.'
          },
          {
            id: uid(),
            date: lDates[5] + 'T23:40',
            ticket: 'INC-886103',
            location: 'Portarlington (PANA)',
            fault: 'Loss of transmission — fibre span hit by third party civil works.',
            engineer: 'Rob Morrow',
            notes: 'Temporary reroute applied. Permanent repair booked for next week.'
          }
        ]
      },
      [thisWeek]: {
        weekStart: thisWeek,
        oncall: true,
        callouts: [
          {
            id: uid(),
            date: tDates[0] + 'T01:30',
            ticket: 'INC-889245',
            location: 'Killerig Cross (KGX)',
            fault: 'AC mains failure — site running on battery. ESB notified.',
            engineer: 'Rob Morrow',
            notes: 'ESB restored supply at 02:15. Site checked and confirmed normal.'
          }
        ]
      }
    },
    _updatedAt: Date.now()
  };

  await db.doc(`users/${UID}/data/callouts`).set(data);
  console.log('✓ Callouts seeded');
}

async function seedNotes() {
  const now = Date.now();
  const notes = [
    {
      id: uid(),
      description: 'Portlaoise (PGS) — site visit notes',
      location: 'Portlaoise (PGS)',
      noteContent: '<p>MDF in good condition. Battery voltages all within spec. AC supply stable. Noted minor corrosion on cabinet hinge — logged for follow-up on next visit.</p><p>Access issues: barrier at rear car park — call security on 045-882100 before visiting.</p>',
      date: dayDates(weekStart(-1))[4],
      status: 'active',
      priority: 'low',
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5
    },
    {
      id: uid(),
      description: 'Tullow fault — cable damage notes',
      location: 'Tullow (TLWA)',
      noteContent: '<p>Customer reported total loss of service Sunday evening. Arrived site Monday morning. External duct damaged on Main St approx 50m from exchange — likely third party groundworks.</p><p>Repaired and retested — all services restored by 11:30.</p><p><strong>Follow-up:</strong> Submit third-party damage report to planning team.</p>',
      date: dayDates(weekStart(-1))[1],
      status: 'active',
      priority: 'medium',
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 4
    },
    {
      id: uid(),
      description: 'IP training — key points',
      location: 'Portlaoise (PGS)',
      noteContent: '<p>Attended IP training session 14:00–17:00.</p><ul><li>New MPLS config rollout — Q3 target</li><li>Updated fault escalation path for Layer 3 issues</li><li>Practice lab access: vpn.training.eir.ie</li></ul>',
      date: dayDates(weekStart(-1))[4],
      status: 'active',
      priority: 'low',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2
    },
    {
      id: uid(),
      description: 'Clara — generator battery test results',
      location: 'Clara (CCRB)',
      noteContent: '<p>24-cell battery string tested. All cells within acceptable range. String voltage: 54.2V. Lowest cell: 2.21V (cell 18 — monitor). Highest cell: 2.27V.</p><p>Load test passed. Generator started first attempt — run time 30 mins nominal.</p>',
      date: dayDates(weekStart(0))[1],
      status: 'active',
      priority: 'low',
      createdAt: now - 86400000,
      updatedAt: now - 86400000
    },
    {
      id: uid(),
      description: 'Order PPE stock',
      noteContent: '<p>Need to reorder: safety boots (size 10), hi-vis jacket (XL), nitrile gloves (box of 100).</p>',
      status: 'active',
      priority: 'medium',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 3
    }
  ];

  await db.doc(`users/${UID}/data/notes`).set({ notes, _updatedAt: now });
  console.log('✓ Notes seeded:', notes.length, 'notes');
}

async function seedRoutines() {
  const sites = [
    { code: 'PGS', name: 'Portlaoise', lastVisit: weekStart(-1) },
    { code: 'TLWA', name: 'Tullow', lastVisit: weekStart(-1) },
    { code: 'CRWA', name: 'Carlow', lastVisit: weekStart(-1) },
    { code: 'PANA', name: 'Portarlington', lastVisit: weekStart(-1) },
    { code: 'MMKA', name: 'Mountmellick', lastVisit: weekStart(-1) },
    { code: 'KEHB', name: 'Killeigh', lastVisit: weekStart(-1) },
    { code: 'GHLB', name: 'Geashill', lastVisit: weekStart(-1) },
    { code: 'DGNB', name: 'Daingean', lastVisit: weekStart(-1) },
    { code: 'BXGA', name: 'Ballinagar', lastVisit: weekStart(-1) },
    { code: 'KNTA', name: 'Kinnity', lastVisit: weekStart(0) },
    { code: 'CCRB', name: 'Clara', lastVisit: weekStart(0) },
    { code: 'MUKA', name: 'Mucklagh', lastVisit: weekStart(0) },
    { code: 'FVAA', name: 'FiveAlley', lastVisit: weekStart(0) },
    { code: 'MBSB', name: 'Mountbolus', lastVisit: weekStart(0) },
    { code: 'GCFA', name: 'Gracefield', lastVisit: weekStart(0) },
    { code: 'KGX', name: 'Killerig Cross', lastVisit: weekStart(0) },
    { code: 'BDAA', name: 'Ballydaly', lastVisit: weekStart(-4) },
    { code: 'KBNB', name: 'Kilbeggan', lastVisit: weekStart(-3) },
    { code: 'MMKA2', name: 'Milltown', lastVisit: weekStart(-5) },
    { code: 'RHNA', name: 'Rahan', lastVisit: weekStart(-2) },
  ];

  // Build visit history: last 6 months
  const visits = {};
  sites.forEach(site => {
    visits[site.code] = [];
    // Add 1-2 visits per month for last 6 months
    for (let m = 0; m < 6; m++) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      d.setDate(Math.floor(Math.random() * 20) + 1);
      visits[site.code].push(d.toISOString().slice(0, 10));
    }
    // Make sure latest visit matches lastVisit
    visits[site.code][0] = dayDates(site.lastVisit)[Math.floor(Math.random() * 5)];
  });

  const data = { sites, visits, _updatedAt: Date.now() };
  await db.doc(`users/${UID}/data/routines`).set(data);
  console.log('✓ Routines seeded:', sites.length, 'sites');
}

async function seedJournal() {
  const now = Date.now();

  const notebooks = [
    { id: 'nb1', title: 'Field Work', createdAt: now - 86400000 * 10, updatedAt: now - 86400000 * 2 },
    { id: 'nb2', title: 'Training & Courses', createdAt: now - 86400000 * 20, updatedAt: now - 86400000 * 5 }
  ];

  const sections = [
    { id: 'sec1', notebookId: 'nb1', title: 'Site Visits', color: '#4d94ff', createdAt: now - 86400000 * 10 },
    { id: 'sec2', notebookId: 'nb1', title: 'Fault Reports', color: '#ef4444', createdAt: now - 86400000 * 9 },
    { id: 'sec3', notebookId: 'nb2', title: 'IP Training', color: '#22c55e', createdAt: now - 86400000 * 20 },
  ];

  const pages = [
    {
      id: 'pg1', sectionId: 'sec1', title: 'Portlaoise — routine visit',
      content: '<h2>Portlaoise Exchange (PGS)</h2><p>Date: ' + dayDates(weekStart(-1))[0] + '</p><p>Site in good condition. MDF clean, no alarms present. Battery voltages nominal. AC supply stable. Noted some dust build-up in cable trays — flagged for cleaning on next scheduled visit.</p>',
      createdAt: now - 86400000 * 7, updatedAt: now - 86400000 * 7
    },
    {
      id: 'pg2', sectionId: 'sec2', title: 'Tullow — cable fault',
      content: '<h2>Fault Report — Tullow (TLWA)</h2><p><strong>Ticket:</strong> INC-884100</p><p><strong>Fault:</strong> Complete loss of service — external cable damaged by third party groundworks on Main St.</p><p><strong>Actions taken:</strong> Repaired duct, re-tested all circuits. Service restored 11:30.</p><p><strong>Follow-up:</strong> Third-party damage report submitted.</p>',
      createdAt: now - 86400000 * 6, updatedAt: now - 86400000 * 6
    },
    {
      id: 'pg3', sectionId: 'sec3', title: 'IP Training notes',
      content: '<h2>IP Training — ' + dayDates(weekStart(-1))[4] + '</h2><ul><li>MPLS config rollout overview — Q3 target</li><li>Layer 3 fault escalation path updated</li><li>New ticketing workflow for IP faults</li><li>Practice lab: vpn.training.eir.ie</li></ul><p>Good session — follow up with team lead on MPLS lab access.</p>',
      createdAt: now - 86400000 * 2, updatedAt: now - 86400000 * 2
    }
  ];

  await db.doc(`users/${UID}/journal/notebooks`).set({ notebooks, _updatedAt: now });
  await db.doc(`users/${UID}/journal/sections`).set({ sections, _updatedAt: now });
  await db.doc(`users/${UID}/journal/pages`).set({ pages, _updatedAt: now });
  console.log('✓ Journal seeded:', notebooks.length, 'notebooks,', sections.length, 'sections,', pages.length, 'pages');
}

async function seedUserProfile() {
  await db.doc(`users/${UID}`).set({
    displayName: 'Rian Field Log',
    email: 'rianfieldlog@gmail.com',
    lastSeen: Date.now()
  }, { merge: true });
  console.log('✓ User profile seeded');
}

async function main() {
  console.log('Seeding demo data for UID:', UID);
  await seedUserProfile();
  await seedWeeks();
  await seedCallouts();
  await seedNotes();
  await seedRoutines();
  await seedJournal();
  console.log('\n✅ All done! rianfieldlog@gmail.com is ready to demo.');
  process.exit(0);
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
