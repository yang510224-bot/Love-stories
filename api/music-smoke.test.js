'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {run,payload}=require('./music-smoke');
const env={MUREKA_API_KEY:'test-secret',MUREKA_SMOKE_RUN:'test-20261020-a',MUREKA_SMOKE_DEADLINE:String(Date.now()+60000)};
test('off by default',async()=>{await run({env:{},request:()=>assert.fail('network')});});
test('balance mismatch prevents purchase',async()=>{
 let calls=0;await run({env,claim:()=>{},log:()=>{},request:async()=>{calls++;return {ok:true,json:async()=>({balance:985})}}});assert.equal(calls,1);
});
test('one POST, explicit male song, sanitized result',async()=>{
 let posts=0;const logs=[];
 await run({env,claim:()=>{},sleep:async()=>{},log:s=>logs.push(s),request:async(url,o)=>{
   if(o.method==='POST'){posts++;assert.equal(JSON.parse(o.body).n,1);return {ok:true,json:async()=>({id:'task-1'})};}
   return {ok:true,json:async()=>url.includes('/query/')?{status:'succeeded',choices:[{id:'song-1',url:'https://example.com/test.mp3'}]}:{balance:1000}};
 }});
 assert.equal(posts,1);assert.equal(payload.gender,'male');assert.ok(!logs.join('').includes('test-secret'));
});
test('POST failure never retries',async()=>{
 let posts=0;await run({env,claim:()=>{},log:()=>{},request:async(url,o)=>{if(o.method==='POST'){posts++;throw Error('test-secret');}return {ok:true,json:async()=>({balance:1000})}}});assert.equal(posts,1);
});
