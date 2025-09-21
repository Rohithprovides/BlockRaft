import { useMinecraft } from "../lib/stores/useMinecraft";
import Tree from "./Tree";

export default function Trees() {
  const { getAllTrees } = useMinecraft();
  const allTrees = getAllTrees();

  return (
    <>
      {allTrees.map((treePos, index) => (
        <Tree
          key={`tree-${treePos.x}-${treePos.z}-${index}`}
          x={treePos.x}
          z={treePos.z}
          groundHeight={treePos.groundHeight}
        />
      ))}
    </>
  );
}