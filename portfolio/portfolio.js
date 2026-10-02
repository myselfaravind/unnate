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
  { id:'nova',     title:'Project 01', type:'web', label:'Website Design', tag:'Concept', src:'portfolio/websites/project-01/index.html', ar:'16/9',  arM:'4/5' },
  { id:'kiln',     title:'Project 02', type:'web', label:'Website Design', tag:'Concept', src:'portfolio/websites/project-02/index.html', ar:'16/10', arM:'16/11' },
  { id:'meridian', title:'Project 03', type:'web', label:'Website Design', tag:'Concept', src:'portfolio/websites/project-03/index.html', ar:'16/10', arM:'4/5' },

  /* ---- creatives ---- */
  { id:'diwali',   title:'Diwali Campaign', type:'creative', label:'Creative Campaign', tag:'Concept', demo:'diwali', ar:'4/5' },
  { id:'summer',   title:'Summer Drop', type:'creative', label:'Social Creative', tag:'Concept', demo:'summer', ar:'1/1' },

  { id:'creative1', title:'Creative 01', type:'creative', label:'Creative Design', tag:'Self-initiated', src:'portfolio/creatives/creatives%20(1).png', alt:'Creative design 01', ar:'4/5' },
  { id:'creative2', title:'Creative 02', type:'creative', label:'Creative Design', tag:'Self-initiated', src:'portfolio/creatives/creatives%20(2).png', alt:'Creative design 02', ar:'4/5' },
  { id:'creative3', title:'Creative 03', type:'creative', label:'Creative Design', tag:'Self-initiated', src:'portfolio/creatives/creatives%20(3).png', alt:'Creative design 03', ar:'4/5' },
  { id:'creative4', title:'Creative 04', type:'creative', label:'Creative Design', tag:'Self-initiated', src:'portfolio/creatives/creatives%20(4).png', alt:'Creative design 04', ar:'4/5' },
  { id:'creative5', title:'Creative 05', type:'creative', label:'Creative Design', tag:'Self-initiated', src:'portfolio/creatives/creatives%20(5).png', alt:'Creative design 05', ar:'4/5' },

  /* ---- short-form video ---- */
  { id:'sf8', title:'SF8', type:'video', label:'Short-form Video', tag:'Self-initiated', src:'portfolio/videos/SF8.mp4', ar:'9/16' },
  { id:'sf7', title:'SF7', type:'video', label:'Short-form Video', tag:'Self-initiated', src:'portfolio/videos/SF7.mp4', ar:'9/16' },
  { id:'sf3', title:'SF3', type:'video', label:'Short-form Video', tag:'Self-initiated', src:'portfolio/videos/SF3.mp4', ar:'9/16' },
  { id:'sf1', title:'SF1', type:'video', label:'Short-form Video', tag:'Self-initiated', src:'portfolio/videos/SF1.mp4', ar:'9/16' },
  { id:'sf2', title:'SF2', type:'video', label:'Short-form Video', tag:'Self-initiated', src:'portfolio/videos/SF2.mp4', ar:'9/16' },
  { id:'sf5', title:'SF5', type:'video', label:'Short-form Video', tag:'Self-initiated', src:'portfolio/videos/SF5.mp4', ar:'9/16' },
  { id:'sf4', title:'SF4', type:'video', label:'Short-form Video', tag:'Self-initiated', src:'portfolio/videos/SF4.mp4', ar:'9/16' }
];