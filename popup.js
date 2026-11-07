'use strict';

import { initTheme } from './theme.js';

/* DNS64 Browser Extension – Popup
 * Spricht die lokale API von Node64 (/api/dns64/...) mit API-Key.
 */

const DEFAULTS = { baseUrl: 'http://192.168.1.4:8080', apiKey: '' };
const EXT_VERSION = chrome.runtime.getManifest().version;
const $ = (id) => document.getElementById(id);
const nf = new Intl.NumberFormat('de-DE');

const S = {
  host: null,          // Domain des aktiven Tabs
  site: null,          // { kind, reason, count }
  paused: false,
  pausedUntil: null,   // Date oder null
  untilResumed: false,
  version: null,
  blocklistSize: 0,
  listsLoadedAt: null,
  summary: null,
  busy: false,
  authFail: false,
};

/* ------------------------------------------------------------------ API */

function getConfig() {
  return new Promise((res) => {
    chrome.storage.local.get(DEFAULTS, (s) => {
      res({
        baseUrl: (s.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, ''),
        apiKey: s.apiKey || '',
      });
    });
  });
}

class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status || 0; }
}

async function api(path, opts = {}) {
  const { baseUrl, apiKey } = await getConfig();
  const headers = { Authorization: `Bearer ${apiKey}` };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(baseUrl + '/api' + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Node nicht erreichbar: ' + baseUrl, 0);
  }

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!res.ok) {
    // Meldungen der Node übernehmen, wo sie genauer sind (z. B. 503 "Sperrliste nicht geladen")
    const serverMsg = (data && data.error) || '';
    let msg = serverMsg || ('HTTP ' + res.status);
    if (res.status === 401) msg = 'API-Key ungültig oder gelöscht';
    else if (res.status === 403) msg = 'Zugriff verweigert (CSRF fehlt)';
    else if (res.status === 404) msg = 'Nicht gefunden – ist das DNS64-Modul an?';
    else if (res.status === 503) msg = 'Dienst nicht bereit' + (serverMsg ? ': ' + serverMsg : '');
    else if (res.status === 429) msg = 'Zu viele Anfragen – bitte kurz warten';
    throw new ApiError(msg, res.status);
  }
  return data;
}

/* --------------------------------------------------------------- Helfer */

// Blockgrund aus dem Log lesbar machen ("group:xyz" -> "Gerätegruppe xyz")
function reasonText(reason) {
  const s = String(reason || '');
  if (s.startsWith('group:')) return 'Gerätegruppe ' + s.slice(6);
  if (s.startsWith('cat:')) return 'Kategorie ' + s.slice(4);
  return s || 'Blockliste';
}

function matchesName(host, pattern) {
  const p = (pattern || '').toLowerCase();
  if (!p) return false;
  if (p.startsWith('*.')) return host === p.slice(2) || host.endsWith(p.slice(1));
  return host === p || host.endsWith('.' + p);
}

function parentDomain(host) {
  const p = host.split('.');
  return p.length > 2 ? p.slice(-2).join('.') : host;
}

function hostOf(url) {
  try { return new URL(url).host; } catch { return url; }
}

function clockText(d) {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function remainText(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

let toastTimer = null;
function toast(msg, kind) {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast show ' + (kind || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast ' + (kind || ''); }, 3200);
}

function setBusy(on) {
  S.busy = on;
  $('btnAllow').disabled = on || !canAct();
  $('btnDeny').disabled = on || !canAct();
  $('toggle').disabled = on;
}

const canAct = () => !!S.host && S.host.indexOf('.') > 0 && !isIP(S.host);

function isIPv4(h) {
  const parts = h.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}
const isIP = (h) => isIPv4(h) || h.indexOf(':') >= 0;

/* ------------------------------------------------------------- Aktiver Tab */

async function activeHost() {
  const q = new URLSearchParams(location.search).get('site'); // Dev-Hilfe: ?site=example.com
  if (q) return q.trim().toLowerCase();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return null;
    const u = new URL(tab.url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------- Status */

async function loadStatus() {
  const st = await api('/dns64/status');
  S.paused = !!(st && st.blocking && st.blocking.paused);
  S.untilResumed = !!(st && st.blocking && st.blocking.until_resumed);
  S.pausedUntil = st && st.blocking && st.blocking.paused_until
    ? new Date(st.blocking.paused_until) : null;
  S.version = (st && st.version) || null;
}

async function loadSummary() {
  const sum = await api('/dns64/summary?range=24h');
  S.summary = (sum && sum.summary) || null;
  S.blocklistSize = (sum && sum.blocklistSize) || 0;
  S.listsLoadedAt = (sum && sum.listsLoadedAt) || null;
}

/* ------------------------------------------------------------ Seitenstatus */

async function logRows(name) {
  try {
    const r = await api('/dns64/log?limit=100&q=' + encodeURIComponent(name));
    return (r && r.rows) || [];
  } catch {
    return [];
  }
}

async function loadSite() {
  const host = S.host;
  if (!host || !canAct()) {
    S.site = { kind: isIP(host || '') ? 'ip' : 'none' };
    return;
  }

  const [allow, deny, recs] = await Promise.all([
    api('/dns64/allowlist').catch(() => []),
    api('/dns64/denylist').catch(() => []),
    api('/dns64/records').catch(() => []),
  ]);

  const allowHit = (allow || []).find((a) => matchesName(host, a.domain));
  const denyHit = (deny || []).find((d) => matchesName(host, d.domain));
  const localHit = (recs || []).find((r) => matchesName(host, r.name));

  if (allowHit) {
    S.site = { kind: 'allowed', reason: allowHit.domain, count: 0 };
    return;
  }
  if (denyHit) {
    S.site = { kind: 'denied', reason: denyHit.domain, count: 0 };
    return;
  }

  const parent = parentDomain(host);
  const [hostRows, parentRows] = await Promise.all([
    logRows(host),
    parent !== host ? logRows(parent) : Promise.resolve([]),
  ]);

  const exact = hostRows.filter((r) => (r.domain || '').toLowerCase() === host);
  const rows = exact.length
    ? exact
    : hostRows.filter((r) => matchesName(host, r.domain)).concat(
        parentRows.filter((r) => (r.domain || '').toLowerCase() === parent));

  if (!rows.length) {
    S.site = localHit
      ? { kind: 'local', reason: `${localHit.type} ${localHit.value}`, count: 0 }
      : { kind: 'unknown', reason: '', count: 0 };
    return;
  }

  rows.sort((a, b) => b.t - a.t);
  const last = rows[0];
  const count = rows.length;

  if (last.status === 'blocked') {
    // "own:" = eigene Sperrliste. Nach dem Aufheben steht der alte Treffer noch im Log –
    // entscheidend ist, ob der Eintrag jetzt (noch) in /dns64/denylist steht.
    const own = String(last.reason || '').startsWith('own:');
    S.site = own ? { kind: 'ok', count } : { kind: 'blocked', reason: reasonText(last.reason), count };
  }
  else if (last.status === 'custom') S.site = { kind: 'local', reason: `${last.rcode || 'lokal'}`, count };
  else if (last.status === 'error') S.site = { kind: 'error', reason: last.rcode || '', count };
  else S.site = { kind: 'ok', reason: '', count };
}

/* --------------------------------------------------------------- Rendern */

function renderBlock() {
  const sub = $('blockSub');
  const sum = S.summary;

  if (S.paused) {
    $('dot').className = 'dot paused';
    $('blockTitle').textContent = 'Blockieren pausiert';
  } else {
    $('dot').className = 'dot';
    $('blockTitle').textContent = 'Blockieren aktiv';
  }

  if (sum) {
    const pct = sum.total ? (sum.blocked / sum.total) * 100 : 0;
    sub.textContent =
      `${nf.format(sum.total)} Abfragen · ${nf.format(sum.blocked)} blockiert · ` +
      `${nf.format(sum.clients)} ${sum.clients === 1 ? 'Client' : 'Clients'} · ` +
      `${pct.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`;
  } else {
    sub.textContent = 'keine Kennzahlen';
  }

  const sw = $('toggle');
  sw.classList.toggle('off', S.paused);
  sw.setAttribute('aria-checked', String(!S.paused));

  const banner = $('banner');
  if (S.paused) {
    banner.hidden = false;
    renderBanner();
  } else {
    banner.hidden = true;
  }

  $('footLeft').textContent =
    `DNS64 ${S.version || '?'} · ${nf.format(S.blocklistSize)} Regeln · v${EXT_VERSION}`;

  const st = $('footState');
  if (S.paused) { st.className = 'st paused'; st.textContent = 'Pausiert'; }
  else { st.className = 'st'; st.textContent = 'Aktiv'; }
}

function renderBanner() {
  const txt = $('bannerText');
  const cd = $('bannerCd');
  if (S.untilResumed || !S.pausedUntil) {
    txt.textContent = 'Blockieren aus, bis du es wieder einschaltest';
    cd.textContent = '';
    return;
  }
  const left = S.pausedUntil - Date.now();
  if (left <= 0) {
    txt.textContent = 'Pause abgelaufen';
    cd.textContent = '';
    clearInterval(countdownTimer);
    setTimeout(refreshStatus, 300);
    return;
  }
  // Countdown in eigenem Knoten: der Sekundentakt setzt nur textContent,
  // damit keine Listener verloren gehen und nichts als HTML geparst wird
  txt.textContent = `pausiert bis ${clockText(S.pausedUntil)} ·`;
  cd.textContent = remainText(left);
}

function renderSite() {
  const site = S.site || { kind: 'none' };
  const row = $('siteRow');
  const nameEl = $('siteName');
  const st = $('siteStatus');

  row.className = 'site';
  nameEl.textContent = S.host || '–';
  st.className = 'sub';

  $('btnAllow').classList.remove('on');
  $('btnDeny').classList.remove('on');

  switch (site.kind) {
    case 'none':
      nameEl.textContent = 'Keine Webseite';
      st.textContent = 'Interner Tab – nichts zu sperren';
      break;
    case 'ip':
      st.classList.add('state-muted');
      st.textContent = 'IP-Adresse – keine Domain zum Freigeben';
      break;
    case 'noauth':
      st.classList.add('state-muted');
      st.textContent = 'Nicht abrufbar – API-Key prüfen';
      break;
    case 'blocked':
      row.classList.add('blocked');
      st.classList.add('state-blocked');
      st.textContent = `Blockiert · ${site.reason}` + (site.count ? ` · ${site.count}× im Log` : '');
      break;
    case 'denied':
      row.classList.add('blocked');
      st.classList.add('state-blocked');
      st.textContent = `Von dir gesperrt · ${site.reason}`;
      $('btnDeny').classList.add('on');
      break;
    case 'allowed':
      row.classList.add('allowed');
      st.classList.add('state-allowed');
      st.textContent = `Freigegeben · ${site.reason}`;
      $('btnAllow').classList.add('on');
      break;
    case 'local':
      st.textContent = `Lokaler Eintrag · ${site.reason}`;
      break;
    case 'error':
      st.classList.add('state-muted');
      st.textContent = `Nicht auflösbar (${site.reason || 'Fehler'})`;
      break;
    case 'ok':
      st.textContent = 'Nicht blockiert' + (site.count ? ` · ${site.count}× im Log` : '');
      break;
    default:
      st.classList.add('state-muted');
      st.textContent = 'Noch keine Abfrage im Log';
  }

  const act = canAct();
  $('btnAllow').disabled = !act || S.busy;
  $('btnDeny').disabled = !act || S.busy;
  $('btnPause10').disabled = !act;
}

/* -------------------------------------------------------------- Aktionen */

async function refreshStatus() {
  try {
    await loadStatus();
    await loadSummary();
    S.authFail = false;
    renderBlock();
    pingBadge();
  } catch (e) {
    $('dot').className = 'dot err';
    $('blockTitle').textContent = e.status === 404 ? 'DNS64-Modul aus'
      : e.status === 401 ? 'API-Key prüfen' : 'Keine Verbindung';
    $('blockSub').textContent = e.message;
    const st = $('footState');
    st.className = 'st err';
    st.textContent = 'Fehler';
    // Bei abgelehntem Key nicht weiter fragen: die Node sperrt nach mehreren
    // ungültigen Keys die ganze Adresse (429).
    if (e.status === 401) {
      S.authFail = true;
      clearInterval(statusTimer);
      document.body.dataset.authfail = '1';
    }
  }
}

async function refreshSite() {
  if (S.authFail) { S.site = { kind: 'noauth' }; renderSite(); return; }
  try {
    await loadSite();
  } catch (e) {
    S.site = { kind: 'none' };
    toast(e.message, 'bad');
  }
  renderSite();
}

async function setPaused(minutes) {
  setBusy(true);
  try {
    if (minutes === null) {
      await api('/dns64/resume', { method: 'POST', body: {} });
      toast('Blockieren wieder an', 'ok');
    } else {
      await api('/dns64/pause', { method: 'POST', body: { minutes } });
      toast(minutes === 0 ? 'Blockieren aus, bis du es aufhebst' : `Blockieren ${minutes} min pausiert`, 'ok');
    }
    await refreshStatus();
  } catch (e) {
    toast(e.message, 'bad');
  } finally {
    setBusy(false);
  }
}

function findAllow(list, host) {
  return (list || []).find((a) => matchesName(host, a.domain)) || null;
}

function findDeny(list, host) {
  return (list || []).find((d) => matchesName(host, d.domain)) || null;
}

async function toggleAllow() {
  if (!canAct() || S.busy) return;
  setBusy(true);
  try {
    const hit = findAllow(await api('/dns64/allowlist'), S.host);
    if (hit) {
      await api('/dns64/allowlist?domain=' + encodeURIComponent(hit.domain), { method: 'DELETE' });
      toast(`Freigabe entfernt: ${hit.domain}`, 'ok');
    } else {
      // Die Node nimmt eine Freigabe aus der eigenen Sperrliste automatisch heraus.
      await api('/dns64/allowlist', { method: 'POST', body: { domain: S.host } });
      toast(`Freigegeben: ${S.host} – gilt auch für Subdomains`, 'ok');
    }
    await refreshSite();
  } catch (e) {
    toast(e.message, 'bad');
  } finally {
    setBusy(false);
  }
}

async function toggleDeny() {
  if (!canAct() || S.busy) return;
  setBusy(true);
  try {
    const hit = findDeny(await api('/dns64/denylist'), S.host);
    if (hit) {
      await api('/dns64/denylist?domain=' + encodeURIComponent(hit.domain), { method: 'DELETE' });
      toast(`Sperre aufgehoben: ${hit.domain}`, 'ok');
    } else {
      // Eigene Sperrliste der Node: Domain samt Subdomains, hebt eine Freigabe automatisch auf.
      await api('/dns64/denylist', { method: 'POST', body: { domain: S.host } });
      toast(`Gesperrt: ${S.host} – gilt auch für Subdomains`, 'ok');
    }
    await refreshSite();
  } catch (e) {
    toast(e.message, 'bad');
  } finally {
    setBusy(false);
  }
}

function pingBadge() {
  try { chrome.runtime.sendMessage({ type: 'refresh-badge' }, () => void chrome.runtime.lastError); } catch {}
}

/* ------------------------------------------------------------------ UI */

function bindUI() {
  $('toggle').addEventListener('click', () => setPaused(S.paused ? null : 0));
  $('btnResume').addEventListener('click', () => setPaused(null));
  $('btnPause10').addEventListener('click', () => setPaused(10));

  $('pauses').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const v = btn.dataset.min;
    if (v === 'custom') {
      const wrap = $('customWrap');
      wrap.hidden = !wrap.hidden;
      if (!wrap.hidden) $('inMin').focus();
      return;
    }
    setPaused(Number(v));
  });

  $('btnCustom').addEventListener('click', () => {
    const n = Math.max(1, Math.min(1440, parseInt($('inMin').value, 10) || 0));
    if (!n) { toast('Bitte Minuten angeben (1–1440)', 'bad'); return; }
    setPaused(n);
  });
  $('inMin').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('btnCustom').click();
  });

  $('btnAllow').addEventListener('click', toggleAllow);
  $('btnDeny').addEventListener('click', toggleDeny);

  $('openNode').addEventListener('click', async (e) => {
    e.preventDefault();
    const { baseUrl } = await getConfig();
    chrome.tabs.create({ url: baseUrl + '/dns64' });
    window.close();
  });

  $('btnOptions').addEventListener('click', () => {
    // Direkt die eigene Seite öffnen – chrome.runtime.openOptionsPage() würde in
    // Brave die Extensions-Seite (chrome://extensions/?options=…) drumherum öffnen.
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    window.close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 't') { e.preventDefault(); setPaused(S.paused ? null : 0); }
    else if (k === 'a') { e.preventDefault(); toggleAllow(); }
    else if (k === 'd') { e.preventDefault(); toggleDeny(); }
  });
}

/* -------------------------------------------------------------- Einrichtung */

function showSetup() {
  document.body.classList.add('noauth');
  // Beide Felder starten leer; das Beispiel steht nur als Platzhalter im Feld
  // (kein vorausgefüllter Wert, den man versehentlich übernimmt).
  $('btnSave').addEventListener('click', async () => {
    const url = ($('inUrl').value || '').trim().replace(/\/+$/, '');
    const key = ($('inKey').value || '').trim();
    const msg = $('setupMsg');
    if (!url) { msg.className = 'msg bad'; msg.textContent = 'Bitte die Adresse der Node eintragen, z. B. http://192.168.1.4:8080'; return; }
    if (!/^https?:\/\/[^\s]+$/.test(url)) { msg.className = 'msg bad'; msg.textContent = 'Adresse muss mit http:// oder https:// beginnen'; return; }
    if (!key) { msg.className = 'msg bad'; msg.textContent = 'API-Key fehlt'; return; }
    await new Promise((r) => chrome.storage.local.set({ baseUrl: url, apiKey: key }, r));
    msg.className = 'msg';
    msg.textContent = 'Teste Verbindung …';
    try {
      const st = await api('/dns64/status');
      msg.textContent = 'Verbunden mit DNS64 ' + (st.version || '?');
      setTimeout(() => location.reload(), 600);
    } catch (e) {
      msg.className = 'msg bad';
      msg.textContent = e.message;
    }
  });
}

/* ------------------------------------------------------------------ Start */

let countdownTimer = null;
let statusTimer = null;

(async function init() {
  initTheme('btnTheme');
  bindUI();
  const cfg = await getConfig();
  if (!cfg.apiKey) { showSetup(); return; }

  $('chipHost').textContent = hostOf(cfg.baseUrl);
  S.host = await activeHost();

  await refreshStatus();
  await refreshSite();

  countdownTimer = setInterval(() => {
    if (S.paused && !S.untilResumed && S.pausedUntil) renderBanner();
  }, 1000);

  statusTimer = setInterval(() => {
    if (!S.busy && !S.authFail) refreshStatus();
  }, 20000);

  window.addEventListener('unload', () => {
    clearInterval(countdownTimer);
    clearInterval(statusTimer);
  });
})();
