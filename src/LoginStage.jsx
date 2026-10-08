import { useEffect, useRef } from 'react';

// Left half of the login: a selection box that folds shut and open around changing words,
// and a blue dot with eyes that bounces off the edges. All motion is imperative (DOM + Web Animations API),
// so it lives in one effect and React never re-renders it.

const WORDS = ['create.', 'play.', 'talk.', 'share.', 'meet up.'];
// Box centers as fractions of the stage
const SPOTS = [[.40, .36], [.60, .46], [.36, .52], [.58, .32], [.46, .44]];

const P = 'perspective(800px) ';
const M = 12; // clip margin so the corner handles are not cut off
const N = 5;  // slats in the blinds fold
const pt = (x, y) => x + 'px ' + y + 'px';

// Each fold cuts the box into panels. Every panel is a clipped copy of the whole box that turns on its own hinge.
const FOLDS = [
  // 1. Book: top and bottom halves close on the middle line
  () => [
    { clip: `inset(-${M}px -${M}px 50% -${M}px)`, origin: '50% 50%', t0: P + 'rotateX(0deg)', t1: P + 'rotateX(90deg)' },
    { clip: `inset(50% -${M}px -${M}px -${M}px)`, origin: '50% 50%', t0: P + 'rotateX(0deg)', t1: P + 'rotateX(-90deg)' },
  ],
  // 2. Blinds: five slats flip one after another
  () => {
    const s = [];
    for (let i = 0; i < N; i++) {
      const top = i === 0 ? `-${M}px` : (i * 100 / N) + '%';
      const bottom = i === N - 1 ? `-${M}px` : (100 - (i + 1) * 100 / N) + '%';
      s.push({
        clip: `inset(${top} -${M}px ${bottom} -${M}px)`,
        origin: '50% ' + ((i + .5) * 100 / N) + '%',
        t0: P + 'rotateX(0deg)', t1: P + 'rotateX(90deg)', d: i * 32, di: (N - 1 - i) * 32,
      });
    }
    return s;
  },
  // 3. Doors: left and right halves close on the middle line
  () => [
    { clip: `inset(-${M}px 50% -${M}px -${M}px)`, origin: '50% 50%', t0: P + 'rotateY(0deg)', t1: P + 'rotateY(-90deg)' },
    { clip: `inset(-${M}px -${M}px -${M}px 50%)`, origin: '50% 50%', t0: P + 'rotateY(0deg)', t1: P + 'rotateY(90deg)' },
  ],
  // 4. Diagonal: two triangles fold along the corner-to-corner line
  (w, h) => {
    const k = h / w;
    const tl = 'polygon(' + [pt(-M, -M), pt(w + M, -M), pt(w + M, -M * k), pt(-M, h + M * k)].join(',') + ')';
    const br = 'polygon(' + [pt(w + M, -M * k), pt(w + M, h + M), pt(-M, h + M), pt(-M, h + M * k)].join(',') + ')';
    const ax = `rotate3d(${w},${-h},0,`;
    return [
      { clip: tl, origin: '50% 50%', t0: P + ax + '0deg)', t1: P + ax + '90deg)' },
      { clip: br, origin: '50% 50%', t0: P + ax + '0deg)', t1: P + ax + '-90deg)' },
    ];
  },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// mood: '' | 'look' (typing email) | 'shy' (typing password) | 'happy' (logged in)
// pulseKey: change it to make the dot send out a ripple
function LoginStage({ mood, pulseKey }) {
  const stageRef = useRef(null);
  const selRef = useRef(null);
  const wordRef = useRef(null);
  const measureRef = useRef(null);
  const orbRef = useRef(null);
  const faceRef = useRef(null);
  const moodRef = useRef('');

  useEffect(() => { moodRef.current = mood; }, [mood]);

  useEffect(() => {
    const orb = orbRef.current;
    if (!pulseKey || !orb) return;
    orb.classList.remove('pulse');
    void orb.offsetWidth; // restart the CSS animation
    orb.classList.add('pulse');
    const t = setTimeout(() => orb.classList.remove('pulse'), 1000);
    return () => clearTimeout(t);
  }, [pulseKey]);

  useEffect(() => {
    const stage = stageRef.current, sel = selRef.current, word = wordRef.current;
    const measure = measureRef.current, orb = orbRef.current, face = faceRef.current;
    const eyes = Array.from(orb.querySelectorAll('.eye'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cancelled = false, raf = 0, current = 0;
    let W = 0, H = 0, orbSize = 0;
    const timers = new Set();
    const sleep = (ms) => new Promise((r) => { const id = setTimeout(() => { timers.delete(id); r(); }, ms); timers.add(id); });
    const metrics = () => { W = stage.clientWidth; H = stage.clientHeight; orbSize = orb.offsetWidth; };

    word.textContent = WORDS[0];

    function boxFor(i) {
      const fs = parseFloat(getComputedStyle(word).fontSize);
      measure.textContent = WORDS[i];
      const r = measure.getBoundingClientRect();
      const w = Math.round(r.width + fs * .56), h = Math.round(r.height + fs * .36);
      const x = clamp(SPOTS[i][0] * W - w / 2, 24, Math.max(24, W - w - 24));
      const y = clamp(SPOTS[i][1] * H - h / 2, 40, Math.max(40, H - h - 90));
      return { x: Math.round(x), y: Math.round(y), w, h };
    }
    function place(i) {
      const b = boxFor(i);
      sel.style.left = b.x + 'px'; sel.style.top = b.y + 'px';
      sel.style.width = b.w + 'px'; sel.style.height = b.h + 'px';
    }

    function buildLayer(specs) {
      const layer = document.createElement('div');
      layer.className = 'foldlayer';
      layer.style.left = sel.style.left; layer.style.top = sel.style.top;
      layer.style.width = sel.style.width; layer.style.height = sel.style.height;
      const panels = specs.map((s) => {
        const c = sel.cloneNode(true);
        c.removeAttribute('id'); c.classList.remove('land');
        c.style.left = '0px'; c.style.top = '0px'; c.style.width = '100%'; c.style.height = '100%';
        c.style.visibility = 'visible';
        c.style.clipPath = s.clip; c.style.webkitClipPath = s.clip; c.style.transformOrigin = s.origin;
        layer.appendChild(c);
        return c;
      });
      stage.appendChild(layer);
      return { layer, panels };
    }
    const closeBox = (specs, L) => Promise.all(L.panels.map((c, i) => c.animate([
      { transform: specs[i].t0, opacity: 1, offset: 0 },
      { opacity: 1, offset: .85 },
      { transform: specs[i].t1, opacity: 0, offset: 1 },
    ], { duration: 300, delay: specs[i].d || 0, easing: 'cubic-bezier(.5, 0, .8, .5)', fill: 'both' }).finished));
    const openBox = (specs, L) => Promise.all(L.panels.map((c, i) => c.animate([
      { transform: specs[i].t1, opacity: 0, offset: 0 },
      { opacity: 1, offset: .15 },
      { transform: specs[i].t0, opacity: 1, offset: 1 },
    ], { duration: 380, delay: specs[i].di || 0, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'both' }).finished));

    async function run() {
      place(0);
      let k = 0;
      while (!cancelled) {
        await sleep(2600);
        if (cancelled) return;
        if (reduce) { current = (current + 1) % WORDS.length; word.textContent = WORDS[current]; place(current); continue; }
        const mk = FOLDS[k % FOLDS.length];
        let specs = mk(sel.offsetWidth, sel.offsetHeight);
        let L = buildLayer(specs);
        sel.style.visibility = 'hidden';
        await closeBox(specs, L);
        L.layer.remove();
        if (cancelled) return;

        current = (current + 1) % WORDS.length;
        word.textContent = WORDS[current];
        place(current);

        specs = mk(sel.offsetWidth, sel.offsetHeight);
        L = buildLayer(specs);
        await openBox(specs, L);
        L.layer.remove();
        if (cancelled) return;
        sel.style.visibility = '';
        sel.classList.remove('land'); void sel.offsetWidth; sel.classList.add('land');
        k++;
      }
    }

    // The dot: straight lines, bounces off the edges, blinks, looks around and reacts to the form (mood)
    function startOrb() {
      orb.classList.add('on');
      let x = Math.max(0, W - orbSize) * .62, y = Math.max(0, H - orbSize) * .7;
      if (reduce) { orb.style.transform = `translate3d(${x}px,${y}px,0)`; return; }

      const ang = .62;
      let vx = Math.cos(ang), vy = Math.sin(ang);
      let gx = 0, gy = 0, glx = 0, gly = 0, glanceUntil = 0, nextGlance = 2.2;
      let nextBlink = 1.8, blinkAt = -9, eyeOpen = 1;
      const t0 = performance.now();
      let last = t0;

      function frame(now) {
        const t = (now - t0) / 1000;
        const dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
        const spd = clamp(Math.hypot(W, H) * .11, 90, 150);
        const maxX = Math.max(0, W - orbSize), maxY = Math.max(0, H - orbSize);

        x += vx * spd * dt; y += vy * spd * dt;
        if (x < 0) { x = 0; vx = Math.abs(vx); } else if (x > maxX) { x = maxX; vx = -Math.abs(vx); }
        if (y < 0) { y = 0; vy = Math.abs(vy); } else if (y > maxY) { y = maxY; vy = -Math.abs(vy); }
        orb.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;

        const maxG = orbSize * .075;
        let tx = vx * maxG, ty = vy * maxG * .8;
        if (t >= nextGlance) {
          glanceUntil = t + .9; nextGlance = t + 2.5 + Math.random() * 2.5;
          const a = Math.random() * 6.283; glx = Math.cos(a) * maxG; gly = Math.sin(a) * maxG * .8;
        }
        if (t < glanceUntil) { tx = glx; ty = gly; }
        const m = moodRef.current;
        if (m === 'look') { tx = maxG; ty = maxG * .15; }
        else if (m === 'shy') { tx = 0; ty = maxG * .6; }
        gx += (tx - gx) * .1; gy += (ty - gy) * .1;
        face.style.transform = `translate(${gx.toFixed(2)}px,${gy.toFixed(2)}px)`;

        if (t >= nextBlink) { blinkAt = t; nextBlink = t + 2.4 + Math.random() * 2.8; }
        const bu = (t - blinkAt) / .15;
        let sc = 1;
        if (bu >= 0 && bu <= 1) sc = 1 - .92 * Math.sin(Math.PI * bu);
        const openTarget = m === 'shy' ? .05 : (m === 'happy' ? .5 : 1);
        eyeOpen += (openTarget - eyeOpen) * .25;
        for (const eye of eyes) eye.style.transform = `scaleY(${(sc * eyeOpen).toFixed(3)})`;

        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { metrics(); place(current); }, 120);
    };
    window.addEventListener('resize', onResize);

    const start = () => { if (cancelled) return; metrics(); run(); startOrb(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);
      stage.querySelectorAll('.foldlayer').forEach((n) => n.remove());
      sel.style.visibility = '';
    };
  }, []);

  return (
    <section className="stage" ref={stageRef} aria-hidden="true">
      <div className="grid" />
      <div className="orb" ref={orbRef}>
        <i className="core" />
        <div className="face" ref={faceRef}><i className="eye l" /><i className="eye r" /></div>
        <i className="ring" />
      </div>
      <div className="sel" ref={selRef}>
        <span className="h tl" /><span className="h tr" /><span className="h bl" /><span className="h br" />
        <p className="word" ref={wordRef} />
      </div>
      <p className="word measure" ref={measureRef} />
      <img className="corner-logo" src="/logo-mark.png" alt="" />
      <div className="glass">Text-first chat for your communities</div>
    </section>
  );
}

export default LoginStage;
