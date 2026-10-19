'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const {run}=require('./music-production');
const job={id:'unit-test',path:'/v1/song/generate',deadline:Date.now()+60000,balance:985,body:{model:'mureka-9.5',n:1,lyrics:'fictional'}};
const env=j=>({MUREKA_API_KEY:'secret',MUREKA_PRODUCTION_JOB:JSON.stringify(j)});
test('off by default',async()=>run({env:{},request:()=>assert.fail('network')}));
test('enforces total budget',async()=>run({env:env({...job,balance:500}),log:()=>{},request:()=>assert.fail('network')}));
test('rejects auto models and multiple songs',async()=>run({env:env({...job,body:{model:'auto',n:2}}),log:()=>{},request:()=>assert.fail('network')}));
test('exact balance guard prevents repeat charging',async()=>{
 let calls=0;await run({env:env(job),log:()=>{},claim:()=>{},request:async()=>{calls++;return {ok:true,json:async()=>({balance:970})};}});assert.equal(calls,1);
});
test('one generation, sanitized output',async()=>{
 let posts=0;const logs=[];await run({env:env(job),log:x=>logs.push(x),claim:()=>{},sleep:async()=>{},request:async(url,o)=>{if(o.method==='POST'){posts++;return {ok:true,json:async()=>({id:'1'})};}return {ok:true,json:async()=>url.includes('query')?{status:'succeeded',choices:[{url:'https://example.com/a.mp3'}]}:{balance:985}};}});assert.equal(posts,1);assert.ok(!logs.join('').includes('secret'));assert.ok(!logs.join('').includes('fictional'));
});
