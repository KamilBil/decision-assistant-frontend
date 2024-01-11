import React from "react";
import ApiContext from "../../ApiContext";

interface ApiProviderProps {
  children: React.ReactNode;
}

const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const apiUrl = process.env.REACT_APP_API_URL as string;

  return (
    <ApiContext.Provider value={{ apiUrl }}>{children}</ApiContext.Provider>
  );
};

export default ApiProvider;
