import { useWatchStore, ButtonKey } from "../logic/watchStore";
import { useMemo } from "react";

export function WatchButtons() {
  const onPress = useWatchStore((s) => s.handleButton);

  const buttons = useMemo(
    () =>
      [
        { key: "L", position: [-1.3, -0.2, 0], color: "#1e90ff" },
        { key: "C", position: [0, -1.3, 0], color: "#ff4757" },
        { key: "A", position: [1.3, 0.4, 0], color: "#2ed573" },
      ] as const,
    []
  );

  // Handle button press/release for light
  const handlePointerDown = (key: ButtonKey) => {
    onPress(key);
    // For L button, handle mousedown/mouseup for light
    if (key === "L") {
      document.addEventListener("pointerup", handlePointerUp);
    }
  };

  const handlePointerUp = () => {
    useWatchStore.setState({ lightOn: false });
    document.removeEventListener("pointerup", handlePointerUp);
  };

  return (
    <group>
      {buttons.map((b) => (
        <mesh
          key={b.key}
          position={[b.position[0], b.position[1], 0.16]}
          onPointerDown={() => handlePointerDown(b.key)}
        >
          <boxGeometry args={[0.28, 0.12, 0.08]} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}
    </group>
  );
}
