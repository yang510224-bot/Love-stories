export const VERSION = 1;
export const AUTHOR = '我想寫兩個明明一起玩得很開心，後來卻把彼此弄丟的人。我在立衡身上看見想做好一件事的急，在予安身上看見想被留下的心。那段沒唱準的聲音，要不要留下，我想交還給他們。';
export const CREDITS = '詞：周予安、陳立衡　曲：周予安、陳立衡';
export function initial() {
  return { version: VERSION, step: 0, choices: {}, log: [], pending: null, plan: null, outcome: null, recordings: null, words: '', recipient: '自己', reveal: false, ending: 0, reply: '', heard: [] };
}
const opt = (id, label, response) => ({ id, label, response });
export function scene(s) {
  const c = s.choices;
  const rows = [
    { time: '16:10', title: '冰箱也想參加', image: '01-fridge', text: '「它又開始唱了。」\n立衡沒抬頭：「它比你準時進拍。」', options: [
      opt('rival', '「那你跟它交往。」', '「好啊。它至少不會把襪子塞沙發底下。」\n你用毛巾指著他：「那是失蹤，不是塞。」'),
      opt('hum', '貼著冰箱，替它和聲。', '你壓低聲音，跟著冰箱嗡。\n立衡接了個更低的音。兩人都先破功。'),
      opt('towel', '拿毛巾墊住震動的地方。', '冰箱安靜了。\n「主唱被你消音了。」\n他把麥克風轉向你：「換你。」') ] },
    { time: '16:25', title: '兩個人的名字', image: '02-names', text: '「普通人的情歌，今晚九點截止。」\n「我又不會唱。」\n「誰規定普通人要會唱？」', detail: '社區電台徵件 · 九十秒原創歌曲\n入選作品於下週五晚間播放。\n'+CREDITS, options: [
      opt('first', '「名字我要排前面。」', '他把演唱欄改成「周予安、陳立衡」。\n「跟詞的署名一樣。很公平吧。」'),
      opt('fridge', '「用『冰箱與它的室友』。」', '「冰箱沒有填同意書。」\n他還是把這個名字填進組合欄。詞曲署名留著。'),
      opt('listen', '「真的會有人聽喔？」', '「有啊，我會聽。」\n他敲敲演唱欄：「這裡也放兩個人的名字。」') ] },
    { time: '16:50', title: '還沒開始唱', image: '03-laugh', text: '「過來一點。」\n「會撞到。」\n「你在家撞到我的次數還少？」', options: [
      opt('bump', '故意用肩膀撞他一下。', '「欸——」\n你還沒唱就笑了。他也笑：「等一下，這樣沒辦法唱。」'),
      opt('promise', '「你等一下不准嫌我。」', '「不嫌。收費而已。」\n你笑著推他。他撐不到兩秒也笑出來。'),
      opt('breath', '站回去，跟著他吸一口氣。', '你吸得太用力，像準備潛水。\n他看你一眼，你們同時笑場。') ] },
    { time: '17:35', title: '這句你救一下', image: '04-again', text: '第七次，你又早了一拍。\n「這句你救一下。」\n「好。」他沒有再按錄音。', options: [
      opt('only', '「只救這句喔，其他很有靈魂。」', '「知道。」\n你去巷口買飯。回來吃完，他才戴上耳機剪。'),
      opt('food', '「我去買飯，你慢慢弄。」', '「不要香菜。」\n「交往四年了，陳先生。」\n吃完飯，你去洗碗，他開始剪輯。'),
      opt('rest', '「先休息，我耳朵好熱。」', '他拿起手機點晚餐。\n你們吃完，你躺到沙發上，他才開始剪輯。') ] },
    { time: '19:10', title: '很順，可是', image: '05-listen', text: '前奏過了。第一句也過了。\n你把左耳拿開。\n「我的聲音呢？」', audio: 'comparison', options: [
      opt('direct', '「你把我整段換掉了？」', '「主唱那段。你的和聲還在。」\n他把音量調大，像這樣就能讓你找到自己。'),
      opt('sarcasm', '「喔，所以我是來陪錄的。」', '他把手從滑鼠上拿開。\n「你一定要這樣講嗎？」'),
      opt('silent', '從頭再聽一次。', '他等了一會，自己開口：\n「我補唱了。你的主唱沒有放進去。」') ] },
    { time: '19:15', title: '「救一下」有多大', image: '06-distance', text: c[3] === 'only' ? '「我知道你說只修那句。後來越改越多。」\n「改到剩你？」' : '「我以為你說救一下，是可以修。」\n「修到剩你？」', options: [
      opt('ask', '「不好聽，你也可以先問我。」', '「嗯。這個是我沒問。」\n他看著桌上的耳機，沒有接著辯。'),
      opt('voice', '「你想要我的聲音，還是好聽的聲音？」', '「我本來以為可以都有。」\n你沒接話。他把播放停了。'),
      opt('stop', '「我現在不想聽你解釋。」', '「好。」\n他把播放停了。你們各自坐了一會。') ] },
    { time: '20:20', title: '還有四十分鐘', image: '07-return', text: '洗完杯子，你坐回桌邊。\n「還沒寄。」他把電腦轉向你。\n「你要怎麼處理？」', options: [
      opt('duet', '「放回我的。跑拍就跑拍。」', '「好。換回來後，你再聽一次。」\n他打開原始聲軌，先沒有寄。'),
      opt('solo', '「你自己唱。詞的署名留下。」', '「嗯。演唱只寫我，詞還是我們兩個。」\n他也移除你的和聲，等你最後確認。'),
      opt('hold', '「今天先不要寄。」', '「好。」\n他關掉投稿頁，沒有另開一份寄出。') ] },
    { time: '20:45', title: '要不要留一份', image: `08-${s.plan||'hold'}`, text: '「下午那些亂七八糟的，也留嗎？」\n他的手停在資料夾上。\n這次，他先問了。', detail: s.plan === 'duet' ? '雙人版尚未送出。刪除你的全部錄音，也會取消這次雙人版投稿。' : s.plan === 'solo' ? '個人版只含立衡的演唱。共同詞曲署名保留；確認後才投稿。' : '今晚不投稿。現在決定下午的錄音要不要留下。', options: [
      opt('copy', '「傳我一份。」', '他先把原始錄音傳給你，才處理投稿。'),
      opt('keep', '「先放著。」', '他把錄音留在原本的資料夾，沒有另傳給誰。'),
      opt('delete', s.plan === 'duet' ? '刪除我的全部錄音，也取消投稿。' : '「我的錄音全部刪掉吧。」', '他刪除你的主唱、和聲和含你聲音的原始片段，也清空暫存。') ] },
    { time: s.plan === 'hold' ? '21:03' : '20:52', title: s.recordings === 'delete' ? '冰箱又響了' : '還沒開始唱的地方', image: s.recordings === 'delete' ? '09-fridge' : '09-memory', text: memory(s), audio: s.recordings === 'delete' ? null : 'memory', detail: outcomeText(s), options: [
      opt('linger', s.recordings === 'delete' ? '在這裡多站一下。' : '把開頭聽完。', s.recordings === 'delete' ? '你沒有回餐桌。冰箱震了一陣，又停下來。' : '錄音到了吸氣的地方。你沒有接著播放。'),
      opt('leave', s.recordings === 'delete' ? '回到客廳。' : '關掉播放。', '你把手放下。客廳的燈還亮著。') ] },
    { time: s.plan === 'hold' ? '21:06' : '20:55', title: '這句不會自動送出去', image: '10-words', text: '如果現在不用把話說得漂亮，\n你想留下什麼？', options: [] }
  ];
  return rows[s.step];
}
export function memory(s) {
  if (s.recordings === 'delete') {
    return s.choices[0] === 'towel' ? '錄音刪掉了。冰箱又響起來。\n下午那條毛巾，還墊在下面。' : s.choices[0] === 'rival' ? '錄音刪掉了。冰箱又響起來。\n你看著下午叫他去交往的那台冰箱。' : '錄音刪掉了。冰箱又響起來。\n下午，你們還跟它一起嗡。';
  }
  const lines = { bump: '「欸——」\n是你撞他的那一下。接著，你們都笑了。', promise: '「不嫌。收費而已。」\n接著是你們笑場的聲音。', breath: '錄音裡，你吸了一大口氣。\n他笑了，你也笑了。' };
  return lines[s.choices[2]] || lines.bump;
}
export function outcomeText(s) {
  if (s.outcome === 'duet') return '20:50 · 雙人演唱版已投稿\n'+CREDITS+'\n演唱：周予安、陳立衡'+(s.choices[1] === 'fridge' ? '\n組合：冰箱與它的室友' : '');
  if (s.outcome === 'solo') return '20:50 · 個人演唱版已投稿\n'+CREDITS+'\n演唱：陳立衡；不含予安的聲音';
  return s.plan === 'duet' ? '雙人版投稿已取消。沒有改寄個人版。' : '21:00 已過 · 今晚沒有投稿';
}
export function choose(s, id) {
  if (s.pending) throw new Error('Finish current response first');
  const row = scene(s); const o = row.options.find(x => x.id === id);
  if (!o) throw new Error('Unknown choice');
  const next = structuredClone(s);
  next.choices[s.step] = id;
  next.log.push({ scene: row.title, choice: o.label, response: o.response });
  if (s.step === 6) next.plan = id;
  if (s.step === 7) {
    next.recordings = id;
    next.outcome = s.plan === 'duet' && id === 'delete' ? 'none' : s.plan === 'hold' ? 'none' : s.plan;
  }
  next.pending = o.response;
  return next;
}
export function advance(s) {
  if (!s.pending) throw new Error('No response to advance');
  return { ...s, step: s.step + 1, pending: null };
}
// Playback follows the actual branch; deleted character recordings cannot return.
export function audioCues(s) {
  if(s.ending)return [];
  let cues=[];
  if(s.step===2&&s.pending)cues.push({key:`laugh-${s.choices[2]}`,label:'聽一下錄音前的聲音'});
  if(s.step===3)cues.push({key:'original',label:'聽下午的雙人錄音'});
  if(s.step===4)cues.push({key:'original',label:'聽下午的雙人錄音'},{key:'replacement',label:'聽立衡修改的版本'});
  if(s.step===7||s.step===8){
    const result=s.outcome||(s.step===7&&!s.pending?s.plan:null);
    if(result==='duet')cues.push({key:'final-duet',label:'聽恢復雙人演唱的版本'});
    if(result==='solo')cues.push({key:'solo',label:'聽立衡個人演唱版'});
  }
  if(s.step===8&&s.recordings!=='delete')cues.push({key:`laugh-${s.choices[2]||'bump'}`,label:'播放這段開頭'});
  if(s.recordings==='delete')cues=cues.filter(x=>x.key==='solo');
  return cues;
}
export function restore(raw) {
  if(!raw||raw.version!==VERSION||!Number.isInteger(raw.step)||raw.step<0||raw.step>9)return initial();
  try{
    let s=initial();
    for(let i=0;i<raw.step;i++)s=advance(choose(s,raw.choices?.[i]));
    if(raw.pending)s=choose(s,raw.choices?.[raw.step]);
    s.words=typeof raw.words==='string'?raw.words.slice(0,1200):'';
    s.recipient=['自己','予安','立衡'].includes(raw.recipient)?raw.recipient:'自己';
    s.ending=s.step===9&&[0,1,2,3].includes(raw.ending)?raw.ending:0;
    s.reveal=s.ending>=2&&raw.reveal===true;
    if(s.ending===2&&!s.reveal)s.ending=1;
    s.reply=s.ending===3&&typeof raw.reply==='string'?raw.reply.slice(0,1200):'';
    s.heard=Array.isArray(raw.heard)?[...new Set(raw.heard.filter(x=>['original','replacement','final-duet','solo','laugh-bump','laugh-promise','laugh-breath'].includes(x)))]:[];
    return s;
  }catch{return initial();}
}
export function aiPayload(s) {
  return {
    story: '再錄一次｜予安與立衡，同居四年，共作情歌；立衡未經詢問換掉予安主唱',
    choices: [...s.log.map(x => `${x.scene}：${x.choice}；對方回應：${x.response}`),
      `實際結果：${outcomeText(s).replaceAll('\n', '；')}`,
      `錄音：${s.recordings === 'delete' ? '全部含予安聲音的錄音已刪除，第九幕沒有播放錄音' : s.recordings === 'copy' ? '予安收到原始錄音' : '原始錄音保留未傳送'}`,
      `隱藏視角：${s.reveal ? '已看，剪輯發生在19:10首次試聽之前，不改變最終投稿結果' : '玩家選擇不看，不得引用其內容'}`,
      `玩家實際開始播放過的音訊：${s.heard.length?s.heard.join('、'):'無'}；這是先前操作紀錄，不代表完整聽完，也不代表刪除後再次播放。`],
    expectation: `玩家是予安，原先期待共同演唱的作品。留言對象：${s.recipient}。日常與選擇只依紀錄，不推測現實關係。理解不等於原諒，沒有正確結局。`,
    words: s.words
  };
}
