# DNS64 Browser Extension – Dokumentation

Chromium-/Brave-Erweiterung (Manifest V3) für **Node64**: Blocklisten des DNS64-Moduls
schalten, die aktuelle Domain freigeben oder sperren – ohne die Weboberfläche zu öffnen.
Vorbild ist die Pi-hole-Browser-Erweiterung, umgesetzt gegen die offizielle lokale API
von Node64.

- Stand: **1.4.0** (07.11.2026)
- Getestet mit Chromium 155 und Brave 156, Node64 1.34.0 (DNS64-Modul 1.34.0), API 1.2.0
- Kein externer Dienst, keine Telemetrie, keine Fremd-Hosts: alles läuft zwischen
  Browser und der eingetragenen Node.

---

## 1. Funktionsumfang

| Bedienelement | Wirkung | Endpunkt |
|---|---|---|
| Schalter oben | Blockieren an/aus; „aus" = bis zum manuellen Wiedereinschalten | `POST /dns64/pause {minutes:0}`, `POST /dns64/resume` |
| `1m` `5m` `30m` `1h` `∞` `…` | Blockieren für 1/5/30/60 Minuten, unbegrenzt oder eigene Dauer (1–1440) pausieren | `POST /dns64/pause {minutes}` |
| Kennzahlenzeile | Abfragen, blockiert, Clients, Quote der letzten 24 h | `GET /dns64/summary?range=24h` |
| Domain-Karte | Status der aktiven Seite samt Blockliste und Trefferzahl im Log | `GET /dns64/log`, `/dns64/allowlist`, `/dns64/denylist`, `/dns64/records` |
| **Erlauben** (A) | Domain in die Freigabeliste (gilt samt Subdomains); hebt eine eigene Sperre für denselben Namen auf | `POST /dns64/allowlist {domain}`, `DELETE ?domain=` |
| **Sperren** (D) | Domain in die eigene Sperrliste der Node (gilt samt Subdomains); hebt eine Freigabe für denselben Namen auf | `POST /dns64/denylist {domain}`, `DELETE ?domain=` |
| `10 min pausieren` | Kurzpause aller Listen | `POST /dns64/pause {minutes:10}` |
| `In Node64 öffnen` | Weboberfläche der Node (`<base>/dns64`) | – |
| Symbol-Abzeichen | `ON` grün = Listen greifen · `OFF` orange = pausiert · `!` rot = Node/Key-Problem | `GET /dns64/status` |
| Hell/Dunkel | folgt System/Browser, Knopf im Kopf kehrt relativ um | `prefers-color-scheme` + `chrome.storage` |

Tastenkürzel im Popup: `T` Blockieren umschalten, `A` erlauben, `D` sperren.
Eingabefelder sind ausgenommen, damit Tippen nichts auslöst.

Entwicklerhilfe: `popup.html?site=example.com` zeigt das Popup mit fester Domain statt der
des aktiven Tabs.

### Einrichtung

Zahnrad → Node-Adresse + API-Key (aus *Einstellungen › API-Keys*), „Verbindung testen".
Beim ersten Start führt das Popup selbst durch die Einrichtung: **beide Felder leer**, das
Beispiel steht nur als Platzhalter darin.

Der Key liegt ausschließlich in `chrome.storage.local` dieser Erweiterung – nicht im Sync,
nicht im Code, nicht im Paket.

---

## 2. Architektur

```
popup.html ──> popup.js ──┐
                           ├─> theme.js   (Hell/Dunkel, gemeinsame Palette theme.css)
options.html ─> options.js ┘

background.js (Service Worker)  – Abzeichen am Symbol, 1-Minuten-Alarm
```

- **Kein Content-Script.** Die Erweiterung liest keine Webseiten. Vom aktiven Tab wird nur
  der Hostname gelesen (`activeTab`), damit die Domain-Karte weiß, worum es geht.
- **Kein Remote-Code, kein `eval`, keine dynamischen `innerHTML`-Zuweisungen.** Symbole stehen
  statisch im HTML, Text wird über `textContent` gesetzt.
- **ES-Module** für die Seiten (`<script type="module">`); der Service Worker ist klassisch
  (Vorgabe von MV3).
- Alle Netzwerkaufrufe gehen an **eine** Adresse: die eingetragene Node
  (`http://…` oder `https://…`), Pfad `/api/…`, Header `Authorization: Bearer node64_…`.

### Dateien (1.4.0)

| Datei | Zeilen | Inhalt |
|---|---|---|
| `manifest.json` | 50 | MV3, Berechtigungen, Popup, Optionsseite, Service Worker |
| `popup.html` / `popup.css` / `popup.js` | 112 / 367 / 602 | Bedienoberfläche 380 px, zwei Karten, Toasts |
| `options.html` / `options.js` | 92 / 72 | Adresse + Key, Verbindungstest |
| `theme.js` / `theme.css` | 106 / 82 | Hell/Dunkel-Logik und Farbpalette beider Modi |
| `background.js` | 102 | Abzeichen (`ON`/`OFF`/`!`), Alarm, 401-Sperre |
| `icons/` | – | 16/32/48/128/512 px + `node64-mark.png` (aus dem Node64-Logo) |
| `NOTICE.md`, `LICENSE.md` | – | Herkunft des Logos, Apache-2.0-Text |
| `README.md` | – | Kurzfassung für Anwender |

Gesamtgröße des Pakets: rund 100 KB (ohne Doku-Bilder).

---

## 3. API-Nutzung

Alle zwölf im Code verwendeten Endpunkte sind in der OpenAPI der Node (1.2.0) beschrieben.
Geprüft mit einem Skript, das die `api('…')`-Aufrufe aus dem Quelltext zieht und gegen
`/api/openapi.json` hält – inklusive Feldtypen der Antworten.

| Methode | Pfad | Anfrage | gelesene Antwortfelder |
|---|---|---|---|
| GET | `/dns64/status` | – | `version`, `listen`, `blocking.{paused, until_resumed, paused_until}` |
| GET | `/dns64/summary?range=24h` | – | `summary.{total, blocked, cached, clients}`, `blocklistSize`, `listsLoadedAt` |
| GET | `/dns64/log?limit=100&q=<name>` | – | `rows[].{t, domain, status, reason, rcode}`, `total` |
| GET | `/dns64/allowlist` | – | `[].{domain, addedAt}` |
| POST | `/dns64/allowlist` | `{domain}` | `domain` (normalisiert) |
| DELETE | `/dns64/allowlist?domain=` | – | 204 |
| GET | `/dns64/denylist` | – | `[].{domain, addedAt}` |
| POST | `/dns64/denylist` | `{domain}` | `domain`; 400 = ungültiger Name, 503 = Sperrliste nicht geladen |
| DELETE | `/dns64/denylist?domain=` | – | 204 |
| GET | `/dns64/records` | – | `[].{name, type, value}` (nur für die Anzeige „lokaler Eintrag") |
| POST | `/dns64/pause` | `{minutes: 0…1440}` | `paused`, `until_resumed`, `paused_until` |
| POST | `/dns64/resume` | `{}` | dieselben Felder |

Anmerkungen zur Konformität:

- `minutes: 0` ist laut Schema erlaubt (`minimum: 0`) und bedeutet „bis zum Wiedereinschalten".
- Freigabe und eigene Sperre schließen sich serverseitig aus („Eine gleiche Freigabe fällt dabei
  weg") – die Erweiterung nutzt das, statt selbst aufzuräumen.
- Fehlerantworten werden angezeigt, wie die Node sie liefert: 401 → „API-Key ungültig",
  404 → „Modul aus?", 503 → Text der Node (z. B. „Sperrliste nicht geladen"), 429 → Hinweis.
- Statusabfragen sind billig; der Service Worker fragt nur `/dns64/status` (1×/Minute für das
  Abzeichen), das Popup zusätzlich die Kennzahlen (alle 20 s, solange es offen ist).

---

## 4. Wie der Status der aktiven Seite entsteht

DNS64 hat keinen Endpunkt „ist Domain X gesperrt?". Die Erweiterung prüft deshalb in dieser
Reihenfolge:

1. **Eigene Sperrliste** (`/dns64/denylist`, gilt samt Subdomains) → „Von dir gesperrt".
2. **Freigabeliste** (`/dns64/allowlist`, gilt samt Subdomains) → „Freigegeben".
3. **Abfrage-Log** der Domain (exakt), sonst der Elterndomain:
   `blocked` → „Blockiert · <Listenname>", `custom` → „Lokaler Eintrag", `error` → „nicht auflösbar",
   sonst „Nicht blockiert".
4. Nichts gefunden → „Noch keine Abfrage im Log".

Zwei Feinheiten, die aus Messungen stammen:

- Ein Log-Treffer mit `reason: own:<domain>` zählt **nur**, wenn der Name noch in der Denylist
  steht. Sonst zeigt die Karte nach dem Aufheben eine Sperre an, die es nicht mehr gibt.
- Blockgründe werden lesbar gemacht (`group:…` → „Gerätegruppe …", `cat:…` → „Kategorie …").

Genauigkeit: Das Log reicht `retention_days` zurück (Standard 7 Tage). Für jede besuchte Seite
existiert ein Eintrag, weil der Browser sie auflösen musste. Eine Domain, die noch nie aufgelöst
wurde, gilt als unbekannt – freigeben und sperren geht trotzdem.

---

## 5. Sicherheit

### Berechtigungen und ihre Begründung

| Berechtigung | Wozu |
|---|---|
| `storage` | Node-Adresse, API-Key, Hell/Dunkel, 401-Zeitstempel |
| `alarms` | 1-Minuten-Takt für das Abzeichen (`⏸`/`ON`/`OFF`/`!`) |
| `activeTab` | Hostname des aktiven Tabs für die Domain-Karte; Zugriff nur nach Klick auf das Symbol |
| `host_permissions: http://*/*, https://*/*` | Die Node-Adresse ist frei wählbar (IP, Name, Port, HTTP oder HTTPS), deshalb weit gefasst. Anfragen gehen ausschließlich an die eingetragene Adresse; es gibt keine Liste von Fremdhosts. Wer das enger will, kann im Manifest `optional_host_permissions` mit dem konkreten Ursprung verwenden und die Freigabe beim Speichern anfordern. |

Kein `tabs`, kein `scripting`, kein `webRequest`, kein `cookies`, kein `management`.

### Umgang mit dem API-Key

- Nur `chrome.storage.local` (profilgebunden, nicht synchronisiert), `type="password"` im Feld.
- Kein Key im Repository, im Paket oder in Logs.
- **Rücksicht auf die Ratengrenze der Node:** Nach fünf ungültigen Keys sperrt die Node die
  ganze Quell-IP (429, danach ein Versuch je 30 s). Ein veralteter Key im Speicher würde also
  auch den neu eingetragenen blockieren. Deshalb: Statusabfrage einzeln und zuerst, bei 401 alle
  Timer stoppen, im Service Worker 15 Minuten Pause, und beim Ändern von Adresse/Key wird die
  Sperre sofort aufgehoben. Gemessen: ein Popup-Öffnen mit falschem Key kostet **einen** Request
  statt fünf.

### Weitere Punkte

- Keine dynamischen HTML-Zuweisungen (kein `innerHTML` mit Variablen), keine Inline-Skripte,
  keine `eval`-Familie – geprüft durch `eslint-plugin-no-unsanitized` und `addons-linter`.
- MV3-CSP bleibt unverändert (`script-src 'self'`); es werden keine CSP-Ausnahmen gebraucht.
- Schreibende Aktionen sind auf vier Dinge beschränkt: Pause/Fortsetzen, Freigabe an/aus,
  eigene Sperre an/aus. Nichts anderes wird je gesendet.
- Oberfläche ist deutschsprachig, Zahlen in `de-DE`-Formatierung.

---

## 6. Hell/Dunkel

- Quelle ist `matchMedia('(prefers-color-scheme: dark)')` in der Seite – in Chromium ist das die
  Einstellung *Einstellungen → Darstellung → Modus* (gemessen: `color_scheme2` 1 = hell,
  2 = dunkel, 0 = Gerät/System).
- Der Knopf speichert **relativ** (`themeInverted`), wirksam dunkel = `systemDark !== inverted`.
  Damit folgt die Anzeige nach dem Umkehren weiter dem System; die Akzentfarbe am Knopf zeigt
  „manuell".
- **Drei Trigger**, weil ein einzelner nicht reicht: `change` der MediaQuery, ein Abgleich alle
  1,5 s (idempotent) und `focus`/`visibilitychange`. Messung in Chromium 155: nach einem echten
  Theme-Wechsel bei geöffneter Seite war `matchMedia.matches` bereits `true`, die Oberfläche aber
  unverändert – das `change`-Event kommt in Erweiterungsseiten nicht zuverlässig an. Mit dem
  Abgleich zieht die Anzeige innerhalb von 2 s nach.

### Kontraste (gemessen, WCAG 2.1)

| Paar | dunkel | hell | AA (4,5:1) |
|---|---|---|---|
| Text auf Fläche | 15,6 | 16,4 | erfüllt |
| Text auf Karte | 14,2 | 18,0 | erfüllt |
| Untertitel | 7,5 | 7,3 | erfüllt |
| kleine Labels / Fußzeile | 5,4–5,9 | 5,0–5,5 | erfüllt |
| „Blockiert" (rot) | 7,4 | 7,0 | erfüllt |
| „Freigegeben" (grün) | 10,6 | 6,2 | erfüllt |
| Links | 6,4 | 5,8 | erfüllt |
| Pausiert-Banner | 10,6 | 6,3 | erfüllt |
| Toast ok / Fehler | 11,0 / 9,7 | 7,6 / 7,9 | erfüllt |
| Primärknopf (weiß auf grün) | 5,0 | 5,0 | erfüllt |
| Abzeichen `ON` / `OFF` / `!` | 4,6 / 5,2 / 6,5 | – | erfüllt |

Zwei Werte lagen zuvor unter 4,5:1 (kleine Schrift im Hellmodus 3,8; Labels 4,3) und wurden für
1.4.0 nachgezogen.

---

## 7. Audit

Werkzeuge (keine Eigenbewertung):

| Werkzeug | Version | Ergebnis |
|---|---|---|
| `addons-linter` via `web-ext lint` | web-ext 10.8.0 / addons-linter 10.14.0 | 0 Warnungen im Code; 2 Fehler und 1 Warnung sind Firefox-Vorgaben (`background.scripts`-Fallback, `browser_specific_settings.gecko.id`, `data_collection_permissions`) und für eine Chromium-MV3-Erweiterung nicht erfüllbar/nicht relevant |
| `eslint` mit `eslint-plugin-security` 4.2.1 und `eslint-plugin-no-unsanitized` 4.1.5 | eslint 10.14.0 | **0 Probleme** (Regelsatz: security/recommended, no-unsanitized property+method, no-eval, no-implied-eval, no-new-func, no-script-url, no-undef, eqeqeq u. a.) |
| API-Abgleich gegen `/api/openapi.json` | eigenes Skript | 12/12 Endpunkte dokumentiert, Antwortfeldtypen stimmen |
| Laufzeittest | Chromium 155 headless via CDP | keine Konsolen-Exceptions, keine CSP-Verstöße |

Behobene Befunde:

1. `innerHTML` mit Variablen an zwei Stellen (Banner-Text, Theme-Symbol) → durch `textContent`
   bzw. statisches Markup + `data-icon` ersetzt.
2. Ein Shell-Skript lag im Erweiterungsordner (`FLAGGED_FILE_EXTENSION`) → Build-Skript liegt
   jetzt außerhalb (`~/git/dns64-switch-build.sh`).
3. `initTheme` war als globales Skript über drei Dateien verteilt → ES-Modul mit `import`.
4. Zwei Kontrastwerte unter AA (siehe Abschnitt 6).

Wiederholen:

```bash
# Lint wie oben (Werkzeuge liegen außerhalb des Projekts)
web-ext lint --source-dir ~/git/dns64-switch
eslint --config <audit>/eslint.config.mjs <kopie>/*.js
# API-Konformität
python3 api-check.py <openapi-live.json> node64_…
```

---

## 8. Testprotokoll (Auszug, alles gegen eine echte Node)

| Prüfung | Ergebnis |
|---|---|
| Pause 1/2/5/30 min, ∞, Fortsetzen | Zustand jeweils per API gegengelesen, Countdown läuft sekundengenau |
| Erlauben/Sperren, je zweimal | Listen der Node danach leer, keine Reste |
| Sperre wirkt | DNS-Abfrage gegen die Node liefert für Domain und Subdomain `0.0.0.0`; Log `status: blocked`, `reason: own:<domain>` |
| Freigabe hebt Sperre auf | Denylist-Eintrag verschwindet serverseitig |
| Fremde Blockliste | `doubleclick.net` → „Blockiert · StevenBlack Unified" |
| Aufheben | Karte zeigt sofort „Nicht blockiert", kein Nachleuchten aus dem Log |
| Abzeichen | ohne Key leer · aktiv `ON`/`#17864a` · pausiert `OFF`/`#a05d00` mit „bis HH:MM" · Node weg `!`/`#b91c1c` |
| Falscher Key | ein Request, Titel „API-Key prüfen", Domain-Karte „nicht abrufbar", keine weiteren Versuche |
| Theme | Systemwechsel bei geöffneter Seite zieht in ≤2 s nach; Umkehrung bleibt relativ |
| Einrichtung | beide Felder leer mit Platzhalter, klare Meldung bei fehlender Adresse |
| Aufräumen | nach jedem Test: Pause beendet, Listen leer, DNS-Einträge unverändert |

---

## 9. Bauen und Ausliefern

```bash
~/git/dns64-switch-build.sh                # erzeugt ~/git/dns64-switch.crx (~100 KB)
```

- Das Skript packt ohne `docs/`, `*.pem`, `*.crx` und ohne sich selbst.
- Signiert wird mit `~/git/dns64-switch.pem` → ID `afeiagkmnfjohhngcmpkolbgjgelilai`.
  **Der Schlüssel darf nicht verloren gehen**: eine neue ID bedeutet Neuinstallation und leeren
  Speicher (API-Key neu eintragen).
- Verteilung im eigenen Store auf dem NAS: `http://<nas>:8115` (CRX ablegen, Store scannt bei
  jedem Request) und `https://<nas>:8443` für den Klick-Weg; `update.xml` meldet die höchste
  Version je ID.
- Alternativ „Entpackte Erweiterung laden" in `chromium://extensions` (Entwicklermodus).

---

## 10. Bewusste Grenzen

- **Pausen sind nodeweit und mindestens eine Minute.** Kein Sub-Minuten-Wert (Pi-hole kann 10 s),
  keine Freigabe „nur für 10 Minuten" je Domain – dafür fehlt der Endpunkt.
- **Keine Gerätegruppen.** DNS64-Gruppen (Kinder, Gäste, Zeitpläne, `hold`) haben eigene Regeln;
  die Erweiterung fasst sie nicht an, um nicht versehentlich Familienregeln zu ändern.
- **Keine Ziel-IP-Sperren.** DNS kennt nur Namen; IP-Sperren gibt es nur in PROXY64 bzw. in der
  Firewall (OPNsense).
- **Status aus dem Log** statt aus einer Live-Abfrage: eine nie aufgelöste Domain gilt als
  unbekannt.
- Nur DNS64 wird bedient (keine Healthchecks, kein DynDNS, kein PROXY64).
- Der API-Key ist ein Vollzugriffsschlüssel der Node; die Erweiterung braucht keine feineren
  Rechte, weil die API keine kennt.

---

## 11. Lizenz und Herkunft

- **Icon:** Kachel „64" aus dem Node64-Logo (`static/img/node64.svg` des Projekts
  <https://github.com/ipv64net/node64>), aus dem Vektor gerendert. Lizenz **Apache-2.0**,
  Text in `LICENSE.md`. Das Logo bleibt Eigentum der **Prox IT UG / ipv64.net** und wird hier nur
  zur Kennzeichnung dieser Erweiterung für dieselbe Software verwendet.
- Die Ziffern der Kachel sind transparent (kein weißer Grund), damit sie die Farbe der Leiste
  annehmen – hell im hellen, dunkel im dunklen Modus.
- **Quelltext dieser Erweiterung:** Apache License 2.0 (Text in `LICENSE.md`,
  Copyright 2026 badguy2003st). Eigenständig entstanden, nicht Teil von Node64, weder von
  ipv64.net noch von der Prox IT UG herausgegeben. Details in `NOTICE.md`.
- Marken- und Namensnennungen (Node64, ipv64.net) dienen nur der Beschreibung der Kompatibilität.
