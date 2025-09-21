import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface ChunkMeshProps {
  chunkX: number;
  chunkZ: number;
  heights: number[][];
}

const CHUNK_SIZE = 16;

export default function ChunkMesh({ chunkX, chunkZ, heights }: ChunkMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Load textures
  const grassTopTexture = useTexture("/textures/grass.png");
  
  // Configure textures
  grassTopTexture.magFilter = THREE.NearestFilter;
  grassTopTexture.minFilter = THREE.NearestFilter;
  grassTopTexture.wrapS = THREE.RepeatWrapping;
  grassTopTexture.wrapT = THREE.RepeatWrapping;

  // Create instance positions
  const { positions, count } = useMemo(() => {
    const instancePositions: THREE.Vector3[] = [];
    
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const height = heights[x][z];
        const worldX = chunkX * CHUNK_SIZE + x;
        const worldZ = chunkZ * CHUNK_SIZE + z;
        
        instancePositions.push(new THREE.Vector3(worldX, height, worldZ));
      }
    }
    
    return {
      positions: instancePositions,
      count: instancePositions.length
    };
  }, [chunkX, chunkZ, heights]);

  // Set up instance matrices
  useMemo(() => {
    if (!meshRef.current) return;
    
    const tempMatrix = new THREE.Matrix4();
    
    positions.forEach((position, index) => {
      tempMatrix.setPosition(position);
      meshRef.current!.setMatrixAt(index, tempMatrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={true}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial map={grassTopTexture} />
    </instancedMesh>
  );
}