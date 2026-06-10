import axios from 'axios';
import api from './axios';

interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  eager?: string;
  eager_async?: boolean;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  hlsUrl?: string;
  duration?: number;
}

/**
 * Upload a file directly to Cloudinary using a backend-generated signature
 */
export const uploadToCloudinary = async (
  file: File,
  resourceType: 'image' | 'video',
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> => {
  // 1. Get signature from backend
  const { data: config } = await api.get<SignatureResponse>(`/admin/cloudinary-signature?type=${resourceType}`);

  // 2. Prepare Form Data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', String(config.timestamp));
  formData.append('signature', config.signature);
  formData.append('folder', config.folder);
  
  if (config.eager) {
    formData.append('eager', config.eager);
    formData.append('eager_async', 'true');
  }

  // 3. Upload to Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;
  
  const response = await axios.post(uploadUrl, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onProgress(percentCompleted);
      }
    },
  });

  const result = response.data;

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    hlsUrl: result.eager?.[0]?.secure_url,
    duration: result.duration ? Math.round(result.duration) : undefined,
  };
};
