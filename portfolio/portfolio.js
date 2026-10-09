/* =====================================================================
   UNNATE · PORTFOLIO MANIFEST
   The single source of truth for the homepage carousel and the /work/ page.
   Static hosting can't list folders, so each piece is named here once.

   id        used in links (work/#id) and for the generated files in assets/work/
   title     shown on the site
   type      'web' | 'creative' | 'video'
   category  the label shown on the card
   desc      one honest line about the piece
   kind      'Client Work' | 'Self-Initiated' | 'Concept' | 'Demo' — or leave it out.
             Only set this when it is true. A piece without a kind shows no badge.
   src       the original file (websites: the project's entry HTML file)
   featured  true → appears in the homepage carousel, in this order
   posterAt  videos only: the second used for the still image

   After adding or changing a piece, run:  node tools/build-media.mjs
   ===================================================================== */
window.UNNATE_PORTFOLIO = [
  { id:'oddcart', title:'Oddcart', type:'web', category:'Website', kind:'Concept', featured:true,
    desc:'An archive of small, strange games, with a playable handheld console on the page.',
    src:'portfolio/websites/Oddcard/index.html' },
  { id:'skin-in-progress', title:'SKIN in Progress', type:'creative', category:'Social creative', featured:true,
    desc:'A typographic poster for a clinical spa’s skin-analysis treatment.',
    src:'portfolio/creatives/SKIN in Progress.png' },
  { id:'solara-drinks', title:'SOLARA Drinks', type:'video', category:'Short-form video', featured:true, posterAt:6,
    desc:'A product spot for a fruit drink, led by its illustrated label.',
    src:"portfolio/videos/SOLARA Drink's.mp4" },
  { id:'tickpic-moments', title:'Tick Pic Moments', type:'web', category:'Website', featured:true,
    desc:'An editorial portfolio site for a Chennai wedding and portrait photography studio.',
    src:'portfolio/websites/TickPic Moments/index.html' },
  { id:'dental-clinical-creative', title:'Dental Clinical creative', type:'creative', category:'Advertising creative', featured:true,
    desc:'A marketing creative for dental clinics, built around one slow-moving visual joke.',
    src:'portfolio/creatives/Dental Clinical creative.png' },
  { id:'crave-burgers-ad', title:'Crave Burgers ad', type:'video', category:'Short-form video', featured:true, posterAt:17,
    desc:'A short-form ad built on the first-bite reaction.',
    src:"portfolio/videos/Crave Burger's AD.mp4" },
  { id:'maren-dental-studio', title:'Maren Dental Studio', type:'web', category:'Website', featured:true,
    desc:'A calm, appointment-led website for a modern dental clinic.',
    src:'portfolio/websites/Maren Dental Studio/index.html' },
  { id:'beauty-spa', title:'Beauty SPA', type:'creative', category:'Social creative', featured:true,
    desc:'A facial-treatment poster for a clinical beauty spa.',
    src:'portfolio/creatives/Beauty SPA.png' },
  { id:'neuva-diwali', title:'NEUVA Diwali', type:'video', category:'Short-form video', featured:true, posterAt:17,
    desc:'A Diwali corporate-gifting film: one more workday, then a box worth sharing.',
    src:'portfolio/videos/NEUVA Biwali.mp4' },

  { id:'fresh-skin', title:'Fresh Skin', type:'creative', category:'Product creative',
    desc:'A launch creative for a daily skincare cleanser.',
    src:'portfolio/creatives/Fresh Skin.png' },
  { id:'dental-care', title:'Dental care', type:'creative', category:'Social creative',
    desc:'A patient-facing clinic creative seen from the dentist’s mirror.',
    src:'portfolio/creatives/Dental care.png' },
  { id:'unnate-creatives', title:'UNNATE Creatives', type:'creative', category:'Studio creative', kind:'Self-Initiated',
    desc:'A studio piece about what content should make an audience do.',
    src:"portfolio/creatives/Unnate Creative's.png" },
  { id:'crave-burgers', title:'Crave Burgers', type:'video', category:'Short-form video', posterAt:1,
    desc:'An office-set short where one burger turns into a round of orders.',
    src:"portfolio/videos/Crave Burger's.mp4" },
  { id:'neuva', title:'NEUVA', type:'video', category:'Short-form video', posterAt:17,
    desc:'A second cut of the Diwali gifting film, with a different lead.',
    src:'portfolio/videos/NEUVA.mp4' },
  { id:'pearl-medspa', title:'Pearl MedSpa', type:'video', category:'Short-form video', posterAt:17,
    desc:'A quiet consultation-room film for a medical spa.',
    src:'portfolio/videos/Pearl MedSpa.mp4' },
];
