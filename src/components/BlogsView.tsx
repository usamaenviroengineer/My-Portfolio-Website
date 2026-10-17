import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Tag, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Filter, 
  ChevronRight, 
  BookOpen, 
  Layers,
  Flame,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { BlogPost } from '../types';
import { getPublishedBlogs } from '../services/blogService';

interface BlogsViewProps {
  onNavigate: (route: string) => void;
}

export default function BlogsView({ onNavigate }: BlogsViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'reading_time'>('newest');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    let mounted = true;
    getPublishedBlogs()
      .then((data) => {
        if (mounted) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load published blogs:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Compute unique categories and tags with counts
  const categoriesWithCounts = useMemo(() => {
    const map: Record<string, number> = { All: posts.length };
    posts.forEach((p) => {
      const cat = p.category || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [posts]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => set.add(t));
      }
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  // Find primary featured post
  const featuredPost = useMemo(() => {
    return posts.find((p) => p.featured) || posts[0] || null;
  }, [posts]);

  // Filtered & sorted posts list
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Category filter
        if (selectedCategory !== 'All' && post.category !== selectedCategory) {
          return false;
        }
        // Tag filter
        if (selectedTag !== 'All' && (!post.tags || !post.tags.includes(selectedTag))) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = post.title?.toLowerCase().includes(query);
          const matchExcerpt = post.excerpt?.toLowerCase().includes(query);
          const matchCategory = post.category?.toLowerCase().includes(query);
          const matchTags = post.tags?.some((t) => t.toLowerCase().includes(query));
          return matchTitle || matchExcerpt || matchCategory || matchTags;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        }
        if (sortBy === 'reading_time') {
          const timeA = parseInt(a.readingTime) || 5;
          const timeB = parseInt(b.readingTime) || 5;
          return timeB - timeA;
        }
        // default: newest
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [posts, selectedCategory, selectedTag, searchQuery, sortBy]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      {/* Page Title & Mission Heading */}
      <div className="mb-12 text-left relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 font-mono text-[10px] uppercase tracking-widest font-black transition-colors bg-[#00C853]/10 border-[#00C853]/25 text-[#00C853]">
          <Sparkles className="w-3 h-3 text-[#00C853]" />
          <span>Research & Engineering Dispatches</span>
        </div>
        
        <h1 className={`font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 ${
          isLight ? 'text-zinc-950' : 'text-white'
        }`}>
          Insights & <span className="text-[#00C853]">Articles</span>
        </h1>
        
        <p className={`text-sm sm:text-base max-w-2xl leading-relaxed ${
          isLight ? 'text-zinc-650' : 'text-zinc-400'
        }`}>
          Deep-dives into environmental systems, satellite earth observation, edge IoT telemetry, and applied machine learning architectures by Usama Rasheed.
        </p>
      </div>

      {/* Featured Post Spotlight Banner (if exists and no filters active) */}
      {!loading && featuredPost && selectedCategory === 'All' && selectedTag === 'All' && !searchQuery && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mb-16 rounded-3xl border overflow-hidden p-1 transition-all ${
            isLight 
              ? 'bg-white border-zinc-200 shadow-xl' 
              : 'bg-gradient-to-br from-[#121216] to-[#0A0A0C] border-white/10 shadow-2xl shadow-[#00C853]/5'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 md:p-8">
            {/* Featured Image */}
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-[16/10] bg-black/40 group">
              <img 
                src={featuredPost.featuredImage || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop"} 
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#00C853] text-black font-mono text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 shadow-lg">
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  Featured Article
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[10px] uppercase tracking-wider border border-white/10">
                  {featuredPost.category}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/80 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#00C853]" />
                    {formatDate(featuredPost.publishedAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#00C853]" />
                    {featuredPost.readingTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Info */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full py-2 text-left">
              <div>
                <div className="flex items-center gap-2 text-[#00C853] font-mono text-[11px] font-bold uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Editor's Selection</span>
                </div>

                <h2 
                  onClick={() => onNavigate(`blogs/${featuredPost.slug}`)}
                  className={`font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-4 cursor-pointer hover:text-[#00C853] transition-colors leading-tight ${
                    isLight ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  {featuredPost.title}
                </h2>

                <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${
                  isLight ? 'text-zinc-650' : 'text-zinc-400'
                }`}>
                  {featuredPost.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {featuredPost.tags?.slice(0, 4).map((tag) => (
                    <span 
                      key={tag}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                        isLight 
                          ? 'bg-zinc-100 border-zinc-200 text-zinc-700' 
                          : 'bg-white/5 border-white/10 text-zinc-300'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author & Action */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <img 
                    src={featuredPost.author?.avatar || "https://myphotosss.netlify.app/5.png"} 
                    alt={featuredPost.author?.name || "Usama Rasheed"} 
                    className="w-10 h-10 rounded-full object-cover border border-[#00C853]/40"
                  />
                  <div>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {featuredPost.author?.name || "Usama Rasheed"}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-500">
                      Environmental & AI Solutions
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(`blogs/${featuredPost.slug}`)}
                  className="px-5 py-2.5 rounded-full bg-[#00C853] text-black font-display text-xs font-bold tracking-wider uppercase hover:bg-[#00963c] hover:text-white transition-all flex items-center gap-2 group cursor-pointer shadow-lg shadow-[#00C853]/15"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search, Category Bar & Filter Controls */}
      <div className={`p-4 rounded-2xl border mb-10 transition-colors ${
        isLight ? 'bg-zinc-100/80 border-zinc-200' : 'bg-[#0E0E11] border-white/5'
      }`}>
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search articles by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6);
              }}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
                isLight 
                  ? 'bg-white border-zinc-300 text-zinc-900 focus:border-[#00C853]' 
                  : 'bg-black/40 border-white/10 text-white focus:border-[#00C853]'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-mono focus:outline-hidden cursor-pointer ${
                isLight 
                  ? 'bg-white border-zinc-300 text-zinc-800' 
                  : 'bg-black/40 border-white/10 text-zinc-300'
              }`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="reading_time">Deep Dives (Length)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-3 border-t border-white/5 pb-1 scrollbar-none">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#00C853]" />
            Categories:
          </span>
          {Object.entries(categoriesWithCounts).map(([cat, count]) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(6);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-[#00C853] text-black font-bold shadow-md shadow-[#00C853]/20' 
                    : isLight 
                      ? 'bg-white text-zinc-600 hover:text-black hover:bg-zinc-200 border border-zinc-200' 
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-black/20 text-black' : isLight ? 'bg-zinc-200 text-zinc-600' : 'bg-white/10 text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className={`rounded-2xl border p-4 animate-pulse ${
                isLight ? 'bg-white border-zinc-200' : 'bg-[#0E0E11] border-white/5'
              }`}
            >
              <div className="w-full aspect-[16/10] bg-zinc-800/40 rounded-xl mb-4" />
              <div className="h-4 w-24 bg-zinc-800/40 rounded-md mb-3" />
              <div className="h-6 w-3/4 bg-zinc-800/40 rounded-md mb-3" />
              <div className="h-14 w-full bg-zinc-800/20 rounded-md mb-4" />
              <div className="h-8 w-full bg-zinc-800/30 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPosts.length === 0 && (
        <div className={`text-center py-20 px-6 rounded-3xl border ${
          isLight ? 'bg-white border-zinc-200' : 'bg-[#0E0E11] border-white/5'
        }`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#00C853]/10 border border-[#00C853]/20 flex items-center justify-center text-[#00C853]">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className={`font-display text-xl font-bold mb-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            No articles match your query
          </h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
            Try adjusting your search keywords, clearing filters, or browsing all categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedTag('All');
            }}
            className="px-5 py-2.5 rounded-full bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && displayedPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {displayedPosts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              onClick={() => onNavigate(`blogs/${post.slug}`)}
              className={`group flex flex-col justify-between rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${
                isLight 
                  ? 'bg-white border-zinc-200 hover:border-[#00C853]/40 shadow-sm hover:shadow-xl' 
                  : 'bg-[#0E0E11] border-white/5 hover:border-[#00C853]/40 hover:shadow-[0_8px_30px_rgba(0,200,83,0.08)]'
              }`}
            >
              <div>
                {/* Thumbnail Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                  <img 
                    src={post.featuredImage || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=800&auto=format&fit=crop"} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[#00C853] font-mono text-[10px] font-bold uppercase tracking-wider border border-[#00C853]/30">
                    {post.category}
                  </span>

                  {/* Reading Time */}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-white/90 font-mono text-[9px] flex items-center gap-1 border border-white/10">
                    <Clock className="w-3 h-3 text-[#00C853]" />
                    {post.readingTime}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-2.5">
                    <Calendar className="w-3 h-3 text-[#00C853]" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>

                  <h3 className={`font-display text-base sm:text-lg font-bold tracking-tight mb-2.5 line-clamp-2 transition-colors group-hover:text-[#00C853] leading-snug ${
                    isLight ? 'text-zinc-950' : 'text-white'
                  }`}>
                    {post.title}
                  </h3>

                  <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${
                    isLight ? 'text-zinc-650' : 'text-zinc-400'
                  }`}>
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            isLight 
                              ? 'bg-zinc-100 border-zinc-200 text-zinc-600' 
                              : 'bg-white/5 border-white/10 text-zinc-400'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Author & Read More button */}
              <div className={`p-5 pt-3 border-t flex items-center justify-between mt-auto ${
                isLight ? 'border-zinc-100' : 'border-white/5'
              }`}>
                <div className="flex items-center gap-2.5">
                  <img 
                    src={post.author?.avatar || "https://myphotosss.netlify.app/5.png"} 
                    alt={post.author?.name || "Usama Rasheed"} 
                    className="w-7 h-7 rounded-full object-cover border border-[#00C853]/40"
                  />
                  <span className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                    {post.author?.name || "Usama Rasheed"}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-[#00C853] group-hover:translate-x-1 transition-transform">
                  <span>Read</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && (
        <div className="mt-14 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className={`px-8 py-3.5 rounded-full border font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer hover:scale-103 ${
              isLight 
                ? 'bg-zinc-900 text-white hover:bg-[#00C853] hover:text-black border-zinc-900' 
                : 'bg-white/5 border-white/10 text-white hover:border-[#00C853] hover:text-[#00C853]'
            }`}
          >
            Load More Articles ({filteredPosts.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
