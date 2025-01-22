import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Box,
  Typography,
  Card,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Breadcrumbs,
  Link,
  Grid,
  useTheme,
  alpha,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Book as BookIcon,
  Person as PersonIcon,
  AccountBalanceWallet as WalletIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [bookDetails, setBookDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Fetch book transactions and members
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/admin/books/${bookId}/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === "success") {
        setBookDetails(response.data.data);
        setMembers(response.data.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const formatDate = (date) => {
    if (!date) return 'Date not available';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const sortedMembers = [...members].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const paginatedMembers = sortedMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/books')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs>
            <Link
              component="button"
              variant="button"
              onClick={() => navigate('/books')}
              sx={{ color: 'text.secondary', textDecoration: 'none' }}
            >
              Books
            </Link>
            <Typography color="text.primary" variant="body1">
              {bookDetails?.bookName}
            </Typography>
          </Breadcrumbs>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Book Details
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                <BookIcon />
              </Avatar>
            </Box>
            <Typography variant="h6" gutterBottom>
              {bookDetails?.bookName}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {bookDetails?.createdAt ? 
                `Created on ${format(new Date(bookDetails.createdAt), 'MMM dd, yyyy')}` :
                'Creation date not available'
              }
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                <PersonIcon />
              </Avatar>
            </Box>
            <Typography variant="h6" gutterBottom>
              {members.length} Members
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Active members in this book
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Members List */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Members
            </Typography>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortOrder}
                label="Sort by"
                onChange={handleSortChange}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Outstanding Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMembers.map((member, index) => (
                <TableRow key={member.email} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {member.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{member.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Joined {formatDate(member.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{member.email || 'No email'}</TableCell>
                  <TableCell>{member.mobile || 'No phone'}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        color: member.outstandingBalance > 0 ? 'success.main' : 'error.main',
                        fontWeight: 600
                      }}
                    >
                      ₹{Math.abs(member.outstandingBalance || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No members found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={members.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}

export default BookDetails;
