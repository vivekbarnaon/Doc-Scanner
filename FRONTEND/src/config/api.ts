// API Configuration
export const API_CONFIG = {
  // Base URLs
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:7071/api',
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:7071',
  
  // Azure Function Key
  AZURE_FUNCTION_KEY: process.env.REACT_APP_AZURE_FUNCTION_KEY,
  
  // Request timeout (5 minutes for file processing)
  TIMEOUT: 300000,
  
  // API Endpoints
  ENDPOINTS: {
    UPLOAD: '/upload',
    PROCESS: {
      IMAGE_TO_CSV: '/process/image-to-csv',
      PDF_TO_CSV: '/process/pdf-to-csv',
      MERGE_CSV: '/process/merge-csv',
    },
    HEALTH: '/health',
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
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  // Add Azure Function key if available
  if (API_CONFIG.AZURE_FUNCTION_KEY) {
    headers['x-functions-key'] = API_CONFIG.AZURE_FUNCTION_KEY;
  }
  
  return headers;
};

// Helper function to check if backend is configured
export const isBackendConfigured = (): boolean => {
  return !!(API_CONFIG.API_URL && API_CONFIG.API_URL !== 'http://localhost:7071/api');
};

// Helper function to get environment info
export const getEnvironmentInfo = () => {
  return {
    apiUrl: API_CONFIG.API_URL,
    backendUrl: API_CONFIG.BACKEND_URL,
    hasAzureKey: !!API_CONFIG.AZURE_FUNCTION_KEY,
    isProduction: API_CONFIG.API_URL.includes('azurewebsites.net'),
    isLocal: API_CONFIG.API_URL.includes('localhost'),
  };
};

export default API_CONFIG;
