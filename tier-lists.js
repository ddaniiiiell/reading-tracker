/** Tier lists are separate from reading progress. Only ranked titles appear in exports. */
const TIER_STORAGE_KEY = 'luxe_manhwa_tier_lists_v1';
const PUBLIC_TIER_SHARE_PAGE = 'https://ddaniiiiell.github.io/reading-tracker/share.html';
const TIERS = [
  { id: 'S', color: '#edaa94' },
  { id: 'A', color: '#edc89c' },
  { id: 'B', color: '#e9dda4' },
  { id: 'C', color: '#bcd9ad' },
  { id: 'D', color: '#a8c9d2' },
  { id: 'F', color: '#bcb7d4' }
];
const TIER_IDS = new Set(TIERS.map(tier => tier.id));
let tierState = {
  updatedAt: 0,
  activeId: 'default',
  lists: [{ id: 'default', name: 'My Manhwa Tier List', rankings: {} }]
};
let tierListsInitialized = false;
let tierSearchQuery = '';
let tierCloudSaveTimer = null;
let tierLastSentAt = 0;
let tierCloudSaving = false;
let lastTierShareSnapshotJSON = '';
let tierNameEditorMode = null;
let tierNameTargetId = null;

function normalizeTierState(value) {
  if (!value || !Array.isArray(value.lists)) return null;
  const lists = value.lists.filter(list => list && typeof list.id === 'string')
    .map(list => ({
      id: list.id,
      name: typeof list.name === 'string' && list.name.trim() ? list.name.trim().slice(0, 80) : 'Untitled List',
      rankings: Object.fromEntries(Object.entries(list.rankings || {})
        .filter(([id, tier]) => typeof id === 'string' && TIER_IDS.has(tier)))
    }));
  if (!lists.length) return null;
  const activeId = lists.some(list => list.id === value.activeId) ? value.activeId : lists[0].id;
  return {
    updatedAt: Number.isFinite(value.updatedAt) ? value.updatedAt : 0,
    activeId,
    lists
  };
}

function getActiveTierList() {
  return tierState.lists.find(list => list.id === tierState.activeId) || tierState.lists[0];
}

function setTierStatus(message) {
  const status = document.getElementById('tier-save-status');
  if (status) status.textContent = message;
}

function persistTierState() {
  localStorage.setItem(TIER_STORAGE_KEY, JSON.stringify(tierState));
}

function resetTierCloudSync() {
  tierLastSentAt = 0;
  setTierStatus(tierState.updatedAt ? 'Saved on this device' : 'Create a list by ranking a title.');
}

function touchTierState() {
  tierState.updatedAt = Math.max(Date.now(), tierState.updatedAt + 1);
  persistTierState();
  document.getElementById('tier-link-output').classList.add('hidden');
  renderTierLists();
  setTierStatus(cloudSync.trackerDocRef ? 'Saved on this device · Syncing to your account…' : 'Saved on this device');
  clearTimeout(tierCloudSaveTimer);
  tierCloudSaveTimer = setTimeout(saveTierListsToCloud, 400);
}

async function saveTierListsToCloud() {
  if (!cloudSync.trackerDocRef || tierState.updatedAt === 0 || tierCloudSaving
      || tierLastSentAt === tierState.updatedAt) return;
  const stateToSave = JSON.parse(JSON.stringify(tierState));
  tierLastSentAt = stateToSave.updatedAt;
  tierCloudSaving = true;
  let saved = false;
  try {
    await cloudSync.modules.firestoreModule.setDoc(
      cloudSync.trackerDocRef, { tierLists: stateToSave }, { merge: true }
    );
    saved = true;
    if (tierState.updatedAt === stateToSave.updatedAt) {
      setTierStatus('Saved to your account');
    }
  } catch (error) {
    tierLastSentAt = 0;
    setTierStatus('Saved on this device · Account sync failed');
    console.warn('Could not sync tier lists to Firestore.', error);
  } finally {
    tierCloudSaving = false;
    if (saved && cloudSync.trackerDocRef && tierLastSentAt !== tierState.updatedAt) saveTierListsToCloud();
  }
}

function syncTierListsFromCloud(remoteValue) {
  const remote = normalizeTierState(remoteValue);
  if (remote && remote.updatedAt > tierState.updatedAt) {
    tierState = remote;
    persistTierState();
    renderTierLists();
    setTierStatus('Saved to your account');
  } else if (tierState.updatedAt > (remote?.updatedAt || 0)) {
    saveTierListsToCloud();
  } else if (remote) {
    setTierStatus('Saved to your account');
  }
}

function getTierEligibleManhwas() {
  return manhwas.filter(manhwa => manhwa && manhwa.id && manhwa.title
    && manhwa.status !== 'plan-to-read');
}

function tierLastReadTime(manhwa) {
  const timestamp = Date.parse(manhwa.lastReadDate || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function buildTierShareSnapshot() {
  const list = getActiveTierList();
  const eligible = getTierEligibleManhwas().sort((a, b) => a.title.localeCompare(b.title));
  return {
    v: 1,
    name: list.name,
    rows: TIERS.map(tier => ({
      tier: tier.id,
      items: eligible.filter(manhwa => list.rankings[manhwa.id] === tier.id)
        .map(manhwa => ({ title: manhwa.title, link: safeTierShareUrl(manhwa.link) }))
    }))
  };
}

function getTierSharePageUrl() {
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  return localHosts.has(window.location.hostname)
    ? PUBLIC_TIER_SHARE_PAGE
    : new URL('share.html', window.location.href).href.split('#')[0];
}

async function copyTierShareLink() {
  try {
    const snapshot = buildTierShareSnapshot();
    if (!snapshot.rows.some(row => row.items.length)) return;
    const encoded = await encodeTierShareSnapshot(snapshot);
    const url = `${getTierSharePageUrl()}#tier=${encoded}`;
    if (url.length > 32_000) {
      setTierStatus('This list makes a very long link. Share the PNG instead.');
      return;
    }
    const output = document.getElementById('tier-link-output');
    const input = document.getElementById('tier-link-input');
    input.value = url;
    output.classList.remove('hidden');
    lastTierShareSnapshotJSON = JSON.stringify(snapshot);
    try {
      await navigator.clipboard.writeText(url);
      setTierStatus('Static share link copied');
    } catch {
      input.focus();
      input.select();
      setTierStatus('Share link is ready · Copy the selected text');
    }
  } catch (error) {
    console.warn('Could not create tier list link.', error);
    setTierStatus(error instanceof Error ? error.message : 'The share link could not be created.');
  }
}

function removeManhwasFromTierLists(ids) {
  if (!ids.length) return;
  let changed = false;
  for (const list of tierState.lists) {
    for (const id of ids) {
      if (Object.prototype.hasOwnProperty.call(list.rankings, id)) {
        delete list.rankings[id];
        changed = true;
      }
    }
  }
  if (changed) touchTierState();
}

function tierCardHTML(manhwa, tierId) {
  const choices = [`<option value="unranked"${tierId === 'unranked' ? ' selected' : ''}>Unranked</option>`]
    .concat(TIERS.map(tier => `<option value="${tier.id}"${tierId === tier.id ? ' selected' : ''}>${tier.id} tier</option>`));
  const palette = getTierCoverPalette(manhwa.title);
  return `<div class="tier-card" draggable="true" data-id="${escapeHTML(manhwa.id)}">
    <div class="tier-cover" style="--cover-base:${palette.base};--cover-glow:${palette.glow};--cover-accent:${palette.accent}">
      <span class="tier-cover-kicker">MANHWA</span>
      <span class="tier-cover-title">${escapeHTML(manhwa.title)}</span>
      <span class="tier-cover-imprint">LUXE NOIR</span>
    </div>
    <select aria-label="Tier for ${escapeHTML(manhwa.title)}">${choices.join('')}</select>
  </div>`;
}

function renderTierLists() {
  if (!tierListsInitialized) return;
  const list = getActiveTierList();
  const select = document.getElementById('tier-list-select');
  select.innerHTML = tierState.lists.map(item =>
    `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)}</option>`).join('');
  select.value = list.id;

  const eligible = getTierEligibleManhwas().sort((a, b) => a.title.localeCompare(b.title));
  const board = document.getElementById('tier-board');
  board.innerHTML = TIERS.map(tier => {
    const cards = eligible.filter(manhwa => list.rankings[manhwa.id] === tier.id)
      .map(manhwa => tierCardHTML(manhwa, tier.id)).join('');
    return `<div class="tier-row" data-tier="${tier.id}">
      <div class="tier-label tier-label-${tier.id}">${tier.id}</div>
      <div class="tier-row-items">${cards || '<span class="tier-drop-hint">Drop titles here</span>'}</div>
    </div>`;
  }).join('');

  const unranked = eligible.filter(manhwa => !TIER_IDS.has(list.rankings[manhwa.id]))
    .sort((a, b) => tierLastReadTime(b) - tierLastReadTime(a)
      || a.title.localeCompare(b.title));
  document.getElementById('tier-unranked-count').textContent = `(${unranked.length})`;
  const visible = unranked.filter(manhwa =>
    manhwa.title.toLowerCase().includes(tierSearchQuery.toLowerCase()));
  document.getElementById('tier-unranked').innerHTML = visible.length
    ? visible.map(manhwa => tierCardHTML(manhwa, 'unranked')).join('')
    : `<p class="tier-empty">${unranked.length ? 'No titles match your search.' : 'All eligible titles have been ranked.'}</p>`;

  const hasRanked = eligible.some(manhwa => TIER_IDS.has(list.rankings[manhwa.id]));
  const output = document.getElementById('tier-link-output');
  if (!output.classList.contains('hidden')
      && JSON.stringify(buildTierShareSnapshot()) !== lastTierShareSnapshotJSON) {
    output.classList.add('hidden');
  }
  document.getElementById('tier-copy-link-btn').disabled = !hasRanked;
  document.getElementById('tier-share-btn').disabled = !hasRanked;
  document.getElementById('tier-download-btn').disabled = !hasRanked;
}

function assignManhwaTier(manhwaId, tierId) {
  if (tierId !== 'unranked' && !TIER_IDS.has(tierId)) return;
  if (!getTierEligibleManhwas().some(manhwa => manhwa.id === manhwaId)) return;
  const rankings = getActiveTierList().rankings;
  if ((rankings[manhwaId] || 'unranked') === tierId) return;
  if (tierId === 'unranked') delete rankings[manhwaId];
  else rankings[manhwaId] = tierId;
  touchTierState();
}

function switchTrackerSection(section) {
  const showingTiers = section === 'tiers';
  if (!showingTiers) closeTierNameEditor();
  document.getElementById('library-view').classList.toggle('hidden', showingTiers);
  document.getElementById('tier-lists-view').classList.toggle('hidden', !showingTiers);
  document.getElementById('library-tab').classList.toggle('active', !showingTiers);
  document.getElementById('tier-lists-tab').classList.toggle('active', showingTiers);
  if (showingTiers) {
    document.getElementById('library-tab').removeAttribute('aria-current');
    document.getElementById('tier-lists-tab').setAttribute('aria-current', 'page');
  } else {
    document.getElementById('library-tab').setAttribute('aria-current', 'page');
    document.getElementById('tier-lists-tab').removeAttribute('aria-current');
  }
  document.getElementById('add-manhwa-btn').classList.toggle('hidden', showingTiers);
  if (showingTiers) renderTierLists();
  localStorage.setItem('luxe_manhwa_tracker_section', section);
}

function openTierNameEditor(mode) {
  const list = getActiveTierList();
  tierNameEditorMode = mode;
  tierNameTargetId = mode === 'rename' ? list.id : null;
  document.getElementById('tier-name-label').textContent = mode === 'new' ? 'New list name' : 'Rename list';
  document.getElementById('tier-name-save-btn').textContent = mode === 'new' ? 'Create List' : 'Save Name';
  const input = document.getElementById('tier-name-input');
  input.value = mode === 'new' ? 'New Tier List' : list.name;
  document.getElementById('tier-name-form').classList.remove('hidden');
  input.focus();
  input.select();
}

function closeTierNameEditor() {
  tierNameEditorMode = null;
  tierNameTargetId = null;
  document.getElementById('tier-name-form').classList.add('hidden');
}

function wrapTierExportText(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = '';
    for (const char of word) {
      if (ctx.measureText(current + char).width > maxWidth && current) {
        lines.push(current);
        current = '';
      }
      current += char;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function buildTierExportCanvas() {
  const list = getActiveTierList();
  const eligible = getTierEligibleManhwas().sort((a, b) => a.title.localeCompare(b.title));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 1400;
  const margin = 42;
  const labelWidth = 100;
  const gap = 10;
  const columns = 7;
  const cardWidth = (width - margin * 2 - labelWidth - 36 - gap * (columns - 1)) / columns;
  const cardLineHeight = 23;
  ctx.font = '700 25px Arial, sans-serif';
  const titleLines = wrapTierExportText(ctx, list.name, width - margin * 2);
  const headerHeight = 95 + titleLines.length * 36;
  ctx.font = '700 18px Arial, sans-serif';
  const rows = TIERS.map(tier => {
    const cards = eligible.filter(manhwa => list.rankings[manhwa.id] === tier.id)
      .map(manhwa => ({
        title: manhwa.title,
        palette: getTierCoverPalette(manhwa.title),
        lines: wrapTierExportText(ctx, manhwa.title, cardWidth - 28)
      }));
    cards.forEach(card => { card.height = Math.max(214, 70 + card.lines.length * cardLineHeight); });
    const cardRows = [];
    for (let index = 0; index < cards.length; index += columns) {
      const group = cards.slice(index, index + columns);
      cardRows.push({ cards: group, height: Math.max(...group.map(card => card.height)) });
    }
    const cardsHeight = cardRows.reduce((sum, cardRow) => sum + cardRow.height, 0)
      + Math.max(0, cardRows.length - 1) * gap;
    return { ...tier, cardRows, height: Math.max(80, 28 + cardsHeight) };
  });
  canvas.width = width;
  canvas.height = headerHeight + rows.reduce((sum, row) => sum + row.height + 8, 0) + 44;

  ctx.fillStyle = '#f6f2e9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#6d7068';
  ctx.font = '700 15px Arial, sans-serif';
  ctx.fillText('LUXE MANHWA TRACKER  /  TIER LIST', margin, 43);
  ctx.fillStyle = '#10201d';
  ctx.font = '700 25px Arial, sans-serif';
  titleLines.forEach((line, index) => ctx.fillText(line, margin, 83 + index * 36));

  let y = headerHeight;
  for (const row of rows) {
    ctx.fillStyle = '#fffdfa';
    ctx.fillRect(margin, y, width - margin * 2, row.height);
    ctx.fillStyle = row.color;
    ctx.fillRect(margin, y, labelWidth, row.height);
    ctx.fillStyle = '#17201c';
    ctx.font = '700 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(row.id, margin + labelWidth / 2, y + row.height / 2 + 17);
    ctx.textAlign = 'left';

    let cardY = y + 14;
    for (const cardRow of row.cardRows) {
      cardRow.cards.forEach((card, index) => {
        const cardX = margin + labelWidth + 18 + index * (cardWidth + gap);
        const gradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardRow.height);
        gradient.addColorStop(0, card.palette.glow);
        gradient.addColorStop(1, card.palette.base);
        ctx.fillStyle = gradient;
        ctx.fillRect(cardX, cardY, cardWidth, cardRow.height);
        ctx.strokeStyle = card.palette.accent;
        ctx.lineWidth = 1;
        ctx.strokeRect(cardX + 7, cardY + 7, cardWidth - 14, cardRow.height - 14);
        ctx.fillStyle = card.palette.accent;
        ctx.textAlign = 'center';
        ctx.font = '700 10px Arial, sans-serif';
        ctx.fillText('MANHWA', cardX + cardWidth / 2, cardY + 26);
        ctx.fillText('LUXE NOIR', cardX + cardWidth / 2, cardY + cardRow.height - 18);
        ctx.fillStyle = '#fffaf1';
        ctx.font = '700 18px Arial, sans-serif';
        const firstLineY = cardY + 55 + Math.max(0, (cardRow.height - 70 - card.lines.length * cardLineHeight) / 2);
        card.lines.forEach((line, lineIndex) =>
          ctx.fillText(line, cardX + cardWidth / 2, firstLineY + lineIndex * cardLineHeight));
        ctx.textAlign = 'left';
      });
      cardY += cardRow.height + gap;
    }
    y += row.height + 8;
  }
  return canvas;
}

function downloadTierBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function exportTierList(share) {
  const canvas = buildTierExportCanvas();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) {
    setTierStatus('The image could not be created. Please try again.');
    return;
  }
  const list = getActiveTierList();
  const filename = `${list.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'manhwa-tier-list'}.png`;
  const file = new File([blob], filename, { type: 'image/png' });
  if (share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: list.name, files: [file] });
      setTierStatus('Image shared');
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
      console.warn('System sharing was unavailable; downloading the image instead.', error);
    }
  }
  downloadTierBlob(blob, filename);
  setTierStatus('PNG downloaded · Send it to your friends');
}

function initTierLists() {
  try {
    tierState = normalizeTierState(JSON.parse(localStorage.getItem(TIER_STORAGE_KEY))) || tierState;
  } catch (error) {
    console.warn('Saved tier lists could not be read.', error);
  }
  tierListsInitialized = true;
  setTierStatus(tierState.updatedAt ? 'Saved on this device' : 'Create a list by ranking a title.');

  document.getElementById('library-tab').addEventListener('click', () => switchTrackerSection('library'));
  document.getElementById('tier-lists-tab').addEventListener('click', () => switchTrackerSection('tiers'));
  document.getElementById('tier-list-select').addEventListener('change', event => {
    closeTierNameEditor();
    tierState.activeId = event.target.value;
    touchTierState();
  });
  document.getElementById('tier-new-btn').addEventListener('click', () => openTierNameEditor('new'));
  document.getElementById('tier-rename-btn').addEventListener('click', () => openTierNameEditor('rename'));
  document.getElementById('tier-name-cancel-btn').addEventListener('click', closeTierNameEditor);
  document.getElementById('tier-name-form').addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeTierNameEditor();
    }
  });
  document.getElementById('tier-name-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('tier-name-input').value.trim().slice(0, 80);
    if (!name) {
      setTierStatus('Enter a name for your list.');
      document.getElementById('tier-name-input').focus();
      return;
    }
    const mode = tierNameEditorMode;
    const targetId = tierNameTargetId;
    closeTierNameEditor();
    if (mode === 'new') {
      const id = `tier_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      tierState.lists.push({ id, name, rankings: {} });
      tierState.activeId = id;
      tierSearchQuery = '';
      document.getElementById('tier-search').value = '';
      touchTierState();
    } else if (mode === 'rename') {
      const list = tierState.lists.find(item => item.id === targetId);
      if (list && name !== list.name) {
        list.name = name;
        touchTierState();
      }
    }
  });
  document.getElementById('tier-delete-btn').addEventListener('click', () => {
    const list = getActiveTierList();
    if (!confirm(`Delete tier list "${list.name}"? Your reading library will stay intact.`)) return;
    closeTierNameEditor();
    tierState.lists = tierState.lists.filter(item => item.id !== list.id);
    if (!tierState.lists.length) {
      tierState.lists.push({ id: `tier_${Date.now()}`, name: 'My Manhwa Tier List', rankings: {} });
    }
    tierState.activeId = tierState.lists[0].id;
    touchTierState();
  });
  document.getElementById('tier-search').addEventListener('input', event => {
    tierSearchQuery = event.target.value;
    renderTierLists();
  });
  document.getElementById('tier-lists-view').addEventListener('change', event => {
    const card = event.target.closest('.tier-card');
    if (card && event.target.matches('select')) assignManhwaTier(card.dataset.id, event.target.value);
  });
  document.getElementById('tier-lists-view').addEventListener('dragstart', event => {
    const card = event.target.closest('.tier-card');
    if (!card) return;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', card.dataset.id);
    card.classList.add('dragging');
  });
  document.getElementById('tier-lists-view').addEventListener('dragend', event => {
    event.target.closest('.tier-card')?.classList.remove('dragging');
    document.querySelectorAll('.tier-drop-active').forEach(target => target.classList.remove('tier-drop-active'));
  });
  document.getElementById('tier-lists-view').addEventListener('dragover', event => {
    const target = event.target.closest('[data-tier]');
    if (!target) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.tier-drop-active').forEach(item => item.classList.remove('tier-drop-active'));
    target.classList.add('tier-drop-active');
  });
  document.getElementById('tier-lists-view').addEventListener('drop', event => {
    const target = event.target.closest('[data-tier]');
    if (!target) return;
    event.preventDefault();
    target.classList.remove('tier-drop-active');
    assignManhwaTier(event.dataTransfer.getData('text/plain'), target.dataset.tier);
  });
  document.getElementById('tier-share-btn').addEventListener('click', () => exportTierList(true));
  document.getElementById('tier-download-btn').addEventListener('click', () => exportTierList(false));
  document.getElementById('tier-copy-link-btn').addEventListener('click', copyTierShareLink);
  switchTrackerSection(localStorage.getItem('luxe_manhwa_tracker_section') === 'tiers' ? 'tiers' : 'library');
}
