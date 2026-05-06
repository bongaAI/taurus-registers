const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TYPES  = ['FE — Fire Extinguisher','FHR — Fire Hose Reel','FH — Fire Hydrant'];

/* Pre-loaded items from the paper register */
const DEFAULT_ITEMS = [
  { id:'1',  location:'Main Boardroom',       type:'FE — Fire Extinguisher' },
  { id:'2',  location:'Boardroom',             type:'FE — Fire Extinguisher' },
  { id:'3',  location:'Office Kitchen',        type:'FE — Fire Extinguisher' },
  { id:'4',  location:'Fire Blanket Office Kitchen', type:'FE — Fire Extinguisher' },
  { id:'5',  location:'PPE Storage',           type:'FE — Fire Extinguisher' },
  { id:'6',  location:'Office Manager',        type:'FE — Fire Extinguisher' },
  { id:'7',  location:'QC Lab',                type:'FE — Fire Extinguisher' },
  { id:'8',  location:'LK Factory',            type:'FE — Fire Extinguisher' },
  { id:'9',  location:'LK Dispatch',           type:'FE — Fire Extinguisher' },
  { id:'10', location:'LK Archives',           type:'FE — Fire Extinguisher' },
  { id:'11', location:'Staff Room',            type:'FE — Fire Extinguisher' },
  { id:'12', location:'Stipes Factory',        type:'FE — Fire Extinguisher' },
  { id:'13', location:'Admin Bakkie',          type:'FE — Fire Extinguisher' },
  { id:'14', location:'New Holland',           type:'FE — Fire Extinguisher' },
  { id:'15', location:'Wendy',                 type:'FE — Fire Extinguisher' },
  { id:'16', location:'Man Truck',             type:'FE — Fire Extinguisher' },
  { id:'17', location:'Office Outside',        type:'FE — Fire Extinguisher' },
  { id:'18', location:'Land Cruiser',          type:'FE — Fire Extinguisher' },
  { id:'19', location:'Masikhule',             type:'FE — Fire Extinguisher' },
  { id:'20', location:'Reception',             type:'FE — Fire Extinguisher' },
  { id:'21', location:'Gisela',                type:'FE — Fire Extinguisher' },
  { id:'22', location:'Isuzu Truck',           type:'FE — Fire Extinguisher' },
  { id:'23', location:'Stipes Bakkie',         type:'FE — Fire Extinguisher' },
  { id:'24', location:'Mondli',                type:'FE — Fire Extinguisher' },
  { id:'25', location:'Deidre Office',         type:'FE — Fire Extinguisher' },
  { id:'26', location:'Solar Room',            type:'FE — Fire Extinguisher' },
  { id:'27', location:'John Deere',            type:'FE — Fire Extinguisher' },
  { id:'28', location:'Fire Blanket Staff Room', type:'FE — Fire Extinguisher' },
];

let currentMonth = new Date().getMonth();

const data = {};
MONTHS.forEach((_, i) => {
  data[i] = {
    items: DEFAULT_ITEMS.map(d => ({ ...d, result: '', deviation: '' })),
    signoff: null
  };
});

/* ── Init ── */
function init() {
  buildTabs();
  renderItems();
  renderSignoff();
  renderSummary();
}

function buildTabs() {
  const c = document.getElementById('monthTabs');
  MONTHS.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.className = 'month-tab' + (i === currentMonth ? ' active' : '');
    btn.textContent = m.slice(0, 3);
    btn.id = 'tab-' + i;
    btn.onclick = () => switchMonth(i);
    c.appendChild(btn);
  });
}

/* ── Month switch ── */
function switchMonth(i) {
  const prev = document.getElementById('tab-' + currentMonth);
  prev.className = 'month-tab' + (data[currentMonth].signoff ? ' signed' : '');
  currentMonth = i;
  document.getElementById('tab-' + i).className = 'month-tab active';
  document.getElementById('currentMonthLabel').textContent = MONTHS[i] + ' checklist';
  document.getElementById('signoffTitle').textContent = 'Sign off — ' + MONTHS[i];
  renderItems();
  renderSignoff();
  renderSummary();
}

/* ── Type badge ── */
function typeBadge(type) {
  if (type.startsWith('FE'))  return `<span class="type-badge type-fe">FE</span>`;
  if (type.startsWith('FHR')) return `<span class="type-badge type-fhr">FHR</span>`;
  if (type.startsWith('FH'))  return `<span class="type-badge type-fh">FH</span>`;
  return '';
}

/* ── Render items ── */
function renderItems() {
  const tbody = document.getElementById('itemsBody');
  tbody.innerHTML = '';
  const items = data[currentMonth].items;

  if (items.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    tr.innerHTML = '<td colspan="6">No items. Click &ldquo;+ Add item&rdquo; to begin.</td>';
    tbody.appendChild(tr);
    return;
  }

  items.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const typeOpts = TYPES.map(t => `<option${item.type === t ? ' selected' : ''}>${t}</option>`).join('');
    const resClass = item.result === 'OK' ? ' ok' : (item.result && item.result.trim() ? ' defective' : '');

    tr.innerHTML = `
      <td style="font-size:12px;color:var(--text-muted);font-weight:600;">${esc(item.id)}</td>
      <td>
        <input type="text" value="${esc(item.location)}" placeholder="Location / description"
          onchange="updateItem(${idx},'location',this.value)">
      </td>
      <td>
        <select onchange="updateItem(${idx},'type',this.value)">${typeOpts}</select>
      </td>
      <td class="result-cell">
        <input type="text" class="result-input${resClass}" value="${esc(item.result)}"
          placeholder="OK"
          oninput="handleResult(${idx},this)"
          onblur="handleResult(${idx},this)">
      </td>
      <td>
        <input type="text" value="${esc(item.deviation)}" placeholder="e.g. 1.5"
          onchange="updateItem(${idx},'deviation',this.value)">
      </td>
      <td>
        <button class="del-btn" onclick="deleteRow(${idx})" title="Remove">&#215;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function esc(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/* ── Item mutations ── */
function updateItem(idx, key, val) {
  data[currentMonth].items[idx][key] = val;
  renderSummary();
}

function handleResult(idx, input) {
  const val = input.value.trim().toUpperCase();
  data[currentMonth].items[idx].result = val;
  input.value = val;
  input.className = 'result-input' + (val === 'OK' ? ' ok' : (val ? ' defective' : ''));
  renderSummary();
}

function addRow() {
  const items = data[currentMonth].items;
  const nextId = items.length > 0 ? (parseInt(items[items.length - 1].id) || items.length) + 1 : 1;
  items.push({ id: String(nextId), location: '', type: TYPES[0], result: '', deviation: '' });
  renderItems();
  renderSummary();
  const rows = document.querySelectorAll('#itemsBody tr');
  if (rows.length) {
    const inp = rows[rows.length - 1].querySelectorAll('input')[0];
    if (inp) inp.focus();
  }
}

function deleteRow(idx) {
  if (!confirm('Remove this item?')) return;
  data[currentMonth].items.splice(idx, 1);
  renderItems();
  renderSummary();
}

/* ── Summary ── */
function renderSummary() {
  const items = data[currentMonth].items;
  const total   = items.length;
  const ok      = items.filter(i => i.result === 'OK').length;
  const def     = items.filter(i => i.result && i.result !== 'OK').length;
  const pending = total - ok - def;
  document.getElementById('summaryBar').innerHTML = `
    <span class="summary-chip chip-total">Total: ${total}</span>
    <span class="summary-chip chip-ok">OK: ${ok}</span>
    <span class="summary-chip chip-def">Defective: ${def}</span>
    <span class="summary-chip chip-pending">Pending: ${pending}</span>
  `;
}

/* ── Sign off ── */
function renderSignoff() {
  const so = data[currentMonth].signoff;
  document.getElementById('signoffForm').style.display = so ? 'none' : 'block';
  const disp = document.getElementById('signedDisplay');
  if (so) {
    disp.style.display = 'flex';
    disp.innerHTML = `
      <span class="signed-badge">&#10003; Signed off</span>
      <span style="font-size:12px;color:var(--text-secondary);">
        Date: <strong>${so.date}</strong> &nbsp;|&nbsp;
        Inspector: <strong>${so.inspector}</strong> &nbsp;|&nbsp;
        Manager: <strong>${so.manager}</strong>
      </span>
      <button class="undo-btn" onclick="unsignOff()">Undo sign-off</button>
    `;
  } else {
    disp.style.display = 'none';
  }
  const tab = document.getElementById('tab-' + currentMonth);
  if (tab && !tab.classList.contains('active')) {
    tab.className = 'month-tab' + (so ? ' signed' : '');
  }
}

function signOff() {
  const date      = document.getElementById('so-date').value.trim();
  const inspector = document.getElementById('so-inspector').value.trim();
  const manager   = document.getElementById('so-manager').value.trim();
  if (!date || !inspector || !manager) {
    alert('Please fill in the date, inspector signature, and manager signature before signing off.');
    return;
  }
  data[currentMonth].signoff = { date, inspector, manager };
  document.getElementById('so-date').value = '';
  document.getElementById('so-inspector').value = '';
  document.getElementById('so-manager').value = '';
  renderSignoff();
}

function unsignOff() {
  if (!confirm('Remove this sign-off?')) return;
  data[currentMonth].signoff = null;
  renderSignoff();
}

/* ── Legend ── */
function toggleLegend() {
  const box = document.getElementById('legendBox');
  box.classList.toggle('open');
  document.querySelector('.legend-toggle-btn').textContent =
    box.classList.contains('open') ? 'Hide deviation legend' : 'Show deviation legend';
}

/* ── Start ── */
init();