import { useEffect, useRef } from "react";
import { useMinecraft } from "../lib/stores/useMinecraft";

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { loadedChunks, playerPosition, getHeight } = useMinecraft();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 2; // Each block = 2 pixels for better range coverage
    const mapRadius = 50; // Show 100x100 area around player
    const centerX = canvas.width / 2;
    const centerZ = canvas.height / 2;
    
    // Draw terrain around player
    for (let dx = -mapRadius; dx <= mapRadius; dx++) {
      for (let dz = -mapRadius; dz <= mapRadius; dz++) {
        const worldX = Math.floor(playerPosition.x) + dx;
        const worldZ = Math.floor(playerPosition.z) + dz;
        
        // Get height using deterministic function (works even if chunk not loaded)
        const height = getHeight(worldX, worldZ);
        
        // Color based on height (darker = lower, lighter = higher)
        const normalizedHeight = height / 10; // Assuming max height around 10
        const greenValue = Math.floor(50 + normalizedHeight * 150);
        ctx.fillStyle = `rgb(0, ${greenValue}, 0)`;
        
        const pixelX = centerX + dx * scale;
        const pixelZ = centerZ + dz * scale;
        ctx.fillRect(pixelX, pixelZ, scale, scale);
      }
    }

    // Draw player position (always at center)
    ctx.fillStyle = 'red';
    ctx.fillRect(centerX - 1, centerZ - 1, 3, 3);
    
    // Draw player direction indicator
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerZ);
    
    // Simple direction indicator (pointing north for now)
    ctx.lineTo(centerX, centerZ - 8);
    ctx.stroke();

  }, [loadedChunks, playerPosition, getHeight]);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '10px',
      borderRadius: '8px',
      border: '2px solid #fff'
    }}>
      <div style={{ color: 'white', marginBottom: '5px', fontSize: '12px' }}>
        Mini Map
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        style={{
          border: '1px solid #fff',
          display: 'block'
        }}
      />
      <div style={{ color: 'white', marginTop: '5px', fontSize: '10px' }}>
        Position: {Math.floor(playerPosition.x)}, {Math.floor(playerPosition.z)}
      </div>
      <div style={{ color: 'white', marginTop: '5px', fontSize: '10px' }}>
        Chunks: {loadedChunks.size}
      </div>
    </div>
  );
}
