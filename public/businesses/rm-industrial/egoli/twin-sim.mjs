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
 bottlingRate:200,bottlingStart:7,bottlingEnd:15,stopProb:.2,stopMean:1,filledCap:3000,bottleRejectRate:.01,
 packRate:350,fgCap:8000,dispatchWindows:[9,14],truckCap:1300,kitDeliveries:[[0,7,6000],[3,7,6000]],kitDelayProb:.1,
 demandMean:2100,demandSd:300,dueHours:72,cancelAfterHours:336};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const gauss=r=>Math.sqrt(-2*Math.log(Math.max(1e-12,r())))*Math.cos(2*Math.PI*r());
export function validate(c){
 const positive=['tankCap','dwell','lotSize','filledCap','fgCap','stopMean','dueHours','cancelAfterHours'];
 const nonnegative=['upstreamRate','bottlingRate','packRate','truckCap','demandMean','demandSd'];
 for(const k of positive)if(!Number.isFinite(c[k])||c[k]<=0)throw Error(`${k} must be positive`);
 for(const k of nonnegative)if(!Number.isFinite(c[k])||c[k]<0)throw Error(`${k} cannot be negative`);
 for(const k of ['upstreamBreakProb','qaHoldProb','stopProb','kitDelayProb','bottleRejectRate'])if(!Number.isFinite(c[k])||c[k]<0||c[k]>1)throw Error(`${k} must be between 0 and 1`);
 for(const p of ['upstream','bottling'])if(!(c[p+'Start']>=0&&c[p+'End']<=24&&c[p+'Start']<c[p+'End']))throw Error('Shifts must start and end within one calendar day');
 if(c.lotSize>c.tankCap)throw Error('A complete batch must fit within holding capacity');
 for(const k of ['qaWindows','dispatchWindows'])if(!Array.isArray(c[k])||new Set(c[k]).size!==c[k].length||c[k].some(v=>!Number.isFinite(v)||v<0||v>=24||v*4%1))throw Error('Windows must be unique quarter-hour times');
 if(c.kitDeliveries.some(([d,h,q])=>!Number.isInteger(d)||d<0||d>6||!Number.isFinite(h)||h<0||h>=24||h*4%1||!Number.isFinite(q)||q<0))throw Error('Invalid material delivery schedule');
 return c;
}
export const clock=t=>{const d=Math.floor(t/24),h=Math.floor(t%24),m=Math.round((t%1)*60);return{day:d,dow:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d%7],text:`D${d+1} · ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d%7]} ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`}};
export const backlog=s=>s.orders.reduce((a,o)=>a+o.left,0);
export const occupancy=s=>s.lots.reduce((a,l)=>a+l.qty,0)+s.cur+s.released;
export const bottlingHours=c=>c.bottlingEnd-c.bottlingStart;
const log=(s,type,text)=>{s.log.unshift({t:s.t,type,text});if(s.log.length>120)s.log.pop()};
export function create(seed=7,overrides={}){
 const cfg=validate(structuredClone({...defaults,...overrides}));
 const s={seed,cfg,t:0,streams:Object.fromEntries(['orders','upstream','bottling','qa','kits'].map((k,i)=>[k,rng(seed+997*i)])),lots:[],cur:0,released:0,kits:4000,filled:300,fg:600,pendingKits:[],orders:[],done:[],expired:[],lost:0,log:[],events:[],hist:[],shipments:[],arrivals:[],decisions:[],
 totals:{produced:0,bottled:0,rejected:0,shipped:0,kitsReceived:0,kitsUsed:0,kitsWrittenOff:0,demand:3300},opening:{liquid:3900,kits:4000},
 down:{upstream:0,bottling:0},labelsOutUntil:0,bottleneck:null,bnCand:null,bnCount:0,lotSeq:4,orderSeq:1,today:{demand:0,bottled:0,dispatched:0},
 st:Object.fromEntries(STAGES.map(x=>[x.id,{status:'off',util:0,cause:'',time:{running:0,starved:0,blocked:0,down:0,off:0},scheduled:0,productive:0}]))};
 const openingBulk=Math.min(3000,cfg.tankCap);s.opening.liquid=openingBulk+Math.min(300,cfg.filledCap)+Math.min(600,cfg.fgCap);s.filled=Math.min(300,cfg.filledCap);s.fg=Math.min(600,cfg.fgCap);
 for(let i=0,left=openingBulk;left>0;i++){const q=Math.min(cfg.lotSize,left);s.lots.push({id:`B${String(i+1).padStart(4,'0')}`,qty:q,t0:-30+i*4,state:'dwell',holdUntil:0});left-=q;s.lotSeq=i+2;}
 s.orders=[{id:0,qty:1800,left:1800,due:20,at:-10,doneAt:null},{id:-1,qty:1500,left:1500,due:44,at:-4,doneAt:null}];
 return s;
}
function state(s,id,status,cause='',fraction=null){const o=s.st[id];o.status=status;o.cause=cause;o.time[status]=(o.time[status]||0)+.25;if(status!=='off'){o.scheduled+=.25;o.productive+=.25*(fraction??(status==='running'?1:0));o.util=o.productive/o.scheduled;}}
function recordOrder(s,qty,due){const o={id:s.orderSeq++,qty,left:qty,due,at:s.t,doneAt:null};s.orders.push(o);s.arrivals.push({t:s.t,qty});s.today.demand+=qty;s.totals.demand+=qty;}
export function step(s,dt=.25){
 if(dt!==.25)throw Error('The engine uses fixed 15-minute steps');
 const c=validate(s.cfg),t=s.t,day=Math.floor(t/24),hod=t%24,wd=day%7<5;
 // Independent streams consume the same draws every tick for paired scenario comparisons.
 const orderR=[gauss(s.streams.orders),s.streams.orders(),s.streams.orders(),s.streams.orders()];
 const upR=[s.streams.upstream(),s.streams.upstream()];const fillR=[s.streams.bottling(),s.streams.bottling()];const qaR=s.streams.qa(),kitR=s.streams.kits();
 const shift=(a,b)=>wd&&hod>=a&&hod<b;
 if(wd&&hod===6){const total=Math.max(0,Math.round(c.demandMean+orderR[0]*c.demandSd));const n=1+Math.floor(orderR[1]*3);let left=total;for(let i=0;i<n;i++){const q=i===n-1?left:Math.round(left*(.3+orderR[2]*.4));left-=q;if(q)recordOrder(s,q,t+c.dueHours);}}
 if(hod===0){s.orders=s.orders.filter(o=>{if(t>o.due+c.cancelAfterHours){s.lost+=o.left;s.expired.push({...o,cancelled:o.left});log(s,'warn',`Order ${o.id} cancelled after modelled grace period`);return false}return true});}
 for(const [dow,h,q]of c.kitDeliveries)if(day%7===dow&&hod===h){if(kitR<c.kitDelayProb){s.pendingKits.push({at:t+48,qty:q});log(s,'warn',`Supplier delayed ${q} kits by 48 hours`)}else{s.kits+=q;s.totals.kitsReceived+=q;log(s,'info',`${q} kits received`);}}
 s.pendingKits=s.pendingKits.filter(p=>{if(t>=p.at){s.kits+=p.qty;s.totals.kitsReceived+=p.qty;log(s,'info','Delayed material delivery received');return false}return true});
 // Transfer downstream first: newly produced stock cannot traverse the entire plant in a tick.
 if(wd&&c.dispatchWindows.includes(hod)){
  let available=Math.min(c.truckCap,Math.floor(s.fg)),loaded=0;s.orders.sort((a,b)=>a.due-b.due||a.id-b.id);
  for(const o of s.orders){const q=Math.min(o.left,available);o.left-=q;available-=q;loaded+=q;if(o.left<=1e-8)o.doneAt=t;if(available<=0)break;}
  s.fg-=loaded;s.today.dispatched+=loaded;s.totals.shipped+=loaded;
  if(loaded){s.shipments.push({t,qty:loaded});s.events.push({type:'truck',qty:loaded,t});log(s,'info',`Dispatched ${loaded} bottles · earliest due first`);}
  s.orders=s.orders.filter(o=>{if(o.doneAt!==null){s.done.push(o);return false}return true});state(s,'dispatch',loaded?'running':'starved',loaded?'':backlog(s)?'No released finished stock':'No open customer orders');
 }else state(s,'dispatch','off','Outside dispatch window');
 if(!shift(c.bottlingStart,c.bottlingEnd))state(s,'packing','off');
 else if(t<s.labelsOutUntil)state(s,'packing','down','Label shortage');
 else{const want=c.packRate*dt,q=Math.max(0,Math.min(want,s.filled,c.fgCap-s.fg));s.filled-=q;s.fg+=q;state(s,'packing',q>0?'running':s.fg>=c.fgCap?'blocked':'starved',q>0?'':s.fg>=c.fgCap?'Finished warehouse full':'No filled bottles',want?q/want:0);}
 if(!shift(c.bottlingStart,c.bottlingEnd))state(s,'bottling','off');
 else{
  if(t>=s.down.bottling&&fillR[0]<1-Math.exp(-c.stopProb*dt)){s.down.bottling=t+c.stopMean*(.4+fillR[1]*1.2);log(s,'warn','Filler stopped: modelled jam / changeover');}
  if(t<s.down.bottling)state(s,'bottling','down','Filler unavailable');
  else{const want=c.bottlingRate*dt,good=1-c.bottleRejectRate,space=c.filledCap-s.filled,q=Math.max(0,Math.min(want,s.released,s.kits,good>0?space/good:Infinity));
   s.released-=q;s.kits-=q;s.filled+=q*good;s.totals.kitsUsed+=q;s.totals.rejected+=q*(1-good);s.totals.bottled+=q*good;s.today.bottled+=q*good;
   state(s,'bottling',q?'running':space<=1e-8?'blocked':'starved',q?'':space<=1e-8?'Filled buffer full':s.kits<=1e-8?'No packaging kits':'No quality-released bulk',want?q/want:0);}
 }
 if(wd&&c.qaWindows.includes(hod)){
  const lot=s.lots.filter(l=>l.state==='dwell'&&t-l.t0>=c.dwell).sort((a,b)=>a.t0-b.t0)[0];
  if(lot){if(qaR<c.qaHoldProb){lot.state='hold';lot.holdUntil=t+24;log(s,'alert',`${lot.id} held. Review eligible in 24h; explicit disposition required.`);state(s,'qa','down','Batch on hold');}else{s.released+=lot.qty;s.lots.splice(s.lots.indexOf(lot),1);log(s,'info',`${lot.id} released · ${lot.qty} equivalents`);state(s,'qa','running');}}
  else state(s,'qa','starved','No eligible batch');
 }else state(s,'qa','off',s.lots.some(l=>l.state==='hold')?'Held batches require a decision':'Outside quality-release window');
 if(!shift(c.upstreamStart,c.upstreamEnd))state(s,'upstream','off');
 else{
  if(t>=s.down.upstream&&upR[0]<1-Math.exp(-c.upstreamBreakProb*dt)){s.down.upstream=t+1+upR[1]*3;log(s,'alert','Upstream equipment stopped');}
  if(t<s.down.upstream)state(s,'upstream','down','Still unavailable');
  else{const want=c.upstreamRate*dt,q=Math.max(0,Math.min(want,c.tankCap-occupancy(s)));s.cur+=q;s.totals.produced+=q;
   while(s.cur>=c.lotSize-1e-8){s.lots.push({id:`B${String(s.lotSeq++).padStart(4,'0')}`,qty:c.lotSize,t0:t+dt,state:'dwell',holdUntil:0});s.cur-=c.lotSize;}
   state(s,'upstream',q<want-1e-8?'blocked':q?'running':'starved',q<want-1e-8?'No tank headroom':q?'':'Production rate is zero',want?q/want:0);}
 }
 const occ=occupancy(s);state(s,'tanks',occ>=c.tankCap-.01?'blocked':occ<1?'starved':'running',occ>=c.tankCap-.01?'Aggregate tank capacity full':'');s.st.tanks.util=occ/c.tankCap;
 state(s,'stores',s.kits<=1e-8?'down':s.kits<c.demandMean*.8?'starved':'running',s.kits<=1e-8?'No kits available':'');s.st.stores.util=Math.min(1,s.kits/Math.max(1,c.demandMean*3));
 s.t=t+dt;if(Math.floor(s.t/24)>day){s.hist.push({day,...s.today,backlog:backlog(s),bottleneck:s.bottleneck});if(s.hist.length>90)s.hist.shift();s.today={demand:0,bottled:0,dispatched:0};}
 detect(s);
}
export function queues(s){const c=s.cfg,aged=s.lots.filter(l=>l.state==='dwell'&&s.t-l.t0>=c.dwell).reduce((a,l)=>a+l.qty,0),ratio=(a,b)=>b>0?a/b:a>0?Infinity:0;
 return{qa:{qty:aged,days:ratio(aged,c.lotSize*c.qaWindows.length)},bottling:{qty:s.released,days:ratio(s.released,c.bottlingRate*bottlingHours(c))},packing:{qty:s.filled,days:ratio(s.filled,c.packRate*bottlingHours(c))},dispatch:{qty:s.fg,days:ratio(s.fg,c.truckCap*c.dispatchWindows.length)}};
}
function detect(s){if(s.t<48)return;const q=queues(s);let pick=null,max=.6;if(backlog(s)>s.cfg.demandMean*.5){for(const id of ['qa','bottling','packing','dispatch'])if(q[id].days>max){max=q[id].days;pick=id;}if(s.kits<1&&s.released>0)pick='stores';if(!pick&&s.st.upstream.util>.85)pick='upstream';}
 if(pick===s.bnCand)s.bnCount++;else{s.bnCand=pick;s.bnCount=1;}
 if(s.bnCount>=8&&s.bottleneck!==pick){s.bottleneck=pick;if(pick)log(s,'warn',`Constraint candidate: ${STAGES.find(x=>x.id===pick).short}. Queue heuristic; validate experimentally.`);}
}
export function otif(s,days=7){const cohort=[...s.done,...s.expired,...s.orders].filter(o=>o.due<=s.t&&o.due>s.t-days*24);return cohort.length?cohort.filter(o=>o.doneAt!==null&&o.doneAt<=o.due).length/cohort.length:null;}
export function metrics(s){const from=s.t-168;const overdue=s.orders.filter(o=>o.due<s.t);const balance=s.opening.liquid+s.totals.produced-occupancy(s)-s.filled-s.fg-s.totals.shipped-s.totals.rejected;
 const kitBalance=s.opening.kits+s.totals.kitsReceived-s.kits-s.totals.kitsUsed-s.totals.kitsWrittenOff;
 return{otif:otif(s),dispatched7:s.shipments.filter(e=>e.t>from&&e.t<=s.t).reduce((a,e)=>a+e.qty,0),demand7:s.arrivals.filter(e=>e.t>from&&e.t<=s.t).reduce((a,e)=>a+e.qty,0),backlog:backlog(s),lost:s.lost,occupancy:occupancy(s),queues:queues(s),balance,kitBalance,held:s.lots.filter(l=>l.state==='hold').reduce((a,l)=>a+l.qty,0),overdue:overdue.reduce((a,o)=>a+o.left,0),dueCount:[...s.done,...s.expired,...s.orders].filter(o=>o.due<=s.t&&o.due>from).length,wip:occupancy(s)+s.filled};}
export function disposition(s,id,action){const lot=s.lots.find(l=>l.id===id);if(!lot||lot.state!=='hold')throw Error('Select a held batch');if(s.t<lot.holdUntil)throw Error('Minimum investigation period has not elapsed');if(!['release','reject'].includes(action))throw Error('Invalid disposition');if(action==='release')s.released+=lot.qty;else s.totals.rejected+=lot.qty;s.lots.splice(s.lots.indexOf(lot),1);s.decisions.push({t:s.t,lot:id,action,qty:lot.qty});log(s,'info',`Simulated QA decision: ${id} ${action} · ${lot.qty} equivalents`);}
export function inject(s,kind){if(kind==='still'){s.down.upstream=s.t+6;log(s,'alert','Scenario intervention: 6-hour still stop');}if(kind==='labels'){s.labelsOutUntil=s.t+24;log(s,'alert','Scenario intervention: 24-hour label shortage');}if(kind==='rush'){recordOrder(s,3000,s.t+24);log(s,'warn','Scenario intervention: 3,000 units due in 24 hours');}if(kind==='kits'){const loss=s.kits*.85;s.kits-=loss;s.totals.kitsWrittenOff+=loss;log(s,'alert','Scenario intervention: 85% kit write-off');}}
export function warm(s,days=7){for(let i=0;i<days*96;i++)step(s);}
export function compare(seed,baseConfig,scenarioConfig,days=14){const a=create(seed,baseConfig),b=create(seed,scenarioConfig);for(let i=0;i<days*96;i++){step(a);step(b);}return{days,seed,baseline:{...metrics(a),shipped:a.totals.shipped,rejected:a.totals.rejected},scenario:{...metrics(b),shipped:b.totals.shipped,rejected:b.totals.rejected}};}
