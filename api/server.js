'use strict';
const http=require('node:http'); const fs=require('node:fs'); const path=require('node:path'); const PORT=Number(process.env.PORT||10000);
const FRONTEND='https://love-stories-yang.onrender.com';
const prompt="你是《欸，你幹嘛啦！》故事館結尾的對話者。請根據玩家實際遊玩的故事、選擇、當初的期待，以及最後的留言，用自然真誠、生活化的繁體中文回覆約80至160字。要回應真正具體的細節，不套公式，不強迫和解，不搶著教訓或解釋心理，不替失約的人開脫。玩家可以生氣、哭、開玩笑或感到平靜。不要預設玩家的感受，也不要聲稱知道現實中他人的心。不要用標題或條列。可有一個自然的提問，但不用每次都問。若玩家表達當下自傷風險，先支持其安全並鼓勵即時聯絡身邊的人或緊急服務。你不是治療師，也不是故事裡的人。";
const core=fs.readFileSync(path.join(__dirname,'FAQI_CORE.md'),'utf8');
const instructions=prompt+'\n\n'+core;
const rate=new Map();
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':FRONTEND,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj))}
http.createServer(async(req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':FRONTEND,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
 if(req.url==='/health')return send(res,200,{ok:true,configured:!!process.env.OPENAI_API_KEY});
 if(req.method!=='POST'||req.url!=='/api/respond')return send(res,404,{error:'not_found'});
 if(req.headers.origin!==FRONTEND)return send(res,403,{error:'origin_not_allowed'});
 const ip=String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0],now=Date.now();
 let item=rate.get(ip)||{count:0,until:now+3600000};if(now>item.until)item={count:0,until:now+3600000};item.count++;rate.set(ip,item);if(rate.size>2000)rate.clear();
 if(item.count>10)return send(res,429,{error:'稍後再聊好嗎？這個裝置暫時達到使用上限。'});
 if(!process.env.OPENAI_API_KEY)return send(res,503,{error:'AI 回應尚未開放，站長正在完成安全設定。'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>11000)return send(res,413,{error:'內容太長，請縮短一些。'})}
 let d;try{d=JSON.parse(raw)}catch{return send(res,400,{error:'格式錯誤'})}
 if(typeof d.words!=='string'||!d.words.trim()||d.words.length>1200||typeof d.story!=='string'||d.story.length>100||!Array.isArray(d.choices))return send(res,400,{error:'請先留下想說的話。'});
 try{
 const content=JSON.stringify({故事:d.story,遊玩選擇:d.choices.slice(0,15).map(x=>String(x).slice(0,140)),原本的期待:String(d.expectation||'').slice(0,800),玩家留下的話:d.words});
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},signal:AbortSignal.timeout(22000),body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1',instructions,input:content,max_output_tokens:450,store:false})});
 const result=await r.json();if(!r.ok){console.error('upstream',r.status);return send(res,502,{error:'現在暫時連不上回應服務，稍後再試好嗎？'})}
 const reply=(result.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('').trim();
 if(!reply)return send(res,502,{error:'這次沒有收到回應，請再試一次。'});
 return send(res,200,{reply:reply.slice(0,1200)});
 }catch(e){console.error('response error',String(e).slice(0,120));return send(res,504,{error:'回應花太久了，再試一次好嗎？'})}
}).listen(PORT,'0.0.0.0');