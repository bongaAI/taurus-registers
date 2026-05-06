const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let currentMonth = new Date().getMonth();
const data = {};
MONTHS.forEach((_,i) => { data[i] = { items: [], signoff: null }; });

function init() { buildTabs(); renderItems(); renderSignoff(); renderSummary(); }

function buildTabs() {
  const c = document.getElementById('monthTabs');
  MONTHS.forEach((m,i) => {
    const b = document.createElement('button');
    b.className = 'month-tab'+(i===currentMonth?' active':'');
    b.textContent = m.slice(0,3); b.id = 'tab-'+i;
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
  if(!items.length) {
    tbody.innerHTML='<tr class="empty-row"><td colspan="5">No compressors added. Click "+ Add compressor" to begin.</td></tr>';
    return;
  }
  items.forEach((item,idx) => {
    const tr = document.createElement('tr');
    const resClass = item.result==='OK'?' ok':(item.result&&item.result.trim()?' defective':'');
    tr.innerHTML=`
      <td><input type="text" value="${esc(item.id)}" placeholder="e.g. C-01" onchange="data[${currentMonth}].items[${idx}].id=this.value"></td>
      <td><input type="text" value="${esc(item.location)}" placeholder="Location / type description" onchange="data[${currentMonth}].items[${idx}].location=this.value"></td>
      <td class="result-cell">
        <input type="text" class="result-input${resClass}" value="${esc(item.result)}" placeholder="OK"
          oninput="handleResult(${idx},this)" onblur="handleResult(${idx},this)">
      </td>
      <td><input type="text" value="${esc(item.deviation)}" placeholder="e.g. 5" onchange="data[${currentMonth}].items[${idx}].deviation=this.value"></td>
      <td><button class="del-btn" onclick="deleteRow(${idx})" title="Remove">&#215;</button></td>`;
    tbody.appendChild(tr);
  });
}

function handleResult(idx,input) {
  const v=input.value.trim().toUpperCase();
  data[currentMonth].items[idx].result=v; input.value=v;
  input.className='result-input'+(v==='OK'?' ok':(v?' defective':''));
  renderSummary();
}

function addRow() {
  data[currentMonth].items.push({id:'',location:'',result:'',deviation:''});
  renderItems(); renderSummary();
  const rows=document.querySelectorAll('#itemsBody tr');
  if(rows.length){ const inp=rows[rows.length-1].querySelector('input'); if(inp) inp.focus(); }
}

function deleteRow(idx) {
  if(!confirm('Remove this compressor?')) return;
  data[currentMonth].items.splice(idx,1); renderItems(); renderSummary();
}

function esc(s){return(s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;');}

function renderSummary() {
  const items=data[currentMonth].items;
  const total=items.length;
  const ok=items.filter(i=>i.result==='OK').length;
  const def=items.filter(i=>i.result&&i.result!=='OK').length;
  document.getElementById('summaryBar').innerHTML=`
    <span class="summary-chip chip-total">Total: ${total}</span>
    <span class="summary-chip chip-ok">OK: ${ok}</span>
    <span class="summary-chip chip-def">Defective: ${def}</span>
    <span class="summary-chip chip-pending">Pending: ${total-ok-def}</span>`;
}

function renderSignoff() {
  const so=data[currentMonth].signoff;
  document.getElementById('signoffForm').style.display=so?'none':'block';
  const d=document.getElementById('signedDisplay');
  if(so){
    d.style.display='flex';
    d.innerHTML=`<span class="signed-badge">&#10003; Signed off</span>
      <span style="font-size:12px;color:var(--text-secondary);">Date: <strong>${so.date}</strong> &nbsp;|&nbsp; Inspector: <strong>${so.inspector}</strong></span>
      <button class="undo-btn" onclick="unsignOff()">Undo</button>`;
  } else { d.style.display='none'; }
  const tab=document.getElementById('tab-'+currentMonth);
  if(tab&&!tab.classList.contains('active')) tab.className='month-tab'+(so?' signed':'');
}

function signOff() {
  const date=document.getElementById('so-date').value.trim();
  const inspector=document.getElementById('so-inspector').value.trim();
  if(!date||!inspector){alert('Please fill in date and inspector initials.');return;}
  data[currentMonth].signoff={date,inspector};
  document.getElementById('so-date').value=''; document.getElementById('so-inspector').value='';
  renderSignoff();
}

function unsignOff(){if(!confirm('Remove this sign-off?'))return;data[currentMonth].signoff=null;renderSignoff();}

function toggleLegend(){
  const box=document.getElementById('legendBox');
  box.classList.toggle('open');
  document.querySelector('.legend-toggle-btn').textContent=box.classList.contains('open')?'Hide deviation legend':'Show deviation legend';
}

init();
