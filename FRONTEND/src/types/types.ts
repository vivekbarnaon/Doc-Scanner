export type ProcessingType = 'imgtocsv' | 'pdfcsv' | 'mergecsv';

export interface ProcessingResult {
  id: string;
  type: ProcessingType;
  fileName: string;
  timestamp: Date;
  csvContent: string;
  downloadUrl?: string;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface ProcessingCardProps {
  type: ProcessingType;
  title: string;
  description: string;
  icon: 'image' | 'pdf' | 'merge';
  acceptedFiles: string;
  loading: boolean;
  multipleFiles?: boolean;
  onProcessingStart: (type: ProcessingType) => void;
  onProcessingComplete: (type: ProcessingType, result: ProcessingResult) => void;
  onProcessingError: (type: ProcessingType, error: string) => void;
}

export interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
  data?: any;
}
