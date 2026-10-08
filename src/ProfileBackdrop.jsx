import { useEffect, useRef } from 'react';

// Full-screen halftone: a grid of dots whose size follows a wandering "swell".
// Small dots stay grey; the big ones turn blue and glow. The swell drifts, so the pattern breathes.

const GAP = 22;                 // distance between dots
const R_MIN = .6, R_MAX = 6.2;  // dot radius range
const GREY = [128, 134, 144];
const BLUE = [91, 155, 255];

function ProfileBackdrop() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // One soft blue blob, drawn once and stamped under every big dot
    const glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    const g = glow.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(91,155,255,.95)');
    grad.addColorStop(.4, 'rgba(61,124,255,.35)');
    grad.addColorStop(1, 'rgba(61,124,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);

    let w = 0, h = 0, raf = 0, cols = 0, rows = 0, ox = 0, oy = 0;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / GAP) + 1; rows = Math.ceil(h / GAP) + 1;
      ox = (w - (cols - 1) * GAP) / 2; oy = (h - (rows - 1) * GAP) / 2; // keep the grid centered
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const R = Math.max(w, h) * .34;
      // two swells wandering on slow loops; the first starts at the center like the reference
      const ax = w * (.5 + .22 * Math.sin(t * .17)), ay = h * (.5 + .2 * Math.sin(t * .23 + 1));
      const bx = w * (.5 + .3 * Math.sin(t * .13 + 2.4)), by = h * (.5 + .26 * Math.cos(t * .19));

      for (let j = 0; j < rows; j++) {
        const y = oy + j * GAP;
        for (let i = 0; i < cols; i++) {
          const x = ox + i * GAP;
          const da = Math.hypot(x - ax, y - ay), db = Math.hypot(x - bx, y - by);
          let s = Math.exp(-(da * da) / (R * R)) + .6 * Math.exp(-(db * db) / (R * R * .55));
          s += .08 * Math.sin(da * .035 - t * 1.2);           // a faint ripple running outward
          s = Math.max(0, Math.min(1, s));
          const r = R_MIN + (R_MAX - R_MIN) * s;
          const heat = Math.max(0, (s - .3) / .7);              // grey until the dot gets big
          if (heat > .05) {
            const size = r * 5.5;
            ctx.globalAlpha = Math.min(1, heat * .9);
            ctx.drawImage(glow, x - size / 2, y - size / 2, size, size);
          }
          const rr = Math.round(GREY[0] + (BLUE[0] - GREY[0]) * heat);
          const gg = Math.round(GREY[1] + (BLUE[1] - GREY[1]) * heat);
          const bb = Math.round(GREY[2] + (BLUE[2] - GREY[2]) * heat);
          ctx.globalAlpha = .35 + .65 * Math.max(heat, s);
          ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 6.283);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    resize();
    const frame = (now) => { draw(now / 1000); raf = requestAnimationFrame(frame); };
    if (reduce) draw(0); else raf = requestAnimationFrame(frame);

    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { resize(); if (reduce) draw(0); }, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas className="backdrop" ref={ref} aria-hidden="true" />;
}

export default ProfileBackdrop;
