---
name: UNNATE
theme: "The Pinboard"
colors:
  ink: "#0E1A3C"          # deep navy: text, borders, hard shadows, dark sections
  ink-2: "#414C6E"        # secondary text on light grounds
  paper: "#F7F4EE"        # page ground
  card: "#FFFEFB"         # raised surfaces: board, letter, form, figure plates
  orange: "#FF5A1F"       # the one accent: primary buttons, the highlighted word, active states
  orange-type: "#EC480C"  # orange for large display type on light grounds
  orange-deep: "#B83A07"  # orange for small text on light grounds (passes AA)
  sky: "#D3E1FF"          # pale blue ground (philosophy), service tab
  cornflower: "#A8C2FF"   # stronger blue ground (contact), the disc behind the thinking panes
  mint: "#E3EBFF"         # palest blue ground (thinking section)
  butter: "#FFD8C2"       # the warm tint, a pale orange: hero sun, tape, second sheet of the letter
typography:
  display: { family: "Fraunces", fallback: "Iowan Old Style, Palatino Linotype, Georgia, serif", weight: 560, tracking: "-0.022em", leading: 1.04, axes: "SOFT 100" }
  display-italic: { family: "Fraunces Italic", weight: 480, use: "emphasis inside headlines, service pitches, numerals" }
  text: { family: "Epilogue", fallback: "system-ui, sans-serif", size: "1.0625rem", leading: 1.65 }
  label: { family: "Epilogue", weight: 700, size: "0.78rem", tracking: "0.14em", transform: uppercase }
  scale: { hero: "clamp(2.45rem, 4.9vw, 4.75rem)", xl: "clamp(2.6rem, 6.4vw, 5.6rem)", lg: "clamp(2.2rem, 4.6vw, 4rem)", md: "clamp(1.75rem, 3vw, 2.6rem)" }
spacing:
  gutter: "clamp(1.25rem, 4vw, 3.5rem)"
  max-width: "82rem"
  section: "clamp(4.5rem, 9vw, 8rem)"
radii: { print: "0.35rem", small: "0.5rem", card: "1rem", panel: "1.75rem", pill: "99px" }
borders: { weight: "2px", color: ink }
shadows:
  hard: "4px 4px 0 ink (buttons), 6-8px 8px 0 ink (cards, board, dialogs)"
  soft: "0 12px 32px -12px rgba(26,22,19,.28) (prints and notes only)"
motion:
  ease: "cubic-bezier(.2,.7,.2,1)"
  spring: "cubic-bezier(.34,1.4,.5,1), only for things that were lifted or flicked"
  reveal: "opacity + 1.5rem rise, once, on entering the viewport"
breakpoints: { phone-nav: "48em", two-column: "60em", services-3-col: "62em", hero-split: "64em" }
---

# UNNATE design system

## The idea
A studio wall. Work is printed, framed and taped up. Thoughts are pinned as notes and stickers.
Checkerboard tape marks where one section ends and the next begins. The hero carries one
line drawing (a Hairline figure) that says what the headline says: what people see is only the top layer.

## Colour
- Three hues only: navy, blue and orange. Every other colour is a tint of one of them.
- One accent, orange, used the same way everywhere: primary buttons, the highlighted phrase, active states, the bright edge in the hero drawing.
- Sections change ground for rhythm: paper (hero, services), sky (philosophy), navy (work, footer), palest blue (thinking), cornflower (contact). Orange is never a ground, so it always reads as the thing to press.
- Small orange text on light grounds uses `orange-deep`. Body text is always ink on a light ground or paper on ink.

## Type
- Headlines in Fraunces with the soft axis on, tight tracking, balanced wrapping. One word or phrase per headline may be italic or marked with the highlighter.
- Body in Epilogue at 17px with a 1.65 line height, never wider than about 36em.
- Numerals (01, 02, 03) are Fraunces italic, large, in orange.
- Section labels are small uppercase pills with an orange dot.

## Shape and depth
- Interactive things are pills with a 2px ink border and a hard offset shadow. Hover lifts by 1px, press sinks by 3px.
- Cards and the services board have a 2px ink border, a 1rem to 1.75rem radius and a hard ink shadow.
- Prints (portfolio images) are the exception: a thin white frame, a soft shadow, a strip of tape and a tilt of one or two degrees that straightens on hover.
- Glass (blur) is used only where a surface floats over content: the navigation bar and the dialog backdrop.

## Components
- **Navigation**: one floating glass pill, logo left, three links and the Contact button right. Below 48em the links move into a menu.
- **Hero stage**: a line drawing of four pillars climbing (discover, strategy, execute, evolve) with a butter sun rising behind the tall end. A pane of glass names the stage in hand; four buttons beneath pick one by hover, focus or tap. No portfolio images appear in the hero.
- **Philosophy**: type only. The headline runs the full width; one phrase is marked in orange, one hangs in a small frame from a pin. A dashed thread carries on from the hero. The closing verdict is two full-width lines, one hollow, one solid.
- **Ticker**: one moving band of the three service names, with a pause button. The only marquee on the site.
- **Services board**: one bordered panel divided into three columns (Web, Content & Social, Paid Campaigns), each with a coloured tab, a pitch line, a short description, five deliverables and a link. Stacks to one column below 62em.
- **Work rail**: prints in a horizontal row at one shared height, with number, title, tags and one line of description. Swipe, drag, arrow keys or the two round buttons.
- **Hero headline**: two sentences at two sizes across the full width. The first is plain and ends on a hollow word; the second is large and ends on the one word in orange italic.
- **Thinking section**: words on the left (sticky on desktop) with the mascot listening; three glass panes over one blue disc on the right. Things arrive once and then hold still; the pane being read gets an orange numeral.
- **Contact letter**: a sheet of studio letterhead (checker edge, logo, margin rule) on cornflower, a second sheet behind it, a round stamp pressed on, the mascot standing at the corner looking toward the pointer, and one large button.
- **Enquiry sheet**: a bordered dialog with labelled fields, pill checkboxes for the services, inline errors.

## Motion
- Content rises into place once as it enters the viewport.
- The hero drawing plays a short tour while it is on screen and gives way to the pointer at once. It has a pause button.
- Grouped things arrive in sequence (service columns, work prints). Where the browser supports scroll-linked animation natively, the checker tape and colour washes drift as they pass.
- With reduced motion on, the ticker, sticker, tour and drifts stop, the scene changes without easing, and everything is shown in its final state.

## Rules
- Do not add a second accent colour or a second display typeface.
- Do not put portfolio work in the hero.
- Do not add a fourth service category.
- Keep the approved copy. Change layout before changing words.
