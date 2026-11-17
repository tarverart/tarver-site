/* @ds-bundle: {"format":4,"namespace":"Tarver","components":[]} */
/* Tarver runtime helpers. Load after bundle.css. Charts and moments in the cards use these; apps can too. */
window.Tarver = (function () {
  var cv = null;
  function measure(text, font) {
    cv = cv || document.createElement('canvas').getContext('2d');
    cv.font = font || '700 13px Figtree, system-ui, sans-serif';
    return cv.measureText(text).width;
  }
  /* Bar segments that print a label when it fits and otherwise get the sticker lift.
     Mark each segment with data-fit, data-name and its label text; call fitLabels(root) after layout and on resize. */
  function fitLabels(root) {
    (root || document).querySelectorAll('[data-fit]').forEach(function (seg) {
      var label = seg.getAttribute('data-label') || seg.textContent.trim();
      var name = seg.getAttribute('data-name') || '';
      seg.setAttribute('data-label', label);
      var fits = measure(label, getComputedStyle(seg).font) + 16 <= seg.clientWidth;
      seg.onclick = seg.onkeydown = null;
      if (fits) {
        seg.classList.remove('tv-lift');
        seg.removeAttribute('role'); seg.removeAttribute('tabindex'); seg.removeAttribute('aria-pressed');
        seg.textContent = label;
        return;
      }
      seg.classList.add('tv-lift');
      seg.setAttribute('role', 'button');
      seg.setAttribute('tabindex', '0');
      seg.setAttribute('aria-label', (name ? name + ' ' : '') + label);
      if (!seg.hasAttribute('aria-pressed')) seg.setAttribute('aria-pressed', 'false');
      var show = function () {
        var on = seg.getAttribute('aria-pressed') === 'true';
        seg.innerHTML = on ? '<span class="tv-reveal">' + (name ? name + ' ' : '') + label + '</span>' : '';
      };
      var toggle = function () { seg.setAttribute('aria-pressed', seg.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); show(); };
      seg.onclick = toggle;
      seg.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
      show();
    });
  }
  /* Draw now, again once fonts load, and again only when the width changes. Redrawing on height changes would loop. */
  function watch(el, fn) {
    var last = -1;
    var go = function (force) { var w = el.clientWidth; if (!force && w === last) return; last = w; fn(el, w); };
    go(true);
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { go(true); });
    if (window.ResizeObserver) new ResizeObserver(function () { requestAnimationFrame(function () { go(); }); }).observe(el);
  }
  return { measure: measure, fitLabels: fitLabels, watch: watch };
})();

/* Tarver characters: the cast, the renderer, Aaron and Rachel's moves and the header walk-ins. Tarver.characters.svgOf(char, view) draws any character; views: front, tq, side, rq, back, top, plus lie (beach goers), surf (surfers), stand (lifeguards). */
window.Tarver.characters=(function(){
const C={ink:'#1f1a14',cream:'#fbf6ec',card:'#fffdf8',brand:'#c2410c',brandD:'#9a3412',sun:'#f5b82e',sunD:'#d99a17',teal:'#0b6b73',tealD:'#084f55',crimson:'#a61b3b',plum:'#7a2e6b',blue:'#1f5fa8',navy:'#1d3557',white:'#ffffff',s2:'#f3ebdb',
 brown:'#8a5a3b',brownL:'#c9a27e',antler:'#e2c79a',pink:'#f2a3a0',cheek:'#f4a58a',eyeB:'#4f9fd1',khaki:'#c8b48a',denim:'#2f4a6d',
 sk1:'#f3cba5',sk2:'#dba67a',sk3:'#b47a52',sk4:'#7a4a2c',hairBr:'#5c3a1e',hairDk:'#2b211a',hairSun:'#e0b25a',hairGr:'#d8d2c8',sk5:'#e0b48f',sk6:'#5b3722',hairRed:'#a4502a',hairBlk:'#1c1714',hairAsh:'#8b8178',hairWh:'#ece8e0',hairAub:'#6e2f1f',guard:'#d8392b',guardD:'#a8261b',olive:'#5e6b45',oliveD:'#46512f',sand:'#e8d6b0',coral:'#ef7d64',sky:'#7cc0dd',mint:'#9fd3c0',lilac:'#b49ac9'};
const col=k=>C[k]||k;
let UID=0;const uid=()=>'k'+(++UID);
const r1=n=>Math.round(n*10)/10;

function polyRound(P,r){const n=P.length;let d='';for(let i=0;i<n;i++){const p=P[i],a=P[(i-1+n)%n],b=P[(i+1)%n];
 const v1=[a[0]-p[0],a[1]-p[1]],v2=[b[0]-p[0],b[1]-p[1]],l1=Math.hypot(...v1),l2=Math.hypot(...v2),ang=Math.acos((v1[0]*v2[0]+v1[1]*v2[1])/(l1*l2)),t=Math.min(r/Math.tan(ang/2),l1/2,l2/2),rr=t*Math.tan(ang/2);
 const s1=[p[0]+v1[0]/l1*t,p[1]+v1[1]/l1*t],s2=[p[0]+v2[0]/l2*t,p[1]+v2[1]/l2*t],cw=(v1[0]*v2[1]-v1[1]*v2[0])<0?1:0;
 d+=(i?'L':'M')+r1(s1[0])+','+r1(s1[1])+` A${r1(rr)} ${r1(rr)} 0 0 ${cw} `+r1(s2[0])+','+r1(s2[1])+' '}return d+'Z'}


let PAWN_E=.1,HG_N=.23;
function pawnSide(cx,y0,B,n,a,R,e,d){d=d||[.87,.49];const ctr=[cx+a-R,B-R],P=[ctr[0]+R*d[1],ctr[1]-R*d[0]],
 c1=[cx+n,y0+(P[1]-y0)*Math.max(0,.58-2.47*e)],L=(P[0]-cx-n)*.68,c2=[P[0]-d[0]*L,P[1]-d[1]*L];return {c1,c2,P,bot:[ctr[0],B]}}
const mx=(cx,p)=>[2*cx-p[0],p[1]],my=(m,p)=>[p[0],2*m-p[1]],pt=p=>r1(p[0])+','+r1(p[1]);
function pawnD(cx,top,w,h,e){e=e==null?PAWN_E:e;const R=Math.min(.11*w,.09*h),S=pawnSide(cx,top+R,top+h,R,w/2,R,e),A=`A${r1(R)} ${r1(R)} 0 0 1 `;
 return `M${pt([cx-R,top+R])} ${A}${pt([cx+R,top+R])} C${pt(S.c1)} ${pt(S.c2)} ${pt(S.P)} ${A}${pt(S.bot)} L${pt(mx(cx,S.bot))} ${A}${pt(mx(cx,S.P))} C${pt(mx(cx,S.c2))} ${pt(mx(cx,S.c1))} ${pt([cx-R,top+R])} Z`}

function triOldD(cx,top,w,h){return polyRound([[cx,top],[cx+w*.5,top+h],[cx-w*.5,top+h]],Math.min(w,h)*.17)}

function domeD(cx,base,w,h){const l=cx-w/2,r=cx+w/2,k=h*.34;return `M${r1(l+k)},${r1(base)} L${r1(r-k)},${r1(base)} Q${r1(r)},${r1(base)} ${r1(r)},${r1(base-k)} A${r1(w/2)} ${r1(h-k)} 0 0 0 ${r1(l)},${r1(base-k)} Q${r1(l)},${r1(base)} ${r1(l+k)},${r1(base)} Z`}

function dropD(cx,top,w,h){const R=w/2,cy=top+h-R,r=Math.max(.7,w*.1),vx=.55*R,vy=.32*h,vl=Math.hypot(vx,vy),dx=vx/vl,dy=vy/vl,p0=[cx+dy*r,top+r-dx*r],o=[cx+.55*R,top+.32*h],L1=Math.hypot(o[0]-p0[0],o[1]-p0[1]),c1=[p0[0]+dx*L1,p0[1]+dy*L1],c2=[cx+R,cy-R*.75],p2=[cx+R,cy],P=p=>r1(p[0])+','+r1(p[1]),m=p=>r1(2*cx-p[0])+','+r1(p[1]);return `M${m(p0)} A${r1(r)} ${r1(r)} 0 0 1 ${P(p0)} C${P(c1)} ${P(c2)} ${P(p2)} A${r1(R)} ${r1(R)} 0 0 1 ${m(p2)} C${m(c2)} ${m(c1)} ${m(p0)} Z`}
/* interface shapes: the pawn head is the arrow (head height .64 of its width, shaft 29.4% of the head width), the drop tip-down is the pin */
function rotD(d,deg,cx,cy){if(!deg)return d;const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),R=(x,y)=>[r1(cx+(x-cx)*c-(y-cy)*s),r1(cy+(x-cx)*s+(y-cy)*c)],t=d.match(/[A-Za-z]|-?\d*\.?\d+/g),n={M:2,L:2,C:6,Q:4,A:7};let o='',i=0,cmd='';while(i<t.length){if(/[A-Za-z]/.test(t[i])){cmd=t[i++];o+=cmd;if(cmd==='Z')o+=' ';continue}const k=n[cmd],v=t.slice(i,i+k).map(Number);i+=k;if(cmd==='A'){const p=R(v[5],v[6]);o+=`${v[0]} ${v[1]} 0 ${v[3]} ${v[4]} ${p[0]},${p[1]} `}else{for(let j=0;j<k;j+=2){const p=R(v[j],v[j+1]);o+=p[0]+','+p[1]+' '}}}return o.trim()}
const DIRS={up:0,right:90,down:180,left:270};
function pillD(x,y,w,h){const r=w/2;return `M${r1(x)},${r1(y+r)} A${r1(r)} ${r1(r)} 0 0 1 ${r1(x+w)},${r1(y+r)} L${r1(x+w)},${r1(y+h-r)} A${r1(r)} ${r1(r)} 0 0 1 ${r1(x)},${r1(y+h-r)} Z`}
function headD(cx,cy,w,dir){const h=w*.64;return rotD(pawnD(cx,cy-h/2,w,h,.1),DIRS[dir]!=null?DIRS[dir]:(dir||0),cx,cy)}
function arrowD(cx,cy,len,w,dir){const hh=w*.64,sh=w*.42*.7,top=cy-len/2;return rotD(pawnD(cx,top,w,hh,.1)+' '+pillD(cx-sh/2,top+hh-1.4,sh,len-hh+1.4),DIRS[dir]!=null?DIRS[dir]:(dir||0),cx,cy)}
function pinD(cx,top,w,h){return rotD(dropD(cx,top,w,h),180,cx,top+h/2)}

function hourD(cx,top,w,h,waist,hip){const a=w/2,m=(waist||.52)*w/2,b=(hip||1.06)*w/2,k=Math.min(w,h)*.18,y2=top+h;
 return `M${r1(cx-a+k)},${r1(top)} L${r1(cx+a-k)},${r1(top)} Q${r1(cx+a)},${r1(top)} ${r1(cx+a)},${r1(top+k)} Q${r1(cx+m)},${r1(top+h*.5)} ${r1(cx+b)},${r1(y2-k)} Q${r1(cx+b)},${r1(y2)} ${r1(cx+b-k)},${r1(y2)} L${r1(cx-b+k)},${r1(y2)} Q${r1(cx-b)},${r1(y2)} ${r1(cx-b)},${r1(y2-k)} Q${r1(cx-m)},${r1(top+h*.5)} ${r1(cx-a)},${r1(top+k)} Q${r1(cx-a)},${r1(top)} ${r1(cx-a+k)},${r1(top)} Z`}


function twinD(cx,top,w,h,n,hip,j,e){n=(n||.2)*w;j=(j==null?.06:j)*h;e=e==null?.1:e;const R=.12*w,mid=top+h*.5,aS=w*.5*.92,aH=w*.5*(hip||1.06),A=`A${r1(R)} ${r1(R)} 0 0 1 `;
 const Lo=pawnSide(cx,mid+j/2,top+h,n,aH,R,e),Up0=pawnSide(cx,mid+j/2,2*mid-top,n,aS,R,e),U={c1:my(mid,Up0.c1),c2:my(mid,Up0.c2),P:my(mid,Up0.P),bot:my(mid,Up0.bot)};
 return `M${pt(mx(cx,U.bot))} L${pt(U.bot)} ${A}${pt(U.P)} C${pt(U.c2)} ${pt(U.c1)} ${pt([cx+n,mid-j/2])} L${pt([cx+n,mid+j/2])} C${pt(Lo.c1)} ${pt(Lo.c2)} ${pt(Lo.P)} ${A}${pt(Lo.bot)} L${pt(mx(cx,Lo.bot))} ${A}${pt(mx(cx,Lo.P))} C${pt(mx(cx,Lo.c2))} ${pt(mx(cx,Lo.c1))} ${pt([cx-n,mid+j/2])} L${pt([cx-n,mid-j/2])} C${pt(mx(cx,U.c1))} ${pt(mx(cx,U.c2))} ${pt(mx(cx,U.P))} ${A}${pt(mx(cx,U.bot))} Z`}

function tulipD(cx,top,w,h,waist){const x=v=>r1(cx+v*w),y=v=>r1(top+v*h),m=(waist||.2);
 return `M${x(-.26)},${y(0)} L${x(.26)},${y(0)} Q${x(.5)},${y(0)} ${x(.5)},${y(.16)} C${x(.5)},${y(.3)} ${x(m)},${y(.36)} ${x(m)},${y(.5)} C${x(m)},${y(.66)} ${x(.47)},${y(.8)} ${x(.53)},${y(.9)} Q${x(.58)},${y(1)} ${x(.42)},${y(1)} L${x(-.42)},${y(1)} Q${x(-.58)},${y(1)} ${x(-.53)},${y(.9)} C${x(-.47)},${y(.8)} ${x(-m)},${y(.66)} ${x(-m)},${y(.5)} C${x(-m)},${y(.36)} ${x(-.5)},${y(.3)} ${x(-.5)},${y(.16)} Q${x(-.5)},${y(0)} ${x(-.26)},${y(0)} Z`}

function pinchD(cx,top,w,h,depth){const a=w/2,ym=top+h/2,y2=top+h,r=w*.34,d=r-(depth||.2)*w,dy=Math.sqrt(r*r-d*d);
 return `M${r1(cx+a)},${r1(top+a)} L${r1(cx+a)},${r1(ym-dy)} A${r1(r)} ${r1(r)} 0 0 0 ${r1(cx+a)},${r1(ym+dy)} L${r1(cx+a)},${r1(y2-a)} A${r1(a)} ${r1(a)} 0 0 1 ${r1(cx-a)},${r1(y2-a)} L${r1(cx-a)},${r1(ym+dy)} A${r1(r)} ${r1(r)} 0 0 0 ${r1(cx-a)},${r1(ym-dy)} L${r1(cx-a)},${r1(top+a)} A${r1(a)} ${r1(a)} 0 0 1 ${r1(cx+a)},${r1(top+a)} Z`}
function hourVariant(hv,cx,top,w,h,side){const hn=hv&&hv.indexOf(':')>0?parseFloat(hv.split(':')[1]):HG_N;if(hv)hv=hv.split(':')[0];if(hv==='twin')return twinD(cx,top,w*(side?1:1.2),h,(side?.3:hn),1.08);if(hv==='tulip')return tulipD(cx,top,w,h,side?.3:.22);if(hv==='pinch')return pinchD(cx,top,w,h,side?.12:.2);return hourD(cx,top,w,h,side?.74:.58,side?1.12:1.16)}

function T(o,cx,cy){return o&&o.rot?` transform="rotate(${o.rot} ${r1(cx)} ${r1(cy)})"`:''}
function A(o){return (o&&o.cls?` class="${o.cls}"`:'')+(o&&o.op!=null?` opacity="${o.op}"`:'')+(o&&o.clip?` clip-path="url(#${o.clip})"`:'')}
function shade(geom,bx,by,bw,bh){const id=uid();return `<clipPath id="${id}">${geom}</clipPath><rect x="${r1(bx)}" y="${r1(by)}" width="${r1(bw)}" height="${r1(bh)}" fill="url(#tvShade)" clip-path="url(#${id})"/>`}
const c=(cx,cy,r,f,o={})=>{const g=`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}"`;return g+` fill="${col(f)}"${A(o)}/>`+(o.sh?shade(g+'/>',cx-r,cy-r,2*r,2*r):'')};
const e=(cx,cy,rx,ry,f,o={})=>{const g=`<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}"${T(o,cx,cy)}`;return g+` fill="${col(f)}"${A(o)}/>`+(o.sh&&!o.rot?shade(g+'/>',cx-rx,cy-ry,2*rx,2*ry):'')};
const rr=(x,y,w,h,rx,f,o={})=>{const g=`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(rx)}"${T(o,x+w/2,y+h/2)}`;return g+` fill="${col(f)}"${A(o)}/>`+(o.sh&&!o.rot?shade(g+'/>',x,y,w,h):'')};
const pl=(x,y,w,h,f,o={})=>rr(x,y,w,h,Math.min(w,h)/2,f,o);
const pw=(cx,top,w,h,f,o={})=>{const g=`<path d="${pawnD(cx,top,w,h,o.e)}"${T(o,cx,top+h/2)}`;return g+` fill="${col(f)}"${A(o)}/>`+(o.sh&&!o.rot?shade(g+'/>',cx-w*.55,top,w*1.1,h):'')};
const ln=(x1,y1,x2,y2,w,f,o={})=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col(f)}" stroke-width="${w}" stroke-linecap="round"${A(o)}/>`;
const ring=(cx,cy,r,w,f,dash)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col(f)}" stroke-width="${w}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const G=(cls,ox,oy,inner)=>`<g class="${cls}" style="transform-origin:${ox}px ${oy}px">${inner}</g>`;
function clipRect(x,y,w,h,inner){const id=uid();return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`}
const ground=(cx,w)=>e(cx,191,w,4.5,'ink',{op:.13});

const BG={
 rect:{front:()=>[40,52,40,60],sh:[[44.5,58],[75.5,58]],arm:8,legs:[47,61],lw:12},
 ell:{sh:[[38,66],[82,66]],arm:22,legs:[45,63],lw:12.5},
 pill:{sh:[[48,58],[72,58]],arm:6,legs:[48.5,60],lw:11.5},
 pawn:{sh:[[51,62],[69,62]],arm:13,legs:[51,59],lw:10},
 hour:{sh:[[46,58],[74,58]],arm:9,legs:[48,60.5],lw:11.5},
 pillw:{sh:[[45,58],[75,58]],arm:14,legs:[46,62],lw:12,shw:20.5},
 rects:{w:34,rt:10,sh:[[46.5,58],[73.5,58]],arm:7,legs:[47.5,61.5],lw:11,shw:17,slim:1},
 rects36:{w:36,rt:5.5,sh:[[46,58],[74,58]],arm:7,legs:[47.5,61.5],lw:11,shw:18,slim:1},
 rects38:{w:38,rt:5,sh:[[45,58],[75,58]],arm:7,legs:[47.5,61.5],lw:11,shw:19,slim:1},
 rects40:{w:40,rt:6,sh:[[44,58],[76,58]],arm:8,legs:[47,62],lw:11.5,shw:20,slim:1},
 rectsE:{w:40,rt:7,sh:[[44,58],[76,58]],arm:16,legs:[46,61.5],lw:12.5,shw:20,slim:1,belly:1},
 rectsf:{sh:[[44.5,58],[75.5,58]],arm:9,legs:[48.5,60],lw:11.5}
};
const pth=(d,f,o={})=>`<path d="${d}" fill="${col(f)}"${A(o)}/>`;
function torsoFront(b,f,hv,pe){if(b==='pillw')return rr(45,52,30,62,15,f,{sh:1});if(b==='rects')return rr(44,52,32,60,10,f,{sh:1});if(b==='hour'){const d=hourVariant(hv,60,50,hv==='pinch'?32:36,68);return pth(d,f)+shade(`<path d="${d}"/>`,36,50,48,68)}if(b==='rect')return rr(40,52,40,60,12,f,{sh:1});if(b==='ell')return e(60,85,28,33,f,{sh:1});if(b==='pill')return rr(45,52,30,62,15,f,{sh:1});return pw(60,44,68,110,f,{sh:1,e:pe})}
function torsoSide(b,f,hv,pe){if(b==='pillw')return rr(49,52,22,62,11,f,{sh:1});if(b==='rects')return rr(48,52,24,60,9,f,{sh:1});if(b==='hour'){const d=hourVariant(hv,60,50,24,64,1);return pth(d,f)+shade(`<path d="${d}"/>`,44,50,32,64)}if(b==='rect')return rr(47,52,26,60,11,f,{sh:1});if(b==='ell')return e(63,85,22,33,f,{sh:1});if(b==='pill')return rr(49,52,22,62,11,f,{sh:1});return pw(60,44,54,110,f,{sh:1,e:pe})}
function torsoTop(b,f){if(b==='pillw')return rr(42,92,36,16,8,f,{sh:1});if(CUSTOM[b]){const w=(BG[b].w||34)+4;return (BG[b].belly?e(60,103,28,13,f,{sh:1}):'')+rr(60-w/2,92,w,16,8,f,{sh:1})}if(b==='hour')return rr(42,92,36,16,8,f,{sh:1});if(b==='rect')return rr(36,90,48,21,10,f,{sh:1});if(b==='ell')return e(60,100,29,19,f,{sh:1});if(b==='pill')return rr(42,92,36,16,8,f,{sh:1});return c(60,106,27,f,{sh:1})+rr(46,92,28,14,7,f)}

function armMuscle(P,ax,ay,aw,sl,out,topc){const m=P.arms||1;if(m<=1||P.body==='pillw'||sl==='long')return '';const t=Math.min(1,(m-1)/.3),skin=col(P.skin),op=r1(.1+.07*t),ln=d=>`<path d="${d}" fill="none" stroke="#1f1a14" stroke-opacity="${op}" stroke-width="1.1" stroke-linecap="round"/>`;let s='';
 if(sl==='none'){s+=e(ax+out*(aw/2-1.4),ay+13,2+1.8*t,7.6,skin)+ln(`M${r1(ax+out*aw*.08)},${ay+7} Q${r1(ax+out*aw*.34)},${ay+14.5} ${r1(ax+out*aw*.06)},${ay+22}`)+ln(`M${r1(ax-out*aw*.3)},${ay+23.5} Q${r1(ax)},${ay+25.5} ${r1(ax+out*aw*.3)},${ay+23.5}`);}
 else s+=e(ax+out*(aw/2-.6),ay+9,1.2+1.4*t,6,topc);
 s+=ln(`M${r1(ax-out*aw*.12)},${ay+28} Q${r1(ax-out*aw*.34)},${ay+34} ${r1(ax-out*aw*.16)},${ay+41}`);
 return s}

function armFront(P,side,far){if(P.noArms)return '';const g=BG[P.body],[ax,ay]=(P._sh||g.sh)[side],ao=side?(P.armOutR!=null?P.armOutR:(P.armOut||0)):(P.armOutL!=null?P.armOutL:(P.armOut||0)),rot=side?-(g.arm+ao):(g.arm+ao),L=P.body==='ell'?48:52,nm=side?'p-armR':'p-armL';
 const skin=col(P.skin),sl=P.sleeve||'short',topc=col(P.armc||P.top),m=P.arms||1;
 let s=pl(ax-5*m,ay-5,10*m,L,sl==='long'?topc:skin,{rot:0});
 if(sl==='short')s+=pl(ax-5.5*m,ay-5,11*m,20,topc);
 if(sl==='long'&&P.cuffs)s+=rr(ax-5.2*m,ay+L-16,10.4*m,5.5,2.5,P.cuffs);
 s+=armMuscle(P,ax,ay,10*m,sl,side?1:-1,topc);
 const hand=c(ax,ay+L-6,5.6*(1+(m-1)*.45),P.hands||P.skin);
 return G(nm,ax,ay,`<g transform="rotate(${rot} ${ax} ${ay})"${far?' style="filter:brightness(.84)"':''}>${s}${hand}</g>`)}

function legXY(g,tq){return tq===2?[g.legs[0]+1,g.legs[1]-3]:tq?[g.legs[0]+3,g.legs[1]-1]:g.legs}
function legsFront(P,back,tq){const g=BG[P.body],w=g.lw,top=P.body==='pawn'?140:104,h=184-top;let out='';const [l1,l2]=legXY(g,tq);
 (tq===2?[[l1,0],[l2,1]]:tq?[[l2,1],[l1,0]]:[[l1,0],[l2,1]]).forEach(([x,i])=>{let s='';const fab=P.legType==='pants'&&CUSTOM[P.body],fp=g.slim?.4:.8;s+=fab?pl(x-fp,top,w+fp*2,h,P.bottom):pl(x,top,w,h,P.legType==='pants'||P.legType==='full'?P.bottom:(P.legc||P.skin));
  if(P.shorts){const sp=g.slim?1:1.8;s+=rr(x-sp,top,w+sp*2,P.body==='pillw'?24:27,g.slim?5:6,P.bottom);}
  if(P.legType==='shorts')s+=rr(x-1,top,w+2,30,5,P.bottom);
  if(P.stripes)for(let k=0;k<4;k++)s+=rr(x,top+10+k*11,w,4.5,2,P.stripes);
  if(P.cuff&&P.legType==='pants')s+=rr(x-.8,166,w+1.6,7,3,P.cuff);
  if(P.boots)s+=rr(x-.6,163,w+1.2,20,3.5,P.boots);
  s+=tq?pl(x-1,178,w+6,10,P.shoes)+(P.curl?c(x+w+5,177,3,P.shoes):''):pl(x+(i?-1:-4),178,w+5,10,P.shoes)+(P.curl?c(i?x+w+3:x-4,177,3,P.shoes):'');if(P.sandal)s+=tq?rr(x-1.4,185.6,w+6.8,2.8,1.4,P.sandal):rr(x+(i?-1.4:-4.4),185.6,w+5.8,2.8,1.4,P.sandal)+rr(x+(i?1:-1),181.5,w-1,2,1,P.sandal,{op:.9});
  if(tq&&(tq===2?!i:i))s=`<g style="filter:brightness(.84)">${s}</g>`;out+=G(i?'p-legR':'p-legL',x+w/2,top+3,s)});
 if((P.legType==='shorts'||P.legType==='pants')&&!CUSTOM[P.body])out+=rr(l1,top,l2-l1+w,14,5,P.bottom);
 return out}

function hairBehindFront(P){const h=P.hair,hs=P.hairStyle;if(hs==='long')return rr(42,20,36,62,15,h);if(hs==='bun')return c(60,13,7.5,h);return ''}
function headFront(P){if(P.pumpkin)return pumpkinView('front');
 const hs=P.hairStyle,h=P.hair;let s='';
 if(hs&&hs!=='none')s+=c(60,31,16.6,h);
 s+=rr(55,42,10,13,4,P.skin)+c(60,32,15,P.skin,{sh:1});
 if(hs&&hs!=='none'){s+=clipRect(40,8,40,hs==='messy'?18:19,c(60,31,16.6,h));
  if(hs==='short'||hs==='messy')s+=rr(44,24,4.5,9,2,h)+rr(71.5,24,4.5,9,2,h);
  if(hs==='long'||hs==='bun')s+=rr(43.5,24,6,26,3,h)+rr(70.5,24,6,26,3,h);
  if(hs==='messy')s+=c(47,20,5,h)+c(55,15.5,6,h)+c(65,15.5,6,h)+c(73,20,5,h)+c(60,14,5,h);
  if(hs==='short')s+=pl(50,16,22,8,h,{rot:-10});}
 if(!P.noFace)s+=G('p-eyes',60,33,P.sleep?`<path d="M52.3,33.2 Q54.5,35.2 56.7,33.2 M63.3,33.2 Q65.5,35.2 67.7,33.2" fill="none" stroke="#1f1a14" stroke-width="1.3" stroke-linecap="round"/>`:c(54.5,33,1.9,'ink',{cls:'eL'})+c(65.5,33,1.9,'ink',{cls:'eR'}))+c(51,38.5,3,'cheek',{op:.35})+c(69,38.5,3,'cheek',{op:.35})+G('p-mouth',60,40.5,rr(57.6,39.6,4.8,1.7,.85,'ink',{op:.5}));
 return s}

function headTQ(P){const hs=P.hairStyle,h=P.hair;let s='';
 if(hs&&hs!=='none')s+=c(59,31,16.6,h);
 s+=rr(55,42,10,13,4,P.skin)+c(60,32,15,P.skin,{sh:1});
 if(hs&&hs!=='none'){s+=clipRect(40,8,40,hs==='messy'?18:19,c(59,31,16.6,h))+clipRect(40,8,10,30,c(59,31,16.6,h));
  if(hs==='short'||hs==='messy')s+=rr(73,24,3.5,8,1.75,h);
  if(hs==='long'||hs==='bun')s+=rr(42,22,8,30,4,h)+rr(72,24,4.5,24,2.25,h);
  if(hs==='messy')s+=c(47,20,5,h)+c(55,15.5,6,h)+c(65,15.5,6,h)+c(73,20,5,h)+c(60,14,5,h);
  if(hs==='short')s+=pl(52,16,22,8,h,{rot:-10});}
 if(hs!=='long')s+=c(47.6,36.5,2.7,P.skin);
 if(!P.noFace)s+=G('p-eyes',63.5,33,c(58.5,33,1.9,'ink',{cls:'eL'})+e(68.6,33,1.45,1.9,'ink',{cls:'eR'}))+c(55,38.5,3,'cheek',{op:.35})+e(71.2,38.5,2,2.8,'cheek',{op:.3})+G('p-mouth',64,40.5,rr(61.6,39.6,4.8,1.7,.85,'ink',{op:.5}));
 return s}

function flareDownD(cx,y0,B,n,a,R){R=R||Math.min(.32*a,(B-y0)*.24);const S=pawnSide(cx,y0,B,n,a,R,.1),A=`A${r1(R)} ${r1(R)} 0 0 1 `;
 return `M${pt([cx-n,y0])} L${pt([cx+n,y0])} C${pt(S.c1)} ${pt(S.c2)} ${pt(S.P)} ${A}${pt(S.bot)} L${pt(mx(cx,S.bot))} ${A}${pt(mx(cx,S.P))} C${pt(mx(cx,S.c2))} ${pt(mx(cx,S.c1))} ${pt([cx-n,y0])} Z`}
function flareUpD(cx,y0,T,n,a,R){R=R||Math.min(.32*a,(y0-T)*.24);const S=pawnSide(cx,y0,2*y0-T,n,a,R,.1),m=p=>my(y0,p),A=`A${r1(R)} ${r1(R)} 0 0 0 `;
 return `M${pt([cx-n,y0])} L${pt([cx+n,y0])} C${pt(m(S.c1))} ${pt(m(S.c2))} ${pt(m(S.P))} ${A}${pt(m(S.bot))} L${pt(mx(cx,m(S.bot)))} ${A}${pt(mx(cx,m(S.P)))} C${pt(mx(cx,m(S.c2)))} ${pt(mx(cx,m(S.c1)))} ${pt([cx-n,y0])} Z`}

function shouldersW(P,v){if(!P.shoulders||v==='top'||(P.sleeve&&P.sleeve!=='none'))return '';if(v==='side')return G('p-cap',60,60,e(60.5,57.6,7.2,6.4,P.top)+shade(e(60.5,57.6,7.2,6.4,'#000'),53,51,15,13));const k=VK(v),cx=VX(v),d=flareUpD(cx,WAIST,52,12.5*k,20.5*k,6*k);return G('p-cap',cx,60,pth(d,P.top)+shade(`<path d="${d}"/>`,cx-24,52,48,32))}


const WAIST=84;
function femTorsoD(cx,k,wk,hk){const n=12.5*k*(wk||1),hip=16.2*k*(hk||1),w=WAIST;
 return [flareUpD(cx,w,52,n,20.5*k,6*k),`M${pt([cx-n,w-1.2])} L${pt([cx+n,w-1.2])} C${pt([cx+n,w+8])} ${pt([cx+hip,w+10])} ${pt([cx+hip,w+19])} C${pt([cx+hip,w+25.5])} ${pt([cx+hip*.52,w+29])} ${pt([cx,w+29])} C${pt([cx-hip*.52,w+29])} ${pt([cx-hip,w+25.5])} ${pt([cx-hip,w+19])} C${pt([cx-hip,w+10])} ${pt([cx-n,w+8])} ${pt([cx-n,w-1.2])} Z`]}

const menShouldersD=(cx,k)=>flareUpD(cx,82,52,15.5*k,22.5*k,4.5*k);

function blockD(cx,y0,y1,top,hip,hipY,r,rx){const A=`A${r1(rx)} ${r1(rx)} 0 0 1 `;let d=`M${pt([cx-top,y0])} L${pt([cx+top,y0])} `;
 d+=hip>top+.3?`C${pt([cx+top,y0+(hipY-y0)*.45])} ${pt([cx+hip,y0+(hipY-y0)*.55])} ${pt([cx+hip,hipY])} `:'';
 d+=`L${pt([cx+hip,y1-rx])} ${A}${pt([cx+hip-rx,y1])} L${pt([cx+r,y1])} A${r1(r)} ${r1(r)} 0 0 0 ${pt([cx-r,y1])} L${pt([cx-hip+rx,y1])} ${A}${pt([cx-hip,y1-rx])} L${pt([cx-hip,hipY])} `;
 d+=hip>top+.3?`C${pt([cx-hip,y0+(hipY-y0)*.55])} ${pt([cx-top,y0+(hipY-y0)*.45])} ${pt([cx-top,y0])} `:'';return d+'Z'}

function pantsD(cx,y0,top,hip,hipY,leg,y1,r){const h1=hipY-y0,h2=y1-hipY;let d=`M${pt([cx-top,y0])} L${pt([cx+top,y0])} `;
 d+=hip>top+.3?`C${pt([cx+top,y0+h1*.45])} ${pt([cx+hip,y0+h1*.55])} ${pt([cx+hip,hipY])} `:`L${pt([cx+hip,hipY])} `;
 d+=`C${pt([cx+hip,hipY+h2*.55])} ${pt([cx+leg,y1-h2*.3])} ${pt([cx+leg,y1])} L${pt([cx+r,y1])} A${r1(r)} ${r1(r)} 0 0 0 ${pt([cx-r,y1])} L${pt([cx-leg,y1])} C${pt([cx-leg,y1-h2*.3])} ${pt([cx-hip,hipY+h2*.55])} ${pt([cx-hip,hipY])} `;
 d+=hip>top+.3?`C${pt([cx-hip,y0+h1*.55])} ${pt([cx-top,y0+h1*.45])} ${pt([cx-top,y0])} `:`L${pt([cx-top,y0])} `;return d+'Z'}

const seatX=(wk,hk,se)=>7.4*(wk||1)+(11*(hk||1)-7.4)*(se||1);
function femSideD(cx,wk,hk,bu,se){const b=(wk||1),hh=(hk||1),bx=cx+8.6+2.6*(bu||1),yb=((bu||1)-1)*1.6,sb=seatX(wk,hk,se),sy=((se||1)-1)*1.4;return `M${pt([cx-6,52])} L${pt([cx+5,52])} C${pt([cx+8,52])} ${pt([cx+8.6,56])} ${pt([cx+8.6,60])} C${pt([cx+8.6,64])} ${pt([bx,66+yb*.5])} ${pt([bx,70+yb])} C${pt([bx,75+yb])} ${pt([cx+7.6*b,78+yb*.5])} ${pt([cx+7.6*b,84])} C${pt([cx+7.6*b,92])} ${pt([cx+7.9,97])} ${pt([cx+7.9,103])} C${pt([cx+7.9,109])} ${pt([cx+4,113])} ${pt([cx,113])} C${pt([cx-6-sy,113])} ${pt([cx-sb,109])} ${pt([cx-sb,101])} C${pt([cx-sb,94-sy])} ${pt([cx-7.4*b,91])} ${pt([cx-7.4*b,84])} C${pt([cx-7.4*b,74])} ${pt([cx-8.6,62])} ${pt([cx-8.6,57])} C${pt([cx-8.6,54])} ${pt([cx-8.4,52])} ${pt([cx-6,52])} Z`}

function skirtD(cx,w,B,n,hip,a){const y0=w+16,R=Math.min(.32*a,(B-y0)*.24),S=pawnSide(cx,y0,B,hip,a,R,.1),A=`A${r1(R)} ${r1(R)} 0 0 1 `;
 return `M${pt([cx-n,w])} L${pt([cx+n,w])} C${pt([cx+n,w+8])} ${pt([cx+hip,w+9])} ${pt([cx+hip,y0])} C${pt(S.c1)} ${pt(S.c2)} ${pt(S.P)} ${A}${pt(S.bot)} L${pt(mx(cx,S.bot))} ${A}${pt(mx(cx,S.P))} C${pt(mx(cx,S.c2))} ${pt(mx(cx,S.c1))} ${pt([cx-hip,y0])} C${pt([cx-hip,w+9])} ${pt([cx-n,w+8])} ${pt([cx-n,w])} Z`}
function skirtSideD(W,B,wk,hk,aF,aB,se){const y0=W+16,cx=60,fH=7.9,bH=seatX(wk,hk,se),R=Math.min(.32*aF,(B-y0)*.24),Sr=pawnSide(cx,y0,B,fH,aF,R,.1),Sl=pawnSide(cx,y0,B,bH,aB,R,.1),A=`A${r1(R)} ${r1(R)} 0 0 1 `,wb=7.4*(wk||1),wf=7.6*(wk||1);
 return `M${pt([cx-wb,W])} L${pt([cx+wf,W])} C${pt([cx+wf,W+8])} ${pt([cx+fH,W+9])} ${pt([cx+fH,y0])} C${pt(Sr.c1)} ${pt(Sr.c2)} ${pt(Sr.P)} ${A}${pt(Sr.bot)} L${pt(mx(cx,Sl.bot))} ${A}${pt(mx(cx,Sl.P))} C${pt(mx(cx,Sl.c2))} ${pt(mx(cx,Sl.c1))} ${pt([cx-bH,y0])} C${pt([cx-bH,W+9])} ${pt([cx-wb,W+8])} ${pt([cx-wb,W])} Z`}
const VK=v=>v==='side'?.62:(v==='tq'||v==='rq')?.9:1,VX=v=>v==='tq'?61:v==='rq'?59:60;
const CUSTOM={pillw:1,rects:1,rectsf:1,rects36:1,rects38:1,rects40:1,rectsE:1};
function torsoAny(P,v){const b=P.body,f=P.top;
 if(!CUSTOM[b]){if(v==='tq')return torsoTQ(b,f,P.hv,P.pe);if(v==='rq')return torsoTQ(b,f,P.hv,P.pe).replace(/61,/,'59,');if(v==='side')return torsoSide(b,f,P.hv,P.pe);return torsoFront(b,f,P.hv,P.pe)}
 const k=VK(v),cx=VX(v);let s='';
 if(b==='pillw'){const tucked=(P.legType==='pants'||P.shorts)&&!P.untucked;if(v==='side'){const d=femSideD(60,P.wk,P.hk,P.bust,P.seat),body=pth(d,f)+shade(`<path d="${d}"/>`,48,52,24,66);s+=tucked?clipRect(30,40,60,WAIST+6-40,body):body;}else{const D=femTorsoD(cx,k,P.wk,P.hk);(tucked?[D[0]]:D).forEach(d=>s+=pth(d,f));s+=shade(`<path d="${D[0]}"/>`+(tucked?'':`<path d="${D[1]}"/>`),cx-22,52,44,66);
   if((v==='front'||v==='tq')&&!P.bikini){const o=v==='tq'?1.6:0,bu=P.bust||1,y0=72.6+(bu-1)*1.4,yc=y0+4.8*(.6+.4*bu),hw=10*(.9+.1*bu);s+=`<path d="M${r1(60-hw+o)},${r1(y0)} Q${60+o},${r1(yc)} ${r1(60+hw+o-(v==='tq'?2.4:0))},${r1(y0)}" fill="none" stroke="#1f1a14" stroke-opacity=".13" stroke-width="1.5" stroke-linecap="round"/>`;}}}
 else{const tuckM=(P.legType==='pants'||P.shorts)&&!P.untucked,g=BG[b],w=(g.w||32)*k,rt=(g.rt||9)*k,rb=9*k,x0=cx-w/2,x1=cx+w/2,cb=(P.chest||0)*2.2,d=v==='side'&&cb?`M${pt([x0+rt,52])} L${pt([x1-rt,52])} Q${pt([x1,52])} ${pt([x1,52+rt])} C${pt([x1,60])} ${pt([x1+cb,61])} ${pt([x1+cb,66])} C${pt([x1+cb,71])} ${pt([x1,73])} ${pt([x1,78])} L${pt([x1,112-rb])} Q${pt([x1,112])} ${pt([x1-rb,112])} L${pt([x0+rb,112])} Q${pt([x0,112])} ${pt([x0,112-rb])} L${pt([x0,52+rt])} Q${pt([x0,52])} ${pt([x0+rt,52])} Z`:`M${pt([x0+rt,52])} L${pt([x1-rt,52])} Q${pt([x1,52])} ${pt([x1,52+rt])} L${pt([x1,112-rb])} Q${pt([x1,112])} ${pt([x1-rb,112])} L${pt([x0+rb,112])} Q${pt([x0,112])} ${pt([x0,112-rb])} L${pt([x0,52+rt])} Q${pt([x0,52])} ${pt([x0+rt,52])} Z`;const bl=g.belly?(v==='side'?[65.6+cb*.4,93,17.4,22]:[cx,93,27.5*k,22.5]):null,be=bl?`<ellipse cx="${r1(bl[0])}" cy="${bl[1]}" rx="${r1(bl[2])}" ry="${bl[3]}"/>`:'';const tb=pth(d,f)+(bl?e(bl[0],bl[1],bl[2],bl[3],f):'')+shade(`<path d="${d}"/>`+be,bl?Math.min(x0,bl[0]-bl[2]):x0,52,bl?Math.max(w,bl[2]*2+(bl[0]-cx)*2):w,62);s+=tuckM&&!g.belly?clipRect(20,40,80,WAIST+11-40,tb):tb;
  if(P.ripped&&(v==='front'||v==='tq')){const o=v==='tq'?1.2:0,ln=(d)=>`<path d="${d}" fill="none" stroke="#1f1a14" stroke-opacity=".14" stroke-width="1.3" stroke-linecap="round"/>`;s+=ln(`M${r1(cx-12*k+o)},71 Q${r1(cx-6*k+o)},76 ${r1(cx-1+o)},72`)+ln(`M${r1(cx+12*k+o)},71 Q${r1(cx+6*k+o)},76 ${r1(cx+1+o)},72`)+ln(`M${r1(cx+o)},76 L${r1(cx+o)},96`)+ln(`M${r1(cx-5*k+o)},83 L${r1(cx-1.6+o)},83.6 M${r1(cx+1.6+o)},83.6 L${r1(cx+5*k+o)},83 M${r1(cx-4.6*k+o)},90 L${r1(cx-1.6+o)},90.4 M${r1(cx+1.6+o)},90.4 L${r1(cx+4.6*k+o)},90`);}if(b==='rectsf'){const d=menShouldersD(cx,k);s+=pth(d,f)+shade(`<path d="${d}"/>`,cx-24,52,48,30);}}
 
 if(P.collar&&(v==='front'||v==='tq')){const o=v==='tq'?1.5:0;if(P.under)s+=`<path d="${polyRound([[54+o,51],[66+o,51],[60+o,73]],2.2)}" fill="${col(P.under)}"/>`;s+=`<path d="${polyRound([[53+o,51],[60+o,51],[57.5+o,60]],1.2)}" fill="${col(P.collar)}"/><path d="${polyRound([[60+o,51],[67+o,51],[62.5+o,60]],1.2)}" fill="${col(P.collar)}"/>`+rr(59.3+o,P.under?72:58,1.4,P.under?38:52,.7,'ink',{op:.25})+(P.under?[82,96]:[68,82,96]).map(y=>c(60+o,y,1.3,'cream',{op:.8})).join('');}
 if(P.vneck&&(v==='front'||v==='tq')){const o=v==='tq'?1.5:0;s+=`<path d="${polyRound([[52.4+o,50],[67.6+o,50],[60+o,66.5]],2.4)}" fill="${col(P.vneck)}"/><path d="${polyRound([[54.8+o,50],[65.2+o,50],[60+o,62.8]],2)}" fill="${col(P.skin)}"/>`;}
 if(P.crew&&v!=='side')s+=rr(cx-7*k,49.5,14*k,5,2.5,P.crew);
 if(P.hem){const hw=(b==='pillw'?16.2*(P.hk||1)+.9:(BG[b]&&BG[b].w||32)/2)*k;s+=rr(cx-hw,b==='pillw'?108:106,hw*2,b==='pillw'?9:7,3.5,P.hem);}
 return s}
function wardrobe(P,v){if(v==='top')return '';let s='';const k=VK(v),cx=VX(v),bc=P.bottom,fem=P.body==='pillw';
 if(P.skirt){const B=P.skirt==='long'?152:128,a=P.skirt==='long'?27:24,d=v==='side'?skirtSideD(WAIST,B,P.wk,P.hk,a*.6,a*.7*(1+((P.seat||1)-1)*.3),P.seat):skirtD(cx,WAIST,B,12.9*k*(P.wk||1),16.6*k*(P.hk||1),a*k);s+=pth(d,bc)+shade(`<path d="${d}"/>`,cx-30,WAIST,60,B-WAIST);}
 if((P.legType==='pants'||P.shorts)&&CUSTOM[P.body]){const g=BG[P.body],tq=v==='tq'?1:v==='rq'?2:0,lx=v==='side'?[54,54]:legXY(g,tq),pad=v==='side'?(P.shorts?(fem?1.8:3):0):P.shorts?(BG[P.body].slim?1:1.8):(BG[P.body].slim?.4:.8),L0=lx[0]-pad,R0=(v==='side'?54:lx[1])+g.lw+pad,yC=fem?114:118,top=(fem?12.5*(P.wk||1):(BG[P.body].w||32)/2)*k,hip=16.2*k*(P.hk||1),sideF=fem&&v==='side';
  const WY=fem?WAIST-2.2:WAIST+8,lc=(L0+R0)/2,mh=Math.min(top,(R0-L0)/2+2),sideM=!fem&&v==='side';const T0=sideF?60-7.4*(P.wk||1):fem?cx-top:lc-mh,T1=sideF?60+7.6*(P.wk||1):fem?cx+top:lc+mh,HL=sideF?60-seatX(P.wk,P.hk,P.seat):cx-hip,HR=sideF?60+7.9:cx+hip,rx=5;let d=`M${pt([T0,WY+1])} L${pt([T1,WY+1])} `;if(sideM){const a0=60-top,a1=60+top;d=`M${pt([a0,WY+1])} L${pt([a1,WY+1])} L${pt([a1,yC-10])} C${pt([a1,yC-4])} ${pt([R0,yC-4])} ${pt([R0,yC])} L${pt([R0,yC+3])} L${pt([L0,yC+3])} L${pt([L0,yC])} C${pt([L0,yC-4])} ${pt([a0,yC-4])} ${pt([a0,yC-10])} Z`;}else if(sideF){d+=`C${pt([T1,WAIST+8])} ${pt([HR,WAIST+9])} ${pt([HR,WAIST+16])} C${pt([HR,WAIST+25])} ${pt([R0,yC-9])} ${pt([R0,yC])} L${pt([R0,yC+3])} L${pt([L0,yC+3])} L${pt([L0,yC])} C${pt([L0,yC-9])} ${pt([HL,WAIST+25])} ${pt([HL,WAIST+16])} C${pt([HL,WAIST+9])} ${pt([T0,WAIST+8])} ${pt([T0,WY+1])} Z`;}else{
  d+=fem?`C${pt([T1,WAIST+8])} ${pt([HR,WAIST+9])} ${pt([HR,WAIST+16])} C${pt([HR,WAIST+25])} ${pt([R0,yC-9])} ${pt([R0,yC-rx])} `:`L${pt([R0,yC-rx])} `;
  d+=`A${rx} ${rx} 0 0 1 ${pt([R0-rx,yC])} L${pt([L0+rx,yC])} A${rx} ${rx} 0 0 1 ${pt([L0,yC-rx])} `;
  d+=fem?`C${pt([L0,yC-9])} ${pt([HL,WAIST+25])} ${pt([HL,WAIST+16])} C${pt([HL,WAIST+9])} ${pt([T0,WAIST+8])} ${pt([T0,WAIST+1])} Z`:`L${pt([T0,WY+1])} Z`;}
  s+=fem&&P.untucked?clipRect(0,P.hem?108.6:106,120,100,pth(d,bc)):pth(d,bc);if(!fem&&!P.untucked&&!P.noBelt){const bx=v==='tq'?cx+2.5:cx,b0=sideM?60-top:T0,b1=sideM?60+top:T1;s+=rr(b0,WY+1,b1-b0,4.5,sideM?1:2.2,P.belt||'brown')+(v==='side'||v==='back'||v==='rq'?'':rr(bx-3,WY+.5,6,5.5,1.6,'sunD'));}}
 if(P.skirt)s+=rr(cx-14*k,WAIST-.5,28*k,5,2.5,P.belt||'brand');
 return s}
function bodyLayer(P,v){const t=torsoAny(P,v),w=wardrobe(P,v);return P.untucked?w+t:t+w}
function torsoTQ(b,f,hv,pe){if(b==='pillw')return rr(46.5,52,27,62,13.5,f,{sh:1});if(b==='rects')return rr(45.5,52,29,60,9,f,{sh:1});if(b==='hour'){const d=hourVariant(hv,61,50,32,68);return pth(d,f)+shade(`<path d="${d}"/>`,38,50,46,68)}if(b==='rect')return rr(42.5,52,35,60,11,f,{sh:1});if(b==='ell')return e(61,85,25,33,f,{sh:1});if(b==='pill')return rr(46.5,52,27,62,13.5,f,{sh:1});return pw(61,44,60,110,f,{sh:1,e:pe})}

function headRQ(P){const hs=P.hairStyle,h=P.hair;let s=rr(55,42,10,13,4,P.skin)+c(60,32,15,P.skin);
 s+=c(72.5,36.5,2.7,P.skin);
 if(hs&&hs!=='none'){s+=clipRect(40,8,30,40,c(60,31,16.6,h,{sh:1}))+clipRect(40,8,40,19,c(60,31,16.6,h,{sh:1}));if(hs==='messy')s+=c(47,20,5,h)+c(55,15.5,6,h)+c(65,15.5,6,h)+c(73,20,5,h);
  if(hs==='long')s+=rr(41,22,32,60,15,h,{sh:1});if(hs==='bun')s+=c(58,14,7.5,h);}
 if(!P.noFace)s+=e(73.4,39.5,1.6,2.6,'cheek',{op:.3});
 return s}
function headBack(P){if(P.pumpkin)return pumpkinView('back');const hs=P.hairStyle,h=P.hair;let s=rr(55,42,10,13,4,P.skin)+c(60,32,15,P.skin);
 if(hs&&hs!=='none'){s+=clipRect(40,8,40,33,c(60,31,16.6,h,{sh:1}));if(hs==='messy')s+=c(47,20,5,h)+c(55,15.5,6,h)+c(65,15.5,6,h)+c(73,20,5,h);
  if(hs==='long')s+=rr(42,22,36,60,15,h,{sh:1});if(hs==='bun')s+=c(60,14,7.5,h);}
 return s}
function headSide(P){if(P.pumpkin)return pumpkinView('side');const hs=P.hairStyle,h=P.hair;let s='';
 if(hs==='long')s+=rr(44,22,16,56,8,h);if(hs==='bun')s+=c(49,16,7,h);
 s+=rr(56,42,10,13,4,P.skin)+c(61,32,15,P.skin,{sh:1})+c(75.5,35.5,2.5,P.skin);
 if(hs&&hs!=='none'){s+=clipRect(40,8,44,19,c(61,31,16.6,h))+clipRect(40,8,22,36,c(61,31,16.6,h));
  if(hs==='messy')s+=c(50,19,5,h)+c(58,15,6,h)+c(67,16,5.5,h)+c(46,27,5,h);}
 if(!P.noFace)s+=G('p-eyes',70,33,c(70,33,1.9,'ink'))+c(68,39,3,'cheek',{op:.35})+G('p-mouth',70.5,40.8,rr(68.5,40,4,1.6,.8,'ink',{op:.5}))+c(61,34,2.6,P.skin,{op:1});
 return s}
function headTop(P){if(P.pumpkin)return pumpkinView('top');const hs=P.hairStyle,h=P.hair;let s='';
 if(hs==='long')s+=e(60,92,14,17,h);
 s+=c(60,99,13,P.skin);
 if(hs&&hs!=='none')s+=c(60,97,12.6,h,{sh:1})+(hs==='bun'?c(60,90,6,h):'')+(hs==='messy'?c(53,92,4.5,h)+c(66,91,4.5,h)+c(60,88,4.5,h):'');
 return s}
function pumpkinView(v){if(v==='top')return c(60,98,15,'brand',{sh:1})+e(60,98,5,15,'brandD',{op:.3})+c(60,98,3.2,'teal');
 let s=rr(55,42,10,13,4,'sk2');
 if(v==='side')return s+c(61,30,17.5,'brand',{sh:1})+e(57,30,6,17,'brandD',{op:.3})+pl(59,6,5,9,'teal',{rot:10})+pw(72,22,7,8,'ink')+rr(66,35,10,5,2.5,'ink');
 s+=c(60,30,18,'brand',{sh:1})+e(60,30,7,18,'brandD',{op:.28})+pl(57.5,6,5,9,'teal',{rot:8});
 if(v==='front')s+=pw(53.5,22,9,9,'ink')+pw(66.5,22,9,9,'ink')+rr(51,35,18,5.5,2.75,'ink')+rr(57,35,4,3,1,'sun');
 return s}

const FABRIC={flannel:(id,P)=>`<pattern id="${id}" patternUnits="userSpaceOnUse" width="14" height="14"><rect width="14" height="14" fill="${col(P.fc||'#b4232c')}"/><rect width="5" height="14" fill="#1f1a14" opacity=".3"/><rect width="14" height="5" fill="#1f1a14" opacity=".3"/><rect x="9" width="1.3" height="14" fill="#fbf6ec" opacity=".3"/><rect y="9" width="14" height="1.3" fill="#fbf6ec" opacity=".3"/></pattern>`,
 stripe:(id,P)=>`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="7"><rect width="8" height="7" fill="${col(P.fc||'white')}"/><rect y="3.5" width="8" height="3.5" fill="${col(P.fc2||'navy')}"/></pattern>`,
 hawaii:(id,P)=>`<pattern id="${id}" patternUnits="userSpaceOnUse" width="16" height="16"><rect width="16" height="16" fill="${col(P.fc||'teal')}"/><ellipse cx="4" cy="4" rx="3.6" ry="1.6" transform="rotate(35 4 4)" fill="${col(P.fc2||'mint')}"/><ellipse cx="12" cy="11" rx="3.6" ry="1.6" transform="rotate(-30 12 11)" fill="${col(P.fc2||'mint')}"/><circle cx="12.5" cy="3.5" r="1.8" fill="${col(P.fc3||'coral')}"/><circle cx="4" cy="12.5" r="1.8" fill="${col(P.fc3||'coral')}"/></pattern>`,
 knit:(id,P)=>`<pattern id="${id}" patternUnits="userSpaceOnUse" width="4" height="8"><rect width="4" height="8" fill="${col(P.fc||'#7a4e33')}"/><rect x="2.6" width="1.1" height="8" rx=".55" fill="#1f1a14" opacity=".2"/></pattern>`};
function person(P,v){let DEF='';if(P.fabric&&FABRIC[P.fabric]){const id=uid();DEF=`<defs>${FABRIC[P.fabric](id,P)}</defs>`;P=Object.assign({},P,{top:`url(#${id})`,armc:P.sleeve==='long'||P.sleeve==='short'?`url(#${id})`:P.armc})}
 if(P.bfabric&&FABRIC[P.bfabric.k]){const id=uid();DEF+=`<defs>${FABRIC[P.bfabric.k](id,P.bfabric)}</defs>`;P=Object.assign({},P,{bottom:`url(#${id})`})}
 return DEF+person0(P,v)}
function person0(P,v){const g=BG[P.body],X=P.x||{};let s='';const LT=P.body==='pawn'?140:104,LEGS=inner=>`<g class="legs" data-k="${188-LT}" style="transform-origin:60px 188px">${inner}</g>`,UPG=inner=>`<g class="up">${inner}</g>`;
 if(v==='front'){s+=`<g class="shadow" style="transform-origin:60px 190px">${ground(60,30)}</g>`+(X.under?X.under(v):'')+LEGS(legsFront(P))+UPG(G('p-hairB',60,50,hairBehindFront(P))+G('p-body',60,112,bodyLayer(P,'front')+(X.body?X.body(v):''))+armFront(P,0)+armFront(P,1)+shouldersW(P,'front')+G('p-head',60,48,headFront(P)+(X.over?X.over(v):'')));}
 else if(v==='tq'){const P2=Object.assign({},P,{_sh:g.shw?[[61-g.shw*.9+5,58],[61+g.shw*.9-5,58]]:[[g.sh[0][0]+2.5,g.sh[0][1]],[g.sh[1][0]-3,g.sh[1][1]]]});
  s+=`<g class="shadow" style="transform-origin:60px 190px">${ground(61,29)}</g>`+(X.under?X.under('tq'):'')+LEGS(legsFront(P,0,1))+UPG(G('p-hairB',60,50,P.hairStyle==='long'?rr(40,20,34,62,15,P.hair):hairBehindFront(P))+armFront(P2,1,1)+G('p-body',60,112,bodyLayer(P,'tq')+(X.body?X.body('tq'):''))+armFront(P2,0)+shouldersW(P,'tq')+G('p-head',60,48,headTQ(P)+(X.over?X.over('tq'):'')));}
 else if(v==='rq'){const P2=Object.assign({},P,{_sh:g.shw?[[59-g.shw*.9+5,58],[59+g.shw*.9-5,58]]:[[g.sh[0][0]+3,g.sh[0][1]],[g.sh[1][0]-2.5,g.sh[1][1]]]});
  s+=`<g class="shadow" style="transform-origin:60px 190px">${ground(59,29)}</g>`+(X.under?X.under('rq'):'')+LEGS(legsFront(P,1,2))+UPG(armFront(P2,0,1)+G('p-body',60,112,bodyLayer(P,'rq')+(X.bodyB?X.bodyB('rq'):''))+armFront(P2,1)+shouldersW(P,'rq')+G('p-head',60,48,headRQ(P)+(X.over?X.over('rq'):'')));}
 else if(v==='back'){s+=ground(60,30)+(X.under?X.under(v):'')+LEGS(legsFront(P,1))+UPG(bodyLayer(P,'back')+(X.bodyB?X.bodyB(v):'')+armFront(P,0)+armFront(P,1)+shouldersW(P,'back')+headBack(P)+(X.over?X.over(v):''));}
 else if(v==='side'){const L=P.body==='pawn'?140:104,LH=184-L,lw=g.lw,skin=P.skin,sl=P.sleeve||'short',topc=P.armc||P.top;
  const leg=(far)=>{const lc=P.legType==='pants'||P.legType==='full'?P.bottom:(P.legc||skin);let t=pl(54,L,lw,LH,lc)+(P.shorts&&CUSTOM[P.body]?(()=>{const sp=P.body==='pillw'?1.8:3,x0=54-sp,x1=54+lw+sp,yt=(P.body==='pillw'?114:118)-.3,yb=L+(P.body==='pillw'?24:27);return pth(`M${pt([x0,yt])} L${pt([x1,yt])} L${pt([x1,yb-5])} Q${pt([x1,yb])} ${pt([x1-5,yb])} L${pt([x0+5,yb])} Q${pt([x0,yb])} ${pt([x0,yb-5])} Z`,P.bottom)})():'')+(P.cuff&&P.legType==='pants'?rr(53.2,166,lw+1.6,7,3,P.cuff):'');if(P.legType==='shorts')t+=rr(53,L,lw+2,30,5,P.bottom);if(P.stripes)for(let k=0;k<4;k++)t+=rr(54,L+10+k*11,lw,4.5,2,P.stripes);if(P.boots)t+=rr(53.4,163,lw+1.2,20,3.5,P.boots);t+=pl(53,178,lw+10,10,P.shoes)+(P.curl?c(54+lw+10,176,3,P.shoes):'');if(P.sandal)t+=rr(52.6,185.6,lw+10.8,2.8,1.4,P.sandal)+rr(58,181.5,5,2,1,P.sandal);return far?`<g style="filter:brightness(.8)">${t}</g>`:t};
  const armL=P.body==='ell'?48:52,am=P.arms||1,arm=(far)=>{let t=pl(60-5*am,58,10*am,armL,sl==='long'?topc:skin);if(sl==='short')t+=pl(60-5.5*am,58,11*am,20,topc);if(sl==='long'&&P.cuffs)t+=rr(60-5.2*am,58+armL-16,10.4*am,5.5,2.5,P.cuffs);t+=armMuscle(P,60,63,10*am,sl,1,col(topc));t+=c(60,58+armL-6,5.6*(1+(am-1)*.45),P.hands||skin);return far?`<g style="filter:brightness(.8)">${t}</g>`:t};
  s+=ground(62,26)+(X.under?X.under(v):'')+LEGS(G('sw-lf p-legF',60,L+4,leg(1))+G('sw-ln p-legN',60,L+4,leg(0)))+UPG(G('sw-af p-armF',60,62,arm(1))+G('p-body',60,112,bodyLayer(P,'side')+(X.body?X.body(v):'')+(X.mid?X.mid(v):''))+G('sw-an p-armN',60,62,arm(0))+shouldersW(P,'side')+G('p-head',62,48,headSide(P)+(X.over?X.over(v):'')));}
 else {const tw={rect:[36,84],ell:[31,89],pill:[42,78],pawn:[46,74],hour:[42,78],pillw:[41,79],rects:[38,82],rectsf:[37,83],rects36:[37,83],rects38:[36,84],rects40:[35,85],rectsE:[31,89]}[P.body];
  s+=e(64,106,34,26,'ink',{op:.12})+(X.under?X.under(v):'')+pl(50,106,8,15,P.shoes)+pl(62,106,8,15,P.shoes)+torsoTop(P.body,P.top)+(X.body?X.body(v):'');
  const ac=P.sleeve==='long'?(P.armc||P.top):P.skin;
  if(P.rodHold){const limb=(x1,y1,x2,y2)=>{const L=Math.hypot(x2-x1,y2-y1),a=Math.atan2(x2-x1,y2-y1)*-180/Math.PI;return `<g transform="rotate(${r1(a)} ${r1(x1)} ${r1(y1)})">${pl(x1-4.5,y1-4,9,L+4,ac)}</g>`};s+=G('sw-tl',tw[0]+4,96,limb(tw[0]+4,96,55.6,120))+G('sw-tr',tw[1]-4,96,limb(tw[1]-4,96,64.4,120))+c(56.4,121,4.6,P.hands||P.skin)+c(63.6,121,4.6,P.hands||P.skin);}
  else{const am=P.arms||1;s+=G('sw-tl',tw[0]+4,96,pl(tw[0]+3.5-4.5*am,92,9*am,26,ac)+c(tw[0]+3.5,118,4.6*(1+(am-1)*.45),P.hands||P.skin))+G('sw-tr',tw[1]-4,96,pl(tw[1]-3.5-4.5*am,92,9*am,26,ac)+c(tw[1]-3.5,118,4.6*(1+(am-1)*.45),P.hands||P.skin));}
  s+=headTop(P)+(X.over?X.over(v):'');}
 return s}

const hat={
 bucket:(v)=>v==='top'?c(60,98,20,'tealD',{sh:1})+c(60,98,12.5,'teal'):v==='side'?rr(39,23,46,8,4,'tealD')+rr(48,9,27,18,8,'teal',{sh:1}):rr(37,23,46,8,4,'tealD')+rr(45,9,30,18,8,'teal',{sh:1}),
 captain:(v)=>v==='top'?c(60,98,15.5,'white',{sh:1})+e(60,112,11,5.5,'ink'):v==='side'?rr(45,11,31,16,6,'white',{sh:1})+rr(45,23,31,4,1,'ink')+pl(68,25,17,5,'ink'):rr(42,11,36,16,6,'white',{sh:1})+rr(42,23,36,4,1,'ink')+(v==='front'?e(60,28,15,4,'ink')+c(60,18,3.2,'sun'):''),
 santa:(v)=>v==='top'?c(60,98,17,'cream')+c(60,98,11,'crimson',{sh:1})+c(60,98,4.6,'cream'):pw(v==='side'?59:60,-14,v==='side'?32:36,40,'crimson',{sh:1})+rr(v==='side'?43:41,21,v==='side'?35:38,11,5.5,'cream')+c(v==='side'?59:60,-11,6,'cream'),
 elf:(hc,bc)=>(v)=>v==='top'?c(60,98,15,bc)+c(60,98,10,hc,{sh:1})+c(60,98,4,'sun'):pw(60,-30,30,56,hc,{sh:1})+rr(43,20,34,8,4,bc)+c(60,-28,4.6,'sun')
};
const ears=(sk)=>(v)=>v==='top'?pw(44,88,8,12,sk,{rot:-90})+pw(76,88,8,12,sk,{rot:90}):v==='side'?pw(57,22,8,13,sk,{rot:-55}):pw(42.5,24,8,13,sk,{rot:-68})+pw(77.5,24,8,13,sk,{rot:68});

function cat(K,v){let s='';const b=K.base,pt=K.point||b,spots=K.spots||[];
 if(v==='front'){s+=ground(62,32)+pl(70,176,42,10,pt)+pl(104,146,10,40,pt)+c(109,146,5,pt)+pw(60,92,64,94,b,{sh:1});
  s+=catSpots(K,'front');
  if(K.bib)s+=c(60,118,15,'cream');
  s+=pl(46,176,12,10,b)+pl(62,176,12,10,b)+pw(42,50,22,26,pt,{rot:-22})+pw(78,50,22,26,pt,{rot:22})+pw(42.5,57,11,15,'pink',{rot:-22})+pw(77.5,57,11,15,'pink',{rot:22})+c(60,82,25,b,{sh:1});
  if(K.mask)s+=e(60,86,15,12,K.mask)+e(60,93,7,6,b);
  s+=c(51,82,3.8,'eyeB')+c(69,82,3.8,'eyeB')+c(51,82,1.7,'ink')+c(69,82,1.7,'ink')+pw(60,88,6,5,'pink',{rot:180})+c(46,90,3.4,'cheek',{op:.3})+c(74,90,3.4,'cheek',{op:.3});
  s+=rr(45,103,30,6,3,K.collar)+c(60,111,4,'sun');}
 else if(v==='back'){s+=ground(60,32)+pw(60,92,64,94,b,{sh:1});s+=catSpots(K,'back');
  s+=G('tail',62,180,pl(16,176,48,10,pt)+pl(10,146,10,40,pt)+c(15,146,5,pt))+pw(42,50,22,26,pt,{rot:-22})+pw(78,50,22,26,pt,{rot:22})+c(60,82,25,b,{sh:1})+rr(45,103,30,6,3,K.collar);}
 else if(v==='side'){s+=ground(62,46)+G('tail',22,112,pl(17,62,10,54,pt,{rot:-14}))+G('cl-f',30,136,`<g style="filter:brightness(.86)">${pl(25,130,10,52,b)}</g>`)+G('cl-b',90,136,`<g style="filter:brightness(.86)">${pl(85,130,10,52,b)}</g>`);
  s+=pl(14,102,88,40,b,{sh:1});s+=catSpots(K,'side');
  s+=G('cl-ff',38,136,pl(33,130,10,52,b))+G('cl-bb',82,136,pl(77,130,10,52,b))+pw(94,64,18,22,pt,{rot:-14})+pw(114,64,18,22,pt,{rot:16})+c(106,94,23,b,{sh:1});
  if(K.mask)s+=e(114,98,12,10,K.mask);
  s+=c(117,92,3.6,'eyeB')+c(118,92,1.6,'ink')+c(128,100,2.4,'pink')+rr(90,106,8,22,4,K.collar,{rot:22})+c(97,123,3.6,'sun');}
 else {s+=e(64,108,36,30,'ink',{op:.12})+pl(32,118,56,10,pt)+e(60,104,30,24,b,{sh:1});s+=catSpots(K,'top');
  s+=pw(47,62,14,16,pt,{rot:-22})+pw(73,62,14,16,pt,{rot:22})+c(60,82,17,b,{sh:1})+(K.mask?e(60,86,10,7,K.mask):'')+rr(51,82,7,1.8,.9,'ink',{op:.7})+rr(62,82,7,1.8,.9,'ink',{op:.7})+c(60,88,1.8,'pink');}
 return s}


const SVGL=(d,stroke,w,o)=>`<path d="${d}" fill="none" stroke="${col(stroke)}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o?` opacity="${o}"`:''}/>`;
function arcPath(cx,cy,r,a0,a1){const p=a=>[cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180)];return `M${pt(p(a0))} A${r} ${r} 0 0 1 ${pt(p(a1))}`}
const darker=(hex,k)=>{const h=col(hex);if(!/^#[0-9a-f]{6}$/i.test(h))return h;const n=parseInt(h.slice(1),16),f=x=>Math.max(0,Math.min(255,Math.round(x*(k||.78))));return '#'+[f(n>>16),f((n>>8)&255),f(n&255)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const HEADC={front:[60,31],tq:[59,31],side:[61,31],rq:[60,31],back:[60,31]};


const NEWHAIR={buzz:1,curly:1,pony:1,surfer:1};
function hairBack(P,v){const hs=P.hairStyle,h=P.hair;if(!NEWHAIR[hs])return '';const [cx,cy]=HEADC[v]||HEADC.front;
 if(hs==='curly'){const R=P.curlR||19;if(v==='side')return c(cx-3.5,cy-2,R,h)+c(cx-14,cy+10,R*.45,h);return c(cx,cy-2,R,h)+(R>18?c(cx-R*.72,cy+9,R*.42,h)+c(cx+R*.72,cy+9,R*.42,h):'')}
 if(hs==='surfer'){if(v==='front')return rr(42.4,18,35.2,26,12,h)+c(44.6,43,3.2,h)+c(75.4,43,3.2,h);if(v==='tq')return rr(40.6,18,33,26,12,h)+c(42.6,43,3.4,h);if(v==='side')return rr(42.6,19,19,26,9.5,h)+c(45,44,3.8,h)+c(51,45.4,3.4,h);return ''}
 if(hs==='pony'&&P.ponyHigh){const t=P.tie||darker(h,.7);if(v==='front')return `<path d="M58,13 C62,1 74,-1 79,8 C84,17 81,30 77,40 C76,31 74,20 68,15 Z" fill="${col(h)}"/>`;if(v==='tq')return `<path d="M56,13 C50,1 38,1 34,10 C30,19 33,31 37,40 C38,31 40,21 46,16 Z" fill="${col(h)}"/>`;if(v==='side')return `<path d="M50,13 C42,4 31,7 29,17 C27,27 31,37 35,44 C36,35 38,26 44,20 Z" fill="${col(h)}"/>`+c(48.6,13.6,3.8,t);return ''}
 if(hs==='pony'){const t=P.tie||darker(h,.7);if(v==='front')return '';if(v==='tq')return pl(36.5,22,9,34,h,{rot:14})+c(43,22,4,t);if(v==='side')return pl(36,24,9,36,h,{rot:16})+c(44,22.5,4,t);return ''}
 return ''}
function hairCap(P,v){const hs=P.hairStyle,h=P.hair;if(!NEWHAIR[hs])return '';const [cx,cy]=HEADC[v]||HEADC.front;let s='';
 if(hs==='buzz'){const r=16;if(v==='front'||v==='tq')return clipRect(40,8,40,16.5,c(cx,cy,r,h))+(v==='tq'?clipRect(40,8,9,26,c(cx,cy,r,h)):'');
  if(v==='side')return clipRect(40,8,44,16.5,c(cx,cy,r,h))+clipRect(40,8,19.5,30,c(cx,cy,r,h));return clipRect(40,8,40,32,c(cx,cy,r,h))}
 if(hs==='curly'){const R=P.curlR||19,big=R>18,bump=(x,y,r)=>c(x,y,r,h);
  if(v==='front'||v==='tq'){const o=v==='tq'?-1:0;s+=clipRect(36,4,48,big?19.5:19,c(cx,cy-2,R,h));const b=big?[[-12,-6,6.5],[-6,-11,7],[1,-12.5,7],[8,-10.5,7],[13,-5,6]]:[[-10,-6,5.5],[-3,-10,6],[4,-10,6],[10,-6,5]];b.forEach(([x,y,r])=>s+=bump(cx+x+o,cy+y,r));return s}
  if(v==='side')return clipRect(36,4,48,19,c(cx-3.5,cy-2,R,h))+clipRect(36,4,23,44,c(cx-3.5,cy-2,R,h))+bump(cx-6,cy-12,big?7:6)+bump(cx+3,cy-13,big?6.5:5.5);
  return c(cx,cy-2,R,h,{sh:1})+bump(cx-9,cy-12,6.5)+bump(cx+5,cy-14,6.5)}
 if(hs==='surfer'){const cap=r=>clipRect(40,8,40,18.6,c(cx,cy,r,h));
  const tou=(o)=>c(47+o,20,5,h)+c(55+o,15.5,6,h)+c(65+o,15.5,6,h)+c(73+o,20,5,h)+c(60+o,14,5,h);
  if(v==='front')return cap(16.8)+tou(0)+rr(43.6,24,5.4,12,2.7,h)+rr(71,24,5.4,12,2.7,h);
  if(v==='tq')return cap(16.8)+tou(-1)+clipRect(40,8,10,30,c(cx,cy,16.8,h))+rr(42,22,8,20,4,h)+rr(72,24,4.4,10,2.2,h);
  if(v==='side')return clipRect(40,8,44,18.6,c(61,31,16.8,h))+clipRect(40,8,22,36,c(61,31,16.8,h))+c(50,19,5,h)+c(58,15,6,h)+c(67,16,5.5,h)+c(46,27,5,h);
  return clipRect(40,8,40,33,c(cx,cy,16.8,h,{sh:1}))+rr(42,20,36,25,12,h,{sh:1})+c(47,44.6,3.8,h)+c(55,45.6,3.8,h)+c(63,45.6,3.8,h)+c(71,44.6,3.8,h)+c(47,20,5,h)+c(60,14,5,h)+c(73,20,5,h)}
 if(hs==='pony'&&P.ponyHigh){const t=P.tie||darker(h,.7);
  if(v==='front')return clipRect(40,8,40,19,c(cx,cy,16.6,h))+rr(43.8,24,5.6,12,2.8,h)+rr(70.6,24,5.6,12,2.8,h)+c(61,12.6,3.4,t);
  if(v==='tq')return clipRect(40,8,40,19,c(cx,cy,16.6,h))+clipRect(40,8,10,30,c(cx,cy,16.6,h))+rr(72,24,4.5,11,2.25,h)+c(55,12.8,3.4,t);
  if(v==='side')return clipRect(40,8,44,19,c(cx,cy,16.6,h))+clipRect(40,8,22,36,c(cx,cy,16.6,h))+c(48.6,13.6,3.8,t);
  const x=v==='rq'?57:60;return clipRect(40,8,40,33,c(cx,cy,16.6,h,{sh:1}))+`<path d="M${x-4.6},13 C${x-6},26 ${x-5},38 ${x},48 C${x+5},38 ${x+6},26 ${x+4.6},13 Z" fill="${col(h)}"/>`+c(x,13,4.2,t)}
 if(hs==='pony'){const t=P.tie||darker(h,.7);
  if(v==='front')return clipRect(40,8,40,19,c(cx,cy,16.6,h))+rr(43.8,24,5.6,13,2.8,h)+rr(70.6,24,5.6,13,2.8,h);
  if(v==='tq')return clipRect(40,8,40,19,c(cx,cy,16.6,h))+clipRect(40,8,10,30,c(cx,cy,16.6,h))+rr(72,24,4.5,12,2.25,h);
  if(v==='side')return clipRect(40,8,44,19,c(cx,cy,16.6,h))+clipRect(40,8,22,36,c(cx,cy,16.6,h));
  const x=v==='rq'?56:60;return clipRect(40,8,40,33,c(cx,cy,16.6,h,{sh:1}))+pl(x-5,22,10,40,h)+c(x,23,4.2,t)}
 return ''}
function hairTop(P){const hs=P.hairStyle,h=P.hair;if(hs==='surfer')return rr(46,80,28,22,11,h)+c(60,97,13.2,h,{sh:1});if(hs==='pony'&&P.ponyHigh)return pl(56,74,8,16,h)+c(60,97,12.6,h,{sh:1})+c(60,90,3.6,P.tie||darker(h,.7));if(hs==='buzz')return c(60,98,12.4,h);if(hs==='curly'){const R=(P.curlR||19)*.86;return c(60,96,R,h,{sh:1})+c(52,90,5,h)+c(66,89,5,h)}if(hs==='pony')return pl(56,72,8,18,h)+c(60,97,12.6,h,{sh:1})+c(60,86,3.6,P.tie||darker(h,.7));return ''}


function beardV(P,v){const b=P.beard;if(!b)return '';if(b.k==='stubble'){const sc=b.c||P.hair,o=.42;if(v==='front')return `<g opacity="${o}">`+clipRect(40,34.6,40,18,c(60,32,15.4,sc))+rr(44.4,27,4,10,2,sc)+rr(71.6,27,4,10,2,sc)+`</g>`+rr(57.6,39.6,4.8,1.7,.85,'ink',{op:.5});if(v==='tq')return `<g opacity="${o}">`+clipRect(40,34.6,42,18,c(60,32,15.4,sc))+`</g>`+rr(61.6,39.6,4.8,1.7,.85,'ink',{op:.5});if(v==='side')return `<g opacity="${o}">`+clipRect(55,34.6,26,18,c(61,32,15.4,sc))+`</g>`+c(61,34,2.6,P.skin);if(v==='rq')return `<g opacity="${o}">`+clipRect(67,33,14,18,c(60,32,15.4,sc))+`</g>`;return ''}const bc=b.c||P.hair,sk=P.skin,full=b.k!=='stache';let s='';
 if(v==='front'){if(full)s+=clipRect(40,34.6,40,18,c(60,32,15.5,bc))+rr(44,26,4.2,11,2,bc)+rr(71.8,26,4.2,11,2,bc);s+=pl(54.2,37,11.6,3.4,bc);if(full)s+=e(60,40.9,3.1,1.5,sk)+rr(58,40.3,4,1.3,.65,'ink',{op:.45});}
 else if(v==='tq'){if(full)s+=clipRect(40,34.6,42,18,c(60,32,15.5,bc))+rr(45.6,26,4,11,2,bc)+rr(73,26,3.2,10,1.6,bc);s+=pl(58.4,37,11,3.4,bc);if(full)s+=e(64,40.9,3,1.5,sk)+rr(62,40.3,4,1.3,.65,'ink',{op:.45});}
 else if(v==='side'){if(full)s+=clipRect(55,34.6,26,18,c(61,32,15.5,bc))+rr(57,26,4.2,11,2,bc)+c(61,34,2.6,sk);s+=pl(66.6,36.8,7.4,3.2,bc);if(full)s+=e(70.6,40.8,2.2,1.3,sk);}
 else if(v==='rq'&&full)s+=clipRect(67,33,14,18,c(60,32,15.5,bc));
 return s}
function glassesV(P,v){const g=P.glasses;if(!g)return '';const f=g.c||'ink',sh=(x,y)=>rr(x,y,2.6,1.4,.7,'white',{op:.35});
 if(v==='front')return rr(44.6,31.2,6,1.2,.6,f)+rr(69.4,31.2,6,1.2,.6,f)+rr(50.2,30.3,8.6,5.8,2.6,f)+rr(61.2,30.3,8.6,5.8,2.6,f)+rr(58.4,31.4,3.2,1.4,.7,f)+sh(52,31.2)+sh(63,31.2);
 if(v==='tq')return rr(46.4,31.2,8,1.2,.6,f)+rr(54.2,30.3,8.6,5.8,2.6,f)+rr(65.4,30.3,6.4,5.8,2.6,f)+rr(62.4,31.4,3.4,1.4,.7,f)+sh(56,31.2);
 if(v==='side')return rr(59.6,31.2,9,1.2,.6,f)+rr(67,30.3,6.6,5.8,2.6,f)+sh(68.6,31.2);
 if(v==='rq')return rr(66,31.2,9,1.2,.6,f);
 return ''}
function zincV(P,v){if(!P.zinc)return '';if(v==='front')return rr(56.4,35,7.2,2.6,1.3,'white');if(v==='tq')return rr(60.6,35,6.8,2.6,1.3,'white');if(v==='side')return c(75.4,35.4,2.6,'white');return ''}


function hatV(P,v){const H=P.hat;if(!H)return '';const k=H.k,c1=col(H.c||'white'),c2=col(H.c2||darker(c1)),[cx]=HEADC[v]||HEADC.front;const f=v==='front',tq=v==='tq',sd=v==='side';
 if(k==='captain'){let s=rr(cx-18,10.5,36,15.5,6,c1,{sh:1})+rr(cx-18,21.6,36,4.6,1.3,c2);if(sd)return rr(44.5,10.5,33,15.5,6,c1,{sh:1})+rr(44.5,21.6,33,4.6,1.3,c2)+pl(66,24.2,17,4.8,c2)+c(73,18,2.4,H.b||'sun');
  if(f)s+=e(cx,27.4,15.5,3.8,c2)+c(cx,17.2,3.1,H.b||'sun');if(tq)s+=e(cx+3,27.4,14,3.6,c2)+c(cx+3.4,17.2,2.8,H.b||'sun');return s}
 if(k==='bucket'){const b=rr((sd?39:cx-23),22.6,46,8,4,c2)+rr((sd?47.5:cx-15),9,30,17,8,c1,{sh:1});return b}
 if(k==='cap'){const dome=r=>clipRect(cx-19,6,38,sd?21:20,c(cx+(sd?-1:0),29.5,r,c1,{sh:1}));
  if(f)return dome(17.4)+e(cx,26.6,13.5,3.6,c2)+c(cx,12.6,1.6,c2);if(tq)return dome(17.4)+e(cx+4.5,26.8,12.5,3.5,c2)+c(cx+1,12.6,1.6,c2);
  if(sd)return dome(17.4)+pl(67,23.2,18,4.6,c2)+c(cx-1,12.6,1.6,c2);return dome(17.4)+rr(cx-4,22.4,8,4,2,P.hair||'ink')+c(cx,12.6,1.6,c2)}
 if(k==='visor'){if(sd)return clipRect(40,19,44,5.4,c(61,31,17,c1))+pl(67,20.6,17,4.4,c2);
  if(f)return clipRect(40,19,40,5.4,c(cx,31,17,c1))+e(cx,25.2,14.5,3.8,c2);if(tq)return clipRect(40,19,40,5.4,c(cx,31,17,c1))+e(cx+4,25.2,13.5,3.6,c2);return clipRect(40,19,40,5.4,c(cx,31,17,c1))}
 if(k==='beanie'){const o=sd?1:0;return clipRect(cx-20,0,40,22,c(cx-o,26,18,c1,{sh:1}))+rr(cx-18-o,18.4,36,7.6,3.8,c2)+(H.pom?c(cx-o,6.8,4.2,c2):'')}
 if(k==='straw'){const w=H.w||27;if(sd)return e(61,23.6,w-2,4.4,c1)+rr(48,8.5,27,17,9,c1,{sh:1})+rr(48,18.6,27,4.6,1.2,c2);
  return e(cx,23.8,w,5.6,c1)+e(cx,23.8,w,5.6,'#1f1a14',{op:.06})+rr(cx-14,8.5,28,17,9,c1,{sh:1})+rr(cx-14,18.6,28,4.6,1.2,c2)}
 return ''}
function hatTop(P){const H=P.hat;if(!H)return '';const k=H.k,c1=col(H.c||'white'),c2=col(H.c2||darker(c1));
 if(k==='captain')return c(60,98,15.6,c1,{sh:1})+e(60,112.4,11,5.2,c2)+ring(60,98,15.6,1.4,c2);
 if(k==='bucket')return c(60,98,20.5,c2)+c(60,98,12.6,c1,{sh:1});
 if(k==='cap')return c(60,97,14,c1,{sh:1})+e(60,112.6,9.5,6.4,c2)+c(60,97,1.6,c2);
 if(k==='visor')return ring(60,98,13.4,2.6,c1)+e(60,112.4,10,5.4,c2);
 if(k==='beanie')return c(60,97.5,14.4,c1,{sh:1})+ring(60,97.5,13.4,2.4,c2)+(H.pom?c(60,97.5,4.2,c2):'');
 if(k==='straw')return c(60,98,H.w?H.w-1:26,c1)+c(60,98,13,c1,{sh:1})+ring(60,98,13,2.4,c2);
 return ''}


function headwear(P,v){const H=P.hw;if(!H||!H.k||v==='top')return '';const C1=col(H.c),C2=col(H.c2||'#1f1a14');let s='';
 if(H.k==='band'){const w=2.9,st=d=>`<path d="${d}" fill="none" stroke="${C1}" stroke-width="${w}" stroke-linecap="round"/>`,hi=d=>`<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width=".8" stroke-linecap="round"/>`;
  if(v==='side'){const d=`M${pt([57.4,30.5])} C${pt([56.2,24])} ${pt([57,18.4])} ${pt([60.4,15.8])}`;return st(d)+hi(`M${pt([57.4,27])} C${pt([56.9,23])} ${pt([57.5,19.4])} ${pt([59.4,17.4])}`)}
  const cx=v==='tq'?58.6:v==='rq'?60.8:60,a=v==='tq'?[200,330]:v==='rq'?[210,340]:[198,342];
  return st(arcPath(cx,31,15.6,a[0],a[1]))+hi(arcPath(cx,31,15.6+.2,a[0]+22,a[1]-22))}
 const id=uid(),dots=`<pattern id="${id}" patternUnits="userSpaceOnUse" width="4.4" height="4.4"><rect width="4.4" height="4.4" fill="${C1}"/><circle cx="1.1" cy="1.1" r=".62" fill="${C2}" opacity=".75"/><circle cx="3.3" cy="3.3" r=".62" fill="${C2}" opacity=".75"/></pattern>`,F=`url(#${id})`;
 const clipC=(cx,inner)=>{const k=uid();return `<clipPath id="${k}"><circle cx="${cx}" cy="31" r="17.15"/></clipPath><g clip-path="url(#${k})">${inner}</g>`};
 const bandD=(cx,tilt)=>`<path d="M${pt([cx-19,19.5-tilt])} Q${pt([cx,11.6])} ${pt([cx+19,19.5+tilt])} L${pt([cx+19,27.4+tilt])} Q${pt([cx,19.9])} ${pt([cx-19,27.4-tilt])} Z" fill="${F}"/><path d="M${pt([cx-19,27.4-tilt])} Q${pt([cx,19.9])} ${pt([cx+19,27.4+tilt])}" fill="none" stroke="#1f1a14" stroke-opacity=".16" stroke-width=".9"/>`;
 const knot=(x,y,dir)=>{const X=o=>x+dir*o,t1=polyRound([[X(1.4),y],[X(-1.6),y+.3],[X(-7.8),y+9.6],[X(-3),y+11.4]],1.2),t2=polyRound([[X(-1),y+.4],[X(1.8),y+.4],[X(3),y+11.8],[X(-1.4),y+12.4]],1.2);
  return `<path d="${t2}" fill="${F}"/><path d="${t2}" fill="#1f1a14" opacity=".12"/><path d="${t1}" fill="${F}"/>`+`<ellipse cx="${x}" cy="${y}" rx="3.1" ry="2.7" fill="${F}"/><ellipse cx="${x}" cy="${y}" rx="3.1" ry="2.7" fill="#1f1a14" opacity=".1"/>`};
 if(v==='front')return dots+clipC(60,bandD(60,0));
 if(v==='tq')return dots+knot(43.6,24.4,-1)+clipC(58.6,bandD(58.6,-.6));
 if(v==='side')return dots+knot(45.2,24.6,-1)+clipC(61,`<path d="M40,22.6 Q61,13.6 80,17.4 L80,25.6 Q61,21.8 40,30.6 Z" fill="${F}"/><path d="M40,30.6 Q61,21.8 80,25.6" fill="none" stroke="#1f1a14" stroke-opacity=".16" stroke-width=".9"/>`);
 const backD=cx=>`<path d="M${pt([cx-19,21.4])} Q${pt([cx,16.4])} ${pt([cx+19,21.4])} L${pt([cx+19,29])} Q${pt([cx,24.4])} ${pt([cx-19,29])} Z" fill="${F}"/><path d="M${pt([cx-19,29])} Q${pt([cx,24.4])} ${pt([cx+19,29])}" fill="none" stroke="#1f1a14" stroke-opacity=".16" stroke-width=".9"/>`;
 if(v==='rq')return dots+clipC(60.8,backD(60.8))+knot(56,26.4,-1);
 if(v==='back')return dots+clipC(60,backD(60))+knot(60,26.6,-1);
 return ''}


{const W=(fn,v)=>P=>{if(P.pumpkin)return fn(P);const Q=NEWHAIR[P.hairStyle]?Object.assign({},P,{hairStyle:'none'}):(P.hairStyle==='messy'&&P.hat&&P.hat.k!=='visor')?Object.assign({},P,{hairStyle:'short'}):P;return hairBack(P,v)+fn(Q)+hairCap(P,v)+beardV(P,v)+zincV(P,v)+glassesV(P,v)+headwear(P,v)+hatV(P,v)};
 headFront=W(headFront,'front');headTQ=W(headTQ,'tq');headSide=W(headSide,'side');headRQ=W(headRQ,'rq');headBack=W(headBack,'back');
 const _ht=headTop;headTop=P=>{const Q=NEWHAIR[P.hairStyle]?Object.assign({},P,{hairStyle:'none'}):P;return _ht(Q)+hairTop(P)+hatTop(P)};}


function handPos(P,v,side){const g=BG[P.body],L=46,arm=g.arm,hp=(sh,rot)=>[sh[0]-Math.sin(rot*Math.PI/180)*L,sh[1]+Math.cos(rot*Math.PI/180)*L];
 const tqS=g.shw?[[61-g.shw*.9+5,58],[61+g.shw*.9-5,58]]:[[g.sh[0][0]+2.5,58],[g.sh[1][0]-3,58]],rqS=g.shw?[[59-g.shw*.9+5,58],[59+g.shw*.9-5,58]]:[[g.sh[0][0]+3,58],[g.sh[1][0]-2.5,58]];
 const R=side!=='L';
 if(v==='front')return R?hp(g.sh[0],arm):hp(g.sh[1],-arm);
 if(v==='tq')return R?hp(tqS[0],arm):hp(tqS[1],-arm);
 if(v==='rq')return R?hp(rqS[1],-arm):hp(rqS[0],arm);
 if(v==='back')return R?hp(g.sh[1],-arm):hp(g.sh[0],arm);
 if(v==='side')return [60,104];
 const tw={pillw:[41,79],rects:[38,82],rects36:[37,83],rects38:[36,84],rects40:[35,85],rectsE:[31,89]}[P.body]||[38,82];return R?[tw[0]+3.5,118]:[tw[1]-3.5,118]}

const OUT={front:{R:-1,L:1},tq:{R:-1,L:1},rq:{R:1,L:-1},back:{R:1,L:-1},side:{R:1,L:1},top:{R:-1,L:1}};


function boardVert(B,cx,w,top,bot){const c1=col(B.c||'white'),c2=col(B.c2||'brand'),st=B.stripe||c2;{const d=B.long?`M${pt([cx,top])} C${pt([cx+w*.5,top])} ${pt([cx+w*.5,top+8])} ${pt([cx+w*.5,top+30])} L${pt([cx+w*.5,bot-w*.5])} A${r1(w*.5)} ${r1(w*.5)} 0 0 1 ${pt([cx-w*.5,bot-w*.5])} L${pt([cx-w*.5,top+30])} C${pt([cx-w*.5,top+8])} ${pt([cx-w*.5,top])} ${pt([cx,top])} Z`
   :`M${pt([cx,top])} C${pt([cx+w*.18,top+6])} ${pt([cx+w*.5,top+34])} ${pt([cx+w*.5,top+62])} L${pt([cx+w*.5,bot-6])} Q${pt([cx+w*.5,bot])} ${pt([cx+w*.5-6,bot])} L${pt([cx-w*.5+6,bot])} Q${pt([cx-w*.5,bot])} ${pt([cx-w*.5,bot-6])} L${pt([cx-w*.5,top+62])} C${pt([cx-w*.5,top+34])} ${pt([cx-w*.18,top+6])} ${pt([cx,top])} Z`;
  const k=uid(),L=bot-top;return `<clipPath id="${k}"><path d="${d}"/></clipPath>`+pth(d,c1)+`<g clip-path="url(#${k})">`+rr(cx-w,top+L*(B.long?.21:.37),w*2,5,0,st)+rr(cx-w,top+L*(B.long?.21:.37)+8,w*2,2,0,st,{op:.7})+rr(cx+w*.5-2.4,top,2.4,L,0,c2,{op:.55})+rr(cx-.5,top,1,L,0,'#1f1a14',{op:.18})+`</g>`}}
function boardV(B,v,H,o){const w=B.long?20:17,top=B.long?-6:34,bot=186,c1=col(B.c||'white'),c2=col(B.c2||'brand'),st=B.stripe||c2;const vert=(cx,ww)=>boardVert(B,cx,ww,top,bot);
 if(v==='side'){const x0=B.long?-14:4,x1=B.long?128:116,y=94,h=B.long?15:13,d=B.long?`M${pt([x0+h*.5,y])} L${pt([x1-26,y])} C${pt([x1-8,y])} ${pt([x1,y+3])} ${pt([x1,y+h*.5])} C${pt([x1,y+h-3])} ${pt([x1-8,y+h])} ${pt([x1-26,y+h])} L${pt([x0+h*.5,y+h])} A${r1(h*.5)} ${r1(h*.5)} 0 0 1 ${pt([x0+h*.5,y])} Z`
   :`M${pt([x0+5,y])} L${pt([x1-36,y])} C${pt([x1-14,y])} ${pt([x1-2,y+h*.4])} ${pt([x1,y+h*.5])} C${pt([x1-2,y+h*.6])} ${pt([x1-14,y+h])} ${pt([x1-36,y+h])} L${pt([x0+5,y+h])} Q${pt([x0,y+h])} ${pt([x0,y+h-5])} L${pt([x0,y+5])} Q${pt([x0,y])} ${pt([x0+5,y])} Z`;
  const k=uid();return `<g transform="rotate(-5 60 100)">`+pth(polyRound([[x0+6,y+h],[x0+15,y+h],[x0+8,y+h+8]],1.4),c2)+`<clipPath id="${k}"><path d="${d}"/></clipPath>`+pth(d,c1)+`<g clip-path="url(#${k})">`+rr(x0+(B.long?44:30),y-2,5,h+4,0,st)+rr(x0,y+h-3,x1-x0,3,0,c2,{op:.55})+`</g></g>`}
 if(v==='top'){const cx=H[0]+o*9.5,L=B.long?124:100,y0=104-L*.45;return `<g>${rr(cx-w*.5,y0,w,L,w*.5,c1,{sh:1})}${rr(cx-.5,y0+4,1,L-8,.5,'ink',{op:.18})}${rr(cx-w*.5,y0+L*.36,w,4,0,st)}</g>`}
 const cx=H[0]+o*4,ww=(v==='tq'||v==='rq')?w*.86:w;return vert(cx,ww)}
function rodV(R,v,H,o,P){const rc=col(R.c||'ink'),bob=col(R.bob||'brand');
 if(v==='top'&&P&&P.rodHold){const tip=[64,178];return SVGL(`M${pt([59,111])} L${pt(tip)}`,rc,2.2)+c(60,126,3.2,'#8a8a86')+c(60,126,1.2,'ink')+SVGL(`M${pt(tip)} Q${pt([70,182])} ${pt([74,180])}`,'ink',.7,.55)+c(75,180,3.4,bob)+pl(71.8,177,6.4,2.8,'cream')}
 if(v==='top'){const tip=[H[0]+o*12,H[1]+66];return SVGL(`M${pt([H[0]-o*1,H[1]-8])} L${pt(tip)}`,rc,2.2)+c(tip[0],tip[1]+4,3.6,bob)+c(H[0],H[1]+4,2.8,'#8a8a86')}
 if(v==='side'){const b=[H[0]-10,H[1]+16],tip=[H[0]+66,6];return SVGL(`M${pt(b)} L${pt(tip)}`,rc,2.2)+SVGL(`M${pt(tip)} L${pt([tip[0],62])}`,'ink',.7,.55)+c(tip[0],66,4,bob)+pl(tip[0]-3.6,62,7.2,3.2,'cream')+c(H[0]-2,H[1]+5,3.4,'#8a8a86')+c(H[0]-2,H[1]+5,1.3,'ink')}
 const b=[H[0]-o*3,H[1]+17],tip=[H[0]+o*32,4];return SVGL(`M${pt(b)} L${pt(tip)}`,rc,2.2)+SVGL(`M${pt(tip)} L${pt([tip[0],64])}`,'ink',.7,.55)+c(tip[0],68,4,bob)+pl(tip[0]-3.6,64,7.2,3.2,'cream')+c(H[0]+o*1.5,H[1]+8,3.4,'#8a8a86')+c(H[0]+o*1.5,H[1]+8,1.3,'ink')}
function tubeV(T,v,H,o){const c1=col(T.c||'#ef6a2f'),band=(x,y,w)=>rr(x,y,w,2.6,1,'white',{op:.75});
 if(v==='top')return `<g transform="rotate(${o*-14} ${H[0]} ${H[1]})">${rr(H[0]-4.6,H[1]-4,9.2,58,4.6,c1,{sh:1})}${band(H[0]-4.6,H[1]+14,9.2)}</g>`;
 return `<g transform="rotate(${v==='side'?6:o*7} ${H[0]} ${H[1]})">${SVGL(`M${pt([H[0],H[1]-6])} Q${pt([H[0]-o*8,H[1]-30])} ${pt([H[0]-o*2,H[1]-50])}`,c1,1.4,.9)}${rr(H[0]-4.6,H[1]-6,9.2,66,4.6,c1,{sh:1})}${band(H[0]-4.6,H[1]+12,9.2)}${band(H[0]-4.6,H[1]+40,9.2)}</g>`}
function ringV(Rg,v,H,o){const c1=col(Rg.c||'brand');
 if(v==='side')return rr(H[0]-4.2,H[1]-6,8.4,30,4.2,c1,{sh:1})+rr(H[0]-4.2,H[1]+1,8.4,3.4,1.4,'cream')+rr(H[0]-4.2,H[1]+14,8.4,3.4,1.4,'cream');
 const x=H[0]+o*6,y=H[1]+9;if(v==='top')return `<ellipse cx="${x}" cy="${y}" rx="11" ry="11" fill="none" stroke="${c1}" stroke-width="6.4"/>`+`<ellipse cx="${x}" cy="${y}" rx="11" ry="11" fill="none" stroke="#fbf6ec" stroke-width="6.4" stroke-dasharray="5.5 11.8"/>`;
 return ring(x,y,12,7,c1)+ring(x,y,12,7,'cream','6 12.85')}
function holdV(k,P,v,H,o,cc){const x=H[0],y=H[1],c1=col(cc||'teal'),cd=darker(c1);
 if(v==='top'){if(k==='bucket')return c(x,y+3,7,cd)+c(x,y+3,5.6,c1);if(k==='tackle'||k==='cooler')return rr(x-9,y-1,18,13,3,c1)+rr(x-9,y-1,18,4,2,'white',{op:k==='cooler'?.9:.25});if(k==='ball')return c(x+o*6,y,8.5,'white')+clipRect(x+o*6-9,y-9,9,18,c(x+o*6,y,8.5,c1));if(k==='book')return rr(x+o*2-5,y-2,10,13,1.5,c1);if(k==='mug')return c(x+o*2,y,3.4,c1);if(k==='umbrella')return rr(x-3,y-46,6,70,3,c1)+rr(x-3,y-46,6,8,3,cd);return ''}
 if(k==='bucket')return SVGL(`M${pt([x-6.4,y+6])} Q${pt([x,y-4])} ${pt([x+6.4,y+6])}`,'ink',1,.7)+pth(polyRound([[x-7.4,y+6.5],[x+7.4,y+6.5],[x+5.8,y+21],[x-5.8,y+21]],1.6),c1)+rr(x-7.8,y+5.2,15.6,2.8,1.4,cd);
 if(k==='tackle')return rr(x-2.6,y-1.6,5.2,4,1.6,'ink',{op:.7})+rr(x-10,y+2,20,13,2.6,c1,{sh:1})+rr(x-10,y+2,20,4.4,2,cd)+rr(x-2,y+3,4,2.6,1,'sun');
 if(k==='cooler')return rr(x-2.6,y-1.6,5.2,4,1.6,'ink',{op:.7})+rr(x-11,y+2,22,16,3,c1,{sh:1})+rr(x-11.5,y+1.4,23,5,2.2,'white');
 if(k==='mug'){const mx=x+o*2.5;return rr(mx-3.6,y-7,7.2,9,1.8,c1)+ring(mx+o*4.6,y-2.6,2.2,1.4,c1)+rr(mx-3.6,y-7,7.2,2,1,'white',{op:.3})}
 if(k==='book'){const bx=x+o*1.5;return rr(bx-5.4,y-5,10.8,14,1.6,c1)+rr(bx-5.4+(o>0?9:0),y-4,1.6,12,.8,'cream')}
 if(k==='ball'){const bx=x+o*7,by=y-3,r=9.4,id=uid();return `<clipPath id="${id}"><circle cx="${bx}" cy="${by}" r="${r}"/></clipPath>`+c(bx,by,r,'white')+`<g clip-path="url(#${id})">`+`<path d="M${bx},${by} L${bx-r*1.2},${by-r*.6} L${bx-r*.3},${by-r*1.3} Z" fill="${c1}"/><path d="M${bx},${by} L${bx+r*1.3},${by-r*.1} L${bx+r*.7},${by+r*1.2} Z" fill="${col('sun')}"/><path d="M${bx},${by} L${bx-r*.4},${by+r*1.3} L${bx-r*1.3},${by+r*.4} Z" fill="${col('teal')}"/></g>`+c(bx,by,2.4,'white')+shade(`<circle cx="${bx}" cy="${by}" r="${r}"/>`,bx-r,by-r,r*2,r*2)}
 if(k==='umbrella'){const ux=x;return rr(ux-1.1,y-70,2.2,152,1.1,'#8a8a86')+`<path d="M${ux},${y-114} C${ux+6},${y-100} ${ux+6.5},${y-80} ${ux+4.6},${y-60} L${ux-4.6},${y-60} C${ux-6.5},${y-80} ${ux-6},${y-100} ${ux},${y-114} Z" fill="${c1}"/>`+rr(ux-5,y-88,10,5,2,'white',{op:.8})+rr(ux-4.4,y-72,8.8,4,2,'white',{op:.8})+c(ux,y-115,1.8,cd)}
 return ''}
function propFor(P,v,side){const p=side==='L'?P.propL:P.propR;if(!p)return '';let H=handPos(P,v,side),o=OUT[v][side];
 if(v==='top'&&P.rodHold&&side==='L'){const x=93,y=100;return e(x+2,y+6,11,9,'ink',{op:.1})+holdV(p.k,P,'top',[x,y],1,p.c)+(p.k==='bucket'?`<path d="M${x-6.5},${y+3} Q${x},${y-5} ${x+6.5},${y+3}" fill="none" stroke="#1f1a14" stroke-width="1" opacity=".55"/>`:'')}
 const s=p.k==='board'?boardV(p,v,H,o):p.k==='rod'?rodV(p,v,H,o,P):p.k==='tube'?tubeV(p,v,H,o):p.k==='ring'?ringV(p,v,H,o):holdV(p.k,P,v,H,o,p.c);
 return side==='L'&&(v==='side')?`<g style="filter:brightness(.82)">${s}</g>`:s}


function bikiniV(P,v,part){const B=P.bikini,c1=col(B.c),c2=col(B.c2||darker(B.c,.75)),bu=P.bust||1,k=VK(v),cx=VX(v),t0=61.2,t1=71.6+(bu-1)*1.8;let s='';
 const clipTo=(d,y0,y1,fill)=>{const id=uid();return `<clipPath id="${id}"><rect x="0" y="${y0}" width="120" height="${y1-y0}"/></clipPath><path d="${d}" fill="${fill}" clip-path="url(#${id})"/>`};
 if(v==='side'){if(part==='top')return '';const d=femSideD(60,P.wk,P.hk,P.bust,P.seat);s+=clipTo(d,64.2,t1,c1)+clipTo(d,100.5,120,c1)+SVGL(`M66,${64.6} L61.6,58.4`,c1,1.3)+c(60-seatX(P.wk,P.hk,P.seat)*.55,103.4,1.8,c2);return s}
 const D=femTorsoD(cx,k,P.wk,P.hk);if(part!=='top'){const o=v==='tq'?1.5:0;return clipTo(D[1],100.5,120,c1)+(v==='front'||v==='tq'?`<path d="M${cx-6*k+o},100.8 Q${cx+o},106.4 ${cx+6*k+o},100.8" fill="none" stroke="${c2}" stroke-width="1" opacity=".55"/>`:'')}
 s+=clipTo(D[0],t0,Math.min(t1,84),c1);
 if(v==='front'||v==='tq'){const o=v==='tq'?1.5:0;s+=SVGL(`M${cx-4.6*k+o},${t0+.4} L${cx-2.4+o},51.4`,c1,1.3)+SVGL(`M${cx+4.6*k+o},${t0+.4} L${cx+2.4+o},51.4`,c1,1.3)+c(cx+o,(t0+t1)/2,2.2,c2)+rr(cx-1.2+o,t0,2.4,t1-t0,1.2,c2,{op:.5});}
 else s+=c(cx,(t0+t1)/2,2.2,c2)+SVGL(`M${cx},${(t0+t1)/2} l-2,5 M${cx},${(t0+t1)/2} l2,5`,c2,1.2);
 return s}

function bodyBits(P,v){let s='';const g=BG[P.body],fem=P.body==='pillw',k=VK(v),cx=VX(v),w=fem?25:(g.w||34),x0=cx-w*k/2,x1=cx+w*k/2,o=v==='tq'?1.5:0;
 if(P.vest&&v!=='top'){const vc=col(P.vest),vd=darker(vc,.8);
  if(v==='front'||v==='tq'){const pw=12.5*k;s+=rr(x0-.6,53,pw,52,5,vc)+rr(x1-pw+.6,53,pw,52,5,vc)+rr(x0+2.2,74,pw-5,9,2,vd)+rr(x1-pw+2.8,74,pw-5,9,2,vd)+rr(x0+2.2,88,pw-5,9,2,vd)+rr(x1-pw+2.8,88,pw-5,9,2,vd);}
  else if(v==='side'){const cb=(P.chest||0)*2.2;s+=rr(60-w*.62/2-.6,53,w*.62+1.2+cb,52,6,vc)+rr(60+w*.62/2-8+cb,76,7,9,2,vd);}
  else s+=rr(x0-.6,53,w*k+1.2,52,6,vc)+rr(cx-8,58,16,10,3,vd,{op:.6});}
 if(P.polo&&(v==='front'||v==='tq')){const pc=col(P.polo);s+=`<path d="${polyRound([[53.4+o,51],[60+o,51],[58+o,57.6]],1.1)}" fill="${pc}"/><path d="${polyRound([[60+o,51],[66.6+o,51],[62+o,57.6]],1.1)}" fill="${pc}"/>`+rr(59.3+o,55,1.4,12,.7,'ink',{op:.22})+c(60+o,60,1.1,'cream',{op:.8})+c(60+o,64.6,1.1,'cream',{op:.8});}
 if(P.scoop&&(v==='front'||v==='tq'))s+=`<path d="M${52.6+o},50.6 Q${60+o},65 ${67.4+o},50.6 Z" fill="${col(P.skin)}"/>`;
 if(P.panel&&v!=='top'){const pc=col(P.panel);if(v==='front'||v==='tq')s+=rr(x0+1.5,57,w*k-3,14,5,pc);else if(v==='side')s+=rr(60-w*.62/2,57,w*.62,14,5,pc);else s+=rr(59.3,53,1.4,44,.7,'white',{op:.5})+rr(57.8,95,4.4,7,1.6,'white',{op:.7})+rr(x0+1.5,57,w*k-3,10,4,pc,{op:.9});}
 if(P.cross){const W='white';if(v==='front'||v==='tq')s+=rr(64.6+o,61,3,10,.8,W)+rr(61.1+o,64.5,10,3,.8,W);else if(v==='back'||v==='rq')s+=rr(v==='rq'?57.5:58.5,62,3.4,15,1,W)+rr(v==='rq'?52.6:53.5,67.8,13.4,3.4,1,W);}
 if(P.bikini&&fem)s+=bikiniV(P,v,'bottom');
 if(P.neck&&(v==='front'||v==='tq'||v==='side')){const n=P.neck,lc=col(n.c||'ink');
  if(v==='side'){const bx=fem?2.6*((P.bust||1)-1)+2.4:(P.chest||0)*2.2+(g.belly?3:0);s+=SVGL(`M62,51 L${68+bx},${n.k==='binoc'?70:72}`,lc,1.1,.85);s+=n.k==='binoc'?rr(66+bx,68,7.5,10,2.2,'ink')+rr(66+bx,68,7.5,2.4,1.2,'#5a5a56'):rr(66+bx,71,4.4,7,1.6,'#ece6d6');}
  else{s+=SVGL(`M${55.6+o},51 L${60+o},${n.k==='binoc'?70:71} L${64.4+o},51`,lc,1.1,.85);s+=n.k==='binoc'?rr(53.2+o,69,6.4,10,2.4,'ink')+rr(60.4+o,69,6.4,10,2.4,'ink')+rr(57.4+o,71.5,5.2,3,1,'#3a3a36')+rr(53.2+o,69,6.4,2.4,1.2,'#5a5a56')+rr(60.4+o,69,6.4,2.4,1.2,'#5a5a56'):rr(57.6+o,70.2,4.8,7.4,1.8,'#ece6d6')+c(60+o,75.4,1,'ink',{op:.5});}}
 return s}
function towelV(P,v){const T=P.towel;if(!T||v==='top')return '';const g=BG[P.body],c1=col(T.c),c2=col(T.c2||'white');
 const strip=(x,y,w,h)=>{const k=uid();return `<clipPath id="${k}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/></clipPath>`+rr(x,y,w,h,4,c1,{sh:1})+`<g clip-path="url(#${k})">${rr(x,y+h-12,w,3,0,c2)}${rr(x,y+h-7,w,3,0,c2)}</g>`};
 if(v==='front')return strip(g.sh[0][0]-6,49,12,44);if(v==='tq'){const x=(g.shw?61-g.shw*.9+5:g.sh[0][0]+2.5);return strip(x-6,49,11,44)}
 if(v==='side')return strip(55,49,10.5,40);if(v==='rq'){const x=(g.shw?59+g.shw*.9-5:g.sh[1][0]-2.5);return strip(x-5,49,11,56)}
 return strip(g.sh[1][0]-6,49,12,58)}


let basePerson=null;
{const _person=person;basePerson=_person;person=function(P,v){if(P.body&&P.body!=='pillw'&&BG[P.body]&&!BG[P.body].belly&&!P.cat&&P.top&&col(P.top)===col(P.skin))P=Object.assign({},P,{ripped:1});if(P.seat&&P.body==='pillw')P=Object.assign({},P,{hk:(P.hk||1)*(1+(P.seat-1)*.05)});if(v==='lie')return lieView(P);if(v==='surf')return surfView(P);if(v==='stand')return standView(P);const X0=P.x||{},has=P.propR||P.propL||P.vest||P.polo||P.scoop||P.panel||P.cross||P.neck||P.towel||P.bikini;
 let Q=P;if(has){const X={
   under:vv=>(X0.under?X0.under(vv):'')+(vv==='side'?propFor(P,vv,'L'):propFor(P,vv,'R')+propFor(P,vv,'L')),
   body:vv=>(X0.body?X0.body(vv):'')+bodyBits(P,vv),
   bodyB:vv=>(X0.bodyB?X0.bodyB(vv):'')+bodyBits(P,vv),
   mid:vv=>(X0.mid?X0.mid(vv):'')+(vv==='side'?propFor(P,vv,'R'):''),
   over:vv=>(X0.over?X0.over(vv):'')+(P.bikini&&P.body==='pillw'?bikiniV(P,vv,'top'):'')+towelV(P,vv)};Q=Object.assign({},P,{x:X})}
 const out=_person(Q,v);return P.scale&&P.scale!==1?`<g transform="translate(60 190) scale(${P.scale}) translate(-60 -190)">${out}</g>`:out}}


function lieView(P){const T=P.lie||{},tc=col(T.c||'sun'),t2=col(T.c2||'white'),k=uid();
 let s=`<clipPath id="${k}"><rect x="25" y="4" width="70" height="190" rx="5"/></clipPath>`+rr(27.4,7,70,190,5,'ink',{op:.08})+rr(25,4,70,190,5,tc)+`<g clip-path="url(#${k})">`+[14,22,170,178].map(y=>rr(25,y,70,4,0,t2)).join('')+`</g>`;
 const Q=Object.assign({},P,{sleep:1,armOut:12,propR:null,propL:null,towel:null,neck:null,hat:P.hat&&P.hat.k==='visor'?P.hat:null,x:{},scale:1});
 const body=basePerson(Object.assign({},Q,{x:{body:vv=>bodyBits(Q,vv),over:vv=>Q.bikini?bikiniV(Q,vv,'top'):''}}),'front').replace(/<g class="shadow"[^>]*>[\s\S]*?<\/g>/,'');
 s+=e(63,104,24,74,'ink',{op:.08})+`<g transform="translate(0 -2)">${body}</g>`;
 if(P.hat&&P.hat.k!=='visor')s+=`<g transform="translate(43 -72) scale(.82)">${hatTop(P)}</g>`;
 const ex=T.extra;if(ex==='book')s+=`<g transform="rotate(-12 86 138)">${rr(79,130,15,19,2,T.ec||'plum')}${rr(86,130,1.4,19,.7,'cream',{op:.8})}</g>`;
 if(ex==='drink')s+=c(88,150,5.2,'white')+c(88,150,4,T.ec||'coral')+rr(87.4,141,1.2,9,.6,'ink',{op:.6});
 if(ex==='ball')s+=`<g transform="translate(36 30)">${holdV('ball',P,'front',[46,112],1,T.ec||'brand')}</g>`;
 if(ex==='phone')s+=rr(82,136,8,14,2,'ink')+rr(83,137.4,6,11,1.2,'sky',{op:.8});
 s+=`<g opacity=".95">${rr(44,196,9,4.6,2.3,P.sandal||'brown')}${rr(56,197,9,4.6,2.3,P.sandal||'brown')}</g>`;
 return s}


{const _cat=cat;cat=function(K,v){if(v==='tq'||v==='rq')return catQ(K,v);return _cat(K,v)}}
function catQ(K,v){let s='';const b=K.base,ptc=K.point||b,spots=K.spots||[];
 if(v==='tq'){s+=ground(62,30)+G('tail',30,180,pl(18,176,40,10,ptc)+pl(14,146,10,40,ptc)+c(19,146,5,ptc));
  s+=`<g style="filter:brightness(.86)">${pl(70,176,12,10,b)}</g>`+pw(58,92,60,94,b,{sh:1})+catSpots(K,'tq');
  if(K.bib)s+=c(64,118,13.5,'cream');
  s+=pl(48,176,12,10,b)+pl(62,176,12,10,b)+pw(80,52,19,24,ptc,{rot:26})+pw(80,58.5,9.5,13.5,'pink',{rot:26})+pw(47,49,22,26,ptc,{rot:-16})+pw(47.5,56,11,15,'pink',{rot:-16})+c(64,82,24,b,{sh:1});
  if(K.mask)s+=e(66,86,14,11.5,K.mask)+e(66.5,93,6.6,5.6,b);
  s+=c(56,82,3.8,'eyeB')+e(73.6,82,3,3.7,'eyeB')+c(56.6,82,1.7,'ink')+e(74,82,1.3,1.7,'ink')+pw(66.5,88,6,5,'pink',{rot:180})+c(50.5,90,3.4,'cheek',{op:.3})+e(77.5,90,2.4,3.2,'cheek',{op:.28});
  s+=rr(49,103,30,6,3,K.collar)+c(65,111,4,'sun');return s}
 s+=ground(60,30)+pw(61,92,62,94,b,{sh:1})+catSpots(K,'rq');
 s+=G('tail',62,180,pl(56,176,46,10,ptc)+pl(96,146,10,40,ptc)+c(101,146,5,ptc))+pw(41,51,21,25,ptc,{rot:-26})+pw(75,51,22,26,ptc,{rot:18})+c(57,82,24.5,b,{sh:1})+e(34.5,89,2.6,4,'cheek',{op:.0})+rr(43,103,30,6,3,K.collar);
 return s}


function catSpots(K,v){if(!K.spotty)return '';const B={front:['p',60,92,64,94],back:['p',60,92,64,94],tq:['p',58,92,60,94],rq:['p',61,92,62,94],side:['r',14,102,88,40],top:['e',60,104,30,24]}[v];if(!B)return '';
 const L={front:[[-.52,.6,6.5],[.5,.74,6],[.36,.5,3.6],[-.34,.88,4.2],[.18,.93,3]],back:[[-.32,.32,7.5],[.36,.5,7],[-.06,.7,6],[.5,.82,4.4],[-.56,.6,4],[.1,.45,2.6]],
  tq:[[-.55,.62,6.2],[.48,.76,5.6],[.34,.52,3.4],[-.3,.9,4]],rq:[[-.3,.34,7.2],[.4,.52,6.6],[-.04,.72,5.6],[.52,.84,4.2],[-.55,.62,3.8]],
  side:[[-.62,.32,7.5],[-.12,.5,8],[.36,.28,5.2],[.14,.86,4.4],[-.4,.8,4],[.6,.62,3]],top:[[-.5,.38,6],[.36,.52,6.8],[-.12,.78,5],[.56,.22,4],[.1,.25,3]]}[v];
 let d;if(B[0]==='p')d=pawnD(B[1],B[2],B[3],B[4]);else if(B[0]==='r')d=`M${B[1]+20},${B[2]} H${B[1]+B[3]-20} A20 20 0 0 1 ${B[1]+B[3]-20},${B[2]+B[4]} H${B[1]+20} A20 20 0 0 1 ${B[1]+20},${B[2]} Z`;else d=`M${B[1]-B[3]},${B[2]} A${B[3]} ${B[4]} 0 1 0 ${B[1]+B[3]},${B[2]} A${B[3]} ${B[4]} 0 1 0 ${B[1]-B[3]},${B[2]} Z`;
 const id=uid(),box=B[0]==='p'?[B[1]-B[3]/2,B[2],B[3],B[4]]:B[0]==='r'?[B[1],B[2],B[3],B[4]]:[B[1]-B[3],B[2]-B[4],B[3]*2,B[4]*2];
 const flip=v==='back'||v==='rq'?-1:1;
 return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">`+L.map(([u,w,r])=>{const x=box[0]+box[2]*(.5+flip*u*.5),y=box[1]+box[3]*w;return c(x,y,r,K.spot)+c(x+r*.9,y-r*.7,r*.32,K.spot)}).join('')+`</g>`}


function surfView(P){const B=P.propR&&P.propR.k==='board'?P.propR:{k:'board',c:'white'},long=!!B.long,top=long?-22:-12,bot=long?204:192,w=long?36:31,k=uid();
 let s=`<clipPath id="${k}"><rect x="-6" y="-24" width="132" height="230" rx="14"/></clipPath><g clip-path="url(#${k})">`+rr(-6,-24,132,230,14,'#8fcbe0')+[[-2,0],[70,30],[8,66],[84,108],[-4,140],[78,170]].map(([x,y])=>`<path d="M${x},${y} q6,-4 12,0 t12,0" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>`).join('')+`</g>`;
 s+=`<g transform="translate(2 3)" opacity=".12">${boardVert({c:'#1f1a14',c2:'#1f1a14',stripe:'#1f1a14',long},60,w,top,bot)}</g>`+boardVert(B,60,w,top,bot);
 const Q=Object.assign({},P,{propR:null,propL:null,towel:null,neck:null,hat:null,x:{body:vv=>bodyBits(Object.assign({},P,{neck:null}),vv),bodyB:vv=>bodyBits(Object.assign({},P,{neck:null}),vv),over:vv=>P.bikini?bikiniV(P,vv,'top'):''},armOutL:146,armOutR:18,scale:1});
 const body=basePerson(Q,'back').replace(/<ellipse cx="60" cy="191"[^>]*\/>/,'');
 const hl=handPos(Object.assign({},Q),'back','L');
 s+=e(62,108,22,70,'#1f1a14',{op:.1})+`<g transform="translate(0 ${long?-4:-8})">${body}</g>`;
 const a=(146+BG[P.body].arm)*Math.PI/180,sh=BG[P.body].sh[0],hx=sh[0]-Math.sin(a)*46,hy=sh[1]+Math.cos(a)*46+(long?-4:-8);
 s+=`<ellipse cx="${r1(hx-4)}" cy="${r1(hy-2)}" rx="7" ry="3.2" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/><ellipse cx="${r1(hx-6)}" cy="${r1(hy-2)}" rx="11" ry="5.4" fill="none" stroke="#fff" stroke-width="1" opacity=".4"/>`;
 return s}


function standView(P){const red=col('guard'),redD=col('guardD'),wood='#f4efe6',k=uid();let s=`<clipPath id="${k}"><rect x="-6" y="-10" width="132" height="216" rx="14"/></clipPath><g clip-path="url(#${k})">`+rr(-6,-10,132,216,14,'#ecdcb8')+[[6,14],[92,40],[14,150],[96,176],[40,192]].map(([x,y])=>c(x,y,1.2,'#d4bf93')).join('')+`</g>`;
 const post=(x1,y1,x2,y2,w)=>{const L=Math.hypot(x2-x1,y2-y1),a=Math.atan2(x2-x1,y2-y1)*-180/Math.PI;return `<g transform="rotate(${r1(a)} ${x1} ${y1})">${rr(x1-w/2,y1,w,L,w/2,redD)}</g>`};
 s+=`<g transform="translate(8 7)" opacity=".13">${rr(26,32,68,96,8,'#1f1a14')}${rr(40,128,40,58,4,'#1f1a14')}</g>`;
 s+=post(30,40,12,16,6)+post(90,40,108,16,6)+post(30,122,12,150,6)+post(90,122,108,150,6);
 s+=rr(44,126,32,62,3,redD)+[136,148,160,172,184].map(y=>rr(44,y,32,3.4,1.7,wood)).join('')+rr(42,126,4.6,64,2.3,red)+rr(73.4,126,4.6,64,2.3,red);
 s+=rr(26,32,68,96,8,red,{sh:1})+rr(33,44,54,70,5,wood)+rr(30,114,60,10,4,'#e3d9c6');
 s+=rr(30,34,60,18,6,wood)+rr(57.5,36.4,5,13.2,1,red)+rr(53.4,40.5,13.2,5,1,red);
 const Q=Object.assign({},P,{propR:null,propL:null,neck:null});const g=BG[P.body],fem=P.body==='pillw',top=col(P.bikini?P.skin:P.top),bot=col(P.shorts||P.legType==='pants'?P.bottom:(P.bikini||P.scoop?P.top:P.skin)),skin=col(P.skin);
 const tw=fem?36:Math.min(44,(g.w||36)+4);
 s+=pl(47.6,84,11.4,32,bot)+pl(61,84,11.4,32,bot)+(P.shorts?'':'')+c(53.3,112,5.6,skin)+c(66.7,112,5.6,skin)+e(53.3,118.6,4.6,3.2,skin)+e(66.7,118.6,4.6,3.2,skin);
 if(P.shorts)s+=rr(47,84,12.6,18,5,bot)+rr(60.4,84,12.6,18,5,bot);
 s+=rr(60-tw/2,62,tw,22,9,top,{sh:1});
 const ac=P.sleeve==='long'?top:skin,am=P.arms||1;s+=pl(60-tw/2-6*am,64,9*am,28,ac)+pl(60+tw/2-3*am,64,9*am,28,ac)+c(60-tw/2-1.6,94,4.6*(1+(am-1)*.45),skin)+c(60+tw/2+1.6,94,4.6*(1+(am-1)*.45),skin);
 s+=`<g transform="translate(0 -28)">${headTop(Q)}</g>`;
 s+=`<g transform="rotate(4 92 80)">${rr(87.6,46,9,66,4.5,'#ef6a2f',{sh:1})}${rr(87.6,60,9,3,1,'white',{op:.75})}${rr(87.6,92,9,3,1,'white',{op:.75})}</g>`;
 return s}



/* ---------- boats: a small 3D kit drawn flat in Tarver colours ----------
   Every boat is a list of solids (hulls, rounded blocks, cylinders, beams) in boat space:
   x to starboard, y to the bow, z up, in character units (a person is about 160 tall, 40 across the shoulders).
   One model gives every view: the eight-way turn, the aerial and the aerial underway. Nothing moves. */
const BT={};
BT.LIGHT=(()=>{const v=[-.45,.55,.7],l=Math.hypot(...v);return v.map(x=>x/l)})();
BT.newell=pts=>{let x=0,y=0,z=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1])}const l=Math.hypot(x,y,z)||1;return [x/l,y/l,z/l]};
/* a solid between a bottom ring and a top ring (same point count, counter-clockwise from above) */
BT.solid=(bot,top,c,o={})=>{const F=[];const n=bot.length;
 if(!o.noSide)for(let i=0;i<n;i++){const j=(i+1)%n;F.push({p:[bot[i],bot[j],top[j],top[i]],c:o.sideC||c})}
 if(!o.noTop)F.push({p:top.slice(),c:o.topC||c,top:1});
 if(o.bottom)F.push({p:bot.slice().reverse(),c:o.sideC||c});
 F.forEach(f=>{f.L=o.layer||0;f.flat=o.flat});return F};
/* rounded rectangle in plan */
BT.rrect=(x0,x1,y0,y1,r)=>{r=Math.max(.01,Math.min(r,(x1-x0)/2,(y1-y0)/2));const P=[],cs=[[x1-r,y0+r,-90],[x1-r,y1-r,0],[x0+r,y1-r,90],[x0+r,y0+r,180]];cs.forEach(([cx,cy,a0])=>{for(let k=0;k<=3;k++){const a=(a0+k*30)*Math.PI/180;P.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}});return P};
BT.lift=(P,z)=>P.map(p=>[p[0],p[1],typeof z==='function'?z(p):z]);
BT.box=(x0,x1,y0,y1,z0,z1,c,o={})=>{const P=BT.rrect(x0,x1,y0,y1,o.r==null?3:o.r);let top=BT.lift(P,z1);if(o.taper){const cx=(x0+x1)/2,cy=(y0+y1)/2,k=o.taper;top=P.map(p=>[cx+(p[0]-cx)*k,cy+(p[1]-cy)*(o.taperY||k)+(o.shiftY||0),z1])}return BT.solid(BT.lift(P,z0),top,c,o)};
BT.cyl=(cx,cy,r,z0,z1,c,o={})=>{const n=o.n||12,P=[];for(let i=0;i<n;i++){const a=i/n*2*Math.PI;P.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}const t=o.r2==null?r:o.r2;return BT.solid(BT.lift(P,z0),P.map((p,i)=>[cx+t*Math.cos(i/n*2*Math.PI),cy+t*Math.sin(i/n*2*Math.PI),z1]),c,o)};
/* a square beam from a to b */
BT.beam=(a,b,w,c,o={})=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d)||1,u=d.map(x=>x/L);let s=Math.abs(u[2])>.9?[1,0,0]:[0,0,1];
 let p=[u[1]*s[2]-u[2]*s[1],u[2]*s[0]-u[0]*s[2],u[0]*s[1]-u[1]*s[0]];const pl=Math.hypot(...p);p=p.map(x=>x/pl);const q=[u[1]*p[2]-u[2]*p[1],u[2]*p[0]-u[0]*p[2],u[0]*p[1]-u[1]*p[0]];const h=w/2;
 const ring=o0=>[[1,1],[-1,1],[-1,-1],[1,-1]].map(([i,j])=>[o0[0]+p[0]*h*i+q[0]*h*j,o0[1]+p[1]*h*i+q[1]*h*j,o0[2]+p[2]*h*i+q[2]*h*j]);
 const A=ring(a),B=ring(b);const F=[];for(let i=0;i<4;i++){const j=(i+1)%4;F.push({p:[A[i],A[j],B[j],B[i]],c})}F.push({p:B.slice(),c});F.push({p:A.slice().reverse(),c});F.forEach(f=>{f.L=o.layer||3;f.beam=1});return F};
/* a hull: deck outline from a half-width curve, flared sides, a raked bow and a sheer that rises forward */
BT.hull=h=>{const L=h.L,W=h.W,n=h.n||14,hw=y=>{const t=(y+L/2)/L;if(h.square)return W/2*(t>.86?Math.max(.62,1-(t-.86)/.14*.38):1);
  const b=h.bowStart==null?.42:h.bowStart;if(t<b)return W/2*(h.transom==null?.86:h.transom+(1-(h.transom==null?.86:h.transom))*Math.pow(t/b,.5));const u=(t-b)/(1-b);return W/2*Math.max(0,1-Math.pow(u,h.bowPow||1.9))};
 const sheer=y=>{const t=(y+L/2)/L;return h.hs+(h.hb-h.hs)*Math.pow(t,h.sheerPow||2.2)};
 const ys=[];for(let i=0;i<=n;i++)ys.push(-L/2+L*i/n);
 if(h.double){/* pointed at both ends */}
 const side=ys.map(y=>{let w=hw(y);if(h.double){const t=(y+L/2)/L;w=W/2*Math.sin(Math.PI*Math.min(1,Math.max(0,t)))**.8}return [w,y]});
 const ring=[];side.forEach(p=>ring.push(p));for(let i=side.length-1;i>=0;i--){if(side[i][0]<.01)continue;ring.push([-side[i][0],side[i][1]])}
 const deck=ring.map(p=>[p[0],p[1],sheer(p[1])]);
 const wl=ring.map(p=>{const t=(p[1]+L/2)/L,rake=h.rake==null?.12:h.rake,y2=p[1]-Math.max(0,t-.6)/.4*rake*L-(h.double&&t<.4?-(0.4-t)/.4*rake*L:0);return [p[0]*(h.flare||.84),y2,0]});
 const F=[];const sub=BT.solid(wl,deck,h.c,{topC:h.rim||h.c,layer:0});sub.forEach(f=>{if(f.top){f.split=1;if(h.deckC)f.cAlt=h.deckC}});F.push(...sub);
 if(h.deckC&&h.rim&&h.rim!==h.c){const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),k=1.01;const r0=deck.map(p=>[p[0]*k,p[1]*k,p[2]-3]),r1=deck.map(p=>[p[0]*k,p[1]*k,p[2]+.2]);F.push(...BT.solid(r0,r1,h.rim,{noTop:1,layer:.3}))}
 if(h.boot){const k=1.006,bz=h.boot[0],bz2=h.boot[1];const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);const r0=wl.map((p,i)=>lerp(p,deck[i],bz/Math.max(1,deck[i][2]))),r1=wl.map((p,i)=>lerp(p,deck[i],Math.min(1,bz2/Math.max(1,deck[i][2]))));
  F.push(...BT.solid(r0.map(p=>[p[0]*k,p[1]*k,p[2]]),r1.map(p=>[p[0]*k,p[1]*k,p[2]]),h.bootC,{noTop:1,layer:.2}))}
 if(h.band){const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),k=1.008;const r0=wl.map((p,i)=>lerp(p,deck[i],h.band[0])),r1=wl.map((p,i)=>lerp(p,deck[i],h.band[1]));F.push(...BT.solid(r0.map(p=>[p[0]*k,p[1]*k,p[2]]),r1.map(p=>[p[0]*k,p[1]*k,p[2]]),h.bandC,{noTop:1,layer:.25}))}
 if(h.deckC){const d=h.inset==null?5:h.inset;const ins=ys.filter(y=>{const t=(y+L/2)/L;return t>.02&&t<(h.deckEnd||.9)}).map(y=>[Math.max(0,(h.double?W/2*Math.sin(Math.PI*((y+L/2)/L))**.8:hw(y))-d),y]);
  const dr=[];ins.forEach(p=>dr.push(p));for(let i=ins.length-1;i>=0;i--)dr.push([-ins[i][0],ins[i][1]]);const y0=ins[0][1]-d*.4;
  F.push(...BT.solid(dr.map(p=>[p[0],p[1]===ins[0][1]?y0:p[1],sheer(p[1])-.3]),dr.map(p=>[p[0],p[1]===ins[0][1]?y0:p[1],sheer(p[1])+.6]),h.deckC,{layer:.5,noSide:0}).map(f=>{f.aerialOnly=1;return f}))}
 F.sheer=sheer;F.hw=hw;F.wl=wl;F.deck=deck;return F};

/* ---- camera ---- */
BT.cam=(az,el)=>{const t=az*Math.PI/180,f=el*Math.PI/180;const c=[Math.sin(t)*Math.cos(f),Math.cos(t)*Math.cos(f),Math.sin(f)];const d=c.map(x=>-x);
 let r=[d[1]*1-0,0-d[0]*1,0];const rl=Math.hypot(...r)||1;r=r.map(x=>x/rl);const u=[r[1]*d[2]-r[2]*d[1],r[2]*d[0]-r[0]*d[2],r[0]*d[1]-r[1]*d[0]];
 return {c,P:p=>[p[0]*r[0]+p[1]*r[1]+p[2]*r[2],-(p[0]*u[0]+p[1]*u[1]+p[2]*u[2])],D:p=>p[0]*c[0]+p[1]*c[1]+p[2]*c[2]}};
BT.camTop={c:[0,0,1],P:p=>[p[0],-p[1]],D:p=>p[2]};
BT.shadeC=(f,n)=>{if(f.top&&n[2]>.6)return col(f.c);const l=Math.max(0,n[0]*BT.LIGHT[0]+n[1]*BT.LIGHT[1]+n[2]*BT.LIGHT[2]);const q=Math.round(l*3)/3;return darker(f.c,.82+.18*q)};
BT.clipY=(P,ya,yb)=>{const clip=(Q,keep,yv)=>{const R=[];for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],ia=keep(a[1]),ib=keep(b[1]);if(ia)R.push(a);if(ia!==ib){const t=(yv-a[1])/(b[1]-a[1]);R.push([a[0]+(b[0]-a[0])*t,yv,a[2]+(b[2]-a[2])*t])}}return R};return clip(clip(P,y=>y>=ya,ya),y=>y<=yb,yb)};
BT.splitTops=faces=>{const out=[];faces.forEach(f=>{if(!f.split){out.push(f);return}const ys=f.p.map(p=>p[1]),y0=Math.min(...ys),y1=Math.max(...ys),n=Math.max(4,Math.round((y1-y0)/14));for(let i=0;i<n;i++){const q=BT.clipY(f.p,y0+(y1-y0)*i/n,y0+(y1-y0)*(i+1)/n);if(q.length>=3)out.push(Object.assign({},f,{p:q,split:0,strip:1}))}});return out};
BT.faces=(faces,cam,aerial)=>{const out=[];(aerial?faces:BT.splitTops(faces.filter(f=>!f.aerialOnly).map(f=>f.cAlt?Object.assign({},f,{c:f.cAlt}):f))).forEach(f=>{const n=f.strip?[0,0,1]:BT.newell(f.p);const dot=aerial?n[2]:n[0]*cam.c[0]+n[1]*cam.c[1]+n[2]*cam.c[2];if(dot<=(aerial?.05:.015))return;
  const P=f.p.map(cam.P),D=f.p.reduce((a,p)=>a+cam.D(p),0)/f.p.length+(f.bias||0)*(aerial?1:.02);out.push({P,D,L:f.L||0,fill:BT.shadeC(f,n)})});
 out.sort((a,b)=>aerial?(a.D-b.D||a.L-b.L):(a.D-b.D));return out};
BT.path=P=>'M'+P.map(p=>r1(p[0])+','+r1(p[1])).join(' L')+' Z';
BT.draw=(faces)=>faces.map(f=>`<path d="${BT.path(f.P)}" fill="${f.fill}" stroke="${f.fill}" stroke-width="1.1" stroke-linejoin="round"/>`).join('');

/* ---- reusable fittings ---- */
const FIT={
 outboard:(y,x,c,big)=>{const s=big?1.3:1;return [...BT.box(x-6*s,x+6*s,y-14*s,y-1,6,34*s,c||'ink',{r:4*s,layer:1.2}),...BT.box(x-2.4,x+2.4,y-10*s,y-5,-2,8,darker(c||'ink',.8),{r:1,layer:1.1}),...BT.box(x-6.2*s,x+6.2*s,y-14.2*s,y-1,22*s,26*s,'#ffffff',{r:4*s,layer:1.25,noTop:1})]},
 tiller:(y,c)=>[...BT.box(-5,5,y-12,y,4,24,c||'ink',{r:3.5,layer:1.2}),...BT.beam([0,y-6,22],[0,y+20,20],2.4,'ink',{layer:1.3})],
 posts:(xs,ys,z0,z1,c,w)=>{const F=[];xs.forEach(x=>ys.forEach(y=>F.push(...BT.beam([x,y,z0],[x,y,z1],w||2.4,c,{layer:2}))));return F},
 roof:(x0,x1,y0,y1,z,c,t)=>BT.box(x0,x1,y0,y1,z,z+(t||3),c,{r:6,layer:3}),
 rod:(x,y,z,dx,dy,len,c)=>{const L=Math.hypot(dx,dy,1)||1;return BT.beam([x,y,z],[x+dx*len,y+dy*len,z+len*.92],1.4,c||'ink',{layer:3.5})},
 cooler:(x,y,z,c)=>[...BT.box(x-10,x+10,y-7,y+7,z,z+12,c||'white',{r:3,layer:1.5}),...BT.box(x-10.4,x+10.4,y-7.4,y+7.4,z+9,z+12.4,darker(c||'white',.86),{r:3,layer:1.55})],
 flag:(x,y,z,h,c)=>[...BT.beam([x,y,z],[x,y,z+h],1.6,'#d8d2c8',{layer:3}),...BT.box(x-.6,x+.6,y-14,y-1,z+h-9,z+h,c||'brand',{r:.5,layer:3.1})],
 ring:(x,y,z,c)=>BT.cyl(x,y,6,z,z+3,c||'brand',{n:12,layer:2.6}),
 seat:(x,y,z,c)=>[...BT.cyl(x,y,1.4,z,z+12,'#d8d2c8',{n:6,layer:1.6}),...BT.box(x-6,x+6,y-6,y+6,z+12,z+16,c||'white',{r:4,layer:1.7})],
 window:(x0,x1,y0,y1,z0,z1,c)=>BT.box(x0-.8,x1+.8,y0-.8,y1+.8,z0,z1,c||'#26394d',{r:3,layer:2.4,noTop:1})
};

/* ---- the twelve boats ---- */
const BOATS=[];
function addBoat(o){BOATS.push(o);return o}
const WIN='#26394d',TEAK='#d4b483',CREAM='#fbf6ec',OFF='#efe7d6',NAVY='#1d3557';

/* 1 · Yacht, for Captain Ray */
addBoat({id:'seabiscuit',edge:NAVY,name:'Sea Biscuit',kind:'Yacht',captain:'ray',d:'A classic white motor yacht with a navy sheer stripe, a teak deck, two tiers of tinted windows, a flybridge with a navy radar arch and a persimmon ensign.',L:300,W:110,helm:[0,-6,'bridge'],
 build(){const H=BT.hull({L:300,W:110,hs:34,hb:46,c:CREAM,rim:NAVY,band:[.62,.82],bandC:NAVY,boot:[0,6],bootC:'brand',deckC:TEAK,inset:5,bowStart:.4,transom:.82,rake:.16});const s=H.sheer;
  const F=[...H];
  F.push(...BT.box(-38,38,-92,58,s(-20),s(-20)+30,CREAM,{r:14,layer:2,taper:.94,taperY:.9}));
  F.push(...FIT.window(-38,38,-86,52,s(-20)+12,s(-20)+24,WIN));
  F.push(...BT.box(-31,31,-74,18,s(-20)+30,s(-20)+52,'#ffffff',{r:12,layer:2.6,taper:.92}));
  F.push(...FIT.window(-31,31,-6,18,s(-20)+38,s(-20)+48,WIN));
  F.push(...BT.beam([-26,-58,s(-20)+52],[-20,-66,s(-20)+82],4,NAVY,{layer:3.2}),...BT.beam([26,-58,s(-20)+52],[20,-66,s(-20)+82],4,NAVY,{layer:3.2}),...BT.beam([-20,-66,s(-20)+82],[20,-66,s(-20)+82],4,NAVY,{layer:3.3}));
  F.push(...BT.cyl(0,-66,5,s(-20)+84,s(-20)+88,'#ffffff',{layer:3.4}));
  F.push(...BT.box(-44,44,-162,-150,8,12,TEAK,{r:3,layer:1}));
  F.push(...FIT.flag(0,-148,s(-148)+2,30,'brand'));
  F.push(...BT.box(-16,16,96,118,s(100),s(100)+4,'#ffffff',{r:6,layer:1.4}));
  return F}});

/* 2 · Shrimp boat, for Captain Gus */
addBoat({id:'shrimply',edge:'teal',name:'Shrimply the Best',kind:'Shrimp boat',captain:'gus',d:'A Gulf-style shrimper: white hull with a teal bottom, the wheelhouse up front, a tall mast with sun-yellow outrigger booms swung out and teal nets hanging off the ends.',L:240,W:96,helm:[0,46,'wheelhouse'],
 build(){const H=BT.hull({L:240,W:96,hs:30,hb:52,c:CREAM,rim:'#e7dcc6',boot:[0,10],bootC:'teal',deckC:'#cdbf9f',inset:5,bowStart:.5,transom:.8,rake:.14,sheerPow:2.6});const s=H.sheer;const F=[...H];
  F.push(...BT.box(-30,30,22,76,s(50),s(50)+38,CREAM,{r:7,layer:2}));F.push(...FIT.window(-30,30,24,74,s(50)+22,s(50)+32,WIN));F.push(...FIT.roof(-34,34,18,80,s(50)+38,'teal',4));
  const mz=s(0);F.push(...BT.cyl(0,0,3.4,mz,mz+150,'#e7dcc6',{layer:2.8,n:8}));
  [[1],[-1]].forEach(([sx])=>{const tip=[sx*118,-6,mz+112];F.push(...BT.beam([sx*4,0,mz+30],tip,4.2,'sun',{layer:3}));F.push(...BT.beam([0,0,mz+148],tip,1,'ink',{layer:2.9}));
   F.push(...BT.box(tip[0]-9,tip[0]+9,tip[1]-14,tip[1]+14,mz+42,mz+70,'teal',{r:6,layer:3.1,taper:.55,taperY:.7}));F.push(...BT.beam([tip[0],tip[1],mz+70],tip,1,'ink',{layer:3}))});
  F.push(...BT.box(-14,14,-60,-36,s(-48),s(-48)+14,'#8a5a3b',{r:7,layer:1.6}));F.push(...BT.box(-34,-18,-100,-80,s(-90),s(-90)+10,'sun',{r:3,layer:1.6}));
  return F}});

/* 3 · Speed boat (bowrider), for Captain Bea */
addBoat({id:'bealine',edge:'teal',name:'Bea Line',kind:'Speed boat',captain:'bea',d:'A teal bowrider with a white topside, cream bow seats, a tinted wraparound windshield and a sun-yellow tow pylon. Built for sandbar days.',L:200,W:80,helm:[12,-10,'helm'],
 build(){const H=BT.hull({L:200,W:80,hs:26,hb:34,c:'teal',rim:CREAM,band:[.72,1],bandC:CREAM,boot:[0,4],bootC:'ink',deckC:'#efe2c4',inset:5,bowStart:.36,transom:.86,rake:.18,bowPow:2.2});const s=H.sheer;const F=[...H];
  F.push(...BT.box(-30,30,40,78,s(55),s(55)+8,CREAM,{r:12,layer:1.5}));F.push(...BT.box(-30,30,-88,-48,s(-60),s(-60)+8,CREAM,{r:10,layer:1.5}));
  F.push(...BT.box(-34,34,10,18,s(14),s(14)+16,WIN,{r:4,layer:2.2,taper:.9,shiftY:-4}));
  F.push(...BT.box(6,22,-16,4,s(-6),s(-6)+12,CREAM,{r:3,layer:1.8}));F.push(...FIT.seat(14,-24,s(-24),'teal'));F.push(...FIT.seat(-14,-24,s(-24),'teal'));
  F.push(...BT.beam([0,-40,s(-40)],[0,-40,s(-40)+30],3,'sun',{layer:3}));F.push(...BT.cyl(0,-40,4,s(-40)+30,s(-40)+34,'sun',{layer:3.1}));
  F.push(...BT.box(-26,26,-100,-92,s(-96)-6,s(-96)+1,CREAM,{r:3,layer:1.3}));
  return F}});

/* 4 · Fishing: center console, for Captain Ana */
addBoat({id:'reeltime',edge:NAVY,name:'Reel Time',kind:'Fishing boat',type:'Center console',captain:'ana',d:'A white center console with a navy rim and T-top, twin black outboards, a cooler seat, four rods in the rocket launcher and Ana’s persimmon life ring on the console.',L:200,W:76,helm:[0,-6,'console'],
 build(){const H=BT.hull({L:200,W:76,hs:26,hb:38,c:'#ffffff',rim:NAVY,band:[.84,1],bandC:NAVY,boot:[0,4],bootC:'sky',deckC:OFF,inset:5,bowStart:.38,transom:.84,rake:.15});const s=H.sheer;const F=[...H];
  F.push(...BT.box(-14,14,-4,26,s(10),s(10)+30,'#ffffff',{r:5,layer:1.8}));F.push(...BT.box(-14.5,14.5,18,27,s(20)+18,s(20)+30,WIN,{r:3,layer:2,noTop:1}));
  F.push(...FIT.ring(15.5,10,s(10)+12,'brand').map(f=>Object.assign(f,{L:2.1})));
  F.push(...FIT.posts([-20,20],[-14,26],s(6),s(6)+60,'#d8d2c8',2.2));F.push(...FIT.roof(-26,26,-22,32,s(6)+60,NAVY,4));
  [[-16,-20],[-6,-20],[6,-20],[16,-20]].forEach(([x,y],i)=>F.push(FIT.rod(x,y,s(6)+64,x*.02,-.4,52,'ink')));
  F.push(...FIT.cooler(0,36,s(36),'white'));F.push(...BT.box(-26,26,-84,-74,s(-80),s(-80)+10,'#ffffff',{r:4,layer:1.4}));
  F.push(...FIT.outboard(-100,-10,'ink'),...FIT.outboard(-100,10,'ink'));
  return F.flat()}});

/* 5 · Fishing: downeast lobster boat, for Captain Theo */
addBoat({id:'clawsforcelebration',edge:NAVY,name:'Claws for Celebration',kind:'Fishing boat',type:'Downeast lobster boat',captain:'theo',d:'A navy downeast lobster boat with a cream wheelhouse forward, an open working cockpit, a stack of sun and teal traps and a row of striped buoys.',L:220,W:82,helm:[8,24,'wheelhouse'],
 build(){const H=BT.hull({L:220,W:82,hs:28,hb:48,c:NAVY,rim:CREAM,boot:[0,5],bootC:'brand',deckC:'#d9cdb2',inset:5,bowStart:.42,transom:.9,rake:.14,sheerPow:2.8});const s=H.sheer;const F=[...H];
  F.push(...BT.box(-30,30,6,64,s(30),s(30)+40,CREAM,{r:8,layer:2}));F.push(...FIT.window(-30,30,10,62,s(30)+24,s(30)+34,WIN));F.push(...FIT.roof(-33,33,0,68,s(30)+40,CREAM,3));
  F.push(...BT.beam([10,40,s(30)+43],[10,40,s(30)+72],1.6,'ink',{layer:3}));
  const trap=(x,y,z,c)=>BT.box(x-11,x+11,y-8,y+8,z,z+12,c,{r:2,layer:1.6});F.push(...trap(-16,-66,s(-66),'sun'),...trap(10,-66,s(-66),'teal'),...trap(-3,-66,s(-66)+12,'sun'),...trap(-16,-46,s(-46),'teal'));
  [-80,-62,-44,-26].forEach((y,i)=>F.push(...BT.cyl(39.5,y,4.2,s(y)-14,s(y)-2,i%2?'brand':'sun',{layer:1.9,n:8}),...BT.box(38.5,40.5,y-1.2,y+1.2,s(y)-14,s(y)-9,'#ffffff',{r:.5,layer:1.95})));
  F.push(...BT.box(-36,36,-112,-104,s(-108),s(-108)+2,'brand',{r:2,layer:1.2}));
  return F}});

/* 6 · Fishing: jon boat */
addBoat({id:'planb',edge:'olive',name:'Plan B',kind:'Fishing boat',type:'Jon boat',captain:'earl',d:'A little square-nosed aluminum jon boat with olive rails, three plank seats, a tiller outboard, a minnow bucket and one rod out.',L:150,W:62,helm:[0,-52,'tiller'],
 build(){const H=BT.hull({L:150,W:62,hs:18,hb:22,c:'#b9c2c8',rim:'olive',deckC:'#9aa4ab',inset:4,square:1,rake:.05,flare:.9,deckEnd:.97});const s=H.sheer;const F=[...H];
  [-44,0,40].forEach(y=>F.push(...BT.box(-27,27,y-6,y+6,s(y)-6,s(y)-2,'#c9a27e',{r:1.5,layer:1.4})));
  F.push(...FIT.tiller(-75,'olive'));F.push(...BT.cyl(-14,-20,6,s(-20)-10,s(-20)-1,'#e9e4d8',{layer:1.5,n:10}));
  F.push(FIT.rod(20,-40,s(-40),.5,-.2,58,'ink'));
  return F.flat()}});

/* 7 · Fishing: dory */
addBoat({id:'sunnyside',edge:'teal',name:'Sunny Side',kind:'Fishing boat',type:'Wooden dory',captain:'rosie',d:'A sun-yellow wooden dory, pointed at both ends, with a teal rim, cream thwarts, oars stowed along the sides, a coral buoy and a small outboard.',L:170,W:58,helm:[0,-54,'stern'],
 build(){const H=BT.hull({L:170,W:58,hs:28,hb:34,c:'sun',rim:'teal',deckC:'#efe2c4',inset:4,double:1,rake:.12,flare:.78,sheerPow:1.6,deckEnd:.98});const s=H.sheer;const F=[...H];
  [-30,10,46].forEach(y=>F.push(...BT.box(-Math.max(6,H.hw?24:24),24,y-5,y+5,s(y)-6,s(y)-2,CREAM,{r:1.5,layer:1.4})));
  F.push(...BT.beam([20,-50,s(-50)+1],[22,60,s(60)+1],2.6,'#c9a27e',{layer:2}),...BT.beam([-20,-50,s(-50)+1],[-22,60,s(60)+1],2.6,'#c9a27e',{layer:2}));
  F.push(...BT.cyl(-10,62,5,s(62)-6,s(62)+2,'coral',{layer:1.6,n:10}));F.push(...FIT.tiller(-80,'ink'));
  return F.flat()}});

/* 8 · Fishing: sportfisher with a tuna tower */
addBoat({id:'finandtonic',edge:NAVY,name:'Fin & Tonic',kind:'Fishing boat',type:'Sportfisher',captain:'duke',d:'A big navy sportfisher with a cream cabin, a flybridge, a tall tuna tower, long outriggers swung back and a fighting chair at the stern.',L:260,W:96,helm:[0,4,'flybridge'],
 build(){const H=BT.hull({L:260,W:96,hs:32,hb:50,c:NAVY,rim:CREAM,boot:[0,6],bootC:'sun',deckC:OFF,inset:5,bowStart:.42,transom:.88,rake:.16});const s=H.sheer;const F=[...H];
  F.push(...BT.box(-36,36,-20,74,s(30),s(30)+28,CREAM,{r:12,layer:2,taper:.94}));F.push(...FIT.window(-36,36,-16,70,s(30)+12,s(30)+22,WIN));
  F.push(...BT.box(-30,30,-14,30,s(30)+28,s(30)+40,'#ffffff',{r:8,layer:2.5}));F.push(...BT.box(-30.5,30.5,20,31,s(30)+30,s(30)+38,WIN,{r:3,layer:2.6,noTop:1}));
  const tz=s(30)+40;F.push(...FIT.posts([-22,22],[-6,22],tz,tz+56,'#d8d2c8',2.4));F.push(...BT.box(-24,24,-10,26,tz+56,tz+60,'#d8d2c8',{r:5,layer:3}));F.push(...FIT.roof(-26,26,-12,28,tz+66,NAVY,3));F.push(...FIT.posts([-22,22],[-6,22],tz+60,tz+66,'#d8d2c8',2));
  F.push(...BT.beam([34,10,tz],[132,-110,tz+70],1.6,'#d8d2c8',{layer:3.2}),...BT.beam([-34,10,tz],[-132,-110,tz+70],1.6,'#d8d2c8',{layer:3.2}));
  F.push(...BT.cyl(0,-90,5,s(-90),s(-90)+10,'#d8d2c8',{layer:1.6,n:8}),...BT.box(-10,10,-98,-82,s(-90)+10,s(-90)+16,'#ffffff',{r:5,layer:1.7}),...BT.box(-10,10,-100,-96,s(-90)+16,s(-90)+30,'#ffffff',{r:2,layer:1.75}));
  return F}});

/* 9 · Fishing: flats boat with a poling platform */
addBoat({id:'skinnydipper',edge:'teal',name:'Skinny Dipper',kind:'Fishing boat',type:'Flats boat',captain:'wes',d:'A low mint flats boat with a teal rim, a raised casting deck up front, a small console, a poling platform over the engine and a long push pole.',L:180,W:70,helm:[0,-8,'console'],
 build(){const H=BT.hull({L:180,W:70,hs:18,hb:22,c:'mint',rim:'teal',boot:[0,3],bootC:'teal',deckC:'#f3ece0',inset:5,bowStart:.38,transom:.88,rake:.1,bowPow:1.6});const s=H.sheer;const F=[...H];
  F.push(...BT.box(-26,26,30,72,s(50),s(50)+4,'#f3ece0',{r:10,layer:1.3}));
  F.push(...BT.box(-10,10,-14,8,s(-4),s(-4)+22,'#ffffff',{r:4,layer:1.8}));F.push(...BT.box(-10.5,10.5,2,8.5,s(4)+14,s(4)+22,WIN,{r:2,layer:1.9,noTop:1}));
  F.push(...FIT.outboard(-90,0,'ink',1));
  F.push(...FIT.posts([-16,16],[-90,-70],s(-80),s(-80)+44,'#d8d2c8',2.2));F.push(...BT.box(-18,18,-94,-66,s(-80)+44,s(-80)+47,'#d8d2c8',{r:4,layer:3}));
  F.push(...BT.beam([30,-80,s(-80)+1],[28,90,s(80)+1],2.2,'#c9a27e',{layer:2.2}));
  return F.flat()}});

/* 10 · Fishing: glitter bass boat */
addBoat({id:'glitterbug',edge:'#5e1022',name:'Glitter Bug',kind:'Fishing boat',type:'Bass boat',captain:'tammy',d:'A low, metal-flake crimson bass boat with a silver racing stripe, grey carpet, two pedestal seats, a trolling motor on the bow and a big black outboard.',L:190,W:72,helm:[14,-30,'seat'],
 build(){const H=BT.hull({L:190,W:72,hs:16,hb:20,c:'crimson',rim:'#d8d2c8',band:[.55,.75],bandC:'#d8d2c8',boot:[0,3],bootC:'ink',deckC:'#8b8178',inset:5,bowStart:.36,transom:.9,rake:.12,bowPow:2.4});const s=H.sheer;const F=[...H];
  F.push(...BT.box(-30,30,30,70,s(50),s(50)+3,'#8b8178',{r:10,layer:1.3}));
  F.push(...FIT.seat(14,-30,s(-30),'crimson'),...FIT.seat(-14,-30,s(-30),'crimson'));F.push(...BT.box(4,20,-12,4,s(-4),s(-4)+10,'#d8d2c8',{r:3,layer:1.8}));F.push(...BT.box(-16,16,0,6,s(3)+4,s(3)+12,WIN,{r:2,layer:1.9,taper:.9}));
  F.push(...FIT.outboard(-95,0,'ink',1));F.push(...BT.beam([0,88,s(88)],[0,98,s(88)+18],2.4,'ink',{layer:2.2}),...BT.box(-5,5,94,104,s(88)+14,s(88)+22,'ink',{r:3,layer:2.3}));
  [-12,12].forEach(x=>F.push(FIT.rod(x,-60,s(-60),x>0?.3:-.3,-.5,46,'ink')));
  return F.flat()}});

/* 11 · Speed boat: offshore racer */
addBoat({id:'fullthrottle',edge:'ink',name:'Full Throttle',kind:'Speed boat',type:'Offshore racer',captain:'ace',d:'A long persimmon offshore racer with cream racing stripes, a low tinted canopy and twin big black outboards. Zero to sandbar in nine seconds.',L:236,W:70,helm:[0,-36,'canopy'],
 build(){const H=BT.hull({L:236,W:70,hs:20,hb:24,c:'brand',rim:'brand',band:[.4,.62],bandC:CREAM,boot:[0,4],bootC:'ink',deckC:'#c2410c',inset:0.01,bowStart:.3,transom:.8,rake:.22,bowPow:2.6,sheerPow:1.4});const s=H.sheer;const F=[...H];
  F.push(...BT.box(-6,6,-20,112,s(40)-.2,s(40)+1.2,CREAM,{r:3,layer:.7}));
  F.push(...BT.box(-22,22,-64,-14,s(-40),s(-40)+16,WIN,{r:12,layer:2,taper:.78,taperY:.8,shiftY:-4}));
  F.push(...FIT.outboard(-118,-12,'ink',1),...FIT.outboard(-118,12,'ink',1));
  return F.flat()}});

/* 12 · Cargo ship */
addBoat({id:'boxoffice',edge:NAVY,name:'Box Office',kind:'Cargo ship',captain:'ingrid',d:'A short-sea container ship: navy hull with a persimmon bottom, a stack of containers in Tarver colours, a cream bridge block aft with wide bridge wings and a sun-banded funnel.',L:440,W:120,helm:[0,-150,'bridge'],
 build(){const H=BT.hull({L:440,W:120,hs:40,hb:56,c:NAVY,rim:'#2b4568',boot:[0,10],bootC:'brand',deckC:'#3a4f6b',inset:5,bowStart:.62,transom:.92,rake:.1,bowPow:2.2,n:20});const s=H.sheer;const F=[...H];
  const CC=['brand','teal','sun','cream','coral','sky','brand','teal','sun','cream','#2b4568','coral'];let k=0;
  for(let yi=0;yi<6;yi++)for(let xi=0;xi<3;xi++)for(let zi=0;zi<(yi===5?1:2);zi++){const y=-96+yi*44,x=-36+xi*36,z=s(y)+zi*18;F.push(...BT.box(x-16.5,x+16.5,y-20,y+20,z,z+17.5,CC[(k++*5+zi*3)%CC.length],{r:1.5,layer:1.5+zi*.1+yi*.001}))}
  F.push(...BT.box(-52,52,-196,-136,s(-166),s(-166)+30,CREAM,{r:6,layer:2}));F.push(...BT.box(-40,40,-188,-144,s(-166)+30,s(-166)+66,CREAM,{r:5,layer:2.4}));
  F.push(...FIT.window(-40,40,-188,-144,s(-166)+50,s(-166)+60,WIN));F.push(...BT.box(-66,66,-150,-138,s(-166)+60,s(-166)+66,CREAM,{r:3,layer:2.6}));
  F.push(...BT.cyl(0,-182,10,s(-166)+66,s(-166)+92,'#f3ebdb',{layer:2.8,n:12}),...BT.cyl(0,-182,10.2,s(-166)+82,s(-166)+88,'sun',{layer:2.85,n:12,noTop:1}),...BT.cyl(0,-182,10.3,s(-166)+88,s(-166)+92,'ink',{layer:2.9,n:12}));
  F.push(...BT.box(-34,34,176,200,s(188),s(188)+8,'#2b4568',{r:8,layer:1.4}));
  return F}});

/* ---- views ---- */
const BOAT_TURN=[['front',0,'Bow'],['tq',45,'¾'],['side',90,'Starboard side'],['rq',135,'Rear ¾'],['back',180,'Stern'],['rq-l',225,'Rear ¾, port'],['side-l',270,'Port side'],['tq-l',315,'¾, port']];
const BOAT_EL=11;
function boatModel(b){if(!b._F)b._F=b.build().flat();return b._F}
/* one viewBox for all eight turns, so the boat keeps its size as it turns */
function boatBox(b){if(b._vb)return b._vb;const F=boatModel(b);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;BOAT_TURN.forEach(([,az])=>{const cam=BT.cam(az,BOAT_EL);F.forEach(f=>f.p.forEach(p=>{const q=cam.P(p);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}))});
 const pad=10,m=Math.max(x1-x0,1);b._vb=[x0-pad,y0-pad,m+2*pad,y1-y0+2*pad+6];return b._vb}
function boatGround(b,cam){const P=boatModel(b).filter(f=>!f.L).flatMap(f=>f.p.filter(p=>p[2]<.5)).map(cam.P);if(!P.length)return '';const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);const cx=(Math.min(...xs)+Math.max(...xs))/2,w=(Math.max(...xs)-Math.min(...xs))/2;return `<ellipse cx="${r1(cx)}" cy="${r1(Math.max(...ys)+1)}" rx="${r1(w*1.04+4)}" ry="4.5" fill="#1f1a14" opacity=".13"/>`}
function boatSVG(b,view,o={}){const F=boatModel(b);
 if(view==='top'||view==='wake'){const faces=BT.faces(F,BT.camTop,1);const pts=F.flatMap(f=>f.p).map(BT.camTop.P);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const wakeL=view==='wake'?Math.max(90,b.L*.55):0,pad=14;
  const vb=o.vb||[x0-pad-(view==='wake'?b.W*.5:0),y0-pad,x1-x0+2*pad+(view==='wake'?b.W:0),y1-y0+2*pad+wakeL];
  const hullTop=BT.path(boatModel(b).filter(f=>f.top&&f.L===0).flatMap(f=>[f.p])[0].map(BT.camTop.P));
  let s='';if(o.bg)s+=`<rect x="${r1(vb[0])}" y="${r1(vb[1])}" width="${r1(vb[2])}" height="${r1(vb[3])}" fill="${o.bg}"/>`+(o.pills?boatPills(vb):'');
  if(view==='wake'){const st=y1,hw=b.W*.36;s+=`<g fill="none" stroke="#f7f2e6" stroke-linecap="round"><path d="M${r1(-hw)},${r1(st-4)} L${r1(-hw-b.W*.5)},${r1(st+wakeL)}" stroke-width="3.2" opacity=".55"/><path d="M${r1(hw)},${r1(st-4)} L${r1(hw+b.W*.5)},${r1(st+wakeL)}" stroke-width="3.2" opacity=".55"/></g>`+`<path d="M${r1(-b.W*.18)},${r1(st)} Q0,${r1(st+wakeL*.7)} ${r1(b.W*.18)},${r1(st)} Z" fill="#f7f2e6" opacity=".35"/>`+[[-.3,.2],[.25,.35],[-.1,.55],[.12,.75]].map(([x,y])=>`<circle cx="${r1(x*b.W)}" cy="${r1(st+y*wakeL)}" r="${r1(2.4+b.W*.02)}" fill="#f7f2e6" opacity=".3"/>`).join('')}
  const edge=col(b.edge||'#1f1a14');s+=`<path d="${hullTop}" transform="translate(5 6)" fill="#1f1a14" opacity=".22"/><path d="${hullTop}" fill="${edge}" stroke="${edge}" stroke-width="6" stroke-linejoin="round"/>`+BT.draw(faces);
  if(o.captain){const cp=b.helm;s+=`<g transform="translate(${cp[0]-60} ${-cp[1]-100})">${o.captain}</g>`}
  return `<svg viewBox="${vb.map(r1).join(' ')}" class="${o.cls||''}" role="img" aria-label="${b.name}, ${b.kind.toLowerCase()}, ${view==='wake'?'underway, from above':'from above'}" overflow="hidden">${s}</svg>`}
 const t=BOAT_TURN.find(x=>x[0]===view)||BOAT_TURN[0];const cam=BT.cam(t[1],BOAT_EL);const vb=boatBox(b);
 return `<svg viewBox="${vb.map(r1).join(' ')}" class="${o.cls||''}" role="img" aria-label="${b.name}, ${b.kind.toLowerCase()}, ${t[2].toLowerCase()}">${boatGround(b,cam)}${BT.draw(BT.faces(F,cam,0))}</svg>`}
/* the poster's water: tide pills behind a boat, to check contrast */
function boatPills(vb){const cs=['#f07a4f','#efe3cc','#79c7b5','#1f4f4c','#efe3cc','#79c7b5'];let s='';const step=9;let i=0;for(let x=vb[0]+3;x<vb[0]+vb[2];x+=step,i++)s+=`<rect x="${r1(x)}" y="${r1(vb[1]-4)}" width="5" height="${r1(vb[3]+8)}" rx="2.5" fill="${cs[(i*7)%cs.length]}"/>`;return s}

/* ---------- round 24: standing up on the board, shirtless on the towel, beach umbrellas and balls ---------- */

/* a pill from one point to another, for arms and legs seen from above */
function segPill(x1,y1,x2,y2,w,f,o){const L=Math.hypot(x2-x1,y2-y1),a=Math.atan2(y2-y1,x2-x1)*180/Math.PI;return `<g transform="rotate(${r1(a)} ${r1(x1)} ${r1(y1)})">${rr(x1-w/2,y1-w/2,L+w,w,w/2,f,o||{})}</g>`}

/* surfing, from above. Five styles, each its own pose, board line and water:
   normal (everyone), nose (longboards: walked up to the nose), lazy (longboards: upright, hands behind the back),
   goofy (shortboards: right foot forward, back hand dragging in the face), switch (shortboards: a hard switchback with a fan of spray) */
const RIDE_STYLES=[['ride','Normal'],['ride-nose','Nose riding'],['ride-lazy','Lazy'],['ride-goofy','Goofy foot'],['ride-switch','Switchback']];
function rideStyles(P){const long=!!(P.propR&&P.propR.long);return RIDE_STYLES.filter(([v])=>v==='ride'||(long?(v==='ride-nose'||v==='ride-lazy'):(v==='ride-goofy'||v==='ride-switch')))}
function rideView(P,style){style=style||'normal';const B=P.propR&&P.propR.k==='board'?P.propR:{k:'board',c:'white'},long=!!B.long;
 if((style==='nose'||style==='lazy')&&!long)style='normal';if((style==='goofy'||style==='switch')&&long)style='normal';
 const top=long?-26:-14,bot=long?200:186,w=long?36:31,k=uid();
 const fem=P.body==='pillw',g=BG[P.body]||{},belly=!!g.belly,skin=col(P.skin);
 const shirtless=!fem&&col(P.top)===skin,topC=col(P.bikini?P.skin:P.top),botC=col(P.bikini?(P.bikini.c2||P.bikini.c):(P.shorts||P.legType==='pants'||P.legType==='full'?P.bottom:P.top));
 const legC=P.legType==='full'?col(P.bottom):skin,armC=P.sleeve==='long'?topC:skin,upC=P.sleeve==='short'||P.sleeve==='long'?topC:skin,am=P.arms||1,tw=fem?20:Math.min(30,18+(g.w||34)*.12+(belly?6:0)),aw=8.8*(1+(am-1)*.6);
 const W='#ffffff';let s=`<clipPath id="${k}"><rect x="-6" y="-24" width="132" height="230" rx="14"/></clipPath><g clip-path="url(#${k})">`;
 if(!P.clearWater)s+=rr(-6,-24,132,230,14,'#8fcbe0')+[[-2,2],[78,26],[6,60],[90,96],[-6,150],[74,176],[20,196]].map(([x,y])=>`<path d="M${x},${y} q6,-4 12,0 t12,0" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>`).join('');
 /* ---- water marks, in board space ---- */
 const carve=()=>`<path d="M48,${bot-4} C40,${bot+24} 30,${bot+40} 14,${bot+62}" fill="none" stroke="${W}" stroke-width="5" stroke-linecap="round" opacity=".55"/><path d="M72,${bot-4} C80,${bot+24} 92,${bot+40} 108,${bot+62}" fill="none" stroke="${W}" stroke-width="3" stroke-linecap="round" opacity=".45"/>`+
  `<path d="M${60-w*.6},${bot-34} C${60-w*1.5},${bot-20} ${60-w*1.6},${bot+4} ${60-w*.4},${bot+10} C${60-w*.9},${bot-4} ${60-w*.9},${bot-20} ${60-w*.6},${bot-34} Z" fill="${W}" opacity=".85"/>`+
  [[-1.25,-6,4.2],[-1.6,8,3.2],[-1.1,20,2.6],[-1.8,-20,2.4],[-1.45,30,2]].map(([kx,dy,r])=>c(60+w*kx,bot-30+dy,r,W,{op:.8})).join('');
 const trim=()=>`<path d="M${60-w*.42},${bot-6} C${60-w*.6},${bot+30} ${60-w*.9},${bot+50} ${60-w*1.3},${bot+70}" fill="none" stroke="${W}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/><path d="M${60+w*.42},${bot-6} C${60+w*.6},${bot+30} ${60+w*.9},${bot+50} ${60+w*1.3},${bot+70}" fill="none" stroke="${W}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`+
  `<path d="M${60-w*.5},${top+30} q-6,-8 -2,-16 M${60+w*.5},${top+30} q6,-8 2,-16" fill="none" stroke="${W}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
 const fan=()=>{let f=`<path d="M${60-w*.5},${bot-48} C${60-w*2.6},${bot-70} ${60-w*3.4},${bot-6} ${60-w*2.4},${bot+38} C${60-w*1.6},${bot+10} ${60-w*1.2},${bot-14} ${60-w*.5},${bot-48} Z" fill="${W}" opacity=".9"/>`;
  [[-3.1,-40,5],[-3.5,-14,4.4],[-3.3,12,4],[-2.8,34,3.4],[-2.2,50,2.8],[-3.9,-30,3],[-4.1,2,2.6],[-3.7,26,2.4],[-2.6,-58,3.2]].forEach(([kx,dy,r])=>f+=c(60+w*kx,bot-20+dy,r,W,{op:.85}));
  return f+`<path d="M${60+w*.3},${bot-6} C${60+w*.8},${bot+30} ${60+w*1.6},${bot+46} ${60+w*2.6},${bot+60}" fill="none" stroke="${W}" stroke-width="3" stroke-linecap="round" opacity=".5"/>`};
 const drag=(x,y)=>`<ellipse cx="${r1(x)}" cy="${r1(y+4)}" rx="9" ry="4" fill="none" stroke="${W}" stroke-width="1.6" opacity=".8"/><path d="M${r1(x-2)},${r1(y+6)} C${r1(x-6)},${r1(y+30)} ${r1(x-10)},${r1(y+52)} ${r1(x-16)},${r1(y+70)}" fill="none" stroke="${W}" stroke-width="2.6" stroke-linecap="round" opacity=".6"/>`;
 /* ---- the rider ---- */
 const Q=Object.assign({},P,{propR:null,propL:null,neck:null});
 const head=(x,y)=>`<g transform="translate(${r1(x-60)} ${r1(y-99)})">${headTop(Q)}</g>`+(P.hw&&P.hw.k==='band'?`<g transform="translate(${r1(x-60)} ${r1(y-99)})"><path d="M47.4,99 A12.6 12.6 0 0 1 72.6,99" fill="none" stroke="${col(P.hw.c)}" stroke-width="3.4"/></g>`:'');
 const arm=(a,b)=>{let t=segPill(a[0],a[1],b[0],b[1],aw,armC);if(P.sleeve==='short'){const m=[a[0]+(b[0]-a[0])*.42,a[1]+(b[1]-a[1])*.42];t+=segPill(a[0],a[1],m[0],m[1],aw+1.2,upC)}return t+c(b[0],b[1],aw*.58,skin)};
 const torso=(x,y,ww,hh,horiz)=>{let t=rr(x-(horiz?hh:ww)/2,y-(horiz?ww:hh)/2,horiz?hh:ww,horiz?ww:hh,Math.min(ww,hh)/2,topC,{sh:1});
  if(P.bikini&&fem)t+=horiz?rr(x-2.5,y-ww/2,5,ww,2.5,col(P.bikini.c)):rr(x-ww/2,y-2.5,ww,5,2.5,col(P.bikini.c));
  if(P.panel)t+=horiz?rr(x-hh/2+8,y-ww/2+3,10,ww-6,4.5,col(P.panel)):rr(x-ww/2+3,y-hh/2+8,ww-6,10,4.5,col(P.panel));
  if(P.ripped&&shirtless)t+=horiz?`<path d="M${r1(x-hh/2+8)},${r1(y+2)} L${r1(x+hh/2-8)},${r1(y+2)}" stroke="#1f1a14" stroke-opacity=".16" stroke-width="1.4" stroke-linecap="round"/>`:`<path d="M${r1(x-3)},${r1(y-hh/2+6)} L${r1(x-3)},${r1(y+hh/2-6)}" stroke="#1f1a14" stroke-opacity=".16" stroke-width="1.4" stroke-linecap="round"/>`;return t};
 const shadow=inner=>`<g transform="translate(6 7)" opacity=".16">${inner}</g>`;
 /* side stance (normal, goofy, switch): feet across the stringer, hips back over the heels, chest over the toes */
 const sideStance=o=>{const cx=60,hipY=o.hipY,fy=hipY-o.st,by=hipY+o.st,hx=cx-o.back,tx=cx+o.lean,hdx=cx+o.lean+6,sh1=[tx+2,hipY-15],sh2=[tx+2,hipY+15];
  let R=shadow(segPill(tx,hipY-14,o.h1[0],o.h1[1],aw,'#1f1a14')+segPill(tx,hipY+14,o.h2[0],o.h2[1],aw,'#1f1a14')+e(tx,hipY,tw/2+2,21,'#1f1a14')+e(hx,hipY,14,17,'#1f1a14')+segPill(cx,fy,cx,by,12,'#1f1a14'));
  R+=segPill(cx,fy+4,hx+2,hipY-9,12.5,legC)+segPill(cx,by-4,hx+2,hipY+9,12.5,legC)+e(cx,fy,10.5,5.2,skin,{rot:-10})+e(cx,by,10.5,5.2,skin,{rot:8});
  R+=e(hx,hipY,P.bikini?11:14,P.bikini?13:17,botC)+arm(sh1,o.h1)+arm(sh2,o.h2)+torso(tx,hipY,tw,42)+head(hdx,hipY);
  return `<g transform="translate(${cx} ${hipY}) scale(${o.sc||1.2}) translate(${-cx} ${-hipY})">${R}</g>`};
 let water='',rider='',rot=-16,mirror=false,sc=1;
 if(style==='normal'){const hy=long?100:96;water=carve();rider=sideStance({hipY:hy,st:34,back:7,lean:5,h1:[92,hy-47],h2:[87,hy+46]})}
 else if(style==='goofy'){mirror=true;rot=-22;const hy=96;water=carve()+drag(95,hy+40);rider=sideStance({hipY:hy,st:36,back:9,lean:9,h1:[90,hy-38],h2:[95,hy+40],sc:1.22})}
 else if(style==='switch'){rot=-52;sc=.8;const hy=118;water=fan();rider=sideStance({hipY:hy,st:30,back:12,lean:13,h1:[84,hy-56],h2:[34,hy+26],sc:1.24})}
 else if(style==='nose'){rot=-6;const ny=top+64;water=trim();
  /* walked up to the nose: both feet on the tip, shoulders square to the board, arms out wide */
  let R=shadow(segPill(36,ny+18,84,ny+18,18,'#1f1a14')+segPill(14,ny+16,106,ny+16,aw,'#1f1a14'));
  R+=e(55,ny-26,5.2,10,skin,{rot:4})+e(65,ny-26,5.2,10,skin,{rot:-4})+segPill(55,ny-20,56,ny+8,12,legC)+segPill(65,ny-20,64,ny+8,12,legC);
  R+=e(60,ny+12,P.bikini?11:15,P.bikini?8:10,botC)+arm([42,ny+16],[14,ny+10])+arm([78,ny+16],[106,ny+10])+torso(60,ny+17,20,42,true)+head(60,ny+14);
  rider=`<g transform="translate(60 ${ny}) scale(1.2) translate(-60 ${-ny})">${R}</g>`}
 else if(style==='lazy'){rot=-4;const hy=long?96:92;water=trim();
  /* upright and easy: feet close, shoulders along the board, hands clasped behind the back */
  let R=shadow(e(60,hy,15,22,'#1f1a14')+segPill(60,hy-24,60,hy+24,12,'#1f1a14'));
  R+=e(60,hy-24,10,5,skin,{rot:-6})+e(60,hy+24,10,5,skin,{rot:6})+segPill(60,hy-20,59,hy-6,12,legC)+segPill(60,hy+20,59,hy+6,12,legC)+e(58,hy,P.bikini?10:12,P.bikini?12:15,botC);
  R+=torso(62,hy,tw-2,38)+arm([55,hy-14],[41,hy-3])+arm([55,hy+14],[41,hy+3])+head(65,hy-2);
  rider=`<g transform="translate(60 ${hy}) scale(1.2) translate(-60 ${-hy})">${R}</g>`}
 const brd=`<g transform="translate(3 4)" opacity=".13">${boardVert({c:'#1f1a14',c2:'#1f1a14',stripe:'#1f1a14',long},60,w,top,bot)}</g>`+boardVert(B,60,w,top,bot);
 let body=`<g transform="translate(60 92) scale(${sc}) rotate(${rot}) translate(-60 -92)">${water}${brd}${rider}</g>`;
 if(mirror)body=`<g transform="translate(120 0) scale(-1 1)">${body}</g>`;
 return s+body+`</g>`}

/* men lie on the towel with their shirts off; only the big-bellied keep a shirt on */
{const _lie=lieView;lieView=function(P){const g=BG[P.body];if(P.body&&P.body!=='pillw'&&g&&!g.belly&&!P.lieShirt)P=Object.assign({},P,{top:P.skin,fabric:null,fc:null,collar:0,crew:0,cuffs:0,under:0,polo:0,panel:0,vest:0,cross:0,sleeve:'none',untucked:1,noBelt:1,ripped:1,legType:'bare',shorts:1});return _lie(P)}}

/* the person wrapper hands new views to their drawers */
{const _p=person;person=function(P,v){if(v==='ride'||(typeof v==='string'&&v.indexOf('ride-')===0)){let Q=P;const g=BG[P.body];if(P.body&&P.body!=='pillw'&&g&&!g.belly&&col(P.top)===col(P.skin))Q=Object.assign({},P,{ripped:1});return rideView(Q,v==='ride'?'normal':v.slice(5))}return _p(P,v)}}

/* ---------- beach umbrella and beach ball: built from discs and wedges ---------- */
function sectorD(cx,cy,r,a0,a1){const p=a=>[cx+r*Math.sin(a*Math.PI/180),cy-r*Math.cos(a*Math.PI/180)];const A=p(a0),B=p(a1);return `M${r1(cx)},${r1(cy)} L${r1(A[0])},${r1(A[1])} A${r1(r)} ${r1(r)} 0 0 1 ${r1(B[0])},${r1(B[1])} Z`}
/* from above: twelve 30° panels, colour and cream, a soft shadow and the ink finial */
function umbrellaTop(cx,cy,d,c1,c2,o={}){const r=d/2,rot=o.rot||0;let s=c(cx+d*.1,cy+d*.125,r,'#1f1a14',{op:.16})+c(cx,cy,r,c2||'cream');
 for(let i=0;i<12;i+=2)s+=`<path d="${sectorD(cx,cy,r,rot+i*30,rot+i*30+30)}" fill="${col(c1)}"/>`;
 s+=c(cx,cy,Math.max(1.6,d*.05),'ink');return s}
/* standing, from the side: a dome canopy in six panels with a scalloped hem, on a pole */
function umbrellaSide(cx,base,h,c1,c2,o={}){const w=h*.92,top=base-h,ch=h*.3,tilt=o.tilt==null?-8:o.tilt,C1=col(c1),C2=col(c2||'cream');let s=e(cx,base+1,w*.36,3.6,'ink',{op:.13});
 s+=`<g transform="rotate(${tilt} ${cx} ${base})">`+rr(cx-1.6,top+ch*.4,3.2,h-ch*.4,1.6,'#d8d2c8')+rr(cx-2.2,base-h*.3,4.4,5,1.5,'#b9b1a3');
 const dome=domeD(cx,top+ch,w,ch),id=uid(),n=6,pw=w/n,ap=[cx,top-ch*.4];s+=`<clipPath id="${id}"><path d="${dome}"/></clipPath><path d="${dome}" fill="${C2}"/><g clip-path="url(#${id})">`;
 for(let i=0;i<n;i+=2){const x0=cx-w/2+i*pw,x1=x0+pw;s+=`<path d="M${r1(ap[0])},${r1(ap[1])} L${r1(x0+(x0-cx)*.08)},${r1(top+ch+2)} L${r1(x1+(x1-cx)*.08)},${r1(top+ch+2)} Z" fill="${C1}"/>`}s+=`</g>`;
 for(let i=0;i<n;i++)s+=`<path d="M${r1(cx-w/2+i*pw)},${r1(top+ch-.5)} a${r1(pw/2)} ${r1(pw*.36)} 0 0 0 ${r1(pw)},0 Z" fill="${i%2?C2:C1}"/>`;
 s+=c(cx,top-1,2.6,'ink')+`</g>`;return s}
/* beach ball from above: four quarters, persimmon, cream, sun and teal */
function ballTop(cx,cy,d,o={}){const r=d/2,cs=o.colors||['brand','cream','sun','teal'];let s=c(cx+d*.18,cy+d*.18,r,'#1f1a14',{op:.16});cs.forEach((cc,i)=>s+=`<path d="${sectorD(cx,cy,r,i*90+(o.rot||0),i*90+90+(o.rot||0))}" fill="${col(cc)}"/>`);return s}
/* beach ball on the sand, from the side: curved panels meeting at a cream cap */
function ballSide(cx,cy,d,o={}){const r=d/2,id=uid(),cs=o.colors||['brand','cream','sun','teal'];let s=e(cx,cy+r+1,r*.85,2.6,'ink',{op:.13})+`<clipPath id="${id}"><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}"/></clipPath>`+c(cx,cy,r,cs[0])+`<g clip-path="url(#${id})">`;
 s+=e(cx,cy,r*.72,r*1.02,cs[1])+e(cx,cy,r*.46,r*1.02,cs[2])+e(cx,cy,r*.18,r*1.02,cs[3]);s+=`</g>`+c(cx,cy-r*.86,r*.2,'cream')+shade(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}"/>`,cx-r,cy-r,2*r,2*r)+c(cx-r*.42,cy-r*.42,r*.14,'white',{op:.7});return s}

/* ---------- round 26: fishermen from above with the rod taken out of their hands ---------- */
/* The pose stays the same (both hands out in front, gear set down beside them); only the rod, line and bobber go,
   so an art piece can draw its own lines from the hands. View: 'top-norod'. */
{const _pf=propFor;propFor=function(P,v,side){const p=side==='L'?P.propL:P.propR;if(P.noRod&&v==='top'&&p&&p.k==='rod')return '';return _pf(P,v,side)}}
/* the hands, as drawn in the aerial (hand centres in the 120 x 172 aerial box), for starting a line from them */
const ROD_HANDS=[[56.4,121],[63.6,121]];
{const _p=person;person=function(P,v){if(v==='top-norod')return _p(Object.assign({},P,{noRod:1}),'top');return _p(P,v)}}

/* ---------- round 27: five more beach goers. Afro puffs, a sunburn, two-colour bikinis, and five new things to carry ---------- */
NEWHAIR.puffs=1;
{const _hb=hairBack,_hc=hairCap,_ht=hairTop;
 const PUFF={front:[[-13.5,-14],[13.5,-14]],tq:[[-15,-13.5],[11.5,-14.5]],side:[[-10,-15]],rq:[[-11.5,-14.5],[15,-13.5]],back:[[-13.5,-14],[13.5,-14]]};
 hairBack=function(P,v){if(P.hairStyle!=='puffs')return _hb(P,v);const [cx,cy]=HEADC[v]||HEADC.front,h=P.hair,r=P.puffR||10;
  return (PUFF[v]||PUFF.front).map(([x,y])=>c(cx+x,cy+y,r,h,{sh:1})+c(cx+x-r*.35,cy+y-r*.4,r*.32,'white',{op:.1})).join('')};
 hairCap=function(P,v){if(P.hairStyle!=='puffs')return _hc(P,v);const [cx,cy]=HEADC[v]||HEADC.front,h=P.hair,t=col(P.tie||'sun'),r=16.8;
  const ties=(PUFF[v]||PUFF.front).map(([x,y])=>{const d=Math.hypot(x,y),k=(d-3.2)/d,tx=cx+x*k,ty=cy+y*k,a=Math.atan2(y,x)*180/Math.PI+90;return rr(tx-4.6,ty-1.7,9.2,3.4,1.7,t,{rot:a})}).join('');
  if(v==='front')return clipRect(40,8,40,19,c(cx,cy,r,h))+rr(43.6,24,5,9,2.5,h)+rr(71.4,24,5,9,2.5,h)+ties;
  if(v==='tq')return clipRect(40,8,40,19,c(cx,cy,r,h))+clipRect(40,8,10,30,c(cx,cy,r,h))+rr(72.4,24,4.2,8,2.1,h)+ties;
  if(v==='side')return clipRect(40,8,44,19,c(cx,cy,r,h))+clipRect(40,8,22,36,c(cx,cy,r,h))+ties;
  return clipRect(40,8,40,34,c(cx,cy,r,h,{sh:1}))+ties};
 hairTop=function(P){if(P.hairStyle!=='puffs')return _ht(P);const h=P.hair,t=col(P.tie||'sun');
  return c(49,92,8.6,h,{sh:1})+c(71,92,8.6,h,{sh:1})+c(60,98,12.6,h,{sh:1})+ring(49,92,8.6,1.6,t)+ring(71,92,8.6,1.6,t)+c(49,92,7.4,h)+c(71,92,7.4,h)+c(60,98,12.6,h,{sh:1})};}

/* a sunburn: pink nose and cheeks */
{const _z=zincV;zincV=function(P,v){let s=_z(P,v);if(!P.burn)return s;const b='#e8735f',o=.5;
 if(v==='front')s+=e(60,36.4,3.4,2.4,b,{op:o+.1})+e(50.4,38.6,4,2.6,b,{op:o})+e(69.6,38.6,4,2.6,b,{op:o});
 if(v==='tq')s+=e(64,36.4,3.2,2.4,b,{op:o+.1})+e(55.4,38.6,3.6,2.6,b,{op:o})+e(72.6,38.6,3,2.4,b,{op:o});
 if(v==='side')s+=e(75.2,35.6,2.8,2.4,b,{op:o+.1})+e(68,38.8,3.6,2.6,b,{op:o});
 return s}}

/* bikinis: never drawn from above (the shoulders hide them), and the bottoms can take their own colour */
{const _b=bikiniV;bikiniV=function(P,v,part){if(v==='top')return '';const B=P.bikini;if(part!=='top'&&B&&B.cb)return _b(Object.assign({},P,{bikini:{c:B.cb,c2:B.cb2||darker(B.cb,.75)}}),v,part);return _b(P,v,part)}}

/* five new things to carry: a frisbee, a striped tote, a folded beach chair, a speaker and a football */
const STRIPES=(id,x,y,w,h,r,c1,c2,step,band)=>`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`+rr(x,y,w,h,r,c1,{sh:1})+`<g clip-path="url(#${id})">`+Array.from({length:Math.ceil(h/step)},(_,i)=>rr(x,y+i*step+step-band,w,band,0,c2)).join('')+`</g>`;
{const _hv=holdV;holdV=function(k,P,v,H,o,cc){const x=H[0],y=H[1],p=(P.propR&&P.propR.k===k)?P.propR:(P.propL&&P.propL.k===k)?P.propL:{},c1=col(cc||p.c||'teal'),c2=col(p.c2||'cream'),cd=darker(c1),sd=v==='side';
 if(k==='frisbee'){const fx=x+o*(sd?0:7),fy=y+4,r=10.5;if(v==='top')return c(x+o*3,y+2,9,c1,{sh:1})+ring(x+o*3,y+2,6,1.6,c2);
  if(sd)return rr(fx-2.6,fy-r,5.2,r*2,2.6,cd)+rr(fx-1.2,fy-r+2,2.4,r*2-4,1.2,c1);
  return c(fx,fy,r,c1,{sh:1})+ring(fx,fy,7,1.8,c2)+c(fx,fy,2.6,c2,{op:.9})+c(fx-r*.42,fy-r*.42,2.2,'white',{op:.25})}
 if(k==='tote'){if(v==='top')return rr(x-9,y-2,18,9,3,c1)+rr(x-9,y+1,18,2.4,0,c2);const w=sd?9:20,bx=x-w/2;
  return SVGL(`M${pt([bx+w*.24,y+7])} Q${pt([x,y-7])} ${pt([bx+w*.76,y+7])}`,cd,1.8)+STRIPES(uid(),bx,y+6,w,24,4,c1,c2,6,2.6)+rr(bx,y+6,w,3.4,1.7,cd)}
 if(k==='chair'){const fr='#9a9690';if(v==='top')return rr(x-8,y-1,16,5,2,fr)+rr(x-6.4,y-.2,12.8,3.4,1.4,c1);
  if(sd)return rr(x-2.8,y-4,5.6,58,2.8,fr)+rr(x-1.4,y+4,2.8,40,1.4,c1);
  return rr(x-9,y-4,18,58,3.4,fr)+STRIPES(uid(),x-7,y+3,14,44,2,c1,c2,7,3.4)+rr(x-9,y+48,18,4,2,darker(fr,.8))+c(x,y-1,1.6,darker(fr,.7))}
 if(k==='speaker'){const sp=(sx,sy,r)=>c(sx,sy,r,'ink')+c(sx,sy,r*.42,'#5a5650')+c(sx,sy,r*.16,c2);
  if(v==='top')return rr(x-11,y-1,22,9,3,c1)+rr(x-5,y,10,2.6,1.3,'ink',{op:.8});
  if(sd)return rr(x-2,y-1,4,5,1.6,'ink',{op:.8})+rr(x-4.6,y+3,9.2,16,3.4,c1,{sh:1})+c(x,y+11,3.2,'ink');
  return rr(x-6.5,y-1.6,13,3.4,1.7,'ink',{op:.85})+rr(x-13,y+2,26,17,4.4,c1,{sh:1})+sp(x-6.6,y+10.6,4.6)+sp(x+6.6,y+10.6,4.6)+rr(x-2.2,y+5,4.4,2.4,1.2,c2)}
 if(k==='football'){const fx=x+o*(sd?1:6),fy=y+3,lc='#f7f2e6';const ball=(rot,rx,ry)=>`<g transform="rotate(${rot} ${fx} ${fy})">`+e(fx,fy,rx,ry,'#8a4a24',{sh:1})+rr(fx-rx*.36,fy-.7,rx*.72,1.4,.7,lc)+[-.2,0,.2].map(t=>rr(fx+rx*t-.6,fy-2.2,1.2,4.4,.6,lc)).join('')+rr(fx-rx*.92,fy-ry*.2,1.6,ry*.4,.8,lc,{op:.8})+rr(fx+rx*.92-1.6,fy-ry*.2,1.6,ry*.4,.8,lc,{op:.8})+`</g>`;
  if(v==='top')return ball(o*-30,8.4,5.2);return ball(sd?-62:o*-34,12,7.6)}
 return _hv(k,P,v,H,o,cc)}}

/* the same things beside the towel */
{const _l=lieView;lieView=function(P){let s=_l(P);const T=P.lie||{},ex=T.extra,ec=col(T.ec||'teal'),e2=col(T.ec2||'cream');
 if(ex==='frisbee')s+=c(84,148,8.4,ec,{sh:1})+ring(84,148,5.6,1.5,e2)+c(84,148,2,e2,{op:.9});
 if(ex==='tote')s+=`<g transform="rotate(-8 84 150)">${STRIPES(uid(),75,138,18,22,3.4,ec,e2,5.5,2.4)}${SVGL('M79,139 Q84,131 89,139',darker(ec),1.6)}</g>`;
 if(ex==='sunscreen')s+=`<g transform="rotate(18 86 146)">${rr(81.4,136,9.2,18,3.6,ec)}${rr(83.2,132.6,5.6,4.4,1.4,'white')}${rr(82.6,143,6.8,5,1.4,'white',{op:.9})}${c(86,145.5,1.6,'sun')}</g>`;
 if(ex==='speaker')s+=rr(76,140,20,13,3.6,ec)+c(81,146.5,3.6,'ink')+c(91,146.5,3.6,'ink')+c(81,146.5,1.4,'#5a5650')+c(91,146.5,1.4,'#5a5650')+rr(81,138.2,10,2.4,1.2,'ink',{op:.85});
 if(ex==='football')s+=`<g transform="rotate(-34 85 147)">${e(85,147,9,5.8,'#8a4a24')}${rr(81.4,146.3,7.2,1.4,.7,'#f7f2e6')}${[-1.8,0,1.8].map(t=>rr(85+t-.6,144.8,1.2,4.4,.6,'#f7f2e6')).join('')}</g>`;
 return s}}

const M=(o)=>Object.assign({skin:'sk1',hair:'hairBr',hairStyle:'short',sleeve:'short',legType:'pants',shoes:'ink'},o);
const TRUNKS=(c,o)=>Object.assign({sleeve:'none',legType:'bare',shorts:1,bottom:c,noBelt:1,untucked:0},o);
const SUIT=(c,o)=>Object.assign({body:'pillw',shoulders:1,top:c,sleeve:'none',legType:'bare',shorts:0,scoop:1,untucked:0},o);
const CAST=[
{id:'aaron',name:'Aaron',kind:'Family',d:'Red flannel over a grey tee, untucked. Dark skinny jeans, sun sneakers.',P:{body:'rects',chest:.35,under:'#8e8a84',skin:'sk1',hair:'hairBr',hairStyle:'short',fabric:'flannel',top:'#b4232c',sleeve:'long',cuffs:'#7d1720',collar:'#7d1720',untucked:1,bottom:'denim',legType:'pants',cuff:'#5b7fa8',shoes:'sun',x:{}}},
{id:'rachel',name:'Rachel',kind:'Family',d:'Persimmon sleeveless top tucked in, black jeans, brown flats, a bun and a persimmon bandana.',P:{body:'pillw',hk:.97,bust:1.2,shoulders:1,skin:'sk1',hair:'hairBr',hairStyle:'bun',top:'brand',sleeve:'none',untucked:0,bottom:'#2b2620',legType:'pants',cuff:'#4a443c',shoes:'brown',hw:{k:'bandana',c:'brand',c2:'#fbf6ec'}}},
{id:'sky',name:'Sky',kind:'Family',d:'White cat, blue eyes, teal collar with a sun tag.',cat:{base:'white',collar:'teal'}},
{id:'zara',name:'Zara',kind:'Family',d:'Ragdoll cat: white with brown points, mask and spots, a cream bib.',cat:{base:'white',point:'brown',mask:'brownL',spot:'brown',bib:1,collar:'crimson',spotty:1}},


{id:'hank',name:'Hank',kind:'Fishermen',d:'Older, sturdy. Grey beard, olive bucket hat, khaki vest over a chambray shirt, work boots. Rod and a tackle box.',
 P:M({chest:.45,arms:1.08,body:'rects40',skin:'sk2',hair:'hairGr',beard:{c:'hairGr'},hat:{k:'bucket',c:'olive',c2:'oliveD'},top:'#8fb0d3',sleeve:'long',cuffs:'#7597bd',untucked:1,vest:'#b9a67e',bottom:'khaki',shoes:'#5a3a24',boots:'#6b4529',propR:{k:'rod',bob:'brand'},propL:{k:'tackle',c:'#3f6b45'},rodHold:1,scale:.98})},
{id:'luis',name:'Luis',kind:'Fishermen',d:'Big build with a belly. Mustache, navy cap, heather tee, olive cargo shorts, sandals. Rod and a bait bucket.',
 P:M({chest:.4,arms:1.1,body:'rectsE',skin:'sk3',hair:'hairBlk',beard:{k:'stache',c:'hairBlk'},hat:{k:'cap',c:'navy',c2:'#f1ede4'},top:'#9a958d',crew:'#85807a',untucked:1,legType:'bare',shorts:1,bottom:'olive',shoes:'sk3',sandal:'#5a3a24',propR:{k:'rod',bob:'sun'},propL:{k:'bucket',c:'#e9e4d8'},rodHold:1,scale:.97})},
{id:'darnell',name:'Darnell',kind:'Fishermen',d:'Close buzz, sunglasses, wide straw hat, light-blue sun shirt, navy shorts, sneakers. Rod and a cooler.',
 P:M({chest:.52,arms:1.17,body:'rects36',skin:'sk4',hair:'hairBlk',hairStyle:'buzz',glasses:{},hat:{k:'straw',c:'#dcc28e',c2:'navy',w:24},top:'#bfd8e8',sleeve:'long',cuffs:'#a3c2d6',collar:'#a3c2d6',untucked:1,legType:'bare',shorts:1,bottom:'navy',shoes:'#ece6d6',propR:{k:'rod',bob:'teal'},propL:{k:'cooler',c:'brand'},rodHold:1,scale:1.06})},
{id:'marge',name:'Marge',kind:'Fishermen',d:'Red ponytail, sun bucket hat, green flannel, cuffed jeans, olive rubber boots. Rod and a coral pail.',
 P:M({body:'pillw',wk:1.04,hk:1.03,shoulders:1,skin:'sk1',hair:'hairRed',hairStyle:'pony',hat:{k:'bucket',c:'sun',c2:'sunD'},fabric:'flannel',fc:'#3f6b45',top:'#3f6b45',sleeve:'long',cuffs:'#2b4d31',untucked:1,bottom:'denim',cuff:'#5b7fa8',shoes:'olive',boots:'olive',propR:{k:'rod',bob:'brand'},propL:{k:'bucket',c:'coral'},rodHold:1,bust:1.5,seat:1.4,scale:.95})},
{id:'kenji',name:'Kenji',kind:'Fishermen',d:'Young and lanky. Messy hair, crimson beanie, teal rain jacket, slim jeans, sneakers. Rod and a bucket.',
 P:M({chest:.28,arms:.9,body:'rects',skin:'sk5',hair:'hairBlk',hairStyle:'messy',hat:{k:'beanie',c:'crimson',c2:'#7d1730'},top:'teal',sleeve:'long',cuffs:'tealD',collar:'tealD',untucked:1,bottom:'#3d5a80',shoes:'sun',propR:{k:'rod',bob:'sun'},propL:{k:'bucket',c:'sky'},rodHold:1,scale:1.05})},


{id:'ray',name:'Captain Ray',kind:'Boat captains',d:'White beard, classic white captain’s hat, navy jacket over a white shirt, white trousers. Binoculars and a mug.',
 P:M({chest:.42,arms:1.03,body:'rects40',skin:'sk1',hair:'hairWh',beard:{c:'hairWh'},hat:{k:'captain',c:'white',c2:'navy'},top:'navy',sleeve:'long',cuffs:'sun',collar:'#0f2340',under:'white',untucked:1,bottom:'#f1ede4',shoes:'ink',neck:{k:'binoc'},propL:{k:'mug',c:'white'},scale:1.0})},
{id:'ana',name:'Captain Ana',kind:'Boat captains',d:'Long dark hair, navy captain’s hat, white polo, navy shorts, cream sneakers. Life ring.',
 P:M({body:'pillw',shoulders:1,bust:.8,seat:1.1,skin:'sk2',hair:'hairDk',hairStyle:'long',hat:{k:'captain',c:'navy',c2:'#0f2340'},top:'white',polo:'navy',untucked:0,legType:'bare',shorts:1,bottom:'navy',shoes:'#ece6d6',propR:{k:'ring',c:'brand'},scale:.97})},
{id:'theo',name:'Captain Theo',kind:'Boat captains',d:'Mustache, white captain’s hat, navy-and-white striped shirt, khaki trousers, boat shoes. A coffee mug.',
 P:M({chest:.5,arms:1.14,body:'rects36',skin:'sk4',hair:'hairBlk',beard:{k:'stache',c:'hairBlk'},hat:{k:'captain',c:'white',c2:'ink'},fabric:'stripe',fc:'white',fc2:'navy',top:'white',sleeve:'long',untucked:0,bottom:'khaki',shoes:'brown',propR:{k:'mug',c:'brand'},scale:1.02})},
{id:'bea',name:'Captain Bea',kind:'Boat captains',d:'Big curls, navy cap, sunglasses, navy polo, teal shorts, sandals. Whistle and a life ring.',
 P:M({body:'pillw',wk:1.06,hk:1.04,shoulders:1,bust:1.72,seat:1.6,skin:'sk3',hair:'hairBlk',hairStyle:'curly',hat:{k:'cap',c:'navy',c2:'sun'},glasses:{},top:'navy',polo:'#0f2340',untucked:0,legType:'bare',shorts:1,bottom:'teal',shoes:'sk3',sandal:'brand',neck:{k:'whistle',c:'sun'},propL:{k:'ring',c:'brand'},scale:.96})},
{id:'gus',name:'Captain Gus',kind:'Boat captains',d:'Big build with a belly. Bald, salt-and-pepper beard, navy beanie, yellow rain slicker, navy trousers, black boots. Binoculars.',
 P:M({chest:.38,arms:1.12,body:'rectsE',skin:'sk2',hair:'hairAsh',hairStyle:'none',beard:{c:'hairAsh'},hat:{k:'beanie',c:'navy',c2:'#0f2340'},top:'sun',sleeve:'long',cuffs:'sunD',collar:'sunD',untucked:1,bottom:'navy',shoes:'ink',boots:'ink',neck:{k:'binoc'},scale:.99})},


{id:'kai',name:'Kai',kind:'Surfers',d:'Sun-bleached messy hair, shirtless, teal board shorts, barefoot. Shortboard.',
 P:M({chest:.56,arms:1.22,body:'rects36',skin:'sk3',hair:'hairSun',hairStyle:'messy',...TRUNKS('teal'),top:'sk3',shoes:'sk3',propR:{k:'board',c:'white',c2:'brand',stripe:'brand'},scale:1.0})},
{id:'leilani',name:'Leilani',kind:'Surfers',d:'Long dark hair, teal rash guard, persimmon board shorts, barefoot. Longboard.',
 P:M({body:'pillw',shoulders:1,bust:1.1,seat:1.6,skin:'sk3',hair:'hairDk',hairStyle:'long',top:'teal',sleeve:'long',cuffs:'tealD',untucked:0,legType:'bare',shorts:1,bottom:'brand',shoes:'sk3',propR:{k:'board',long:1,c:'sun',c2:'#c98a12',stripe:'teal'},scale:.97})},
{id:'jett',name:'Jett',kind:'Surfers',d:'Shaggy blond surfer hair and stubble, broad chest, black full wetsuit with a teal chest panel, barefoot. Shortboard.',
 P:M({chest:.63,arms:1.25,body:'rects',skin:'sk1',hair:'hairSun',hairStyle:'surfer',beard:{k:'stubble',c:'#b8893c'},top:'#24211d',sleeve:'long',legType:'full',bottom:'#24211d',panel:'teal',shoes:'sk1',propR:{k:'board',c:'teal',c2:'tealD',stripe:'white'},scale:1.04})},
{id:'mia',name:'Mia',kind:'Surfers',d:'High blond ponytail, coral bikini, barefoot. Shortboard.',
 P:M({...SUIT('sk1'),scoop:0,bikini:{c:'coral',c2:'#c95c45'},skin:'sk1',hair:'hairSun',hairStyle:'pony',ponyHigh:1,tie:'teal',shoes:'sk1',wk:.98,bust:.7,seat:.9,propR:{k:'board',c:'cream',c2:'teal',stripe:'coral'},scale:.95})},
{id:'dez',name:'Dez',kind:'Surfers',d:'Curly hair, navy spring suit with a persimmon chest panel, barefoot. Longboard.',
 P:M({chest:.6,arms:1.27,body:'rects38',skin:'sk4',hair:'hairBlk',hairStyle:'curly',curlR:17.2,top:'navy',sleeve:'short',legType:'bare',shorts:1,bottom:'navy',noBelt:1,untucked:0,panel:'brand',shoes:'sk4',propR:{k:'board',long:1,c:'brand',c2:'brandD',stripe:'cream'},scale:1.01})},


{id:'tess',name:'Tess',kind:'Lifeguards',d:'Brown ponytail, white visor, sunglasses, red suit with a white cross, whistle. Rescue tube.',
 P:M({...SUIT('guard'),cross:1,bust:1.25,seat:1,skin:'sk2',hair:'hairBr',hairStyle:'pony',hat:{k:'visor',c:'white',c2:'white'},glasses:{},neck:{k:'whistle',c:'white'},shoes:'sk2',propR:{k:'tube'},scale:.97})},
{id:'marcus',name:'Marcus',kind:'Lifeguards',d:'Buff: the biggest arms and chest. Buzz cut, red cap, zinc on the nose, shirtless, red trunks, whistle. Rescue tube.',
 P:M({chest:.7,arms:1.3,body:'rects38',skin:'sk4',hair:'hairBlk',hairStyle:'buzz',hat:{k:'cap',c:'guard',c2:'guardD'},zinc:1,...TRUNKS('guard'),top:'sk4',neck:{k:'whistle',c:'white'},shoes:'sk4',propR:{k:'tube'},scale:1.07})},
{id:'owen',name:'Owen',kind:'Lifeguards',d:'Red hair, sunglasses, red tee with a white cross, red shorts, sandals. Binoculars.',
 P:M({chest:.38,arms:1.05,body:'rects36',skin:'sk1',hair:'hairRed',top:'guard',crew:'guardD',cross:1,glasses:{},untucked:1,legType:'bare',shorts:1,bottom:'guard',shoes:'sk1',sandal:'ink',neck:{k:'binoc'},scale:.96})},
{id:'priya',name:'Priya',kind:'Lifeguards',d:'Long black hair, red long-sleeve rash guard with a white cross, red shorts, whistle. Orange rescue tube.',
 P:M({body:'pillw',wk:1.02,shoulders:1,bust:.9,seat:1.3,skin:'sk3',hair:'hairBlk',hairStyle:'long',top:'guard',sleeve:'long',cuffs:'guardD',cross:1,untucked:0,legType:'bare',shorts:1,bottom:'guard',shoes:'sk3',neck:{k:'whistle',c:'white'},propL:{k:'tube',c:'#f28c28'},scale:.98})},
{id:'sam',name:'Sam',kind:'Lifeguards',d:'Wide lifeguard straw hat, sunglasses, white tank, red trunks, whistle. Rescue tube.',
 P:M({chest:.3,arms:.95,body:'rects',skin:'sk2',hair:'hairDk',hairStyle:'messy',hat:{k:'straw',c:'#e2c88f',c2:'guard',w:29},glasses:{},top:'white',sleeve:'none',legType:'bare',shorts:1,bottom:'guard',noBelt:1,untucked:1,neck:{k:'whistle',c:'guard'},shoes:'sk2',propR:{k:'tube'},scale:.94})},


{id:'nina',name:'Nina',kind:'Beach goers',d:'Long blond hair, wide straw sun hat, sunglasses, teal one-piece, sandals. Striped towel over her shoulder.',
 P:M({...SUIT('teal'),bust:1.3,seat:.8,skin:'sk1',hair:'hairSun',hairStyle:'long',hat:{k:'straw',c:'#e8d3a2',c2:'brand',w:28},glasses:{},shoes:'sk1',sandal:'brand',towel:{c:'sun',c2:'white'},lie:{c:'sun',c2:'white',extra:'drink',ec:'coral'},scale:.97})},
{id:'andre',name:'Andre',kind:'Beach goers',d:'Short beard, sunglasses, teal Hawaiian shirt, khaki shorts, sandals. Carries a cooler.',
 P:M({chest:.47,arms:1.2,body:'rects40',skin:'sk4',hair:'hairBlk',beard:{c:'hairBlk'},glasses:{},fabric:'hawaii',fc:'teal',fc2:'mint',fc3:'coral',top:'teal',collar:'tealD',untucked:1,legType:'bare',shorts:1,bottom:'khaki',shoes:'sk4',sandal:'ink',propL:{k:'cooler',c:'sky'},lie:{c:'teal',c2:'cream',extra:'phone'},scale:1.04})},
{id:'rosa',name:'Rosa',kind:'Beach goers',d:'Big curls, sunglasses, sun-yellow bikini, sandals. Beach ball.',
 P:M({...SUIT('sk3'),scoop:0,bikini:{c:'sun',c2:'sunD'},bust:1.8,seat:1.75,wk:1.08,hk:1.06,skin:'sk3',hair:'hairDk',hairStyle:'curly',glasses:{c:'brand'},shoes:'sk3',sandal:'sun',propL:{k:'ball',c:'brand'},lie:{c:'sky',c2:'white',extra:'ball',ec:'brand'},scale:.95})},
{id:'ben',name:'Ben',kind:'Beach goers',d:'Messy brown hair, sun cap, ink tee, navy swim trunks, barefoot. Closed beach umbrella.',
 P:M({chest:.33,arms:.97,body:'rects36',skin:'sk1',hair:'hairBr',hairStyle:'messy',hat:{k:'cap',c:'sun',c2:'brand'},top:'#2f2a24',crew:'#1f1a14',untucked:1,legType:'bare',shorts:1,bottom:'navy',shoes:'sk1',propR:{k:'umbrella',c:'brand'},lie:{c:'brand',c2:'cream'},scale:1.03})},
{id:'grace',name:'Grace',kind:'Beach goers',d:'Bun, sunglasses, lilac one-piece, sandals. A paperback.',
 P:M({...SUIT('lilac'),bust:1.6,seat:1.2,skin:'sk6',hair:'hairBlk',hairStyle:'bun',glasses:{},shoes:'sk6',sandal:'teal',propR:{k:'book',c:'plum'},lie:{c:'mint',c2:'white',extra:'book',ec:'plum'},scale:.99})}
];
/* ---------- round 24 cast: nine more surfers, seven more captains ---------- */
CAST.push(
/* surfers */
{id:'koa',name:'Koa',kind:'Surfers',d:'Man bun and a full beard, shirtless, sun-yellow board shorts, barefoot. Teal longboard.',
 P:M({chest:.6,arms:1.22,body:'rects38',skin:'sk3',hair:'hairBlk',hairStyle:'bun',beard:{c:'hairBlk'},...TRUNKS('sun'),top:'sk3',shoes:'sk3',propR:{k:'board',long:1,c:'teal',c2:'tealD',stripe:'cream'},scale:1.03})},
{id:'benny',name:'Benny',kind:'Surfers',d:'Big build with a belly. Grey buzz, sunglasses, white rash guard, persimmon trunks. Soft-top sun longboard.',
 P:M({chest:.4,arms:1.1,body:'rectsE',skin:'sk2',hair:'hairGr',hairStyle:'buzz',glasses:{},top:'white',crew:'#e7e2d8',sleeve:'short',untucked:1,legType:'bare',shorts:1,bottom:'brand',noBelt:1,shoes:'sk2',propR:{k:'board',long:1,c:'sun',c2:'sunD',stripe:'brand'},scale:1.0})},
{id:'rio',name:'Rio',kind:'Surfers',d:'Lanky teen. Messy sun-bleached hair, shirtless, navy trunks, barefoot. Coral shortboard.',
 P:M({chest:.25,arms:.9,body:'rects',skin:'sk5',hair:'hairSun',hairStyle:'messy',...TRUNKS('navy'),top:'sk5',shoes:'sk5',propR:{k:'board',c:'coral',c2:'#c95c45',stripe:'cream'},scale:.95})},
{id:'marco',name:'Marco',kind:'Surfers',d:'Curly hair and a mustache, navy full wetsuit with a sun chest panel, barefoot. Sky-blue shortboard.',
 P:M({chest:.5,arms:1.15,body:'rects36',skin:'sk2',hair:'hairDk',hairStyle:'curly',curlR:16.4,beard:{k:'stache',c:'hairDk'},top:'navy',sleeve:'long',legType:'full',bottom:'navy',panel:'sun',shoes:'sk2',propR:{k:'board',c:'sky',c2:'#4f94b5',stripe:'sun'},scale:1.0})},
{id:'ty',name:'Ty',kind:'Surfers',d:'Buzz cut, built like a linebacker, shirtless, coral trunks, zinc on the nose. White shortboard with a teal stripe.',
 P:M({chest:.68,arms:1.3,body:'rects40',skin:'sk4',hair:'hairBlk',hairStyle:'buzz',zinc:1,...TRUNKS('coral'),top:'sk4',shoes:'sk4',propR:{k:'board',c:'white',c2:'teal',stripe:'teal'},scale:1.06})},
{id:'hazel',name:'Hazel',kind:'Surfers',d:'The old salt. Long silver hair, persimmon long-sleeve rash guard, khaki board shorts, barefoot. Wooden longboard.',
 P:M({body:'pillw',shoulders:1,bust:1.1,seat:1.2,skin:'sk1',hair:'hairWh',hairStyle:'long',top:'brand',sleeve:'long',cuffs:'brandD',untucked:0,legType:'bare',shorts:1,bottom:'khaki',shoes:'sk1',propR:{k:'board',long:1,c:'#c9a27e',c2:'#8a5a3b',stripe:'cream'},scale:.97})},
{id:'sol',name:'Sol',kind:'Surfers',d:'Big curls under a sun headband, shirtless, plum trunks, barefoot. Mint fish board.',
 P:M({chest:.55,arms:1.2,body:'rects36',skin:'sk6',hair:'hairBlk',hairStyle:'curly',curlR:17.6,hw:{k:'band',c:'sun'},...TRUNKS('plum'),top:'sk6',shoes:'sk6',propR:{k:'board',c:'mint',c2:'teal',stripe:'brand'},scale:1.02})},
{id:'luna',name:'Luna',kind:'Surfers',d:'Long red hair, teal bikini, barefoot. Cream longboard with a coral stripe.',
 P:M({...SUIT('sk1'),scoop:0,bikini:{c:'teal',c2:'tealD'},skin:'sk1',hair:'hairRed',hairStyle:'long',shoes:'sk1',bust:1.35,seat:1.3,propR:{k:'board',long:1,c:'cream',c2:'coral',stripe:'coral'},scale:.97})},
{id:'noa',name:'Noa',kind:'Surfers',d:'Curly black hair, sun-yellow spring suit with a teal chest panel, barefoot. Persimmon shortboard.',
 P:M({body:'pillw',shoulders:1,bust:1.0,seat:1.25,skin:'sk4',hair:'hairBlk',hairStyle:'curly',curlR:16,top:'sun',sleeve:'short',untucked:0,legType:'bare',shorts:1,bottom:'sun',panel:'teal',shoes:'sk4',propR:{k:'board',c:'brand',c2:'brandD',stripe:'cream'},scale:.96})},

/* boat captains, each paired with a boat */
{id:'earl',name:'Captain Earl',kind:'Boat captains',d:'Wiry and weathered. Big grey mustache, olive trucker cap, canvas vest over a red plaid shirt, olive work pants, brown boots. A rod.',
 P:M({chest:.3,arms:.95,body:'rects',skin:'sk1',hair:'hairGr',beard:{k:'stache',c:'hairGr'},hat:{k:'cap',c:'olive',c2:'cream'},fabric:'flannel',top:'#8f2d24',sleeve:'long',cuffs:'#6d1f18',vest:'#c2ab7d',untucked:1,bottom:'olive',shoes:'#5a3a24',boots:'#6b4529',propR:{k:'rod',bob:'sun'},rodHold:1,scale:.96})},
{id:'rosie',name:'Captain Rosie',kind:'Boat captains',d:'Auburn bun under a crimson bandana, navy-and-cream striped tee, rolled jeans, sun-yellow rubber boots. A teal bait bucket.',
 P:M({body:'pillw',shoulders:1,bust:1.15,seat:1.25,skin:'sk1',hair:'hairAub',hairStyle:'bun',hw:{k:'bandana',c:'crimson',c2:'#fbf6ec'},fabric:'stripe',fc:'cream',fc2:'navy',top:'cream',sleeve:'short',untucked:0,bottom:'denim',cuff:'#5b7fa8',shoes:'sun',boots:'sun',propL:{k:'bucket',c:'teal'},scale:.95})},
{id:'duke',name:'Captain Duke',kind:'Boat captains',d:'Big build with a belly. Sunglasses, white cap, white sun shirt, khaki shorts, boat shoes. A heavy offshore rod.',
 P:M({chest:.42,arms:1.15,body:'rectsE',skin:'sk3',hair:'hairAsh',glasses:{},hat:{k:'cap',c:'white',c2:'navy'},top:'#f4f1ea',sleeve:'long',cuffs:'#dcd6ca',collar:'#dcd6ca',untucked:1,legType:'bare',shorts:1,bottom:'khaki',shoes:'brown',propR:{k:'rod',bob:'brand'},rodHold:1,scale:1.04})},
{id:'wes',name:'Captain Wes',kind:'Boat captains',d:'Flats guide. Khaki bucket hat, sunglasses, stubble, sky-blue sun shirt, olive shorts, boat shoes. A fly rod.',
 P:M({chest:.45,arms:1.1,body:'rects36',skin:'sk2',hair:'hairBr',beard:{k:'stubble',c:'hairBr'},glasses:{},hat:{k:'bucket',c:'khaki',c2:'olive'},top:'sky',sleeve:'long',cuffs:'#5aa3c4',collar:'#5aa3c4',untucked:1,legType:'bare',shorts:1,bottom:'olive',shoes:'#c9a27e',propR:{k:'rod',bob:'teal'},rodHold:1,scale:1.01})},
{id:'tammy',name:'Captain Tammy',kind:'Boat captains',d:'Tournament bass angler. Long blond hair, crimson visor, persimmon sunglasses, crimson polo, white shorts, white sneakers. A rod.',
 P:M({body:'pillw',shoulders:1,bust:1.45,seat:1.5,skin:'sk2',hair:'hairSun',hairStyle:'long',hat:{k:'visor',c:'crimson',c2:'crimson'},glasses:{c:'brand'},top:'crimson',polo:'cream',untucked:0,legType:'bare',shorts:1,bottom:'white',shoes:'white',propR:{k:'rod',bob:'sun'},rodHold:1,scale:.96})},
{id:'ace',name:'Captain Ace',kind:'Boat captains',d:'Young and fast. Slick black hair, aviators, persimmon racing jacket with cream trim, navy trousers, white sneakers.',
 P:M({chest:.4,arms:1.1,body:'rects',skin:'sk5',hair:'hairBlk',hairStyle:'short',glasses:{},top:'brand',sleeve:'long',cuffs:'cream',collar:'cream',untucked:1,bottom:'navy',shoes:'white',scale:1.03})},
{id:'ingrid',name:'Captain Ingrid',kind:'Boat captains',d:'Master of a container ship. Silver short hair, white captain’s hat, navy uniform jacket with sun cuffs over a white shirt, navy trousers. Binoculars and a logbook.',
 P:M({body:'pillw',wk:1.02,hk:1.02,shoulders:1,bust:1.0,seat:1.05,skin:'sk1',hair:'hairWh',hairStyle:'short',hat:{k:'captain',c:'white',c2:'navy'},top:'navy',sleeve:'long',cuffs:'sun',collar:'#0f2340',under:'white',untucked:0,bottom:'navy',shoes:'ink',neck:{k:'binoc'},propL:{k:'book',c:'navy'},scale:1.0})}
);

/* Aaron and Rachel at the beach: new outfits, and the towel view */
/* ---------- round 26: four more fishermen ---------- */
CAST.splice(CAST.findIndex(c=>c.id==='kenji')+1,0,
{id:'walt',name:'Walt',kind:'Fishermen',d:'Retired and on the pier every morning. Short grey beard, sun-yellow cap, cream-and-teal striped shirt, khaki shorts, sandals. Rod and his coffee mug.',
 P:M({chest:.4,arms:1.0,body:'rects36',skin:'sk4',hair:'hairGr',beard:{c:'hairGr'},hat:{k:'cap',c:'sun',c2:'brand'},fabric:'stripe',fc:'cream',fc2:'teal',top:'cream',sleeve:'short',untucked:1,legType:'bare',shorts:1,bottom:'khaki',shoes:'sk4',sandal:'#5a3a24',propR:{k:'rod',bob:'brand'},propL:{k:'mug',c:'brand'},rodHold:1,scale:.98})},
{id:'jimmy',name:'Jimmy',kind:'Fishermen',d:'Young and sun-browned. Messy brown hair and stubble, mint tank showing off his arms, navy board shorts, white sneakers. Rod and a persimmon tackle box.',
 P:M({chest:.58,arms:1.2,body:'rects36',skin:'sk2',hair:'hairBr',hairStyle:'messy',beard:{k:'stubble',c:'hairBr'},top:'mint',sleeve:'none',untucked:1,legType:'bare',shorts:1,bottom:'navy',noBelt:1,shoes:'white',propR:{k:'rod',bob:'sun'},propL:{k:'tackle',c:'brand'},rodHold:1,scale:1.03})},
{id:'rico',name:'Rico',kind:'Fishermen',d:'Big arms, big laugh. Persimmon visor, sunglasses, goatee stubble, coral long-sleeve sun shirt, olive cargo pants, boots. Rod and a sun-yellow bait bucket.',
 P:M({chest:.58,arms:1.24,body:'rects40',skin:'sk3',hair:'hairBlk',hairStyle:'buzz',beard:{k:'stubble',c:'hairBlk'},hat:{k:'visor',c:'brand',c2:'brand'},glasses:{},top:'coral',sleeve:'long',cuffs:'#c95c45',collar:'#c95c45',untucked:1,bottom:'olive',shoes:'#5a3a24',boots:'#6b4529',propR:{k:'rod',bob:'teal'},propL:{k:'bucket',c:'sun'},rodHold:1,scale:1.05})},
{id:'dot',name:'Dot',kind:'Fishermen',d:'Pier legend. Grey curls under a wide straw hat with a coral band, lilac windbreaker, cuffed khaki capris, white sneakers. Rod and a teal tackle box.',
 P:M({body:'pillw',shoulders:1,bust:1.25,seat:1.35,wk:1.04,hk:1.04,skin:'sk1',hair:'hairGr',hairStyle:'curly',curlR:16,hat:{k:'straw',c:'#e8d3a2',c2:'coral',w:27},top:'lilac',sleeve:'long',cuffs:'#9a7db2',collar:'#9a7db2',untucked:1,bottom:'khaki',cuff:'#b3a079',shoes:'white',propR:{k:'rod',bob:'brand'},propL:{k:'tackle',c:'teal'},rodHold:1,scale:.94})}
);

/* ---------- round 27: five more beach goers ---------- */
CAST.splice(CAST.findIndex(c=>c.id==='grace')+1,0,
{id:'zoe',name:'Zoe',kind:'Beach goers',d:'Afro puffs tied with sun bands, white sunglasses, teal bikini top with sun-yellow bottoms, sandals. A sun frisbee.',
 P:M({...SUIT('sk6'),scoop:0,bikini:{c:'teal',c2:'tealD',cb:'sun',cb2:'sunD'},bust:1.15,seat:1.55,wk:1.02,hk:1.04,skin:'sk6',hair:'hairBlk',hairStyle:'puffs',tie:'sun',glasses:{c:'white'},shoes:'sk6',sandal:'teal',propR:{k:'frisbee',c:'sun',c2:'brand'},lie:{c:'coral',c2:'cream',extra:'frisbee',ec:'sun',ec2:'brand'},scale:.97})},
{id:'jade',name:'Jade',kind:'Beach goers',d:'Tall. Sleek black high ponytail with a coral tie, cream cat-eye sunglasses, black bikini with cream trim, sandals. Navy-striped tote.',
 P:M({...SUIT('sk5'),scoop:0,bikini:{c:'ink',c2:'cream'},bust:.95,seat:1.05,wk:.97,skin:'sk5',hair:'hairBlk',hairStyle:'pony',ponyHigh:1,tie:'coral',glasses:{c:'cream'},shoes:'sk5',sandal:'cream',propL:{k:'tote',c:'navy',c2:'cream'},lie:{c:'navy',c2:'cream',extra:'tote',ec:'navy',ec2:'cream'},scale:1.02})},
{id:'mae',name:'Mae',kind:'Beach goers',d:'Grandma who never misses a beach day. Short silver hair, sun visor, teal sunglasses, navy-and-cream striped one-piece, navy sandals. Folding beach chair.',
 P:M({...SUIT('navy'),fabric:'stripe',fc:'navy',fc2:'cream',bust:1.4,seat:1.35,wk:1.08,hk:1.05,skin:'sk2',hair:'hairWh',hairStyle:'short',hat:{k:'visor',c:'sun',c2:'sunD'},glasses:{c:'teal'},shoes:'sk2',sandal:'navy',propR:{k:'chair',c:'brand',c2:'cream'},lie:{c:'sun',c2:'brand',extra:'sunscreen',ec:'teal'},scale:.93})},
{id:'leo',name:'Leo',kind:'Beach goers',d:'Athletic. Short dark hair and stubble, navy sunglasses, shirtless, sky-blue swim trunks, barefoot. A football.',
 P:M({chest:.56,arms:1.2,body:'rects36',skin:'sk3',hair:'hairDk',hairStyle:'short',beard:{k:'stubble',c:'hairDk'},glasses:{c:'navy'},...TRUNKS('sky'),top:'sk3',shoes:'sk3',propR:{k:'football'},lie:{c:'teal',c2:'sun',extra:'football'},scale:1.04})},
{id:'frank',name:'Frank',kind:'Beach goers',d:'Dad on vacation, belly and all. Sunburned nose, mint bucket hat, coral Hawaiian shirt, navy shorts, white socks with sandals. Teal speaker.',
 P:M({chest:.36,arms:1.06,body:'rectsE',skin:'sk1',burn:1,hair:'hairGr',hairStyle:'short',hat:{k:'bucket',c:'mint',c2:'#7fbfa8'},fabric:'hawaii',fc:'coral',fc2:'sun',fc3:'cream',top:'coral',collar:'#c95c45',untucked:1,legType:'bare',shorts:1,bottom:'navy',shoes:'white',boots:'white',sandal:'#5a3a24',propR:{k:'speaker',c:'teal',c2:'sun'},lie:{c:'brand',c2:'sun',extra:'speaker',ec:'teal'},scale:1.0})}
);

const BEACH_OUTFITS={
 aaron:{key:'beach',name:'Beach',d:'Shirtless, black sunglasses, red swim trunks, black sandals. On a teal-striped towel with an iced coffee.',P:{glasses:{c:'ink'},fabric:null,top:'sk1',crew:0,collar:0,cuffs:0,under:0,sleeve:'none',untucked:1,legType:'bare',shorts:1,bottom:'#b4232c',noBelt:1,cuff:0,shoes:'sk1',sandal:'ink',lie:{c:'teal',c2:'cream',extra:'drink',ec:'sun'}}},
 rachel:{key:'beach',name:'Beach',d:'Persimmon bikini, bun and persimmon bandana, persimmon sandals. On a sun-striped towel with a book.',P:{top:'sk1',bikini:{c:'brand',c2:'brandD'},scoop:0,sleeve:'none',untucked:0,legType:'bare',shorts:0,cuff:0,shoes:'sk1',sandal:'brand',lie:{c:'sun',c2:'white',extra:'book',ec:'teal'}}}};
const BOAT_FOR={};BOATS.forEach(b=>BOAT_FOR[b.captain]=b.id);


function draw(ch,v){if(ch.cat)return cat(ch.cat,v==='top'?'top':v);return person(ch.P,v)}
function svgOf(ch,v,cls,vbx){const vb=vbx||(v==='lie'?'-6 0 132 204':v==='surf'||String(v).indexOf('ride')===0?'-6 -24 132 230':v==='stand'?'-6 -10 132 216':v==='top'||v==='top-norod'?'0 14 120 172':'-20 -32 160 230'),o='60px 190px';
 return `<svg class="${cls||''}" viewBox="${vb}" overflow="visible" role="img" aria-label="${ch.name}, ${{front:'front',tq:'three-quarter',rq:'rear three-quarter',side:'side',back:'back',top:'from above','top-norod':'from above, hands out, rod removed',lie:'lying on a towel, from above',surf:'lying on the board, from above',stand:'sitting in the lifeguard stand, from above',ride:'surfing, from above','ride-nose':'nose riding, from above','ride-lazy':'cruising lazy, from above','ride-goofy':'surfing goofy foot, from above','ride-switch':'surfing a switchback, from above'}[v]||v}"><g class="lean" style="transform-origin:${o}"><g class="root" style="transform-origin:${o}">${draw(ch,v)}</g></g></svg>`}


const EASE={out:'cubic-bezier(.2,.7,.2,1)',in:'cubic-bezier(.5,0,.75,0)',io:'cubic-bezier(.45,0,.55,1)',spring:'cubic-bezier(.3,1.45,.5,1)'};
const RM=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const NS='http://www.w3.org/2000/svg';
const qp=(svg,n)=>svg.querySelector('.p-'+n);
function loop(el,kf,ms,opt){return el?el.animate(kf,Object.assign({duration:ms,iterations:Infinity},opt||{})):null}
function once(el,kf,ms,opt){return el?el.animate(kf,Object.assign({duration:ms,fill:'forwards'},opt||{})):null}
function addG(svg,html,cls){const g=document.createElementNS(NS,'g');g.setAttribute('class',cls||'fx');g.innerHTML=html;svg.querySelector('.root').appendChild(g);return g}

function idle(svg,seed){seed=seed||0;const A=[],r=svg.querySelector('.root'),eyes=qp(svg,'eyes');
 A.push(loop(r,[{transform:'scale(1,1)'},{transform:'scale(1.005,1.012)'},{transform:'scale(1,1)'}],3400,{easing:EASE.io,delay:-seed*800}));
 if(eyes)A.push(loop(eyes,[{transform:'scaleY(1)',offset:0},{transform:'scaleY(1)',offset:.9},{transform:'scaleY(.08)',offset:.93},{transform:'scaleY(1)',offset:.96},{transform:'scaleY(1)'}],4100+seed*450,{delay:-seed*900}));
 return A}
function walk(svg,T){T=T||560;const A=[],sw=a=>[{transform:`rotate(${-a}deg)`,easing:EASE.io},{transform:`rotate(${a}deg)`,easing:EASE.io},{transform:`rotate(${-a}deg)`}];
 A.push(loop(qp(svg,'legN'),sw(22),T),loop(qp(svg,'legF'),sw(-22),T),loop(qp(svg,'armN'),sw(-20),T),loop(qp(svg,'armF'),sw(20),T));
 A.push(loop(svg.querySelector('.root'),[0,.25,.5,.75,1].map((o,i)=>({offset:o,transform:i%2?'translateY(-3px) scale(.99,1.02)':'translateY(0) scale(1.02,.975)',easing:i%2?EASE.in:EASE.out})),T));
 A.push(loop(qp(svg,'head'),[{transform:'translateY(0)'},{transform:'translateY(-1.3px)',offset:.37},{transform:'translateY(0)',offset:.62},{transform:'translateY(-1.3px)',offset:.87},{transform:'translateY(0)'}],T,{delay:60}));
 return A}


function juggle(svg){if(RM())return 0;const aL=qp(svg,'armL'),aR=qp(svg,'armR'),eyes=qp(svg,'eyes'),head=qp(svg,'head');
 const g=addG(svg,`<g class="pc pc-stem"><rect x="-4.5" y="-10.5" width="9" height="21" rx="3" fill="#1f1a14"/></g><g class="pc pc-bar"><rect x="-14" y="-5" width="28" height="10" rx="3.5" fill="#c2410c"/></g><g class="pc pc-sun"><circle r="4.8" fill="#f5b82e"/></g>`,'fx jg');
 const P=[...g.querySelectorAll('.pc')],CY=1050,N=3,total=CY*N;
 
 const path=[];for(let k=0;k<=24;k++){const t=k/24,a=t<.82?(-Math.PI/2+Math.PI*2*(t/.82)*.5):0;let x,y;
  if(t<.82){const u=t/.82;x=60+26*Math.cos(Math.PI*u);y=98-128*Math.sin(Math.PI*u)}else{const u=(t-.82)/.18;x=34+52*u;y=98+5*Math.sin(Math.PI*u)}path.push([x,y])}
 const kfs=(phase,spin)=>{const out=[];for(let c=0;c<N;c++)path.forEach((p,k)=>{const off=(c+k/24)/N;out.push({offset:off,transform:`translate(${p[0]}px,${p[1]}px) rotate(${(c*24+k)*spin}deg) scale(.9)`})});return out};
 P.forEach((el,i)=>{el.style.transformOrigin='0 0';const a=el.animate(kfs(i,i===1?15:i===0?-12:20),{duration:total,delay:i*CY/3,easing:'linear',fill:'backwards'});
  a.onfinish=()=>{}});
 const arm=(el,s)=>loop(el,[{transform:'rotate(0)'},{transform:`rotate(${s*-26}deg)`,offset:.5},{transform:'rotate(0)'}],CY/2,{easing:EASE.io,iterations:N*2+1});
 arm(aL,1);setTimeout(()=>arm(aR,-1),CY/4);
 if(eyes)loop(eyes,[{transform:'translate(-1.4px,-1px)'},{transform:'translate(1.4px,-1.6px)'},{transform:'translate(-1.4px,-1px)'}],CY,{easing:EASE.io,iterations:N});
 
 const fin=total+CY/3*2+40,dest=[[60,3.5,0],[60,-8,0],[69.5,8.5,0]];
 setTimeout(()=>{P.forEach((el,i)=>{el.getAnimations().forEach(a=>a.cancel());const d=dest[i];
  once(el,[{transform:'translate(86px,98px) scale(.9)'},{transform:`translate(${d[0]+(i-1)*6}px,${-34-i*6}px) rotate(${(i%2?1:-1)*200}deg) scale(.9)`,offset:.55,easing:EASE.in},{transform:`translate(${d[0]}px,${d[1]}px) rotate(0) scale(1.12,.86)`,offset:.86,easing:EASE.out},{transform:`translate(${d[0]}px,${d[1]}px) scale(1)`}],560,{delay:i*130,easing:EASE.out})});
  once(aL,[{transform:'rotate(0)'},{transform:'rotate(28deg)'}],300,{easing:EASE.out});once(aR,[{transform:'rotate(0)'},{transform:'rotate(-28deg)'}],300,{easing:EASE.out});
  if(eyes)once(eyes,[{transform:'translate(0,0)'},{transform:'translate(0,-2.2px)'}],300,{delay:300,easing:EASE.out});
  once(head,[{transform:'translateY(0)'},{transform:'translateY(2.5px) scale(1.03,.96)',offset:.45},{transform:'translateY(0)'}],320,{delay:700,easing:EASE.out});
 },fin);
 const end=fin+1900;
 setTimeout(()=>{once(svg.querySelector('.lean'),[{transform:'rotate(0)'},{transform:'rotate(-7deg)',offset:.4},{transform:'rotate(0)'}],620,{easing:EASE.io});
  P.forEach((el,i)=>once(el,[{opacity:1},{opacity:0}],260,{delay:300+i*60,easing:EASE.in}));
  [aL,aR].forEach(a=>once(a,[{transform:a===aL?'rotate(28deg)':'rotate(-28deg)'},{transform:'rotate(0)'}],380,{easing:EASE.spring}));if(eyes)once(eyes,[{transform:'translate(0,-2.2px)'},{transform:'translate(0,0)'}],300);},end);
 setTimeout(()=>{g.remove();[aL,aR,eyes,head].forEach(el=>el&&el.getAnimations().forEach(a=>a.cancel()))},end+800);
 return end+800}




function tl(el,D,pts,prop,opt){if(!el)return null;prop=prop||'transform';const k=[];
 const P=pts.slice();if(P[0][0]>0)P.unshift([0,P[0][1]]);if(P[P.length-1][0]<D)P.push([D,P[P.length-1][1]]);
 P.forEach(([t,v,e])=>{const o={offset:Math.min(1,Math.max(0,t/D))};o[prop]=v;if(e)o.easing=EASE[e]||e;k.push(o)});
 return el.animate(k,Object.assign({duration:D,fill:'none'},opt||{}))}
const UP='cubic-bezier(.25,.6,.45,1)',DN='cubic-bezier(.55,0,.75,.4)';

function onHand(svg,side,html,cls){const arm=qp(svg,side),inner=arm.firstElementChild,g=document.createElementNS(NS,'g');g.setAttribute('class',cls||'fx');g.innerHTML=html;inner.appendChild(g);return g}

function aim(sh,inner,len,T){const dx=T[0]-sh[0],dy=T[1]-sh[1],th=Math.atan2(-dx,dy)*180/Math.PI;return {rot:th-inner,s:Math.hypot(dx,dy)/len}}
const armT=(a)=>`rotate(${a.rot.toFixed(1)}deg) scaleY(${Math.max(.72,Math.min(1.18,a.s)).toFixed(3)})`;
function fade(els,ms){els.forEach(el=>el&&el.animate([{opacity:1},{opacity:0}],{duration:ms||300,fill:'forwards',easing:EASE.in}))}
function sparkle(svg,pts,delay){pts.forEach(([x,y,kind,col],i)=>{const g=addG(svg,kind==='pill'?`<rect x="-4" y="-1.6" width="8" height="3.2" rx="1.6" fill="${col}"/>`:`<circle r="2.4" fill="${col}"/>`,'fx');g.style.transformOrigin='0 0';
 const a=g.animate([{transform:`translate(${x}px,${y+8}px) scale(0)`,opacity:1},{transform:`translate(${x}px,${y}px) scale(1.2) rotate(30deg)`,opacity:1,offset:.45,easing:EASE.out},{transform:`translate(${x}px,${y-8}px) scale(.5) rotate(70deg)`,opacity:0}],{duration:720,delay:(delay||0)+i*90,easing:EASE.out,fill:'both'});a.onfinish=()=>g.remove()})}


function keepie(svg){if(RM())return 0;const D=8600,lL=qp(svg,'legL'),lR=qp(svg,'legR'),aL=qp(svg,'armL'),aR=qp(svg,'armR'),head=qp(svg,'head'),eyes=qp(svg,'eyes'),mouth=qp(svg,'mouth'),lean=svg.querySelector('.lean'),root=svg.querySelector('.root');
 const g=addG(svg,`<g class="bx"><g class="by"><g class="bs"><circle r="6.4" fill="#f5b82e"/><rect x="-6.4" y="-1.5" width="12.8" height="3" rx="1.5" fill="#c2410c"/></g></g></g>`,'fx kb');
 const bx=g.querySelector('.bx'),by=g.querySelector('.by'),bs=g.querySelector('.bs');[bx,by,bs].forEach(n=>n.style.transformOrigin='0 0');
 
 const L=[26,166],R=[94,166],H=[60,7.5];
 const C=[[0,30,-150,null],[620,...L,null],[1180,...R,48],[1740,...L,48],[2300,...R,48],[2920,...H,-20],[3420,...H,-34],[3840,...H,-30],[4260,60,-300,null]];
 const X=[],Y=[];C.forEach((c,i)=>{const [t,x,y,ap]=c;X.push([t,`translateX(${x}px)`]);
  if(i===0){Y.push([t,`translateY(${y}px)`,DN]);return}
  const p=C[i-1];if(ap!==null){const h0=Math.max(1,p[2]-ap),h1=Math.max(1,y-ap),k=Math.sqrt(h0)/(Math.sqrt(h0)+Math.sqrt(h1)),ta=p[0]+(t-p[0])*k;Y.push([ta,`translateY(${ap}px)`,DN])}
  Y.push([t,`translateY(${y}px)`,i===C.length-1?'linear':UP])});
 
 X.push([5900,'translateX(60px)']);Y.push([5900,'translateY(-300px)',DN]);
 X.push([6320,'translateX(60px)']);Y.push([6320,'translateY(7.5px)',UP]);
 
 X.push([6900,'translateX(102px)']);Y.push([6640,'translateY(-24px)',DN]);Y.push([6900,'translateY(184.6px)',UP]);
 Y.push([7080,'translateY(176px)',DN]);Y.push([7260,'translateY(184.6px)']);X.push([7600,'translateX(86px)','io']);
 X.push([8200,'translateX(86px)']);
 tl(bx,D,X,null,{fill:'both'});tl(by,D,Y,null,{fill:'both'});
 tl(bs,D,[[0,'rotate(0deg)'],[4260,'rotate(1440deg)'],[6320,'rotate(1500deg)'],[6900,'rotate(1900deg)'],[7600,'rotate(1720deg)','io']],null,{fill:'both'});
 
 const kick=(c,sgn,amt)=>[[c-150,'rotate(0deg)','out'],[c,`rotate(${sgn*amt}deg)`,'out'],[c+230,'rotate(0deg)']];
 tl(lL,D,[[0,'rotate(0deg)'],...kick(620,1,22),...kick(1740,1,22),[7300,'rotate(0deg)','out'],[7600,'rotate(0deg)']]);
 tl(lR,D,[[0,'rotate(0deg)'],...kick(1180,-1,22),[2150,'rotate(0deg)','out'],[2300,'rotate(-34deg)','out'],[2560,'rotate(0deg)'],
  [4700,'rotate(0deg)','out'],[4840,'rotate(-7deg)','in'],[4960,'rotate(0deg)','out'],[5100,'rotate(-7deg)','in'],[5220,'rotate(0deg)'],
  [7420,'rotate(0deg)','out'],[7640,'rotate(-15deg)','out'],[8200,'rotate(-15deg)','io'],[8500,'rotate(0deg)']]);
 
 const sway=[[0,0],[620,18],[1180,-6],[1740,18],[2300,-6],[2920,10],[3420,10],[3840,14],[4300,0]];
 tl(aL,D,[...sway.map(([t,a])=>[t,`rotate(${a}deg)`,'io']),[5300,'rotate(0deg)','out'],[5480,'rotate(40deg)','spring'],[5800,'rotate(40deg)','io'],[6000,'rotate(0deg)'],[6320,'rotate(0deg)','out'],[6400,'rotate(30deg)','io'],[7300,'rotate(30deg)','io'],[7600,'rotate(0deg)','out'],[7700,'rotate(0deg)','out'],[7900,'rotate(150deg)','spring'],[8300,'rotate(150deg)','io'],[8550,'rotate(0deg)']]);
 tl(aR,D,[...sway.map(([t,a])=>[t,`rotate(${-a*(t===620||t===1740?.4:1.6)}deg)`,'io']),[5300,'rotate(0deg)','out'],[5480,'rotate(-40deg)','spring'],[5800,'rotate(-40deg)','io'],[6000,'rotate(0deg)'],[6320,'rotate(0deg)','out'],[6400,'rotate(-30deg)','io'],[7300,'rotate(-30deg)','io'],[7600,'rotate(-14deg)','io'],[8300,'rotate(-14deg)','io'],[8550,'rotate(0deg)']]);
 
 tl(head,D,[[0,'translateY(0) rotate(0deg)'],[2860,'translateY(0) rotate(0deg)','out'],[2920,'translateY(2.4px) scale(1.04,.94)','out'],[3080,'translateY(0)','io'],[3360,'translateY(0)','out'],[3420,'translateY(2.4px) scale(1.04,.94)','out'],[3580,'translateY(0)','io'],[3780,'translateY(0)','out'],[3840,'translateY(3px) scale(1.06,.92)','out'],[4100,'translateY(-1.5px) rotate(-4deg)','io'],
  [5300,'translateY(-1.5px) rotate(-4deg)','io'],[5480,'translateY(0) rotate(8deg)','io'],[6000,'translateY(0) rotate(8deg)','io'],[6250,'translateY(-1.5px) rotate(-3deg)','io'],
  [6320,'translateY(4px) scale(1.12,.84)','spring'],[6600,'translateY(0) rotate(0deg)','io'],[7300,'rotate(0deg)','io'],[7380,'rotate(-8deg)','io'],[7460,'rotate(8deg)','io'],[7540,'rotate(-5deg)','io'],[7620,'rotate(0deg)','io'],[8000,'rotate(6deg)','io'],[8400,'rotate(6deg)','io'],[8600,'rotate(0deg)']]);
 
 const ex=x=>((x-60)/34*1.5).toFixed(2);
 tl(eyes,D,[[0,'translate(0,0)'],[300,'translate(-1.2px,1.6px)','io'],[620,`translate(${ex(26)}px,1.8px)`,'io'],[1180,`translate(${ex(94)}px,1.8px)`,'io'],[1740,`translate(${ex(26)}px,1.8px)`,'io'],[2300,`translate(${ex(94)}px,1.8px)`,'io'],[2700,'translate(0,-2.4px)','io'],[4300,'translate(0,-2.6px)','io'],[5300,'translate(0,-2.6px)','io'],[5480,'translate(0,0) scaleY(1)','io'],[6000,'translate(0,-1px)','io'],[6250,'translate(0,-2.6px) scale(1.3)','out'],
  [6320,'translate(0,0) scaleY(.1)','io'],[7000,'translate(0,0) scaleY(.1)','io'],[7100,'translate(0,0) scaleY(1)','io'],[7900,'translate(0,0) scaleY(1)','io'],[8000,'translate(0,0) scaleY(.3)','io'],[8400,'translate(0,0) scaleY(.3)','io'],[8600,'translate(0,0) scaleY(1)']]);
 tl(mouth,D,[[0,'scale(1)'],[5480,'scale(1)','io'],[5600,'scale(.6,1.4)','io'],[6000,'scale(.6,1.4)','io'],[6320,'scale(1.4,2.6)','out'],[6700,'scale(1)','io'],[7900,'scale(1)','io'],[8000,'scale(1.7,1.2)','io'],[8400,'scale(1.7,1.2)','io'],[8600,'scale(1)']]);
 
 tl(lean,D,[[0,'rotate(0deg)'],[6320,'rotate(0deg)','out'],[6460,'rotate(-6deg)','io'],[6640,'rotate(5deg)','io'],[6820,'rotate(-4deg)','io'],[7000,'rotate(3deg)','io'],[7200,'rotate(-1.5deg)','io'],[7400,'rotate(0deg)']]);
 tl(root,D,[[0,'scale(1,1)'],[3800,'scale(1,1)','out'],[3840,'scale(1.04,.95)','out'],[3980,'scale(1,1)'],[6300,'scale(1,1)','out'],[6340,'scale(1.06,.9)','spring'],[6600,'scale(1,1)']]);
 
 setTimeout(()=>{const z=addG(svg,`<g class="orb" style="transform:translate(60px,4px) scale(1,.36)"><g class="spin">${[0,1,2].map(i=>{const a=i*2.094;return `<circle cx="${(19*Math.cos(a)).toFixed(1)}" cy="${(19*Math.sin(a)).toFixed(1)}" r="3.2" fill="#f5b82e"/>`}).join('')}</g></g>`,'fx');
  const sp=z.querySelector('.spin');sp.style.transformOrigin='0 0';sp.animate([{transform:'rotate(0deg)'},{transform:'rotate(720deg)'}],{duration:1000});
  z.animate([{opacity:0},{opacity:1,offset:.1},{opacity:1,offset:.8},{opacity:0}],{duration:1000,fill:'forwards'}).onfinish=()=>z.remove()},6360);
 setTimeout(()=>sparkle(svg,[[24,8,'pill','#c2410c'],[98,4,'dot','#0b6b73'],[16,40,'dot','#f5b82e']]),7950);
 setTimeout(()=>{fade([g],260);setTimeout(()=>g.remove(),300)},D-200);
 return D+150}


const EASEL=`<g class="easel">${pl(117,80,6,112,'#8a5a3b',{rot:-12})}${pl(155,80,6,112,'#8a5a3b',{rot:12})}${pl(136,92,5,96,'#6f4830')}
 <rect x="108" y="52" width="60" height="54" rx="6" fill="#8a5a3b"/><rect x="112" y="56" width="52" height="46" rx="3.5" fill="#fffdf8"/>
 <g class="cv"><clipPath id="cvClip"><rect x="112" y="56" width="52" height="46" rx="3.5"/></clipPath><g clip-path="url(#cvClip)">
 <rect class="cv-sky" x="112" y="56" width="52" height="46" fill="#d6ecee" style="opacity:0"/>
 <circle class="cv-sun" cx="151" cy="68" r="7" fill="#f5b82e" style="opacity:0"/>
 <path class="cv-hill" d="${domeD(128,104,64,30)}" fill="#0b6b73" style="opacity:0"/>
 <path class="cv-tree" d="${pawnD(147,70,18,32)}" fill="#084f55" style="opacity:0"/>
 <rect class="cv-cloud" x="117" y="64" width="18" height="6" rx="3" fill="#fffdf8" style="opacity:0"/>
 <rect class="cv-sig" x="152" y="96" width="9" height="3" rx="1.5" fill="#c2410c" style="opacity:0"/></g></g>
 ${pl(104,102,68,6,'#6f4830')}</g>`;
function painter(svg){
 svg.querySelector('.lean').insertAdjacentHTML('beforebegin',EASEL);
 onHand(svg,'armR',`${pl(67.6,100,2.8,30,'#1f1a14')}<rect x="67.4" y="126" width="3.2" height="5" rx="1" fill="#d8d2c8"/><circle class="tip" cx="69" cy="134" r="2.6" fill="#8a5a3b"/>`,'brush');
 onHand(svg,'armL',`<g transform="rotate(-24 51 108)"><ellipse cx="51" cy="114" rx="13" ry="8" fill="#e8d9bd"/><circle cx="45" cy="112" r="2.2" fill="#0b6b73"/><circle cx="51" cy="110" r="2.2" fill="#f5b82e"/><circle cx="57" cy="112" r="2.2" fill="#c2410c"/><circle cx="54" cy="117.5" r="2.2" fill="#084f55"/><circle cx="46" cy="117" r="1.8" fill="#fbf6ec"/></g>`,'palette');
 const head=qp(svg,'head');head.insertAdjacentHTML('beforeend',`<circle class="smudge" cx="49.5" cy="39" r="2.1" fill="#c2410c" style="opacity:0"/>`)}
function paint(svg){if(RM())return 0;const D=7600,aR=qp(svg,'armR'),aL=qp(svg,'armL'),head=qp(svg,'head'),eyes=qp(svg,'eyes'),mouth=qp(svg,'mouth'),lean=svg.querySelector('.lean'),tip=svg.querySelector('.tip'),q=c=>svg.querySelector('.cv-'+c),sm=svg.querySelector('.smudge');
 const SH=[69,62],IN=-13,LEN=72,at=T=>armT(aim(SH,IN,LEN,T)),PAL=[37,110];
 
 const L=x=>x-8;
 const dab=(t,T,n,amp)=>{const out=[];for(let i=0;i<n;i++){out.push([t+i*130,at([L(T[0])+(i%2?amp:-amp),T[1]+(i%2?-amp*.6:amp*.6)]),'io'])}return out};
 tl(aR,D,[[0,'rotate(0deg) scaleY(1)'],[300,'rotate(0deg) scaleY(1)','io'],[650,at(PAL),'io'],[820,at([PAL[0]+3,PAL[1]+2]),'io'],
  [1150,at([L(120),66]),'io'],...dab(1300,[132,72],5,9),
  [2000,at(PAL),'io'],[2160,at([PAL[0]-3,PAL[1]]),'io'],[2450,at([L(150),70]),'out'],[2580,at([L(152),67]),'io'],[2700,at([L(150),69]),'io'],
  [3000,at(PAL),'io'],[3150,at([PAL[0]+2,PAL[1]+3]),'io'],[3450,at([L(118),100]),'io'],[3700,at([L(132),90]),'io'],[3950,at([L(148),100]),'io'],
  [4250,at(PAL),'io'],[4400,at([PAL[0]+3,PAL[1]+5]),'io'],[4700,at([L(153),100]),'io'],[5000,at([L(153),80]),'io'],
  [5300,'rotate(-20deg) scaleY(1)','io'],[6000,'rotate(-20deg) scaleY(1)','io'],
  [6250,at([L(152),98]),'out'],[6330,at([L(160),96]),'in'],[6420,at([L(150),90]),'out'],
  [7200,'rotate(-8deg) scaleY(1)','io'],[7600,'rotate(0deg) scaleY(1)']],null,{fill:'both'});
 tl(aL,D,[[0,'rotate(0deg)'],[300,'rotate(0deg)','io'],[600,'rotate(10deg)','io'],[5200,'rotate(10deg)','io'],[5400,'rotate(-14deg)','io'],[6000,'rotate(-14deg)','io'],[6200,'rotate(10deg)','io'],[7300,'rotate(10deg)','io'],[7600,'rotate(0deg)']],null,{fill:'both'});
 tl(lean,D,[[0,'translateX(0) rotate(0deg)'],[900,'translateX(0) rotate(0deg)','io'],[1150,'translateX(8px) rotate(2deg)','io'],[5100,'translateX(8px) rotate(2deg)','io'],
  [5400,'translateX(-3px) rotate(-3deg)','io'],[5700,'translateX(-3px) rotate(-3deg)','io'],[5850,'translateX(-3px) rotate(-1deg)','io'],[6050,'translateX(8px) rotate(3deg)','out'],[6450,'translateX(8px) rotate(3deg)','io'],
  [6700,'translateX(4px) rotate(0deg)','io'],[6820,'translateX(4px) rotate(-1.5deg)','io'],[6940,'translateX(4px) rotate(1.5deg)','io'],[7060,'translateX(4px) rotate(-1deg)','io'],[7300,'translateX(4px) rotate(0deg)','io'],[7600,'translateX(0) rotate(0deg)']],null,{fill:'both'});
 tl(head,D,[[0,'rotate(0deg)'],[1100,'rotate(4deg)','io'],[5300,'rotate(4deg)','io'],[5500,'rotate(-9deg)','io'],[5800,'rotate(-9deg)','io'],[5950,'rotate(7deg)','io'],[6400,'rotate(5deg)','io'],[6600,'rotate(-4deg)','io'],[7300,'rotate(-4deg)','io'],[7600,'rotate(0deg)']]);
 tl(eyes,D,[[0,'translate(0,0)'],[400,'translate(-.6px,1.2px)','io'],[600,'translate(-.6px,1.2px)','io'],[1000,'translate(1.6px,-.4px)','io'],[5300,'translate(1.6px,-.4px)','io'],[5450,'translate(1.4px,0) scaleY(.35)','io'],[5900,'translate(1.4px,0) scaleY(.35)','io'],[6000,'translate(1.6px,-.4px)','io'],
  [6520,'translate(-1.4px,1.4px) scale(1.35)','out'],[6800,'translate(-1.4px,1.4px) scale(1.35)','io'],[6900,'translate(0,0) scaleY(.15)','io'],[7300,'translate(0,0) scaleY(.15)','io'],[7600,'translate(0,0)']]);
 tl(mouth,D,[[0,'scale(1)'],[5450,'scale(1)','io'],[5550,'scale(.5,1.6) translateX(2px)','io'],[5900,'scale(.5,1.6) translateX(2px)','io'],[6000,'scale(1)','io'],[6520,'scale(1)','io'],[6600,'scale(.9,2.4)','out'],[6850,'scale(.9,2.4)','io'],[6950,'scale(1.8,1.3)','io'],[7300,'scale(1.8,1.3)','io'],[7600,'scale(1)']]);
 
 [[820,'#0b6b73'],[2160,'#f5b82e'],[3150,'#0b6b73'],[4400,'#084f55'],[6100,'#c2410c'],[7400,'#8a5a3b']].forEach(([t,c])=>setTimeout(()=>tip.setAttribute('fill',c),t));
 
 const show=(el,t,from,ms)=>{el.style.transformBox='fill-box';el.style.transformOrigin=from;el.animate([{opacity:0,transform:from==='center'?'scale(0)':from.includes('bottom')?'scaleY(0)':'scaleX(0)'},{opacity:1,transform:from==='center'?'scale(1.25)':'none',offset:.7},{opacity:1,transform:'none'}],{duration:ms,delay:t,fill:'both',easing:EASE.out})};
 show(q('sky'),1300,'left center',680);show(q('cloud'),1700,'left center',300);show(q('sun'),2450,'center',360);show(q('hill'),3450,'left bottom',560);show(q('tree'),4700,'center bottom',420);show(q('sig'),6280,'left center',150);
 
 setTimeout(()=>{const d=addG(svg,`<circle r="2" fill="#c2410c"/>`,'fx');d.style.transformOrigin='0 0';
  d.animate([{transform:'translate(152px,96px) scale(.6)'},{transform:'translate(98px,8px) scale(1)',offset:.55,easing:EASE.in},{transform:'translate(58px,40px) scale(1.1)'}],{duration:340,easing:EASE.out,fill:'forwards'}).onfinish=()=>{d.remove();sm.style.transformOrigin='49.5px 39px';sm.animate([{opacity:1,transform:'scale(1.8,.5)'},{opacity:1,transform:'scale(1)'}],{duration:220,easing:EASE.spring,fill:'forwards'})}},6340);
 setTimeout(()=>sparkle(svg,[[150,52,'dot','#f5b82e'],[100,50,'pill','#0b6b73'],[160,70,'dot','#c2410c']]),5000);
 setTimeout(()=>sparkle(svg,[[30,18,'pill','#f5b82e'],[88,12,'dot','#0b6b73']]),6950);
 
 setTimeout(()=>{['sky','cloud','sun','hill','tree','sig'].forEach(k=>q(k).getAnimations().forEach(a=>a.cancel()));sm.getAnimations().forEach(a=>a.cancel())},D+1400);
 return D+1500}


const BFLY=`<g class="bf"><g class="bf-wl" style="transform-origin:0px 0px"><g transform="rotate(-62)"><path d="${dropD(0,-15,10,15)}" fill="#f5b82e"/></g><g transform="rotate(-128)"><path d="${dropD(0,-10,7,10)}" fill="#c2410c"/></g></g>
 <g class="bf-wr" style="transform-origin:0px 0px"><g transform="rotate(62)"><path d="${dropD(0,-15,10,15)}" fill="#f5b82e"/></g><g transform="rotate(128)"><path d="${dropD(0,-10,7,10)}" fill="#c2410c"/></g></g>
 <rect x="-1.4" y="-6" width="2.8" height="11" rx="1.4" fill="#1f1a14"/><rect x="-2.6" y="-9.5" width=".9" height="4.6" rx=".45" fill="#1f1a14" transform="rotate(-20 -2 -6)"/><rect x="1.7" y="-9.5" width=".9" height="4.6" rx=".45" fill="#1f1a14" transform="rotate(20 2 -6)"/></g>`;
const CAM=(cx,cy)=>`<rect x="${cx-15}" y="${cy-10}" width="30" height="20" rx="5" fill="#0b6b73"/><rect x="${cx-11}" y="${cy-13}" width="8" height="4" rx="2" fill="#f5b82e"/><rect x="${cx+6}" y="${cy-12.5}" width="6" height="3" rx="1.5" fill="#c2410c"/><circle cx="${cx}" cy="${cy+.5}" r="7" fill="#fffdf8"/><circle cx="${cx}" cy="${cy+.5}" r="4.4" fill="#1f1a14"/><circle cx="${cx+1.6}" cy="${cy-1.1}" r="1.3" fill="#fffdf8"/>`;
function photographer(svg){const root=svg.querySelector('.root');
 root.insertAdjacentHTML('beforeend',`<g class="facecam" style="opacity:0;transform-origin:60px 40px">${CAM(60,40)}<circle cx="45.5" cy="45" r="5.6" fill="#f3cba5"/><circle cx="74.5" cy="45" r="5.6" fill="#f3cba5"/></g>`);
 onHand(svg,'armR',`<g class="selfcam" style="opacity:0"><g transform="rotate(118 69 110)"><rect x="57" y="100" width="24" height="17" rx="4.5" fill="#0b6b73"/><rect x="61" y="103.5" width="16" height="10" rx="2.5" fill="#1d3557"/><circle cx="74" cy="106" r="1.6" fill="#f5b82e"/><g class="polar" style="opacity:0"><rect x="61" y="80" width="16" height="20" rx="2" fill="#fffdf8"/><rect x="63" y="82" width="12" height="12" rx="1" fill="#d6ecee"/><circle cx="69" cy="90" r="3.4" fill="#5c3a1e"/><circle cx="69" cy="90.6" r="2.6" fill="#f3cba5"/><circle cx="72.5" cy="85" r="1.6" fill="#f5b82e"/><circle cx="74.6" cy="85" r="1.6" fill="#f5b82e"/><rect class="dev" x="63" y="82" width="12" height="12" rx="1" fill="#1f1a14"/></g></g></g>`,'selfie')}
function butterfly(svg){if(RM())return 0;const D=8200,aR=qp(svg,'armR'),aL=qp(svg,'armL'),head=qp(svg,'head'),eyes=qp(svg,'eyes'),mouth=qp(svg,'mouth'),lean=svg.querySelector('.lean'),root=svg.querySelector('.root'),fc=svg.querySelector('.facecam'),sc=svg.querySelector('.selfcam'),pol=svg.querySelector('.polar'),dev=svg.querySelector('.dev');
 const eL=svg.querySelector('.eL'),eR=svg.querySelector('.eR');
 const b=addG(svg,BFLY,'fx bfly');b.style.transformOrigin='0 0';const wl=b.querySelector('.bf-wl'),wr=b.querySelector('.bf-wr');
 
 const flap=(ms)=>[wl,wr].map(w=>w.animate([{transform:'scaleX(1)'},{transform:'scaleX(.18)'},{transform:'scaleX(1)'}],{duration:ms,iterations:Infinity,easing:EASE.io}));
 let F=flap(190);const slow=t=>setTimeout(()=>{F.forEach(a=>a.cancel());F=flap(900)},t),fast=t=>setTimeout(()=>{F.forEach(a=>a.cancel());F=flap(190)},t);
 slow(3150);fast(3950);slow(4380);fast(7200);
 
 const BP=[[0,190,-30,-20],[400,150,6,10],[700,128,30,-8],[1000,118,24,6],[1300,116,32,-6],[1650,114,28,0],[1800,4,10,-24],[2100,-2,30,10],[2350,6,22,0],[2500,124,104,20],[2800,118,96,-6],[3050,90,8,8],[3200,60,22,0],[3700,60,22,0],[3900,60,73,0],[4100,60,73,0],[4250,72,40,-10],[4400,62,9,0],[7100,62,9,0],[7350,40,-14,-18],[7700,-10,-60,-20],[8200,-60,-90,0]];
 tl(b,D,BP.map(([t,x,y,r])=>[t,`translate(${x}px,${y}px) rotate(${r}deg)`,'io']),null,{fill:'both'});
 
 const CUPL='rotate(154deg) scaleY(.4)',CUPR='rotate(-154deg) scaleY(.4)',CDL='rotate(-3.6deg) scaleY(.73)',CDR='rotate(3.6deg) scaleY(.73)';
 tl(aL,D,[[0,'rotate(0deg) scaleY(1)'],[850,'rotate(0deg) scaleY(1)','in'],[960,'rotate(14deg) scaleY(.5)','out'],[1150,CUPL,'out'],[3500,CUPL,'io'],[3900,CDL,'io'],[4500,CDL,'io'],[4800,'rotate(-16deg) scaleY(1)','io'],[7300,'rotate(-16deg) scaleY(1)','io'],[7700,'rotate(0deg) scaleY(1)']],null,{fill:'both'});
 tl(aR,D,[[0,'rotate(0deg) scaleY(1)'],[850,'rotate(0deg) scaleY(1)','in'],[960,'rotate(-14deg) scaleY(.5)','out'],[1150,CUPR,'out'],[3500,CUPR,'io'],[3900,CDR,'io'],[4500,CDR,'io'],[4900,'rotate(-120deg) scaleY(1)','out'],[7300,'rotate(-120deg) scaleY(1)','io'],[7700,'rotate(0deg) scaleY(1)']],null,{fill:'both'});
 tl(fc,D,[[0,'translateY(10px) scale(.7)'],[900,'translateY(10px) scale(.7)','out'],[1150,'translateY(0) scale(1)','io'],[3500,'translateY(0) scale(1)','io'],[3900,'translateY(50px) scale(1)','io'],[4500,'translateY(50px) scale(1)','io'],[4700,'translateY(64px) scale(.7)']],null,{fill:'both'});
 tl(fc,D,[[0,'0'],[900,'0'],[1000,'1'],[4550,'1'],[4700,'0']],'opacity',{fill:'both'});
 tl(lean,D,[[0,'rotate(0deg) translateX(0)'],[1300,'rotate(3deg) translateX(1px)','io'],[1700,'rotate(3deg) translateX(1px)','io'],[1950,'rotate(-7deg) translateX(-3px)','out'],[2400,'rotate(-7deg) translateX(-3px)','io'],[2650,'rotate(6deg) translateX(3px) scale(1,.97)','out'],[2950,'rotate(6deg) translateX(3px) scale(1,.97)','io'],[3250,'rotate(0deg)','io'],
  [3300,'translateX(-.6px)','io'],[3360,'translateX(.6px)','io'],[3420,'translateX(-.4px)','io'],[3480,'translateX(0)','io'],[4800,'rotate(0deg)','io'],[5100,'rotate(3deg)','io'],[5800,'rotate(3deg)','io'],[5880,'rotate(1deg) scale(1.02,.98)','out'],[6100,'rotate(3deg)','io'],[7300,'rotate(3deg)','io'],[7700,'rotate(0deg)']],null,{fill:'both'});
 tl(head,D,[[0,'rotate(0deg)'],[700,'rotate(5deg)','io'],[850,'rotate(5deg)','io'],[1150,'rotate(0deg)','io'],[4100,'rotate(0deg)','io'],[4400,'rotate(-5deg) translateY(.5px)','io'],[4800,'rotate(-5deg)','io'],[5100,'rotate(9deg)','io'],[7300,'rotate(9deg)','io'],[7700,'rotate(0deg)']]);
 
 tl(eyes,D,[[0,'translate(0,0)'],[400,'translate(1.6px,-1.2px)','io'],[900,'translate(1.6px,-.4px)','io'],[3900,'translate(0,0)','io'],[4100,'translate(0,0)','io'],[4400,'translate(0,-2.6px)','io'],[5000,'translate(0,-2.6px)','io'],[5200,'translate(1.4px,-1px)','io'],[5800,'translate(1.4px,-1px)','io'],[5850,'translate(1.4px,-1px) scaleY(.1)','io'],[5980,'translate(1.4px,-1px) scaleY(1)','io'],[7300,'translate(1.4px,-1px)','io'],[7600,'translate(-1.5px,-2px)','io'],[8000,'translate(0,0)']]);
 [eL,eR].forEach((e,i)=>{e.style.transformBox='fill-box';e.style.transformOrigin='center';tl(e,D,[[0,'translate(0,0)'],[3900,'translate(0,0)','io'],[4000,`translate(${i?-1.5:1.5}px,1.8px)`,'io'],[4150,`translate(${i?-1.5:1.5}px,1.8px)`,'io'],[4250,'translate(0,0)']])});
 tl(mouth,D,[[0,'scale(1)'],[3950,'scale(1)','io'],[4050,'scale(.7,2)','io'],[4250,'scale(.7,2)','io'],[4500,'scale(1)','io'],[4900,'scale(1.9,1.5)','out'],[7300,'scale(1.9,1.5)','io'],[7600,'scale(1)']]);
 
 tl(sc,D,[[0,'0'],[4700,'0'],[4800,'1'],[7300,'1'],[7450,'0']],'opacity',{fill:'both'});
 setTimeout(()=>{const fl=addG(svg,`<circle r="9" fill="#fffdf8"/><circle r="5" fill="#f5b82e"/>`,'fx');fl.style.transformOrigin='0 0';
  const hp=()=>{const m=new DOMMatrix(getComputedStyle(aR).transform),o=[69,62],x=0,y=48;return [m.a*x+m.c*y+m.e+o[0]+2,m.b*x+m.d*y+m.f+o[1]]};const [hx,hy]=hp();
  fl.animate([{transform:`translate(${hx}px,${hy}px) scale(.2)`,opacity:1},{transform:`translate(${hx}px,${hy}px) scale(3.4)`,opacity:.9,offset:.35},{transform:`translate(${hx}px,${hy}px) scale(4.4)`,opacity:0}],{duration:420,easing:EASE.out}).onfinish=()=>fl.remove();
  sparkle(svg,[[hx-16,hy-16,'pill','#f5b82e'],[hx+14,hy-10,'dot','#c2410c'],[hx+4,hy+16,'dot','#0b6b73']])},5840);
 pol.style.transformOrigin='69px 100px';
 tl(pol,D,[[0,'translateY(18px) scaleY(.2)'],[6050,'translateY(18px) scaleY(.2)','out'],[6450,'translateY(0) scaleY(1)','spring'],[7250,'translateY(0) rotate(4deg)']],null,{fill:'both'});
 tl(pol,D,[[0,'0'],[6050,'0'],[6120,'1'],[7300,'1'],[7400,'0']],'opacity',{fill:'both'});
 tl(dev,D,[[0,'1'],[6400,'1','io'],[7000,'0'],[7300,'0']],'opacity',{fill:'both'});
 setTimeout(()=>{F.forEach(a=>a.cancel());b.remove()},D);
 return D+100}


const TLOGO='<svg class="hm" viewBox="0 0 64 64" aria-hidden="true"><rect x="23" y="18" width="18" height="42" rx="6" fill="#1f1a14"/><rect x="4" y="6" width="56" height="20" rx="7" fill="#c2410c"/><circle cx="51" cy="49" r="9.5" fill="#f5b82e"/></svg>';
const SITE_ICONS={shop:'<rect class="ip" x="4.5" y="9.5" width="15" height="11.5" rx="2.5"/><path class="is" d="M10 21v-3.8a2 2 0 0 1 4 0V21z"/><path class="ib" d="M5 3.5h14a2 2 0 0 1 2 2V8a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V5.5a2 2 0 0 1 2-2z"/><path class="is" d="M9 3.5h6V8a3 3 0 0 1-6 0z"/>',user:'<circle class="ip" cx="12" cy="8" r="4"/><path class="ib r" d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/>',help:'<circle class="is" cx="12" cy="12" r="9"/><path class="ln ik" d="M9.4 9.4a2.7 2.7 0 1 1 3.7 2.5c-.8.35-1.1.9-1.1 1.7v.5"/><circle class="ib" cx="12" cy="17.3" r="1.7"/>',cart:'<rect class="ip" x="5" y="4.5" width="2.6" height="8" rx="1.3" transform="rotate(-14 6.3 8.5)"/><rect class="ip" x="16.4" y="4.5" width="2.6" height="8" rx="1.3" transform="rotate(14 17.7 8.5)"/><path class="ip r" d="M4 11.5h16l-1.5 7.5a2.5 2.5 0 0 1-2.4 2H7.9a2.5 2.5 0 0 1-2.4-2z"/><rect class="ib" x="2.5" y="9.5" width="19" height="3.6" rx="1.8"/>',menu:'<rect class="ip" x="3" y="5" width="18" height="3.2" rx="1.6"/><rect class="ib" x="3" y="10.4" width="12" height="3.2" rx="1.6"/><rect class="is" x="3" y="15.8" width="15" height="3.2" rx="1.6"/>',close:'<rect class="is" x="3" y="3" width="18" height="18" rx="9"/><path class="ln ik" d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>',arrow:'<path class="ip" d="M18.8,11.3 A0.7 0.7 0 0 1 18.8,12.7 C16.8,12.7 14.5,14.9 12.8,17.9 A0.7 0.7 0 0 1 11.4,17.6 L11.4,6.4 A0.7 0.7 0 0 1 12.8,6.1 C14.5,9.1 16.8,11.3 18.8,11.3 Z M11,10.1 A1.9 1.9 0 0 1 11,13.9 L4.4,13.9 A1.9 1.9 0 0 1 4.4,10.1 Z"/>'};
/* headerHTML(phone, beam, links): a SiteHeader with the walk-in stage. phone is kept for older calls; the header now sizes itself to its container. links defaults to the launch set (About, Help, Basket); each is {label, icon, current, count, basket}. The basket link shows in the wide nav and, on phones, as the basket button beside the menu button; the menu lists the rest. */
function headerHTML(phone,beam,links){const word=beam?'<span class="L">T</span><span class="L">a</span><span class="L">r</span><span class="L">v</span><span class="L">e</span><span class="L hdr__r">r</span>':'Tarve<span class="hdr__r">r</span>';links=links||[{label:'About',icon:'user'},{label:'Help',icon:'help'},{label:'Basket',icon:'cart',basket:true,count:0}];const ic=(k,c)=>`<svg class="tv-icon tv-ico${c||''}" viewBox="0 0 24 24" aria-hidden="true">${SITE_ICONS[k]||''}</svg>`,cur=l=>l.current?' aria-current="page"':'',cnt=l=>{if(l.count==null)return '';const z=Math.max(0,Math.floor(+l.count||0)),t=z>9?'9+':String(z);return `<span class="tv-count"${l.basket?' data-tv-basket':''}${z?'':' hidden'} aria-label="${z>9?'More than 9':z} ${z===1?'item':'items'} in basket">${t}</span>`},bk=links.find(l=>l.basket);
 return `<div class="tv-site"><header class="tv-site-header"><div class="tv-site-header__stage" aria-hidden="true"><div class="hdr__actor"><div class="hdr__jump"><div class="hdr__flip"></div></div></div></div><a class="tv-site-header__logo" href="#" aria-label="Tarver, home">${TLOGO}<span class="tv-site-header__word hdr__word">${word}<i class="hdr__bl"></i></span></a><nav class="tv-site-nav" aria-label="Site">${links.map(l=>`<a class="tv-site-nav__link" href="#"${cur(l)}>${ic(l.icon)}${l.label}${cnt(l)}</a>`).join('')}</nav>${bk?`<a class="tv-site-basket" href="#" aria-label="Basket">${ic('cart')}${cnt(bk)}</a>`:''}<button class="tv-site-menubtn" type="button" aria-expanded="false" aria-label="Menu">${ic('menu',' tv-site-menubtn__open')}${ic('close',' tv-site-menubtn__close')}</button><div class="tv-site-menu"><nav class="tv-site-menu__panel" aria-label="Site">${links.filter(l=>!l.basket).map(l=>`<a class="tv-site-menu__item" href="#"${cur(l)}>${ic(l.icon)}<span class="tv-site-menu__label">${l.label}${cnt(l)}</span>${ic('arrow',' tv-site-menu__arrow')}</a>`).join('')}</nav></div></header></div>`}



const LSH=()=>{const P=CAST.find(c=>c.id==='aaron').P;return {x:BG[P.body].sh[0][0],arm:BG[P.body].arm}};
function handAt(a,tilt){const r=Math.PI/180,hx=LSH().x-Math.sin(a*r)*46,hy=58+Math.cos(a*r)*46,vx=hx-60,vy=hy-190,c=Math.cos(tilt*r),s=Math.sin(tilt*r);return {dx:vx*c-vy*s,up:-(vx*s+vy*c)}}
function solveLean(xh,f){const target=(xh-.5)/f;let best=null;for(let tt=-12;tt>=-28;tt-=.5)for(let a=-4;a<=70;a+=.5){const h=handAt(a+LSH().arm,tt),e=Math.abs(h.up-target),sc=e*8+Math.abs(tt+13)*.35+Math.abs(a-30)*.08;if(!best||sc<best.sc)best={sc,a,tt}}
 return {arm:best.a,tilt:best.tt,dx:handAt(best.a+LSH().arm,best.tt).dx}}

function bendTo(svg,s,ms,ease){const legs=svg.querySelector('.legs'),up=svg.querySelector('.up');if(!legs)return [];const k=+legs.dataset.k,f=svg._bend||1;svg._bend=s;const o={duration:ms,easing:ease||EASE.out,fill:'forwards'};
 return [legs.animate([{transform:`scaleY(${f})`},{transform:`scaleY(${s})`}],o),up.animate([{transform:`translateY(${(k*(1-f)).toFixed(1)}px)`},{transform:`translateY(${(k*(1-s)).toFixed(1)}px)`}],o)]}

function viewer(flip,add){const V={side:flip.querySelector('.a-side'),tq:flip.querySelector('.a-tq'),rq:flip.querySelector('.a-rq'),front:flip.querySelector('.a-front'),back:flip.querySelector('.a-back')};
 function show(name,pop){const el=V[name.replace(/L$/,'')]||V.front;Object.values(V).forEach(v=>v&&(v.style.display='none'));el.style.display='block';const m=/L$/.test(name)?-1:1;
  add(el.animate(pop===false?[{transform:`scaleX(${m})`},{transform:`scaleX(${m})`}]:[{transform:`scaleX(${.8*m})`},{transform:`scaleX(${m})`}],{duration:pop===false?1:70,easing:EASE.out,fill:'forwards'}));return el}
 return {V,show}}
const ACTOR_VIEWS=ch=>svgOf(ch,'side','a-side')+svgOf(ch,'tq','a-tq')+svgOf(ch,'rq','a-rq')+svgOf(ch,'front','a-front')+svgOf(ch,'back','a-back');
const BANG=`<g class="fx-bang" style="transform-origin:60px 0px;transform:scale(0)"><rect x="56.5" y="-18" width="7" height="16" rx="3.5" fill="#c2410c"/><circle cx="60" cy="3.5" r="3.6" fill="#c2410c"/></g>`;

function leanFinale(o){const {front,rEl,at,add,t}=o,tip=o.tip!==false,TILT=o.lean.tilt,ARM=o.lean.arm,lean=front.querySelector('.lean'),bang=front.querySelector('.fx-bang'),eyes=qp(front,'eyes'),sh=front.querySelector('.shadow');sh.style.transformOrigin='60px 190px';
 at(t,()=>{
  add(once(lean,[{transform:'rotate(0)'},{transform:`rotate(${TILT}deg)`}],440,{easing:EASE.out}));
  add(once(sh,[{transform:'rotate(0)'},{transform:`rotate(${-TILT}deg)`}],440,{easing:EASE.out}));
  add(once(qp(front,'armL'),[{transform:'rotate(0)'},{transform:`rotate(${ARM}deg)`}],420,{easing:EASE.out}));
  add(once(qp(front,'legR'),[{transform:'rotate(0)'},{transform:'rotate(22deg)'}],400,{delay:120,easing:EASE.out}));
  add(once(qp(front,'legL'),[{transform:'rotate(0)'},{transform:'rotate(-6deg)'}],400,{delay:120,easing:EASE.out}));
  add(rEl.animate([{transform:'scale(1,1)'},{transform:'scale(1.04,.93)',offset:.45},{transform:'scale(.99,1.01)',offset:.75},{transform:'scale(1,.985)'}],{duration:360,delay:220,easing:EASE.out,fill:'forwards'}));});
 if(!tip)return;
 const t5=t+600;let eWide=null;
 at(t5,()=>{add(rEl.animate([{transform:'rotate(0)'},{transform:'rotate(-13deg)'}],{duration:190,easing:EASE.in,fill:'forwards'}));
  add(once(lean,[{transform:`rotate(${TILT}deg)`},{transform:`rotate(${TILT-8}deg) translateX(-2px)`}],190,{easing:EASE.in}));
  eWide=add(once(eyes,[{transform:'scale(1)'},{transform:'scale(1.45)'}],120,{easing:EASE.out}));
  add(once(bang,[{transform:'scale(0) rotate(-20deg)'},{transform:'scale(1.25) rotate(6deg)',offset:.6},{transform:'scale(1) rotate(0)'}],240,{delay:40,easing:EASE.out}));
  add(once(qp(front,'armR'),[{transform:'rotate(0)'},{transform:'rotate(-62deg)'}],170,{easing:EASE.out}));});
 const t6=t5+230;
 at(t6,()=>{add(rEl.animate([{transform:'rotate(-13deg)'},{transform:'rotate(4deg)',offset:.45},{transform:'rotate(-1.5deg)',offset:.75},{transform:'rotate(0)'}],{duration:460,easing:EASE.io,fill:'forwards'}));
  add(once(lean,[{transform:`rotate(${TILT-8}deg) translateX(-2px)`},{transform:`rotate(${TILT+3}deg)`,offset:.5},{transform:`rotate(${TILT}deg)`}],460,{easing:EASE.io}));
  add(once(qp(front,'armR'),[{transform:'rotate(-62deg)'},{transform:'rotate(0)'}],340,{delay:80,easing:EASE.out}));});
 const t7=t6+260;
 at(t7,()=>{add(once(bang,[{transform:'scale(1)'},{transform:'scale(0) rotate(14deg)'}],180,{easing:EASE.in}));
  if(eWide)eWide.cancel();add(once(eyes,[{transform:'scale(1.45)'},{transform:'scale(1)'}],160,{easing:EASE.out,fill:'none'}));
  add(once(qp(front,'head'),[{transform:'rotate(0)'},{transform:'rotate(9deg)',offset:.5},{transform:'rotate(6deg)'}],300,{easing:EASE.out}));
  const eR=front.querySelector('.eR');eR.style.transformOrigin='65.5px 33px';
  add(once(eR,[{transform:'scaleY(1)'},{transform:'scaleY(.12) scaleX(1.3)',offset:.25},{transform:'scaleY(.12) scaleX(1.3)',offset:.7},{transform:'scaleY(1)'}],360,{delay:40,easing:EASE.io,fill:'none'}));});}
/* leanStill: the final lean, held still (reduced motion, or anywhere the walk-in is skipped). head tilts 6deg when the walk-in ends on the wink. */
function leanStill(front,lean,head){const sh=front.querySelector('.shadow');sh.style.transformOrigin='60px 190px';const A=[once(sh,[{transform:`rotate(${-lean.tilt}deg)`}],1),once(front.querySelector('.lean'),[{transform:`rotate(${lean.tilt}deg)`}],1),once(qp(front,'armL'),[{transform:`rotate(${lean.arm}deg)`}],1),once(qp(front,'legR'),[{transform:'rotate(22deg)'}],1),once(qp(front,'legL'),[{transform:'rotate(-6deg)'}],1)];if(head)A.push(once(qp(front,'head'),[{transform:'rotate(6deg)'}],1));return A}

function Entrance(hdr){
 const AARON=CAST.find(c=>c.id==='aaron');
 const actor=hdr.querySelector('.hdr__actor'),jump=hdr.querySelector('.hdr__jump'),flip=hdr.querySelector('.hdr__flip'),word=hdr.querySelector('.hdr__word'),rEl=hdr.querySelector('.hdr__r'),bl=hdr.querySelector('.hdr__bl');
 let anims=[],timers=[];
 const add=a=>{if(a)Array.isArray(a)?anims.push(...a.filter(Boolean)):anims.push(a);return a};
 const at=(ms,f)=>timers.push(setTimeout(f,ms));
 function reset(){timers.forEach(clearTimeout);timers=[];anims.forEach(a=>{try{a.cancel()}catch(e){}});anims=[];
  [rEl,actor,jump,flip].forEach(el=>el.getAnimations().forEach(a=>a.cancel()));actor.style.zIndex=1;}
 let LEAN=null;const HK=1.06;
 function layout(){const cs=getComputedStyle(word),fs=parseFloat(cs.fontSize),f=fs*HK/174,W=160*f,H=230*f;
  const cv=document.createElement('canvas').getContext('2d');cv.font=`700 ${fs}px ${cs.fontFamily}`;const xh=cv.measureText('x').actualBoundingBoxAscent||fs*.5;
  const hb=hdr.getBoundingClientRect(),rb=rEl.getBoundingClientRect(),base=bl.getBoundingClientRect().top-hb.top;
  flip.innerHTML=ACTOR_VIEWS(AARON);
  const front=flip.querySelector('.a-front');
  front.querySelector('.root').insertAdjacentHTML('beforeend',BANG+`<g class="fx-chop">${[0,1,2].map(i=>`<rect class="sl" x="${92+i*7}" y="${-6+i*14}" width="${16-i*3}" height="4" rx="2" fill="#f5b82e" transform="rotate(${-28+i*22} ${92+i*7} ${-4+i*14})" style="opacity:0"/>`).join('')}</g>`);
  actor.style.width=W+'px';actor.style.height=H+'px';actor.style.top=(base-(188+32)*f)+'px';
  LEAN=solveLean(xh,f);return {f,W,H,fs,xh,rL:rb.left-hb.left,rR:rb.right-hb.left,rT:rb.top-hb.top,arm:LEAN.arm,dx:LEAN.dx}}
 function leanPose(front,L){const TILT=LEAN.tilt,sh=front.querySelector('.shadow');sh.style.transformOrigin='60px 190px';return [once(sh,[{transform:`rotate(${-TILT}deg)`}],1),once(front.querySelector('.lean'),[{transform:`rotate(${TILT}deg)`}],1),once(qp(front,'armL'),[{transform:`rotate(${L.arm}deg)`}],1),once(qp(front,'legR'),[{transform:'rotate(22deg)'}],1),once(qp(front,'legL'),[{transform:'rotate(-6deg)'}],1),once(qp(front,'head'),[{transform:'rotate(6deg)'}],1)]}
 function play(){reset();const L=layout(),rC=(L.rL+L.rR)/2,hx=L.rR-(L.rR-L.rL)*.2,endX=hx-L.dx*L.f,ox=80*L.f,landX=endX,stopX=rC-L.W*.18,startX=-L.W;
  const VW=viewer(flip,add),side=VW.V.side,front=VW.V.front,tq=VW.V.tq,eyes=qp(front,'eyes'),sls=[...front.querySelectorAll('.sl')];
  VW.show('side',false);
  if(RM()){actor.style.zIndex=3;actor.style.transform=`translateX(${endX-ox}px)`;VW.show('front',false);add(leanPose(front,L));return}
  
  const D=Math.round((stopX-startX)/(L.W*3.3)*1000);
  add(actor.animate([{transform:`translateX(${startX-ox}px)`},{transform:`translateX(${stopX-ox}px)`}],{duration:D,easing:'linear',fill:'forwards'}));
  const W1=add(walk(side,420));
  
  at(D,()=>{W1.forEach(a=>a.cancel());actor.style.zIndex=3;
   ['legN','legF','armN','armF'].forEach(n=>add(once(qp(side,n),[{transform:'rotate(12deg)'},{transform:'rotate(0)'}],200,{easing:EASE.out})));
   add(once(side.querySelector('.root'),[{transform:'scale(1.03,.95)'},{transform:'scale(1,1)'}],240,{easing:EASE.out,fill:'none'}));
   add(once(qp(side,'head'),[{transform:'rotate(0)'},{transform:'rotate(-10deg)',offset:.4},{transform:'rotate(-10deg)',offset:.7},{transform:'rotate(0)'}],330,{easing:EASE.io,fill:'none'}));});
  
  const t1=D+300,up=L.H*.3,airT=540;
  at(t1,()=>{add(bendTo(side,.82,150))});
  at(t1+150,()=>{add(bendTo(side,1,120,EASE.out));
   add(actor.animate([{transform:`translateX(${stopX-ox}px)`},{transform:`translateX(${landX-ox}px)`}],{duration:airT,easing:EASE.io,fill:'forwards'}));
   add(jump.animate([{transform:'translateY(0)'},{transform:`translateY(${-up}px)`,offset:.48,easing:EASE.in},{transform:'translateY(0)'}],{duration:airT,easing:EASE.out,fill:'forwards'}));
   flip.style.transformOrigin='50% 60%';
   add(flip.animate([{transform:'rotate(0)'},{transform:'rotate(-12deg)',offset:.3},{transform:'rotate(7deg)',offset:.62},{transform:'rotate(0)'}],{duration:airT,easing:EASE.io,fill:'forwards'}));
   
   at(airT*.14,()=>{VW.show('tq');add(once(qp(tq,'armR'),[{transform:'rotate(0)'},{transform:'rotate(-110deg)'}],90,{easing:EASE.out}));add(once(qp(tq,'armL'),[{transform:'rotate(0)'},{transform:'rotate(36deg)'}],90,{easing:EASE.out}));add(once(qp(tq,'legL'),[{transform:'rotate(0)'},{transform:'rotate(20deg)'}],90,{easing:EASE.out}))});
   at(airT*.3,()=>{VW.show('front');
    add(once(qp(front,'armR'),[{transform:'rotate(-110deg)'},{transform:'rotate(-158deg)'}],140,{easing:EASE.out}));
    add(once(qp(front,'armL'),[{transform:'rotate(36deg)'},{transform:'rotate(58deg)'}],140,{easing:EASE.out}));
    add(once(qp(front,'legL'),[{transform:'rotate(20deg)'},{transform:'rotate(34deg)'}],140,{easing:EASE.out}));
    add(once(eyes,[{transform:'scale(1)'},{transform:'scaleY(.35) scaleX(1.2)'}],120,{easing:EASE.out}));});
  });
  
  const t2=t1+150+airT;
  at(t2-90,()=>{add(once(qp(front,'armR'),[{transform:'rotate(-158deg)'},{transform:'rotate(-26deg)'}],120,{easing:EASE.in}));
   sls.forEach((sl,i)=>add(once(sl,[{opacity:0,transform:sl.getAttribute('transform')},{opacity:1,offset:.25},{opacity:0}],320,{delay:20+i*40,fill:'none'})));});
  at(t2,()=>{add(bendTo(front,.76,110,EASE.out));
   add(once(qp(front,'legL'),[{transform:'rotate(34deg)'},{transform:'rotate(13deg)'}],110,{easing:EASE.out}));add(once(qp(front,'legR'),[{transform:'rotate(0)'},{transform:'rotate(-13deg)'}],110,{easing:EASE.out}));
   at(260,()=>{add(bendTo(front,1,300,EASE.spring));add(once(qp(front,'legL'),[{transform:'rotate(13deg)'},{transform:'rotate(0)'}],260,{easing:EASE.out}));add(once(qp(front,'legR'),[{transform:'rotate(-13deg)'},{transform:'rotate(0)'}],260,{easing:EASE.out}))});
   add(rEl.animate([{transform:'translateX(0) rotate(0)'},{transform:'translateX(-1.5px) rotate(-5deg)',offset:.2},{transform:'translateX(1.5px) rotate(4deg)',offset:.4},{transform:'translateX(-1px) rotate(-2.5deg)',offset:.6},{transform:'translateX(.5px) rotate(1deg)',offset:.8},{transform:'none'}],{duration:480,easing:EASE.io}));
   add(once(eyes,[{transform:'scaleY(.35) scaleX(1.2)'},{transform:'scale(1)'}],200,{delay:240,easing:EASE.out}));});
  
  const t3=t2+360;
  at(t3,()=>{add(once(qp(front,'armR'),[{transform:'rotate(-26deg)'},{transform:'rotate(-18deg)',offset:.25},{transform:'rotate(-30deg)',offset:.5},{transform:'rotate(-18deg)',offset:.75},{transform:'rotate(0)'}],300,{easing:EASE.io}));
   add(once(qp(front,'armL'),[{transform:'rotate(58deg)'},{transform:'rotate(0)'}],240,{easing:EASE.out}));});
  const t4=t3+260;
  leanFinale({front,rEl,lean:LEAN,at,add,t:t4});
 }
 return {play,reset}}



function Beam(hdr){
 const AARON=CAST.find(c=>c.id==='aaron');
 const actor=hdr.querySelector('.hdr__actor'),jump=hdr.querySelector('.hdr__jump'),flip=hdr.querySelector('.hdr__flip'),word=hdr.querySelector('.hdr__word'),bl=hdr.querySelector('.hdr__bl'),rEl=hdr.querySelector('.hdr__r');
 let anims=[],timers=[],cards=null;
 const add=a=>{if(a)Array.isArray(a)?anims.push(...a.filter(Boolean)):anims.push(a);return a};
 const at=(ms,f)=>timers.push(setTimeout(f,ms));
 function reset(){timers.forEach(clearTimeout);timers=[];anims.forEach(a=>{try{a.cancel()}catch(e){}});anims=[];[actor,jump,flip,rEl].forEach(el=>el.getAnimations().forEach(a=>a.cancel()));actor.style.zIndex=1;if(cards)cards.remove();cards=null}
 function layout(){const cs=getComputedStyle(word),fs=parseFloat(cs.fontSize),f=fs*1.06/174,W=160*f,H=230*f;
  const cv=document.createElement('canvas').getContext('2d');cv.font=`700 ${fs}px ${cs.fontFamily}`;
  const hb=hdr.getBoundingClientRect(),base=bl.getBoundingClientRect().top-hb.top;
  const L=[...word.querySelectorAll('.L')].map(el=>{const r=el.getBoundingClientRect(),ch=el.textContent;return {ch,l:r.left-hb.left,r:r.right-hb.left,c:(r.left+r.right)/2-hb.left,asc:cv.measureText(ch).actualBoundingBoxAscent||fs*(ch==='T'?.68:.48)}});
  flip.innerHTML=ACTOR_VIEWS(AARON);flip.querySelector('.a-front .root').insertAdjacentHTML('beforeend',BANG);
  actor.style.width=W+'px';actor.style.height=H+'px';actor.style.top=(base-(188+32)*f)+'px';
  const xh=cv.measureText('x').actualBoundingBoxAscent||fs*.5,rb=rEl.getBoundingClientRect();
  return {fs,f,W,H,base,L,rL:rb.left-hb.left,rR:rb.right-hb.left,lean:solveLean(xh,f)}}
 
 function beamWalk(side,T){const sw=a=>[{transform:`rotate(${-a}deg)`,easing:EASE.io},{transform:`rotate(${a}deg)`,easing:EASE.io},{transform:`rotate(${-a}deg)`}];
  return [loop(qp(side,'legN'),sw(13),T),loop(qp(side,'legF'),sw(-13),T),
   loop(qp(side,'armN'),[{transform:'rotate(-84deg)'},{transform:'rotate(-76deg)'},{transform:'rotate(-84deg)'}],T*2,{easing:EASE.io}),
   loop(qp(side,'armF'),[{transform:'rotate(84deg)'},{transform:'rotate(92deg)'},{transform:'rotate(84deg)'}],T*2,{easing:EASE.io}),
   loop(side.querySelector('.root'),[0,.5,1].map((o,i)=>({offset:o,transform:i%2?'translateY(-1.5px)':'translateY(0)'})),T/2,{easing:EASE.io})]}
 function play(){reset();const Q=layout(),{f,W,H,L}=Q,ox=80*f,T=L[0],xs=L.slice(1),last=L[L.length-1],pre=L[L.length-2],v=L.find(o=>o.ch==='v')||xs[2];
  const xAsc=xs.reduce((s,o)=>s+o.asc,0)/xs.length;
  const VW=viewer(flip,add),side=VW.V.side,front=VW.V.front,back=VW.V.back,tq=VW.V.tq,eyesF=qp(front,'eyes');VW.show('side',false);flip.style.transformOrigin='50% 82%';
  const X=x=>`translateX(${(x-ox).toFixed(1)}px)`,Y=y=>`translateY(${(-y).toFixed(1)}px)`;
  const LEAN=Q.lean,leanX=Q.rR-(Q.rR-Q.rL)*.2-LEAN.dx*f;
  if(RM()){actor.style.zIndex=3;actor.style.transform=X(leanX);VW.show('front',false);add(leanStill(front,LEAN));return}
  let t=0,x=-W;const moveX=(x1,ms,e)=>{const a=x;add(actor.animate([{transform:X(a)},{transform:X(x1)}],{duration:ms,delay:t,easing:e||'linear',fill:'forwards'}));x=x1};
  const hopY=(y0,y1,peak,ms)=>add(jump.animate([{transform:Y(y0)},{transform:Y(peak),offset:.45,easing:EASE.in},{transform:Y(y1)}],{duration:ms,delay:t,easing:EASE.out,fill:'forwards'}));
  
  const x0=T.l-W*.32,d1=Math.round((x0-x)/(W*3.4)*1000);moveX(x0,d1);const W1=add(walk(side,420));t+=d1;
  
  at(t,()=>{W1.forEach(a=>a.cancel());actor.style.zIndex=3;add(once(side.querySelector('.root'),[{transform:'scale(1,1)'},{transform:'scale(1.08,.86)'},{transform:'scale(1,1)'}],200,{easing:EASE.out,fill:'none'}))});
  t+=120;const xT1=T.l+(T.r-T.l)*.3;moveX(xT1,340,EASE.io);hopY(0,T.asc,T.asc+H*.2,340);
  at(t,()=>{add(once(qp(side,'armN'),[{transform:'rotate(0)'},{transform:'rotate(-150deg)'}],200,{easing:EASE.out}));add(once(qp(side,'armF'),[{transform:'rotate(0)'},{transform:'rotate(40deg)'}],200,{easing:EASE.out}))});
  t+=340;
  
  at(t,()=>{add(once(side.querySelector('.root'),[{transform:'scale(1.07,.9)'},{transform:'scale(1,1)'}],220,{easing:EASE.out,fill:'none'}));
   add(once(qp(side,'armN'),[{transform:'rotate(-150deg)'},{transform:'rotate(-84deg)'}],300,{easing:EASE.spring}));add(once(qp(side,'armF'),[{transform:'rotate(40deg)'},{transform:'rotate(84deg)'}],300,{easing:EASE.spring}));
   add(once(side.querySelector('.lean'),[{transform:'rotate(0)'},{transform:'rotate(5deg)',offset:.3},{transform:'rotate(-3deg)',offset:.65},{transform:'rotate(0)'}],360,{easing:EASE.io,fill:'none'}))});
  t+=180;
  
  const slow=W*2,stepT=420;let BW=null;
  const walkTo=(x1)=>{const ms=Math.max(200,Math.round(Math.abs(x1-x)/slow*1000));at(t,()=>{BW=add(beamWalk(side,stepT))});moveX(x1,ms);t+=ms;at(t,()=>{if(BW)BW.forEach(a=>a.cancel())});return ms};
  walkTo(T.r-(T.r-T.l)*.12);
  at(t,()=>{add(once(qp(side,'armN'),[{transform:'rotate(-84deg)'}],1));add(once(qp(side,'armF'),[{transform:'rotate(84deg)'}],1))});
  moveX(xs[0].c,300,EASE.io);hopY(T.asc,xAsc,T.asc+H*.05,300);t+=300;
  at(t,()=>add(once(side.querySelector('.root'),[{transform:'scale(1.05,.93)'},{transform:'scale(1,1)'}],180,{easing:EASE.out,fill:'none'})));t+=100;
  
  /* No stop at the v: one steady walk across the letters to the e. */
  walkTo(pre.c);
  
  at(t,()=>{add(once(side.querySelector('.root'),[{transform:'scale(1,1)'},{transform:'scale(1.07,.86)'}],200,{easing:EASE.out}));
   add(once(qp(side,'armN'),[{transform:'rotate(-84deg)'},{transform:'rotate(52deg)'}],200,{easing:EASE.out}));add(once(qp(side,'armF'),[{transform:'rotate(84deg)'},{transform:'rotate(62deg)'}],200,{easing:EASE.out}));
   add(once(qp(side,'legN'),[{transform:'rotate(0)'},{transform:'rotate(-6deg)'}],200,{easing:EASE.out}))});
  t+=180;const air=950;
  const view=n=>VW.show(n);
  at(t,()=>{add(once(side.querySelector('.root'),[{transform:'scale(1.07,.86)'},{transform:'scale(.95,1.07)',offset:.5},{transform:'scale(1,1)'}],240,{easing:EASE.out}));
   add(once(qp(side,'armN'),[{transform:'rotate(52deg)'},{transform:'rotate(-172deg)'}],170,{easing:EASE.out}));add(once(qp(side,'armF'),[{transform:'rotate(62deg)'},{transform:'rotate(-168deg)'}],170,{easing:EASE.out}));
   add(once(qp(side,'legN'),[{transform:'rotate(-6deg)'},{transform:'rotate(4deg)'}],170,{easing:EASE.out}));
   flip.style.transformOrigin='50% 60%';
   add(flip.animate([{transform:'rotate(0deg)'},{transform:'rotate(0deg)',offset:.13,easing:'cubic-bezier(.35,.05,.45,1)'},{transform:'rotate(360deg)',offset:.6},{transform:'rotate(360deg)'}],{duration:air,fill:'forwards'}));
   
   at(air*.15,()=>{add(once(qp(side,'legN'),[{transform:'rotate(4deg)'},{transform:'rotate(-108deg)'}],150,{easing:EASE.out}));add(once(qp(side,'legF'),[{transform:'rotate(0)'},{transform:'rotate(-102deg)'}],150,{easing:EASE.out}));
    add(once(qp(side,'armN'),[{transform:'rotate(-172deg)'},{transform:'rotate(-104deg)'}],150,{easing:EASE.out}));add(once(qp(side,'armF'),[{transform:'rotate(-168deg)'},{transform:'rotate(-98deg)'}],150,{easing:EASE.out}));
    const e=qp(side,'eyes');if(e)add(once(e,[{transform:'scaleY(1)'},{transform:'scaleY(.15)'}],100))});
   
   at(air*.5,()=>{add(once(qp(side,'legN'),[{transform:'rotate(-108deg)'},{transform:'rotate(0)'}],140,{easing:EASE.out}));add(once(qp(side,'legF'),[{transform:'rotate(-102deg)'},{transform:'rotate(0)'}],140,{easing:EASE.out}));
    add(once(qp(side,'armN'),[{transform:'rotate(-104deg)'},{transform:'rotate(-174deg)'}],140,{easing:EASE.out}));add(once(qp(side,'armF'),[{transform:'rotate(-98deg)'},{transform:'rotate(-170deg)'}],140,{easing:EASE.out}));
    const e=qp(side,'eyes');if(e)add(once(e,[{transform:'scaleY(.15)'},{transform:'scaleY(1)'}],100))});
   
   at(air*.58,()=>{['armL','armR'].forEach((n,i)=>{const s=i?-1:1;[front,back,tq,VW.V.rq].forEach(v=>add(once(qp(v,n),[{transform:`rotate(${168*s}deg)`}],1)))});
    add(once(qp(front,'legL'),[{transform:'rotate(3deg)'}],1));add(once(qp(front,'legR'),[{transform:'rotate(-3deg)'}],1))});
   
   ['tq','front','tqL','sideL','rqL','back','rq','side','tq','front'].forEach((v,k)=>at(air*.6+k*38,()=>view(v)));
  });
  moveX(leanX,air,'cubic-bezier(.3,.1,.6,1)');hopY(xAsc,0,xAsc+H*.4,air);t+=air;
  /* Sticks the landing beside the r: knees bend, arms out, the judges' cards pop, then straight into the lean. */
  const UP=['body','hairB','head'],KN=16;
  at(t,()=>{[side,tq,back,VW.V.rq].forEach(v=>v.querySelectorAll('*').forEach(n=>n.getAnimations().forEach(a=>a.cancel())));
   ['legL','legR'].forEach((n,i)=>{const el=qp(front,n);el.style.transformOrigin=`${i?67:53}px 188px`;
    add(once(el,[{transform:`rotate(${i?-3:3}deg) scaleY(1)`},{transform:`rotate(${i?-12:12}deg) scale(1.06,.8)`},{transform:'rotate(0deg) scale(1,1)'}],360,{easing:EASE.out,fill:'none'}))});
   UP.forEach(n=>add(once(qp(front,n),[{transform:'translateY(0)'},{transform:`translateY(${KN}px)`,offset:.45},{transform:'translateY(0)'}],360,{easing:EASE.out,fill:'none'})));
   add(once(qp(front,'armL'),[{transform:'rotate(168deg)'},{transform:'rotate(82deg)',offset:.5},{transform:'rotate(0)'}],380,{easing:EASE.out}));add(once(qp(front,'armR'),[{transform:'rotate(-168deg)'},{transform:'rotate(-82deg)',offset:.5},{transform:'rotate(0)'}],380,{easing:EASE.out}));
   add(once(eyesF,[{transform:'scaleY(1)'},{transform:'scaleY(.4)',offset:.4},{transform:'scaleY(1)'}],360,{easing:EASE.out,fill:'none'}));
   const fs=Q.fs,cw=fs*.42,ch=fs*.5,cx=(xs[0].l+last.r)/2,top=Q.base-T.asc-ch-fs*.18;
   cards=document.createElement('div');cards.className='hdr__cards';cards.style.cssText=`position:absolute;left:${(cx-cw*1.75).toFixed(1)}px;top:${top.toFixed(1)}px;display:flex;gap:${(cw*.25).toFixed(1)}px;z-index:4;pointer-events:none`;
   cards.innerHTML=[-7,2,8].map(r=>`<span style="display:grid;place-items:center;width:${cw.toFixed(1)}px;height:${ch.toFixed(1)}px;border-radius:${(cw*.28).toFixed(1)}px;background:#fffdf8;box-shadow:0 0 0 ${Math.max(1.2,fs*.04).toFixed(1)}px #1f1a14;font:700 ${(fs*.26).toFixed(1)}px/1 Fraunces,Georgia,serif;color:#1f1a14;transform:scale(0) rotate(${r}deg)" data-r="${r}">10</span>`).join('');
   hdr.appendChild(cards);[...cards.children].forEach((c,i)=>{const r=c.dataset.r;add(c.animate([{transform:`translateY(30%) scale(0) rotate(${r}deg)`},{transform:`translateY(-8%) scale(1.15) rotate(${r}deg)`,offset:.6},{transform:`translateY(0) scale(1) rotate(${r}deg)`}],{duration:300,delay:i*90,easing:EASE.out,fill:'forwards'}))});
   at(600,()=>{if(cards)[...cards.children].forEach((c,i)=>add(c.animate([{opacity:1},{opacity:0,transform:`translateY(-30%) rotate(${c.dataset.r}deg)`}],{duration:240,delay:i*60,fill:'forwards',easing:EASE.in})))});
   at(360,()=>{['legL','legR'].forEach((n,i)=>{qp(front,n).style.transformOrigin=`${i?67:53}px 107px`})});});
  leanFinale({front,rEl,lean:LEAN,at,add,t:t+300,tip:false});
 }
 return {play,reset}}


/* walkSetup: shared setup for walk-ins (actor, stage, timers and extras, and a layout that places Aaron and finds his lean on the r). */
let WKN=0;
function walkSetup(hdr){
 const AARON=CAST.find(c=>c.id==='aaron');
 const el={actor:hdr.querySelector('.hdr__actor'),jump:hdr.querySelector('.hdr__jump'),flip:hdr.querySelector('.hdr__flip'),word:hdr.querySelector('.hdr__word'),rEl:hdr.querySelector('.hdr__r'),bl:hdr.querySelector('.hdr__bl'),stage:hdr.querySelector('.tv-site-header__stage')||hdr};
 const S={anims:[],timers:[],extras:[]};
 S.add=a=>{if(a)Array.isArray(a)?S.anims.push(...a.filter(Boolean)):S.anims.push(a);return a};
 S.at=(ms,f)=>S.timers.push(setTimeout(f,ms));
 S.reset=()=>{S.timers.forEach(clearTimeout);S.timers=[];S.anims.forEach(a=>{try{a.cancel()}catch(e){}});S.anims=[];[el.rEl,el.actor,el.jump,el.flip].forEach(x=>x.getAnimations().forEach(a=>a.cancel()));el.actor.style.zIndex=1;S.extras.forEach(x=>x.remove());S.extras=[]};
 S.layout=()=>{const cs=getComputedStyle(el.word),fs=parseFloat(cs.fontSize),f=fs*1.06/174,W=160*f,H=230*f;
  const cv=document.createElement('canvas').getContext('2d');cv.font=`700 ${fs}px ${cs.fontFamily}`;const xh=cv.measureText('x').actualBoundingBoxAscent||fs*.5;
  const hb=el.stage.getBoundingClientRect(),rb=el.rEl.getBoundingClientRect(),wb=el.word.getBoundingClientRect(),base=el.bl.getBoundingClientRect().top-hb.top;
  el.flip.innerHTML=ACTOR_VIEWS(AARON);el.flip.querySelector('.a-front .root').insertAdjacentHTML('beforeend',BANG);
  const top=base-(188+32)*f;el.actor.style.width=W+'px';el.actor.style.height=H+'px';el.actor.style.top=top+'px';
  const LEAN=solveLean(xh,f),rL=rb.left-hb.left,rR=rb.right-hb.left,leanX=rR-(rR-rL)*.2-LEAN.dx*f;
  return {fs,f,W,H,base,top,LEAN,rL,rR,wL:wb.left-hb.left,wR:wb.right-hb.left,leanX,ox:80*f,hb}};
 return {el,S};
}
/* C. The umbrella drop: he floats down from above holding a beach umbrella, lands beside the r, a gust turns the umbrella inside out and carries it off, and he leans. */
function Umbrella(hdr){const {el,S}=walkSetup(hdr),{actor,jump,flip,rEl}=el;
 function play(){S.reset();const L=S.layout(),X=x=>`translateX(${(x-L.ox).toFixed(1)}px)`;
  const VW=viewer(flip,S.add),front=VW.V.front,eyes=qp(front,'eyes'),armR=qp(front,'armR'),armL=qp(front,'armL'),bang=front.querySelector('.fx-bang');
  const id='tvumb'+(++WKN),cx=76,hy=106,rim=34,cw=150,chh=48;
  armR.insertAdjacentHTML('beforeend',`<g class="fx-umb" style="transform-origin:${cx}px ${hy}px"><g transform="rotate(180 ${cx} ${hy})"><rect x="${cx-1.6}" y="${rim-6}" width="3.2" height="${hy-rim+14}" rx="1.6" fill="#c9bca4"/><g class="fx-can" style="transform-origin:${cx}px ${rim}px"><clipPath id="${id}"><path d="${domeD(cx,rim,cw,chh)}"/></clipPath><path d="${domeD(cx,rim,cw,chh)}" fill="#f5b82e"/><g clip-path="url(#${id})">${[-2,0,2].map(k=>`<path d="M${cx},${rim-chh-8} L${(cx+k*cw/6-cw/12).toFixed(1)},${rim+2} L${(cx+k*cw/6+cw/12).toFixed(1)},${rim+2} Z" fill="#c2410c"/>`).join('')}</g><circle cx="${cx}" cy="${rim-chh-1}" r="4" fill="#1f1a14"/></g></g></g>`);
  const umb=front.querySelector('.fx-umb'),can=front.querySelector('.fx-can');
  VW.show('front',false);
  if(RM()){actor.style.zIndex=3;actor.style.transform=X(L.leanX);umb.style.display='none';S.add(leanStill(front,L.LEAN));return}
  actor.style.zIndex=3;
  const D=2600,fall=L.base+L.H*.15,startX=L.leanX-L.W*1.7;
  S.add(once(armR,[{transform:'rotate(-172deg)'}],1));S.add(once(armL,[{transform:'rotate(28deg)'}],1));
  S.add(once(qp(front,'legL'),[{transform:'rotate(6deg)'}],1));S.add(once(qp(front,'legR'),[{transform:'rotate(-8deg)'}],1));
  S.add(actor.animate([{transform:X(startX)},{transform:X(L.leanX-L.W*.55),offset:.55},{transform:X(L.leanX)}],{duration:D,easing:'cubic-bezier(.3,.2,.45,1)',fill:'forwards'}));
  S.add(jump.animate([{transform:`translateY(${(-fall).toFixed(1)}px)`},{transform:'translateY(0)'}],{duration:D,easing:'cubic-bezier(.25,.1,.5,1)',fill:'forwards'}));
  flip.style.transformOrigin='50% -30%';
  S.add(flip.animate([{transform:'rotate(-9deg)'},{transform:'rotate(7deg)',offset:.3},{transform:'rotate(-5deg)',offset:.6},{transform:'rotate(2deg)',offset:.85},{transform:'rotate(0)'}],{duration:D,easing:EASE.io,fill:'forwards'}));
  S.add(qp(front,'legR').animate([{transform:'rotate(-8deg)'},{transform:'rotate(6deg)',offset:.35},{transform:'rotate(-6deg)',offset:.7},{transform:'rotate(-8deg)'}],{duration:D-200,easing:EASE.io}));
  S.at(D,()=>{S.add(bendTo(front,.8,130,EASE.out));S.at(130,()=>S.add(bendTo(front,1,260,EASE.spring)));
   S.add(once(qp(front,'legL'),[{transform:'rotate(6deg)'},{transform:'rotate(0)'}],160,{easing:EASE.out}));S.add(once(qp(front,'legR'),[{transform:'rotate(-8deg)'},{transform:'rotate(0)'}],160,{easing:EASE.out}));
   S.add(once(armL,[{transform:'rotate(28deg)'},{transform:'rotate(0)'}],200,{easing:EASE.out}))});
  /* the surprise: a gust turns it inside out and takes it */
  S.at(D+260,()=>{S.add(can.animate([{transform:'scaleY(1)'},{transform:'scaleY(-1.2)',offset:.6},{transform:'scaleY(-1)'}],{duration:240,easing:EASE.out,fill:'forwards'}));
   S.add(once(eyes,[{transform:'scale(1)'},{transform:'scale(1.45)'}],120,{easing:EASE.out}));
   S.add(once(bang,[{transform:'scale(0) rotate(-20deg)'},{transform:'scale(1.25) rotate(6deg)',offset:.6},{transform:'scale(1) rotate(0)'}],240,{delay:40,easing:EASE.out}));
   S.add(once(armR,[{transform:'rotate(-172deg)'},{transform:'rotate(-150deg)'},{transform:'rotate(-176deg)'}],260,{easing:EASE.io}))});
  S.at(D+620,()=>{S.add(umb.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:'translate(-50px,170px) rotate(-30deg)',opacity:1,offset:.6},{transform:'translate(-90px,280px) rotate(-55deg)',opacity:0}],{duration:440,easing:EASE.in,fill:'forwards'}));
   S.add(once(armR,[{transform:'rotate(-176deg)'},{transform:'rotate(0)'}],340,{delay:440,easing:EASE.out}));
   S.add(once(bang,[{transform:'scale(1)'},{transform:'scale(0) rotate(14deg)'}],180,{delay:220,easing:EASE.in}));
   S.add(once(eyes,[{transform:'scale(1.45)'},{transform:'scale(1)'}],160,{delay:260,easing:EASE.out}))});
  leanFinale({front,rEl,lean:L.LEAN,at:S.at,add:S.add,t:D+1180,tip:false});
 }
 return {play,reset:S.reset}}



/* D. The family: Sky leaps in from the left onto the T of the mark and sits facing you, Zara jumps down from the top right onto the v and lies on her side, Rachel walks in from the left and waves, Aaron runs in from the right, kisses her, and leans on the r with his arm around her. Ends still. */
function Family(hdr){const {el,S}=walkSetup(hdr),{actor,jump,flip,rEl,stage,word}=el;
 const RACHEL=CAST.find(c=>c.id==='rachel'),SKY=CAST.find(c=>c.id==='sky'),ZARA=CAST.find(c=>c.id==='zara');
 function box(z){const a=document.createElement('div');a.style.cssText=`position:absolute;left:0;top:0;z-index:${z};pointer-events:none`;a.innerHTML='<div class="fj" style="width:100%;height:100%"><div class="ff" style="width:100%;height:100%"></div></div>';stage.appendChild(a);S.extras.push(a);return a}
 function play(){S.reset();const L=S.layout(),f=L.f,W=L.W,H=L.H,hb=L.hb,X=(x)=>`translateX(${(x-L.ox).toFixed(1)}px)`;
  const VW=viewer(flip,S.add),front=VW.V.front,side=VW.V.side,tq=VW.V.tq;
  /* Rachel */
  const rA=box(4);rA.style.width=W+'px';rA.style.height=H+'px';rA.style.top=L.top+'px';const rJ=rA.querySelector('.fj'),rF=rA.querySelector('.ff');rF.innerHTML=ACTOR_VIEWS(RACHEL);
  const RV=viewer(rF,S.add),rFront=RV.V.front,rSide=RV.V.side,rTq=RV.V.tq;
  /* the cats: a lying cat's body rests 186 units down the drawing */
  const mk=hdr.querySelector('.tv-site-header__logo svg').getBoundingClientRect();
  const Ls=[...word.querySelectorAll('.L')],vEl=Ls.find(s=>s.textContent==='v')||Ls[3],vb=vEl.getBoundingClientRect();
  const cv=document.createElement('canvas').getContext('2d'),cs=getComputedStyle(word);cv.font=`700 ${L.fs}px ${cs.fontFamily}`;const xh=cv.measureText('x').actualBoundingBoxAscent||L.fs*.5;
  const cat=(ch,cx,surface,z,front)=>{const a=box(z);a.style.width=W+'px';a.style.height=H+'px';a.style.left=(cx-91.5*f).toFixed(1)+'px';a.style.top=(surface-(186+32)*f).toFixed(1)+'px';a.querySelector('.ff').innerHTML=svgOf(ch,'side','c-side')+(front?svgOf(ch,'front','c-front'):'');a.querySelectorAll('svg').forEach(v=>{v.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible'});const fr=a.querySelector('.c-front');if(fr){fr.style.display='none';fr.style.left=(11.5*f).toFixed(1)+'px'}return a};
  const skyX=mk.left-hb.left+mk.width*.5,skyS=mk.top-hb.top+mk.height*6/64;
  const zX=vb.left-hb.left+vb.width*.5,zS=L.base-xh;
  const sky=cat(SKY,skyX,skyS,3,true),zara=cat(ZARA,zX,zS,3);{const zf=zara.querySelector('.ff');zf.style.transformOrigin=(91.5*f).toFixed(1)+'px 50%';zf.style.transform='scaleX(-1)'}
  /* The side hug: each arm goes behind the other person. Rachel stands in front of Aaron, and her near arm is drawn on its own layer behind him. */
  const rArm=box(3);rArm.style.width=W+'px';rArm.style.height=H+'px';rArm.style.top=L.top+'px';rArm.querySelector('.ff').innerHTML=svgOf(RACHEL,'front','');rArm.style.display='none';
  rArm.querySelectorAll('svg *').forEach(n=>n.style.visibility='hidden');rArm.querySelectorAll('.p-armL, .p-armL *').forEach(n=>n.style.visibility='visible');
  function hug(ms){const rf=RV.V.front,ra=rArm.querySelector('svg');rArm.style.display='block';actor.style.zIndex=4;rA.style.zIndex=5;qp(rf,'armL').style.visibility='hidden';
   [rf,ra].forEach(v=>S.add(once(v.querySelector('.lean'),[{transform:'rotate(0)'},{transform:'rotate(-6deg)'}],ms,{easing:EASE.out})));
   S.add(once(qp(ra,'armL'),[{transform:'rotate(0)'},{transform:'rotate(50deg)'}],ms,{delay:ms?120:0,easing:EASE.out}))}
  const meet=L.leanX,rX=L.leanX+W*.23,rEnd=L.leanX+W*.1;
  VW.show('side',false);RV.show('side',false);
  if(RM()){actor.style.zIndex=3;actor.style.transform=X(meet);rA.style.transform=X(rEnd);rArm.style.transform=X(rEnd);VW.show('front',false);RV.show('front',false);hug(1);
   sit(sky,true);S.add(lie(zara,'side',1));S.add(leanStill(front,L.LEAN));S.add(once(qp(front,'armR'),[{transform:'rotate(-58deg)'}],1));return}
  function lie(c,kind,ms){const s=c.querySelector('.c-side'),A=[],r=s.querySelector('.root'),q=n=>s.querySelector('.'+n);
   A.push(once(r,[{transform:'translateY(0)'},{transform:'translateY(44px)'}],ms,{easing:EASE.out}));
   A.push(once(q('tail'),[{transform:'rotate(0)'},{transform:'rotate(-74deg)'}],ms,{easing:EASE.out}));
   const sh=r.querySelector('ellipse');if(sh)A.push(once(sh,[{transform:'translateY(0)'},{transform:'translateY(-44px)'}],ms,{easing:EASE.out}));
   /* on her side: all four legs stretched out the same way, paws forward */
   [['cl-b',-74],['cl-bb',-66],['cl-f',-78],['cl-ff',-70]].forEach(([n,a])=>A.push(once(q(n),[{transform:'rotate(0)'},{transform:`rotate(${a}deg)`}],ms,{easing:EASE.out})));
   return A}
  function sit(c,still){const sd=c.querySelector('.c-side'),fr=c.querySelector('.c-front');sd.style.display='none';fr.style.display='block';if(!still)S.add(fr.animate([{transform:'scaleX(.8)'},{transform:'scaleX(1)'}],{duration:90,easing:EASE.out}))}
  /* A clean leap: across in a straight line, up and down on a true arc (rise eases out, fall eases in), stretched out in the air, legs down just before landing. dir 1 comes in from the left, -1 from the right. */
  function leap(c,delay,ms,peak,dir,after){const j=c.querySelector('.fj'),sd=c.querySelector('.c-side'),r=sd.querySelector('.root'),q=n=>sd.querySelector('.'+n),cx=parseFloat(c.style.left);
   const x0=dir>0?-(cx+W*1.1):W*2.2,y0=dir>0?-H*.05:-(parseFloat(c.style.top)+H*1.05),yp=-H*peak,up=Math.round(ms*.5);
   S.add(c.animate([{transform:`translateX(${x0.toFixed(1)}px)`},{transform:'translateX(0)'}],{duration:ms,delay,easing:'linear',fill:'backwards'}));
   S.add(j.animate(dir>0?[{transform:`translateY(${y0.toFixed(1)}px)`,easing:'cubic-bezier(.2,.6,.4,1)'},{transform:`translateY(${yp.toFixed(1)}px)`,offset:.5,easing:'cubic-bezier(.6,0,.8,.4)'},{transform:'translateY(0)'}]:[{transform:`translateY(${y0.toFixed(1)}px)`,easing:'cubic-bezier(.45,.05,.85,.5)'},{transform:'translateY(0)'}],{duration:ms,delay,fill:'backwards'}));
   S.add(r.animate([{transform:'rotate(-12deg)'},{transform:'rotate(0deg)',offset:.5},{transform:'rotate(10deg)',offset:.85},{transform:'rotate(0)'}],{duration:ms,delay,easing:'linear',fill:'backwards'}));
   [['cl-b',-46],['cl-bb',-38],['cl-f',44],['cl-ff',36]].forEach(([n,a])=>S.add(q(n).animate([{transform:`rotate(${a}deg)`},{transform:`rotate(${a}deg)`,offset:.72},{transform:'rotate(0)'}],{duration:ms,delay,easing:EASE.io,fill:'backwards'})));
   S.add(q('tail').animate([{transform:'rotate(-36deg)'},{transform:'rotate(-24deg)',offset:.72},{transform:'rotate(0)'}],{duration:ms,delay,easing:EASE.io,fill:'backwards'}));
   S.at(delay+ms,()=>{S.add(once(r,[{transform:'scale(1.1,.86)'},{transform:'scale(1,1)'}],180,{easing:EASE.out,fill:'none'}));S.at(170,after)})}
  leap(sky,0,640,.7,1,()=>sit(sky));
  leap(zara,420,620,.9,-1,()=>S.add(lie(zara,'side',280)));

  /* Rachel walks in from the left and waves */
  const rStart=-W,rDur=Math.round((rX-rStart)/(W*3.4)*1000);
  const RD=160;S.add(rA.animate([{transform:X(rStart)},{transform:X(rX)}],{duration:rDur,delay:RD,easing:'linear',fill:'both'}));const RW=S.add(walk(rSide,420));
  S.at(rDur+RD,()=>{RW.forEach(a=>a.cancel());RV.show('tq');S.at(70,()=>RV.show('front'));
   const ar=qp(rFront,'armR');S.add(once(ar,[{transform:'rotate(0)'},{transform:'rotate(-150deg)',offset:.25},{transform:'rotate(-128deg)',offset:.45},{transform:'rotate(-150deg)',offset:.65},{transform:'rotate(-128deg)',offset:.82},{transform:'rotate(0)'}],760,{delay:80,easing:EASE.io}))});
  /* Aaron runs in from the right, behind her */
  const aStart=Math.max(hb.width+W*.6,rX+W*3),aT0=Math.max(900,rDur+160-350),aDur=1300;
  actor.style.zIndex=3;actor.style.transform=X(aStart);
  S.at(aT0,()=>{VW.show('sideL',false);S.add(actor.animate([{transform:X(aStart)},{transform:X(meet)}],{duration:aDur,easing:'cubic-bezier(.3,.4,.5,1)',fill:'forwards'}));
   const RN=S.add(walk(side,300));S.add(once(side.querySelector('.lean'),[{transform:'rotate(0)'},{transform:'rotate(9deg)'}],160));
   S.at(aDur,()=>{RN.forEach(a=>a.cancel());S.add(once(side.querySelector('.lean'),[{transform:'rotate(9deg)'},{transform:'rotate(0)'}],120));VW.show('tq');})});
  /* the kiss */
  const tK=aT0+aDur+140;
  S.at(tK,()=>{RV.show('tqL');
   S.add(once(tq.querySelector('.lean'),[{transform:'rotate(0)'},{transform:'rotate(9deg)'},{transform:'rotate(9deg)',offset:.7},{transform:'rotate(0)'}],620,{easing:EASE.io}));
   S.add(once(RV.V.tq.querySelector('.lean'),[{transform:'rotate(0)'},{transform:'rotate(7deg)'},{transform:'rotate(7deg)',offset:.7},{transform:'rotate(0)'}],620,{easing:EASE.io}));
   const hs=56*f,hx=meet+(rX-meet)*.5,hy=L.top+(4+32)*f;const h=document.createElement('span');h.style.cssText=`position:absolute;left:${(hx-hs/2).toFixed(1)}px;top:${(hy-hs).toFixed(1)}px;width:${hs.toFixed(1)}px;height:${hs.toFixed(1)}px;z-index:5;pointer-events:none;transform:scale(0)`;
   h.innerHTML='<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 20S3.5 15 3.5 9A4.7 4.7 0 0 1 12 6.8 4.7 4.7 0 0 1 20.5 9C20.5 15 12 20 12 20z" fill="#c2410c"/><circle cx="17.5" cy="4.5" r="2" fill="#f5b82e"/></svg>';stage.appendChild(h);S.extras.push(h);
   S.add(h.animate([{transform:'translateY(4px) scale(0)',opacity:1},{transform:'translateY(-2px) scale(1.15)',opacity:1,offset:.35},{transform:'translateY(-6px) scale(1)',opacity:1,offset:.7},{transform:'translateY(-12px) scale(.9)',opacity:0}],{duration:760,delay:180,easing:EASE.out,fill:'forwards'}))});
  /* settle: he leans on the r with his arm around her */
  const tL=tK+640;
  S.at(tL,()=>{VW.show('front');RV.show('front');hug(360);S.add(rA.animate([{transform:X(rX)},{transform:X(rEnd)}],{duration:320,easing:EASE.io,fill:'forwards'}));S.add(rArm.animate([{transform:X(rX)},{transform:X(rEnd)}],{duration:320,easing:EASE.io,fill:'forwards'}))});
  leanFinale({front,rEl,lean:L.LEAN,at:S.at,add:S.add,t:tL+60,tip:false});
  S.at(tL+180,()=>S.add(once(qp(front,'armR'),[{transform:'rotate(0)'},{transform:'rotate(-58deg)'}],360,{easing:EASE.out})));
 }
 return {play,reset:S.reset}}

const OUTFITS={
 aaron:[{key:'locked',name:'Locked pick',d:'Red flannel over a grey tee, dark skinny jeans, sun sneakers.',P:{}},
  {key:'summer',name:'Summer',d:'Cream tee, khaki slim shorts, cream sneakers.',P:{fabric:null,top:'#efe7d6',crew:'#d8cdb6',sleeve:'short',collar:0,cuffs:0,under:0,untucked:1,legType:'bare',shorts:1,bottom:'khaki',cuff:0,shoes:'#efe7d6'}},
  {key:'autumn',name:'Autumn',d:'Olive crew sweater, black jeans, brown sneakers.',P:{fabric:'knit',fc:'#4a5a3c',top:'#4a5a3c',sleeve:'long',cuffs:'#38452c',crew:'#38452c',hem:'#38452c',collar:0,under:0,untucked:1,bottom:'#2b2620',cuff:'#4a443c',shoes:'brown'}}],
 rachel:[{key:'locked',name:'Locked pick',d:'Persimmon sleeveless top, black jeans, brown flats, bun and persimmon bandana.',P:{}},
  {key:'summer',name:'Summer',d:'Sun dress, persimmon headband, long hair, persimmon flats.',P:{top:'sun',bottom:'sun',skirt:'long',legType:'bare',belt:'sunD',cuff:0,hairStyle:'long',hw:{k:'band',c:'brand'},shoes:'brand'}},
  {key:'autumn',name:'Autumn',d:'Brown ribbed V-neck, blue jeans, long hair, persimmon flats.',P:{fabric:'knit',fc:'#7a4e33',top:'#7a4e33',sleeve:'long',cuffs:'#5e3a25',vneck:'#5e3a25',hem:'#5e3a25',untucked:1,bottom:'denim',cuff:'#5b7fa8',shoes:'brand',hairStyle:'long',hw:null}}]};
OUTFITS.aaron.push(BEACH_OUTFITS.aaron);OUTFITS.rachel.push(BEACH_OUTFITS.rachel);
const BASEP={};CAST.forEach(c=>{if(OUTFITS[c.id])BASEP[c.id]=Object.assign({},c.P)});
const wearing={aaron:'locked',rachel:'locked'};
function wear(id,key){const o=OUTFITS[id].find(x=>x.key===key);if(!o)return;wearing[id]=key;const c=CAST.find(x=>x.id===id);c.P=Object.assign({},BASEP[id],o.P)}
const GROUPS=[['Family',['aaron','rachel','sky','zara']],['Fishermen'],['Boat captains'],['Surfers'],['Lifeguards'],['Beach goers']].map(([k,ids])=>({name:k,ids:ids||CAST.filter(c=>c.kind===k).map(c=>c.id)}));
const EXTRA_VIEW={Surfers:['surf','On the board'],Lifeguards:['stand','In the stand'],'Beach goers':['lie','On the towel']};
const ENTRANCES=[{key:'A',name:'The lean',beam:0,make:h=>Entrance(h)},{key:'B',name:'The balance beam',beam:1,make:h=>Beam(h)},{key:'C',name:'The umbrella drop',beam:0,make:h=>Umbrella(h)},{key:'D',name:'The family',beam:1,make:h=>Family(h)}];
function nextEntrance(){let i=0;try{i=(+localStorage.getItem('tarver.walkin')||0)%ENTRANCES.length;localStorage.setItem('tarver.walkin',String((i+1)%ENTRANCES.length))}catch(e){}return ENTRANCES[i]}
function ensureDefs(){if(document.getElementById('tvShade')||!document.body)return;document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="tvShade" x1="0" x2="1"><stop offset=".4" stop-color="#1f1a14" stop-opacity="0"/><stop offset="1" stop-color="#1f1a14" stop-opacity=".17"/></linearGradient></defs></svg>')}
const svgOf0=svgOf;svgOf=function(ch,v,cls,vb){ensureDefs();return svgOf0(ch,v,cls,vb)};
return {ROD_HANDS,BOATS,boatSVG,BOAT_TURN,rideStyles,RIDE_STYLES,umbrellaTop,umbrellaSide,ballTop,ballSide,CAST,GROUPS,OUTFITS,wearing,wear,EXTRA_VIEW,svgOf,draw,ensureDefs,idle,walk,juggle,keepie,paint,painter,butterfly,photographer,headerHTML,Entrance,Beam,ENTRANCES,nextEntrance,RM,EASE,shapes:{pawnD,dropD,twinD,flareUpD,flareDownD,domeD,pillD,headD,arrowD,pinD,rotD}};
})();
window.Tarver.shapes=window.Tarver.characters.shapes;

/* Tarver.fit: size a one-line figure to fill its column (data-tv-fit="max,min", default 96,28). Runs on load, on font load and on resize. */
window.Tarver.fit=(function(){function one(el){var a=(el.getAttribute('data-tv-fit')||'').split(','),mx=+a[0]||96,mn=+a[1]||28,p=el.parentElement;if(!p)return;var w=p.clientWidth;if(!w)return;el.style.fontSize=mx+'px';var s=el.scrollWidth;if(s>w)el.style.fontSize=Math.max(mn,Math.floor(mx*w/s))+'px'}function all(root){(root||document).querySelectorAll('[data-tv-fit]').forEach(function(el){one(el);if(window.ResizeObserver&&!el.__tvfit){el.__tvfit=1;new ResizeObserver(function(){one(el)}).observe(el.parentElement)}})}function go(){all();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){all()})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else setTimeout(go,0);return all})();

/* Tarver.press: every press shows. Adds .is-pressed to every pressable Tarver control (buttons, chips, action rows and cards, icon buttons, tabs, tab bar items, segments, calendar days, swatches, toggles, checkboxes, toast actions and table sort buttons) for at least 140ms so a quick tap still reads, and lets iOS Safari apply :active. Skips disabled controls. */
window.Tarver.press=(function(){var SEL='.tv-btn,.tv-chip,.tv-row--action,.tv-card--action,.tv-iconbtn,.tv-tab,.tv-tabbar__item,.tv-seg__opt,.tv-cal__day,.tv-swatch,.tv-toggle,.tv-check,.tv-toast__action,.tv-table__sort,.tv-site-nav__link,.tv-site-menu__item,.tv-site-menubtn,.tv-site-basket,.tv-site-footer__pill,.tv-join__fix,.tv-link';if(typeof document==='undefined')return null;document.addEventListener('touchstart',function(){},{passive:true});document.addEventListener('pointerdown',function(e){var el=e.target&&e.target.closest?e.target.closest(SEL):null;if(!el||el.disabled||el.getAttribute('aria-disabled')==='true'||(el.classList.contains('tv-check')&&el.querySelector('input:disabled')))return;var t=Date.now();el.classList.add('is-pressed');function up(){document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',up,true);setTimeout(function(){el.classList.remove('is-pressed')},Math.max(0,140-(Date.now()-t)))}document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true)},true);return {selector:SEL,hold:140}})();

/* Tarver.siteHeader: wires every .tv-site-header (call wire(el) for one added later). The menu button toggles .is-open, aria-expanded and its label. While the menu is open the page behind does not scroll, keyboard focus moves to the first link and stays in the header (Tab and Shift+Tab loop through the menu button and the links), and Escape, choosing a link or a tap on the dimmed page closes it; Escape and a tap return focus to the button. count(n) formats a basket count: whole numbers, 9+ above nine; basket(n) sets every basket count on the page (.tv-count[data-tv-basket]), hiding it at zero. Inside tv-site--sticky the header adds is-scrolled once the page has moved 24px (only on scroll, never on load, so a walk-in always measures the full-size header); the checkout header never changes. */
window.Tarver.siteHeader=(function(){if(typeof document==='undefined')return null;function count(n){n=Math.max(0,Math.floor(+n||0));return n>9?'9+':String(n)}function shrink(h){if(h.classList.contains('tv-site-header--checkout')||!h.closest('.tv-site--sticky'))return;var on=false,q=false;function tick(){q=false;var s=(window.pageYOffset||document.documentElement.scrollTop||0)>24;if(s!==on){on=s;h.classList.toggle('is-scrolled',s)}}window.addEventListener('scroll',function(){if(!q){q=true;requestAnimationFrame(tick)}},{passive:true})}function basket(n){var z=Math.max(0,Math.floor(+n||0)),t=count(z);document.querySelectorAll('.tv-count[data-tv-basket]').forEach(function(c){c.textContent=t;c.hidden=z===0;c.setAttribute('aria-label',(z>9?'More than 9':z)+(z===1?' item':' items')+' in basket')});return z}function wire(h){if(h&&h.classList&&!h.classList.contains('tv-site-header')&&h.querySelector){var hx=h.querySelector('.tv-site-header');if(hx)h=hx}if(!h||h.__tvsite)return;h.__tvsite=1;shrink(h);var b=h.querySelector('.tv-site-menubtn'),m=h.querySelector('.tv-site-menu'),root=document.documentElement,prev=null;if(!b)return;function isOpen(){return h.classList.contains('is-open')}function stops(){return [b].concat([].slice.call(h.querySelectorAll('.tv-site-menu__item'))).filter(function(x){return x.offsetParent!==null})}function set(o,back,quiet){h.classList.toggle('is-open',o);b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Close menu':'Menu');if(quiet)return;if(o){if(prev===null){prev=root.style.overflow;root.style.overflow='hidden'}setTimeout(function(){var f=h.querySelector('.tv-site-menu__item');if(f&&isOpen())f.focus()},60)}else{if(prev!==null){root.style.overflow=prev;prev=null}if(back)b.focus()}}set(isOpen(),false,true);b.addEventListener('click',function(){set(!isOpen(),true)});if(m)m.addEventListener('click',function(e){if(e.target===m)set(false,true);else if(e.target.closest('.tv-site-menu__item'))set(false,false)});document.addEventListener('keydown',function(e){if(!isOpen())return;if(e.key==='Escape'){e.preventDefault();set(false,true);return}if(e.key!=='Tab')return;var s=stops(),i=s.indexOf(document.activeElement);if(!s.length)return;if(i===-1){e.preventDefault();s[0].focus()}else if(e.shiftKey&&i===0){e.preventDefault();s[s.length-1].focus()}else if(!e.shiftKey&&i===s.length-1){e.preventDefault();s[0].focus()}})}function all(root){(root||document).querySelectorAll('.tv-site-header').forEach(wire)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){all()});else setTimeout(all,0);return {wire:wire,all:all,count:count,basket:basket}})();

/* Tarver.join: wires every .tv-join, the collector list. On Join it checks the email: a missing @ or an unfinished domain shows the fix in plain words; a common domain typo (gmial.com) offers a one-tap Fix it instead, and pressing Join again sends it as typed. While it sends, the button says Joining; then the box shows Joined (the check pops in) or Already joined, holding its height so the page does not jump, and focus moves to the message. Set Tarver.join.send = function (email) { return a Promise of 'joined' or 'already' } to connect an email service; without one, previews resolve 'joined' after a short wait. */
window.Tarver.join=(function(){if(typeof document==='undefined')return null;var TYPO={'gmial.com':'gmail.com','gmai.com':'gmail.com','gamil.com':'gmail.com','gnail.com':'gmail.com','gmaill.com':'gmail.com','gmail.co':'gmail.com','gmail.con':'gmail.com','yaho.com':'yahoo.com','yahooo.com':'yahoo.com','yahoo.co':'yahoo.com','yahoo.con':'yahoo.com','hotmial.com':'hotmail.com','hotmal.com':'hotmail.com','hotmail.co':'hotmail.com','hotmail.con':'hotmail.com','outlok.com':'outlook.com','outlook.co':'outlook.com','outlook.con':'outlook.com','iclod.com':'icloud.com','icoud.com':'icloud.com','icloud.co':'icloud.com','icloud.con':'icloud.com','aol.co':'aol.com','aol.con':'aol.com'};var api={send:null};
function check(v){v=(v||'').trim();if(!v)return {error:'Enter your email, like you@email.com'};if(/\s/.test(v))return {error:'Take out the space'};var p=v.split('@');if(p.length!==2||!p[0])return {error:'Add an @, like you@email.com'};var d=p[1].toLowerCase();if(!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d))return {error:'Finish the part after the @, like gmail.com'};if(TYPO[d])return {ok:v,typo:p[0]+'@'+TYPO[d],domain:TYPO[d]};return {ok:v}}
function state(el,s){if(s==='joined'||s==='already')el.style.minHeight=el.offsetHeight+'px';else el.style.minHeight='';el.setAttribute('data-state',s)}
function wire(el){if(!el||el.__tvjoin)return;el.__tvjoin=1;var jb=el.querySelector('.tv-join__btn');if(jb&&!jb.querySelector('.tv-join__icon')){var ji=document.createElement('span');ji.className='tv-join__icon';ji.innerHTML='<svg class="tv-icon tv-ico" viewBox="0 0 24 24" aria-hidden="true"><rect class="ip" x="2" y="5.5" width="18.5" height="14" rx="4"/><path class="ln" d="M5.6 9.6 11.25 13.4 16.9 9.6" style="fill:none;stroke:var(--tv-icon-cut,var(--surface-100));stroke-width:2.5"/><circle class="is" cx="19" cy="6" r="4.6" style="stroke:var(--tv-icon-cut,var(--surface-100));stroke-width:2"/></svg>';jb.insertBefore(ji,jb.querySelector('.tv-join__btnlabel')||jb.firstChild)}var f=el.querySelector('.tv-join__form'),i=el.querySelector('.tv-join__input'),btn=el.querySelector('.tv-join__btn'),lbl=el.querySelector('.tv-join__btnlabel'),fix=el.querySelector('.tv-join__fix'),dom=el.querySelector('.tv-join__domain'),msg=el.querySelector('.tv-join__msg'),asIs=false,fixed=null;if(!f||!i)return;if(!el.getAttribute('data-state'))el.setAttribute('data-state','ready');
 function busy(on){i.readOnly=on;if(btn){if(on)btn.setAttribute('aria-disabled','true');else btn.removeAttribute('aria-disabled')}if(lbl)lbl.textContent=on?'Joining':'Join'}
 function send(v){state(el,'joining');busy(true);var p=api.send?Promise.resolve().then(function(){return api.send(v)}):new Promise(function(r){setTimeout(function(){r('joined')},900)});p.then(function(r){busy(false);var s=r==='already'?'already':'joined';state(el,s);var d=el.querySelector('.tv-join__done--'+s);if(d){d.setAttribute('tabindex','-1');d.focus()}},function(){busy(false);if(msg)msg.textContent='That didn’t go through. Try again in a moment.';state(el,'error')})}
 f.addEventListener('submit',function(e){e.preventDefault();if(el.getAttribute('data-state')==='joining')return;var c=check(i.value);if(c.error){if(msg)msg.textContent=c.error;i.setAttribute('aria-invalid','true');state(el,'error');i.focus();return}i.removeAttribute('aria-invalid');if(c.typo&&!asIs){fixed=c.typo;if(dom)dom.textContent=c.domain;state(el,'typo');asIs=true;return}asIs=false;send(c.ok)});
 if(fix)fix.addEventListener('click',function(){if(fixed)i.value=fixed;fixed=null;asIs=false;state(el,'ready');i.focus()});
 i.addEventListener('input',function(){asIs=false;fixed=null;if(el.getAttribute('data-state')!=='ready'){i.removeAttribute('aria-invalid');state(el,'ready')}})}
function all(root){(root||document).querySelectorAll('.tv-join').forEach(wire)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){all()});else setTimeout(all,0);
api.wire=wire;api.all=all;api.check=check;api.state=state;return api})();

/* Tarver.printListing: wires every .tv-print (call wire(el) for one added later). A close up pill (.tv-chip[data-tv-close] with data-src, data-alt and an optional data-hint) swaps the stage to that close up, presses the pill and shows the hint; tapping the same pill or the photo goes back to the main photo. Buy (.tv-print__buy) turns into the flipping hourglass and "Opening checkout" at once and stays so while checkout opens; loading(btn, false) restores it if checkout fails, and returning with the back button restores it too. */
window.Tarver.printListing=(function(){if(typeof document==='undefined')return null;var HG='<span class="tv-print-hg" role="status" aria-label="Loading"><svg viewBox="0 0 40 48" aria-hidden="true"><path fill="var(--on-brand)" d="M11.2,4 L28.8,4 A3.1 3.1 0 0 1 30.4,9.8 C27.8,11.3 26,18.5 26,22.8 L26,25.2 C26,29.5 28.5,36.1 32.2,38.2 A3.1 3.1 0 0 1 30.7,44 L9.3,44 A3.1 3.1 0 0 1 7.8,38.2 C11.5,36.1 14,29.5 14,25.2 L14,22.8 C14,18.5 12.2,11.3 9.6,9.8 A3.1 3.1 0 0 1 11.2,4 Z"/><path fill="var(--sun)" d="M19.1,30.9 A0.9 0.9 0 0 1 20.9,30.9 C20.9,33.4 22.8,36.8 25.5,38.3 A0.9 0.9 0 0 1 25.1,40 L14.9,40 A0.9 0.9 0 0 1 14.5,38.3 C17.2,36.8 19.1,33.4 19.1,30.9 Z"/><circle cx="20" cy="22" r="1.6" fill="var(--sun)"/><rect x="7" y="1" width="26" height="4.6" rx="2.3" fill="var(--ink-block)"/><rect x="7" y="42.4" width="26" height="4.6" rx="2.3" fill="var(--ink-block)"/></svg></span>';
function loading(b,on){if(!b)return;var l=b.querySelector('.tv-print__buylabel');if(!l)return;if(on){if(b.__tvlabel!=null)return;b.__tvlabel=l.innerHTML;l.innerHTML=HG+'Opening checkout';b.setAttribute('aria-busy','true')}else{if(b.__tvlabel==null)return;l.innerHTML=b.__tvlabel;b.__tvlabel=null;b.removeAttribute('aria-busy')}}
function wire(el){if(!el||el.__tvprint)return;el.__tvprint=1;var st=el.querySelector('.tv-print__stage'),pills=el.querySelectorAll('.tv-chip[data-tv-close]');if(st){var cl=st.querySelector('.tv-print__close'),hint=st.querySelector('.tv-print__hint');var reset=function(){pills.forEach(function(p){p.setAttribute('aria-pressed','false')});st.classList.remove('is-close');if(cl)cl.alt='';if(hint)hint.textContent=''};pills.forEach(function(p){p.addEventListener('click',function(){var on=p.getAttribute('aria-pressed')==='true';reset();if(on)return;if(cl){cl.src=p.getAttribute('data-src');cl.alt=p.getAttribute('data-alt')||''}if(hint)hint.textContent=p.getAttribute('data-hint')||'';p.setAttribute('aria-pressed','true');st.classList.add('is-close')})});st.addEventListener('click',function(){if(st.classList.contains('is-close'))reset()})}el.querySelectorAll('.tv-print__buy').forEach(function(b){b.addEventListener('click',function(){loading(b,true)})})}
function all(root){(root||document).querySelectorAll('.tv-print').forEach(wire)}
window.addEventListener('pageshow',function(){document.querySelectorAll('.tv-print__buy[aria-busy="true"]').forEach(function(b){loading(b,false)})});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){all()});else setTimeout(all,0);
return {wire:wire,all:all,loading:loading,hourglass:HG}})();

/* Tarver.thanks: draws the thank you scene into every .tv-thanks__scene. A sunrise over the ocean from 5 am to 4:59 pm by the visitor's clock, a sunset behind the dunes otherwise; data-tv-sky="rise" or "set" forces one. The sun settles once and its rays (sunrise) or stars (sunset) appear once; nothing loops. Reduced motion shows the final scene. play(el) runs it again. */
window.Tarver.thanks=(function(){if(typeof document==='undefined')return null;var n=0;
var RISE='<svg viewBox="0 0 840 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="The sun rising over the ocean"><rect width="840" height="320" fill="var(--brand-tint)"/><rect y="0" width="840" height="70" fill="#fbe7d9"/><rect x="90" y="54" width="170" height="22" rx="11" fill="var(--surface-card)"/><rect x="600" y="86" width="140" height="20" rx="10" fill="var(--surface-card)"/><clipPath id="tvSkyRise{n}"><rect width="840" height="200"/></clipPath><g clip-path="url(#tvSkyRise{n})"><g class="tv-thanks__sun" data-from="translate(0,150)" data-to="translate(0,0)" style="transform:translate(0px,150px)"><g class="tv-thanks__rays" fill="var(--sun)"><rect x="414" y="50" width="12" height="34" rx="6" transform="rotate(0 420 170)"/><rect x="414" y="62" width="12" height="22" rx="6" transform="rotate(30 420 170)"/><rect x="414" y="50" width="12" height="34" rx="6" transform="rotate(60 420 170)"/><rect x="414" y="62" width="12" height="22" rx="6" transform="rotate(90 420 170)"/><rect x="414" y="50" width="12" height="34" rx="6" transform="rotate(120 420 170)"/><rect x="414" y="62" width="12" height="22" rx="6" transform="rotate(150 420 170)"/><rect x="414" y="50" width="12" height="34" rx="6" transform="rotate(180 420 170)"/><rect x="414" y="62" width="12" height="22" rx="6" transform="rotate(210 420 170)"/><rect x="414" y="50" width="12" height="34" rx="6" transform="rotate(240 420 170)"/><rect x="414" y="62" width="12" height="22" rx="6" transform="rotate(270 420 170)"/><rect x="414" y="50" width="12" height="34" rx="6" transform="rotate(300 420 170)"/><rect x="414" y="62" width="12" height="22" rx="6" transform="rotate(330 420 170)"/></g><circle cx="420" cy="170" r="74" fill="var(--sun)"/></g></g><rect y="200" width="840" height="120" fill="var(--teal)"/><g class="tv-thanks__glint" style="opacity:0"><rect x="370" y="214" width="100" height="9" rx="4.5" fill="var(--sun)"/><rect x="388" y="232" width="64" height="8" rx="4" fill="var(--sun)"/><rect x="402" y="249" width="36" height="7" rx="3.5" fill="var(--sun)"/></g><rect x="60" y="222" width="150" height="8" rx="4" fill="#3f8d93"/><rect x="620" y="240" width="120" height="8" rx="4" fill="#3f8d93"/><rect x="170" y="252" width="90" height="7" rx="3.5" fill="#3f8d93"/><path d="M-60 330 C 160 262 640 262 900 330 Z" fill="var(--surface-200)"/><path d="M-60 336 C 160 286 640 286 900 336 Z" fill="#e9dcc2"/></svg>';
var SET='<svg viewBox="0 0 840 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="The sun setting behind the dunes"><rect width="840" height="320" fill="var(--plum)"/><rect y="120" width="840" height="200" fill="var(--brand)"/><rect y="196" width="840" height="124" fill="#e8742f"/><rect x="70" y="60" width="150" height="22" rx="11" fill="#9a4f86"/><rect x="560" y="92" width="210" height="22" rx="11" fill="#d9612a"/><rect x="250" y="160" width="120" height="18" rx="9" fill="#ef9a4a"/><g class="tv-thanks__sun" data-from="translate(0,-150)" data-to="translate(0,0)" style="transform:translate(0px,-150px)"><circle cx="430" cy="250" r="78" fill="var(--sun)"/></g><path d="M-40 320 C 60 214 230 214 330 320 Z" fill="var(--ink-block)"/><path d="M250 320 C 380 236 560 236 690 320 Z" fill="#3a2a22"/><path d="M600 320 C 700 222 820 222 900 320 Z" fill="var(--ink-block)"/><g fill="var(--ink-block)"><rect x="180" y="214" width="6" height="40" rx="3" transform="rotate(-8 183 254)"/><rect x="196" y="206" width="6" height="48" rx="3"/><rect x="212" y="214" width="6" height="40" rx="3" transform="rotate(9 215 254)"/><rect x="740" y="210" width="6" height="44" rx="3" transform="rotate(-6 743 254)"/><rect x="756" y="218" width="6" height="36" rx="3" transform="rotate(8 759 254)"/></g><g class="tv-thanks__glint" style="opacity:0"><circle cx="36" cy="22" r="2.2" fill="var(--sun)"/><circle cx="92" cy="40" r="1.6" fill="var(--sun)"/><circle cx="150" cy="18" r="2.6" fill="var(--sun)"/><circle cx="212" cy="44" r="1.8" fill="var(--sun)"/><circle cx="268" cy="26" r="2.2" fill="var(--sun)"/><circle cx="300" cy="96" r="3.0" fill="var(--sun)"/><circle cx="338" cy="12" r="1.6" fill="var(--sun)"/><circle cx="384" cy="52" r="2.4" fill="var(--sun)"/><circle cx="452" cy="30" r="1.8" fill="var(--sun)"/><circle cx="500" cy="14" r="2.8" fill="var(--sun)"/><circle cx="548" cy="46" r="1.6" fill="var(--sun)"/><circle cx="604" cy="22" r="2.2" fill="var(--sun)"/><circle cx="660" cy="56" r="2.6" fill="var(--sun)"/><circle cx="706" cy="16" r="1.8" fill="var(--sun)"/><circle cx="758" cy="38" r="2.4" fill="var(--sun)"/><circle cx="808" cy="20" r="2.0" fill="var(--sun)"/><circle cx="120" cy="130" r="2.0" fill="var(--sun)"/><circle cx="232" cy="104" r="1.6" fill="var(--sun)"/><circle cx="410" cy="108" r="2.0" fill="var(--sun)"/><circle cx="520" cy="96" r="1.8" fill="var(--sun)"/><circle cx="700" cy="128" r="1.6" fill="var(--sun)"/><circle cx="796" cy="106" r="2.2" fill="var(--sun)"/><circle cx="60" cy="96" r="1.8" fill="var(--sun)"/></g></svg>';
function sky(d){var h=(d||new Date()).getHours();return (h>=5&&h<17)?'rise':'set'}
function reduce(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function play(el){var r=reduce();
el.querySelectorAll('.tv-thanks__sun').forEach(function(s){var f=(s.getAttribute('data-from')||'translate(0,0)').replace(/translate\(([-\d.]+),([-\d.]+)\)/,'translate($1px,$2px)');s.style.transition='none';s.style.transform=r?'translate(0px,0px)':f;if(r)return;void s.getBoundingClientRect();requestAnimationFrame(function(){requestAnimationFrame(function(){s.style.transition='';s.style.transform='translate(0px,0px)'})})});
el.querySelectorAll('.tv-thanks__rays').forEach(function(x){if(r){x.classList.remove('is-hidden');return}x.classList.add('is-hidden');void x.getBoundingClientRect();requestAnimationFrame(function(){requestAnimationFrame(function(){x.classList.remove('is-hidden')})})});
el.querySelectorAll('.tv-thanks__glint').forEach(function(g){g.style.transition='none';g.style.opacity=r?1:0;if(r)return;void g.getBoundingClientRect();requestAnimationFrame(function(){requestAnimationFrame(function(){g.style.transition='';g.style.opacity=1})})})}
function draw(el,k){n++;el.innerHTML=(k==='set'?SET:RISE).replace(/\{n\}/g,String(n));el.setAttribute('data-sky',k);play(el)}
function wire(el){if(!el||el.__tvthanks)return;el.__tvthanks=1;var k=el.getAttribute('data-tv-sky');draw(el,(k==='rise'||k==='set')?k:sky())}
function all(root){(root||document).querySelectorAll('.tv-thanks__scene').forEach(wire)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){all()});else setTimeout(all,0);
return {wire:wire,all:all,draw:draw,play:play,sky:sky}})();

/* Tarver.vote: wires every .tv-vote. Each option is a button.tv-vote__opt; one tap votes and swaps the list for results, most votes first, the voter's pick in persimmon. One vote per browser (remembered under data-tv-vote). Connect real counts with Tarver.vote.load = function (id) {...} and Tarver.vote.send = function (id, index) {...}, each returning a Promise of the counts array in option order. Without them it counts on this page only, for previews. */
window.Tarver.vote=(function(){if(typeof document==='undefined')return null;var api={load:null,send:null};
function mem(id,i){try{var k='tv-vote:'+id;if(i===undefined){var v=localStorage.getItem(k);return v===null?null:+v}localStorage.setItem(k,String(i))}catch(e){}return null}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function show(el,counts,pick){var O=el.__tvopts,list=el.querySelector('.tv-vote__list'),meta=el.querySelector('.tv-vote__meta');if(!list)return;
var sum=0,max=1;counts.forEach(function(c){sum+=c;if(c>max)max=c});var tot=sum||1;
var order=O.map(function(o,i){return i}).sort(function(a,b){return counts[b]-counts[a]});
list.innerHTML=order.map(function(i){var o=O[i],me=i===pick;return '<li class="tv-vote__res'+(me?' is-mine':'')+'"><span class="tv-vote__name">'+esc(o.name)+(me?' <em class="tv-vote__you">Your vote</em>':'')+(o.place?'<small>'+esc(o.place)+'</small>':'')+'</span><span class="tv-vote__pct">'+Math.round(100*counts[i]/tot)+'%</span><span class="tv-vote__track"><span class="tv-vote__bar is-start" style="--w:'+(100*counts[i]/max).toFixed(1)+'%"></span></span></li>'}).join('');
list.classList.add('is-results');if(meta)meta.textContent=sum+' vote'+(sum===1?'':'s')+' so far';
void list.offsetWidth;requestAnimationFrame(function(){list.querySelectorAll('.tv-vote__bar').forEach(function(b){b.classList.remove('is-start')})})}
function wire(el){if(!el||el.__tvvote)return;el.__tvvote=1;var id=el.getAttribute('data-tv-vote')||'vote',btns=[].slice.call(el.querySelectorAll('.tv-vote__opt'));
el.__tvopts=btns.map(function(b){var nm=b.querySelector('.tv-vote__name'),sm=nm&&nm.querySelector('small');return {name:nm?(nm.firstChild?nm.firstChild.textContent:nm.textContent).trim():b.textContent.trim(),place:sm?sm.textContent.trim():''}});
var seed=null;try{seed=JSON.parse(el.getAttribute('data-tv-counts')||'null')}catch(e){}
var base=(seed&&seed.length===btns.length)?seed.slice():btns.map(function(){return 0});
function after(i,local){if(api.send){api.send(id,i).then(function(c){show(el,c,i)},function(){show(el,local,i)})}else show(el,local,i)}
var mine=mem(id);
if(mine!==null&&mine>=0&&mine<btns.length){if(api.load){api.load(id).then(function(c){show(el,c,mine)},function(){show(el,base,mine)})}else show(el,base,mine);return}
if(api.load)api.load(id).then(function(c){if(c&&c.length===btns.length)base=c.slice()},function(){});
btns.forEach(function(b,i){b.addEventListener('click',function(){if(el.__tvvoted)return;el.__tvvoted=1;mem(id,i);var local=base.slice();local[i]++;after(i,local)})})}
function all(root){(root||document).querySelectorAll('.tv-vote').forEach(wire)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){all()});else setTimeout(all,0);
api.wire=wire;api.all=all;return api})();
