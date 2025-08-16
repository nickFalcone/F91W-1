# F-91W-1 Tribute (React + TypeScript + Three.js)

An interactive single-page tribute to the classic Casio F-91W-1 watch. It renders a 3D watch you can rotate and zoom, with a live LCD simulated on a canvas texture. Keyboard and on-watch buttons map to L/C/A.

## Run locally

```bash
yarn
yarn dev
```

## Controls

- L: Light/Split/Move
- C: Mode/Cycle/Exit
- A: Start/Stop/12↔24/Increment
- Mouse wheel: zoom
- Drag: rotate

## Notes

- WebGL fallback: if WebGL is not available, a static SVG is shown.
- State is persisted via localStorage.

## Attributions

- Product imagery and design belong to Casio. See product page: `https://www.casio.com/us/watches/casio/product.F-91W-1/`.
