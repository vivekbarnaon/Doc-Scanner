import axios from 'axios';
import { ProcessingType, ProcessingResult } from '../types/types';

// Backend API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || ' http://localhost:7071/api/processData';
const AZURE_FUNCTION_KEY = process.env.REACT_APP_AZURE_FUNCTION_KEY;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for file processing
  headers: {
    // Add Azure Function key if available
    ...(AZURE_FUNCTION_KEY && { 'x-functions-key': AZURE_FUNCTION_KEY }),
  },
});

// Add request interceptor for logging and Azure Function key
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);

    // Ensure Azure Function key is added to headers if available
    if (AZURE_FUNCTION_KEY && !config.headers['x-functions-key']) {
      config.headers['x-functions-key'] = AZURE_FUNCTION_KEY;
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Backend service not found. Please check if the backend is running.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The file might be too large or processing is taking too long.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your connection and backend URL.');
    }
    
    return Promise.reject(error);
  }
);

// Upload file to backend
export const uploadFile = async (file: File): Promise<{file_id: string, filename: string, file_type?: string}> => {
  try {
    console.log('Uploading file:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.error) {
      throw new Error(response.data.message || 'Upload failed');
    }

    console.log('Upload response:', response.data);

    return {
      file_id: response.data.file_id,
      filename: response.data.filename,
      file_type: response.data.file_type
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Upload failed');
  }
};

// Process uploaded file
export const processUploadedFile = async (
  fileId: string,
  filename: string,
  type: ProcessingType
): Promise<ProcessingResult> => {
  try {
    console.log(`Processing ${type} with file ID:`, fileId);

    // Determine the endpoint based on processing type
    let endpoint = '/process/image-to-csv';
    switch (type) {
      case 'imgtocsv':
        endpoint = '/process/image-to-csv';
        break;
      case 'pdfcsv':
        endpoint = '/process/pdf-to-csv';
        break;
      case 'mergecsv':
        endpoint = '/process/merge-csv';
        break;
    }

    const response = await api.post(endpoint, {
      file_id: fileId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.error) {
      throw new Error(response.data.message || 'Processing failed');
    }

    // Transform backend response to frontend format
    const result: ProcessingResult = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fileName: filename,
      type: type,
      status: 'success',
      timestamp: new Date(),
      csvContent: response.data.csv_content || '',
      downloadUrl: response.data.download_url ? `${API_BASE_URL.replace('/api', '')}${response.data.download_url}` : '',
    };

    console.log('Processing completed:', result);
    return result;

  } catch (error: any) {
    console.error('Processing error:', error);

    // Return error result
    const errorResult: ProcessingResult = {
      id: `${type}_error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fileName: filename,
      type: type,
      status: 'error',
      timestamp: new Date(),
      errorMessage: error.response?.data?.message || error.message || 'Processing failed',
      csvContent: '',
      downloadUrl: '',
    };

    return errorResult;
  }
};

// Combined function for upload + process (main function used by components)
export const processFile = async (
  type: ProcessingType,
  files: File[]
): Promise<ProcessingResult> => {
  try {
    if (files.length === 0) {
      throw new Error('No file provided');
    }

    const file = files[0];

    // First upload the file
    const uploadResult = await uploadFile(file);

    // Auto-detect processing type based on backend file type detection
    let actualType = type;
    if (uploadResult.file_type) {
      console.log('Backend detected file type:', uploadResult.file_type);

      // Map backend file type to processing type
      switch (uploadResult.file_type) {
        case 'image':
          actualType = 'imgtocsv';
          break;
        case 'pdf':
          actualType = 'pdfcsv';
          break;
        case 'csv':
          actualType = 'mergecsv';
          break;
        default:
          // Keep original type if unknown
          break;
      }

      if (actualType !== type) {
        console.log(`Auto-corrected processing type from ${type} to ${actualType} based on file content`);
      }
    }

    // Then process it with the correct type
    const processResult = await processUploadedFile(uploadResult.file_id, uploadResult.filename, actualType);

    return processResult;

  } catch (error: any) {
    console.error('File processing error:', error);

    // Return error result
    const errorResult: ProcessingResult = {
      id: `${type}_error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fileName: files[0]?.name || 'unknown',
      type: type,
      status: 'error',
      timestamp: new Date(),
      errorMessage: error.message || 'Processing failed',
      csvContent: '',
      downloadUrl: '',
    };

    return errorResult;
  }
};

export default api;
