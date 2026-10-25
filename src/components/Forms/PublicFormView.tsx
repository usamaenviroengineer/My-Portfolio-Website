import React, { useState, useEffect, useMemo } from 'react';
import { Form, FormQuestion, FormResponse } from '../../types/form';
import { 
  getPublishedFormBySlug, 
  submitFormResponse, 
  shouldShowQuestion 
} from '../../services/formService';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Star, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  UploadCloud, 
  FileText, 
  ExternalLink, 
  Lock, 
  Calendar, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';

interface PublicFormViewProps {
  slug?: string;
  formOverride?: Form;
  previewMode?: boolean;
  onNavigateHome?: () => void;
}

export default function PublicFormView({
  slug,
  formOverride,
  previewMode = false,
  onNavigateHome,
}: PublicFormViewProps) {
  const [form, setForm] = useState<Form | null>(formOverride || null);
  const [loading, setLoading] = useState(!formOverride);
  const [notFound, setNotFound] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Form answer state: questionId -> value
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [botTrap, setBotTrap] = useState(''); // Anti-spam honeypot

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  // Sync if override changes (e.g. inside builder preview)
  useEffect(() => {
    if (formOverride) {
      setForm(formOverride);
      setLoading(false);
    }
  }, [formOverride]);

  // Load published form by slug
  useEffect(() => {
    if (formOverride) return;
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchForm = async () => {
      setLoading(true);
      try {
        const data = await getPublishedFormBySlug(slug);
        if (data) {
          setForm(data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load form:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [slug, formOverride]);

  // Handle Answer Changes
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear validation error on type
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  // Checkbox multi-select toggle
  const handleCheckboxToggle = (questionId: string, optionValue: string) => {
    const currentList: string[] = answers[questionId] || [];
    let updated: string[];
    if (currentList.includes(optionValue)) {
      updated = currentList.filter((item) => item !== optionValue);
    } else {
      updated = [...currentList, optionValue];
    }
    handleAnswerChange(questionId, updated);
  };

  // File upload trigger
  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadingFiles((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await uploadImageToCloudinary(file, { folder: 'portfolio/forms/uploads' });
      if (res.success && res.secureUrl) {
        handleAnswerChange(questionId, {
          name: file.name,
          size: file.size,
          url: res.secureUrl,
        });
      } else {
        setErrors((prev) => ({ ...prev, [questionId]: 'File upload failed. Please try again.' }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, [questionId]: 'File upload error.' }));
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Filter questions for the current section that meet conditional logic
  const currentSection = form?.sections[currentSectionIndex] || form?.sections[0];
  const sectionQuestions = useMemo(() => {
    if (!form || !currentSection) return [];
    return form.questions.filter((q) => {
      // Must belong to this section (or first section if sectionId is omitted)
      const belongsToSection = q.sectionId === currentSection.id || (!q.sectionId && currentSectionIndex === 0);
      if (!belongsToSection) return false;
      // Must satisfy conditional display logic
      return shouldShowQuestion(q, answers);
    });
  }, [form, currentSection, currentSectionIndex, answers]);

  // Validation function for a set of questions
  const validateQuestions = (questionsToValidate: FormQuestion[]): boolean => {
    const newErrors: Record<string, string> = {};

    for (const q of questionsToValidate) {
      if (q.type === 'section_header' || q.type === 'statement') continue;

      const val = answers[q.id];

      // Required check
      if (q.validation.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[q.id] = q.validation.customErrorMessage || 'This question requires an answer';
          continue;
        }
      }

      if (val !== undefined && val !== null && val !== '') {
        // Email check
        if (q.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(val))) {
            newErrors[q.id] = 'Please enter a valid email address';
          }
        }

        // URL check
        if (q.type === 'url') {
          try {
            new URL(String(val).startsWith('http') ? String(val) : `https://${String(val)}`);
          } catch {
            newErrors[q.id] = 'Please enter a valid URL';
          }
        }

        // Min / Max length for text
        if (['short_answer', 'paragraph'].includes(q.type)) {
          const strVal = String(val);
          if (q.validation.minLength && strVal.length < q.validation.minLength) {
            newErrors[q.id] = `Must be at least ${q.validation.minLength} characters`;
          }
          if (q.validation.maxLength && strVal.length > q.validation.maxLength) {
            newErrors[q.id] = `Cannot exceed ${q.validation.maxLength} characters`;
          }
        }

        // Min / Max value for number
        if (q.type === 'number') {
          const numVal = Number(val);
          if (q.validation.minValue !== undefined && numVal < q.validation.minValue) {
            newErrors[q.id] = `Value must be at least ${q.validation.minValue}`;
          }
          if (q.validation.maxValue !== undefined && numVal > q.validation.maxValue) {
            newErrors[q.id] = `Value cannot exceed ${q.validation.maxValue}`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Next section handler
  const handleNextSection = () => {
    if (!form) return;
    const isValid = validateQuestions(sectionQuestions);
    if (!isValid) return;

    if (currentSectionIndex < form.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous section handler
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate current section
    const isValid = validateQuestions(sectionQuestions);
    if (!isValid) return;

    // In preview mode: simulate successful submission without persisting
    if (previewMode) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await submitFormResponse({
        formId: form.id,
        formSlug: form.slug,
        answers,
        botTrap,
        meta: {
          submittedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || '',
        },
      });

      if (res.success) {
        setSubmitted(true);
        // If redirectUrl configured, redirect after 3 seconds
        if (form.settings.redirectUrl) {
          setTimeout(() => {
            window.location.href = form.settings.redirectUrl!;
          }, 3000);
        }
      } else {
        setSubmissionError(res.error || 'Failed to submit form. Please verify inputs.');
      }
    } catch (err: any) {
      setSubmissionError(err?.message || 'A network error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset for another submission
  const handleResetForm = () => {
    setAnswers({});
    setErrors({});
    setCurrentSectionIndex(0);
    setSubmitted(false);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00C853] animate-spin" />
          <span className="text-xs uppercase tracking-widest text-zinc-400">Loading Form...</span>
        </div>
      </div>
    );
  }

  // Not Found State
  if (notFound || !form) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-[#111115] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Form Not Found</h2>
          <p className="text-zinc-400 text-xs leading-relaxed mb-6">
            The form you are looking for does not exist or may have been unpublished by the administrator.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Visit Portfolio Home
          </a>
        </div>
      </div>
    );
  }

  // Check if form is closed or unpublished (unless in admin preview mode)
  const isClosed = !previewMode && (
    form.status !== 'published' ||
    (form.settings.responseLimit && (form.responsesCount || 0) >= form.settings.responseLimit) ||
    (form.settings.expiresAt && new Date() > new Date(form.settings.expiresAt))
  );

  if (isClosed) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-[#111115] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-2">{form.title}</h2>
          <p className="text-zinc-400 text-xs leading-relaxed mb-6">
            {form.settings.closedMessage || 'This form is no longer accepting new responses.'}
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#00C853] hover:bg-[#00963c] text-black font-display font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Return to Portfolio
          </a>
        </div>
      </div>
    );
  }

  // Extract appearance variables
  const accent = form.appearance.accentColor || '#00C853';
  const isLight = form.appearance.themeMode === 'light';
  const fontClass =
    form.appearance.fontStyle === 'serif'
      ? 'font-serif'
      : form.appearance.fontStyle === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Card classes
  const cardBgClass = isLight
    ? 'bg-white text-zinc-900 border-zinc-200 shadow-xl'
    : form.appearance.cardStyle === 'glass'
    ? 'bg-[#121216]/80 backdrop-blur-xl text-white border-white/10 shadow-2xl'
    : 'bg-[#111115] text-white border-white/10 shadow-2xl';

  const isLastSection = currentSectionIndex === (form.sections.length || 1) - 1;
  const progressPercent = Math.round(((currentSectionIndex + 1) / (form.sections.length || 1)) * 100);

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
          isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-[#070708] text-white'
        } ${fontClass}`}
      >
        <div className={`max-w-md w-full border rounded-3xl p-8 text-center shadow-2xl relative ${cardBgClass}`}>
          {previewMode && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-[9px] uppercase font-bold">
              Preview Mode
            </div>
          )}

          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ backgroundColor: `${accent}20`, color: accent }}
          >
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {form.settings.successMessageTitle || 'Response Submitted!'}
          </h2>

          <p className="text-xs leading-relaxed mb-6 opacity-80">
            {form.settings.successMessageBody ||
              'Thank you for submitting your response. Your answers have been recorded safely.'}
          </p>

          {form.settings.redirectUrl && (
            <p className="text-[11px] font-mono text-zinc-500 mb-6 flex items-center justify-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Redirecting to destination...</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {form.settings.allowMultipleSubmissions && (
              <button
                onClick={handleResetForm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                style={{ borderColor: `${accent}40`, color: accent }}
              >
                Submit Another Response
              </button>
            )}

            <a
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white/10 hover:bg-white/20"
            >
              Back to Portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // MAIN FORM RESPONDER SCREEN
  return (
    <div
      className={`min-h-screen py-10 px-4 transition-colors duration-300 relative ${
        isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-[#070708] text-white'
      } ${fontClass}`}
    >
      {/* Background Pattern */}
      {form.appearance.backgroundPattern === 'grid' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, ${accent}15 1px, transparent 1px), linear-gradient(to bottom, ${accent}15 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
          }}
        />
      )}

      {/* Preview Mode Banner */}
      {previewMode && (
        <div className="max-w-2xl mx-auto mb-4 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-xl text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Interactive Preview: Submissions are test-only and will not affect live statistics.</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6 relative z-10 text-left">
        {/* Cover Banner */}
        {form.appearance.coverImageUrl && (
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-48 md:h-60 w-full relative">
            <img
              src={form.appearance.coverImageUrl}
              alt="Form Banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Form Title & Introduction Card */}
        <div className={`border rounded-3xl p-6 md:p-8 ${cardBgClass}`}>
          {/* Accent line */}
          <div
            className="w-16 h-1.5 rounded-full mb-4"
            style={{ backgroundColor: accent }}
          />

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {form.title}
          </h1>

          {form.description && (
            <p className="mt-3 text-sm leading-relaxed opacity-85 whitespace-pre-line">
              {form.description}
            </p>
          )}

          {/* Section Indicator & Progress Bar */}
          {form.sections.length > 1 && form.appearance.showProgressBar && (
            <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono opacity-80">
                <span>
                  Page {currentSectionIndex + 1} of {form.sections.length}:{' '}
                  <strong className="text-white font-bold">{currentSection?.title}</strong>
                </span>
                <span>{progressPercent}% completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%`, backgroundColor: accent }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Question Cards Flow */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field (hidden from visual users) */}
          <input
            type="text"
            name="website_verification_code"
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {sectionQuestions.map((question, qIdx) => {
            const hasError = !!errors[question.id];
            const answerVal = answers[question.id];

            // Render Section Header
            if (question.type === 'section_header') {
              return (
                <div key={question.id} className="pt-4 pb-2">
                  <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="w-2 h-4 rounded-full" style={{ backgroundColor: accent }} />
                    {question.title}
                  </h3>
                  {question.description && (
                    <p className="text-xs text-zinc-400 mt-1">{question.description}</p>
                  )}
                </div>
              );
            }

            // Render Information Statement
            if (question.type === 'statement') {
              return (
                <div
                  key={question.id}
                  className="p-4 rounded-2xl border bg-black/40 text-xs leading-relaxed"
                  style={{ borderColor: `${accent}30` }}
                >
                  <p className="font-semibold text-white">{question.title}</p>
                  {question.description && (
                    <p className="text-zinc-400 mt-1">{question.description}</p>
                  )}
                </div>
              );
            }

            return (
              <div
                key={question.id}
                className={`border rounded-3xl p-6 transition-all ${cardBgClass} ${
                  hasError ? 'ring-2 ring-red-500/50 border-red-500/50' : ''
                }`}
              >
                {/* Question Prompt */}
                <div className="mb-3">
                  <label className="text-sm font-semibold block leading-snug">
                    {form.appearance.showQuestionNumbers && (
                      <span className="opacity-50 font-mono mr-2">{qIdx + 1}.</span>
                    )}
                    {question.title}
                    {question.validation.required && (
                      <span className="text-red-400 ml-1 font-mono text-xs">*</span>
                    )}
                  </label>

                  {question.description && (
                    <p className="text-xs opacity-70 mt-1 leading-relaxed">
                      {question.description}
                    </p>
                  )}
                </div>

                {/* Question Input Renderers */}

                {/* 1. Short Answer */}
                {question.type === 'short_answer' && (
                  <input
                    type="text"
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Your answer...'}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-hidden transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-[#00C853]'
                        : 'bg-black/50 border-white/10 text-white focus:border-[#00C853]'
                    }`}
                  />
                )}

                {/* 2. Paragraph / Long Text */}
                {question.type === 'paragraph' && (
                  <textarea
                    rows={4}
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Type your detailed answer here...'}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-hidden transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-[#00C853]'
                        : 'bg-black/50 border-white/10 text-white focus:border-[#00C853]'
                    }`}
                  />
                )}

                {/* 3. Multiple Choice (Radio) */}
                {question.type === 'multiple_choice' && (
                  <div className="space-y-2 mt-2">
                    {(question.options || []).map((opt) => {
                      const isSelected = answerVal === opt.value || answerVal === opt.label;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, opt.value)}
                          className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#00C853] bg-[#00C853]/10 font-bold'
                              : isLight
                              ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-800'
                              : 'bg-black/40 border-white/5 hover:bg-white/5 text-zinc-300'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#00C853]' : 'border-zinc-500'
                            }`}
                          >
                            {isSelected && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: accent }}
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 4. Checkboxes (Multi-select) */}
                {question.type === 'checkboxes' && (
                  <div className="space-y-2 mt-2">
                    {(question.options || []).map((opt) => {
                      const currentSelected: string[] = answerVal || [];
                      const isChecked = currentSelected.includes(opt.value);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleCheckboxToggle(question.id, opt.value)}
                          className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isChecked
                              ? 'border-[#00C853] bg-[#00C853]/10 font-bold'
                              : isLight
                              ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-800'
                              : 'bg-black/40 border-white/5 hover:bg-white/5 text-zinc-300'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isChecked ? 'border-[#00C853] bg-[#00C853]' : 'border-zinc-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 text-black stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 5. Dropdown */}
                {question.type === 'dropdown' && (
                  <select
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-hidden transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : 'bg-black/50 border-white/10 text-white'
                    }`}
                  >
                    <option value="">Select an option...</option>
                    {(question.options || []).map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* 6. Linear Scale */}
                {question.type === 'linear_scale' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-1 overflow-x-auto py-2">
                      {Array.from(
                        { length: (question.scaleMax || 5) - (question.scaleMin || 1) + 1 },
                        (_, i) => (question.scaleMin || 1) + i
                      ).map((num) => {
                        const isChosen = answerVal === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, num)}
                            className={`flex-1 min-w-[38px] h-11 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all cursor-pointer ${
                              isChosen
                                ? 'border-[#00C853] bg-[#00C853] text-black shadow-lg'
                                : isLight
                                ? 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:border-zinc-400'
                                : 'bg-black/40 border-white/10 text-zinc-300 hover:border-white/30'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono opacity-70">
                      <span>{question.scaleMinLabel || `Min (${question.scaleMin || 1})`}</span>
                      <span>{question.scaleMaxLabel || `Max (${question.scaleMax || 5})`}</span>
                    </div>
                  </div>
                )}

                {/* 7. Star Rating */}
                {question.type === 'star_rating' && (
                  <div className="flex items-center gap-2 py-2">
                    {Array.from({ length: question.maxStars || 5 }).map((_, i) => {
                      const starIdx = i + 1;
                      const isFilled = (answerVal || 0) >= starIdx;
                      return (
                        <button
                          key={starIdx}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, starIdx)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isFilled ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                    {answerVal ? (
                      <span className="font-mono text-xs opacity-70 ml-2">
                        {answerVal} of {question.maxStars || 5} Stars
                      </span>
                    ) : null}
                  </div>
                )}

                {/* 8. Email */}
                {question.type === 'email' && (
                  <input
                    type="email"
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'username@example.com'}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-hidden transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-[#00C853]'
                        : 'bg-black/50 border-white/10 text-white focus:border-[#00C853]'
                    }`}
                  />
                )}

                {/* 9. Number */}
                {question.type === 'number' && (
                  <input
                    type="number"
                    min={question.validation.minValue}
                    max={question.validation.maxValue}
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'Enter a number...'}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-hidden transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-[#00C853]'
                        : 'bg-black/50 border-white/10 text-white focus:border-[#00C853]'
                    }`}
                  />
                )}

                {/* 10. Phone */}
                {question.type === 'phone' && (
                  <input
                    type="tel"
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || '+1 (555) 000-0000'}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-hidden transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-[#00C853]'
                        : 'bg-black/50 border-white/10 text-white focus:border-[#00C853]'
                    }`}
                  />
                )}

                {/* 11. Website / URL */}
                {question.type === 'url' && (
                  <input
                    type="url"
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder || 'https://...'}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-hidden transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-[#00C853]'
                        : 'bg-black/50 border-white/10 text-white focus:border-[#00C853]'
                    }`}
                  />
                )}

                {/* 12. Date Picker */}
                {question.type === 'date' && (
                  <input
                    type="date"
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-mono focus:outline-hidden transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : 'bg-black/50 border-white/10 text-white'
                    }`}
                  />
                )}

                {/* 13. Time Picker */}
                {question.type === 'time' && (
                  <input
                    type="time"
                    value={answerVal || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-mono focus:outline-hidden transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : 'bg-black/50 border-white/10 text-white'
                    }`}
                  />
                )}

                {/* 14. File Upload */}
                {question.type === 'file_upload' && (
                  <div>
                    {answerVal?.url ? (
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-300 truncate max-w-[200px]">
                          {answerVal.name || 'Uploaded File'}
                        </span>
                        <a
                          href={answerVal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00C853] hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          View File <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/20 rounded-2xl p-5 text-center bg-black/30 hover:border-[#00C853]/50 transition-colors">
                        <input
                          type="file"
                          id={`file-${question.id}`}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(question.id, file);
                          }}
                        />
                        <label
                          htmlFor={`file-${question.id}`}
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <UploadCloud className="w-6 h-6 text-[#00C853]" />
                          <span className="text-xs font-bold text-white">
                            {uploadingFiles[question.id]
                              ? 'Uploading to secure storage...'
                              : 'Click to select or upload attachment'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Inline Error Message */}
                {hasError && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-red-400 text-xs font-medium animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors[question.id]}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Submission error banner */}
          {submissionError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* Navigation Controls: Next / Back / Submit */}
          <div className="pt-4 flex items-center justify-between gap-4">
            {currentSectionIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrevSection}
                className="px-5 py-3 rounded-2xl border bg-black/40 border-white/10 text-zinc-300 font-mono text-xs flex items-center gap-2 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Page</span>
              </button>
            ) : <div />}

            {!isLastSection ? (
              <button
                type="button"
                onClick={handleNextSection}
                className="px-6 py-3 rounded-2xl text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-2xl text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xl hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: accent }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{form.appearance.submitButtonText || 'Submit Response'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Minimal Footer */}
        <div className="pt-8 text-center border-t border-white/5">
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
            Powered by Usama Rasheed Data Platform
          </p>
        </div>
      </div>
    </div>
  );
}
