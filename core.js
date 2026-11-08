/* Original, dependency-free game and save logic. No network or browser storage access. */
(function (root) {
  'use strict';

  const VERSION = 2;
  const MAX_LOG = 40;
  const COLORS = ['lutino', 'gray', 'pearl'];
  const AGES = ['young', 'adult', 'senior'];
  const CARE_KEYS = ['water', 'food', 'clean', 'company'];
  const HAZARD_KEYS = ['window', 'fan', 'pets', 'objects'];
  const STAGE_MESSAGES = [
    '一起練習：離開前檢查環境，讓鳥寶回到安全的鳥籠。',
    '第一次：收到安全提醒。下次離開前，請完成安全檢查。',
    '第二次：故事中的鳥寶精神不佳。先排除危險；真鳥出現異常時應聯絡鳥類獸醫。',
    '第三次：故事中的鳥寶生病了。練習聯絡鳥類獸醫，不能靠遊戲的換水或餵食治療。',
    '第四次：故事中的鳥寶飛走或狀況不明。遊戲可以重來，真實生命未必能重來。'
  ];

  function fail(message) { throw new Error(message); }
  function plain(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) &&
      (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  }
  function keys(value, allowed, label, required = allowed) {
    if (!plain(value)) fail(label + '格式不正確。');
    const own = Object.keys(value);
    if (own.some(key => !allowed.includes(key))) fail(label + '含有無法辨識的欄位。');
    if (required.some(key => !Object.hasOwn(value, key))) fail(label + '缺少必要欄位。');
  }
  function bool(value, label) { if (typeof value !== 'boolean') fail(label + '必須是是／否。'); return value; }
  function integer(value, min, max, label) {
    if (!Number.isSafeInteger(value) || value < min || value > max) fail(label + '超出可接受範圍。');
    return value;
  }
  function stamp(now) { return integer(now === undefined ? Date.now() : now, 0, 8640000000000000, '紀錄時間'); }
  function text(value, min, max, label) {
    if (typeof value !== 'string' || [...value].length < min || [...value].length > max || /[\u0000-\u001f\u007f]/u.test(value)) fail(label + '格式不正確。');
    return value;
  }
  function member(value, list, label) { if (!list.includes(value)) fail(label + '選項無法辨識。'); return value; }
  function bird(value) {
    keys(value, ['name', 'color', 'age'], '鳥寶設定');
    const name = text(value.name, 1, 20, '鳥寶名字');
    if (!name.trim()) fail('請給鳥寶一個名字。');
    return {name, color: member(value.color, COLORS, '羽色'), age: member(value.age, AGES, '年齡階段')};
  }
  function settings(value) {
    keys(value, ['muted', 'reducedMotion'], '偏好設定');
    return {muted: bool(value.muted, '靜音'), reducedMotion: bool(value.reducedMotion, '減少動畫')};
  }
  function care(value) {
    keys(value, CARE_KEYS, '照顧紀錄');
    return Object.fromEntries(CARE_KEYS.map(key => [key, integer(value[key], 0, 100, '照顧數值')]));
  }
  function hazards(value) {
    keys(value, HAZARD_KEYS, '環境檢查');
    return Object.fromEntries(HAZARD_KEYS.map(key => [key, bool(value[key], '環境項目')]));
  }
  function session(value) {
    keys(value, ['status', 'startedAt'], '使用狀態');
    return {status: member(value.status, ['active', 'safe', 'review'], '使用狀態'), startedAt: stamp(value.startedAt)};
  }
  function log(value) {
    if (!Array.isArray(value) || value.length > MAX_LOG) fail('照顧日記格式不正確。');
    return value.map(entry => {
      keys(entry, ['at', 'type', 'text'], '日記');
      return {at: stamp(entry.at), type: member(entry.type, ['care', 'safety', 'departure', 'vet', 'profile'], '日記類型'), text: text(entry.text, 1, 220, '日記文字')};
    });
  }

  function validateState(value) {
    keys(value, ['version', 'bird', 'settings', 'care', 'hazards', 'safeMode', 'session', 'misses', 'stage', 'vetPracticed', 'log'], '存檔');
    if (value.version !== VERSION) fail('存檔版本不支援。');
    const result = {
      version: VERSION,
      bird: bird(value.bird), settings: settings(value.settings), care: care(value.care), hazards: hazards(value.hazards),
      safeMode: bool(value.safeMode, '安全模式'), session: session(value.session),
      misses: integer(value.misses, 0, 100000, '確認疏忽次數'), stage: integer(value.stage, 0, 4, '故事階段'),
      vetPracticed: bool(value.vetPracticed, '看診練習'), log: log(value.log)
    };
    if (result.stage !== Math.min(4, result.misses)) fail('故事階段與確認次數不一致。');
    if (result.safeMode !== (result.session.status === 'safe')) fail('安全模式與使用狀態不一致。');
    if (result.stage === 4 && result.safeMode) fail('鳥寶狀況不明，不能確認已安全回籠。');
    if (result.safeMode && safetyIssues(result).length) fail('安全模式中的檢查紀錄不完整。');
    return result;
  }
  function clone(state) { return validateState(state); }
  function addLog(state, type, message, now) {
    state.log.push({at: stamp(now), type, text: message});
    state.log = state.log.slice(-MAX_LOG);
    return state;
  }

  function createState(now) {
    return {
      version: VERSION,
      bird: {name: '小米', color: 'lutino', age: 'adult'},
      settings: {muted: true, reducedMotion: false},
      care: {water: 40, food: 55, clean: 45, company: 65},
      hazards: {window: true, fan: true, pets: true, objects: true},
      safeMode: false, session: {status: 'active', startedAt: stamp(now)},
      misses: 0, stage: 0, vetPracticed: false, log: []
    };
  }
  function safetyIssues(state) {
    return [...HAZARD_KEYS.filter(key => state.hazards[key]), ...['water', 'food', 'clean'].filter(key => state.care[key] < 70)];
  }
  function performCare(state, action, now) {
    const next = clone(state);
    member(action, ['water', 'food', 'clean', 'play', 'rest'], '照顧動作');
    if (next.stage === 4) return addLog(next, 'care', '目前狀況不明，照顧按鈕無法讓鳥寶回來。可以回顧原因，再重新開始故事。', now);
    const messages = {
      water: '換上新鮮飲水，也洗淨了水碗。',
      food: '準備合適的食物；真實份量與換食請向鳥類獸醫確認。',
      clean: '清理籠底、食碗與髒污，並確認清潔用品與環境安全。',
      play: '邀請鳥寶一起玩；牠可以拒絕，也可以自己安靜待著。',
      rest: '給鳥寶安靜的空間休息，陪伴也包括不打擾。'
    };
    if (['water', 'food', 'clean'].includes(action)) next.care[action] = 100;
    if (action === 'play') next.care.company = Math.min(100, next.care.company + 15);
    if (action === 'rest') next.care.company = Math.min(100, next.care.company + 5);
    return addLog(next, 'care', messages[action] + (next.stage >= 3 ? ' 照顧不等於治療；請練習向鳥類獸醫求助。' : ''), now);
  }
  function resolveHazard(state, key, now) {
    const next = clone(state);
    member(key, HAZARD_KEYS, '環境項目');
    if (!next.hazards[key]) return next;
    next.hazards[key] = false;
    const labels = {window: '關妥門窗並確認紗窗可靠', fan: '關閉吊扇並等扇葉完全停止', pets: '將貓狗隔離在另一個安全空間', objects: '移除熱源、電線、煙霧及危險物品'};
    return addLog(next, 'safety', labels[key] + '。', now);
  }
  function activateSafeMode(state, now) {
    const next = clone(state);
    if (next.stage === 4) fail('鳥寶目前狀況不明，無法確認回籠。請先回顧安全原因。');
    if (safetyIssues(next).length) fail('請先完成環境檢查、換水、備餐與清潔，再開啟安全模式。');
    if (next.safeMode) return next;
    next.safeMode = true;
    next.session.status = 'safe';
    return addLog(next, 'safety', '完成離開前檢查，讓鳥寶回到安全鳥籠，開啟安全模式。', now);
  }
  function startSession(state, now) {
    const next = clone(state);
    next.safeMode = false;
    // A new play session starts a fresh safety exercise, without offline care loss.
    next.hazards = {window: true, fan: true, pets: true, objects: true};
    next.session = {status: 'active', startedAt: stamp(now)};
    return next;
  }
  function confirmDeparture(state, kind, now) {
    const next = clone(state);
    member(kind, ['forgot', 'technical', 'safe'], '離開補確認');
    if (kind === 'safe') {
      // Claiming a safe departure must still complete the recorded checklist.
      return activateSafeMode(next, now);
    }
    if (kind === 'forgot') {
      next.misses = Math.min(100000, next.misses + 1);
      next.stage = Math.min(4, next.misses);
      next.safeMode = false;
      next.session = {status: 'active', startedAt: stamp(now)};
      return addLog(next, 'departure', STAGE_MESSAGES[next.stage] + ' 這是教學劇情，不是疾病機率或真鳥診斷。', now);
    }
    next.safeMode = false;
    next.session = {status: 'active', startedAt: stamp(now)};
    return addLog(next, 'departure', '已確認是技術中斷、仍在使用或原因不明，不記錄為照顧疏忽。', now);
  }
  function practiceVet(state, now) {
    const next = clone(state);
    next.vetPracticed = true;
    return addLog(next, 'vet', '練習先聯絡鳥類獸醫，描述觀察到的症狀與可能接觸物；不自行用藥，也不假定看診必定治癒。', now);
  }
  function updateBird(state, update, now) {
    const next = clone(state);
    keys(update, ['name', 'color', 'age'], '鳥寶設定更新', []);
    next.bird = bird({...next.bird, ...update});
    return addLog(next, 'profile', '更新鳥寶的名字、羽色或年齡階段。羽色不代表不同物種，也不決定個性。', now);
  }
  function updateSettings(state, update) {
    const next = clone(state);
    keys(update, ['muted', 'reducedMotion'], '偏好設定更新', []);
    next.settings = settings({...next.settings, ...update});
    return next;
  }

  // v1 is the same base model, before stage, vetPracticed, session and reducedMotion existed.
  // Existing v1 values are retained. Newly introduced fields alone receive defaults.
  function migrateV1(value) {
    keys(value, ['version', 'bird', 'settings', 'care', 'hazards', 'safeMode', 'session', 'misses', 'stage', 'vetPracticed', 'log'], '舊版存檔', ['version', 'bird', 'settings', 'care', 'hazards', 'safeMode', 'misses', 'log']);
    keys(value.settings, ['muted', 'reducedMotion'], '舊版偏好設定', ['muted']);
    const misses = integer(value.misses, 0, 100000, '確認疏忽次數');
    const safeMode = bool(value.safeMode, '安全模式');
    return validateState({
      ...value, version: VERSION,
      settings: {...value.settings, reducedMotion: value.settings.reducedMotion === undefined ? false : value.settings.reducedMotion},
      stage: value.stage === undefined ? Math.min(4, misses) : value.stage,
      vetPracticed: value.vetPracticed === undefined ? false : value.vetPracticed,
      session: value.session === undefined ? {status: safeMode ? 'safe' : 'active', startedAt: 0} : value.session
    });
  }
  function parseSave(raw) {
    if (typeof raw !== 'string' || raw.length > 262144) fail('存檔必須是 256 KB 以內的 JSON 文字。');
    let value;
    try { value = JSON.parse(raw); } catch (_) { fail('存檔不是有效的 JSON，原有紀錄尚未更動。'); }
    if (!plain(value) || !Number.isSafeInteger(value.version)) fail('存檔缺少有效的版本編號。');
    if (value.version > VERSION) fail('這份存檔來自較新的版本，請先更新網站；原有紀錄尚未更動。');
    if (value.version === 1) return migrateV1(value);
    if (value.version !== VERSION) fail('這個存檔版本尚未支援，原有紀錄尚未更動。');
    return validateState(value);
  }
  function serialize(state) { return JSON.stringify(validateState(state), null, 2); }

  root.CottageCore = Object.freeze({VERSION, MAX_LOG, COLORS: Object.freeze(COLORS), AGES: Object.freeze(AGES), STAGE_MESSAGES: Object.freeze(STAGE_MESSAGES), createState, validateState, safetyIssues, performCare, resolveHazard, activateSafeMode, startSession, confirmDeparture, practiceVet, updateBird, updateSettings, parseSave, serialize});
})(typeof globalThis === 'undefined' ? window : globalThis);
