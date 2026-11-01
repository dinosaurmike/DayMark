// Records the DayMark README header on a phone-sized page, on a virtual clock (vclock.js): 12 fps, every
// frame exactly 1/12 s. Seeds 59 days of sample check-ins first so the timeline and insights have data.
// Serve the repo root (python3 -m http.server 8741 from the folder that holds DayMark/), then:
//   node record.js http://localhost:8741/DayMark/index.html     → frames/f###.png (390x844 @2x)
//   python3 make-gif.py banner.png frames composite             (banner.png = banner.html screenshot, 960x560)
//   ffmpeg -framerate 12 -i composite/c%03d.png -vf "split[a][b];[a]palettegen=max_colors=160:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -loop 0 ../daymark-header.gif
const {chromium}=require('playwright');const VC=require('./vclock.js');const fs=require('fs');
const DT=1000/12;
const seed=()=>{const out=[];const now=new Date();let s=7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647};
  for(let d=59;d>=1;d--){const t=new Date(now);t.setDate(now.getDate()-d);t.setHours(21,0,0,0);const k=59-d;
    const w=(a,b,c)=>Math.max(8,Math.min(96,Math.round(a+b*Math.sin(k/c)+ (r()-.5)*10)));
    const L=w(58,12,7);
    out.push({id:t.toISOString(),timestamp:t.toISOString(),
      values:{growth:w(74,7,9),livelihood:L,connection:w(64-(k>44?(k-44)*1.4:0),10,6),health:w(48+(k>51?(k-51)*3:0),12,5),purpose:Math.min(96,L+6+Math.round((r()-.5)*8))},
      notes:{growth:'',livelihood:'',connection:'',health:'',purpose:''}});}
  return out;};
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(VC);await p.addInitScript(d=>{if(!localStorage.getItem('daymark_data'))localStorage.setItem('daymark_data',d)},JSON.stringify(seed()));
 await p.route(/googletagmanager|fonts\.g/,r=>r.fulfill({body:''}));
 fs.rmSync('frames',{recursive:true,force:true});fs.mkdirSync('frames');
 let f=0;const shot=async()=>{await p.screenshot({path:`frames/f${String(f++).padStart(3,'0')}.png`});};
 const tick=async()=>{await p.evaluate(dt=>__advance(dt),DT);await p.waitForTimeout(20);};
 const run=async(n,on)=>{for(let i=0;i<n;i++){if(on)await on(i);await tick();await shot();}};
 const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 await p.goto(process.argv[2]||'http://localhost:8741/DayMark/index.html',{waitUntil:'networkidle'});
 for(let i=0;i<12;i++)await tick();
 await run(14);                                                             // landing
 await p.click('text=Enter DayMark');for(let i=0;i<4;i++)await tick();
 await run(18);                                                             // splash → dashboard
 // On the virtual clock the splash's fade-out finishes visually but its (invisible) layer isn't removed, so it
 // would swallow the drags. Remove it (only a recording artefact: with a real clock the splash unmounts).
 console.log('splash',await p.evaluate(()=>{const img=document.querySelector('img.drop-shadow-2xl');if(!img)return 'gone';
   let e=img;while(e.parentElement&&getComputedStyle(e).position!=='fixed')e=e.parentElement;e.style.pointerEvents='none';e.style.visibility='hidden';return 'hidden';}));
 const ORDER=['GROWTH','LIVELIHOOD','CONNECTION','HEALTH','PURPOSE'];
 const vial=async name=>p.evaluate(i=>{const v=document.querySelectorAll('.cursor-ew-resize')[i];const bb=v.getBoundingClientRect();
   return {x:bb.x,y:bb.y,w:bb.width,h:bb.height,val:v.textContent.replace(/\D+/g,' ').trim()};},ORDER.indexOf(name));
 const cur={GROWTH:50,LIVELIHOOD:50,CONNECTION:50,HEALTH:50,PURPOSE:50}; // today's vials start at 50
 const cdp=await ctx.newCDPSession(p);
 const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
 const drag=async(name,to,n=12)=>{const v=await vial(name);const from=cur[name];cur[name]=to;const y=v.y+v.h/2;
   const X=pc=>v.x+4+(v.w-8)*pc/100;await touch('touchStart',X(from),y);
   await run(n,async i=>{await touch('touchMove',X(from+(to-from)*ease((i+1)/n)),y);});await touch('touchEnd');await run(5);};
 await drag('GROWTH',88);
 await drag('CONNECTION',42);
 await drag('HEALTH',76);
 const Y=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
 await run(10,async i=>{await p.evaluate(y=>scrollTo(0,y),Math.round(Y*ease((i+1)/10)));});
 await drag('PURPOSE',80,10);
 const log=await p.evaluate(()=>{const e=[...document.querySelectorAll('button')].find(b=>/LOG/i.test(b.innerText));const bb=e.getBoundingClientRect();return {x:bb.x+bb.width/2,y:bb.y+bb.height/2}});
 await p.touchscreen.tap(log.x,log.y);await run(22);                            // log today
 await p.evaluate(()=>scrollTo(0,0));
 await p.addStyleTag({content:'.recharts-tooltip-wrapper,.recharts-tooltip-cursor{visibility:hidden!important}'}); // hover tooltip would sit where the tap landed
 await p.tap('text=INSIGHTS');await run(30);                              // timeline draws
 const Z=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
 await run(12,async i=>{await p.evaluate(y=>scrollTo(0,y),Math.round(Z*ease((i+1)/12)));});
 await run(30);                                                             // observations
 console.log('frames',f,'errors',JSON.stringify(errs.slice(0,4)),'data',await p.evaluate(()=>JSON.parse(localStorage.getItem('daymark_data')).length));
 await b.close();})();
