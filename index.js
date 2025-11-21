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
            <label>World size (pixels)
              <span><input id="worldW" type="number" min="64" max="1024" step="32" value="512" style="width:70px;"/>×
              <input id="worldH" type="number" min="64" max="1024" step="32" value="384" style="width:70px;"/></span>
            </label>
          </div>
          <div class="control">
            <label>Simulation speed <span id="speedVal">1.0x</span></label>
            <input id="speed" type="range" min="0.25" max="2" value="1" step="0.25"/>
          </div>
          <div class="buttons">
            <button id="reset">Reset</button>
            <button id="pause">Pause</button>
          </div>
          <div class="buttons">
            <button id="randomize">Randomize</button>
            <button id="flip">Flip</button>
          </div>
          <div class="legend">Tip: Drag on the canvas to paint. 1=Sand A, 4=Sand B, 2/3=Air.</div>
        </div>
        <div id="canvasWrap">
          <canvas id="sand-canvas"></canvas>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  ensureUI();

  const canvas = $('sand-canvas');
  const sandRange = $('sand');
  const airRange = $('air');
  const waterRange = $('water');
  const waterVal = $('waterVal');
  const sandColorInputA = $('sandColorA');
  const sandColorInputB = $('sandColorB');
  const viscosityRange = $('viscosity');
  const surfaceTensionRange = $('surfaceTension');
  const tiltRange = $('tilt');
  const turbulenceRange = $('turbulence');
  const densityLevelsRange = $('densityLevels');
  const worldW = $('worldW');
  const worldH = $('worldH');
  const resetBtn = $('reset');
  const randomizeBtn = $('randomize');
  const pauseBtn = $('pause');
  const flipBtn = $('flip');
  const speedRange = $('speed');

  const sandVal = $('sandVal');
  // Water and Air define composition; Sand is derived
  const airVal = $('airVal');
  const speedVal = $('speedVal');
  const viscVal = $('viscVal');
  const stVal = $('stVal');
  const tiltVal = $('tiltVal');
  const turbVal = $('turbVal');
  const densVal = $('densVal');

  // Sand is derived from water and air; air constrained (10–20)
  sandRange.addEventListener('input', () => updatePercents('sand'));
  airRange.addEventListener('input', () => updatePercents('air'));
  if (waterRange) waterRange.addEventListener('input', () => updatePercents('water'));
  speedRange.addEventListener('input', () => { speedVal.textContent = speedRange.value + 'x'; });
  viscosityRange.addEventListener('input', () => { viscVal.textContent = Number(viscosityRange.value).toFixed(2); });
  surfaceTensionRange.addEventListener('input', () => { stVal.textContent = Number(surfaceTensionRange.value).toFixed(2); });
  tiltRange.addEventListener('input', () => { tiltVal.textContent = tiltRange.value; });
  turbulenceRange.addEventListener('input', () => { turbVal.textContent = Number(turbulenceRange.value).toFixed(2); });
  densityLevelsRange.addEventListener('input', () => { densVal.textContent = densityLevelsRange.value; });
  if (sandColorInputA) sandColorInputA.addEventListener('input', () => { updatePaletteFromPicker(); });
  if (sandColorInputB) sandColorInputB.addEventListener('input', () => { updatePaletteFromPicker(); });

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randStep(min, max, step) {
    const steps = Math.floor((max - min) / step);
    return (min + step * randInt(0, steps));
  }
  function randomHexColor() {
    const r = randInt(0,255).toString(16).padStart(2,'0');
    const g = randInt(0,255).toString(16).padStart(2,'0');
    const b = randInt(0,255).toString(16).padStart(2,'0');
    return `#${r}${g}${b}`;
  }

  function randomizeSettings() {
    // Randomize water and air within sensible bounds; Sand derived
    const w = randInt(40, 80);
    const a = randInt(10, 20);
    const s = Math.max(0, 100 - (w + a));
    if (waterRange) waterRange.value = String(Math.min(w, 100 - a));
    airRange.value = String(a);
    sandRange.value = String(s);
    if (waterVal) waterVal.textContent = waterRange?.value || '60';
    sandVal.textContent = sandRange.value;
    airVal.textContent = airRange.value;

    // Randomize physics params
    const visc = randStep(0, 1, 0.05).toFixed(2);
    const st = randStep(0, 1, 0.05).toFixed(2);
    const tilt = String(randInt(-45, 45));
    const turb = randStep(0, 1, 0.05).toFixed(2);
    const dens = String(randInt(1, 5));

    viscosityRange.value = visc;
    surfaceTensionRange.value = st;
    tiltRange.value = tilt;
    turbulenceRange.value = turb;
    densityLevelsRange.value = dens;
    viscVal.textContent = viscosityRange.value;
    stVal.textContent = surfaceTensionRange.value;
    tiltVal.textContent = tiltRange.value;
    turbVal.textContent = turbulenceRange.value;
    densVal.textContent = densityLevelsRange.value;

    // Randomize sand colors
    if (sandColorInputA) sandColorInputA.value = randomHexColor();
    if (sandColorInputB) sandColorInputB.value = randomHexColor();
    updatePaletteFromPicker();
  }

  function updatePercents(changed) {
    // Composition: Water adjustable; Air constrained to [10..20]; Sand = 100 - (Water + Air)
    let water = parseInt(waterRange?.value || '60', 10);
    if (isNaN(water)) water = 60;
    let air = parseInt(airRange.value, 10);
    if (isNaN(air)) air = 15;
    air = Math.max(10, Math.min(20, air));
    // ensure water does not exceed remaining capacity after air
    const maxWater = 100 - air;
    water = Math.max(0, Math.min(maxWater, water));
    const sand = Math.max(0, 100 - (water + air));
    if (waterRange) waterRange.value = String(water);
    sandRange.value = String(sand);
    airRange.value = String(air);
    if (waterVal) waterVal.textContent = String(water);
    sandVal.textContent = sandRange.value;
    airVal.textContent = airRange.value;
  }

  // Simulation core
  const TYPE = { AIR: 0, SAND_A: 1, WATER: 2, SAND_B: 3 };
  function isSandType(t){ return t === TYPE.SAND_A || t === TYPE.SAND_B; }
  let W = 512, H = 384;
  let grid, gridNext, imgData, ctx, paused = false;
  let paletteA = [];
  let paletteB = [];
  // Physics flip state: when true, gravity is inverted (visual Flip button)
  let worldFlipped = false;
  function hexToRgb(hex) {
    // supports #rrggbb or #rgb
    const h = hex.replace('#','');
    let r,g,b;
    if (h.length === 3) {
      r = parseInt(h[0]+h[0],16);
      g = parseInt(h[1]+h[1],16);
      b = parseInt(h[2]+h[2],16);
    } else {
      r = parseInt(h.substring(0,2),16);
      g = parseInt(h.substring(2,4),16);
      b = parseInt(h.substring(4,6),16);
    }
    return [r,g,b];
  }
  // Simulation parameters (live)
  const params = {
    viscosity: 0.5,
    surfaceTension: 0.5,
    tiltDeg: 0,
    turbulence: 0.25,
    densityLevels: 3,
  };

  function updatePaletteFromPicker() {
    const baseA = hexToRgb(sandColorInputA?.value || '#c8b04a');
    const baseB = hexToRgb(sandColorInputB?.value || '#9a7745');
    paletteA = [baseA];
    paletteB = [baseB];
  }

  function resizeCanvas() {
    W = Math.max(16, Math.min(1024, parseInt(worldW.value || '512', 10)));
    H = Math.max(16, Math.min(1024, parseInt(worldH.value || '384', 10)));
    canvas.width = W;
    canvas.height = H;
    // Enable per-pixel alpha so water transparency is visible
    ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    imgData = ctx.createImageData(W, H);
  }

  function allocGrids() {
    grid = new Int32Array(W * H);
    gridNext = new Int32Array(W * H);
  }

  function idx(x, y) { return y * W + x; }

  function initWorld(randomize = false) {
    allocGrids();
    updatePaletteFromPicker();
    // Snapshot current parameters
    params.viscosity = parseFloat(viscosityRange.value || '0.5') || 0;
    params.surfaceTension = parseFloat(surfaceTensionRange.value || '0.5') || 0;
    params.tiltDeg = parseFloat(tiltRange.value || '0') || 0;
    params.turbulence = parseFloat(turbulenceRange.value || '0.25') || 0;
    params.densityLevels = Math.max(1, Math.min(5, parseInt(densityLevelsRange.value || '3', 10)));
    const pWater = Math.max(0, Math.min(1, (parseInt(waterRange?.value || '60', 10) / 100)));
    const pAir = Math.max(0, Math.min(1, parseInt(airRange.value, 10) / 100));
    const pSand = Math.max(0, 1 - (pWater + pAir));

    const rnd = Math.random;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let r = rnd();
        if (randomize) r = rnd();
        let t;
        if (r < pWater) t = TYPE.WATER;
        else if (r < pWater + pAir) t = TYPE.AIR;
        else t = (Math.random() < 0.5 ? TYPE.SAND_A : TYPE.SAND_B);
        let color = 0;
        let density = 0;
        if (isSandType(t)) {
          color = 0;
          density = (Math.random() * params.densityLevels) | 0; // 0 = light, higher = heavier
        }
        grid[idx(x, y)] = makeCell(t, color, density);
      }
    }
  }

  function getType(cell) { return cell & 0xFF; }
  function getColor(cell) { return (cell >>> 8) & 0xFF; }
  function getDensity(cell) { return (cell >>> 16) & 0xFF; }
  function makeCell(type, color, density /* optional */) {
    const d = (density == null ? 0 : density) & 0xFF;
    return ((d << 16) | ((color & 0xFF) << 8) | (type & 0xFF)) >>> 0;
  }

  function step() {
    gridNext.set(grid); // start from current, then mutate moves
    // Determine vertical direction depending on flip state
    const downDir = worldFlipped ? -1 : 1; // along +Y normally, -Y when flipped
    const upDir = -downDir;
    // Process rows starting from the direction of gravity to reduce artifacts
    const yStart = (downDir === 1) ? (H - 1) : 0;
    const yEnd = (downDir === 1) ? -1 : H;
    const yStep = (downDir === 1) ? -1 : 1;
    for (let y = yStart; y !== yEnd; y += yStep) {
      const isEvenRow = (y & 1) === 0;
      for (let xi = 0; xi < W; xi++) {
        const x = isEvenRow ? xi : W - 1 - xi; // alternate to reduce bias
        const i = idx(x, y);
        const cell = grid[i];
        const t = getType(cell);
        if (isSandType(t)) {
          const color = getColor(cell);
          const dens = Math.max(0, Math.min(params.densityLevels - 1, getDensity(cell)));
          const heaviness = params.densityLevels > 1 ? (dens / (params.densityLevels - 1)) : 1; // 0..1
          // Air resists sand going down: only allow moves into AIR with low probability
          // Make sand much slower than rising air bubbles
          const isA = (t === TYPE.SAND_A);
          const baseFallAir = isA ? 0.12 : 0.06; // Sand A faster than Sand B
          const viscScale = 1 - 0.75 * params.viscosity; // high viscosity => slower
          let fallIntoAirChance = Math.max(0, Math.min(1, baseFallAir * (0.6 + 0.6 * heaviness) * viscScale));
          // Try down (in direction of gravity)
          {
            const ny = y + downDir;
            if (ny >= 0 && ny < H) {
              const d = idx(x, ny);
              const below = grid[d];
              const bt = getType(below);
              if (bt === TYPE.AIR || bt === TYPE.WATER) {
                // Bubble resistance: if the air below belongs to a larger pocket,
                // strongly reduce the chance for sand to enter it.
                // Count AIR in Moore neighborhood around target (x, y+1)
                let airN = 0;
                for (let oy = -1; oy <= 1; oy++) {
                  for (let ox = -1; ox <= 1; ox++) {
                    if (ox === 0 && oy === 0) continue;
                    const ax = x + ox, ay = ny + oy;
                    if (ax < 0 || ax >= W || ay < 0 || ay >= H) continue;
                    if (getType(grid[idx(ax, ay)]) === TYPE.AIR) airN++;
                  }
                }
                // Scale factor drops with more surrounding air (coalesced bubbles resist intrusion)
                const st = params.surfaceTension;
                // Stronger resistance against sand intruding into larger air pockets
                // -> encourages bigger, more stable bubbles
                const resistAir = Math.max(0.05, 1 - (0.12 + 0.14 * st) * airN);
                // Sand moves into water more readily than into air
                const baseWater = Math.max(0.12, (isA ? 0.18 : 0.14) * (1 - 0.6 * params.viscosity) * (0.7 + 0.6 * heaviness));
                const chance = bt === TYPE.AIR
                  ? Math.max(0, Math.min(1, fallIntoAirChance * resistAir))
                  : Math.max(0, Math.min(1, baseWater));
                if (Math.random() < chance) {
                  // swap with below
                  gridNext[d] = makeCell(t, color, dens);
                  gridNext[i] = makeCell(bt === TYPE.AIR ? TYPE.AIR : TYPE.WATER, 0, 0);
                  continue;
                }
              }
            }
          }
          // Try diagonals
          // Tilt bias: positive tilt favors moving down-right
          const tilt = params.tiltDeg;
          const rightBias = tilt > 0 ? 0.65 : (tilt < 0 ? 0.35 : 0.5);
          const dir = Math.random() < rightBias ? 1 : -1;
          for (let k = 0; k < 2; k++) {
            const dx = (k === 0 ? dir : -dir);
            const nx = x + dx, ny = y + downDir;
            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
              const j = idx(nx, ny);
              const c2 = grid[j];
              const t2 = getType(c2);
              if (t2 === TYPE.AIR || t2 === TYPE.WATER) {
                // Bubble resistance also applies to diagonal entries
                let airN = 0;
                for (let oy = -1; oy <= 1; oy++) {
                  for (let ox = -1; ox <= 1; ox++) {
                    if (ox === 0 && oy === 0) continue;
                    const ax = nx + ox, ay = ny + oy;
                    if (ax < 0 || ax >= W || ay < 0 || ay >= H) continue;
                    if (getType(grid[idx(ax, ay)]) === TYPE.AIR) airN++;
                  }
                }
                const base = Math.max(0.01, (isA ? 0.08 : 0.04) * viscScale * (0.55 + 0.6 * heaviness));
                const st = params.surfaceTension;
                // Stronger resistance diagonally as well
                const resist = Math.max(0.05, 1 - (0.12 + 0.14 * st) * airN);
                const baseWater = Math.max(0.06, (isA ? 0.11 : 0.08) * (1 - 0.6 * params.viscosity) * (0.6 + 0.6 * heaviness));
                const chance = t2 === TYPE.AIR
                  ? Math.max(0, Math.min(1, base * resist))
                  : Math.max(0, Math.min(1, baseWater));
                if (Math.random() < chance) {
                  gridNext[j] = makeCell(t, color, dens);
                  gridNext[i] = makeCell(t2 === TYPE.AIR ? TYPE.AIR : TYPE.WATER, 0, 0);
                  break;
                }
              }
            }
          }
          // Turbulent sideways jitter in air
          if (Math.random() < params.turbulence * 0.03) {
            const sx = x + (Math.random() < rightBias ? 1 : -1);
            if (sx >= 0 && sx < W) {
              const j = idx(sx, y);
              if (getType(grid[j]) === TYPE.AIR) {
                gridNext[j] = makeCell(t, color, dens);
                gridNext[i] = makeCell(TYPE.AIR, 0, 0);
              }
            }
          }
        } else if (t === TYPE.AIR) {
          // AIR rises and tends to coalesce into larger bubbles
          const st = params.surfaceTension;
          const turb = params.turbulence;
          {
            const ny = y + upDir;
            if (ny >= 0 && ny < H) {
              const u = idx(x, ny);
              const above = grid[u];
              const at = getType(above);
              // Increase upward swap probability if there is air nearby above (coalescence)
              let nearAirAbove = 0;
              const ny2 = y + 2 * upDir;
              if (ny2 >= 0 && ny2 < H && getType(grid[idx(x, ny2)]) === TYPE.AIR) nearAirAbove++;
              if (x - 1 >= 0 && getType(grid[idx(x - 1, ny)]) === TYPE.AIR) nearAirAbove++;
              if (x + 1 < W && getType(grid[idx(x + 1, ny)]) === TYPE.AIR) nearAirAbove++;
              // Faster rise of air (bubbles) through media and stronger pull toward nearby air
              let riseBaseSand = 0.06 + 0.03 * turb + 0.04 * st + 0.04 * nearAirAbove;
              const riseBaseWater = 0.15 + 0.05 * turb + 0.03 * st + 0.04 * nearAirAbove; // bubbles rise faster in water
              // NEW: When a bubble meets sand, it slows down depending on surrounding sand density
              if (isSandType(at)) {
                let sandN = 0;
                for (let oy = -1; oy <= 1; oy++) {
                  for (let ox = -1; ox <= 1; ox++) {
                    if (ox === 0 && oy === 0) continue;
                    const ax = x + ox, ay = ny + oy;
                    if (ax < 0 || ax >= W || ay < 0 || ay >= H) continue;
                    const tt = getType(grid[idx(ax, ay)]);
                    if (tt === TYPE.SAND_A || tt === TYPE.SAND_B) sandN++;
                  }
                }
                const visc = params.viscosity;
                const slow = Math.max(0.25, 1 - (0.07 + 0.10 * visc) * sandN);
                riseBaseSand *= slow;
              }
              if ((isSandType(at) && Math.random() < riseBaseSand) || (at === TYPE.WATER && Math.random() < riseBaseWater)) {
                // bubble rises through sand
                gridNext[u] = makeCell(TYPE.AIR, 0, 0);
                gridNext[i] = makeCell(at, getColor(above), getDensity(above));
                continue;
              }
            }
          }
          // Diagonal upward coalescence: move toward nearby air above-diagonally
          const dirU = Math.random() < (params.tiltDeg < 0 ? 0.65 : (params.tiltDeg > 0 ? 0.35 : 0.5)) ? -1 : 1;
          for (let k = 0; k < 2; k++) {
            const dx = (k === 0 ? dirU : -dirU);
            const nx = x + dx, ny = y + upDir;
            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
              const j = idx(nx, ny);
              const c2 = grid[j];
              const t2 = getType(c2);
              if (isSandType(t2) || t2 === TYPE.WATER) {
                // If there is air beyond the sand in the direction of travel, try to swap
                const aheadY = ny + upDir;
                const hasAirAhead = (aheadY >= 0 && aheadY < H && getType(grid[idx(nx, aheadY)]) === TYPE.AIR)
                                   || (nx + dx >= 0 && nx + dx < W && getType(grid[idx(nx + dx, ny)]) === TYPE.AIR);
                // Increase diagonal coalescence speed toward nearby air
                let chance = (t2 === TYPE.WATER ? 0.09 : 0.04) + 0.03 * st + 0.03 * turb + (hasAirAhead ? 0.06 : 0);
                // NEW: Slow down diagonal coalescence when passing through sand
                if (isSandType(t2)) {
                  let sandN = 0;
                  for (let oy = -1; oy <= 1; oy++) {
                    for (let ox = -1; ox <= 1; ox++) {
                      if (ox === 0 && oy === 0) continue;
                      const ax = nx + ox, ay = ny + oy;
                      if (ax < 0 || ax >= W || ay < 0 || ay >= H) continue;
                      const tt = getType(grid[idx(ax, ay)]);
                      if (tt === TYPE.SAND_A || tt === TYPE.SAND_B) sandN++;
                    }
                  }
                  const slow = Math.max(0.25, 1 - (0.07 + 0.10 * params.viscosity) * sandN);
                  chance *= slow;
                }
                if (hasAirAhead && Math.random() < chance) {
                  gridNext[j] = makeCell(TYPE.AIR, 0, 0);
                  gridNext[i] = makeCell(t2, getColor(c2), getDensity(c2));
                  continue;
                }
              }
            }
          }
          // Lateral coalescence through sand: move sideways toward adjacent air if separated by one sand cell
          for (const dx of [-1, 1]) {
            const sx = x + dx;
            if (sx < 0 || sx >= W) continue;
            const j = idx(sx, y);
            const tSide = getType(grid[j]);
            const ahead = sx + dx;
            if ((isSandType(tSide) || tSide === TYPE.WATER) && ahead >= 0 && ahead < W && getType(grid[idx(ahead, y)]) === TYPE.AIR) {
              // Increase lateral coalescence (move sideways toward air through thin sand)
              let chance = (tSide === TYPE.WATER ? 0.06 : 0.03) + 0.02 * st + 0.03 * turb;
              // NEW: Lateral motion also slows when crossing sand
              if (isSandType(tSide)) {
                let sandN = 0;
                for (let oy = -1; oy <= 1; oy++) {
                  for (let ox = -1; ox <= 1; ox++) {
                    if (ox === 0 && oy === 0) continue;
                    const ax = sx + ox, ay = y + oy;
                    if (ax < 0 || ax >= W || ay < 0 || ay >= H) continue;
                    const tt = getType(grid[idx(ax, ay)]);
                    if (tt === TYPE.SAND_A || tt === TYPE.SAND_B) sandN++;
                  }
                }
                const slow = Math.max(0.25, 1 - (0.07 + 0.10 * params.viscosity) * sandN);
                chance *= slow;
              }
              if (Math.random() < chance) {
                // Swap with side sand to drift toward the air pocket
                gridNext[j] = makeCell(TYPE.AIR, 0, 0);
                gridNext[i] = makeCell(tSide, getColor(grid[j]), getDensity(grid[j]));
                break;
              }
            }
          }
        }
      }
    }
    // swap grids
    const tmp = grid; grid = gridNext; gridNext = tmp;
  }

  function render() {
    const data = imgData.data;
    let p = 0;
    for (let i = 0; i < grid.length; i++) {
      const cell = grid[i];
      const t = getType(cell);
      if (t === TYPE.AIR) {
        // Render air as dark background, not bright red
        data[p++] = 17; data[p++] = 17; data[p++] = 17; data[p++] = 255;
      } else if (t === TYPE.WATER) {
        // Render water as cool blue at 50% transparency
        data[p++] = 58; data[p++] = 112; data[p++] = 168; data[p++] = 128;
      } else if (t === TYPE.SAND_A) {
        const c = paletteA[0] || [200, 180, 90];
        // Slight darkening with density to hint heavier grains
        const dens = getDensity(cell);
        const dark = Math.min(0.25, 0.06 * dens);
        data[p++] = Math.max(0, c[0] * (1 - dark))|0; 
        data[p++] = Math.max(0, c[1] * (1 - dark))|0; 
        data[p++] = Math.max(0, c[2] * (1 - dark))|0; 
        data[p++] = 255;
      } else if (t === TYPE.SAND_B) {
        const c = paletteB[0] || [154, 119, 69];
        // Slight darkening with density to hint heavier grains
        const dens = getDensity(cell);
        const dark = Math.min(0.25, 0.06 * dens);
        data[p++] = Math.max(0, c[0] * (1 - dark))|0; 
        data[p++] = Math.max(0, c[1] * (1 - dark))|0; 
        data[p++] = Math.max(0, c[2] * (1 - dark))|0; 
        data[p++] = 255;
      } else {
        // Default background (should not occur, but keep a dark gray)
        data[p++] = 80; data[p++] = 86; data[p++] = 96; data[p++] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function loop() {
    if (!paused) {
      const speed = parseFloat(speedRange.value || '1');
      const steps = Math.max(1, Math.round(speed));
      for (let s = 0; s < steps; s++) step();
      render();
    }
    requestAnimationFrame(loop);
  }

  // Painting
  let painting = false;
  let paintType = TYPE.SAND_A;
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    return { x: Math.max(0, Math.min(W - 1, x)), y: Math.max(0, Math.min(H - 1, y)) };
  }
  function paint(e) {
    const { x, y } = canvasPos(e);
    // Smaller sand brush to make sand appear finer
    const radius = (paintType === TYPE.SAND_A || paintType === TYPE.SAND_B) ? 1 : 3;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          if (dx*dx + dy*dy <= radius*radius) {
            const i = idx(nx, ny);
            if (paintType === TYPE.SAND_A || paintType === TYPE.SAND_B) {
              const dens = (Math.random() * params.densityLevels) | 0;
              grid[i] = makeCell(paintType, 0, dens);
            } else {
              // only air remains besides sand types
              grid[i] = makeCell(TYPE.AIR, 0, 0);
            }
          }
        }
      }
    }
  }
  canvas.addEventListener('mousedown', (e) => { painting = true; paint(e); });
  canvas.addEventListener('mousemove', (e) => { if (painting) paint(e); });
  window.addEventListener('mouseup', () => { painting = false; });
  window.addEventListener('keydown', (e) => {
    if (e.key === '1') paintType = TYPE.SAND_A;
    else if (e.key === '2') paintType = TYPE.AIR;
    else if (e.key === '3') paintType = TYPE.AIR;
    else if (e.key === '4') paintType = TYPE.SAND_B;
    else if (e.key.toLowerCase() === 'p') togglePause();
  });

  function togglePause() {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  }

  // Buttons
  resetBtn.addEventListener('click', () => { resizeCanvas(); initWorld(false); });
  randomizeBtn.addEventListener('click', () => {
    randomizeSettings();
    resizeCanvas();
    initWorld(true);
  });
  pauseBtn.addEventListener('click', togglePause);
  // Flip button: toggle vertical 3D flip animation on the canvas container
  if (flipBtn) {
    flipBtn.addEventListener('click', () => {
      const wrap = document.getElementById('canvasWrap');
      if (!wrap) return;
      // Toggle visual flip and sync physics gravity inversion
      const nowFlipped = wrap.classList.toggle('flipped');
      worldFlipped = nowFlipped;
    });
  }

  // Initial
  updatePercents('air');
  viscVal.textContent = Number(viscosityRange.value).toFixed(2);
  stVal.textContent = Number(surfaceTensionRange.value).toFixed(2);
  tiltVal.textContent = tiltRange.value;
  turbVal.textContent = Number(turbulenceRange.value).toFixed(2);
  densVal.textContent = densityLevelsRange.value;
  resizeCanvas();
  initWorld(true);
  render();
  requestAnimationFrame(loop);
})();
