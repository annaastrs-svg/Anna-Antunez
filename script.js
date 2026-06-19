'use strict';
 
// ══════════════════════════════════════════════
//  CURSOR PERSONALIZADO
// ══════════════════════════════════════════════
const cursorDot   = document.getElementById('cursor');
const cursorRing  = document.getElementById('cursor-trail');
let mx = -200, my = -200, rx = -200, ry = -200;
 
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left  = mx + 'px';
  cursorDot.style.top   = my + 'px';
});
 
(function trailLoop() {
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(trailLoop);
})();
 
 
// ══════════════════════════════════════════════
//  CANVAS INTERACTIVO — espirales + constelaciones + lirios
// ══════════════════════════════════════════════
(function () {
  const cv  = document.getElementById('bg');
  const ctx = cv.getContext('2d');
  let W, H, mouse = { x: -999, y: -999 };
 
  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
 
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();
 
  // ── Paleta cálida ──
  const WARM = [
    [234, 88, 12],   // fire
    [249, 115, 22],  // flame
    [245, 158, 11],  // gold
    [194, 65, 12],   // ember
    [220, 38, 38],   // crimson
    [251, 191, 36],  // amber bright
    [180, 83, 9],    // brown gold
    [253, 186, 116], // peach
  ];
  const COL_SKY = [56, 189, 248];
 
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick() { return WARM[Math.floor(Math.random() * WARM.length)]; }
 
  // ── ESPIRALES ──
  const spirals = Array.from({ length: 6 }, () => {
    const c = pick();
    return {
      x: rnd(0, W), y: rnd(0, H),
      r: rnd(80, 180),
      turns: rnd(2.5, 5),
      rot: rnd(0, Math.PI * 2),
      rotSpeed: rnd(-0.0003, 0.0003),
      vx: rnd(-0.08, 0.08),
      vy: rnd(-0.08, 0.08),
      alpha: rnd(0.04, 0.09),
      lw: rnd(0.8, 2),
      color: c,
      // atracción suave al mouse
      mass: rnd(0.00002, 0.00006),
    };
  });
 
  function drawSpiral(s, t) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.globalAlpha = s.alpha;
    ctx.strokeStyle = `rgb(${s.color[0]},${s.color[1]},${s.color[2]})`;
    ctx.lineWidth = s.lw;
    ctx.beginPath();
    const steps = 320;
    for (let i = 0; i <= steps; i++) {
      const ang = (i / steps) * s.turns * Math.PI * 2;
      const rad = (i / steps) * s.r;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }
 
  function updateSpirals() {
    spirals.forEach(s => {
      // movimiento autónomo
      s.rot += s.rotSpeed;
      s.x   += s.vx;
      s.y   += s.vy;
      // wrap
      if (s.x < -s.r) s.x = W + s.r;
      if (s.x > W + s.r) s.x = -s.r;
      if (s.y < -s.r) s.y = H + s.r;
      if (s.y > H + s.r) s.y = -s.r;
      // atracción suave al mouse
      const dx = mouse.x - s.x;
      const dy = mouse.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 400) {
        s.vx += dx * s.mass;
        s.vy += dy * s.mass;
      }
      // damping
      s.vx *= 0.995; s.vy *= 0.995;
    });
  }
 
  // ── CONSTELACIONES (puntos + líneas) ──
  const STAR_COUNT = Math.floor((window.innerWidth * window.innerHeight) / 5500);
  const stars = Array.from({ length: STAR_COUNT }, () => {
    const c = Math.random() < 0.3 ? pick() : [253, 232, 200];
    return {
      x: rnd(0, W), y: rnd(0, H),
      r: rnd(0.4, 2.2),
      alpha: rnd(0.3, 1),
      twinkleSpeed: rnd(0.0005, 0.0015),
      phase: rnd(0, Math.PI * 2),
      isStar4: Math.random() < 0.15,
      color: c,
      // velocidad de flotación
      vx: rnd(-0.015, 0.015),
      vy: rnd(-0.015, 0.015),
      // reacción al mouse
      ox: 0, oy: 0,
    };
  });
 
  // conectar vecinos para constelaciones
  const constellationEdges = [];
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 90 && Math.random() < 0.35) {
        constellationEdges.push([i, j, d]);
      }
    }
  }
 
  function drawStar4(x, y, r, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
      ctx.lineTo(Math.cos(a) * r * 3.2, Math.sin(a) * r * 3.2);
      ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.7, Math.sin(a + Math.PI / 4) * r * 0.7);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
 
  function updateStars() {
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      // repulsión suave del mouse
      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) {
        const force = (120 - d) / 120 * 0.4;
        s.x += (dx / d) * force;
        s.y += (dy / d) * force;
      }
    });
  }
 
  // ── LIRIOS SVG en canvas ──
  const lilies = Array.from({ length: 7 }, () => {
    const c = WARM[Math.floor(Math.random() * WARM.length)];
    return {
      x: rnd(0, W), y: rnd(0, H),
      scale: rnd(0.4, 1.1),
      rot: rnd(0, Math.PI * 2),
      rotSpeed: rnd(-0.0005, 0.0005),
      alpha: rnd(0.05, 0.13),
      vx: rnd(-0.04, 0.04),
      vy: rnd(-0.04, 0.04),
      color: c,
      hover: 0, // 0→1 cuando el mouse está cerca
    };
  });
 
  function drawFlower(l) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.scale(l.scale, l.scale);
    const alpha = l.alpha + l.hover * 0.12;
    ctx.strokeStyle = `rgb(${l.color[0]},${l.color[1]},${l.color[2]})`;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
 
    // 5 pétalos elípticos alrededor del centro
    const petals = 5;
    const petalLen = 28;
    const petalW   = 10;
    for (let p = 0; p < petals; p++) {
      const ang = (p / petals) * Math.PI * 2;
      ctx.save();
      ctx.rotate(ang);
      ctx.globalAlpha = alpha * (p % 2 === 0 ? 1 : 0.7);
      ctx.beginPath();
      // pétalo: elipse alargada centrada en (0, petalLen/2)
      ctx.ellipse(0, petalLen / 2, petalW / 2, petalLen / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
 
    // centro de la flor
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
 
    // tallo recto hacia abajo
    ctx.globalAlpha = alpha * 0.45;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, petalLen + 20);
    ctx.stroke();
 
    // dos hojitas laterales en el tallo
    ctx.globalAlpha = alpha * 0.35;
    ctx.beginPath();
    ctx.moveTo(0, petalLen + 4);
    ctx.quadraticCurveTo(-14, petalLen + 10, -8, petalLen + 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, petalLen + 10);
    ctx.quadraticCurveTo(14, petalLen + 16, 8, petalLen + 24);
    ctx.stroke();
 
    ctx.restore();
  }
 
  function updateLilies() {
    lilies.forEach(l => {
      l.rot += l.rotSpeed;
      l.x += l.vx; l.y += l.vy;
      if (l.x < -60) l.x = W + 60;
      if (l.x > W + 60) l.x = -60;
      if (l.y < -100) l.y = H + 100;
      if (l.y > H + 100) l.y = -100;
      // reacción al mouse — el lirio "crece" si el cursor está cerca
      const dx = l.x - mouse.x;
      const dy = l.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const target = d < 160 ? 1 : 0;
      l.hover += (target - l.hover) * 0.05;
    });
  }
 
  // ── ESTRELLAS FUGACES ──
  const shooting = [];
  let lastShoot = 0, nextShoot = 3000;
 
  function spawnShoot() {
    const c = pick();
    shooting.push({
      x: rnd(0, W), y: rnd(0, H * 0.5),
      len: rnd(100, 240), speed: rnd(5, 11),
      angle: rnd(18, 40) * Math.PI / 180,
      life: 1, color: c,
    });
  }
 
  function drawShooting() {
    shooting.forEach((ss, i) => {
      ss.life -= 0.02;
      if (ss.life <= 0) { shooting.splice(i, 1); return; }
      const x2 = ss.x - Math.cos(ss.angle) * ss.len;
      const y2 = ss.y - Math.sin(ss.angle) * ss.len;
      const g = ctx.createLinearGradient(ss.x, ss.y, x2, y2);
      g.addColorStop(0, `rgba(${ss.color[0]},${ss.color[1]},${ss.color[2]},${ss.life})`);
      g.addColorStop(1, 'transparent');
      ctx.globalAlpha = ss.life;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
    });
  }
 
  // ── LOOP PRINCIPAL ──
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
 
    // espirales
    updateSpirals();
    spirals.forEach(s => drawSpiral(s, t));
 
    // constelaciones — líneas entre vecinos
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = `rgb(${WARM[6][0]},${WARM[6][1]},${WARM[6][2]})`;
    ctx.lineWidth = 0.5;
    constellationEdges.forEach(([i, j, d]) => {
      const opac = Math.max(0, 1 - d / 90);
      ctx.globalAlpha = opac * 0.07;
      ctx.beginPath();
      ctx.moveTo(stars[i].x, stars[i].y);
      ctx.lineTo(stars[j].x, stars[j].y);
      ctx.stroke();
    });
 
    // estrellas
    updateStars();
    stars.forEach(s => {
      const a = s.alpha * (0.55 + 0.45 * Math.sin(t * s.twinkleSpeed * 1000 + s.phase));
      if (s.isStar4) {
        drawStar4(s.x, s.y, s.r, s.color, a);
      } else {
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgb(${s.color[0]},${s.color[1]},${s.color[2]})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
 
    // flores
    updateLilies();
    lilies.forEach(drawFlower);
 
    // fugaces
    if (t - lastShoot > nextShoot) {
      spawnShoot(); lastShoot = t; nextShoot = rnd(2500, 5500);
    }
    drawShooting();
 
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
 
  requestAnimationFrame(tick);
})();
 
 
// ══════════════════════════════════════════════
//  HACKATIME API
// ══════════════════════════════════════════════
(function () {
  const USER = 'annaastrs';
  const BASE = 'https://hackatime.hackclub.com/api/compat/wakatime/v1';
  const LANG_COLORS = ['#38bdf8','#f97316','#f59e0b','#34d399','#a78bfa','#f472b6','#ef4444','#2dd4bf'];
 
  function fmt(secs) {
    if (!secs) return '—';
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  
  async function getStats() {
  try {
    const API_KEY = '3ac120f8-ea69-470d-9c32-ca577af7da0b';
    const r = await fetch(`${BASE}/users/${API_KEY}/stats/last_7_days`);
    return r.ok ? (await r.json()).data : null;
  } catch { return null; }
}

async function getSummaries() {
  try {
    const API_KEY = '3ac120f8-ea69-470d-9c32-ca577af7da0b';
    const end = new Date().toISOString().slice(0,10);
    const start = new Date(Date.now() - 30*864e5).toISOString().slice(0,10);
    const r = await fetch(`${BASE}/users/${API_KEY}/summaries?start=${start}&end=${end}`);
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
 
  function streak(sum) {
    if (!sum?.data) return 0;
    const days = sum.data
      .filter(d => (d.grand_total?.total_seconds || 0) > 60)
      .map(d => d.range?.date).filter(Boolean).sort().reverse();
    let s = 0, check = new Date().toISOString().slice(0,10);
    for (const d of days) {
      if (d === check) { s++; const dt = new Date(check); dt.setDate(dt.getDate()-1); check = dt.toISOString().slice(0,10); }
      else break;
    }
    return s;
  }
 
  async function init() {
    const [stats, summaries] = await Promise.all([getStats(), getSummaries()]);
    const totalEl  = document.getElementById('ht-total');
    const streakEl = document.getElementById('ht-streak');
    const langEl   = document.getElementById('ht-lang');
    const barsEl   = document.getElementById('hack-bars');
 
    if (stats) {
      totalEl.textContent  = stats.human_readable_total_including_other_language || fmt(stats.total_seconds) || '—';
      const langs = stats.languages || [];
      langEl.textContent = langs[0]?.name || '—';
      if (langs.length) {
        barsEl.innerHTML = '';
        const max = langs[0].total_seconds || 1;
        langs.slice(0,7).forEach((l,i) => {
          const pct = Math.round((l.total_seconds / max) * 100);
          const row = document.createElement('div');
          row.className = 'hb-row';
          row.innerHTML = `
            <div class="hb-name">${l.name}</div>
            <div class="hb-track"><div class="hb-fill" style="width:0%;background:${LANG_COLORS[i%LANG_COLORS.length]}"></div></div>
            <div class="hb-time">${l.human_readable_total || fmt(l.total_seconds)}</div>`;
          barsEl.appendChild(row);
          setTimeout(() => row.querySelector('.hb-fill').style.width = pct+'%', 120 + i*90);
        });
      } else {
        barsEl.innerHTML = '<div class="hb-loading">sin datos de lenguajes todavía</div>';
      }
    } else {
      totalEl.textContent = 'sin datos';
      barsEl.innerHTML = '<div class="hb-loading">no se pudo conectar — revisa hackatime.hackclub.com</div>';
    }
    const s = streak(summaries);
    streakEl.textContent = s > 0 ? `${s} días` : summaries ? '0 días' : '—';
  }
 
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
 
 
// ══════════════════════════════════════════════
//  NAV ACTIVO
// ══════════════════════════════════════════════
(function () {
  const secs  = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    });
  }, { threshold: 0.28 }).observe instanceof Function &&
  secs.forEach(s => new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    });
  }, { threshold: 0.28 }).observe(s));
})();
 
 
// ══════════════════════════════════════════════
//  REVEAL ON SCROLL
// ══════════════════════════════════════════════
(function () {
  const els = document.querySelectorAll(
    '.pcard, .av-item, .muro-card, .skill-row, .hack-card, details.gusta, .foto-item, .sobre-layout, .contacto-box, .hack-bars-wrap'
  );
  els.forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('shown'); obs.unobserve(e.target); } });
  }, { threshold: 0.07 });
  els.forEach(el => obs.observe(el));
})();
 
 
// ══════════════════════════════════════════════
//  POLAROID HOVER 3D TILT
// ══════════════════════════════════════════════
document.querySelectorAll('.pcard').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = (e.clientY - cy) / rect.height * -10;
    const ry = (e.clientX - cx) / rect.width  *  12;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = `rotate(var(--r, -2deg))`;
  });
});
 
// fix nav clean
(function(){
  const secs=document.querySelectorAll('section[id]');
  const links=document.querySelectorAll('.nav-links a');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      links.forEach(a=>a.classList.remove('active'));
      const a=document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if(a)a.classList.add('active');
    });
  },{threshold:0.28});
  secs.forEach(s=>obs.observe(s));
})();
 