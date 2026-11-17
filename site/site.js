/* tarverart.com: wires the pre-rendered pages. Everything visual comes from tarver/bundle.js and tarver/bundle.css. */
(function(){
'use strict';

/* ============================================================
   SITE SETTINGS: the one place to fill in before launch.
   ============================================================ */
var CONFIG={
 /* Stripe Payment Link for the print (Stripe Tax on, after payment redirect to https://tarverart.com/thank-you/).
    Leave '' until Aaron supplies it. After changing it, run: node build/build.mjs */
 STRIPE_PAYMENT_LINK:'',
 /* Meta pixel ID (digits only). The pixel stays off while this is still the placeholder. */
 META_PIXEL_ID:'META_PIXEL_ID',
 /* Kit form that receives collector list sign ups. */
 KIT_FORM_ID:'10200923',
 /* Purchase event sent on /thank-you/. */
 PURCHASE:{value:70,currency:'USD'}
};
/* ===================== end of settings ===================== */

if(!window.Tarver||!Tarver.characters)return;
var T=Tarver.characters,doc=document,page=doc.body.getAttribute('data-page')||'';
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}

/* ---------- ad tracking: keep utm values for the visit, hand them to checkout ---------- */
var UTM=['utm_source','utm_medium','utm_campaign','utm_content'];
function readUtm(){var out={};try{out=JSON.parse(sget('tarver.utm')||'{}')||{}}catch(e){out={}}
 try{var q=new URLSearchParams(location.search),hit=false;UTM.forEach(function(k){var v=q.get(k);if(v){out[k]=v;hit=true}});if(hit)sset('tarver.utm',JSON.stringify(out))}catch(e){}
 return out}
var utm=readUtm();
function withUtm(url){try{var u=new URL(url,location.href);UTM.forEach(function(k){if(utm[k])u.searchParams.set(k,utm[k])});return u.toString()}catch(e){return url}}

/* ---------- the visit: one browser tab session ---------- */
function loadVisit(){var v=null;try{v=JSON.parse(sget('tarver.visit')||'null')}catch(e){}
 if(!v||!T.ENTRANCES.some(function(e){return e.key===v.key})){v={key:T.nextEntrance().key,played:false,seenAbout:false}}
 return v}
function saveVisit(){sset('tarver.visit',JSON.stringify(visit))}
function entranceOf(k){return T.ENTRANCES.filter(function(e){return e.key===k})[0]}
var visit=loadVisit();

/* ---------- header walk-in ---------- */
/* The design system's walk-ins measure the logo and the letters once, in pixels, when they start. So this block does three things:
   it starts a walk-in only once the page has settled, it watches for anything that moves the header afterwards (a late font,
   a rotated phone, a resized window, coming back with the Back button) and redraws the still ending in the right place, and it
   never leaves a half-played walk-in on screen. */
function fakeMM(q){return {matches:true,media:q,onchange:null,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false}}}
var LIVE_MS=5200; /* every walk-in ends still in under 5 seconds */
var hdr={wrap:null,hd:null,plain:'',e:null,inst:null,sig:'',liveUntil:0,moved:false,drawn:false};
function wantedEntrance(){return (page==='about'||visit.seenAbout)?entranceOf('D'):entranceOf(visit.key)}
/* Where the pieces the walk-ins measure sit right now. */
function signature(){var hd=hdr.hd,st=hd.querySelector('.tv-site-header__stage')||hd,o=st.getBoundingClientRect(),w=hd.querySelector('.tv-site-header__word');
 return [st,hd.querySelector('.tv-site-header__logo svg'),w,hd.querySelector('.hdr__r')].map(function(x){if(!x)return '';var r=x.getBoundingClientRect();return [r.left-o.left,r.top-o.top,r.width,r.height].map(function(n){return Math.round(n*2)/2}).join(',')}).join('|')+'|'+getComputedStyle(w).fontSize+'|'+getComputedStyle(w).fontFamily}
/* The pages ship with the plain wordmark. Entrances that use the balance beam need the lettered one. */
function setWordmark(beam){var tmp=doc.createElement('div');tmp.innerHTML=T.headerHTML(0,beam?1:0,[]);var from=tmp.querySelector('.tv-site-header__word'),to=hdr.hd.querySelector('.tv-site-header__word');if(from&&to)to.innerHTML=from.innerHTML}
/* Put the header back to how the page shipped it, ready for a different entrance. */
function freshHeader(){var open=hdr.hd.classList.contains('is-open'),mb=hdr.hd.querySelector('.tv-site-menubtn');if(open&&mb)mb.click();
 hdr.wrap.innerHTML=hdr.plain;hdr.hd=hdr.wrap.querySelector('.tv-site-header');hdr.inst=null;hdr.drawn=false;
 if(Tarver.siteHeader)Tarver.siteHeader.wire(hdr.wrap)}
function useEntrance(e){if(hdr.e&&hdr.e!==e)freshHeader();if(hdr.e!==e||!hdr.inst){hdr.e=e;setWordmark(e.beam);hdr.inst=e.make(hdr.hd)}}
/* Draws the entrance's still ending: play it while matchMedia reports reduced motion. */
function drawStill(){var mm=window.matchMedia;hdr.liveUntil=0;hdr.moved=false;
 window.matchMedia=function(q){return /reduced-motion/.test(q)?fakeMM(q):mm.call(window,q)};
 try{hdr.inst.play()}catch(err){if(window.console)console.warn(err)}finally{window.matchMedia=mm}
 hdr.sig=signature();hdr.drawn=true}
function drawLive(){hdr.moved=false;hdr.liveUntil=Date.now()+LIVE_MS;
 try{hdr.inst.play()}catch(err){if(window.console)console.warn(err);hdr.liveUntil=0}
 hdr.sig=signature();hdr.drawn=true;
 setTimeout(function(){if(!hdr.liveUntil)return;hdr.liveUntil=0;if(hdr.moved||signature()!==hdr.sig)drawStill()},LIVE_MS)}
/* Something may have moved the header. Redraw the still ending if it did. A walk-in in flight is left to finish first. */
function recheck(){if(!hdr.drawn)return;if(signature()===hdr.sig)return;if(hdr.liveUntil){hdr.moved=true;return}drawStill()}
var recheckQueued=false;function recheckSoon(){if(recheckQueued)return;recheckQueued=true;requestAnimationFrame(function(){recheckQueued=false;recheck()})}
function settled(maxMs,then){
 /* fonts in, page loaded (or maxMs passed), then two frames so the layout is final */
 var done=false,go=function(){if(done)return;done=true;requestAnimationFrame(function(){requestAnimationFrame(then)})};
 var fonts=(doc.fonts&&doc.fonts.ready)?doc.fonts.ready:Promise.resolve();
 var loaded=doc.readyState==='complete'?Promise.resolve():new Promise(function(r){window.addEventListener('load',r,{once:true})});
 setTimeout(go,maxMs);Promise.all([fonts,loaded]).then(go,go)}
function walkIn(){
 hdr.wrap=doc.querySelector('.tv-site--launch');hdr.hd=hdr.wrap&&hdr.wrap.querySelector('.tv-site-header');if(!hdr.hd)return;
 hdr.plain=hdr.wrap.innerHTML;
 var e=wantedEntrance(),live=false;
 if(page==='about'&&!visit.seenAbout){live=true;visit.seenAbout=true;visit.played=true}
 else if(!visit.played){live=true;visit.played=true}
 saveVisit();
 if(Tarver.siteHeader)Tarver.siteHeader.wire(hdr.wrap);
 useEntrance(e);
 if(live&&!T.RM()){
  /* A live walk-in waits for a settled page so it plays smoothly, and is skipped to its ending if the visitor is not looking. */
  settled(3000,function(){if(doc.hidden)drawStill();else drawLive()})
 }else{
  /* A still ending is drawn as soon as the wordmark's font is in, and corrected by recheck if anything moves later. */
  var ff=getComputedStyle(hdr.hd.querySelector('.tv-site-header__word')),once=false,draw=function(){if(once)return;once=true;drawStill()};
  if(doc.fonts&&doc.fonts.load){setTimeout(draw,2500);doc.fonts.load(ff.fontWeight+' '+ff.fontSize+' '+ff.fontFamily,'Tarver').then(draw,draw)}else draw();
 }
 /* keep it right afterwards */
 window.addEventListener('resize',recheckSoon);
 window.addEventListener('orientationchange',function(){setTimeout(recheck,300)});
 window.addEventListener('load',recheckSoon);
 if(doc.fonts){if(doc.fonts.ready)doc.fonts.ready.then(recheckSoon);if(doc.fonts.addEventListener)doc.fonts.addEventListener('loadingdone',recheckSoon)}
 if(window.ResizeObserver){var ro=new ResizeObserver(recheckSoon);ro.observe(hdr.wrap)}
 /* Leaving the tab mid walk-in lets its timers drift, so come back to the finished picture. */
 doc.addEventListener('visibilitychange',function(){if(!hdr.drawn)return;if(doc.hidden){if(hdr.liveUntil)hdr.moved=true}else if(hdr.moved&&hdr.liveUntil){drawStill()}else recheckSoon()});
 /* Back or Forward can bring this page back exactly as it was left. Show what the visit calls for now. */
 window.addEventListener('pageshow',function(ev){if(!ev.persisted||!hdr.drawn)return;visit=loadVisit();useEntrance(wantedEntrance());drawStill()});
}

/* ---------- Buy ---------- */
function wireBuy(){
 var pl=doc.querySelector('.tv-print');if(!pl)return;
 if(Tarver.printListing)Tarver.printListing.wire(pl);
 var b=pl.querySelector('.tv-print__buy');if(!b)return;
 var link=CONFIG.STRIPE_PAYMENT_LINK;
 if(link)b.setAttribute('href',link);
 function reset(){b.__co=0;if(Tarver.printListing)Tarver.printListing.loading(b,false);var s=pl.querySelector('.tv-buyrx__stage');if(s)s.innerHTML=''}
 b.addEventListener('click',function(ev){
  ev.preventDefault();if(b.__co)return;b.__co=1;
  if(Tarver.printListing)Tarver.printListing.loading(b,true);
  var ms=0;try{ms=Tarver.buyReaction.play(b,visit.seenAbout?'family':'solo')}catch(err){}
  setTimeout(function(){
   if(!link){if(window.console)console.warn('Tarver: STRIPE_PAYMENT_LINK is not set in site.js, so Buy has nowhere to go yet.');reset();return}
   location.href=withUtm(link)},ms?1500:0)});
 window.addEventListener('pageshow',function(ev){if(ev.persisted)reset()});
}

/* ---------- collector list: send to Kit ---------- */
if(Tarver.join)Tarver.join.send=function(email){
 return fetch('https://app.kit.com/forms/'+CONFIG.KIT_FORM_ID+'/subscriptions',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'email_address='+encodeURIComponent(email)})
  .then(function(r){if(!r.ok)throw new Error('Kit '+r.status);return r.json().catch(function(){return {}})})
  .then(function(j){if(j&&(j.status==='failed'||j.errors||j.error))throw new Error('Kit refused');return 'joined'})};

/* ---------- Meta pixel ---------- */
function pixel(){
 var id=CONFIG.META_PIXEL_ID;if(!/^\d+$/.test(id))return;
 /* Meta's standard loader */
 !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 fbq('init',id);fbq('track','PageView');
 if(page==='thanks')fbq('track','Purchase',CONFIG.PURCHASE);
}

/* ---------- go ---------- */
var root=doc.querySelector('main')||doc;
T.ensureDefs();
walkIn();
if(page==='home')wireBuy();
if(page==='about'&&Tarver.about)Tarver.about.wire(root);
if(page==='joined'&&Tarver.joined)Tarver.joined.wire(root);
if((page==='ship'||page==='privacy'||page==='terms')&&Tarver.policy){try{Tarver.policy.style(root)}catch(err){}}
doc.documentElement.classList.remove('tv-wait');
if(page==='thanks'&&Tarver.thanks)Tarver.thanks.all(root);
if(Tarver.join)Tarver.join.all(doc);
pixel();
})();
