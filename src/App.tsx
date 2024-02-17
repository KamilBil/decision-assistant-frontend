import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Navbar from "./components/Navbar/Navbar";
import Editor from "./components/Editor/Editor";
import { ReactFlowProvider } from "reactflow";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";
import SignIn from "./components/SignIn/SignIn";
import SignUp from "./components/SignUp/SignUp";
import "./App.css";
import { Box } from "@mui/material";
import ProjectsManager from "./components/ProjectsManager/ProjectsManager";

function App() {
  const [isNavbarActive, setIsNavbarActive] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
        <Route index element={<Navigate to="/projects" />} />
          <Route path="/projects" element={
            <RequireAuth loginPath="/signin">
               <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100vw",
                    height: "100vh",
                  }}
                >
                  {isNavbarActive && <Navbar />}
                  <ReactFlowProvider>
                    <ProjectsManager/>
                  </ReactFlowProvider>
                </Box>
            </RequireAuth>
          }/>

          <Route
            path="/editor"
            element={
              <RequireAuth loginPath="/signin">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100vw",
                    height: "100vh",
                  }}
                >
                  {isNavbarActive && <Navbar />}
                  <ReactFlowProvider>
                    <Editor
                      isNavbarActive={isNavbarActive}
                      setIsNavbarActive={setIsNavbarActive}
                    />
                  </ReactFlowProvider>
                </Box>
              </RequireAuth>
            }
          />

          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
