import {initial,scene,choose,advance,AUTHOR,aiPayload,outcomeText,audioCues,restore} from './model.mjs';
import {playback} from './playback.mjs';

const $=id=>document.getElementById(id);
let state=initial(),media,enabled=false,busy=false;
let replyRequest=null;
const transport=playback();
const players=[];
const playerLabels=new Map();
const STORAGE='rerecord-progress-v1';
const save=()=>{try{sessionStorage.setItem(STORAGE,JSON.stringify(state));}catch{}};
function stopAudio(){transport.stop();for(const p of players){p.pause();p.removeAttribute('src');p.load();}players.splice(0);playerLabels.clear();}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function button(text,fn,cls='choice'){const n=el('button',text,cls);n.type='button';n.addEventListener('click',fn);return n;}
function image(name,alt){$('image-error').hidden=true;$('image').src=media.images?.[name]||`assets/${name}.png`;$('image').alt=alt;}
$('image').addEventListener('error',()=>{$('image-error').hidden=false;});
$('reload-image').onclick=()=>{const src=$('image').src;$('image').src='';$('image').src=src;};
$('sound').onclick=()=>{enabled=!enabled;$('sound').textContent=enabled?'聲音開啟':'聲音關閉';$('sound').setAttribute('aria-pressed',String(enabled));if(!enabled)transport.pause();};
function mountPlayer(key,label){
 const source=media.audio?.[key];
 if(!source){$('audio-area').append(el('p',key.startsWith('laugh-')?'此段笑場錄音尚待完成。驗收版未提供替代音訊。':'此演唱版本尚未完成，不能播放。','audio-note'));return;}
 if(media.audioStatus?.[key]==='mix-candidate')$('audio-area').append(el('p','雙聲線混音候選 · 尚未通過自然度與咬字驗收','audio-note'));
 const p=document.createElement('audio');p.src=source;p.preload='metadata';p.hidden=true;p.dataset.track=key;players.push(p);
 const b=button(label,async()=>{
  if(!enabled){enabled=true;$('sound').textContent='聲音開啟';$('sound').setAttribute('aria-pressed','true');}
  b.disabled=true;
  try{await transport.toggle(playerLabels.get(p),()=>{if(!state.heard.includes(key)){state.heard.push(key);save();}});}finally{b.disabled=false;}
 },'audio-control');
 playerLabels.set(p,{audio:p,button:b,label});
 p.onended=()=>{b.textContent=label;};p.onerror=()=>{b.textContent='音訊未能載入 · 點一下重試';};
 $('audio-area').append(p,b);
}
function renderAudio(){
 stopAudio();$('audio-area').replaceChildren();
 for(const cue of audioCues(state))mountPlayer(cue.key,cue.label);
}
function focusTitle(){requestAnimationFrame(()=>$('title').focus({preventScroll:true}));}
function clearContent(){stopAudio();$('choices').replaceChildren();$('extra').replaceChildren();$('audio-area').replaceChildren();$('detail').hidden=true;}
function render(){
 clearContent();save();
 $('count').textContent=state.ending?'尾聲':`${state.step+1} / 10`;$('progress').value=state.ending?10:state.step+1;
 if(state.ending){renderEnding();focusTitle();return;}
 const row=scene(state);image(row.image,row.title);$('time').textContent=row.time;$('title').textContent=row.title;
 $('text').textContent=state.pending||row.text;
 if(!state.pending&&row.detail){$('detail').hidden=false;$('detail').textContent=row.detail;}
 renderAudio();
 if(state.pending){$('choices').append(button('繼續',()=>{state=advance(state);render();window.scrollTo({top:0,behavior:'instant'});},'primary'));}
 else if(state.step===9)renderWords();
 else for(const option of row.options)$('choices').append(button(option.label,()=>{state=choose(state,option.id);render();}));
 focusTitle();
}
function renderWords(){
 const label=el('label','這段話想留給');const select=el('select');select.setAttribute('aria-label','留言對象');
 for(const name of ['自己','予安','立衡']){const o=el('option',name);o.value=name;select.append(o);}select.value=state.recipient;select.onchange=()=>{state.recipient=select.value;save();};label.append(select);
 const words=el('textarea');words.maxLength=1200;words.value=state.words;words.placeholder='不用整理好，也可以先不寫。';words.setAttribute('aria-label','想留下的話');words.oninput=()=>{state.words=words.value;save();};
 const privacy=el('p','留言不會寄給故事人物。只有你按下「請法器回應」時，才會把這段話與本次遊玩選擇送至故事館後端及 OpenAI。','audio-note');
 $('extra').append(label,words,privacy,button('把話留在這裡',()=>{state.ending=1;render();},'primary'),button('現在不寫',()=>{state.words='';state.ending=1;render();},'secondary'));
}
function renderEnding(){
 $('time').textContent='尾聲';
 if(state.ending===1){
  image('10-words','公寓裡仍亮著的燈');$('title').textContent='還有另一個位置';$('text').textContent='你可以看看立衡先前獨自剪輯時的片刻。\n也可以讓故事停在你看見的地方。';
  $('choices').append(button('看看那個片刻',()=>{state.reveal=true;state.ending=2;render();}),button('就留在這裡',()=>{state.reveal=false;state.ending=3;render();}));return;
 }
 if(state.ending===2){
  image('11-hidden','先前獨自剪輯時的立衡');$('time').textContent='回看 · 18:40 · 第一次試聽之前';$('title').textContent='游標停下的地方';
  $('text').textContent='他把自己的聲音拉進主唱軌。\n又點開你們笑場的開頭，沒把它剪進成品。';
  $('detail').hidden=false;$('detail').textContent='這是先前剪輯時的回憶，不是後來的投稿版本。\n'+outcomeText(state);
  // No recording playback here, including after the delete branch.
  $('choices').append(button('回到現在',()=>{state.ending=3;render();},'primary'));return;
 }
 image('10-words','夜裡的公寓');$('title').textContent='寫在故事之後';$('text').textContent='';
 const author=el('section',undefined,'author');author.append(el('small','創作者留話'),el('p',AUTHOR));$('extra').append(author);
 const reply=el('div',state.reply,'reply');reply.setAttribute('role','status');reply.setAttribute('aria-live','polite');$('extra').append(reply);
 if(state.words.trim()){
  const send=button(state.reply?'重新請法器回應':'請法器回應',async()=>{
   if(busy)return;busy=true;send.disabled=true;send.textContent='法器正在讀你的經歷…';reply.textContent='';
   const targetState=state;const controller=new AbortController();replyRequest=controller;
   const timer=setTimeout(()=>controller.abort(),65000);
   try{
    const r=await fetch('https://love-stories-reply-api.onrender.com/api/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(aiPayload(targetState)),signal:controller.signal});
    const d=await r.json();if(state!==targetState)return;if(!r.ok||typeof d.reply!=='string')throw Error(d.error||'這次沒有收到回覆。');state.reply=d.reply;reply.textContent=d.reply;save();
   }catch(e){if(state===targetState)reply.textContent=`暫時未能取得回應。你的留言仍保留在這個分頁。\n${e.name==='AbortError'?'連線逾時，可以稍後再試。':e.message}`;}
   finally{clearTimeout(timer);if(replyRequest===controller){replyRequest=null;busy=false;send.disabled=false;send.textContent=state.reply?'重新請法器回應':'再試一次';}}
  },'primary');$('extra').append(send);
 }else $('extra').append(el('p','你沒有留下留言，因此不會傳送資料或生成 AI 回應。','audio-note'));
 $('extra').append(button('重新走一次',()=>{replyRequest?.abort();replyRequest=null;busy=false;state=initial();save();render();window.scrollTo({top:0,behavior:'instant'});},'secondary'));
}
try{
 const response=await fetch('media.json',{cache:'no-store'});if(!response.ok)throw Error('素材清單載入失敗');media=await response.json();
 $('preview').hidden=media.releaseReady===true;
 let saved;try{saved=JSON.parse(sessionStorage.getItem(STORAGE));}catch{}
 state=restore(saved);
 render();
}catch{$('title').textContent='暫時無法開啟故事';$('text').textContent='素材清單未能載入，請重新整理後再試。';}
