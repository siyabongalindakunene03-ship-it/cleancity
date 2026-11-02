# Clean City Website – WEDE5020 POE (Part 3)

## Student Information
- **Name:** Siyabonga Linda Kunene
- **Student number:** ST10484674
- **Group:** 4
- **Module:** WEDE5020 – Web Development (Introduction)
- **Institution:** The IIE's Rosebank College

**Repository:** https://github.com/siyabongalindakunene03-ship-it/cleancity
**Live site (GitHub Pages):** https://siyabongalindakunene03-ship-it.github.io/cleancity/

---

## 1. Project Overview
Clean City is a responsive, multi-page website for a fictional Johannesburg recycling and community-clean-up organisation that serves **Braamfontein, Newtown and Hillbrow**. Part 1 planned the site, Part 2 built the pages with HTML and CSS, and **Part 3 (this version)** adds interactivity, search-engine optimisation, performance and security improvements, working forms and deployment.

### Goals
- Explain clearly who Clean City is and what it offers.
- Make services, events and locations easy to find (navigation, search, filters, map).
- Let visitors take action: volunteer, ask for a quote, or contact the team.
- Work well on phones, tablets and desktops, and for people using keyboards or screen readers.
- Load quickly and be easy for search engines to understand.

## 2. Website Structure

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Introduces Clean City, programmes, areas served, impact numbers, what we recycle, testimonials |
| About | `about.html` | Mission, values and a photo gallery with a lightbox |
| Services | `services.html` | Programmes, searchable service list, recycling guide (tabs), areas served |
| Get Involved | `get-involved.html` | Interactive map, searchable upcoming events with detail pop-ups, how volunteering works, directions |
| Enquiries | `enquiry.html` | Enquiry form that answers with a cost or availability, FAQ accordion |
| Contact | `contact.html` | Contact form that compiles an email to send to the team |
| Not found | `404.html` | Friendly error page with links back into the site |

```
Home
├── About
├── Services
├── Get Involved
├── Enquiries
└── Contact
```

## 3. Part 3 Requirements and Where They Are Met

| Part 3 requirement | What was done | Where |
|---|---|---|
| Apply Part 2 feedback / fix issues | See the changelog in section 5 | whole site |
| Interactive elements (jQuery) | Accordion (FAQ), tabs (recycling guide), modal (event details) built with jQuery and the matching WAI-ARIA patterns | `js/ui.js`, `enquiry.html`, `services.html`, `get-involved.html` |
| Interactive map | Leaflet map with OpenStreetMap tiles, three markers, pop-ups, "show all locations" button; Google Maps embed for directions | `js/map.js`, `get-involved.html` |
| Animations | Hero entrance animation, scroll-reveal of sections, animated impact counters, image zoom; all switched off for visitors who prefer reduced motion | `css/style.css`, `js/main.js` |
| Gallery with lightbox | Keyboard- and touch-friendly lightbox with previous/next, captions, Esc to close and focus trapping | `about.html`, `js/main.js` |
| Dynamic content | Services and events are built from `js/data.js` by JavaScript; past events disappear automatically | `js/listings.js`, `js/data.js` |
| Search, filter and sort | Live search, category/type and area filters and several sort orders for services and events, with a result count and empty state | `services.html`, `get-involved.html` |
| Form validation | Field-by-field JavaScript validation with accessible error messages, character counters and a honeypot field | `js/forms.js` |
| Enquiry form with a response | After validation the enquiry is sent with AJAX and the page shows a cost estimate or availability based on the enquiry type | `enquiry.html`, `js/forms.js` |
| Contact form that builds an email | After validation an email is compiled (To, Subject, Body) and the visitor sends it to the recipient set in `js/config.js` with one click, or copies it | `contact.html`, `js/forms.js` |
| SEO | Unique titles and descriptions, one `h1` per page, heading hierarchy, alt text, descriptive file names, canonical links, Open Graph tags, JSON-LD structured data, internal links, `sitemap.xml`, `robots.txt` | all pages, section 6 |
| Performance | Images compressed from 30.3 MB to 3.2 MB, hero video from 29.7 MB to 0.66 MB, lazy loading, deferred scripts, self-hosted libraries, fewer font weights | section 7 |
| Security | Content-Security-Policy, no inline scripts or handlers, safe DOM writing, input sanitising, `rel="noopener"`, security headers file | section 8 |
| Version control | Many small commits with descriptive messages | `git log` |
| Documentation | This README with changelog and references | this file |
| Deployment | GitHub Pages (or Netlify) | section 10 |

## 4. Improvements Since Part 2 (Self-Review)
No written lecturer feedback on Part 2 was available when Part 3 was started, so I reviewed my own Part 2 submission against the Part 3 brief, the WCAG accessibility guidelines and Google's SEO starter guide. The problems below are the ones I found myself, and each one was fixed in Part 3.

| Problem found in Part 2 | Fix in Part 3 |
|---|---|
| No JavaScript apart from the mobile menu; forms did nothing | Added the interactive features and working forms listed above |
| No Contact page (the brief asks for `contact.html`) | Added `contact.html`; renamed `enquiries.html` to `enquiry.html` to match the brief |
| Home page and Services page repeated the same long paragraphs (duplicate content) | Home now shows short, different summaries that link to the Services page; the three programme descriptions were rewritten so each is unique |
| Every section title was an `<h1>` (many per page) | One `<h1>` per page, section titles are `<h2>`, card titles `<h3>` |
| Page structure used `<section>` for header and footer, no `<main>` | Now uses `<header>`, `<nav>`, `<main>`, `<footer>`; skip link added |
| All pages had the same title, `Clean city web site`, and no descriptions | Unique titles and meta descriptions for every page |
| Several images had no `alt` text; some alt text was just "Logo" | Descriptive alt text on every image |
| Empty links (`href=""`) on four buttons | Each button now goes to a real page |
| Menu icons were `<i onclick>` and could not be used with a keyboard | Real `<button>` elements with `aria-expanded`; Esc closes the menu |
| Map showed "Rosebank College" instead of the three Clean City areas | Replaced by the Leaflet map with three markers; Google map now points at Braamfontein |
| "Upcoming events" listed dates that had already passed | New dates, and past events are hidden automatically |
| Testimonials used the name of a real public figure | Replaced with fictional names |
| Missing closing `</div>` in the testimonials row | Fixed |
| Images up to 6 MB and a 30 MB autoplaying video | Compressed to web sizes (section 7) |
| Grey text (#777) on white was below the 4.5:1 contrast minimum | Darkened to #555 |
| Footer social icons were not links; footer text read "Founded in © 2023" | Icons are labelled links; footer text corrected |
| README contained template instructions, a broken image and copied web-page labels | README rewritten |
| Event cards mixed blue posters with plain photos, so the events list looked inconsistent (found 2 Nov 2026) | The three photo cards were replaced with matching blue posters, and all six posters are now PNG images listed in `js/data.js` |
| Event poster text depended on the visitor's installed fonts when the posters were SVG files | Posters exported as PNG images, so the text looks the same on every device |

## 5. Changelog
Dates come from the commit history in this repository (`git log`).

### Part 1 and Part 2

| Date | Change | Reason |
|---|---|---|
| 17 Aug 2026 | Repository created and project planned (Part 1) | Start of the project |
| 18 Sep 2026 | README revised with a project overview; Part 2 site submitted | Documentation |

### Part 3

| Date | Change | Reason |
|---|---|---|
| 1 Nov 2026 | Compressed and renamed all images; compressed hero video | Page speed and SEO-friendly file names |
| 1 Nov 2026 | Added self-hosted jQuery, Leaflet and Font Awesome in `vendor/` | Speed, offline use and a strict Content-Security-Policy |
| 1 Nov 2026 | Moved the stylesheet to `css/` and added Part 3 styles | Folder structure; accessibility and contrast fixes |
| 1 Nov 2026 | Added `js/main.js` (menu, hero video control, reveal animation, counters, lightbox) | Interactivity |
| 1 Nov 2026 | Added `js/ui.js` (accordion, tabs, modal with jQuery) | Interactive elements |
| 1 Nov 2026 | Added `js/data.js` and `js/listings.js` (dynamic lists with search, filter, sort) | Dynamic content |
| 1 Nov 2026 | Added `js/map.js` (Leaflet map) | Interactive map |
| 1 Nov 2026 | Added `js/forms.js`, `js/config.js` (validation, AJAX enquiry, email builder) | Working forms |
| 1 Nov 2026 | Rebuilt all pages with semantic HTML; added `contact.html`, `enquiry.html`, `404.html` | Structure, accessibility, SEO |
| 1 Nov 2026 | Added `robots.txt`, `sitemap.xml`, favicons, structured data | SEO |
| 1 Nov 2026 | Added `_headers` and a Content-Security-Policy | Security |
| 1 Nov 2026 | Updated event poster dates to upcoming dates | Content accuracy |
| 1 Nov 2026 | Rewrote this README | Documentation |
| 2 Nov 2026 | Added meta keywords to every page and shortened long titles | SEO |
| 2 Nov 2026 | Replaced the three photo event cards with blue PNG posters and set all six poster paths in `js/data.js` | Consistent events list |
| 2 Nov 2026 | Documented that the map needs a web address (Live Server or GitHub Pages) | Documentation accuracy |

In Part 2 the five-page site was built with a video banner, event posters and a Google Maps embed, and the Contact page was replaced by Get Involved and Enquiries. In Part 3 a dedicated Contact page was added back because the brief requires it.

## 6. SEO Strategy

### Keyword targets
Chosen from what the site offers and where it works. They should be validated with a tool such as Google Keyword Planner or Google Trends before launch.

| Keyword | Page it targets |
|---|---|
| recycling Johannesburg | Home |
| community clean-up Johannesburg | Get Involved |
| recycling drop-off Newtown | Services |
| household recycling pick-up Johannesburg | Services, Enquiries |
| volunteer Braamfontein / Hillbrow clean-up | Get Involved |
| recycling workshop for schools Johannesburg | Services |
| report illegal dumping Johannesburg | Contact |

### On-page
- Unique `<title>` (under 60 characters) and meta description (about 150 characters) per page.
- One `<h1>` per page with the main topic; logical `<h2>` and `<h3>` headings below it.
- Descriptive image file names (for example `recycling-glass-bottles.jpg`) and meaningful alt text.
- Internal links between related pages (for example programme cards link to the service list, tabs and events).
- Canonical link, Open Graph and Twitter card tags on every page.
- JSON-LD structured data: `Organization` on the home page and `FAQPage` on the enquiry page.
- Short, readable page addresses (`services.html`, `get-involved.html`).

### Technical
- `sitemap.xml` lists the six public pages; `robots.txt` points to it and blocks `vendor/`.
- Custom `404.html`, marked `noindex`.
- Mobile-friendly responsive layout and fast loading (section 7).
- If the site is hosted somewhere other than the GitHub Pages address above, search and replace that address in all `.html` files, `sitemap.xml` and `robots.txt`.

### Off-page and local SEO (plan)
- Create a Google Business Profile and keep the name, address and phone number identical to the footer and Contact page.
- Add real social-media profile links in the footer (the icons currently link to each network's home page).
- Ask partner schools and businesses to link to the Services and Events pages, and share each new event on social media with its page link.

## 7. Performance

| Item | Before | After |
|---|---|---|
| Images folder (photos) | about 30.3 MB (single files up to 5.8 MB) | about 3.2 MB (largest 530 KB) |
| Hero video | 29.7 MB, 4K, 15 s | 0.66 MB, 720p, 12 s loop |
| Whole `images/` folder | about 58 MB | about 3.9 MB |
| Third-party requests | Font Awesome (CDN) plus Google Fonts loading two families with every weight and italic | Font Awesome self-hosted; Google Fonts limited to 4 weights |

Other techniques: `loading="lazy"` and `decoding="async"` on below-the-fold images, `width` and `height` on images (no layout shift), `defer` on every script, `preload` for the home hero image, `preconnect` for fonts, and the hero video pauses automatically for visitors who prefer reduced motion or have Data Saver on. `_headers` adds long cache times on Netlify.

## 8. Security
- **Content-Security-Policy** (meta tag, and `_headers` for Netlify): scripts only from this site, no inline scripts, frames only from Google Maps, tiles only from OpenStreetMap.
- No inline `onclick` handlers or inline scripts anywhere.
- Libraries are self-hosted (no unknown third-party scripts).
- User text is only written to the page with `textContent`, never `innerHTML`; names are checked against a letters-only pattern.
- Single-line fields have line breaks removed, and email parts are URL-encoded, so a visitor cannot inject extra email headers.
- Hidden honeypot field to catch simple bots; length limits on every field.
- External links use `rel="noopener noreferrer"`.
- Referrer policy set to `strict-origin-when-cross-origin`.
- GitHub Pages and Netlify both serve the site over HTTPS.

## 9. Accessibility
Skip link; semantic landmarks; keyboard-operable menu, accordion, tabs, modal and lightbox (arrow keys, Home/End, Esc, focus trapping and focus return); visible focus outlines; labelled form fields with `aria-invalid` and live error messages; pause control for the background video; `prefers-reduced-motion` respected; contrast improved.

## 10. How to Run, Test and Deploy

### Run locally
1. Download or clone the repository.
2. Double-click `index.html` to view most of the site. The Leaflet map tiles and the Google directions need an internet connection, and OpenStreetMap only serves tiles to pages with a web address, so the map stays empty when the page is opened straight from the disk. Use step 3 or the live site to test the map.
3. For the most accurate test, serve the folder instead (for example with the VS Code **Live Server** extension, or `python -m http.server 8000` and open http://localhost:8000).

### Test checklist
- **Navigation:** every menu link works; on a narrow window the menu button opens and closes the menu.
- **Services:** type "school", change the category, area and sort, then press Clear filters.
- **Tabs:** open `services.html#guide-glass` and use the arrow keys on the tabs.
- **Events:** filter by area, sort, then press View details and close with Esc.
- **Map:** click each marker and each location button.
- **Gallery:** open a photo on the About page, use the arrows and Esc.
- **Enquiry form:** submit it empty (errors appear), then choose "Household pick-up quote", Newtown, 7 bags and a future date. The response should show R150 and the next Wednesday.
- **Contact form:** fill it in and press Prepare my email. Check the To, Subject and Body, then use Open in my email app or Copy.

### Settings you can change (`js/config.js`)
- `recipientEmail`: where the contact email is addressed.
- `formEndpoint`: leave empty for demo mode (nothing is sent). To receive real submissions, create a free form at formspree.io and paste its endpoint here.

Prices, event dates and places are sample data in `js/data.js`.

### Deploy to GitHub Pages
1. Push the folder to the repository.
2. On GitHub open **Settings, then Pages**.
3. Under **Build and deployment** choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. After a minute the site is live at the address at the top of this file.

Netlify alternative: drag the folder onto app.netlify.com/drop. The `_headers` file is then applied automatically.

## 11. Technologies
HTML5, CSS3 (Flexbox, Grid, media queries, animations), plain JavaScript, jQuery 3.7.1, Leaflet 1.9.4, OpenStreetMap tiles, Google Maps embed, Font Awesome 7.2.0, Google Fonts (Roboto), Git and GitHub. Photographs were sourced from Pexels, and the event posters are original SVG designs exported as PNG images.

## 12. Project Structure
```
.
├── index.html  about.html  services.html  get-involved.html
├── enquiry.html  contact.html  404.html
├── robots.txt  sitemap.xml  _headers  README.md
├── css/
│   └── style.css
├── js/
│   ├── head.js  config.js  data.js
│   ├── main.js  ui.js  listings.js  map.js  forms.js
├── images/            (optimised photos, logos, event posters, hero video, favicons)
└── vendor/
    ├── jquery/  leaflet/  fontawesome/
```

## 13. Use of AI Tools
Claude (Anthropic) was used to help review the Part 2 site, write and test the Part 3 JavaScript, restructure the HTML, design the event posters, and draft this README. The author reviewed and tested the result and is responsible for the submitted work.

## 13a. Image Sources and Learning Resources
- **Photographs:** the photographs on the site (for example the skyline, recycling and volunteer images in `images/`) were downloaded from Pexels, which provides free stock photos under the Pexels licence. They were renamed and compressed for the web (section 7). Add the photographer's name for each image here before submitting: `[IMAGE FILE NAME] – [PHOTOGRAPHER] – [PEXELS PAGE LINK]`.
- **Event posters, logo and icons:** created for this project. The six posters share one design (dark blue background, teal accents, skyline silhouette) so that every event card looks the same.
- **Learning resources:** I used the Bro Code YouTube channel to learn and revise HTML, CSS and JavaScript techniques for this project. The videos are listed in the references.

## 13b. Limitations and Future Work
- The enquiry form runs in demo mode until a Formspree endpoint is added to `js/config.js`, so no enquiry is actually delivered yet.
- Prices, events and places are sample data in `js/data.js`. A real version would load them from a database or a content management system.
- The social media icons link to each network's home page until the organisation has real profiles.
- The map tiles depend on OpenStreetMap, so the map is empty when offline or when the page is opened straight from disk.
- Keyword choices were not yet checked with a keyword research tool.
- Testing was done by hand in the browser (section 10). Automated accessibility checks, such as Lighthouse, would be a useful next step.

## 14. Screenshots (Part 2 version)
<img width="1920" height="1200" alt="Home page" src="https://github.com/user-attachments/assets/f364a682-fd10-4547-9dea-53e95a379e32" />

<img width="1920" height="1200" alt="Home page, about and footer" src="https://github.com/user-attachments/assets/23d89a5f-2539-4550-9fb7-d9ec961b9994" />

## 15. References (IIE Harvard style)
Agafonkin, V. (2023) *Leaflet: an open-source JavaScript library for interactive maps*, version 1.9.4. Available at: https://leafletjs.com/ (Accessed: 1 November 2026).

Font Awesome (2026) *Font Awesome documentation: Use Font Awesome on the web*. Available at: https://docs.fontawesome.com/web/ (Accessed: 1 November 2026).

Formspree (n.d.) *Formspree: form backend*. Available at: https://formspree.io/ (Accessed: 1 November 2026).

GitHub (n.d.) *About GitHub Pages*. Available at: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages (Accessed: 1 November 2026).

Google (n.d.) *Get started with the Google Fonts API*. Google for Developers. Available at: https://developers.google.com/fonts/docs/getting_started (Accessed: 1 November 2026).

Google (n.d.) *The Maps Embed API overview*. Google for Developers. Available at: https://developers.google.com/maps/documentation/embed/get-started (Accessed: 1 November 2026).

Google Search Central (n.d.) *SEO starter guide*. Available at: https://developers.google.com/search/docs/fundamentals/seo-starter-guide (Accessed: 1 November 2026).

Mozilla Developer Network (2026) *Content Security Policy (CSP)*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP (Accessed: 1 November 2026).

Mozilla Developer Network (2026) *CSS media queries*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries (Accessed: 1 November 2026).

Mozilla Developer Network (2026) *Intersection Observer API*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API (Accessed: 1 November 2026).

Mozilla Developer Network (2026) *prefers-reduced-motion*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion (Accessed: 1 November 2026).

OpenJS Foundation (2023) *jQuery 3.7.1*. Available at: https://jquery.com/ (Accessed: 1 November 2026).

OpenStreetMap contributors (n.d.) *Copyright and licence*. Available at: https://www.openstreetmap.org/copyright (Accessed: 1 November 2026).

OWASP (n.d.)* Cross-Site Scripting Prevention Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html (Accessed: 1 November 2026).

Bro Code (n.d.) *[VIDEO TITLE]* [YouTube video]. Available at: [VIDEO LINK] (Accessed: [DATE]).

Pexels (n.d.) *Pexels: free stock photos and videos*. Available at: https://www.pexels.com/ (Accessed: 2 November 2026).

Pexels (n.d.) *Pexels licence*. Available at: https://www.pexels.com/license/ (Accessed: 2 November 2026).

Schema.org (n.d.) *Organization* and *FAQPage*. Available at: https://schema.org/ (Accessed: 1 November 2026).

Sitemaps.org (n.d.) *Sitemaps XML format*. Available at: https://www.sitemaps.org/protocol.html (Accessed: 1 November 2026).

W3C (n.d.) *WAI-ARIA Authoring Practices Guide: accordion, tabs and dialog (modal) patterns*. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/ (Accessed: 1 November 2026).
