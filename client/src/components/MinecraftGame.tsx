import { useEffect } from "react";
import Terrain from "./Terrain";
import Player from "./Player";
import FirstPersonControls from "./FirstPersonControls";
import MiniMap from "./MiniMap";
import BlockHighlight from "./BlockHighlight";
import { useMinecraft } from "../lib/stores/useMinecraft";

export default function MinecraftGame() {
  const { initializeWorld } = useMinecraft();

  useEffect(() => {
    // Initialize the world when the game starts
    initializeWorld();
  }, [initializeWorld]);

  return (
    <>
      <Terrain />
      <Player />
      <FirstPersonControls />
      <BlockHighlight />
    </>
  );
}
