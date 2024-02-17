import { useContext, useState } from "react";
import ApiContext from "../ApiContext";
import { useAuthHeader } from "react-auth-kit";
import axios from "axios";

function useDecisionTreesApi() {
  const [decisionTrees, setDecisionTrees] = useState<DecisionTree[]>([]);
  const [selectedDecisionTree, setSelectedDecisionTree] =
    useState<DecisionTree>();
  const [isLoading, setIsLoading] = useState(true);
  const context = useContext(ApiContext);
  const { apiUrl } = context;
  const [error, setError] = useState(null);
  const authHeader = useAuthHeader();

  type DecisionTree = {
    id: number;
    title: string;
    description: string;
    owner: string;
    data: any;
    createdAt: string;
    updatedAt: string;
  };

  const fetchTrees = () => {
    setIsLoading(true);
    const token = authHeader();
    axios
      .get(apiUrl + "/trees/", {
        headers: {
          Authorization: token,
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
  };

  const deleteTree = (id: number) => {
    const token = authHeader();
    axios
      .delete(apiUrl + "/trees/" + id + "/", {
        headers: {
          Authorization: token,
        },
      })
      .then(() => {
        setDecisionTrees(decisionTrees.filter((tree) => tree.id !== id));
      })
      .catch((error) => console.error("Error during removing a tree: ", error));
  };

  const createTree = (title: string, description: string, data: object) => {
    const token = authHeader();
    axios
      .post(
        apiUrl + "/trees/",
        {
          title: title,
          description: description,
          data: data,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((response) => {
        setDecisionTrees([...decisionTrees, response.data]);
      })
      .catch((error) =>
        console.error("Error during creating a new tree: ", error)
      );
  };

  const fetchTreeById = async (treeId: number) => {
    const token = authHeader();
    console.log("tree id: ", treeId);
    try {
      const response = await axios.get(apiUrl + "/trees/" + treeId, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error during fetching a tree: ", error);
      throw error;
    }
  };

  const editTree = (id: number, updatedTree: object) => {
    const token = authHeader();
    axios
      .put(apiUrl + "/trees/" + id + "/", updatedTree, {
        headers: {
          Authorization: token,
        },
      })
      .then(() => {
        setDecisionTrees(
          decisionTrees.map((tree) =>
            tree.id === id ? { ...tree, ...updatedTree } : tree
          )
        );
      })
      .catch((error) => console.error("Error during updating a tree: ", error));
  };

  return {
    decisionTrees,
    selectedDecisionTree,
    isLoading,
    error,
    fetchTrees,
    createTree,
    deleteTree,
    editTree,
    fetchTreeById,
  };
}

export default useDecisionTreesApi;