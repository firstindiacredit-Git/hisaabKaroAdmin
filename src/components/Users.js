import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Users.css';

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 0 * 60 * 1000;
const CACHE_KEY = 'admin_users_cache';
const VIEW_MODE_KEY = 'admin_users_view_mode';

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'recent'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    // Initialize view mode from localStorage
    return localStorage.getItem(VIEW_MODE_KEY) || 'list';
  });
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [customPageSize, setCustomPageSize] = useState('');
  const [showCustomPageSize, setShowCustomPageSize] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const getCachedData = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;

    const { data, timestamp } = JSON.parse(cachedData);
    const now = new Date().getTime();

    // Check if cache is expired
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  };

  const setCacheData = (data) => {
    const cacheData = {
      data,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedUsers = getCachedData();
      if (cachedUsers) {
        setUsers(cachedUsers);
        setLoading(false);
        return;
      }

      // If no cache or expired, fetch from API
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/users`);
      if (response.data.success) {
        const usersList = response.data.data.users || [];
        const validUsers = Array.isArray(usersList) ? usersList : [];
        setUsers(validUsers);
        // Cache the fetched data
        setCacheData(validUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Show feedback modal
  const showFeedback = (type, message) => {
    setFeedbackModal({ show: true, type, message });
    // Don't auto-hide for error messages
    if (type === 'success') {
      setTimeout(() => {
        setFeedbackModal({ show: false, type: '', message: '' });
      }, 2000);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setIsDeleting(true);
      setDeleteUserId(userId);
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/admin/users/${userId}`);
      
      // Close delete confirmation modal
      setDeleteModalOpen(false);
      setUserToDelete(null);
      
      // Show success feedback
      showFeedback('success', `${userToDelete.name}'s account has been successfully deleted`);
      
      // Update the users list
      const updatedUsers = users.filter(user => user._id !== userId);
      setUsers(updatedUsers);
      setCacheData(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
      showFeedback('error', error.response?.data?.message || 'Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteUserId(null);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete._id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    
    // For Google profile pictures or other external URLs, return as is
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    
    // For local uploads (if any in the future)
    const cleanPath = profilePicture.startsWith('/') ? profilePicture.slice(1) : profilePicture;
    const baseUrl = process.env.REACT_APP_API_URL;
    return `${baseUrl}/${cleanPath}`;
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getRandomColor = (name) => {
    const colors = [
      'bg-pink-500',
      'bg-purple-500',
      'bg-indigo-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-gray-500'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  const ProfileImage = ({ user, size = 'large' }) => {
    const hasError = imageLoadErrors[user._id];
    const profileUrl = getProfilePictureUrl(user.profilePicture);
    
    const sizeClasses = {
      large: 'h-24 w-24 text-2xl',
      small: 'h-10 w-10 text-sm'
    };
    
    const baseClasses = 'rounded-full flex items-center justify-center';
    const sizeClass = sizeClasses[size];
    const ringClass = size === 'large' ? 'ring-[5px] ring-white/90 group-hover:ring-white/70' : 'ring-2 ring-white/80';
    const shadowClass = size === 'large' ? 'shadow-[0_4px_15px_rgb(0,0,0,0.05)]' : 'shadow-sm';

    // Show initials if no profile URL or if there was an error loading the image
    if (!profileUrl || hasError) {
      return (
        <div className={`${baseClasses} ${sizeClass} ${shadowClass} text-white font-medium bg-gradient-to-br ${getRandomColor(user.name)}`}>
          {getInitials(user.name)}
        </div>
      );
    }

    // If we have a valid URL, show the image
    return (
      <img
        className={`${baseClasses} ${sizeClass} ${ringClass} ${shadowClass} object-cover transition-all duration-300`}
        src={profileUrl}
        alt={`${user.name}'s profile`}
        onError={() => {
          console.log('Image failed to load:', profileUrl);
          setImageLoadErrors(prev => ({ ...prev, [user._id]: true }));
        }}
        referrerPolicy="no-referrer" // Add this for Google profile pictures
      />
    );
  };

  // Filter users based on search query
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.toLowerCase().includes(query))
    );
  }) : [];

  // Calculate pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalUsers);
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Handle page size change
  const handlePageSizeChange = (size) => {
    if (size === 'custom') {
      setShowCustomPageSize(true);
    } else {
      setPageSize(size);
      setCurrentPage(1);
      setShowCustomPageSize(false);
    }
  };

  // Handle custom page size input
  const handleCustomPageSize = (e) => {
    const value = e.target.value;
    setCustomPageSize(value);
    if (value && !isNaN(value) && parseInt(value) > 0) {
      setPageSize(parseInt(value));
      setCurrentPage(1);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-sm text-gray-700">
          A list of all users in your account including their name, email, and status.
        </p>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'recent'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Recent
              </button>
            </div>

            {/* View Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center"
            >
              {viewMode === 'list' ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid View
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List View
                </>
              )}
            </button>
          </div>
          <div className="relative">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or mobile number..."
                  className="w-full pl-10 pr-12 py-2 bg-white border border-gray-200 rounded-lg outline-none transition-all duration-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Results Count */}
              {searchQuery && (
                <div className="mt-2 text-sm text-gray-500">
                  Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                  {searchQuery && ' matching "' + searchQuery + '"'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <div className="relative">
            <select
              value={showCustomPageSize ? 'custom' : pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value === 'custom' ? 'custom' : parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {showCustomPageSize && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customPageSize}
                onChange={handleCustomPageSize}
                placeholder="Enter size"
                min="1"
                className="block w-24 rounded-md border-gray-300 pl-3 pr-3 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}
          <span className="text-sm text-gray-600">entries</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <p className="text-sm text-gray-700">
            {totalUsers === 0 ? (
              'No users found'
            ) : (
              <>
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalUsers}</span> users
              </>
            )}
          </p>
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || totalUsers === 0}
              className={`p-2 rounded-md ${
                currentPage === 1 || totalUsers === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || totalUsers === 0}
              className={`p-2 rounded-md ${
                currentPage === 1 || totalUsers === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first page, last page, current page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={totalUsers === 0}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : totalUsers === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === currentPage - 2 && page > 1) ||
                (page === currentPage + 2 && page < totalPages)
              ) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }
              return null;
            })}

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalUsers === 0}
              className={`p-2 rounded-md ${
                currentPage === totalPages || totalUsers === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalUsers === 0}
              className={`p-2 rounded-md ${
                currentPage === totalPages || totalUsers === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setDeleteModalOpen(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Delete User Account
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {userToDelete?.name}'s account? This action will also delete all their books and transactions. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                    isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'
                  }`}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Account'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                 onClick={() => feedbackModal.type === 'error' && setFeedbackModal({ show: false, type: '', message: '' })} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                  feedbackModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {feedbackModal.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    {feedbackModal.type === 'success' ? 'Success!' : 'Error'}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {feedbackModal.message}
                    </p>
                  </div>
                </div>
              </div>
              {feedbackModal.type === 'error' && (
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    onClick={() => setFeedbackModal({ show: false, type: '', message: '' })}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Display */}
      {viewMode === 'list' ? (
        // List View
        <div className="overflow-hidden bg-white shadow-sm rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {loading ? (
              // Loading skeletons
              Array(3).fill(null).map((_, index) => (
                <li key={index} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar skeleton */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                      {/* Name and email skeleton */}
                      <div className="flex-1 min-w-0">
                        <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                        <div className="mt-2 h-3 w-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                      </div>
                    </div>
                    {/* Action buttons skeleton */}
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                      <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              currentUsers.map((user, index) => (
                <li 
                  key={user._id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/users/${user._id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* User Info Section */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Index Badge - Hidden on mobile */}
                      <div className="hidden sm:flex h-8 w-8 rounded-full bg-indigo-50 items-center justify-center text-sm font-medium text-indigo-600">
                        #{startIndex + index + 1}
                      </div>
                      
                      {/* Profile Image */}
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <ProfileImage user={user} size="small" />
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {/* Index Badge - Shown only on mobile */}
                          <div className="flex sm:hidden h-5 w-5 rounded-full bg-indigo-50 items-center justify-center text-xs font-medium text-indigo-600">
                            #{startIndex + index + 1}
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row gap-2 sm:gap-6">
                          <a 
                            href={`mailto:${user.email}`}
                            className="text-sm text-gray-500 hover:text-indigo-600 truncate flex items-center group"
                            title="Click to send email"
                          >
                            <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{user.email}</span>
                          </a>
                          <a 
                            href={`tel:${user.phone}`}
                            className="text-sm text-gray-500 hover:text-indigo-600 truncate flex items-center group"
                            title="Click to call"
                          >
                            <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="truncate">{user.phone || 'N/A'}</span>
                          </a>
                          <p className="text-sm text-gray-500 flex items-center">
                            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Joined {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeletons
            Array(8).fill(null).map((_, index) => (
              <div key={index} className="relative bg-white p-6 rounded-lg shadow">
                {/* Index Badge Skeleton */}
                <div className="absolute -top-2 -left-2 h-6 w-6">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                      <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                    </p>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-gray-500 hover:text-indigo-600 truncate flex items-center group">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                      </div>
                      <div className="text-sm text-gray-500 hover:text-indigo-600 truncate flex items-center group">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Delete user"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100/50 w-full">
                  <div className="flex justify-center">
                    <p className="text-xs text-gray-400 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            currentUsers.map((user, index) => (
              <div 
                key={user._id} 
                className="relative bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => navigate(`/users/${user._id}`)}
              >
                {/* Index Badge */}
                <div className="absolute -top-2 -left-2 h-6 w-6 flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-100 rounded-full transform rotate-45"></div>
                  <span className="relative text-xs font-medium text-indigo-700">
                    #{startIndex + index + 1}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <ProfileImage user={user} size="small" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                      {user.name}
                    </p>
                    <div className="flex flex-col gap-1">
                      <a 
                        href={`mailto:${user.email}`}
                        className="text-sm text-gray-500 hover:text-indigo-600 truncate flex items-center group"
                        title="Click to send email"
                      >
                        <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{user.email}</span>
                      </a>
                      <a 
                        href={`tel:${user.phone}`}
                        className="text-sm text-gray-500 hover:text-indigo-600 truncate flex items-center group"
                        title="Click to call"
                      >
                        <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{user.phone || 'N/A'}</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => {
                        setUserToDelete(user);
                        setDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Delete user"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100/50 w-full">
                  <div className="flex justify-center">
                    <p className="text-xs text-gray-400 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Joined {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Users;
