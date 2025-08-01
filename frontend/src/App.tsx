import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import UserReports from './components/UserReports';
import Settings from './components/Settings';
import Login from './components/Login';
import { authService } from './services/authService';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shouldShowAddUserForm, setShouldShowAddUserForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check if user is already logged in on app load
  useEffect(() => {
    const isLoggedIn = authService.isLoggedIn();
    const user = authService.getCurrentUser();
    
    if (isLoggedIn && user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    } else {
      // Clear any invalid tokens
      authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveSection('dashboard');
  };

  const handleNavigateToAddUser = () => {
    setActiveSection('users');
    setShouldShowAddUserForm(true);
  };

  const handleNavigateToReports = () => {
    setActiveSection('reports');
  };

  const handleNavigateToSettings = () => {
    setActiveSection('settings');
  };

  const handleMenuNavigation = (section: string) => {
    setActiveSection(section);
    // Reset add form when navigating via menu
    if (section === 'users') {
      setShouldShowAddUserForm(false);
    }
  };

  const handleAddFormStateChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShouldShowAddUserForm(false);
    }
  };

  // Reset add form state when navigating to users section via menu (not from Add User button)
  useEffect(() => {
    // When activeSection changes to something other than 'users', reset the add form state
    if (activeSection !== 'users') {
      setShouldShowAddUserForm(false);
    }
  }, [activeSection]);

  const renderContent = () => {
    const isAdmin = currentUser?.role === 'admin';
    
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard 
          isCollapsed={sidebarCollapsed} 
          onNavigateToAddUser={isAdmin ? handleNavigateToAddUser : undefined} 
          onNavigateToReports={handleNavigateToReports}
          onNavigateToSettings={handleNavigateToSettings}
          currentUser={currentUser}
        />;
      case 'users':
        if (!isAdmin) {
          // Redirect non-admin users back to dashboard
          setActiveSection('dashboard');
          return <Dashboard 
            isCollapsed={sidebarCollapsed} 
            onNavigateToReports={handleNavigateToReports}
            onNavigateToSettings={handleNavigateToSettings}
            currentUser={currentUser}
          />;
        }
        return <UserManagement 
          isCollapsed={sidebarCollapsed} 
          shouldShowAddForm={shouldShowAddUserForm}
          onAddFormStateChange={handleAddFormStateChange}
          currentUser={currentUser}
        />;
      case 'reports':
        return <UserReports isCollapsed={sidebarCollapsed} currentUser={currentUser} />;
      case 'settings':
        return <Settings isCollapsed={sidebarCollapsed} currentUser={currentUser} />;
      default:
        return <Dashboard 
          isCollapsed={sidebarCollapsed} 
          onNavigateToAddUser={isAdmin ? handleNavigateToAddUser : undefined} 
          onNavigateToReports={handleNavigateToReports}
          onNavigateToSettings={handleNavigateToSettings}
          currentUser={currentUser}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-600 to-indigo-800">
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* Sidebar */}
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={handleMenuNavigation}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={setSidebarCollapsed}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
          
          {/* Main Content */}
          <div 
            className={`min-h-screen transition-all duration-300 ${
              sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}
          >
            {renderContent()}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
