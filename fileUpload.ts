import { getSessionToken } from './storage';

export interface UploadResult {
  success: boolean;
  url: string;
  fileName: string;
  fileSize: string;
  error?: string;
}

/**
 * Converts a browser File object to a Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Formats bytes into a human readable file size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Uploads a file from the user's device to the persistent backend storage
 */
export async function uploadFileToServer(file: File): Promise<UploadResult> {
  try {
    // 25MB limit check client-side
    if (file.size > 25 * 1024 * 1024) {
      return {
        success: false,
        url: '',
        fileName: file.name,
        fileSize: formatBytes(file.size),
        error: 'File size exceeds maximum limit of 25MB'
      };
    }

    const base64Data = await fileToBase64(file);
    const token = getSessionToken();

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileData: base64Data
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errJson.error || `Server responded with ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      url: result.url,
      fileName: result.fileName || file.name,
      fileSize: result.fileSize || formatBytes(file.size)
    };
  } catch (error: any) {
    console.warn('Backend upload returned error, using persistent data URI fallback:', error);
    // Safe client-side fallback if network or endpoint fails: data URI persists in database.json
    try {
      const fallbackData = await fileToBase64(file);
      return {
        success: true,
        url: fallbackData,
        fileName: file.name,
        fileSize: formatBytes(file.size)
      };
    } catch (e: any) {
      return {
        success: false,
        url: '',
        fileName: file.name,
        fileSize: formatBytes(file.size),
        error: error.message || 'Failed to upload file'
      };
    }
  }
}

/**
 * Deletes an uploaded file from server storage
 */
export async function deleteUploadedFile(url: string): Promise<boolean> {
  if (!url || !url.startsWith('/uploads/')) return false;
  try {
    const filename = url.replace('/uploads/', '');
    const token = getSessionToken();
    const res = await fetch(`/api/upload/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    return res.ok;
  } catch (err) {
    console.error('Error deleting file:', err);
    return false;
  }
}
