const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const REQUIREMENTS = [
    'Stacking is supervised by a competent person.',
    'Base is level and capable of sustaining weight exerted by the stack.',
    'Articles are consistently of the same size, shape and mass.',
    'Pallets and containers are in a good condition.',
    'Support structures are structurally sound and can support the weight. If necessary SWL is displayed.',
    'Articles are removed only from the topmost tier or part of that tier.',
    'No climbing is allowed on stacks other than by ladder and provided the stack is stable.',
    'Persons engaged in stacking operations do not come within reach of machinery, which may endanger their safety.',
    'Stacks in danger of collapsing are safely dismantled and restacked.',
    'Vehicles or other machinery or persons moving past them do not endanger stability of stacks.',
    'Free-standing stacks of sacks, cases, cartons or similar containers are secured by laying up articles in a header and stretcher fashion and corners are securely bonded and the vertical is achieved.',
    'Containers of regular shape ensure a stable stack — total height of stack not to exceed three times the smaller dimension of the underlying base of the stack.',
    'Approval of an inspector obtained to build to a height and manner permitted by the nature of containers being stacked in excess of three times the smaller base dimension of stack.',
    'Approval authority displayed.',
    'Stack heights displayed.',
    'Stacks stable and do not overhang.',
    'Operator of stacking machinery is safely protected from falling articles.',
  ];

  let currentMonth = new Date().getMonth();

  const data = {};
  MONTHS.forEach((_, i) => {
    data[i] = {
      items: REQUIREMENTS.map(r => ({ req: r, result: '', notes: '' })),
      signoff: null
    };
  });

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

  function switchMonth(i) {
    document.getElementById('tab-' + currentMonth).className = 'month-tab' + (data[currentMonth].signoff ? ' signed' : '');
    currentMonth = i;
    document.getElementById('tab-' + i).className = 'month-tab active';
    document.getElementById('currentMonthLabel').textContent = MONTHS[i] + ' checklist';
    document.getElementById('signoffTitle').textContent = 'Sign off — ' + MONTHS[i];
    renderItems();
    renderSignoff();
    renderSummary();
  }

  function renderItems() {
    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';
    data[currentMonth].items.forEach((item, idx) => {
      const tr = document.createElement('tr');
      const okClass = item.result === 'OK' ? ' active-ok' : '';
      const naClass = item.result === 'N/C' ? ' active-na' : '';
      tr.innerHTML = `
        <td class="td-num">${idx + 1}</td>
        <td class="td-req">${item.req}</td>
        <td class="td-result">
          <div class="result-group">
            <button class="result-btn${okClass}" onclick="setResult(${idx},'OK',this)">OK</button>
            <button class="result-btn${naClass}" onclick="setResult(${idx},'N/C',this)">N/C</button>
          </div>
        </td>
        <td class="td-notes">
          <input type="text" value="${esc(item.notes)}" placeholder="Notes…"
            onchange="data[${currentMonth}].items[${idx}].notes=this.value">
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function setResult(idx, val, btn) {
    const item = data[currentMonth].items[idx];
    item.result = item.result === val ? '' : val;
    renderItems();
    renderSummary();
  }

  function esc(s) { return (s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

  function renderSummary() {
    const items = data[currentMonth].items;
    const total   = items.length;
    const ok      = items.filter(i => i.result === 'OK').length;
    const nc      = items.filter(i => i.result === 'N/C').length;
    const pending = total - ok - nc;
    document.getElementById('summaryBar').innerHTML = `
      <span class="summary-chip chip-total">Total: ${total}</span>
      <span class="summary-chip chip-ok">Compliant: ${ok}</span>
      <span class="summary-chip chip-na">Non-conformance: ${nc}</span>
      <span class="summary-chip chip-pending">Pending: ${pending}</span>
    `;
  }

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
          Spot-check: <strong>${so.audit}</strong>
        </span>
        <button class="undo-btn" onclick="unsignOff()">Undo</button>
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
    const audit     = document.getElementById('so-audit').value.trim();
    if (!date || !inspector) { alert('Please fill in at least the date and inspector before signing off.'); return; }
    data[currentMonth].signoff = { date, inspector, audit };
    document.getElementById('so-date').value = '';
    document.getElementById('so-inspector').value = '';
    document.getElementById('so-audit').value = '';
    renderSignoff();
  }

  function unsignOff() {
    if (!confirm('Remove this sign-off?')) return;
    data[currentMonth].signoff = null;
    renderSignoff();
  }

  init();
