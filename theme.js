'use strict';

/* Automatischer Hell/Dunkel-Modus mit relativem Umschalter.
 *
 * systemDark = Vorliebe von System/Browser (prefers-color-scheme)
 * inverted   = gespeicherter Nutzerwunsch (chrome.storage.local)
 * wirksam dunkel = systemDark !== inverted
 *
 * Der Umschalter ist relativ: nach dem Umkehren folgt die Anzeige weiter dem
 * System (ein absoluter Modus würde einfrieren).
 *
 * Wichtig: NICHT nur auf das `change`-Event der MediaQuery verlassen. In
 * Chromium kommt es in Erweiterungsseiten nicht zuverlässig an – dann bleibt
 * die Oberfläche im alten Modus stehen. Deshalb zusätzlich ein regelmäßiger
 * Abgleich plus Neuprüfung bei Fokus/Sichtbarkeit. applyTheme ist idempotent,
 * das kostet nichts.
 */

const THEME_POLL_MS = 1500; // Schlüssel im Speicher: "themeInverted"


function systemPrefersDark() {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch {
    return false;
  }
}

export function initTheme(buttonId) {
  const button = buttonId ? document.getElementById(buttonId) : null;
  let inverted = false;
  let applied = null;   // zuletzt tatsächlich gesetzter Zustand
  let ready = false;    // erst nach dem Storage-Read zeichnen

  function paint(dark) {
    document.documentElement.classList.toggle('light', !dark);
    document.documentElement.dataset.themeInverted = inverted ? '1' : '0';
    if (button) {
      // Symbol zeigt, wohin der Klick führt; beide SVGs stehen im HTML,
      // data-icon blendet das passende ein (kein innerHTML mit Variablen)
      button.dataset.icon = dark ? 'sun' : 'moon';
      button.classList.toggle('manual', inverted);
      button.title = (dark ? 'Hell' : 'Dunkel') + ' umschalten' +
        (inverted ? ' – manuell, folgt nicht dem System' : ' – folgt dem System');
    }
    applied = inverted ? 'inv:' + dark : String(dark);
  }

  /* idempotent: setzt nur, wenn sich der wirksame Modus wirklich geändert hat */
  function sync(force) {
    if (!ready) return;
    const dark = systemPrefersDark() !== inverted;
    const key = inverted ? 'inv:' + dark : String(dark);
    if (!force && key === applied) return;
    paint(dark);
  }

  if (button) {
    button.addEventListener('click', async () => {
      inverted = !inverted;
      await chrome.storage.local.set({ themeInverted: inverted });
      sync(true);
    });
  }

  // Trigger 1: offizielles Event der MediaQuery
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => sync(true);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch { /* egal, Trigger 2 und 3 greifen */ }

  // Trigger 2: Netz gegen verpasste Events (Chromium meldet den Theme-Wechsel
  // in Erweiterungsseiten nicht immer)
  setInterval(sync, THEME_POLL_MS);

  // Trigger 3: beim Sichtbarwerden bzw. Fokus sofort nachziehen
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(true); });
  window.addEventListener('focus', () => sync(true));

  // Änderung im anderen Fenster (Popup <-> Einstellungen)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.themeInverted) {
      inverted = !!changes.themeInverted.newValue;
      sync(true);
    }
  });

  chrome.storage.local.get({ themeInverted: false }).then((s) => {
    inverted = !!s.themeInverted;
    ready = true;
    sync(true);
  });

  return {
    async toggle() {
      inverted = !inverted;
      await chrome.storage.local.set({ themeInverted: inverted });
      sync(true);
    },
    isDark: () => !document.documentElement.classList.contains('light'),
    isInverted: () => inverted,
  };
}
