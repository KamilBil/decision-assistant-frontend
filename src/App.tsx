import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Navbar from './components/Navbar/Navbar';
import Editor from './components/Editor/Editor';
import { ReactFlowProvider } from 'reactflow';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RequireAuth } from "react-auth-kit";
import SignIn from './components/SignIn/SignIn';
import SignUp from './components/SignUp/SignUp';
import './App.css';
import { Box } from '@mui/material';

function App() {
  const [isNavbarActive, setNavbarIsActive] = useState(true);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <Router>
        <Routes>
          <Route
            path="/editor"
            element={
              <RequireAuth loginPath="/signin">
                <ThemeProvider theme={theme}>
                  {isNavbarActive && (
                    <Navbar />
                  )}
                  <ReactFlowProvider>
                    <Editor isNavbarActive={isNavbarActive} toggleNavbar={setNavbarIsActive} />
                  </ReactFlowProvider>
                </ThemeProvider>
              </RequireAuth>
            }
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </Box >
  );
}

export default App;
