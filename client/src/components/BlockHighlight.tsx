import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMinecraft } from "../lib/stores/useMinecraft";

export default function BlockHighlight() {
  const { camera } = useThree();
  const { getBlockAt } = useMinecraft();
  const outlineRef = useRef<THREE.LineSegments>(null);
  const [targetBlock, setTargetBlock] = useState<THREE.Vector3 | null>(null);

  useFrame(() => {
    // Raycast from camera center to find block we're looking at
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    raycaster.set(camera.position, direction);
    raycaster.far = 6; // Max reach distance

    // Check blocks along the ray
    let foundBlock: THREE.Vector3 | null = null;
    const step = 0.1;
    
    for (let distance = 0; distance < 6; distance += step) {
      const point = camera.position.clone().add(direction.clone().multiplyScalar(distance));
      const blockX = Math.floor(point.x);
      const blockZ = Math.floor(point.z);
      const blockHeight = getBlockAt(blockX, blockZ);
      
      if (blockHeight !== null) {
        // Check if ray intersects this block
        if (point.y >= blockHeight && point.y <= blockHeight + 1) {
          foundBlock = new THREE.Vector3(blockX, blockHeight, blockZ);
          break;
        }
      }
    }

    setTargetBlock(foundBlock);

    // Update outline position
    if (outlineRef.current && foundBlock) {
      outlineRef.current.position.set(foundBlock.x + 0.5, foundBlock.y + 0.5, foundBlock.z + 0.5);
      outlineRef.current.visible = true;
    } else if (outlineRef.current) {
      outlineRef.current.visible = false;
    }
  });

  return (
    <lineSegments ref={outlineRef}>
      <edgesGeometry args={[new THREE.BoxGeometry(1.01, 1.01, 1.01)]} />
      <lineBasicMaterial color="#000000" linewidth={2} transparent opacity={0.4} />
    </lineSegments>
  );
}
