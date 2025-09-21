import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface BlockProps {
  position: [number, number, number];
  type: 'grass' | 'dirt';
}

export default function Block({ position, type }: BlockProps) {
  const grassTexture = useTexture("/textures/grass.png");
  const woodTexture = useTexture("/textures/wood.jpg"); // Using wood as dirt texture
  
  // Configure texture settings
  grassTexture.magFilter = THREE.NearestFilter;
  grassTexture.minFilter = THREE.NearestFilter;
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  
  woodTexture.magFilter = THREE.NearestFilter;
  woodTexture.minFilter = THREE.NearestFilter;
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;

  const texture = type === 'grass' ? grassTexture : woodTexture;

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial map={texture} />
    </mesh>
  );
}
