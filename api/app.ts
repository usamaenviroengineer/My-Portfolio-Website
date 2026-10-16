import express, { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary from server environment
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
const cloudinaryUrl = process.env.CLOUDINARY_URL || '';

if (cloudinaryUrl) {
  cloudinary.config({
    cloudinary_url: cloudinaryUrl,
  });
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function isCloudinaryConfigured(): boolean {
  const currentConfig = cloudinary.config();
  return !!(currentConfig.cloud_name && currentConfig.api_key && currentConfig.api_secret);
}

// Supabase client for validating admin JWT bearer tokens
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseServer = supabaseUrl && (supabaseServiceRole || supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseServiceRole || supabaseAnonKey)
  : null;

/**
 * Middleware: Verify admin session
 */
async function requireAdminAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  
  // If no auth token provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local dev without session token, check if dev mode allows
    if (process.env.NODE_ENV !== 'production' && !supabaseServer) {
      return next();
    }
    return res.status(401).json({
      error: 'Unauthorized: Missing Admin Authorization Bearer Token.',
      code: 'AUTH_REQUIRED'
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  // If service role key is passed directly
  if (supabaseServiceRole && token === supabaseServiceRole) {
    return next();
  }

  // Validate JWT with Supabase Auth
  if (supabaseServer) {
    try {
      const { data: { user }, error } = await supabaseServer.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({
          error: 'Unauthorized: Invalid or expired admin session token.',
          details: error?.message,
          code: 'INVALID_TOKEN'
        });
      }
      (req as any).user = user;
      return next();
    } catch (err: any) {
      return res.status(401).json({
        error: 'Unauthorized: Token verification failed.',
        details: err?.message,
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }
  }

  // Fallback for dev environments where server has no supabase key configured
  return next();
}

const app = express();

// Large body parser for base64 image data uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
const healthHandler = (_req: Request, res: Response) => {
  const currentConfig = cloudinary.config();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cloudinary: {
      configured: isCloudinaryConfigured(),
      cloudName: currentConfig.cloud_name || null,
    },
    supabase: {
      configured: !!supabaseServer,
    }
  });
};

// Cloudinary Public Config (Safe: never returns API Secret or Key!)
const configHandler = (_req: Request, res: Response) => {
  const currentConfig = cloudinary.config();
  res.json({
    configured: isCloudinaryConfigured(),
    cloudName: currentConfig.cloud_name || null,
  });
};

// Single Image Upload (Accepts remote URL or base64 data URI)
const uploadHandler = async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      error: 'Cloudinary credentials are not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel / environment variables.',
      code: 'CLOUDINARY_NOT_CONFIGURED'
    });
  }

  const { file, remoteUrl, folder = 'portfolio', publicId, tags = ['portfolio'] } = req.body;
  const targetSource = file || remoteUrl;

  if (!targetSource) {
    return res.status(400).json({
      error: 'Please provide either a "remoteUrl" (for migration) or "file" (base64 data URI).',
      code: 'MISSING_PAYLOAD'
    });
  }

  // If already hosted on Cloudinary and no new transformations requested, return as-is
  if (typeof targetSource === 'string' && targetSource.includes('res.cloudinary.com')) {
    return res.json({
      success: true,
      secure_url: targetSource,
      already_cloudinary: true,
      message: 'Image is already hosted on Cloudinary.'
    });
  }

  try {
    const uploadOptions: any = {
      folder: folder || 'portfolio',
      resource_type: 'image',
      tags: tags,
      overwrite: true,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(targetSource, uploadOptions);

    return res.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at
    });
  } catch (err: any) {
    console.error('[Cloudinary Upload Error]', err);
    return res.status(500).json({
      error: err?.message || 'Failed to upload image to Cloudinary.',
      details: err?.error || err,
      code: 'UPLOAD_FAILED'
    });
  }
};

// Batch Image Migration Handler
const batchMigrationHandler = async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      error: 'Cloudinary credentials are not configured on the server.',
      code: 'CLOUDINARY_NOT_CONFIGURED'
    });
  }

  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Payload must contain a non-empty "items" array.',
      code: 'INVALID_ITEMS'
    });
  }

  const results: any[] = [];

  for (const item of items) {
    const { id, remoteUrl, folder = 'portfolio', publicId } = item;

    if (!remoteUrl) {
      results.push({
        id,
        success: false,
        error: 'Missing remote URL',
        skipped: true
      });
      continue;
    }

    // Skip if already on Cloudinary
    if (remoteUrl.includes('res.cloudinary.com')) {
      results.push({
        id,
        success: true,
        secure_url: remoteUrl,
        already_cloudinary: true,
        skipped: true
      });
      continue;
    }

    try {
      const uploadOptions: any = {
        folder: folder || 'portfolio',
        resource_type: 'image',
        tags: ['portfolio_migration'],
        overwrite: true,
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const uploadRes = await cloudinary.uploader.upload(remoteUrl, uploadOptions);
      results.push({
        id,
        success: true,
        current_url: remoteUrl,
        secure_url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
        width: uploadRes.width,
        height: uploadRes.height,
        format: uploadRes.format
      });
    } catch (itemErr: any) {
      console.error(`[Batch Migration Failed for item ${id}]`, itemErr);
      results.push({
        id,
        success: false,
        current_url: remoteUrl,
        error: itemErr?.message || 'Cloudinary upload failed for this image.'
      });
    }
  }

  const successCount = results.filter(r => r.success && !r.skipped).length;
  const skippedCount = results.filter(r => r.skipped).length;
  const failCount = results.filter(r => !r.success).length;

  return res.json({
    success: true,
    summary: {
      total: items.length,
      migrated: successCount,
      skipped: skippedCount,
      failed: failCount
    },
    results
  });
};

// Mount routes on both /api/... and root (for flexible Vercel rewrites)
const router = express.Router();
router.get('/health', healthHandler);
router.get('/cloudinary/config', configHandler);
router.post('/cloudinary/upload', requireAdminAuth, uploadHandler);
router.post('/cloudinary/migrate-batch', requireAdminAuth, batchMigrationHandler);

app.use('/api', router);
app.use('/', router);

export default app;
