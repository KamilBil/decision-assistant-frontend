import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import { Box, Snackbar, Alert } from "@mui/material";

type DecisionTree = {
  id: number;
  title: string;
  description: string;
  owner: string;
  data: any;
  createdAt: string;
  updatedAt: string;
};

interface EditTreeModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editTree: (id: number, updatedTree: object) => void;
  treeToEdit: DecisionTree;
}

function EditTreeModal({
  open,
  setOpen,
  editTree,
  treeToEdit,
}: EditTreeModalProps) {
  const [title, setTitle] = useState(treeToEdit.title);
  const [description, setDescription] = useState(treeToEdit.description);
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  const handleDecline = () => {
    setOpen(false);
    setError(false);
  };

  const handleAccept = () => {
    if (!title.trim() || !description.trim()) {
      setError(true);
      return;
    }
    const data = treeToEdit.data;
    editTree(treeToEdit.id, { title, description, data });
    setOpen(false);
    setError(false);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleDecline}>
        <DialogTitle>{t("Edit a project")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("Title")}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t("Title")}
            defaultValue={title}
            type="text"
            fullWidth
            placeholder=""
            onChange={handleTitleChange}
          />

          <DialogContentText>{t("Description")}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t("Description")}
            defaultValue={description}
            type="text"
            fullWidth
            placeholder=""
            onChange={handleDescriptionChange}
          />
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
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
      <Snackbar
        open={error}
        autoHideDuration={6000}
        onClose={() => setError(false)}
      >
        <Alert
          onClose={() => setError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {t("Both title and description are required.")}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default EditTreeModal;
