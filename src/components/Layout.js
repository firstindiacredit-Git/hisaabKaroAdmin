import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResponseModal from './common/ResponseModal';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
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
  CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  AccountBalanceWallet as WalletIcon,
  ExitToApp as LogoutIcon,
  ChevronLeft as ChevronLeftIcon
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
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Books', icon: <MenuBookIcon />, path: '/books' },
    { text: 'Transactions', icon: <WalletIcon />, path: '/transactions' },
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme.spacing(2),
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          HisaabKaro
        </Typography>
        <IconButton onClick={() => setIsSidebarOpen(false)} sx={{ display: { lg: 'none' } }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setIsSidebarOpen(false);
            }}
            sx={{
              mb: 1,
              mx: 1,
              borderRadius: 1,
              backgroundColor: isActivePath(item.path) ? theme.palette.primary.light : 'transparent',
              color: isActivePath(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: isActivePath(item.path) 
                  ? theme.palette.primary.light 
                  : theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: isActivePath(item.path) ? theme.palette.primary.main : theme.palette.text.primary 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: isActivePath(item.path) ? 600 : 400 
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          onClick={handleLogout}
          fullWidth
          variant="outlined"
          color="primary"
          startIcon={<LogoutIcon />}
          sx={{
            justifyContent: 'flex-start',
            px: 2,
            py: 1
          }}
        >
          Logout
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'white',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setIsSidebarOpen(true)}
            sx={{ mr: 2, display: { lg: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Admin">
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40
              }}
            >
              A
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { lg: drawerWidth },
          flexShrink: { lg: 0 }
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ModalProps={{
            keepMounted: true // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              backgroundImage: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              border: 'none',
              boxShadow: theme.shadows[1]
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
          height: '100vh',
          overflow: 'auto',
          backgroundColor: '#f5f7fb',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar /> {/* Spacing for AppBar */}
        <Container 
          maxWidth="xl" 
          sx={{ 
            flexGrow: 1,
            py: 4,
            px: { xs: 2, sm: 4 },
            overflowY: 'auto'
          }}
        >
          {children}
        </Container>
      </Box>

      <ResponseModal
        open={modalOpen}
        onClose={handleModalClose}
        success={true}
        message="Logging out... Please wait"
      />
    </Box>
  );
}

export default Layout;
