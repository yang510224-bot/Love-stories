# 可控制歌聲合成：本輪停止結果

2026-10-20。結果為未完成，沒有產生兩位獨立歌手。停止於聲庫資格與Qwen執行阻礙，沒有把候選音高或舊換聲混音當作新歌聲。沒有修改網站播放器、media.json、劇情、圖片、分支或正式站；沒有支付費用、聘請真人或新增訂閱。

## 實際完成的程式與輸出
- extract_score.py 已實際運行：以librosa pYIN提取原人聲候選音高，從伴奏估計節拍；輸出score-candidate.json、melody-candidate.mid及analysis-report.json。
- 33個候選音符片段，高信心音高時間比例45.61%；BPM候選171.818，可能為85.909的倍速，尚未人工確認。
- MIDI採120 BPM作「秒數轉tick」的傳輸網格，不宣稱曲速120，也未把音符量化到未確認的節拍。
- 每音符起訖與MIDI範圍經程式檢查有效；這不證明音樂正確。滑音、顫音、同音反覆仍可能錯切。
- 原人聲與伴奏均44100Hz、661500樣本，來源裁切範圍882000–1543500一致。樣本對齊成立，音節／聽感對齊未通過。
- instrumental.wav是既有伴奏逐位元複製。melody-guide-NOT-VOCAL.wav是音符校正用正弦音，不是演唱，不接網站、不當成失敗歌聲樣本。
- 中文逐字歌詞及音節邊界沒有可靠轉寫／聽感確認，保留null，未編造文字填入。

重建命令：`python rerecord/audio/svs-proof/extract_score.py`。依賴版本見environment.json；輸入使用既有audio/svc-proof中的兩個WAV。腳本與MIDI／JSON保存於Test分支；大型診斷WAV可依既有源檔重建。

## 聲庫資格查核
詳見voicebank-screen.json，包括官方授權與角色條款網址。
- TIGER：非商業及署名後其他角色用途有依據；中文支援在版本間曾移除／部分實作，沒有充分證據確立本案自然華語可用性。屬候選，不是品質通過。
- Lewy/Lewisia：官方描述為少女聲，排除本案男聲需求；條款又限制在UTAU系引擎使用，不能直接拿一般Python推論替代。
- Denji DS：官方標示支援中文；衍生使用需作者同意，另有角色年齡／性格限制。沒有取得替本案兩位不同角色發聲的明確許可，因此不自行使用。
- ACV-001：有明確提供者署名、原生華語男聲及CC BY-SA 4.0範圍，但查核頁是資料集，未找到直接可用且經確認的整套聲學／variance／vocoder聲庫。未啟動訓練。

本輪合格聲庫組合0；歌聲合成組合測試0/最多2。這是有範圍的查核結果，不宣稱全網不存在合格聲庫。DiffSinger的Apache-2.0程式授權不會替聲庫授權。
OpenVPI推論需DS音符／音素資料與相容模型設定；OpenUtau聲庫的ONNX封裝不等於可直接套用OpenVPI訓練checkpoint。沒有以不相容套件盲跑。

## Qwen3-TTS實際嘗試
- 官方Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign模型卡為Apache-2.0，支援文字描述聲線及情緒。官方文件不保證本案非語言笑聲或與DiffSinger角色相同。
- 主機：Python3.12、9個CPU、約9.7GiB RAM，沒有偵測到GPU；無GPU不等於絕對不能跑。採CPU/bfloat16/eager嘗試，不使用FlashAttention。
- 建立獨立svs-env，qwen-tts0.1.1；首次torch2.14.1+cpu與torchaudio2.11.0不相容，實際失敗於音訊動態函式庫載入。
- 已修正為torch2.11.0+cpu、torchaudio2.11.0+cpu。模型權重下載曾出現遠端連線中斷；環境另缺SoX執行檔。
- 隨後工具自動安全審查拒絕執行：模型執行觸發與要求推論無關的Microsoft遙測端點，傳送內容未建立且未授權。未繞過重跑；沒有把此判斷擴大成Qwen模型本身必然含惡意行為。
- test_laughter.py已備妥3句無關故事的虛構測試語句，每句一次，沒有真人參考、克隆或訓練；但三段音訊都未成功輸出。laughter-report.json記錄最終阻礙。
- 目前不能聲稱失敗音訊可供試聽，因為失敗發生於有效輸出之前。

## 要求交付的實際狀態
| 檔案／驗收 | 結果 |
|---|---|
| instrumental.wav | 已產生，沿用原伴奏 |
| yuan_vocal.wav / liheng_vocal.wav | 未產生，聲庫資格未過 |
| duet_preview.wav / solo_preview.wav | 未產生，沒有兩條獨立合成人聲可混音 |
| 三段笑場WAV | 未產生，執行受阻 |
| MIDI／音符事件 | 已產生候選，未經音樂校正 |
| 歌詞／音節 | 未確認，不填假資料 |
| 自然度、中文咬字、角色一致性 | 未測／未通過 |
| iPhone Safari | 新音訊不存在；未測／未通過 |

## 真正剩餘條件
需要兩套可直接推論、允許本篇虛構角色使用的華語男聲聲庫及相容封裝，並完成15秒歌詞／音節人工校正。Qwen執行須先查清被攔截遙測的來源與傳送範圍，取得必要授權或經審查確認安全的執行方式；不透過隱藏網路行為繞過攔截。本輪停止，不自行付費、聯絡聲庫作者、變更角色或發布。

官方來源：
https://github.com/openvpi/DiffSinger
https://github.com/openvpi/DiffSinger/blob/main/docs/GettingStarted.md
https://github.com/openutau/OpenUtau
https://github.com/QwenLM/Qwen3-TTS
https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
聲庫具體來源見voicebank-screen.json。
