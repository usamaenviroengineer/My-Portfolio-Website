import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  Upload, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  Layers, 
  ExternalLink, 
  FileText, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Code, 
  Quote, 
  Table, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  CheckSquare, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Maximize2, 
  Minimize2, 
  Save, 
  Send, 
  ArrowLeft, 
  X, 
  Globe, 
  Share2, 
  Flame, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';
import { BlogPost, BlogAuthor, BlogSEOMetadata } from '../types';
import { 
  getAllBlogsAdmin, 
  saveBlog, 
  deleteBlog, 
  toggleBlogStatus, 
  duplicateBlog, 
  slugify, 
  calculateReadingTime, 
  DEFAULT_AUTHOR 
} from '../services/blogService';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

interface BlogManagementPanelProps {
  onOpenLiveArticle?: (slug: string) => void;
}

export default function BlogManagementPanel({ onOpenLiveArticle }: BlogManagementPanelProps) {
  // Navigation inside Blog Panel
  const [activeView, setActiveView] = useState<'list' | 'editor' | 'categories'>('list');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filters for Posts List
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  // Active Post for Editor
  const [currentPost, setCurrentPost] = useState<BlogPost>({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: 'Air Quality & AI',
    tags: ['AI', 'Environmental Engineering'],
    author: DEFAULT_AUTHOR,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readingTime: '5 min read',
    status: 'draft',
    featured: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      ogImage: '',
    },
    views: 0,
  });

  // Editor states
  const [editorMode, setEditorMode] = useState<'visual' | 'split' | 'code' | 'preview'>('visual');
  const [isZenMode, setIsZenMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Saved');
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [seoPreviewTab, setSeoPreviewTab] = useState<'google' | 'twitter' | 'linkedin'>('google');

  // Modal for Insert Links / Images / Callouts / Tables
  const [modalType, setModalType] = useState<'image' | 'link' | 'callout' | 'table' | 'code' | null>(null);
  const [modalData, setModalData] = useState<any>({});

  const visualEditorRef = useRef<HTMLDivElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch blogs on mount
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllBlogsAdmin();
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync content between Visual Editor and State
  useEffect(() => {
    if (activeView === 'editor' && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== currentPost.content) {
        visualEditorRef.current.innerHTML = currentPost.content || '';
      }
    }
  }, [activeView, currentPost.id]);

  // Auto-generate slug when title changes for new posts
  const handleTitleChange = (newTitle: string) => {
    setCurrentPost((prev) => {
      const shouldUpdateSlug = !prev.id || prev.slug === slugify(prev.title);
      return {
        ...prev,
        title: newTitle,
        slug: shouldUpdateSlug ? slugify(newTitle) : prev.slug,
        seo: {
          ...prev.seo,
          metaTitle: prev.seo?.metaTitle || `${newTitle} — Usama Rasheed`,
        }
      };
    });
    setAutoSaveStatus('Unsaved changes');
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === 'published').length;
    const drafts = blogs.filter((b) => b.status === 'draft').length;
    const scheduled = blogs.filter((b) => b.status === 'scheduled').length;
    const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);
    return { total, published, drafts, scheduled, totalViews };
  }, [blogs]);

  // Filtered posts list
  const filteredBlogs = useMemo(() => {
    return blogs.filter((post) => {
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title?.toLowerCase().includes(q);
        const matchExcerpt = post.excerpt?.toLowerCase().includes(q);
        const matchSlug = post.slug?.toLowerCase().includes(q);
        const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchExcerpt || matchSlug || matchTags;
      }
      return true;
    });
  }, [blogs, statusFilter, categoryFilter, searchQuery]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set<string>(['Air Quality & AI', 'Biochar & Carbon', 'IoT & Hardware', 'Sustainable Tech', 'General']);
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [blogs]);

  // Handle Create New Post
  const handleCreateNew = () => {
    const newId = `blog-${Date.now()}`;
    setCurrentPost({
      id: newId,
      title: '',
      slug: '',
      excerpt: '',
      content: '<h2>Introduction</h2><p>Begin drafting your insights here...</p>',
      featuredImage: '',
      category: 'Air Quality & AI',
      tags: ['Research', 'Environmental AI'],
      author: DEFAULT_AUTHOR,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: '1 min read',
      status: 'draft',
      featured: false,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        ogImage: '',
      },
      views: 0,
    });
    setActiveView('editor');
    setAutoSaveStatus('Draft (unsaved)');
  };

  // Handle Edit Post
  const handleEdit = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setActiveView('editor');
    setAutoSaveStatus('Saved');
  };

  // Handle Delete Post
  const confirmDelete = async () => {
    if (!postToDelete) return;
    setActionLoading(true);
    const res = await deleteBlog(postToDelete.id);
    setActionLoading(false);
    if (res.success) {
      showToast('success', `Deleted article "${postToDelete.title}"`);
      setPostToDelete(null);
      loadPosts();
    } else {
      showToast('error', res.error || 'Failed to delete article');
    }
  };

  // Handle Toggle Publish/Draft
  const handleToggleStatus = async (post: BlogPost) => {
    setActionLoading(true);
    const res = await toggleBlogStatus(post.id);
    setActionLoading(false);
    if (res.success) {
      showToast('success', `Post status changed to ${res.newStatus}`);
      loadPosts();
    } else {
      showToast('error', 'Failed to toggle status');
    }
  };

  // Handle Duplicate
  const handleDuplicate = async (post: BlogPost) => {
    setActionLoading(true);
    const res = await duplicateBlog(post.id);
    setActionLoading(false);
    if (res.success && res.post) {
      showToast('success', `Created draft copy: "${res.post.title}"`);
      loadPosts();
    } else {
      showToast('error', 'Failed to duplicate article');
    }
  };

  // Save Post to Supabase / Local
  const handleSavePost = async (publishImmediate = false) => {
    setActionLoading(true);
    let contentToSave = currentPost.content;
    if (editorMode === 'visual' && visualEditorRef.current) {
      contentToSave = visualEditorRef.current.innerHTML;
    }

    const targetStatus = publishImmediate ? 'published' : currentPost.status;
    const postToSave: BlogPost = {
      ...currentPost,
      content: contentToSave,
      status: targetStatus,
      readingTime: calculateReadingTime(contentToSave),
      updatedAt: new Date().toISOString(),
      seo: {
        ...currentPost.seo,
        metaTitle: currentPost.seo?.metaTitle || currentPost.title,
        metaDescription: currentPost.seo?.metaDescription || currentPost.excerpt,
        ogImage: currentPost.seo?.ogImage || currentPost.featuredImage,
      }
    };

    const res = await saveBlog(postToSave);
    setActionLoading(false);

    if (res.success) {
      setCurrentPost(postToSave);
      setAutoSaveStatus('Saved to database');
      showToast('success', publishImmediate ? 'Article published live!' : 'Article draft saved successfully!');
      loadPosts();
    } else {
      showToast('error', res.error || 'Failed to save article');
    }
  };

  // Featured Image Cloudinary Upload
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFeatured(true);
    try {
      const res = await uploadImageToCloudinary(file, { folder: 'portfolio/blogs' });
      if (res.success && res.secureUrl) {
        setCurrentPost((prev) => ({
          ...prev,
          featuredImage: res.secureUrl!,
          seo: {
            ...prev.seo,
            ogImage: prev.seo?.ogImage || res.secureUrl!,
          }
        }));
        showToast('success', 'Featured image uploaded to Cloudinary!');
      } else {
        showToast('error', res.error || 'Upload failed');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Upload exception');
    } finally {
      setUploadingFeatured(false);
    }
  };

  // Inline Image Cloudinary Upload (for editor content)
  const handleInlineImageUpload = async (file: File) => {
    setUploadingInline(true);
    try {
      const res = await uploadImageToCloudinary(file, { folder: 'portfolio/blogs/inline' });
      if (res.success && res.secureUrl) {
        insertHtmlAtCursor(`
          <figure class="my-6">
            <img src="${res.secureUrl}" alt="Article Illustration" class="rounded-xl w-full max-h-[500px] object-cover border border-white/10" />
            <figcaption class="text-center font-mono text-xs text-zinc-500 mt-2">Article illustration</figcaption>
          </figure>
        `);
        showToast('success', 'Inline image uploaded to Cloudinary and inserted!');
      } else {
        showToast('error', res.error || 'Failed to upload image');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Upload failed');
    } finally {
      setUploadingInline(false);
      setModalType(null);
    }
  };

  // Visual Editor Formatting Command
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (editorMode === 'visual') {
      document.execCommand(command, false, value);
      if (visualEditorRef.current) {
        setCurrentPost((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
      }
    } else if (contentTextareaRef.current) {
      // Code / Markdown mode quick wrap
      const el = contentTextareaRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const text = el.value;
      const selected = text.substring(start, end);

      let replacement = selected;
      if (command === 'bold') replacement = `<strong>${selected}</strong>`;
      else if (command === 'italic') replacement = `<em>${selected}</em>`;
      else if (command === 'underline') replacement = `<u>${selected}</u>`;
      else if (command === 'formatBlock' && value) replacement = `<${value}>${selected}</${value}>`;

      const newContent = text.substring(0, start) + replacement + text.substring(end);
      setCurrentPost((prev) => ({ ...prev, content: newContent }));
    }
  };

  // Insert arbitrary HTML at cursor in Visual Editor
  const insertHtmlAtCursor = (html: string) => {
    if (editorMode === 'visual') {
      visualEditorRef.current?.focus();
      document.execCommand('insertHTML', false, html);
      if (visualEditorRef.current) {
        setCurrentPost((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
      }
    } else {
      setCurrentPost((prev) => ({ ...prev, content: prev.content + '\n' + html }));
    }
  };

  // Tags chip handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !currentPost.tags.includes(trimmed)) {
      setCurrentPost((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Word & Character count
  const metrics = useMemo(() => {
    const plainText = (currentPost.content || '').replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    const chars = plainText.length;
    const readTime = calculateReadingTime(currentPost.content);
    return { words, chars, readTime };
  }, [currentPost.content]);

  return (
    <div className="text-left w-full">
      {/* Toast Notification Banner */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-3 border transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-[#00C853] text-black border-[#00C853] font-bold'
              : 'bg-red-500 text-white border-red-600'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Delete Blog Article?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-white">"{postToDelete.title}"</strong>? This will permanently remove the article and its slug from your portfolio.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-black font-display text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Modal (Image, Link, Callout, Table, Code) */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141419] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative">
            <button 
              onClick={() => { setModalType(null); setModalData({}); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {modalType === 'image' && (
              <div>
                <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#00C853]" />
                  Insert Image with Cloudinary
                </h3>

                <div className="space-y-4">
                  <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#00C853]/50 transition-colors bg-white/5">
                    <input 
                      type="file" 
                      accept="image/*"
                      id="inline-file-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleInlineImageUpload(file);
                      }}
                    />
                    <label 
                      htmlFor="inline-file-input" 
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-[#00C853]" />
                      <span className="text-xs font-bold text-white">Click to upload from device to Cloudinary</span>
                      <span className="text-[10px] font-mono text-zinc-500">Auto-saved to Cloudinary folder /blogs/inline</span>
                    </label>
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="shrink mx-4 text-zinc-500 font-mono text-[10px] uppercase">Or provide URL</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Image URL</label>
                    <input 
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={modalData.url || ''}
                      onChange={(e) => setModalData({ ...modalData, url: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Caption / Alt Text</label>
                    <input 
                      type="text"
                      placeholder="Diagram showing biochar pyrolysis kinetics..."
                      value={modalData.caption || ''}
                      onChange={(e) => setModalData({ ...modalData, caption: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (modalData.url) {
                        insertHtmlAtCursor(`
                          <figure class="my-6">
                            <img src="${modalData.url}" alt="${modalData.caption || 'Article image'}" class="rounded-xl w-full max-h-[500px] object-cover border border-white/10" />
                            ${modalData.caption ? `<figcaption class="text-center font-mono text-xs text-zinc-500 mt-2">${modalData.caption}</figcaption>` : ''}
                          </figure>
                        `);
                        setModalType(null);
                        setModalData({});
                      }
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] transition-colors cursor-pointer"
                  >
                    Insert Image
                  </button>
                </div>
              </div>
            )}

            {modalType === 'callout' && (
              <div>
                <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00C853]" />
                  Insert Callout Box
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Callout Variant</label>
                    <select
                      value={modalData.variant || 'callout-info'}
                      onChange={(e) => setModalData({ ...modalData, variant: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    >
                      <option value="callout-info">Information (Blue)</option>
                      <option value="callout-tip">Key Tip / Insight (Green)</option>
                      <option value="callout-warning">Warning / Caution (Amber)</option>
                      <option value="callout-success">Verified Finding (Emerald)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Heading / Label</label>
                    <input 
                      type="text"
                      placeholder="Engineering Note:"
                      value={modalData.title || ''}
                      onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Message Text</label>
                    <textarea 
                      rows={3}
                      placeholder="Crucial takeaway or formula caveat..."
                      value={modalData.message || ''}
                      onChange={(e) => setModalData({ ...modalData, message: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const variant = modalData.variant || 'callout-info';
                      const title = modalData.title || 'Note:';
                      const msg = modalData.message || 'Callout message content';
                      insertHtmlAtCursor(`
                        <div class="callout ${variant}">
                          <strong>${title}</strong> ${msg}
                        </div>
                      `);
                      setModalType(null);
                      setModalData({});
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] transition-colors cursor-pointer"
                  >
                    Insert Callout
                  </button>
                </div>
              </div>
            )}

            {modalType === 'link' && (
              <div>
                <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-[#00C853]" />
                  Insert Hyperlink
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Display Text</label>
                    <input 
                      type="text"
                      placeholder="e.g., Copernicus Sentinel-5P Data Portal"
                      value={modalData.text || ''}
                      onChange={(e) => setModalData({ ...modalData, text: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Destination URL</label>
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={modalData.url || ''}
                      onChange={(e) => setModalData({ ...modalData, url: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (modalData.url) {
                        insertHtmlAtCursor(`<a href="${modalData.url}" target="_blank" rel="noopener noreferrer" class="text-[#00C853] underline hover:text-[#00963c]">${modalData.text || modalData.url}</a>`);
                        setModalType(null);
                        setModalData({});
                      }
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] transition-colors cursor-pointer"
                  >
                    Insert Link
                  </button>
                </div>
              </div>
            )}

            {modalType === 'code' && (
              <div>
                <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#00C853]" />
                  Insert Syntax-Formatted Code Block
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Language</label>
                    <select
                      value={modalData.lang || 'python'}
                      onChange={(e) => setModalData({ ...modalData, lang: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                    >
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript / JavaScript</option>
                      <option value="sql">PostgreSQL / SQL</option>
                      <option value="bash">Bash / Shell</option>
                      <option value="c">C / C++ (Embedded/ESP32)</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Code Snippet</label>
                    <textarea 
                      rows={6}
                      placeholder="# Enter your code here..."
                      value={modalData.code || ''}
                      onChange={(e) => setModalData({ ...modalData, code: e.target.value })}
                      className="w-full px-3 py-2 bg-black/60 font-mono border border-white/10 rounded-lg text-xs text-green-400"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const lang = modalData.lang || 'python';
                      const code = (modalData.code || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                      insertHtmlAtCursor(`
                        <pre><code class="language-${lang}">${code}</code></pre>
                      `);
                      setModalType(null);
                      setModalData({});
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] transition-colors cursor-pointer"
                  >
                    Insert Code Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: POSTS DASHBOARD & LIST */}
      {activeView === 'list' && (
        <div className="space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#00C853]" />
                <span className="font-mono text-[10px] text-[#00C853] uppercase font-bold tracking-widest">CMS Engine</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-white">Blog Management</h2>
              <p className="text-zinc-400 text-xs mt-1">
                Create, edit, schedule, and publish technical research articles on your portfolio.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadPosts}
                disabled={loading}
                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh posts from database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 rounded-xl bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00C853]/15"
              >
                <Plus className="w-4 h-4" />
                <span>New Article</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Total Articles</span>
              <div className="font-display font-black text-2xl text-white mt-1">{stats.total}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#00C853]">Live Published</span>
              <div className="font-display font-black text-2xl text-[#00C853] mt-1">{stats.published}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400">Drafts</span>
              <div className="font-display font-black text-2xl text-amber-400 mt-1">{stats.drafts}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Total Read Views</span>
              <div className="font-display font-black text-2xl text-white mt-1">{stats.totalViews}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 bg-[#0E0E12] rounded-xl border border-white/5">
            <div className="relative flex-grow max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search articles by title, tag, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-zinc-500 text-[10px] uppercase">Status:</span>
                {(['all', 'published', 'draft', 'scheduled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-colors cursor-pointer ${
                      statusFilter === st 
                        ? 'bg-[#00C853] text-black font-bold' 
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-zinc-500 text-[10px] uppercase">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-[#0E0E12] rounded-2xl border border-white/5 overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-zinc-500 font-mono text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#00C853]" />
                Loading articles from Supabase / Storage...
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="py-16 text-center px-4">
                <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="font-display font-bold text-white text-sm mb-1">No articles found</h4>
                <p className="text-zinc-500 text-xs mb-4">No posts match the current filter or search criteria.</p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 rounded-lg bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] cursor-pointer"
                >
                  Write Your First Article
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/40 border-b border-white/5 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Article</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date & Length</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBlogs.map((post) => (
                      <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                        {/* Article Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={post.featuredImage || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=200&auto=format&fit=crop"} 
                              alt={post.title}
                              className="w-12 h-10 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0"
                            />
                            <div className="min-w-0 max-w-sm">
                              <div className="flex items-center gap-1.5">
                                {post.featured && (
                                  <span className="text-[#00C853]" title="Featured Article">
                                    <Flame className="w-3.5 h-3.5 fill-[#00C853]" />
                                  </span>
                                )}
                                <h4 className="font-display font-bold text-white text-xs truncate group-hover:text-[#00C853] transition-colors">
                                  {post.title}
                                </h4>
                              </div>
                              <span className="font-mono text-[10px] text-zinc-500 truncate block">
                                /blogs/{post.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px]">
                            {post.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider cursor-pointer border transition-colors ${
                              post.status === 'published'
                                ? 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/30 hover:bg-[#00C853]/25'
                                : post.status === 'scheduled'
                                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                            }`}
                            title="Click to toggle publish/draft"
                          >
                            {post.status}
                          </button>
                        </td>

                        {/* Date & Read time */}
                        <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                          <div>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-[10px] text-zinc-500">{post.readingTime}</div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                if (onOpenLiveArticle) {
                                  onOpenLiveArticle(post.slug);
                                } else {
                                  window.open(`/blogs/${post.slug}`, '_blank');
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title="View Public Article"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(post)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title="Duplicate as Draft"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-1.5 rounded-lg bg-[#00C853]/10 hover:bg-[#00C853] text-[#00C853] hover:text-black transition-colors cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setPostToDelete(post)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: WRITING & EDITING STUDIO */}
      {activeView === 'editor' && (
        <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 bg-[#0A0A0C] p-8 overflow-y-auto' : ''}`}>
          
          {/* Top Bar Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#111115] border border-white/10 sticky top-20 z-40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('list')}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Articles</span>
              </button>
              <div className="h-4 w-px bg-white/10" />
              <div className="font-mono text-[11px] text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                <span>Status: <strong className="text-white capitalize">{currentPost.status}</strong></span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">{autoSaveStatus}</span>
              </div>
            </div>

            {/* View Mode Toggle & Zen Mode */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs font-mono">
                {(['visual', 'split', 'code', 'preview'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      // sync HTML before switching
                      if (editorMode === 'visual' && visualEditorRef.current) {
                        setCurrentPost((p) => ({ ...p, content: visualEditorRef.current?.innerHTML || '' }));
                      }
                      setEditorMode(mode);
                    }}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                      editorMode === mode ? 'bg-[#00C853] text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsZenMode(!isZenMode)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                title={isZenMode ? "Exit Zen Fullscreen" : "Zen Fullscreen Mode"}
              >
                {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleSavePost(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={() => handleSavePost(true)}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#00C853]/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Live</span>
              </button>
            </div>
          </div>

          {/* Title & Slug Form Header */}
          <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
            <div>
              <input 
                type="text"
                placeholder="Enter Article Title (e.g. AI-Powered Air Quality Forecasting...)"
                value={currentPost.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-transparent font-display font-black text-2xl sm:text-3xl text-white placeholder-zinc-600 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 uppercase text-[10px]">Slug:</span>
                <span className="text-zinc-500">/blogs/</span>
                <input 
                  type="text"
                  value={currentPost.slug}
                  onChange={(e) => setCurrentPost({ ...currentPost, slug: slugify(e.target.value) })}
                  className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-white font-mono text-xs focus:outline-hidden focus:border-[#00C853]"
                />
              </div>

              <div className="flex items-center gap-3 ml-auto text-[11px] text-zinc-400">
                <span>{metrics.words} words</span>
                <span>•</span>
                <span>{metrics.chars} characters</span>
                <span>•</span>
                <span className="text-[#00C853] font-bold">{metrics.readTime}</span>
              </div>
            </div>
          </div>

          {/* Main Writing Workspace (Editor on Left, Settings Sidebar on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Writing Canvas (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Rich Formatting Toolbar */}
              <div className="p-2.5 rounded-xl bg-[#141419] border border-white/10 flex flex-wrap items-center gap-1 text-zinc-300">
                {/* Block Formats */}
                <select
                  onChange={(e) => {
                    const tag = e.target.value;
                    if (tag === 'p') execCmd('formatBlock', 'p');
                    else execCmd('formatBlock', tag);
                  }}
                  className="px-2 py-1 bg-black/40 border border-white/10 rounded text-xs font-mono text-zinc-300 focus:outline-hidden"
                >
                  <option value="p">Paragraph</option>
                  <option value="h2">Heading 2 (H2)</option>
                  <option value="h3">Heading 3 (H3)</option>
                  <option value="h4">Heading 4 (H4)</option>
                </select>

                <div className="h-4 w-px bg-white/10 mx-1" />

                {/* Inline Styles */}
                <button 
                  onClick={() => execCmd('bold')} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => execCmd('italic')} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => execCmd('underline')} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => execCmd('strikeThrough')} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-white/10 mx-1" />

                {/* Lists */}
                <button 
                  onClick={() => execCmd('insertUnorderedList')} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => execCmd('insertOrderedList')} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-white/10 mx-1" />

                {/* Rich Block Inserts */}
                <button 
                  onClick={() => setModalType('image')} 
                  className="px-2 py-1 rounded bg-[#00C853]/10 hover:bg-[#00C853] text-[#00C853] hover:text-black font-mono text-[11px] flex items-center gap-1 transition-colors" 
                  title="Insert Cloudinary Image"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image</span>
                </button>

                <button 
                  onClick={() => setModalType('callout')} 
                  className="px-2 py-1 rounded hover:bg-white/10 text-zinc-300 font-mono text-[11px] flex items-center gap-1 transition-colors" 
                  title="Insert Callout Alert Box"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Callout</span>
                </button>

                <button 
                  onClick={() => setModalType('code')} 
                  className="px-2 py-1 rounded hover:bg-white/10 text-zinc-300 font-mono text-[11px] flex items-center gap-1 transition-colors" 
                  title="Insert Code Block"
                >
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Code</span>
                </button>

                <button 
                  onClick={() => setModalType('link')} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Insert Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>

                <button 
                  onClick={() => {
                    const author = prompt('Quote citation / author (optional):') || '';
                    insertHtmlAtCursor(`
                      <blockquote>
                        "Enter memorable engineering citation or quote here."
                        ${author ? `<cite class="block font-mono text-xs text-[#00C853] mt-2">— ${author}</cite>` : ''}
                      </blockquote>
                    `);
                  }} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Insert Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>

                <button 
                  onClick={() => {
                    insertHtmlAtCursor(`
                      <div class="table-container my-6">
                        <table>
                          <thead>
                            <tr>
                              <th>Parameter</th>
                              <th>Baseline</th>
                              <th>Target</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Sensor Calibration</td>
                              <td>Raw ADC</td>
                              <td>Kohler Corrected</td>
                              <td>Verified</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    `);
                  }} 
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white" 
                  title="Insert Table"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>

                <button 
                  onClick={() => insertHtmlAtCursor('<hr class="my-8 border-white/10" />')} 
                  className="px-2 py-1 rounded hover:bg-white/10 text-zinc-400 text-xs font-mono" 
                  title="Horizontal Divider"
                >
                  Divider
                </button>
              </div>

              {/* Visual Editor Canvas */}
              {editorMode === 'visual' && (
                <div 
                  ref={visualEditorRef}
                  contentEditable
                  onInput={() => {
                    if (visualEditorRef.current) {
                      setCurrentPost((prev) => ({
                        ...prev,
                        content: visualEditorRef.current?.innerHTML || '',
                      }));
                      setAutoSaveStatus('Unsaved changes');
                    }
                  }}
                  className="min-h-[550px] p-8 rounded-2xl bg-[#0E0E12] border border-white/10 prose prose-invert max-w-none focus:outline-hidden text-left leading-relaxed font-sans blog-article-content shadow-inner"
                  style={{ minHeight: '600px' }}
                />
              )}

              {/* Code / Markdown Canvas */}
              {editorMode === 'code' && (
                <textarea 
                  ref={contentTextareaRef}
                  rows={25}
                  value={currentPost.content}
                  onChange={(e) => {
                    setCurrentPost({ ...currentPost, content: e.target.value });
                    setAutoSaveStatus('Unsaved changes');
                  }}
                  className="w-full min-h-[600px] p-6 rounded-2xl bg-[#0E0E12] border border-white/10 font-mono text-xs text-green-300 leading-relaxed focus:outline-hidden focus:border-[#00C853]"
                />
              )}

              {/* Split Screen Mode */}
              {editorMode === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea 
                    rows={25}
                    value={currentPost.content}
                    onChange={(e) => {
                      setCurrentPost({ ...currentPost, content: e.target.value });
                      setAutoSaveStatus('Unsaved changes');
                    }}
                    className="w-full min-h-[600px] p-4 rounded-2xl bg-[#0E0E12] border border-white/10 font-mono text-xs text-green-300 leading-relaxed focus:outline-hidden"
                  />
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentPost.content }}
                    className="min-h-[600px] p-6 rounded-2xl bg-[#0E0E12] border border-white/10 prose prose-invert max-w-none text-left overflow-y-auto blog-article-content"
                  />
                </div>
              )}

              {/* Full Live Preview */}
              {editorMode === 'preview' && (
                <div className="p-8 rounded-2xl bg-[#0A0A0C] border border-white/10 text-left">
                  <div className="mb-6">
                    <span className="px-3 py-1 rounded-full bg-[#00C853]/15 text-[#00C853] font-mono text-xs uppercase font-bold">
                      {currentPost.category}
                    </span>
                    <h1 className="font-display font-black text-3xl sm:text-4xl text-white mt-3 mb-2">
                      {currentPost.title || 'Untitled Article'}
                    </h1>
                    {currentPost.excerpt && (
                      <p className="text-zinc-400 text-base leading-relaxed mb-4">{currentPost.excerpt}</p>
                    )}
                  </div>

                  {currentPost.featuredImage && (
                    <img 
                      src={currentPost.featuredImage} 
                      alt={currentPost.title}
                      className="rounded-xl w-full max-h-[450px] object-cover mb-8 border border-white/10"
                    />
                  )}

                  <div 
                    className="prose prose-invert max-w-none leading-relaxed blog-article-content"
                    dangerouslySetInnerHTML={{ __html: currentPost.content }}
                  />
                </div>
              )}
            </div>

            {/* Right Settings & Metadata Rail (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Publication Settings Card */}
              <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00C853]" />
                  Publishing Settings
                </h3>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Status</label>
                  <select
                    value={currentPost.status}
                    onChange={(e: any) => setCurrentPost({ ...currentPost, status: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                  >
                    <option value="draft">Draft (Unpublished)</option>
                    <option value="published">Published (Live to public)</option>
                    <option value="scheduled">Scheduled for release</option>
                  </select>
                </div>

                {currentPost.status === 'scheduled' && (
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">Scheduled Date & Time</label>
                    <input 
                      type="datetime-local"
                      value={currentPost.scheduledDate ? currentPost.scheduledDate.substring(0, 16) : ''}
                      onChange={(e) => setCurrentPost({ ...currentPost, scheduledDate: new Date(e.target.value).toISOString() })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                )}

                {/* Featured Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs font-bold text-white block">Featured Article</span>
                    <span className="text-[10px] font-mono text-zinc-500">Pin to hero section on /blogs</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={currentPost.featured}
                    onChange={(e) => setCurrentPost({ ...currentPost, featured: e.target.checked })}
                    className="w-5 h-5 accent-[#00C853] rounded cursor-pointer"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Category</label>
                  <select
                    value={currentPost.category}
                    onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Tags multi-chip input */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Tags (Keywords)</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="text"
                      placeholder="Add tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-grow px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-hidden"
                    />
                    <button
                      onClick={handleAddTag}
                      type="button"
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-mono text-white cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPost.tags?.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-1">
                        #{t}
                        <button 
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-red-400 text-zinc-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Short Excerpt (Summary)</label>
                  <textarea 
                    rows={3}
                    placeholder="Brief 1-2 sentence hook for cards and search results..."
                    value={currentPost.excerpt}
                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white leading-relaxed focus:outline-hidden focus:border-[#00C853]"
                  />
                </div>
              </div>

              {/* Featured Image with Cloudinary Upload Card */}
              <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#00C853]" />
                  Featured Image
                </h3>

                {currentPost.featuredImage ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden aspect-[16/10] border border-white/10 bg-black/40">
                      <img 
                        src={currentPost.featuredImage} 
                        alt="Featured Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setCurrentPost({ ...currentPost, featuredImage: '' })}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                        title="Remove featured image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500 break-all truncate block">
                      {currentPost.featuredImage}
                    </span>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#00C853]/50 transition-colors bg-white/5">
                    <input 
                      type="file" 
                      accept="image/*"
                      id="featured-upload-input"
                      className="hidden"
                      onChange={handleFeaturedImageUpload}
                    />
                    <label 
                      htmlFor="featured-upload-input" 
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      {uploadingFeatured ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#00C853]" />
                      ) : (
                        <Upload className="w-6 h-6 text-[#00C853]" />
                      )}
                      <span className="text-xs font-bold text-white">
                        {uploadingFeatured ? 'Uploading to Cloudinary...' : 'Upload Featured Image to Cloudinary'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">Supports PNG, JPG, WebP</span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Or direct Image URL</label>
                  <input 
                    type="text"
                    placeholder="https://..."
                    value={currentPost.featuredImage}
                    onChange={(e) => setCurrentPost({ ...currentPost, featuredImage: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              {/* SEO & Social Share Preview Card */}
              <div className="p-6 rounded-2xl bg-[#111115] border border-white/10 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#00C853]" />
                  SEO & Social Previews
                </h3>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-400">Meta Title</label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {(currentPost.seo?.metaTitle || currentPost.title).length}/60
                    </span>
                  </div>
                  <input 
                    type="text"
                    value={currentPost.seo?.metaTitle || currentPost.title}
                    onChange={(e) => setCurrentPost({
                      ...currentPost,
                      seo: { ...currentPost.seo, metaTitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-400">Meta Description</label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {(currentPost.seo?.metaDescription || currentPost.excerpt).length}/160
                    </span>
                  </div>
                  <textarea 
                    rows={2}
                    value={currentPost.seo?.metaDescription || currentPost.excerpt}
                    onChange={(e) => setCurrentPost({
                      ...currentPost,
                      seo: { ...currentPost.seo, metaDescription: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                  />
                </div>

                {/* Social Card Live Previews */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Social Card Preview:</span>
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      {(['google', 'twitter', 'linkedin'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setSeoPreviewTab(tab)}
                          className={`px-2 py-0.5 rounded capitalize ${
                            seoPreviewTab === tab ? 'bg-[#00C853] text-black font-bold' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Google Preview */}
                  {seoPreviewTab === 'google' && (
                    <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-left font-sans text-xs">
                      <div className="text-[11px] text-zinc-400 truncate">
                        https://usamarasheed.com › blogs › {currentPost.slug || 'article-slug'}
                      </div>
                      <div className="text-blue-400 hover:underline font-medium text-sm line-clamp-1 mt-0.5">
                        {currentPost.seo?.metaTitle || currentPost.title || 'Article Title'}
                      </div>
                      <div className="text-zinc-400 text-[11px] line-clamp-2 mt-1">
                        {currentPost.seo?.metaDescription || currentPost.excerpt || 'Article summary description snippet...'}
                      </div>
                    </div>
                  )}

                  {/* Twitter / X Preview */}
                  {seoPreviewTab === 'twitter' && (
                    <div className="rounded-xl overflow-hidden border border-white/15 bg-black/70 text-left">
                      <div className="aspect-[2/1] bg-black/40 overflow-hidden">
                        <img 
                          src={currentPost.seo?.ogImage || currentPost.featuredImage || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=600&auto=format&fit=crop"} 
                          alt="Twitter card preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <span className="font-mono text-[10px] text-zinc-500 uppercase">usamarasheed.com</span>
                        <h5 className="font-bold text-xs text-white line-clamp-1 mt-0.5">
                          {currentPost.seo?.metaTitle || currentPost.title}
                        </h5>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                          {currentPost.seo?.metaDescription || currentPost.excerpt}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Preview */}
                  {seoPreviewTab === 'linkedin' && (
                    <div className="rounded-xl overflow-hidden border border-white/15 bg-[#1b1f23] text-left">
                      <div className="aspect-[1.91/1] bg-black/40 overflow-hidden">
                        <img 
                          src={currentPost.seo?.ogImage || currentPost.featuredImage || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=600&auto=format&fit=crop"} 
                          alt="LinkedIn card preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 bg-[#161a1d]">
                        <h5 className="font-bold text-xs text-white line-clamp-1">
                          {currentPost.seo?.metaTitle || currentPost.title}
                        </h5>
                        <span className="font-mono text-[10px] text-zinc-400">usamarasheed.com • 6 min read</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
