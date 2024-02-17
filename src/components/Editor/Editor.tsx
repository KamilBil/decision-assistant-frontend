// @ts-nocheck
import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Position,
  Connection,
  Node,
  Edge,
  Viewport,
  ReactFlowInstance,
  BackgroundVariant,
  Panel,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import "reactflow/dist/style.css";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import HistoryIcon from "@mui/icons-material/History";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import "./editor.css";
import ModalForNode from "../ModalForNode/ModalForNode";
import CustomEdge from "../CustomEdge/CustomEdge";
import ModalForEdge from "../ModalForEdge/ModalForEdge";
import { useTranslation } from "react-i18next";
import {
  buildTree,
  calculate_expected_utility,
  fix_probabilities,
} from "../../helpers/treeHelpers";
import Tooltip from "@mui/material/Tooltip";
import { toPng } from "html-to-image";
import { pdf } from "@react-pdf/renderer";
import PdfReport from "../PdfReport/PdfReport";
import { useAuthUser } from "react-auth-kit";
import useDecisionTreesApi from "../../hooks/useDecisionTreesApi";
import { useLocation } from "react-router-dom";

interface FlowData {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
}

const flowKey = "example-flow"; // key under which diagram data is stored in localStorage
const getNodeId = () => `randomnode_${+new Date()}`; // the function that generates a unique ID for new nodes based on current time
const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
const edgeTypes = {
  default_with_value: CustomEdge,
};

interface EditorProps {
  isNavbarActive: boolean;
  setIsNavbarActive: (open: boolean) => void;
}

const Editor: React.FC<EditorProps> = ({
  isNavbarActive,
  setIsNavbarActive,
}: EditorProps) => {
  // TODO: Implement undo and redo
  const {
    decisionTrees,
    isLoading,
    error,
    fetchTrees,
    createTree,
    deleteTree,
    editTree,
    fetchTreeById,
  } = useDecisionTreesApi();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance>();
  const [nodeToEdit, setNodeToEdit] = useState<Node>();
  const [edgeToEdit, setEdgeToEdit] = useState<Edge>();
  const [openModalForNode, setOpenModalForNode] = useState(false);
  const [openModalForEdge, setOpenModalForEdge] = useState(false);
  const { t } = useTranslation();
  const { getNodes } = useReactFlow();
  const auth = useAuthUser();
  const { setViewport } = useReactFlow();
  const location = useLocation();
  const { id } = location.state as { id: number };
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const loadData = async () => {
    try {
      const data = await fetchTreeById(id);
      setTitle(data["title"]);
      setDescription(data["description"]);
      if (data["data"]) {
        setFlowState(data["data"]);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const saveData = async () => {
    try {
      const flow = rfInstance.toObject();
      await editTree(id, {
        title: title,
        description: description,
        data: flow,
      });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const changeTextInNode = (
    ev: React.MouseEvent<Element, MouseEvent>,
    node: Node
  ) => {
    setNodeToEdit(node);
    setOpenModalForNode(true);
  };

  const changeTextInEdge = (
    ev: React.MouseEvent<Element, MouseEvent>,
    edge: Edge
  ) => {
    setEdgeToEdit(edge);
    setOpenModalForEdge(true);
  };

  const processValues = useCallback(() => {
    let nodes_dict: { [key: string]: Node } = {};
    nodes.forEach((node) => {
      nodes_dict[node.id] = node;
    });

    let edges_dict: { [key: string]: Edge } = {};
    edges.forEach((edge) => {
      edges_dict[edge.target] = edge;
    });

    let connected_nodes_list: string[][] = [];
    edges.forEach((edge) => {
      connected_nodes_list.push([edge.source, edge.target]);
    });

    const tree = buildTree(connected_nodes_list);
    return { nodes_dict, edges_dict, tree };
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: "default_with_value",
        data: {
          description: "",
          value: 0.5,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDownload = useCallback(() => {
    if (!rfInstance) {
      return;
    }

    const blob = new Blob([JSON.stringify(rfInstance.toObject())], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tree.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [rfInstance]);

  const setFlowState = (flowData: FlowData) => {
    const { nodes, edges, viewport } = flowData;
    const { x = 0, y = 0, zoom = 1 } = viewport || {};
    setNodes(nodes || []);
    setEdges(edges || []);
    setViewport({ x, y, zoom });
  };

  const onFileSelected = useCallback(
    (event: React.BaseSyntheticEvent) => {
      const files = event.target.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.type === "application/json") {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            const content = e.target?.result;
            if (typeof content === "string") {
              try {
                if (content) {
                  const json = JSON.parse(content);
                  setFlowState(json);
                }
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
          };
          reader.readAsText(file);
        }
      }
    },
    [setFlowState]
  );

  const downloadPdf = async (treeImage, bestPath) => {
    const blob = await pdf(
      <PdfReport
        base64Image={treeImage}
        author={auth().username}
        bestPath={bestPath}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const bestWay = (nodes_dict, edges_dict, tree) => {
    let max_value: number = 0;
    let max_key: string = "";
    for (let key in tree) {
      if (nodes_dict[key].data.value > max_value) {
        max_value = nodes_dict[key].data.value;
        max_key = key;
      }
    }
    if (Object.keys(tree[max_key]).length) {
      let path = bestWay(nodes_dict, edges_dict, tree[max_key]);
      path.push(nodes_dict[max_key]);
      return path;
    } else {
      return [nodes_dict[max_key]];
    }
  };

  const onReport = async () => {
    if (!rfInstance) {
      return;
    }
    calculateTree(); // to have up-to-data tree
    const { nodes_dict, edges_dict, tree } = processValues();

    const lst = bestWay(nodes_dict, edges_dict, tree).reverse();
    let bestWayStr = "";
    for (let i in lst) {
      for (let edge_id in edges_dict) {
        if (
          edges_dict.hasOwnProperty(edge_id) &&
          edges_dict[edge_id].target === lst[i].id
        ) {
          if (i > 0) {
            bestWayStr += " -> ";
          }
          bestWayStr += edges_dict[edge_id].data.description;
        }
      }
    }

    const nodesBounds = getRectOfNodes(getNodes());
    const imageWidth = nodesBounds.width;
    const imageHeight = nodesBounds.height;

    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    toPng(document.querySelector(".react-flow__viewport"), {
      backgroundColor: "#ffffff",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then((treeImage) => {
      downloadPdf(treeImage, bestWayStr);
    });
  };

  const calculateTree = useCallback(() => {
    if (!rfInstance) {
      return;
    }
    const { nodes_dict, edges_dict, tree } = processValues();
    const node_id: string = Object.keys(tree)[0];

    if (!node_id) {
      return;
    }

    fix_probabilities(nodes_dict, edges_dict, tree[node_id], node_id);

    const expected_utility = calculate_expected_utility(
      nodes_dict,
      edges_dict,
      tree[node_id],
      node_id
    );

    // update the visualisation
    const newNodes = nodes.map((node: Node) => {
      return {
        ...node,
        data: {
          ...node.data,
          value: node.data.value,
          label: node.data.value,
        },
      };
    });
    setNodes(newNodes);
  }, [nodes, edges]);

  const onAdd = useCallback(
    (className: string) => {
      const newNode: Node = {
        id: getNodeId(),
        type: className === "output" ? "output" : "default",
        className: className,
        data: { label: "0", value: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        position: {
          x: window.innerWidth / 2,
          y: window.innerHeight / 10,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const nodeColor = (node: Node) => {
    switch (node.className) {
      case "circle":
        return "#296d98";
      case "output":
        return "#d3d3d3";
      case "square":
        return "#009150";
      default:
        return "#ff0072";
    }
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={setRfInstance}
      onNodeClick={changeTextInNode}
      onEdgeClick={changeTextInEdge}
      edgeTypes={edgeTypes}
    >
      {nodeToEdit && (
        <ModalForNode
          open={openModalForNode}
          setOpen={setOpenModalForNode}
          node_to_edit={nodeToEdit}
        />
      )}
      {edgeToEdit && (
        <ModalForEdge
          open={openModalForEdge}
          setOpen={setOpenModalForEdge}
          edge_to_edit={edgeToEdit}
        />
      )}

      <Controls />
      <MiniMap
        nodeColor={(node) => nodeColor(node)}
        nodeStrokeWidth={2}
        zoomable
        pannable
      />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      <Panel position="top-right">
        <Stack direction="row" spacing={0} flexWrap="wrap">
          <Tooltip title={t("Save")}>
            <IconButton onClick={saveData}>
              <SaveIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("Recover")}>
            <IconButton onClick={loadData}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("Undo operation")}>
            <IconButton>
              <HistoryIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("Download")}>
            <IconButton onClick={onDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("Upload")}>
            <IconButton component="label" onChange={onFileSelected}>
              <CloudUploadIcon />
              <VisuallyHiddenInput type="file" />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("Generate report")}>
            <IconButton onClick={onReport}>
              <AssessmentIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            onClick={() => setIsNavbarActive(!isNavbarActive)}
          >
            {isNavbarActive ? t("Hide the navbar") : t("Show the navbar")}
          </Button>

          <Button
            color="primary"
            variant="outlined"
            onClick={() => onAdd("circle")}
          >
            {t("Add a randomness node")}
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => onAdd("square")}
          >
            {t("Add a decision node")}
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => onAdd("output")}
          >
            {t("Add output")}
          </Button>

          <Button
            component="label"
            variant="contained"
            startIcon={<AutoGraphRoundedIcon />}
            onClick={calculateTree}
          >
            {t("Complete the tree")}
          </Button>
        </Stack>
      </Panel>
    </ReactFlow>
  );
};

export default Editor;
