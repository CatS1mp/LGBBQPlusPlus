import { Platform } from 'react-native';
import { apiClient } from '../api/client';
import { ENV } from '../../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Upload methods available for React Native
 */
export type UploadMethod = 'formdata' | 'base64' | 'blob';

/**
 * File upload options
 */
export type UploadOptions = {
  uri: string;
  type: string;
  name: string;
  method?: UploadMethod;
};

/**
 * Convert file URI to base64 string
 * 
 * NOTE: This requires one of:
 * 1. react-native-fs: npm install react-native-fs
 * 2. react-native-blob-util: npm install react-native-blob-util
 * 
 * FileReader is not available in React Native, so we need a native module
 * to read files. This is a placeholder - actual implementation depends on
 * which package you choose to install.
 * 
 * Example with react-native-fs:
 * ```typescript
 * import RNFS from 'react-native-fs';
 * const base64 = await RNFS.readFile(uri, 'base64');
 * ```
 * 
 * Example with react-native-blob-util:
 * ```typescript
 * import { fs } from 'react-native-blob-util';
 * const base64 = await fs.readFile(uri, 'base64');
 * ```
 */
export async function fileToBase64(uri: string): Promise<string> {
  // This is a placeholder - requires native module
  // See UPLOAD_METHODS.md for implementation details
  throw new Error(
    'fileToBase64 requires react-native-fs or react-native-blob-util. ' +
    'See UPLOAD_METHODS.md for implementation guide.'
  );
}

/**
 * Upload file using base64 encoding
 * Alternative to FormData - sends file as base64 string in JSON
 * 
 * NOTE: Requires react-native-fs or react-native-blob-util
 * See UPLOAD_METHODS.md for setup instructions
 */
export async function uploadFileAsBase64(
  url: string,
  options: UploadOptions
): Promise<Response> {
  const token = await getToken();
  const fullUrl = `${ENV.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}${url}`;

  console.log('📤 [UPLOAD] Using Base64 method:', {
    url,
    fullUrl,
    fileName: options.name,
    fileType: options.type,
  });

  try {
    // Convert file to base64 (requires native module)
    const base64String = await fileToBase64(options.uri);

    // Send as JSON with base64 data
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        file: base64String,
        fileName: options.name,
        fileType: options.type,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('❌ [UPLOAD] Base64 upload failed:', error);
    throw error;
  }
}

/**
 * Upload file using FormData (current method)
 */
export async function uploadFileAsFormData(
  url: string,
  options: UploadOptions
): Promise<Response> {
  const token = await getToken();
  const fullUrl = `${ENV.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}${url}`;

  console.log('📤 [UPLOAD] Using FormData method:', {
    url,
    fullUrl,
    fileName: options.name,
    fileType: options.type,
  });

  const formData = new FormData();
  formData.append('file', {
    uri: options.uri,
    type: options.type || 'application/octet-stream',
    name: options.name,
  } as any);

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Don't set Content-Type - let fetch handle FormData boundary
    },
    body: formData as any,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
}

/**
 * Get auth token from storage
 */
async function getToken(): Promise<string | null> {
  try {
    const authStorage = await AsyncStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Upload file with automatic method fallback
 * Tries methods in order: FormData → Base64 → Fetch API
 */
export async function uploadFileWithFallback(
  url: string,
  options: UploadOptions
): Promise<Response> {
  const methods: UploadMethod[] = options.method
    ? [options.method]
    : ['formdata', 'base64'];

  let lastError: Error | null = null;

  for (const method of methods) {
    try {
      console.log(`🔄 [UPLOAD] Trying method: ${method}`);
      
      if (method === 'base64') {
        return await uploadFileAsBase64(url, options);
      } else {
        // FormData
        return await uploadFileAsFormData(url, options);
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ [UPLOAD] Method ${method} failed:`, error);
      
      // If not last method, try next one
      if (methods.indexOf(method) < methods.length - 1) {
        console.log(`🔄 [UPLOAD] Falling back to next method...`);
        continue;
      }
    }
  }

  // All methods failed
  throw lastError || new Error('All upload methods failed');
}

/**
 * Check if backend supports base64 upload
 * Some backends expect multipart/form-data, some accept base64 JSON
 */
export function getRecommendedUploadMethod(): UploadMethod {
  // For now, default to formdata
  // Can be changed based on backend API requirements
  return 'formdata';
}

