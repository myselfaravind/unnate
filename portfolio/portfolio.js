/* =====================================================================
   UNNATE · PORTFOLIO MANIFEST — the source of truth for Section 03.
   Static hosting can't list a folder, so every piece is named here once.
   Paths are relative to the site root (they work locally, on GitHub and on Cloudflare).

   type    'web' | 'creative' | 'video'
   src     the real file:
             website  →  'portfolio/websites/<project>/index.html'   (rendered live)
             creative →  'portfolio/creatives/<file>.webp|.jpg|.png'
             video    →  'portfolio/videos/<file>.mp4'
   poster  (video, optional) a still image shown before playback
   alt     (creative) what the image shows, for screen readers
   tag     honest status: 'Client work', 'Concept', 'Self-initiated' …
   featured: true  → also appears in "All works"

   Pieces with `demo:` and no `src` are built-in artwork. Replace them with
   real files as they arrive (or delete their lines).
   ===================================================================== */
window.UNNATE_PORTFOLIO = [
  /* ---- websites ---- */
  { id:'nova',     title:'Nova',               type:'web',      label:'Website Design',          tag:'Concept',        demo:'nova',     ar:'16/9',  arM:'4/5' },
  { id:'kiln',     title:'Kiln Studio',        type:'web',      label:'Website Redesign',        tag:'Concept',        demo:'kiln',     ar:'16/10', arM:'16/11' },
  { id:'meridian', title:'Meridian',           type:'web',      label:'Landing Page',            tag:'Concept',        demo:'meridian', ar:'16/10', arM:'4/5' },
  // { id:'acme', title:'Acme', type:'web', label:'Website Design', tag:'Client work', src:'portfolio/websites/acme/index.html', ar:'16/10', arM:'4/5', featured:true },

  /* ---- creatives ---- */
  { id:'diwali',   title:'Diwali Campaign',    type:'creative', label:'Creative Campaign',       tag:'Concept',        demo:'diwali',   ar:'4/5' },
  { id:'summer',   title:'Summer Drop',        type:'creative', label:'Social Creative',         tag:'Concept',        demo:'summer',   ar:'1/1' },
  { id:'launch',   title:'Launch Week',        type:'creative', label:'Carousel Series',         tag:'Concept',        demo:'launch',   ar:'16/10', arM:'4/3' },
  { id:'unnate',   title:'UNNATE Brand World', type:'creative', label:'Identity & Illustration', tag:'Self-initiated', demo:'brand',    ar:'16/10', arM:'4/3' },
  // { id:'festive', title:'Festive Offer', type:'creative', label:'Social Creative', tag:'Client work', src:'portfolio/creatives/festive-offer.webp', alt:'Festive offer poster with …', featured:true },

  /* ---- short-form video ---- */
  { id:'product',  title:'Product Film',       type:'video',    label:'Short-form Video',        tag:'Concept',        demo:'product',  ar:'9/16' },
  { id:'founder',  title:'Founder Story',      type:'video',    label:'Short-form Video',        tag:'Concept',        demo:'founder',  ar:'9/16' },
  { id:'recipe',   title:'30-Second Recipe',   type:'video',    label:'Short-form Video',        tag:'Concept',        demo:'recipe',   ar:'9/16' },
  { id:'ba',       title:'Before / After',     type:'video',    label:'Short-form Ad',           tag:'Concept',        demo:'ba',       ar:'9/16' },
  // { id:'reel-01', title:'Launch Reel', type:'video', label:'Short-form Video', tag:'Client work', src:'portfolio/videos/launch-reel.mp4', poster:'portfolio/videos/launch-reel.jpg', featured:true },
];
