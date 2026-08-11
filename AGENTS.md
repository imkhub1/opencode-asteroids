# Agent Guidance

## Project Shape

- This is a dependency-free HTML5 Canvas game; there is no `package.json`, bundler, framework, build pipeline, test suite, or lint/typecheck configuration.
- `index.html` is the browser entrypoint and loads all game logic from `game.js`; the game uses a fixed `800x600` canvas, so keep the HTML dimensions and the `W`/`H` constants in sync.
- `favicon.svg` is the only additional runtime asset.

## Run And Verify

- Open `index.html` directly, or run `npx serve .` and visit `http://localhost:3000`.
- Use `node --check game.js` for JavaScript syntax validation; gameplay changes require manual browser playtesting because no automated test harness exists.
- Controls are `ArrowLeft`/`ArrowRight` to rotate, `ArrowUp` to thrust, and `Space` to fire or restart after game over.

## Conventions

- Keep the game dependency-free and browser-native unless adding tooling is explicitly required.
- Preserve the existing Spanish document text and in-game HUD/overlay labels when changing behavior or presentation.
