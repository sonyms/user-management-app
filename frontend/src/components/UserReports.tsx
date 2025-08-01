import { useState, useEffect, useRef } from 'react';
import { userService, type ConnectionStatus, type PaginatedResponse } from '../services/userService';
import type { User } from '../types/User';

interface UserReportsProps {
  isCollapsed?: boolean;
  currentUser?: any;
}

export default function UserReports({ isCollapsed = false, currentUser }: UserReportsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('failed');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 5; // 5 users per page for reports
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'ascending' | 'descending';
  }>({ key: 'createdAt', direction: 'descending' });

  // Prevent double calls on mount
  const hasFetchedRef = useRef(false);

  // Check backend connection
  const checkConnection = async () => {
    try {
      const status = await userService.checkConnection();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus('failed');
    }
  };

  // Fetch users with pagination and sorting for reporting - with comprehensive protection
  const fetchUsers = async (page: number = currentPage, sort?: string, direction?: string) => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers(
        currentUser?.role, 
        page, 
        pageSize, 
        sort || sortBy, 
        direction || sortDir
      );
      setUsers(response.users);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalUsers(response.totalUsers);
      setConnectionStatus('connected');
    } catch (err: any) {
      if (err.message === 'CONNECTION_FAILED') {
        setConnectionStatus('failed');
      } else {
        // For other errors, still set connection as failed since we couldn't get data
        setConnectionStatus('failed');
        const errorMessage = 'Failed to fetch user reports';
        setError(errorMessage);
      }
      console.error('Error fetching user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double calls in development mode (React StrictMode)
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    fetchUsers(1); // Start with page 1 - this will also check connection automatically
    
    // Set up periodic connection check - reduced frequency
    const connectionCheckInterval = setInterval(checkConnection, 60000); // Check every 60 seconds
    
    return () => {
      clearInterval(connectionCheckInterval);
      // Don't reset the ref - this prevents StrictMode double calls
    };
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, sortBy, sortDir);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchUsers(currentPage, sortBy, sortDir);
  };

  // Sort functionality with server-side sorting
  const handleSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    let sortDirection: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
      sortDirection = 'desc';
    }
    
    setSortConfig({ key, direction });
    setSortBy(key);
    setSortDir(sortDirection);
    
    // Fetch data with new sorting
    fetchUsers(1, key, sortDirection); // Reset to page 1 when sorting
    setCurrentPage(1);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Created At', 'Updated At'];
    const csvContent = [
      headers.join(','),
      ...users.map(user =>
        [
          user.id || '',
          `"${user.name}"`,
          `"${user.email}"`,
          `"${formatDate(user.createdAt)}"`,
          `"${formatDate(user.updatedAt)}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ column }: { column: keyof User }) => {
    if (sortConfig.key !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'ascending' ? (
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className={`space-y-8 ${isCollapsed ? 'p-4' : 'p-8'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            User Reports
          </h1>
          <p className="text-purple-100 mt-2">Comprehensive user activity and creation reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-green-500 animate-pulse' 
                : connectionStatus === 'failed'
                ? 'bg-red-500'
                : 'bg-yellow-500 animate-pulse'
            }`}></div>
            <span className={`text-sm font-medium ${
              connectionStatus === 'connected' 
                ? 'text-green-700' 
                : connectionStatus === 'failed'
                ? 'text-red-700'
                : 'text-yellow-700'
            }`}>
              {connectionStatus === 'connected' 
                ? 'Live' 
                : connectionStatus === 'failed'
                ? 'Offline'
                : 'Connecting...'}
            </span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-white/40 shadow-lg">
            <span className="text-sm font-medium text-indigo-700">
              {totalUsers} {totalUsers === 1 ? 'Record' : 'Records'} Total
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search functionality coming soon..."
                value=""
                onChange={() => {}}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={users.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl overflow-hidden">
        {/* Connection Error */}
        {connectionStatus === 'failed' && (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">Cannot Connect to Backend</h3>
            <p className="text-red-600 mb-4">Unable to fetch user report data. Please check your connection.</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="grid grid-cols-5 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && connectionStatus !== 'failed' && (
          <>
            {users.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Report Data Available</h3>
                <p className="text-gray-500">No users found matching your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>ID</span>
                          <SortIcon column="id" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Name</span>
                          <SortIcon column="name" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Email</span>
                          <SortIcon column="email" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Created At</span>
                          <SortIcon column="createdAt" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort('updatedAt')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Last Updated</span>
                          <SortIcon column="updatedAt" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user, index) => (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{user.id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(user.createdAt)}</span>
                            {user.createdAt && (
                              <span className="text-xs text-gray-400">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(user.updatedAt)}</span>
                            {user.updatedAt && (
                              <span className="text-xs text-gray-400">
                                {new Date(user.updatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        
        {/* Pagination Controls */}
        {!loading && connectionStatus !== 'failed' && totalPages > 1 && (
          <div className="mt-6 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-purple-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {!loading && connectionStatus !== 'failed' && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Server Pagination</p>
                <p className="text-2xl font-bold text-gray-900">Active</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
