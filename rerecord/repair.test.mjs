import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,choose,advance,audioCues,restore,scene,aiPayload} from './model.mjs';
import {playback} from './playback.mjs';
function route(plan,recordings,laugh='promise') {let s=initial();for(const id of ['rival','first',laugh,'only','direct','ask',plan,recordings])s=advance(choose(s,id));return s;}
for(const p of ['duet','solo','hold'])for(const r of ['copy','keep','delete'])test(`playback obeys ${p}/${r}`,()=>{
 const s=route(p,r);const keys=audioCues(s).map(x=>x.key);
 assert.equal(keys.includes('final-duet'),p==='duet'&&r!=='delete');
 assert.equal(keys.includes('solo'),p==='solo');
 if(r==='delete')assert.ok(keys.every(x=>x==='solo'));
 if(p==='hold')assert.ok(!keys.includes('final-duet')&&!keys.includes('solo'));
 assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);
 if(p==='hold')assert.equal(scene(s).time,'21:03');
});
for(const laugh of ['bump','promise','breath'])test(`recall uses actual ${laugh}`,()=>assert.ok(audioCues(route('hold','keep',laugh)).some(x=>x.key===`laugh-${laugh}`)));
test('restore reconstructs result instead of trusting cached claims',()=>{
 const s=route('solo','delete');s.outcome='duet';s.log=[];
 const restored=restore(s);assert.equal(restored.outcome,'solo');assert.equal(restored.log.length,8);
 assert.equal(restore({...s,choices:{}}).step,0);
});
test('all offered responses survive refresh',()=>{
 let s=initial();for(let i=0;i<9;i++){for(const o of scene(s).options){const n=choose(s,o.id);assert.deepEqual(restore(n),n);}s=advance(choose(s,scene(s).options[0].id));}
});
test('solo AI context preserves agency and no-correct-ending rule',()=>{
 const p=aiPayload(route('solo','keep'));assert.match(p.expectation,/理解不等於原諒，沒有正確結局/);assert.ok(p.choices.some(x=>x.includes('個人演唱版已投稿')));
});
const entry=()=>({audio:{paused:true,currentTime:0,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}},button:{textContent:''},label:'test'});
test('pause/resume preserves cursor, switching stops previous',async()=>{
 const p=playback(),a=entry(),b=entry();let played=0;await p.toggle(a,()=>played++);a.audio.currentTime=6;
 await p.toggle(a,()=>played++);assert.equal(a.audio.currentTime,6);assert.ok(a.audio.paused);
 await p.toggle(a,()=>played++);assert.equal(a.audio.currentTime,6);
 await p.toggle(b,()=>played++);assert.ok(a.audio.paused);assert.equal(a.audio.currentTime,0);assert.equal(played,3);
});
test('late play promise cannot resurrect audio after scene exit',async()=>{
 const p=playback(),a=entry();let resolve,recorded=false;a.audio.play=()=>new Promise(r=>resolve=r);
 const pending=p.toggle(a,()=>recorded=true);p.stop();resolve();await pending;assert.ok(a.audio.paused);assert.equal(recorded,false);
});
test('blocked play remains retryable without false listening history',async()=>{
 const p=playback(),a=entry();let recorded=false;a.audio.play=()=>Promise.reject(Error('NotAllowedError'));
 await p.toggle(a,()=>recorded=true);assert.match(a.button.textContent,/重試/);assert.equal(recorded,false);
});

for(const plan of ['duet','solo','hold'])test(`scene eight waits for recording confirmation: ${plan}`,()=>{
 let s=initial();for(const id of ['rival','first','promise','only','direct','ask',plan])s=advance(choose(s,id));
 assert.equal(s.step,7);assert.equal(s.outcome,null);assert.deepEqual(audioCues(s),[]);
 assert.deepEqual(audioCues(restore(s)),[]);
 for(const recording of ['copy','keep','delete']){
  const confirmed=choose(s,recording);
  const expected=plan==='solo'?['solo']:plan==='duet'&&recording!=='delete'?['final-duet']:[];
  assert.deepEqual(audioCues(confirmed).map(x=>x.key),expected);
  assert.deepEqual(audioCues(restore(confirmed)),audioCues(confirmed));
 }
});
