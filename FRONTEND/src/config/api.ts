// API Configuration
export const API_CONFIG = {
  // Base URLs
  API_URL: 'https://doc-scanner-pbzu.onrender.com/api',
  BACKEND_URL: 'https://doc-scanner-pbzu.onrender.com',
  
  // Supabase Configuration
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  SUPABASE_KEY: process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY,
  
  // Request timeout (5 minutes for file processing)
  TIMEOUT: 300000,
  
  // API Endpoints (FastAPI match)
  ENDPOINTS: {
    UPLOAD: '/api/upload',
    PROCESS: '/api/process',
    DOWNLOAD: '/api/download',
  },
  
  // File upload limits
  FILE_LIMITS: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'pdf', 'csv'],
  },
};

// Helper function to get API headers
export const getApiHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {};
  
  if (contentType && contentType !== 'multipart/form-data') {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
};

// Helper function to check if backend is configured
export const isBackendConfigured = (): boolean => {
  return true; // We are now local or Render
};

// Helper function to get environment info
export const getEnvironmentInfo = () => {
  return {
    apiUrl: API_CONFIG.API_URL,
    backendUrl: API_CONFIG.BACKEND_URL,
    isProduction: !API_CONFIG.API_URL.includes('localhost'),
    isLocal: API_CONFIG.API_URL.includes('localhost'),
  };
};

export default API_CONFIG;
