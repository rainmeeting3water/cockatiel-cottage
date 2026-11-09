# 公開分享紀錄與後續計畫

使用 GitHub 分享原始碼，GitHub Pages 提供試玩。不新增 Netlify、帳號、AI API、雲端相簿或資料權限。

## 已確認的線上基底

- 公開儲存庫：[rainmeeting3water/cockatiel-cottage](https://github.com/rainmeeting3water/cockatiel-cottage)。任何人都能查看、下載程式與原創素材；MIT 的素材範圍見 LICENSE 與 THIRD-PARTY-NOTICES.md。
- 正式試玩：[玄鳳小日子](https://rainmeeting3water.github.io/cockatiel-cottage/)。網站也是公開的，任何人都能開啟；個人相簿與存檔仍留在各自瀏覽器。
- Pages 已依使用者後續授權啟用，來源是 `main` 的 `/docs`，建置類型 legacy。
- v0.3.1 已發布基底：`8586f9700a73150549625754a74a6f1bd43b89fa`。Pages build 1352167918、deployment 7639775631，2026-11-09 02:11:10（臺灣）成功。
- 先前「Pages 保持關閉、尚未上傳」是啟用前的歷史狀態，不代表目前狀態。

## v0.4 更新方式

本候選加入中英介面、三種字級及 README 試玩／下載／兩種中英提示詞。來源身分見 VERSION.json，公開目錄完整清單見 PUBLIC-FILES.json；本機產檔狀態不是發布成功紀錄。

1. `node tools/package.cjs` 產生單檔體驗版和來源雜湊；`node tools/build-public.cjs` 依白名單更新 docs/ 與公開清單。皆不安裝、不連網、不執行 Git 或發布。
2. 完成測試與敏感資料核對後，暫存、commit、push 各取得明確同意，只暫存清單內檔案，不強制推送，不更改 remote／upstream。
3. **現在 push 到 main 會觸發既有 Pages 更新**。同一批只走一次這條發布路徑，不另手動建置 Pages 或部署 Netlify。
4. 推送前重查遠端 main 與 main/docs 設定；若其他人已更新則先停下核對。發布後讀回來源 commit、build／deployment 識別及臺灣時間，再驗證 HTTPS 靜態檔、手機排版、語言字型、重載存檔與聽歌外連。失敗或不確定先查看既有部署，不重複發布。
5. 本機 ZIP 保留前版與新候選。若需要恢復，以經同意的新提交修復，不改寫或刪除公開歷史。

## 影音與費用

公開版使用原作者 YouTube 外連，不載入 iframe，也不宣稱站內播放或錯誤 153 已修好。外部影音、機構原文、字型原檔、使用者照片不在 MIT 授權範圍。不使用付費建置、AI API 或雲端相簿。實際服務方案以官方說明為準：[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。
