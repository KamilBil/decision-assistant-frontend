import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Edge, useReactFlow } from "reactflow";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Tooltip } from "@mui/material";

interface ModalForEdgeProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  edge_to_edit: Edge;
}

function ModalForEdge({ open, setOpen, edge_to_edit }: ModalForEdgeProps) {
  const { setEdges } = useReactFlow();
  const [value, setValue] = useState(edge_to_edit.data.value);
  const [description, setDescription] = useState(edge_to_edit.data.description);
  const { t } = useTranslation();

  const onRemove = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== edge_to_edit.id));
    setOpen(false);
  };

  useEffect(() => {
    setValue(edge_to_edit.data.value);
    setDescription(edge_to_edit.data.description);
  }, [open, edge_to_edit]);

  const handleDecline = () => {
    setOpen(false);
  };

  const handleAccept = () => {
    setEdges((edges) =>
      edges.map((edge: Edge) => {
        if (edge.id === edge_to_edit.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              value: value,
              description: description,
            },
          };
        }

        return edge;
      })
    );
    setOpen(false);
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseFloat(event.target.value));
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleDecline}>
        <DialogTitle>{t("Adjust the edge")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("Value of the edge")}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t("Value")}
            defaultValue={edge_to_edit.data.value}
            type="number"
            fullWidth
            placeholder={edge_to_edit ? edge_to_edit.data.label : ""}
            onChange={handleValueChange}
          />

          <DialogContentText>{t("Description of the edge")}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t("Description")}
            defaultValue={edge_to_edit.data.description}
            type="text"
            fullWidth
            placeholder={edge_to_edit ? edge_to_edit.data.label : ""}
            onChange={handleDescriptionChange}
          />
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

export default ModalForEdge;
