'use strict';
const fs = require('node:fs');
const {setTimeout: pause} = require('node:timers/promises');
const costs = {'/v1/song/generate':15,'/v1/song/remix':20,'/v1/song/stem':20,'/v1/track/generate':9};
async function run({env=process.env,request=fetch,log=console.log,sleep=pause,claim=id=>fs.closeSync(fs.openSync('/tmp/mureka-job-'+id+'.lock','wx'))}={}) {
 if(!env.MUREKA_PRODUCTION_JOB) return;
 const emit=x=>log(JSON.stringify({event:'music_production_v1',...x}));
 let job;
 try{job=JSON.parse(env.MUREKA_PRODUCTION_JOB);}catch{emit({state:'invalid_config'});return;}
 if(!job||!String(job.id).match(/^[a-z0-9-]{1,60}$/)||!costs[job.path]||!Number.isFinite(job.deadline)||Date.now()>job.deadline||!env.MUREKA_API_KEY){emit({state:'disabled'});return;}
 const emitJob=x=>emit({jobId:job.id,...x});
 const cost=costs[job.path];
 // Fixed original $10 baseline, at most $5 across all tasks, never top up.
 if(!Number.isInteger(job.balance)||job.balance-cost<500||job.balance>985){emitJob({state:'budget_guard'});return;}
 const body=job.body;
 if(!body||typeof body!=='object'){emitJob({state:'invalid_body'});return;}
 if(job.path==='/v1/song/generate'&&(body.model!=='mureka-9.5'||body.n!==1)){emitJob({state:'invalid_model_count'});return;}
 if(job.path==='/v1/song/remix'&&body.n!==1){emitJob({state:'invalid_count'});return;}
 if(job.path==='/v1/song/stem'&&body.model!=='audio-separation-3'){emitJob({state:'invalid_stem_model'});return;}
 const call=async(path,body)=>{
  const r=await request('https://api.mureka.ai'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env.MUREKA_API_KEY,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(body?120000:20000)});
  if(!r.ok)throw Error('HTTP_'+r.status);
  return r.json();
 };
 try{
  try{claim(job.id);}catch{emitJob({state:'already_attempted'});return;}
  const before=await call('/v1/account/billing');
  if(before.balance!==job.balance){emitJob({state:'balance_guard',balance:before.balance});return;}
  emitJob({state:'starting',expectedCents:cost});
  // Deliberately no automatic POST retry: an uncertain response could be charged.
  const task=await call(job.path,body);
  if(job.path==='/v1/song/stem'){
   emitJob({state:'succeeded',zip_url:task.zip_url,expires_at:task.expires_at});
  }else{
   if(typeof task.id!=='string'||!task.id.match(/^[\w-]+$/))throw Error('INVALID_TASK');
   emitJob({state:'submitted',taskId:task.id});
   for(let i=0;i<90;i++){
    await sleep(10000);
    const status=await call('/v1/song/query/'+encodeURIComponent(task.id));
    if(status.status==='succeeded'){
     emitJob({state:'succeeded',taskId:task.id,songs:(status.choices||[]).map(s=>({id:s.id,url:s.url,wav_url:s.wav_url,duration:s.duration}))});
     break;
    }
    if(['failed','timeouted','cancelled'].includes(status.status)){emitJob({state:status.status,taskId:task.id});break;}
    if(i===89)emitJob({state:'polling_timeout',taskId:task.id});
   }
  }
  const after=await call('/v1/account/billing');emitJob({state:'billing_after',balance:after.balance});
 }catch(e){emitJob({state:'stopped',reason:/^HTTP_\d+$/.test(e.message)?e.message:'request_failed'});}
}
module.exports={run};
