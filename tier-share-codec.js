/** A share link contains a frozen tier list. Its fragment is never sent to the web host. */
const TIER_SHARE_IDS = ['S', 'A', 'B', 'C', 'D', 'F'];
const TIER_SHARE_MAX_BYTES = 120_000;
const TIER_SHARE_MAX_ITEMS = 500;
const TIER_COVER_PALETTES = [
  { base: '#1b2d33', glow: '#385a62', accent: '#d9b985' },
  { base: '#282039', glow: '#59405d', accent: '#e7b5b5' },
  { base: '#263b31', glow: '#4c6b56', accent: '#d3c39a' },
  { base: '#3e2929', glow: '#76504a', accent: '#f3c6ad' },
  { base: '#23354a', glow: '#4d637d', accent: '#bdd5e0' },
  { base: '#3c3040', glow: '#6c556b', accent: '#dbc2d3' }
];

function getTierCoverPalette(title) {
  let hash = 0;
  for (const character of title) hash = ((hash * 31) + character.codePointAt(0)) >>> 0;
  return TIER_COVER_PALETTES[hash % TIER_COVER_PALETTES.length];
}

function safeTierShareUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    return url.href;
  } catch {
    return '';
  }
}

function normalizeTierShareSnapshot(value) {
  if (!value || value.v !== 1 || typeof value.name !== 'string'
      || !Array.isArray(value.rows) || value.rows.length !== TIER_SHARE_IDS.length) {
    throw new Error('This tier list link is invalid.');
  }
  let itemCount = 0;
  const rows = value.rows.map((row, index) => {
    if (!row || row.tier !== TIER_SHARE_IDS[index] || !Array.isArray(row.items)) {
      throw new Error('This tier list link is invalid.');
    }
    const items = row.items.map(item => {
      if (!item || typeof item.title !== 'string' || !item.title.trim()) {
        throw new Error('This tier list link is invalid.');
      }
      if (item.title.length > 300) throw new Error('A title is too long to share as a link.');
      itemCount += 1;
      if (itemCount > TIER_SHARE_MAX_ITEMS) throw new Error('This tier list is too large to open.');
      return {
        title: item.title.trim(),
        link: safeTierShareUrl(item.link)
      };
    });
    return { tier: row.tier, items };
  });
  return { v: 1, name: value.name.trim().slice(0, 80) || 'Manhwa Tier List', rows };
}

function tierBytesToBase64Url(bytes) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function tierBase64UrlToBytes(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function encodeTierShareSnapshot(value) {
  const snapshot = normalizeTierShareSnapshot(value);
  const raw = new TextEncoder().encode(JSON.stringify(snapshot));
  if (raw.length > TIER_SHARE_MAX_BYTES) throw new Error('This tier list is too large to share as a link.');
  if (typeof CompressionStream === 'function') {
    const compressed = new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'));
    return `g.${tierBytesToBase64Url(new Uint8Array(await new Response(compressed).arrayBuffer()))}`;
  }
  return `j.${tierBytesToBase64Url(raw)}`;
}

async function decodeTierShareSnapshot(encoded) {
  if (typeof encoded !== 'string' || encoded.length > TIER_SHARE_MAX_BYTES * 2) {
    throw new Error('This tier list link is too large or invalid.');
  }
  const [format, payload] = encoded.split('.', 2);
  if (!payload || !['g', 'j'].includes(format)) throw new Error('This tier list link is invalid.');
  const bytes = tierBase64UrlToBytes(payload);
  let raw = bytes;
  if (format === 'g') {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('This browser cannot open compressed tier list links.');
    }
    const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
    const chunks = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > TIER_SHARE_MAX_BYTES) {
        await reader.cancel();
        throw new Error('This tier list link is too large.');
      }
      chunks.push(value);
    }
    raw = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      raw.set(chunk, offset);
      offset += chunk.length;
    }
  }
  if (raw.length > TIER_SHARE_MAX_BYTES) throw new Error('This tier list link is too large.');
  return normalizeTierShareSnapshot(JSON.parse(new TextDecoder().decode(raw)));
}
