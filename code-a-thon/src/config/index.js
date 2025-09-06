// Environment configuration
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9705',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Code-A-Thon',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Feature Flags
  isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: import.meta.env.VITE_NODE_ENV === 'production',
  
  // API Timeouts
  apiTimeout: 10000, // 10 seconds
  
  // Local Storage Keys
  storageKeys: {
    token: 'token',
    user: 'user',
    theme: 'theme',
  },
};

export default config;
