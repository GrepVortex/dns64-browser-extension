# Anweisungen für die Prüfung (Feld „Test instructions")

Das Dashboard-Feld erlaubt **500 Zeichen**. Die erste Fassung unten passt genau hinein (489 Zeichen),
die deutsche Alternative ebenfalls (476). Englisch ist die sichere Wahl – Prüfer lesen Englisch.

## Fassung für das Feld (Englisch, 489 Zeichen)

```
No backend, no account: the extension controls a self-hosted Node64 DNS server. Run one locally:
docker run -d -p 8080:8080 ghcr.io/ipv64net/node64
Open http://localhost:8080, create an API key (Settings, API keys), then click the extension icon, enter http://localhost:8080 plus the key, press "Speichern und testen".
Check: state and 24h counters, pause toggle with countdown, domain card allows/denies the current site, badge ON/OFF/!. Traffic goes to that address only, no remote code.
```

## Fassung für das Feld (Deutsch, 476 Zeichen)

```
Kein eigener Server, keine Konten: die Erweiterung steuert eine selbst betriebene Node64-Instanz. Lokal starten:
docker run -d -p 8080:8080 ghcr.io/ipv64net/node64
http://localhost:8080 öffnen, unter Einstellungen einen API-Schlüssel anlegen, dann Symbol anklicken, Adresse und Schlüssel eintragen, "Speichern und testen".
Prüfen: Zustand und 24-h-Kennzahlen, Pause mit Countdown, Domain-Karte erlaubt/sperrt die Seite, Abzeichen ON/OFF/!. Nur diese Adresse, kein Remote-Code.
```

Wenn bei einer neuen Version Zeichen übrig sind oder fehlen: erst die Klammer `(Settings, API keys)`
und den Satz `Traffic goes to that address only, no remote code.` kürzen bzw. streichen – die
Docker-Zeile und der Prüf-Pfad sind das Wertvollste am Text, weil ohne Node nichts testbar ist.

---

# Langfassung (passt nicht ins Feld, für Support und Nachfragen der Prüfer)

```
TEST ACCOUNT / SERVER REQUIREMENTS

This extension is a client for Node64, a self-hosted DNS server for home networks
(https://github.com/ipv64net/node64, Apache-2.0). It has no own backend and no
account system: it only talks to a Node64 instance the user runs. Without such an
instance the options page stays in its setup state – that is expected.

You can start a Node64 instance locally in about two minutes, no account or
credentials required:

1) docker run -d --name node64 -p 8080:8080 -v node64-data:/data ghcr.io/ipv64net/node64:latest
   (image also on Docker Hub as x64gmbh/node64; amd64 and arm64)

2) Open http://localhost:8080 – the first-run assistant asks for language and an
   admin account (choose your own password, there is no default).

3) In Node64: Settings › API keys → create a key (any name, e.g. "review").
   The key is shown once, it starts with "node64_".

4) Click the extension icon → the popup shows the setup form.
   Node address: http://localhost:8080
   API key:      the key from step 3
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
  interface (DNS64 › Freigaben / Sperrliste).
• Toolbar badge: ON while blocking is active, OFF while paused, ! when the node is
  stopped (docker stop node64) or the key is wrong.
• Theme: the icon left of the gear follows the browser's light/dark setting.

NOTES

• All network traffic goes to the address entered in step 4 (localhost in this test).
  There is no remote code, no analytics and no third-party server.
• The extension writes only to the DNS64 endpoints of that node: pause, resume,
  allow list, deny list.
• UI language is German; the store listing explains this.

CONTACT: github.com/GrepVortex
```
