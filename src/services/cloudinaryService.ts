import { supabase } from '../supabaseClient';

export interface CloudinaryConfigStatus {
  configured: boolean;
  cloudName: string | null;
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
 * Check whether Cloudinary credentials are set up on the server
 */
export async function getCloudinaryStatus(): Promise<CloudinaryConfigStatus> {
  try {
    const res = await fetch('/api/cloudinary/config');
    if (!res.ok) {
      return { configured: false, cloudName: null };
    }
    const data = await res.json();
    return {
      configured: !!data.configured,
      cloudName: data.cloudName || null
    };
  } catch (err) {
    console.warn('[Cloudinary Service] Could not verify backend config:', err);
    return { configured: false, cloudName: null };
  }
}

/**
 * Upload an image file (File object or Data URL) securely via the server-side API to Cloudinary
 */
export async function uploadImageToCloudinary(
  fileOrDataUrl: File | string,
  options: { folder?: string; publicId?: string } = {}
): Promise<CloudinaryUploadResponse> {
  try {
    let payload = '';

    if (fileOrDataUrl instanceof File) {
      // Convert file to base64 data URI
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

    const res = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        file: payload,
        folder: options.folder || 'portfolio',
        publicId: options.publicId,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Upload failed with status ${res.status}`
      };
    }

    return {
      success: true,
      secureUrl: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      alreadyCloudinary: !!data.already_cloudinary
    };
  } catch (err: any) {
    console.error('[Cloudinary Upload Error]', err);
    return {
      success: false,
      error: err?.message || 'Network exception while connecting to upload endpoint.'
    };
  }
}

/**
 * Migrate an existing remote image URL directly to Cloudinary
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

    const res = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        remoteUrl,
        folder: options.folder || 'portfolio',
        publicId: options.publicId,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Migration request failed (${res.status})`
      };
    }

    return {
      success: true,
      secureUrl: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      alreadyCloudinary: !!data.already_cloudinary
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network failure while requesting image migration.'
    };
  }
}
