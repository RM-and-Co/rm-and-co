import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {STAGES,create,step,warm,clock,metrics,inject,queues,occupancy,backlog} from './twin-sim.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n0=v=>v==null?'—':Math.round(v).toLocaleString('en-ZA');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const COL={running:0x3fb58a,starved:0x6ea8d9,blocked:0xe0a23a,down:0xe0553f,off:0x5a6678};
const STATUS_TEXT={running:'Running',starved:'Starved',blocked:'Blocked',down:'Stopped',off:'Off shift'};

/* ---------- simulation + levers ---------- */
let sim,speedIdx=0,playing=true;const SPEEDS=[6,24,72];
const LEVERS=[
 {id:'bottling',label:'Faster bottling line',detail:'200 → 320 bottles / hour',apply:(c,on)=>{c.bottlingRate=on?320:200}},
 {id:'shifts',label:'Second bottling shift',detail:'07–15 → 06–22',apply:(c,on)=>{c.bottlingStart=on?6:7;c.bottlingEnd=on?22:15}},
 {id:'stills',label:'Run the stills 24 hours',detail:'16 → 24 hours / day',apply:(c,on)=>{c.upstreamStart=on?0:6;c.upstreamEnd=on?24:22}},
 {id:'qa',label:'Add a quality-release window',detail:'2 → 3 releases / day',apply:(c,on)=>{c.qaWindows=on?[8,11,14]:[8,13]}},
 {id:'kits',label:'Extra dry-goods delivery',detail:'2 → 3 deliveries / week',apply:(c,on)=>{c.kitDeliveries=on?[[0,7,6000],[2,7,4500],[3,7,6000]]:[[0,7,6000],[3,7,6000]]}}
];
let on={};
function applyLevers(){for(const l of LEVERS)l.apply(sim.cfg,!!on[l.id])}
function boot(){sim=create(7);applyLevers();warm(sim,7);for(let i=0;i<34;i++)step(sim)}
boot();

/* ---------- three.js scene ---------- */
const canvas=$('#scene');let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});}catch(e){$('#fallback').hidden=false}
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x0a1424,90,170);
const camera=new THREE.PerspectiveCamera(38,1,.5,400);camera.position.set(8,46,58);
let controls;
if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x0a1424);renderer.shadowMap.enabled=true;
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.46;controls.minDistance=18;controls.maxDistance=105;controls.target.set(4,0,-2);controls.maxDistance=170;controls.update();}
scene.add(new THREE.HemisphereLight(0xdfe9ff,0x31456a,1.5));
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(-30,50,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-70,right:70,top:50,bottom:-50,near:1,far:150});scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,140),new THREE.MeshStandardMaterial({color:0x1a3050,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.position.y=-.02;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(220,110,0x1d3354,0x15284a);grid.position.y=0;scene.add(grid);

const M=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:.6,metalness:.1,...o});
const pick={};STAGES.forEach(s=>pick[s.id]=[]);
function add(id,mesh,x=0,y=0,z=0,parent=scene){mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(id)pick[id].push(mesh);return mesh}
const box=(id,w,h,d,color,x,y,z,o)=>add(id,new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(color,o)),x,y+h/2,z);
const cyl=(id,rt,rb,h,color,x,y,z,o,seg=28)=>add(id,new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),M(color,o)),x,y+h/2,z);
const POS={stores:[-30,-13],upstream:[-19,-2],tanks:[-4,-2],qa:[-4,11],bottling:[11,-2],packing:[24,-2],dispatch:[38,-2]};
const SIZE={stores:[11,7],upstream:[14,10],tanks:[13,9],qa:[9,7],bottling:[11,9],packing:[10,9],dispatch:[12,11]};
const plates={},lamps={};
for(const s of STAGES){const [x,z]=POS[s.id],[w,d]=SIZE[s.id];
 const plate=new THREE.Mesh(new THREE.BoxGeometry(w,.3,d),new THREE.MeshStandardMaterial({color:0x2a4468,emissive:0x5a6678,emissiveIntensity:.25,roughness:.8}));plate.position.set(x,.15,z);plate.receiveShadow=true;scene.add(plate);plates[s.id]=plate;pick[s.id].push(plate);
 const post=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2.6,10),M(0x3a4660));post.position.set(x+w/2-.8,1.6,z+d/2-.8);scene.add(post);
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.5,16,12),new THREE.MeshStandardMaterial({color:0x222222,emissive:0x5a6678,emissiveIntensity:1.2}));lamp.position.set(x+w/2-.8,3.2,z+d/2-.8);scene.add(lamp);lamps[s.id]=lamp;pick[s.id].push(lamp);}
const STEEL=0xc3cfde,COPPER=0xd08a45,WALL=0x5b79a6,ROOF=0x3a5580;

// stores: building + kit stock pallets
{const [x,z]=POS.stores;box('stores',9,4.2,5,WALL,x,.3,z-.6);box('stores',9.4,.4,5.4,ROOF,x,4.5,z-.6);
 var kitBoxes=[];for(let i=0;i<24;i++){const b=box('stores',1.5,1.1,1.5,0xc9a35a,x-4.2+(i%8)*1.2,.3,z+3.1+Math.floor(i/8)*0);b.position.set(x-4.2+(i%8)*1.15,.85+Math.floor(i/12)*1.1,z+2.1+((i%12)>=8?1.3:0));b.scale.set(.8,1,.8);kitBoxes.push(b)}}
// upstream: fermenters + two copper pot stills
{const [x,z]=POS.upstream;cyl('upstream',1.5,1.5,5.2,STEEL,x-5,.3,z-2.3);cyl('upstream',1.5,1.5,5.2,STEEL,x-5,.3,z+2.3);
 for(const dz of [-2.4,2.4]){const sx=x+1;const pot=add('upstream',new THREE.Mesh(new THREE.SphereGeometry(2,28,20),M(COPPER,{metalness:.6,roughness:.35})),sx,2.8,z+dz);pot.scale.set(1,.95,1);cyl('upstream',.45,1.1,2.4,COPPER,sx,4.2,z+dz,{metalness:.6,roughness:.35});
  const arm=cyl('upstream',.25,.25,5.5,COPPER,sx+2.4,6.1,z+dz,{metalness:.6,roughness:.35});arm.rotation.z=Math.PI/2;arm.position.set(sx+2.7,6.4,z+dz);cyl('upstream',.8,.8,3.6,STEEL,sx+5.2,.3,z+dz)}}
// tanks
const tankLiquid=[];{const [x,z]=POS.tanks;for(let i=0;i<4;i++){const tx=x-4.6+i*3.1;
 const shell=cyl('tanks',1.35,1.35,5.2,0xb9c6d6,tx,.3,z,{transparent:true,opacity:.22,metalness:.2});shell.castShadow=false;
 const liq=cyl('tanks',1.22,1.22,5,0xd6efe6,tx,.3,z,{emissive:0x335a50,emissiveIntensity:.6,transparent:true,opacity:.92});liq.geometry.translate(0,-2.5,0);liq.position.y=.3;liq.scale.y=.01;tankLiquid.push(liq)}}
// quality lab
{const [x,z]=POS.qa;box('qa',6,3,4,0x2d5a78,x,.3,z);box('qa',6.3,.3,4.3,ROOF,x,3.3,z);box('qa',3.4,1.2,.15,0x9fd0ee,x,1.5,z+2.05,{emissive:0x4a90b8,emissiveIntensity:.5});for(let i=0;i<3;i++)cyl('qa',.25,.25,.9,0xe8f1f8,x-1.8+i*.7,3.6,z,{transparent:true,opacity:.7})}
// bottling line
const bottles=[];{const [x,z]=POS.bottling;box('bottling',9,.45,1.1,0x4a5772,x,.3,z+2.2);box('bottling',2.6,3.6,2.6,0x5a7aa8,x-1,.3,z-.6);box('bottling',2.9,.35,2.9,ROOF,x-1,3.9,z-.6);box('bottling',1.6,2.2,1.6,0x3a4660,x+3.4,.3,z-.8);
 for(let i=0;i<14;i++){const b=cyl('bottling',.22,.26,.9,0xcfe6e0,x,0,z,{transparent:true,opacity:.9},10);b.userData.ph=i/14;bottles.push(b)}}
// packing line
const cases=[];{const [x,z]=POS.packing;box('packing',8,.45,1.1,0x4a5772,x,.3,z+2.2);box('packing',2.4,2.8,2.4,0x6a7f58,x-1.8,.3,z-.6);box('packing',2.4,.3,2.6,ROOF,x-1.8,3.1,z-.6);
 for(let i=0;i<8;i++){const b=box('packing',.9,.7,.9,0xc9a35a,x,.6,z+2.2);b.userData.ph=i/8;cases.push(b)}}
// dispatch warehouse + FG pallets
const pallets=[];{const [x,z]=POS.dispatch;box('dispatch',10,5,5.5,WALL,x,.3,z-2.6);box('dispatch',10.4,.4,5.9,ROOF,x,5.3,z-2.6);box('dispatch',3,3,.2,0x0e1d33,x+3,.3,z+.2);
 for(let i=0;i<40;i++){const b=box('dispatch',.9,.9,.9,0xd9b45f,x-4.3+(i%10)*.95,.3+Math.floor(i/20)*.95,z+1.2+(Math.floor(i/10)%2)*1.1);pallets.push(b)}}
// trucks
const truck=new THREE.Group();{const cab=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.9),M(0xe8e4d8));cab.position.set(-3.3,1.4,0);const tr=new THREE.Mesh(new THREE.BoxGeometry(5.4,2.4,2.2),M(0x2d5a78));tr.position.set(0,1.7,0);truck.add(cab,tr);for(const wx of [-3.2,-1,1.5,3]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,2.3,14),M(0x111111));w.rotation.x=Math.PI/2;w.position.set(wx,.5,0);truck.add(w)}truck.traverse(o=>{o.castShadow=true});truck.visible=false;truck.rotation.y=Math.PI;scene.add(truck)}
const truckQueue=[];let truckAnim=null;
// flow paths + particles
const PATHS={
 upstream_tanks:{pts:[[-12,-2],[-10.5,-2]],stage:'upstream'},
 tanks_qa:{pts:[[-4,2.6],[-4,7.4]],stage:'qa'},
 tanks_bottling:{pts:[[2.5,-2],[5.5,-2]],stage:'bottling'},
 stores_bottling:{pts:[[-25,-13],[11,-13],[11,-6.5]],stage:'bottling'},
 bottling_packing:{pts:[[16.5,-2],[19,-2]],stage:'packing'},
 packing_dispatch:{pts:[[29,-2],[32,-2]],stage:'dispatch'}};
const particles=[];
for(const [k,p] of Object.entries(PATHS)){const v=p.pts.map(a=>new THREE.Vector3(a[0],.45,a[1]));p.v=v;p.len=0;p.seg=[];for(let i=1;i<v.length;i++){const l=v[i].distanceTo(v[i-1]);p.seg.push(l);p.len+=l}
 scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(v),new THREE.LineBasicMaterial({color:0x3b5278})));
 const n=Math.max(3,Math.round(p.len/2.2));for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0xc8a351}));m.userData={path:p,ph:i/n};scene.add(m);particles.push(m)}}
function along(p,t){let d=t*p.len;for(let i=0;i<p.seg.length;i++){if(d<=p.seg[i])return new THREE.Vector3().lerpVectors(p.v[i],p.v[i+1],d/p.seg[i]);d-=p.seg[i]}return p.v[p.v.length-1].clone()}
// bottleneck marker + selection ring
const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.16,10,64),new THREE.MeshBasicMaterial({color:0xff4d3a}));ring.rotation.x=Math.PI/2;ring.visible=false;scene.add(ring);
const beacon=new THREE.Mesh(new THREE.ConeGeometry(1.1,2.4,4),new THREE.MeshStandardMaterial({color:0xff4d3a,emissive:0xff4d3a,emissiveIntensity:1.2}));beacon.rotation.x=Math.PI;beacon.visible=false;scene.add(beacon);
const selRing=new THREE.Mesh(new THREE.TorusGeometry(1,.09,8,64),new THREE.MeshBasicMaterial({color:0xc8a351}));selRing.rotation.x=Math.PI/2;selRing.visible=false;scene.add(selRing);

/* ---------- labels ---------- */
const labels={};for(const s of STAGES){const el=document.createElement('div');el.className='label';$('#labels').append(el);labels[s.id]=el}

/* ---------- selection ---------- */
let selected='bottling',focus=null;
function select(id,fly=true){selected=id;if(fly&&controls&&!reduced){const [x,z]=POS[id];focus=new THREE.Vector3(x,0,z)}else if(fly&&controls){const [x,z]=POS[id];controls.target.set(x,0,z)}ui(true)}
if(renderer){const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;
 canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
 canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mouse,camera);
  const all=Object.entries(pick).flatMap(([id,ms])=>ms.map(m=>(m.userData.stage=id,m)));const hit=ray.intersectObjects(all,false)[0];if(hit)select(hit.object.userData.stage);});
 canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mouse,camera);canvas.style.cursor=ray.intersectObjects(Object.values(pick).flat(),false).length?'pointer':'grab'});}

/* ---------- dashboards ---------- */
function kpis(){const m=metrics(sim),c=sim.cfg;const bn=sim.bottleneck?STAGES.find(s=>s.id===sim.bottleneck).name:'None flagged';
 const otifV=m.otif==null?null:Math.round(m.otif*100);const rate=m.demand7?m.dispatched7/m.demand7:null;
 $('#kpis').innerHTML=`<div class="kpi ${sim.bottleneck?'alert':'good'}"><small>CURRENT BOTTLENECK</small><strong>${esc(bn)}</strong><span>${sim.bottleneck?'Flagged from queue and utilisation':'Flow is balanced'}</span></div>
 <div class="kpi ${otifV==null?'':otifV>=90?'good':'bad'}"><small>ON TIME, IN FULL · 7 DAYS</small><strong>${otifV==null?'—':otifV+'%'}</strong><span>orders due and completed on time</span></div>
 <div class="kpi ${rate==null?'':rate>=.95?'good':'bad'}"><small>DISPATCHED · LAST 7 DAYS</small><strong>${n0(m.dispatched7)}</strong><span>of ${n0(m.demand7)} bottles ordered</span></div>
 <div class="kpi"><small>ORDER BACKLOG</small><strong>${n0(m.backlog)}</strong><span>bottles · ${n0(sim.lost)} lapsed as lost sales</span></div>
 <div class="kpi"><small>CASH TIED UP IN STOCK</small><strong>R${(m.cash/1e6).toFixed(2)}m</strong><span>@ R${c.cashPerBottle}/bottle, illustrative</span></div>
 <div class="kpi"><small>FINISHED STOCK · TANK FILL</small><strong>${n0(sim.fg)}</strong><span>bottles · tanks ${Math.round(m.occupancy/c.tankCap*100)}% full</span></div>`}
function stagesList(){const q=queues(sim);$('#stages').innerHTML=STAGES.map(s=>{const st=sim.st[s.id],qq=q[s.id];const util=Math.round(Math.max(0,Math.min(1,st.util))*100);const sub=st.cause||(qq?`${n0(qq.qty)} waiting`:'');
 return `<button class="stage-row ${st.status} ${sim.bottleneck===s.id?'bn':''} ${selected===s.id?'sel':''}" data-stage="${s.id}"><i></i><span><b>${esc(s.name)}</b><small>${esc(STATUS_TEXT[st.status])}${sub?' · '+esc(sub):''}</small></span><span><em>${s.id==='stores'?'cover':s.id==='tanks'?'full':'busy'} ${util}%</em><div class="meter"><span style="width:${util}%"></span></div></span></button>`}).join('');
 $$('[data-stage]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.stage)))}
function detail(){const s=STAGES.find(x=>x.id===selected),st=sim.st[s.id],q=queues(sim)[s.id];const isBn=sim.bottleneck===s.id;
 const why=isBn?`<div class="lbl">Why it is flagged</div><p class="why">${s.id==='bottling'?`${n0(q.qty)} bottles of released gin are waiting to be filled, and the line only runs when it can. Upstream and quality are producing more than bottling can absorb, so the extra stock sits in tanks.`:s.id==='qa'?`${n0(q.qty)} bottles of aged gin are waiting for a release window. Output is capped by how often batches are released.`:s.id==='upstream'?'The stills are running close to flat out while orders are still waiting. Nothing downstream is holding them back, so they set the pace.':s.id==='stores'?'Dry goods have run short, so bottling cannot start even though gin is ready.':'Finished stock is waiting for trucks, so output cannot leave the plant.'}</p>`:'';
 $('#detail').innerHTML=`<h2>Selected area</h2><h3>${esc(s.name)}</h3><div class="own">Proposed owner: ${esc(s.owner)} · status: ${esc(STATUS_TEXT[st.status])}${st.cause?' · '+esc(st.cause):''}</div>${why}<div class="lbl">What we would measure here</div><ul>${s.measure.map(m=>`<li>${esc(m)}</li>`).join('')}</ul><div class="lbl">Where the data comes from</div><p>${esc(s.source)}</p>`}
function chart(){const h=sim.hist.slice(-14);if(h.length<2){$('#chart').innerHTML='';return}const W=380,H=150,pl=34,pb=22,pt=8,max=Math.max(...h.flatMap(x=>[x.dispatched,x.demand]),1000)*1.1;const bw=(W-pl)/h.length;const y=v=>H-pb-v/max*(H-pb-pt);
 const bars=h.map((x,i)=>`<rect x="${pl+i*bw+bw*.18}" y="${y(x.dispatched)}" width="${bw*.64}" height="${H-pb-y(x.dispatched)}" fill="#c8a351" rx="2"/>`).join('');
 const pts=h.map((x,i)=>`${pl+i*bw+bw/2},${y(x.demand)}`).join(' ');const dl=h.map((x,i)=>i%2?'':`<text x="${pl+i*bw+bw/2}" y="${H-6}" text-anchor="middle">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][x.day%7]}</text>`).join('');
 const grid=[0,.5,1].map(t=>`<line x1="${pl}" x2="${W}" y1="${y(max*t/1.1)}" y2="${y(max*t/1.1)}" stroke="#243752"/><text x="${pl-5}" y="${y(max*t/1.1)+3}" text-anchor="end">${n0(max*t/1.1)}</text>`).join('');
 $('#chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily dispatched bottles compared with daily orders over the last 14 days">${grid}${bars}<polyline points="${pts}" fill="none" stroke="#6ea8d9" stroke-width="2"/>${dl}</svg><div class="note" style="margin:4px 0 0"><span style="color:#c8a351">■</span> Dispatched &nbsp; <span style="color:#6ea8d9">━</span> Ordered</div>`}
function levers(){$('#levers').innerHTML=LEVERS.map(l=>`<button class="lever" data-lever="${l.id}" aria-pressed="${!!on[l.id]}"><span>${esc(l.label)}<small>${esc(l.detail)}</small></span><span class="tag">${on[l.id]?'ON':'OFF'}</span></button>`).join('');
 $$('[data-lever]').forEach(b=>b.addEventListener('click',()=>{on[b.dataset.lever]=!on[b.dataset.lever];applyLevers();levers()}));}
$('#disrupt').innerHTML=[['still','Still breakdown','Stills stop for 6 hours'],['labels','Label shortage','Packing starved for 24 hours'],['rush','Rush order','3,000 bottles due in 24 hours'],['kits','Dry-goods shortfall','Kit stock falls by 85%']].map(([k,t,d])=>`<button class="lever disrupt" data-inject="${k}"><span>${t}<small>${d}</small></span><span class="tag">INJECT</span></button>`).join('');
$$('[data-inject]').forEach(b=>b.addEventListener('click',()=>{inject(sim,b.dataset.inject);ui(true)}));
function logPanel(){$('#log').innerHTML=sim.log.slice(0,12).map(e=>`<li class="${e.type}"><time>${clock(e.t).text}</time><span>${esc(e.text)}</span></li>`).join('')}
let uiClock=0;function ui(force){const now=performance.now();if(!force&&now-uiClock<300)return;uiClock=now;$('#clock').textContent=clock(sim.t).text;kpis();stagesList();detail();chart();logPanel()}

/* ---------- guided story ---------- */
const STORY=[
 {title:'Today',text:'The plant as described in the proposal: bottling, batching and packing are the suspected constraints. Watch the red marker and the build-up of released gin waiting to be bottled.',set:{}},
 {title:'Step 1 · Faster bottling line',text:'We add a faster filler. Bottling clears its queue, but the constraint does not disappear. It moves upstream to quality release and the stills.',set:{bottling:1}},
 {title:'Step 2 · Second bottling shift',text:'More bottling hours barely help now. Bottling is no longer the limit. A true bottling investment would have been partly wasted without the data to show it.',set:{bottling:1,shifts:1}},
 {title:'Step 3 · Stills 24 hours',text:'Distillation output rises, but gin now waits longer to be released. Quality release becomes the limit.',set:{bottling:1,shifts:1,stills:1}},
 {title:'Step 4 · Add a release window',text:'With release no longer holding the plant, output reaches demand and the next limit appears: materials. Dry goods cover becomes the thing to protect.',set:{bottling:1,shifts:1,stills:1,qa:1}},
 {title:'Step 5 · Secure dry goods',text:'With all five levers the plant can meet demand. Watch finished stock and cash: once demand is met, extra capacity only builds stock. The point is that each investment is sequenced by what the data shows, and stopped when it stops helping.',set:{bottling:1,shifts:1,stills:1,qa:1,kits:1}}];
let storyOn=false,storyIdx=0,storyStart=0;
function storyShow(){const el=$('#story');el.hidden=!storyOn;if(!storyOn)return;const s=STORY[storyIdx];el.innerHTML=`<b>GUIDED STORY · ${storyIdx+1} OF ${STORY.length}</b><p><strong>${esc(s.title)}.</strong> ${esc(s.text)}</p>`}
function storyApply(i){storyIdx=i;on={...STORY[i].set};applyLevers();levers();storyStart=sim.t;storyShow()}
$('#story-btn').addEventListener('click',()=>{storyOn=!storyOn;$('#story-btn').textContent=storyOn?'■ Stop the story':'▶ Play the guided story';if(storyOn){if(speedIdx<1)setSpeed(1);boot2();storyApply(0);playing=true;$('#play').textContent='Ⅱ Pause';$('#play').setAttribute('aria-pressed','true')}else storyShow()});
function storyTick(){if(storyOn&&sim.t-storyStart>=24*9){if(storyIdx<STORY.length-1)storyApply(storyIdx+1);else{storyOn=false;$('#story-btn').textContent='▶ Play the guided story';storyShow()}}}

/* ---------- controls ---------- */
function setSpeed(i){speedIdx=i;$$('[data-speed]').forEach(b=>b.classList.toggle('on',Number(b.dataset.speed)===i))}
$$('[data-speed]').forEach(b=>b.addEventListener('click',()=>setSpeed(Number(b.dataset.speed))));
$('#play').addEventListener('click',()=>{playing=!playing;$('#play').textContent=playing?'Ⅱ Pause':'▶ Play';$('#play').setAttribute('aria-pressed',String(playing))});
function boot2(){on={};boot();levers();ui(true)}
$('#reset').addEventListener('click',()=>{storyOn=false;$('#story-btn').textContent='▶ Play the guided story';storyShow();boot2()});

/* ---------- render loop ---------- */
let userMoved=false;if(controls)controls.addEventListener('start',()=>{userMoved=true});
function fitCamera(){const hf=2*Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.aspect);const d=Math.min(150,Math.max(60,(innerWidth<700?24:40)/Math.tan(hf/2)));const dir=new THREE.Vector3(.12,.62,.78).normalize();camera.position.copy(controls.target).addScaledVector(dir,d);controls.update()}
function resize(){if(!renderer)return;const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(!userMoved)fitCamera()}
addEventListener('resize',resize);resize();
const v3=new THREE.Vector3();let last=performance.now(),acc=0,phase=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;
 if(playing){acc+=dt*SPEEDS[speedIdx];let n=0;while(acc>=.25&&n<60){step(sim,.25);acc-=.25;n++}if(n>=60)acc=0;storyTick()}
 // trucks from sim events
 while(sim.events.length){const e=sim.events.shift();if(truckQueue.length<3)truckQueue.push(e)}
 if(!truckAnim&&truckQueue.length){truckQueue.shift();truckAnim={t:0};truck.visible=true}
 if(truckAnim){truckAnim.t+=dt;const T=truckAnim.t,[dx,dz]=POS.dispatch;const x=T<2?THREE.MathUtils.lerp(dx+22,dx+3,T/2):T<3.8?dx+3:T<5.8?THREE.MathUtils.lerp(dx+3,dx+22,(T-3.8)/2):dx+22;truck.position.set(x,0,dz+6.4);if(T>5.8){truck.visible=false;truckAnim=null}}
 const st=sim.st,q=queues(sim);phase+=dt;
 for(const s of STAGES){const k=st[s.id].status;plates[s.id].material.emissive.setHex(COL[k]);plates[s.id].material.emissiveIntensity=k==='off'?.12:.32;lamps[s.id].material.emissive.setHex(COL[k]);lamps[s.id].material.emissiveIntensity=k==='down'?1.2+Math.sin(phase*8)*.8:1.4}
 // tanks fill
 const cap=sim.cfg.tankCap/4;let occ=occupancy(sim);tankLiquid.forEach(l=>{const f=Math.min(1,Math.max(0,occ/cap));occ-=cap;l.scale.y+=(Math.max(.01,f)-l.scale.y)*Math.min(1,dt*3)});
 // stock visuals
 kitBoxes.forEach((b,i)=>{b.visible=i<Math.ceil(Math.min(1,sim.kits/9000)*24)});pallets.forEach((b,i)=>{b.visible=i<Math.ceil(Math.min(1,sim.fg/4000)*40)});
 // conveyors
 const run=id=>st[id].status==='running'?1:0;
 bottles.forEach(b=>{if(run('bottling'))b.userData.ph=(b.userData.ph+dt*.35)%1;const [x,z]=POS.bottling;b.position.set(x-4.2+b.userData.ph*8.4,.75,z+2.2)});
 cases.forEach(b=>{if(run('packing'))b.userData.ph=(b.userData.ph+dt*.25)%1;const [x,z]=POS.packing;b.position.set(x-3.6+b.userData.ph*7.2,.85,z+2.2)});
 const flow={upstream_tanks:run('upstream'),tanks_qa:st.qa.status==='running'?1:0,tanks_bottling:run('bottling'),stores_bottling:run('bottling'),bottling_packing:run('packing'),packing_dispatch:run('packing')};
 for(const m of particles){const p=m.userData.path,key=Object.keys(PATHS).find(k=>PATHS[k]===p);const f=flow[key];if(f)m.userData.ph=(m.userData.ph+dt*.22)%1;m.visible=!!f||m.userData.ph<.5;m.position.copy(along(p,m.userData.ph));m.material.opacity=1}
 // bottleneck + selection markers
 if(sim.bottleneck){const [x,z]=POS[sim.bottleneck],[w,d]=SIZE[sim.bottleneck];ring.visible=beacon.visible=true;const rr=Math.max(w,d)*.62+Math.sin(phase*3)*.25;ring.scale.set(rr,rr,1);ring.position.set(x,.5,z);beacon.position.set(x,11+Math.sin(phase*3)*.5,z)}else ring.visible=beacon.visible=false;
 {const [x,z]=POS[selected],[w,d]=SIZE[selected],rr=Math.max(w,d)*.68;selRing.visible=true;selRing.scale.set(rr,rr,1);selRing.position.set(x,.5,z)}
 if(focus&&controls){controls.target.lerp(focus,.08);if(controls.target.distanceTo(focus)<.2)focus=null}
 if(renderer){controls.update();renderer.render(scene,camera);
  const r=canvas.getBoundingClientRect();for(const s of STAGES){const [x,z]=POS[s.id];v3.set(x,9,z).project(camera);const el=labels[s.id],k=st[s.id];el.className=`label ${k.status} ${sim.bottleneck===s.id?'bn':''} ${selected===s.id?'sel':''}`;el.style.left=((v3.x*.5+.5)*r.width)+'px';el.style.top=((-v3.y*.5+.5)*r.height)+'px';el.style.display=v3.z<1?'block':'none';
   const util=Math.round(Math.max(0,Math.min(1,k.util))*100);el.innerHTML=`<b>${esc(s.short)}</b><span>${esc(STATUS_TEXT[k.status])} · ${util}%</span>`}}
 ui(false)}
levers();select('bottling',false);ui(true);requestAnimationFrame(frame);
