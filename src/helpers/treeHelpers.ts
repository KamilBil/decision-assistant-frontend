import { Node, Edge } from "reactflow";
interface NodeMap {
  [key: string]: NodeMap;
}

export function buildTree(connections: string[][]) {
  const nodes: NodeMap = {};
  const tree: NodeMap = {};

  // Creates or returns an existing node
  function getNode(id: string) {
    if (!nodes[id]) {
      nodes[id] = {};
    }
    return nodes[id];
  }

  // Builds nodes based on connections
  connections.forEach(([parent, child]) => {
    const parentNode = getNode(parent);
    parentNode[child] = getNode(child);
  });

  // Builds a tree, starting from the root
  Object.keys(nodes).forEach((nodeId) => {
    if (!connections.some(([_, child]) => child === nodeId)) {
      tree[nodeId] = nodes[nodeId];
    }
  });

  return tree;
}

export function calculate_expected_utility(
  nodes_dict: { [key: string]: Node },
  edges_dict: { [key: string]: Edge },
  tree: NodeMap,
  current_node_id: string
): number {
  if (Object.keys(tree).length === 0) {
    return nodes_dict[current_node_id].data.value;
  } else {
    let result = 0;
    if (nodes_dict[current_node_id].className=="circle"){
      for (let key in tree) {
        if (tree.hasOwnProperty(key)) {
          result +=
            calculate_expected_utility(nodes_dict, edges_dict, tree[key], key) *
            edges_dict[key].data.value;
        }
      }
    }else{
      for (let key in tree) {
        if (tree.hasOwnProperty(key)) {
          const temp = calculate_expected_utility(nodes_dict, edges_dict, tree[key], key);
          if (result < temp) {
            result = temp;
          }
        }
      }
    }
    nodes_dict[current_node_id].data.value = result;
    return result;
  }
}
