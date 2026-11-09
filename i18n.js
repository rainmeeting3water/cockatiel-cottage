/* Local-only interface translation. User values and saved game data are never rewritten. */
(function (root) {
  'use strict';
  const KEY = 'cockatiel-cottage-language-v1';
  const LANGUAGES = ['zh-Hant-TW', 'en'];
  const ATTRIBUTES = ['aria-label', 'aria-description', 'aria-valuetext', 'title', 'placeholder', 'alt'];
  const SKIP_TAGS = new Set(['INPUT', 'TEXTAREA', 'PRE', 'CODE', 'SCRIPT', 'STYLE']);
  const exact = new Map(), rules = [], missing = new Set();
  const originalText = new WeakMap(), originalAttributes = new WeakMap();
  let language = 'zh-Hant-TW', observer = null, observedRoot = null, scheduled = false;
  const pending = new Set();
  try { const saved = root.localStorage?.getItem(KEY); if (LANGUAGES.includes(saved)) language = saved; } catch (_) { /* Private browsing may block storage. */ }
  const hasHan = value => /[\u3400-\u9fff]/u.test(value);
  const normalize = value => value.trim().replace(/\s+/gu, ' ');

  function english(source) {
    if (!source) return source;
    if (exact.has(source)) return exact.get(source);
    const normalized = normalize(source);
    if (exact.has(normalized)) return exact.get(normalized);
    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(source);
      if (!match || match.index !== 0 || match[0].length !== source.length) continue;
      rule.pattern.lastIndex = 0;
      return source.replace(rule.pattern, rule.replace);
    }
    if (hasHan(source) && source.length <= 600 && missing.size < 1000) missing.add(source);
    return source;
  }
  function t(value) {
    const source = String(value ?? '');
    if (language !== 'en' || !source.trim()) return source;
    const parts = /^(\s*)([\s\S]*?)(\s*)$/u.exec(source);
    return parts[1] + english(parts[2]) + parts[3];
  }
  function register(dictionary) {
    if (!dictionary || typeof dictionary !== 'object') return;
    const entries = Object.hasOwn(dictionary, 'exact') ? dictionary.exact : dictionary;
    for (const [source, target] of Object.entries(entries || {})) {
      if (typeof target === 'string') exact.set(normalize(source), target);
    }
    for (const item of dictionary.patterns || []) {
      if (Object.prototype.toString.call(item?.pattern) !== '[object RegExp]' || !['string', 'function'].includes(typeof item.replace)) continue;
      // Whole-string matching is checked again at runtime; global replacements are never used.
      rules.push({pattern: new RegExp(item.pattern.source, item.pattern.flags.replace(/[gy]/gu, '')), replace: item.replace});
    }
    if (observedRoot) queue(observedRoot);
  }
  function ignored(element) {
    for (let current = element; current && current.nodeType === 1; current = current.parentElement) {
      if (current.hasAttribute?.('data-i18n-ignore') || current.isContentEditable) return true;
      if (SKIP_TAGS.has(String(current.tagName).toUpperCase())) return true;
    }
    return false;
  }
  function translateText(node) {
    if (ignored(node.parentElement)) return;
    const current = node.nodeValue ?? '';
    let saved = originalText.get(node);
    if (!saved || (current !== saved.applied && current !== saved.source)) saved = {source: current, applied: current};
    const next = t(saved.source);
    saved.applied = next;
    originalText.set(node, saved);
    if (current !== next) node.nodeValue = next;
  }
  function translateAttributes(element) {
    if (element.hasAttribute?.('data-i18n-ignore') || element.isContentEditable) return;
    // Form values are user data. Only their interface attributes may be translated.
    if (['PRE', 'CODE', 'SCRIPT', 'STYLE'].includes(String(element.tagName).toUpperCase())) return;
    let records = originalAttributes.get(element);
    if (!records) { records = new Map(); originalAttributes.set(element, records); }
    for (const name of ATTRIBUTES) {
      const current = element.getAttribute?.(name);
      if (current === null || current === undefined) { records.delete(name); continue; }
      let saved = records.get(name);
      if (!saved || (current !== saved.applied && current !== saved.source)) saved = {source: current, applied: current};
      const next = t(saved.source);
      saved.applied = next;
      records.set(name, saved);
      if (current !== next) element.setAttribute(name, next);
    }
  }
  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) { translateText(node); return; }
    if (node.nodeType === 1) {
      if (node.hasAttribute?.('data-i18n-ignore') || node.isContentEditable) return;
      const parent = node.parentElement;
      if (parent && ignored(parent)) return;
      translateAttributes(node);
      if (SKIP_TAGS.has(String(node.tagName).toUpperCase())) return;
    }
    for (const child of Array.from(node.childNodes || [])) walk(child);
  }
  function metadata() {
    const doc = root.document;
    if (!doc) return;
    if (doc.documentElement) doc.documentElement.lang = language;
    const title = doc.querySelector?.('title');
    if (title) walk(title);
    const description = doc.querySelector?.('meta[name="description"]');
    if (description) {
      const source = '陪一隻玄鳳慢慢長大。認識玄鳳、查詢食物，在溫暖的小屋練習負責任的照顧。';
      const current = description.getAttribute('content');
      const translated = language === 'en' ? 'Meet cockatiels, check foods, and practice kind, responsible care in a cozy little cottage.' : source;
      if (current === source || current === 'Meet cockatiels, check foods, and practice kind, responsible care in a cozy little cottage.') description.setAttribute('content', translated);
    }
  }
  function apply(target) {
    const node = target || root.document?.body;
    if (node) walk(node);
    metadata();
    return node;
  }
  function emitChange() {
    if (typeof root.dispatchEvent !== 'function' || typeof root.CustomEvent !== 'function') return;
    root.dispatchEvent(new root.CustomEvent('CottageLanguageChanged', {detail: {language}}));
  }
  function setLanguage(next) {
    if (!LANGUAGES.includes(next)) throw new RangeError('Unsupported interface language.');
    const changed = language !== next;
    language = next;
    try { root.localStorage?.setItem(KEY, language); } catch (_) { /* Session language still works. */ }
    apply();
    if (changed) emitChange();
    return language;
  }
  function queue(node) {
    if (node) pending.add(node);
    if (scheduled) return;
    scheduled = true;
    const flush = () => {
      scheduled = false;
      const nodes = Array.from(pending); pending.clear();
      for (const item of nodes) if (item.isConnected !== false) apply(item);
    };
    if (typeof root.queueMicrotask === 'function') root.queueMicrotask(flush);
    else Promise.resolve().then(flush);
  }
  function start(target) {
    const node = target || root.document?.body;
    if (!node) {
      root.document?.addEventListener?.('DOMContentLoaded', () => start(target), {once: true});
      return;
    }
    apply(node);
    if (observer) observer.disconnect();
    observedRoot = node;
    if (typeof root.MutationObserver === 'function') {
      observer = new root.MutationObserver(records => {
        for (const item of records) {
          if (item.type === 'childList') for (const added of item.addedNodes) queue(added);
          else queue(item.target);
        }
      });
      observer.observe(node, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES});
    }
  }
  function stop() { observer?.disconnect(); observer = null; observedRoot = null; pending.clear(); }
  function content() { return language === 'en' ? (root.CockatielEnglishContent || root.CockatielContent) : root.CockatielContent; }
  function fontFamily() {
    try {
      if (root.document?.documentElement && typeof root.getComputedStyle === 'function') {
        const style = root.getComputedStyle(root.document.documentElement);
        const family = style.getPropertyValue('--font-ui').trim() || style.fontFamily;
        if (family) return family;
      }
    } catch (_) { /* Canvas callers can use the language fallback. */ }
    return language === 'en' ? 'Segoe UI, Arial, sans-serif' : 'Noto Sans TC, Microsoft JhengHei, sans-serif';
  }
  root.addEventListener?.('storage', event => {
    if (event.key !== KEY || !LANGUAGES.includes(event.newValue) || event.newValue === language) return;
    language = event.newValue; apply(); emitChange();
  });
  root.CottageI18n = Object.freeze({KEY, register, t, apply, start, initDOM: start, stop, setLanguage, getLanguage: () => language, content, fontFamily, listMissing: () => Array.from(missing).sort(), clearMissing: () => missing.clear()});
})(typeof globalThis === 'undefined' ? window : globalThis);
