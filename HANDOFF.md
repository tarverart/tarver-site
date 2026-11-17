# Tarver artist website: build handoff

Build tarverart.com as a small static site that matches the approved prototype exactly. Launch date: Friday, November 20, 2026. Hosted on Cloudflare Pages from a GitHub repo.

**Source of truth, in order:**
1. `prototype/index.html`: the approved Round 32 final draft. Open it in a browser. It is a review page: the bar on top (Phone/Computer, New visit, Walk-in, Reduced motion, Jump to) is review only and must not ship. Everything inside the phone or computer frame is the site.
2. `design-system/bundle.css`, `design-system/bundle.js`, `design-system/tokens.css`: the committed Tarver design system. Use these files as they are. Do not restyle components.
3. `content/pages.json`: the exact page markup for Home, Help, Shipping and returns, Privacy, Terms and Thank you. Use it word for word.

## Pages and URLs

| URL | Page | How it is built |
|---|---|---|
| `/` | The print: Tides at Jacksonville Beach | `pages.json` → `home`, wired by `Tarver.printListing` (close ups, magnifier, Buy) |
| `/about/` | About | `Tarver.about.html(ABOUT)` then `Tarver.about.wire(root)` |
| `/help/` | Help | `pages.json` → `help` |
| `/shipping/` | Shipping and returns | `pages.json` → `ship`, then `Tarver.policy.style(root)` |
| `/privacy/` | Privacy | `pages.json` → `privacy`, then `Tarver.policy.style(root)` |
| `/terms/` | Terms | `pages.json` → `terms`, then `Tarver.policy.style(root)` |
| `/thank-you/` | After Stripe checkout | `pages.json` → `thanks`, then `Tarver.thanks.all(root)` |
| `/joined/` | After a collector confirms in Kit | `Tarver.joined.html({home:'/'})` then `Tarver.joined.wire(root)` |
| `/404.html` | Not found | Short, friendly, link home. Same header and footer. |

Every page: `<div class="tv-web">`, then the header, the page, then the footer. Pre-render the HTML into each page (good for speed and sharing); use the JS only to wire behavior.

**Header:** `Tarver.characters.headerHTML(isPhone, beam, links)` inside `<div class="tv-site--launch">`, links About and Help (mark the current page), then `Tarver.siteHeader.wire(wrapper)`.
**Footer:** copy the prototype's footer exactly. Tagline "Art that makes you smile." Email hello@tarverart.com, Instagram @tarver.art. Legal row: Shipping and returns · Privacy · Terms. Leave the collector list out of the footer on `/thank-you/` and `/joined/`.

## Behavior that must match the prototype

**Header walk-ins** (`Tarver.characters.ENTRANCES`, keys A, B, C, D):
- A visit is a browser tab session (`sessionStorage`).
- On the first page of a visit, play the next walk-in in the rotation: `Tarver.characters.nextEntrance()` (it rotates through `localStorage 'tarver.walkin'`). Play it once. It ends still in under 5 seconds.
- Every later page in that visit shows that walk-in's still ending. To draw a still ending, call `entrance.make(header).play()` while `window.matchMedia` reports reduced motion (see `still()` in the prototype's script).
- The first time the visitor opens About, play walk-in D (the family) live. From then on, every page in the visit shows D's still ending.
- The header markup's `beam` argument must match the entrance (`entrance.beam`).
- Reduced motion: always the still ending.

**Buy:**
- Buy is an `<a>` to the Stripe Payment Link (to be supplied, see below). On tap: `Tarver.printListing.loading(btn, true)` and `Tarver.buyReaction.play(btn, mode)`. `mode` is `"family"` if About was seen this visit, else `"solo"`.
- Carry ad tracking into checkout: when the landing URL has `utm_source`, `utm_medium`, `utm_campaign` or `utm_content`, keep them in `sessionStorage` and append them to the Payment Link URL on Buy.
- Stripe's "After payment" redirect goes to `https://tarverart.com/thank-you/`.

**Close ups and magnifier:** wired automatically by the bundle. With no pill pressed the magnifier opens Pier; with a close up showing it goes back. Main photo always fills its square.

**Collector list (Kit):**
- The Join box in the footer is `Tarver.join`. Send the email to Kit form **10200923**: `POST https://app.kit.com/forms/10200923/subscriptions` with form field `email_address` and header `Accept: application/json`. Show the joined state on success, the error state on failure.
- Kit sends a confirmation email (double opt in). After confirming, Kit redirects to `https://tarverart.com/joined/` (Aaron sets this in Kit once the site is live).

**About photo** is swapped a few times a year. Keep the photo settings in one small, clearly labeled object at the top of the About page script:
`{photo, alt, greeting, stamp, postmark, postDay, postYear, place, date, blurb, email}`. Current values are in the prototype's script (search for `var ABOUT=`). The photo is `images/about-zion.jpg`, 4:3.

**Thank you sky:** sunrise or sunset by the buyer's clock (`Tarver.thanks`).

**Reduced motion** is respected everywhere by the bundle; do not add motion of your own.

## Meta pixel and analytics

- Add the Meta pixel to every page with a placeholder ID `META_PIXEL_ID` in one config spot. Aaron will supply the ID. Fire `PageView` on every page and `Purchase` (value 70, currency USD) on `/thank-you/`.
- Optional: turn on Cloudflare Web Analytics (free, no cookie banner needed).

## Images

In `images/`, all JPG, already sized for the web:
- `hero.jpg` (square, the main photo), `zoom-pier.jpg`, `zoom-beach.jpg`, `zoom-lines.jpg` (square close ups)
- `room-wide.jpg` (wide, first), `room-sunny.jpg`, `room-clay.jpg` (tall), collage `data-shape="wide-tall"`
- `about-zion.jpg` (About photo, 4:3)
Also make: a favicon from the T logo (`faviconSmall` in the design system's logo) and a share image (Open Graph) from `hero.jpg` with title "Tides at Jacksonville Beach" and description "A year of Jacksonville Beach tides, 2027 edition. 18 x 24 in print, printed to order, free US shipping."

## Rules from the design system worth repeating

- No dashes of any kind in visible copy.
- Persimmon (brand) is only for the one primary action on a page.
- Page wrapper is `tv-web`, never `tv-page`.
- Product photos have no border.
- Do not change copy. If something looks wrong, flag it to Aaron.

## Still to come from Aaron (use placeholders until then)

- Stripe Payment Link URL for the print, with Stripe Tax on and the redirect set to /thank-you/
- Meta pixel ID
- Kit "after confirming" redirect set to tarverart.com/joined (after launch)

## Hosting

- GitHub repo `tarver-site`, plain static files (no framework needed). Build step optional.
- Cloudflare Pages connected to the repo: every push to `main` deploys.
- Custom domain `tarverart.com` (already on Cloudflare) and `www` redirecting to it.
- Do not touch the existing DNS records for email (Email Routing MX and SPF, Kit's DKIM CNAMEs, DMARC).

## Done means

- Every page matches the prototype on a phone (390px wide) and a computer (1280px wide).
- Walk-in rules, Buy reaction, magnifier, Join to Kit, policy styling and the Joined page all work.
- Lighthouse: accessibility 95 or higher, performance 90 or higher on mobile.
- Tested in Safari on iPhone and Chrome on a computer.
