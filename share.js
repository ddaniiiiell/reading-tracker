/** Standalone public viewer: it loads only the snapshot in the URL fragment. */
async function renderSharedTierList() {
  const message = document.getElementById('shared-tier-message');
  const board = document.getElementById('shared-tier-board');
  try {
    const encoded = new URLSearchParams(window.location.hash.slice(1)).get('tier');
    const snapshot = await decodeTierShareSnapshot(encoded);
    document.getElementById('shared-tier-title').textContent = snapshot.name;
    document.title = `${snapshot.name} · Reading Tracker`;

    for (const row of snapshot.rows) {
      const rowElement = document.createElement('div');
      rowElement.className = 'tier-row';

      const label = document.createElement('div');
      label.className = `tier-label tier-label-${row.tier}`;
      label.textContent = row.tier;
      rowElement.appendChild(label);

      const items = document.createElement('div');
      items.className = 'tier-row-items';
      for (const item of row.items) {
        const card = document.createElement(item.link ? 'a' : 'div');
        card.className = `shared-tier-card tier-cover${item.link ? ' shared-tier-card-link' : ''}`;
        const palette = getTierCoverPalette(item.title);
        card.style.setProperty('--cover-base', palette.base);
        card.style.setProperty('--cover-glow', palette.glow);
        card.style.setProperty('--cover-accent', palette.accent);
        if (item.link) {
          card.href = item.link;
          card.target = '_blank';
          card.rel = 'noopener noreferrer';
          card.referrerPolicy = 'no-referrer';
          card.setAttribute('aria-label', `Open saved reading link for ${item.title}`);
        }
        const kicker = document.createElement('span');
        kicker.className = 'tier-cover-kicker';
        kicker.textContent = 'MANHWA';
        card.appendChild(kicker);
        const title = document.createElement('span');
        title.className = 'tier-cover-title';
        title.textContent = item.title;
        card.appendChild(title);
        if (item.link) {
          const source = document.createElement('span');
          source.className = 'shared-tier-card-source tier-cover-imprint';
          source.textContent = `${new URL(item.link).hostname.replace(/^www\./i, '')} ↗`;
          card.appendChild(source);
        } else {
          const imprint = document.createElement('span');
          imprint.className = 'tier-cover-imprint';
          imprint.textContent = 'LUXE NOIR';
          card.appendChild(imprint);
        }
        items.appendChild(card);
      }
      if (!row.items.length) {
        const empty = document.createElement('span');
        empty.className = 'tier-drop-hint';
        empty.textContent = '—';
        items.appendChild(empty);
      }
      rowElement.appendChild(items);
      board.appendChild(rowElement);
    }
    message.textContent = 'This list is a snapshot. Later changes to the creator’s library will not change it.';
  } catch (error) {
    console.warn('Could not open shared tier list.', error);
    message.textContent = error instanceof Error ? error.message : 'This tier list link is invalid.';
    board.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', renderSharedTierList);
