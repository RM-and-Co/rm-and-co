import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {STAGES,defaults,validate,create,step,clock,metrics,inject,queues,occupancy,backlog,disposition,compare} from './twin-sim.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n0=v=>v==null||!Number.isFinite(v)?'—':Math.round(v).toLocaleString('en-ZA');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const COL={running:0x3d9779,starved:0x5986a5,blocked:0xc29845,down:0xbf6656,off:0x84918f};
const STATUS_TEXT={running:'Running',starved:'Starved',blocked:'Blocked',down:'Stopped',off:'Off shift'};
let baseConfig=structuredClone(defaults),sim,selected='bottling',on={},playing=false,speedIdx=0,focus=null;const SPEEDS=[1,6,24];
const LEVERS=[
 {id:'bottling',label:'Upgrade filler',detail:'200 → 320 BE/h at default settings',apply:(c,b)=>c.bottlingRate=b.bottlingRate*1.6},
 {id:'shifts',label:'Extend finishing shift',detail:'Bottling and packing → 06:00–22:00',apply:c=>{c.bottlingStart=6;c.bottlingEnd=22}},
 {id:'stills',label:'Run upstream around the clock',detail:'24 hours · Monday to Friday',apply:c=>{c.upstreamStart=0;c.upstreamEnd=24}},
 {id:'qa',label:'Third quality release window',detail:'08:00, 11:00 and 14:00',apply:c=>c.qaWindows=[8,11,14]},
 {id:'kits',label:'Additional kit delivery',detail:'4,500 kits Wednesday at 07:00',apply:c=>c.kitDeliveries=[...c.kitDeliveries,[2,7,4500]]}
];
function configured(){const c=structuredClone(baseConfig);for(const l of LEVERS)if(on[l.id])l.apply(c,baseConfig);return validate(c)}
function boot(){sim=create(7,configured());for(let i=0;i<32;i++)step(sim);}
boot();
/* ---------- three.js scene ---------- */
const canvas=$('#scene');let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});}catch(e){$('#fallback').hidden=false}
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x14272d,90,170);
const camera=new THREE.PerspectiveCamera(38,1,.5,1200);camera.position.set(8,46,58);
let controls;
if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x14272d);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.46;controls.minDistance=18;controls.maxDistance=105;controls.target.set(4,0,-2);controls.maxDistance=650;controls.update();}
scene.add(new THREE.HemisphereLight(0xdfe9ff,0x31456a,1.5));
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(-30,50,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-70,right:70,top:50,bottom:-50,near:1,far:150});scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,140),new THREE.MeshStandardMaterial({color:0x263b3c,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.position.y=-.02;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(220,110,0x344949,0x293e3e);grid.position.y=0;scene.add(grid);

const M=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:.6,metalness:.1,...o});
const pick={};STAGES.forEach(s=>pick[s.id]=[]);
function add(id,mesh,x=0,y=0,z=0,parent=scene){mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(id)pick[id].push(mesh);return mesh}
const box=(id,w,h,d,color,x,y,z,o)=>add(id,new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(color,o)),x,y+h/2,z);
const cyl=(id,rt,rb,h,color,x,y,z,o,seg=28)=>add(id,new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),M(color,o)),x,y+h/2,z);
const POS={stores:[-30,-13],upstream:[-19,-2],tanks:[-4,-2],qa:[-4,11],bottling:[11,-2],packing:[24,-2],dispatch:[38,-2]};
const SIZE={stores:[11,7],upstream:[14,10],tanks:[13,9],qa:[9,7],bottling:[11,9],packing:[10,9],dispatch:[12,11]};
const plates={},lamps={};
for(const s of STAGES){const [x,z]=POS[s.id],[w,d]=SIZE[s.id];
 const plate=new THREE.Mesh(new THREE.BoxGeometry(w,.3,d),new THREE.MeshStandardMaterial({color:0x40514e,emissive:0x5a6678,emissiveIntensity:.25,roughness:.8}));plate.position.set(x,.15,z);plate.receiveShadow=true;scene.add(plate);plates[s.id]=plate;pick[s.id].push(plate);
 const post=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2.6,10),M(0x3a4660));post.position.set(x+w/2-.8,1.6,z+d/2-.8);scene.add(post);
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.5,16,12),new THREE.MeshStandardMaterial({color:0x222222,emissive:0x5a6678,emissiveIntensity:1.2}));lamp.position.set(x+w/2-.8,3.2,z+d/2-.8);scene.add(lamp);lamps[s.id]=lamp;pick[s.id].push(lamp);}
const STEEL=0xc3cecb,COPPER=0xb97c49,WALL=0x819491,ROOF=0x455f60;

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
 const liq=cyl('tanks',1.22,1.22,5,0xd6efe6,tx,.3,z,{emissive:0x335a50,emissiveIntensity:.6,transparent:true,opacity:.92});liq.geometry.translate(0,2.5,0);liq.position.y=.3;liq.scale.y=.01;tankLiquid.push(liq)}}
// quality lab
{const [x,z]=POS.qa;box('qa',6,3,4,0x2d5a78,x,.3,z);box('qa',6.3,.3,4.3,ROOF,x,3.3,z);box('qa',3.4,1.2,.15,0x9fd0ee,x,1.5,z+2.05,{emissive:0x4a90b8,emissiveIntensity:.5});for(let i=0;i<3;i++)cyl('qa',.25,.25,.9,0xe8f1f8,x-1.8+i*.7,3.6,z,{transparent:true,opacity:.7})}
// bottling line
const bottles=[];{const [x,z]=POS.bottling;box('bottling',9,.45,1.1,0x627571,x,.3,z+2.2);box('bottling',2.6,3.6,2.6,0x82938d,x-1,.3,z-.6);box('bottling',2.9,.35,2.9,ROOF,x-1,3.9,z-.6);box('bottling',1.6,2.2,1.6,0x3a4660,x+3.4,.3,z-.8);
 for(let i=0;i<14;i++){const b=cyl('bottling',.22,.26,.9,0xcfe6e0,x,0,z,{transparent:true,opacity:.9},10);b.userData.ph=i/14;bottles.push(b)}}
// packing line
const cases=[];{const [x,z]=POS.packing;box('packing',8,.45,1.1,0x627571,x,.3,z+2.2);box('packing',2.4,2.8,2.4,0x6a7f58,x-1.8,.3,z-.6);box('packing',2.4,.3,2.6,ROOF,x-1.8,3.1,z-.6);
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
 scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(v),new THREE.LineBasicMaterial({color:0x648079})));
 const n=Math.max(3,Math.round(p.len/2.2));for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0xc8a351}));m.userData={path:p,ph:i/n};scene.add(m);particles.push(m)}}
function along(p,t){let d=t*p.len;for(let i=0;i<p.seg.length;i++){if(d<=p.seg[i])return new THREE.Vector3().lerpVectors(p.v[i],p.v[i+1],d/p.seg[i]);d-=p.seg[i]}return p.v[p.v.length-1].clone()}
// bottleneck marker + selection ring
const ring=new THREE.Mesh(new THREE.TorusGeometry(6,.045,10,96),new THREE.MeshBasicMaterial({color:0xc88755}));ring.rotation.x=Math.PI/2;ring.visible=false;scene.add(ring);
const beacon=new THREE.Mesh(new THREE.ConeGeometry(1.1,2.4,4),new THREE.MeshStandardMaterial({color:0xc88755,emissive:0xc88755,emissiveIntensity:1.2}));beacon.rotation.x=Math.PI;beacon.visible=false;scene.add(beacon);
const selRing=new THREE.Mesh(new THREE.TorusGeometry(6,.035,8,96),new THREE.MeshBasicMaterial({color:0xc8a351}));selRing.rotation.x=Math.PI/2;selRing.visible=false;scene.add(selRing);

/* Plant furniture is illustrative, never a surveyed layout. */
function pipe(points,r=.15,color=0xb0bab3){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.05);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,40,r,8,false),M(color,{metalness:.7,roughness:.35}));scene.add(mesh);return mesh;}
pipe([[-12,2,-2],[-11,2,-2],[-11,4,-2],[-7,4,-2]],.18,0xb98a58);
pipe([[2,1.2,-2],[4,1.2,-2],[4,3,-2],[9,3,-2]],.16);
for(const [tx,tz]of [[-9,-2],[-6,-2],[-3,-2],[0,-2]]){for(const dz of [-1,1])cyl('tanks',.08,.08,.8,0x7b8983,tx,.3,tz+dz);cyl('tanks',1.42,1.42,.15,0x9baaa0,tx,5.5,tz,{metalness:.8});}
for(let x=-39;x<48;x+=3){box(null,1.5,.02,.1,0xb0a16b,x,.02,6.6);box(null,1.5,.02,.1,0xb0a16b,x,.02,-9)}
for(const id of ['upstream','bottling','packing']){const[x,z]=POS[id];for(const dx of [-4,4]){cyl(id,.05,.05,1.1,0xd4b76d,x+dx,.3,z+4);box(id,.6,.05,.05,0xd4b76d,x+dx,1.3,z+4)}box(id,1.1,1.7,.65,0xd6dcd0,x-4,.3,z-3.7);box(id,.65,.5,.05,0x183d42,x-4,1.2,z-3.33,{emissive:0x297c70,emissiveIntensity:.5});}
const logo=new THREE.TextureLoader().load('assets/egoli-logo.jpeg');logo.colorSpace=THREE.SRGBColorSpace;
const sign=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshStandardMaterial({map:logo,roughness:.8}));sign.position.set(36,3.7,.25);scene.add(sign);
// Equipment detail: condenser coils, conveyor guides, filler gantry and service access.
for(const dz of [-2.4,2.4]){
 for(let i=0;i<8;i++){const coil=new THREE.Mesh(new THREE.TorusGeometry(.82,.055,8,32),M(0xb78957,{metalness:.8,roughness:.28}));coil.rotation.x=Math.PI/2;coil.position.set(-12.8,.65+i*.35,-2+dz);scene.add(coil);}
 for(const dx of [-.6,.6])cyl('upstream',.055,.055,3.3,0xa8b7ad,-23.7+dx,.4,-4.9);
}
for(let i=0;i<8;i++){const rung=box('upstream',1.3,.05,.05,0x99a9a0,-23.7,.6+i*.4,-4.9);}
for(const id of ['bottling','packing']){const[x,z]=POS[id];
 for(const offset of [-.65,.65]){pipe([[x-4,.95,z+2.2+offset],[x+4,.95,z+2.2+offset]],.045,0xc4cbbf);}
 for(let i=0;i<14;i++){const roller=cyl(id,.065,.065,1.1,0x99ada4,x-3.9+i*.6,.9,z+2.2);roller.rotation.x=Math.PI/2;roller.position.y=.9;}
 for(const dx of [-3.5,0,3.5]){box(id,.15,.65,.9,0x526b65,x+dx,.15,z+2.2);}
}
for(const dx of [-2,1])cyl('bottling',.10,.10,2.6,0xc6d2c4,11+dx,.5,.2);
box('bottling',3.2,.2,.8,0x8ca598,10.5,3,.2);
for(let i=0;i<5;i++)cyl('bottling',.04,.04,.65,0xc1cabd,9.4+i*.55,2.35,.2);
for(const b of bottles){const neck=new THREE.Mesh(new THREE.CylinderGeometry(.10,.12,.28,10),M(0x49795e));neck.position.y=.56;b.add(neck);const label=new THREE.Mesh(new THREE.CylinderGeometry(.265,.265,.37,10),M(0xf0eee2));label.position.y=-.08;b.add(label);}
for(const id of ['stores','dispatch']){const[x,z]=POS[id];const w=id==='stores'?9:10,front=id==='stores'?z+1.95:z+.18;
 for(let i=0;i<12;i++)box(id,.035,3.5,.025,0xa1b1a3,x-w/2+.4+i*(w-.8)/12,.7,front);
 for(const dx of [-2.9,-.8])box(id,1.4,.85,.035,0x2e5359,x+dx,2.6,front+.08,{metalness:.65,roughness:.2});
}
const labels={};for(const s of STAGES){const el=document.createElement('div');el.className='label';$('#labels').append(el);labels[s.id]=el;}
let labelsVisible=true,userMoved=false,cameraMode='iso';
function select(id,fly=true){selected=id;if(fly&&controls){const[x,z]=POS[id];if(reduced){controls.target.set(x,0,z)}else focus=new THREE.Vector3(x,0,z)}ui(true)}
if(renderer){const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;const targets=Object.entries(pick).flatMap(([id,ms])=>ms.map(m=>(m.userData.stage=id,m)));
 canvas.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(targets,false)[0];if(hit)select(hit.object.userData.stage)});
 controls.addEventListener('start',()=>{userMoved=true;focus=null});}
function kpis(){const m=metrics(sim),bn=sim.bottleneck?STAGES.find(s=>s.id===sim.bottleneck).short:sim.t<48?'Observing':'None flagged';const windowNote=sim.t<168?'Partial window · since run start':'Rolling 7 calendar days';
 $('#kpis').innerHTML=`<div class="kpi ${sim.bottleneck?'alert':''}"><small>CONSTRAINT CANDIDATE</small><strong>${esc(bn)}</strong><span>${sim.t<48?'Needs two simulated days of flow':'Queue-pressure heuristic'}</span></div><div class="kpi ${m.otif!==null&&m.otif<.9?'bad':'good'}"><small>ON TIME · IN FULL</small><strong>${m.otif===null?'—':Math.round(m.otif*100)+'%'}</strong><span>${m.dueCount} orders due in 7-day cohort</span></div><div class="kpi"><small>SHIPPED · 7 DAYS</small><strong>${n0(m.dispatched7)}</strong><span>${windowNote} · BE</span></div><div class="kpi ${m.overdue?'bad':''}"><small>OPEN ORDER BACKLOG</small><strong>${n0(m.backlog)}</strong><span>${n0(m.overdue)} BE overdue</span></div><div class="kpi ${m.held?'bad':''}"><small>QUALITY QUARANTINE</small><strong>${n0(m.held)}</strong><span>BE awaiting disposition</span></div><div class="kpi"><small>HOLDING OCCUPANCY</small><strong>${Math.round(m.occupancy/sim.cfg.tankCap*100)}%</strong><span>${n0(m.occupancy)} / ${n0(sim.cfg.tankCap)} BE</span></div>`;
 const ok=Math.abs(m.balance)<1e-6&&Math.abs(m.kitBalance)<1e-6;
 $('#balance').innerHTML=`<div class="balance-ok" style="${ok?'':'color:var(--down)'}">${ok?'✓ Material balances reconcile':'⚠ Material balance discrepancy'}</div>${[['Opening bulk + goods',sim.opening.liquid],['Produced since reset',sim.totals.produced],['Current bulk + WIP + FG',occupancy(sim)+sim.filled+sim.fg],['Shipped since reset',sim.totals.shipped],['Rejected / scrapped',sim.totals.rejected],['Liquid balance residual',m.balance],['Kit balance residual',m.kitBalance]].map(([a,b])=>`<div class="balance-row"><span>${a}</span><b>${Math.abs(b)<1e-6?'0':n0(b)} BE</b></div>`).join('')}`;
}
function stagesList(){const q=queues(sim);$('#stages').innerHTML=STAGES.map(s=>{const st=sim.st[s.id],qq=q[s.id],util=Math.round(Math.max(0,Math.min(1,st.util))*100);return`<button class="stage-row ${st.status} ${sim.bottleneck===s.id?'bn':''} ${selected===s.id?'sel':''}" data-stage="${s.id}" aria-pressed="${selected===s.id}"><i></i><span><b>${esc(s.name)}</b><small>${esc(STATUS_TEXT[st.status])}${qq?' · '+n0(qq.qty)+' BE queued':''}</small></span><span><em>${s.id==='stores'?'cover':s.id==='tanks'?'fill':'busy'} ${util}%</em><div class="meter"><span style="width:${util}%"></span></div></span></button>`}).join('')}
$('#stages').addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(b)select(b.dataset.stage)});
const reason={bottling:'Released bulk is waiting relative to modelled filling capacity. Check downtime, kits and downstream space before treating the filler as the root cause.',qa:'Eligible unheld lots are accumulating relative to scheduled release windows. Quarantined lots are tracked separately and require disposition.',packing:'Filled units are accumulating before packing. Check labelling availability and finished-goods space.',dispatch:'Finished goods are accumulating relative to loading capacity. Confirm customer demand and due dates before adding trucks.',upstream:'High upstream productive share coincides with backlog and no dominant downstream queue. This is a hypothesis, not a proven bottleneck.',stores:'Kits are depleted while released bulk and customer orders remain. Replenishment is restricting the flow.'};
function detail(){const s=STAGES.find(x=>x.id===selected),st=sim.st[selected],total=Object.values(st.time).reduce((a,b)=>a+b,0);const colours={running:'#3d9779',starved:'#5986a5',blocked:'#c29845',down:'#bf6656',off:'#b6c0b6'};
 $('#detail').innerHTML=`<p class="eyebrow">SELECTED AREA</p><h3>${esc(s.name)}</h3><div class="own">${esc(s.owner)} · proposed role<br>${esc(STATUS_TEXT[st.status])}${st.cause?' — '+esc(st.cause):''}</div>${sim.bottleneck===selected?`<div class="lbl">Why investigate this stage?</div><p class="why">${reason[selected]}</p>`:''}<div class="lbl">Observed simulation time · since reset</div><div class="state-strip">${Object.entries(st.time).map(([k,v])=>`<span style="width:${total?v/total*100:0}%;background:${colours[k]}"></span>`).join('')}</div><div class="time-key">${Object.entries(st.time).filter(([,v])=>v>0).map(([k,v])=>`<span>${STATUS_TEXT[k]} ${v.toFixed(1)}h</span>`).join('')}</div><div class="lbl">What to measure on the real plant</div><ul>${s.measure.map(m=>`<li>${esc(m)}</li>`).join('')}</ul><div class="lbl">Proposed data source · not connected</div><p>${esc(s.source)}</p>`;}
function chart(){const h=sim.hist.slice(-14);if(!h.length){$('#chart').innerHTML='<div class="empty">No complete day yet. Advance the simulation to build an output history.</div>';return;}const W=500,H=175,pl=42,pb=28,pt=12,max=Math.max(...h.flatMap(x=>[x.dispatched,x.demand]),1000)*1.1,bw=(W-pl-8)/h.length,y=v=>H-pb-v/max*(H-pb-pt);
 const bars=h.map((x,i)=>`<rect x="${pl+i*bw+bw*.25}" y="${y(x.dispatched)}" width="${bw*.5}" height="${H-pb-y(x.dispatched)}" fill="#bd9a60" rx="2"/>`).join('');const pts=h.map((x,i)=>`${pl+i*bw+bw/2},${y(x.demand)}`).join(' ');
 const grid=[0,.5,1].map(t=>`<line x1="${pl}" x2="${W-8}" y1="${y(max*t/1.1)}" y2="${y(max*t/1.1)}" stroke="#e4e8df"/><text x="${pl-6}" y="${y(max*t/1.1)+3}" text-anchor="end">${n0(max*t/1.1)}</text>`).join('');
 $('#chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Orders and shipments by completed simulation day">${grid}${bars}<polyline points="${pts}" fill="none" stroke="#547c80" stroke-width="2"/>${h.map((d,i)=>i%2?'':`<text x="${pl+i*bw+bw/2}" y="${H-6}" text-anchor="middle">D${d.day+1}</text>`).join('')}</svg><p class="note">■ Gold: shipped &nbsp; ━ Teal: new orders · opening orders excluded</p>`;}
function orderTable(){const list=[...sim.orders].sort((a,b)=>a.due-b.due).slice(0,8);$('#orders').innerHTML=list.length?`<div class="table-scroll"><table><thead><tr><th>Order</th><th>Original BE</th><th>Remaining BE</th><th>Due</th><th>Status</th></tr></thead><tbody>${list.map(o=>`<tr><td>SO-${String(o.id+2).padStart(4,'0')}</td><td>${n0(o.qty)}</td><td>${n0(o.left)}</td><td>${clock(o.due).text}</td><td class="${o.due<sim.t?'late':''}">${o.due<sim.t?'Overdue '+Math.round(sim.t-o.due)+'h':o.left<o.qty?'Part shipped':'Open'}</td></tr>`).join('')}</tbody></table></div><p class="note">${sim.orders.length} open orders · ${sim.done.length} completed · ${n0(sim.lost)} BE cancelled after assumed grace period</p>`:'<p class="empty">No open customer orders.</p>';}
function batches(){const lots=[...sim.lots].sort((a,b)=>(b.state==='hold')-(a.state==='hold')||a.t0-b.t0);$('#batches').innerHTML=lots.length?lots.slice(0,8).map(l=>`<div class="batch"><div class="batch-head"><b>${l.id} · ${n0(l.qty)} BE</b><span class="status-chip ${l.state==='hold'?'hold':''}">${l.state==='hold'?'QUARANTINE':sim.t-l.t0>=sim.cfg.dwell?'READY FOR QA':'DWELL'}</span></div><small>Age ${Math.max(0,sim.t-l.t0).toFixed(1)}h · ${l.state==='hold'?(sim.t<l.holdUntil?'Review in '+(l.holdUntil-sim.t).toFixed(1)+'h':'Review eligible; decision required'):'Required dwell '+sim.cfg.dwell+'h'}</small>${l.state==='hold'?`<div class="batch-actions"><button class="btn" data-lot="${l.id}" data-action="release" ${sim.t<l.holdUntil?'disabled':''}>Simulate release</button><button class="btn" data-lot="${l.id}" data-action="reject" ${sim.t<l.holdUntil?'disabled':''}>Simulate reject</button></div>`:''}</div>`).join('')+`<p class="note">${lots.length} queued batches · ${n0(sim.released)} BE released bulk. Dispositions affect this simulation only.</p>`:'<p class="empty">No batches awaiting release.</p>';}
$('#batches').addEventListener('click',e=>{const b=e.target.closest('[data-lot]');if(!b)return;disposition(sim,b.dataset.lot,b.dataset.action);ui(true)});
function levers(){$('#levers').innerHTML=LEVERS.map(l=>`<button class="lever" data-lever="${l.id}" aria-pressed="${!!on[l.id]}"><span>${l.label}<small>${l.id==='bottling'?`${n0(baseConfig.bottlingRate)} → ${n0(baseConfig.bottlingRate*1.6)} BE/h`:l.detail}</small></span><span class="tag">${on[l.id]?'ON':'OFF'}</span></button>`).join('');}
$('#levers').addEventListener('click',e=>{const b=e.target.closest('[data-lever]');if(!b)return;on[b.dataset.lever]=!on[b.dataset.lever];sim.cfg=configured();sim.decisions.push({t:sim.t,lever:b.dataset.lever,on:on[b.dataset.lever]});levers();$('#comparison').innerHTML='<p class="stale-note">Inputs changed. Run a new comparison.</p>';ui(true)});
$('#disrupt').innerHTML=[['still','Still breakdown','Six-hour availability loss'],['labels','Label shortage','Packing stopped for 24 hours'],['rush','Rush order','3,000 BE due in 24 hours'],['kits','Kit write-off','85% removed, recorded in the material ledger']].map(([k,t,d])=>`<button class="lever disrupt" data-inject="${k}"><span>${t}<small>${d}</small></span><span class="tag">INJECT</span></button>`).join('');
$('#disrupt').addEventListener('click',e=>{const b=e.target.closest('[data-inject]');if(b){inject(sim,b.dataset.inject);ui(true)}});
$('#compare').addEventListener('click',()=>{const r=compare(7,baseConfig,configured(),14),a=r.baseline,b=r.scenario;const rows=[['Shipped · full 14 days',a.shipped,b.shipped],['Open backlog · end',a.backlog,b.backlog],['Quarantined BE · end',a.held,b.held],['Rejected BE · full run',a.rejected,b.rejected],['OTIF · final 7-day due cohort',a.otif===null?'—':Math.round(a.otif*100)+'%',b.otif===null?'—':Math.round(b.otif*100)+'%']];$('#comparison').innerHTML=`<table class="comparison-table"><thead><tr><th>Measure</th><th>Baseline</th><th>Selected</th></tr></thead><tbody>${rows.map(([k,a,b])=>`<tr><td>${k}</td><td>${typeof a==='number'?n0(a):a}</td><td>${typeof b==='number'?n0(b):b}</td></tr>`).join('')}</tbody></table><div class="comparison-delta"><b>${b.shipped-a.shipped>=0?'+':''}${n0(b.shipped-a.shipped)} BE shipped</b> versus baseline. Same seed and start, 14 calendar days. Current-run disruptions and QA decisions are excluded.</div>`;});
function logPanel(){$('#log').innerHTML=sim.log.slice(0,14).map(e=>`<li class="${e.type}"><time>${clock(e.t).text}</time><span>${esc(e.text)}</span></li>`).join('')||'<li>No events yet.</li>'}
let uiClock=0;function ui(force=false){if(!force&&performance.now()-uiClock<750)return;uiClock=performance.now();$('#clock').textContent=clock(sim.t).text;kpis();if(!$('#operations').hidden){stagesList();detail();batches();logPanel()}chart();orderTable();}
$$('[data-panel]').forEach(b=>b.addEventListener('click',()=>{$$('[data-panel]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));$$('.inspector-panel').forEach(p=>p.hidden=p.id!==b.dataset.panel);ui(true)}));
const fields=[['upstreamRate','Upstream BE/h',0,10000],['bottlingRate','Filler BE/h',0,10000],['packRate','Packing BE/h',0,10000],['tankCap','Tank capacity BE',100,100000],['lotSize','Lot size BE',100,10000],['dwell','Dwell hours',.25,168],['truckCap','BE per truck',0,20000],['demandMean','Orders BE/day',0,30000],['bottleRejectRate','Reject fraction',0,1],['qaHoldProb','Hold probability',0,1]];
$('#config-fields').innerHTML=fields.map(([k,l,min,max])=>`<div class="config-field"><label for="cfg-${k}">${l}</label><input id="cfg-${k}" name="${k}" type="number" value="${baseConfig[k]}" min="${min}" max="${max}" step="any" required></div>`).join('');
$('#config').addEventListener('submit',e=>{e.preventDefault();try{const next={...baseConfig};for(const[k]of fields)next[k]=Number($('#cfg-'+k).value);validate(next);baseConfig=structuredClone(next);on={};playing=false;boot();levers();playLabel();$('#comparison').innerHTML='';$('#config-error').textContent='';ui(true)}catch(err){$('#config-error').textContent=err.message}});
function playLabel(){$('#play').textContent=playing?'Ⅱ Pause simulation':'▶ Run simulation';$('#play').setAttribute('aria-pressed',String(playing));$('#run-state').textContent=playing?'Running · '+SPEEDS[speedIdx]+' simulated hours / second':'Paused · inspect or intervene';}
$('#play').addEventListener('click',()=>{playing=!playing;playLabel();ui(true)});$$('[data-speed]').forEach(b=>b.addEventListener('click',()=>{speedIdx=Number(b.dataset.speed);$$('[data-speed]').forEach(x=>x.classList.toggle('on',x===b));playLabel()}));
$('#advance').addEventListener('click',()=>{playing=false;for(let i=0;i<32;i++)step(sim);playLabel();ui(true)});
$('#reset').addEventListener('click',()=>{playing=false;on={};boot();truckQueue.length=0;truckAnim=null;truck.visible=false;levers();playLabel();$('#comparison').innerHTML='';ui(true)});
$('#export').addEventListener('click',()=>{const result={modelVersion:'2.0',evidence:'Synthetic scenario; not measured Egoli data',seed:7,simulatedHours:sim.t,config:sim.cfg,totals:sim.totals,opening:sim.opening,metrics:metrics(sim),lots:sim.lots,openOrders:sim.orders,completedOrders:sim.done,decisions:sim.decisions,journal:sim.log};const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='egoli-twin-run.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
function fitCamera(mode=cameraMode){if(!controls)return;cameraMode=mode;controls.target.set(3,9,-1);const r=canvas.parentElement.getBoundingClientRect();const hf=2*Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*(r.width/r.height));const distance=Math.max(65,51/Math.tan(hf/2));scene.fog.near=distance+20;scene.fog.far=distance+180;const direction=mode==='top'?new THREE.Vector3(0,1,.01):new THREE.Vector3(.18,.8,1);camera.position.copy(controls.target).addScaledVector(direction.normalize(),distance);controls.update();focus=null;}
$$('[data-camera]').forEach(b=>b.addEventListener('click',()=>{userMoved=true;fitCamera(b.dataset.camera)}));$('#toggle-labels').addEventListener('click',()=>{labelsVisible=!labelsVisible;$('#labels').hidden=!labelsVisible;$('#toggle-labels').setAttribute('aria-pressed',String(labelsVisible))});
function resize(){if(!renderer)return;const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();fitCamera()}
new ResizeObserver(resize).observe($('#stage'));resize();
const v3=new THREE.Vector3();let last=performance.now(),acc=0,phase=0;
let firstFrame=true;function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;if(document.hidden&&!firstFrame)return;firstFrame=false;
 if(playing){acc+=dt*SPEEDS[speedIdx];while(acc>=.25){step(sim);acc-=.25;}if(sim.t>=24*90){playing=false;playLabel();} }
 const motion=playing&&!reduced?dt:0;phase+=motion;
 while(sim.events.length){const e=sim.events.shift();if(truckQueue.length<3)truckQueue.push(e)}
 if(!reduced&&playing&&!truckAnim&&truckQueue.length){truckQueue.shift();truckAnim={t:0};truck.visible=true;}
 if(truckAnim){truckAnim.t+=motion;const T=truckAnim.t,[dx,dz]=POS.dispatch;truck.position.set(T<2?THREE.MathUtils.lerp(dx+22,dx+3,T/2):T<3.8?dx+3:THREE.MathUtils.lerp(dx+3,dx+22,Math.min(1,(T-3.8)/2)),0,dz+6.4);if(T>5.8){truck.visible=false;truckAnim=null}}
 const st=sim.st;
 for(const s of STAGES){const k=st[s.id].status;plates[s.id].material.emissive.setHex(COL[k]);plates[s.id].material.emissiveIntensity=.10;lamps[s.id].material.emissive.setHex(COL[k]);lamps[s.id].material.emissiveIntensity=k==='down'?1.2+Math.sin(phase*3)*.3:1.1;}
 let occ=occupancy(sim),cap=sim.cfg.tankCap/4;tankLiquid.forEach(l=>{const f=Math.min(1,Math.max(0,occ/cap));occ-=cap;l.scale.y=reduced?Math.max(.01,f):THREE.MathUtils.lerp(l.scale.y,Math.max(.01,f),Math.min(1,dt*4));});
 kitBoxes.forEach((b,i)=>b.visible=i<Math.ceil(Math.min(1,sim.kits/9000)*24));pallets.forEach((b,i)=>b.visible=i<Math.ceil(Math.min(1,sim.fg/sim.cfg.fgCap)*40));
 const run=id=>st[id].status==='running';bottles.forEach(b=>{if(run('bottling'))b.userData.ph=(b.userData.ph+motion*.3)%1;const[x,z]=POS.bottling;b.position.set(x-4.2+b.userData.ph*8.4,1.15,z+2.2)});cases.forEach(b=>{if(run('packing'))b.userData.ph=(b.userData.ph+motion*.2)%1;const[x,z]=POS.packing;b.position.set(x-3.6+b.userData.ph*7.2,1.1,z+2.2)});
 for(const m of particles){const p=m.userData.path;const flowing=run(p.stage);if(flowing)m.userData.ph=(m.userData.ph+motion*.22)%1;m.visible=flowing;m.position.copy(along(p,m.userData.ph));}
 if(sim.bottleneck){const[x,z]=POS[sim.bottleneck],[w,d]=SIZE[sim.bottleneck];ring.visible=true;beacon.visible=false;const rr=Math.max(w,d)*.6;ring.scale.set(rr/6,rr/6,1);ring.position.set(x,.45,z);}else ring.visible=beacon.visible=false;
 {const[x,z]=POS[selected],[w,d]=SIZE[selected],rr=Math.max(w,d)*.67;selRing.visible=true;selRing.scale.set(rr/6,rr/6,1);selRing.position.set(x,.4,z);}
 if(focus&&controls){controls.target.lerp(focus,.08);if(controls.target.distanceTo(focus)<.2)focus=null;}
 if(renderer){controls.update();renderer.render(scene,camera);const r=canvas.getBoundingClientRect();for(const s of STAGES){const[x,z]=POS[s.id];v3.set(x,7.5,z).project(camera);const el=labels[s.id],k=st[s.id];el.className=`label ${k.status} ${sim.bottleneck===s.id?'bn':''} ${selected===s.id?'sel':''}`;el.style.left=((v3.x*.5+.5)*r.width)+'px';el.style.top=((-v3.y*.5+.5)*r.height)+'px';el.style.display=v3.z<1&&v3.x>-1&&v3.x<1?'block':'none';const html=`<b>${esc(s.short)}</b><span>${esc(STATUS_TEXT[k.status])}</span>`;if(el.innerHTML!==html)el.innerHTML=html;}}
 ui();}
levers();playLabel();ui(true);frame(performance.now());
