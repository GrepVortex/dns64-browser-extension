#!/usr/bin/env python3
"""Baut die HTML-Unterseiten der Homepage aus den Markdown-Quellen im Repo.

    python3 docs/_build.py            # schreibt dokumentation.html, datenschutz.html, lizenz.html

Quellen: docs/DOKUMENTATION.md, store/PRIVACY.md, NOTICE.md, LICENSE.md.
Die Startseite (docs/index.html) ist handgeschrieben und wird hier nicht angefasst.
"""
import pathlib
import re
import sys

try:
    import markdown
except ImportError:
    sys.exit("python-markdown fehlt (pip install markdown)")

DOCS = pathlib.Path(__file__).resolve().parent
ROOT = DOCS.parent

CSS = """
  :root {
    color-scheme: light dark;
    --fg: #1b1b1f; --muted: #55555f; --bg: #fdfdfc; --rule: #e3e3e0;
    --accent: #6d5ae6; --card: #f6f5f2;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fg: #ececf1; --muted: #a5a5b0; --bg: #16161a; --rule: #2c2c33;
      --accent: #a99bff; --card: #1e1e24;
    }
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.65 -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  a { color: var(--accent); }
  a:hover { text-decoration: none; }
  header.site { border-bottom: 1px solid var(--rule); }
  header.site .bar { max-width: 62rem; margin: 0 auto; padding: .9rem 1.25rem;
    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .brand { display: flex; align-items: center; gap: .6rem; font-weight: 600; letter-spacing: -.01em; }
  .brand img { width: 28px; height: 28px; border-radius: 6px; }
  .brand span { font-weight: 400; color: var(--muted); }
  nav.top { margin-left: auto; display: flex; gap: 1.1rem; font-size: .92rem; flex-wrap: wrap; }
  nav.top a { color: var(--muted); text-decoration: none; }
  nav.top a:hover, nav.top a[aria-current] { color: var(--fg); }
  main { max-width: 46rem; margin: 0 auto; padding: 2.6rem 1.25rem 5rem; }
  h1 { font-size: 1.7rem; line-height: 1.25; margin: 0 0 .35rem; letter-spacing: -.01em; }
  h2 { font-size: 1.15rem; margin: 2.5rem 0 .6rem; }
  h3 { font-size: 1rem; margin: 1.8rem 0 .4rem; }
  p, ul, ol { margin: .7rem 0; }
  ul, ol { padding-left: 1.25rem; }
  li { margin: .25rem 0; }
  code {
    font: .9em/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    background: var(--card); border: 1px solid var(--rule); border-radius: 4px; padding: .1em .35em;
  }
  pre {
    background: var(--card); border: 1px solid var(--rule); border-radius: 8px;
    padding: .85rem 1rem; overflow-x: auto; font-size: .86rem; line-height: 1.5;
  }
  pre code { background: none; border: 0; padding: 0; font-size: 1em; }
  blockquote { margin: 1rem 0; padding: .6rem 1rem; border-left: 3px solid var(--accent);
    background: var(--card); border-radius: 0 6px 6px 0; color: var(--muted); }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: .94rem; }
  th, td { text-align: left; vertical-align: top; padding: .5rem .6rem; border-bottom: 1px solid var(--rule); }
  th { color: var(--muted); font-weight: 600; font-size: .85rem; text-transform: uppercase; letter-spacing: .03em; }
  hr { border: 0; border-top: 1px solid var(--rule); margin: 2.4rem 0; }
  .lead { color: var(--muted); margin: 0 0 2rem; }
  footer.site { border-top: 1px solid var(--rule); padding: 1.6rem 1.25rem 3rem
    ; color: var(--muted); font-size: .86rem; }
  footer.site .bar { max-width: 46rem; margin: 0 auto; display: flex; gap: 1.1rem; flex-wrap: wrap; }
  footer.site a { color: var(--muted); }
  footer.site a:hover { color: var(--accent); }
"""

NAV = """    <nav class="top">
      <a href="./">Start</a>
      <a href="dokumentation.html"{c_doku}>Dokumentation</a>
      <a href="datenschutz.html"{c_ds}>Datenschutz</a>
      <a href="lizenz.html"{c_liz}>Lizenz</a>
      <a href="https://github.com/GrepVortex/dns64-browser-extension">GitHub&nbsp;↗</a>
    </nav>"""

SHELL = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="favicon.png" type="image/png">
<link rel="canonical" href="https://grepvortex.github.io/dns64-browser-extension/{file}">
<style>{css}</style>
</head>
<body>
<header class="site"><div class="bar">
    <div class="brand"><a href="./" style="display:flex;align-items:center;gap:.6rem;color:inherit;text-decoration:none">
      <img src="favicon.png" alt="">DNS64<span>Browser Extension</span></a></div>
{nav}
</div></header>
<main>
{body}
</main>
<footer class="site"><div class="bar">
  <a href="./">Start</a><a href="dokumentation.html">Dokumentation</a>
  <a href="datenschutz.html">Datenschutz</a><a href="lizenz.html">Lizenz &amp; Herkunft</a>
  <a href="https://github.com/GrepVortex/dns64-browser-extension">Quellcode</a>
</div></footer>
</body>
</html>
"""

def render(md_text: str) -> str:
    return markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "sane_lists", "attr_list"],
        output_format="html5",
    )


def page(file, title, desc, body, current):
    nav = NAV
    for key, flag in (("c_doku", "dokumentation.html"), ("c_ds", "datenschutz.html"), ("c_liz", "lizenz.html")):
        nav = nav.replace("{" + key + "}", ' aria-current="page"' if flag == file else "")
    html = SHELL.format(title=title, desc=desc, file=file, css=CSS, nav=nav, body=body)
    (DOCS / file).write_text(html, encoding="utf8")
    print("geschrieben:", file, f"({len(html)} Bytes)")


def strip_first_h1(md_text: str) -> tuple[str, str]:
    """Erste H1 entfernen und zurückgeben (steht schon im Seitentitel)."""
    m = re.search(r"^#\s+(.+)$", md_text, re.M)
    if not m:
        return md_text, ""
    return md_text[:m.start()] + md_text[m.end():], m.group(1).strip()


def main():
    # 1. Dokumentation
    raw = (DOCS / "DOKUMENTATION.md").read_text(encoding="utf8")
    body_md, h1 = strip_first_h1(raw)
    body = (f'<h1>{h1}</h1>'
            '<p class="lead">Funktionsumfang, Architektur, genutzte API-Endpunkte, Sicherheit, '
            'Testprotokoll und Lizenzen – die technische Beschreibung der Erweiterung.</p>'
            + render(body_md))
    page("dokumentation.html", "Dokumentation – DNS64 Browser Extension",
         "Technische Dokumentation der Erweiterung: Funktionsumfang, Architektur, genutzte "
         "API-Endpunkte, Berechtigungen, Hell/Dunkel-Umschaltung und Testprotokoll.",
         body, "dokumentation.html")

    # 2. Datenschutz
    raw = (DOCS.parent / "store" / "PRIVACY.md").read_text(encoding="utf8")
    page("datenschutz.html", "Datenschutzerklärung – DNS64 Browser Extension",
         "Datenschutzerklärung der Browser-Erweiterung: welche Daten verarbeitet werden, "
         "wohin sie gehen und wie man sie löscht.",
         render(raw), "datenschutz.html")

    # 3. Lizenz und Herkunft
    notice = (DOCS.parent / "NOTICE.md").read_text(encoding="utf8")
    lic = (DOCS.parent / "LICENSE.md").read_text(encoding="utf8")
    intro = """
<p class="lead">Die Erweiterung steht unter Apache-2.0. Das Symbol stammt vom Node64-Logo und
bleibt Eigentum der Prox IT UG.</p>
<div class="note" style="background:var(--card);border-left:3px solid var(--accent);border-radius:0 6px 6px 0;padding:.85rem 1rem;margin:1.4rem 0">
  <b>Kurzfassung:</b> Du darfst die Erweiterung nutzen, ändern und weitergeben – auch kommerziell.
  Bedingung: Copyright- und Lizenzhinweis beibehalten und Änderungen kennzeichnen. Es gibt keine
  Gewährleistung. Der Name <i>Node64</i> und das Logo der Node64 sind nicht Teil dieser Lizenz.
</div>
"""
    body = ('<h1>Lizenz und Herkunft</h1>' + intro + render(strip_first_h1(notice)[0]) + "\n<hr>\n"
            + "<h2>Apache License 2.0</h2>\n" + render(strip_first_h1(lic)[0]))
    page("lizenz.html", "Lizenz und Herkunft – DNS64 Browser Extension",
         "Lizenzhinweise der Erweiterung: Apache-2.0 für den Quellcode, Herkunft und Rechte am "
         "Node64-Logo, Abgrenzung zum Projekt Node64.",
         body, "lizenz.html")


if __name__ == "__main__":
    main()
