# Nick Yan — IT résumé website

Public site: https://mrsomebodyyy.github.io/nick-yan-it-resume/

A static English portfolio for IT internship and co-op applications. The existing GitHub Pages repository, main branch and public URL are unchanged.

## Edit in VS Code

- `index.html`: résumé text, projects and contact links.
- `styles.css`: layout, colour, fonts and responsive styles.
- `script.js`: mobile menu, keyboard interactions and GSAP animations.
- `assets/NickYan_IT_Resume.pdf`: the downloadable résumé. Replace this file using the same name to update the PDF; update the webpage text separately.
- `assets/share.jpg`: the social sharing preview.

Save your changes. If you changed `styles.css`, `script.js` or the résumé PDF, run `python3 refresh-asset-versions.py` once from this folder. It updates the asset versions in `index.html` so returning visitors receive the new files instead of an older cached copy. Then review your changes in VS Code Source Control, commit (including `index.html`), and push to `main`. GitHub Pages deploys the update automatically. Check the repository's Actions tab and the public website when deployment finishes. No package installation or compilation is needed.

For a local preview, run `python3 -m http.server 8000` from this directory and open http://localhost:8000/ . Basic page content also works when opening index.html directly.

## Design and animation

The November 2026 refresh uses Taste Skill's typography, grid and restrained motion guidance, the existing forest-green/cream identity and locally hosted Onest fonts. GSAP 3.15.1 drives the one-time hero entrance and a scroll-linked word-highlight statement. The unchanged Taste motion stylesheet provides button and link feedback.

All content remains readable without JavaScript or when the animation library is unavailable. Reduced-motion preferences disable movement. There are no analytics, forms, remote font dependencies or perpetual animations.

The small project diagrams depict subject areas; they are not project screenshots. Networking work is explicitly described as simulated academic labs. The PDF was replaced with the owner’s latest supplied resume on November 12, 2026, without altering its contents.

## Vendored assets and licenses

- `assets/vendor/gsap/`: GSAP and ScrollTrigger 3.15.1, from the official npm package. License included.
- `assets/fonts/`: Onest 400/500/600 from Google Fonts, licensed under SIL OFL 1.1 (included).
- `assets/taste/motion.css`: unmodified Taste Skill 2.5.1 motion stylesheet; license included.

GitHub Pages uses **Deploy from a branch → main → /(root)**. Keep the repository name and canonical URL unchanged to preserve the website address.
