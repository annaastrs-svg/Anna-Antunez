/* ══════════ FONDO SUAVE (particulas tipo motitas de luz) ══════════ */
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let particles = [];
const numParticles = 55;
const softColors = ['227,154,154', '217,164,65', '169,116,79', '240,168,178'];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.body.scrollHeight;
}

function makeParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1.5,
    speedY: -(Math.random() * 0.25 + 0.05),
    drift: (Math.random() - 0.5) * 0.2,
    opacity: Math.random() * 0.35 + 0.05,
    color: softColors[Math.floor(Math.random() * softColors.length)]
  };
}

function initParticles() {
  particles = [];
  for (let i = 0; i < numParticles; i++) particles.push(makeParticle());
}

window.addEventListener('resize', () => { resizeCanvas(); });
resizeCanvas();
initParticles();

function animateBg() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.y += p.speedY;
    p.x += p.drift;

    if (p.y < -10) {
      p.y = canvas.height + 10;
      p.x = Math.random() * canvas.width;
    }
    if (p.x < -10) p.x = canvas.width + 10;
    if (p.x > canvas.width + 10) p.x = -10;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(animateBg);
}
animateBg();

/* ══════════ CURSOR PATITA DE GATO ══════════ */
const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (isDesktop) {
  document.body.classList.add('cat-cursor');

  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');

  cursor.innerHTML = '<span class="toe"></span><span class="toe"></span><span class="toe"></span>';

  let trailX = window.innerWidth / 2;
  let trailY = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    cursor.style.opacity = '1';
    trail.style.opacity = '.55';
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    trailX = e.clientX;
    trailY = e.clientY;
  });

  document.addEventListener('mousedown', () => {
    cursor.style.transform += ' scale(0.85)';
  });

  function followTrail() {
    trail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%,-50%)`;
    requestAnimationFrame(followTrail);
  }
  followTrail();

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    trail.style.opacity = '0';
  });
}
