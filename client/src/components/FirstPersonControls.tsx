import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

export default function FirstPersonControls() {
  const { camera, gl } = useThree();
  const isLockedRef = useRef(false);
  const mouseMovementRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleClick = () => {
      if (!isLockedRef.current) {
        canvas.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      isLockedRef.current = document.pointerLockElement === canvas;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isLockedRef.current) return;

      const sensitivity = 0.002;
      
      mouseMovementRef.current.x -= event.movementX * sensitivity;
      mouseMovementRef.current.y -= event.movementY * sensitivity;
      
      // Limit vertical rotation
      mouseMovementRef.current.y = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, mouseMovementRef.current.y)
      );
      
      // Apply rotation to camera
      camera.rotation.set(
        mouseMovementRef.current.y,
        mouseMovementRef.current.x,
        0
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && isLockedRef.current) {
        document.exitPointerLock();
      }
    };

    // Add event listeners
    canvas.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [camera, gl]);

  return null;
}
