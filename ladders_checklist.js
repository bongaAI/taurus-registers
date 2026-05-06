const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const TYPES  = ['Fixed Ladder','Straight Ladder','Step Ladder','Extension Ladder','Trestle Ladder','Stairway','Walkway'];

  let currentMonth = new Date().getMonth();

  // State: each month holds items array and optional signoff object
  const data = {};
  MONTHS.forEach((_, i) => { data[i] = { items: [], signoff: null }; });

  /* ── Init ── */
  function init() {
    buildTabs();
    renderItems();
    renderSignoff();
  }

  function buildTabs() {
    const container = document.getElementById('monthTabs');
    MONTHS.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'month-tab' + (i === currentMonth ? ' active' : '');
      btn.textContent = m.slice(0, 3);
      btn.id = 'tab-' + i;
      btn.onclick = () => switchMonth(i);
      container.appendChild(btn);
    });
  }

  /* ── Month switching ── */
  function switchMonth(i) {
    const prev = document.getElementById('tab-' + currentMonth);
    prev.className = 'month-tab' + (data[currentMonth].signoff ? ' signed' : '');
    currentMonth = i;
    document.getElementById('tab-' + i).className = 'month-tab active';
    document.getElementById('currentMonthLabel').textContent = MONTHS[i] + ' checklist';
    document.getElementById('signoffTitle').textContent = 'Sign off — ' + MONTHS[i];
    renderItems();
    renderSignoff();
  }

  /* ── Render items ── */
  function renderItems() {
    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';
    const items = data[currentMonth].items;

    if (items.length === 0) {
      const tr = document.createElement('tr');
      tr.className = 'empty-row';
      tr.innerHTML = '<td colspan="6">No items added yet. Click &ldquo;+ Add item&rdquo; to begin.</td>';
      tbody.appendChild(tr);
      return;
    }

    items.forEach((item, idx) => {
      const tr = document.createElement('tr');

      // Build type options
      const typeOpts = TYPES.map(t =>
        `<option${item.type === t ? ' selected' : ''}>${t}</option>`
      ).join('');

      // Result cell class
      const resClass = item.result === 'OK'
        ? ' ok'
        : (item.result && item.result.trim() !== '' ? ' defective' : '');

      tr.innerHTML = `
        <td>
          <input type="text" value="${esc(item.id)}" placeholder="e.g. L-01"
            onchange="updateItem(${idx},'id',this.value)">
        </td>
        <td>
          <input type="text" value="${esc(item.location)}" placeholder="Location"
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
          <input type="text" value="${esc(item.deviation)}" placeholder="e.g. 1.3"
            onchange="updateItem(${idx},'deviation',this.value)">
        </td>
        <td>
          <button class="del-btn" onclick="deleteRow(${idx})" title="Remove row">&#215;</button>
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
  }

  function handleResult(idx, input) {
    const val = input.value.trim().toUpperCase();
    data[currentMonth].items[idx].result = val;
    input.value = val;
    if (val === 'OK') {
      input.className = 'result-input ok';
    } else if (val !== '') {
      input.className = 'result-input defective';
    } else {
      input.className = 'result-input';
    }
  }

  function addRow() {
    data[currentMonth].items.push({ id: '', location: '', type: TYPES[0], result: '', deviation: '' });
    renderItems();
    // Focus first input of new row
    const rows = document.querySelectorAll('#itemsBody tr');
    if (rows.length) {
      const firstInput = rows[rows.length - 1].querySelector('input');
      if (firstInput) firstInput.focus();
    }
  }

  function deleteRow(idx) {
    if (!confirm('Remove this item?')) return;
    data[currentMonth].items.splice(idx, 1);
    renderItems();
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
        <span style="font-size:12px;color:#6b6b67;">
          Date: <strong>${so.date}</strong> &nbsp;|&nbsp;
          Inspector: <strong>${so.inspector}</strong> &nbsp;|&nbsp;
          Manager: <strong>${so.manager}</strong>
        </span>
        <button class="undo-btn" onclick="unsignOff()">Undo sign-off</button>
      `;
    } else {
      disp.style.display = 'none';
    }

    // Update tab class if not active
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
      alert('Please fill in the date inspected, inspector initials, and manager initials before signing off.');
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
