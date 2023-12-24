import { useSignIn } from "react-auth-kit";
import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Button, Box, TextField, Grid, Link, Paper, Typography, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';


const SignIn = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const signIn = useSignIn();
  const apiUrl = process.env.REACT_APP_API_URL;

  const onSubmit = async (values: { username: string; password: string; }) => {
    setError("");

    try {
      const response = await axios.post(
        apiUrl + "/token/",
        values
      );

      signIn({
        token: response.data.access,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: { username: values.username },
      });

      navigate('/editor');
    } catch (err) {
      if (err && err instanceof AxiosError)
        setError(err.response?.data.message);
      else if (err && err instanceof Error) setError(err.message);

      console.log("Error: ", err);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit,
  });

  return (
    <Box height="100vh">
      <Box display="flex" justifyContent="flex-end" p={2}>
        <LanguageSwitcher />
      </Box>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
          </Box>
          <form onSubmit={formik.handleSubmit}>
            <Typography variant="h5" align="center">{t('Sign in')}</Typography>
            <TextField
              variant="outlined"
              margin="normal"
              name="username"
              required
              fullWidth
              value={formik.values.username}
              onChange={formik.handleChange}
              placeholder='Login'
              type="text"
            />
            <TextField
              name="password"
              margin="normal"
              required
              fullWidth
              value={formik.values.password}
              onChange={formik.handleChange}
              placeholder={t("Password")}
              type="password"
            />
            <Button type="submit" fullWidth color="primary" variant="contained" style={{ marginTop: '10px', marginBottom: '10px' }}>
              {t("Sign in")}
            </Button>
          </form >
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                {t("Forgot password?")}
              </Link>
            </Grid>
            <Grid item>
              <Link href="SignUp" variant="body2">
                {t("Don't have an account? Sign up.")}
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box >
  );
};

export default SignIn;