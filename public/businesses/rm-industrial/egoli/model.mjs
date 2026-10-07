export const fields = [
 ['demand','Customer demand','bottles / week','Planning',0],['target','Planning target','bottles / week','Planning',0],['days','Production days','days / week','Planning',0,7],['size','Bottle size','litres / bottle','Planning',0.001],
 ['daily','Effective upstream output','finished-strength L / day','Production',0],['recovery','Downstream recovery','% saleable','Production',0,100],['tank','Usable holding volume','finished-strength litres','Production',0],['dwell','Tank occupancy incl. cleaning','calendar days','Production',0.01],
 ['fillRate','Bottling good-output rate','bottles / productive hour','Finishing',0],['fillHours','Bottling productive hours','hours / week','Finishing',0,168],['packRate','Packaging good-output rate','bottles / productive hour','Finishing',0],['packHours','Packaging productive hours','hours / week','Finishing',0,168],['qaBatches','Accepted batch releases','batches / week','Finishing',0],['qaSize','Saleable bottles per batch','bottles / batch','Finishing',0],
 ['wet','Wet inputs available','saleable bottle equivalents / week','Supply & cash',0],['kits','Complete packaging kits','kits / week','Supply & cash',0],['funds','Revolving production funds','ZAR, net of committed obligations','Supply & cash',0],['cashUnit','Incremental cash per bottle','ZAR / saleable bottle','Supply & cash',0.01],['cashWeeks','Net cash exposure','weeks','Supply & cash',0.01],['dispatch','Dispatch capacity','bottles / week','Supply & cash',0]
];
export const demo={demand:12000,target:12000,days:5,size:.75,daily:1500,recovery:98,tank:9000,dwell:5,fillRate:250,fillHours:32,packRate:350,packHours:32,qaBatches:10,qaSize:1000,wet:12000,kits:12000,funds:2400000,cashUnit:80,cashWeeks:3,dispatch:12000};
export const blank=()=>Object.fromEntries(fields.map(f=>[f[0],null]));
export function calculate(x){
 const errors=fields.filter(([k,,u,g,min,max])=>x[k]!=null&&(!Number.isFinite(x[k])||x[k]<min||(max!=null&&x[k]>max))).map(f=>f[1]);
 const has=(...ks)=>ks.every(k=>typeof x[k]==='number'&&Number.isFinite(x[k]));
 const calc=(ks,fn)=>ks.every(k=>has(k))?fn():null;
 const stages=[
 {id:'production',name:'Upstream production',owner:'Master distiller',value:calc(['daily','days','size','recovery'],()=>x.daily*x.days/x.size*x.recovery/100)},
 {id:'tank',name:'Holding tanks',owner:'Production lead',value:calc(['tank','dwell','size','recovery'],()=>x.tank*7/x.dwell/x.size*x.recovery/100)},
 {id:'bottling',name:'Bottling',owner:'Bottling lead',value:calc(['fillRate','fillHours'],()=>x.fillRate*x.fillHours)},
 {id:'packaging',name:'Label, cap & case',owner:'Packaging lead',value:calc(['packRate','packHours'],()=>x.packRate*x.packHours)},
 {id:'quality',name:'Quality release',owner:'Quality lead',value:calc(['qaBatches','qaSize'],()=>x.qaBatches*x.qaSize)},
 {id:'materials',name:'Materials',owner:'Procurement',value:calc(['wet','kits'],()=>Math.min(x.wet,x.kits))},
 {id:'cash',name:'Working capital',owner:'Finance',value:calc(['funds','cashUnit','cashWeeks'],()=>x.funds/(x.cashUnit*x.cashWeeks))},
 {id:'dispatch',name:'Dispatch',owner:'Logistics',value:has('dispatch')?x.dispatch:null}
 ];
 const complete=!errors.length&&has('demand')&&stages.every(s=>s.value!==null&&Number.isFinite(s.value));
 const supply=complete?Math.min(...stages.map(s=>s.value)):null;
 const output=complete?Math.floor(Math.min(supply,x.demand)):null;
 const limits=complete?[...stages,{id:'demand',name:'Demand',value:x.demand}].filter(s=>Math.abs(s.value-Math.min(supply,x.demand))<.0001):[];
 const need=(ks,fn)=>has('target',...ks)&&!errors.length?fn():null;
 const requirements=[
 ['Bottling hours / week',need(['fillRate'],()=>x.fillRate>0?x.target/x.fillRate:null),x.fillHours],
 ['Packaging hours / week',need(['packRate'],()=>x.packRate>0?x.target/x.packRate:null),x.packHours],
 ['Usable tank litres',need(['size','dwell','recovery'],()=>x.recovery>0?x.target*x.size*x.dwell/(7*x.recovery/100):null),x.tank],
 ['Upstream litres / day',need(['size','days','recovery'],()=>x.days>0&&x.recovery>0?x.target*x.size/(x.days*x.recovery/100):null),x.daily],
 ['Accepted batches / week',need(['qaSize'],()=>x.qaSize>0?Math.ceil(x.target/x.qaSize):null),x.qaBatches],
 ['Production funds (ZAR)',need(['cashUnit','cashWeeks'],()=>x.target*x.cashUnit*x.cashWeeks),x.funds]
 ];
 return {errors,stages,complete,supply,output,limits,requirements};
}

// Constraint ladder: lift each binding stage in turn (treated as unlimited) and record what limits output next.
// Planning aid only: it ignores the cost and feasibility of each lift.
export function ladder(r,demand){
 if(!r.complete)return [];
 const vals=Object.fromEntries(r.stages.map(s=>[s.id,s.value]));const names=Object.fromEntries(r.stages.map(s=>[s.id,s.name]));names.demand='Demand';
 const steps=[];let lifted=[];
 for(let i=0;i<=r.stages.length;i++){
  const supply=Math.min(...Object.values(vals));const out=Math.min(supply,demand);
  const binding=[...Object.entries(vals).filter(([,v])=>Math.abs(v-out)<.0001).map(([id])=>id),...(Math.abs(demand-out)<.0001?['demand']:[])];
  steps.push({output:Math.floor(out),limits:binding.map(id=>({id,name:names[id]})),lifted:[...lifted]});
  if(binding.includes('demand'))break;
  lifted=binding.map(id=>({id,name:names[id]}));binding.forEach(id=>{vals[id]=Infinity});
 }
 return steps;
}
// Bottling pace implied by a daily volume (finished-strength litres) at a given bottle size and shift length.
export function scaleCheck(litresPerDay,size,hours){
 if(!(litresPerDay>0&&size>0&&hours>0))return null;
 const perDay=litresPerDay/size;return {perDay,perHour:perDay/hours};
}
