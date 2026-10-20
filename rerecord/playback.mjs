// User-gesture play only; generation token prevents late promises reviving old audio.
export function playback(){
 let current=null,generation=0;
 const reset=entry=>{entry.audio.pause();entry.audio.currentTime=0;entry.button.textContent=entry.label;};
 return {
  stop(){generation++;if(current)reset(current);current=null;},
  pause(){generation++;if(current){current.audio.pause();current.button.textContent='繼續播放 · '+current.label;}},
  async toggle(entry,onStarted){
   if(current===entry&&!entry.audio.paused){this.pause();return;}
   if(current!==entry){this.stop();current=entry;}
   const token=++generation;entry.button.textContent='載入中…';
   try{
    await entry.audio.play();
    if(token!==generation){entry.audio.pause();return;}
    entry.button.textContent='播放中 · 點一下暫停';onStarted();
   }catch{
    if(token===generation)entry.button.textContent='未能播放 · 點一下重試';
   }
  }
 };
}
