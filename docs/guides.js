/* Original SVG illustrations for Cottage v0.3. No remote assets or new care claims. */
(function (root) {
  'use strict';

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const ink = '#655d49', green = '#7d976e', gold = '#e6bd61', coral = '#c57b60';
  const stroke = `stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  const svg = (body, viewBox = '0 0 240 156', className = '') => `<svg class="cg-illustration ${className}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g ${stroke}>${body}</g></svg>`;
  const star = (x, y, size = 6) => `<path d="M${x} ${y-size}V${y+size}M${x-size} ${y}H${x+size}" stroke="${gold}" stroke-width="2.5"/>`;
  const bird = (x, y, scale = 1, sleeping = false) => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-8 32L-18 62L1 48" fill="#f1d897"/><ellipse cy="18" rx="26" ry="34" fill="#fff3c9"/><path d="M-5 8Q-22 4-21 28Q-15 40 0 39" fill="#f8e8b1"/><circle cy="-12" r="24" fill="#f7df87"/><path d="M-9-33Q-8-53 3-58Q0-43 7-35M0-35Q8-54 18-55Q12-43 13-30" fill="#f7df87"/><path d="M20-16L31-10L20-5" fill="#d9b28a"/><circle cx="12" cy="-5" r="6" fill="#eaa078" stroke="none"/>${sleeping?'<path d="M7-18Q12-14 17-18" fill="none"/>':'<circle cx="13" cy="-19" r="2.2" fill="#514b3e" stroke="none"/>'}<path d="M-7 50V56M7 50V56M-12 56H-2M2 56H12" fill="none"/></g>`;
  const bowl = (x, y, fill = '#c8d8dc', width = 42) => `<g transform="translate(${x} ${y})"><path d="M-${width/2} 0H${width/2}L${width/2-6} 19Q0 30-${width/2-6} 19Z" fill="${fill}"/><ellipse rx="${width/2}" ry="5" fill="#fffefa"/></g>`;
  const apple = (x, y, scale = 1, fill = '#df997f') => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0-12C-22-27-30 0-18 19Q-10 30 0 23Q11 30 19 16C30-6 17-25 0-12Z" fill="${fill}"/><path d="M0-12L3-25" fill="none"/><path d="M3-21Q16-35 24-24Q15-14 3-21Z" fill="#9eb58a"/></g>`;
  const leaf = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 21Q-26-2-9-24Q16-25 20-6Q23 11 0 21Z" fill="#a5bb8b"/><path d="M0 23L2-11M2 2L-8-6M1 11L12 1" fill="none"/></g>`;
  const stopMark = (x, y, radius = 15) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="${coral}"/><path d="M${x-radius*.55} ${y-radius*.55}L${x+radius*.55} ${y+radius*.55}" stroke="${coral}"/>`;

  const pictures = {
    diet: () => svg(`<ellipse cx="119" cy="133" rx="101" ry="9" fill="#ded7be" stroke="none"/>${bird(52,76,.67)}<path d="M98 97Q148 78 197 98" fill="none" stroke="#c4b58c" stroke-dasharray="3 6"/>${apple(157,72,.65)}${leaf(199,75,.7)}${bowl(139,115,'#d4b786',45)}<g fill="#c4a169" stroke="none"><ellipse cx="129" cy="111" rx="4" ry="2.5"/><ellipse cx="139" cy="109" rx="3" ry="2.5"/><ellipse cx="148" cy="112" rx="4" ry="2"/></g>${star(102,39)}${star(218,42,4)}`),
    cage: () => svg(`<path d="M42 130V56Q42 16 120 16Q198 16 198 56V130Z" fill="#f8f3df" stroke="#b9aa82"/><path d="M69 33V131M94 21V131M146 21V131M172 33V131" stroke="#d8cba6" stroke-width="2"/>${bird(120,80,.51)}<path d="M65 117H171M40 136H201" stroke="#a58c66" stroke-width="6"/>${bowl(63,99,'#c7d8d7',28)}<path d="M18 67V99M11 74L18 67L25 74M11 92L18 99L25 92M216 67V99M209 74L216 67L223 74M209 92L216 99L223 92" stroke="${green}" fill="none"/>`),
    clean: () => svg(`<path d="M29 40H84V56H61V69" fill="none" stroke="#a0b6b8" stroke-width="10"/><path d="M29 28V52M20 28H39" fill="none" stroke="#a0b6b8" stroke-width="6"/><path d="M61 78Q42 100 61 105Q79 99 61 78Z" fill="#b6d4dd" stroke="#6f9eaf"/>${bowl(70,116,'#b7d0d3',65)}${star(115,64)}${star(133,94,5)}<path d="M163 42H198V122Q183 135 163 122Z" fill="#f7e7b4"/><path d="M171 42V29H191V42M171 29H199" fill="none"/><path d="M170 90L176 96L191 78" fill="none" stroke="${green}" stroke-width="4"/><circle cx="142" cy="40" r="5" fill="#e9f2ec" stroke="#bacdbb"/>`),
    sleep: () => svg(`<path d="M162 20Q138 47 165 67Q190 83 207 59Q176 68 162 20Z" fill="#ebd28b" stroke="#c4a668"/>${bird(100,90,.73,true)}<path d="M64 132H139" stroke="#aa9570" stroke-width="6"/>${star(60,36)}${star(201,104,5)}${star(124,24,4)}<path d="M34 101Q22 88 29 77Q38 69 45 77" fill="none" stroke="#c8c4ad"/><path d="M29 102L47 76" stroke="${coral}"/>`),
    flight: () => svg(`<rect x="18" y="27" width="62" height="77" rx="13" fill="#dce8df" stroke="#99b39a"/><path d="M49 29V102M20 64H78" stroke="#b0bda1"/><path d="M68 66V75" stroke="#768f73"/>${bird(120,91,.54)}<path d="M92 125H150" stroke="#bba780" stroke-width="5"/><g transform="translate(121 28)"><path d="M0-11V-21M0 0L-23-4Q-34-17-16-17L0-6L16-17Q34-17 23-4L0 0V18Q-10 27-10 15L-4 0" fill="#d8d4bf"/><circle r="5" fill="#b6b69e"/></g>${stopMark(151,22,10)}<rect x="166" y="23" width="68" height="114" rx="8" fill="#d9e1cd" stroke="#a5b492"/><rect x="172" y="34" width="56" height="49" rx="5" fill="#f8f3e3" stroke="#b4bf9f"/><path d="M177 69L173 54L183 60Q188 55 194 60L201 54L199 71" fill="#d2b18b"/><path d="M181 68H182M191 68H192" fill="none" stroke-width="3"/><path d="M207 61Q215 50 223 61V76H207Z" fill="#dfc5a1"/><path d="M208 60Q199 55 201 73M223 60Q230 57 228 73" fill="#b79673"/><circle cx="216" cy="70" r="2" fill="#655d49" stroke="none"/><path d="M173 91H227V130H173Z" fill="#cbd5bf" stroke="#b2bf9e"/><path d="M216 103H224" stroke="#91a07c" stroke-width="4"/>`),
    air: () => svg(`<path d="M29 80H97L90 111Q64 127 37 111Z" fill="#d6d5bf"/><path d="M95 86H112" fill="none" stroke-width="7"/><path d="M48 59Q35 46 48 32M72 59Q61 45 73 30" fill="none" stroke="#c1b9a0"/>${stopMark(65,82,33)}<path d="M160 74H195V127H160Z" fill="#e0d7bc"/><path d="M166 74V59H188V74M167 59V49H199L206 57H184" fill="#c6cbb1"/><path d="M210 49L222 45M211 57H225M209 63L219 70" stroke="#b5c3b2" stroke-dasharray="2 5"/>${stopMark(178,101,26)}`),
    health: () => svg(`${bird(66,84,.75)}<rect x="129" y="32" width="79" height="100" rx="11" fill="#fffdf2"/><rect x="151" y="24" width="35" height="15" rx="6" fill="#d9c798"/><path d="M141 60L146 65L155 54M163 60H195M141 85L146 90L155 79M163 85H195" fill="none" stroke="${green}"/><circle cx="176" cy="113" r="19" fill="#f9e7db" stroke="${coral}"/><path d="M176 104V122M167 113H185" stroke="${coral}" stroke-width="5"/>${star(105,30,4)}`),
    companionship: () => svg(`${bird(71,81,.75)}<path d="M140 118V91Q140 84 146 87L152 98V66Q152 56 159 61V91V53Q159 46 166 52V91V61Q168 53 174 60V94V73Q178 65 183 73V111Q183 132 158 133Q144 132 140 118Z" fill="#ebd1b8"/><path d="M100 91H125M118 84L125 91L118 98" fill="none" stroke="#a7b58e"/><path d="M111 46Q99 33 108 26Q117 20 123 31Q130 20 139 27Q149 36 123 53Z" fill="#e7b29d" stroke="none"/>`),
    general: () => svg(`${bird(120,88,.86)}${star(58,42)}${star(190,60,5)}`)
  };
  const aliases = { water:'clean', food:'diet', safety:'flight', emergency:'health', company:'companionship' };
  function knownKey(id) {
    const alias = Object.prototype.hasOwnProperty.call(aliases,id) ? aliases[id] : id;
    return Object.prototype.hasOwnProperty.call(pictures,alias) ? alias : 'general';
  }
  function picture(id) { return pictures[knownKey(id)](); }

  const overviewItems = Object.freeze([
    {id:'diet', title:'食物要搭配', short:'不只吃種子，份量先問獸醫。'},
    {id:'clean', title:'洗碗、換乾淨水', short:'水髒了就換，每天把碗洗乾淨。'},
    {id:'sleep', title:'安靜睡覺', short:'避開強光和吵聲，也能自己休息。'},
    {id:'flight', title:'先安全，再放風', short:'門窗關好、吊扇停轉，貓狗分開。'},
    {id:'air', title:'遠離煙霧和噴霧', short:'沒聞到味道，也不代表安全。'},
    {id:'companionship', title:'不想玩，就停下', short:'讓牠自己願意靠近，也能退開。'},
    {id:'health', title:'不舒服，找獸醫', short:'看呼吸、活動、食量和平常是否不同。'}
  ]);

  function overview() {
    return `<section class="cg-overview" aria-label="照顧鳥寶，看圖記住七件事"><div class="cg-overview-heading"><h2>先看圖，記住這幾件事</h2><p>每天一點點，大人和孩子一起照顧。</p></div><div class="cg-overview-grid">${overviewItems.map(item=>`<figure class="cg-overview-item">${picture(item.id)}<figcaption><strong>${item.title}</strong><span>${item.short}</span></figcaption></figure>`).join('')}</div><p class="cg-important"><span class="cg-important-symbol" aria-hidden="true">!</span><span><strong>呼吸困難、站不起來、一直出血或可能中毒：立刻找能看鳥的獸醫。</strong>小朋友先找照顧鳥寶的大人，不要等遊戲結束。</span></p></section>`;
  }

  /** detailHtml is trusted app-generated HTML, with all dynamic text escaped by the caller. */
  function careCard(id, title, summary, detailHtml = '') {
    const key = knownKey(id);
    const urgent = id === 'emergency';
    const detail = String(detailHtml);
    return `<article class="cg-care-card${urgent?' cg-care-urgent':''}" data-care-guide="${key}"><div class="cg-care-picture">${picture(id)}</div><div class="cg-care-heading"><h2>${esc(title)}</h2><p>${esc(summary)}</p></div>${urgent?`<div class="cg-care-visible"><p class="cg-urgent-action"><strong>真鳥有這些警訊，立刻聯絡能看鳥的獸醫或急診。</strong></p>${detail}</div>`:`<details class="cg-care-details"><summary>看看怎麼照顧<span class="cg-summary-mark" aria-hidden="true"></span></summary><div class="cg-care-detail-body">${detail}</div></details>`}</article>`;
  }

  function foodShape(name) {
    const value = String(name).toLowerCase();
    if (/酪梨|avocado/.test(value)) return `<path d="M31 13Q42 1 53 13L69 49Q76 76 43 79Q9 77 17 49Z" fill="#adc18b"/><path d="M36 22Q43 12 49 22L61 50Q66 69 43 71Q20 69 25 51Z" fill="#e8e4b5"/><circle cx="43" cy="52" r="13" fill="#b88d66"/>`;
    if (/蘋果|apple/.test(value)) return apple(44,47,1.05);
    if (/胡蘿蔔|紅蘿蔔|carrot/.test(value)) return `<path d="M32 25Q41 17 56 31L28 77Q19 80 23 68Z" fill="#e5a15f"/><path d="M42 23L36 8M47 23L53 8M46 24L63 19" stroke="#86a36a" stroke-width="5"/><path d="M33 39L43 44M28 52L35 56" stroke="#bf8147"/>`;
    if (/花椰菜|青花菜|broccoli/.test(value)) return `<path d="M35 48L30 76H57L51 47Z" fill="#bad093"/><path d="M27 53Q9 54 12 37Q11 24 27 24Q31 5 46 17Q65 10 68 27Q85 30 75 49Q62 60 49 50Q40 61 27 53Z" fill="#91ac79"/><path d="M41 48V61M50 47L42 60" stroke="#799968"/>`;
    if (/葡萄|grape/.test(value)) return `<path d="M43 20L49 8M45 17Q59 1 67 11Q59 23 45 17Z" fill="#a7ba8d"/><g fill="#baa4b8"><circle cx="31" cy="32" r="12"/><circle cx="53" cy="32" r="12"/><circle cx="22" cy="51" r="12"/><circle cx="43" cy="51" r="12"/><circle cx="64" cy="51" r="12"/><circle cx="33" cy="69" r="12"/><circle cx="54" cy="69" r="12"/></g>`;
    if (/香蕉|banana/.test(value)) return `<path d="M64 17Q75 73 27 74Q7 70 11 57Q49 71 56 16Z" fill="#efd07c"/><path d="M57 16L55 7H63L65 17M19 61Q35 68 51 55" fill="none"/>`;
    if (/南瓜|pumpkin/.test(value)) return `<path d="M40 23L42 12H51L48 26" fill="#9caf7e"/><ellipse cx="43" cy="51" rx="34" ry="27" fill="#e7b47a"/><ellipse cx="43" cy="51" rx="17" ry="27" fill="#ebc289"/><path d="M43 24V78" fill="none" stroke="#cd9c63"/>`;
    if (/葉菜|青江菜|甘藍|菠菜|甜椒|pepper|kale/.test(value)) return leaf(42,46,1.15);
    if (/地瓜|番薯|甘藷/.test(value)) return `<path d="M17 58Q19 30 55 25L72 18L69 35Q66 69 34 70L16 77Z" fill="#c48c79"/><path d="M28 55L32 50M42 41L46 37M49 57L52 53" stroke="#98695b"/>`;
    if (/咖啡|茶|caffeine|coffee/.test(value)) return `<path d="M20 31H62V66Q40 85 20 66Z" fill="#e6d8ba"/><path d="M62 37Q82 35 77 54Q73 62 63 60" fill="none"/><path d="M32 24Q24 14 34 7M49 24Q42 14 52 7" fill="none" stroke="#ac9d81"/>`;
    if (/酒|alcohol/.test(value)) return `<path d="M35 10H51V29L61 40V77H25V40L35 29Z" fill="#bac9a6"/><path d="M35 10V4H51V10M25 51H61V68H25" fill="#f4e5b9"/>`;
    if (/巧克力|可可|chocolate/.test(value)) return `<rect x="20" y="12" width="48" height="62" rx="5" fill="#b58c72"/><path d="M44 14V54M22 34H66M22 53H66" stroke="#8f6e58"/><path d="M15 54H72L67 80H21Z" fill="#ddd7c1"/>`;
    if (/洋蔥|大蒜|onion|garlic/.test(value)) return `<path d="M37 21L38 9M43 23L49 9" stroke="#94a579"/><path d="M36 24Q23 31 16 48Q8 76 42 78Q76 77 69 49Q64 33 47 24Z" fill="#d9bcb0"/><path d="M39 27Q20 62 40 75M45 27Q63 62 46 75" fill="none" stroke="#bda198"/>`;
    if (/植物|野草|野菇|盆栽|wild/.test(value)) return `${leaf(34,37,.8)}<path d="M42 59V78M42 59L58 42" fill="none"/><path d="M53 45Q50 22 70 22Q82 45 53 45Z" fill="#a9b995"/>`;
    if (/木糖醇|代糖|xylitol/.test(value)) return `<path d="M19 32L43 19L68 32V65L43 79L19 65Z" fill="#f1eee0"/><path d="M19 32L43 47L68 32M43 47V79" fill="none" stroke="#c9c3b0"/>`;
    if (/米|飯|豆|穀|seed|種子|飼料|顆粒|小米/.test(value)) return `${bowl(44,51,'#d5c09b',63)}<g fill="#b9a076" stroke="none"><ellipse cx="30" cy="45" rx="5" ry="3"/><ellipse cx="45" cy="40" rx="5" ry="3"/><ellipse cx="58" cy="46" rx="5" ry="3"/></g><path d="M25 24L28 17M42 20V12M59 24L63 17" stroke="#ccb785"/>`;
    return `<path d="M23 24H65V76H23Z" fill="#e7deca"/><path d="M31 24V13H57V24" fill="#c7cbb1"/><path d="M37 43Q37 32 48 37Q57 43 45 50V56" fill="none" stroke="#8f957c"/><circle cx="45" cy="65" r="2" fill="#8f957c" stroke="none"/>`;
  }

  function foodIcon(name, status) {
    const labels = {suitable:'可適量', avoid:'需要避免', unknown:'資料不足'};
    const key = Object.prototype.hasOwnProperty.call(labels, status) ? status : 'unknown';
    const mark = {suitable:'✓',avoid:'×',unknown:'?'}[key];
    return `<span class="cg-food-visual cg-food-${key}">${svg(foodShape(name),'0 0 88 88','cg-food-drawing')}<span class="cg-food-status"><b aria-hidden="true">${mark}</b>${labels[key]}</span></span>`;
  }

  root.CottageGuides = Object.freeze({overview, careCard, picture, foodIcon});
})(globalThis);
