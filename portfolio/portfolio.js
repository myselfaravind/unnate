/* =====================================================================
   UNNATE · PORTFOLIO MANIFEST
   The single source of truth for the homepage carousel and the /work/ page.
   Static hosting can't list folders, so each piece is named here once.

   id        used in links (work/#id) and for the generated files in assets/work/
   title     shown on the site
   type      'web' | 'creative' | 'video'
   group     the portfolio category it is filed under: 'Brand Identity' | 'Websites' |
             'Content & Creative' | 'Campaigns'. A category with no projects is not shown.
   category  the label shown on the card
   desc      one honest line about the piece
   kind      'Client Work' | 'Self-Initiated' | 'Concept' | 'Demo' — or leave it out.
             Only set this when it is true. A piece without a kind shows no badge.
   src       the original file (websites: the project's entry HTML file)
   featured  true → appears in the homepage carousel, in this order. Every website and every video
             is featured; of the creatives, only the three strongest are.
   posterAt  videos only: the second used for the still image
   size      creatives only: pixel size of assets/work/<id>-full.webp (prevents layout shift)

   After adding or changing a piece, run:  node tools/build-media.mjs
   ===================================================================== */
window.UNNATE_PORTFOLIO = [
  { id:'maren-dental-studio', group:'Websites', title:'Maren Dental Studio', type:'web', category:'Website', featured:true,
    desc:'A calm, appointment-led website for a modern dental clinic.',
    src:'portfolio/websites/Maren Dental Studio/index.html' },
  { id:'skin-in-progress', group:'Content & Creative', title:'SKIN in Progress', type:'creative', size:[1086,1448], category:'Social creative', featured:true,
    desc:'A typographic poster for a clinical spa’s skin-analysis treatment.',
    src:'portfolio/creatives/SKIN in Progress.png' },
  { id:'solara-drinks', group:'Content & Creative', title:'SOLARA Drinks', type:'video', category:'Short-form video', featured:true, posterAt:6,
    desc:'A product spot for a fruit drink, led by its illustrated label.',
    src:"portfolio/videos/SOLARA Drink's.mp4" },
  { id:'oddcart', group:'Websites', title:'Oddcart', type:'web', category:'Website', featured:true, kind:'Concept',
    desc:'An archive of small, strange games, with a playable handheld console on the page.',
    src:'portfolio/websites/Oddcard/index.html' },
  { id:'dental-clinical-creative', group:'Campaigns', title:'Dental Clinical creative', type:'creative', size:[1122,1402], category:'Advertising creative', featured:true,
    desc:'A marketing creative for dental clinics, built around one slow-moving visual joke.',
    src:'portfolio/creatives/Dental Clinical creative.png' },
  { id:'crave-burgers-ad', group:'Campaigns', title:'Crave Burgers ad', type:'video', category:'Short-form video', featured:true, posterAt:17,
    desc:'A short-form ad built on the first-bite reaction.',
    src:"portfolio/videos/Crave Burger's AD.mp4" },
  { id:'tickpic-moments', group:'Websites', title:'Tick Pic Moments', type:'web', category:'Website', featured:true,
    desc:'An editorial portfolio site for a Chennai wedding and portrait photography studio.',
    src:'portfolio/websites/TickPic Moments/index.html' },
  { id:'unnate-creatives', group:'Content & Creative', title:'UNNATE Creatives', type:'creative', size:[1092,1440], category:'Studio creative', featured:true, kind:'Self-Initiated',
    desc:'A studio piece about what content should make an audience do.',
    src:"portfolio/creatives/Unnate Creative's.png" },
  { id:'neuva-diwali', group:'Campaigns', title:'NEUVA Diwali', type:'video', category:'Short-form video', featured:true, posterAt:17,
    desc:'A Diwali corporate-gifting film: one more workday, then a box worth sharing.',
    src:'portfolio/videos/NEUVA Biwali.mp4' },
  { id:'crave-burgers', group:'Content & Creative', title:'Crave Burgers', type:'video', category:'Short-form video', featured:true, posterAt:1,
    desc:'An office-set short where one burger turns into a round of orders.',
    src:"portfolio/videos/Crave Burger's.mp4" },
  { id:'pearl-medspa', group:'Content & Creative', title:'Pearl MedSpa', type:'video', category:'Short-form video', featured:true, posterAt:17,
    desc:'A quiet consultation-room film for a medical spa.',
    src:'portfolio/videos/Pearl MedSpa.mp4' },
  { id:'neuva', group:'Campaigns', title:'NEUVA', type:'video', category:'Short-form video', featured:true, posterAt:17,
    desc:'A second cut of the Diwali gifting film, with a different lead.',
    src:'portfolio/videos/NEUVA.mp4' },

  // On the Work page only. Still part of the portfolio, just not on the homepage rail.
  { id:'beauty-spa', group:'Content & Creative', title:'Beauty SPA', type:'creative', size:[1024,1536], category:'Social creative',
    desc:'A facial-treatment poster for a clinical beauty spa.',
    src:'portfolio/creatives/Beauty SPA.png' },
  { id:'fresh-skin', group:'Content & Creative', title:'Fresh Skin', type:'creative', size:[1024,1536], category:'Product creative',
    desc:'A launch creative for a daily skincare cleanser.',
    src:'portfolio/creatives/Fresh Skin.png' },
  { id:'dental-care', group:'Content & Creative', title:'Dental care', type:'creative', size:[1122,1402], category:'Social creative',
    desc:'A patient-facing clinic creative seen from the dentist’s mirror.',
    src:'portfolio/creatives/Dental care.png' },
];
