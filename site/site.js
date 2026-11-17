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
function fakeMM(q){return {matches:true,media:q,onchange:null,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false}}}
/* Draws an entrance's still ending: play it while matchMedia reports reduced motion. */
function still(e,hd){var mm=window.matchMedia;window.matchMedia=function(q){return /reduced-motion/.test(q)?fakeMM(q):mm.call(window,q)};try{e.make(hd).play()}finally{window.matchMedia=mm}}
function walkIn(){
 var wrap=doc.querySelector('.tv-site--launch'),hd=wrap&&wrap.querySelector('.tv-site-header');if(!hd)return;
 var e=(page==='about'||visit.seenAbout)?entranceOf('D'):entranceOf(visit.key),live=false;
 if(page==='about'&&!visit.seenAbout){live=true;visit.seenAbout=true;visit.played=true}
 else if(!visit.played){live=true;visit.played=true}
 saveVisit();
 /* The pages ship with the plain wordmark. Entrances that use the balance beam need the lettered one. */
 if(e.beam){var tmp=doc.createElement('div');tmp.innerHTML=T.headerHTML(0,1,[]);var from=tmp.querySelector('.tv-site-header__word'),to=hd.querySelector('.tv-site-header__word');if(from&&to)to.innerHTML=from.innerHTML}
 if(Tarver.siteHeader)Tarver.siteHeader.wire(wrap);
 /* The walk-in measures the wordmark, so wait for its font (2.5 seconds at most) before drawing. */
 var done=false;function draw(){if(done)return;done=true;try{if(live&&!T.RM())e.make(hd).play();else still(e,hd)}catch(err){if(window.console)console.warn(err)}}
 var ff=getComputedStyle(hd.querySelector('.tv-site-header__word')||hd);
 if(doc.fonts&&doc.fonts.load){setTimeout(draw,2500);doc.fonts.load(ff.fontWeight+' '+ff.fontSize+' '+ff.fontFamily,'Tarver').then(draw,draw)}else draw();
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
