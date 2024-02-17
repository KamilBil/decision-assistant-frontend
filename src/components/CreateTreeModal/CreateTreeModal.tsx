import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

interface CreateTreeModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  createTree: (title: string, description: string, data: object) => void;
}

function CreateTreeModal({ open, setOpen, createTree }: CreateTreeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { t } = useTranslation();

  const handleDecline = () => {
    setOpen(false);
  };

  const handleAccept = () => {
    createTree(title, description, {});
    setOpen(false);
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
        <DialogTitle>{t("Create a project")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("Title")}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t("Title")}
            defaultValue=""
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
            defaultValue=""
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
    </div>
  );
}

export default CreateTreeModal;
