/* ─────────────────────────────────────────────
   VEHICLE CHECKLISTS
───────────────────────────────────────────── */
const VEHICLE_TYPES = ['Bakkies', 'Trucks', 'Trailer', 'Boat'];

const CHECKLISTS = {
  Bakkies: {
    sections: [
      { title: 'EXTERIOR & LIGHTS', items: [
        'Wiper Blades','Front Body','Dim lights','Bright lights','Park lights',
        'Number plate','Rust (body)','Indicators','Bumpers','Mirrors'
      ]},
      { title: 'CAB & INTERIOR', items: [
        'Windows','Instruments','Panel Lights','Roof Lights','Broken panels',
        'Jack & wheel spanner','Triangle','Hand brake','1st Aid kit',
        'Fire extinguisher','Hooter'
      ]},
      { title: 'ENGINE & FLUIDS', items: [
        'Fuel line leaks','Alternator charging','V-Belts & tension',
        'Radiator leaks','Radiator pressure cap','Battery terminals',
        'Engine noises','Grease nipples (shaft/bushes)','Hydraulic oil level',
        'Brake fluid (brakes)','Brake fluid (clutch)'
      ]},
      { title: 'REAR & TYRES', items: [
        'Towing gear','Reverse light','Brake lights','Rear rust',
        'Tyres condition (tread)','Tyre pressures','Total tyres condition',
        'Exhaust system','Brakes performance'
      ]}
    ],
    critical: ['Fuel line leaks','Brake fluid (brakes)','Brake fluid (clutch)','Brakes performance','Tyres condition (tread)','Hand brake','Tyre pressures']
  },
  Trucks: {
    sections: [
      { title: 'FRONT & LIGHTS', items: [
        'Wiper Blades','Front Body','Dim/Bright/Park lights','Number plate',
        'Rust front','Indicators','Bumpers','Mirrors','Chevron boards','Yellow tape'
      ]},
      { title: 'CAB & SAFETY', items: [
        'Windows','Instruments / Panel / Roof lights','Broken panels',
        'Jack & spanner','Triangle','Hand brake','1st Aid kit',
        'Fire extinguisher','Hooter'
      ]},
      { title: 'ENGINE & FLUIDS', items: [
        'Fuel line leaks','Alternator charging','V-belts & tension',
        'Radiator & cap','Battery terminals','Engine noises',
        'Grease nipples','Hydraulic oil','Brake fluid (brakes & clutch)'
      ]},
      { title: 'REAR & TRAILER', items: [
        'Towing gear','Reverse light','Brake lights','Rust at back',
        'Chevron boards','Tyres & pressures','Total tyres',
        'Exhaust','Brakes (service)','Mud flaps','Hinges / Fenders'
      ]}
    ],
    critical: ['Fuel line leaks','Brake fluid (brakes & clutch)','Brakes (service)','Hand brake','Tyres & pressures']
  },
  Trailer: {
    sections: [
      { title: 'COUPLING & CHASSIS', items: [
        'Slides & mechanism','Safety chain','Towing gear',
        'Front rust','Rear rust','Chevron boards'
      ]},
      { title: 'LIGHTS & REFLECTORS', items: [
        'Indicator lights','Brake lights','Light covers','Yellow tape left / right'
      ]},
      { title: 'WHEELS & AXLE', items: [
        'Tyres tread left','Tyres tread right','Bearings left',
        'Bearings right','Tyre pressures both sides'
      ]}
    ],
    critical: ['Tyres tread left','Tyres tread right','Bearings left','Bearings right','Safety chain','Towing gear']
  },
  Boat: {
    sections: [
      { title: 'HULL & DECK', items: [
        'Glass cabin condition','Cracks in hull','Top floor integrity',
        'Left pontoon','Right pontoon'
      ]},
      { title: 'STEERING & PROPULSION', items: [
        'Steering trim & tilt','Left outboard','Right outboard',
        'Prop left','Prop right'
      ]},
      { title: 'FUEL & ENGINE', items: [
        'Fuel filter left','Fuel filter right','Bilge pump operation',
        'Battery left & right','Fuel leaks / lines'
      ]},
      { title: 'SAFETY EQUIPMENT', items: [
        'Safety equipment (flares / lifejackets)','Fire extinguisher',
        '1st Aid kit','Radio / VHF'
      ]}
    ],
    critical: ['Bilge pump operation','Fuel leaks / lines','Safety equipment (flares / lifejackets)','Steering trim & tilt','Prop left','Prop right']
  }
};

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ─────────────────────────────────────────────
   STATE — all in memory, no localStorage
───────────────────────────────────────────── */
let currentVehicle = 'Bakkies';

// Per-vehicle state store
const vehicleState = {};
VEHICLE_TYPES.forEach(v => {
  vehicleState[v] = {
    reg:'', model:'', odometer:'', driver:'',
    weekStart: getMonday(new Date()),
    logs: DAYS.map(() => ({ start:'', stop:'', fuel:'', oil:'', out:'', in:'' })),
    results: [],   // built fresh when vehicle/week changes
    signoff: null
  };
});

function getMonday(d) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(d);
  m.setDate(diff);
  return m.toISOString().split('T')[0];
}

function buildResults() {
  const cl = CHECKLISTS[currentVehicle];
  const rows = [];
  cl.sections.forEach(s => {
    rows.push(null); // section placeholder
    s.items.forEach(() => rows.push({ vals: Array(7).fill(''), comment: '' }));
  });
  return rows;
}

function ensureResults() {
  const st = vehicleState[currentVehicle];
  const cl = CHECKLISTS[currentVehicle];
  let needed = 0;
  cl.sections.forEach(s => { needed += 1 + s.items.length; });
  if (!st.results || st.results.length !== needed) {
    st.results = buildResults();
  }
}

/* ─────────────────────────────────────────────
   BUILD FLATTENED ROW LIST
───────────────────────────────────────────── */
function flattenedRows() {
  const cl = CHECKLISTS[currentVehicle];
  const rows = [];
  cl.sections.forEach(s => {
    rows.push({ type:'section', label: s.title });
    s.items.forEach(item => {
      const isCrit = cl.critical.some(c => item.toLowerCase() === c.toLowerCase() || item.toLowerCase().includes(c.toLowerCase()));
      rows.push({ type:'item', label: item, critical: isCrit });
    });
  });
  return rows;
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
function init() {
  // Set week input to current Monday
  const monday = getMonday(new Date());
  document.getElementById('weekFrom').value = monday;
  vehicleState[currentVehicle].weekStart = monday;

  buildVehicleTabs();
  ensureResults();
  syncMetaToUI();
  renderLogGrid();
  renderTable();
  renderSummary();
  renderSignoff();
}

/* ─────────────────────────────────────────────
   VEHICLE TABS
───────────────────────────────────────────── */
function buildVehicleTabs() {
  const c = document.getElementById('vehicleTabs');
  c.innerHTML = '';
  VEHICLE_TYPES.forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'veh-btn' + (v === currentVehicle ? ' active' : '');
    btn.textContent = v;
    btn.onclick = () => switchVehicle(v);
    c.appendChild(btn);
  });
}

function switchVehicle(v) {
  if (v === currentVehicle) return;
  saveMetaFromUI();
  currentVehicle = v;
  ensureResults();
  buildVehicleTabs();
  syncMetaToUI();
  renderLogGrid();
  renderTable();
  renderSummary();
  renderSignoff();
}

/* ─────────────────────────────────────────────
   META (reg, model, odometer, driver, week)
───────────────────────────────────────────── */
function saveMetaFromUI() {
  const st = vehicleState[currentVehicle];
  st.reg       = document.getElementById('vehReg').value;
  st.model     = document.getElementById('vehModel').value;
  st.odometer  = document.getElementById('vehOdometer').value;
  st.driver    = document.getElementById('driverName').value;
  st.weekStart = document.getElementById('weekFrom').value || st.weekStart;
}

function syncMetaToUI() {
  const st = vehicleState[currentVehicle];
  document.getElementById('vehReg').value      = st.reg;
  document.getElementById('vehModel').value    = st.model;
  document.getElementById('vehOdometer').value = st.odometer;
  document.getElementById('driverName').value  = st.driver;
  document.getElementById('weekFrom').value    = st.weekStart;
}

// Attach live-save listeners once
document.getElementById('vehReg').addEventListener('change', saveMetaFromUI);
document.getElementById('vehModel').addEventListener('change', saveMetaFromUI);
document.getElementById('vehOdometer').addEventListener('change', saveMetaFromUI);
document.getElementById('driverName').addEventListener('change', saveMetaFromUI);
document.getElementById('weekFrom').addEventListener('change', () => {
  saveMetaFromUI();
  vehicleState[currentVehicle].weekStart = document.getElementById('weekFrom').value;
});

/* ─────────────────────────────────────────────
   DAILY LOG GRID
───────────────────────────────────────────── */
function renderLogGrid() {
  const grid = document.getElementById('logGrid');
  grid.innerHTML = '';
  const logs = vehicleState[currentVehicle].logs;

  DAYS.forEach((day, i) => {
    const log = logs[i];
    const div = document.createElement('div');
    div.className = 'log-day';
    div.innerHTML = `
      <div class="log-day-title">${day}</div>
      <div class="log-field"><span class="log-label">Start (km/hr)</span>
        <input type="text" placeholder="Start" value="${esc(log.start)}" data-i="${i}" data-f="start"></div>
      <div class="log-field"><span class="log-label">Stop (km/hr)</span>
        <input type="text" placeholder="Stop" value="${esc(log.stop)}" data-i="${i}" data-f="stop"></div>
      <div class="log-field"><span class="log-label">Fuel (L)</span>
        <input type="text" placeholder="" value="${esc(log.fuel)}" data-i="${i}" data-f="fuel"></div>
      <div class="log-field"><span class="log-label">Oil (tins)</span>
        <input type="text" placeholder="" value="${esc(log.oil)}" data-i="${i}" data-f="oil"></div>
      <div class="log-field"><span class="log-label">Time Out</span>
        <input type="text" placeholder="hh:mm" value="${esc(log.out)}" data-i="${i}" data-f="out"></div>
      <div class="log-field"><span class="log-label">Time In</span>
        <input type="text" placeholder="hh:mm" value="${esc(log.in)}" data-i="${i}" data-f="in"></div>`;
    grid.appendChild(div);
    div.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => {
        vehicleState[currentVehicle].logs[+inp.dataset.i][inp.dataset.f] = inp.value;
      });
    });
  });
}

/* ─────────────────────────────────────────────
   INSPECTION TABLE
───────────────────────────────────────────── */
function renderTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  const rows = flattenedRows();
  const results = vehicleState[currentVehicle].results;
  let resultIdx = 0;

  rows.forEach(row => {
    const tr = document.createElement('tr');

    if (row.type === 'section') {
      tr.className = 'section-row';
      tr.innerHTML = `<td colspan="9">${esc(row.label)}</td>`;
      tbody.appendChild(tr);
      resultIdx++; // advance past section placeholder in results array
      return;
    }

    // item row
    const res = results[resultIdx] || { vals: Array(7).fill(''), comment: '' };
    const capturedIdx = resultIdx;

    const label = row.critical
      ? `<strong>${esc(row.label)}</strong><span class="crit-badge">CRITICAL</span>`
      : esc(row.label);

    // Build 7 day cells
    const dayCells = DAYS.map((_, di) => {
      const v = res.vals[di] || '';
      const cls = colourClass(v);
      return `<td class="td-day">
        <input class="day-result${cls}" type="text" value="${esc(v)}" placeholder="—"
          data-row="${capturedIdx}" data-day="${di}">
      </td>`;
    }).join('');

    tr.innerHTML = `
      <td class="td-item">${label}</td>
      ${dayCells}
      <td><input type="text" class="td-comment-input" value="${esc(res.comment)}" placeholder="Comments…"
        data-comment="${capturedIdx}"></td>`;

    tbody.appendChild(tr);
    resultIdx++;
  });

  // Attach events AFTER all rows are in DOM
  tbody.querySelectorAll('.day-result').forEach(inp => {
    inp.addEventListener('input', onDayInput);
    inp.addEventListener('blur',  onDayBlur);
  });
  tbody.querySelectorAll('.td-comment-input').forEach(inp => {
    inp.addEventListener('change', e => {
      const idx = +e.target.dataset.comment;
      if (!isNaN(idx)) {
        vehicleState[currentVehicle].results[idx].comment = e.target.value;
      }
    });
  });
}

function colourClass(v) {
  if (!v || v === '') return '';
  if (v === 'OK')  return ' r-ok';
  return ' r-def';
}

/* ── The fixed input handlers ── */
function onDayInput(e) {
  const inp = e.target;
  const rowIdx = +inp.dataset.row;
  const dayIdx = +inp.dataset.day;
  const raw = inp.value.trim().toUpperCase();

  // Update state immediately with raw value so typing works smoothly
  vehicleState[currentVehicle].results[rowIdx].vals[dayIdx] = raw;

  // Apply colour while typing (partial match)
  if (raw === 'OK') {
    inp.className = 'day-result r-ok';
  } else if (raw === 'DEF' || raw === 'D' || raw === 'DE') {
    inp.className = 'day-result r-def';
  } else {
    inp.className = 'day-result';
  }

  renderSummary();
}

function onDayBlur(e) {
  const inp = e.target;
  const rowIdx = +inp.dataset.row;
  const dayIdx = +inp.dataset.day;
  let val = inp.value.trim().toUpperCase();

  // On blur: accept OK or DEF only — clear anything else
  if (val !== 'OK' && val !== 'DEF') val = '';

  inp.value = val;
  vehicleState[currentVehicle].results[rowIdx].vals[dayIdx] = val;
  inp.className = 'day-result' + colourClass(val);

  renderSummary();
}

/* ─────────────────────────────────────────────
   SUMMARY
───────────────────────────────────────────── */
function renderSummary() {
  const rows = flattenedRows();
  const results = vehicleState[currentVehicle].results;
  let total = 0, ok = 0, def = 0, resultIdx = 0;

  rows.forEach(row => {
    if (row.type === 'section') { resultIdx++; return; }
    const res = results[resultIdx] || { vals: Array(7).fill('') };
    res.vals.forEach(v => {
      total++;
      if (v === 'OK')  ok++;
      else if (v === 'DEF') def++;
    });
    resultIdx++;
  });

  document.getElementById('summaryBar').innerHTML = `
    <span class="summary-chip chip-total">Checks: ${total}</span>
    <span class="summary-chip chip-ok">OK: ${ok}</span>
    <span class="summary-chip chip-def">DEF: ${def}</span>
    <span class="summary-chip chip-pending">Pending: ${total - ok - def}</span>`;
}

/* ─────────────────────────────────────────────
   SIGN OFF
───────────────────────────────────────────── */
function renderSignoff() {
  const so = vehicleState[currentVehicle].signoff;
  document.getElementById('signoffForm').style.display = so ? 'none' : 'block';
  const disp = document.getElementById('signedDisplay');
  if (so) {
    disp.style.display = 'flex';
    disp.innerHTML = `
      <span class="signed-badge">&#10003; Signed off</span>
      <span style="font-size:12px;color:var(--text-secondary);">
        Date: <strong>${so.date}</strong> &nbsp;|&nbsp;
        Driver: <strong>${so.driver}</strong>
        ${so.manager ? `&nbsp;|&nbsp; Supervisor: <strong>${so.manager}</strong>` : ''}
      </span>
      <button class="undo-btn" onclick="unsignOff()">Undo</button>`;
  } else {
    disp.style.display = 'none';
  }
}

function signOff() {
  const date    = document.getElementById('so-date').value.trim();
  const driver  = document.getElementById('so-driver').value.trim();
  const manager = document.getElementById('so-manager').value.trim();
  const spot    = document.getElementById('so-spot').value.trim();
  if (!date || !driver) { alert('Please fill in the inspection date and driver signature.'); return; }
  vehicleState[currentVehicle].signoff = { date, driver, manager, spot };
  ['so-date','so-driver','so-manager','so-spot'].forEach(id => document.getElementById(id).value = '');
  renderSignoff();
}

function unsignOff() {
  if (!confirm('Remove this sign-off?')) return;
  vehicleState[currentVehicle].signoff = null;
  renderSignoff();
}

/* ─────────────────────────────────────────────
   UTIL
───────────────────────────────────────────── */
function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ─────────────────────────────────────────────
   START
───────────────────────────────────────────── */
init();