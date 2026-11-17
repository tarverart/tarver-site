/* ============================================================
   ABOUT PHOTO SETTINGS
   Swap the photo a few times a year by editing only this block.
   The photo is 4:3 landscape, about 1400 x 1050, in /images/.
   ============================================================ */
var ABOUT={
 photo:'/images/about-zion.jpg',
 alt:'Aaron and Rachel Tarver smiling in front of red cliffs in Springdale, Utah, at the edge of Zion National Park',
 greeting:'Greetings from Zion',
 stamp:'ZION',
 postmark:'SPRINGDALE UT',
 postDay:'MAY 14',
 postYear:'2026',
 place:'Springdale, Utah, at the edge of Zion',
 date:'May 14, 2026',
 blurb:'We’ve called Jacksonville, Florida home almost our entire lives. Aaron is a Development Manager with a finance and engineering background who loves turning data into art. Rachel works in commercial real estate as an Account Specialist and turns art into meaning. Together we travel the world and make art inspired by the places we’ve been.',
 email:'hello@tarverart.com'
};
/* ===================== end of settings ===================== */

/* The page ships with the About markup already built from the block above (node build/build.mjs).
   If the block has been edited since the last build, redraw it here so the edit shows right away. */
(function(){
 function key(o){var s=JSON.stringify(o),h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return String(h)}
 var root=document.querySelector('[data-about]');
 if(root&&window.Tarver&&Tarver.about&&root.getAttribute('data-about')!==key(ABOUT)){root.innerHTML=Tarver.about.html(ABOUT);root.setAttribute('data-about',key(ABOUT))}
})();
