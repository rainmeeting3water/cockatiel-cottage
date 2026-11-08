# 原創鳥寶動作素材

工具：內建 `image_gen`，未使用 API 金鑰、外部付費素材庫或未授權照片。先製作黃化 4×4 連續格，再以相同 atlas 為參考，做原始灰與珍珠變體。角色、背景、相框圖示與裝飾為此專案製作；沒有下載或重製歌曲、網路鳥照或既有角色。

## 形態參考與限制

查核日 2026-11-08。參考長冠羽、長尾、羽色與腳趾等外形資料：[Animal Diversity Web](https://animaldiversity.org/accounts/Nymphicus_hollandicus/)、[World Parrot Trust](https://parrots.org/encyclopedia/cockatiel/)、[BirdLife Australia](https://birdlife.org.au/bird-profiles/cockatiel/)。這些連結的照片、音訊沒有打包或作為遊戲貼圖。

這是依真鳥形態描述產生的原創寫實遊戲圖，不是錄下真鳥、動作捕捉或精密生物力學。走路和飛行各 4 個姿勢，喝水、吃飯、理毛與唱歌各有姿勢，動作速度及路線為遊戲安排。不能用來辨識性別、年齡、情緒、疾病或保證學唱成功。

## 檔案

- `assets/bird-lutino.webp`、`bird-gray.webp`、`bird-pearl.webp`：各 1280×1280，4×4、每格 320×320，透明背景。
- `assets/lutino-walk.gif`：4 格；`lutino-flight.gif`：4 格；`lutino-care.gif`：8 格。可直接看動圖。
- `assets/sprites.json`：生成原檔名稱、尺寸、SHA-256 與切格紀錄。沒有把專案引用留在工具預設輸出目錄。

素材處理使用現有 Pillow 做等分切格、縮放與格式封裝，沒有重畫或人工改色。GIF 因格式限制使用二值透明度。原始透明 PNG 的近透明 RGB 在某些工具預覽會顯示色塊；實際瀏覽器疊合已檢查，沒有把色塊當成角色背景。

遊戲由 `motion.js` 換格並移動角色，位置限制在房間內；放風先經安全檢查。減少動畫時會停格，照顧仍能操作。生圖動作一致性、形態精準度仍可繼續改善，不宣稱照片級測量驗收。

## 實際提示集

黃化 atlas（新圖；透明背景）：

```text
Use case: photorealistic-natural. Asset type: original 2D animation sprite atlas for a Taiwanese educational cockatiel care game. Create ONE PNG atlas on true TRANSPARENT alpha, 1536 by 1536 square, exactly 4 columns by 4 rows of equal 384 by 384 cells. No cell borders, labels, text, background, floor, shadows or props. Sixteen full-body poses of THE EXACT SAME anatomically realistic adult LUTINO COCKATIEL, facing LEFT in a gentle three-quarter side profile. NOT cartoon, not rounded toy, not plush, not stylized emoji. Real fine overlapping plumage, slender parrot body, long tapered tail feathers, slim pale-yellow swept crest, pale ivory body and folded wing feathers, soft lemon-yellow face, orange round cheek patch, small real curved horn-grey beak, subtle dark reddish-brown eyes with natural tiny catchlight, pinkish scaly feet with zygodactyl toes. Same identity, anatomy, exposure, body scale and camera in all cells. Soft neutral studio lighting. Use authentic cockatiel gait and wing anatomy, never arms or hands. All feathers, crest and toes entirely within each cell with at least 24px clear margin. In each cell bird body center at x=192 y=205, no per-pose zoom or camera motion. Tail may trail lower-right. Ensure the atlas grid is machine-croppable exactly.
ROW 1 left to right, idle: neutral standing eyes open; blink eyes gently shut same body; curious slight head tilt same body; relaxed standing eyes open same body.
ROW 2 left to right, four walking-cycle phases: left foot forward right foot back; weight passing feet under body; right foot forward left foot back; weight passing opposite. Body stays same height, tiny natural head bob, believable alternating legs, wings folded.
ROW 3 left to right, care actions: leaning head down to sip from a bowl that is NOT drawn; small peck head lowered beak slightly open no bowl drawn; authentic preening head turned toward shoulder wing feathers; singing upright with beak slightly open and crest relaxed.
ROW 4 left to right, four flight-cycle phases: wings lifted high upward; wings spread broad mid-upstroke; wings sweeping down; wings partly folded on recovery. Flying to LEFT with body slightly horizontal, tail trailing right, feet tucked. Both wings clearly feathered, symmetric anatomy with one slightly foreshortened, full wing tips must fit cell. Keep same bird scale as other rows; if necessary all sixteen birds slightly smaller to keep all wing tips inside. This is original artwork informed by real cockatiel anatomy, not a copy of any existing photo.
```

原始灰（以黃化生成圖為編輯參考；透明背景）：

```text
Use case: identity-preserve. Edit this existing original 4 columns by 4 rows cockatiel sprite atlas. Change ONLY the bird feather coloration to a realistic normal GRAY adult male cockatiel: charcoal and soft grey body/long tail/flight feathers, white wing patches, lemon yellow head and crest, orange cheek patch, dark brown-black eyes. Keep EXACTLY the same 16 poses, anatomy, silhouette, pixel layout, 4x4 equal grid, camera, scale, transparency and feather detail as the supplied atlas. Do not move or crop any bird. Maintain genuine transparent alpha background. No text, props, tile borders, floor or shadows. This needs to drop in as the same animation atlas with only the feather-color variant changed.
```

珍珠（以黃化生成圖為編輯參考；透明背景）：

```text
Use case: identity-preserve. Edit this existing original 4 columns by 4 rows cockatiel sprite atlas. Change ONLY the bird feather coloration to a realistic PEARL cockatiel: warm grey/olive-grey wing and body feathers with clear cream scalloped pearl spots on each feather, lemon pale yellow face and crest, orange cheek patch, dark eyes, long gray-and-cream tail. Keep EXACTLY the same 16 poses, anatomy, silhouette, pixel layout, 4x4 equal grid, camera, scale, transparency and realistic feather detail as the supplied atlas. Do not move or crop any bird. Maintain genuine transparent alpha background. No text, props, tile borders, floor or shadows. This needs to drop in as the same animation atlas with only the feather-color variant changed.
```

輸出未完全遵照提示的像素尺寸及眨眼要求，因此使用真實輸出尺寸切格，不宣稱每一格都達到生物動作或閉眼要求。最終檔案及雜湊以 `VERSION.json` 為準。


## v0.3 圖解與自己的鳥寶

七張照顧速覽、八種照顧主題圖解及食物圖示為本專案直接繪製的原創 SVG，沒有使用第三方圖片。圖示只幫忙理解，文字條件與原始獸醫來源仍保留；急症方向不折疊。

創作室提供可替換 4×4 圖集的提示與本機預覽。使用者自己提供的照片及生成素材不會被收入本專案、相簿或共用提示；請自行確認使用權。網站不把參考照送到 AI，不能保證外部模型能一次生成合格的透明圖集，仍需逐格看角色一致性、腳趾、冠羽、尾羽與翅膀。
