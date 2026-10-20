'use strict';
// Explicit, bounded upload test. Never runs on startup; never retries paid POSTs.
const crypto=require('node:crypto');
const BASE='https://api.voice-swap.ai/v1';
const MODELS=['64bdc17e3377c67e03b57b6f','6495bb25e0925b50b9ca0d8f'];
const HASH='f8ee3f202e5b5eaf61f5a1aeb75a5a46988792356f7d63cfa8cd3aa8c8ee9975';
function create({config=process.env.VOICE_SWAP_TEST,key=process.env.VOICE_SWAP_API_KEY||process.env.Voice_swap_api_key,request=fetch,delay=ms=>new Promise(r=>setTimeout(r,ms)),log=console.log}={}){
 let cfg;try{cfg=JSON.parse(config||'null')}catch{}
 let claimed=false,state={status:'ready',jobs:[]};
 const valid=()=>cfg&&typeof cfg.token==='string'&&cfg.token.length>=32&&Date.now()<Date.parse(cfg.deadline);
 const send=(res,code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 async function api(path,token,options={}){
  const r=await request(BASE+path,{...options,headers:{...options.headers,Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw Error('provider_http_'+r.status);
  return r.json();
 }
 async function run(bytes){
  try{
   state.status='running';
   const auth=await api('/oauth/token',key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({grant_type:'client_credentials',expires_in:1800,refresh_token_expires_in:1800})});
   if(!auth.access_token)throw Error('missing_access_token');
   for(const model of MODELS){
    const job={model,status:'submitting'};state.jobs.push(job);
    const body=new FormData();body.append('upload',new Blob([bytes],{type:'audio/wav'}),'fixed-15s.wav');body.append('model_id',model);body.append('transpose','0');body.append('auto_transpose','false');
    const started=await api('/inference/start',auth.access_token,{method:'POST',body});
    if(!started.success||!started.inference_id)throw Error('missing_inference_id');
    job.id=started.inference_id;job.status=started.status;
    log(JSON.stringify({event:'voiceswap_test_started',model,id:job.id}));
    let complete=false;
    for(let n=0;n<60;n++){
     await delay(10000);
     const progress=await api('/inference/'+encodeURIComponent(job.id)+'/status',auth.access_token);job.status=progress.status;
     if(progress.status==='completed'){complete=true;break;}
     if(!['starting','processing','started','queued'].includes(progress.status))throw Error('unexpected_job_status');
    }
    if(!complete)throw Error('poll_timeout_no_resubmit');
    const result=await api('/inference/'+encodeURIComponent(job.id)+'/result',auth.access_token);
    if(!result.success||!result.result)throw Error('missing_result');
    job.result=result.result;
   }
   state.status='completed';
  }catch(e){state.status='stopped';state.error=/^(provider_http_\d+|missing_\w+|unexpected_job_status|poll_timeout_no_resubmit)$/.test(e.message)?e.message:'request_failed_no_retry';}
  finally{log(JSON.stringify({event:'voiceswap_test_finished',status:state.status,error:state.error,jobs:state.jobs.map(({model,id,status})=>({model,id,status}))}));}
 }
 async function handle(req,res){
  const supplied=Buffer.from(String(req.headers.authorization||'')),expected=Buffer.from('Bearer '+(cfg?.token||''));
  if(!valid()||supplied.length!==expected.length||!crypto.timingSafeEqual(supplied,expected))return send(res,404,{error:'not_found'});
  if(req.method==='GET')return send(res,200,state);
  if(req.method==='DELETE'){state={status:'cleared',jobs:[]};cfg=null;return send(res,200,{cleared:true});}
  if(req.method!=='POST')return send(res,405,{error:'method'});
  if(claimed)return send(res,409,{error:'already_claimed_no_retry'});
  claimed=true;
  try{
   const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>2700000)return send(res,413,{error:'size'});chunks.push(chunk);}
   const bytes=Buffer.concat(chunks);
   if(crypto.createHash('sha256').update(bytes).digest('hex')!==HASH){claimed=false;return send(res,400,{error:'fixture_hash'});}
   if(!key)return send(res,503,{error:'missing_key'});
   send(res,202,{accepted:true});void run(bytes);
  }catch{send(res,400,{error:'upload_failed_no_retry'});}
 }
 return {serve(req,res){if(req.url!=='/internal/voiceswap-test')return false;void handle(req,res);return true;}};
}
module.exports={create};
