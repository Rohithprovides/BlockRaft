import { useMemo } from "react";
import { useMinecraft } from "../lib/stores/useMinecraft";
import Block from "./Block";

export default function Terrain() {
  const { loadedChunks } = useMinecraft();

  const blocks = useMemo(() => {
    const blockElements: JSX.Element[] = [];
    
    // Iterate through all loaded chunks
    loadedChunks.forEach((chunk) => {
      // For each chunk, render only the top surface blocks to improve performance
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          const height = chunk.heights[x][z];
          const worldX = chunk.x * 16 + x;
          const worldZ = chunk.z * 16 + z;
          
          // Only render the top grass block for now (for performance)
          // Later we can optimize this with instanced meshes
          blockElements.push(
            <Block
              key={`${worldX}-${height}-${worldZ}`}
              position={[worldX, height, worldZ]}
              type="grass"
            />
          );
          
          // Optionally render a few dirt blocks below for visual depth
          if (height > 0) {
            blockElements.push(
              <Block
                key={`${worldX}-${height-1}-${worldZ}`}
                position={[worldX, height-1, worldZ]}
                type="dirt"
              />
            );
          }
        }
      }
    });
    
    console.log(`Rendering ${blockElements.length} blocks from ${loadedChunks.size} chunks`);
    return blockElements;
  }, [loadedChunks]);

  return <>{blocks}</>;
}
