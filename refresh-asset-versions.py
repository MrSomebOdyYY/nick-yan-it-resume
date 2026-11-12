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
ASSETS = ("styles.css", "script.js", "assets/NickYan_IT_Resume.pdf")


def main():
    versions = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()[:12]
                for name in ASSETS}
    path = ROOT / "index.html"
    original = path.read_text(encoding="utf-8")
    pattern = r'''((?:href|src)=["'])(styles\.css|script\.js|assets/NickYan_IT_Resume\.pdf)(?:\?[^"']*)?(["'])'''
    updated = re.sub(pattern, lambda match:
                     f"{match[1]}{match[2]}?v={versions[match[2]]}{match[3]}", original)
    if "--check" in sys.argv:
        if original != updated:
            raise SystemExit("Asset versions are outdated. Run: python3 refresh-asset-versions.py")
        print("Asset versions are current.")
        return
    if updated != original:
        path.write_text(updated, encoding="utf-8")
    for name, version in versions.items():
        print(f"{name}?v={version}")


if __name__ == "__main__":
    main()
