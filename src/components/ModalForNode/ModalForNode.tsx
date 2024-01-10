
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Node } from 'reactflow';
import { useTranslation } from 'react-i18next';

interface ModalForNodeProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    node_to_edit: Node;
    nds: Node[];
    setNodes: (edges: Node[]) => void;
}

function ModalForNode({ open, setOpen, node_to_edit, nds, setNodes }: ModalForNodeProps) {
    const [value, setValue] = useState(1);
    const [nodeClass, setNodeClass] = useState("");
    const { t } = useTranslation();

    const handleDecline = () => {
        setOpen(false);
    };

    const handleAccept = () => {
        const newNodes = nds.map((node: Node) => {
            if (node.id === node_to_edit.id) {
                // it's important tp create a new object here
                // in order to notify react flow about the change
                return {
                    ...node,
                    className: nodeClass,
                    type: nodeClass === "output" ? "output" : "default",
                    data: {
                        ...node.data,
                        value: value,
                        label: value,
                    }
                };
            }

            return node;
        });
        setNodes(newNodes);
        setOpen(false);
    };

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(parseFloat(event.target.value));
    };

    const handleNodeClassChange = (event: React.SyntheticEvent, value: string | null) => {
        setNodeClass(value ?? "");
    };
    return (
        <div>
            <Dialog open={open} onClose={handleDecline}>
                <DialogTitle>{t('Adjust the node')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('Node type')}:
                    </DialogContentText>
                    <Autocomplete
                        id="combobox"
                        options={["circle", "square", "output"]}
                        defaultValue={node_to_edit.className}
                        sx={{ width: 300 }}
                        renderInput={(params) => {
                            const { InputLabelProps, ...rest } = params; // to remove InputLabelProps
                            return (
                                <TextField 
                                    {...rest}
                                    label={t("Type")}
                                />
                            );
                        }}
                        onChange={handleNodeClassChange}
                    />

                    {node_to_edit && (
                        <>
                            <DialogContentText>
                                {t('Value of the node')}
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label={t("Value")}
                                value={node_to_edit.data.value}
                                type="number"
                                fullWidth
                                placeholder={node_to_edit ? node_to_edit.data.label : ""}
                                onChange={handleValueChange}
                            />
                        </>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDecline} color="primary">
                        {t('Cancel')}
                    </Button>
                    <Button onClick={handleAccept} color="primary">
                        {t('Submit')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ModalForNode;