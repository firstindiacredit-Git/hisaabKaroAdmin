import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResponseModal from './common/ResponseModal';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Button,
  Avatar,
  Tooltip,
  Container,
  CssBaseline,
  Fade,
  Zoom,
  alpha,
  Badge,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  AccountBalanceWallet as WalletIcon,
  ExitToApp as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Book as BookIcon
} from '@mui/icons-material';

const drawerWidth = 280;

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const theme = useTheme();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Books', icon: <BookIcon />, path: '/books' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  ];

  const handleLogout = async () => {
    try {
      setModalOpen(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      logout();
      await new Promise(resolve => setTimeout(resolve, 900));
      setModalOpen(false);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    navigate('/login', { replace: true });
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <>
      <Zoom in={true} style={{ transitionDelay: '100ms' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing(3, 2),
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.1)})`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
              }}
            >
              H
            </Avatar>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px'
              }}
            >
              HisaabKaro
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setIsSidebarOpen(false)} 
            sx={{ 
              display: { lg: 'none' },
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      </Zoom>
      
      <Divider sx={{ mx: 2, my: 2 }} />
      
      <Box sx={{ px: 2, mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            background: alpha(theme.palette.primary.main, 0.03),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main
              }}
            >
              A
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Admin User
              </Typography>
              <Typography variant="body2" color="text.secondary">
                admin@hisaabkaro.com
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <List sx={{ px: 2 }}>
        {menuItems.map((item, index) => (
          <Fade in={true} style={{ transitionDelay: `${150 + index * 50}ms` }} key={item.text}>
            <ListItem
              button
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                backgroundColor: isActivePath(item.path) 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                color: isActivePath(item.path) 
                  ? theme.palette.primary.main 
                  : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: isActivePath(item.path) 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.05),
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isActivePath(item.path) 
                    ? theme.palette.primary.main 
                    : theme.palette.text.secondary,
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActivePath(item.path) ? 600 : 500,
                  fontSize: '0.95rem'
                }}
              />
              {isActivePath(item.path) && (
                <Box
                  sx={{
                    width: 4,
                    height: 35,
                    borderRadius: 4,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    ml: 2,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`
                  }}
                />
              )}
            </ListItem>
          </Fade>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 3 }}>
        <Divider sx={{ mb: 3 }} />
        <Fade in={true} style={{ transitionDelay: '400ms' }}>
          <Button
            onClick={handleLogout}
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<LogoutIcon />}
            sx={{
              py: 1.2,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              }
            }}
          >
            Logout
          </Button>
        </Fade>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <CssBaseline />
      
      <Box sx={{ position: 'fixed', top: 16, left: 16, display: { lg: 'none' } }}>
        <IconButton
          onClick={() => setIsSidebarOpen(true)}
          sx={{ 
            bgcolor: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            '&:hover': {
              bgcolor: 'white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      
      <Box
        component="nav"
        sx={{
          width: { lg: drawerWidth },
          flexShrink: { lg: 0 }
        }}
      >
        <Drawer
          variant="temporary"
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.primary.light, 0.02)})`
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            height: '100%',
            '& > *': {
              animation: 'fadeIn 0.5s ease-out',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(10px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }
          }}
        >
          {children}
        </Container>
      </Box>

      <ResponseModal
        open={modalOpen}
        onClose={handleModalClose}
        message="Logging out..."
        severity="info"
      />
    </Box>
  );
}

export default Layout;
