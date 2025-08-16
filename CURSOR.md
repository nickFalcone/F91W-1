# Cursor notes

## steps

- Scaffolded Vite React+TS app with Three.js and Zustand.
- Added app shell, 3D scene, canvas-based LCD, and status panel.
- Implemented basic store, keyboard mapping, and persistence hooks.
- Wrote unit tests for stopwatch, alarm triggers, and time formatting.

## lessons learned

- Keep LCD updates on a canvas loop to avoid React re-renders.
- WebGL fallback ensures accessibility and graceful degradation.
