// Environment Debug Utility
// Use this to debug environment variables in development

export const debugEnv = () => {
  if (import.meta.env.VITE_NODE_ENV === 'development') {
    console.group('🔧 Environment Configuration');
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('App Name:', import.meta.env.VITE_APP_NAME);
    console.log('App Version:', import.meta.env.VITE_APP_VERSION);
    console.log('Environment:', import.meta.env.VITE_NODE_ENV);
    console.log('Mode:', import.meta.env.MODE);
    console.log('Development:', import.meta.env.DEV);
    console.log('Production:', import.meta.env.PROD);
    console.groupEnd();
  }
};

// Call this in your main.jsx or App.jsx during development
export default debugEnv;
