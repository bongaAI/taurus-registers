const CHECKS = [
    'Water Supply',
    'Effluent',
    'Plumbing',
    'Housekeeping',
    'Walls',
    'Floors',
    'Windows',
    'Doors',
    'Toilet Doors',
    'Toilet Bowls & Seats',
    'Urinals',
    'Toilet Roll Dispensers',
    'Soap Holders & Soap',
    'Hand Drying Facilities',
    'Lockers',
    'Showers',
    'Change Rooms',
    'Hand Wash Basins',
    'Are all lights working?',
    'Is any food kept in lockers?',
    'Do any toilets leak or overflow?',
    'Are there enough waste bins?',
    'Are ashtrays provided?',
    'Are there any bad odours?',
  ];

  // Each item has four independent condition flags
  const items = CHECKS.map(c => ({ check: c, clean: false, dirty: false, damaged: false, missing: false, comment: '' }));
  let signoff = null;

  function init() {
    renderItems();
    renderSummary();
  }

  function renderItems() {
    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';
    items.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-num">${idx + 1}</td>
        <td class="td-check">${item.check}</td>
        <td class="td-cond">
          <button class="cond-btn${item.clean ? ' active-clean' : ''}" onclick="toggle(${idx},'clean')" title="Clean / OK">&#10003;</button>
        </td>
        <td class="td-cond">
          <button class="cond-btn${item.dirty ? ' active-dirty' : ''}" onclick="toggle(${idx},'dirty')" title="Dirty">&#9679;</button>
        </td>
        <td class="td-cond">
          <button class="cond-btn${item.damaged ? ' active-damaged' : ''}" onclick="toggle(${idx},'damaged')" title="Damaged">&#9651;</button>
        </td>
        <td class="td-cond">
          <button class="cond-btn${item.missing ? ' active-missing' : ''}" onclick="toggle(${idx},'missing')" title="Missing">&#10005;</button>
        </td>
        <td>
          <input type="text" value="${esc(item.comment)}" placeholder="Comment…"
            onchange="items[${idx}].comment=this.value">
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function toggle(idx, cond) {
    items[idx][cond] = !items[idx][cond];
    renderItems();
    renderSummary();
  }

  function esc(s) { return (s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

  function renderSummary() {
    const total   = items.length;
    const clean   = items.filter(i => i.clean).length;
    const dirty   = items.filter(i => i.dirty).length;
    const damaged = items.filter(i => i.damaged).length;
    const missing = items.filter(i => i.missing).length;
    document.getElementById('summaryBar').innerHTML = `
      <span class="summary-chip chip-total">Total: ${total}</span>
      <span class="summary-chip chip-clean">Clean: ${clean}</span>
      <span class="summary-chip chip-dirty">Dirty: ${dirty}</span>
      <span class="summary-chip chip-damaged">Damaged: ${damaged}</span>
      <span class="summary-chip chip-missing">Missing: ${missing}</span>
    `;
  }

  function signOff() {
    const inspector  = document.getElementById('so-inspector').value.trim();
    const inspDate   = document.getElementById('so-insp-date').value.trim();
    const manager    = document.getElementById('so-manager').value.trim();
    const mgrDate    = document.getElementById('so-mgr-date').value.trim();
    const mgrComments = document.getElementById('so-mgr-comments').value.trim();
    if (!inspector || !inspDate) { alert('Please fill in at least the inspector signature and date.'); return; }
    signoff = { inspector, inspDate, manager, mgrDate, mgrComments };
    document.getElementById('signoffForm').style.display = 'none';
    const disp = document.getElementById('signedDisplay');
    disp.style.display = 'flex';
    disp.innerHTML = `
      <span class="signed-badge">&#10003; Signed off</span>
      <span style="font-size:12px;color:var(--text-secondary);">
        Inspector: <strong>${signoff.inspector}</strong> (${signoff.inspDate})
        ${signoff.manager ? `&nbsp;|&nbsp; Manager: <strong>${signoff.manager}</strong> (${signoff.mgrDate})` : ''}
      </span>
      <button class="undo-btn" onclick="unsignOff()">Undo</button>
    `;
  }

  function unsignOff() {
    if (!confirm('Remove this sign-off?')) return;
    signoff = null;
    document.getElementById('signedDisplay').style.display = 'none';
    document.getElementById('signoffForm').style.display = 'block';
  }

  init();
