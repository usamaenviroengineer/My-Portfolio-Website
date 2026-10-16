import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudLightning, 
  Search, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  X, 
  FolderGit, 
  Sparkles, 
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  Info,
  Server,
  SlidersHorizontal
} from 'lucide-react';
import { 
  getCloudinaryStatus, 
  migrateRemoteUrlToCloudinary, 
  CloudinaryConfigStatus,
  MigrationScanItem 
} from '../services/cloudinaryService';
import { getImageSourceType, isCloudinaryUrl } from '../utils/cloudinary';
import { USER_INFO } from '../data';
import { Project, SEOSettings } from '../types';

interface CloudinaryMigrationPanelProps {
  userInfo: typeof USER_INFO;
  projects: Project[];
  seoSettings: SEOSettings;
  saveUserInfo: (data: typeof USER_INFO) => Promise<boolean>;
  saveProjects: (data: Project[]) => Promise<boolean>;
  saveSEOSettings: (data: SEOSettings) => Promise<boolean>;
  triggerStatus: (text: string, type?: 'success' | 'error') => void;
}

export default function CloudinaryMigrationPanel({
  userInfo,
  projects,
  seoSettings,
  saveUserInfo,
  saveProjects,
  saveSEOSettings,
  triggerStatus
}: CloudinaryMigrationPanelProps) {
  // Cloudinary Backend Config State
  const [cloudStatus, setCloudStatus] = useState<CloudinaryConfigStatus>({
    configured: false,
    cloudName: null
  });
  const [statusLoading, setStatusLoading] = useState<boolean>(true);

  // Scanned Images State
  const [items, setItems] = useState<MigrationScanItem[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(false);

  // Migration Execution State
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'needs-migration' | 'migrated' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Cloudinary backend status on mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      setStatusLoading(true);
      const status = await getCloudinaryStatus();
      setCloudStatus(status);
    } catch {
      setCloudStatus({ configured: false, cloudName: null });
    } finally {
      setStatusLoading(false);
    }
  };

  // Perform full scan across current database records and configs
  const handleScanImages = () => {
    setIsScanning(true);
    const scanned: MigrationScanItem[] = [];

    // 1. Scan Profile & Bio Images
    const currentImages = userInfo?.images || USER_INFO.images;
    const profileKeys: Array<{ key: keyof typeof currentImages; title: string }> = [
      { key: 'hero', title: 'Hero Portrait Image' },
      { key: 'about', title: 'About Section Portrait' },
      { key: 'contact', title: 'Contact Section Artwork' },
      { key: 'creative', title: 'Creative Brand Photo 2' },
      { key: 'brand_4', title: 'Brand Artwork Photo 4' },
      { key: 'brand_6', title: 'Brand Artwork Photo 6' },
    ];

    profileKeys.forEach(({ key, title }) => {
      const url = currentImages[key] || '';
      const sourceInfo = getImageSourceType(url);
      const alreadyOnCloudinary = isCloudinaryUrl(url);

      scanned.push({
        id: `profile-${String(key)}`,
        field: `user_info.images.${String(key)}`,
        title,
        type: 'profile',
        currentUrl: url,
        source: sourceInfo.source,
        sourceLabel: sourceInfo.label,
        isEligible: !alreadyOnCloudinary && !!url.trim() && !url.startsWith('data:'),
        status: alreadyOnCloudinary ? 'skipped' : 'pending',
        folder: 'portfolio/profile',
        cloudinaryUrl: alreadyOnCloudinary ? url : undefined
      });
    });

    // 2. Scan Projects Images
    if (projects && projects.length > 0) {
      projects.forEach((proj, idx) => {
        const url = proj.imageUrl || '';
        const sourceInfo = getImageSourceType(url);
        const alreadyOnCloudinary = isCloudinaryUrl(url);

        scanned.push({
          id: `project-${proj.id || idx}`,
          field: `projects[${proj.id}].image_url`,
          title: `Project: ${proj.title || 'Untitled'}`,
          type: 'project',
          currentUrl: url,
          source: sourceInfo.source,
          sourceLabel: sourceInfo.label,
          isEligible: !alreadyOnCloudinary && !!url.trim() && !url.startsWith('data:'),
          status: alreadyOnCloudinary ? 'skipped' : 'pending',
          folder: 'portfolio/projects',
          cloudinaryUrl: alreadyOnCloudinary ? url : undefined
        });
      });
    }

    // 3. Scan SEO Image
    if (seoSettings?.ogImage) {
      const url = seoSettings.ogImage;
      const sourceInfo = getImageSourceType(url);
      const alreadyOnCloudinary = isCloudinaryUrl(url);

      scanned.push({
        id: 'seo-ogImage',
        field: 'seo_data.ogImage',
        title: 'SEO Social Preview Card (og:image)',
        type: 'seo',
        currentUrl: url,
        source: sourceInfo.source,
        sourceLabel: sourceInfo.label,
        isEligible: !alreadyOnCloudinary && !!url.trim() && !url.startsWith('data:'),
        status: alreadyOnCloudinary ? 'skipped' : 'pending',
        folder: 'portfolio/seo',
        cloudinaryUrl: alreadyOnCloudinary ? url : undefined
      });
    }

    setItems(scanned);
    setIsScanning(false);
    setHasScanned(true);

    const eligibleCount = scanned.filter(i => i.isEligible).length;
    const migratedCount = scanned.filter(i => isCloudinaryUrl(i.currentUrl)).length;
    triggerStatus(`Scan complete: ${scanned.length} total images identified. ${eligibleCount} eligible for migration, ${migratedCount} already on Cloudinary.`);
  };

  // Run initial scan on first render if empty
  useEffect(() => {
    if (!hasScanned && (userInfo || projects.length > 0)) {
      handleScanImages();
    }
  }, [userInfo, projects]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = items.length;
    const eligible = items.filter(i => i.isEligible && i.status !== 'migrated').length;
    const migrated = items.filter(i => i.status === 'migrated' || isCloudinaryUrl(i.currentUrl)).length;
    const failed = items.filter(i => i.status === 'failed').length;
    const netlifyCount = items.filter(i => i.source === 'netlify').length;

    const progressPercentage = total > 0 ? Math.round((migrated / total) * 100) : 0;

    return { total, eligible, migrated, failed, netlifyCount, progressPercentage };
  }, [items]);

  // Copy URL to clipboard helper
  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Migrate a single item
  const migrateSingleItem = async (item: MigrationScanItem): Promise<boolean> => {
    if (!item.currentUrl || isCloudinaryUrl(item.currentUrl)) return true;

    try {
      setCurrentItemId(item.id);
      // Mark as uploading
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading', error: undefined } : i));

      // 1. Call server API to upload remote image directly to Cloudinary
      const res = await migrateRemoteUrlToCloudinary(item.currentUrl, {
        folder: item.folder,
        publicId: item.id.replace(/[^a-zA-Z0-9_-]/g, '_')
      });

      if (!res.success || !res.secureUrl) {
        throw new Error(res.error || 'Server returned failure for Cloudinary upload.');
      }

      const newCloudinaryUrl = res.secureUrl;

      // 2. Persist the new Cloudinary URL to Supabase in the corresponding table/field
      let persistSuccess = false;

      if (item.type === 'profile') {
        const imageKey = item.field.replace('user_info.images.', '') as keyof typeof USER_INFO.images;
        const updatedImages = {
          ...(userInfo?.images || USER_INFO.images),
          [imageKey]: newCloudinaryUrl
        };
        const updatedUserInfo = {
          ...userInfo,
          images: updatedImages
        };
        persistSuccess = await saveUserInfo(updatedUserInfo);
      } else if (item.type === 'project') {
        const projId = item.id.replace('project-', '');
        const updatedProjects = projects.map(p => {
          if (p.id === projId) {
            return { ...p, imageUrl: newCloudinaryUrl };
          }
          return p;
        });
        persistSuccess = await saveProjects(updatedProjects);
      } else if (item.type === 'seo') {
        const updatedSeo = {
          ...seoSettings,
          ogImage: newCloudinaryUrl
        };
        persistSuccess = await saveSEOSettings(updatedSeo);
      }

      if (!persistSuccess) {
        console.warn(`[Migration Warning] Image uploaded to Cloudinary (${newCloudinaryUrl}), but Supabase database record update had warnings.`);
      }

      // 3. Update local state
      setItems(prev => prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            status: 'migrated',
            currentUrl: newCloudinaryUrl,
            cloudinaryUrl: newCloudinaryUrl,
            source: 'cloudinary',
            sourceLabel: 'Cloudinary CDN',
            isEligible: false,
            error: undefined
          };
        }
        return i;
      }));

      return true;
    } catch (err: any) {
      console.error(`[Migration Error for ${item.title}]`, err);
      setItems(prev => prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            status: 'failed',
            error: err?.message || 'Upload to Cloudinary failed.'
          };
        }
        return i;
      }));
      return false;
    } finally {
      setCurrentItemId(null);
    }
  };

  // Run bulk migration
  const handleStartMigration = async (retryFailedOnly = false) => {
    if (!cloudStatus.configured) {
      triggerStatus('Cloudinary credentials are not configured in Vercel/server environment. Check instructions below.', 'error');
      return;
    }

    const targets = items.filter(i => {
      if (retryFailedOnly) return i.status === 'failed';
      return i.isEligible && (i.status === 'pending' || i.status === 'failed');
    });

    if (targets.length === 0) {
      triggerStatus('No eligible images found for migration. All scanned images are already hosted on Cloudinary.');
      return;
    }

    setIsMigrating(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of targets) {
      const ok = await migrateSingleItem(item);
      if (ok) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsMigrating(false);

    if (failCount === 0) {
      triggerStatus(`Migration complete: ${successCount} image(s) successfully hosted on Cloudinary and saved to Supabase!`, 'success');
    } else {
      triggerStatus(`Migration finished with ${successCount} successful and ${failCount} failed. You can click "Retry Failed Items" anytime.`, 'error');
    }
  };

  // Filtered Items for Display
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(term);
      const matchField = item.field.toLowerCase().includes(term);
      const matchUrl = item.currentUrl.toLowerCase().includes(term);
      if (!matchTitle && !matchField && !matchUrl) return false;
    }

    // Tab filter
    if (activeFilter === 'needs-migration') {
      return item.isEligible && item.status !== 'migrated';
    }
    if (activeFilter === 'migrated') {
      return item.status === 'migrated' || isCloudinaryUrl(item.currentUrl);
    }
    if (activeFilter === 'failed') {
      return item.status === 'failed';
    }
    return true;
  });

  return (
    <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-8">
      {/* 1. Header with Cloudinary Branding & Integration Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C853]/10 border border-[#00C853]/20 flex items-center justify-center shadow-[0_0_12px_rgba(0,200,83,0.15)]">
              <CloudLightning className="w-5 h-5 text-[#00C853]" />
            </div>
            <div>
              <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">Cloudinary Image Migration</h2>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Vercel & Supabase CDN Architecture</p>
            </div>
          </div>
          <p className="font-sans text-xs text-zinc-400 mt-3 max-w-2xl leading-relaxed">
            Securely migrate legacy Netlify images and third-party media to Cloudinary. All migrated image URLs are automatically written to your existing Supabase database fields, delivering automatic WebP/AVIF format optimization and responsive sizing.
          </p>
        </div>

        {/* Backend Cloudinary Connection Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 ${
            cloudStatus.configured
              ? 'bg-[#00C853]/10 border-[#00C853]/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${cloudStatus.configured ? 'bg-[#00C853] animate-pulse' : 'bg-amber-400'}`} />
            <div className="text-left font-mono text-[10px] uppercase tracking-wider">
              <span className="block font-bold">
                {cloudStatus.configured ? 'Cloudinary Server Active' : 'Credentials Needed'}
              </span>
              <span className="text-zinc-400 text-[9px] lowercase font-sans">
                {cloudStatus.cloudName ? `cloud: ${cloudStatus.cloudName}` : 'Add Vercel env variables'}
              </span>
            </div>
          </div>

          <button
            onClick={checkBackendStatus}
            disabled={statusLoading}
            title="Refresh Cloudinary credentials check"
            className="p-2 hover:bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin text-[#00C853]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Configuration Alert Banner (if credentials are not set on Vercel yet) */}
      {!cloudStatus.configured && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5 text-amber-200 text-xs space-y-3">
          <div className="flex items-center gap-2.5 font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Cloudinary Environment Variables Setup Guide (Vercel)</span>
          </div>
          <p className="leading-relaxed text-zinc-300">
            To enable server-side Cloudinary uploads and migration on Vercel, go to your <strong>Vercel Project Settings &gt; Environment Variables</strong> and add:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
            <div className="bg-black/60 border border-white/5 p-2.5 rounded-lg">
              <span className="text-[#00C853] block text-[9px] uppercase tracking-wider">Cloud Name</span>
              <span className="text-white font-bold">CLOUDINARY_CLOUD_NAME</span>
            </div>
            <div className="bg-black/60 border border-white/5 p-2.5 rounded-lg">
              <span className="text-[#00C853] block text-[9px] uppercase tracking-wider">API Key</span>
              <span className="text-white font-bold">CLOUDINARY_API_KEY</span>
            </div>
            <div className="bg-black/60 border border-white/5 p-2.5 rounded-lg">
              <span className="text-[#00C853] block text-[9px] uppercase tracking-wider">API Secret</span>
              <span className="text-white font-bold">CLOUDINARY_API_SECRET</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">
            Once added in Vercel (or in your local <code className="text-emerald-400">.env</code> file), click the refresh button above to activate. You can scan and preview your images below right now.
          </p>
        </div>
      )}

      {/* 3. Migration Metrics & Progress Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121215] border border-white/5 p-4.5 rounded-xl">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">Scanned Images</span>
          <span className="font-display text-2xl font-black text-white mt-1 block">{stats.total}</span>
          <span className="font-mono text-[9px] text-zinc-400 mt-1 block">Hero, Projects, SEO</span>
        </div>

        <div className="bg-[#121215] border border-white/5 p-4.5 rounded-xl">
          <span className="font-mono text-[9px] text-amber-400 uppercase tracking-widest block">Pending Migration</span>
          <span className="font-display text-2xl font-black text-amber-300 mt-1 block">{stats.eligible}</span>
          <span className="font-mono text-[9px] text-amber-500/80 mt-1 block">{stats.netlifyCount} from Netlify host</span>
        </div>

        <div className="bg-[#121215] border border-white/5 p-4.5 rounded-xl">
          <span className="font-mono text-[9px] text-[#00C853] uppercase tracking-widest block">Cloudinary Hosted</span>
          <span className="font-display text-2xl font-black text-[#00C853] mt-1 block">{stats.migrated}</span>
          <span className="font-mono text-[9px] text-emerald-500/80 mt-1 block">{stats.progressPercentage}% complete</span>
        </div>

        <div className="bg-[#121215] border border-white/5 p-4.5 rounded-xl">
          <span className="font-mono text-[9px] text-red-400 uppercase tracking-widest block">Failed Uploads</span>
          <span className="font-display text-2xl font-black text-red-400 mt-1 block">{stats.failed}</span>
          <span className="font-mono text-[9px] text-zinc-500 mt-1 block">Retryable with 1-click</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-zinc-400">Migration Pipeline Progress</span>
          <span className="text-[#00C853] font-bold">{stats.migrated} / {stats.total} ({stats.progressPercentage}%)</span>
        </div>
        <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-linear-to-r from-[#00C853] to-emerald-400 rounded-full"
          />
        </div>
      </div>

      {/* 4. Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141418] border border-white/5 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Scan Images Button */}
          <button
            onClick={handleScanImages}
            disabled={isScanning || isMigrating}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border border-white/10"
          >
            <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#00C853]' : ''}`} />
            Scan Images
          </button>

          {/* Preview Migration Option */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            disabled={items.length === 0}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border border-white/10"
          >
            <Eye className="w-3.5 h-3.5 text-[#00C853]" />
            Preview Migration
          </button>

          {/* Start Migration Button */}
          <button
            onClick={() => handleStartMigration(false)}
            disabled={isMigrating || stats.eligible === 0 || !cloudStatus.configured}
            className="px-5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(0,200,83,0.2)]"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                Migrating ({stats.migrated}/{stats.total})...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black text-black" />
                Start Migration ({stats.eligible})
              </>
            )}
          </button>

          {/* Retry Failed Button (Appears if items failed) */}
          {stats.failed > 0 && (
            <button
              onClick={() => handleStartMigration(true)}
              disabled={isMigrating}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Failed ({stats.failed})
            </button>
          )}
        </div>

        {/* Resumable & Safe Indicator */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-[#00C853]" />
          <span>Resumable • Deduplicating • Non-Destructive</span>
        </div>
      </div>

      {/* 5. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${stats.total})` },
            { id: 'needs-migration', label: `Needs Migration (${stats.eligible})` },
            { id: 'migrated', label: `Cloudinary (${stats.migrated})` },
            { id: 'failed', label: `Failed (${stats.failed})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 font-bold'
                  : 'bg-black/30 hover:bg-white/5 text-zinc-400 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, field, or URL..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#141418] border border-white/5 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#00C853]/40"
          />
        </div>
      </div>

      {/* 6. Migration Items List / Table */}
      <div className="border border-white/5 rounded-xl overflow-hidden bg-[#101014]">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-2">
            <ImageIcon className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="font-sans text-xs">No images match your current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#141418] text-zinc-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">Preview</th>
                  <th className="py-3.5 px-4">Image & Target</th>
                  <th className="py-3.5 px-4">Origin Source</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Database Location</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => {
                  const isCurrent = currentItemId === item.id;
                  const isCloudinary = isCloudinaryUrl(item.currentUrl);

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isCurrent ? 'bg-[#00C853]/5' : ''
                      }`}
                    >
                      {/* Thumbnail Preview */}
                      <td className="py-3.5 px-4 w-16">
                        <div className="w-12 h-12 rounded-lg bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {item.currentUrl ? (
                            <img
                              src={item.currentUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                      </td>

                      {/* Title & Field ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="font-mono text-[9px] text-zinc-500 mt-0.5">{item.field}</div>
                      </td>

                      {/* Origin Source Host */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border font-mono text-[9px] uppercase font-bold tracking-wider ${
                          item.source === 'cloudinary'
                            ? 'bg-emerald-950/60 text-[#00C853] border-[#00C853]/30'
                            : item.source === 'netlify'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}>
                          {item.sourceLabel}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isCurrent ? (
                          <div className="flex items-center gap-2 text-amber-300 font-mono text-[10px]">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading to Cloudinary...</span>
                          </div>
                        ) : item.status === 'migrated' || isCloudinary ? (
                          <div className="flex items-center gap-1.5 text-[#00C853] font-mono text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Cloudinary Synced</span>
                          </div>
                        ) : item.status === 'failed' ? (
                          <div className="flex items-center gap-1.5 text-red-400 font-mono text-[10px]" title={item.error}>
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Failed (Click Retry)</span>
                          </div>
                        ) : (
                          <span className="font-mono text-[10px] text-zinc-400">Ready to Migrate</span>
                        )}
                      </td>

                      {/* Database Target Path */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] text-zinc-400 bg-black/40 px-2 py-1 rounded border border-white/5">
                          {item.type === 'profile' ? 'portfolio_configs.user_info' : item.type === 'project' ? 'projects.image_url' : 'portfolio_configs.seo_data'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Copy URL */}
                          {item.currentUrl && (
                            <button
                              onClick={() => handleCopy(item.currentUrl, item.id)}
                              title="Copy URL"
                              className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-all cursor-pointer"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-[#00C853]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Open external link */}
                          {item.currentUrl && (
                            <a
                              href={item.currentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open image in new tab"
                              className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-all cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Single migrate / retry button */}
                          {(!isCloudinary || item.status === 'failed') && (
                            <button
                              onClick={() => migrateSingleItem(item)}
                              disabled={isMigrating || isCurrent || !cloudStatus.configured}
                              className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                item.status === 'failed'
                                  ? 'bg-amber-500 hover:bg-amber-400 text-black'
                                  : 'bg-[#00C853] hover:bg-[#00E55F] text-black'
                              }`}
                            >
                              {item.status === 'failed' ? 'Retry' : 'Migrate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Preview Migration Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#121215] border border-white/10 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00C853]/10 border border-[#00C853]/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#00C853]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-base text-white">Migration Execution Plan Preview</h3>
                    <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">Pre-flight Verification</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Stats in Modal */}
              <div className="grid grid-cols-3 gap-3 bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block">Eligible to Upload</span>
                  <span className="font-display text-xl font-bold text-amber-300">{stats.eligible}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block">Already on Cloudinary</span>
                  <span className="font-display text-xl font-bold text-[#00C853]">{stats.migrated}</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block">Delivery Format</span>
                  <span className="font-display text-xs font-mono font-bold text-white mt-1 block">f_auto, q_auto (AVIF/WebP)</span>
                </div>
              </div>

              {/* Items List in Modal */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-300">Items to be Migrated:</h4>
                <div className="border border-white/5 rounded-xl divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {items.filter(i => i.isEligible && i.status !== 'migrated').map(item => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="font-mono text-[10px] text-zinc-500 truncate max-w-md">{item.currentUrl}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[10px] text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded border border-[#00C853]/20">
                          {item.folder}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats.eligible === 0 && (
                    <div className="p-6 text-center text-zinc-500 text-xs font-sans">
                      All scanned images have already been migrated to Cloudinary!
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-wider text-zinc-300 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleStartMigration(false);
                  }}
                  disabled={stats.eligible === 0 || !cloudStatus.configured}
                  className="px-5 py-2 bg-[#00C853] hover:bg-[#00E55F] disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  Proceed with Migration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
