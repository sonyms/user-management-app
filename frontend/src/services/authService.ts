import axios from 'axios';

const API_BASE_URL = '/api/auth';

// Auth response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
  };
}

export interface ErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

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
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<{ success: boolean; message?: string; user?: LoginResponse['user'] }> => {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/login`, credentials);
      const { success, token, user, message } = response.data;
      
      if (success && token && user) {
        // Save token and user info
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          user: user
        };
      } else {
        return {
          success: false,
          message: message || 'Login failed'
        };
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: error.response.data.message || 'Invalid username or password'
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  // Check if user is logged in and token is valid
  isLoggedIn: (): boolean => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Get current user from localStorage
  getCurrentUser: (): LoginResponse['user'] | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Save user to localStorage
  saveUser: (user: LoginResponse['user']): void => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Get JWT token
  getToken: (): string | null => {
    return localStorage.getItem('jwt_token');
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwt_token');
  }
};
