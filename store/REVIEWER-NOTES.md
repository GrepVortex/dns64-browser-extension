# Anweisungen für die Prüfung (Feld „Test instructions")

Das Dashboard-Feld erlaubt **500 Zeichen**. Beide Fassungen unten passen hinein und enthalten die zwei
Dinge, an denen eine Prüfung sonst scheitert: dass das **DNS64-Modul in Node64 erst eingeschaltet
werden muss** (sonst antwortet die API mit 404) und den Link auf die ausführliche Anleitung.

- Englisch: 481 Zeichen (die sichere Wahl, Prüfer lesen Englisch)
- Deutsch: 493 Zeichen

Der verlinkte Guide liegt als `docs/reviewer.html` im Repo und wird von GitHub Pages ausgeliefert:
`https://grepvortex.github.io/dns64-browser-extension/reviewer.html`

## Fassung für das Feld (Englisch, 481 Zeichen)

```
Controls a self-hosted Node64 DNS server (no backend, no account). Run one locally:
docker run -d -p 8080:8080 ghcr.io/ipv64net/node64
Open http://localhost:8080, enable the DNS64 module (Settings, Modules; without it all calls return 404) and create an API key. Click the icon, enter the address plus the key, press "Speichern und testen". Check state, 24h counters, pause, allow/deny, badge ON/OFF/!.
Full guide: https://grepvortex.github.io/dns64-browser-extension/reviewer.html
```

## Fassung für das Feld (Deutsch, 493 Zeichen)

```
Steuert eine selbst betriebene Node64-Instanz (kein Server, keine Konten). Lokal starten:
docker run -d -p 8080:8080 ghcr.io/ipv64net/node64
http://localhost:8080 öffnen, DNS64-Modul aktivieren (Einstellungen, Module; sonst 404) und einen API-Schlüssel anlegen. Symbol anklicken, Adresse und Schlüssel eintragen, "Speichern und testen". Prüfen: Zustand, 24-h-Kennzahlen, Pause, Erlauben/Sperren, Abzeichen ON/OFF/!.
Anleitung: https://grepvortex.github.io/dns64-browser-extension/reviewer.html
```

Falls bei einer neuen Version Zeichen fehlen: zuerst `Check state, 24h counters, pause, allow/deny,
badge ON/OFF/!.` kürzen (der Guide nennt alles im Detail), dann die Klammer `(Settings, Modules; without
it all calls return 404)`. Nicht streichen: Docker-Zeile, Modul-Aktivierung und Guide-Link – ohne Modul
ist nichts testbar, und ohne Guide wirkt die Erweiterung wie eine Blackbox.

---

# Langfassung (für Support und Rückfragen)

Dieselbe Anleitung als Text, falls GitHub Pages nicht erreichbar ist oder ein Prüfer sie per Mail
anfordert. Die gepflegte Fassung ist `docs/reviewer.html`.

```
TEST SERVER REQUIREMENTS

This extension is a client for Node64, a self-hosted DNS server for home networks
(https://github.com/ipv64net/node64, Apache-2.0). It has no own backend and no
account system: it only talks to a Node64 instance the user runs. Without such an
instance the popup stays in its setup state – that is expected.

1) docker run -d --name node64 -p 8080:8080 -v node64-data:/data ghcr.io/ipv64net/node64:latest
   (image also on Docker Hub as x64gmbh/node64; amd64 and arm64)

2) Open http://localhost:8080 – the first-run assistant asks for language and an
   admin account (choose your own password, there is no default).

3) MANDATORY: Settings › Modules → switch the DNS64 module on. It ships switched off;
   while it is off every /api/dns64/* call returns 404 and the popup only shows
   "DNS64-Modul aus". After switching it on, the module starts with its default
   blocklists and upstreams – no further configuration needed.

4) Settings › API keys → create a key (any name, e.g. "review"). Shown once, starts
   with "node64_".

5) Click the extension icon → setup form.
   Node address: http://localhost:8080
   API key:      the key from step 4
   Press "Speichern und testen". Expected: "Verbunden mit DNS64 <version>" and the
   popup switches to the main view.

WHAT TO TEST

• Main view: blocking state, counters for the last 24 hours, footer with the DNS64
  version. Toggle at the top pauses/resumes blocking (writes to the local node).
• Pause row 1m/5m/30m/1h/∞ and "…" for a custom duration: the node state changes and
  the popup shows a live countdown.
• Domain card: visit any site (e.g. https://example.com) and open the popup. It shows
  the status of that domain. "Erlauben" adds it to the node's allow list, "Sperren" to
  its deny list; pressing again removes it. Both are visible in the node's web
  interface (DNS64 › Allowlist / Own blocklist).
• Toolbar badge: ON while blocking is active, OFF while paused, ! when the node is
  stopped (docker stop node64) or the key is wrong.
• Theme: the icon left of the gear follows the browser's light/dark setting.

NOTES

• All network traffic goes to the address entered in step 5 (localhost in this test),
  and only to /api/dns64/{status,summary,log,allowlist,denylist,records,pause,resume}.
  There is no remote code, no analytics and no third-party server.
• UI language is German; the store listing explains this.

CONTACT: github.com/GrepVortex
```
