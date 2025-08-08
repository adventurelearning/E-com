// src/pages/auth/users/UsersDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Chip, CircularProgress, Dialog,
  DialogContent, DialogTitle, Divider,
  IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Close, Edit, Delete, Visibility,
  Email, Phone, LocationOn, Event,
  FirstPage, LastPage, ChevronLeft, ChevronRight
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import Api from '../../Services/Api';
import UserOrders from './UserOrders';

const UsersDashboard = () => {
  // Main state management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users with pagination and search
  const fetchUsers = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      let response;
      if (search) {
        // Use search endpoint with 'q' parameter
        const searchResponse = await Api.get('/auth/search/users', { 
          params: { q: search } 
        });
        // Format response to match pagination structure
        response = {
          data: {
            users: searchResponse.data,
            pagination: {
              page: 1,
              pages: 1,
              total: searchResponse.data.length,
              limit: searchResponse.data.length
            }
          }
        };
      } else {
        // Use regular paginated endpoint
        const params = { page, limit: pagination.limit };
        response = await Api.get('/auth/users', { params });
      }
      
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1, searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle user status
  const toggleUserStatus = async (userId, field) => {
    try {
      const user = users.find(u => u._id === userId);
      const newValue = !user[field];

      await Api.put(`/auth/users/${userId}`, { [field]: newValue });

      setUsers(users.map(u =>
        u._id === userId ? { ...u, [field]: newValue } : u
      ));

      // Update details if open
      if (selectedUser && selectedUser._id === userId) {
        setUserDetails(prev => ({ ...prev, [field]: newValue }));
      }
    } catch (err) {
      toast.error('Failed to update user status');
      console.error('Error updating user:', err);
    }
  };

  // Fetch detailed user info
  const fetchUserDetails = useCallback(async (userId) => {
    if (!userId) return;

    setDetailsLoading(true);
    try {
      const response = await Api.get(`/auth/users/${userId}`);
      setUserDetails(response.data);
      setEditForm({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || ''
      });
    } catch (err) {
      toast.error('Failed to load user details');
      console.error('Error fetching user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setEditMode(false);
    fetchUserDetails(user._id);
  };

  // Handle edit button click
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditMode(true);
    fetchUserDetails(user._id);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchUsers(newPage, searchQuery);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      await Api.delete(`/auth/${userToDelete._id}`);
      toast.success('User deleted successfully');
      setOpenDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Save edited user details
  const saveEditChanges = async () => {
    try {
      const response = await Api.put(`/auth/users/${selectedUser._id}/details`, editForm);
      setUserDetails(response.data);
      setEditMode(false);
      toast.success('User updated successfully');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-purple-800">User Management</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg flex items-center justify-center transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress className="text-purple-600" />
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow className="bg-purple-50">
                  <TableCell className="font-semibold text-purple-800">User</TableCell>
                  <TableCell className="font-semibold text-purple-800">Contact</TableCell>
                  <TableCell className="font-semibold text-purple-800">verified</TableCell>
                  <TableCell className="font-semibold text-purple-800">status</TableCell>
                  <TableCell className="font-semibold text-purple-800">Registration</TableCell>
                  <TableCell className="font-semibold text-purple-800">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? users.map(user => (
                  <TableRow key={user._id} hover className="border-b border-gray-100">
                    <TableCell>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">ID: {user._id.slice(-6)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-800">{user.email}</div>
                      {user.phone && <div className="text-sm text-gray-600">{user.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">

                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${user.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          onClick={() => toggleUserStatus(user._id, 'isActive')}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.addresses?.length || 0} addresses
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserSelect(user)}
                          className="text-purple-700 hover:text-purple-900"
                          title="View"
                        >
                          <Visibility fontSize="small" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit fontSize="small" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                          onClick={() => {
                            setUserToDelete(user);
                            setOpenDeleteModal(true);
                          }}
                        >
                          <Delete fontSize="small" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center">
                        <div className="text-gray-400 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-lg font-medium text-gray-900">
                          No users found
                        </div>
                        <div className="text-gray-500 mt-2">
                          Try adjusting your search query
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2 mb-8">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(1)}
            className={`p-2 rounded-full ${pagination.page === 1 ? 'text-gray-400' : 'text-purple-700 hover:bg-purple-100'}`}
          >
            <FirstPage />
          </button>

          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className={`p-2 rounded-full ${pagination.page === 1 ? 'text-gray-400' : 'text-purple-700 hover:bg-purple-100'}`}
          >
            <ChevronLeft />
          </button>

          {[...Array(pagination.pages).keys()].map(num => {
            const pageNum = num + 1;
            if (
              pageNum === 1 ||
              pageNum === pagination.pages ||
              (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-full ${pagination.page === pageNum
                      ? 'bg-purple-700 text-white'
                      : 'text-gray-700 hover:bg-purple-100'
                    }`}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          })}

          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className={`p-2 rounded-full ${pagination.page === pagination.pages ? 'text-gray-400' : 'text-purple-700 hover:bg-purple-100'}`}
          >
            <ChevronRight />
          </button>

          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => handlePageChange(pagination.pages)}
            className={`p-2 rounded-full ${pagination.page === pagination.pages ? 'text-gray-400' : 'text-purple-700 hover:bg-purple-100'}`}
          >
            <LastPage />
          </button>
        </div>
      )}

      {/* User Details Modal */}
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ className: 'rounded-xl' }}
      >
        <DialogTitle className="flex justify-between items-center bg-purple-50">
          <h2 className="text-xl font-bold text-purple-800">
            {editMode ? 'Edit User' : 'User Details'}
          </h2>
          <IconButton onClick={() => setSelectedUser(null)}>
            <Close className="text-gray-600" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-0">
          {detailsLoading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress className="text-purple-600" />
            </div>
          ) : (
            userDetails && (
              <div className="p-6">
                {/* Edit Mode */}
                {editMode ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={saveEditChanges}
                        className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg transition duration-200"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex flex-col items-center mb-6">
                          <div className="relative">
                            <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center">
                              <span className="text-3xl font-bold text-purple-700">
                                {userDetails.name.charAt(0)}
                              </span>
                            </div>
                            <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white ${userDetails.isActive ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                          </div>

                          <h3 className="mt-4 text-xl font-bold text-gray-900">
                            {userDetails.name}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${userDetails.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {userDetails.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {userDetails.addresses?.length || 0} Addresses
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start">
                            <Email className="text-purple-600 mt-1 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Email</div>
                              <div className="text-gray-900">{userDetails.email}</div>
                            </div>
                          </div>

                          {userDetails.phone && (
                            <div className="flex items-start">
                              <Phone className="text-purple-600 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Phone</div>
                                <div className="text-gray-900">{userDetails.phone}</div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start">
                            <Event className="text-purple-600 mt-1 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Registered</div>
                              <div className="text-gray-900">
                                {new Date(userDetails.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                          <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="mr-1" fontSize="small" /> Edit Profile
                          </button>

                          <button
                            onClick={() => toggleUserStatus(userDetails._id, 'isActive')}
                            className={`flex items-center text-sm ${userDetails.isActive
                                ? 'text-red-600 hover:text-red-800'
                                : 'text-green-600 hover:text-green-800'
                              }`}
                          >
                            {userDetails.isActive ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Deactivate
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Activate
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setUserToDelete(userDetails);
                              setOpenDeleteModal(true);
                            }}
                            className="flex items-center text-sm text-red-600 hover:text-red-800"
                          >
                            <Delete className="mr-1" fontSize="small" /> Delete
                          </button>
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Addresses</h3>

                        <div className="space-y-4">
                          {userDetails.addresses?.length > 0 ? (
                            userDetails.addresses.map((addr, i) => (
                              <div
                                key={i}
                                className={`p-4 rounded-lg border ${addr.isDefault
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200'
                                  }`}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-gray-900">
                                    {addr.label} {addr.isDefault && (
                                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </h4>
                                </div>

                                <div className="mt-2 text-sm text-gray-700">
                                  <div>{addr.street}, {addr.city}</div>
                                  <div>{addr.state}, {addr.postalCode}</div>
                                  <div className="mt-1 text-gray-600">{addr.country}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                              <LocationOn className="text-gray-400 text-4xl mb-2 mx-auto" />
                              <div className="text-gray-500">No addresses saved</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Orders Section */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
                        <UserOrders userId={userDetails._id} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {openDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              <button onClick={() => setOpenDeleteModal(false)} className="text-gray-500 hover:text-gray-700">
                <Close />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete user <span className="font-semibold">{userToDelete?.name}</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOpenDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition duration-200"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersDashboard;