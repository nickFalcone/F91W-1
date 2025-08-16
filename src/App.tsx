import { Suspense, useEffect, useMemo, useState } from "react";
import { StatusPanel } from "./components/StatusPanel";
import { Watch3D } from "./components/Watch3D";
import { DomFallback } from "./components/DomFallback";
import { useWatchStore, initializeStore } from "./logic/watchStore";
import { loadFromStorage } from "./logic/persistence";

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) &&
      window.WebGLRenderingContext
    );
  } catch {
    return false;
  }
}

export default function App() {
  const [webgl, setWebgl] = useState<boolean>(true);

  useEffect(() => {
    setWebgl(isWebGLAvailable());
    initializeStore(loadFromStorage());
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "l" || k === "c" || k === "a") {
        e.preventDefault();
        useWatchStore
          .getState()
          .handleButton(k.toUpperCase() as "L" | "C" | "A");
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "l") {
        e.preventDefault();
        useWatchStore.setState({ lightOn: false });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const content = useMemo(() => {
    if (!webgl) {
      return <DomFallback />;
    }
    return (
      <Suspense fallback={<div className="center">Loading…</div>}>
        <Watch3D />
      </Suspense>
    );
  }, [webgl]);

  return (
    <div className="layout">
      <main className="stage" aria-label="Casio F-91W-1 simulation">
        {content}
      </main>
      <aside className="side">
        <StatusPanel />
        <section className="controls">
          <h3>Controls</h3>
          <ul>
            <li>
              <b>L</b>: Light/Split/Move
            </li>
            <li>
              <b>C</b>: Mode/Cycle/Exit
            </li>
            <li>
              <b>A</b>: Start/Stop/12↔24/Increment
            </li>
            <li>Wheel: Zoom • Drag: Rotate • Double-click: Reset view</li>
            <li>Keyboard: L / C / A keys mapped to buttons</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
