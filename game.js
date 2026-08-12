'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;
canvas.tabIndex = 0;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Skins ─────────────────────────────────────────────────────────────────────
const SKIN_STORAGE_KEY = 'asteroids.selectedSkin';
const DEFAULT_SKIN_ID = 'classic';

function drawClassicSkin(ctx, { color }) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(-12, -9);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-12, 9);
  ctx.closePath();
  ctx.stroke();
}

function drawNovaSkin(ctx, { color, accent, fill, lineWidth }) {
  ctx.strokeStyle = color;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(9, -4);
  ctx.lineTo(4, -11);
  ctx.lineTo(-3, -6);
  ctx.lineTo(-12, -9);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-12, 9);
  ctx.lineTo(-3, 6);
  ctx.lineTo(4, 11);
  ctx.lineTo(9, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.lineWidth = lineWidth * 0.75;
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.lineTo(-7, 0);
  ctx.moveTo(7, -3);
  ctx.lineTo(-1, -3);
  ctx.moveTo(7, 3);
  ctx.lineTo(-1, 3);
  ctx.stroke();
}

function drawPhantomSkin(ctx, { color, accent, fill, lineWidth }) {
  ctx.strokeStyle = color;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(6, -11);
  ctx.lineTo(-11, -8);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-11, 8);
  ctx.lineTo(6, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.lineWidth = lineWidth * 0.8;
  ctx.beginPath();
  ctx.arc(2, 0, 3.5, 0, Math.PI * 2);
  ctx.moveTo(-9, -5);
  ctx.lineTo(-5, -2);
  ctx.moveTo(-9, 5);
  ctx.lineTo(-5, 2);
  ctx.stroke();
}

function drawGiantSkin(ctx, { color, accent, fill, lineWidth }) {
  ctx.strokeStyle = color;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(14, -8);
  ctx.lineTo(8, -14);
  ctx.lineTo(-4, -10);
  ctx.lineTo(-14, -12);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-14, 12);
  ctx.lineTo(-4, 10);
  ctx.lineTo(8, 14);
  ctx.lineTo(14, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.lineWidth = lineWidth * 0.75;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(-10, 0);
  ctx.moveTo(8, -4);
  ctx.lineTo(-2, -4);
  ctx.moveTo(8, 4);
  ctx.lineTo(-2, 4);
  ctx.stroke();
}

const SKIN_IDS = Object.freeze(['classic', 'nova', 'phantom', 'giant']);
const SKINS = Object.freeze({
  classic: {
    label: 'CLASICA',
    color: '#fff',
    accent: '#fff',
    fill: 'transparent',
    draw: drawClassicSkin,
  },
  nova: {
    label: 'NOVA',
    color: '#7df9ff',
    accent: '#d9ffff',
    fill: 'rgba(125,249,255,0.12)',
    draw: drawNovaSkin,
  },
  phantom: {
    label: 'FANTASMA',
    color: '#ff72d2',
    accent: '#ffd1f0',
    fill: 'rgba(255,114,210,0.12)',
    draw: drawPhantomSkin,
  },
  giant: {
    label: 'GIGANTE',
    color: '#a855f7',
    accent: '#d8b4fe',
    fill: 'rgba(168,85,247,0.15)',
    draw: drawGiantSkin,
  },
});

function readSkinId() {
  try {
    const id = localStorage.getItem(SKIN_STORAGE_KEY);
    return SKINS[id] ? id : DEFAULT_SKIN_ID;
  } catch {
    return DEFAULT_SKIN_ID;
  }
}

function saveSkinId(id) {
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, id);
  } catch {
    // El juego sigue funcionando si el almacenamiento esta bloqueado.
  }
}

function clearInput() {
  Object.keys(keys).forEach(code => { keys[code] = false; });
  Object.keys(justPressed).forEach(code => { justPressed[code] = false; });
}

function renderSkin(ctx, skinId, options = {}) {
  const skin = SKINS[skinId] || SKINS[DEFAULT_SKIN_ID];
  const lineWidth = options.lineWidth || 1.5;
  const color = options.speedBoost ? '#0ff' : skin.color;
  const accent = options.speedBoost ? '#d9ffff' : skin.accent;
  const fill = options.speedBoost ? 'rgba(0,255,255,0.18)' : skin.fill;

  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  skin.draw(ctx, { color, accent, fill, lineWidth });

  if (options.thrusting && Math.random() > 0.35) {
    ctx.strokeStyle = 'rgba(255,130,0,0.85)';
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-8 - rand(6, 14), 0);
    ctx.lineTo(-8, 4);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño
const SHOOTING_STAR_SPEED = 280;
const SHOOTING_STAR_TTL = 8;
const SHOOTING_STAR_POINTS = 500;
const SHOOTING_STAR_DELAY_MIN = 2;
const SHOOTING_STAR_DELAY_MAX = 7;
const POWERUP_SPEED = 'speed';
const POWERUP_TRIPLE = 'triple';
const POWERUP_SHIELD = 'shield';
const SPEED_BOOST_DURATION = 5;
const TRIPLE_SHOT_DURATION = 5;
const TRIPLE_SHOT_SPREAD = Math.PI / 12;
const SHIELD_HIT_GRACE = 1;

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.points = POINTS[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz ────────────────────────────────────────────────────────────
class ShootingStar extends Asteroid {
  constructor(x, y) {
    super(x, y, 1);
    const angle = rand(0, Math.PI * 2);
    this.vx = Math.cos(angle) * SHOOTING_STAR_SPEED;
    this.vy = Math.sin(angle) * SHOOTING_STAR_SPEED;
    this.ttl = SHOOTING_STAR_TTL;
    this.points = SHOOTING_STAR_POINTS;
    this.isShootingStar = true;
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  split() { return []; }

  draw() {
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;
    const angle = Math.atan2(this.vy, this.vx);
    const alpha = Math.min(1, this.ttl);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);

    // Estela cálida para distinguirla de los power-ups cian.
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(255,153,48,${(alpha * 0.25).toFixed(2)})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-64, 0);
    ctx.lineTo(-5, 0);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,255,${(alpha * 0.5).toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-58, -4);
    ctx.lineTo(-7, -1);
    ctx.moveTo(-48, 4);
    ctx.lineTo(-7, 1);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,211,77,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(3, 3);
    ctx.lineTo(0, 11);
    ctx.lineTo(-3, 3);
    ctx.lineTo(-11, 0);
    ctx.lineTo(-3, -3);
    ctx.lineTo(0, -11);
    ctx.lineTo(3, -3);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor(skinId = DEFAULT_SKIN_ID) {
    this.skinId = SKINS[skinId] ? skinId : DEFAULT_SKIN_ID;
    this.reset();
  }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = this.skinId === 'giant' ? 24 : 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.dead          = false;
    this.speedTimer    = 0;   // segundos restantes del boost de velocidad
    this.tripleShotTimer = 0; // segundos restantes del triple shot
    this.shield        = false;
  }

  get speedBoost() { return this.speedTimer > 0; }
  get tripleShot() { return this.tripleShotTimer > 0; }
  get scoreMultiplier() { return this.skinId === 'giant' ? 2 : 1; }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    if (this.speedTimer > 0) this.speedTimer -= dt;
    if (this.tripleShotTimer > 0) this.tripleShotTimer -= dt;

    const ROT    = 3.5;                              // rad/s
    const THRUST = this.speedBoost ? 520 : 260;      // px/s² (doble con boost)
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    const angles = this.tripleShot
      ? [
          this.angle - TRIPLE_SHOT_SPREAD,
          this.angle,
          this.angle + TRIPLE_SHOT_SPREAD,
        ]
      : [this.angle];
    return angles.map(angle => new Bullet(ox, oy, angle));
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.shield) {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.rotate(this.angle);
    renderSkin(ctx, this.skinId, {
      thrusting: this.thrusting,
      speedBoost: this.speedBoost,
    });
    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── PowerUp ───────────────────────────────────────────────────────────────────
class PowerUp {
  constructor(x, y, type = POWERUP_SPEED) {
    this.x      = x;
    this.y      = y;
    this.type   = type;
    this.radius = 12;
    this.ttl    = 8;      // desaparece en 8 s si no se recoge
    this.dead   = false;
    this.pulse  = 0;
  }

  update(dt) {
    this.ttl   -= dt;
    this.pulse += dt * 4;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = Math.min(1, this.ttl);              // parpadea cuando va a expirar
    const r     = this.radius + Math.sin(this.pulse) * 3;
    const color = this.type === POWERUP_SHIELD
      ? '#c084fc'
      : this.type === POWERUP_TRIPLE ? '#f0f' : '#0ff';
    const fill = this.type === POWERUP_SHIELD
      ? 'rgba(192,132,252,0.15)'
      : this.type === POWERUP_TRIPLE
        ? 'rgba(255,0,255,0.15)'
        : 'rgba(0,255,255,0.15)';
    const label = this.type === POWERUP_SHIELD
      ? 'ESC'
      : this.type === POWERUP_TRIPLE ? 'TRI' : 'VEL';

    ctx.save();
    ctx.globalAlpha = alpha;

    // Halo exterior
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Relleno translúcido
    ctx.fillStyle = fill;
    ctx.fill();

    // Etiqueta
    ctx.fillStyle   = color;
    ctx.font        = 'bold 9px monospace';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, this.x, this.y);

    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let powerupSpawned;
let shootingStarTimer;
let score, lives, level;
let state;      // 'skin-select' | 'playing' | 'dead' | 'gameover'
let deadTimer;
let selectedSkinId = DEFAULT_SKIN_ID;
let skinCursor = 0;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
  shootingStarTimer = rand(SHOOTING_STAR_DELAY_MIN, SHOOTING_STAR_DELAY_MAX);
}

function initGame() {
  ship      = new Ship(selectedSkinId);
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  powerupSpawned = false;
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  spawnAsteroids(4);
}

function openSkinSelector() {
  selectedSkinId = readSkinId();
  skinCursor = Math.max(0, SKIN_IDS.indexOf(selectedSkinId));
  state = 'skin-select';
  clearInput();
  canvas.focus();
}

function moveSkinCursor(delta) {
  skinCursor = wrap(skinCursor + delta, SKIN_IDS.length);
  selectedSkinId = SKIN_IDS[skinCursor];
}

function updateSkinSelector() {
  const previous = pressed('ArrowLeft') || pressed('ArrowUp');
  const next = pressed('ArrowRight') || pressed('ArrowDown');

  if (previous) moveSkinCursor(-1);
  else if (next) moveSkinCursor(1);

  if (pressed('Enter') || pressed('Space')) {
    saveSkinId(selectedSkinId);
    clearInput();
    initGame();
  }
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  powerupSpawned = false;
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.shield = false;
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'skin-select') {
    updateSkinSelector();
    return;
  }

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    asteroids = asteroids.filter(a => !a.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(pu => pu.update(dt));

  if (shootingStarTimer > 0) {
    shootingStarTimer -= dt;
    if (shootingStarTimer <= 0) {
      asteroids.push(new ShootingStar(rand(0, W), rand(0, H)));
      shootingStarTimer = 0;
    }
  }

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(pu => !pu.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += a.points * ship.scoreMultiplier;
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
        // Solo puede aparecer un power-up por ronda.
        if (!a.isShootingStar && !powerupSpawned && Math.random() < 0.25) {
          const types = [POWERUP_SPEED, POWERUP_TRIPLE, POWERUP_SHIELD];
          const type = types[Math.floor(Math.random() * types.length)];
          powerups.push(new PowerUp(a.x, a.y, type));
          powerupSpawned = true;
        }
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs power-up
  for (const pu of powerups) {
    if (!pu.dead && dist(ship, pu) < ship.radius + pu.radius) {
      pu.dead = true;
      if (pu.type === POWERUP_SHIELD) {
        ship.shield = true;
      } else if (pu.type === POWERUP_TRIPLE) {
        ship.tripleShotTimer = TRIPLE_SHOT_DURATION;
      } else {
        ship.speedTimer = SPEED_BOOST_DURATION;
      }
    }
  }
  powerups = powerups.filter(pu => !pu.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        if (ship.shield) {
          ship.shield = false;
          ship.invincible = SHIELD_HIT_GRACE;
        } else {
          killShip();
        }
        break;
      }
    }
  }

  // Nivel completado
  if (asteroids.length === 0 && shootingStarTimer === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawSkinSelector() {
  const cardW = 170;
  const cardH = 280;
  const gap = 20;
  const top = 125;
  const startX = (W - (cardW * SKIN_IDS.length + gap * (SKIN_IDS.length - 1))) / 2;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px monospace';
  ctx.fillText('ELIGE TU NAVE', W / 2, 45);

  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '14px monospace';
  ctx.fillText('SELECCIONA UNA SKIN', W / 2, 78);

  SKIN_IDS.forEach((id, index) => {
    const x = startX + index * (cardW + gap);
    const active = index === skinCursor;

    ctx.fillStyle = active ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, top, cardW, cardH);
    ctx.strokeStyle = active ? '#0ff' : '#444';
    ctx.lineWidth = active ? 2 : 1;
    ctx.strokeRect(x, top, cardW, cardH);

    ctx.save();
    ctx.translate(x + cardW / 2, top + 105);
    ctx.rotate(-Math.PI / 2);
    ctx.scale(2.2, 2.2);
    renderSkin(ctx, id);
    ctx.restore();

    ctx.fillStyle = active ? '#0ff' : '#fff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(SKINS[id].label, x + cardW / 2, top + 220);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '14px monospace';
  ctx.fillText('FLECHAS PARA CAMBIAR', W / 2, 535);
  ctx.fillText('ENTER O ESPACIO PARA JUGAR', W / 2, 560);
  ctx.restore();
}

function drawLifeIcon(x, y, skinId) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.45, 0.45);
  renderSkin(ctx, skinId, { lineWidth: 2.6 });
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18, ship.skinId);

  let indicatorY = 36;

  // Indicador de power-up velocidad activo
  if (ship.speedTimer > 0) {
    const t       = Math.max(ship.speedTimer, 0);
    const barW    = 120;
    const barFill = Math.min(1, t / SPEED_BOOST_DURATION) * barW;
    const bx      = W / 2 - barW / 2;
    const by      = indicatorY;

    // Fondo barra
    ctx.fillStyle = 'rgba(0,255,255,0.15)';
    ctx.fillRect(bx, by, barW, 6);

    // Relleno barra
    ctx.fillStyle = '#0ff';
    ctx.fillRect(bx, by, barFill, 6);

    // Etiqueta
    ctx.fillStyle   = '#0ff';
    ctx.font        = '11px monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(`VELOCIDAD  ${t.toFixed(1)}s`, W / 2, by + 18);
    indicatorY += 26;
  }

  // Indicador de power-up triple shot activo
  if (ship.tripleShotTimer > 0) {
    const t       = Math.max(ship.tripleShotTimer, 0);
    const barW    = 120;
    const barFill = Math.min(1, t / TRIPLE_SHOT_DURATION) * barW;
    const bx      = W / 2 - barW / 2;
    const by      = indicatorY;

    ctx.fillStyle = 'rgba(255,0,255,0.15)';
    ctx.fillRect(bx, by, barW, 6);

    ctx.fillStyle = '#f0f';
    ctx.fillRect(bx, by, barFill, 6);

    ctx.fillStyle = '#f0f';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`TRIPLE  ${t.toFixed(1)}s`, W / 2, by + 18);
    indicatorY += 26;
  }

  if (ship.shield) {
    ctx.fillStyle = '#c084fc';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ESCUDO  1 IMPACTO', W / 2, indicatorY + 12);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  if (state === 'skin-select') {
    drawSkinSelector();
    return;
  }

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerups.forEach(pu => pu.draw());
  bullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

openSkinSelector();
requestAnimationFrame(loop);
