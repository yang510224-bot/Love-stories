'use strict';
const fs = require('node:fs');
const { setTimeout: pause } = require('node:timers/promises');
const payload = Object.freeze({
  model: 'mureka-9.5', n: 1, gender: 'male',
  lyrics: '[Verse]\n紫色風箏飛過蘑菇城\n紙做的河馬慢慢轉身\n雲朵把帽子借給清晨\n我們跟著節拍拍拍手\n[Chorus]\n啦啦啦 今天去旅行\n彩色的夢 輕輕唱給你聽\n啦啦啦 跟著風前進\n一步一步 踩出新的風景',
  prompt: 'Mandarin Chinese male solo singing, natural warm adult baritone, clear intelligible Chinese diction, melodic acoustic pop, steady 88 BPM, 4/4, simple guitar accompaniment, short verse and chorus, distinctly sung sustained pitches, no spoken narration, no rap, no artist imitation.'
});
async function run({env=process.env, request=fetch, log=console.log, sleep=pause, claim=()=>fs.closeSync(fs.openSync('/tmp/mureka-smoke-20261020.lock','wx'))}={}) {
  const emit = data => log(JSON.stringify({event:'music_smoke_v1',...data}));
  if(env.MUREKA_SMOKE_RUN !== 'test-20261020-a') return;
  const deadline = Number(env.MUREKA_SMOKE_DEADLINE);
  if(!Number.isFinite(deadline)||Date.now()>deadline||!env.MUREKA_API_KEY) {emit({state:'disabled'});return;}
  const headers={Authorization:'Bearer '+env.MUREKA_API_KEY,'Content-Type':'application/json'};
  const call=async(path,body)=>{
    const r=await request('https://api.mureka.ai'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(30000)});
    if(!r.ok) throw new Error('HTTP_'+r.status);
    return r.json();
  };
  try {
    try{claim();}catch{emit({state:'already_attempted'});return;}
    const before=await call('/v1/account/billing');
    // Only the verified untouched $10 balance may start this one-song run.
    // No retries of POST, even after timeout; no stems or cloning in this test.
    if(before.balance!==1000){emit({state:'balance_guard',balance:before.balance});return;}
    emit({state:'starting',maxSongs:1,expectedCostUSD:0.15});
    const task=await call('/v1/song/generate',payload);
    if(typeof task.id!=='string'||!task.id.match(/^[\w-]+$/)) throw new Error('INVALID_TASK');
    emit({state:'submitted',taskId:task.id});
    for(let i=0;i<60;i++){
      await sleep(10000);
      const status=await call('/v1/song/query/'+encodeURIComponent(task.id));
      if(status.status==='succeeded'){
        const songs=(status.choices||[]).map(s=>({id:s.id,url:s.url,wav_url:s.wav_url,duration:s.duration}));
        emit({state:'succeeded',taskId:task.id,songs});
        const after=await call('/v1/account/billing');
        emit({state:'billing_after',balance:after.balance});
        return;
      }
      if(['failed','timeouted','cancelled'].includes(status.status)){emit({state:status.status,taskId:task.id});return;}
    }
    emit({state:'polling_timeout',taskId:task.id});
  }catch(e){emit({state:'stopped',reason:/^HTTP_\d+$/.test(e.message)?e.message:'request_failed'});}
}
module.exports={run,payload};
