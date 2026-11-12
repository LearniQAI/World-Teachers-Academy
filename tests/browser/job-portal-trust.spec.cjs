// Browser tests for listing transparency, the report form and Adzuna attribution.
const { chromium } = require('playwright');
const O=__dirname+'/shots/jp/'; const ok=[]; const bad=[]; const check=(c,m)=>(c?ok:bad).push(m);
(async()=>{const b=await chromium.launch();
let p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2}); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://localhost:8767/jp.html'); await p.waitForTimeout(1500);
// Adzuna attribution on every Adzuna listing, ≥116×23, linking to an Adzuna site
const adz=await p.evaluate(()=>[...document.querySelectorAll('.jt-adzuna')].map(a=>{const r=a.getBoundingClientRect();return {w:r.width,h:r.height,href:a.href,text:a.innerText}}));
check(adz.length>0,'Adzuna attribution present ('+adz.length+')');
check(adz.every(a=>a.w>=116&&a.h>=23),'attribution at least 116×23 px');
check(adz.every(a=>/^https:\/\/www\.adzuna\./.test(a.href)&&/Adzuna/.test(a.text)),'attribution links to an Adzuna site');
const rows=await p.evaluate(()=>document.querySelectorAll('.jt-line').length);
check(rows===10,'every listing has a source line ('+rows+')');
await p.screenshot({path:O+'trust-list-desktop.png',clip:{x:0,y:300,width:1440,height:900}});

// GB: Teaching Vacancies + Reed rows with closing dates
await p.goto('http://localhost:8767/jp.html?country=GB'); await p.waitForTimeout(1300);
let txt=await p.evaluate(()=>document.body.innerText);
check(/via Teaching Vacancies \(Department for Education\)/.test(txt),'TV source named');
check(/Closes \d{1,2} \w{3} \d{4}/.test(txt),'closing date shown in list');
// open a Reed job: "Last checked" but NOT "Confirmed open"
const reedBtn=p.locator('div:has(> div > .jt-line:has-text("via Reed")) >> role=button[name="View Job"]').first();
await reedBtn.click(); await p.waitForTimeout(400);
txt=await p.evaluate(()=>document.querySelector('[role=dialog]')?.innerText ?? document.body.innerText);
check(/Last checked/.test(txt)&&/Listed by Reed when last checked/.test(txt),'Reed: listed when last checked');
check(!/Confirmed open/.test(txt),'Reed: not shown as confirmed open');
check(/doesn't confirm the employer is still accepting applications/.test(txt),'explains listed ≠ open');
check(/Closing date/.test(txt)&&/Employer/.test(txt)&&/Location/.test(txt)&&/Posted/.test(txt)&&/Source/.test(txt),'all detail fields present');
await p.screenshot({path:O+'trust-dialog-reed-desktop.png'});
// report flow
await p.getByRole('button',{name:'Report an unavailable job'}).click(); await p.waitForTimeout(200);
await p.getByRole('button',{name:'Send report'}).click(); await p.waitForTimeout(200);
check(/Choose a reason/.test(await p.evaluate(()=>document.body.innerText)),'report requires a reason');
await p.getByLabel('The job link doesn\'t work').check();
await p.getByLabel(/Anything else/).fill('dead link, mail me at a@b.com');
await p.screenshot({path:O+'trust-report-desktop.png'});
await p.getByRole('button',{name:'Send report'}).click(); await p.waitForTimeout(400);
check(/Report sent/.test(await p.evaluate(()=>document.body.innerText)),'report confirmation');
const sent=await p.evaluate(()=>window.__reports);
check(sent?.length===1&&sent[0].reason==='link_broken'&&!('email' in sent[0])&&!('name' in sent[0]),'report payload has no personal fields');
await p.keyboard.press('Escape'); await p.goto('http://localhost:8767/jp.html?country=US'); await p.waitForTimeout(1300);

// USAJOBS: eligibility badge and "Who can apply"
txt=await p.evaluate(()=>document.body.innerText);
check(/Eligibility (restrictions|conditions apply)/.test(txt),'restricted badge in list');
await p.locator('div:has(> div > .jt-line:has-text("Eligibility")) >> role=button[name="View Job"]').first().click(); await p.waitForTimeout(400);
txt=await p.evaluate(()=>document.body.innerText);
check(/Who can apply/.test(txt)&&/Current federal employees, veterans and military spouses/.test(txt),'eligibility shown verbatim');
check(/Most federal jobs require US citizenship/.test(txt),'USAJOBS citizenship notice shown');
await p.screenshot({path:O+'trust-dialog-usajobs-desktop.png'});
await p.close();

// mobile
p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
await p.goto('http://localhost:8767/jp.html?country=GB'); await p.waitForTimeout(1300);
check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile: no sideways scroll on list');
await p.screenshot({path:O+'trust-list-mobile.png'});
await p.locator('role=button[name="View Job"]').first().tap(); await p.waitForTimeout(400);
check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile: dialog fits');
await p.screenshot({path:O+'trust-dialog-mobile.png'});
await b.close();
check(errs.length===0,'no page errors '+errs.join(';'));
console.log('PASS',ok.length,'FAIL',bad.length); bad.forEach(x=>console.log(' ✗',x)); })();
