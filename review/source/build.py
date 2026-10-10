import re, base64, json, subprocess, sys, os
ROOT = '/home/claude/unnate'; G = os.path.dirname(os.path.abspath(__file__)); OUT = ROOT + '/review'
FD = G + '/../f2/node_modules/@fontsource-variable/'
rd = lambda p: open(p, encoding='utf8').read()
b64 = lambda p, mime: f'data:{mime};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
def face(family, pkg, file, style='normal', weight='100 900'):
    return f'@font-face{{font-family:"{family}";src:url("{b64(FD + pkg + "/files/" + file, "font/woff2")}") format("woff2");font-weight:{weight};font-style:{style};font-display:swap}}\n'
FONTS = {
 1: face('Geist', 'geist', 'geist-latin-wght-normal.woff2') + face('Geist Mono', 'geist-mono', 'geist-mono-latin-wght-normal.woff2'),
 2: face('Newsreader', 'newsreader', 'newsreader-latin-wght-normal.woff2', weight='200 800') + face('Newsreader', 'newsreader', 'newsreader-latin-wght-italic.woff2', 'italic', '200 800') + face('Hanken Grotesk', 'hanken-grotesk', 'hanken-grotesk-latin-wght-normal.woff2'),
 3: face('Bricolage Grotesque', 'bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2', weight='200 800'),
}
ARR = '<span class="arr" aria-hidden="true">→</span>'
T = dict(
 ARR=ARR, LOGO='<svg class="logo" viewBox="0 0 2180 662" aria-hidden="true" focusable="false"><use href="#wm"/></svg>',
 HERO_EYE='UNNATE · Creative Studio', HERO_LEDE='We build brands, design digital experiences, and create content that connects creativity with purpose.',
 PHILO_EYE='What we believe',
 P1='Good design catches your eye. Great creative work gives you a reason to keep looking.',
 P2='We believe the best brands don’t just look different. They make people feel something, communicate something meaningful and give people a reason to remember them.',
 P3='That’s why we bring thinking and intention into everything we create—from the smallest visual detail to the biggest campaign idea.',
 P4='Because looking good is a start. Making an impression is the point.',
 ST1='Good looks get attention.', ST2='Good thinking makes it count.',
 SVC_EYE='Our creative capabilities', SVC_H='Good ideas deserve good execution.',
 SVC_INTRO='From building your brand’s identity to getting your next campaign out into the world, we create the things your business needs to show up with clarity, character and purpose.',
 SVC_CLOSE='Different challenges. Different creative solutions. Always a reason behind the work.',
 WORK_EYE='A little proof of what we do',
 WORK_DESC='Ideas are one thing. Seeing them come to life is another. Explore the identities, digital experiences and creative work we’ve made to turn thinking into something tangible.',
 POV_EYE='The thinking behind the work',
 V1='We believe creativity works best when feeling and function meet.',
 V2='A brand identity should give a business character. A website should make its value easier to understand. Content should communicate something worth noticing. A campaign should have a clear reason to exist.',
 V3='We don’t believe in adding more just because we can. We believe in finding the idea that matters, giving it the right form and making every detail work towards it.',
 PR1='Feel something.', PR1D='Create work with personality, emotion and a point of view.',
 PR2='Mean something.', PR2D='Make every creative decision serve a clear purpose.',
 PR3='Make it matter.', PR3D='Turn thoughtful execution into work that people can recognise, remember and act on.',
 CONTACT_EYE='Have something in mind?',
 C1='A new brand. A better website. Content that feels more like you. A campaign ready to go further.',
 C2='Whatever you’re working towards, tell us a little about it. We’ll start with the idea, understand the challenge and work out what makes sense.',
 FOOT_LINE='Make people feel something. Make it mean something.',
 FOOT_DESC='An independent creative studio building distinctive brands and purposeful digital experiences for businesses around the world.',
)
SERVICES = [
 dict(id='web', name='Web', pitch='More than a digital presence. A better first impression.',
  desc='Your website should do more than tell people you exist. It should make your value clear, build trust and help visitors take the next step.',
  items=['Website design', 'Website development', 'Website redesign and revamps', 'Landing pages and campaign pages', 'Launch and maintenance support'], cta='Build your digital presence'),
 dict(id='content-social', name='Content &amp; Social', pitch='Create things people actually want to look at.',
  desc='From the first frame to the final design, we produce creative assets that earn attention, express your brand’s personality and give your message a sharper edge.',
  items=['Short-form videos and Reels', 'Social media creatives', 'Campaign and promotional content', 'Content planning', 'Creative concepts and content production'], cta='Create something memorable'),
 dict(id='paid-campaigns', name='Paid Campaigns', pitch='Put the right message in front of the right people.',
  desc='Attention matters. Reaching the right audience matters more. We create and manage paid campaigns designed around your business goals, with ongoing testing and optimisation to improve how your budget works.',
  items=['Meta Ads, including Facebook and Instagram', 'Google Ads', 'Campaign setup and audience targeting', 'Advertising creatives', 'Creative testing, optimisation and reporting'], cta='Make your budget work smarter'),
]
items = json.loads(subprocess.check_output(['node', '-e', f"global.window={{}};require('{ROOT}/portfolio/portfolio.js');console.log(JSON.stringify(window.UNNATE_PORTFOLIO))"]))
names = set()
for it in items:
    names.add(it['id'] + {'web': '-wide', 'video': '-poster'}.get(it['type'], '-full'))
    if it['type'] == 'web': names.add(it['id'] + '-full')
ASSETS = 'window.UNNATE_ASSETS=' + json.dumps({n: b64(f'{ROOT}/assets/work/{n}.webp', 'image/webp') for n in sorted(names)}) + ';'
LOGO_SYM = re.search(r'<symbol id="wm".*?</symbol>', rd(ROOT + '/assets/img/logo.svg'), re.S).group(0)
NAMES = {1: ('unnate-design-01-hairline-growth.html', 'UNNATE · Design 01 · Hairline Growth'), 2: ('unnate-design-02-glass-editorial.html', 'UNNATE · Design 02 · Glass Editorial'), 3: ('unnate-design-03-interactive-experimental.html', 'UNNATE · Design 03 · Interactive Experimental')}
def build(n):
    h = rd(f'{G}/d{n}.html')
    m = re.search(r'<!--SVC-->(.*?)<!--/SVC-->', h, re.S)
    if m:
        tpl = m.group(1); out = ''
        for i, s in enumerate(SERVICES):
            t = tpl
            for k, v in dict(N=f'0{i+1}', ID=s['id'], NAME=s['name'], PITCH=s['pitch'], DESC=s['desc'], CTA=s['cta'], ITEMS=''.join(f'<li>{x}</li>' for x in s['items'])).items(): t = t.replace('{{S_' + k + '}}', v)
            out += t
        h = h[:m.start()] + out + h[m.end():]
    for k, v in T.items(): h = h.replace('{{' + k + '}}', v)
    left = re.findall(r'\{\{\w+\}\}', h); assert not left, left
    scripts = [ASSETS, rd(ROOT + '/portfolio/portfolio.js')]
    if n == 1: scripts.append(rd(ROOT + '/assets/hairline/kernel.js'))
    scripts += [rd(f'{G}/core.js'), rd(f'{G}/d{n}.js')]
    assert all('</script' not in s for s in scripts)
    tail = ''.join(f'<script>{s}</script>\n' for s in scripts)
    if n == 1: tail += '<script type="module">' + rd(ROOT + '/assets/hairline/ascent.js') + '</script>\n'
    file, title = NAMES[n]
    page = f'''<!doctype html>
<!-- UNNATE design exploration {n} of 3. A self-contained review file: fonts, images and scripts are inside it. Not the production site. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>{title}</title>
<style>
{FONTS[n]}{rd(G + '/core.css')}
{rd(f'{G}/d{n}.css')}
</style>
</head>
<body id="top">
<a class="skip" href="#main">Skip to content</a>
<svg class="defs" aria-hidden="true" focusable="false">{LOGO_SYM}</svg>
{h}
{tail}</body>
</html>
'''
    os.makedirs(OUT, exist_ok=True)
    open(f'{OUT}/{file}', 'w', encoding='utf8').write(page)
    print(file, len(page) // 1024, 'KB')
for n in [int(a) for a in sys.argv[1:]] or [1, 2, 3]: build(n)
