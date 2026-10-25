import React, { useState, useEffect, useMemo } from 'react';
import { Form, FormResponse, FormQuestion } from '../../../types/form';
import { 
  getFormResponsesAdmin, 
  deleteFormResponseAdmin, 
  clearAllFormResponsesAdmin, 
  exportResponsesToCSV 
} from '../../../services/formService';
import { 
  Download, 
  Trash2, 
  RefreshCw, 
  ArrowLeft, 
  Search, 
  Eye, 
  BarChart3, 
  ListFilter, 
  Calendar, 
  Clock, 
  X, 
  CheckCircle2, 
  Star, 
  Sliders, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface FormResponsesViewProps {
  form: Form;
  onBack: () => void;
  onRefreshForm?: () => void;
}

export default function FormResponsesView({ form, onBack, onRefreshForm }: FormResponsesViewProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'summary'>('submissions');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [responseToDelete, setResponseToDelete] = useState<FormResponse | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const data = await getFormResponsesAdmin(form.id);
      setResponses(data);
    } catch (err) {
      console.error('Failed to load form responses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponses();
  }, [form.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteResponse = async () => {
    if (!responseToDelete) return;
    setActionLoading(true);
    await deleteFormResponseAdmin(responseToDelete.id, form.id);
    setActionLoading(false);
    setResponseToDelete(null);
    showToast('Submission deleted successfully');
    loadResponses();
    if (onRefreshForm) onRefreshForm();
  };

  const handleClearAll = async () => {
    setActionLoading(true);
    await clearAllFormResponsesAdmin(form.id);
    setActionLoading(false);
    setShowClearConfirm(false);
    showToast('All responses cleared');
    loadResponses();
    if (onRefreshForm) onRefreshForm();
  };

  // Filtered responses
  const filteredResponses = useMemo(() => {
    if (!searchQuery.trim()) return responses;
    const q = searchQuery.toLowerCase();
    return responses.filter((r) => {
      const answersStr = JSON.stringify(r.answers).toLowerCase();
      const idMatch = r.id.toLowerCase().includes(q);
      return idMatch || answersStr.includes(q);
    });
  }, [responses, searchQuery]);

  // Meaningful questions (excluding purely decorative headers)
  const displayQuestions = useMemo(() => {
    return form.questions.filter((q) => q.type !== 'section_header' && q.type !== 'statement');
  }, [form.questions]);

  // Analytics aggregation per question
  const questionAnalytics = useMemo(() => {
    return displayQuestions.map((q) => {
      const allAnswers = responses
        .map((r) => r.answers[q.id])
        .filter((val) => val !== undefined && val !== null && val !== '');

      const answeredCount = allAnswers.length;

      // Multiple choice, Checkboxes, Dropdown aggregation
      if (['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type)) {
        const counts: Record<string, number> = {};
        allAnswers.forEach((val) => {
          if (Array.isArray(val)) {
            val.forEach((item) => {
              counts[item] = (counts[item] || 0) + 1;
            });
          } else {
            counts[String(val)] = (counts[String(val)] || 0) + 1;
          }
        });

        const breakdown = (q.options || []).map((opt) => {
          const count = counts[opt.value] || counts[opt.label] || 0;
          const percentage = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
          return { label: opt.label, count, percentage };
        });

        return { question: q, answeredCount, type: 'categorical', breakdown };
      }

      // Linear scale & Star rating aggregation
      if (['linear_scale', 'star_rating', 'number'].includes(q.type)) {
        const numbers = allAnswers.map(Number).filter((n) => !isNaN(n));
        const sum = numbers.reduce((a, b) => a + b, 0);
        const average = numbers.length > 0 ? (sum / numbers.length).toFixed(1) : '0';
        const min = numbers.length > 0 ? Math.min(...numbers) : 0;
        const max = numbers.length > 0 ? Math.max(...numbers) : 0;

        return { question: q, answeredCount, type: 'numeric', average, min, max, samples: numbers };
      }

      // Text answers list
      return {
        question: q,
        answeredCount,
        type: 'text',
        recentAnswers: allAnswers.slice(0, 10),
      };
    });
  }, [displayQuestions, responses]);

  return (
    <div className="space-y-6 text-left">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00C853] text-black font-display font-bold text-xs px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Response Modal */}
      {responseToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl">
            <h3 className="font-display font-bold text-base text-white mb-2">Delete Submission?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              Are you sure you want to delete submission <strong className="text-white">{responseToDelete.id}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setResponseToDelete(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-zinc-300 text-xs font-mono hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteResponse}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Responses Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl">
            <h3 className="font-display font-bold text-base text-red-400 mb-2">Clear All Form Submissions?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              This will permanently delete all {responses.length} responses for <strong className="text-white">"{form.title}"</strong>.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg bg-white/5 text-zinc-300 text-xs font-mono hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold"
              >
                {actionLoading ? 'Clearing...' : 'Clear All Responses'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#00C853] uppercase font-bold tracking-wider">
                  Submission Details
                </span>
                <h3 className="font-display font-bold text-base text-white mt-0.5">
                  {selectedResponse.id}
                </h3>
                <p className="text-zinc-500 text-xs font-mono mt-0.5">
                  Submitted {new Date(selectedResponse.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-grow">
              {displayQuestions.map((q) => {
                const answer = selectedResponse.answers[q.id];
                return (
                  <div key={q.id} className="bg-black/40 border border-white/5 rounded-xl p-4">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block mb-1">
                      {q.title}
                    </span>
                    <div className="text-sm text-zinc-200 font-medium">
                      {answer === undefined || answer === null || answer === '' ? (
                        <span className="text-zinc-600 italic font-mono text-xs">No response provided</span>
                      ) : Array.isArray(answer) ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {answer.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/20 font-mono text-xs"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : q.type === 'star_rating' ? (
                        <div className="flex items-center gap-1 text-amber-400 mt-1">
                          {Array.from({ length: Number(answer) }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                          <span className="font-mono text-xs text-zinc-400 ml-2">({answer} / {q.maxStars || 5})</span>
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">{String(answer)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/30 flex justify-end">
              <button
                onClick={() => setSelectedResponse(null)}
                className="px-5 py-2 rounded-xl bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Back to Forms"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#00C853] uppercase font-bold tracking-wider">
                Collected Data
              </span>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                /forms/{form.slug}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-white mt-0.5">{form.title}</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadResponses}
            disabled={loading}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => exportResponsesToCSV(form, responses)}
            disabled={responses.length === 0}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 text-white font-mono text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {responses.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Total Submissions</span>
          <div className="font-display font-black text-2xl text-white mt-1">{responses.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#00C853]">Form Status</span>
          <div className="font-display font-bold text-lg text-[#00C853] mt-1 capitalize">{form.status}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Total Questions</span>
          <div className="font-display font-black text-2xl text-white mt-1">{displayQuestions.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111115] border border-white/5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Latest Submission</span>
          <div className="font-mono text-xs text-zinc-300 mt-2 truncate">
            {responses.length > 0
              ? new Date(responses[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'No responses yet'}
          </div>
        </div>
      </div>

      {/* View Switcher Tabs: Submissions Table vs Analytics Breakdown */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Individual Submissions ({responses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Question Analytics Summary</span>
        </button>
      </div>

      {/* TAB 1: INDIVIDUAL SUBMISSIONS TABLE */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]"
            />
          </div>

          <div className="bg-[#0E0E12] rounded-2xl border border-white/5 overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-zinc-500 font-mono text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#00C853]" />
                Loading submissions...
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="py-16 text-center px-4">
                <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h4 className="font-display font-bold text-white text-sm mb-1">No responses recorded</h4>
                <p className="text-zinc-500 text-xs mb-4">
                  Share your published form link to collect responses.
                </p>
                <button
                  onClick={() => window.open(`/forms/${form.slug}`, '_blank')}
                  className="px-4 py-2 rounded-lg bg-[#00C853] text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#00963c]"
                >
                  Open Live Form
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 border-b border-white/5 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Submission Date</th>
                      {displayQuestions.slice(0, 3).map((q) => (
                        <th key={q.id} className="py-3.5 px-4 max-w-[200px] truncate">
                          {q.title}
                        </th>
                      ))}
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredResponses.map((resp) => (
                      <tr key={resp.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                          {new Date(resp.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {displayQuestions.slice(0, 3).map((q) => {
                          const ans = resp.answers[q.id];
                          return (
                            <td key={q.id} className="py-3.5 px-4 text-zinc-300 max-w-[200px] truncate">
                              {ans === undefined || ans === null || ans === '' ? (
                                <span className="text-zinc-600 italic font-mono text-[10px]">—</span>
                              ) : Array.isArray(ans) ? (
                                ans.join(', ')
                              ) : (
                                String(ans)
                              )}
                            </td>
                          );
                        })}

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedResponse(resp)}
                              className="p-1.5 rounded-lg bg-[#00C853]/10 hover:bg-[#00C853] text-[#00C853] hover:text-black transition-colors"
                              title="View Full Submission"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setResponseToDelete(resp)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete Submission"
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

      {/* TAB 2: QUESTION ANALYTICS BREAKDOWN */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {responses.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 font-mono text-xs">
              No response data yet to compute analytics.
            </div>
          ) : (
            questionAnalytics.map((item, idx) => (
              <div key={item.question.id} className="bg-[#0E0E12] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-white/5 text-zinc-400 flex items-center justify-center font-mono text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <h4 className="font-display font-bold text-sm text-white">{item.question.title}</h4>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {item.answeredCount} responses
                  </span>
                </div>

                {/* Categorical Breakdown */}
                {item.type === 'categorical' && item.breakdown && (
                  <div className="space-y-2.5 pt-2">
                    {item.breakdown.map((b, bIdx) => (
                      <div key={bIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-300">{b.label}</span>
                          <span className="text-zinc-500">
                            {b.count} ({b.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#00C853] transition-all duration-500"
                            style={{ width: `${b.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Numeric Breakdown */}
                {item.type === 'numeric' && (
                  <div className="pt-2 flex flex-wrap gap-4 items-center">
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center min-w-[100px]">
                      <span className="font-mono text-[9px] uppercase text-zinc-500">Average</span>
                      <div className="font-display font-black text-xl text-[#00C853] mt-0.5">
                        {item.average}
                      </div>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center min-w-[80px]">
                      <span className="font-mono text-[9px] uppercase text-zinc-500">Min</span>
                      <div className="font-display font-bold text-lg text-white mt-0.5">{item.min}</div>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center min-w-[80px]">
                      <span className="font-mono text-[9px] uppercase text-zinc-500">Max</span>
                      <div className="font-display font-bold text-lg text-white mt-0.5">{item.max}</div>
                    </div>
                  </div>
                )}

                {/* Text Verbatim List */}
                {item.type === 'text' && item.recentAnswers && (
                  <div className="space-y-2 pt-2">
                    {item.recentAnswers.length === 0 ? (
                      <span className="text-zinc-600 text-xs italic font-mono">No responses yet</span>
                    ) : (
                      item.recentAnswers.map((ans, aIdx) => (
                        <div key={aIdx} className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs text-zinc-300 font-sans">
                          "{String(ans)}"
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
