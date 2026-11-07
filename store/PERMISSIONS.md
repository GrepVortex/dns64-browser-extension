# Datenschutzpraktiken im Dashboard

## „Single purpose" (Feld: Zweck der Erweiterung, max. 1000 Zeichen)

Deutsch:

```
Die Erweiterung hat einen einzigen Zweck: die Blocklisten des DNS64-Moduls einer selbst
betriebenen Node64-Instanz anzeigen und schalten – Blockieren pausieren, eine Domain freigeben
oder sperren, dazu Status und Kennzahlen der letzten 24 Stunden. Alle Funktionen dienen
ausschließlich diesem Zweck; es gibt keine Inhalte, keine Werbung und keine weiteren Aufgaben.
```

English (falls das Feld auf Englisch ausgefüllt wird):

```
The extension has a single purpose: to display and control the DNS64 blocklists of a
self-hosted Node64 instance – pause blocking, allow or block a domain, and show status plus
24-hour stats. Every feature serves that purpose; there is no other functionality, no content
and no advertising.
```

## Begründung je Berechtigung (Feld: „Begründung", je max. 1000 Zeichen)

**`storage`**

```
Speichert lokal die Adresse der Node, den API-Schlüssel des Nutzers und die Hell/Dunkel-
Einstellung. Nichts davon verlässt den Browser außer an die eingetragene Node selbst.
```

**`alarms`**

```
Hält das Abzeichen am Symbol aktuell: einmal pro Minute wird der Blockierzustand der Node
abgefragt und als ON, OFF oder ! angezeigt. Ohne diesen Takt bliebe das Abzeichen veraltet.
```

**`activeTab`**

```
Liefert den Hostnamen des aktiven Tabs, damit das Popup den Sperrstatus genau dieser Domain
anzeigen kann. Der Zugriff erfolgt ausschließlich nach Klick auf das Symbol; es werden keine
Seiteninhalte gelesen, keine Skripte injiziert und keine Verläufe gespeichert.
```

**Host-Berechtigung `http://*/*`, `https://*/*`**

```
Die Adresse der Node64-Instanz ist frei wählbar: IP oder Hostname, beliebiger Port, HTTP oder
HTTPS, typischerweise im eigenen Netz (z. B. http://192.168.1.4:8080). Eine engere Auswahl ist
nicht möglich, weil die Erweiterung den Server nicht kennt, bevor der Nutzer ihn einträgt.
Anfragen gehen ausschließlich an diese eine, vom Nutzer eingetragene Adresse; es gibt keine
festen Fremdhosts, keine Analysedienste und keinen Code von außen.
```

## „Remote-Code" 

**Nein.** Es wird kein JavaScript aus dem Netz geladen und ausgeführt; die Erweiterung besteht
ausschließlich aus den mitgelieferten Dateien. Kommuniziert wird nur per `fetch` mit der
JSON-API der Node.

## Datennutzung (Checkliste „Welche Daten erhebt die Erweiterung?")

| Kategorie | Auswahl | Begründung |
|---|---|---|
| Authentifizierungsdaten | **ja** | Der API-Schlüssel der Node wird lokal gespeichert und an die Node gesendet. |
| Browserverlauf / „Web history" | **ja** | Der Hostname des aktiven Tabs wird gelesen, um den Status dieser Domain anzuzeigen. Er wird nicht gespeichert und nicht übertragen – außer als Suchbegriff an die eigene Node, um deren Log zu durchsuchen. |
| Alle übrigen Kategorien | **nein** | Keine personenbezogenen Daten, keine Standortdaten, keine Kommunikationsinhalte, keine Gesundheits- oder Finanzdaten. |

Zertifizierungen im Formular:

- Daten werden **nicht** verkauft oder an Dritte weitergegeben.
- Daten werden **nicht** für Zwecke verwendet, die nicht zum Zweck der Erweiterung gehören.
- Daten werden **nicht** zur Bestimmung der Kreditwürdigkeit verwendet.
- „Limited use"-Erklärung bestätigen.

## Datenschutzerklärung

URL aus `PRIVACY.md` eintragen (öffentlich erreichbar). Text ist dort vorbereitet.
