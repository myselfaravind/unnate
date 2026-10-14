/* =====================================================================
   UNNATE · PORTFOLIO DATA
   The single source of truth for every project shown on the site: the homepage rail,
   the /work/ page, and the short rails on /clinical-websites/ and /final-year-projects/.
   Static hosting cannot list folders, so each piece is named here once, with the real
   file paths of its optimised media. ASSETS.md lists every original and what is pending.

   id        used in links (/work/#id)
   title     shown on the site
   group     'Websites' | 'Content & Creative' | 'Campaigns' — a group with no projects is not shown
   category  the label on the card
   type      'web' | 'creative' | 'video'
   kind      'Client Work' | 'Self-Initiated' | 'Concept' | 'Demo'. Only set it when it is true;
             a piece without a kind shows no badge. The studio has confirmed every film and creative
             here is client work; the three websites are labelled from their own files.
   desc      one honest line about the piece
   alt       description of the card image for screen readers
   featured  true → on the homepage rail, in this order
   tags      audiences a landing page can pick from: 'healthcare'
   thumb     the 4:5 card image
   full      the large image in the viewer (creatives and websites)
   poster    videos: a still from the film, shown before it plays
   video     videos: the web-encoded film (H.264, about 2–3 MB)
   preview   videos: a 5-second muted loop for hover previews (about 150 KB)
   demoUrl   websites: where the working build is hosted on this site
   case      websites: notes and screenshots, every line checked against the project's own files
   src       the original file in portfolio/ (kept on the studio's machine, not deployed); posterAt: the film's still, in seconds

   After adding or changing an original in portfolio/, run:  node tools/build-media.mjs
   Only add work that is real and approved. Approved creatives: Dental care, Fresh Skin and Modern Dental
   Studio Portrait (pending its file: see ASSETS.md).
   ===================================================================== */
window.UNNATE_PORTFOLIO = [
  { id: 'maren-dental-studio', group: 'Websites', title: 'Maren Dental Studio', category: 'Website', type: 'web', kind: 'Demo', featured: true, tags: ['healthcare'],
    desc: 'A calm, appointment-led website for a modern dental clinic, built as a demo with placeholder content.',
    alt: 'Maren Dental Studio website on a phone: a dark green opening screen reading “Modern dentistry, at a human pace.”',
    thumb: '/assets/work/sites/maren-card.webp', full: '/assets/work/maren-dental-studio-full.webp',
    demoUrl: '/demos/maren-dental-studio/',
    case: {
      page: 'Services, the studio, its dentists, a four-step visit process, patient stories, common questions and a booking form.',
      decisions: [
        'Booking stays one step away: “Book an Appointment” sits in the navigation and in the opening section.',
        'The visit is explained as four clear steps, so patients know what comes next before they book.',
        'One typeface, Instrument Sans, using its width range for headings and text.',
        'A quiet teal and paper palette, so the clinic feels calm rather than clinical.'
      ],
      type: 'Instrument Sans', palette: ['#0E6B66', '#0F2826', '#CFE5E1', '#F5F7F6'],
      details: [
        'The booking form asks for a treatment, a preferred date and a time, and confirms the request on the page.',
        'Answers to common questions open in place.',
        'Motion is reduced for visitors who ask their device for less motion.'
      ],
      shots: [
        ['/assets/work/sites/maren-0.webp', 'Maren Dental Studio, opening section'],
        ['/assets/work/sites/maren-1.webp', 'Maren Dental Studio, the four-step visit'],
        ['/assets/work/sites/maren-2.webp', 'Maren Dental Studio, booking form']
      ],
      phone: '/assets/work/sites/maren-m.webp'
    } },
  { id: 'solara-drinks', src: "portfolio/videos/SOLARA Drink's.mp4", posterAt: 6, group: 'Content & Creative', title: 'SOLARA Drinks', category: 'Short-form video', type: 'video', kind: 'Client Work', featured: true,
    desc: 'A product spot for a fruit drink, led by its illustrated label.',
    alt: 'A frame from the SOLARA Drinks film: a bottle wrapped in an illustrated fruit label.',
    thumb: '/assets/work/solara-drinks.webp', poster: '/assets/work/solara-drinks-poster.webp',
    video: '/assets/work/video/solara-drinks.mp4', preview: '/assets/work/video/solara-drinks-preview.mp4' },
  { id: 'oddcart', group: 'Websites', title: 'Oddcart', category: 'Website', type: 'web', kind: 'Concept', featured: true,
    desc: 'An archive of small, strange games, with a playable handheld console on the page.',
    alt: 'Oddcart website on a phone: a handheld console and the headline “Tiny screens. Enormous places.”',
    thumb: '/assets/work/sites/oddcart-card.webp', full: '/assets/work/oddcart-full.webp',
    demoUrl: '/demos/oddcart/',
    case: {
      page: 'A handheld console you can play, a shelf of six game carts, a featured game and a short story about the archive.',
      decisions: [
        'The console is the opening: the page starts on a working handheld rather than a picture of one.',
        'Bricolage Grotesque for headlines, Instrument Sans for text, and Pixelify Sans for everything on the game screen.',
        'A warm grey shell and paper, with a toy orange and an electric blue as the only accents.'
      ],
      type: 'Bricolage Grotesque, Instrument Sans, Pixelify Sans', palette: ['#20211D', '#E3E0D2', '#E4581F', '#2B4BFF'],
      details: [
        'Keyboard controls: arrow keys move, Z is A, X is B, Enter is Start, Shift is Select.',
        'Select swaps to the next cart, and each cart has a pixel-art preview drawn on the page.',
        'Motion is reduced for visitors who ask their device for less motion.'
      ],
      shots: [
        ['/assets/work/sites/oddcart-0.webp', 'Oddcart, the working console'],
        ['/assets/work/sites/oddcart-1.webp', 'Oddcart, the shelf of carts'],
        ['/assets/work/sites/oddcart-2.webp', 'Oddcart, featured game']
      ],
      phone: '/assets/work/sites/oddcart-m.webp'
    } },
  { id: 'crave-burgers-ad', src: "portfolio/videos/Crave Burger's AD.mp4", posterAt: 17, group: 'Campaigns', title: 'Crave Burgers ad', category: 'Short-form video', type: 'video', kind: 'Client Work', featured: true,
    desc: 'A short-form ad built on the first-bite reaction.',
    alt: 'A frame from the Crave Burgers ad: a man, eyes wide, about to take the first bite of a burger.',
    thumb: '/assets/work/crave-burgers-ad.webp', poster: '/assets/work/crave-burgers-ad-poster.webp',
    video: '/assets/work/video/crave-burgers-ad.mp4', preview: '/assets/work/video/crave-burgers-ad-preview.mp4' },
  { id: 'tickpic-moments', group: 'Websites', title: 'Tick Pic Moments', category: 'Website', type: 'web', kind: 'Demo', featured: true,
    desc: 'An editorial portfolio website for a wedding and portrait photography studio, built as a demo with placeholder contact details.',
    alt: 'Tick Pic Moments website on a phone: a full-bleed photograph with an editorial serif headline.',
    thumb: '/assets/work/sites/tickpic-card.webp', full: '/assets/work/tickpic-moments-full.webp',
    demoUrl: '/demos/tickpic-moments/',
    case: {
      page: 'A full-bleed opening frame, a note on time, six selected frames, the studio’s philosophy, five kinds of work and an enquiry form.',
      decisions: [
        'Newsreader, an editorial serif, for headlines, with Hanken Grotesk for text.',
        'A darkroom palette: black, warm paper and a safelight red.',
        'Frames are captioned like a contact sheet, with frame number, place and year, aperture and shutter speed.',
        'Photographs sit inside the philosophy headline, between the words.'
      ],
      type: 'Newsreader, Hanken Grotesk', palette: ['#000000', '#1C1B19', '#E9E4DA', '#B8321F'],
      details: [
        'Any of the six frames opens full size in a lightbox that works with the keyboard.',
        'Each kind of work opens in place to show what it covers.',
        'The enquiry form asks for the type of shoot and a date.'
      ],
      shots: [
        ['/assets/work/sites/tickpic-0.webp', 'Tick Pic Moments, opening frame'],
        ['/assets/work/sites/tickpic-1.webp', 'Tick Pic Moments, philosophy'],
        ['/assets/work/sites/tickpic-2.webp', 'Tick Pic Moments, kinds of work']
      ],
      phone: '/assets/work/sites/tickpic-m.webp'
    } },
  { id: 'pearl-medspa', src: 'portfolio/videos/Pearl MedSpa.mp4', posterAt: 17, group: 'Content & Creative', title: 'Pearl MedSpa', category: 'Short-form video', type: 'video', kind: 'Client Work', featured: true, tags: ['healthcare'],
    desc: 'A quiet consultation-room film for a medical spa.',
    alt: 'A frame from the Pearl MedSpa film: a smiling woman in a bright consultation room.',
    thumb: '/assets/work/pearl-medspa.webp', poster: '/assets/work/pearl-medspa-poster.webp',
    video: '/assets/work/video/pearl-medspa.mp4', preview: '/assets/work/video/pearl-medspa-preview.mp4' },
  { id: 'neuva-diwali', src: 'portfolio/videos/NEUVA Biwali.mp4', posterAt: 17, group: 'Campaigns', title: 'NEUVA Diwali', category: 'Short-form video', type: 'video', kind: 'Client Work', featured: true,
    desc: 'A Diwali corporate-gifting film: one more workday, then a box worth sharing.',
    alt: 'A frame from the NEUVA Diwali film: an open gift box of jars and sweets among Diwali lights.',
    thumb: '/assets/work/neuva-diwali.webp', poster: '/assets/work/neuva-diwali-poster.webp',
    video: '/assets/work/video/neuva-diwali.mp4', preview: '/assets/work/video/neuva-diwali-preview.mp4' },
  { id: 'crave-burgers', src: "portfolio/videos/Crave Burger's.mp4", posterAt: 1, group: 'Content & Creative', title: 'Crave Burgers', category: 'Short-form video', type: 'video', kind: 'Client Work', featured: true,
    desc: 'An office-set short where one burger turns into a round of orders.',
    alt: 'A frame from the Crave Burgers short: a man at an office desk with a burger box.',
    thumb: '/assets/work/crave-burgers.webp', poster: '/assets/work/crave-burgers-poster.webp',
    video: '/assets/work/video/crave-burgers.mp4', preview: '/assets/work/video/crave-burgers-preview.mp4' },
  { id: 'dental-care', src: 'portfolio/creatives/Dental care.png', group: 'Content & Creative', title: 'Dental care', category: 'Social creative', type: 'creative', kind: 'Client Work', featured: true, tags: ['healthcare'],
    desc: 'A patient-facing clinic creative seen from the dentist’s mirror.',
    alt: 'Dental care creative: a masked dentist holding a dental mirror, seen from inside the patient’s mouth, with the line “A closer look at a brighter you.”',
    thumb: '/assets/work/dental-care.webp', full: '/assets/work/dental-care-full.webp', size: [1122, 1402] },

  { id: 'fresh-skin', src: 'portfolio/creatives/Fresh Skin.png', group: 'Content & Creative', title: 'Fresh Skin', category: 'Product creative', type: 'creative', kind: 'Client Work', featured: true, tags: ['healthcare'],
    desc: 'A launch creative for a daily skincare cleanser.',
    alt: 'Fresh Skin creative: a cleanser bottle among leaves with the line “Pure Care Daily.”',
    thumb: '/assets/work/fresh-skin.webp', full: '/assets/work/fresh-skin-full.webp', size: [1024, 1536] },
  { id: 'neuva', src: 'portfolio/videos/NEUVA.mp4', posterAt: 17, group: 'Campaigns', title: 'NEUVA', category: 'Short-form video', type: 'video', kind: 'Client Work',
    desc: 'A second cut of the Diwali gifting film, with a different lead.',
    alt: 'A frame from the second NEUVA cut: gift boxes stacked among warm Diwali lights.',
    thumb: '/assets/work/neuva.webp', poster: '/assets/work/neuva-poster.webp',
    video: '/assets/work/video/neuva.mp4', preview: '/assets/work/video/neuva-preview.mp4' },   // on the Work page only
];
