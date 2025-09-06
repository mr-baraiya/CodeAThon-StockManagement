import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;
      
      if (searchQuery.trim()) {
        response = await userService.searchUsers(searchQuery, currentPage, itemsPerPage);
        setUsers(response.users || []);
        setTotalItems(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 0);
      } else if (selectedRole !== 'all') {
        response = await userService.getUsersByRole(selectedRole);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedUsers = response.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
        setTotalItems(response.length);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
      } else {
        response = await userService.getAllUsers(currentPage, itemsPerPage);
        setUsers(response || []);
        // Note: Your API doesn't return pagination info for getAllUsers
        // You might want to update the backend to return pagination data
        setTotalItems(response?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      handleApiError(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const result = await showAlert.confirm(
        'Toggle User Status',
        `Are you sure you want to ${currentStatus === 'active' ? 'deactivate' : 'activate'} this user?`
      );

      if (result.isConfirmed) {
        const response = await userService.toggleUserStatus(userId);
        showToast.success(response.message);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const deleteUser = async (userId, userName) => {
    try {
      const result = await showAlert.confirmDelete(`user "${userName}"`);

      if (result.isConfirmed) {
        await userService.deleteUser(userId);
        showToast.success('User deleted successfully!');
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-1 text-gray-600">Manage all users in the system</p>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Role Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => handleRoleFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedRole === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => handleRoleFilter('user')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedRole === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => handleRoleFilter('admin')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedRole === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Admins
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner text="Loading users..." />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id || user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{user.phone || 'N/A'}</div>
                        <div className="text-gray-500">{user.location || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.id || user._id, user.status)}
                          className={`px-3 py-1 rounded text-xs ${
                            user.status === 'active'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id || user._id, user.name)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {users.length > 0 && (
          <div className="p-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
