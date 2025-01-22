import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  Avatar,
  Fade,
  Grow,
  IconButton,
  Tooltip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  MenuBook as BookIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  BarElement,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalTransactions: 0,
    totalAmount: 0,
    monthlyStats: {
      users: Array(12).fill(0),
      books: Array(12).fill(0),
      transactions: Array(12).fill(0)
    }
  });
  const [books, setBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(error.response?.data?.message || 'Error loading dashboard data');
      }
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/books/creator`);
      console.log('Books response:', response.data);
      if (response.data.success) {
        setBooks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchBooks()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`/api/admin/books/${bookId}`);
      fetchBooks(); // Refresh books after deletion
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTrend = (data) => {
    if (!Array.isArray(data) || data.length < 2) return { value: 0, isPositive: true };
    
    const lastTwo = data.slice(-2);
    if (lastTwo[0] === 0) return { value: 0, isPositive: true };
    
    const trend = ((lastTwo[1] - lastTwo[0]) / Math.max(1, lastTwo[0])) * 100;
    return {
      value: isNaN(trend) ? 0 : Math.abs(trend).toFixed(1),
      isPositive: trend >= 0
    };
  };

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers.toLocaleString(),
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      trend: calculateTrend(dashboardData.monthlyStats?.users || [])
    },
    {
      title: 'Active Books',
      value: dashboardData.totalBooks.toLocaleString(),
      icon: <BookIcon />,
      color: theme.palette.success.main,
      trend: calculateTrend(dashboardData.monthlyStats?.books || [])
    },
    {
      title: 'Total Transactions',
      value: dashboardData.totalTransactions.toLocaleString(),
      icon: <WalletIcon />,
      color: theme.palette.warning.main,
      trend: calculateTrend(dashboardData.monthlyStats?.transactions || [])
    },
    {
      title: 'Total Amount',
      value: formatCurrency(dashboardData.totalAmount),
      icon: <TrendingUpIcon />,
      color: theme.palette.info.main,
      trend: null 
    }
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: 'New Users',
        data: dashboardData.monthlyStats?.users || Array(12).fill(0),
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2
      }
    ]
  };

  const barChartData = {
    labels: months,
    datasets: [
      {
        label: 'Books Created',
        data: dashboardData.monthlyStats?.books || Array(12).fill(0),
        backgroundColor: alpha(theme.palette.success.main, 0.8),
        borderRadius: 4,
        maxBarThickness: 32
      },
      {
        label: 'Transactions',
        data: dashboardData.monthlyStats?.transactions || Array(12).fill(0),
        backgroundColor: alpha(theme.palette.warning.main, 0.8),
        borderRadius: 4,
        maxBarThickness: 32
      }
    ]
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        {error.includes('login') && (
          <Typography variant="body2" color="text.secondary">
            You will be redirected to the login page shortly...
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Welcome Section */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between" sx={{ px: 3, pt: 3 }}>
        <Fade in timeout={800}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Welcome back, Admin
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your platform today.
            </Typography>
          </Box>
        </Fade>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={fetchDashboardData} 
            disabled={refreshing}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[2],
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        px: 3, 
        pb: 3 
      }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in timeout={600 + index * 200}>
                <Card 
                  elevation={0}
                  sx={{ 
                    bgcolor: 'background.paper',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-4px)',
                      borderColor: stat.color
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(stat.color, 0.1),
                          color: stat.color,
                          width: 52,
                          height: 52
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      {stat.trend && stat.trend.value > 0 && (
                        <Box 
                          ml="auto" 
                          display="flex" 
                          alignItems="center"
                          sx={{ 
                            color: stat.trend.isPositive ? 'success.main' : 'error.main',
                            bgcolor: stat.trend.isPositive ? 'success.lighter' : 'error.lighter',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1
                          }}
                        >
                          {stat.trend.isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                          <Typography variant="caption" fontWeight="medium" ml={0.5}>
                            {stat.trend.value}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="h4" fontWeight={600} gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Books Table */}
        {/* <Card
          elevation={0}
          sx={{
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            '&:hover': {
              boxShadow: (theme) => theme.shadows[4]
            }
          }}
        >
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book Name</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <BookIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{book.name || book.bookname}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {book.creator?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{book.creator?.name || 'Unknown'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {book.creator?.email || 'No email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(book.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(book.createdAt), 'hh:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.status || 'Active'}
                        size="small"
                        color="success"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete Book">
                        <IconButton 
                          onClick={() => handleDeleteBook(book._id)}
                          sx={{ 
                            '&:hover': { 
                              color: 'error.main',
                              bgcolor: 'error.lighter'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {books.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No books found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card> */}

        {/* Popular Books Section */}
        <Fade in timeout={1400}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              mb: 4
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600}>
                Popular Books
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Top 5 books by member count
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>#</TableCell>
                    <TableCell>Book Name</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Members</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books.slice(0, 5).map((book, index) => (
                    <TableRow 
                      key={book._id} 
                      hover
                      onClick={() => navigate(`/books/${book._id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <BookIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{book.name || book.bookname}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {book.creator?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{book.creator?.name || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {book.creator?.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(book.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(book.createdAt), 'hh:mm a')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {book.membersCount || 0} members
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {books.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No books found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>

        {/* Charts */}
        <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 400 }}>
          {/* User Growth Chart */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  minHeight: 400,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  User Growth
                </Typography>
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                  <Line options={chartOptions} data={lineChartData} />
                </Box>
              </Card>
            </Fade>
          </Grid>

          {/* Books & Transactions Chart */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1200}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  minHeight: 400,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    borderColor: theme.palette.success.main
                  }
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Books & Transactions
                </Typography>
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                  <Bar options={chartOptions} data={barChartData} />
                </Box>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
