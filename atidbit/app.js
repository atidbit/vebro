/* Atidbit — a demo by Vebro Solutions. Static, no backend: data lives in localStorage. */
(() => {
'use strict';
const KEY = 'atidbit:v1';
const MAX = 280;
const COLORS = ['#f2542d','#e11d48','#d97706','#059669','#0891b2','#4f46e5','#9333ea','#475569'];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const len = s => [...s].length;

/* ---------- Icons ---------- */
const P = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  reply:'<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-4.2A8.4 8.4 0 1 1 21 11.5z"/>',
  repost:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  share:'<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>',
  trash:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  back:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  person:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const logo = `<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><path class="bubble" d="M16 3C8.8 3 3 8.4 3 15c0 3.2 1.4 6.1 3.6 8.3L5 29l6.2-2.6c1.5.4 3.1.6 4.8.6 7.2 0 13-5.4 13-12S23.2 3 16 3z"/><circle class="bit" cx="15" cy="15.5" r="4.6"/><circle class="bit" cx="21.8" cy="10.2" r="2"/></svg>`;

/* ---------- Data ---------- */
function seed() {
  const now = Date.now(), m = 6e4, h = 60 * m, d = 24 * h;
  const users = {
    me:      { id:'me', name:'You', handle:'you', bio:'Just joined Atidbit. Tap “Edit profile” to make this space yours.', color:'#4f46e5', joined: now },
    atidbit: { id:'atidbit', name:'Atidbit', handle:'atidbit', bio:'Small bits, big ideas. The official (demo) Atidbit account. #Atidbit', color:'#f2542d', joined: now - 120 * d, verified:true },
    maya:    { id:'maya', name:'Maya Lin', handle:'maya_codes', bio:'Front-end tinkerer. CSS is my love language. #webdev', color:'#0891b2', joined: now - 400 * d },
    kai:     { id:'kai', name:'Kai Nalu', handle:'kai_surf', bio:'Dawn patrol every day 🌊 Shaper, surfer, coffee drinker.', color:'#059669', joined: now - 300 * d },
    lei:     { id:'lei', name:'Leilani Bakes', handle:'leilani_bakes', bio:'Malasadas, mochi & everything in between. 🍩', color:'#e11d48', joined: now - 220 * d },
    omar:    { id:'omar', name:'Omar Reyes', handle:'omar_builds', bio:'Building tiny tools for big problems. Open source fan.', color:'#9333ea', joined: now - 500 * d },
    sunny:   { id:'sunny', name:'Sunny Facts', handle:'sunnyfacts', bio:'One delightful fact a day. Mostly true. ☀️', color:'#d97706', joined: now - 650 * d }
  };
  const P = (id, author, text, ago, extra = {}) => ({ id, author, text, created: now - ago, replyTo: null, likes: [], reposts: [], ...extra });
  const posts = [
    P('p1','atidbit','Welcome to Atidbit 👋 Share a tidbit — up to 280 characters of whatever’s on your mind. Say hi below! #Atidbit', 6*m, { likes:['maya','kai','lei','omar'], reposts:[{u:'sunny',at:now-4*m}] }),
    P('p2','kai','Glassy waves this morning on the North Shore. Paddled out at 6, back for coffee by 8. Best way to start a Wednesday. #Hawaii #surf', 42*m, { likes:['lei','atidbit'] }),
    P('p3','maya','Hot take: `text-wrap: balance` is the most underrated CSS property of the decade. No more lonely words on the last line. #webdev #css', 2*h, { likes:['omar','atidbit','sunny'], reposts:[{u:'atidbit',at:now-90*m}] }),
    P('p4','lei','Fresh batch of haupia malasadas just came out of the fryer 🍩 Who’s coming by? #foodie #Hawaii', 5*h, { likes:['kai','sunny','maya'] }),
    P('p5','sunny','Sunny fact: honey never spoils. Archaeologists have found 3,000-year-old honey that was still edible. 🍯 #funfact', 9*h, { likes:['lei','kai'] }),
    P('p6','omar','Shipped a tiny static app today: no framework, no build step, no server. Just HTML, CSS and a little JavaScript. Feels great. #webdev #buildinpublic', 26*h, { likes:['maya','atidbit'] }),
    P('p7','atidbit','Tip: use #hashtags to join a trend and @mentions to tag a friend. Try mentioning @maya_codes or @kai_surf!', 2*d, { likes:['maya','kai'] }),
    P('p8','kai','Sunset session tonight. Who’s in? 🌅 #Hawaii', 3*d, { likes:['lei'] }),
    P('r1','maya','Thanks @atidbit! Happy to be here ✨', 5*m, { replyTo:'p1', likes:['atidbit'] }),
    P('r2','kai','Aloha everyone 🤙', 3*m, { replyTo:'p1' }),
    P('r3','omar','Agreed. I added it to every heading I own.', 100*m, { replyTo:'p3', likes:['maya'] }),
    P('r4','maya','@omar_builds same, and `text-wrap: pretty` for paragraphs too.', 80*m, { replyTo:'r3' }),
    P('r5','sunny','Save me one! 🙋', 4*h, { replyTo:'p4' })
  ];
  return {
    v: 1, me: 'me', users, posts, theme: 'dark',
    follows: { me:['atidbit','kai'], maya:['atidbit','omar'], kai:['lei','atidbit'], lei:['kai'], omar:['maya'], sunny:['atidbit'], atidbit:['me'] },
    bookmarks: [],
    notifs: [
      { id: uid(), type:'welcome', from:'atidbit', at: now - 1 * m, read:false },
      { id: uid(), type:'follow', from:'atidbit', at: now - 2 * m, read:false }
    ]
  };
}
let S;
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || S.v !== 1 || !S.users || !S.posts) S = seed();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save — storage is full or blocked'); } }

const user = id => S.users[id] || { id, name:'Unknown', handle:'unknown', color:'#475569', bio:'' };
const me = () => user(S.me);
const byHandle = h => Object.values(S.users).find(u => u.handle.toLowerCase() === String(h).toLowerCase());
const getPost = id => S.posts.find(p => p.id === id);
const repliesOf = id => S.posts.filter(p => p.replyTo === id).sort((a, b) => a.created - b.created);
const followsOf = id => S.follows[id] || (S.follows[id] = []);
const isFollowing = (a, b) => followsOf(a).includes(b);
const followersOf = id => Object.keys(S.follows).filter(k => S.follows[k].includes(id) && S.users[k]);
const unread = () => S.notifs.filter(n => !n.read).length;

/* ---------- Formatting ---------- */
function rel(t) {
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 45) return 'now';
  if (s < 3600) return Math.round(s / 60) + 'm';
  if (s < 86400) return Math.round(s / 3600) + 'h';
  if (s < 7 * 86400) return Math.round(s / 86400) + 'd';
  const d = new Date(t), same = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, same ? { month:'short', day:'numeric' } : { month:'short', day:'numeric', year:'numeric' });
}
const full = t => new Date(t).toLocaleString(undefined, { hour:'numeric', minute:'2-digit', month:'short', day:'numeric', year:'numeric' });
const compact = n => n < 1000 ? String(n) : n < 1e6 ? (n / 1e3).toFixed(n < 1e4 ? 1 : 0).replace(/\.0$/, '') + 'K' : (n / 1e6).toFixed(1) + 'M';
const initials = name => (String(name).trim().split(/\s+/).slice(0, 2).map(w => [...w][0] || '').join('') || '?').toUpperCase();
const TOKEN = /(https?:\/\/[^\s<]+)|(^|[^\w&\/])#([A-Za-z][\w]{0,49})|(^|[^\w\/@])@(\w{1,15})/g;
function linkify(text) {
  return esc(text).replace(TOKEN, (m, url, p1, tag, p2, h) => {
    if (url) {
      const trail = url.match(/[.,!?;:)]+$/); const u = trail ? url.slice(0, -trail[0].length) : url;
      return `<a href="${u}" target="_blank" rel="noopener noreferrer nofollow">${u.replace(/^https?:\/\//, '')}</a>${trail ? trail[0] : ''}`;
    }
    if (tag) return `${p1}<a href="#/tag/${encodeURIComponent(tag)}">#${tag}</a>`;
    return `${p2}<a href="#/u/${encodeURIComponent(h)}">@${h}</a>`;
  });
}
const tagsIn = text => [...String(text).matchAll(/(?:^|[^\w&\/])#([A-Za-z]\w{0,49})/g)].map(m => m[1]);
const avatar = (u, cls = '', span = false) => span ? `<span class="avatar ${cls}" style="--c:${esc(u.color)}" aria-hidden="true">${esc(initials(u.name))}</span>` : `<a href="#/u/${encodeURIComponent(u.handle)}" class="avatar ${cls}" style="--c:${esc(u.color)}" aria-label="${esc(u.name)}’s profile" tabindex="-1">${esc(initials(u.name))}</a>`;

/* ---------- Components ---------- */
function postHTML(p, o = {}) {
  const a = user(p.author), mine = p.author === S.me;
  const parent = p.replyTo ? getPost(p.replyTo) : null;
  const liked = p.likes.includes(S.me), rp = p.reposts.some(r => r.u === S.me), marked = S.bookmarks.includes(p.id);
  const nReplies = repliesOf(p.id).length;
  const reply = p.replyTo && !o.big && !o.ancestor && !o.hideReplying
    ? `<div class="replying">Replying to ${parent ? `<a href="#/u/${encodeURIComponent(user(parent.author).handle)}">@${esc(user(parent.author).handle)}</a>` : 'a deleted post'}</div>` : '';
  const actions = `<div class="actions" role="group" aria-label="Post actions">
      <button class="act reply" type="button" data-act="reply" aria-label="Reply${nReplies ? `, ${nReplies} replies` : ''}">${icon('reply')}<span>${nReplies ? compact(nReplies) : ''}</span></button>
      <button class="act repost${rp ? ' on' : ''}" type="button" data-act="repost" aria-pressed="${rp}" aria-label="${rp ? 'Undo repost' : 'Repost'}${p.reposts.length ? `, ${p.reposts.length} reposts` : ''}">${icon('repost')}<span>${p.reposts.length ? compact(p.reposts.length) : ''}</span></button>
      <button class="act like${liked ? ' on' : ''}" type="button" data-act="like" aria-pressed="${liked}" aria-label="${liked ? 'Unlike' : 'Like'}${p.likes.length ? `, ${p.likes.length} likes` : ''}">${icon('heart')}<span>${p.likes.length ? compact(p.likes.length) : ''}</span></button>
      <button class="act mark${marked ? ' on' : ''}" type="button" data-act="bookmark" aria-pressed="${marked}" aria-label="${marked ? 'Remove bookmark' : 'Bookmark'}">${icon('bookmark')}</button>
      <button class="act share" type="button" data-act="share" aria-label="Copy link to post">${icon('share')}</button>
    </div>`;
  const del = mine ? `<button class="icon-btn more" type="button" data-act="delete" aria-label="Delete post">${icon('trash')}</button>` : '';
  const ctx = o.by ? `<div class="ctx">${icon('repost')}${o.by === S.me ? 'You' : esc(user(o.by).name)} reposted</div>` : '';
  if (o.big) {
    return `<article class="post big" data-id="${p.id}" aria-label="Post by ${esc(a.name)}">
      ${reply}
      <div class="post-row">${avatar(a)}<div class="post-body"><div class="post-head" style="display:block">
        <a href="#/u/${encodeURIComponent(a.handle)}" class="name" style="display:block">${esc(a.name)}</a><span class="handle">@${esc(a.handle)}</span></div></div>
        <div class="post-head">${del}</div></div>
      <div class="text">${linkify(p.text)}</div>
      <div class="meta"><time datetime="${new Date(p.created).toISOString()}">${full(p.created)}</time></div>
      ${p.reposts.length || p.likes.length ? `<div class="stats"><span><b>${compact(p.reposts.length)}</b> Reposts</span><span><b>${compact(p.likes.length)}</b> Likes</span></div>` : ''}
      ${actions}
    </article>`;
  }
  return `<article class="post${o.ancestor ? ' ancestor' : ''}" data-id="${p.id}" tabindex="0" aria-label="Post by ${esc(a.name)}, ${rel(p.created)} ago">
    ${ctx}
    <div class="post-row"><div class="avatar-col">${avatar(a)}</div>
      <div class="post-body">
        <div class="post-head"><a href="#/u/${encodeURIComponent(a.handle)}" class="name">${esc(a.name)}</a>${a.verified ? '<span title="Official account" aria-label="Official account">✦</span>' : ''}
          <span class="handle">@${esc(a.handle)}</span><span class="dot" aria-hidden="true">·</span>
          <a class="time" href="#/post/${p.id}"><time datetime="${new Date(p.created).toISOString()}" data-ts="${p.created}" title="${full(p.created)}">${rel(p.created)}</time></a>${del}</div>
        ${reply}
        <div class="text">${linkify(p.text)}</div>
        ${o.noActions ? '' : actions}
      </div></div>
  </article>`;
}
let cid = 0;
function composerHTML({ replyTo = null, placeholder = 'What’s the tidbit?', btn = 'Post', cls = '', auto = false } = {}) {
  const id = 'c' + (++cid) + (replyTo ? '-' + replyTo : '');
  const C = 2 * Math.PI * 10;
  return `<form class="composer ${cls}" data-reply="${replyTo || ''}" novalidate>
    ${avatar(me())}
    <div class="fields">
      <label class="sr" for="${id}">${replyTo ? 'Your reply' : 'Write a post'}</label>
      <textarea id="${id}" class="composer-input" rows="1" maxlength="1000" placeholder="${esc(placeholder)}" ${auto ? 'data-autofocus' : ''}></textarea>
      <div class="composer-foot">
        <span class="hint">Ctrl + Enter to post</span>
        <div class="ring" hidden aria-hidden="true"><svg viewBox="0 0 26 26"><circle class="track" cx="13" cy="13" r="10"/><circle class="prog" cx="13" cy="13" r="10" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><span class="num"></span></div>
        <span class="sr count-live" aria-live="polite"></span>
        <button class="btn btn-primary" type="submit" disabled>${btn}</button>
      </div>
    </div>
  </form>`;
}
function updateComposer(form) {
  const ta = $('textarea', form), n = len(ta.value), left = MAX - n, ring = $('.ring', form), C = 2 * Math.PI * 10;
  ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px';
  ring.hidden = n === 0;
  ring.classList.toggle('warn', left <= 20 && left >= 0);
  ring.classList.toggle('over', left < 0);
  ring.classList.toggle('big', left <= 20);
  $('.prog', ring).style.strokeDashoffset = C * (1 - Math.min(n / MAX, 1));
  $('.num', ring).textContent = left <= 20 ? left : '';
  const live = $('.count-live', form);
  const msg = left < 0 ? `${-left} characters over the limit` : left <= 20 ? `${left} characters left` : '';
  if (live.textContent !== msg) live.textContent = msg;
  $('button[type=submit]', form).disabled = !ta.value.trim() || left < 0;
}
function personHTML(u, withBio = false) {
  const f = isFollowing(S.me, u.id), self = u.id === S.me;
  return `<div class="person">${avatar(u)}<div class="who"><a href="#/u/${encodeURIComponent(u.handle)}"><b>${esc(u.name)}</b></a><a href="#/u/${encodeURIComponent(u.handle)}" class="handle" tabindex="-1">@${esc(u.handle)}</a>${withBio && u.bio ? `<div class="bio">${linkify(u.bio)}</div>` : ''}</div>
    ${self ? '' : followBtn(u, f)}</div>`;
}
const followBtn = (u, f = isFollowing(S.me, u.id)) => f
  ? `<button class="btn btn-following" type="button" data-act="follow" data-user="${u.id}" aria-pressed="true" aria-label="Unfollow @${esc(u.handle)}"><span class="lbl">Following</span></button>`
  : `<button class="btn btn-dark" type="button" data-act="follow" data-user="${u.id}" aria-pressed="false" aria-label="Follow @${esc(u.handle)}">Follow</button>`;
function trends(n = 5) {
  const map = new Map();
  for (const p of S.posts) for (const t of new Set(tagsIn(p.text).map(x => x.toLowerCase()))) {
    const orig = tagsIn(p.text).find(x => x.toLowerCase() === t);
    const e = map.get(t) || { tag: orig, count: 0, last: 0 };
    e.count++; e.last = Math.max(e.last, p.created); map.set(t, e);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.last - a.last).slice(0, n);
}
const trendsHTML = (n = 5) => trends(n).map(t => `<a class="trend" href="#/tag/${encodeURIComponent(t.tag)}"><small>Trending</small><b>#${esc(t.tag)}</b><small>${t.count} ${t.count === 1 ? 'post' : 'posts'}</small></a>`).join('') || '<p class="empty">No trends yet.</p>';
const suggestions = (n = 3) => Object.values(S.users).filter(u => u.id !== S.me && !isFollowing(S.me, u.id)).sort((a, b) => followersOf(b.id).length - followersOf(a.id).length).slice(0, n);
const footHTML = () => `<p>Atidbit — a demo by <a href="../">Vebro Solutions</a></p><p>© ${new Date().getFullYear()} Vebro Solutions · <button type="button" data-act="reset">Reset demo data</button></p>`;
const searchHTML = (q = '', id = 'q-right') => `<form class="search" role="search" data-search><label for="${id}">${icon('search')}<span class="sr">Search Atidbit</span><input id="${id}" type="search" name="q" placeholder="Search Atidbit" value="${esc(q)}" autocomplete="off"></label></form>`;

/* ---------- Shell (nav + right column) ---------- */
const NAV = [['home','Home','#/home'],['search','Explore','#/explore'],['bell','Notifications','#/notifications'],['bookmark','Bookmarks','#/bookmarks'],['user','Profile','#/u/']];
function renderShell(section) {
  const u = me(), n = unread(), dark = S.theme === 'dark';
  const href = h => h === '#/u/' ? '#/u/' + encodeURIComponent(u.handle) : h;
  const badge = k => k === 'Notifications' && n ? `<span class="badge" aria-hidden="true">${n > 9 ? '9+' : n}</span>` : '';
  const lab = k => k === 'Notifications' && n ? `${k}, ${n} unread` : k;
  $('#side').innerHTML = `
    <a class="brand" href="#/home" aria-label="Atidbit home">${logo}<span class="word">atidbit</span></a>
    <nav class="nav" aria-label="Main">
      ${NAV.map(([i, k, h]) => `<a href="${href(h)}" ${section === k ? 'aria-current="page"' : ''} aria-label="${lab(k)}">${icon(i)}<span class="lbl">${k}</span>${badge(k)}</a>`).join('')}
      <button class="nav-item" type="button" data-act="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode">${icon(dark ? 'sun' : 'moon')}<span class="lbl">${dark ? 'Light mode' : 'Dark mode'}</span></button>
    </nav>
    <button class="btn btn-primary post-btn" type="button" data-act="compose" aria-label="Post">${icon('plus')}<span class="lbl">Post</span></button>
    <a class="me-chip" href="${href('#/u/')}" aria-label="Your profile">${avatar(u, '', true)}<span class="who"><b>${esc(u.name)}</b><span class="muted">@${esc(u.handle)}</span></span></a>`;
  $('#bottom-nav').innerHTML = NAV.filter(x => x[1] !== 'Bookmarks').map(([i, k, h]) => `<a href="${href(h)}" ${section === k ? 'aria-current="page"' : ''} aria-label="${lab(k)}">${icon(i)}${badge(k)}</a>`).join('');
  const sugg = suggestions();
  $('#right').innerHTML = `
    ${['explore','search'].includes(parse().a) ? '' : searchHTML()}
    <section class="card" aria-labelledby="tr-h"><h2 id="tr-h">What’s happening</h2>${trendsHTML()}<a class="more-link" href="#/explore">Show more</a></section>
    <section class="card" aria-labelledby="wf-h"><h2 id="wf-h">Who to follow</h2>${sugg.length ? sugg.map(u => personHTML(u)).join('') : '<p class="empty" style="padding:16px">You’re following everyone. Nice!</p>'}<a class="more-link" href="#/explore">Show more</a></section>
    <footer class="foot">${footHTML()}</footer>`;
  document.documentElement.dataset.theme = S.theme;
  $('meta[name=theme-color]').content = dark ? '#0b0d10' : '#ffffff';
}
const mobileBar = () => `<div class="mobile-bar">${avatar(me(), 'sm').replace('tabindex="-1"', '')}<a class="brand" href="#/home" aria-label="Atidbit home">${logo}<span class="word">atidbit</span></a><button class="icon-btn" type="button" data-act="theme" aria-label="Switch to ${S.theme === 'dark' ? 'light' : 'dark'} mode">${icon(S.theme === 'dark' ? 'sun' : 'moon')}</button></div>`;
const header = (title, { back = false, sub = '', extra = '' } = {}) => `<div class="top">${back ? '' : mobileBar()}<div class="top-bar">${back ? `<button class="icon-btn" type="button" data-act="back" aria-label="Back">${icon('back')}</button>` : ''}<div><h1 id="page-title">${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div></div>${extra}</div>`;
const empty = (h, p) => `<div class="empty"><h2>${h}</h2><p>${p}</p></div>`;
const footMain = () => `<footer class="foot foot-main">${footHTML()}</footer>`;

/* ---------- Pages ---------- */
let homeTab = 'foryou';
function feed(filter) {
  const seen = new Map();
  for (const p of S.posts) {
    if (!p.replyTo && (!filter || filter.has(p.author))) seen.set(p.id, { p, at: p.created });
    for (const r of p.reposts) if (!p.replyTo && (filter ? filter.has(r.u) : r.u === S.me)) {
      const cur = seen.get(p.id);
      if (!cur || r.at > cur.at) seen.set(p.id, { p, at: r.at, by: r.u });
    }
  }
  return [...seen.values()].sort((a, b) => b.at - a.at);
}
function pageHome() {
  const tabs = `<div class="tabs" role="tablist" aria-label="Timeline">
    <button class="tab" role="tab" type="button" data-act="tab" data-tab="foryou" aria-selected="${homeTab === 'foryou'}"><span>For you</span></button>
    <button class="tab" role="tab" type="button" data-act="tab" data-tab="following" aria-selected="${homeTab === 'following'}"><span>Following</span></button></div>`;
  const items = homeTab === 'following' ? feed(new Set([S.me, ...followsOf(S.me)])) : feed();
  return header('Home', { extra: tabs }) + composerHTML({ cls: 'home-composer' }) +
    `<div role="tabpanel" aria-label="${homeTab === 'following' ? 'Following' : 'For you'}">${items.length ? items.map(i => postHTML(i.p, { by: i.by })).join('') : empty('Nothing here yet', 'Follow a few people to fill your Following timeline.')}</div>` + footMain();
}
function pageExplore() {
  return header('Explore') + `<div class="explore-search">${searchHTML('', 'q-explore')}</div>
    <h2 class="section-title">Trends for you</h2>${trendsHTML(10)}
    <h2 class="section-title">People on Atidbit</h2>${Object.values(S.users).filter(u => u.id !== S.me).map(u => personHTML(u, true)).join('')}` + footMain();
}
function pageSearch(q) {
  const ql = q.trim().toLowerCase().replace(/^@/, '');
  const people = ql ? Object.values(S.users).filter(u => u.name.toLowerCase().includes(ql) || u.handle.toLowerCase().includes(ql)) : [];
  const posts = ql ? S.posts.filter(p => p.text.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => b.created - a.created) : [];
  return header('Search', { back: true, sub: esc(q) }) + `<div class="explore-search">${searchHTML(q, 'q-page')}</div>` +
    (people.length ? `<h2 class="section-title">People</h2>${people.map(u => personHTML(u, true)).join('')}` : '') +
    `<h2 class="section-title">Posts</h2>` + (posts.length ? posts.map(p => postHTML(p)).join('') : empty(`No results for “${esc(q)}”`, 'Try searching for something else, or check the spelling.'));
}
function pageTag(tag) {
  const t = tag.toLowerCase();
  const posts = S.posts.filter(p => tagsIn(p.text).some(x => x.toLowerCase() === t)).sort((a, b) => b.created - a.created);
  return header('#' + esc(tag), { back: true, sub: `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}` }) +
    (posts.length ? posts.map(p => postHTML(p)).join('') : empty(`No posts with #${esc(tag)}`, 'Be the first — write a post with this hashtag.'));
}
function pageNotifs() {
  const list = [...S.notifs].sort((a, b) => b.at - a.at);
  const html = list.map(n => {
    const f = user(n.from), p = n.post ? getPost(n.post) : null;
    const who = `<a href="#/u/${encodeURIComponent(f.handle)}"><b>${esc(f.name)}</b></a>`;
    const line = { like: `${who} liked your post`, repost: `${who} reposted your post`, follow: `${who} followed you`, reply: `${who} replied to your post`, welcome: `Welcome to Atidbit! Write your first post, follow a few people, and make your profile yours.` }[n.type] || '';
    const ic = { like:'heart', repost:'repost', follow:'person', reply:'reply' }[n.type];
    return `<div class="notif${n.read ? '' : ' unread'}"><div class="ico ${n.type === 'welcome' ? 'brand' : n.type}">${ic ? icon(ic) : logo}</div><div>${avatar(f, 'sm')}<p>${line} <span class="muted">· ${rel(n.at)}</span></p>${p ? `<a class="snip" href="#/post/${p.id}" style="display:block">${esc(p.text)}</a>` : ''}</div></div>`;
  }).join('');
  setTimeout(() => { if (S.notifs.some(n => !n.read)) { S.notifs.forEach(n => n.read = true); save(); renderShell('Notifications'); } }, 1500);
  return header('Notifications') + (html || empty('Nothing to see here — yet', 'Likes, reposts, replies and follows will show up here.'));
}
function pageBookmarks() {
  const posts = S.bookmarks.map(getPost).filter(Boolean);
  return header('Bookmarks', { sub: '@' + esc(me().handle) }) + (posts.length ? posts.map(p => postHTML(p)).join('') : empty('Save posts for later', 'Tap the bookmark icon on any post to save it here. Only you can see your bookmarks.'));
}
let profTab = 'posts';
function pageProfile(handle, tab) {
  const u = byHandle(handle);
  if (!u) return header('Profile', { back: true }) + empty('This account doesn’t exist', `Try searching for another. (@${esc(handle)})`);
  profTab = ['posts', 'replies', 'likes'].includes(tab) ? tab : 'posts';
  const isMe = u.id === S.me;
  let items;
  if (profTab === 'posts') items = feed(new Set([u.id])).filter(i => i.by ? i.by === u.id : i.p.author === u.id).map(i => postHTML(i.p, { by: i.by }));
  else if (profTab === 'replies') items = S.posts.filter(p => p.author === u.id && p.replyTo).sort((a, b) => b.created - a.created).map(p => postHTML(p));
  else items = S.posts.filter(p => p.likes.includes(u.id)).sort((a, b) => b.created - a.created).map(p => postHTML(p));
  const n = S.posts.filter(p => p.author === u.id).length;
  const tabBtn = (k, l) => `<a class="tab" role="tab" href="#/u/${encodeURIComponent(u.handle)}/${k}" aria-selected="${profTab === k}"><span>${l}</span></a>`;
  return header(esc(u.name), { back: true, sub: `${n} ${n === 1 ? 'post' : 'posts'}` }) + `
    <div class="banner" style="--c:${esc(u.color)}"></div>
    <section class="profile-head" aria-label="Profile">
      <div class="row">${avatar(u, 'lg')}${isMe ? `<button class="btn btn-outline" type="button" data-act="edit-profile">Edit profile</button>` : followBtn(u)}</div>
      <h2>${esc(u.name)}${u.verified ? ' <span title="Official account" aria-label="Official account">✦</span>' : ''}</h2>
      <div class="handle">@${esc(u.handle)}${!isMe && isFollowing(u.id, S.me) ? ' <span class="muted" style="font-size:.75rem;background:var(--elev);padding:2px 6px;border-radius:4px">Follows you</span>' : ''}</div>
      ${u.bio ? `<p class="bio">${linkify(u.bio)}</p>` : ''}
      <div class="joined">${icon('cal')} Joined ${new Date(u.joined).toLocaleDateString(undefined, { month:'long', year:'numeric' })}</div>
      <div class="counts"><span><b>${followsOf(u.id).filter(x => S.users[x]).length}</b> Following</span><span><b>${followersOf(u.id).length}</b> Followers</span></div>
    </section>
    <div class="tabs profile-tabs" role="tablist" aria-label="Profile sections">${tabBtn('posts', 'Posts')}${tabBtn('replies', 'Replies')}${tabBtn('likes', 'Likes')}</div>
    <div role="tabpanel">${items.length ? items.join('') : empty(profTab === 'likes' ? 'No likes yet' : profTab === 'replies' ? 'No replies yet' : (isMe ? 'Share your first tidbit' : 'No posts yet'), isMe ? 'When you do, it’ll show up here.' : 'Check back later.')}</div>`;
}
function pageThread(id) {
  const p = getPost(id);
  if (!p) return header('Post', { back: true }) + empty('This post is gone', 'It may have been deleted.');
  const chain = []; let cur = p.replyTo && getPost(p.replyTo);
  while (cur && chain.length < 20) { chain.unshift(cur); cur = cur.replyTo && getPost(cur.replyTo); }
  const missingParent = p.replyTo && !chain.length;
  const reps = repliesOf(p.id);
  return header('Post', { back: true }) +
    (missingParent ? '<div class="empty" style="padding:16px">This post is replying to a post that was deleted.</div>' : '') +
    chain.map(c => postHTML(c, { ancestor: true })).join('') +
    postHTML(p, { big: true }) +
    composerHTML({ replyTo: p.id, placeholder: 'Post your reply', btn: 'Reply' }) +
    reps.map(r => postHTML(r, { hideReplying: true })).join('');
}

/* ---------- Router ---------- */
let lastRoute = null;
function parse() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, '')) || 'home';
  const [a, ...rest] = h.split('/');
  return { a, rest };
}
function render(keep = false) {
  const { a, rest } = parse();
  const vals = {}; if (keep) $$('#main textarea').forEach(t => { if (t.value) vals[t.id] = t.value; });
  const active = keep && document.activeElement;
  const focusKey = active && active.closest && active.closest('[data-id]') && active.dataset.act ? [active.closest('[data-id]').dataset.id, active.dataset.act] : null;
  const y = scrollY;
  cid = 0;
  let html, section = '', title = 'Atidbit';
  switch (a) {
    case 'home': html = pageHome(); section = 'Home'; title = 'Home / Atidbit'; break;
    case 'explore': html = pageExplore(); section = 'Explore'; title = 'Explore / Atidbit'; break;
    case 'search': { const q = rest.join('/'); html = pageSearch(q); section = 'Explore'; title = `${q} - Search / Atidbit`; break; }
    case 'tag': html = pageTag(rest[0] || ''); section = 'Explore'; title = `#${rest[0]} / Atidbit`; break;
    case 'notifications': html = pageNotifs(); section = 'Notifications'; title = 'Notifications / Atidbit'; break;
    case 'bookmarks': html = pageBookmarks(); section = 'Bookmarks'; title = 'Bookmarks / Atidbit'; break;
    case 'u': { const u = byHandle(rest[0]); html = pageProfile(rest[0] || '', rest[1]); if (u && u.id === S.me) section = 'Profile'; title = u ? `${u.name} (@${u.handle}) / Atidbit` : 'Profile / Atidbit'; break; }
    case 'post': { const p = getPost(rest[0]); html = pageThread(rest[0]); title = p ? `${user(p.author).name}: “${p.text.slice(0, 50)}” / Atidbit` : 'Post / Atidbit'; break; }
    default: html = header('Not found', { back: true }) + empty('Hmm…this page doesn’t exist.', '<a class="btn btn-primary" href="#/home">Go home</a>');
  }
  $('#main').innerHTML = html;
  document.title = title;
  renderShell(section);
  $$('#main form.composer').forEach(f => { const t = $('textarea', f); if (vals[t.id]) { t.value = vals[t.id]; } updateComposer(f); });
  const route = location.hash;
  if (keep) {
    scrollTo(0, y);
    if (focusKey) { const el = $(`#main [data-id="${focusKey[0]}"] [data-act="${focusKey[1]}"]`); if (el) el.focus({ preventScroll: true }); }
  } else {
    scrollTo(0, 0);
    if (lastRoute !== null) $('#main').focus({ preventScroll: true });
  }
  lastRoute = route;
}
const go = h => { if (location.hash === h) render(); else location.hash = h; };

/* ---------- Actions ---------- */
function createPost(text, replyTo) {
  text = text.trim();
  if (!text || len(text) > MAX) return null;
  const p = { id: uid(), author: S.me, text, created: Date.now(), replyTo: replyTo || null, likes: [], reposts: [] };
  S.posts.push(p); save();
  simulate(p);
  return p;
}
/* Demo engagement: a sample account occasionally likes your post so notifications have something to show. */
function simulate(p) {
  const others = Object.keys(S.users).filter(id => id !== S.me);
  const who = others[Math.floor(Math.random() * others.length)];
  setTimeout(() => {
    const live = getPost(p.id); if (!live || live.likes.includes(who)) return;
    live.likes.push(who);
    S.notifs.push({ id: uid(), type: 'like', from: who, post: p.id, at: Date.now(), read: false });
    save();
    const typing = $$('#main textarea').some(t => t === document.activeElement);
    if (!$('.modal-backdrop') && !typing && parse().a !== 'notifications') render(true); else renderShell(currentSection());
  }, 3500 + Math.random() * 3000);
}
const currentSection = () => ({ home:'Home', explore:'Explore', search:'Explore', tag:'Explore', notifications:'Notifications', bookmarks:'Bookmarks' }[parse().a] || (parse().a === 'u' && byHandle(parse().rest[0]) === me() ? 'Profile' : ''));
function toggle(arr, v) { const i = arr.indexOf(v); if (i >= 0) { arr.splice(i, 1); return false; } arr.push(v); return true; }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }

/* ---------- Modals ---------- */
let opener = null;
function openModal(title, body, onOpen) {
  opener = document.activeElement;
  $('#modal-root').innerHTML = `<div class="modal-backdrop" data-act="close-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-head"><button class="icon-btn" type="button" data-act="close" aria-label="Close">${icon('close')}</button><h2 id="modal-title">${title}</h2></div>${body}</div></div>`;
  document.body.style.overflow = 'hidden';
  const m = $('.modal');
  $$('form.composer', m).forEach(updateComposer);
  (m.querySelector('[data-autofocus]') || m.querySelector('input,textarea,button')).focus();
  if (onOpen) onOpen(m);
}
function closeModal() {
  if (!$('#modal-root').innerHTML) return;
  $('#modal-root').innerHTML = ''; document.body.style.overflow = '';
  if (opener && document.contains(opener)) opener.focus();
}
function openCompose(replyTo) {
  const parent = replyTo && getPost(replyTo);
  const body = (parent ? `<div class="quoted">${postHTML(parent, { noActions: true, hideReplying: true })}<p class="replying" style="margin:6px 0 0 52px">Replying to <span style="color:var(--accent)">@${esc(user(parent.author).handle)}</span></p></div>` : '') +
    composerHTML({ replyTo, placeholder: parent ? 'Post your reply' : 'What’s the tidbit?', btn: parent ? 'Reply' : 'Post', auto: true });
  openModal(parent ? 'Reply' : 'New post', body);
}
function openEditProfile() {
  const u = me();
  const body = `<form class="form" id="edit-form" novalidate>
    <div class="preview-row"><span class="avatar" id="ep-preview" style="--c:${esc(u.color)}" aria-hidden="true">${esc(initials(u.name))}</span><span class="muted">Your avatar shows your initials on the color you pick.</span></div>
    <div class="field"><label for="ep-name"><span>Name</span><span id="ep-name-c">${len(u.name)} / 50</span></label><input id="ep-name" name="name" maxlength="50" required value="${esc(u.name)}" autocomplete="name"></div>
    <div class="field" id="ep-handle-f"><label for="ep-handle"><span>Handle</span><span>letters, numbers, _ (max 15)</span></label><input id="ep-handle" name="handle" maxlength="15" required value="${esc(u.handle)}" autocapitalize="off" spellcheck="false" aria-describedby="ep-err"></div>
    <p class="err-msg" id="ep-err" role="alert"></p>
    <div class="field"><label for="ep-bio"><span>Bio</span><span id="ep-bio-c">${len(u.bio || '')} / 160</span></label><textarea id="ep-bio" name="bio" rows="3" maxlength="160">${esc(u.bio || '')}</textarea></div>
    <fieldset class="swatches"><legend>Avatar color</legend><div class="list">${COLORS.map((c, i) => `<input type="radio" name="color" id="sw${i}" value="${c}" ${c === u.color ? 'checked' : ''}><label for="sw${i}" style="--c:${c}"><span class="sr">Color ${i + 1}</span></label>`).join('')}</div></fieldset>
    <button class="btn btn-dark" type="submit">Save</button>
  </form>`;
  openModal('Edit profile', body, m => {
    const f = $('#edit-form', m), pv = $('#ep-preview', m);
    f.addEventListener('input', () => {
      pv.textContent = initials(f.name.value || '?');
      pv.style.setProperty('--c', (f.querySelector('input[name=color]:checked') || {}).value || u.color);
      $('#ep-name-c', m).textContent = `${len(f.name.value)} / 50`;
      $('#ep-bio-c', m).textContent = `${len(f.bio.value)} / 160`;
    });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const name = f.name.value.trim(), handle = f.handle.value.trim().replace(/^@/, ''), bio = f.bio.value.trim();
      const color = (f.querySelector('input[name=color]:checked') || {}).value || u.color;
      const err = $('#ep-err', m), hf = $('#ep-handle-f', m);
      let msg = '';
      if (!name) msg = 'Please enter a name.';
      else if (!/^\w{1,15}$/.test(handle)) msg = 'Handles can use letters, numbers and _ only (1–15 characters).';
      else { const o = byHandle(handle); if (o && o.id !== S.me) msg = `@${handle} is already taken.`; }
      err.textContent = msg; hf.classList.toggle('err', !!msg && !/name/.test(msg));
      if (msg) { (/name/.test(msg) ? f.name : f.handle).focus(); return; }
      Object.assign(u, { name, handle, bio, color }); save(); closeModal(); toast('Profile saved');
      go('#/u/' + encodeURIComponent(handle));
    });
  });
}

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (t) {
    const act = t.dataset.act, art = t.closest('[data-id]'), p = art && getPost(art.dataset.id);
    switch (act) {
      case 'close-backdrop': if (e.target !== t) return; closeModal(); return;
      case 'close': closeModal(); return;
      case 'compose': openCompose(); return;
      case 'theme': S.theme = S.theme === 'dark' ? 'light' : 'dark'; save(); render(true); if (e.detail === 0) { const b = $(`[data-act="theme"]`, matchMedia('(max-width:699px)').matches ? $('#main') : $('#side')); if (b) b.focus(); } return;
      case 'tab': homeTab = t.dataset.tab; render(); $(`[data-tab="${homeTab}"]`).focus(); return;
      case 'back': if (history.length > 1 && lastRoute) history.back(); else go('#/home'); return;
      case 'edit-profile': openEditProfile(); return;
      case 'reset': if (confirm('Reset Atidbit to the original demo data? Your posts and profile changes in this browser will be erased.')) { localStorage.removeItem(KEY); load(); save(); homeTab = 'foryou'; go('#/home'); toast('Demo data reset'); } return;
      case 'follow': {
        const u = user(t.dataset.user), now = toggle(followsOf(S.me), u.id); save(); render(true);
        const b = e.detail === 0 && $(`[data-act="follow"][data-user="${u.id}"]`); if (b) b.focus({ preventScroll: true });
        toast(now ? `You’re following @${u.handle}` : `Unfollowed @${u.handle}`); return;
      }
    }
    if (!p) return;
    e.preventDefault();
    if (act === 'reply') { openCompose(p.id); return; }
    if (act === 'like') { toggle(p.likes, S.me); save(); render(true); popFx(p.id, 'like'); return; }
    if (act === 'repost') { const i = p.reposts.findIndex(r => r.u === S.me); if (i >= 0) p.reposts.splice(i, 1); else p.reposts.push({ u: S.me, at: Date.now() }); save(); render(true); popFx(p.id, 'repost'); toast(i >= 0 ? 'Repost removed' : 'Reposted'); return; }
    if (act === 'bookmark') { const on = toggle(S.bookmarks, p.id); save(); render(true); toast(on ? 'Added to your Bookmarks' : 'Removed from your Bookmarks'); return; }
    if (act === 'share') {
      const url = location.href.split('#')[0] + '#/post/' + p.id;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Link copied'), () => { prompt('Copy this link:', url); });
      return;
    }
    if (act === 'delete') {
      if (!confirm('Delete this post? This can’t be undone.')) return;
      S.posts = S.posts.filter(x => x.id !== p.id);
      S.bookmarks = S.bookmarks.filter(x => x !== p.id);
      S.notifs = S.notifs.filter(n => n.post !== p.id);
      save(); toast('Your post was deleted');
      if (parse().a === 'post' && parse().rest[0] === p.id) { if (p.replyTo && getPost(p.replyTo)) go('#/post/' + p.replyTo); else go('#/home'); } else render(true);
      return;
    }
    return;
  }
  const art = e.target.closest('article.post[tabindex]');
  if (art && !e.target.closest('a,button') && !getSelection().toString()) go('#/post/' + art.dataset.id);
});
function popFx(id, act) { const b = $(`#main [data-id="${id}"] [data-act="${act}"]`); if (b) b.classList.add('pop'); }
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('.modal-backdrop')) { closeModal(); return; }
  if (e.key === 'Tab' && $('.modal')) {
    const f = $$('.modal button,.modal input,.modal textarea,.modal a[href]').filter(x => !x.disabled && x.tabIndex !== -1);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
  if (e.target.matches('textarea.composer-input') && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.target.form.requestSubmit(); return; }
  if (e.key === 'Enter' && e.target.matches('article.post[tabindex]')) { go('#/post/' + e.target.dataset.id); return; }
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input,textarea,[contenteditable]') && !$('.modal')) { e.preventDefault(); openCompose(); }
});
document.addEventListener('input', e => { const f = e.target.closest('form.composer'); if (f) updateComposer(f); });
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.matches('[data-search]')) {
    e.preventDefault(); const q = f.q.value.trim(); if (!q) return;
    go(q.startsWith('#') && /^#\w+$/.test(q) ? '#/tag/' + encodeURIComponent(q.slice(1)) : '#/search/' + encodeURIComponent(q)); return;
  }
  if (f.matches('form.composer')) {
    e.preventDefault();
    const ta = $('textarea', f), replyTo = f.dataset.reply || null;
    const p = createPost(ta.value, replyTo); if (!p) return;
    const inModal = !!f.closest('.modal');
    ta.value = ''; updateComposer(f);
    if (inModal) closeModal();
    toast(replyTo ? 'Your reply was sent' : 'Your post was sent');
    if (!replyTo && parse().a !== 'home') { homeTab = 'foryou'; go('#/home'); } else render(true);
  }
});
window.addEventListener('hashchange', () => { closeModal(); render(); });
window.addEventListener('storage', e => { if (e.key === KEY) { load(); render(true); } });
setInterval(() => $$('time[data-ts]').forEach(t => { t.textContent = rel(+t.dataset.ts); }), 30000);

load(); save(); render();
})();
