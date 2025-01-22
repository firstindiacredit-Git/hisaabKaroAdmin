import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  Sort as SortIcon
} from '@mui/icons-material';

function Books() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [bookMemberCounts, setBookMemberCounts] = useState({});
  const [loadingMembers, setLoadingMembers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customPageSize, setCustomPageSize] = useState('');
  const [showCustomPageSize, setShowCustomPageSize] = useState(false);

  const fetchBookMembersCount = async (bookId) => {
    try {
      setLoadingMembers(prev => ({ ...prev, [bookId]: true }));
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/books/${bookId}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.status === "success") {
        setBookMemberCounts(prev => ({
          ...prev,
          [bookId]: response.data.data.membersCount
        }));
      }
    } catch (error) {
      console.error('Error fetching book members count:', error);
    } finally {
      setLoadingMembers(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/books/creator`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setBooks(response.data.data);
        // Fetch members count for each book
        response.data.data.forEach(book => {
          fetchBookMembersCount(book._id);
        });
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDeleteBook = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/admin/books/${selectedBook._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchBooks();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  // Sort books based on selected criteria
  const getSortedBooks = (books) => {
    const sortedBooks = [...books];
    switch (sortBy) {
      case 'newest':
        return sortedBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sortedBooks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'popularity':
        return sortedBooks.sort((a, b) => (bookMemberCounts[b._id] || 0) - (bookMemberCounts[a._id] || 0));
      default:
        return sortedBooks;
    }
  };

  const filteredBooks = getSortedBooks(
    books.filter(book => 
      book.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.bookname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newValue = parseInt(event.target.value, 10);
    if (newValue === -1) {
      setShowCustomPageSize(true);
    } else {
      setRowsPerPage(newValue);
      setPage(0);
      setShowCustomPageSize(false);
    }
  };

  const handleCustomPageSizeChange = (event) => {
    setCustomPageSize(event.target.value);
  };

  const handleCustomPageSizeSubmit = () => {
    const value = parseInt(customPageSize, 10);
    if (!isNaN(value) && value > 0) {
      setRowsPerPage(value);
      setPage(0);
      setShowCustomPageSize(false);
      setCustomPageSize('');
    }
  };

  // Calculate pagination
  const paginatedBooks = filteredBooks.slice(
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Books Management
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon sx={{ color: 'text.secondary', mr: 1 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="popularity">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book Name</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Members</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBooks.map((book) => (
                <TableRow 
                  key={book._id} 
                  hover
                  onClick={() => navigate(`/books/${book._id}`)}
                  sx={{ cursor: 'pointer' }}
                >
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
                    {loadingMembers[book._id] ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {bookMemberCounts[book._id] || 0} members
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => {
                          setSelectedBook(book);
                          setDeleteDialogOpen(true);
                        }}
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
              {paginatedBooks.length === 0 && (
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

        {/* Pagination */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
          <TablePagination
            component="div"
            count={filteredBooks.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100, { value: -1, label: 'Custom' }]}
            sx={{
              '.MuiTablePagination-select': {
                minWidth: '80px'
              }
            }}
          />
          {showCustomPageSize && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <TextField
                size="small"
                type="number"
                placeholder="Enter size"
                value={customPageSize}
                onChange={handleCustomPageSizeChange}
                sx={{ width: 100 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleCustomPageSizeSubmit}
                disabled={!customPageSize || isNaN(parseInt(customPageSize, 10)) || parseInt(customPageSize, 10) <= 0}
              >
                Apply
              </Button>
            </Box>
          )}
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedBook?.name || selectedBook?.bookname}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteBook} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Books;
