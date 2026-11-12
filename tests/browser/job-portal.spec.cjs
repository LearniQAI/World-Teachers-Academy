const { chromium } = require('playwright');
const O=__dirname+'/shots/jp/'; const ok=[]; const bad=[];
const check=(c,m)=>(c?ok:bad).push(m);
(async()=>{const b=await chromium.launch();
let p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2}); const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8767/jp.html?country=JP'); await p.waitForTimeout(1500);
let txt=await p.evaluate(()=>document.body.innerText);
check(/No teaching openings in Japan right now/.test(txt),'empty state names Japan');
check(!/pending verification/.test(txt),'no placeholder text');
check(/Teaching in Japan:/.test(txt) && !/JP —/.test(txt),'note uses full name');
check(/Back to the Japan guide/.test(txt),'back-to-guide link');
check(await p.evaluate(()=>document.querySelector('.cs-button').innerText.includes('Japan')),'selector shows Japan, not All countries');
check(await p.evaluate(()=>!!document.querySelector('.jp-empty .country-flag img[src="/flags/jp.svg"]')),'empty state shows flag');
check(new URL(p.url()).searchParams.get('country')==='JP','URL keeps country=JP');
check(await p.evaluate(()=>document.querySelector('.jp-empty a.th-btn').getAttribute('href'))==='/countries/japan','guide link target');
await p.screenshot({path:O+'empty-desktop.png',clip:{x:0,y:0,width:1440,height:900}});
// open selector to show groups
await p.click('.cs-button'); await p.waitForTimeout(300);
check(await p.evaluate(()=>document.activeElement?.getAttribute('aria-label')==='Search countries'),'search box focused on open');
txt=await p.evaluate(()=>document.querySelector('.cs-panel').innerText);
check(/Countries with openings/.test(txt)&&/No openings right now/.test(txt),'two groups');
await p.screenshot({path:O+'selector-open-desktop.png',clip:{x:0,y:0,width:1440,height:900}});
// keyboard: type, choose
await p.keyboard.type('united'); await p.waitForTimeout(150);
const opts=await p.evaluate(()=>[...document.querySelectorAll('.cs-option')].map(o=>o.innerText.replace(/\s+/g,' ').trim()));
check(opts.length===3 && opts[0].startsWith('United Kingdom') && /No openings/.test(opts[2]),'search filters: '+opts.join(' | '));
await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
check(new URL(p.url()).searchParams.get('country')==='US','keyboard choose → URL country=US');
check(await p.evaluate(()=>document.activeElement?.classList.contains('cs-button')),'focus returns to button');
txt=await p.evaluate(()=>document.body.innerText);
check(/USD 89.2K a year/.test(txt),'US salary shown with currency + year');
// Esc closes
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(150); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
check(await p.evaluate(()=>!document.querySelector('.cs-panel')),'Esc closes');
// explore all from empty state
await p.goto('http://localhost:8767/jp.html?country=JP'); await p.waitForTimeout(1300);
await p.getByRole('button',{name:'Explore teaching jobs in other countries'}).click(); await p.waitForTimeout(800);
check(!new URL(p.url()).searchParams.get('country'),'explore all clears country from URL');
txt=await p.evaluate(()=>document.body.innerText);
check(/Salary not specified/.test(txt) && !/AUD 5,500–9,500/.test(txt) && /Up to GBP 51K a year/.test(txt),'Adzuna salary figures hidden; Reed salary still shown');
check(!/Software Engineer|Babysitter|Accompagnant|Einrichter|Trainee HR/.test(txt),'irrelevant titles filtered');
check(/21 teaching positions across 10 countries/.test(txt),'stats line: '+(txt.match(/\d+ teaching positions[^\n]*/)||[''])[0]);
await p.screenshot({path:O+'list-desktop.png',clip:{x:0,y:0,width:1440,height:1100}});
// country with jobs: note but list
await p.goto('http://localhost:8767/jp.html?country=FR'); await p.waitForTimeout(1300);
txt=await p.evaluate(()=>document.body.innerText);
check(/Teaching in France:/.test(txt)&&/Read our France guide/.test(txt)&&/Montessori/.test(txt),'France: note + guide link + listings');
check(errs.length===0,'no console errors '+errs.slice(0,2).join(' | '));
await p.close();
// mobile
p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto('http://localhost:8767/jp.html?country=KR'); await p.waitForTimeout(1300);
check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no sideways scroll');
await p.screenshot({path:O+'empty-mobile.png',fullPage:false});
await p.click('text=Filters'); await p.waitForTimeout(300); await p.locator('.cs-button:visible').click(); await p.waitForTimeout(300);
const tap=await p.evaluate(()=>Math.min(...[...document.querySelectorAll('.cs-option')].filter(o=>o.getBoundingClientRect().height>0).map(o=>o.getBoundingClientRect().height)));
check(tap>=44,'touch targets ≥44px ('+tap+')');
await p.screenshot({path:O+'selector-mobile.png'});
await p.locator('.cs-option:visible:has-text("South Africa")').tap(); await p.waitForTimeout(500);
check(new URL(p.url()).searchParams.get('country')==='ZA','mobile tap selects ZA');
await p.close();
// reduced motion
p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}); await p.goto('http://localhost:8767/jp.html?country=JP'); await p.waitForTimeout(1200);
check(await p.evaluate(()=>getComputedStyle(document.querySelector('.jp-empty')).animationName)==='none','reduced motion: no animation');
await b.close();
console.log('PASS',ok.length,'FAIL',bad.length); bad.forEach(x=>console.log(' ✗',x)); })();
