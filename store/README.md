# Chrome-Web-Store-Paket – DNS64 Browser Extension 1.4.4

Alles, was für die Einreichung im Chrome Web Store gebraucht wird. Reihenfolge beim Anlegen
eines neuen Artikels: Bilder hochladen, dann Texte aus `LISTING.md` einsetzen, dann
`PERMISSIONS.md` in die Begründungsfelder, zuletzt `REVIEWER-NOTES.md` in „Anweisungen für die
Prüfung".

| Datei | Zweck im Dashboard |
|---|---|
| `dns64-browser-extension-1.4.4-webstore.zip` | „Paket hochladen" (manifest.json liegt im ZIP-Wurzelverzeichnis) |
| `screenshots/01-status.png` … `05-einrichtung.png` | Screenshots 1–5, je 1280 × 800 px |
| `promo/small-440x280.png` | Small promo tile |
| `promo/marquee-1400x560.png` | Marquee promo tile |
| `../icons/icon128.png` | Store-Symbol 128 × 128 px |
| `LISTING.md` | Name, Kurzbeschreibung, ausführliche Beschreibung (deutsch und englisch), Kategorie |
| `PERMISSIONS.md` | Begründung je Berechtigung + „Single purpose" |
| `REVIEWER-NOTES.md` | Testanleitung für die Prüfung (inkl. Node64 per Docker) |
| `PRIVACY.md` | Datenschutzerklärung – muss unter öffentlicher URL erreichbar sein |

## Ablauf

1. **Entwicklerkonto:** <https://chrome.google.com/webstore/devconsole> – einmalig 5 USD,
   2-Faktor-Anmeldung ist Pflicht.
2. **Neuer Artikel:** ZIP aus diesem Ordner hochladen (nicht das `.crx`; der Store signiert selbst).
3. **Store-Eintrag:** Sprache Deutsch, Kategorie *Produktivität*, Texte aus `LISTING.md`.
4. **Grafiken:** Screenshots in der Reihenfolge 01–05, dann die beiden Promo-Bilder, Symbol 128 px.
5. **Datenschutz:** `PRIVACY.md` veröffentlichen (z. B. öffentlicher Gist oder GitHub Pages) und
   die URL eintragen; im Reiter „Datenschutzpraktiken" die Angaben aus `PERMISSIONS.md` setzen.
6. **Prüfung:** `REVIEWER-NOTES.md` einfügen. Ohne diese Notizen kann die Prüfung die Erweiterung
   nicht sinnvoll testen, weil sie eine eigene Node64-Instanz voraussetzt.
7. **Veröffentlichen:** Sichtbarkeit „Öffentlich", alle Regionen, kostenlos. Die Prüfung dauert
   üblicherweise einige Tage; bei Rückfragen kommt eine Mail an die Konto-Adresse.

## Vor dem Einreichen prüfen

- Version im Manifest (`1.4.4`) und Dateiname des ZIP müssen zusammenpassen.
- Kein `.pem`, kein `.crx`, keine `docs/`, keine `store/`-Dateien im ZIP.
- `NOTICE.md` und `LICENSE.md` sind im ZIP enthalten (Attribution des Node64-Logos, Apache-2.0).
- Nach jeder neuen Version: `~/git/dns64-switch-build.sh` (CRX für den eigenen Store) **und**
  `store/make-webstore-zip.sh` (ZIP für den Chrome Web Store) laufen lassen, Version im Manifest
  erhöhen, ZIP neu erzeugen.
