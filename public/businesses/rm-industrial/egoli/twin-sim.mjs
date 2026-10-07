// Egoli digital-twin simulation. SYNTHETIC: every number here is an illustrative placeholder, not Egoli data.
// Unit: "bottle equivalents" (finished-strength litres / bottle size). Time: hours since Monday 00:00.
export const STAGES=[
 {id:'stores',name:'Dry goods & stores',short:'Stores',owner:'Procurement',measure:['Kit stock by item','Supplier lead time and delivery reliability','Receipt scans'],source:'Sage / MRP stock module, goods-received scans'},
 {id:'upstream',name:'Fermentation & stills',short:'Stills',owner:'Master distiller',measure:['Litres distilled per run','Still hours run and stopped','Downtime reason codes','Yield'],source:'Flow meters, PLC run-time, batch records'},
 {id:'tanks',name:'Holding tanks',short:'Tanks',owner:'Production lead',measure:['Tank level and ABV','Fill time and dwell time','Compatible-tank availability'],source:'Level sensors or tank log into the MRP'},
 {id:'qa',name:'Quality release',short:'Quality',owner:'Quality lead',measure:['Sample-taken and result times','Release or hold decision','Hold reason'],source:'Lab log / LIMS'},
 {id:'bottling',name:'Bottling',short:'Bottling',owner:'Bottling lead',measure:['Good bottles and rejects','Productive hours','Setup and stop reasons'],source:'Filler counter / PLC, OEE capture sheet'},
 {id:'packing',name:'Label & pack',short:'Packing',owner:'Packaging lead',measure:['Labelled and cased units','Label verification','Rework'],source:'Scanner counts, lot-code verification'},
 {id:'dispatch',name:'Warehouse & dispatch',short:'Dispatch',owner:'Logistics',measure:['Pick, load and dock times','Order fill and on-time delivery','Proof of delivery'],source:'WMS / proof-of-delivery app'}
];
export const defaults={upstreamRate:125,upstreamStart:6,upstreamEnd:22,upstreamBreakProb:.02,tankCap:8000,dwell:12,lotSize:1000,qaWindows:[8,13],qaHoldProb:.05,
 bottlingRate:200,bottlingStart:7,bottlingEnd:15,stopProb:.2,stopMean:1,filledCap:3000,
 packRate:350,fgCap:8000,dispatchWindows:[9,14],truckCap:1300,
 kitDeliveries:[[0,7,6000],[3,7,6000]],kitDelayProb:.1,
 demandMean:2100,demandSd:300,dueHours:72,cashPerBottle:80};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const gauss=r=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
export const clock=t=>{const d=Math.floor(t/24),h=t%24,hh=Math.floor(h),m=Math.floor((h-hh)*60);return{day:d,dow:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d%7],text:`${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d%7]} ${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')}`}};
export function create(seed=7,overrides={}){
 const s={seed,rand:rng(seed),cfg:{...defaults,...overrides},t:0,lots:[],cur:0,released:0,kits:4000,filled:300,fg:600,pendingKits:[],orders:[],done:[],expired:[],lost:0,log:[],events:[],hist:[],
  down:{upstream:0,bottling:0},labelsOutUntil:0,bottleneck:null,bnCand:null,bnCount:0,today:{demand:0,bottled:0,dispatched:0},orderSeq:1,
  st:Object.fromEntries(STAGES.map(x=>[x.id,{status:'off',util:.5,cause:''}]))};
 [0,1,2].forEach(i=>s.lots.push({qty:1000,t0:-30+i*4,state:'dwell',holdUntil:0}));
 s.orders.push({id:0,qty:1800,left:1800,due:20,at:-10,doneAt:null},{id:-1,qty:1500,left:1500,due:44,at:-4,doneAt:null});
 return s;
}
const win=(s,a,b,hod,wd)=>wd&&hod>=a&&hod<b;
export const bottlingHours=c=>c.bottlingEnd-c.bottlingStart;
export const occupancy=s=>s.lots.reduce((a,l)=>a+l.qty,0)+s.cur+s.released;
function log(s,type,text){s.log.unshift({t:s.t,type,text});if(s.log.length>40)s.log.pop()}
export function step(s,dt=.25){
 const c=s.cfg,t0=s.t,t1=t0+dt,r=s.rand;s.t=t1;
 const day=Math.floor(t0/24),hod=t0%24,wd=day%7<5;
 const hits=(h,weekdayOnly=true)=>{const d=Math.floor((t1-1e-9-h)/24),m=d*24+h;return m>=t0-1e-9&&m<t1-1e-9&&(!weekdayOnly||d%7<5)};
 // day roll-up
 if(Math.floor(t1/24)>day){s.hist.push({day,demand:s.today.demand,bottled:s.today.bottled,dispatched:s.today.dispatched,backlog:backlog(s),bottleneck:s.bottleneck});if(s.hist.length>60)s.hist.shift();s.today={demand:0,bottled:0,dispatched:0};}
 // overdue orders lapse after 14 days: customer goes elsewhere
 if(hits(0,false)){s.orders=s.orders.filter(o=>{if(o.due<t1-14*24){s.lost+=o.left;s.expired.push(o);return false}return true});if(s.expired.length>200)s.expired.splice(0,100)}
 // orders arrive 06:00 weekdays
 if(hits(6)){const total=Math.max(800,Math.round(c.demandMean+gauss(r)*c.demandSd));const n=1+Math.floor(r()*3);let left=total;for(let i=0;i<n;i++){const q=i===n-1?left:Math.round(left*(.3+r()*.4));left-=q;s.orders.push({id:s.orderSeq++,qty:q,left:q,due:t1+c.dueHours,at:t1,doneAt:null})}s.today.demand+=total;}
 // kit deliveries
 for(const [dow,h,q] of c.kitDeliveries){if(day%7===dow&&hits(h,false)){if(r()<c.kitDelayProb){s.pendingKits.push({at:t1+48,qty:q});log(s,'warn',`Dry-goods delivery of ${q.toLocaleString('en-ZA')} kits delayed by the supplier`)}else{s.kits+=q;log(s,'info',`Dry-goods delivery received: ${q.toLocaleString('en-ZA')} kits`)}}}
 s.pendingKits=s.pendingKits.filter(p=>{if(t1>=p.at){s.kits+=p.qty;log(s,'info',`Delayed dry goods arrived: ${p.qty.toLocaleString('en-ZA')} kits`);return false}return true});
 // upstream
 {const u=s.st.upstream,inW=win(s,c.upstreamStart,c.upstreamEnd,hod,wd);
  if(!inW)u.status='off';else if(t0<s.down.upstream){u.status='down';u.cause='Still stopped'}else{
   if(r()<c.upstreamBreakProb*dt){s.down.upstream=t0+1+r()*3;log(s,'alert','Still breakdown, stopped for a few hours');u.status='down';u.cause='Still stopped'}
   else{const space=c.tankCap-occupancy(s),want=c.upstreamRate*dt,q=Math.min(want,Math.max(0,space));
    if(q<want*.999){u.status='blocked';u.cause='Holding tanks full';}else{u.status='running';u.cause=''}
    s.cur+=q;while(s.cur>=c.lotSize){s.lots.push({qty:c.lotSize,t0:t1,state:'dwell',holdUntil:0});s.cur-=c.lotSize}}}
  ema(u,inW,u.status==='running'&&1,dt)}
 // tanks status (stock holder)
 {const k=s.st.tanks,occ=occupancy(s)/c.tankCap;k.status=occ>.97?'blocked':occ<.05?'starved':'running';k.cause=occ>.97?'Full':'';k.util=occ}
 // QA
 {const q=s.st.qa;let acted=false;
  for(const w of c.qaWindows)if(hits(w)){const lot=s.lots.filter(l=>l.state==='dwell'&&t1-l.t0>=c.dwell||l.state==='hold'&&t1>=l.holdUntil).sort((a,b)=>a.t0-b.t0)[0];
   if(lot){if(lot.state==='dwell'&&r()<c.qaHoldProb){lot.state='hold';lot.holdUntil=t1+24;log(s,'warn','Batch placed on quality hold for investigation');}else{s.lots.splice(s.lots.indexOf(lot),1);s.released+=lot.qty;acted=true;log(s,'info',`Batch of ${lot.qty.toLocaleString('en-ZA')} released by quality`)}}
   q.pulse=acted?1:0;q.util+= (q.pulse-q.util)*.15;q.lastWindow=t1}
  const aged=s.lots.filter(l=>t1-l.t0>=c.dwell).length;q.status=(t1-(q.lastWindow||-99)<1.5)?(q.pulse?'running':'starved'):(!wd?'off':aged?'starved':'off');
  if(q.status==='starved'){q.cause=aged?'Waiting for the next release window':'No aged batch'}else q.cause=''}
 // bottling
 {const b=s.st.bottling,inW=win(s,c.bottlingStart,c.bottlingEnd,hod,wd);
  if(!inW)b.status='off';else{
   if(t0>=s.down.bottling&&r()<c.stopProb*dt){s.down.bottling=t0+c.stopMean*(.4+r()*1.2);if(r()<.5)log(s,'warn','Bottling line stopped: changeover or jam')}
   if(t0<s.down.bottling){b.status='down';b.cause='Line stopped (changeover or jam)'}
   else{const want=c.bottlingRate*dt,q=Math.min(want,s.released,s.kits,c.filledCap-s.filled);
    if(q>0){s.released-=q;s.kits-=q;s.filled+=q;s.today.bottled+=q;b.status='running';b.cause=''}
    else{b.status=s.filled>=c.filledCap?'blocked':'starved';b.cause=s.filled>=c.filledCap?'Packing line full':s.kits<=0?'No dry-goods kits':'No released bulk gin'}}}
  ema(b,inW,b.status==='running'&&1,dt)}
 // packing
 {const p=s.st.packing,inW=win(s,c.bottlingStart,c.bottlingEnd,hod,wd);
  if(!inW)p.status='off';else{const want=c.packRate*dt,q=t0<s.labelsOutUntil?0:Math.min(want,s.filled,c.fgCap-s.fg);
   if(q>0){s.filled-=q;s.fg+=q;p.status='running';p.cause=''}else{p.status=t0<s.labelsOutUntil?'down':s.fg>=c.fgCap?'blocked':'starved';p.cause=t0<s.labelsOutUntil?'Label shortage':s.fg>=c.fgCap?'Warehouse full':'Waiting for filled bottles'}}
  ema(p,inW,p.status==='running'&&1,dt)}
 // dispatch
 {const d=s.st.dispatch;let moved=false,inW=false;
  for(const w of c.dispatchWindows){if(win(s,w,w+1.5,hod,wd))inW=true;
   if(hits(w)){let load=Math.min(c.truckCap,s.fg),loaded=0;s.orders.sort((a,b)=>a.due-b.due);for(const o of s.orders){if(load<=0)break;const q=Math.min(o.left,load);o.left-=q;load-=q;loaded+=q;if(o.left<=0.5){o.doneAt=t1}}
    s.fg-=loaded;s.today.dispatched+=loaded;if(loaded>0){moved=true;s.events.push({type:'truck',qty:loaded,t:t1});log(s,'info',`Truck dispatched with ${Math.round(loaded).toLocaleString('en-ZA')} bottles`)}
    s.orders=s.orders.filter(o=>{if(o.doneAt!=null){s.done.push(o);return false}return true});s.dispatchPulse=moved?1:0;d.util+=(s.dispatchPulse-d.util)*.2}}
  d.status=!wd?'off':inW?(s.dispatchPulse?'running':'starved'):'off';d.cause=d.status==='starved'?'No finished stock to load':'';}
 // stores
 {const k=s.st.stores,days=s.kits/Math.max(1,c.demandMean);k.status=s.kits<=0?'down':days<.8?'starved':'running';k.cause=s.kits<=0?'Out of kits':days<.8?'Low kit cover':'';k.util=Math.min(1,days/3)}
 detectBottleneck(s);
}
function ema(x,inW,busy,dt){if(inW){x.util+=((busy?1:0)-x.util)*Math.min(1,dt/30)}}
export const backlog=s=>s.orders.reduce((a,o)=>a+o.left,0);
export function queues(s){const c=s.cfg,bh=bottlingHours(c),uh=c.upstreamEnd-c.upstreamStart;
 const aged=s.lots.filter(l=>s.t-l.t0>=c.dwell).reduce((a,l)=>a+l.qty,0);
 return{qa:{qty:aged,days:aged/(c.lotSize*c.qaWindows.length)},bottling:{qty:s.released,days:s.released/(c.bottlingRate*bh)},packing:{qty:s.filled,days:s.filled/(c.packRate*bh)},dispatch:{qty:s.fg,days:s.fg/(c.truckCap*c.dispatchWindows.length)}}}
function detectBottleneck(s){
 if(Math.floor(s.t/24)%7>=5)return;
 const q=queues(s);let pick=null,max=.6;const waiting=backlog(s)/s.cfg.demandMean>.5;
 if(waiting)for(const id of ['qa','bottling','packing','dispatch'])if(q[id].days>max){max=q[id].days;pick=id}
 if(!pick&&backlog(s)/s.cfg.demandMean>.8){let best=.85;for(const id of ['upstream','bottling'])if(s.st[id].util>best){best=s.st[id].util;pick=id}}
 if(s.st.stores.status==='down'&&waiting)pick='stores';
 if(pick===s.bnCand)s.bnCount++;else{s.bnCand=pick;s.bnCount=0}
 if(s.bnCount>=8&&s.bottleneck!==pick){s.bottleneck=pick;if(pick)log(s,'alert',`Bottleneck flagged: ${STAGES.find(x=>x.id===pick).name}`)}
}
export function otif(s,days=7){const from=s.t-days*24;const rel=[...s.done,...s.expired,...s.orders].filter(o=>o.due<=s.t&&o.due>from);if(!rel.length)return null;return rel.filter(o=>o.doneAt!=null&&o.doneAt<=o.due).length/rel.length}
export function metrics(s){const c=s.cfg,last=s.hist.slice(-7),disp=last.reduce((a,h)=>a+h.dispatched,0),dem=last.reduce((a,h)=>a+h.demand,0);
 return{otif:otif(s),dispatched7:disp,demand7:dem,backlog:backlog(s),lost:s.lost,cash:(occupancy(s)+s.filled+s.fg+s.kits)*c.cashPerBottle,occupancy:occupancy(s),queues:queues(s)}}
export function inject(s,kind){const c=s.cfg;
 if(kind==='still'){s.down.upstream=s.t+6;log(s,'alert','Injected: still breakdown (6 hours)')}
 if(kind==='labels'){s.labelsOutUntil=s.t+24;log(s,'alert','Injected: label shortage (24 hours)')}
 if(kind==='rush'){s.orders.push({id:s.orderSeq++,qty:3000,left:3000,due:s.t+24,at:s.t,doneAt:null});s.today.demand+=3000;log(s,'alert','Injected: rush order of 3,000 bottles due in 24 hours')}
 if(kind==='kits'){s.kits=Math.round(s.kits*.15);log(s,'alert','Injected: dry-goods stock write-down, kit cover is now short')}}
export function warm(s,days=7){for(let i=0;i<days*96;i++)step(s)}
