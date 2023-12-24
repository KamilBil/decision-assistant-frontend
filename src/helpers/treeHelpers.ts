// @ts-nocheck comment
// TODO
export function buildTree(connections) {
  const nodes = {};
  const tree = {};

  // Creates or returns an existing node
  function getNode(id) {
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

  // Builds a tree, starting from the root (assumption: there is only one root)
  Object.keys(nodes).forEach(nodeId => {
      if (!connections.some(([_, child]) => child == nodeId)) {
          tree[nodeId] = nodes[nodeId];
      }
  });

  return tree;
}