import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  useTheme,
  Fade
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const ResponseModal = ({ open, onClose, success, message }) => {
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 900); // 0.9 seconds
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 2,
          position: 'relative'
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'grey.500'
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        {success ? 'Success!' : 'Oops!'}
      </DialogTitle>
      
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pb: 3
          }}
        >
          <Fade in={open} timeout={300}>
            <Box sx={{ textAlign: 'center' }}>
              {success ? (
                <CheckCircleIcon
                  sx={{
                    fontSize: 68,
                    color: theme.palette.success.main,
                    mb: 2
                  }}
                />
              ) : (
                <ErrorIcon
                  sx={{
                    fontSize: 68,
                    color: theme.palette.error.main,
                    mb: 2
                  }}
                />
              )}
              
              <Typography
                variant="body1"
                textAlign="center"
                color={success ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 500 }}
              >
                {message}
              </Typography>
            </Box>
          </Fade>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseModal;
