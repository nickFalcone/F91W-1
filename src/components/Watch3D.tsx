import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { WatchButtons } from "./WatchButtons";
import { useWatchStore } from "../logic/watchStore";
import { WatchFaceCanvas } from "./WatchFaceCanvas";

function Scene() {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    // no-op; reserved for future small animations
  });

  const meshMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9,
        metalness: 0.1,
      }),
    []
  );

  const faceTexture = WatchFaceCanvas.useTexture();

  return (
    <group ref={group}>
      <mesh material={meshMat} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.6, 0.3]} />
      </mesh>

      <mesh position={[0, 0.1, 0.16]}>
        <planeGeometry args={[1.7, 1.1]} />
        <meshBasicMaterial map={faceTexture} toneMapped={false} />
      </mesh>

      <WatchButtons />

      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <ambientLight intensity={0.3} />
    </group>
  );
}

export function Watch3D() {
  const [zoom, setZoom] = useState(1.4);
  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const next = Math.min(
        2.5,
        Math.max(0.8, zoom + (e.deltaY > 0 ? 0.1 : -0.1))
      );
      setZoom(next);
    },
    [zoom]
  );

  return (
    <div onWheel={onWheel} style={{ width: "100%", height: "100%" }}>
      <Canvas shadows camera={{ position: [0, 0, 4 * (1 / zoom)], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.7}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
