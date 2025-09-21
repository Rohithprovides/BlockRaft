import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function FirstPersonControls() {
  const { camera, gl } = useThree();
  const isLockedRef = useRef(false);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

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

      // Minecraft-like sensitivity
      const sensitivity = 0.0022;
      
      // Update yaw (horizontal rotation) and pitch (vertical rotation)
      yawRef.current -= event.movementX * sensitivity;
      pitchRef.current -= event.movementY * sensitivity;
      
      // Limit vertical rotation (pitch) to prevent flipping
      pitchRef.current = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, pitchRef.current)
      );
      
      // Apply rotations in the correct order (like Minecraft)
      // First apply yaw around the Y-axis, then pitch around the X-axis
      camera.rotation.order = 'YXZ';
      camera.rotation.set(pitchRef.current, yawRef.current, 0);
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
