import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { userService, type ConnectionStatus } from '../services/userService';
import { showToast } from '../utils/toast';
import UserForm from './UserForm';
import UserList from './UserList';
import ConfirmationModal from './ConfirmationModal';
import type { User } from '../types/User';

interface UserManagementProps {
  isCollapsed?: boolean;
  shouldShowAddForm?: boolean;
  onAddFormStateChange?: (isOpen: boolean) => void;
  currentUser?: any;
}

export default function UserManagement({ isCollapsed = false, shouldShowAddForm = false, onAddFormStateChange, currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('failed');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 4;
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: ''
  });

  // Prevent double calls on mount
  const hasFetchedRef = useRef(false);

  // Check backend connection
  const checkConnection = async () => {
    try {
      const status = await userService.checkConnection();
      setConnectionStatus(status);
    } catch (err) {
      setConnectionStatus('failed');
    }
  };

  // Fetch users with pagination - with loading state protection
  const fetchUsers = async (page: number = currentPage) => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers(currentUser?.role, page, itemsPerPage);
      setUsers(data.users);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalUsers);
      setConnectionStatus('connected');
    } catch (err: any) {
      if (err.message === 'CONNECTION_FAILED') {
        setConnectionStatus('failed');
      } else {
        // For other errors, still set connection as failed since we couldn't get data
        setConnectionStatus('failed');
        const errorMessage = 'Failed to fetch users';
        setError(errorMessage);
      }
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check connection and fetch users on component mount
  useEffect(() => {
    // Prevent double calls in development mode (React StrictMode)
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    fetchUsers(); // This will also check connection automatically (with loading protection)
    
    // Set up periodic connection check
    const connectionCheckInterval = setInterval(checkConnection, 60000); // Check every 60 seconds
    
    return () => {
      clearInterval(connectionCheckInterval);
      // Don't reset the ref - this prevents StrictMode double calls
    };
  }, []);

  // Handle external add form trigger
  useEffect(() => {
    if (shouldShowAddForm && !showAddForm) {
      setShowAddForm(true);
      onAddFormStateChange?.(true);
    }
    // Don't auto-reset showAddForm when shouldShowAddForm is false
    // This allows the local "Add User" button to work independently
  }, [shouldShowAddForm, showAddForm, onAddFormStateChange]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  // Add new user
  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      setLoading(true);
      const newUser = await userService.createUser(userData);
      // Refresh data from server to get updated pagination
      await fetchUsers(currentPage);
      setShowAddForm(false); // Go back to user list after adding
      onAddFormStateChange?.(false);
      showToast.userAdded(newUser.name);
    } catch (err: any) {
      if (err.message === 'CONNECTION_FAILED') {
        setConnectionStatus('failed');
        // Connection status shown in UI, no intrusive toast
      } else {
        const errorMessage = 'Failed to add user';
        setError(errorMessage);
        showToast.error(errorMessage);
      }
      console.error('Error adding user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update existing user
  const handleUpdateUser = async (userData: Omit<User, 'id'>) => {
    if (!editingUser || !editingUser.id) return;
    
    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(editingUser.id, userData);
      // Refresh data from server to get updated pagination
      await fetchUsers(currentPage);
      setEditingUser(null);
      setShowAddForm(false); // Go back to user list after updating
      onAddFormStateChange?.(false);
      showToast.userUpdated(updatedUser.name);
    } catch (err: any) {
      if (err.message === 'CONNECTION_FAILED') {
        setConnectionStatus('failed');
        // Connection status shown in UI, no intrusive toast
      } else {
        const errorMessage = 'Failed to update user';
        setError(errorMessage);
        showToast.error(errorMessage);
      }
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user (show confirmation first)
  const handleDeleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    setDeleteModal({
      isOpen: true,
      userId: id,
      userName: user.name
    });
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!deleteModal.userId) return;
    
    try {
      setLoading(true);
      await userService.deleteUser(deleteModal.userId);
      // Refresh data from server to get updated pagination
      await fetchUsers(currentPage);
      showToast.userDeleted(deleteModal.userName);
    } catch (err: any) {
      if (err.message === 'CONNECTION_FAILED') {
        setConnectionStatus('failed');
        // Connection status shown in UI, no intrusive toast
      } else {
        const errorMessage = 'Failed to delete user';
        setError(errorMessage);
        showToast.error(errorMessage);
      }
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
      // Close modal
      setDeleteModal({
        isOpen: false,
        userId: null,
        userName: ''
      });
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: ''
    });
  };

  // Handle editing a user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowAddForm(true); // Show form when editing
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUser(null);
    setShowAddForm(false);
    onAddFormStateChange?.(false);
  };

  return (
    <div className={`space-y-8 ${isCollapsed ? 'p-4' : 'p-8'}`}>
      {/* Modern Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#1f2937',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '12px',
            border: '1px solid rgba(229, 231, 235, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
            padding: '16px 20px',
            maxWidth: '400px',
            minHeight: '60px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#6b7280',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            User Management
          </h1>
          <p className="text-purple-100 mt-2">Modern CRUD operations with beautiful design</p>
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
              {totalUsers} {totalUsers === 1 ? 'User' : 'Users'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Conditional Rendering: Form or User List */}
        {showAddForm ? (
          // Show Add/Edit User Form
          <div className="">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </h2>
                    <p className="text-purple-100 mt-1">
                      {editingUser ? 'Update user information' : 'Create a new user account'}
                    </p>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <UserForm
                  user={editingUser || undefined}
                  onSubmit={editingUser ? handleUpdateUser : handleAddUser}
                  onCancel={handleCancelEdit}
                  isEditing={!!editingUser}
                />
              </div>
            </div>
          </div>
        ) : (
          // Show User List with Add Button
          <div className="">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      All Users
                    </h2>
                    <p className="text-indigo-100 mt-1">Manage your user accounts</p>
                  </div>
                  {connectionStatus === 'connected' && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-white/50 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add User</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="p-8">
                <UserList
                  users={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  loading={loading}
                  error={error}
                  connectionStatus={connectionStatus}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalUsers={totalUsers}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Backend Status Card */}
        <div className="mt-8 bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                connectionStatus === 'connected' 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : connectionStatus === 'failed'
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gradient-to-br from-yellow-500 to-orange-500'
              }`}>
                {connectionStatus === 'connected' ? (
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : connectionStatus === 'failed' ? (
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Backend Connection</h3>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500 animate-pulse' 
                  : connectionStatus === 'failed'
                  ? 'bg-red-500'
                  : 'bg-gray-400 animate-pulse'
              }`}></div>
              <span className={`text-sm font-medium ${
                connectionStatus === 'connected' 
                  ? 'text-green-700' 
                  : connectionStatus === 'failed'
                  ? 'text-red-700'
                  : 'text-gray-700'
              }`}>
                {connectionStatus === 'connected' 
                  ? 'Connected' 
                  : connectionStatus === 'failed'
                  ? 'Failed'
                  : 'Checking...'}
              </span>
              {connectionStatus === 'failed' && (
                <button
                  onClick={() => fetchUsers()}
                  className="ml-2 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Delete User"
          message={`Are you sure you want to delete "${deleteModal.userName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}
