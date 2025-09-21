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
    // Clamp delta to prevent large frame time spikes
    const clampedDelta = Math.min(delta, 1/30);
    
    const keys = getKeys();
    const velocity = velocityRef.current;
    const maxSpeed = 5;
    const jumpSpeed = 8;
    const damping = 0.8; // Movement damping factor
    const gravity = 20;
    const playerHalfHeight = 0.9;
    
    // Debug logging for controls (as recommended)
    if (keys.forward || keys.back || keys.left || keys.right || keys.jump) {
      console.log("Keys pressed:", {
        forward: keys.forward,
        back: keys.back, 
        left: keys.left,
        right: keys.right,
        jump: keys.jump
      });
    }
    
    // Get camera direction for movement
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    
    // Calculate right vector
    const right = new Vector3();
    right.crossVectors(direction, camera.up).normalize();
    
    // Calculate target velocity based on input
    const inputVector = new Vector3();
    
    if (keys.forward) {
      inputVector.add(direction);
    }
    if (keys.back) {
      inputVector.sub(direction);
    }
    if (keys.left) {
      inputVector.sub(right);
    }
    if (keys.right) {
      inputVector.add(right);
    }
    
    // Normalize input and create target velocity (only for XZ movement)
    inputVector.y = 0;
    if (inputVector.length() > 0) {
      inputVector.normalize();
    }
    const targetVelocity = inputVector.multiplyScalar(maxSpeed);
    
    // Apply smooth damping to horizontal movement (exponential smoothing)
    const dampingFactor = 1 - Math.exp(-damping * clampedDelta);
    velocity.x = velocity.x + (targetVelocity.x - velocity.x) * dampingFactor;
    velocity.z = velocity.z + (targetVelocity.z - velocity.z) * dampingFactor;
    
    // Check if player is grounded
    const groundHeight = getGroundHeight(playerPosition.x, playerPosition.z);
    const isGrounded = playerPosition.y <= groundHeight + playerHalfHeight + 0.1;
    
    // Apply gravity (proper acceleration)
    velocity.y -= gravity * clampedDelta;
    
    // Handle jumping (only when grounded)
    if (keys.jump && isGrounded) {
      velocity.y = jumpSpeed;
    }
    
    // Calculate new position (single delta application)
    const newPosition = playerPosition.clone();
    newPosition.add(velocity.clone().multiplyScalar(clampedDelta));
    
    // Collision detection and ground constraint
    const newGroundHeight = getGroundHeight(newPosition.x, newPosition.z);
    
    // Keep player above ground
    if (newPosition.y < newGroundHeight + playerHalfHeight) {
      newPosition.y = newGroundHeight + playerHalfHeight;
      velocity.y = 0; // Stop falling when hitting ground
    }
    
    // Update position
    setPlayerPosition(newPosition);
    
    // Smooth camera following (optional camera smoothing)
    const cameraSmoothing = 0.9;
    const cameraDampingFactor = 1 - Math.exp(-cameraSmoothing * clampedDelta);
    camera.position.lerp(newPosition, cameraDampingFactor);
  });

  const getGroundHeight = (x: number, z: number): number => {
    const blockX = Math.floor(x);
    const blockZ = Math.floor(z);
    const block = getBlockAt(blockX, blockZ);
    return block ? block : 0;
  };

  return null; // Player is just a camera, no visual representation needed
}
