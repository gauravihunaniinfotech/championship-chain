#!/usr/bin/env python3
"""Download every original championshipchains.com image used in index.html into
assets/images/ and rewrite index.html to use the local copies.

Run from the project root, on a machine with internet access:
    python3 tools/localize_assets.py

A backup is saved as index.remote.html first. Delete it once you are happy.
"""
import re, shutil, sys, urllib.request, pathlib
from urllib.parse import urlparse

root = pathlib.Path(__file__).resolve().parent.parent
html_path = root / "index.html"
out_dir = root / "assets" / "images"
out_dir.mkdir(parents=True, exist_ok=True)

html = html_path.read_text(encoding="utf-8")
pattern = re.compile(r'https://championshipchains\.com/cdn/shop/files/[^"\s)]+')
urls = sorted(set(pattern.findall(html)))
print(f"{len(urls)} image URLs found")

shutil.copy(html_path, root / "index.remote.html")
mapping, failed = {}, []
for url in urls:
    name = pathlib.Path(urlparse(url).path).name
    # keep width variants apart (same file can appear at several widths)
    width = re.search(r"width=(\d+)", url)
    stem, dot, ext = name.rpartition(".")
    local = f"{stem}-{width.group(1)}.{ext}" if width else name
    dest = out_dir / local
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as f:
            f.write(r.read())
        mapping[url] = f"assets/images/{local}"
        print("ok  ", local)
    except Exception as e:  # noqa: BLE001
        failed.append((url, str(e)))
        print("FAIL", local, e)

for url, local in mapping.items():
    html = html.replace(url, local)
html_path.write_text(html, encoding="utf-8")
print(f"Rewrote {len(mapping)} URLs. Failed: {len(failed)}")
sys.exit(1 if failed else 0)
