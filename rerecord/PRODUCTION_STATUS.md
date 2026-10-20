# 最新增量：第八幕確認時序已修復

見 [TIMING_ACCEPTANCE_20261020.md](TIMING_ACCEPTANCE_20261020.md) 及 [PICKUP_PLAN_20261020.md](PICKUP_PLAN_20261020.md)。新版Test d985922 已部署並操作驗證。自然雙人／笑場及Safari實機仍未通過，不發布正式站。以下為歷史紀錄。

# 本輪最新狀態（2026-10-20 Test修復）

本輪唯一有效結論見 [TEST_ACCEPTANCE_20261020.md](TEST_ACCEPTANCE_20261020.md)。Test已部署73b14a5；35項測試通過、18項線上素材一致。新增雙聲線混音候選及結局播放，但自然雙人演唱、笑場、iPhone Safari實機未完成，releaseReady=false。正式站本輪未修改。以下舊時間點紀錄僅供追溯，不代表目前狀態。

# 再錄一次 — Render 驗收站已上線，正式版仍未驗收完成

## 最新狀態：2026-10-20 13:53（以下舊紀錄僅供追溯）

- 使用者要求繼續完成上線，已採 B 作為目前優先聲線；不代表所有聽感項目均通過。
- 可玩驗收站：https://love-stories-rerecord-test.onrender.com/ 。Render service `srv-dbbg1761egvs73ftu3e0`，部署 `dep-dbbg17m1egvs73ftu4d0` live，發布 commit `a5ac91451cfc0c203550c2e76898f8fad3f3f42c`。
- 公開測試分支 `test/rerecord-render-20261020`；正式首頁與其他六篇故事未加入此未完成故事。
- 14 張既有正式照片已轉 WebP，維持 1024×1536；線上全部圖片與 2 個歌曲 MP3 的 SHA256 與本地相符，16/16。
- 兩段播放採相同 15 秒來源演唱及伴奏；原唱與 Voice-Swap / Liam Bailey 替換版已接入，瀏覽器實際點擊兩個播放按鈕成功。未新生成歌曲。
- 雲端 Chrome 已走完三種主要計畫；刪除錄音分支無回放按鈕、對應圖片正確；隱藏視角有先前時間標示且無音訊；留言、略過隱藏視角、創作者留話、重玩均已操作。
- 已用虛構測試留言從測試站取得真實 AI 回覆。正式 API 只額外允許精確測試站 Origin，且可用 STORY_TEST_ORIGIN 關閉；其他來源仍拒絕。API commit `63455e20320b467b4f2b244d93a2e2f7a2908f2f`，部署 `dep-dbbg2t8m7kps73es8hkg` live。
- 17 項前端邏輯／素材測試及 21 項既有後端測試通過。這不等於 iPhone Safari 實機或聽感驗收。
- 尚缺三段具合法授權且與角色一致的笑場錄音；未用假音訊、低品質 AI 笑聲或靜音代替。相關位置如實標示未完成。
- iPhone Safari 實機、實際遊玩時間、聲音自然度與逐字咬字仍未驗收。releaseReady 保持 false。
- 手機尺寸測試頁 mobile-check.html 已推至測試分支的後續 commit，但 Render 自動部署尚未觸發；目前不能說該頁已上線。
- 下一步應取得三段可用笑場素材並驗收、完成實機 QA，再將測試站版本合併正式站。不得因重複催促改寫劇情或虛報驗收。

2026-10-20 Asia/Taipei。使用者已核准完整版本驗收後上線，並確認 Render My Workspace。已購買 Mureka US$10 API 額度；核准本次音樂總花費上限 US$5，不授權自動儲值或升級 Render。已明確同意只向 Mureka 傳送正式原創歌詞與必要音樂描述，不傳完整劇本、玩家留言或私人內容。不改寫劇情、不向使用者透露故事內容。

## 已完成
- 四項劇本邏輯修訂寫入 model.mjs；model.test.mjs 的 11 項測試通過，涵蓋九種決策／錄音組合與隱藏視角上下文。仍待瀏覽器驗收。
- 14 張場景／分支照片已放入 assets；來源為本對話內建 imagegen，固定同一角色參考。第五、七、九幕使用修正版 sibling v2，經 media.json 映射。已逐張視覺檢查，仍待 iPhone 載入／裁切實測。
- app.mjs 已實作場景、選擇、音訊控制、留言、隱藏視角及法器請求；第三幕音訊已修為選擇後才可播放。缺少素材且尚未 iPhone 驗收，不能當作正式版。
- 原首頁與既有六篇故事、法器服務未修改。

## 正式服務
- Repository: yang510224-bot/Love-stories
- Frontend: https://love-stories-yang.onrender.com
- API: https://love-stories-reply-api.onrender.com/api/respond
- API 接收 story、choices（最多15項，各截140字）、expectation、words。
- Draft branch: feat/rerecord-20261020。main 自動部署，完成驗收前不得合併。

## 音訊來源實測
- ACE-Step 1.5：官方 https://github.com/ace-step/ACE-Step-1.5 ，軟體 MIT；歌曲生成、cover、repaint 可望保持同旋律兩版本，但實際品質仍須驗收。
- 官方試用 https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- 已能讀取設定與API。以不含故事資訊的通用 la la 歌詞，透過官方 Gradio client 實測生成，回覆：You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota.
- 尊重額度限制，不換匿名身份、代理或鏡像重試。
- 先前公開試用站傳送曾被拒絕。現在取得的是 Mureka 官方 API 的限定授權，不得將此擴大為其他公開試用站授權。
- Runway 因使用者只有免費版且反映付費門檻，不繼續該路線。
- Suno 官方 free plan 允許 personal non-monetizing project，但下載、改作與本站用途仍待具體核對，尚未採用。

## 尚待完成
1. Mureka 已可用；不再重試 Gradio ZeroGPU。完成下述正式音訊品質驗收。
2. 固定原創旋律，測試兩個不同男聲的演唱／替換版；製作三種笑場音訊，需相同聲音可回放；不用朗讀充當歌唱。
3. 照片已補齊、尺寸及檔案檢查已過；網站實際載入／裁切仍待驗收。
4. 分支畫面及 AI 實際上下文、iPhone 測試、圖片載入與裁切、全分支驗收。
5. media.json 的 releaseReady 只能在完整驗收後改為 true；部署後回查網址與實際內容。

## 已知待修
- model.mjs 第三幕 promise 分支已確認有先行「不嫌」回覆；回放仍待相應音訊實作。
- 第九幕保留錄音與刪除錄音，必須使用不同畫面；刪除分支及隱藏視角不可重播予安錄音。
- 時長 8–12 分鐘尚未實測，不能對外聲稱達成。

## Mureka 實測紀錄（2026-10-20 00:59）
- 無關故事的中文男聲測試：使用者試聽後同意繼續；成本 US$0.15。
- 正式原版候選 song 167248759160833：89.910 秒，成本 US$0.15。
- 換聲 remix 候選 song 167249056956417：112.190 秒，成本 US$0.20。
- 兩個 MP3 已下載至 rerecord/audio，均通過 ffmpeg 完整解碼。解碼成功不等於男聲自然度、雙人聲線或旋律一致性驗收通過。
- Remix 改變長度，未達成只換人聲的要求；禁止直接接入正式比較播放，也不能只裁切長度便宣稱旋律一致。
- 已確認餘額 950 美分，累計花費 50 美分。原版雙軌分離任務 formal-stems-20261020 已提交部署，預估 20 美分，結果與扣款待回查。不得重送相同任務。
- media.json 保持 releaseReady=false、audio 空集合；候選音訊不當成合格正式素材。
- 後端使用有期限、確切餘額守門、單次送單且不自動重試的任務。任務結束後清空 MUREKA_PRODUCTION_JOB；不得讀取或輸出 MUREKA_API_KEY。
- 01:01 更新：WAV 分軌回傳 HTTP 400；官方 schema 僅接受 MP3/M4A。已改同首 MP3 啟動 formal-stems-mp3-20261020，未重新生成歌曲。確切 950 美分餘額守門通過，證實前次 400 未扣款。
- 測試更新：13 項通過（11 項邏輯及 2 項素材守門）；包含最長中文留言的 UTF-8 位元組大小檢查。releaseReady=false 時素材齊備測試不代表正式素材已完成。
- 01:02 更新：MP3 分軌成功，費用 20 美分；總花費 70 美分、餘額 930 美分。MUREKA_PRODUCTION_JOB 已清空，停用設定部署 dep-dbb4ptei0phs73evau50。
- 原版 vocal.wav 與 instrumental.wav 已解壓至 audio/original-stems，皆 44.1 kHz、雙聲道、每聲道 3,965,031 樣本、89.910 秒；完整解碼成功。這證明長度相同，不代表換聲版本同旋律，亦未替代聽感驗收。

## 01:23 checkpoint — 尚未發布
- 新測試 /v1/track/generate：task 167250390745089，song 167250499862530，89.870 秒，成本 9 美分。累計 79 美分、餘額 921 美分。停用任務部署 dep-dbb4tiei0phs73evmoh0 已 live。
- check-audio.py 比較原人聲與新聲軌：估計包絡偏移 -0.32 秒；1,079 個共同有聲框中，八度折疊音高差在 100 cents 內僅約 30.7%。這是粗略篩選，不是聽感判定或精確旋律證明；仍未獲得可驗收的同旋律換聲。
- 共同作曲署名已補回予安，三個計畫對應三張不同場景；AI payload 加入開始播放的音訊歷史，明確不等於聽完或刪除後回播。
- 17 項測試通過，包括 14 張 PNG 尺寸／比例、三分支畫面、九種結果、共同署名、隱藏視角與中文留言大小。語法檢查通過。這不是端到端 QA。
- Managed preview 依 Sites skill 啟動失敗：bwrap: Can't mount proc on /newroot/proc: Operation not permitted。sites-preview status 為 stopped。未繞過平台限制、未另起非核准伺服器；iPhone browser QA 未完成。
- 合成留言直連 /api/respond 收到 403；程式確認要求正式前端 Origin。未繞過來源限制，live AI reply 仍未驗收。
- 三段一致聲線的笑場錄音仍缺；不能以無聲、朗讀或隨機笑聲代替。
- 可研究 ElevenLabs Voice Changer（保留原表演／節奏的聲音轉換，非再作曲）；歌唱品質仍須先測。尚未傳送任何正式素材至 ElevenLabs、未建立新付費方案、未取得其 API key。若採用，需新增第三方素材傳送授權及確認費用／授權；不可把現有 Mureka 授權擴張使用。
- .openai/hosting.json 僅本地 QA 設定並已 gitignore；正式架構仍為原 GitHub/Render，首頁及其他六篇故事未變。

## 01:24 授權更新
- 使用者已明確同意將已生成的原創人聲傳到 ElevenLabs Voice Changer 測試；可再生成音樂。不要再詢問同一項傳送授權。
- 不新增付費訂閱、不傳完整劇本／玩家留言，維持原 US$5 花費上限，直到另有明確變更。
- 本地 ELEVENLABS_API_KEY 未設定；正在只核對 Render 變數名稱，不顯示或提取任何秘密值。
- Render Environment 已實際核對：只有 MUREKA_API_KEY、MUREKA_PRODUCTION_JOB、MUREKA_SMOKE_DEADLINE、MUREKA_SMOKE_RUN、OPENAI_API_KEY；未設定 ELEVENLABS_API_KEY，也沒有 linked environment group。沒有顯示秘密值。換聲測試目前被缺少憑證阻擋，尚未送單或扣款。

## 01:35 更新（取代前述缺金鑰狀態）
- ElevenLabs 後端唯讀檢查 HTTP 200，金鑰有效。tier=free，character_count=0，character_limit=10000，max_credit_limit_extension=0。未生成、未新增扣款。
- 使用者已明確選擇非商業發布並同意來源標註；不再詢問此授權，不新增訂閱。
- 頁面 title 與 footer 已加入 elevenlabs.io 歸屬標註；目前仍是未發布草稿，不代表已完成換聲。
- 正式後端僅新增可開關的唯讀診斷，main commit 8105b90ae06fa1cd7e97df81d73231136613496d；ELEVEN_PREFLIGHT_ENABLED=1。不記錄秘密或原始帳戶資料。12 項後端測試通過。
- ElevenLabs Voice Changer 尚未送單：需要有次數／額度保護的轉換任務與安全音訊取回流程；禁止把配額查詢成功當作換聲成功。
- releaseReady 仍 false；同旋律雙聲線、三段笑場、iPhone browser QA、live AI reply 均仍未驗收。原本六篇不動。

## 01:40 ElevenLabs 實際音訊已取回
- 使用者 01:38 明確批准將 10 秒既有原創人聲與臨時下載憑證暫存 Render 設定。僅此範圍，不能擴張成整首或永久暫存授權。
- job voice-test-20261020-01 已單次成功：HTTP 200、161375 bytes，eleven_multilingual_sts_v2 / JBFqnCBsd6RMkjVDRZzb。沒有自動重送。
- audio/eleven-voice-test.mp3 已下載，ffmpeg 全檔解碼成功，ffprobe 10.057143 秒。來源為原有 vocal.wav 的第 20–30 秒，未傳完整劇情。
- 粗略自相關診斷：包絡偏移 0 秒，共同有聲 258 frames，八度折疊音高差中位數 515.62 cents；不足以驗收同旋律與自然歌聲。不可只依 HTTP 200 宣稱歌唱品質合格。
- ELEVEN_VOICE_TEST 已清空；清除部署 dep-dbb5bqqjnfac73f21dt0，須確認 live。下載端點僅暫存記憶體，部署後消失；未公開掛入正式網站。
- 01:40:17 已確認清除部署 live；後端額度回查已用 167 / 10000 credits，剩餘 9833。未產生額外付費訂閱。

## 01:44 使用者聽感驗收失敗
- 使用者明確表示 ElevenLabs 換聲「不太入戲、不太好聽」。該音檔正式淘汰，不可接入媒體清單，也不可再次當成可用候選。
- Mureka 官方 SongRegionEditReq 僅有 song_id/upload_audio_id、lyrics、edit_start、edit_end；無角色聲線或保持旋律的明確控制。沒有為此發送付費任務。
- 從原始 Mureka native song 截出 20–35 秒，audio/native-singing-preview.mp3；這不是新生成，也未變更劇情或正式選項。原曲聽感仍未由使用者驗收。
- 未能完成全部發布條件，不可稱已完整上線；不得以使用者反覆催促為由降低原定驗收標準。

## 固定旋律 SVC 路線（使用者 01:46 新指令）
- 本輪範圍縮為雙聲線 15 秒技術驗證，通過前不繼續完整歌曲或網站整合。不生成整首、不追加儲值、不重設現有金鑰。
- audio/svc-proof 固定人聲／伴奏為原始 stems 第 20–35 秒；各 661500 samples / 44.1 kHz。5 項輸入固定檢查通過，並非 SVC 成功。既有 17 項回歸測試仍通過。
- 技術、模型授權、停止條件、聽感／數值驗收、真人笑場錄音及獨立 Render Test 後續流程已記錄於 PROTOCOL.md。沒有變更劇情、分鏡、圖片與正式服務。
- 本機 Python 3.12.14、無 Torch、無可見 nvidia-smi；RVC 官方支援 CPU，不能宣稱無 GPU 就不能測。
- 實際阻礙：本輪尚未找到兩個適合男性角色且能核實說話者同意與模型使用權的 checkpoint；沒有下載未知來源模型、沒有新增第三方傳送、沒有轉換輸出。需要使用者提供兩組已授權模型／錄音，或授權新增有授權歌手庫的 SVC 服務評估。Voice-Swap 僅是候選，不是已通過的替代品。
