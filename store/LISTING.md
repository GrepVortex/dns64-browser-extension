# Store-Eintrag – Texte zum Kopieren

## Feld „Name" (max. 45 Zeichen)

```
DNS64 Browser Extension
```

## Feld „Kurzbeschreibung / Summary" (max. 132 Zeichen)

Deutsch (121 Zeichen):

```
Blocklisten von DNS64 (Node64) im Browser schalten: pausieren, Domain freigeben oder sperren – mit Status und Kennzahlen.
```

Englisch (102 Zeichen):

```
Switch DNS64 (Node64) blocklists from the browser: pause blocking, allow or block a domain, see stats.
```

## Kategorie

**Produktivität** (`Productivity`). Alternative, falls die Prüfung es anders einordnet:
*Dienstprogramme* (`Utilities`) – die Erweiterung steuert eine Netzwerkfunktion, keinen Inhalt.

## Sprache

Deutsch (die Oberfläche ist deutschsprachig). Englische Texte können als zweiter Eintrag
gepflegt werden, die Screenshots bleiben dann deutsch.

---

## Ausführliche Beschreibung – Deutsch

```
Schaltet die Blocklisten von DNS64 – dem lokalen DNS-Resolver von Node64 – direkt aus dem
Browser. Vorbild ist der Pi-hole-Schalter: ein Klick auf das Symbol, und du siehst und änderst
den Zustand, ohne die Weboberfläche der Node zu öffnen.

FUNKTIONEN

• Blockieren pausieren: 1, 5, 30 oder 60 Minuten, unbegrenzt oder eine eigene Dauer (bis
  1440 Minuten) – mit laufendem Countdown im Popup.
• Aktuelle Seite: zeigt, ob die Domain der aktiven Seite blockiert ist und von welcher Liste –
  oder ob du sie selbst freigegeben bzw. gesperrt hast. Lokale Einträge und unbekannte Domains
  werden eigens gekennzeichnet.
• Erlauben: trägt die Domain samt Subdomains in die Freigabeliste der Node ein.
• Sperren: legt sie in der eigenen Sperrliste der Node an. Beides lässt sich mit demselben
  Knopf wieder aufheben; die Listen schließen sich serverseitig aus.
• Kennzahlen: Abfragen, blockierte Abfragen, Clients und Quote der letzten 24 Stunden.
• Symbol-Abzeichen: ON (grün) = Listen greifen, OFF (orange) = pausiert, ! (rot) = Node nicht
  erreichbar oder Schlüssel ungültig. Kein Zähler, der ins Unendliche läuft.
• Hell und dunkel: folgt automatisch System bzw. Browser; der Knopf im Kopf kehrt es bei Bedarf
  um.
• Tastenkürzel im Popup: T schaltet das Blockieren, A erlaubt, D sperrt.
• Verbindungstest in den Einstellungen, deutschsprachige Oberfläche.

VORAUSSETZUNG

Eine selbst betriebene Node64-Instanz im eigenen Netz (github.com/ipv64net/node64) mit
eingeschaltetem DNS64-Modul und einem API-Schlüssel aus „Einstellungen › API-Keys". Die
Erweiterung ist kein Ersatz für Node64 und funktioniert ohne eigene Node nicht.

DATENSCHUTZ

Keine Telemetrie, keine Analyse, keine Fremdserver. Die Erweiterung spricht ausschließlich die
Node-Adresse an, die du selbst einträgst. Der API-Schlüssel liegt lokal im Browser
(chrome.storage.local) und wird nur an diese Node gesendet. Keine Konten, keine Cloud, keine
Weitergabe von Daten.

HINWEISE

• Pausen gelten für die ganze Node, nicht pro Gerät.
• Die Untergrenze einer Pause ist eine Minute (Vorgabe der API).
• Freigaben und Sperren gelten samt Subdomains.
• Der Status stammt aus dem Abfrage-Log der Node; eine nie aufgelöste Domain gilt als unbekannt.
• Nur das DNS64-Modul wird bedient, keine Healthchecks, kein DynDNS, kein PROXY64.

Diese Erweiterung ist ein eigenständiges Projekt und nicht Teil von Node64. Node64 und
ipv64.net werden von der Prox IT UG betrieben. Das Symbol ist vom Node64-Logo abgeleitet
(Apache-2.0) und wird ausschließlich zur Kennzeichnung der Kompatibilität verwendet.
```

---

## Detailed description – English

```
Switches the blocklists of DNS64 – the local DNS resolver of Node64 – from the browser.
Modelled after the Pi-hole switch: one click on the icon shows and changes the state without
opening the node's web interface.

FEATURES

• Pause blocking: 1, 5, 30 or 60 minutes, indefinitely, or a custom duration (up to 1440
  minutes) – the popup shows a live countdown.
• Current site: shows whether the active domain is blocked and by which list, or whether you
  allowed or blocked it yourself. Local records and unknown domains are labelled separately.
• Allow: adds the domain including subdomains to the node's allow list.
• Block: adds it to the node's own deny list. The same button removes it again; the two lists
  are mutually exclusive on the server.
• Stats: queries, blocked queries, clients and the share of the last 24 hours.
• Toolbar badge: ON (green) = lists active, OFF (orange) = paused, ! (red) = node unreachable
  or key invalid. No endless counter.
• Light and dark: follows the system or browser theme; the button in the header flips it.
• Keyboard shortcuts in the popup: T toggles blocking, A allows, D blocks.
• Connection test in the options, German user interface.

REQUIREMENTS

A self-hosted Node64 instance on your own network (github.com/ipv64net/node64) with the DNS64
module enabled and an API key from "Settings › API keys". This extension is not a replacement
for Node64 and does nothing without your own node.

PRIVACY

No telemetry, no analytics, no third-party servers. The extension talks only to the node
address you enter. The API key is stored locally in the browser (chrome.storage.local) and sent
only to that node. No accounts, no cloud, no data sharing.

NOTES

• Pauses apply to the whole node, not per device.
• One minute is the shortest pause the API allows.
• Allow and block rules include subdomains.
• Status is derived from the node's query log; a domain that was never resolved shows as unknown.
• Only the DNS64 module is supported – no health checks, no DynDNS, no PROXY64.

This extension is an independent project and not part of Node64. Node64 and ipv64.net are
operated by Prox IT UG. The icon is derived from the Node64 logo (Apache-2.0) and is used only
to indicate compatibility.
```

---

## Screenshots – Reihenfolge und Bildunterschriften

1. `01-status.png` – Blocklisten auf einen Blick: Status, Kennzahlen, Sperrzustand der aktiven Seite
2. `02-pausieren.png` – Pausieren in einem Klick, mit Countdown
3. `03-freigabe.png` – Seite freigeben oder sperren
4. `04-hell-dunkel.png` – Hell und dunkel, folgt dem System
5. `05-einrichtung.png` – In einer Minute eingerichtet

Alle Bilder 1280 × 800 px, RGB ohne Transparenz. Die gezeigten Werte stammen von einer echten
Node (4.927 Abfragen, 45 blockiert), nicht aus einer Attrappe.
