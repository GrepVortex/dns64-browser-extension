# Datenschutzerklärung – DNS64 Browser Extension

Stand: 7. November 2026 · Version 1.4.4

Diese Erweiterung ist ein Client für eine selbst betriebene Node64-Instanz. Sie betreibt keinen
eigenen Server, legt keine Konten an und überträgt keine Daten an den Herausgeber oder an
Dritte.

## Welche Daten verarbeitet werden

| Datum | Wo | Zweck |
|---|---|---|
| Adresse der Node (z. B. `http://192.168.1.4:8080`) | lokal im Browser (`chrome.storage.local`) | Ziel der API-Aufrufe |
| API-Schlüssel der Node (`node64_…`) | lokal im Browser (`chrome.storage.local`) | Anmeldung an der Node |
| Einstellung Hell/Dunkel | lokal im Browser (`chrome.storage.local`) | Darstellung des Popups |
| Hostname des aktiven Tabs | nur im Arbeitsspeicher, für die Dauer des geöffneten Popups | Anzeige des Sperrstatus dieser Domain |

Es gibt keine Erhebung von Namen, E-Mail-Adressen, Standortdaten, Kommunikationsinhalten,
Gesundheits- oder Finanzdaten. Es gibt keine Werbung, keine Analyse, keine Telemetrie und keine
Profile.

## Wohin Daten gehen

Ausschließlich an die Node-Adresse, die der Nutzer selbst einträgt. Bei der üblichen
Einrichtung ist das ein Gerät im eigenen Netz. Der API-Schlüssel wird als
`Authorization: Bearer`-Kopf an genau diese Adresse gesendet; der Hostname des aktiven Tabs
wird dort als Suchbegriff für das Abfrage-Log verwendet. Weitere Empfänger gibt es nicht.

## Speicherung und Löschung

Die Angaben liegen im lokalen Speicher des Browsers und sind an das Browserprofil gebunden.
Sie werden nicht synchronisiert und nicht gesichert. Löschen lassen sich die Daten jederzeit
durch Entfernen der Erweiterung oder über die Einstellungsseite; beim Löschen des Projekts
bleiben keine Kopien zurück.

## Berechtigungen

- `storage` – Speichern der oben genannten Angaben
- `alarms` – minütliche Aktualisierung des Abzeichens am Symbol
- `activeTab` – Hostname des aktiven Tabs nach Klick auf das Symbol
- `http://*/*`, `https://*/*` – Zugriff auf die frei wählbare Node-Adresse

Die Erweiterung liest keine Seiteninhalte, injiziert keine Skripte in Webseiten und lädt keinen
Code aus dem Netz.

## Kinder

Die Erweiterung richtet sich nicht an Kinder und erhebt wissentlich keine Daten von Kindern.

## Änderungen

Änderungen dieser Erklärung werden zusammen mit einer neuen Version der Erweiterung
veröffentlicht; das Datum oben wird dann angepasst.

## Kontakt

GitHub: <https://github.com/GrepVortex>

---

# Privacy Policy – DNS64 Browser Extension (English)

Last updated: 7 November 2026 · Version 1.4.4

This extension is a client for a self-hosted Node64 instance. It runs no server of its own,
creates no accounts and does not send data to the publisher or to third parties.

**Data processed**

- Node address, API key and theme preference: stored locally via `chrome.storage.local`,
  used only to talk to the node you configured.
- Hostname of the active tab: kept in memory while the popup is open, only to display the
  blocking status of that site.

No names, email addresses, location, communications, health or financial data. No advertising,
analytics, telemetry or profiling.

**Where data goes**

Only to the node address you enter – typically a device on your own network. The API key is
sent there as an `Authorization: Bearer` header; the active hostname is used there as a search
term for the query log. No other recipients.

**Retention and deletion**

Data lives in your browser profile, is not synced and not backed up. Removing the extension (or
using the options page) deletes it.

**Permissions**

`storage`, `alarms`, `activeTab` and host access to the node address you configure. The
extension does not read page content, does not inject scripts and loads no remote code.

**Contact**

GitHub: <https://github.com/GrepVortex>
