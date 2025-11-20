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
        }
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
            <label>Sand % <span id="sandVal">60</span></label>
            <input id="sand" type="range" min="0" max="100" value="60"/>
          </div>
          <div class="control">
            <label>Water % <span id="waterVal">0</span></label>
            <input id="water" type="range" min="0" max="100" value="0"/>
          </div>
          <div class="control">
            <label>Air % <span id="airVal">40</span></label>
            <input id="air" type="range" min="0" max="100" value="40"/>
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
            <button id="randomize">Randomize</button>
            <button id="pause">Pause</button>
          </div>
          <div class="legend">Tip: Drag on the canvas to paint. 1=Sand A, 4=Sand B, 2=Water, 3=Air.</div>
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
  const waterRange = $('water');
  const airRange = $('air');
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
  const speedRange = $('speed');

  const sandVal = $('sandVal');
  const waterVal = $('waterVal');
  const airVal = $('airVal');
  const speedVal = $('speedVal');
  const viscVal = $('viscVal');
  const stVal = $('stVal');
  const tiltVal = $('tiltVal');
  const turbVal = $('turbVal');
  const densVal = $('densVal');

  sandRange.addEventListener('input', () => updatePercents('sand'));
  waterRange.addEventListener('input', () => updatePercents('water'));
  airRange.addEventListener('input', () => updatePercents('air'));
  speedRange.addEventListener('input', () => { speedVal.textContent = speedRange.value + 'x'; });
  viscosityRange.addEventListener('input', () => { viscVal.textContent = Number(viscosityRange.value).toFixed(2); });
  surfaceTensionRange.addEventListener('input', () => { stVal.textContent = Number(surfaceTensionRange.value).toFixed(2); });
  tiltRange.addEventListener('input', () => { tiltVal.textContent = tiltRange.value; });
  turbulenceRange.addEventListener('input', () => { turbVal.textContent = Number(turbulenceRange.value).toFixed(2); });
  densityLevelsRange.addEventListener('input', () => { densVal.textContent = densityLevelsRange.value; });
  if (sandColorInputA) sandColorInputA.addEventListener('input', () => { updatePaletteFromPicker(); });
  if (sandColorInputB) sandColorInputB.addEventListener('input', () => { updatePaletteFromPicker(); });

  function updatePercents(changed) {
    // Normalize so sand+water+air = 100
    const vals = {
      sand: parseInt(sandRange.value, 10),
      water: parseInt(waterRange.value, 10),
      air: parseInt(airRange.value, 10),
    };
    const total = vals.sand + vals.water + vals.air;
    if (total === 100) {
      // ok
    } else if (total === 0) {
      vals.air = 100;
    } else {
      const diff = 100 - total;
      // distribute diff among the other two sliders
      const keys = ['sand', 'water', 'air'].filter(k => k !== changed);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const allot = i === keys.length - 1 ? diff : Math.round(diff / keys.length);
        vals[k] = Math.max(0, Math.min(100, vals[k] + allot));
      }
    }
    sandRange.value = String(vals.sand);
    waterRange.value = String(vals.water);
    airRange.value = String(vals.air);
    sandVal.textContent = sandRange.value;
    waterVal.textContent = waterRange.value;
    airVal.textContent = airRange.value;
  }

  // Simulation core
  const TYPE = { AIR: 0, SAND_A: 1, WATER: 2, SAND_B: 3 };
  function isSandType(t){ return t === TYPE.SAND_A || t === TYPE.SAND_B; }
  let W = 512, H = 384;
  let grid, gridNext, imgData, ctx, paused = false;
  let paletteA = [];
  let paletteB = [];
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
    ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
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
    const pSand = parseInt(sandRange.value, 10) / 100;
    const pWater = parseInt(waterRange.value, 10) / 100;
    const pAir = Math.max(0, 1 - pSand - pWater);

    const rnd = Math.random;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let r = rnd();
        if (randomize) r = rnd();
        let t;
        if (r < pSand) t = (Math.random() < 0.5 ? TYPE.SAND_A : TYPE.SAND_B);
        else if (r < pSand + pWater) t = TYPE.WATER;
        else t = TYPE.AIR;
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
    // Update from bottom to top to handle falling
    for (let y = H - 1; y >= 0; y--) {
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
          const fallIntoAirChance = Math.max(0, Math.min(1, baseFallAir * (0.6 + 0.6 * heaviness) * viscScale));
          // Try down
          if (y + 1 < H) {
            const d = idx(x, y + 1);
            const below = grid[d];
            const bt = getType(below);
            if (bt === TYPE.WATER) {
              // sand always sinks through water
              gridNext[d] = makeCell(t, color, dens);
              gridNext[i] = makeCell(TYPE.WATER, getColor(below), 0);
              continue;
            } else if (bt === TYPE.AIR && Math.random() < fallIntoAirChance) {
              // swap with below
              gridNext[d] = makeCell(t, color, dens);
              gridNext[i] = makeCell(TYPE.AIR, 0, 0);
              continue;
            }
          }
          // Try diagonals
          // Tilt bias: positive tilt favors moving down-right
          const tilt = params.tiltDeg;
          const rightBias = tilt > 0 ? 0.65 : (tilt < 0 ? 0.35 : 0.5);
          const dir = Math.random() < rightBias ? 1 : -1;
          for (let k = 0; k < 2; k++) {
            const dx = (k === 0 ? dir : -dir);
            const nx = x + dx, ny = y + 1;
            if (nx >= 0 && nx < W && ny < H) {
              const j = idx(nx, ny);
              const c2 = grid[j];
              const t2 = getType(c2);
              if (t2 === TYPE.WATER) {
                gridNext[j] = makeCell(t, color, dens);
                gridNext[i] = makeCell(TYPE.WATER, getColor(c2), 0);
                break;
              } else if (t2 === TYPE.AIR && Math.random() < Math.max(0.01, (isA ? 0.09 : 0.05) * viscScale * (0.55 + 0.6 * heaviness))) {
                gridNext[j] = makeCell(t, color, dens);
                gridNext[i] = makeCell(TYPE.AIR, 0, 0);
                break;
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
        } else if (t === TYPE.WATER) {
          // Water tries to go down (into air only), then diagonals into air, then sideways into air
          if (y + 1 < H) {
            const d = idx(x, y + 1);
            if (getType(grid[d]) === TYPE.AIR) {
              // Always flow straight down into air (fix: ensure water goes down)
              gridNext[d] = cell;
              gridNext[i] = makeCell(TYPE.AIR, 0, 0);
              continue;
            }
          }
          // diagonals into air
          const rightBias = params.tiltDeg > 0 ? 0.65 : (params.tiltDeg < 0 ? 0.35 : 0.5);
          const dir = Math.random() < rightBias ? 1 : -1;
          let moved = false;
          for (let k = 0; k < 2; k++) {
            const dx = (k === 0 ? dir : -dir);
            const nx = x + dx, ny = y + 1;
            if (nx >= 0 && nx < W && ny < H) {
              const j = idx(nx, ny);
              if (getType(grid[j]) === TYPE.AIR) {
                // surface tension gate again but weaker
                let allow = true;
                const st = params.surfaceTension;
                if (st > 0) {
                  const tx = nx, ty = ny;
                  let solids = 0;
                  for (let oy = -1; oy <= 1; oy++) {
                    for (let ox = -1; ox <= 1; ox++) {
                      if (ox === 0 && oy === 0) continue;
                      const ax = tx + ox, ay = ty + oy;
                      if (ax < 0 || ax >= W || ay < 0 || ay >= H) { solids++; continue; }
                      const tt = getType(grid[idx(ax, ay)]);
                      if (isSandType(tt)) solids++;
                    }
                  }
                  const gate = 1 - 0.6 * st * (solids / 8);
                  allow = Math.random() < gate || Math.random() < params.turbulence * 0.2;
                }
                if (allow) {
                  gridNext[j] = cell;
                  gridNext[i] = makeCell(TYPE.AIR, 0, 0);
                  moved = true;
                  break;
                }
                moved = true;
              }
            }
          }
          if (moved) continue;
          // lateral flow
          const baseLateral = 3;
          const lateralSteps = Math.max(1, Math.round(baseLateral * (1 - 0.8 * params.viscosity) * (1 + 0.5 * params.turbulence)));
          const ddir = Math.random() < rightBias ? 1 : -1;
          for (let step = 1; step <= lateralSteps; step++) {
            const nx = x + ddir * step;
            if (nx < 0 || nx >= W) break;
            const j = idx(nx, y);
            if (getType(grid[j]) === TYPE.AIR) {
              gridNext[j] = cell;
              gridNext[i] = makeCell(TYPE.AIR, 0, 0);
              break;
            }
          }
          // turbulence: random sideways even without slope
          if (Math.random() < params.turbulence * 0.05) {
            const sx = x + (Math.random() < 0.5 ? -1 : 1);
            if (sx >= 0 && sx < W) {
              const j = idx(sx, y);
              if (getType(grid[j]) === TYPE.AIR) {
                gridNext[j] = grid[i];
                gridNext[i] = makeCell(TYPE.AIR, 0, 0);
              }
            }
          }
        } else if (t === TYPE.AIR) {
          // AIR bubbles rise: swap upwards with WATER deterministically,
          // and occasionally with SAND to simulate bubbles that slow sand.
          if (y - 1 >= 0) {
            const u = idx(x, y - 1);
            const above = grid[u];
            const at = getType(above);
            if (at === TYPE.WATER) {
              // bubble rises through water
              gridNext[u] = makeCell(TYPE.AIR, 0, 0);
              gridNext[i] = makeCell(TYPE.WATER, getColor(above), 0);
              continue;
            } else if (isSandType(at) && Math.random() < 0.03) {
              // rare bubble rise through sand, slowing sand columns
              gridNext[u] = makeCell(TYPE.AIR, 0, 0);
              gridNext[i] = makeCell(at, getColor(above), getDensity(above));
              continue;
            }
          }
          // Try diagonal up through water to avoid being trapped under ledges
          const dirU = Math.random() < (params.tiltDeg < 0 ? 0.65 : (params.tiltDeg > 0 ? 0.35 : 0.5)) ? -1 : 1; // bias opposite to water
          for (let k = 0; k < 2; k++) {
            const dx = (k === 0 ? dirU : -dirU);
            const nx = x + dx, ny = y - 1;
            if (nx >= 0 && nx < W && ny >= 0) {
              const j = idx(nx, ny);
              const c2 = grid[j];
              const t2 = getType(c2);
              if (t2 === TYPE.WATER) {
                gridNext[j] = makeCell(TYPE.AIR, 0, 0);
                gridNext[i] = makeCell(TYPE.WATER, getColor(c2), 0);
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
        // Make air visible as a lighter gray
        data[p++] = 80; data[p++] = 86; data[p++] = 96; data[p++] = 255;
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
      } else { // WATER
        // Render water the same as air to avoid visible blue sprinkles
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
            } else if (paintType === TYPE.WATER) {
              grid[i] = makeCell(TYPE.WATER, 0, 0);
            } else {
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
    else if (e.key === '2') paintType = TYPE.WATER;
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
  randomizeBtn.addEventListener('click', () => { resizeCanvas(); initWorld(true); });
  pauseBtn.addEventListener('click', togglePause);
  // Note: Flip features removed per request

  // Initial
  updatePercents('sand');
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
