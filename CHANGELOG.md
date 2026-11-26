# UNNATE website — change log

Newest first. Nothing here is deployed: production (`main`, commit 2d71aec) is unchanged.
Rollback points: `main` (live), `strategy/direct-client-website-saas` (v2, flat design),
`design/visual-upgrade` (v3), `design/refinement-v4` (v4), backup
`unnate-site-backup-2026-11-20-2d71aec.tar.gz`.

## v5 — final 30% polish (branch `design/polish-v5`, 26 Nov 2026)

From the owner brief "Final 30% design refinement". A council review (eight AI-written lenses)
and a screenshot audit at 1440, 768 and 390 px came first; the report lists every finding.

### Home hero showcase (rebuilt)
- The demo website and its job list now sit side by side, with no overlap. Below 1080 px they
  stack: website, then job list.
- The dotted route runs only in the gap between the two windows. `unnate.js` draws it from the
  windows' real positions (ResizeObserver), so it cannot cross content when fonts, images or
  widths change.
- A short loop tells the story: a tap on "Get a fixed quote", a request travels the route,
  lands in the list as New, then is scheduled to a named technician. It pauses off screen and in
  background tabs. With reduced motion, nothing moves.
- Job list rebuilt for reading: 14 px row titles, nothing under 11 px, no cut-off text from
  320 px up. Its jobs match the job tracker demo (#1041, #1042 and the counts).
- "Live demo" became "Demo data". Each window has a label and a quiet link into its demo.
- Removed the 3D scroll tilt and the website crop that showed the next section's white strip.

### Phone mockups (all eight)
- New frame: iPhone 15 proportions (393 × 852), a 2 to 3 px bezel and a thin titanium edge,
  in place of a 6 px near-black frame with a drawn notch over the site's header.
- Screens recaptured at a real phone viewport, 2x, with a status bar, Dynamic Island and home
  indicator drawn into the image. The job tracker phone now shows jobs instead of filters.
- One composition everywhere: the desktop takes 85%, the phone stands in front at the lower
  right, below the desktop's header, and covers under 12% of the desktop's width.
- Desktop shots used beside phones end at the bottom of each demo's hero.
- New `tools/capture/devices.mjs` and `to_webp.py` regenerate every device screenshot.

### Other fixes from the audit
- Operations demo: it no longer opens scrolled past its "Demo with fictional data" notice
  (the script wrote `#dashboard` before load and the browser jumped to it). Deep links such
  as `#portal` still open their tab, with the notice in view.
- Demos page: flipped cards now give their screenshot the wide column.
- Home: the written-scope card uses the full width once that block stacks (tablet).
- Websites: smaller annotation pins on phones. Home service lists: bullet dots sit on the
  first line of wrapped items.

### Checks
- QA suite grows from 461 to 536 checks. New "Visual layout" group: hero overlap, route
  position, cut-off and small text at seven widths, the loop, its pause, reduced motion,
  phone proportions and placement, demo card balance, and the operations demo notice.

## v4 — customer-first, minimal and motion-led (branch `design/refinement-v4`, 26 Nov 2026)

Built from two owner briefs: "Final visual refinement" and "Customer-first website design and conversion".

### Brand and visual system
- New stylesheet (design system v4, "Quiet network"). Restrained palette: ink text on cool paper,
  royal blue for brand and links, tang orange only for the main action, status colours only inside
  software screens. Warm and cool tints mark the two services.
- Kept from the previous unnate.com, sparingly: inline capsules in the headline, the folder tab,
  the condensed statement type, Mona Sans wide display cut, and the big footer wordmark.
- Removed everywhere: the mascot (including the 404 page), the eyes, hand-written notes, sticky
  notes, tape, stamps, rotated stickers, floating chips and tilted prints. The hand font is no
  longer loaded. Mascot and eye files stay in the repository for rollback only; no page uses them.
- One motion language: fine dotted routes, nodes and moving points.
  - A page-wide network on a canvas behind the page. It draws itself in on first load, drifts
    slower than the page while scrolling, and its moving points speed up slightly with scroll.
    It fades behind the reading column, is lighter and capped at 30 fps on phones, pauses in
    background tabs, and is a still image for reduced-motion users.
  - Dotted route strips with a travelling point for the request workflow and the four steps.
  - Dotted routes in the closing call-to-action panels (hidden on phones).
  - Hero visual tilts back slightly and straightens as you scroll to it.
- Icons sprite rebuilt (duplicates removed) and nine icons added.
- New social images (1200×630) for all six pages, rendered from real demo screenshots.

### Home page
- Centred hero: eyebrow naming both services, headline "Websites that win customers. Software
  that runs the work.", one supporting paragraph, primary "Start a project" (to the enquiry page)
  and a secondary "View pricing" text link.
- The floating Websites and Software labels are gone. One visual remains: a demo website and the
  job list its quote form feeds, joined by a dotted route that carries a request into the list.
- Sections now each answer one customer question: what we do (two service panels), sound familiar
  (problems and what changes), see the work (four demos), how we work (four steps), why trust us
  (written scope example and six promises, with an honest "we are new" note), what it costs
  (price strip), questions, and start a project.

### Pages
- Websites: kinds of website we build (business, landing pages, enquiry, booking, portfolio, small
  shops quoted separately), annotated demo, packages with one featured, what changes the price,
  what is quoted separately, a five-step project route, what we need from you, questions.
- Software: problems it solves, what we build (each linked to a live demo where one exists),
  Workflow Tracker annotated, Operations App spotlight, three sizes with what moves the price,
  custom versus off the shelf, a five-step project route, ownership and security, questions.
- Pricing: centred summary, website table, "which package fits" guide, add-ons, software table,
  six price factors, payment terms.
- Demos (was "Work"): two software demos, two website demos, and this site's test report.
- How we work: seven-step route that fills as you read, plain answers to scope, review, revisions,
  delivery, ownership, support and later changes, plus ownership and working hours.
- About: statement head, the two people, why we work this way, four honest facts. No mascot.
- Start: next steps shown as a route, a shorter form intro, service choices named
  "Website Development" and "Custom Business Software", and a clear "what happens next" after sending.
- 404, privacy and terms restyled. Legal drafts unchanged and still marked for legal review.

### New demo: Operations App (`/demos/operations-app/`)
- Fictional property maintenance company, labelled as a demo on every view.
- Dashboard (counts, requests per week, open requests by type, today's visits, needs attention),
  request list with filters and search, week booking calendar that refuses double bookings,
  and a customer portal whose requests land in the team's list. Data stays in the browser;
  a reset button restores it.

### Business content changes to confirm
- "Small online shops" now appear as a website type, quoted after a call and outside the fixed
  packages (the owner's brief lists e-commerce "where suitable"). Previously listed as not offered.
- Navigation label "Work" renamed "Demos"; the address `/work/` is unchanged.

### Testing
- QA suite extended to the new demo (portal, requests, double-booking refusal, persistence, reset,
  accessibility in every view) and made robust for lazy images. Results: see `/qa/`.

## v3 — visual upgrade (branch `design/visual-upgrade`, commit 25c4b5c)
- Capsule and folder design system with the previous site's colours, mascot and hand-written notes.
  Superseded by v4 at the owner's request ("minimal, premium, not flat").

## v2 — direct-client rebuild (branch `strategy/direct-client-website-saas`, commit b623714)
- Two services only, published prices, working demos, test report page, strict security headers.
