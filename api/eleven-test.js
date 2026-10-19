'use strict';
const crypto=require('node:crypto');
let result=null;
let started=false;
function config(raw=process.env.ELEVEN_VOICE_TEST) {
  try {
    const j=JSON.parse(raw||'null');
    if(!j || !/^[a-z0-9-]{8,64}$/.test(j.id) || !/^[a-f0-9]{64}$/.test(j.token) || !Number.isFinite(j.deadline) || j.deadline<Date.now() || j.deadline>Date.now()+3600000 || j.expectedUsed!==0 || typeof j.audio!=='string' || j.audio.length>85000) return null;
    const data=Buffer.from(j.audio,'base64');
    if(data.length<1000 || data.length>64000) return null;
    return {...j,data};
  } catch {return null;}
}
async function run({raw=process.env.ELEVEN_VOICE_TEST,key=process.env.ELEVENLABS_API_KEY,request=fetch,log=console.log}={}) {
  const j=config(raw);
  if(!j||!key||started)return;
  started=true;
  const report={event:'eleven_voice_test_v1',id:j.id};
  try {
    const quota=await request('https://api.elevenlabs.io/v1/user/subscription',{headers:{'xi-api-key':key},redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!quota.ok){report.error='quota_auth_failed';report.status=quota.status;return;}
    const q=await quota.json();
    if(q.character_count!==j.expectedUsed || q.character_limit-q.character_count<1000 || q.max_credit_limit_extension!==0){report.error='quota_guard';return;}
    const form=new FormData();
    form.append('audio',new Blob([j.data],{type:'audio/mpeg'}),'test.mp3');
    form.append('model_id','eleven_multilingual_sts_v2');
    form.append('remove_background_noise','false');
    const response=await request('https://api.elevenlabs.io/v1/speech-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':key},body:form,redirect:'error',signal:AbortSignal.timeout(120000)});
    report.status=response.status;
    if(!response.ok){
      const error=await response.json().catch(()=>({}));
      if(['missing_permissions','quota_exceeded','invalid_api_key','paid_plan_required'].includes(error.detail?.status))report.reason=error.detail.status;
      return;
    }
    const data=Buffer.from(await response.arrayBuffer());
    if(data.length<1000 || data.length>2000000){report.error='unexpected_audio_size';return;}
    result={data,token:j.token,deadline:j.deadline};
    report.bytes=data.length;report.ready=true;
  }catch{report.error='request_failed_no_retry';}
  finally {log(JSON.stringify(report));}
}
function serve(req,res) {
  if(req.url!=='/internal/voice-test-audio')return false;
  const token=String(req.headers.authorization||'').replace(/^Bearer /,'');
  const valid=result && Date.now()<result.deadline && /^[a-f0-9]{64}$/.test(token) && crypto.timingSafeEqual(Buffer.from(token),Buffer.from(result.token));
  if(req.method!=='GET'||!valid){res.writeHead(404,{'Cache-Control':'no-store'});res.end();return true;}
  res.writeHead(200,{'Content-Type':'audio/mpeg','Content-Length':result.data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(result.data);return true;
}
module.exports={config,run,serve};
