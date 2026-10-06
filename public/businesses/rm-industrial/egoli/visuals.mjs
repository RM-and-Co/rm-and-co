import {calculate} from './model.mjs';
const fmt=n=>n==null?'Unconfirmed':Math.floor(n).toLocaleString('en-ZA');
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let counterFrame;
export function animateFigures(el,oldValue,value){cancelAnimationFrame(counterFrame);if(!el||value==null||oldValue===''||oldValue==null||reduced())return;const from=Number(oldValue);if(!Number.isFinite(from))return;const start=performance.now();function tick(now){const t=Math.min(1,(now-start)/650);el.textContent=fmt(from+(value-from)*(1-Math.pow(1-t,3)));if(t<1)counterFrame=requestAnimationFrame(tick)}counterFrame=requestAnimationFrame(tick)}
export function renderVisuals(x,r){
 const flow=document.getElementById('system-flow');
 const ids=['production','tank','quality','bottling','packaging','dispatch'];
 const names=['Production','Holding','Quality','Bottling','Packaging','Dispatch'];
 const nodes=ids.map(id=>r.stages.find(s=>s.id===id));
 const limitIds=r.limits.map(s=>s.id);
 flow.innerHTML=`<div class="flow-ribbon" role="list">${nodes.map((s,i)=>`<div role="listitem" class="ribbon-stage ${limitIds.includes(s.id)?'is-limit':''}"><div class="stage-symbol" aria-hidden="true">${i===0?'◉':i===1?'▤':i===2?'✓':i===3?'▥':i===4?'▣':'↗'}</div><span>${names[i]}</span><strong>${r.errors.length?'—':fmt(s.value)}</strong><small>${limitIds.includes(s.id)?'SYSTEM LIMIT':'bottles / week'}</small>${i<5?'<div class="flow-connector" aria-hidden="true"><i></i><b>›</b></div>':''}</div>`).join('')}</div><div class="flow-dependencies"><span><b>Materials</b> ${r.errors.length?'—':fmt(r.stages.find(s=>s.id==='materials').value)} / week ${limitIds.includes('materials')?'· LIMIT':''}</span><span><b>Working capital</b> ${r.errors.length?'—':fmt(r.stages.find(s=>s.id==='cash').value)} bottle equivalents ${limitIds.includes('cash')?'· LIMIT':''}</span><span><b>Demand</b> ${fmt(x.demand)} / week ${limitIds.includes('demand')?'· LIMIT':''}</span></div>`;
 const host=document.getElementById('response-curve');
 if(!r.complete){host.innerHTML='<div class="empty-curve"><span>—</span>Complete the capacity inputs to reveal the response curve.</div>';return;}
 const width=900,height=265,pad={l:70,r:35,t:25,b:58};
 const maxRate=Math.max(600,(x.fillRate||0)*1.3);const maximum=calculate({...x,fillRate:maxRate}).output;const ymax=Math.max(x.demand,maximum,1)*1.1;
 const sx=v=>pad.l+v/maxRate*(width-pad.l-pad.r),sy=v=>height-pad.b-v/ymax*(height-pad.t-pad.b);
 const points=Array.from({length:81},(_,i)=>{const rate=i/80*maxRate;return[sx(rate),sy(calculate({...x,fillRate:rate}).output)]});
 const path=points.map((p,i)=>(i?'L':'M')+p.map(n=>n.toFixed(2)).join(',')).join(' ');
 const area=path+`L${sx(maxRate)},${sy(0)}L${sx(0)},${sy(0)}Z`;
 const grid=[0,.25,.5,.75,1].map(t=>{const v=ymax*t;return`<line x1="${pad.l}" y1="${sy(v)}" x2="${width-pad.r}" y2="${sy(v)}" stroke="#e5e5df"/><text x="${pad.l-12}" y="${sy(v)+4}" text-anchor="end">${fmt(v)}</text>`}).join('');
 const ticks=[0,.25,.5,.75,1].map(t=>`<text x="${sx(maxRate*t)}" y="${height-pad.b+23}" text-anchor="middle">${fmt(maxRate*t)}</text>`).join('');
 const capWithoutFill=Math.min(x.demand,...r.stages.filter(s=>s.id!=='bottling').map(s=>s.value));
 const knee=x.fillHours>0?capWithoutFill/x.fillHours:null;
 host.innerHTML=`<div class="curve-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Sensitivity of fulfilled sales to bottling speed. Current output ${fmt(r.output)} bottles per week. Maximum with other inputs fixed ${fmt(maximum)}."><defs><linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8a351" stop-opacity=".24"/><stop offset="100%" stop-color="#c8a351" stop-opacity=".02"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#curve-fill)"/><line x1="${pad.l}" y1="${sy(x.demand)}" x2="${width-pad.r}" y2="${sy(x.demand)}" stroke="#8b9299" stroke-dasharray="5 5"/><path class="response-line" d="${path}" fill="none" stroke="#a17d30" stroke-width="3"/><line x1="${sx(x.fillRate)}" y1="${sy(0)}" x2="${sx(x.fillRate)}" y2="${sy(r.output)}" stroke="#0e1d33" stroke-dasharray="3 4"/><circle class="curve-dot" cx="${sx(x.fillRate)}" cy="${sy(r.output)}" r="6" fill="#0e1d33" stroke="white" stroke-width="2"/>${ticks}<text x="${width/2}" y="${height-8}" text-anchor="middle">Bottling rate · good bottles / productive hour</text><text x="${pad.l}" y="13">Fulfilled sales · bottles / week</text><text x="${width-pad.r}" y="${sy(x.demand)-7}" text-anchor="end">Demand</text></svg></div><div class="curve-insight"><span><i></i> Current scenario: <b>${fmt(r.output)} bottles/week</b></span><span>${knee===null?'No productive bottling hours available':`Other limits take over at approximately <b>${Math.ceil(knee).toLocaleString('en-ZA')} bottles/hour</b>`}</span></div>`;
}
