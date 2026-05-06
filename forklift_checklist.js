const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const STEPS = [
  { step:'STEP 1 — ENGINE', critical:false, items:[
    'Fan / Generator Belt (Tension / Condition)',
    'Water hoses (Leaks / Condition)',
    'Radiator water (Level / Condition)',
    'Radiator Cap (Spring / Condition)',
    {t:'Engine oil level (OK or Low)', crit:true},
    'Reflectors (OK or Damaged or Missing)',
  ]},
  { step:'STEP 2 — FRONT WHEELS', critical:false, items:[
    {t:'Pressure — Left and Right', crit:true},
    {t:'Tread — Left and Right', crit:true},
    'Valve cap — Left and Right',
    {t:'Wheel nuts — Left and Right', crit:true},
  ]},
  { step:'STEP 3 — REAR WHEELS', critical:false, items:[
    {t:'Pressure — Left 1 & 2 and Right 1 & 2', crit:true},
    {t:'Tread — Left 1 & 2 and Right 1 & 2', crit:true},
    'Valve cap — Left 1 & 2 and Right 1 & 2',
    {t:'Wheel Nuts — Left and Right', crit:true},
  ]},
  { step:'STEP 4 — BATTERY, FUEL TANK & SPARE WHEEL', critical:false, items:[
    'Battery — (a) Water, (b) Terminals, (c) Bracket',
    {t:'Fuel Tank — (a) Fuel, (b) Cap, (c) Seal, (d) Leaks', crit:true},
    'Spare wheel — (a) Pressure, (b) Tread',
  ]},
  { step:'STEP 5 — CAB (Start engine — fast idle 30 sec, then check)', critical:false, items:[
    {t:'Clutch pedal free play', crit:true},
    'Hooter',
    'Vehicle — Clean / Sterilised',
    {t:'Foot brake', crit:true},
    {t:'Hand brake', crit:true},
    {t:'Lights — (a) Head, (b) Dim, (c) Park, (d) Tail, (e) Stop, (f) Rotating', crit:true},
    {t:'Indicators — (a) Front L & R, (b) Rear L & R', crit:true},
    {t:'Rear view mirrors — (a) Left, (b) Middle, (c) Right', crit:true},
    {t:'Licence, Certificate of Fitness, Public Driving Permit, ID Book', crit:true},
  ]},
  { step:'STEP 6 — ON THE ROAD CHECKS', critical:false, items:[
    'Oil Pressure (Light or Gauge)',
    'Water temperature (Light or Gauge)',
    'Alternator (Light comes on)',
    'Exhaust Smoke (Black or Normal)',
  ]},
  { step:'STEP 7 — GENERAL & SAFETY EQUIPMENT', critical:false, items:[
    {t:'Emergency equipment — (a) Hard Hat (b) Reflective Jacket (c) Safety Harness (d) Dust Mask', crit:true},
    {t:'Yearly Lifting test done', crit:true},
    'Forklift serviced according to hours worked',
    'Driver wearing PPE',
  ]},
];

// Flatten rows
const ROWS = [];
STEPS.forEach(s => {
  ROWS.push({type:'step', label:s.step});
  s.items.forEach(it => {
    const isCrit = typeof it==='object';
    ROWS.push({type:'item', label:isCrit?it.t:it, crit:isCrit?it.crit:false});
  });
});

// State: one week
const state = {
  days: DAYS.map(() => ({speedo_start:'', speedo_stop:'', fuel:'', oil:'', time_out:'', time_in:''})),
  results: ROWS.map(() => ({vals:Array(7).fill(''), comment:''})),
  signoff: null
};

function init() {
  // Default week to current Monday
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day===0?-6:1);
  d.setDate(diff);
  document.getElementById('weekFrom').value = d.toISOString().split('T')[0];

  buildLogGrid();
  renderItems();
  renderSummary();
  renderSignoff();
}

function buildLogGrid() {
  const grid = document.getElementById('logGrid');
  grid.innerHTML='';
  DAYS.forEach((day,i) => {
    const div = document.createElement('div');
    div.className='log-day';
    div.innerHTML=`<div class="log-day-title">${day}</div>
      <div class="log-field"><span class="log-label">Speedo Start</span><input type="text" placeholder="km" value="${esc(state.days[i].speedo_start)}" onchange="state.days[${i}].speedo_start=this.value"></div>
      <div class="log-field"><span class="log-label">Speedo Stop</span><input type="text" placeholder="km" value="${esc(state.days[i].speedo_stop)}" onchange="state.days[${i}].speedo_stop=this.value"></div>
      <div class="log-field"><span class="log-label">Fuel (L)</span><input type="text" placeholder="" value="${esc(state.days[i].fuel)}" onchange="state.days[${i}].fuel=this.value"></div>
      <div class="log-field"><span class="log-label">Oil (tins)</span><input type="text" placeholder="" value="${esc(state.days[i].oil)}" onchange="state.days[${i}].oil=this.value"></div>
      <div class="log-field"><span class="log-label">Time Out</span><input type="text" placeholder="hh:mm" value="${esc(state.days[i].time_out)}" onchange="state.days[${i}].time_out=this.value"></div>
      <div class="log-field"><span class="log-label">Time In</span><input type="text" placeholder="hh:mm" value="${esc(state.days[i].time_in)}" onchange="state.days[${i}].time_in=this.value"></div>`;
    grid.appendChild(div);
  });
}

function renderItems() {
  const tbody = document.getElementById('itemsBody');
  tbody.innerHTML='';
  ROWS.forEach((row, idx) => {
    const tr = document.createElement('tr');
    if(row.type==='step') {
      tr.className='step-row';
      tr.innerHTML=`<td class="td-step">${row.label}</td>${DAYS.map(()=>'<td class="td-day-cell"></td>').join('')}<td class="td-critical"></td>`;
    } else {
      const label = row.crit ? `<strong>${row.label}</strong><span class="crit-badge">CRITICAL</span>` : row.label;
      const cells = DAYS.map((d,di) => {
        const v = state.results[idx].vals[di];
        const cls = v==='OK'?' r-ok':(v&&v!==''?' r-def':'');
        return `<td class="td-day"><input class="day-result${cls}" type="text" value="${esc(v)}" placeholder="—"
          oninput="handleDayInput(${idx},${di},this)" onblur="handleDayInput(${idx},${di},this)"></td>`;
      }).join('');
      tr.innerHTML=`<td class="td-step">${label}</td>${cells}
        <td><input type="text" value="${esc(state.results[idx].comment)}" placeholder="Comment…"
          onchange="state.results[${idx}].comment=this.value;renderSummary()"></td>`;
    }
    tbody.appendChild(tr);
  });
}

function handleDayInput(rowIdx, dayIdx, input) {
  const v = input.value.trim().toUpperCase();
  state.results[rowIdx].vals[dayIdx] = v;
  input.value = v;
  input.className = 'day-result'+(v==='OK'?' r-ok':(v&&v!==''?' r-def':''));
  renderSummary();
}

function esc(s){return(s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;');}

function renderSummary() {
  const itemRows = state.results.filter((_,i)=>ROWS[i].type==='item');
  const total = itemRows.length * 7;
  const ok  = itemRows.reduce((a,r)=>a+r.vals.filter(v=>v==='OK').length,0);
  const def = itemRows.reduce((a,r)=>a+r.vals.filter(v=>v&&v!=='OK').length,0);
  document.getElementById('summaryBar').innerHTML=`
    <span class="summary-chip chip-total">Checks: ${total}</span>
    <span class="summary-chip chip-ok">OK: ${ok}</span>
    <span class="summary-chip chip-def">DEF: ${def}</span>
    <span class="summary-chip chip-pending">Pending: ${total-ok-def}</span>`;
}

function renderSignoff() {
  const so = state.signoff;
  document.getElementById('signoffForm').style.display=so?'none':'block';
  const d=document.getElementById('signedDisplay');
  if(so){
    d.style.display='flex';
    d.innerHTML=`<span class="signed-badge">&#10003; Signed off</span>
      <span style="font-size:12px;color:var(--text-secondary);">Date: <strong>${so.date}</strong> &nbsp;|&nbsp; Driver: <strong>${so.driver}</strong> &nbsp;|&nbsp; Supervisor: <strong>${so.manager}</strong></span>
      <button class="undo-btn" onclick="unsignOff()">Undo</button>`;
  } else { d.style.display='none'; }
}

function signOff() {
  const date=document.getElementById('so-date').value.trim();
  const driver=document.getElementById('so-driver').value.trim();
  const manager=document.getElementById('so-manager').value.trim();
  if(!date||!driver) { alert('Please fill in at least the date and driver signature.'); return; }
  state.signoff={date,driver,manager};
  document.getElementById('so-date').value=''; document.getElementById('so-driver').value=''; document.getElementById('so-manager').value='';
  renderSignoff();
}
function unsignOff() { if(!confirm('Remove this sign-off?')) return; state.signoff=null; renderSignoff(); }

init();
