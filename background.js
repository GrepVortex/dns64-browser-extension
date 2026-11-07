'use strict';

/* DNS64 Browser Extension – Hintergrund: Zustandsanzeige am Symbol
 * Kein Zähler (der läuft ins Unendliche), sondern AN/AUS wie beim Pi-hole-Add-on:
 *   ON  = Blocklisten greifen
 *   OFF = pausiert
 *   !   = Node antwortet nicht / Key abgelehnt
 */

const DEFAULTS = { baseUrl: 'http://192.168.1.4:8080' };
const AUTH_COOLDOWN_MS = 15 * 60 * 1000; // nach 401 keine neuen Versuche

const BADGE_ON = { text: 'ON', color: '#17864a' };   // weiß auf grün 4,6:1
const BADGE_OFF = { text: 'OFF', color: '#a05d00' }; // weiß auf amber 5,2:1
const BADGE_ERR = { text: '!', color: '#b91c1c' };

async function setBadge(b, title) {
  await chrome.action.setBadgeText({ text: b.text });
  await chrome.action.setBadgeBackgroundColor({ color: b.color });
  await chrome.action.setBadgeTextColor({ color: '#ffffff' });
  if (title) await chrome.action.setTitle({ title });
}

async function refreshBadge() {
  const cfg = await chrome.storage.local.get({ ...DEFAULTS, apiKey: '', apiAuthFailAt: 0 });
  if (!cfg.apiKey) {
    await chrome.action.setBadgeText({ text: '' });
    await chrome.action.setTitle({ title: 'DNS64 Browser Extension – noch nicht eingerichtet' });
    return;
  }
  const base = (cfg.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, '');
  const headers = { Authorization: 'Bearer ' + cfg.apiKey };

  // Die Node sperrt nach mehreren ungültigen Keys die Adresse (429).
  // Deshalb nach einem 401 eine Weile gar nichts fragen.
  if (cfg.apiAuthFailAt && Date.now() - cfg.apiAuthFailAt < AUTH_COOLDOWN_MS) return;

  let res;
  try {
    res = await fetch(base + '/api/dns64/status', { headers, cache: 'no-store' });
  } catch {
    await setBadge(BADGE_ERR, 'DNS64 Browser Extension – Node nicht erreichbar');
    return;
  }

  if (res.status === 401) {
    await chrome.storage.local.set({ apiAuthFailAt: Date.now() });
    await setBadge(BADGE_ERR, 'DNS64 Browser Extension – API-Key ungültig');
    return;
  }
  if (!res.ok) {
    await setBadge(BADGE_ERR, 'DNS64 Browser Extension – Node antwortet mit HTTP ' + res.status);
    return;
  }

  let st = null;
  try { st = await res.json(); } catch { /* wird unten als Fehler behandelt */ }
  if (!st) {
    await setBadge(BADGE_ERR, 'DNS64 Browser Extension – unerwartete Antwort');
    return;
  }

  const blocking = st.blocking || {};
  if (blocking.paused) {
    const until = blocking.until_resumed || !blocking.paused_until
      ? 'bis zum Wiedereinschalten'
      : 'bis ' + new Date(blocking.paused_until).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    await setBadge(BADGE_OFF, `DNS64: Blockieren pausiert (${until})`);
  } else {
    await setBadge(BADGE_ON, 'DNS64: Blockieren aktiv');
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('badge', { periodInMinutes: 1 });
  refreshBadge();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('badge', { periodInMinutes: 1 });
  refreshBadge();
});

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === 'badge') refreshBadge();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'refresh-badge') {
    refreshBadge().then(() => sendResponse({ ok: true }), () => sendResponse({ ok: false }));
    return true;
  }
  return false;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.apiKey || changes.baseUrl) {
    // neuer Key: Sperre aufheben, sofort neu fragen
    chrome.storage.local.remove('apiAuthFailAt').then(refreshBadge);
  }
});
