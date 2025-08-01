import { useState, useEffect, useRef } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types/User';

interface DashboardProps {
  isCollapsed?: boolean;
  onNavigateToAddUser?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToSettings?: () => void;
  currentUser?: any;
}

export default function Dashboard({ isCollapsed = false, onNavigateToAddUser, onNavigateToReports, onNavigateToSettings, currentUser }: DashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    systemStatus: 'operational' as 'operational' | 'maintenance' | 'error'
  });

  // Prevent double calls on mount
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double calls in development mode (React StrictMode)
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      // Get stats from first page to get total count
      const statsResponse = await userService.getAllUsers(undefined, 1, 1);
      
      // Get only the last 5 regular users for display (exclude admin users)
      const recentUsersData = await userService.getRecentUsers("user");
      setUsers(recentUsersData);
      
      // Calculate stats using total count from server
      setStats({
        totalUsers: statsResponse.totalUsers,
        activeUsers: statsResponse.totalUsers, // Assuming all are active for demo
        newUsersThisMonth: Math.floor(statsResponse.totalUsers * 0.3), // Demo calculation
        systemStatus: 'operational'
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Determine if it's a connection error vs server error
      let isConnectionError = false;
      
      if (error instanceof Error && error.message === 'CONNECTION_FAILED') {
        isConnectionError = true;
      } else {
        const axiosError = error as any;
        
        // Handle Vite proxy scenarios:
        // When backend is down, Vite proxy returns 500 with empty/minimal response
        if (axiosError?.response?.status === 500) {
          const responseData = axiosError.response.data;
          // If response is empty or very short, likely a proxy connection error
          if (!responseData || responseData === '' || (typeof responseData === 'string' && responseData.length < 50)) {
            isConnectionError = true;
          } else {
            isConnectionError = false;
          }
        }
        // Traditional connection errors (direct calls without proxy)
        else if (axiosError?.code === 'ERR_NETWORK' || 
                 axiosError?.code === 'ECONNREFUSED' || 
                 axiosError?.code === 'NETWORK_ERROR' ||
                 !axiosError?.response) {
          isConnectionError = true;
        }
        else {
          isConnectionError = false;
        }
      }
      
      setConnectionError(isConnectionError);
      
      setStats(prev => ({
        ...prev,
        systemStatus: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, description }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    description?: string;
  }) => (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const recentUsers = users; // Already the last 5 users from server

  return (
    <div className={`space-y-8 ${isCollapsed ? 'p-4' : 'p-8'}`}>
      {/* Dashboard Header */}
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Dashboard Overview
        </h1>
        <p className="text-purple-100 mt-2">Welcome back! Here's what's happening with your system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={loading ? '...' : stats.totalUsers}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          description="Registered users"
        />

        <StatCard
          title="Active Users"
          value={loading ? '...' : stats.activeUsers}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="bg-gradient-to-br from-green-500 to-green-600"
          description="Currently active"
        />

        <StatCard
          title="New This Month"
          value={loading ? '...' : stats.newUsersThisMonth}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          description="New registrations"
        />

        <StatCard
          title="System Status"
          value={stats.systemStatus === 'operational' ? 'Healthy' : stats.systemStatus === 'maintenance' ? 'Maintenance' : 'Error'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color={
            stats.systemStatus === 'operational' 
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
              : stats.systemStatus === 'maintenance'
              ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
              : "bg-gradient-to-br from-red-500 to-red-600"
          }
          description="System health"
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Recent Users</h3>
            <span className="text-sm text-slate-500">Last 5 registrations</span>
          </div>
          
          {(() => {
            if (loading) {
              return (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="animate-pulse flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            
            if (connectionError) {
              return (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-red-600 font-medium mb-1">Backend Connection Error</p>
                      <p className="text-sm text-slate-500 mb-4">Unable to connect to the server. Please check if the backend is running.</p>
                      <button 
                        onClick={fetchDashboardData}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Retry Connection</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            
            if (recentUsers.length > 0) {
              return (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              );
            }
            
            return (
              <div className="text-center py-8">
                <p className="text-slate-500">No users found</p>
              </div>
            );
          })()}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Quick Actions</h3>
          
          <div className="space-y-4">
            {currentUser?.role === 'admin' && onNavigateToAddUser && !connectionError && (
              <button 
                onClick={() => onNavigateToAddUser?.()}
                className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Add New User</span>
              </button>
            )}
            
            <button 
              onClick={() => onNavigateToReports?.()}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium">View Reports</span>
            </button>
            
            <button 
              onClick={() => onNavigateToSettings?.()}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
