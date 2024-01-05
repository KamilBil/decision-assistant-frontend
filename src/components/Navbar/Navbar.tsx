import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useSignOut } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const { t } = useTranslation();

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Decission Assistant
        </Typography>
        <Button color="inherit" onClick={() => navigate("/projects")}>
          {t("Projects")}
        </Button>
        <Button color="inherit">{t("Settings")}</Button>
        <Button color="inherit">{t("Contact")}</Button>
        <Button color="inherit">{t("Account")}</Button>
        <Button color="inherit" onClick={handleSignOut}>
          {t("Logout")}
        </Button>
        <LanguageSwitcher />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
