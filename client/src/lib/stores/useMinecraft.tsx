import { create } from "zustand";
import { Vector3 } from "three";

// Chunk system constants
export const CHUNK_SIZE = 16;
export const LOAD_RADIUS = 1; // Number of chunks to load around player (3x3 = 9 chunks, close to requested 8)

export interface TreePosition {
  x: number;
  z: number;
  groundHeight: number;
}

interface Chunk {
  x: number; // Chunk coordinate
  z: number; // Chunk coordinate
  heights: number[][]; // 16x16 array of height values
  trees: TreePosition[]; // Array of tree positions in this chunk
  generated: boolean;
}

interface MinecraftState {
  loadedChunks: Map<string, Chunk>;
  playerPosition: Vector3;
  playerChunk: { x: number; z: number };
  seed: number;
  
  // Actions
  initializeWorld: () => void;
  setPlayerPosition: (position: Vector3) => void;
  getHeight: (x: number, z: number) => number;
  getBlockAt: (x: number, z: number) => number | null;
  ensureChunksLoaded: () => void;
  worldToChunk: (x: number, z: number) => { cx: number; cz: number };
  getChunkKey: (cx: number, cz: number) => string;
  getAllTrees: () => TreePosition[];
}

export const useMinecraft = create<MinecraftState>((set, get) => ({
  loadedChunks: new Map(),
  playerPosition: new Vector3(25, generateHeight(25, 25) + 1 + 0.8, 25), // Start at (25,25) on ground surface (ground + 1 block height + 0.8 player half-height)
  playerChunk: { x: 1, z: 1 }, // Chunk (1,1) contains world position (25,25)
  seed: 12345, // Deterministic seed for world generation
  
  initializeWorld: () => {
    const state = get();
    // Initialize first chunk around player
    state.ensureChunksLoaded();
    console.log("Chunk-based world initialized");
  },
  
  setPlayerPosition: (position: Vector3) => {
    const state = get();
    const newPlayerChunk = state.worldToChunk(position.x, position.z);
    
    // Check if player moved to a new chunk
    const currentChunk = state.playerChunk;
    if (newPlayerChunk.cx !== currentChunk.x || newPlayerChunk.cz !== currentChunk.z) {
      set({ 
        playerPosition: position, 
        playerChunk: { x: newPlayerChunk.cx, z: newPlayerChunk.cz }
      });
      // Load new chunks around player
      state.ensureChunksLoaded();
    } else {
      set({ playerPosition: position });
    }
  },
  
  // Deterministic height function - works without requiring chunks to be loaded
  getHeight: (x: number, z: number) => {
    return generateHeight(x, z);
  },
  
  getBlockAt: (x: number, z: number) => {
    // Use deterministic height function for collision
    return get().getHeight(x, z);
  },
  
  worldToChunk: (x: number, z: number) => {
    return {
      cx: Math.floor(x / CHUNK_SIZE),
      cz: Math.floor(z / CHUNK_SIZE)
    };
  },
  
  getChunkKey: (cx: number, cz: number) => {
    return `${cx},${cz}`;
  },
  
  getAllTrees: () => {
    const state = get();
    const allTrees: TreePosition[] = [];
    
    state.loadedChunks.forEach((chunk) => {
      allTrees.push(...chunk.trees);
    });
    
    return allTrees;
  },
  
  ensureChunksLoaded: () => {
    const state = get();
    const { playerChunk, loadedChunks } = state;
    const newChunks = new Map(loadedChunks);
    
    // Generate chunks in a radius around the player
    for (let dx = -LOAD_RADIUS; dx <= LOAD_RADIUS; dx++) {
      for (let dz = -LOAD_RADIUS; dz <= LOAD_RADIUS; dz++) {
        const chunkX = playerChunk.x + dx;
        const chunkZ = playerChunk.z + dz;
        const chunkKey = state.getChunkKey(chunkX, chunkZ);
        
        // Only generate if chunk doesn't exist
        if (!newChunks.has(chunkKey)) {
          const chunk = generateChunk(chunkX, chunkZ);
          newChunks.set(chunkKey, chunk);
        }
      }
    }
    
    // Remove chunks that are too far away
    const chunksToRemove: string[] = [];
    newChunks.forEach((chunk, key) => {
      const distance = Math.max(
        Math.abs(chunk.x - playerChunk.x),
        Math.abs(chunk.z - playerChunk.z)
      );
      if (distance > LOAD_RADIUS + 1) {
        chunksToRemove.push(key);
      }
    });
    
    chunksToRemove.forEach(key => {
      newChunks.delete(key);
    });
    
    set({ loadedChunks: newChunks });
    console.log(`Loaded chunks around player: ${newChunks.size} total chunks`);
  }
}));

// Deterministic height generation function
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

// Generate a single chunk (16x16)
function generateChunk(chunkX: number, chunkZ: number): Chunk {
  const heights: number[][] = [];
  
  // Generate height values for each column in the chunk
  for (let x = 0; x < CHUNK_SIZE; x++) {
    heights[x] = [];
    for (let z = 0; z < CHUNK_SIZE; z++) {
      // Convert chunk-relative coordinates to world coordinates
      const worldX = chunkX * CHUNK_SIZE + x;
      const worldZ = chunkZ * CHUNK_SIZE + z;
      heights[x][z] = generateHeight(worldX, worldZ);
    }
  }
  
  // Generate trees for this chunk
  const trees: TreePosition[] = [];
  
  // Randomly place trees with about 5% chance per chunk position
  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      // Skip some positions to avoid overcrowding
      if (x % 3 !== 0 || z % 3 !== 0) continue;
      
      // Random chance for tree placement
      if (Math.random() < 0.3) { // 30% chance for trees on valid positions
        const worldX = chunkX * CHUNK_SIZE + x;
        const worldZ = chunkZ * CHUNK_SIZE + z;
        const groundHeight = heights[x][z];
        
        trees.push({
          x: worldX,
          z: worldZ,
          groundHeight: groundHeight
        });
      }
    }
  }
  
  return {
    x: chunkX,
    z: chunkZ,
    heights,
    trees,
    generated: true
  };
}
