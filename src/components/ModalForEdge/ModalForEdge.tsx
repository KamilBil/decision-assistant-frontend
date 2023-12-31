
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Edge } from 'reactflow';import { useTranslation } from 'react-i18next';


interface ModalForEdgeProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    edge_to_edit: Edge;
    edges: Edge[];
    setEdges: (edges: Edge[]) => void;
}

function ModalForEdge({ open, setOpen, edge_to_edit, edges, setEdges }: ModalForEdgeProps) {
    const [value, setValue] = useState(1);
    const [description, setDescription] = useState("");
    const { t } = useTranslation();

    const handleDecline = () => {
        setOpen(false);
    };

    const handleAccept = () => {
        const newEdges = edges.map((edge: Edge) => {
            if (edge.id === edge_to_edit.id) {
                // it's important tp create a new object here
                // in order to notify react flow about the change
                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        value: value,
                        description: description,
                    }
                };
            }
    
            return edge;
        });
    
        setEdges(newEdges);
        setOpen(false);
    };
    

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(parseFloat(event.target.value));
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    }

    return (
        <div>
            <Dialog open={open} onClose={handleDecline}>
                <DialogTitle>{t('Adjust the edge')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('Value of the edge')}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t("Value")}
                        type="number"
                        fullWidth
                        placeholder={edge_to_edit ? edge_to_edit.data.label : ""}
                        onChange={handleValueChange}
                    />

                    <DialogContentText>
                        {t("Insert description")}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t("Description")}
                        type="text"
                        fullWidth
                        placeholder={edge_to_edit ? edge_to_edit.data.label : ""}
                        onChange={handleDescriptionChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDecline} color="primary">
                        {t("Cancel")}
                    </Button>
                    <Button onClick={handleAccept} color="primary">
                        {t("Submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ModalForEdge;