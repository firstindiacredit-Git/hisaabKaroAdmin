import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Box,
  Card,
  Typography,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Breadcrumbs,
  Link,
  CircularProgress,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchUserTransactions();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchUserTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/users/${userId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">User not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/users')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              color="inherit"
              onClick={() => navigate('/users')}
            >
              <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Users
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              {user?.name || 'User Details'}
            </Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      {/* User Info Card */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Chip
                  icon={<CalendarIcon sx={{ fontSize: '1rem !important' }} />}
                  label={`Joined ${formatDate(user?.createdAt)}`}
                  size="small"
                  sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}
                />
                <Chip
                  icon={<BookIcon sx={{ fontSize: '1rem !important' }} />}
                  label={`${transactions.length} Transactions`}
                  size="small"
                  sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Transactions Table */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Transaction History</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            All transactions made by this user
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <BookIcon sx={{ color: theme.palette.primary.main }} />
                        </Avatar>
                        <Typography variant="body2">
                          {transaction.bookId?.bookname || 'Unknown Book'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon sx={{ color: transaction.type === 'you will get' ? 'success.main' : 'error.main' }} />
                        <Typography
                          variant="body2"
                          color={transaction.type === 'you will get' ? 'success.main' : 'error.main'}
                          fontWeight={500}
                        >
                          ₹{transaction.amount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        size="small"
                        sx={{
                          bgcolor: transaction.type === 'you will get'
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.error.main, 0.1),
                          color: transaction.type === 'you will get'
                            ? 'success.main'
                            : 'error.main',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        size="small"
                        sx={{
                          bgcolor: transaction.status === 'confirmed'
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.warning.main, 0.1),
                          color: transaction.status === 'confirmed'
                            ? 'success.main'
                            : 'warning.main',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.createdBy || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.notes || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={transactions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Box>
  );
}

export default UserDetails;
