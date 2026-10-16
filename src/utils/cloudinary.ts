/**
 * Cloudinary Delivery & Optimization Utilities
 * Handles automatic format, quality, and responsive delivery for images.
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Checks whether a given URL is already hosted on Cloudinary
 */
export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Identifies the hosting source of an image URL for auditing
 */
export function getImageSourceType(url?: string | null): {
  source: 'cloudinary' | 'netlify' | 'unsplash' | 'supabase' | 'data-uri' | 'external' | 'empty';
  label: string;
  badgeClass: string;
} {
  if (!url || !url.trim()) {
    return {
      source: 'empty',
      label: 'Missing URL',
      badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700'
    };
  }

  if (url.startsWith('data:')) {
    return {
      source: 'data-uri',
      label: 'Inline Base64',
      badgeClass: 'bg-purple-900/40 text-purple-300 border-purple-700/50'
    };
  }

  if (url.includes('res.cloudinary.com') || url.includes('cloudinary.com')) {
    return {
      source: 'cloudinary',
      label: 'Cloudinary CDN',
      badgeClass: 'bg-emerald-950/60 text-[#00C853] border-[#00C853]/30'
    };
  }

  if (url.includes('netlify.app')) {
    return {
      source: 'netlify',
      label: 'Netlify (Migrate)',
      badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40'
    };
  }

  if (url.includes('images.unsplash.com')) {
    return {
      source: 'unsplash',
      label: 'Unsplash Remote',
      badgeClass: 'bg-blue-950/60 text-blue-300 border-blue-500/30'
    };
  }

  if (url.includes('supabase.co/storage')) {
    return {
      source: 'supabase',
      label: 'Supabase Storage',
      badgeClass: 'bg-teal-950/60 text-teal-300 border-teal-500/30'
    };
  }

  return {
    source: 'external',
    label: 'External Origin',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700'
  };
}

/**
 * Transforms a Cloudinary URL to use automatic format (f_auto), automatic quality (q_auto),
 * and optional width/cropping constraints.
 * 
 * If the URL is NOT hosted on Cloudinary, it is returned untouched to preserve compatibility.
 */
export function getOptimizedImageUrl(
  url?: string | null, 
  options: CloudinaryTransformOptions = {}
): string {
  if (!url) return '';
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  try {
    const {
      width,
      height,
      crop = 'limit',
      quality = 'auto',
      format = 'auto',
      gravity
    } = options;

    // Build transformation string
    const transformations: string[] = [];
    
    // Automatic format and quality
    if (format) transformations.push(`f_${format}`);
    if (quality) transformations.push(`q_${quality}`);
    
    // Width and crop
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if ((width || height) && crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);

    const transformStr = transformations.join(',');

    // Match Cloudinary standard URL structure:
    // .../image/upload/[existing_transforms/]v[0-9]+/...
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const prefix = url.substring(0, uploadIndex + '/upload/'.length);
    const suffix = url.substring(uploadIndex + '/upload/'.length);

    // If URL already contains f_auto and q_auto without specific size change, return as is
    if (suffix.includes('f_auto') && suffix.includes('q_auto') && !width && !height) {
      return url;
    }

    return `${prefix}${transformStr}/${suffix}`;
  } catch (err) {
    console.warn('Error optimizing Cloudinary URL:', err);
    return url;
  }
}
