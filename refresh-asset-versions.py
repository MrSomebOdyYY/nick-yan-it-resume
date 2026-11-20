#!/usr/bin/env python3
"""Update browser cache keys after editing CSS, JavaScript or the resume PDF.

Run: python3 refresh-asset-versions.py
No dependencies; the site itself remains plain static HTML.
"""
import hashlib
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
ASSETS = ("assets/images/portfolio-screen.webp", "assets/editorial.css", "assets/editorial-motion.css",
          "assets/evidence-viewer.css", "assets/evidence-viewer.js", "styles.css", "coursework.css", "script.js", "assets/bookmarks.css",
          "assets/portfolio-motion.css", "assets/portfolio-motion.js", "assets/section-motion.css",
          "assets/section-motion.js", "assets/project-strip.css", "assets/project-strip.js",
          "assets/bookmarks.js", "assets/favicon.svg", "assets/NickYan_IT_Resume.pdf",
          "assets/evidence/property-schema.svg", "assets/images/nick-yan-signature.svg", "assets/images/portfolio-live.png", "assets/evidence/packet-tracer-topology-osi.png",
          "assets/evidence/packet-tracer-topology-pdu.png")


ASSETS += tuple(str(path.relative_to(ROOT)) for path in sorted((ROOT / "assets/evidence/thumbnails").glob("*.webp")))


def main():
    versions = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()[:12]
                for name in ASSETS}
    asset_names = "|".join(re.escape(name) for name in ASSETS)
    pattern = rf'''((?:href|src|data-strip-thumb)=["'])({asset_names})(?:\?[^"']*)?(["'])'''
    share_version = hashlib.sha256((ROOT / "assets/share.jpg").read_bytes()).hexdigest()[:12]
    updates = {}
    for path in ROOT.glob("*.html"):
        original = path.read_text(encoding="utf-8")
        updated = re.sub(pattern, lambda match:
                         f"{match[1]}{match[2]}?v={versions[match[2]]}{match[3]}", original)
        updated = re.sub(r'(property="og:image" content="[^"]*/assets/share\.jpg)(?:\?[^"]*)?"',
                         lambda match: f'{match[1]}?v={share_version}"', updated)
        if original != updated:
            updates[path] = updated
    if "--check" in sys.argv:
        if updates:
            raise SystemExit("Asset versions are outdated. Run: python3 refresh-asset-versions.py")
        print("Asset versions are current.")
        return
    for path, updated in updates.items():
        path.write_text(updated, encoding="utf-8")
    for name, version in versions.items():
        print(f"{name}?v={version}")


if __name__ == "__main__":
    main()
