import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ResponseModal from '../common/ResponseModal';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    success: false,
    message: ''
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalConfig.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Attempting login...');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/login`, formData);
      console.log('Login response:', response.data);
      
      if (response.data.status === 'success') {
        console.log('Login successful, setting token...');
        authLogin(response.data.token);
        setModalConfig({
          success: true,
          message: 'Login successful! Redirecting...'
        });
        setModalOpen(true);
        setTimeout(() => {
          setModalOpen(false);
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setModalConfig({
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      });
      setModalOpen(true);
      setError(error.response?.data?.message || 'An error occurred during login');
      setTimeout(() => {
        setModalOpen(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          padding: 2
        }}
      >
        <Container maxWidth="xs">
          <Card
            elevation={8}
            sx={{
              borderRadius: 2,
              backgroundColor: 'white',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                py: 3,
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom>
                Admin Login
              </Typography>
              <Typography variant="body2">
                Welcome back! Please login to your account.
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <ResponseModal
        open={modalOpen}
        onClose={handleModalClose}
        success={modalConfig.success}
        message={modalConfig.message}
      />
    </>
  );
};

export default Login;
