import { useEffect, useRef } from "react";
import { useMinecraft } from "../lib/stores/useMinecraft";

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { world, playerPosition } = useMinecraft();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 4; // Each block = 4 pixels
    const mapSize = world.length * scale;
    
    // Draw terrain
    for (let x = 0; x < world.length; x++) {
      for (let z = 0; z < world[x].length; z++) {
        const height = world[x][z];
        
        // Color based on height (darker = lower, lighter = higher)
        const normalizedHeight = height / 10; // Assuming max height around 10
        const greenValue = Math.floor(50 + normalizedHeight * 150);
        ctx.fillStyle = `rgb(0, ${greenValue}, 0)`;
        
        ctx.fillRect(x * scale, z * scale, scale, scale);
      }
    }

    // Draw player position
    const playerX = Math.floor(playerPosition.x) * scale;
    const playerZ = Math.floor(playerPosition.z) * scale;
    
    ctx.fillStyle = 'red';
    ctx.fillRect(playerX - 1, playerZ - 1, 3, 3);
    
    // Draw player direction indicator
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerX, playerZ);
    
    // Simple direction indicator (pointing north for now)
    ctx.lineTo(playerX, playerZ - 8);
    ctx.stroke();

  }, [world, playerPosition]);

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
    </div>
  );
}
