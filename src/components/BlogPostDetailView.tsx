import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  Copy, 
  Printer, 
  ChevronRight, 
  ArrowRight, 
  ExternalLink,
  BookOpen,
  Sparkles,
  Tag,
  Eye,
  Bookmark
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { BlogPost } from '../types';
import { getBlogBySlug, getPublishedBlogs, incrementBlogViews } from '../services/blogService';

interface BlogPostDetailViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogPostDetailView({ slug, onNavigate }: BlogPostDetailViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTocId, setActiveTocId] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);

  // Load Post and Published Posts List
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([getBlogBySlug(slug), getPublishedBlogs()])
      .then(([currentPost, list]) => {
        if (!mounted) return;
        if (!currentPost) {
          setError(`No article found for "${slug}".`);
          setLoading(false);
          return;
        }
        setPost(currentPost);
        setAllPosts(list);
        setLoading(false);
        incrementBlogViews(slug);

        // Update document title and dynamic meta tags for SEO
        document.title = currentPost.seo?.metaTitle || `${currentPost.title} — Usama Rasheed`;
      })
      .catch((err) => {
        console.error('Error fetching blog detail:', err);
        if (mounted) {
          setError('Failed to load article.');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  // Reading progress tracker & ScrollSpy
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }

      // ScrollSpy for TOC
      const headings = document.querySelectorAll('article h2, article h3');
      let currentHeadingId = '';
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 140) {
          currentHeadingId = heading.id;
        }
      });
      if (currentHeadingId) {
        setActiveTocId(currentHeadingId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse Headings from content for Table of Contents
  const tocItems = useMemo<TocItem[]>(() => {
    if (!post?.content) return [];
    
    // Create temporary parser DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    const items: TocItem[] = [];

    headings.forEach((h, idx) => {
      const text = h.textContent?.trim() || '';
      if (text) {
        // Generate or extract id
        const id = h.id || `section-${idx}-${text.toLowerCase().replace(/[^\w]+/g, '-')}`;
        items.push({
          id,
          text,
          level: h.tagName.toLowerCase() === 'h2' ? 2 : 3,
        });
      }
    });

    return items;
  }, [post?.content]);

  // Insert IDs into post HTML content dynamically for smooth jump links
  const processedHtmlContent = useMemo(() => {
    if (!post?.content) return '';
    let counter = 0;
    return post.content.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const existingIdMatch = attrs.match(/id=["'](.*?)["']/);
      const id = existingIdMatch ? existingIdMatch[1] : `section-${counter++}-${plainText.toLowerCase().replace(/[^\w]+/g, '-')}`;
      const cleanAttrs = attrs.replace(/id=["'].*?["']/, '');
      return `<${tag} id="${id}" ${cleanAttrs} class="scroll-mt-28">${content}</${tag}>`;
    });
  }, [post?.content]);

  // Calculate Previous and Next Articles
  const { prevPost, nextPost, relatedPosts } = useMemo(() => {
    if (!post || allPosts.length === 0) {
      return { prevPost: null, nextPost: null, relatedPosts: [] };
    }
    const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
    const prev = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const next = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

    // Related posts (same category or shared tags, excluding current)
    const related = allPosts
      .filter((p) => p.slug !== post.slug)
      .sort((a, b) => {
        let scoreA = a.category === post.category ? 2 : 0;
        let scoreB = b.category === post.category ? 2 : 0;
        if (a.tags && post.tags) {
          scoreA += a.tags.filter((t) => post.tags.includes(t)).length;
        }
        if (b.tags && post.tags) {
          scoreB += b.tags.filter((t) => post.tags.includes(t)).length;
        }
        return scoreB - scoreA;
      })
      .slice(0, 3);

    return { prevPost: prev, nextPost: next, relatedPosts: related };
  }, [post, allPosts]);

  // Attach code block copy listeners dynamically
  useEffect(() => {
    const codeBlocks = document.querySelectorAll('article pre');
    codeBlocks.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return; // already attached
      
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-white/10 hover:bg-[#00C853] hover:text-black text-white text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 z-10';
      btn.innerHTML = '<span>Copy</span>';
      
      btn.onclick = () => {
        const code = pre.querySelector('code')?.textContent || pre.textContent || '';
        navigator.clipboard.writeText(code);
        btn.innerHTML = '<span>Copied!</span>';
        setTimeout(() => {
          btn.innerHTML = '<span>Copy</span>';
        }, 2000);
      };

      (pre as HTMLElement).style.position = 'relative';
      pre.appendChild(btn);
    });
  }, [processedHtmlContent]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post?.title || '')}&url=${encodeURIComponent(window.location.href)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${post?.title} ${window.location.href}`)}`,
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-6 text-left">
        <div className="h-6 w-32 bg-zinc-800/40 rounded-md mb-6 animate-pulse" />
        <div className="h-12 w-3/4 bg-zinc-800/40 rounded-md mb-4 animate-pulse" />
        <div className="h-6 w-1/2 bg-zinc-800/20 rounded-md mb-8 animate-pulse" />
        <div className="w-full aspect-[21/9] bg-zinc-800/30 rounded-2xl mb-8 animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 bg-zinc-800/20 rounded-md w-full animate-pulse" />
          <div className="h-4 bg-zinc-800/20 rounded-md w-5/6 animate-pulse" />
          <div className="h-4 bg-zinc-800/20 rounded-md w-4/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-36 pb-24 max-w-xl mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto mb-4 flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Article Not Found</h2>
        <p className="text-zinc-400 text-sm mb-6">
          The requested article could not be located. It may have been moved, renamed, or unpublished.
        </p>
        <button
          onClick={() => onNavigate('blogs')}
          className="px-6 py-2.5 rounded-full bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] transition-colors cursor-pointer"
        >
          Return to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="relative pt-24 pb-20 min-h-screen">
      {/* Top Fixed Reading Progress Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#00C853] z-50 transition-all duration-150 shadow-[0_0_8px_rgba(0,200,83,0.8)]"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Breadcrumb Navigation & Back Link */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-left">
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <button 
            onClick={() => onNavigate('home')}
            className="hover:text-[#00C853] transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <button 
            onClick={() => onNavigate('blogs')}
            className="hover:text-[#00C853] transition-colors cursor-pointer"
          >
            Blogs
          </button>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-[#00C853] truncate max-w-xs sm:max-w-md font-bold">
            {post.title}
          </span>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Article Body (8 cols on desktop) */}
          <main className="lg:col-span-8 text-left">
            
            {/* Header Metadata */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#00C853]/15 text-[#00C853] font-mono text-[11px] font-bold uppercase tracking-wider border border-[#00C853]/30">
                  {post.category}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#00C853]" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#00C853]" />
                  {post.readingTime}
                </span>
                {post.views ? (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                      <Eye className="w-3.5 h-3.5 text-[#00C853]" />
                      {post.views} views
                    </span>
                  </>
                ) : null}
              </div>

              {/* Title */}
              <h1 className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4 ${
                isLight ? 'text-zinc-950' : 'text-white'
              }`}>
                {post.title}
              </h1>

              {/* Excerpt Subtitle */}
              {post.excerpt && (
                <p className={`text-base sm:text-lg leading-relaxed mb-6 font-medium ${
                  isLight ? 'text-zinc-700' : 'text-zinc-350'
                }`}>
                  {post.excerpt}
                </p>
              )}

              {/* Author & Share Bar */}
              <div className={`py-4 border-y flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isLight ? 'border-zinc-200' : 'border-white/10'
              }`}>
                {/* Author Card */}
                <div className="flex items-center gap-3">
                  <img 
                    src={post.author?.avatar || "https://myphotosss.netlify.app/5.png"} 
                    alt={post.author?.name || "Usama Rasheed"} 
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#00C853]"
                  />
                  <div>
                    <h3 className={`font-display font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {post.author?.name || "Usama Rasheed"}
                    </h3>
                    <p className="text-[11px] font-mono text-[#00C853]">
                      {post.author?.role || "Environmental Engineer & AI Solutions Expert"}
                    </p>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-zinc-500 mr-1 hidden sm:inline">Share:</span>
                  
                  {/* Twitter / X */}
                  <a 
                    href={shareUrls.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg border transition-colors ${
                      isLight 
                        ? 'bg-zinc-100 hover:bg-[#00C853]/10 text-zinc-700 hover:text-[#00C853] border-zinc-200' 
                        : 'bg-white/5 hover:bg-[#00C853]/20 text-zinc-400 hover:text-[#00C853] border-white/5'
                    }`}
                    title="Share on X / Twitter"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>

                  {/* LinkedIn */}
                  <a 
                    href={shareUrls.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg border transition-colors ${
                      isLight 
                        ? 'bg-zinc-100 hover:bg-[#00C853]/10 text-zinc-700 hover:text-[#00C853] border-zinc-200' 
                        : 'bg-white/5 hover:bg-[#00C853]/20 text-zinc-400 hover:text-[#00C853] border-white/5'
                    }`}
                    title="Share on LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>

                  {/* Copy Link */}
                  <button 
                    onClick={handleCopyLink}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                      copied 
                        ? 'bg-[#00C853] text-black border-[#00C853]' 
                        : isLight 
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200' 
                          : 'bg-white/5 hover:bg-white/10 text-zinc-400 border-white/5'
                    }`}
                    title="Copy Article Link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="font-mono text-[10px] hidden md:inline">{copied ? 'Copied' : 'Link'}</span>
                  </button>

                  {/* Print Article */}
                  <button 
                    onClick={handlePrint}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      isLight 
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200' 
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400 border-white/5'
                    }`}
                    title="Print / Save as PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-10 rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-[16/9]">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rendered Rich Typography Content */}
            <article 
              className={`prose prose-invert max-w-none text-left leading-relaxed blog-article-content ${
                isLight ? 'prose-light' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: processedHtmlContent }}
            />

            {/* Tags Strip */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#00C853]" />
                  Article Tags:
                </span>
                {post.tags.map((tag) => (
                  <span 
                    key={tag}
                    className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                      isLight 
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-700' 
                        : 'bg-white/5 border-white/10 text-zinc-300'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Biography Card */}
            <div className={`mt-12 p-6 rounded-2xl border transition-colors ${
              isLight 
                ? 'bg-zinc-100 border-zinc-200' 
                : 'bg-gradient-to-br from-[#121216] to-[#0D0D10] border-white/10'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img 
                  src={post.author?.avatar || "https://myphotosss.netlify.app/5.png"} 
                  alt={post.author?.name || "Usama Rasheed"} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00C853]/50 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[#00C853] uppercase font-bold tracking-widest">About the Author</span>
                  </div>
                  <h3 className={`font-display font-bold text-lg ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                    {post.author?.name || "Usama Rasheed"}
                  </h3>
                  <p className="text-xs font-mono text-[#00C853] mb-2">
                    {post.author?.role || "Environmental Engineer & AI Solutions Expert"}
                  </p>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-650' : 'text-zinc-400'}`}>
                    {post.author?.bio || "Researching and developing technological systems at the crossroads of atmospheric sciences, remote sensing, satellite data pipelines, and applied deep learning models."}
                  </p>
                </div>
              </div>
            </div>

            {/* Previous & Next Article Navigation Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              {prevPost ? (
                <div 
                  onClick={() => onNavigate(`blogs/${prevPost.slug}`)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-[#00C853]/40 ${
                    isLight ? 'bg-white border-zinc-200' : 'bg-[#0E0E11] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-2">
                    <ArrowLeft className="w-3 h-3 text-[#00C853]" />
                    <span>Previous Article</span>
                  </div>
                  <h4 className={`font-display font-bold text-sm line-clamp-2 hover:text-[#00C853] transition-colors ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}>
                    {prevPost.title}
                  </h4>
                </div>
              ) : <div />}

              {nextPost ? (
                <div 
                  onClick={() => onNavigate(`blogs/${nextPost.slug}`)}
                  className={`p-4 rounded-xl border text-right cursor-pointer transition-all hover:border-[#00C853]/40 ${
                    isLight ? 'bg-white border-zinc-200' : 'bg-[#0E0E11] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-end gap-1.5 text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-2">
                    <span>Next Article</span>
                    <ArrowRight className="w-3 h-3 text-[#00C853]" />
                  </div>
                  <h4 className={`font-display font-bold text-sm line-clamp-2 hover:text-[#00C853] transition-colors ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}>
                    {nextPost.title}
                  </h4>
                </div>
              ) : <div />}
            </div>

            {/* Back to Blogs Button */}
            <div className="mt-12 pt-8 border-t border-white/10 flex justify-center">
              <button
                onClick={() => onNavigate('blogs')}
                className="px-6 py-3 rounded-full bg-white/5 hover:bg-[#00C853] hover:text-black border border-white/10 text-white font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Articles</span>
              </button>
            </div>
          </main>

          {/* Sidebar Rail: Table of Contents & Related Posts (4 cols on desktop) */}
          <aside className="lg:col-span-4 space-y-8 sticky top-28 text-left">
            
            {/* Table of Contents Card */}
            {tocItems.length > 0 && (
              <div className={`p-6 rounded-2xl border ${
                isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#0D0D10] border-white/5'
              }`}>
                <div className="flex items-center gap-2 text-[#00C853] font-mono text-xs uppercase font-bold tracking-wider mb-4">
                  <Bookmark className="w-4 h-4" />
                  <span>Table of Contents</span>
                </div>
                <nav className="space-y-2.5">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-xs transition-colors line-clamp-1 ${
                        item.level === 3 ? 'pl-3.5 border-l border-white/10' : ''
                      } ${
                        activeTocId === item.id 
                          ? 'text-[#00C853] font-bold' 
                          : isLight 
                            ? 'text-zinc-600 hover:text-black' 
                            : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Articles Card */}
            {relatedPosts.length > 0 && (
              <div className={`p-6 rounded-2xl border ${
                isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#0D0D10] border-white/5'
              }`}>
                <div className="flex items-center gap-2 text-[#00C853] font-mono text-xs uppercase font-bold tracking-wider mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Related Articles</span>
                </div>
                <div className="space-y-4">
                  {relatedPosts.map((rel) => (
                    <div 
                      key={rel.id} 
                      onClick={() => onNavigate(`blogs/${rel.slug}`)}
                      className="group cursor-pointer flex gap-3 items-center"
                    >
                      <img 
                        src={rel.featuredImage || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=400&auto=format&fit=crop"} 
                        alt={rel.title}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <span className="font-mono text-[9px] text-[#00C853] uppercase font-bold tracking-wider">
                          {rel.category}
                        </span>
                        <h4 className={`font-display text-xs font-bold line-clamp-2 transition-colors group-hover:text-[#00C853] ${
                          isLight ? 'text-zinc-900' : 'text-white'
                        }`}>
                          {rel.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Inquiries CTA Box */}
            <div className={`p-6 rounded-2xl border text-center ${
              isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-gradient-to-b from-[#111115] to-[#0A0A0C] border-white/10'
            }`}>
              <span className="font-mono text-[10px] uppercase font-bold text-[#00C853] tracking-widest block mb-2">Collaboration</span>
              <h4 className={`font-display font-bold text-sm mb-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Need Environmental Engineering or AI Architecture?
              </h4>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Consult with Usama Rasheed on custom remote sensing, biochar setups, or machine learning automation.
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="w-full py-2.5 rounded-xl bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] transition-colors cursor-pointer"
              >
                Get in Touch
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
