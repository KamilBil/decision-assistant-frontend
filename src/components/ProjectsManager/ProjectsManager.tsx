import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText, Button, TextField } from "@mui/material";
import axios from "axios";
import ApiContext from "../../ApiContext";

const ProjectsManager: React.FC = () => {
  const [decisionTrees, setDecisionTrees] = useState<DecisionTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const context = React.useContext(ApiContext);
  const { apiUrl } = context;

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    axios
      .get(apiUrl + "/trees/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setDecisionTrees(response.data.results);
      })
      .catch((error) => {
        console.error("Error during data download:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  type DecisionTree = {
    id: number;
    title: string;
    description: string;
    owner: string;
    data: any;
    createdAt: string;
    updatedAt: string;
  };

  return (
    <List>
      {decisionTrees.map((item, index) => (
        <ListItem key={index}>
          <ListItemText primary={item.title} />
        </ListItem>
      ))}
    </List>
  );
};

export default ProjectsManager;
