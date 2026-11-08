/* Links to the creators' YouTube uploads. No music, lyrics or video files are bundled. */
globalThis.CottageMusic = {
  checked: '2026-11-09',
  mediaSourcesChecked: '2026-11-08',
  playbackDocsChecked: '2026-11-09',
  intro: '一起聽 KOOKEE KOOKEE！喜歡鸚鵡的你可以輕鬆聽，鳥寶想跟著唱，也可以試試。',
  videos: [
    {
      id: '1ElihbSM6ic',
      title: 'KOOKEE KOOKEE｜官方音樂版',
      originalTitle: 'The Kiffness x Ginger the Cockatiel - Kookee Kookee (CLUB ANTHEM)',
      creator: 'The Kiffness × Ginger',
      creatorUrl: 'https://www.youtube.com/@TheKiffness',
      published: '2023-03-10',
      url: 'https://www.youtube.com/watch?v=1ElihbSM6ic',
      embedUrl: 'https://www.youtube-nocookie.com/embed/1ElihbSM6ic?rel=0&playsinline=1',
      kind: 'official-music',
      note: '這是 The Kiffness 官方頻道的音樂版。把 Ginger 的鳥聲，變成大家熟悉的歌。',
      embedStatus: 'unavailable-in-local-preview-2026-11-08'
    },
    {
      id: 'zzE64XhMTck',
      title: '聽 Ginger 自己唱',
      originalTitle: 'cookiesong #originalcookiesinger Ginger #จิงเจอร์ปุ๊ดๆ #cookiesong #cockatiel',
      creator: 'Ginger Cookies song（@ginger397）',
      creatorUrl: 'https://www.youtube.com/@ginger397',
      published: '2023-11-18',
      url: 'https://www.youtube.com/watch?v=zzE64XhMTck',
      embedUrl: 'https://www.youtube-nocookie.com/embed/zzE64XhMTck?rel=0&playsinline=1',
      kind: 'creator-birdsong',
      note: '想先聽鳥寶自己唱？這支是 Ginger 頻道的示範影片。',
      embedStatus: 'not-confirmed'
    }
  ],
  tips: [
    '小聲聽一會兒，陪牠一起玩。',
    '鳥寶躲開、想休息，就先停下來。',
    '不一定每隻都會唱，也不用整天重播。',
    '開心聽歌就好；這不是治療，也不是照顧鳥寶的代替品。'
  ],
  privacy: '按下試播，才會連到 YouTube；要聽歌，也可以直接到原頻道看。影片的音量、廣告和播放限制由 YouTube 提供。',
  fallback: '這裡沒播出來，也可以到原作者的 YouTube 繼續聽。',
  playerPolicy: {
    referrerPolicy: 'strict-origin-when-cross-origin',
    minimumWidth: 200,
    minimumHeight: 200,
    autoplay: false,
    loop: false,
    apiScriptUrl: 'https://www.youtube.com/iframe_api',
    privacyEmbedHost: 'https://www.youtube-nocookie.com',
    childDirectedDesignation: 'not-completed',
    note: '如果網站屬於兒童導向，YouTube 要求站主另外完成指定；隱私加強模式不能代替這一步。'
  },
  playbackObservations: [
    {
      date: '2026-11-08',
      context: 'local-preview',
      videoId: '1ElihbSM6ic',
      code: null,
      result: 'unavailable-message',
      evidence: '前版瀏覽器檢查只看見無法播放提示，當時沒有取得錯誤代碼。'
    },
    {
      date: '2026-11-09',
      context: 'file:',
      videoId: null,
      code: 153,
      result: 'user-reported-error',
      evidence: '使用者回報直接開啟 HTML 檔的小屋播放器顯示 153；本次資料代理未另操作瀏覽器重現。'
    }
  ],
  origin: {
    creator: 'Ginger（@ginger397／@ginger_3112）',
    youtubeChannel: 'https://www.youtube.com/@ginger397',
    originalSourceUrl: 'https://vm.tiktok.com/ZMY5cJVnB/',
    note: 'The Kiffness 官方影片說明把這個 TikTok 連結列為原始鳥聲素材；上面的 Ginger YouTube 示範影片不宣稱是最早上傳。'
  },
  sources: [
    {title: 'The Kiffness 官方 YouTube 影片與說明', url: 'https://www.youtube.com/watch?v=1ElihbSM6ic', checked: '2026-11-08'},
    {title: 'Ginger 官方 YouTube 頻道', url: 'https://www.youtube.com/channel/UCnJpPs-9ZxZJZFxQQ1JmuHw', checked: '2026-11-08'},
    {title: 'Ginger 頻道的 Cookie Song 示範影片', url: 'https://www.youtube.com/watch?v=zzE64XhMTck', checked: '2026-11-08'},
    {title: 'YouTube 官方播放器錯誤代碼與事件', url: 'https://developers.google.com/youtube/iframe_api_reference', checked: '2026-11-09'},
    {title: 'YouTube 官方播放器參數', url: 'https://developers.google.com/youtube/player_parameters', checked: '2026-11-09'},
    {title: 'YouTube 官方嵌入方式與兒童導向網站提醒', url: 'https://support.google.com/youtube/answer/171780', checked: '2026-11-09'},
    {title: 'YouTube 官方來源識別與最低功能要求', url: 'https://developers.google.com/youtube/terms/required-minimum-functionality', checked: '2026-11-09'},
    {title: 'Google 兒童導向網站指定工具說明', url: 'https://support.google.com/policies/answer/9664901', checked: '2026-11-09'}
  ]
};

/* Pure helpers: callers provide the real page URL; these functions do not access storage or the network. */
Object.assign(globalThis.CottageMusic, {
  explainError(code) {
    if (code === 'autoplay-blocked') return '瀏覽器沒有讓影片自己開始。請按 YouTube 播放器裡的播放鍵。';
    const messages = {
      2: '影片連結的設定不太對。先到原作者的 YouTube 聽，我們再修好這裡的連結。',
      5: '這個播放器現在沒辦法播這部影片。可以換一般瀏覽器試試，或到 YouTube 聽。',
      100: 'YouTube 找不到這部影片；影片可能已刪除或設為私人。可以到原作者頻道看看。',
      101: '這部影片不開放在其他網站裡播放。請到原作者的 YouTube 聽。',
      150: '這部影片不開放在其他網站裡播放。請到原作者的 YouTube 聽。',
      153: 'YouTube 沒有收到這個網頁的來源資料，所以無法在這裡播。請到原作者的 YouTube 聽；你的鳥寶紀錄沒有壞掉。'
    };
    const key = typeof code === 'number' || typeof code === 'string' ? String(code) : '';
    return Object.hasOwn(messages, key) ? messages[key] : '這次沒有取得能判斷原因的錯誤代碼。可以到原作者的 YouTube 聽，不用一直重試。';
  },
  contextHint(protocol) {
    const kind = String(protocol || '').toLowerCase().replace(/:$/, '');
    if (kind === 'file') return '你現在是直接打開 HTML 檔，YouTube 可能收不到網頁來源。這個版本先用「到 YouTube 聽」；鳥寶和存檔都不受影響。';
    if (kind === 'http' || kind === 'https') return '你現在從網頁開啟小屋。能不能在這裡播，還要看影片設定、瀏覽器和來源資料；不能播時就到 YouTube 聽。';
    return '這個開啟方式不一定能讓 YouTube 認出網頁來源。請用原作者的 YouTube 連結聽歌。';
  },
  canTryEmbed(protocol) {
    return ['http', 'https'].includes(String(protocol || '').toLowerCase().replace(/:$/, ''));
  },
  buildEmbedUrl(videoId, pageUrl, options = {}) {
    if (!globalThis.CottageMusic.videos.some(video => video.id === videoId)) throw new Error('請使用小屋已查核的原作者影片。');
    let page;
    try { page = new URL(String(pageUrl)); } catch (_) { throw new Error('需要這個網頁真正的網址，才能準備播放器。'); }
    if (!['http:', 'https:'].includes(page.protocol) || page.username || page.password) throw new Error('直接開檔時，請用「到 YouTube 聽」的原作者連結。');
    const target = new URL('https://www.youtube-nocookie.com/embed/' + videoId);
    target.searchParams.set('autoplay', '0');
    target.searchParams.set('controls', '1');
    target.searchParams.set('playsinline', '1');
    target.searchParams.set('rel', '0');
    target.searchParams.set('loop', '0');
    // origin is the caller's actual HTTP(S) origin, never a made-up published domain.
    target.searchParams.set('origin', page.origin);
    if (options.api !== false) target.searchParams.set('enablejsapi', '1');
    return target.href;
  }
});
