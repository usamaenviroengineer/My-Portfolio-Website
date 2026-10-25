import React, { useState, useMemo } from 'react';
import { Form } from '../../../types/form';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit3, 
  Eye, 
  Trash2, 
  Copy, 
  Share2, 
  Check, 
  BarChart3, 
  CheckCircle2, 
  Lock, 
  Archive, 
  FileText, 
  Calendar, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  Sparkles,
  Layers
} from 'lucide-react';

interface FormsDashboardProps {
  forms: Form[];
  loading: boolean;
  onCreateNew: () => void;
  onEditForm: (form: Form) => void;
  onViewResponses: (form: Form) => void;
  onDuplicateForm: (formId: string) => void;
  onDeleteForm: (form: Form) => void;
  onToggleStatus: (formId: string, newStatus: 'draft' | 'published' | 'closed' | 'archived') => void;
  onRefresh: () => void;
  onOpenLiveForm: (slug: string) => void;
}

export default function FormsDashboard({
  forms,
  loading,
  onCreateNew,
  onEditForm,
  onViewResponses,
  onDuplicateForm,
  onDeleteForm,
  onToggleStatus,
  onRefresh,
  onOpenLiveForm,
}: FormsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'responses'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Metrics
  const stats = useMemo(() => {
    const total = forms.length;
    const published = forms.filter((f) => f.status === 'published').length;
    const drafts = forms.filter((f) => f.status === 'draft').length;
    const closed = forms.filter((f) => f.status === 'closed' || f.status === 'archived').length;
    const totalResponses = forms.reduce((acc, f) => acc + (f.responsesCount || 0), 0);
    return { total, published, drafts, closed, totalResponses };
  }, [forms]);

  // Copy shareable link
  const handleCopyLink = (slug: string, id: string) => {
    const origin = window.location.origin;
    const url = `${origin}/forms/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered & Sorted list
  const filteredForms = useMemo(() => {
    return forms
      .filter((form) => {
        if (statusFilter !== 'all' && form.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = form.title?.toLowerCase().includes(q);
          const matchSlug = form.slug?.toLowerCase().includes(q);
          const matchDesc = form.description?.toLowerCase().includes(q);
          return matchTitle || matchSlug || matchDesc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'responses') {
          return (b.responsesCount || 0) - (a.responsesCount || 0);
        }
        return 0;
      });
  }, [forms, statusFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00C853]" />
            <span className="font-mono text-[10px] text-[#00C853] uppercase font-bold tracking-widest">
              Private Data Collection
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl text-white">Forms & Surveys</h2>
          <p className="text-zinc-400 text-xs mt-1">
            Design interactive intake questionnaires, surveys, and research forms with real-time response aggregation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh forms from database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-xl bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00C853]/15"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Form</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Total Forms</span>
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
          <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400">Total Responses</span>
          <div className="font-display font-black text-2xl text-cyan-400 mt-1">{stats.totalResponses}</div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 bg-[#0E0E12] rounded-xl border border-white/5">
        <div className="relative flex-grow max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search forms by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-zinc-500 text-[10px] uppercase">Status:</span>
            {(['all', 'published', 'draft', 'closed', 'archived'] as const).map((st) => (
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

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-zinc-500 text-[10px] uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="responses">Most Responses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forms Table / Grid */}
      <div className="bg-[#0E0E12] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-zinc-500 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#00C853]" />
            Loading forms from database...
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="py-16 text-center px-4">
            <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h4 className="font-display font-bold text-white text-sm mb-1">No forms found</h4>
            <p className="text-zinc-500 text-xs mb-4">No forms match the current filter or search criteria.</p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 rounded-lg bg-[#00C853] text-black font-display text-xs font-bold uppercase tracking-wider hover:bg-[#00963c] cursor-pointer"
            >
              Create Your First Form
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 border-b border-white/5 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Form</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Responses</th>
                  <th className="py-3.5 px-4">Created / Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredForms.map((form) => (
                  <tr key={form.id} className="hover:bg-white/5 transition-colors group">
                    {/* Form Title & Slug */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0 max-w-md">
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => onEditForm(form)}
                            className="font-display font-bold text-white text-xs truncate group-hover:text-[#00C853] transition-colors cursor-pointer"
                          >
                            {form.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-zinc-500 truncate">
                            /forms/{form.slug}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono">
                            • {form.questions.length} questions
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          onToggleStatus(
                            form.id,
                            form.status === 'published' ? 'closed' : 'published'
                          )
                        }
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider cursor-pointer border transition-colors ${
                          form.status === 'published'
                            ? 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/30 hover:bg-[#00C853]/25'
                            : form.status === 'draft'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                        }`}
                        title="Click to toggle status"
                      >
                        {form.status}
                      </button>
                    </td>

                    {/* Responses Count */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onViewResponses(form)}
                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View collected responses"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#00C853]" />
                        <span className="font-bold">{form.responsesCount || 0}</span>
                      </button>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                      <div>
                        {new Date(form.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Updated {new Date(form.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyLink(form.slug, form.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Shareable Form Link"
                        >
                          {copiedId === form.id ? (
                            <Check className="w-3.5 h-3.5 text-[#00C853]" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open Public / Preview */}
                        <button
                          onClick={() => onOpenLiveForm(form.slug)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Open Form URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicateForm(form.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Duplicate Form"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onEditForm(form)}
                          className="p-1.5 rounded-lg bg-[#00C853]/10 hover:bg-[#00C853] text-[#00C853] hover:text-black transition-colors cursor-pointer"
                          title="Edit Form"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteForm(form)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Form"
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
  );
}
