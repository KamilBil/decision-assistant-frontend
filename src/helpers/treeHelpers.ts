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
    if (nodes_dict[current_node_id].className === "circle") {
      for (let key in tree) {
        if (tree.hasOwnProperty(key)) {
          result +=
            calculate_expected_utility(nodes_dict, edges_dict, tree[key], key) *
            edges_dict[key].data.value;
        }
      }
    } else {
      for (let key in tree) {
        if (tree.hasOwnProperty(key)) {
          const temp = calculate_expected_utility(
            nodes_dict,
            edges_dict,
            tree[key],
            key
          );
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

export function fix_probabilities(
  nodes_dict: { [key: string]: Node },
  edges_dict: { [key: string]: Edge },
  tree: NodeMap,
  current_node_id: string
): void {
  if (Object.keys(tree).length) {
    for (let key in tree) {
      if (tree.hasOwnProperty(key)) {
        fix_probabilities(nodes_dict, edges_dict, tree[key], key);
      }
    }

    // no probabilities after square
    if (nodes_dict[current_node_id].className === "square") {
      for (let edge_id in edges_dict) {
        if (
          edges_dict.hasOwnProperty(edge_id) &&
          edges_dict[edge_id].source === current_node_id
        ) {
          edges_dict[edge_id].data.value = null;
        }
      }
    }
    // autofilling empty probabilities
    else if (nodes_dict[current_node_id].className === "circle") {
      let found_edges: Edge[] = [];
      let filled: number = 0;
      let sum: number = 0;

      for (let edge_id in edges_dict) {
        if (
          edges_dict.hasOwnProperty(edge_id) &&
          edges_dict[edge_id].source === current_node_id
        ) {
          found_edges.push(edges_dict[edge_id]);
          if (edges_dict[edge_id].data.value) {
            sum += edges_dict[edge_id].data.value;
            filled += 1;
          }
        }
      }
      // assign correct values
      found_edges.forEach((edge) => {
        if (!edge.data.value) {
          const new_value = (1 - sum) / (found_edges.length - filled);
          if (new_value) {
            edge.data.value = new_value;
          }
        }
      });
    }
  }
}
