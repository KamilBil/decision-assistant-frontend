import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Node, getConnectedEdges, useReactFlow } from "reactflow";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Tooltip } from "@mui/material";

interface ModalForNodeProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  node_to_edit: Node;
}

function ModalForNode({ open, setOpen, node_to_edit }: ModalForNodeProps) {
  const { setNodes, getEdges, setEdges } = useReactFlow();
  const [value, setValue] = useState(node_to_edit.data.value);
  const [nodeClass, setNodeClass] = useState(node_to_edit.className);
  const { t } = useTranslation();

  const onRemove = () => {
    const edgesToRemove = getConnectedEdges([node_to_edit], getEdges());
    setNodes((nodes) => nodes.filter((node) => node.id !== node_to_edit.id));
    setEdges((edges) =>
      edges.filter((edge) => !edgesToRemove.map((i) => i.id).includes(edge.id))
    );
    setOpen(false);
  };

  useEffect(() => {
    setValue(node_to_edit.data.value);
    setNodeClass(node_to_edit.className);
  }, [open, node_to_edit]);

  const handleDecline = () => {
    setOpen(false);
  };

  const handleAccept = () => {
    setNodes((nodes) =>
      nodes.map((node: Node) => {
        if (node.id === node_to_edit.id) {
          return {
            ...node,
            className: nodeClass,
            type: nodeClass === "output" ? "output" : "default",
            data: {
              ...node.data,
              value: value,
              label: value,
            },
          };
        }

        return node;
      })
    );
    setOpen(false);
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseFloat(event.target.value));
  };

  const handleNodeClassChange = (
    event: React.SyntheticEvent,
    value: string | null
  ) => {
    setNodeClass(value ?? "");
  };
  return (
    <div>
      <Dialog open={open} onClose={handleDecline}>
        <DialogTitle>{t("Adjust the node")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("Node type")}</DialogContentText>
          <Autocomplete
            id="combobox"
            options={["circle", "square", "output"]}
            defaultValue={node_to_edit.className}
            sx={{ width: 300 }}
            renderInput={(params) => {
              const { InputLabelProps, ...rest } = params; // to remove InputLabelProps
              return <TextField {...rest} label={t("Type")} />;
            }}
            onChange={handleNodeClassChange}
          />

          {node_to_edit && (
            <>
              <DialogContentText>{t("Value of the node")}</DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label={t("Value")}
                defaultValue={node_to_edit.data.value}
                type="number"
                fullWidth
                placeholder={node_to_edit ? node_to_edit.data.label : ""}
                onChange={handleValueChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
          <Tooltip title={t("Remove")}>
            <IconButton onClick={onRemove}>
              <DeleteIcon color="error"></DeleteIcon>
            </IconButton>
          </Tooltip>

          <Box>
            <Button onClick={handleDecline} color="primary">
              {t("Cancel")}
            </Button>
            <Button onClick={handleAccept} color="primary">
              {t("Submit")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ModalForNode;
