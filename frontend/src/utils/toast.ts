import toast from 'react-hot-toast';

// Modern, professional toast utilities with gradient backgrounds
export const showToast = {
  // Success toast for ADD operations
  userAdded: (userName: string, options?: any) => {
    toast.success(`User "${userName}" created successfully`, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        fontWeight: '500',
        fontSize: '14px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1)',
        padding: '16px 20px',
        maxWidth: '400px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#22c55e',
      },
      icon: '✓',
      ...options,
    });
  },

  // Success toast for UPDATE operations
  userUpdated: (userName: string, options?: any) => {
    toast.success(`User "${userName}" updated successfully`, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        fontWeight: '500',
        fontSize: '14px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        padding: '16px 20px',
        maxWidth: '400px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#3b82f6',
      },
      icon: '⟲',
      ...options,
    });
  },

  // Success toast for DELETE operations
  userDeleted: (userName: string, options?: any) => {
    toast.success(`User "${userName}" removed successfully`, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        fontWeight: '500',
        fontSize: '14px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.3), 0 0 0 1px rgba(168, 85, 247, 0.1)',
        padding: '16px 20px',
        maxWidth: '400px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#a855f7',
      },
      icon: '⌫',
      ...options,
    });
  },

  // Generic success toast
  success: (message: string, options?: any) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        fontWeight: '500',
        fontSize: '14px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1)',
        padding: '16px 20px',
        maxWidth: '400px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#22c55e',
      },
      ...options,
    });
  },

  // Modern error toast
  error: (message: string, options?: any) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        fontWeight: '500',
        fontSize: '14px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1)',
        padding: '16px 20px',
        maxWidth: '400px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#ef4444',
      },
      icon: '⚠',
      ...options,
    });
  },

  // Modern loading toast
  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.95) 0%, rgba(75, 85, 99, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        fontWeight: '500',
        fontSize: '14px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(107, 114, 128, 0.3), 0 0 0 1px rgba(107, 114, 128, 0.1)',
        padding: '16px 20px',
        maxWidth: '400px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#6b7280',
      },
      ...options,
    });
  },

  // Modern promise-based toast
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: any
  ) => {
    return toast.promise(promise, messages, {
      position: 'top-right',
      success: {
        style: {
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          color: '#ffffff',
          fontWeight: '500',
          fontSize: '14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1)',
          padding: '16px 20px',
          maxWidth: '400px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#22c55e',
        },
        icon: '✓',
      },
      error: {
        style: {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          color: '#ffffff',
          fontWeight: '500',
          fontSize: '14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1)',
          padding: '16px 20px',
          maxWidth: '400px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#ef4444',
        },
        icon: '⚠',
      },
      loading: {
        style: {
          background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.95) 0%, rgba(75, 85, 99, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          color: '#ffffff',
          fontWeight: '500',
          fontSize: '14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(107, 114, 128, 0.3), 0 0 0 1px rgba(107, 114, 128, 0.1)',
          padding: '16px 20px',
          maxWidth: '400px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#6b7280',
        },
      },
      ...options,
    });
  },
};
