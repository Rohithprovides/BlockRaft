import { useMemo } from "react";

export function useWorldGeneration(size: number = 50) {
  const world = useMemo(() => {
    const worldData: number[][] = [];
    
    for (let x = 0; x < size; x++) {
      worldData[x] = [];
      for (let z = 0; z < size; z++) {
        // Generate height using simple noise-like function
        const height = generateHeight(x, z);
        worldData[x][z] = height;
      }
    }
    
    return worldData;
  }, [size]);

  return world;
}

function generateHeight(x: number, z: number): number {
  // Simple height generation using sine waves for varied terrain
  const scale1 = 0.1;
  const scale2 = 0.05;
  const scale3 = 0.02;
  
  const height1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 3;
  const height2 = Math.sin(x * scale2) * Math.cos(z * scale2) * 5;
  const height3 = Math.sin(x * scale3) * Math.cos(z * scale3) * 2;
  
  const baseHeight = 2;
  const totalHeight = baseHeight + height1 + height2 + height3;
  
  return Math.max(0, Math.floor(totalHeight));
}
