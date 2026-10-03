/* =====================================================================
   UNNATE · PORTFOLIO MANIFEST — the source of truth for Section 03.
   Static hosting can't list folders, so each piece is named here once.
   Paths are relative to the site root and match the files in /portfolio.
   Spaces and apostrophes in filenames are fine — they're encoded automatically.

   type     'web' | 'creative' | 'video'
   title    shown on the site (the project / content name)
   label    the type line under the title
   src      the real file (websites: the project's entry HTML file)
   featured true → one of the curated pieces in "All Work"
            (All Work is designed for 2 websites + 3 creatives + 2 videos)
   tag      optional honest status, e.g. 'Client work' or 'Concept'
   ===================================================================== */
window.UNNATE_PORTFOLIO = [
  /* ---- websites (portfolio/websites/<project>/index.html) ---- */
  { id:'maren-dental-studio', title:'Maren Dental Studio', type:'web', label:'Website', src:'portfolio/websites/Maren Dental Studio/index.html', featured:true },
  { id:'oddcard',             title:'Oddcard',             type:'web', label:'Website', src:'portfolio/websites/Oddcard/index.html',             featured:true },
  { id:'tickpic-moments',     title:'TickPic Moments',     type:'web', label:'Website', src:'portfolio/websites/TickPic Moments/index.html' },

  /* ---- creatives (portfolio/creatives) ---- */
  { id:'beauty-spa',              title:'Beauty SPA',              type:'creative', label:'Creative', src:'portfolio/creatives/Beauty SPA.png',              alt:'Beauty SPA creative',              featured:true },
  { id:'fresh-skin',              title:'Fresh Skin',              type:'creative', label:'Creative', src:'portfolio/creatives/Fresh Skin.png',              alt:'Fresh Skin creative',              featured:true },
  { id:'dental-clinical-creative',title:'Dental Clinical creative',type:'creative', label:'Creative', src:'portfolio/creatives/Dental Clinical creative.png', alt:'Dental Clinical creative',         featured:true },
  { id:'dental-care',             title:'Dental care',             type:'creative', label:'Creative', src:'portfolio/creatives/Dental care.png',             alt:'Dental care creative' },
  { id:'skin-in-progress',        title:'SKIN in Progress',        type:'creative', label:'Creative', src:'portfolio/creatives/SKIN in Progress.png',        alt:'SKIN in Progress creative' },
  { id:'unnate-creatives',        title:"Unnate Creative's",       type:'creative', label:'Creative', src:"portfolio/creatives/Unnate Creative's.png",       alt:'UNNATE creative' },

  /* ---- short-form video (portfolio/videos) ---- */
  { id:'crave-burgers-ad', title:"Crave Burger's AD", type:'video', label:'Short-form video', src:"portfolio/videos/Crave Burger's AD.mp4", featured:true },
  { id:'solara-drinks',    title:"SOLARA Drink's",    type:'video', label:'Short-form video', src:"portfolio/videos/SOLARA Drink's.mp4",    featured:true },
  { id:'crave-burgers',    title:"Crave Burger's",    type:'video', label:'Short-form video', src:"portfolio/videos/Crave Burger's.mp4" },
  { id:'neuva-diwali',     title:'NEUVA Diwali',      type:'video', label:'Short-form video', src:'portfolio/videos/NEUVA Biwali.mp4' },
  { id:'neuva',            title:'NEUVA',             type:'video', label:'Short-form video', src:'portfolio/videos/NEUVA.mp4' },
  { id:'pearl-medspa',     title:'Pearl MedSpa',      type:'video', label:'Short-form video', src:'portfolio/videos/Pearl MedSpa.mp4' },
];
