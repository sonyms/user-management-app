import axios from 'axios';
import type { User } from '../types/User';

const API_BASE_URL = '/api/users';

// Create axios instance with timeout and interceptors
const apiClient = axios.create({
  timeout: 5000, // 5 second timeout
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Connection status type
export type ConnectionStatus = 'connected' | 'failed' | 'checking';

// Pagination response type
export interface PaginatedResponse {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  pageSize: number;
}

// Enhanced error handling
const handleApiError = (error: any): { isConnectionError: boolean; message: string } => {
  if (error.code === 'ECONNREFUSED' || 
      error.code === 'ERR_NETWORK' || 
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      !error.response) {
    return {
      isConnectionError: true,
      message: 'Cannot connect to backend server'
    };
  }
  
  return {
    isConnectionError: false,
    message: error.response?.data?.message || 'An unexpected error occurred'
  };
};

export const userService = {
  // Check backend connection with lightweight endpoint
  checkConnection: async (): Promise<ConnectionStatus> => {
    try {
      // Use a lightweight HEAD request instead of GET to avoid data transfer
      await apiClient.head('/api/users', { timeout: 3000 });
      return 'connected';
    } catch (error) {
      return 'failed';
    }
  },

  // Get all users (filtered by role if provided) with pagination and sorting
  getAllUsers: async (
    userRole?: string, 
    page: number = 1, 
    size: number = 4, 
    sortBy?: string, 
    sortDir?: string
  ): Promise<PaginatedResponse> => {
    try {
      const params = new URLSearchParams();
      if (userRole) params.append('userRole', userRole);
      params.append('page', page.toString());
      params.append('size', size.toString());
      if (sortBy) params.append('sortBy', sortBy);
      if (sortDir) params.append('sortDir', sortDir);
      
      const url = `${API_BASE_URL}?${params.toString()}`;
      const response = await apiClient.get<PaginatedResponse>(url);
      return response.data;
    } catch (error) {
      const { isConnectionError } = handleApiError(error);
      if (isConnectionError) {
        throw new Error('CONNECTION_FAILED');
      }
      throw error;
    }
  },

  // Get recent users for dashboard (last 5 users)
  getRecentUsers: async (userRole?: string): Promise<User[]> => {
    try {
      const params = new URLSearchParams();
      if (userRole) params.append('userRole', userRole);
      
      const url = `${API_BASE_URL}/recent?${params.toString()}`;
      const response = await apiClient.get<User[]>(url);
      return response.data;
    } catch (error) {
      const { isConnectionError } = handleApiError(error);
      if (isConnectionError) {
        throw new Error('CONNECTION_FAILED');
      }
      throw error;
    }
  },

  // Create a new user
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const response = await apiClient.post<User>(API_BASE_URL, user);
      return response.data;
    } catch (error) {
      const { isConnectionError } = handleApiError(error);
      if (isConnectionError) {
        throw new Error('CONNECTION_FAILED');
      }
      throw error;
    }
  },

  // Update an existing user
  updateUser: async (id: number, user: Omit<User, 'id'>): Promise<User> => {
    try {
      const response = await apiClient.put<User>(`${API_BASE_URL}/${id}`, user);
      return response.data;
    } catch (error) {
      const { isConnectionError } = handleApiError(error);
      if (isConnectionError) {
        throw new Error('CONNECTION_FAILED');
      }
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
      const { isConnectionError } = handleApiError(error);
      if (isConnectionError) {
        throw new Error('CONNECTION_FAILED');
      }
      throw error;
    }
  },

  // Reset password for current user
  resetPassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE_URL}/reset-password`, {
        currentPassword,
        newPassword
      });
    } catch (error) {
      const { isConnectionError } = handleApiError(error);
      if (isConnectionError) {
        throw new Error('CONNECTION_FAILED');
      }
      throw error;
    }
  },
};
