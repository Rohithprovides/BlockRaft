import { create } from "zustand";
import { Vector3 } from "three";

interface MinecraftState {
  world: number[][];
  playerPosition: Vector3;
  worldSize: number;
  
  // Actions
  initializeWorld: () => void;
  setPlayerPosition: (position: Vector3) => void;
  getBlockAt: (x: number, z: number) => number | null;
}

export const useMinecraft = create<MinecraftState>((set, get) => ({
  world: [],
  playerPosition: new Vector3(25, 15, 25), // Start in middle of world, elevated
  worldSize: 50,
  
  initializeWorld: () => {
    const { worldSize } = get();
    const newWorld: number[][] = [];
    
    // Generate terrain with height variations
    for (let x = 0; x < worldSize; x++) {
      newWorld[x] = [];
      for (let z = 0; z < worldSize; z++) {
        newWorld[x][z] = generateHeight(x, z);
      }
    }
    
    set({ world: newWorld });
    console.log("World initialized with size:", worldSize);
  },
  
  setPlayerPosition: (position: Vector3) => {
    set({ playerPosition: position });
  },
  
  getBlockAt: (x: number, z: number) => {
    const { world, worldSize } = get();
    
    if (x < 0 || x >= worldSize || z < 0 || z >= worldSize) {
      return null;
    }
    
    return world[x]?.[z] ?? null;
  }
}));

function generateHeight(x: number, z: number): number {
  // Create varied terrain using multiple sine waves
  const scale1 = 0.1;
  const scale2 = 0.05;
  const scale3 = 0.02;
  
  const height1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 2;
  const height2 = Math.sin(x * scale2) * Math.cos(z * scale2) * 4;
  const height3 = Math.sin(x * scale3) * Math.cos(z * scale3) * 1;
  
  const baseHeight = 3;
  const totalHeight = baseHeight + height1 + height2 + height3;
  
  return Math.max(0, Math.floor(totalHeight));
}
