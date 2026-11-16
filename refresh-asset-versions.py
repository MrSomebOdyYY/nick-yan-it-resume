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
ASSETS = ("styles.css", "coursework.css", "script.js", "assets/NickYan_IT_Resume.pdf")


def main():
    versions = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()[:12]
                for name in ASSETS}
    pattern = r'''((?:href|src)=["'])(styles\.css|coursework\.css|script\.js|assets/NickYan_IT_Resume\.pdf)(?:\?[^"']*)?(["'])'''
    updates = {}
    for path in ROOT.glob("*.html"):
        original = path.read_text(encoding="utf-8")
        updated = re.sub(pattern, lambda match:
                         f"{match[1]}{match[2]}?v={versions[match[2]]}{match[3]}", original)
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
