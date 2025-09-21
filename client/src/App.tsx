import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import MinecraftGame from "./components/MinecraftGame";
import MiniMap from "./components/MiniMap";

// Define control keys for the game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "jump", keys: ["Space"] },
];

// Check WebGL support with multiple attempts
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    
    // Try different WebGL contexts with permissive settings
    const contextAttributes = {
      alpha: false,
      antialias: false,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false
    };
    
    let gl = canvas.getContext('webgl2', contextAttributes) ||
             canvas.getContext('webgl', contextAttributes) ||
             canvas.getContext('experimental-webgl', contextAttributes) ||
             canvas.getContext('webkit-3d', contextAttributes) ||
             canvas.getContext('moz-webgl', contextAttributes);
    
    if (gl) {
      const webgl = gl as WebGLRenderingContext;
      console.log("WebGL context found:", webgl.getParameter(webgl.VERSION));
      return true;
    }
    
    // Try again with minimal settings
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      console.log("Basic WebGL context found");
      return true;
    }
    
    console.log("No WebGL context available");
    return false;
  } catch (e) {
    console.error("WebGL detection error:", e);
    return false;
  }
}

function App() {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  const [canvasError, setCanvasError] = useState<string>("");

  useEffect(() => {
    // Add delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      const isSupported = checkWebGLSupport();
      console.log("WebGL detection result:", isSupported);
      setWebGLSupported(isSupported);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // If WebGL detection is still in progress, show loading
  if (webGLSupported === null) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <h1 style={{ fontSize: '2rem' }}>Loading 3D World...</h1>
      </div>
    );
  }

  if (webGLSupported === false) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>WebGL Not Supported</h1>
        <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
          Your browser or device doesn't support WebGL, which is required for this 3D Minecraft world.
        </p>
        <p style={{ marginTop: '1rem', fontSize: '1rem', color: '#ccc' }}>
          Try using Chrome, Firefox, or Edge with hardware acceleration enabled.
        </p>
      </div>
    );
  }

  const handleCanvasError = (error: any) => {
    console.error("Canvas creation error:", error);
    setCanvasError("Failed to create 3D graphics context. Try refreshing the page.");
  };

  if (canvasError) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Graphics Error</h1>
        <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
          {canvasError}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
          shadows
          camera={{
            position: [0, 10, 0],
            fov: 75,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: false,
            powerPreference: "default",
            alpha: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
            depth: true,
            stencil: false
          }}
          onCreated={({ gl }) => {
            console.log("WebGL context created successfully:", gl);
          }}
          onError={handleCanvasError}
        >
          <color attach="background" args={["#87CEEB"]} />
          
          {/* Simplified lighting to reduce GPU load */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[50, 50, 50]}
            intensity={0.8}
            castShadow={false} // Disable shadows to reduce GPU load
          />

          <Suspense fallback={null}>
            <MinecraftGame />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
      {/* Render MiniMap as HTML overlay outside the Canvas */}
      <MiniMap />
    </div>
  );
}

export default App;
