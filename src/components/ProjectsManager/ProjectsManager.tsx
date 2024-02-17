import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CreateTreeModal from "../CreateTreeModal/CreateTreeModal";
import { useTranslation } from "react-i18next";
import useDecisionTreesApi from "../../hooks/useDecisionTreesApi";
import { useNavigate } from "react-router-dom";

const ProjectsManager: React.FC = () => {
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
  const [isOpenCreateTreeModal, setIsOpenCreateTreeModal] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrees();
  }, []);

  const handleBuildTree = (id: number) => {
    navigate("/editor", { state: { id } });
  };

  return (
    <Box m={2}>
      {isOpenCreateTreeModal && (
        <CreateTreeModal
          open={isOpenCreateTreeModal}
          setOpen={setIsOpenCreateTreeModal}
          createTree={createTree}
        />
      )}
      <Typography variant="h6" textAlign="center"></Typography>
      <TableContainer component={Paper} color="red">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("Name")}</TableCell>
              <TableCell>{t("Description")}</TableCell>
              <TableCell>{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {decisionTrees.map((tree) => (
              <TableRow key={tree.id}>
                <TableCell>{tree.title}</TableCell>
                <TableCell>{tree.description}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    variant="outlined"
                    style={{ margin: "2px" }}
                    onClick={() => {
                      handleBuildTree(tree.id);
                    }}
                  >
                    {t("Build")}
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    style={{ margin: "2px" }}
                    onClick={() => deleteTree(tree.id)}
                  >
                    {t("Delete")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Button
          color="secondary"
          variant="outlined"
          style={{ marginTop: "1rem" }}
          onClick={() => {
            setIsOpenCreateTreeModal(true);
          }}
        >
          {t("Create a project")}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectsManager;
