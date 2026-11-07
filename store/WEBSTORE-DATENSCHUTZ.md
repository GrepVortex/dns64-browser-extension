# Chrome Web Store – Datenschutzformular, Feld für Feld

Stand: 7. November 2026 · Erweiterung **DNS64 Browser Extension 1.4.4**
Grundlage: `manifest.json` (nur `storage`, `alarms`, `activeTab`, Host `http://*/*` + `https://*/*`,
keine `content_scripts`) und der Code (`background.js`, `popup.js`, `options.js`, `theme.js`).

Diese Datei ersetzt inhaltlich `PRIVACY.md` und `PERMISSIONS.md`: unten stehen die Texte zum
Kopieren für jedes Feld des Dashboards **und** die überarbeitete Datenschutzerklärung für die
öffentliche URL.

---

## 1. Übersicht: was wohin

| Feld im Dashboard | Eingabe | Regel |
|---|---|---|
| Beschreibung des alleinigen Zwecks | Text aus §2 | 1000 Zeichen, keine Weigerung möglich |
| Begründung für `storage` | Text aus §3.1 | 1000 Zeichen |
| Begründung für `alarms` | Text aus §3.2 | 1000 Zeichen |
| Begründung für `activeTab` | Text aus §3.3 | 1000 Zeichen |
| Begründung für Hostberechtigung | Text aus §3.4 | 1000 Zeichen |
| Nutzt du remote code? | **Nein, ich verwende „Remote Code" nicht** | Begründungsfeld bleibt leer |
| Datennutzung | **2 von 9 Kategorien anhaken** (§5) | wird öffentlich angezeigt |
| Drei Bestätigungen | **alle drei anhaken** | Pflicht |
| URL der Datenschutzerklärung | öffentliche URL (§7) | muss ohne Login erreichbar sein |
| Testanweisungen | Text aus `REVIEWER-NOTES.md` | **500 Zeichen** – Kurzfassung dort oben |

---

## 2. Beschreibung des alleinigen Zwecks

> 469 von 1000 Zeichen

```
Einziger Zweck: die Blocklisten des DNS64-Moduls einer selbst betriebenen Node64-Instanz anzeigen und schalten. Das Popup zeigt Blockierzustand, Kennzahlen der letzten 24 Stunden und den Status der gerade geöffneten Domain. Es pausiert das Blockieren (10 Minuten, frei wählbar, bis zum Wiedereinschalten) und setzt einzelne Domains auf die Freigabe- oder Sperrliste der Node. Weitere Funktionen, Inhalte, Werbung oder eine Datenerhebung für eigene Zwecke gibt es nicht.
```

Falls das Feld auf Englisch erwartet wird:

```
Single purpose: display and control the DNS64 blocklists of a self-hosted Node64 instance. The popup shows blocking state, 24-hour stats and the status of the current domain; it pauses blocking (10 minutes, custom, or until resumed) and puts single domains on the node's allow or deny list. No other features, content, ads or data collection for the developer's own purposes.
```

---

## 3. Begründung je Berechtigung

### 3.1 `storage`

> 339 von 1000 Zeichen

```
Speichert ausschließlich lokal im Browser: die Adresse der Node (z. B. http://192.168.1.4:8080), den API-Schlüssel des Nutzers für diese Node und die Hell/Dunkel-Einstellung. Der Schlüssel wird nur als Authorization-Header an die eingetragene Adresse gesendet, nie an den Entwickler, nie an Dritte. Keine Synchronisierung, keine Sicherung.
```

### 3.2 `alarms`

> 330 von 1000 Zeichen

```
Hält das Abzeichen am Symbol aktuell: einmal pro Minute fragt die Erweiterung /api/dns64/status der eingetragenen Node ab und zeigt ON (Blockieren aktiv), OFF (pausiert) oder ! (Node nicht erreichbar / Schlüssel abgelehnt). Ohne diesen Takt bliebe das Abzeichen veraltet; einen anderen periodischen Zeitgeber gibt es in MV3 nicht.
```

### 3.3 `activeTab`

> 426 von 1000 Zeichen

```
Liefert erst nach Klick auf das Symbol den Hostnamen des aktiven Tabs, damit das Popup den Sperrstatus genau dieser Domain anzeigen und sie freigeben oder sperren kann. Der Hostname bleibt nur im Arbeitsspeicher, solange das Popup offen ist: nicht gespeichert, nicht protokolliert, ausschließlich als Suchbegriff an die eigene Node gesendet. Seiteninhalte werden nicht gelesen, keine Skripte injiziert, keine Verläufe erfasst.
```

### 3.4 Hostberechtigung (`http://*/*`, `https://*/*`)

> 499 von 1000 Zeichen

```
Die Adresse der Node64-Instanz ist frei wählbar – IP oder Hostname, beliebiger Port, HTTP oder HTTPS, üblicherweise ein Gerät im eigenen Netz (z. B. http://192.168.1.4:8080). Deshalb sind http://*/* und https://*/* nötig: die Erweiterung kennt den Server erst, wenn der Nutzer ihn einträgt, und ein engeres Muster würde jede andere Adresse aussperren. Anfragen gehen ausschließlich an diese eine eingetragene Adresse (Pfade /api/dns64/…). Keine Fremdhosts, keine Analysedienste, kein Code von außen.
```

---

## 4. Remote-Code

Auswahl: **„Nein, ich verwende ‚Remote Code' nicht"**. Das Begründungsfeld bleibt leer – es ist nur
für „Ja" gedacht. Falls das Formular trotzdem Text verlangt:

```
Es wird kein JavaScript oder Wasm aus dem Netz geladen und ausgewertet; die Erweiterung besteht nur aus den mitgelieferten Dateien. Die Kommunikation mit der Node läuft über fetch auf deren JSON-API.
```

---

## 5. Datennutzung: welche Häkchen

| Kategorie | Anhaken | Warum |
|---|---|---|
| Personenidentifizierbare Informationen | **nein** | Es werden keine Namen, Adressen, E-Mails oder Ausweise verarbeitet. |
| Gesundheitsinformationen | **nein** | — |
| Finanzdaten und Zahlungsinformationen | **nein** | — |
| Authentifizierungsdaten | **ja** | Der API-Schlüssel der Node ist ein Zugangsdatum: er wird lokal gespeichert und an die Node gesendet. |
| Persönliche Kommunikation | **nein** | Keine Mails, SMS, Chats. |
| Ort | **nein** | Kein Standort, keine IP des Nutzers. Angezeigt werden nur Einträge der *eigenen* Node (z. B. ein lokaler A-Record); die stammen vom Gerät des Nutzers und werden weder gespeichert noch weitergegeben. |
| Webprotokoll | **ja** | Der Hostname des aktiven Tabs wird gelesen, sobald das Popup geöffnet wird. |
| Nutzeraktivität | **nein** | Keine Maus-, Klick- oder Tastatur-Erfassung, keine Netzwerküberwachung. |
| Websitecontent | **nein** | Kein DOM-Zugriff, keine `content_scripts`, kein `scripting`. |

Warum „Webprotokoll" trotzdem angehakt wird: Die Erweiterung liest eine URL aus dem Browser. Auch
wenn es nur der eine aktive Tab ist und nichts gespeichert wird, ist die Angabe die ehrliche
Variante – ein nicht angehaktes Feld, das Prüfer im Code finden, ist ein Ablehnungsgrund, ein
zuviel angehaktes Feld ist keiner. Die Datenschutzerklärung erklärt die Einschränkung.

---

## 6. Die drei Bestätigungen

Alle drei anhaken – sie treffen für diese Erweiterung zu:

- [x] Ich verkaufe oder übertrage keine Nutzerdaten an Dritte (es gibt keine Dritten, keine Server des Entwicklers).
- [x] Nutzerdaten werden nicht für Zwecke außerhalb des alleinigen Zwecks verwendet (Daten dienen nur der Kommunikation mit der vom Nutzer eingetragenen Node).
- [x] Nutzerdaten werden nicht zur Kreditwürdigkeitsprüfung oder für Darlehen verwendet.

---

## 7. URL der Datenschutzerklärung

Das Feld verlangt eine **öffentlich erreichbare Seite ohne Login**. Erledigt – diese URL eintragen:

```
https://grepvortex.github.io/dns64-browser-extension/privacy.html
```

Quelle: `docs/privacy.html` im Repo, ausgeliefert über GitHub Pages (Branch `main`, Ordner `/docs`).
Anonymer Abruf geprüft: HTTP 200, `text/html`, HTTPS erzwungen. Die Seite enthält die Erklärung aus
§8 auf Deutsch und Englisch, ohne externe Ressourcen.

Wird der Text geändert: `docs/privacy.html` anpassen, committen, pushen – Pages baut in etwa einer
Minute neu. Datum oben in der Seite mitziehen.

Nicht geeignet und deshalb nicht verwendet: URL aus einem privaten Repo (404 für Prüfer), LAN-Adresse
(z. B. der `brave-ext-store` auf Port 8115) oder ein Link auf einen Login.

---

## 8. Datenschutzerklärung (Text für die URL)

### Deutsch

# Datenschutzerklärung – DNS64 Browser Extension

Stand: 7. November 2026 · Version 1.4.4

Die Erweiterung ist ein Client für eine **selbst betriebene Node64-Instanz**. Sie betreibt keinen
eigenen Server, legt keine Konten an, enthält keine Werbung, keine Analyse und keine Telemetrie.
Es gibt keinen Empfänger von Daten außer der Node, deren Adresse der Nutzer selbst einträgt.

**Verantwortlich** für die Verarbeitung ist der Nutzer selbst: Er betreibt die Node, in der die
Daten ankommen. Der Entwickler der Erweiterung erhält keine Daten und hat keinen Zugriff darauf.

**Welche Daten verarbeitet werden**

| Datum | Wo | Zweck |
|---|---|---|
| Adresse der Node (z. B. `http://192.168.1.4:8080`) | lokal, `chrome.storage.local` | Ziel der API-Aufrufe |
| API-Schlüssel der Node | lokal, `chrome.storage.local` | Anmeldung an der Node (`Authorization: Bearer …`) |
| Einstellung Hell/Dunkel | lokal, `chrome.storage.local` | Darstellung von Popup und Einstellungsseite |
| Zeitpunkt eines abgelehnten Schlüssels | lokal, `chrome.storage.local` | 15 Minuten Pause, damit die Node nicht sperrt |
| Hostname des aktiven Tabs | nur im Arbeitsspeicher, solange das Popup offen ist | Sperrstatus dieser Domain anzeigen |

Der Hostname wird nicht gespeichert und nicht protokolliert. Er wird als Suchbegriff an die Node
gesendet, um deren Abfrage-Log nach dieser Domain zu durchsuchen, und beim Freigeben oder Sperren
als Domain-Eintrag an die Node übergeben.

Keine Erhebung von Namen, E-Mail-Adressen, Standortdaten, Kommunikationsinhalten, Gesundheits- oder
Finanzdaten. Keine Profile, keine Auswertung des Nutzungsverhaltens.

**Wohin Daten gehen**

Ausschließlich an die Node-Adresse, die der Nutzer einträgt – bei der üblichen Einrichtung ein Gerät
im eigenen Netz. Der API-Schlüssel geht als Header an genau diese Adresse, der Hostname des aktiven
Tabs als Suchparameter. Weitere Empfänger gibt es nicht; es werden keine Daten verkauft, nicht an
Dritte übertragen und nicht zur Kreditwürdigkeitsprüfung verwendet.

**Speicherung und Löschung**

Die Angaben liegen im lokalen Speicher des Browserprofils, werden nicht synchronisiert und nicht
gesichert. Löschen: Erweiterung entfernen oder die Felder auf der Einstellungsseite leeren. Kopien
bleiben keine zurück. Daten in der Node verwaltet der Nutzer dort selbst.

**Berechtigungen**

- `storage` – die oben genannten Angaben lokal speichern
- `alarms` – das Abzeichen am Symbol einmal pro Minute aktualisieren
- `activeTab` – nach Klick auf das Symbol den Hostnamen des aktiven Tabs lesen
- `http://*/*`, `https://*/*` – Zugriff auf die frei wählbare Node-Adresse

Die Erweiterung liest keine Seiteninhalte, injiziert keine Skripte in Webseiten, legt keinen
Verlauf an und lädt keinen Code aus dem Netz.

**Kinder**

Die Erweiterung richtet sich nicht an Kinder und erhebt wissentlich keine Daten von Kindern.

**Änderungen**

Änderungen dieser Erklärung erscheinen mit einer neuen Version der Erweiterung; das Datum oben wird
angepasst.

**Kontakt**

GitHub: <https://github.com/GrepVortex>

### English

# Privacy Policy – DNS64 Browser Extension

Last updated: 7 November 2026 · Version 1.4.4

This extension is a client for a **self-hosted Node64 instance**. It runs no server of its own,
creates no accounts, contains no ads, analytics or telemetry, and sends data to nobody except the
node whose address the user enters.

**Controller.** The user is the controller: they run the node that receives the data. The extension
developer receives no data and has no access to it.

**Data processed.** Node address, node API key, theme preference and the timestamp of a rejected
key are stored locally in `chrome.storage.local`, only to talk to the node the user configured. The
hostname of the active tab is held in memory while the popup is open, to show the blocking status of
that site and to set or remove a domain on the node's allow/deny list; it is not stored and not
logged.

No names, email addresses, location, communications, health or financial data. No profiling.

**Recipients.** Only the node address entered by the user – typically a device on their own network.
The API key is sent there as an `Authorization: Bearer` header, the hostname as a query parameter.
Data is not sold, not shared with third parties and not used for creditworthiness.

**Retention and deletion.** Data lives in the browser profile, is not synced and not backed up.
Removing the extension or clearing the fields on the options page deletes it. Data held by the node
is managed there by the user.

**Permissions.** `storage` (local settings), `alarms` (refresh the toolbar badge once a minute),
`activeTab` (read the active tab's hostname after a click on the icon) and host access to the
user-configured node address. No page content is read, no script is injected, no history is built,
no remote code is loaded.

**Contact.** GitHub: <https://github.com/GrepVortex>

---

## 9. Was Prüfer zusätzlich ansehen

- **Testanweisungen sind auf 500 Zeichen begrenzt** und müssen ohne eigenen Server auskommen:
  Kurzfassung in `REVIEWER-NOTES.md` (481 Zeichen, englisch) mit Docker-Zeile, dem Pflichtschritt
  „DNS64-Modul unter Settings → Modules einschalten" (sonst 404) und dem Link auf den ausführlichen
  Prüf-Guide `https://grepvortex.github.io/dns64-browser-extension/reviewer.html`.
- **Hostberechtigung weckt Argwohn.** `http://*/*` + `https://*/*` bei einer Erweiterung, die nur
  eine API anspricht, liest sich wie ein Datenabgriff. Deshalb ist die Begründung in §3.4 bewusst
  konkret („eine Adresse, die der Nutzer einträgt") – und im Feld **Testanweisungen** sollte
  `REVIEWER-NOTES.md` liegen, damit klar ist: ohne eigene Node zeigt die Erweiterung nur den
  Einrichtungsdialog.
- **Ein-Zweck-Prüfung.** Keine zusätzlichen Features nachschieben (Theme-Umschalter, Info-Seite und
  Verweis auf die Node-Weboberfläche sind Teil der Bedienung, nicht ein zweiter Zweck).
- **Kein Overreach im Code.** Keine `content_scripts`, kein `scripting`, kein `tabs` – das ist der
  stärkste Beleg für die Texte oben und sollte so bleiben.
- **Alternative, falls die Prüfung hängt:** Hostzugriff auf `optional_host_permissions` umstellen und
  erst beim Speichern der Node-Adresse per `chrome.permissions.request()` anfragen. Das kostet einen
  zusätzlichen Klick bei der Einrichtung und eine Code-Änderung, entfernt aber die pauschale
  Hostberechtigung aus dem Installationsdialog. Erst nötig, wenn die Version abgelehnt wird.

---

## 10. Nach dem Absenden

- Dieselbe URL in `README.md` und im Store-Eintrag verlinken, damit Nutzer sie außerhalb des Stores finden.
- Bei jeder neuen Version: Passen die Antworten noch? Ändert sich eine Berechtigung, muss die
  Begründung mit – sonst wird die Version abgelehnt.
- `PRIVACY.md` und `PERMISSIONS.md` sind durch diese Datei ersetzt und können gelöscht werden.
