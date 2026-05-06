const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const ITEMS = [
  // [num, qty, description, isSection]
  [1,  '2L, 2M', 'Disposable gloves'],
  [2,  '',       'Wound Cleaner / Antiseptic (500 ml)'],
  [3,  '1',      'Roll elastic adhesive bandage (25mm × 3m)'],
  [4,  '4',      'Roller bandages (75mm × 5m)'],
  [5,  '4',      'Roller bandages (100mm × 5m)'],
  [6,  '1',      'Roll anti-allergenic adhesive strip (25mm × 3m)'],
  [7,  '4',      'Triangular bandages'],
  [8,  '1',      'Packet of adhesive dressing strips (min. 10 assorted sizes)'],
  [9,  '',       'Swabs for cleaning wounds'],
  [10, '10',     'Sterile gauze'],
  [11, '1',      'Forceps (for extracting splinters)'],
  [12, '1',      'Pair scissors (minimum size 100mm)'],
  [13, '1',      'Set of safety pins'],
  [14, '250g',   'Cotton wool for padding'],
  [15, '4',      'First-aid dressings (150mm × 200mm)'],
  [16, '4',      'First-aid dressings (75mm × 100mm)'],
  [17, '2',      'CPR mouth pieces (or similar devices)'],
  [18, '2',      'Straight splints'],
  [19, '1',      'Blood spill kit'],
  // General checks
  ['G1', '', 'Box completely stocked according to minimum requirements?', true],
  ['G2', '', 'Name of First Aider on box?', true],
  ['G3', '', 'Box clearly indicated by use of symbolic signs?', true],
  ['G4', '', '"ISSUE BOOK" contained in box?', true],
  ['G5', '', 'Qualified First-Aider available when needed?', true],
];

let currentMonth = new Date().getMonth();
const data = {};
MONTHS.forEach((_,i) => {
  data[i] = {
    items: ITEMS.map(it => ({ num:it[0], qty:it[1], desc:it[2], isGeneral:!!it[3], result:'', note:'' })),
    signoff: null
  };
});

function init() { buildTabs(); renderItems(); renderSignoff(); renderSummary(); }

function buildTabs() {
  const c = document.getElementById('monthTabs');
  MONTHS.forEach((m,i) => {
    const b = document.createElement('button');
    b.className = 'month-tab'+(i===currentMonth?' active':'');
    b.textContent = m.slice(0,3); b.id='tab-'+i;
    b.onclick = ()=>switchMonth(i); c.appendChild(b);
  });
}

function switchMonth(i) {
  document.getElementById('tab-'+currentMonth).className='month-tab'+(data[currentMonth].signoff?' signed':'');
  currentMonth=i;
  document.getElementById('tab-'+i).className='month-tab active';
  document.getElementById('currentMonthLabel').textContent=MONTHS[i]+' checklist';
  document.getElementById('signoffTitle').textContent='Sign off — '+MONTHS[i];
  renderItems(); renderSignoff(); renderSummary();
}

function renderItems() {
  const tbody = document.getElementById('itemsBody');
  tbody.innerHTML='';
  const items = data[currentMonth].items;
  let generalSectionAdded = false;

  items.forEach((item, idx) => {
    if (item.isGeneral && !generalSectionAdded) {
      generalSectionAdded = true;
      const sr = document.createElement('tr');
      sr.className='section-row';
      sr.innerHTML='<td colspan="5">General Checks</td>';
      tbody.appendChild(sr);
    }
    const tr = document.createElement('tr');
    const okClass = item.result==='OK' ? ' active-ok' : '';
    const lowClass = item.result==='LOW' ? ' active-low' : '';
    tr.innerHTML=`
      <td class="td-num">${item.isGeneral ? '' : item.num}</td>
      <td class="td-qty">${item.qty||'—'}</td>
      <td class="td-item">${item.desc}</td>
      <td class="td-res">
        <div class="result-group">
          <button class="result-btn${okClass}" onclick="setResult(${idx},'OK',this)">OK</button>
          <button class="result-btn${lowClass}" onclick="setResult(${idx},'LOW',this)">LOW</button>
        </div>
      </td>
      <td><input type="text" value="${esc(item.note)}" placeholder="Notes…" onchange="data[${currentMonth}].items[${idx}].note=this.value;renderSummary()"></td>
    `;
    tbody.appendChild(tr);
  });
}

function setResult(idx, val, btn) {
  const item = data[currentMonth].items[idx];
  item.result = item.result===val ? '' : val;
  renderItems(); renderSummary();
}

function esc(s){return(s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;');}

function renderSummary() {
  const items = data[currentMonth].items;
  const total = items.length;
  const ok    = items.filter(i=>i.result==='OK').length;
  const low   = items.filter(i=>i.result==='LOW').length;
  const pend  = total-ok-low;
  document.getElementById('summaryBar').innerHTML=`
    <span class="summary-chip chip-total">Total: ${total}</span>
    <span class="summary-chip chip-ok">OK: ${ok}</span>
    <span class="summary-chip chip-low">Low/Missing: ${low}</span>
    <span class="summary-chip chip-pending">Pending: ${pend}</span>`;
}

function renderSignoff() {
  const so = data[currentMonth].signoff;
  document.getElementById('signoffForm').style.display=so?'none':'block';
  const d=document.getElementById('signedDisplay');
  if(so){
    d.style.display='flex';
    d.innerHTML=`<span class="signed-badge">&#10003; Signed off</span>
      <span style="font-size:12px;color:var(--text-secondary);">Date: <strong>${so.date}</strong> &nbsp;|&nbsp; Inspector: <strong>${so.inspector}</strong> &nbsp;|&nbsp; Manager: <strong>${so.manager}</strong></span>
      <button class="undo-btn" onclick="unsignOff()">Undo</button>`;
  } else { d.style.display='none'; }
  const tab=document.getElementById('tab-'+currentMonth);
  if(tab&&!tab.classList.contains('active')) tab.className='month-tab'+(so?' signed':'');
}

function signOff() {
  const date=document.getElementById('so-date').value.trim();
  const inspector=document.getElementById('so-inspector').value.trim();
  const manager=document.getElementById('so-manager').value.trim();
  if(!date||!inspector) { alert('Please fill in at least the date and inspector signature.'); return; }
  data[currentMonth].signoff={date,inspector,manager};
  document.getElementById('so-date').value='';
  document.getElementById('so-inspector').value='';
  document.getElementById('so-manager').value='';
  renderSignoff();
}

function unsignOff() {
  if(!confirm('Remove this sign-off?')) return;
  data[currentMonth].signoff=null; renderSignoff();
}

init();
