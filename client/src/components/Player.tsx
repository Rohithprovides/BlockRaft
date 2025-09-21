import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Vector3 } from "three";
import { useMinecraft } from "../lib/stores/useMinecraft";

export default function Player() {
  const { camera } = useThree();
  const playerRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new Vector3(0, 0, 0));
  const { playerPosition, setPlayerPosition, getBlockAt } = useMinecraft();
  
  const [subscribe, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    const keys = getKeys();
    const velocity = velocityRef.current;
    const speed = 5;
    const jumpSpeed = 8;
    
    // Get camera direction for movement
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    
    // Calculate right vector
    const right = new Vector3();
    right.crossVectors(direction, camera.up).normalize();
    
    // Movement input
    const moveVector = new Vector3();
    
    if (keys.forward) {
      moveVector.add(direction);
    }
    if (keys.backward) {
      moveVector.sub(direction);
    }
    if (keys.leftward) {
      moveVector.sub(right);
    }
    if (keys.rightward) {
      moveVector.add(right);
    }
    
    // Normalize and apply speed (only for XZ movement)
    moveVector.y = 0;
    moveVector.normalize();
    moveVector.multiplyScalar(speed * delta);
    
    // Apply horizontal movement
    velocity.x = moveVector.x;
    velocity.z = moveVector.z;
    
    // Gravity and jumping
    velocity.y -= 20 * delta; // Gravity
    
    if (keys.jump && playerPosition.y <= getGroundHeight(playerPosition.x, playerPosition.z) + 1.1) {
      velocity.y = jumpSpeed;
    }
    
    // Calculate new position
    const newPosition = playerPosition.clone();
    newPosition.add(velocity.clone().multiplyScalar(delta));
    
    // Collision detection
    const groundHeight = getGroundHeight(newPosition.x, newPosition.z);
    
    // Check if player would be inside a block
    if (newPosition.y < groundHeight + 1.8) {
      newPosition.y = groundHeight + 1.8;
      velocity.y = 0;
    }
    
    // Update position
    setPlayerPosition(newPosition);
    
    // Update camera position
    camera.position.copy(newPosition);
  });

  const getGroundHeight = (x: number, z: number): number => {
    const blockX = Math.floor(x);
    const blockZ = Math.floor(z);
    const block = getBlockAt(blockX, blockZ);
    return block ? block : 0;
  };

  return null; // Player is just a camera, no visual representation needed
}
