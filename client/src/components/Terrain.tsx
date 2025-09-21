import { useMemo } from "react";
import { useMinecraft } from "../lib/stores/useMinecraft";
import Block from "./Block";

export default function Terrain() {
  const { world } = useMinecraft();

  const blocks = useMemo(() => {
    const blockElements = [];
    
    for (let x = 0; x < world.length; x++) {
      for (let z = 0; z < world[x].length; z++) {
        const height = world[x][z];
        
        // Create blocks from y=0 up to the height
        for (let y = 0; y <= height; y++) {
          const blockType = y === height ? 'grass' : 'dirt';
          blockElements.push(
            <Block
              key={`${x}-${y}-${z}`}
              position={[x, y, z]}
              type={blockType}
            />
          );
        }
      }
    }
    
    return blockElements;
  }, [world]);

  return <>{blocks}</>;
}
