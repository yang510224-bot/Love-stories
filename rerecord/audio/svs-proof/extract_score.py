"""Extract reviewable candidates, NOT an accepted score or lyric transcription."""
from pathlib import Path
import json, hashlib, struct, shutil
import numpy as np
import librosa
import soundfile as sf
from scipy.ndimage import median_filter
ROOT=Path(__file__).resolve().parent
SRC=ROOT.parent/'svc-proof'
y,sr=librosa.load(SRC/'source-vocal.wav',sr=22050,mono=True)
bed,_=librosa.load(SRC/'accompaniment.wav',sr=22050,mono=True)
hop=220
f0,voiced,prob=librosa.pyin(y,sr=sr,fmin=65,fmax=700,frame_length=2048,hop_length=hop)
valid=voiced & (prob>=.5) & np.isfinite(f0)
raw=np.where(valid,np.rint(librosa.hz_to_midi(np.nan_to_num(f0,nan=440))),-1).astype(int)
pitch=median_filter(raw,size=5)
notes=[]; start=0
for end in range(1,len(pitch)+1):
 if end==len(pitch) or pitch[end]!=pitch[start]:
  a,b=start*hop/sr,min(end*hop/sr,len(y)/sr)
  if pitch[start]>=0 and b-a>=.08:
   notes.append(dict(start=round(a,4),end=round(b,4),midi=int(pitch[start]),confidence=round(float(np.mean(prob[start:end])),3),lyric=None,phonemes=None,reviewed=False))
  start=end
onset=librosa.onset.onset_strength(y=bed,sr=sr,hop_length=hop)
tempo,beats=librosa.beat.beat_track(onset_envelope=onset,sr=sr,hop_length=hop)
bpm=float(np.asarray(tempo).ravel()[0])
score=dict(status='UNREVIEWED_CANDIDATE',melodyAccepted=False,lyricsAccepted=False,bpmCandidate=bpm,beatSeconds=librosa.frames_to_time(beats,sr=sr,hop_length=hop).tolist(),notes=notes,limitations=['Pitch runs are not necessarily notes; repeated notes can merge, vibrato can split.','15-second tempo has half/double-time ambiguity; no inferred time signature.','No lyrics or syllable boundaries have been verified.'])
(ROOT/'score-candidate.json').write_text(json.dumps(score,ensure_ascii=False,indent=2)+'\n')
# Standard MIDI format 0. 120 BPM is only a seconds-to-ticks transport grid.
def vlq(n):
 out=[n&127];n>>=7
 while n:out.insert(0,(n&127)|128);n>>=7
 return bytes(out)
events=[]
for n in notes:
 events.extend([(round(n['start']*960),bytes([0x90,n['midi'],80])),(round(n['end']*960),bytes([0x80,n['midi'],0]))])
track=b'\x00\xff\x51\x03\x07\xa1\x20';last=0
for tick,event in sorted(events,key=lambda x:(x[0],x[1][0])):
 track+=vlq(tick-last)+event;last=tick
track+=b'\x00\xff\x2f\x00'
(ROOT/'melody-candidate.mid').write_bytes(b'MThd'+struct.pack('>IHHH',6,0,1,480)+b'MTrk'+struct.pack('>I',len(track))+track)
# Audible pitch-guide evidence only; never presented as singing.
guide=np.zeros(len(y))
for n in notes:
 a,b=round(n['start']*sr),round(n['end']*sr);t=np.arange(b-a)/sr
 env=np.minimum(1,np.minimum(t/.015,(len(t)/sr-t)/.02))
 guide[a:b]+=.15*np.sin(2*np.pi*librosa.midi_to_hz(n['midi'])*t)*env
sf.write(ROOT/'melody-guide-NOT-VOCAL.wav',guide,sr,subtype='PCM_16')
shutil.copyfile(SRC/'accompaniment.wav',ROOT/'instrumental.wav')
info={p:dict(samples=sf.info(SRC/p).frames,sampleRate=sf.info(SRC/p).samplerate,sha256=hashlib.sha256((SRC/p).read_bytes()).hexdigest()) for p in ['source-vocal.wav','accompaniment.wav']}
report=dict(source=info,sharedSourceSliceSamples=[882000,1543500],alignment='Same source slice; sample grids equal. Musical/phonetic alignment not yet accepted.',detectedCandidateNotes=len(notes),bpmCandidate=bpm,voicedConfidentCoverage=float(valid.mean()),pitchGuideIsSinging=False,independentSingerRenders=0,releaseReady=False)
(ROOT/'analysis-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
