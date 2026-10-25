import React, { useState, useEffect } from 'react';
import { 
  Form, 
  FormQuestion, 
  FormSection, 
  QuestionType, 
  FormAppearance, 
  FormSettings 
} from '../../../types/form';
import QuestionEditor from './QuestionEditor';
import { 
  slugify, 
  saveForm 
} from '../../../services/formService';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Plus, 
  Eye, 
  Copy, 
  Check, 
  Upload, 
  Sparkles, 
  Palette, 
  Settings2, 
  FileText, 
  ExternalLink, 
  Layers, 
  Globe, 
  HelpCircle, 
  Share2,
  Trash2,
  AlertTriangle,
  Smartphone,
  Monitor
} from 'lucide-react';
import PublicFormView from '../../Forms/PublicFormView';

interface FormBuilderProps {
  initialForm: Form;
  onBack: () => void;
  onSaved: (form: Form) => void;
}

const ACCENT_COLORS = [
  { label: 'Usama Green', hex: '#00C853' },
  { label: 'Emerald', hex: '#10B981' },
  { label: 'Cyan', hex: '#06B6D4' },
  { label: 'Electric Blue', hex: '#3B82F6' },
  { label: 'Violet', hex: '#8B5CF6' },
  { label: 'Amber Gold', hex: '#F59E0B' },
  { label: 'Crimson Rose', hex: '#F43F5E' },
  { label: 'Pure White', hex: '#FFFFFF' },
];

export default function FormBuilder({ initialForm, onBack, onSaved }: FormBuilderProps) {
  const [form, setForm] = useState<Form>(initialForm);
  const [activeTab, setActiveTab] = useState<'questions' | 'appearance' | 'settings' | 'preview'>('questions');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Saved');
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Sync state if initialForm changes
  useEffect(() => {
    setForm(initialForm);
  }, [initialForm.id]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Title change updates slug automatically if slug was matching
  const handleTitleChange = (newTitle: string) => {
    const shouldUpdateSlug = !form.slug || form.slug === slugify(form.title);
    setForm((prev) => ({
      ...prev,
      title: newTitle,
      slug: shouldUpdateSlug ? slugify(newTitle) : prev.slug,
    }));
    setAutoSaveStatus('Unsaved changes');
  };

  // Add Question
  const handleAddQuestion = (type: QuestionType = 'short_answer') => {
    const newQ: FormQuestion = {
      id: `q-${Date.now()}-${form.questions.length + 1}`,
      type,
      title: type === 'section_header' ? 'Section Header' : 'Untitled Question',
      sectionId: form.sections[0]?.id || 'sec-default',
      validation: { required: false },
      options: ['multiple_choice', 'checkboxes', 'dropdown'].includes(type)
        ? [
            { id: 'opt-1', label: 'Option 1', value: 'option_1' },
            { id: 'opt-2', label: 'Option 2', value: 'option_2' },
          ]
        : undefined,
      scaleMin: type === 'linear_scale' ? 1 : undefined,
      scaleMax: type === 'linear_scale' ? 5 : undefined,
      maxStars: type === 'star_rating' ? 5 : undefined,
    };

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
    setAutoSaveStatus('Unsaved changes');
  };

  // Update Question
  const handleUpdateQuestion = (updated: FormQuestion) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
    }));
    setAutoSaveStatus('Unsaved changes');
  };

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
    setAutoSaveStatus('Unsaved changes');
  };

  // Duplicate Question
  const handleDuplicateQuestion = (q: FormQuestion) => {
    const dup: FormQuestion = {
      ...JSON.parse(JSON.stringify(q)),
      id: `q-${Date.now()}`,
      title: `${q.title} (Copy)`,
    };
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, dup],
    }));
    setAutoSaveStatus('Unsaved changes');
  };

  // Reorder
  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.questions.length) return;
    const list = [...form.questions];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    setForm((prev) => ({ ...prev, questions: list }));
    setAutoSaveStatus('Unsaved changes');
  };

  // Section Management
  const handleAddSection = () => {
    const secId = `sec-${Date.now()}`;
    const newSec: FormSection = {
      id: secId,
      title: `Section ${form.sections.length + 1}`,
      description: 'Optional section introduction or guidance',
    };
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
    setAutoSaveStatus('Unsaved changes');
  };

  const handleUpdateSection = (index: number, updated: Partial<FormSection>) => {
    const sections = [...form.sections];
    sections[index] = { ...sections[index], ...updated };
    setForm((prev) => ({ ...prev, sections }));
    setAutoSaveStatus('Unsaved changes');
  };

  const handleDeleteSection = (secId: string) => {
    if (form.sections.length <= 1) {
      showToast('Form must have at least one section', 'error');
      return;
    }
    const filtered = form.sections.filter((s) => s.id !== secId);
    // Reassign questions in deleted section to first section
    const remappedQuestions = form.questions.map((q) =>
      q.sectionId === secId ? { ...q, sectionId: filtered[0].id } : q
    );
    setForm((prev) => ({
      ...prev,
      sections: filtered,
      questions: remappedQuestions,
    }));
    setAutoSaveStatus('Unsaved changes');
  };

  // Save Form (Draft or Publish)
  const handleSave = async (targetStatus?: 'draft' | 'published' | 'closed') => {
    if (!form.title.trim()) {
      showToast('Form title is required', 'error');
      return;
    }

    setSaving(true);
    const statusToApply = targetStatus || form.status;
    const formToSave: Form = {
      ...form,
      status: statusToApply,
      settings: {
        ...form.settings,
        status: statusToApply,
      },
    };

    const res = await saveForm(formToSave);
    setSaving(false);

    if (res.success && res.form) {
      setForm(res.form);
      setAutoSaveStatus('Saved to database');
      showToast(
        statusToApply === 'published'
          ? 'Form published live! Shareable URL is active.'
          : 'Form saved as draft successfully!'
      );
      onSaved(res.form);
    } else {
      showToast(res.error || 'Failed to save form', 'error');
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const origin = window.location.origin;
    const url = `${origin}/forms/${form.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast('Form link copied to clipboard!');
  };

  // Cover image upload via Cloudinary
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const res = await uploadImageToCloudinary(file, { folder: 'portfolio/forms/covers' });
      if (res.success && res.secureUrl) {
        setForm((prev) => ({
          ...prev,
          appearance: { ...prev.appearance, coverImageUrl: res.secureUrl! },
        }));
        showToast('Cover image uploaded to Cloudinary CDN!');
      } else {
        showToast('Image upload failed', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Upload exception', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  // Logo upload via Cloudinary
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await uploadImageToCloudinary(file, { folder: 'portfolio/forms/logos' });
      if (res.success && res.secureUrl) {
        setForm((prev) => ({
          ...prev,
          appearance: { ...prev.appearance, logoUrl: res.secureUrl! },
        }));
        showToast('Form logo uploaded to Cloudinary CDN!');
      } else {
        showToast('Logo upload failed', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Upload exception', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-3 border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-[#00C853] text-black border-[#00C853] font-bold'
              : 'bg-red-500 text-white border-red-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP BAR / NAVIGATION */}
      <div className="bg-[#111115] border border-white/10 rounded-2xl p-4 sticky top-20 z-40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Back + Form Title + Status */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Back to Forms Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  form.status === 'published' ? 'bg-[#00C853] animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                {form.status}
              </span>
              <span className="text-zinc-600 text-[10px] font-mono">• {autoSaveStatus}</span>
            </div>
            <h2 className="font-display font-bold text-base text-white truncate mt-0.5">
              {form.title || 'Untitled Form'}
            </h2>
          </div>
        </div>

        {/* Middle: Tab Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-[#00C853]/15 text-[#00C853] font-bold border border-[#00C853]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Questions ({form.questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-[#00C853]/15 text-[#00C853] font-bold border border-[#00C853]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Design</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#00C853]/15 text-[#00C853] font-bold border border-[#00C853]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#00C853]/15 text-[#00C853] font-bold border border-[#00C853]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {form.status === 'published' && (
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy public link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00C853]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          )}

          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-[#00C853] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#00963c] transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#00C853]/15"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{form.status === 'published' ? 'Update & Live' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: QUESTIONS WORKSPACE */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Form Header Card */}
          <div className="bg-[#111115] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                  Form Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Client Project Scope Inquiry"
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-base font-bold focus:outline-hidden focus:border-[#00C853]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                  URL Slug (/forms/...)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                      setAutoSaveStatus('Unsaved changes');
                    }}
                    placeholder="scope-inquiry"
                    className="w-full pl-3 pr-8 py-2.5 bg-black/50 border border-white/10 rounded-xl text-zinc-300 text-xs font-mono focus:outline-hidden focus:border-[#00C853]"
                  />
                  <Globe className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                Form Description / Welcome Message
              </label>
              <textarea
                rows={2}
                value={form.description || ''}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                  setAutoSaveStatus('Unsaved changes');
                }}
                placeholder="Give your respondents a short overview of why this form is being conducted and how their data will be applied..."
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-zinc-300 text-xs focus:outline-hidden focus:border-[#00C853]"
              />
            </div>
          </div>

          {/* Section Manager */}
          <div className="bg-[#111115] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00C853]" />
                <span className="font-mono text-xs uppercase font-bold text-white tracking-wider">
                  Form Pages / Sections ({form.sections.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#00C853] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Page / Section</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {form.sections.map((sec, secIdx) => (
                <div key={sec.id} className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-[#00C853] font-bold">
                      Page {secIdx + 1}
                    </span>
                    {form.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleUpdateSection(secIdx, { title: e.target.value })}
                    placeholder="Section Title..."
                    className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white font-medium"
                  />
                  <input
                    type="text"
                    value={sec.description || ''}
                    onChange={(e) => handleUpdateSection(secIdx, { description: e.target.value })}
                    placeholder="Optional page helper guidance..."
                    className="w-full px-3 py-1 bg-black/30 border border-white/5 rounded-lg text-[11px] text-zinc-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-bold text-zinc-400 tracking-wider">
                Questions Flow
              </span>

              {/* Quick Add Question Dropdown */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddQuestion('short_answer')}
                  className="px-4 py-2 rounded-xl bg-[#00C853] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#00963c] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {form.questions.length === 0 ? (
              <div className="py-16 text-center bg-[#111115] border border-dashed border-white/10 rounded-2xl p-6">
                <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="font-display font-bold text-white text-sm mb-1">
                  No questions in this form yet
                </h4>
                <p className="text-zinc-500 text-xs mb-4">
                  Add questions or section headings to start collecting responses.
                </p>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('short_answer')}
                  className="px-4 py-2 rounded-xl bg-[#00C853] text-black font-mono text-xs font-bold uppercase hover:bg-[#00963c] cursor-pointer"
                >
                  Add First Question
                </button>
              </div>
            ) : (
              form.questions.map((q, idx) => (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  index={idx}
                  totalQuestions={form.questions.length}
                  allQuestions={form.questions}
                  sections={form.sections}
                  onUpdate={handleUpdateQuestion}
                  onDuplicate={handleDuplicateQuestion}
                  onDelete={handleDeleteQuestion}
                  onMoveUp={(i) => handleMoveQuestion(i, i - 1)}
                  onMoveDown={(i) => handleMoveQuestion(i, i + 1)}
                  accentColor={form.appearance.accentColor}
                />
              ))
            )}

            {/* Bottom Add Bar */}
            {form.questions.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 py-4">
                <button
                  type="button"
                  onClick={() => handleAddQuestion('short_answer')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#00C853]" /> + Short Answer
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('paragraph')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#00C853]" /> + Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#00C853]" /> + Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('linear_scale')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#00C853]" /> + Scale / Rating
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('section_header')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#00C853]" /> + Section Header
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPEARANCE CUSTOMIZER */}
      {activeTab === 'appearance' && (
        <div className="bg-[#111115] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Visual Customization</h3>
            <p className="text-zinc-400 text-xs mt-1">
              Customize accent branding, cover images, typography, and card presentation for your public responder view.
            </p>
          </div>

          {/* Accent Color Palette */}
          <div className="space-y-3">
            <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider">
              Primary Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, accentColor: c.hex },
                    }))
                  }
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    form.appearance.accentColor === c.hex
                      ? 'ring-2 ring-white scale-110 shadow-lg'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                >
                  {form.appearance.accentColor === c.hex && (
                    <Check className={`w-4 h-4 ${c.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}

              <div className="flex items-center gap-2 ml-2">
                <span className="font-mono text-xs text-zinc-500">Hex:</span>
                <input
                  type="text"
                  value={form.appearance.accentColor}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, accentColor: e.target.value },
                    }))
                  }
                  className="w-24 px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Theme & Card Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider mb-2">
                Color Scheme
              </label>
              <select
                value={form.appearance.themeMode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, themeMode: e.target.value as any },
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono"
              >
                <option value="dark">Dark Charcoal (Default Portfolio Match)</option>
                <option value="light">Crisp Light Clean</option>
                <option value="card_contrast">High Contrast OLED</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider mb-2">
                Font Family
              </label>
              <select
                value={form.appearance.fontStyle}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, fontStyle: e.target.value as any },
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono"
              >
                <option value="sans">Modern Sans-Serif (Geist / Inter)</option>
                <option value="serif">Editorial Serif</option>
                <option value="mono">Technical Monospace</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider mb-2">
                Card Presentation
              </label>
              <select
                value={form.appearance.cardStyle}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, cardStyle: e.target.value as any },
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono"
              >
                <option value="modern">Modern Rounded Cards</option>
                <option value="minimal">Minimalist Borderless</option>
                <option value="glass">Frosted Glass Effect</option>
              </select>
            </div>
          </div>

          {/* Button Text & Background Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider mb-2">
                Submit Button Text
              </label>
              <input
                type="text"
                value={form.appearance.submitButtonText || 'Submit Response'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, submitButtonText: e.target.value },
                  }))
                }
                placeholder="e.g. Send Application"
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider mb-2">
                Subtle Background Pattern
              </label>
              <select
                value={form.appearance.backgroundPattern || 'grid'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, backgroundPattern: e.target.value as any },
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono"
              >
                <option value="grid">Subtle Grid (Default)</option>
                <option value="dots">Subtle Dot Matrix</option>
                <option value="glow">Atmospheric Gradient Glow</option>
                <option value="none">Solid Clean</option>
              </select>
            </div>
          </div>

          {/* Header Cover Image (Cloudinary or URL) */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider">
              Header Cover Image (Optional Banner)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {form.appearance.coverImageUrl ? (
                <div className="relative w-40 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
                  <img
                    src={form.appearance.coverImageUrl}
                    alt="Cover Banner"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        appearance: { ...prev.appearance, coverImageUrl: undefined },
                      }))
                    }
                    className="absolute top-1 right-1 p-1 bg-black/80 rounded-md text-red-400 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  id="cover-upload-input"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                <label
                  htmlFor="cover-upload-input"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#00C853]" />
                  <span>{uploadingCover ? 'Uploading to Cloudinary...' : 'Upload Cover via Cloudinary'}</span>
                </label>

                <input
                  type="text"
                  value={form.appearance.coverImageUrl || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, coverImageUrl: e.target.value },
                    }))
                  }
                  placeholder="Or paste external image URL..."
                  className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono min-w-[260px]"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.appearance.showProgressBar}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, showProgressBar: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-[#00C853] rounded"
              />
              <div>
                <span className="font-mono text-xs text-white block">Display Section Progress Bar</span>
                <span className="text-[11px] text-zinc-500">Shows step 1 of N progress indicator during multi-page navigation.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.appearance.showQuestionNumbers}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, showQuestionNumbers: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-[#00C853] rounded"
              />
              <div>
                <span className="font-mono text-xs text-white block">Display Question Numbers</span>
                <span className="text-[11px] text-zinc-500">Prefixes prompts with numbered badge (1, 2, 3...).</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & POLICIES */}
      {activeTab === 'settings' && (
        <div className="bg-[#111115] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Form Settings & Submission Rules</h3>
            <p className="text-zinc-400 text-xs mt-1">
              Configure submission limits, auto-closing conditions, custom thank-you messages, and post-submission redirects.
            </p>
          </div>

          {/* Form Status Control */}
          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider">
              Publication Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['draft', 'published', 'closed', 'archived'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      status: st,
                      settings: { ...prev.settings, status: st },
                    }))
                  }
                  className={`p-3 rounded-xl border font-mono text-xs capitalize text-center transition-all cursor-pointer ${
                    form.status === st
                      ? 'bg-[#00C853]/15 border-[#00C853] text-[#00C853] font-bold shadow-lg'
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Limits & Expiration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider mb-1">
                Max Submission Limit (Optional)
              </label>
              <input
                type="number"
                min="0"
                value={form.settings.responseLimit || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      responseLimit: e.target.value ? Number(e.target.value) : undefined,
                    },
                  }))
                }
                placeholder="Leave blank for unlimited"
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white"
              />
              <span className="text-[10px] text-zinc-500 font-mono">Form auto-closes when capacity is reached.</span>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-zinc-400 tracking-wider mb-1">
                Expiration Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={form.settings.expiresAt || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, expiresAt: e.target.value || undefined },
                  }))
                }
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-mono">Form auto-closes past this timestamp.</span>
            </div>
          </div>

          {/* Thank You & Success Screen Messages */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h4 className="font-mono text-xs uppercase text-white font-bold tracking-wider">
              Submission Confirmation Message
            </h4>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider mb-1">
                Success Headline
              </label>
              <input
                type="text"
                value={form.settings.successMessageTitle || 'Response Received!'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, successMessageTitle: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider mb-1">
                Success Body / Instructions
              </label>
              <textarea
                rows={3}
                value={
                  form.settings.successMessageBody ||
                  'Thank you for submitting your response. Your details have been recorded safely.'
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, successMessageBody: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-zinc-300"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider mb-1">
                Optional Redirect URL (Auto-forward after submission)
              </label>
              <input
                type="url"
                value={form.settings.redirectUrl || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, redirectUrl: e.target.value || undefined },
                  }))
                }
                placeholder="https://example.com/thank-you"
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider mb-1">
                Closed Form Notice
              </label>
              <input
                type="text"
                value={form.settings.closedMessage || 'This form is currently closed and not accepting responses.'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, closedMessage: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-zinc-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE INTERACTIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#111115] border border-white/10 p-3 rounded-2xl">
            <span className="font-mono text-xs text-zinc-400">
              Interactive Responder Preview (Answers submitted here are in Sandbox mode)
            </span>

            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-[#00C853]/20 text-[#00C853]'
                    : 'text-zinc-500 hover:text-white'
                }`}
                title="Desktop Viewport"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-[#00C853]/20 text-[#00C853]'
                    : 'text-zinc-500 hover:text-white'
                }`}
                title="Mobile Viewport"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            className={`mx-auto transition-all duration-300 border border-white/10 rounded-3xl overflow-hidden shadow-2xl ${
              previewDevice === 'mobile' ? 'max-w-md' : 'max-w-3xl'
            }`}
          >
            <PublicFormView formOverride={form} previewMode={true} />
          </div>
        </div>
      )}
    </div>
  );
}
