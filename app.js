/**
 * Luxe Manhwa Tracker - Application Logic
 */

// ==========================================================================
// STATE MANAGEMENT & DATA LOCALSTORAGE INITIALIZATION
// ==========================================================================
let manhwas = [];
let currentFilter = 'all';
let currentSort = 'latest-read';
let searchQuery = '';
let currentView = 'grid'; // 'grid' | 'list'

// Default Mock Data for rich visual first-impression
const MOCK_DATA = [
  {
    id: 'mock-1',
    title: "Omniscient Reader's Viewpoint",
    chapter: 212,
    link: "https://www.webtoons.com/en/action/omniscient-reader/list?title_no=2154",
    lastReadDate: "2026-06-28",
    status: "reading",
    notes: "Dokja is trying to survive the scenarios. Best world-building in a modern manhwa.",
    linkStatus: "active"
  },
  {
    id: 'mock-2',
    title: "Solo Leveling",
    chapter: 179,
    link: "https://www.sololeveling-manga.com",
    lastReadDate: "2024-01-15",
    status: "completed",
    notes: "Completed. Absolutely legendary art style and shadow army concept. Must re-read someday.",
    linkStatus: "active"
  },
  {
    id: 'mock-3',
    title: "The Beginning After the End",
    chapter: 185,
    link: "https://tapas.io/series/tbate",
    lastReadDate: "2026-05-12",
    status: "on-hold",
    notes: "On hold during Arthur's new training arc. Waiting for chapters to pile up.",
    linkStatus: "active"
  }
];

// Initialize application data
function initApp() {
  const storedData = localStorage.getItem('luxe_manhwa_tracker_data');
  if (storedData) {
    try {
      manhwas = JSON.parse(storedData);
    } catch (e) {
      console.error("Error parsing stored manhwa data, fallback to mock data", e);
      manhwas = [...MOCK_DATA];
    }
  } else {
    manhwas = [...MOCK_DATA];
    saveData();
  }
  
  const storedView = localStorage.getItem('luxe_manhwa_tracker_view');
  if (storedView) {
    currentView = storedView;
  }
  
  // Trigger initial pings for links on load (non-blocking)
  manhwas.forEach(m => {
    if (m.link) {
      pingLink(m.id, m.link);
    }
  });

  // Set default date input in the form to today
  document.getElementById('input-date').value = getTodayString();
  
  render();
}

function saveData() {
  localStorage.setItem('luxe_manhwa_tracker_data', JSON.stringify(manhwas));
}

// Helper to get today's date formatted as YYYY-MM-DD
function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper to format date beautifully for display
function formatDateDisplay(dateStr) {
  if (!dateStr) return 'Never';
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr + 'T00:00:00'); // Prevent timezone shifts
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateStr;
  }
}

// ==========================================================================
// CRUD OPERATIONS
// ==========================================================================

function addOrUpdateManhwa(id, title, chapter, status, link, lastReadDate, notes) {
  const cleanLink = link ? link.trim() : "";
  const cleanTitle = title.trim();
  
  if (id) {
    // Update Mode
    manhwas = manhwas.map(m => {
      if (m.id === id) {
        const updated = {
          ...m,
          title: cleanTitle,
          chapter: parseInt(chapter) || 0,
          status,
          link: cleanLink,
          lastReadDate: lastReadDate || getTodayString(),
          notes: notes.trim()
        };
        // If link changed, trigger a re-check
        if (m.link !== cleanLink) {
          updated.linkStatus = 'checking';
          setTimeout(() => pingLink(id, cleanLink), 100);
        }
        return updated;
      }
      return m;
    });
  } else {
    // Add Mode
    const newId = 'manhwa_' + Date.now();
    const newManhwa = {
      id: newId,
      title: cleanTitle,
      chapter: parseInt(chapter) || 0,
      status,
      link: cleanLink,
      lastReadDate: lastReadDate || getTodayString(),
      notes: notes.trim(),
      linkStatus: cleanLink ? 'checking' : 'unknown'
    };
    manhwas.push(newManhwa);
    if (cleanLink) {
      setTimeout(() => pingLink(newId, cleanLink), 100);
    }
  }
  
  saveData();
  render();
}

function deleteManhwa(id) {
  if (confirm("Are you sure you want to remove this manhwa from your tracker?")) {
    manhwas = manhwas.filter(m => m.id !== id);
    saveData();
    render();
  }
}

function incrementChapter(id) {
  manhwas = manhwas.map(m => {
    if (m.id === id) {
      return {
        ...m,
        chapter: (m.chapter || 0) + 1,
        lastReadDate: getTodayString()
      };
    }
    return m;
  });
  saveData();
  render();
}

// Manual Toggle for reporting link broken
function toggleLinkBroken(id) {
  manhwas = manhwas.map(m => {
    if (m.id === id) {
      const current = m.linkStatus;
      const nextStatus = current === 'broken' ? 'active' : 'broken';
      return { ...m, linkStatus: nextStatus };
    }
    return m;
  });
  saveData();
  render();
}

// ==========================================================================
// SMART CLIENT-SIDE LINK PINGER
// ==========================================================================
async function pingLink(id, url) {
  if (!url) return;
  
  // Basic validation of URL structure
  try {
    new URL(url);
  } catch (e) {
    updateLinkState(id, 'broken');
    return;
  }

  // Update DOM status dot to 'checking'
  updateLinkState(id, 'checking');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

  try {
    // Fetch with no-cors. Since external manga sites block CORS,
    // this will succeed or throw. A DNS/network failure triggers an error.
    // A CORS block still returns a type: opaque response (which resolves!).
    await fetch(url, {
      mode: 'no-cors',
      signal: controller.signal
    });
    
    // If it didn't crash out, we assume it's active
    clearTimeout(timeoutId);
    updateLinkState(id, 'active');
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`Link verification failed for ${url}:`, err);
    // If aborted or failed network connection, flag as broken
    updateLinkState(id, 'broken');
  }
}

function updateLinkState(id, status) {
  // Update state
  let changed = false;
  manhwas = manhwas.map(m => {
    if (m.id === id && m.linkStatus !== status) {
      changed = true;
      return { ...m, linkStatus: status };
    }
    return m;
  });
  
  if (changed) {
    saveData();
    // Partially update card DOM to prevent redrawing everything and losing scroll/focus
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      const dot = card.querySelector('.status-dot');
      const brokenBadge = card.querySelector('.link-broken-badge');
      if (dot) {
        dot.className = `status-dot ${status}`;
        dot.title = `Link Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      }
      
      // Update warning badge visibility
      if (status === 'broken') {
        if (!brokenBadge) {
          const linkContainer = card.querySelector('.chapter-link-container');
          if (linkContainer) {
            const badge = document.createElement('span');
            badge.className = 'link-broken-badge';
            badge.innerHTML = `
              <svg class="icon" style="width: 10px; height: 10px; margin-right: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Broken Link?
            `;
            linkContainer.appendChild(badge);
          }
        }
      } else {
        if (brokenBadge) {
          brokenBadge.remove();
        }
      }
    }
  }
}

// ==========================================================================
// RENDER & DOM UPDATES
// ==========================================================================

function render() {
  const grid = document.getElementById('manhwa-grid');
  const emptyState = document.getElementById('empty-state');
  
  // Apply layout view class
  if (currentView === 'list') {
    grid.classList.add('list-view');
  } else {
    grid.classList.remove('list-view');
  }

  // Update view toggle button states
  const gridBtn = document.getElementById('view-grid-btn');
  const listBtn = document.getElementById('view-list-btn');
  if (gridBtn && listBtn) {
    if (currentView === 'list') {
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    } else {
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    }
  }
  
  // 1. Filter
  let filtered = manhwas.filter(m => {
    const matchesStatus = currentFilter === 'all' || m.status === currentFilter;
    const matchesSearch = searchQuery === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // 2. Sort
  filtered.sort((a, b) => {
    if (currentSort === 'latest-read') {
      const dateA = a.lastReadDate || '0000-00-00';
      const dateB = b.lastReadDate || '0000-00-00';
      return dateB.localeCompare(dateA); // Most recent first
    } else if (currentSort === 'alphabetical') {
      return a.title.localeCompare(b.title); // A-Z
    } else if (currentSort === 'chapters-count') {
      return (b.chapter || 0) - (a.chapter || 0); // High to low
    }
    return 0;
  });

  // 3. Update stats
  updateStats();

  // 4. Render Grid or Empty State
  if (filtered.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    
    // Adjust text based on query vs complete empty
    const isSearching = searchQuery !== '' || currentFilter !== 'all';
    emptyState.querySelector('h3').textContent = isSearching ? 'No matching manhwas' : 'No manhwas tracked yet';
    emptyState.querySelector('p').textContent = isSearching ? 'Try adjusting your search query or status filter.' : 'Start your reading list by adding a new manhwa.';
    emptyState.querySelector('#empty-add-btn').style.display = isSearching ? 'none' : 'inline-flex';
  } else {
    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');
    
    grid.innerHTML = filtered.map(m => {
      const statusTitle = m.status.replace('-', ' ');
      const formattedDate = formatDateDisplay(m.lastReadDate);
      const isBroken = m.linkStatus === 'broken';
      
      return `
        <div class="manhwa-card" data-id="${m.id}">
          <div class="card-header">
            <div class="card-title-area">
              <h3 class="card-title">${escapeHTML(m.title)}</h3>
              <span class="status-badge status-${m.status}">${statusTitle}</span>
            </div>
            
            <div class="card-actions-quick">
              <button class="btn-icon edit-card-btn" title="Edit Manhwa" aria-label="Edit details">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="card-body">
            <div class="detail-row">
              <span class="detail-label">Current Chapter</span>
              <span class="detail-value">Ch. ${m.chapter || 0}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Chapter Link</span>
              <span class="detail-value chapter-link-container">
                ${m.link ? `
                  <span class="status-dot ${m.linkStatus || 'unknown'}" title="Link Status: ${m.linkStatus || 'Unknown'}"></span>
                  <a href="${escapeHTML(m.link)}" target="_blank" rel="noopener noreferrer" class="chapter-link">Visit Link</a>
                  ${isBroken ? `
                    <span class="link-broken-badge" title="We detected a connection issue.">
                      <svg class="icon" style="width: 10px; height: 10px; margin-right: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      Broken Link?
                    </span>
                  ` : ''}
                ` : '<span class="detail-value" style="font-weight: normal; opacity: 0.5;">No link added</span>'}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Last Read</span>
              <span class="detail-value" title="${m.lastReadDate || ''}">${formattedDate}</span>
            </div>

            ${m.notes ? `<p class="card-notes">${escapeHTML(m.notes)}</p>` : ''}
          </div>

          <div class="card-actions">
            <button class="btn-icon delete-card-btn" title="Delete Manhwa" aria-label="Delete manhwa">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>

            <div class="primary-card-actions">
              ${m.link ? `
                <button class="quick-add-btn toggle-link-status-btn" title="Toggle broken flag manually">Flag Link</button>
              ` : ''}
              <button class="quick-add-btn plus-one-btn">+1 Chapter</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Reattach Event Listeners to cards
    attachCardListeners();
  }
}

function updateStats() {
  document.getElementById('stat-total').textContent = manhwas.length;
  
  const readingCount = manhwas.filter(m => m.status === 'reading').length;
  document.getElementById('stat-reading').textContent = readingCount;
  
  // Find latest active date
  let latestDate = null;
  manhwas.forEach(m => {
    if (m.lastReadDate) {
      if (!latestDate || m.lastReadDate > latestDate) {
        latestDate = m.lastReadDate;
      }
    }
  });
  
  document.getElementById('stat-last-active').textContent = latestDate ? formatDateDisplay(latestDate) : '—';
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================================================
// INTERACTIVE DOM EVENT HANDLERS & BINDING
// ==========================================================================

// Global Modals controllers
const modal = document.getElementById('manhwa-modal');
const modalTitle = document.getElementById('modal-title');
const manhwaForm = document.getElementById('manhwa-form');

function openModal(title, mode = 'add', data = null) {
  modalTitle.textContent = title;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
  
  if (mode === 'edit' && data) {
    document.getElementById('manhwa-id').value = data.id;
    document.getElementById('input-title').value = data.title;
    document.getElementById('input-chapter').value = data.chapter;
    document.getElementById('input-status').value = data.status;
    document.getElementById('input-link').value = data.link;
    document.getElementById('input-date').value = data.lastReadDate || getTodayString();
    document.getElementById('input-notes').value = data.notes || '';
  } else {
    manhwaForm.reset();
    document.getElementById('manhwa-id').value = '';
    document.getElementById('input-date').value = getTodayString();
  }
  document.getElementById('input-title').focus();
}

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Unlock scrolling
  manhwaForm.reset();
}

function attachCardListeners() {
  // Plus One Button
  document.querySelectorAll('.plus-one-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      incrementChapter(id);
    });
  });

  // Edit Button
  document.querySelectorAll('.edit-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      const manhwa = manhwas.find(m => m.id === id);
      if (manhwa) {
        openModal("Edit Manhwa Details", 'edit', manhwa);
      }
    });
  });

  // Delete Button
  document.querySelectorAll('.delete-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      deleteManhwa(id);
    });
  });

  // Toggle Link status flag manually
  document.querySelectorAll('.toggle-link-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      toggleLinkBroken(id);
    });
  });
}

// Bind Page Controllers
document.addEventListener('DOMContentLoaded', () => {
  initApp();

  // "Add Manhwa" click events
  document.getElementById('add-manhwa-btn').addEventListener('click', () => {
    openModal("Add New Manhwa", 'add');
  });

  document.getElementById('empty-add-btn').addEventListener('click', () => {
    openModal("Add New Manhwa", 'add');
  });

  // Close modals
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.getElementById('form-cancel').addEventListener('click', closeModal);
  
  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Form Submit
  manhwaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('manhwa-id').value;
    const title = document.getElementById('input-title').value;
    const chapter = document.getElementById('input-chapter').value;
    const status = document.getElementById('input-status').value;
    const link = document.getElementById('input-link').value;
    const lastReadDate = document.getElementById('input-date').value;
    const notes = document.getElementById('input-notes').value;

    addOrUpdateManhwa(id, title, chapter, status, link, lastReadDate, notes);
    closeModal();
  });

  // Search input change
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    render();
  });

  // Filter change
  const filterStatus = document.getElementById('filter-status');
  filterStatus.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    render();
  });

  // Sort change
  const sortBy = document.getElementById('sort-by');
  sortBy.addEventListener('change', (e) => {
    currentSort = e.target.value;
    render();
  });

  // View toggle handlers
  const gridBtn = document.getElementById('view-grid-btn');
  const listBtn = document.getElementById('view-list-btn');
  if (gridBtn && listBtn) {
    gridBtn.addEventListener('click', () => {
      if (currentView !== 'grid') {
        currentView = 'grid';
        localStorage.setItem('luxe_manhwa_tracker_view', 'grid');
        render();
      }
    });

    listBtn.addEventListener('click', () => {
      if (currentView !== 'list') {
        currentView = 'list';
        localStorage.setItem('luxe_manhwa_tracker_view', 'list');
        render();
      }
    });
  }
});
