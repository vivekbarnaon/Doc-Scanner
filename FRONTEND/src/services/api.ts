import axios from 'axios';
import { ProcessingResult } from '../types/types';

// --- Configuration ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
});

// --- Interceptors ---
// ...existing code...
// --- API Functions ---

export const uploadFile = async (file: File): Promise<{ file_id: string; filename: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

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
    // FastAPI expects file_id in URL and action as query param
    const action = type === 'imgtocsv' ? 'img' : 'pdf';
    const response = await api.post(`/api/process/${fileId}?action=${action}`);

    const result: ProcessingResult = {
      id: `${type}_${Date.now()}`,
      fileName: filename,
      type: type,
      status: 'success',
      timestamp: new Date(),
      csvContent: '',
      // FastAPI returns output_file path, we need to get download URL from /api/download/{path}
      downloadUrl: `${API_BASE_URL}/api/download/${response.data.output_file}`,
    };
    return result;

  } catch (error: any) {
    console.error(`Processing error for ${type}:`, error);
    throw error;
  }
};

export const mergeCsvFiles = async (baseFile: File, newFile: File): Promise<ProcessingResult> => {
    // Note: Temporary logic as merge endpoint needs adjustment for FastAPI
    try {
        const formData = new FormData();
        formData.append('file', newFile); // Using upload first for merge logic context

        const response = await api.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        const fileId = response.data.file_id;
        const processResponse = await api.post(`/api/process/${fileId}?action=merge`);

        const result: ProcessingResult = {
            id: `mergecsv_${Date.now()}`,
            fileName: `merged_${newFile.name}`,
            type: 'mergecsv',
            status: 'success',
            timestamp: new Date(),
            csvContent: '',
            downloadUrl: `${API_BASE_URL}/api/download/${processResponse.data.output_file}`,
        };
        return result;

    } catch (error: any) {
        console.error('Merge CSV error:', error);
        throw error;
    }
};
