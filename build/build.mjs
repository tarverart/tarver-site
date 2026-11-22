/* Builds the static site into site/.  Run from the repo root:  node build/build.mjs
   Reads   design-system/ (bundle.css, bundle.js, tokens.css, used as they are)
           content/pages.json (page markup, word for word)
           images/
           site/site.js (settings), site/about/about.js (About photo settings)
   Writes  site/tarver/, site/images/ and every page's index.html, plus site/404.html.
   No dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const r=(...p)=>path.join(ROOT,...p);
const read=p=>fs.readFileSync(r(p),'utf8');
const write=(p,s)=>{fs.mkdirSync(path.dirname(r(p)),{recursive:true});fs.writeFileSync(r(p),s)};

/* ---------- copy the design system and images as they are ---------- */
for(const f of ['bundle.css','bundle.js','tokens.css']){fs.mkdirSync(r('site/tarver'),{recursive:true});fs.copyFileSync(r('design-system',f),r('site/tarver',f))}
fs.mkdirSync(r('site/images'),{recursive:true});
for(const f of fs.readdirSync(r('images')))fs.copyFileSync(r('images',f),r('site/images',f));

/* ---------- load the design system so pages can be pre-rendered with its own functions ---------- */
const document={readyState:'complete',body:null,documentElement:{style:{}},getElementById:()=>null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({getContext:()=>({measureText:()=>({width:0})})})};
const win={document,console,setTimeout,clearTimeout,addEventListener(){},matchMedia:()=>({matches:false}),localStorage:{getItem:()=>null,setItem(){}}};
win.window=win;
vm.runInContext(read('design-system/bundle.js'),vm.createContext(win));
const Tarver=win.Tarver,T=Tarver.characters;

/* ---------- settings kept in the site's own scripts ---------- */
const siteJs=read('site/site.js');
const STRIPE=(siteJs.match(/STRIPE_PAYMENT_LINK:'([^']*)'/)||[])[1]||'';
const PIXEL=(siteJs.match(/META_PIXEL_ID:'(\d+)'/)||[])[1]||'';
const aboutJs=read('site/about/about.js');
const ABOUT=vm.runInNewContext('('+aboutJs.match(/var ABOUT=(\{[\s\S]*?\n\});/)[1]+')');
const aboutKey=o=>{const s=JSON.stringify(o);let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return String(h)};

const PAGES=JSON.parse(read('content/pages.json'));
const ORIGIN='https://tarverart.com';
const EMAIL='hello@tarverart.com';
const URLS={home:'/',about:'/about/',help:'/help/',ship:'/shipping/',privacy:'/privacy/',terms:'/terms/',thanks:'/thank-you/',joined:'/joined/'};
const FONTS=(read('design-system/bundle.css').match(/@import url\("([^"]+)"\)/)||[])[1];

/* ---------- shared chrome ---------- */
const ICON={
 help:'<svg class="tv-icon tv-ico" viewBox="0 0 24 24" aria-hidden="true"><circle class="is" cx="12" cy="12" r="9"/><path class="ln ik" d="M9.4 9.4a2.7 2.7 0 1 1 3.7 2.5c-.8.35-1.1.9-1.1 1.7v.5"/><circle class="ib" cx="12" cy="17.3" r="1.7"/></svg>',
 user:'<svg class="tv-icon tv-ico" viewBox="0 0 24 24" aria-hidden="true"><circle class="ip" cx="12" cy="8" r="4"/><path class="ib r" d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/></svg>',
 check:'<svg class="tv-icon tv-ico" viewBox="0 0 24 24" aria-hidden="true"><rect class="is" x="3" y="3" width="18" height="18" rx="9"/><g transform="translate(-0.3 -0.5)"><path class="ik" d="M11.9,16.7 L17.8,10.1 A1.4 1.4 0 0 0 15.7,8.2 L9.8,14.9 A1.4 1.4 0 0 0 11.9,16.7 Z"/><path class="ib" d="M6.8,13.7 L9.9,16.8 A1.4 1.4 0 0 0 11.9,14.8 L8.7,11.7 A1.4 1.4 0 0 0 6.8,13.7 Z"/></g></svg>'
};
function header(cur){
 const links=[{label:'About',icon:'user',current:cur==='about'},{label:'Help',icon:'help',current:cur==='help'}];
 let h=T.headerHTML(0,0,links);
 h=h.replace('class="tv-site-header__logo" href="#"','class="tv-site-header__logo" href="/"');
 /* nav links and menu items: point each at its page by its label */
 h=h.replace(/<a class="(tv-site-nav__link|tv-site-menu__item)" href="#"([^>]*)>([\s\S]*?)<\/a>/g,(m,c,rest,inner)=>`<a class="${c}" href="${/About/.test(inner)?URLS.about:URLS.help}"${rest}>${inner}</a>`);
 if(/href="#"/.test(h))throw new Error('header still has a placeholder link');
 /* tv-site--sticky: the design system's sticky header, which shrinks once the page scrolls (Tarver.siteHeader adds is-scrolled). */
 return '<div class="tv-site--launch tv-site--sticky">'+h+'</div>';
}
/* The Join box. The form is the prototype's; the typo, error and done states are the pieces Tarver.join shows and hides. */
const JOIN_STATES_IN='<div class="tv-join__suggest"><span>Did you mean <b class="tv-join__domain"></b>?</span><button class="tv-join__fix" type="button">Fix it</button></div><p class="tv-join__error" role="alert"><span class="tv-join__bang" aria-hidden="true">!</span><span class="tv-join__msg"></span></p>';
const JOIN_STATES_AFTER='<div class="tv-join__done tv-join__done--joined">'+ICON.check+'<div><b>Joined</b><span>Check your email to confirm.</span></div></div><div class="tv-join__done tv-join__done--already">'+ICON.check+'<div><b>Already joined</b><span>You’re on the list.</span></div></div>';
function joinStates(html){
 return html.replace(/(<button class="tv-btn tv-btn--secondary tv-join__btn")/g,JOIN_STATES_IN+'$1').replace(/(<\/form>)(<\/div>)/g,(m,a,b)=>a+JOIN_STATES_AFTER+b);
}
let uid=0;
function joinForm(){const id='j'+(uid++);return joinStates('<div class="tv-join"><form class="tv-join__form" novalidate><label class="tv-join__label" for="'+id+'">Join the collector list</label><p class="tv-join__hint" id="'+id+'h">New pieces first. One email per new piece.</p><input class="tv-join__input" id="'+id+'" type="email" name="email" autocomplete="email" inputmode="email" placeholder="you@email.com" aria-describedby="'+id+'h"><button class="tv-btn tv-btn--secondary tv-join__btn" type="submit"><span class="tv-join__btnlabel">Join</span><span class="tv-join__dots" aria-hidden="true"><i></i><i></i><i></i></span></button></form></div>')}
function footer(cur,noJoin){const c=k=>cur===k?' aria-current="page"':'';
 return '<footer class="tv-site-footer"><div class="tv-site-footer__inner"><div class="tv-site-footer__about"><a class="tv-site-footer__logo" href="/" aria-label="Tarver, home"><svg viewBox="0 0 64 64" aria-hidden="true"><rect x="23" y="18" width="18" height="42" rx="6" fill="currentColor"/><rect x="4" y="6" width="56" height="20" rx="7" fill="var(--brand)"/><circle cx="51" cy="49" r="9.5" fill="var(--sun)"/></svg><span class="tv-site-footer__word">Tarver</span></a><p class="tv-site-footer__tag">Art that makes you smile.</p><nav class="tv-site-footer__links" aria-label="More"><a class="tv-site-footer__pill" href="'+URLS.about+'"'+c('about')+'>'+ICON.user+'About</a><a class="tv-site-footer__pill" href="'+URLS.help+'"'+c('help')+'>'+ICON.help+'Help</a></nav><p class="tv-site-footer__contact"><span>Email: <a class="tv-link" href="mailto:'+EMAIL+'">'+EMAIL+'</a></span><span class="tv-social"><span>Instagram: <a class="tv-link" href="https://www.instagram.com/tarver.art/">@tarver.art</a>&nbsp;·</span><span>Facebook: <a class="tv-link" href="https://www.facebook.com/tarverartstudio" target="_blank" rel="noopener">@tarverartstudio</a></span></span></p></div>'+(noJoin?'':joinForm())+'<div class="tv-site-footer__legal"><span><a href="'+URLS.ship+'"'+c('ship')+'>Shipping and returns</a> · <a href="'+URLS.privacy+'"'+c('privacy')+'>Privacy</a> · <a href="'+URLS.terms+'"'+c('terms')+'>Terms</a></span><span>© 2026 Aaron Tarver</span></div></div></footer>';
}

/* ---------- page markup ---------- */
/* pages.json is used word for word. Only its stand-in addresses change: image paths, and the "#" links the prototype routed by their text. */
function fixContent(html){
 html=html.replace(/(src|data-src)="img\//g,'$1="/images/');
 html=html.replace(/<a href="#">([^<]*)<\/a>/g,(m,t)=>{const to=/shipping|returns/i.test(t)?URLS.ship:/help/i.test(t)?URLS.help:/about/i.test(t)?URLS.about:/privacy/i.test(t)?URLS.privacy:/terms/i.test(t)?URLS.terms:null;if(!to)throw new Error('no page for link: '+t);return '<a href="'+to+'">'+t+'</a>'});
 if(/href="#"/.test(html)||/"img\//.test(html))throw new Error('page still has a placeholder address');
 return joinStates(html);
}
function home(){
 let h=fixContent(PAGES.home);
 /* Buy is a link to the Stripe Payment Link. */
 const btn='<button class="tv-btn tv-btn--primary tv-print__buy" type="button"><span class="tv-print__buylabel">Buy · $70</span></button>';
 if(!h.includes(btn))throw new Error('Buy button not found in pages.json');
 h=h.replace(btn,'<a class="tv-btn tv-btn--primary tv-print__buy" href="'+(STRIPE||'#buy')+'"><span class="tv-print__buylabel">Buy · $70</span></a>');
 /* loading hints only: the main photo first, the room photos as they come into view */
 h=h.replace('<img class="tv-print__main" ','<img class="tv-print__main" fetchpriority="high" ');
 h=h.replace(/<div class="tv-print-ph"><img /g,'<div class="tv-print-ph"><img loading="lazy" decoding="async" ');
 return h;
}
/* Markup drawn ahead of time carries the design system's generated ids (patterns, gradients, paths). The browser's copy of the
   design system counts from the same start, so give the pre-rendered ones their own names to keep the two from colliding. */
function ownIds(html){
 const ids=new Set([...html.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]));
 for(const id of ids){const e=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');html=html.replace(new RegExp(' id="'+e+'"','g'),' id="pre-'+id+'"').replace(new RegExp('url\\(#'+e+'\\)','g'),'url(#pre-'+id+')').replace(new RegExp('href="#'+e+'"','g'),'href="#pre-'+id+'"')}
 return html;
}
const NOTFOUND='<div class="tv-pagehead tv-notfound"><p class="tv-kicker">Page not found</p><h1>Nothing here but sand.</h1><p class="tv-pagehead__line">That page washed out with the tide. The print is right this way.</p><p><a class="tv-btn tv-btn--primary" href="/">See the print</a></p></div>';

const DESC='A year of Jacksonville Beach tides, 2027 edition. 18 x 24 in print, printed to order, free US shipping.';
const SITE=[
 {k:'home',out:'index.html',title:'Tides at Jacksonville Beach | Tarver',og:'Tides at Jacksonville Beach',desc:DESC,main:home(),preload:'/images/hero.jpg'},
 {k:'about',out:'about/index.html',title:'About | Tarver',desc:'Meet Aaron and Rachel Tarver, the Jacksonville, Florida artists behind Tarver.',main:'<div data-about="'+aboutKey(ABOUT)+'">'+ownIds(Tarver.about.html(ABOUT))+'</div>',scripts:['/about/about.js']},
 {k:'help',out:'help/index.html',title:'Help | Tarver',desc:'Short answers about the print, buying, shipping and what to do if something is wrong.',main:fixContent(PAGES.help)},
 {k:'ship',out:'shipping/index.html',title:'Shipping and returns | Tarver',desc:'How your print gets to you, and what happens if something goes wrong.',main:fixContent(PAGES.ship),wait:true},
 {k:'privacy',out:'privacy/index.html',title:'Privacy | Tarver',desc:'What Tarver collects, why, and who it is shared with.',main:fixContent(PAGES.privacy),wait:true},
 {k:'terms',out:'terms/index.html',title:'Terms | Tarver',desc:'The terms for buying a print from Tarver.',main:fixContent(PAGES.terms),wait:true},
 {k:'thanks',out:'thank-you/index.html',title:'Thank you | Tarver',desc:'Your order is confirmed.',main:fixContent(PAGES.thanks),noJoin:true,noindex:true},
 {k:'joined',out:'joined/index.html',title:'Welcome to the club | Tarver',desc:'You are on the Tarver collector list.',main:ownIds(Tarver.joined.html({home:'/'})),noJoin:true,noindex:true},
 {k:'notfound',out:'404.html',title:'Page not found | Tarver',desc:'That page is not here.',main:NOTFOUND,noindex:true}
];

const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function page(p){
 const cur=(p.k==='about'||p.k==='help')?p.k:'';
 const url=p.k==='notfound'?null:ORIGIN+URLS[p.k];
 const ogTitle=p.og||p.title.replace(' | Tarver','');
 return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
${p.noindex?'<meta name="robots" content="noindex">\n':''}${url&&!p.noindex?`<link rel="canonical" href="${url}">\n`:''}<meta property="og:type" content="website">
<meta property="og:site_name" content="Tarver">
<meta property="og:title" content="${esc(ogTitle)}">
<meta property="og:description" content="${esc(p.desc)}">
${url?`<meta property="og:url" content="${url}">\n`:''}<meta property="og:image" content="${ORIGIN}/images/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Tides at Jacksonville Beach, framed, leaning on a weathered shelf beside a surfboard">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#fbf6ec">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${p.preload?`<link rel="preload" as="image" href="${p.preload}" fetchpriority="high">\n`:''}<link rel="stylesheet" href="${FONTS.replace(/&/g,'&amp;')}">
<link rel="stylesheet" href="/tarver/tokens.css">
<link rel="stylesheet" href="/tarver/bundle.css">
<link rel="stylesheet" href="/site.css">
${p.wait?`<script>document.documentElement.classList.add('tv-wait');setTimeout(function(){document.documentElement.classList.remove('tv-wait')},3000)</script>\n<noscript><style>.tv-wait .tv-policy{visibility:visible}</style></noscript>\n`:''}<script defer src="/tarver/bundle.js"></script>
${(p.scripts||[]).map(s=>`<script defer src="${s}"></script>\n`).join('')}<script defer src="/site.js"></script>
</head>
<body data-page="${p.k}">
${PIXEL?`<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${PIXEL}&amp;ev=PageView&amp;noscript=1"></noscript>\n`:''}<div class="tv-web">${header(cur)}<main>${p.main}</main>${footer(p.k,p.noJoin)}</div>
</body>
</html>
`;
}
for(const p of SITE){uid=0;write('site/'+p.out,page(p));console.log('wrote site/'+p.out)}

/* ---------- favicon (vector): the T logo ---------- */
write('site/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="23" y="18" width="18" height="42" rx="6" fill="#1f1a14"/><rect x="4" y="6" width="56" height="20" rx="7" fill="#c2410c"/><circle cx="51" cy="49" r="9.5" fill="#f5b82e"/></svg>\n');
write('site/robots.txt','User-agent: *\nAllow: /\nSitemap: '+ORIGIN+'/sitemap.xml\n');
write('site/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+SITE.filter(p=>!p.noindex).map(p=>' <url><loc>'+ORIGIN+URLS[p.k]+'</loc></url>').join('\n')+'\n</urlset>\n');
console.log('done');
