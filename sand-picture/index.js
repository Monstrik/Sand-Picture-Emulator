// Simple Sand Picture Emulator
// Adjustable parameters: amount of air, water, sand, and number of sand colors

(function () {
  // DOM setup (works when included from index.html)
  function $(id) { return document.getElementById(id); }

  // If there's no DOM (e.g., node execution), do nothing
  if (typeof window === 'undefined' || !document) {
    console.log('This simulator runs in a browser. Open index.html to view.');
    return;
  }

  // Create basic UI if not present (so index.js can be opened standalone)
  function ensureUI() {
    if ($('sand-canvas')) return;
    const root = document.createElement('div');
    root.innerHTML = `
      <style>
        :root { color-scheme: light dark; }
        body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
        .app { display: grid; grid-template-columns: 320px 1fr; min-height: 100vh; }
        /* Theme variables with strong contrast */
        :root {
          --panel-bg: #ffffff;
          --panel-fg: #111111;
          --muted-fg: #333333;
          --border: #d0d0d0;
          --button-bg: #0d6efd;
          --button-fg: #ffffff;
          --input-bg: #ffffff;
          --input-fg: #111111;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --panel-bg: #121212;
            --panel-fg: #f1f1f1;
            --muted-fg: #c9c9c9;
            --border: #2a2a2a;
            --button-bg: #3b82f6;
            --button-fg: #ffffff;
            --input-bg: #1a1a1a;
            --input-fg: #f1f1f1;
          }
        }
        .panel { padding: 16px; border-right: 1px solid var(--border); background: var(--panel-bg); color: var(--panel-fg); }
        .panel h1 { font-size: 18px; margin: 0 0 12px; color: var(--panel-fg); }
        .control { margin: 10px 0; }
        .control label { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted-fg); align-items: center; gap: 8px; }
        .control input[type="range"], .control input[type="number"] { width: 100%; }
        input, button { font: inherit; }
        input[type="number"], input[type="range"] { background: var(--input-bg); color: var(--input-fg); border: 1px solid var(--border); border-radius: 6px; padding: 4px 6px; }
        input[type="range"] { padding: 0; height: 6px; border-radius: 6px; }
        .buttons { display: flex; gap: 8px; margin-top: 12px; }
        button { background: var(--button-bg); color: var(--button-fg); border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
        button:hover { filter: brightness(1.05); }
        canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; background: #111; }
        /* Canvas container */
        #canvasWrap {
          position: relative;
          width: 100%;
          height: 100%;
          perspective: 900px; /* enable 3D space for flip */
        }
        #canvasWrap canvas { transition: transform 0.6s ease; transform-style: preserve-3d; will-change: transform; transform-origin: 50% 50%; }
        #canvasWrap.flipped canvas { transform: rotateX(180deg); }
        .legend { font-size: 12px; color: var(--muted-fg); margin-top: 8px; }
      </style>
      <div class="app">
        <div class="panel">
          <h1>Sand Picture Emulator</h1>
          <button id="flip">Flip</button>
          <div class="control">
            <label>Sand A color <span><input id="sandColorA" type="color" value="#c8b04a"/></span></label>
          </div>
          <div class="control">
            <label>Sand B color <span><input id="sandColorB" type="color" value="#9a7745"/></span></label>
          </div>
          <div class="control">
            <label>Water % <span id="waterVal">60</span></label>
            <input id="water" type="range" min="0" max="90" value="60"/>
          </div>
          <div class="control">
            <label>Air % <span id="airVal">15</span></label>
            <input id="air" type="range" min="10" max="20" value="15"/>
          </div>
          <div class="control">
            <label>Sand % <span id="sandVal">25</span></label>
            <input id="sand" type="range" min="0" max="100" value="25" disabled/>
          </div>
          <div class="control">
            <label>Viscosity <span id="viscVal">0.50</span></label>
            <input id="viscosity" type="range" min="0" max="1" step="0.05" value="0.5"/>
          </div>
          <div class="control">
            <label>Surface tension <span id="stVal">0.50</span></label>
            <input id="surfaceTension" type="range" min="0" max="1" step="0.05" value="0.5"/>
          </div>
          <div class="control">
            <label>Tilt angle (°) <span id="tiltVal">0</span></label>
            <input id="tilt" type="range" min="-45" max="45" step="1" value="0"/>
          </div>
          <div class="control">
            <label>Turbulence <span id="turbVal">0.25</span></label>
            <input id="turbulence" type="range" min="0" max="1" step="0.05" value="0.25"/>
          </div>
          <div class="control">
            <label>Sand density levels <span id="densVal">3</span></label>
            <input id="densityLevels" type="range" min="1" max="5" step="1" value="3"/>
          </div>
          <div class="control">
            <label>World size (pixels)</label>
            <div style="display:flex; gap:8px;">
              <input id="worldW" type="number" min="128" max="1024" value="640" step="32"/>
              <input id="worldH" type="number" min="128" max="768" value="400" step="32"/>
            </div>
          </div>
          <div class="control">
            <label>Simulation speed <span id="speedVal">1</span></label>
            <input id="speed" type="range" min="1" max="10" step="1" value="1"/>
          </div>
          <div class="buttons">
            <button id="reset">Reset</button>
            <button id="randomize">Randomize</button>
            <button id="pause">Pause</button>
          </div>
          <div class="legend">Shortcuts: 1 SandA, 2 Air, 4 SandB, P Pause</div>
        </div>
        <div id="canvasWrap">
          <canvas id="sand-canvas"></canvas>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  ensureUI();

  // State and simulation setup
  const canvas = $('sand-canvas');
  const ctx = canvas.getContext('2d');
  let width = Math.max(128, Math.min(1024, Number($('#worldW')?.value || 640)));
  let height = Math.max(128, Math.min(768, Number($('#worldH')?.value || 400)));
  canvas.width = width;
  canvas.height = height;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  const MATERIAL = { AIR: 0, SAND_A: 1, SAND_B: 2 };

  // Parameters with UI bindings
  const params = {
    water: 60,
    air: 15,
    sand: 25,
    viscosity: 0.5,
    surfaceTension: 0.5,
    tiltDeg: 0,
    turbulence: 0.25,
    densityLevels: 3,
    speed: 1,
    colors: {
      sandA: '#c8b04a',
      sandB: '#9a7745',
    }
  };

  // UI bindings
  const waterEl = $('water');
  const airEl = $('air');
  const sandEl = $('sand');
  const waterVal = $('waterVal');
  const airVal = $('airVal');
  const sandVal = $('sandVal');
  const viscEl = $('viscosity');
  const stEl = $('surfaceTension');
  const tiltEl = $('tilt');
  const turbEl = $('turbulence');
  const densEl = $('densityLevels');
  const speedEl = $('speed');
  const speedVal = $('speedVal');
  const worldW = $('worldW');
  const worldH = $('worldH');
  const flipBtn = $('flip');

  const resetBtn = $('reset');
  const randomBtn = $('randomize');
  const pauseBtn = $('pause');

  $('sandColorA').addEventListener('input', (e) => params.colors.sandA = e.target.value);
  $('sandColorB').addEventListener('input', (e) => params.colors.sandB = e.target.value);

  function normalize() {
    // water + air + sand = 100
    const w = Number(waterEl.value);
    const a = Number(airEl.value);
    let s = clamp(100 - w - a, 0, 100);
    params.water = w; params.air = a; params.sand = s;
    waterVal.textContent = String(w);
    airVal.textContent = String(a);
    sandVal.textContent = String(s);
  }
  waterEl.addEventListener('input', () => { normalize(); });
  airEl.addEventListener('input', () => { normalize(); });
  normalize();

  viscEl.addEventListener('input', () => { params.viscosity = Number(viscEl.value); $('viscVal').textContent = params.viscosity.toFixed(2); });
  stEl.addEventListener('input', () => { params.surfaceTension = Number(stEl.value); $('stVal').textContent = params.surfaceTension.toFixed(2); });
  tiltEl.addEventListener('input', () => { params.tiltDeg = Number(tiltEl.value); $('tiltVal').textContent = String(params.tiltDeg); });
  turbEl.addEventListener('input', () => { params.turbulence = Number(turbEl.value); $('turbVal').textContent = params.turbulence.toFixed(2); });
  densEl.addEventListener('input', () => { params.densityLevels = Number(densEl.value); $('densVal').textContent = String(params.densityLevels); });
  speedEl.addEventListener('input', () => { params.speed = Number(speedEl.value); speedVal.textContent = String(params.speed); });

  function resizeWorld(w, h) {
    width = clamp(w | 0, 128, 1024);
    height = clamp(h | 0, 128, 768);
    canvas.width = width; canvas.height = height;
    world = makeWorld(width, height);
    drawWorld();
  }
  worldW.addEventListener('change', () => resizeWorld(Number(worldW.value), Number(worldH.value)));
  worldH.addEventListener('change', () => resizeWorld(Number(worldW.value), Number(worldH.value)));

  // Flip animation + gravity inversion
  let flipped = false;
  flipBtn.addEventListener('click', () => {
    flipped = !flipped;
    document.getElementById('canvasWrap').classList.toggle('flipped', flipped);
  });

  // Painting
  let painting = false;
  let brush = MATERIAL.SAND_A;
  canvas.addEventListener('mousedown', (e) => { painting = true; paintAt(e); });
  window.addEventListener('mouseup', () => painting = false);
  canvas.addEventListener('mousemove', (e) => { if (painting) paintAt(e); });
  window.addEventListener('keydown', (e) => {
    if (e.key === '1') brush = MATERIAL.SAND_A;
    else if (e.key === '2') brush = MATERIAL.AIR;
    else if (e.key === '4') brush = MATERIAL.SAND_B;
    else if (e.key.toLowerCase() === 'p') paused = !paused;
  });

  function paintAt(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const radius = brush === MATERIAL.AIR ? 6 : 3;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        if (dx*dx + dy*dy <= radius*radius) {
          const idx = (ny * width + nx);
          world.type[idx] = brush;
          if (brush === MATERIAL.SAND_A || brush === MATERIAL.SAND_B) {
            world.density[idx] = 1 + (Math.random() * params.densityLevels) | 0;
          }
        }
      }
    }
  }

  // World representation
  function makeWorld(w, h) {
    return {
      w, h,
      type: new Uint8Array(w * h),
      density: new Uint8Array(w * h),
      colorIdx: new Uint8Array(w * h),
      airPressure: new Float32Array(w * h),
    };
  }

  let world = makeWorld(width, height);

  function seedWorld(randomize = false) {
    const total = width * height;
    const airTarget = Math.floor(total * (params.air / 100));
    const sandTarget = Math.floor(total * (params.sand / 100));
    const waterTarget = total - airTarget - sandTarget;

    // Fill baseline with water represented as AIR with pressure low
    world.type.fill(MATERIAL.SAND_A);
    world.density.fill(1);
    world.colorIdx.fill(0);
    world.airPressure.fill(0);

    let placedAir = 0, placedSandB = 0;
    // Randomly distribute air bubbles and some sand B
    for (let i = 0; i < total; i++) {
      if (placedAir < airTarget && Math.random() < 0.02) {
        world.type[i] = MATERIAL.AIR;
        placedAir++;
        continue;
      }
      if (placedSandB < Math.floor(sandTarget * 0.4) && Math.random() < 0.015) {
        world.type[i] = MATERIAL.SAND_B;
        world.density[i] = 1 + (Math.random() * params.densityLevels) | 0;
        placedSandB++;
      }
    }

    if (!randomize) {
      // Deterministic stripes for visual variety
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (y % 20 === 0 && x % 3 === 0) world.type[idx] = MATERIAL.AIR;
          if ((y + x) % 37 === 0) world.type[idx] = MATERIAL.SAND_B;
        }
      }
    }
  }

  seedWorld(false);

  // Physics helpers
  function gravityVector() {
    const rad = (params.tiltDeg / 180) * Math.PI;
    // Invert direction if flipped: rotate by PI around X in screen space -> invert Y gravity
    const gySign = (document.getElementById('canvasWrap').classList.contains('flipped')) ? -1 : 1;
    return { gx: Math.sin(rad), gy: gySign * Math.cos(rad) };
  }

  function update() {
    const { gx, gy } = gravityVector();
    const turb = params.turbulence * 0.2;

    // Sweep from bottom to top to simulate falling
    for (let y = height - 2; y >= 1; y--) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const t = world.type[idx];
        if (t === MATERIAL.AIR) {
          // Air bubble dynamics: rise slowly against gravity
          const upY = y - (gy > 0 ? 1 : -1);
          const up = upY * width + x;
          if (upY >= 0 && upY < height) {
            if (world.type[up] !== MATERIAL.AIR && Math.random() < 0.3) {
              // swap to move up
              const tmpT = world.type[up];
              const tmpD = world.density[up];
              world.type[up] = t;
              world.density[up] = 0;
              world.type[idx] = tmpT;
              world.density[idx] = tmpD;
            }
          }
          continue;
        }
        if (t === MATERIAL.SAND_A || t === MATERIAL.SAND_B) {
          // try to move downwards considering tilt
          const dy = gy >= 0 ? 1 : -1;
          const dxPref = gx > 0.1 ? 1 : (gx < -0.1 ? -1 : 0);
          const below = (y + dy) * width + x;
          const belowType = world.type[below];
          if (belowType === MATERIAL.AIR) {
            // fall down
            world.type[below] = t;
            world.density[below] = world.density[idx];
            world.type[idx] = MATERIAL.AIR;
            world.density[idx] = 0;
          } else {
            // try slide
            const left = (y + dy) * width + (x - 1);
            const right = (y + dy) * width + (x + 1);
            const tryRightFirst = dxPref > 0 || (dxPref === 0 && Math.random() < 0.5);
            const a = tryRightFirst ? right : left;
            const b = tryRightFirst ? left : right;
            if (world.type[a] === MATERIAL.AIR) {
              world.type[a] = t;
              world.density[a] = world.density[idx];
              world.type[idx] = MATERIAL.AIR;
              world.density[idx] = 0;
            } else if (world.type[b] === MATERIAL.AIR) {
              world.type[b] = t;
              world.density[b] = world.density[idx];
              world.type[idx] = MATERIAL.AIR;
              world.density[idx] = 0;
            } else {
              // lateral creep with viscosity + turbulence
              if (Math.random() < (0.02 + turb) * (1 - params.viscosity)) {
                const lateral = x + (Math.random() < 0.5 ? -1 : 1);
                if (lateral > 0 && lateral < width - 1) {
                  const li = y * width + lateral;
                  if (world.type[li] === MATERIAL.AIR) {
                    world.type[li] = t;
                    world.density[li] = world.density[idx];
                    world.type[idx] = MATERIAL.AIR;
                    world.density[idx] = 0;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return { r: 200, g: 176, b: 74 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }

  function drawWorld() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const aRGB = hexToRgb(params.colors.sandA);
    const bRGB = hexToRgb(params.colors.sandB);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const di = idx * 4;
        const t = world.type[idx];
        if (t === MATERIAL.AIR) {
          // vivid green air for contrast
          data[di] = 50; data[di+1] = 205; data[di+2] = 50; data[di+3] = 255;
        } else if (t === MATERIAL.SAND_A) {
          // shade by density
          const d = world.density[idx] || 1;
          const shade = 0.9 - 0.1 * d;
          data[di] = (aRGB.r * shade) | 0; data[di+1] = (aRGB.g * shade) | 0; data[di+2] = (aRGB.b * shade) | 0; data[di+3] = 255;
        } else {
          const d = world.density[idx] || 1;
          const shade = 0.9 - 0.1 * d;
          data[di] = (bRGB.r * shade) | 0; data[di+1] = (bRGB.g * shade) | 0; data[di+2] = (bRGB.b * shade) | 0; data[di+3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  let paused = false;
  resetBtn.addEventListener('click', () => { seedWorld(false); });
  randomBtn.addEventListener('click', () => { seedWorld(true); });
  pauseBtn.addEventListener('click', () => { paused = !paused; });

  function frame() {
    const steps = params.speed | 0;
    if (!paused) {
      for (let i = 0; i < steps; i++) update();
    }
    drawWorld();
    requestAnimationFrame(frame);
  }

  frame();
})();
