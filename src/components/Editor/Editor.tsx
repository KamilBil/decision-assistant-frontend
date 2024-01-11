// @ts-nocheck
import React, { useState, useCallback } from "react";
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
} from "../../helpers/treeHelpers";
import Tooltip from "@mui/material/Tooltip";
import { toPng } from "html-to-image";
import { pdf } from "@react-pdf/renderer";
import PdfReport from "../PdfReport/PdfReport";
import { useAuthUser } from "react-auth-kit";

interface EditorProps {
  isNavbarActive: boolean;
  toggleNavbar: (isActive: boolean) => void;
}

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

const Editor: React.FC<EditorProps> = ({ isNavbarActive, toggleNavbar }) => {
  // TODO: Implement undo and redo
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
    console.log("getting: ", nodes);
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

  const downloadPdf = async (treeImage) => {
    const blob = await pdf(<PdfReport base64Image={treeImage} author={auth().username} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const onReport = async () => {
    if (!rfInstance) {
      return;
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
      downloadPdf(treeImage);
    });
    // TODO: prepare PDF report with table, and plot (on front or backend)
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

  const onSave = useCallback(() => {
    if (rfInstance) {
      console.log("Save: ", JSON.stringify(rfInstance.toObject()));
    }

    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const rawFlow = localStorage.getItem(flowKey);

      if (rawFlow) {
        const flow: FlowData = JSON.parse(rawFlow);
        setFlowState(flow);
      }
    };

    restoreFlow();
  }, [setFlowState]);

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
            <IconButton onClick={onSave}>
              <SaveIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("Recover")}>
            <IconButton onClick={onRestore}>
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
            onClick={() => toggleNavbar(!isNavbarActive)}
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
