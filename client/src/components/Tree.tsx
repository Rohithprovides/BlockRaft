import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface TreeProps {
  x: number;
  z: number;
  groundHeight: number;
}

export default function Tree({ x, z, groundHeight }: TreeProps) {
  const trunkMeshRef = useRef<THREE.InstancedMesh>(null);
  const leavesMeshRef = useRef<THREE.InstancedMesh>(null);
  
  // Load textures
  const woodTexture = useTexture("/textures/wood_trunk.png");
  const leavesTexture = useTexture("/textures/leaves.png");
  
  // Configure textures
  [woodTexture, leavesTexture].forEach(texture => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  });

  // Generate tree structure
  const { trunkPositions, leavesPositions } = useMemo(() => {
    const trunk: THREE.Vector3[] = [];
    const leaves: THREE.Vector3[] = [];
    
    // Tree parameters - randomized for each tree
    const trunkHeight = 4 + Math.floor(Math.random() * 3); // 4-6 blocks tall
    const leavesRadius = 2;
    
    // Generate trunk blocks
    for (let y = 1; y <= trunkHeight; y++) {
      trunk.push(new THREE.Vector3(x, groundHeight + y, z));
    }
    
    // Generate leaves blocks in a spherical/cube pattern around the top
    const leavesCenter = groundHeight + trunkHeight;
    for (let dx = -leavesRadius; dx <= leavesRadius; dx++) {
      for (let dy = -1; dy <= 2; dy++) { // Leaves above and around trunk top
        for (let dz = -leavesRadius; dz <= leavesRadius; dz++) {
          // Skip if too close to center (where trunk is) or too far
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (distance < 1 && dy <= 0) continue; // Don't place leaves inside trunk
          if (distance > leavesRadius + 0.5) continue; // Keep spherical shape
          
          // Add some randomness - don't place all possible leaves blocks
          if (Math.random() > 0.75) continue;
          
          leaves.push(new THREE.Vector3(x + dx, leavesCenter + dy, z + dz));
        }
      }
    }
    
    return {
      trunkPositions: trunk,
      leavesPositions: leaves
    };
  }, [x, z, groundHeight]);

  // Set up trunk instance matrices
  useFrame(() => {
    if (!trunkMeshRef.current || !trunkPositions.length) return;
    
    const tempMatrix = new THREE.Matrix4();
    
    if (!trunkMeshRef.current.userData.matricesSet) {
      trunkPositions.forEach((position, index) => {
        tempMatrix.setPosition(position.x, position.y + 0.5, position.z);
        trunkMeshRef.current!.setMatrixAt(index, tempMatrix);
      });
      
      trunkMeshRef.current.instanceMatrix.needsUpdate = true;
      trunkMeshRef.current.userData.matricesSet = true;
    }
  });

  // Set up leaves instance matrices
  useFrame(() => {
    if (!leavesMeshRef.current || !leavesPositions.length) return;
    
    const tempMatrix = new THREE.Matrix4();
    
    if (!leavesMeshRef.current.userData.matricesSet) {
      leavesPositions.forEach((position, index) => {
        tempMatrix.setPosition(position.x, position.y + 0.5, position.z);
        leavesMeshRef.current!.setMatrixAt(index, tempMatrix);
      });
      
      leavesMeshRef.current.instanceMatrix.needsUpdate = true;
      leavesMeshRef.current.userData.matricesSet = true;
    }
  });

  return (
    <>
      {/* Trunk */}
      <instancedMesh
        ref={trunkMeshRef}
        args={[undefined, undefined, trunkPositions.length]}
        frustumCulled={true}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial map={woodTexture} />
      </instancedMesh>

      {/* Leaves */}
      <instancedMesh
        ref={leavesMeshRef}
        args={[undefined, undefined, leavesPositions.length]}
        frustumCulled={true}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial map={leavesTexture} transparent={true} alphaTest={0.1} />
      </instancedMesh>
    </>
  );
}