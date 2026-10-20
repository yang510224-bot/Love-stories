"""Three bounded fictional VoiceDesign probes; no cloning or real-person reference."""
from pathlib import Path
import json,time
ROOT=Path(__file__).resolve().parent
status={'model':'Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign','license':'Apache-2.0 (official model card)','status':'starting','outputs':[],'characterMatchAccepted':False,'naturalnessAccepted':False}
try:
 import torch,soundfile as sf
 from qwen_tts import Qwen3TTSModel
 torch.set_num_threads(4)
 model=Qwen3TTSModel.from_pretrained(status['model'],device_map='cpu',dtype=torch.bfloat16,attn_implementation='eager')
 prompts=[('等一下，我的杯子呢？','成年男性，台灣華語，自然中音，先輕吸氣，說話途中忍不住短笑，最後收住笑。'),('原來在這裡，我找了半天。','成年男性，台灣華語，略低沉溫暖音色，先說話，再自然地呼氣笑一下。'),('你也太認真了吧。','成年男性，台灣華語，自然中音，像跟熟朋友聊天，說完輕笑並喘一口氣。')]
 for i,(text,instruct) in enumerate(prompts):
  torch.manual_seed(100+i)
  start=time.time()
  wavs,sr=model.generate_voice_design(text=text,language='Chinese',instruct=instruct,max_new_tokens=90)
  p=ROOT/f'laugh-probe-{i+1}-UNACCEPTED.wav';sf.write(p,wavs[0],sr)
  status['outputs'].append({'file':p.name,'seconds':len(wavs[0])/sr,'computeSeconds':time.time()-start,'durationWithin3to6':3<=len(wavs[0])/sr<=6})
  (ROOT/'laughter-report.json').write_text(json.dumps(status,ensure_ascii=False,indent=2))
 status['status']='generated_not_listening_accepted'
except Exception as e:
 status['status']='blocked_before_completion';status['error']=f'{type(e).__name__}: {e}'[:2000]
finally:
 (ROOT/'laughter-report.json').write_text(json.dumps(status,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(status,ensure_ascii=False))
