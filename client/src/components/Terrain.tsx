import { useMemo } from "react";
import { useMinecraft } from "../lib/stores/useMinecraft";
import ChunkMesh from "./ChunkMesh";

export default function Terrain() {
  const { loadedChunks } = useMinecraft();

  const chunks = useMemo(() => {
    const chunkElements: JSX.Element[] = [];
    
    // Render each chunk as an instanced mesh
    loadedChunks.forEach((chunk) => {
      chunkElements.push(
        <ChunkMesh
          key={`${chunk.x}-${chunk.z}`}
          chunkX={chunk.x}
          chunkZ={chunk.z}
          heights={chunk.heights}
        />
      );
    });
    
    console.log(`Rendering ${loadedChunks.size} instanced chunks (${loadedChunks.size * 256} total blocks)`);
    return chunkElements;
  }, [loadedChunks]);

  return <>{chunks}</>;
}
