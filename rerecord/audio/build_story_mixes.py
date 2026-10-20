"""Existing stems only. Unison two-timbre candidates, NOT two independent takes."""
from pathlib import Path
import hashlib, json, subprocess
import numpy as np
import soundfile as sf

p=Path(__file__).resolve().parent
source,sr=sf.read(p/'svc-proof/source-vocal.wav',always_2d=True)
converted,br=sf.read(p/'svc-proof/voice-b.wav',always_2d=True)
bed,ar=sf.read(p/'svc-proof/accompaniment.wav',always_2d=True)
assert sr==br==ar==44100 and len(source)==len(converted)==len(bed)==661500
def normal(x,db):return x*(10**(db/20)/np.sqrt(np.mean(x*x)))
def pan(x,position):
    mono=x.mean(axis=1)
    angle=(position+1)*np.pi/4
    return mono[:,None]*np.array([np.cos(angle),np.sin(angle)])
y=pan(normal(source,-23),-.25)
l=pan(normal(converted,-23),.25)
b=normal(bed,-27)
t=np.arange(len(y))/sr
# Smooth gain changes; no pitch shifting, delay, tuning or time stretching.
def ramp(start,end):return np.clip((t-start)/(end-start),0,1)[:,None]
middle=ramp(5.8,6.0)*(1-ramp(8.8,9.0))
y_gain=1-.55*middle
l_gain=.65+.35*middle
duet=y*y_gain+l*l_gain+b
backing=ramp(8.8,9.0)*10**(-18/20)
modified=l+y*backing+b
solo=l+b
fade=np.minimum(np.clip(t/.015,0,1),np.clip((15-t)/.015,0,1))[:,None]
outputs={'story-duet-original-v2':duet,'story-modified-v2':modified,'story-duet-restored-v2':duet.copy(),'story-solo-v2':solo}
gain=min(1,.95/max(np.abs(a*fade).max() for a in outputs.values()))
evidence={ 'sourceSeconds':15, 'sampleRate':sr, 'samplesPerChannel':len(source),
  'newProviderCalls':0,'pitchShiftSemitones':0,'timeStretch':False,
  'restoredIsExactOriginalMix':True,'independentPerformances':False,
  'voices':{'yuan':'existing Mureka generated source','liheng':'existing Voice-Swap Liam Bailey conversion'},
  'modifiedBacking':{'voice':'yuan','startsSeconds':8.8,'gainRelativeToSourceDb':-18},
  'soloContainsYuan':False,'naturalDuetAccepted':False,
  'limitations':['Unison two-timbre mix, not independently performed duet','No available source evidence establishes the written off-beat flaw','Laughter and spoken transitions absent'], 'outputs':{} }
for name,a in outputs.items():
    wav=p/(name+'.wav');mp3=p/(name+'.mp3')
    samples=a*fade*gain
    sf.write(wav,samples,sr,subtype='PCM_16')
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-b:a','192k',str(mp3)],check=True)
    evidence['outputs'][name]={'wavSha256':hashlib.sha256(wav.read_bytes()).hexdigest(),'mp3Sha256':hashlib.sha256(mp3.read_bytes()).hexdigest(),'peak':float(np.max(np.abs(samples))),'seconds':15}
(p/'mix-evidence-v2.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
