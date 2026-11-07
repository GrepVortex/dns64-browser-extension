'use strict';

import { initTheme } from './theme.js';

const DEFAULTS = { baseUrl: 'http://192.168.1.4:8080', apiKey: '' };
const $ = (id) => document.getElementById(id);

function readForm() {
  return {
    baseUrl: ($('inUrl').value || '').trim().replace(/\/+$/, ''),
    apiKey: ($('inKey').value || '').trim(),
  };
}

function say(text, kind) {
  const m = $('msg');
  m.className = 'msg' + (kind ? ' ' + kind : '');
  m.textContent = text;
}

async function test(cfg) {
  if (!/^https?:\/\/[^\s]+$/.test(cfg.baseUrl)) throw new Error('Adresse muss mit http:// oder https:// beginnen');
  if (!cfg.apiKey) throw new Error('API-Key fehlt');
  let res;
  try {
    res = await fetch(cfg.baseUrl + '/api/dns64/status', {
      headers: { Authorization: 'Bearer ' + cfg.apiKey },
      cache: 'no-store',
    });
  } catch {
    throw new Error('Node nicht erreichbar: ' + cfg.baseUrl);
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (res.status === 401) throw new Error('API-Key ungültig oder gelöscht');
  if (res.status === 404) throw new Error('DNS64-Modul ist ausgeschaltet');
  if (res.status === 503) throw new Error('Dienst nicht bereit' + (data && data.error ? ': ' + data.error : ''));
  if (!res.ok) throw new Error('HTTP ' + res.status + (data && data.error ? ': ' + data.error : ''));
  return data;
}

(async function init() {
  initTheme('btnTheme');
  const cfg = await chrome.storage.local.get(DEFAULTS);
  $('inUrl').value = cfg.baseUrl || DEFAULTS.baseUrl;
  $('inKey').value = cfg.apiKey || '';

  $('btnTest').addEventListener('click', async () => {
    const c = readForm();
    say('Teste …');
    try {
      const d = await test(c);
      const paused = d && d.blocking && d.blocking.paused;
      say(`OK – DNS64 ${d.version || '?'} · ${paused ? 'pausiert' : 'aktiv'} · ${d.listen || ''}`, 'ok');
    } catch (e) {
      say(e.message, 'bad');
    }
  });

  $('btnSave').addEventListener('click', async () => {
    const c = readForm();
    say('Teste …');
    try {
      const d = await test(c);
      await chrome.storage.local.set(c);
      say(`Gespeichert – DNS64 ${d.version || '?'}`, 'ok');
    } catch (e) {
      say('Nicht gespeichert: ' + e.message, 'bad');
    }
  });
})();
