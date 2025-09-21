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
  const cameraInitialized = useRef(false);
  const { playerPosition, setPlayerPosition, getBlockAt } = useMinecraft();
  
  const [subscribe, getKeys] = useKeyboardControls();

  useFrame((state, delta) => {
    // Initialize camera position immediately on first frame
    if (!cameraInitialized.current) {
      camera.position.copy(playerPosition);
      cameraInitialized.current = true;
      console.log("Camera initialized at position:", playerPosition);
    }
    
    // Clamp delta to prevent large frame time spikes
    const clampedDelta = Math.min(delta, 1/30);
    
    const keys = getKeys();
    const velocity = velocityRef.current;
    const maxSpeed = 4.137;
    const jumpSpeed = 8;
    const gravity = 50; // Much faster falling like Minecraft
    const playerHalfHeight = 0.8; // 1.6 blocks total height (0.8 * 2)
    
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
    
    // Instant horizontal movement - no inertia like Minecraft
    velocity.x = targetVelocity.x;
    velocity.z = targetVelocity.z;
    
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
    const currentGroundHeight = getGroundHeight(playerPosition.x, playerPosition.z);
    
    // Check for autojump - only if moving horizontally and block is exactly 1 block higher
    const isMovingHorizontally = Math.abs(velocity.x) > 0.1 || Math.abs(velocity.z) > 0.1;
    const blockHeightDifference = newGroundHeight - currentGroundHeight;
    const canAutojump = isMovingHorizontally && isGrounded && blockHeightDifference > 0 && blockHeightDifference <= 1;
    
    // Trigger autojump with satisfying animation
    if (canAutojump && velocity.y <= 0) {
      velocity.y = jumpSpeed * 0.85; // Slightly lower jump for autojump
      console.log("Autojump triggered!");
    }
    
    // Keep player above ground
    if (newPosition.y < newGroundHeight + playerHalfHeight) {
      newPosition.y = newGroundHeight + playerHalfHeight;
      velocity.y = Math.max(0, velocity.y); // Don't reset upward velocity during autojump
    }
    
    // Update position
    setPlayerPosition(newPosition);
    
    // Instant camera following - no smoothing lag
    camera.position.copy(newPosition);
  });

  const getGroundHeight = (x: number, z: number): number => {
    const blockX = Math.floor(x);
    const blockZ = Math.floor(z);
    const blockHeight = getBlockAt(blockX, blockZ);
    // Blocks are positioned at height + 0.5, so top surface is at height + 1
    // Use !== null check to handle zero height correctly
    return blockHeight !== null ? blockHeight + 1 : 0;
  };

  return null; // Player is just a camera, no visual representation needed
}
