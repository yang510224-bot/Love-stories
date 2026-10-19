const {test}=require('node:test');
const assert=require('node:assert/strict');
const {preflight}=require('./eleven-preflight');
test('no key makes no request',async()=>{const r=await preflight({key:'',request:()=>{throw Error('unexpected')},log:()=>{}});assert.equal(r.configured,false)});
test('read only and allowlisted report',async()=>{let output='';const r=await preflight({key:'SECRET',request:async(url,opts)=>{assert.equal(opts.method,'GET');assert.equal(opts.headers['xi-api-key'],'SECRET');return {ok:true,status:200,json:async()=>({tier:'starter',character_count:0,character_limit:30000,secret:'SECRET',email:'private'})}},log:x=>output=x});assert.equal(r.character_limit,30000);assert.equal(output.includes('SECRET'),false);assert.equal(output.includes('private'),false)});
test('permission denial is reported without raw error',async()=>{const r=await preflight({key:'SECRET',request:async()=>({ok:false,status:401,json:async()=>({detail:{status:'missing_permissions',message:'SECRET'}})}),log:()=>{}});assert.equal(r.reason,'missing_permissions');assert.equal(r.authenticated,false)});
