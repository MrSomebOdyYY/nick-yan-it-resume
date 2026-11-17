# Nick Yan — IT résumé website

Public site: https://mrsomebodyyy.github.io/nick-yan-it-resume/

An English portfolio for IT internship and co-op applications, built with static HTML, CSS and JavaScript. This revision includes six project cards, selected coursework evidence and an updated two-page résumé. The existing repository, main branch and public URL are unchanged.

## Edit in VS Code

- `index.html`: introduction, projects, experience, education, skills and contact links.
- `coursework.html`: selected coursework evidence and download links.
- `styles.css` and `coursework.css`: layout, colours, fonts and responsive styles.
- `script.js`: mobile navigation, keyboard interactions and GSAP animations.
- `assets/NickYan_IT_Resume.pdf`: the downloadable résumé. Replace it with the same filename, then update the webpage text and last-updated date to match.
- `assets/evidence/`: curated screenshots, diagrams, SQL and source files. Only include material intended for public sharing.
- `assets/share.jpg`: the social sharing image.

Save your changes, then run `python3 refresh-asset-versions.py` from this folder. This updates CSS, JavaScript and résumé PDF cache versions in all HTML pages so returning visitors receive the current files. Review the changes locally, commit all changed files using VS Code Source Control, and push to `main`. GitHub Pages deploys automatically; confirm success in the repository's Actions tab and check the public website. No package installation or build step is needed.

For a local preview, run `python3 -m http.server 8000` from this directory and open http://localhost:8000/ . Run `python3 refresh-asset-versions.py --check` to check asset versions without changing files.

## Content and accessibility

Project descriptions distinguish individual coursework, group work, supplied lab materials and AI-assisted website development. The coursework page includes source files and selected original evidence, with the limitations of classroom and virtual-machine work stated explicitly. The résumé was updated on November 15, 2026.

The site uses a forest-green and cream palette, locally hosted Onest fonts, CSS entrance animations and GSAP scroll-linked highlighting. The entrance begins with the stylesheet, continues independently of external scripts, and pauses while its tab is hidden. Reduced-motion preferences are respected; content remains readable without JavaScript. Navigation supports keyboard use, and project details use native disclosure controls. The local fonts use optional loading to avoid a late font swap; retain the early navigation setup when editing the header.

There are no analytics, forms or remote font dependencies. The public contact details are included at the owner's request.

## Vendored assets and licences

- `assets/vendor/gsap/`: GSAP and ScrollTrigger 3.15.1; licence included.
- `assets/fonts/`: Onest 400/500/600, SIL Open Font License 1.1; licence included.
- `assets/taste/motion.css`: Taste Skill 2.5.1 motion stylesheet; licence included.

GitHub Pages uses **Deploy from a branch → main → /(root)**. Keep the repository name and canonical URL unchanged to preserve the website address.
