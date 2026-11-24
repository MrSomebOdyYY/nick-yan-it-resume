# Nick Yan — IT résumé website

[Open Nick Yan’s portfolio](https://mrsomebodyyy.github.io/nick-yan-it-resume/)

I’m an Information Technology student at KPU in Vancouver. I’m looking for an internship or co-op. This portfolio brings together the lab checks, queries and small programs I can discuss in an interview.

| Project | What to look for |
| --- | --- |
| [Track Speed for Android](https://mrsomebodyyy.github.io/nick-yan-it-resume/#project-track-speed) | A Java app for comparing GPS-timed standing starts. The project includes timing tests, source code and an installable Android APK. |
| [Windows access control](https://mrsomebodyyy.github.io/nick-yan-it-resume/#project-windows) | One test account could open a shared folder and was denied access to a restricted folder. |
| [Apache HTTPS on Ubuntu](https://mrsomebodyyy.github.io/nick-yan-it-resume/#project-linux) | A Kali client reached the Apache site using a local hostname and a self-signed certificate. |
| [Networking](https://mrsomebodyyy.github.io/nick-yan-it-resume/#project-networks) | IPv4 subnet calculations and an Ethernet frame inspected in Cisco Packet Tracer. |
| [Property database](assets/evidence/database-schema.sql) | Nine SQL tables link buyers, properties, bills and payments. |
| [Java driving simulation](https://mrsomebodyyy.github.io/nick-yan-it-resume/#project-driving) | A console program estimates fuel costs and compares them with a trip budget. |
| [Portfolio website](index.html) | I supplied the work samples and directed the design. The implementation was AI-assisted. |

## Edit in VS Code

- `index.html`: introduction, projects, experience, education, skills and contact links.
- `coursework.html`: selected coursework evidence and download links.
- `styles.css` and `coursework.css`: layout, colours, fonts and responsive styles.
- `script.js`: mobile navigation, keyboard interactions and GSAP animations.
- `assets/bookmarks.css` and `assets/bookmarks.js`: bookmark layout and page switching.
- `assets/favicon.svg`: the signature used in the header and browser tab on both pages.
- `assets/NickYan_IT_Resume.pdf`: the downloadable résumé. Replace it with the same filename, then update the webpage text and last-updated date to match.
- `assets/evidence/`: curated screenshots, diagrams, SQL and source files. Only include material intended for public sharing.
- `assets/share.jpg`: the social sharing image.

Save your changes, then run `python3 refresh-asset-versions.py` from this folder. This updates CSS, JavaScript and résumé PDF cache versions in all HTML pages so returning visitors receive the current files. Review the changes locally, commit all changed files using VS Code Source Control, and push to `main`. GitHub Pages deploys automatically; confirm success in the repository's Actions tab and check the public website. No package installation or build step is needed.

For a local preview, run `python3 -m http.server 8000` from this directory and open http://localhost:8000/ . Run `python3 refresh-asset-versions.py --check` to check asset versions without changing files.

### Add a bookmark

In `index.html`, copy a whole entry inside the appropriate `data-book` container. For example, in Projects copy an `<article class="project" …>…</article>`, give it a unique ID such as `project-inventory`, and set `data-tab-label="Inventory"`. Update its heading, description and evidence. Its position in the HTML determines its position in the tab strip. The new tab and keyboard controls are created automatically. The ID also works as a direct link, such as `#project-inventory`. Without JavaScript, the entries appear in document order.

## Content and accessibility

Project descriptions distinguish individual coursework, group work, supplied lab materials and AI-assisted website development. The coursework page includes source files and selected original evidence, with the limitations of classroom and virtual-machine work stated explicitly.

The site uses a forest-green and cream palette, locally hosted Onest fonts, CSS entrance animations and GSAP scroll-linked highlighting. The entrance begins with the stylesheet, continues independently of external scripts, and pauses while its tab is hidden. Reduced-motion preferences are respected; content remains readable without JavaScript. Navigation supports keyboard use, and project details use native disclosure controls. The local fonts use optional loading to avoid a late font swap; retain the early navigation setup when editing the header.

There are no analytics, forms or remote font dependencies. The public contact details are included at the owner's request.

## Vendored assets and licences

- `assets/vendor/gsap/`: GSAP and ScrollTrigger 3.15.1; licence included.
- `assets/fonts/`: Onest 400/500/600, SIL Open Font License 1.1; licence included.
- `assets/taste/motion.css`: Taste Skill 2.5.1 motion stylesheet; licence included.

GitHub Pages uses **Deploy from a branch → main → /(root)**. Keep the repository name and canonical URL unchanged to preserve the website address.
