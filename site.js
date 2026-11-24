// Aemon website. AGPL-3.0-or-later. No tracking, no libraries.
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const D = window.AEMON_DATA;
  let toastT;
  const toast = (m) => { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2800); };
  /* ---------- links that go live with the first release (config.js) ---------- */
  const C = window.AEMON_CONFIG || {}, rel = C.downloads || (C.repo && C.repo + '/releases/latest/download/');
  const LINKS = { setup: rel && rel + 'Aemon-Suite-Setup.exe', zip: rel && rel + 'Aemon-Suite-VST3.zip', repo: C.repo, issues: C.repo && C.repo + '/issues', mail: C.email && 'mailto:' + C.email };
  document.querySelectorAll('[data-link]').forEach((a) => {
    const url = LINKS[a.dataset.link];
    if (url) a.href = url;
    else a.addEventListener('click', (e) => { e.preventDefault(); toast(a.dataset.link === 'mail' ? 'The email address is added before launch.' : 'Goes live with the first release.'); });
  });

  /* ---------- Simple / Pro screenshots ---------- */
  document.querySelectorAll('.plug').forEach((p) => {
    const shot = p.querySelector('.shot');
    p.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
      shot.dataset.mode = b.dataset.m;
      p.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
  });
  $('wipeR').addEventListener('input', (e) => $('wipe').style.setProperty('--x', e.target.value + '%'));

  /* ---------- installer preview ---------- */
  const boxes = [1, 2, 3, 4].map((i) => $('i' + i));
  boxes.forEach((b) => b.addEventListener('change', () => { const n = boxes.filter((x) => x.checked).length; $('setupCount').textContent = n ? n + (n > 1 ? ' plugins selected' : ' plugin selected') : 'Nothing selected'; }));

  /* ---------- presets ---------- */
  $('plist').innerHTML = D.presets.map((p, i) => `<li><button aria-expanded="${i === 0}"><span class="pn"><span>${p[1]}</span><i>${p[0]}</i></span><span class="pd">${p[2]}</span></button></li>`).join('');
  $('plist').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const open = b.getAttribute('aria-expanded') === 'true';
    $('plist').querySelectorAll('button').forEach((x) => x.setAttribute('aria-expanded', 'false'));
    b.setAttribute('aria-expanded', String(!open));
  });

  /* ---------- charts (real measurements, see data.js) ---------- */
  const svg = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
  (() => {
    const W = 560, H = 340, l = 46, r = 12, t = 14, b = 36, x0 = Math.log(2000), x1 = Math.log(20000), yMax = 10;
    const X = (f) => l + (Math.log(f) - x0) / (x1 - x0) * (W - l - r), Y = (d) => t + (1 - d / yMax) * (H - t - b);
    let s = '';
    for (const d of [0, 3, 6, 9]) s += `<line x1="${l}" x2="${W - r}" y1="${Y(d)}" y2="${Y(d)}" stroke="#22252d"/><text x="${l - 10}" y="${Y(d) + 4}" text-anchor="end">${d ? '+' + d : '0'}</text>`;
    for (const f of [2000, 5000, 10000, 20000]) s += `<line x1="${X(f)}" x2="${X(f)}" y1="${t}" y2="${H - b}" stroke="#22252d"/><text x="${X(f)}" y="${H - b + 24}" text-anchor="${f === 20000 ? 'end' : 'middle'}">${f / 1000} kHz</text>`;
    const path = (k) => D.eq.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[k]).toFixed(1)).join('');
    s += `<path d="${path(3)}" fill="none" stroke="#8b8e9b" stroke-width="2.5"/><path d="${path(2)}" fill="none" stroke="#f0a35b" stroke-width="4"/><path d="${path(1)}" fill="none" stroke="#ede7dc" stroke-width="1.6" stroke-dasharray="5 5"/>`;
    const e = D.eq[D.eq.length - 1];
    s += `<line x1="${X(e[0]) - 4}" x2="${X(e[0]) - 4}" y1="${Y(e[2]) + 7}" y2="${Y(e[3]) - 5}" stroke="#8b8e9b" stroke-dasharray="2 3"/><text class="d" x="${X(e[0]) - 6}" y="${Y(0.55)}" text-anchor="end" style="fill:#b4afa5">4.4 dB lost</text>`;
    $('chartEq').innerHTML = svg(W, H, s, 'EQ curves from 2 to 20 kHz: Aemon follows the analogue curve, the textbook filter falls 4.4 dB below it at 20 kHz');
  })();
  (() => {
    const W = 560, H = 340, l = 8, r = 12, t = 30, b = 36, min = -2.9, max = 2.4;
    const X = (d) => l + (d - min) / (max - min) * (W - l - r);
    let s = '';
    for (const d of [-2, -1, 0, 1, 2]) s += `<line x1="${X(d)}" x2="${X(d)}" y1="${t}" y2="${H - b}" stroke="${d === -1 ? '#ff5c50' : '#22252d'}" ${d === -1 ? 'stroke-dasharray="5 4"' : ''}/><text x="${X(d)}" y="${H - b + 24}" text-anchor="middle">${d > 0 ? '+' + d : String(d).replace('-', '−')}${d === 0 ? ' dBTP' : ''}</text>`;
    s += `<text class="d" x="${X(-1)}" y="${t - 11}" text-anchor="middle" style="fill:#ff8a80">ceiling −1.0</text>`;
    D.tp.forEach((g, i) => {
      const y = t + 14 + i * 92, cx = X(-1), over = X(g[1]);
      const name = (txt, yy) => `<text class="d" x="${l}" y="${yy}" style="fill:#ede7dc">${txt}</text>`;
      s += name(g[0], y + 6);
      s += `<rect x="${cx}" y="${y + 18}" width="${over - cx}" height="18" fill="#646877"/><text x="${over - 9}" y="${y + 32}" text-anchor="end" style="fill:#fff;stroke:none">+${g[1].toFixed(2)}</text>`;
      s += `<circle cx="${X(g[2])}" cy="${y + 52}" r="8" fill="#f0a35b"/><text x="${cx + 18}" y="${y + 57}" style="fill:#ffc58e">−${Math.abs(g[2]).toFixed(2)}</text>`;
    });
    $('chartTp').innerHTML = svg(W, H, s, 'True peaks: sample-peak limiting goes up to +2.18 dBTP, Aemon with true peak on stays at or below the -1.0 ceiling');
  })();

  /* ---------- listening console ---------- */
  const PRE = 0.30, LOOP = D.loop;            // seconds into the file, and the exact loop length
  let cur = 0, after = true, playing = false, ctx = null, master = null, analyser = null, srcs = null, t0 = 0, offset = 0, token = 0;
  const cache = new Map();
  const db = (x) => Math.pow(10, x / 20);
  const clip = () => D.clips[cur];
  const trims = () => {
    const c = clip(), m = $('match').checked && !c.noMatch;
    if (c.noMatch) return [-2, -2];
    // matched: both sides brought to the quieter one; unmatched: the real levels, shifted down together
    if (m) { const ref = Math.min(c.lufs[0], c.lufs[1]); return [ref - c.lufs[0], ref - c.lufs[1]]; }
    return [-1, -1];
  };
  const tabs = $('tabs');
  tabs.innerHTML = D.clips.map((c, i) => `<button role="tab" id="tab${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${c.name}</button>`).join('');
  const fmt = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
  function ui() {
    const c = clip();
    [...tabs.children].forEach((b, i) => { b.setAttribute('aria-selected', String(i === cur)); b.tabIndex = i === cur ? 0 : -1; });
    $('abA').setAttribute('aria-pressed', String(after)); $('abB').setAttribute('aria-pressed', String(!after));
    $('scopeL').textContent = after ? 'After' : 'Before'; $('scopeL').style.color = after ? '#f0a35b' : '#86e0cb';
    $('note').innerHTML = `<b>${c.title}</b> ${c.text}`;
    $('meters').innerHTML = `<dt class="h">As processed</dt><dd class="h">Before</dd><dd class="h">After</dd><dt>Loudness</dt><dd class="num">${fmt(c.lufs[0])}</dd><dd class="num">${fmt(c.lufs[1])} LUFS</dd><dt>True peak</dt><dd class="num">${fmt(c.tp[0])}</dd><dd class="num">${fmt(c.tp[1])} dBTP</dd>`;
    $('match').disabled = !!c.noMatch; $('match').parentElement.style.opacity = c.noMatch ? .45 : 1;
    $('play').setAttribute('aria-label', playing ? 'Stop' : 'Play');
    $('playIcon').setAttribute('d', playing ? 'M5 4h5v16H5zM14 4h5v16h-5z' : 'M6 3l15 9-15 9z');
  }
  async function load(id) {
    if (!cache.has(id)) cache.set(id, (async () => {
      const r = await fetch('assets/audio/' + id + '.mp3'); if (!r.ok) throw new Error(r.status);
      return ctx.decodeAudioData(await r.arrayBuffer());
    })().catch((e) => { cache.delete(id); throw e; }));
    return cache.get(id);
  }
  function setGains(time = 0.012) {
    if (!srcs) return; const tr = trims(), n = ctx.currentTime;
    srcs.g.forEach((g, i) => { g.gain.cancelScheduledValues(n); g.gain.setTargetAtTime((after ? i === 1 : i === 0) ? db(tr[i]) : 0, n, time); });
  }
  function halt() { if (srcs) { const s = srcs; s.g.forEach((g) => g.gain.setTargetAtTime(0, ctx.currentTime, 0.01)); setTimeout(() => s.n.forEach((x) => { try { x.stop(); } catch (_) {} }), 80); srcs = null; } }
  const pos = () => (playing && srcs ? ((ctx.currentTime - t0 + offset) % LOOP + LOOP) % LOOP : offset);
  async function start(from = 0) {
    const my = ++token;
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .9; analyser = ctx.createAnalyser(); analyser.fftSize = 4096; analyser.smoothingTimeConstant = .82; master.connect(analyser); analyser.connect(ctx.destination); }
    await ctx.resume();
    $('scopeR').textContent = 'Loading';
    let bufs;
    try { bufs = await Promise.all(['before', 'after'].map((k) => load(clip().id + '-' + k))); } catch (e) { $('scopeR').textContent = 'Could not load'; toast('The clip could not be loaded.'); playing = false; ui(); return; }
    if (my !== token) return;
    halt();
    const tr = trims(), when = ctx.currentTime + .04, g = [], n = [];
    bufs.forEach((b, i) => {
      const s = ctx.createBufferSource(), v = ctx.createGain();
      s.buffer = b; s.loop = true; s.loopStart = PRE; s.loopEnd = PRE + LOOP;
      v.gain.value = (after ? i === 1 : i === 0) ? db(tr[i]) : 0;
      s.connect(v); v.connect(master); s.start(when, PRE + from); g.push(v); n.push(s);
    });
    srcs = { g, n }; t0 = when; offset = from; playing = true; $('scopeR').textContent = 'Spectrum'; ui(); requestAnimationFrame(draw);
  }
  function stop() { ++token; offset = pos(); playing = false; halt(); $('scopeR').textContent = 'Press play'; ui(); draw(); }
  $('play').addEventListener('click', () => (playing ? stop() : start(offset)));
  const setAB = (a) => { after = a; setGains(); ui(); if (!playing) draw(); };
  $('abA').addEventListener('click', () => setAB(true)); $('abB').addEventListener('click', () => setAB(false));
  $('match').addEventListener('change', () => setGains(.03));
  const pick = (i) => { cur = i; offset = 0; ui(); if (playing) start(0); else draw(); };
  tabs.addEventListener('click', (e) => { const i = [...tabs.children].indexOf(e.target.closest('button')); if (i >= 0) pick(i); });
  tabs.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { pick((cur + d + D.clips.length) % D.clips.length); tabs.children[cur].focus(); } });
  document.addEventListener('keydown', (e) => { if ((e.key === 'x' || e.key === 'X') && !e.ctrlKey && !e.metaKey && !e.altKey && playing) setAB(!after); });
  const cv = $('scope'), g2 = cv.getContext('2d');
  cv.addEventListener('click', (e) => { const r = cv.getBoundingClientRect(), p = (e.clientX - r.left) / r.width * LOOP; if (playing) start(p); else { offset = p; draw(); } });
  function draw() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    g2.setTransform(dpr, 0, 0, dpr, 0, 0); g2.clearRect(0, 0, w, h);
    const mid = h * .55, amp = h * .36, c = clip(), P = [D.peaks[c.id + '-before'], D.peaks[c.id + '-after']], tr = trims();
    const head = pos() / LOOP;
    if (playing && analyser) {   // spectrum behind the waveform
      const f = new Float32Array(analyser.frequencyBinCount); analyser.getFloatFrequencyData(f);
      g2.beginPath(); g2.moveTo(0, h);
      for (let x = 0; x <= w; x += 3) { const hz = 30 * Math.pow(18000 / 30, x / w), b0 = hz / ctx.sampleRate * analyser.fftSize, i = Math.max(1, Math.floor(b0)); let v = f[i] + (f[i + 1] - f[i]) * (b0 - i); v += 3.2 * Math.log2(hz / 1000); const y = h - Math.max(0, Math.min(1, (v + 92) / 78)) * h * .8; g2.lineTo(x, y); }
      g2.lineTo(w, h); g2.closePath(); const gr = g2.createLinearGradient(0, h * .2, 0, h); const col = after ? '240,163,91' : '134,224,203'; gr.addColorStop(0, `rgba(${col},.30)`); gr.addColorStop(1, `rgba(${col},.03)`); g2.fillStyle = gr; g2.fill();
    }
    const bar = (k, on) => {
      const p = P[k], n = p.length, bw = w / n, G = db(tr[k]);
      p.forEach((v, i) => { const a = Math.max(1, v / 99 * G * amp), past = i / n <= head;
        g2.fillStyle = on ? (k ? (past ? '#f0a35b' : 'rgba(240,163,91,.45)') : (past ? '#86e0cb' : 'rgba(134,224,203,.45)')) : 'rgba(237,231,220,.10)';
        g2.fillRect(i * bw + bw * .18, mid - a, Math.max(1, bw * .64), a * 2); });
    };
    bar(after ? 0 : 1, false); bar(after ? 1 : 0, true);
    g2.fillStyle = '#ede7dc'; g2.fillRect(head * w - .75, 44, 1.5, h - 60);
    if (playing) requestAnimationFrame(draw);
  }
  addEventListener('resize', () => { if (!playing) draw(); });
  ui(); draw();
})();
