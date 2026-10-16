import { supabase } from '../supabaseClient';

export interface CloudinaryConfigStatus {
  configured: boolean;
  cloudName: string | null;
  uploadPreset?: string | null;
  mode?: 'server_signed' | 'server_preset' | 'client_preset' | 'none';
}

export interface CloudinaryUploadResponse {
  success: boolean;
  secureUrl?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
  alreadyCloudinary?: boolean;
}

export interface MigrationScanItem {
  id: string;
  field: string;
  title: string;
  type: 'profile' | 'project' | 'seo';
  currentUrl: string;
  source: 'cloudinary' | 'netlify' | 'unsplash' | 'supabase' | 'data-uri' | 'external' | 'empty';
  sourceLabel: string;
  isEligible: boolean;
  status: 'pending' | 'uploading' | 'migrated' | 'failed' | 'skipped';
  folder: string;
  cloudinaryUrl?: string;
  error?: string;
}

// In-memory cache for credentials discovered from server or env
let cachedCloudName: string | null = null;
let cachedUploadPreset: string | null = null;

export function getClientCloudinaryCredentials(): { cloudName: string; uploadPreset: string } {
  const cloudName = 
    cachedCloudName ||
    (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME ||
    (import.meta as any).env?.CLOUDINARY_CLOUD_NAME ||
    '';
  const uploadPreset = 
    cachedUploadPreset ||
    (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET ||
    (import.meta as any).env?.CLOUDINARY_UPLOAD_PRESET ||
    '';
  return { cloudName, uploadPreset };
}

/**
 * Gets the current Supabase session token to authorize admin server actions
 */
async function getAuthToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (err) {
    console.warn('Could not read session access token:', err);
    return null;
  }
}

/**
 * Check whether Cloudinary credentials are set up on the server or in client environment
 */
export async function getCloudinaryStatus(): Promise<CloudinaryConfigStatus> {
  const { cloudName: clientCloud, uploadPreset: clientPreset } = getClientCloudinaryCredentials();

  try {
    const res = await fetch('/api/cloudinary/config');
    if (res.ok) {
      const data = await res.json();
      if (data.configured) {
        if (data.cloudName) cachedCloudName = data.cloudName;
        if (data.uploadPreset) cachedUploadPreset = data.uploadPreset;
        return {
          configured: true,
          cloudName: data.cloudName || clientCloud || null,
          uploadPreset: data.uploadPreset || clientPreset || null,
          mode: data.mode === 'signed_sdk' ? 'server_signed' : 'server_preset',
        };
      }
    }
  } catch (err) {
    console.warn('[Cloudinary Service] Server status check fallback to client env:', err);
  }

  // Fallback: check if client environment variables are provided
  if (clientCloud && clientPreset) {
    return {
      configured: true,
      cloudName: clientCloud,
      uploadPreset: clientPreset,
      mode: 'client_preset',
    };
  }

  return { 
    configured: false, 
    cloudName: clientCloud || null, 
    uploadPreset: clientPreset || null,
    mode: 'none' 
  };
}

/**
 * Direct Cloudinary REST API upload using unsigned upload preset
 */
async function directUploadToCloudinary(
  fileOrUrl: File | string,
  options: { folder?: string; publicId?: string } = {}
): Promise<CloudinaryUploadResponse> {
  const { cloudName, uploadPreset } = getClientCloudinaryCredentials();

  if (!cloudName || !uploadPreset) {
    return {
      success: false,
      error: 'Direct upload requires CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.',
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', fileOrUrl);
    formData.append('upload_preset', uploadPreset);
    if (options.folder) formData.append('folder', options.folder);
    if (options.publicId) formData.append('public_id', options.publicId);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Cloudinary upload failed (${res.status})`,
      };
    }

    return {
      success: true,
      secureUrl: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      alreadyCloudinary: false,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Direct Cloudinary upload request failed.',
    };
  }
}

/**
 * Upload an image file (File object or Data URL) to Cloudinary.
 * Tries server-side proxy route first, then gracefully falls back to direct unsigned preset upload.
 */
export async function uploadImageToCloudinary(
  fileOrDataUrl: File | string,
  options: { folder?: string; publicId?: string } = {}
): Promise<CloudinaryUploadResponse> {
  try {
    let payload = '';

    if (fileOrDataUrl instanceof File) {
      // Convert file to base64 data URI for server payload
      payload = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(fileOrDataUrl);
      });
    } else {
      payload = fileOrDataUrl;
    }

    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Try server endpoint
    try {
      const res = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          file: payload,
          folder: options.folder || 'portfolio',
          publicId: options.publicId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return {
            success: true,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            alreadyCloudinary: !!data.already_cloudinary
          };
        }
      }
    } catch (serverErr) {
      console.warn('[Cloudinary Service] Server proxy attempt failed, falling back to direct upload:', serverErr);
    }

    // Direct fallback with unsigned upload preset
    return await directUploadToCloudinary(fileOrDataUrl, options);
  } catch (err: any) {
    console.error('[Cloudinary Upload Error]', err);
    return {
      success: false,
      error: err?.message || 'Network exception while connecting to upload endpoint.'
    };
  }
}

/**
 * Migrate an existing remote image URL directly to Cloudinary.
 * Tries server proxy first, then falls back to direct upload with unsigned preset.
 */
export async function migrateRemoteUrlToCloudinary(
  remoteUrl: string,
  options: { folder?: string; publicId?: string } = {}
): Promise<CloudinaryUploadResponse> {
  // Guard: if already Cloudinary, do not re-upload
  if (remoteUrl.includes('res.cloudinary.com')) {
    return {
      success: true,
      secureUrl: remoteUrl,
      alreadyCloudinary: true
    };
  }

  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Try server endpoint
    try {
      const res = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          remoteUrl,
          folder: options.folder || 'portfolio',
          publicId: options.publicId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return {
            success: true,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            alreadyCloudinary: !!data.already_cloudinary
          };
        }
      }
    } catch (serverErr) {
      console.warn('[Cloudinary Service] Server proxy migrate failed, falling back to direct upload:', serverErr);
    }

    // Direct fallback
    return await directUploadToCloudinary(remoteUrl, options);
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network failure while requesting image migration.'
    };
  }
}
