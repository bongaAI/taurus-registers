// ── Date ──
const now = new Date();
const opts = { weekday:'short', year:'numeric', month:'short', day:'numeric' };
document.getElementById('navDate').textContent = now.toLocaleDateString('en-ZA', opts);
document.getElementById('footerDate').textContent = now.getFullYear();

// ── Elements ──
const searchInput  = document.getElementById('searchInput');
const searchClear  = document.getElementById('searchClear');
const noResults    = document.getElementById('noResults');
const cards        = Array.from(document.querySelectorAll('.register-card'));
const filterBtns   = Array.from(document.querySelectorAll('.filter-btn'));

let activeFilter = 'all';
let searchTerm   = '';

// ── Filter buttons ──
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

// ── Search ──
searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  searchClear.classList.toggle('visible', searchTerm.length > 0);
  applyFilters();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchTerm = '';
  searchClear.classList.remove('visible');
  applyFilters();
  searchInput.focus();
});

// Keyboard shortcut: / to focus search
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.blur();
  }
});

// ── Core filter + search logic ──
function applyFilters() {
  let visibleCount = 0;

  cards.forEach(card => {
    const cat   = card.dataset.cat || '';
    const title = (card.dataset.title || '').toLowerCase();
    const desc  = (card.dataset.desc  || '').toLowerCase();
    const tags  = (card.dataset.tags  || '').toLowerCase();

    const matchesFilter = activeFilter === 'all' || cat === activeFilter;
    const matchesSearch = !searchTerm ||
      title.includes(searchTerm) ||
      desc.includes(searchTerm)  ||
      tags.includes(searchTerm);

    const visible = matchesFilter && matchesSearch;
    card.classList.toggle('hidden', !visible);
    if (visible) visibleCount++;
  });

  // Show/hide no-results
  noResults.classList.toggle('visible', visibleCount === 0);

  // Re-apply highlight
  highlightSearch();
}

// ── Text highlight ──
function highlightSearch() {
  cards.forEach(card => {
    const titleEl = card.querySelector('.card-title');
    const descEl  = card.querySelector('.card-desc');
    if (!titleEl || !descEl) return;

    titleEl.innerHTML = highlight(card.dataset.title || '', searchTerm);
    descEl.innerHTML  = highlight(card.dataset.desc  || '', searchTerm);
  });
}

function highlight(text, term) {
  if (!term) return escHtml(text);
  const re  = new RegExp('(' + escRe(term) + ')', 'gi');
  return escHtml(text).replace(re, '<mark>$1</mark>');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Init ──
applyFilters();