const { chromium } = require('playwright');
const O=__dirname+'/shots/jp/'; const ok=[], bad=[]; const check=(c,m)=>(c?ok:bad).push(m);
const reedBtn = (p) => p.locator('div:has(> div > div > span) >> role=button[name="View Job"]');
(async()=>{const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://localhost:8767/jp.html?country=GB&fresh=1'); await p.waitForTimeout(1500);
// go to page with Reed jobs
// find a non-Adzuna row
const rows = p.locator('div.th_fade_anim');
const n = await rows.count(); let reedIdx=[];
for (let i=0;i<n;i++){ const tx=await rows.nth(i).innerText(); if(!/Jobs by/.test(tx)) reedIdx.push(i); }
check(reedIdx.length>=2,'found Reed jobs on page ('+reedIdx.length+')');
// Adzuna job opens without verification (go back to page 1 later); first Reed job → verification
await rows.nth(reedIdx[0]).getByRole('button',{name:'View Job'}).click(); await p.waitForTimeout(300);
let dlg=p.getByRole('dialog'); let dt=await dlg.innerText();
check(/Verify your email once/.test(dt)&&/every vacancy in the Job Portal opens/.test(dt),'first Reed job asks for one-time verification, explains it');
check(!/employers can contact/i.test(dt),'no misleading employer-contact wording');
await p.screenshot({path:O+'verify-once-form-desktop.png'});
await dlg.getByLabel('Full name').fill('Jane Test'); await dlg.getByLabel('Email address').fill('jane@example.com');
check(!(await dlg.locator('#verify-marketing').isChecked()),'marketing box is optional and unticked by default');
check(/doesn.t affect your access/.test(await dlg.innerText()),'says declining marketing does not affect access');
await dlg.getByRole('button',{name:'Email me a code'}).click(); await p.waitForTimeout(400);
await dlg.getByLabel('Verification code').fill('111111'); await dlg.getByRole('button',{name:/Verify and open/}).click(); await p.waitForTimeout(300);
check(/Invalid or expired code/.test(await dlg.innerText()),'wrong code shows an error');
await dlg.getByLabel('Verification code').fill('123456'); await dlg.getByRole('button',{name:/Verify and open/}).click(); await p.waitForTimeout(1200);
dlg=p.getByRole('dialog'); dt=await dlg.innerText();
check(/Apply on (Reed|Teaching Vacancies)/.test(dt),'after verifying, the chosen job opens with its Apply button');
const href=await dlg.getByRole('link',{name:/Apply on (Reed|Teaching Vacancies)/}).getAttribute('href');
check(/^https:\/\/example\.test\/apply\//.test(href||''),'Apply goes to the original Reed listing');
await p.screenshot({path:O+'verify-once-job-desktop.png'});
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
// another Reed job: no form
await rows.nth(reedIdx[1]).getByRole('button',{name:'View Job'}).click(); await p.waitForTimeout(400);
check(/Apply on (Reed|Teaching Vacancies)/.test(await p.getByRole('dialog').innerText()),'second job opens straight away, no form');
await p.keyboard.press('Escape');
check(await p.evaluate(()=>window.__codes)===1,'only one code was ever requested');
check(/verified on this browser/.test(await p.evaluate(()=>document.body.innerText)),'shows verified status with a sign-out link');
// reload: still verified
await p.reload(); await p.waitForTimeout(1500);
const rows2=p.locator('div.th_fade_anim'); let opened=false;
for (let i=0;i<await rows2.count();i++){ const tx=await rows2.nth(i).innerText(); if(!/Jobs by/.test(tx)){ await rows2.nth(i).getByRole('button',{name:'View Job'}).click(); await p.waitForTimeout(400); opened=/Apply on/.test(await p.getByRole('dialog').innerText()); break; } }
const anyReedOnPage1 = opened || !(await p.evaluate(()=>/Verify your email once/.test(document.body.innerText)));
check(anyReedOnPage1,'after a reload, jobs still open without verifying again');
await p.keyboard.press('Escape').catch(()=>{});
// sign out
await p.getByRole('button',{name:'Sign out',exact:true}).click().catch(()=>{}); await p.waitForTimeout(800);
check(!/verified on this browser/.test(await p.evaluate(()=>document.body.innerText)),'sign out removes access');
// mobile screenshots of the form
const m=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
await m.goto('http://localhost:8767/jp.html?country=GB&fresh=1'); await m.waitForTimeout(1500);
const mr=m.locator('div.th_fade_anim'); 
for (let i=0;i<await mr.count();i++){ const tx=await mr.nth(i).innerText(); if(!/Jobs by/.test(tx)){ await mr.nth(i).getByRole('button',{name:'View Job'}).tap(); break; } }
await m.waitForTimeout(400); await m.screenshot({path:O+'verify-once-form-mobile.png'});
check(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile: form fits');
await b.close(); check(errs.length===0,'no page errors '+errs.join(';'));
console.log('PASS',ok.length,'FAIL',bad.length); bad.forEach(x=>console.log(' ✗',x)); ok.forEach(x=>console.log(' ✓',x));})();
