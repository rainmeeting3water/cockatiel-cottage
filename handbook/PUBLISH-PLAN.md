# 公開分享紀錄與後續計畫

建議只用一套服務：GitHub 放原始碼；GitHub Pages 放試玩網站。暫不建立 Netlify 網站，也不新增帳號或資料權限。

- 建議擁有人：已連接的 `rainmeeting3water`。
- 已建立：[rainmeeting3water/cockatiel-cottage](https://github.com/rainmeeting3water/cockatiel-cottage)。2026-11-09（臺灣）建庫時曾確認為公開空庫；本批準備首次上傳 v0.3.1 原始碼、MIT 與提示詞，目標分支 main。Pages 保持關閉，不新增 Actions、Webhook 或其他部署設定。
- 建議網站網址：`https://rainmeeting3water.github.io/cockatiel-cottage/`。這是預計網址，目前沒有發布。
- Pages 來源：`main` 分支的 `/docs`。`docs/` 只放 `PUBLIC-FILES.json` 列出的靜態網站檔。
- 原始碼公開後，任何人都能查看、複製程式、提示詞與原創遊戲素材；個人的瀏覽器照片與存檔不在其中。
- Pages 網站公開後，任何人都能開啟。它和原始碼儲存庫是兩種公開內容；公開程式本身不會自動建立網站。

## 預備完成的檔案

執行 `node tools/package.cjs`，只更新單檔體驗版及來源版本雜湊。執行 `node tools/build-public.cjs`，只依白名單複製靜態檔到 `docs/` 並更新完整 `PUBLIC-FILES.json`。兩者皆不安裝、不連網、不執行 Git 或發布。

## 正式公開前

1. 先前已取得建立公開庫與 MIT 授權同意；本次另取得將 v0.3.1 程式、MIT 和兩份提示詞上傳 GitHub 的指示。使用者明確要求 Pages 先不要開啟；上傳原始碼不包含網站發布、付費服務或照片上傳。外部影音、機構原始文章、字體原檔及使用者照片不在 MIT 範圍。
2. 本批依個人 AGENTS.md 逐項核對 Git 暫存、commit 與首次 push 授權。採獨立本機檢出目錄與明列檔案，不使用萬用暫存、不變更 remote 或 upstream、不強制推送。推送後另讀回分支、檔案與 Pages 狀態，實際成功以驗證紀錄為準。
3. 設定 Pages 前確認 main/docs 與公開清單。第一次推送不包含自動部署設定，避免先上線後才詢問。啟用 Pages 需獨立的公開發布同意。
4. Pages 啟用後，未來 main/docs 的 push 會觸發更新；同一批只採這條發布路徑，不再額外部署 Netlify。
5. 上線後實測 HTTPS、圖片、手機排版、存檔、本機照片、YouTube。記錄來源 commit、部署識別及臺灣時間；YouTube 153 是否解決，以實際播放為準。

注意：YouTube 對兒童導向網站有額外自我指定要求，即使使用隱私加強播放器也一樣。正式網站未完成相關設定前，應使用外連收聽版本；不可宣稱 nocookie 等同不會與 YouTube 交換資料。來源見 MUSIC-SOURCES。

不使用付費建置、AI API 或雲端相簿。GitHub Pages 適用性與方案以正式發布前的官方說明為準：
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

恢復方式：本機保留 v0.2 與 v0.3 ZIP。未來若發布出錯，先保留失敗證據，修正後經同意以新版本更新；不強制推送，不任意刪除遠端紀錄。
