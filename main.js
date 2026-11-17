(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('js');
  setTimeout(() => document.body.classList.remove('intro'), 2600);
  const nav = $('#nav'), menu = $('.menu');
  const scrim = $('#scrim');
  const closeMenu = () => { nav.classList.remove('open'); scrim.classList.remove('on'); menu.setAttribute('aria-expanded', 'false'); };
  $('.skip').onclick = e => { e.preventDefault(); $('#main').focus(); };
  menu.onclick = () => { const o = nav.classList.toggle('open'); scrim.classList.toggle('on', o); menu.setAttribute('aria-expanded', o); };
  scrim.onclick = closeMenu; $('.mx').onclick = closeMenu;
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* pages */
  const pages = $$('[data-page]'), links = $$('nav a:not(.btn)');
  const names = { services: 'Services', work: 'Portfolio', about: 'About', contact: 'Contact' };
  const tabAlias = { formatting: 'fmt', 'manuscript-audit': 'aud', 'visibility-audit': 'vis' };
  const route = () => {
    const h0 = location.hash.slice(1), n = tabAlias[h0] ? 'services' : h0, name = pages.some(p => p.dataset.page === n) ? n : 'home';
    if (tabAlias[h0]) setTab(tabAlias[h0]);
    pages.forEach(p => p.hidden = p.dataset.page !== name);
    links.forEach(a => a.hash === '#' + name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    document.title = names[name] ? names[name] + ' | Favour Author Studio' : 'Favour Author Studio | Book Formatting and Author Audits';
    if (name !== 'about') pauseFilm();
    $('#fab').hidden = name === 'contact'; closeMenu(); window.scrollTo(0, 0);
  };
  addEventListener('hashchange', route);

  /* reveal */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 }) : null;
  $$('.rv').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* hero book */
  const lv = $$('.leaf'), N = lv.length; let i = 0;
  const setBook = n => { i = Math.max(0, Math.min(N, n)); lv.forEach((l, k) => { l.classList.toggle('f', k < i); l.style.zIndex = k < i ? k : N - k; }); };
  setBook(0); setTimeout(() => setBook(1), 700);
  $('#book').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); setBook(e.clientX > r.left + r.width / 2 ? i + 1 : i - 1); };
  $('#prev').onclick = () => setBook(i - 1); $('#next').onclick = () => setBook(i + 1);

  /* formatting demo */
const raw = $('#raw'), fmt = $('#fmt'), styleNames = { modern: 'Modern self-help', classic: 'Classic novel', elegant: 'Elegant framed' };
const press = (sel, fn) => $$(sel).forEach(b => b.setAttribute('aria-pressed', fn(b)));
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const render = () => {
  const PAGE = 230, v = id => $('#' + id).value.trim(), words = s => s.split(/\s+/).filter(Boolean);
  const text = $('#rx').value.trim(), blocks = /\n\s*\n/.test(text) ? text.split(/\n\s*\n/) : text.split(/\n/);
  let used = 0, first = true, out = [];
  for (const b of blocks) {
    const s = b.replace(/\s+/g, ' ').trim(); if (!s) continue;
    const w = words(s).length;
    if (w <= 8 && !/[.!?:;,]/.test(s)) { out.push('<h5>' + esc(s) + '</h5>'); continue; }
    if (used + w > PAGE) {
      if (used < PAGE / 2) { const part = words(s).slice(0, PAGE - used).join(' '), cut = part.lastIndexOf('. '); out.push('<p' + (first ? ' class="f"' : '') + '>' + esc(cut > 40 ? part.slice(0, cut + 1) : part + '…') + '</p>'); }
      break;
    }
    out.push('<p' + (first ? ' class="f"' : '') + '>' + esc(s) + '</p>'); first = false; used += w;
  }
  const q = v('rq');
  fmt.innerHTML = '<div class="chop"><small>CHAPTER</small><b>' + esc(v('rn') || '1') + '</b><h4>' + esc(v('rt') || 'Untitled chapter') + '</h4></div>'
    + (q ? '<div class="pq">' + esc(q) + '</div>' : '')
    + (out.length ? out.join('') : '<p class="f">Paste some text to see it formatted.</p>')
    + '<div class="rf"><span>' + esc(v('rb') || 'Your book title') + '</span><span>1</span></div>';
  $('#fnote').hidden = false;
};
const show = f => { const was = fmt.hidden; if (f) render(); raw.hidden = f; fmt.hidden = !f; if (f && was && matchMedia('(max-width:860px)').matches) fmt.scrollIntoView({ behavior: 'smooth', block: 'start' }); press('[data-mode]', x => (x.dataset.mode === 'fmt') === f); };
$('#rclr').onclick = () => { $('#rx').value = ''; $('#rx').focus(); };
$$('[data-mode]').forEach(b => b.onclick = () => show(b.dataset.mode === 'fmt'));
$$('[data-style]').forEach(b => b.onclick = () => { fmt.dataset.s = b.dataset.style; press('[data-style]', x => x === b); show(true); });
$$('[data-t]').forEach(c => c.onchange = () => { fmt.classList.toggle('no-' + c.dataset.t, !c.checked); show(true); });
$('#want').addEventListener('click', () => { const m = $('#form textarea'); if (!m.value) m.value = 'I would like the ' + styleNames[fmt.dataset.s] + ' interior style for my book.'; });

  /* readiness check */
  const cks = $$('#chk input'), msgs = ['Tick what is true for your manuscript.', 'Many manuscripts start here. An audit shows where to begin.', 'An audit would catch the gaps before readers do.', 'Solid foundations. An audit would tighten the rest.', 'Close. An audit can confirm what is left.', 'Almost ready. A final audit would confirm it.', 'Ready to format. Let’s make it look the part.'];
  cks.forEach(c => c.onchange = () => { const n = cks.filter(x => x.checked).length; $('#meter i').style.width = n / 6 * 100 + '%'; $('#cmsg').textContent = n + ' of 6. ' + msgs[n]; });

  /* contact */
  const svc = $('#service'), setSvc = v => { if (v && [...svc.options].some(o => o.text === v)) svc.value = v; };
  $$('[data-service]').forEach(a => a.addEventListener('click', () => setSvc(a.dataset.service)));
  $('#year').textContent = new Date().getFullYear();
  const f = $('#form'), st = $('#status');
  f.onsubmit = async e => {
    e.preventDefault();
    if (f.action.includes('YOUR_FORM_ID')) { st.textContent = 'The contact form is not connected yet. Please contact me on LinkedIn for now.'; return; }
    st.textContent = 'Sending…';
    try {
      const r = await fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } });
      if (!r.ok) throw 0; f.reset(); st.textContent = 'Thank you. Your message is sent and I will reply by email.';
    } catch { st.textContent = 'Your message did not send. Please try again in a moment or contact me on LinkedIn.'; }
  };

  /* intro film */
const sc = $$('.sc'), D = 6000, T = sc.length * D, film = $('#film'), pp = $('#pp'), nar = $('#nar'), chap = $('#chap');
let t = 0, play = false, last = 0, cur = -1;
const say = x => { if (window.speechSynthesis) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(x)); } };
const scene = k => { if (k === cur) return; cur = k; sc.forEach((s, j) => s.classList.toggle('on', j === k)); $$('button', chap).forEach((b, j) => b.setAttribute('aria-pressed', j === k)); if (play && nar.checked) say(sc[k].innerText); };
const paint = () => { scene(Math.min(sc.length - 1, Math.floor(t / D))); $('#pbar i').style.width = t / T * 100 + '%'; film.classList.toggle('ended', t >= T); film.classList.toggle('playing', play); pp.textContent = play ? 'Pause' : t >= T ? 'Replay' : 'Play'; };
const loop = n => { if (!play) return; t = Math.min(T, t + Math.min(n - last, 100)); last = n; if (t >= T) play = false; paint(); if (play) requestAnimationFrame(loop); };
const start = () => { if (t >= T) { t = 0; cur = -1; } play = true; last = performance.now(); paint(); requestAnimationFrame(loop); };
function pauseFilm() { play = false; if (window.speechSynthesis) speechSynthesis.cancel(); paint(); }
const toggle = () => play ? pauseFilm() : start();
const seek = ms => { t = Math.max(0, Math.min(T, ms)); cur = -1; paint(); };
sc.forEach((s, k) => { const b = document.createElement('button'); b.textContent = s.dataset.n; b.onclick = () => seek(k * D + 1); chap.append(b); });
$('#big').onclick = start; pp.onclick = toggle;
$('#pbar').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * T); };
$('.stage').onclick = e => { if (!e.target.closest('a')) toggle(); };
film.onkeydown = e => {
  if (e.target !== film) return;
  if (e.code === 'Space') { e.preventDefault(); toggle(); }
  else if (e.code === 'ArrowRight') seek((cur + 1) * D + 1);
  else if (e.code === 'ArrowLeft') seek(Math.max(0, cur - 1) * D + 1);
};

/* visibility check */
const vf = ['vt', 'vs', 'va', 'vd'].map(id => $('#' + id)), wc = s => (s.trim().match(/\S+/g) || []).length;
const vis = () => {
  const [t, s, a, d] = vf.map(x => x.value.trim()), first = d.split(/[.!?]/)[0];
  const c = [
    [t && t.length <= 60, 'Title is clear and under 60 characters', 'Shorten the title and move the detail into a subtitle'],
    [wc(s) >= 6, 'Subtitle tells readers what they gain', 'Add a subtitle of six or more words that states the promise'],
    [wc(a) >= 3, 'Your reader is named', 'Say exactly who this book is for'],
    [d && wc(first) <= 22, 'Description opens with a short hook', 'Open with one short sentence a reader would stop for'],
    [wc(d) >= 80 && wc(d) <= 250, 'Description is 80 to 250 words', 'Aim for 80 to 250 words (now ' + wc(d) + ')'],
    [/\byou(r)?\b/i.test(d), 'Description speaks to the reader', 'Use “you” so readers see themselves in the book']
  ], n = c.filter(x => x[0]).length;
  $('#lt').textContent = t || 'Your title'; $('#ls').textContent = s || 'Your subtitle';
  $('#la').textContent = a ? 'For: ' + a : 'For: not stated yet'; $('#ld').textContent = d || 'Your description';
  $('#vc').innerHTML = c.map(x => '<li class="' + (x[0] ? 'ok' : 'no') + '">' + (x[0] ? x[1] : x[2]) + '</li>').join('');
  $('#vm i').style.width = n / 6 * 100 + '%';
  $('#vn').textContent = n + ' of 6 basics covered. ' + (n >= 5 ? 'Strong basics. A full audit also looks at keywords, categories, and your author presence.' : 'Quick wins here, and a full audit would go much deeper.');
};
vf.forEach(x => x.oninput = vis); vis();

/* testimonials */
const tq = $$('.tq'); let q = 0;
const showQ = n => { q = (n + tq.length) % tq.length; tq.forEach((e, k) => e.classList.toggle('on', k === q)); $('#tqd').textContent = (q + 1) + ' of ' + tq.length; };
$('#tqp').onclick = () => showQ(q - 1); $('#tqn').onclick = () => showQ(q + 1); showQ(0);

/* service tabs */
function setTab(k) { press('[data-st]', x => x.dataset.st === k); $$('[data-svc]').forEach(s => s.hidden = s.dataset.svc !== k); }
$$('[data-st]').forEach(b => b.onclick = () => { setTab(b.dataset.st); $('.stabs').scrollIntoView({ behavior: 'smooth', block: 'start' }); });

/* portfolio filter, quote builder, accordion, slider, progress */
$$('[data-f]').forEach(b => b.onclick = () => { press('[data-f]', x => x === b); $$('[data-c]').forEach(s => s.hidden = b.dataset.f !== 'all' && s.dataset.c !== b.dataset.f); });
const qb = $$('.qbo input'); let auto = '';
qb.forEach(x => x.onchange = () => {
  const s = qb.filter(y => y.dataset.k === 's' && y.checked).map(y => y.value), fm = qb.filter(y => y.dataset.k === 'f' && y.checked).map(y => y.value);
  setSvc(s.length === 1 ? s[0] : s.length ? 'More than one service' : 'Not sure yet');
  const m = $('#form textarea'), msg = s.length ? 'I am interested in: ' + s.join(', ') + (fm.length ? '. Formats: ' + fm.join(' and ') : '') + '.' : '';
  if (!m.value || m.value === auto) m.value = auto = msg;
});
$$('details').forEach(d => d.ontoggle = () => { if (d.open) $$('details').forEach(o => { if (o !== d) o.open = false; }); });
$('#bax').oninput = e => $('#ba').style.setProperty('--x', e.target.value + '%');
addEventListener('scroll', () => { const r = document.documentElement; $('#prog').style.width = r.scrollTop / ((r.scrollHeight - r.clientHeight) || 1) * 100 + '%'; $('#fab').classList.toggle('show', r.scrollTop > 500); }, { passive: true });

/* page lightbox */
const lb = $('#lb');
$$('.gp').forEach(b => b.onclick = () => { $('#lbi').style.backgroundImage = 'var(--' + b.dataset.p + ')'; lb.showModal(); });
$('#lbx').onclick = () => lb.close(); lb.onclick = e => { if (e.target === lb) lb.close(); };
paint(); route();
})();
