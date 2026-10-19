'use strict';
// Official /api/openapi v1.4.2: bootstrap exchange then read public v2v models.
// No audio, generation, pitch-detection, training, purchase or download calls.
async function preflight({key=process.env.VOICE_SWAP_API_KEY||process.env.Voice_swap_api_key,request=fetch,log=console.log}={}) {
 const r={event:'voiceswap_preflight_v1',configured:Boolean(key),generationEnabled:false,quotaVerified:false};
 try {
  if(!key)return r;
  const auth=await request('https://api.voice-swap.ai/v1/oauth/token',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({grant_type:'client_credentials',expires_in:60,refresh_token_expires_in:60}),redirect:'error',signal:AbortSignal.timeout(20000)});
  r.authStatus=auth.status;if(!auth.ok)return r;
  const tokens=await auth.json();if(typeof tokens.access_token!=='string'){r.error='missing_access_token';return r;}
  const models=await request('https://api.voice-swap.ai/v1/models?type=v2v',{method:'GET',headers:{Authorization:'Bearer '+tokens.access_token},redirect:'error',signal:AbortSignal.timeout(20000)});
  r.modelsStatus=models.status;if(!models.ok)return r;
  const data=await models.json();
  r.responseKeys=Object.keys(data).slice(0,20);
  r.modelCount=Array.isArray(data.models)?data.models.length:null;
  r.modelFieldNames=Array.isArray(data.models)&&data.models.length?Object.keys(data.models[0]).slice(0,40):[];
  const isFalse=v=>v===false||v===0||v==='false'||v==='0';
  const isTrue=v=>v===true||v===1||v==='true'||v==='1';
  r.privacyFlagForms=[...new Set((data.models||[]).map(m=>typeof m.is_private+':'+(isFalse(m.is_private)?'false':isTrue(m.is_private)?'true':'unknown')))];
  r.publicModels=(Array.isArray(data.models)?data.models:[]).filter(m=>isFalse(m.is_private)).slice(0,80).map(m=>({id:typeof m.id==='string'?m.id.slice(0,100):null,name:typeof m.name==='string'?m.name.slice(0,100):null,description:typeof m.description==='string'?m.description.slice(0,250):null,has_audio:isTrue(m.has_audio),version:Number.isFinite(m.version)?m.version:null}));
  r.authenticated=true;
  return r;
 }catch{r.error='preflight_request_failed';return r;}
 finally{log(JSON.stringify(r));}
}
module.exports={preflight};
