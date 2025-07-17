import { getAuthHeaders } from '../utils/auth';

export interface UploadResponse {
  success: boolean;
  files: {
    originalname: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
  }[];
}

class UploadService {
  private baseUrl = '/api/upload';

  async uploadSingle(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/single`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  }

  async uploadMultiple(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseUrl}/multiple`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload files');
    }

    return response.json();
  }

  async deleteFile(key: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${key}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete file');
    }
  }

  async getFileInfo(key: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${key}/info`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get file info');
    }

    return response.json();
  }

  async getSignedUrl(key: string): Promise<{ url: string }> {
    const response = await fetch(`${this.baseUrl}/${key}/signed-url`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get signed URL');
    }

    return response.json();
  }
}

export default new UploadService();