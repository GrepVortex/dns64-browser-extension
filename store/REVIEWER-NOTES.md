# Anweisungen für die Prüfung (Feld „Test instructions")

Copy this into the review field. It is in English because store reviewers read English.

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
   Press "Speichern und testen". Expected: "Verbunden mit DNS64 1.34.0" (version
   may be newer) and the popup switches to the main view.

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
