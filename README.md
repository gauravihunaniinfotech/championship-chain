# Championship Chains — Redesign

Static site: HTML5 + CSS3 + vanilla JS, with GSAP/ScrollTrigger and Swiper loaded from CDN.

## Run
Open `index.html` in a browser, or serve the folder (`python3 -m http.server`).
Needs an internet connection for fonts, GSAP, Swiper and the original images.

## Structure
- `index.html` — semantic markup, one `<h1>`, SVG icon sprite
- `css/style.css` — variables, base, components, sections
- `css/responsive.css` — breakpoints 1920 / 1600 / 1440 / 1200 / 1024 / 991 / 768 / 567 / 425 / 375 / 320
- `js/main.js` — header, mega menu, search overlay, mobile drawer
- `js/interactions.js` — Swiper sliders, FAQ accordion, read-more, product hover
- `js/animations.js` — GSAP reveals, text split, parallax, timeline, counters (skipped for reduced motion)
- `tools/localize_assets.py` — optional: downloads every original image into `assets/images/` and rewrites the HTML

## Images
All images are the original championshipchains.com files, loaded from the store CDN
(no stock or generated imagery). To host them yourself, run `python3 tools/localize_assets.py`.

## Content
Copy, prices, FAQs, testimonials, contact details and links come from the live site.
The header label "Intract" and the duplicated Ryan K. testimonial are kept as on the original.
The "Play Video" button links to the brand's YouTube channel because the original video file URL
was not available in the page content.
