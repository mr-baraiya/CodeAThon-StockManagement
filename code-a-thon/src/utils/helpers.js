import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Handle API Success responses
export const handleApiSuccess = (message, options = {}) => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  toast.success(message, { ...defaultOptions, ...options });
};

// Handle API Error responses
export const handleApiError = (error, customMessage = null) => {
  const message = customMessage || 
                  error?.message || 
                  error?.response?.data?.message || 
                  'Something went wrong. Please try again.';

  const defaultOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  toast.error(message, defaultOptions);
  
  // Log error for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }
};

// Handle validation errors from API
export const handleValidationErrors = (errors) => {
  if (typeof errors === 'object' && errors !== null) {
    Object.keys(errors).forEach(field => {
      toast.error(`${field}: ${errors[field]}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    });
  }
};

// Sweet Alert success
export const showSuccessAlert = async (title, text, options = {}) => {
  return await Swal.fire({
    title,
    text,
    icon: 'success',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: '#ffffff',
    color: '#1f2937',
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-2xl font-bold text-gray-900',
      content: 'text-gray-600'
    },
    ...options
  });
};

// Sweet Alert error
export const showErrorAlert = async (title, text, options = {}) => {
  return await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#ef4444',
    background: '#ffffff',
    color: '#1f2937',
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-xl font-bold text-gray-900',
      content: 'text-gray-600'
    },
    ...options
  });
};

// Sweet Alert confirmation
export const showConfirmAlert = async (title, text, confirmText = 'Yes, do it!', options = {}) => {
  return await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    background: '#ffffff',
    color: '#1f2937',
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-xl font-bold text-gray-900',
      content: 'text-gray-600'
    },
    ...options
  });
};

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Date(date).toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

// Format date and time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate query string from object
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  
  return searchParams.toString();
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': 'Administrator',
    'manager': 'Manager',
    'staff': 'Staff'
  };
  return roleNames[role] || role;
};

// Get status badge color
export const getStatusColor = (status) => {
  const statusColors = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'discontinued': 'bg-red-100 text-red-800',
    'paid': 'bg-green-100 text-green-800',
    'partial': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Calculate profit margin
export const calculateProfitMargin = (costPrice, sellingPrice) => {
  if (!costPrice || !sellingPrice) return 0;
  return (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(2);
};

// Validate file size
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
};

// Validate file type
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']) => {
  return allowedTypes.includes(file.type);
};
