
# Mini Games — Landing + Sand Picture Emulator

This repository now hosts a tiny landing page with links to multiple mini games:

- Sand Picture Emulator (moved into `sand-picture/`)
- Arrow Game (new folder scaffolded; coming soon)

It’s self-contained: open `index.html` in a modern browser, or run it with npm to start a local server that opens your browser automatically.

## Sand Picture — Features

- Sand and air cellular simulation with falling and sliding behavior
  - Air pockets coalesce into larger bubbles that resist intrusion and slow sand falling
- Two distinct sand types (A and B) with adjustable colors
- Adjustable world size and simulation speed
- Physical-like parameters: viscosity, surface tension, tilt, turbulence
- Multiple sand density levels for varied grain “heaviness”
- Painting directly on the canvas with keyboard shortcuts
- Works in light and dark mode

## Getting Started

1. Download or clone the repository.
2. Option A — npm (recommended):
   - Install Node.js 14+.
   - Run: npm start
   - Your default browser will open at http://localhost:5173/ (or another free port).
   - From the landing page you can choose:
     - Sand Picture Emulator: http://localhost:5173/sand-picture/
     - Arrow Game (placeholder): http://localhost:5173/arrow-game/
3. Option B — open file directly:
   - Open `index.html` in a modern desktop browser (Chrome, Edge, Firefox, Safari) to see the landing page and links.
   - Tip: If your browser blocks local file script access, serve the folder with a simple local server (e.g., Python: `python3 -m http.server` and open http://localhost:8000/).

No build step or dependencies are required.

## Sand Picture — Controls (left panel)

- Sand A color / Sand B color
  - Pick base colors for the two sand types. They fall and flow differently, producing layered patterns.

- Sand %, Air %
  - Initial composition sliders. They are normalized to 100% automatically when you change either of them.

- Viscosity
  - Higher values make sand movements more resistant and slower to flow sideways.

- Surface tension
  - Encourages clumping and sticking; higher values favor compact piles and reduce dispersion.

- Tilt angle (°)
  - Tilts gravity, causing materials to drift to one side. Range: -45° to +45°.

- Turbulence
  - Adds a subtle randomness to movement, preventing perfectly uniform settling and producing natural patterns.

- Sand density levels
  - Controls how many discrete “heaviness” levels exist for sand grains. Heavier grains settle faster and appear slightly darker.

- World size (pixels)
  - Width × Height of the simulation grid. Larger sizes look better but cost more CPU.

- Simulation speed
  - Multiplier for how many steps per animation frame are simulated. Higher values speed up evolution at the expense of CPU.

- Buttons
  - Reset: Rebuild the world using current sliders (deterministic layout).
  - Randomize: Rebuild the world with a randomized initial distribution.
  - Pause: Toggle pause/resume.
  - Flip: Animate the canvas with a 180° rotation around the X‑axis (vertical flip). Click again to flip back. When flipped, the simulation’s gravity is inverted: sand moves toward the new “down,” and air rises toward the new “up.”

## Sand Picture — Canvas Interaction and Shortcuts

- Painting: Click and drag on the canvas to paint the selected material.
- Shortcuts (while the page is focused):
  - 1 = Paint Sand A
  - 2 = Paint Air
  - 3 = Paint Air
  - 4 = Paint Sand B
  - P = Pause/Resume

Brush size is smaller for sand to give a finer grain look, and larger for air to quickly sculpt the scene.

## Sand Picture — How it works (brief)

The simulation runs on an integer grid updated from bottom to top each step. Each cell stores:
- Type: Air, Sand A, Sand B
- Color index (for extensibility; currently base colors)
- Density level (heavier sand tends to settle faster)

Rendering writes pixels directly with ImageData for performance. Air is rendered in limegreen on a dark background for high visibility. Air pockets tend to merge into bubbles, and these bubbles resist sand entry, slowing the overall settling. Sand colors are slightly darkened by density to suggest weight.

## Sand Picture — Performance Tips

- Prefer moderate world sizes (e.g., 512×384) for smooth real-time updates.
- Increase Simulation speed for faster settling when paused is off.
- Lower Turbulence and Viscosity for simpler flows if your device struggles.

## Browser Support

Tested in current versions of Chromium-based browsers and Firefox. Safari should work as well. A desktop browser is recommended for performance.

## Development

Project structure of interest:
- `index.html`: landing page with links to each mini game
- `sand-picture/index.html`: Sand Picture app entry
- `sand-picture/index.js`: Sand Picture simulation and UI
- `arrow-game/index.html`: Arrow Game placeholder entry
- `arrow-game/index.js`: Arrow key input indicator (placeholder logic)
- `server.js`: tiny static server for local development
- `package.json`: metadata (no build dependencies)

You can serve locally if desired:

Python 3:
  python3 -m http.server 8000

Node (npx):
  npx http-server . -p 8000

Then visit:
  http://localhost:8000/
  - Sand Picture: http://localhost:8000/sand-picture/
  - Arrow Game:  http://localhost:8000/arrow-game/

Or simply use:

npm start

which launches a tiny built-in static server (`server.js`) and opens your browser automatically.

## License

No license specified. Use at your own discretion or add a license file if you intend to distribute.
