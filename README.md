# 玄鳳小日子｜Little Cockatiel Days v0.4

陪鳥寶換水、吃飯、散步，也一起學會安全照顧。手機和電腦都能玩，不用登入。

**[▶ 直接試玩](https://cockatiel-cottage.pages.dev/)　｜　[下載完整程式 ZIP](https://github.com/rainmeeting3water/cockatiel-cottage/archive/refs/heads/main.zip)　｜　[換成自家鳥寶](#換成自家鳥寶)**

**English:** [Play online](https://cockatiel-cottage.pages.dev/) · [Download source ZIP](https://github.com/rainmeeting3water/cockatiel-cottage/archive/refs/heads/main.zip). Choose **English** at the top. Open **Settings → Text size** for larger text. Your saves and photos stay on your device.

## 先選一個入口

| 你想做什麼？ | 從這裡開始 |
| --- | --- |
| 直接玩，不下載 | [開啟正式試玩網站](https://cockatiel-cottage.pages.dev/) |
| 下載程式、自己修改 | [下載 ZIP](https://github.com/rainmeeting3water/cockatiel-cottage/archive/refs/heads/main.zip)，解壓縮後開啟 `standalone.html` |
| 從零做專屬鸚鵡網站 | 提示詞一：[繁體中文](handbook/01-建立專屬鸚鵡網站.txt) · [English](handbook/01-build-your-parrot-website-en.txt) |
| 保留這個遊戲，只換自家鳥寶 | 提示詞二：[繁體中文](handbook/02-換成自家鳥寶.txt) · [English](handbook/02-use-your-own-bird-en.txt) |

## 第一次來，這樣玩

1. 開啟網站，按「編輯鳥寶」，取個暱稱、選羽色。
2. 一起換水、備餐、清理；鳥寶想安靜待著，也讓牠休息。
3. 放風前先做安全檢查，離開前確認回籠並開啟安全模式。
4. 想聽 KOOKEE KOOKEE，按「到 YouTube 聽原版」，會另開原作者影片。

頁面上方可切換 **繁體中文／English**；「設定」裡有 **標準／大字／特大字**。遊戲、圖卡、對話框和輸入欄會一起切換，自己的鳥寶暱稱保留原文。

紀錄只存在目前的瀏覽器。換裝置、換網址或清除瀏覽器資料前，先匯出；照片相簿要另外備份。舊本機 HTML 與正式網址的紀錄不會自動相通。

## 把程式下載回家

1. 按上面的「下載完整程式 ZIP」，或 GitHub 的 **Code → Download ZIP**。
2. 解壓縮，打開資料夾裡的 `standalone.html`。角色與動畫已包含，不需安裝套件。
3. 聽歌需要網路；本機檔若出現 YouTube 153，請按原作者外連。

已有 Node.js 的電腦，也可在專案資料夾執行 `node preview.cjs`，再開啟 `http://127.0.0.1:4173`。這只開本機預覽，Ctrl+C 停止，不會發布網站。

## 換成自家鳥寶

只想先試外觀，可以直接開啟 [鳥寶創作室](https://cockatiel-cottage.pages.dev/#creator)：

**選自己的照片 → 複製提示詞 → 自己選圖片工具 → 匯入 16 格動作圖 → 試走、試飛 → 確認套用。**

網站不會自動生圖或傳送照片。是否把照片另交給圖片工具，由你決定；對方可能收費。這只換掉你自己這次看到的角色，不會改掉所有網友的鳥寶；重新整理後會回到原角色，請自行保存動作圖。

English: open the [Bird Creator](https://cockatiel-cottage.pages.dev/#creator), prepare your prompt, choose an image tool yourself, then import and preview a 16-frame atlas. This website does not upload your photo or call an AI service. Your custom bird lasts only for this page session.

## 給程式助手的兩種提示詞

把【括號裡】改成自己的選擇，再複製整段給 Codex 或你信任的程式助手。兩份用途不同：第一份從零建站，第二份保留這個遊戲、換自己的角色。也可讀 [完整操作說明](handbook/START-HERE.md) 與 [動作圖規格](handbook/CREATOR-PROMPTS.md)。

Choose a prompt below, replace the placeholders, and paste it into your coding assistant. Prompt 1 builds a new website; prompt 2 uses this project and changes your own bird.

<details>
<summary>① 從零建立自己的鸚鵡網站｜繁體中文</summary>

```text
請幫我從零規劃並製作一個「認識鸚鵡與互動照顧」網站，先交付能在本機預覽、可以試玩的第一版，不要公開發布。

我的設定：
- 鳥種：【填鳥種】
- 鳥寶暱稱：【填暱稱】
- 羽色與外觀：【填羽毛、冠羽、臉頰、尾巴等特徵】
- 喜歡的樣子與操作方式：【填風格、配色、手機或電腦偏好】

先檢查工作環境及專案規則，簡短說明會做哪些部分、會改哪些檔案，再開始。請先做一隻鳥的核心版本；不要為了追求功能多而重寫整個專案。鳥種不確定時先向我確認，也可以先完成通用版面，不要猜測牠的飲食與照顧需求。

介面以自然的繁體中文為主，小學、國中生也要看得懂。請提供繁體中文／English 切換、可調的文字大小，以及適合各語言的字體；輸入欄、按鈕、對話框和相框文字也要一起切換，不自動翻譯使用者自己的鳥名。用圖片、短標題和一句話圖卡先說重點，需要時再展開詳細說明。按鈕大一點，字不要太小；手機、電腦、觸控與鍵盤都要好操作。語氣像溫柔的朋友，不要堆專有名詞、用公文語氣或寫太長的句子。

請完成這些核心內容：
1. 認識這個鳥種的基本習性、日常需要、常見外觀與長期照顧責任。同一物種的羽色變異不代表不同物種，也不能直接決定個性。照片只能參考外觀，不能拿來判定健康或性別。
2. 可搜尋的食物查詢，分清楚「可適量」「需要避免」「資料不足」。列出處理方式與重要條件；沒有可靠證據就標資料不足，搜尋不到也不能推定安全。不要隨便替所有鳥訂同一份克數或飲食比例。
3. 換水、準備食物、清潔、陪玩、休息與安全放風。鳥寶平常也可以自己待著，不必一直點按。先邀請再互動，牠不想玩就給牠空間；不強抓，也不靠挨餓訓練。
4. 放風前檢查門窗、吊扇、貓狗、熱源與其他危險物品；離開前確認回到安全的鳥籠。技術中斷、當機或不確定的離開不能直接當疏忽，應有不扣分的補確認。不要用離線時間偷偷降低數值，或讓鳥寶在玩家不知道時死亡。
5. 照顧數值、提醒故事與醫療費用練習都要說明是遊戲簡化，不是真實疾病機率、報價、診斷或照顧保證。遊戲可以重新開始，真實生命未必能重來。

飲食、毒物與健康內容請查可靠的鳥類獸醫、獸醫機構或獸醫手冊，例如適用於該鳥種的 AAV、VCA、Merck／MSD 資料，附來源連結及實際查核日期。不同來源有差異就保留差異，不要假裝有唯一答案。不能把玄鳳資料直接套在其他鳥種，也不要給自行用藥劑量。

真鳥出現呼吸困難、嚴重虛弱、持續出血或疑似中毒時，畫面要清楚說：小朋友先找照顧的大人，立刻聯絡可接診鳥類的獸醫或急診。不要讓遊戲流程拖延求助，也不要讓換水、餵食或點數代替看診。

圖片與動態請使用原創、已明確授權或我有權使用的素材。先固定同一隻鳥的外觀，再做自然的眨眼、理毛、走路與拍翅；不要把不同角色的圖片硬湊在一起。提供靜音、停止聲音及減少動畫，並尊重裝置的減少動態設定。音樂若要加入，使用原作者的合法連結或播放器，不下載重製別人的歌曲，也不要自動大聲播放。

第一版免登入、不用後端。遊戲紀錄保存在自己的瀏覽器，提供匯出、匯入及重置前確認。清楚說明換裝置、換網址、清除瀏覽器資料或關閉無痕視窗可能失去紀錄；版本更新先驗證舊存檔，不直接覆寫不相容的原始紀錄。

如果加入鳥寶照片牆，先做每個人自己的本機私人相簿，可挑相框、預覽與下載成品。照片不要上傳到雲端或 GitHub，不要當成公開共用牆；處理照片時縮小圖片並移除拍攝資訊。相簿備份與遊戲備份是否分開，要說清楚。不要蒐集兒童生日、位置、聯絡資料或照片中的人臉，也不要加入公開聊天。

若使用開源專案，保留它的授權及必要說明。程式授權不等於別人的照片、影片、歌曲、文章或字型也能一起使用；不確定權利的素材先不要公開。

請完成核心版本後再檢查：手機排版、按鈕大小、鍵盤、主要互動、安全模式、存檔／重載、匯入／匯出、異常離開補確認及資料來源。用合成資料測試，不放真實個人紀錄。分清楚程式測試、模擬手機、真實手機及專業審閱，不把沒有測過的部分寫成通過。

最後提供可預覽的檔案、簡單操作方法，以及已完成、未完成、實際檢查與仍需鳥類獸醫審閱的部分。若需要安裝或升級套件、付費、帳號憑證、登入、把照片交給外部 AI、新增資料權限、上傳程式或公開發布，先說明用途與影響，再問我；不要把這份要求當成部署或付費批准。
```

</details>

<details>
<summary>① Build your own parrot website｜English</summary>

```text
Please help me plan and build a website about learning about parrots and practising their daily care. Start with a playable first version that I can preview locally. Do not publish it.

My settings:
- Bird species: [enter the species]
- Bird’s nickname: [enter the nickname]
- Colours and appearance: [describe the feathers, crest, cheeks, tail and other features]
- Preferred look and controls: [enter the style, colours, and phone or computer preferences]

First inspect the working environment and project rules. Briefly explain what you will make and which files you will change, then begin. Build the core experience for one bird first. Do not rewrite the whole project just to add more features. If the species is uncertain, ask me to confirm it. You can work on a general layout while waiting, but do not guess the bird’s diet or care needs.

Use natural Traditional Chinese as the main interface language, with wording that primary and junior high school students can understand. Lead with pictures, short headings and one-sentence cards. Let people open details when needed. Use large buttons and readable text. Support phones, computers, touch and keyboards. Sound like a kind friend: avoid piles of technical terms, formal official language and very long sentences.

For this version, also provide a switch between Traditional Chinese and simple English, with adjustable text size and readable font choices. Choose an appropriate font stack for each language, and keep Traditional Chinese characters readable when they appear in English mode. Use available, properly licensed fonts; ask before downloading or installing anything new. Keep the bird’s nickname exactly as the user entered it in either language. Do not translate or replace it automatically. Check and implement these features in this local version; do not claim they are already deployed or available to every user.

Please include these core parts:
1. Introduce the species’ usual behaviour, daily needs, common appearances and the long-term responsibility of care. Feather colour variations within one species are not different species and do not determine personality. Photos can guide appearance, but cannot be used to diagnose health or determine sex.
2. Make a searchable food guide with separate labels for “Suitable in small amounts”, “Avoid” and “Not enough information”. Explain preparation and important conditions. When reliable evidence is missing, label it “Not enough information”. No search result does not mean a food is safe. Do not assign the same number of grams or diet ratio to every bird.
3. Include changing water, preparing food, cleaning, gentle play, rest and safe time outside the cage. The bird can spend quiet time alone; the player should not need to keep clicking. Invite interaction first. Give the bird space if it does not want to play. Do not forcefully grab it or use hunger to train it.
4. Before time outside the cage, check doors, windows, ceiling fans, cats, dogs, heat sources and other hazards. Before leaving, confirm that the bird is back in a safe cage. A technical interruption, crash or uncertain departure must not automatically count as neglect. Provide a follow-up confirmation without a penalty. Do not secretly reduce scores while the player is offline or let the bird die without the player knowing.
5. Clearly label care scores, reminder stories and practice vet costs as game simplifications. They are not real disease probabilities, prices, diagnoses or guarantees of care outcomes. A game can restart; a real life may not get another chance.

For diet, toxins and health information, consult reliable bird vets, veterinary organisations or veterinary manuals. Examples include AAV, VCA and Merck/MSD information that applies to the chosen species. Include source links and the actual dates the sources were checked. If sources differ, keep that difference visible rather than pretending there is one answer. Do not apply cockatiel information directly to another species. Do not provide medicine doses for self-treatment.

If a real bird has trouble breathing, severe weakness, ongoing bleeding or possible poisoning, show a clear message: children should get the adult responsible for the bird, and contact a vet or emergency clinic that treats birds immediately. The game must not delay getting help. Changing water, feeding or earning points cannot replace a veterinary visit.

Use original images and animations, clearly licensed assets, or materials that I have the right to use. Fix one consistent bird design first, then make natural blinking, preening, walking and wing-flapping actions. Do not join pictures of different characters and pretend they are the same bird. Provide mute, stop-sound and reduced-motion controls, and respect the device’s reduced-motion preference. If music is added, use a lawful link or player from the original creator. Do not download and reproduce someone else’s songs, and do not automatically play loud audio.

The first version should need no login or backend. Store game records in the user’s own browser, with export, import and confirmation before reset. Explain that changing device or URL, clearing browser data, or closing a private-browsing window may lose records. Before a version update, test older saves. Do not overwrite an incompatible original save.

If you add a bird photo wall, start with each person’s own private local album, with frame choices, previews and downloads. Do not upload photos to the cloud or GitHub, or make the album a public shared wall. Resize photos and remove camera metadata during processing. Clearly explain whether album backups and game backups are separate. Do not collect children’s birthdays, locations, contact information or faces in photos. Do not add public chat.

If you use an open-source project, keep its licence and required notices. A code licence does not grant permission to reuse someone else’s photos, videos, songs, articles or font files. Do not publish assets when their rights are uncertain.

After completing the core version, check phone layouts, button sizes, keyboard use, main interactions, safety mode, saving and reloading, import and export, follow-up confirmation after an unexpected exit, and sources. Use synthetic test data, not real personal records. Distinguish code tests, simulated phone viewports, real-phone tests and professional review. Do not report an untested part as passed.

Finally, provide the files I can preview, simple operating instructions, what is finished, what is not finished, what was actually checked, and what still needs a bird vet’s review. Before installing or upgrading packages, spending money, using account credentials, logging in, sending photos to an external AI service, requesting new data permissions, uploading code or publishing, explain the purpose and impact, then ask me. This request is not permission to deploy or spend money.

Git staging, committing, pushing and website publication each need separate consent. Explain the exact action and target before asking. Approval for one step is not approval for the others.
```

</details>

<details>
<summary>② 保留這個遊戲，只換自家鳥寶｜繁體中文</summary>

```text
我已下載「玄鳳小日子」專案，想把角色換成自己家的鳥寶。請先讀目前檔案、專案規則、README，以及 handbook/CREATOR-PROMPTS.md，確認實際版本和現有功能，再簡短說明做法。若資料夾是空的或缺少程式，先告訴我，不要假裝已完成。

我的設定：
- 專案位置：【填本機資料夾，或使用我已提供的專案】
- 鳥種：【填鳥種】
- 鳥寶暱稱：【填暱稱，不填人的真名】
- 外觀特徵：【填羽色、冠羽、臉頰、翅膀、尾羽等】

這次先用最小改動完成角色替換。保留繁體中文／English 切換與可調文字大小；字型要適合目前語言，使用者自己取的鳥名不自動翻譯。保留現有照顧互動、存檔相容、安全模式、異常離開補確認、私人相簿、布置、鍵盤操作、靜音、減少動畫及醫療聲明。不要因為換角色而重設原本的遊戲或刪除相簿，也不要改掉教學判定與安全條件。

先使用現有「鳥寶創作室」：
1. 讓我在自己的瀏覽器選一張有權使用、沒有拍到人臉或個人資料的鳥寶照片。照片只作外觀參考，不憑照片判定健康、性別、年齡或個性。
2. 依羽色與外觀幫我準備可複製的原創提示詞。完整動作規格沿用創作室與 handbook/CREATOR-PROMPTS.md；提示檔不要放照片本身、本機路徑、拍攝資訊、憑證或其他個人資料。
3. 由我自行選擇外部圖片工具，並決定是否另附照片。網站不會自動把照片傳給 AI，也不代表已包含付費生成額度。不要替我登入、付款或默默呼叫外部服務。
4. 我取得圖片後，再手動匯入創作室。動作圖必須是靜態 1280×1280 透明 PNG 或靜態 WebP，4×4 共 16 格，每格 320×320。順序為：0～3 看四周／眨眼等待、4～7 走路、8 喝水、9 吃飯、10 理毛、11 唱歌、12～15 拍翅飛行。這裡的數字是程式索引，從 0 開始。
5. 沿用現有檔案大小、實際圖片格式、尺寸、透明背景與每格非空檢查。先讓我看完整 16 格，再試走路和飛行；每格都要是同一隻完整鳥寶，不能缺腳、多翅膀或切掉尾巴。檢查失敗要說明原因，保留原本可用的角色，不要硬把不合格圖片當成成功。
6. 我明確確認後，才套用到自己這次的小屋畫面；收到小屋成功回覆才顯示已套用。提供回到原本鳥寶的操作。所有圖片下載都保留可見預覽或文字備援，不能只有按鈕卻看不到結果。

請清楚說明：這只影響我自己的瀏覽器當次畫面，或我自己的本機專案副本，不會修改所有網友共用的官方網站。預設自訂角色在重新整理後會消失；相簿和遊戲存檔是另外的資料。若我希望以後打開仍保留自訂角色，這是另一個需要另外設計與測試的功能，請先說明保存位置、容量、備份與移除方式，再做；不要偷偷把大圖放進原有存檔。

不要把我的私人參考照片、相簿、備份檔或含個人資料的動作圖加入 GitHub、公開素材資料夾、提交或下載包。保留專案授權與必要的原創素材說明；外部 YouTube 影片、獸醫文章及字型原檔不因此變成本專案的 MIT 素材。

如果我的鳥種不是玄鳳，請先停在外觀示範，清楚標示目前照顧教材仍是玄鳳版。不要只換鳥名和圖片，就把玄鳳飲食與照顧內容當成新鳥種也適用。若我要做完整的新鳥種網站，應另外保留原版，獨立查可靠的鳥類獸醫資料、食物與危險條件，再審閱與測試；沒有證據的食物標資料不足。

這次完成後，請檢查角色走路、飛行、喝水、吃飯與理毛的格子順序，以及手機畫面、減少動畫、復原、重載後消失等行為；也確認原本的照顧、存檔、安全模式、相簿及醫療提醒仍正常。報告實際改動檔案與測過的項目，不把提示詞準備好或模型生成圖片，說成整個網站都已驗證完成。

先提供本機預覽，不公開發布。需要安裝或升級套件、付費、登入、把照片交給外部服務、新增資料權限、送上 GitHub 或部署網站時，都先說明再問我。Git 的暫存、提交、推送和網站發布，不能把一次批准當成全部都已批准。
```

</details>

<details>
<summary>② Use this project with your own bird｜English</summary>

```text
I have downloaded the “Little Cockatiel Days” (玄鳳小日子) project and want to replace its character with my own pet bird. First read the current files, project rules, README and handbook/CREATOR-PROMPTS.md. Confirm the actual version and existing features, then briefly explain your approach. If the folder is empty or code is missing, tell me first. Do not pretend the work is finished.

My settings:
- Project location: [enter the local folder, or use the project I have already provided]
- Bird species: [enter the species]
- Bird’s nickname: [enter a nickname, not a person’s real name]
- Appearance: [describe feather colours, crest, cheeks, wings, tail feathers and other features]

Use the smallest effective changes to replace the character. Preserve the existing care interactions, save compatibility, safety mode, follow-up confirmation after an unexpected exit, private album, room decorations, keyboard controls, mute, reduced motion and medical notices. Do not reset my game or delete my album because the character changes. Do not change learning checks or safety conditions.

For this version, also check and provide a Traditional Chinese/English switch, adjustable text size and readable font choices in my local copy. Use simple, accurate English and natural Traditional Chinese. Choose a suitable font stack for each language, including readable Traditional Chinese when it appears in English mode. Use available, properly licensed fonts; ask before downloading or installing new fonts. Keep my bird’s nickname exactly as I entered it in both modes, without automatically translating or replacing it. Do not assume these features are already deployed to every user. Report what this copy actually supports and what you changed.

Start with the existing “Bird Creator Studio”:
1. Let me choose a reference photo in my own browser. I must have the right to use it, and it must not show faces or personal information. Use it only as a reference for appearance. Do not use the photo to judge health, sex, age or personality.
2. Help me prepare a copyable prompt for an original character based on the bird’s colours and appearance. Follow the full action specifications in the studio and handbook/CREATOR-PROMPTS.md. The prompt file must not contain the photo itself, local paths, camera metadata, credentials or other personal information.
3. I will choose an external image tool and decide whether to attach the photo separately. The website must not automatically send photos to AI. It does not mean paid generation credits are included. Do not log in, pay or silently call an external service for me.
4. After I obtain the image, I will manually import it into the studio. The action sheet must be a static 1280×1280 transparent PNG or static WebP, arranged as 4×4 cells for a total of 16 frames. Every cell is 320×320. The frame order is: 0–3 looking around/blinking while idle; 4–7 walking; 8 drinking; 9 eating; 10 preening; 11 singing; 12–15 flapping in flight. These are program indexes starting at 0.
5. Keep the existing checks for file size, actual image format, dimensions, transparent background and non-empty content in every cell. Show me all 16 frames first, then try walking and flying. Every frame must show the same complete bird, with no missing feet, extra wings or cut-off tail. If a check fails, explain why and keep the original working character. Do not treat a failed image as a success.
6. Apply the character to my current cottage view only after I clearly confirm. Show “applied” only after receiving a successful reply from the cottage. Provide a way to return to the original bird. Every image download must have a visible preview or a text fallback, not just a button with no visible result.

Explain the scope clearly: this affects only my current browser view or my own local project copy. It does not change an official website shared by everyone. By default, the custom character disappears after a page reload. The album and game save are separate data. If I want the custom character to remain next time, treat that as a separate feature that needs its own design and tests. Explain where it will be stored, capacity limits, backups and removal before building it. Do not secretly put large images into the existing game save.

Do not put my private reference photos, album, backup files or action sheets containing personal information into GitHub, public asset folders, commits or downloadable packages. Keep the project licence and required notices for original assets. External YouTube videos, veterinary articles and original font files do not become this project’s MIT-licensed assets.

If my bird is not a cockatiel, stop at an appearance demonstration and clearly label the current care lessons as cockatiel-specific. Do not just change the name and pictures and claim that the cockatiel diet and care information applies to the new species. If I ask for a full website for another species, keep the original separately. Research reliable bird-vet sources, foods and hazard conditions for that species, then review and test them. Label foods without enough evidence “Not enough information”.

When finished, check frame order for walking, flying, drinking, eating and preening. Also check the phone layout, reduced motion, returning to the original character and the custom character disappearing after reload. Confirm that the original care interactions, saving, safety mode, album and medical warnings still work. Report the files actually changed and the checks actually performed. A finished prompt or a model-generated image does not mean the whole website has been verified.

Provide a local preview first. Do not publish. Before installing or upgrading packages, spending money, logging in, sending photos to an external service, requesting new data permissions, uploading to GitHub or deploying the site, explain what is needed and ask me. Git staging, committing, pushing and website publication each need separate consent. Approval for one action is not approval for all of them.
```

</details>

## 這版可以做什麼

- **先看圖學照顧**：七張原創圖解、八張可展開照顧卡與 24 項食物圖片查詢。急症提醒一直看得到。羽色不決定個性，資料不足的食物先不餵。
- **陪鳥寶過日子**：換水、備餐、清理、陪玩、安全放風。三款原創寫實角色會走、理毛、唱歌與飛行；這是遊戲動畫，不能判斷真鳥健康。
- **安心離開**：門窗、吊扇、貓狗、危險物品先檢查，再確認回籠。當機、斷線或不確定，不直接當疏忽；離線不扣分。
- **私人照片牆與布置**：五種相框、PNG 成品預覽、獨立相簿備份；八種小物與三種房間色調。照片只存在自己的瀏覽器，沒有公開牆。
- **鳥寶創作室**：本機參考照 → 複製提示詞 → 自行選擇圖片工具 → 匯入 16 格動作圖 → 試走、試飛 → 本次套用。網站不呼叫 AI、不上傳照片；生成工具由使用者自行選擇，可能收費。重新整理後回到原本角色。
- **原作者聽歌連結**：The Kiffness × Ginger 官方音樂版，以及 Ginger 本人示範。沒有下載重製歌曲。file 網址的 YouTube 153 是來源識別問題，與後端無關。線上版採外連收聽；嵌入需完成相關設定並實測。

## 授權

程式、提示詞與本專案原創遊戲素材已採 [MIT 授權](LICENSE)，可修改、分享與商用，需保留授權聲明。[素材範圍說明](THIRD-PARTY-NOTICES.md) 列出涵蓋與排除內容；外部影音、來源文章、字體原檔與使用者照片不因此變成 MIT。官方網站已可直接試玩；下載或另存程式不會替你自動發布新網站。後續操作範圍見 [發布紀錄與計畫](handbook/PUBLISH-PLAN.md)。

## 紀錄和照片放在哪裡

語言與字體大小分別記在這台裝置，不改原存檔格式，也不包含在照顧 JSON 備份裡。照顧使用 localStorage v2，可讀舊 v1／v2；布置獨立 v1。遊戲備份含照顧與布置，寫入失敗會嘗試還原並明示結果。照片放 IndexedDB，最多 12 張，需另外按「備份照片」。相片限 JPG／PNG／靜態 WebP，10 MB、2400 萬畫素以下；會縮小並重新編碼，不保留原檔拍攝資訊。拒絕 SVG、動圖與遠端圖片網址。

創作室的照片與動作圖只在本次記憶體，不存相簿、不進遊戲備份；請自行保存動作圖。16 格檢查只確認尺寸、透明度與非空，不會認出照片中的鳥，也不能判斷動作是否正確，需人工逐格看。

清除瀏覽器資料、結束無痕視窗、更換裝置／瀏覽器／網址／連接埠，可能失去或看不到紀錄。更新會先驗證舊資料，不保證所有未來版本相容，不相容原檔不直接覆寫。重新開始故事保留相簿與布置；重置前會確認。

免登入、無分析追蹤、雲端資料庫或公開聊天，不蒐集生日、位置或聯絡方式。照片不要拍到人臉、姓名、地址。網站不送出私人紀錄；按外部來源／YouTube 連結後，適用各服務政策。

## 照顧資料

飲食、毒物與醫療摘要來源見 `content.js` 與頁面連結，查核 2026-11-08；YouTube 播放規則另查核 2026-11-09。AAV 與 VCA 飲食比例建議不同，本版不提供通用克數、配比或用藥劑量。部分 AAV 網頁取得受限，限制保留在審閱紀錄。

真鳥呼吸困難、嚴重虛弱、持續出血或可能中毒，應立即找鳥類獸醫；小朋友先找照顧的大人。遊戲數值、四階段故事與醫療代幣都是教學設定，不代表疾病機率、報價或預後。

仍需鳥類獸醫審閱：[VETERINARY-REVIEW.md](VETERINARY-REVIEW.md)。動畫來源見 [ASSETS.md](ASSETS.md)，歌曲與播放查證見 [MUSIC-SOURCES.md](MUSIC-SOURCES.md)。已查閱個人字體清冊。繁中使用本機 Noto Sans TC／系統備援；英文使用裝置可用的 Inter、Segoe UI、Arial 或系統無襯線字體，輸入欄與相框也依語言選字體。沒有下載、安裝或散布字型；不同裝置會使用各自可用的備援字體。

## 修改與封裝

沒有外部程式依賴。`app.js` 整合頁面；`i18n.js` 與英文字典處理語言，`content-en.js` 提供英文照顧資料，`readability.css` 處理大字與字型；`core.js` 照顧；`motion.js` 動畫；`guides.js` 圖解；`creator.js` 本機創作；`gallery.js` 相簿；`decor.js` 布置；`backup.js` 組合備份。

```powershell
node --test tests/*.test.cjs
node tools/package.cjs
node tools/build-public.cjs
```

第一個跑本機測試。第二個更新單檔 `standalone.html` 與 `VERSION.json` 版本雜湊。第三個依固定白名單產生 `docs/` 與完整 `PUBLIC-FILES.json`，拒絕未知檔案或連結；不把相簿、備份、測試或教學文件放進網站。指令不安裝、不連網、不執行 Git、不發布。

實測與限制見 [TESTING.md](TESTING.md)。尚未做跨裝置同步、多鳥、公開相簿或網站內 AI 生圖；模擬手機不代表真實手機驗收。Git 與 Pages 公開操作仍需另外確認。
