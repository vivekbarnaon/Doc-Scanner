import axios from 'axios';
import { ProcessingResult } from '../types/types';

// --- Configuration ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071';
const AZURE_FUNCTION_KEY = process.env.REACT_APP_AZURE_FUNCTION_KEY;

if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_URL is not defined in the .env file. Please add it.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    ...(AZURE_FUNCTION_KEY && { 'x-functions-key': AZURE_FUNCTION_KEY }),
  },
});

// --- Interceptors ---
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
    throw new Error(errorMessage);
  }
);

// --- API Functions ---

export const uploadFile = async (file: File): Promise<{ file_id: string; filename: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.error) {
      throw new Error(response.data.message || 'Upload failed');
    }
    
    return {
        file_id: response.data.file_id,
        filename: response.data.original_filename 
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const processUploadedFile = async (
  fileId: string,
  filename: string,
  type: 'imgtocsv' | 'pdfcsv'
): Promise<ProcessingResult> => {
  try {
    const endpoint = type === 'imgtocsv' ? '/api/process/image-to-csv' : '/api/process/pdf-to-csv';
    const response = await api.post(endpoint, { file_id: fileId });

    if (response.data.error) {
      throw new Error(response.data.message || 'Processing failed');
    }

    const result: ProcessingResult = {
      id: `${type}_${Date.now()}`,
      fileName: filename,
      type: type,
      status: 'success',
      timestamp: new Date(),
      csvContent: '',
      downloadUrl: response.data.download_url ? `${API_BASE_URL}${response.data.download_url}` : '',
    };
    return result;

  } catch (error: any) {
    console.error(`Processing error for ${type}:`, error);
    throw error;
  }
};

export const mergeCsvFiles = async (baseFile: File, newFile: File): Promise<ProcessingResult> => {
    try {
        const formData = new FormData();
        formData.append('base_file', baseFile);
        formData.append('new_file', newFile);

        const response = await api.post('/api/process/merge-csv', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.error) {
            throw new Error(response.data.message || 'Merge failed');
        }

        const result: ProcessingResult = {
            id: `mergecsv_${Date.now()}`,
            fileName: `merged_${baseFile.name}_${newFile.name}`,
            type: 'mergecsv',
            status: 'success',
            timestamp: new Date(),
            csvContent: '',
            downloadUrl: response.data.download_url ? `${API_BASE_URL}${response.data.download_url}` : '',
        };
        return result;

    } catch (error: any) {
        console.error('Merge CSV error:', error);
        throw error;
    }
};
