/* tarverart.com: wires the pre-rendered pages. Everything visual comes from tarver/bundle.js and tarver/bundle.css. */
(function(){
'use strict';

/* ============================================================
   SITE SETTINGS: the one place to change before launch.
   After changing STRIPE_PAYMENT_LINK or META_PIXEL_ID, run: node build/build.mjs
   ============================================================ */
var CONFIG={
 /* Stripe Payment Link for the print (Stripe Tax on, after payment redirect to https://tarverart.com/thank-you/). */
 STRIPE_PAYMENT_LINK:'https://buy.stripe.com/14A8wIe1G4OCcmCc8h6J200',
 /* Meta pixel ID (digits only). */
 META_PIXEL_ID:'1646920503878859',
 /* Kit form that receives collector list sign ups. */
 KIT_FORM_ID:'10200923',
 /* Purchase event sent on /thank-you/ only. */
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

/* ---------- the visit: one browser tab session ----------
   A new visit gets the next walk-in in the rotation: the lean, the balance beam, the umbrella drop.
   The family (D) is never in the rotation. It plays the first time the visitor opens About,
   and from then on it is the header on every page of that visit. */
var FAMILY='D';
function entranceOf(k){return T.ENTRANCES.filter(function(e){return e.key===k})[0]}
function nextSolo(){var e=T.nextEntrance();for(var i=0;i<T.ENTRANCES.length&&e.key===FAMILY;i++)e=T.nextEntrance();return e.key===FAMILY?entranceOf('A'):e}
function loadVisit(){var v=null;try{v=JSON.parse(sget('tarver.visit')||'null')}catch(e){}
 if(!v||v.key===FAMILY||!entranceOf(v.key)){v={key:nextSolo().key,played:false,seenAbout:false}}
 return v}
function saveVisit(){sset('tarver.visit',JSON.stringify(visit))}
var visit=loadVisit();
function familyShowing(){return page==='about'||visit.seenAbout}

/* ---------- header walk-in ----------
   The design system's walk-ins measure the logo and the letters once, in pixels, when they start, and they expect the
   header at its full size. So this block starts a walk-in only once the page has settled, always measures with the
   header at full size (even when the page is scrolled and the header is shrunk), redraws the still ending in the right
   place when something moves the header afterwards (a late font, a resized or rotated window, Back and Forward), and
   never leaves a half-played walk-in on screen. */
function fakeMM(q){return {matches:true,media:q,onchange:null,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false}}}
var LIVE_MS=5200; /* every walk-in ends still in under 5 seconds */
var hdr={wrap:null,hd:null,e:null,inst:null,sig:'',liveUntil:0,moved:false,drawn:false,width:0};
function wantedEntrance(){return familyShowing()?entranceOf(FAMILY):entranceOf(visit.key)}
/* Run fn with the header at full size: the sticky header's shrunk state is a transform the walk-ins must not measure. */
function fullSize(fn){var hd=hdr.hd,s=hd.classList.contains('is-scrolled');
 if(!s)return fn();
 hd.classList.add('tv-hdr-measure');hd.classList.remove('is-scrolled');void hd.offsetHeight;
 try{return fn()}finally{hd.classList.add('is-scrolled');void hd.offsetHeight;hd.classList.remove('tv-hdr-measure')}}
/* Where the pieces the walk-ins measure sit, at full size. */
function signature(){return fullSize(function(){var hd=hdr.hd,st=hd.querySelector('.tv-site-header__stage')||hd,o=st.getBoundingClientRect(),w=hd.querySelector('.tv-site-header__word');
 return [st,hd.querySelector('.tv-site-header__logo svg'),w,hd.querySelector('.hdr__r')].map(function(x){if(!x)return '';var r=x.getBoundingClientRect();return [r.left-o.left,r.top-o.top,r.width,r.height].map(function(n){return Math.round(n*2)/2}).join(',')}).join('|')+'|'+getComputedStyle(w).fontSize+'|'+getComputedStyle(w).fontFamily})}
/* The pages ship with the plain wordmark. Entrances that use the balance beam need the lettered one. */
function setWordmark(beam){var tmp=doc.createElement('div');tmp.innerHTML=T.headerHTML(0,beam?1:0,[]);var from=tmp.querySelector('.tv-site-header__word'),to=hdr.hd.querySelector('.tv-site-header__word');if(from&&to)to.innerHTML=from.innerHTML}
/* Clear whatever a walk-in left on the stage so a different one can be drawn. */
function clearStage(){if(hdr.inst&&hdr.inst.reset){try{hdr.inst.reset()}catch(e){}}
 var hd=hdr.hd;['.hdr__actor','.hdr__jump','.hdr__flip','.hdr__r'].forEach(function(s){var x=hd.querySelector(s);if(x){x.getAnimations().forEach(function(a){a.cancel()});x.removeAttribute('style')}});
 var f=hd.querySelector('.hdr__flip');if(f)f.innerHTML='';
 hd.querySelectorAll('.tv-site-header__word .L').forEach(function(x){x.getAnimations().forEach(function(a){a.cancel()});x.removeAttribute('style')})}
function useEntrance(e){if(hdr.e===e&&hdr.inst)return;if(hdr.inst)clearStage();hdr.e=e;setWordmark(e.beam);hdr.inst=e.make(hdr.hd)}
/* Draws the entrance's still ending: play it while matchMedia reports reduced motion. */
function drawStill(){var mm=window.matchMedia;hdr.liveUntil=0;hdr.moved=false;
 fullSize(function(){
  window.matchMedia=function(q){return /reduced-motion/.test(q)?fakeMM(q):mm.call(window,q)};
  try{hdr.inst.play()}catch(err){if(window.console)console.warn(err)}finally{window.matchMedia=mm}});
 hdr.sig=signature();hdr.drawn=true}
function drawLive(){hdr.moved=false;hdr.liveUntil=Date.now()+LIVE_MS;
 fullSize(function(){try{hdr.inst.play()}catch(err){if(window.console)console.warn(err);hdr.liveUntil=0}});
 hdr.sig=signature();hdr.drawn=true;
 setTimeout(function(){if(!hdr.liveUntil)return;hdr.liveUntil=0;if(hdr.moved||signature()!==hdr.sig)drawStill()},LIVE_MS)}
/* Something may have moved the header. Redraw the still ending if it did. A walk-in in flight finishes first, then snaps to the right place. */
function recheck(){if(!hdr.drawn)return;if(signature()===hdr.sig)return;if(hdr.liveUntil){hdr.moved=true;return}drawStill()}
var recheckQueued=false;function recheckSoon(){if(recheckQueued)return;recheckQueued=true;requestAnimationFrame(function(){recheckQueued=false;recheck()})}
function settled(maxMs,then){
 /* The wordmark's font in (or maxMs passed), then two frames so the layout is final. Images do not move the header, so they are not waited for. */
 var done=false,go=function(){if(done)return;done=true;requestAnimationFrame(function(){requestAnimationFrame(then)})};
 setTimeout(go,maxMs);wordFont().then(go,go)}
function wordFont(){var w=hdr.hd.querySelector('.tv-site-header__word'),ff=getComputedStyle(w);
 if(!doc.fonts||!doc.fonts.load)return Promise.resolve();
 return doc.fonts.load(ff.fontWeight+' '+ff.fontSize+' '+ff.fontFamily,'Tarver').then(function(){return doc.fonts.ready})}
function walkIn(){
 hdr.wrap=doc.querySelector('.tv-site--launch');hdr.hd=hdr.wrap&&hdr.wrap.querySelector('.tv-site-header');if(!hdr.hd)return;
 var live=false;
 if(page==='about'&&!visit.seenAbout){live=true;visit.seenAbout=true;visit.played=true}
 else if(!visit.played){live=true;visit.played=true}
 saveVisit();
 if(Tarver.siteHeader)Tarver.siteHeader.wire(hdr.wrap);
 useEntrance(wantedEntrance());
 if(live&&!T.RM()){
  /* A live walk-in waits for a settled page so it plays smoothly, and skips to its ending if the visitor is not looking. */
  settled(2500,function(){if(doc.hidden)drawStill();else drawLive()})
 }else{
  /* A still ending is drawn as soon as the wordmark's font is in, and corrected by recheck if anything moves later. */
  var once=false,draw=function(){if(once)return;once=true;drawStill()};
  setTimeout(draw,2500);wordFont().then(draw,draw);
 }
 /* keep it right afterwards. Height changes are the header shrinking on scroll, which the walk-ins already follow. */
 hdr.width=hdr.wrap.clientWidth;
 function widthChanged(){var w=hdr.wrap.clientWidth;if(w!==hdr.width){hdr.width=w;recheckSoon()}}
 window.addEventListener('resize',widthChanged);
 window.addEventListener('orientationchange',function(){setTimeout(recheck,300)});
 window.addEventListener('load',recheckSoon);
 if(doc.fonts){if(doc.fonts.ready)doc.fonts.ready.then(recheckSoon);if(doc.fonts.addEventListener)doc.fonts.addEventListener('loadingdone',recheckSoon)}
 if(window.ResizeObserver)new ResizeObserver(widthChanged).observe(hdr.wrap);
 /* Leaving the tab mid walk-in lets its timers drift, so come back to the finished picture. */
 doc.addEventListener('visibilitychange',function(){if(!hdr.drawn)return;if(doc.hidden){if(hdr.liveUntil)hdr.moved=true}else if(hdr.moved&&hdr.liveUntil){drawStill()}else recheckSoon()});
 /* Back or Forward can bring this page back exactly as it was left. Show what the visit calls for now. */
 window.addEventListener('pageshow',function(ev){if(!ev.persisted||!hdr.drawn)return;visit=loadVisit();useEntrance(wantedEntrance());drawStill()});
}

/* ---------- sticky header: keep jump links clear of it ---------- */
function anchorRoom(){var hd=doc.querySelector('.tv-site-header');if(!hd)return;
 /* A jump always lands with the header shrunk, so leave room for the shrunk height. */
 function set(){var h;
  if(hd.classList.contains('is-scrolled'))h=hd.offsetHeight;
  else{hd.classList.add('tv-hdr-measure','is-scrolled');h=hd.offsetHeight;hd.classList.remove('is-scrolled');void hd.offsetHeight;hd.classList.remove('tv-hdr-measure')}
  doc.documentElement.style.scrollPaddingTop=Math.ceil(h+8)+'px'}
 set();window.addEventListener('resize',set);if(doc.fonts&&doc.fonts.ready)doc.fonts.ready.then(set)}

/* ---------- Buy ----------
   The header and the Buy reaction always agree: the family in the header means Aaron and Rachel cheer,
   Aaron alone in the header means Aaron cheers alone. */
function wireBuy(){
 var pl=doc.querySelector('.tv-print');if(!pl)return;
 if(Tarver.printListing)Tarver.printListing.wire(pl);
 var b=pl.querySelector('.tv-print__buy');if(!b)return;
 var link=CONFIG.STRIPE_PAYMENT_LINK;
 if(link)b.setAttribute('href',withUtm(link));
 function reset(){b.__co=0;if(Tarver.printListing)Tarver.printListing.loading(b,false);var s=pl.querySelector('.tv-buyrx__stage');if(s)s.innerHTML=''}
 b.addEventListener('click',function(ev){
  if(link&&(ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey||ev.button>0))return; /* opening in a new tab: let the browser do it */
  ev.preventDefault();if(b.__co)return;b.__co=1;
  if(Tarver.printListing)Tarver.printListing.loading(b,true);
  var ms=0;try{ms=Tarver.buyReaction.play(b,familyShowing()?'family':'solo')}catch(err){}
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

/* ---------- Meta pixel: PageView on every page, Purchase on /thank-you/ only ---------- */
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
/* A browser may load a page ahead of the click (Edge and Chrome preloading). Hold the walk-in, and the visit's record of it, until the page is really shown. */
if(doc.prerendering)doc.addEventListener('prerenderingchange',walkIn,{once:true});else walkIn();
anchorRoom();
if(page==='home')wireBuy();
if(page==='about'&&Tarver.about)Tarver.about.wire(root);
if(page==='joined'&&Tarver.joined)Tarver.joined.wire(root);
if((page==='ship'||page==='privacy'||page==='terms')&&Tarver.policy){try{Tarver.policy.style(root)}catch(err){}}
doc.documentElement.classList.remove('tv-wait');
if(page==='thanks'&&Tarver.thanks)Tarver.thanks.all(root);
if(Tarver.join)Tarver.join.all(doc);
pixel();
})();
