# KOOKEE KOOKEE 來源與播放檢查（v0.3 候選）

歌曲來源查核：2026-11-08。播放器官方文件複核：2026-11-09。新日期只代表這次實際查過的播放文件，沒有把舊歌曲資料說成已全部重新查證。此輪資料代理只修改 `music.js` 與本檔；網站整合由主代理完成。

## 2026-11-09：使用者回報的錯誤 153

使用者回報：直接打開 HTML 檔（`file:`）時，小屋播放器顯示 **153**。這是實際使用者回報，不再記成「未知代碼」；此輪資料代理沒有另操作瀏覽器重現，也沒有逐一確認兩支影片，因此 `playbackObservations` 不擅自指定新觀察的影片 ID。

[YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) 定義：153 表示缺少 `HTTP Referer` 或等效的 API 用戶端身分。使用者的 file 開檔結果與此定義相符；不能把「未部署」當成已查明的唯一原因，也不能承諾上 HTTPS 就會修好。

同份文件另定義：101／150 是片主不允許嵌入，100 是影片找不到、刪除或私人，5 是 HTML5 播放器相關問題，2 是參數錯誤。自動播放被擋有獨立的 `onAutoplayBlocked` 事件，不能當成 153。

[官方來源識別要求](https://developers.google.com/youtube/terms/required-minimum-functionality) 建議 `strict-origin-when-cross-origin`，不要抑制來源。部分 WebView 預設缺少 Referer，需要宿主 App 提供正確識別；網頁 JavaScript 不能偽造使用者的內建瀏覽器身分。

[播放器參數文件](https://developers.google.com/youtube/player_parameters) 說明 `origin` 用於 IFrame API 的來源保護。必須用實際頁面的 HTTP／HTTPS origin，不填假網域，也不能說這個參數在任何情況都能取代 Referer；`rel=0` 也不會關掉所有相關影片，只會限制為同頻道推薦。

## v0.3 建議的介面與診斷

1. 原作者外連保持主要入口，按鈕叫「到 YouTube 聽」。第二個按鈕叫「試試在小屋播放」，不能先說「已修好」。
2. `file:` 下不載 iframe，顯示 `explainError(153)`、`contextHint('file:')` 與原作者連結。這是說明嵌入限制，不是說歌曲不能在 YouTube 播。
3. HTTP／HTTPS 可在點按後試播，不自動播放、不循環。呼叫 `buildEmbedUrl(id, location.href, {api:true})`，只傳當前真正網址。
4. iframe 保留 `referrerpolicy="strict-origin-when-cross-origin"`，不用 `no-referrer`。播放器至少 200×200；窄螢幕的 16:9 容器也要有 `min-height:200px`。
5. 需要讀取錯誤時，點按後載入官方 `https://www.youtube.com/iframe_api`，用 `YT.Player` 綁定既有 iframe，接 `onError`、`onReady`、`onStateChange`、`onAutoplayBlocked`。`onReady` 不等於已播放；狀態 1 才是播放中。
6. `iframe.onload`、外框出現、逾時，都不能證明音樂已播放，也不能直接判成 153。拿不到代碼時，只說「還沒確認播放，可以到 YouTube 聽」。
7. 換頁時停止／銷毀播放器。診斷只顯示當次狀態和代碼，不送出照片、鳥名、完整本機路徑或遊戲紀錄，不另建追蹤服務。

### CSP 配合（此輪未修改）

保留 `frame-src https://www.youtube-nocookie.com`。若加入官方 IFrame API，現有只允許本機的 `script-src` 會擋住 API 腳本，需在既有來源／單檔雜湊之外加入 `https://www.youtube.com`。不要用 `*`、`unsafe-eval` 或關掉 CSP 來碰運氣；若實測另有官方腳本被擋，先記下真正來源再縮小調整。[MDN frame-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-src)、[MDN script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src)。

不要為 iframe 內部請求全面放寬主頁 `connect-src`；iframe 有自己的文件環境。也要確認頁面和 iframe 的來源政策沒有抑制 Referer，行為可查 [MDN Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)。

## 兒童導向網站的嵌入條件

[YouTube 嵌入說明](https://support.google.com/youtube/answer/171780) 要求：網站／App 若屬兒童導向，嵌入 YouTube 時需完成自我指定，使用 `youtube-nocookie.com` 也不能代替。[Google 指定工具](https://support.google.com/policies/answer/9664901) 說明網站／App 的處理方式。

本網站同時服務大人與兒童，適用分類仍需站主確認。目前未完成指定，也沒有替使用者登入、驗證網站或送出設定。對外發布前應確認此條件；暫不提供嵌入時，可以保留原作者的一般外連，這不等於宣稱其他隱私義務都不存在。

## v0.3 純函式與已做的檢查

- `explainError(code)`：回傳短句，支援 2、5、100、101、150、153，另用字串 `autoplay-blocked` 表達不同事件；未知代碼不猜原因。
- `contextHint(protocol)`：解釋直接開檔與 HTTP／HTTPS 的差別，不保證改網址就會好。
- `canTryEmbed(protocol)`：只有 HTTP／HTTPS 回傳 true，方便介面阻擋 file 試播。
- `buildEmbedUrl(videoId, pageUrl, {api:true})`：拒絕未知影片、非 HTTP／HTTPS 及含帳密的網址；使用真正 origin，明示不自播、不循環、保留控制列和行動裝置行內播放。需要 API 時加 `enablejsapi=1`。

語法檢查與 14 個純函式斷言通過，含已知／未知錯誤、file 阻擋、真正本機 origin、拒絕未知影片與帳密網址。這是本機邏輯測試，**不代表 HTTP／HTTPS 音樂已成功播放**。此輪沒有下載、重製歌曲，也沒有部署或外部寫入。

## 2026-11-08 已核實的歌曲來源

- [The Kiffness x Ginger the Cockatiel - Kookee Kookee (CLUB ANTHEM)](https://www.youtube.com/watch?v=1ElihbSM6ic)：YouTube 官方索引顯示作者 The Kiffness、Official Artist Channel，發布日 2023-03-10。影片 ID `1ElihbSM6ic`。這是使用者所說歌曲的官方音樂版，不把其他翻唱、循環播放或轉載影片標為原版。
- 該官方影片說明將原鳥聲作者列為 `@ginger397`（TikTok `@ginger_3112`），原素材連結為 [Ginger TikTok 原素材](https://vm.tiktok.com/ZMY5cJVnB/)。因此「歌曲的官方音樂版」與「原始鳥聲素材」分開呈現。
- [Ginger Cookies song 的官方 YouTube 頻道](https://www.youtube.com/channel/UCnJpPs-9ZxZJZFxQQ1JmuHw)：YouTube 官方索引明列 `http://www.youtube.com/@ginger397`；顯示名稱為 Ginger Cookies song。
- [cookiesong #originalcookiesinger Ginger…](https://www.youtube.com/watch?v=zzE64XhMTck)：YouTube 官方索引顯示作者 Ginger Cookies song，發布日 2023-11-18，影片 ID `zzE64XhMTck`。與官方頻道顯示名稱相符，作為原創作者本人鳥聲示範；**不宣稱這支是最早上傳或官方音樂版的原始素材**。

## 2026-11-08 的取得限制與播放紀錄

官方 YouTube 搜尋索引可讀取標題、作者、日期、頻道 handle 與音樂影片說明；直接開啟兩個 watch 頁與 handle 頁時，網頁工具回報 fetch error／cache miss。oEmbed 端點亦未能取得。後續在本機瀏覽器實際載入官方音樂版 iframe，播放器回「無法播放這部影片」，該項 `embedStatus` 已記為本機預覽不可用；不能由這次結果推論所有地區或瀏覽器都不能播。Ginger 示範片的嵌入仍未確認。原版 YouTube 連結保留為主要入口，沒有下載、重傳音檔、繞過限制或改用非官方轉載。

網站資料使用 `youtube-nocookie.com/embed/<id>`，未加自動播放或整天循環參數。主代理應採按需載入播放器，避免一開網頁就聯絡 YouTube；也要說明 YouTube 播放器音量與遊戲短鳴聲設定的差別。載入播放器只傳一般網站請求，不傳照片或本機遊戲紀錄。

## 文字與使用邊界

- 不收錄歌詞、不下載歌曲／影片、不把官方影片音訊包進遊戲或匯出檔。
- 「輕鬆聽」是休閒用途，不宣稱治療焦慮、改善疾病或所有鳥都會學會。
- 用短句提醒小聲、短暫、觀察鳥寶意願、不長時間循環；沒有提供醫療診斷或臆造音量／分鐘數閾值。
- 「原版」標在 The Kiffness 官方音樂版；Ginger 的示範另標，避免把較晚的 YouTube 上傳說成最早素材。
- 本次沒有呼叫可能使用付費額度的影片分析、轉錄或媒體下載工具，也沒有登入、傳訊、購買、發布或增加帳號權限。
