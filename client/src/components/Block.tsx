import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

interface BlockProps {
  position: [number, number, number];
  type: 'grass' | 'dirt';
}

export default function Block({ position, type }: BlockProps) {
  const grassTopTexture = useTexture("/textures/grass.png");
  const dirtTexture = useTexture("/textures/dirt.png");
  
  // Configure texture settings for pixelated look
  grassTopTexture.magFilter = THREE.NearestFilter;
  grassTopTexture.minFilter = THREE.NearestFilter;
  grassTopTexture.wrapS = THREE.RepeatWrapping;
  grassTopTexture.wrapT = THREE.RepeatWrapping;
  
  dirtTexture.magFilter = THREE.NearestFilter;
  dirtTexture.minFilter = THREE.NearestFilter;
  dirtTexture.wrapS = THREE.RepeatWrapping;
  dirtTexture.wrapT = THREE.RepeatWrapping;

  // Create materials array for different faces of the cube using useMemo
  // Order: [right, left, top, bottom, front, back]
  const materials = useMemo(() => {
    if (type === 'grass') {
      return [
        new THREE.MeshLambertMaterial({ map: dirtTexture }), // right
        new THREE.MeshLambertMaterial({ map: dirtTexture }), // left  
        new THREE.MeshLambertMaterial({ map: grassTopTexture }), // top
        new THREE.MeshLambertMaterial({ map: dirtTexture }), // bottom
        new THREE.MeshLambertMaterial({ map: dirtTexture }), // front
        new THREE.MeshLambertMaterial({ map: dirtTexture })  // back
      ];
    } else {
      return [
        new THREE.MeshLambertMaterial({ map: dirtTexture }), // all faces dirt
        new THREE.MeshLambertMaterial({ map: dirtTexture }),
        new THREE.MeshLambertMaterial({ map: dirtTexture }),
        new THREE.MeshLambertMaterial({ map: dirtTexture }),
        new THREE.MeshLambertMaterial({ map: dirtTexture }),
        new THREE.MeshLambertMaterial({ map: dirtTexture })
      ];
    }
  }, [type, grassTopTexture, dirtTexture]);

  return (
    <mesh position={position} castShadow receiveShadow material={materials}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}
