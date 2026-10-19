'use strict';
// Read-only credentials/quota check. Never generates audio or logs raw responses.
async function preflight({key=process.env.ELEVENLABS_API_KEY, request=fetch, log=console.log}={}) {
  const report={event:'eleven_preflight_v1',configured:Boolean(key),generationEnabled:false};
  if(key) {
    try {
      const response=await request('https://api.elevenlabs.io/v1/user/subscription', {
        method:'GET',headers:{'xi-api-key':key},redirect:'error',signal:AbortSignal.timeout(15000)
      });
      report.httpStatus=response.status;
      report.authenticated=response.ok;
      if(response.ok) {
        const data=await response.json();
        for(const field of ['tier','status']) if(typeof data[field]==='string') report[field]=data[field].slice(0,40);
        for(const field of ['character_count','character_limit','max_credit_limit_extension']) if(Number.isFinite(data[field])) report[field]=data[field];
      } else {
        const data=await response.json().catch(()=>({}));
        const status=data.detail?.status;
        if(['missing_permissions','invalid_api_key','quota_exceeded'].includes(status)) report.reason=status;
      }
    } catch {report.error='subscription_check_failed';}
  }
  log(JSON.stringify(report));
  return report;
}
module.exports={preflight};
