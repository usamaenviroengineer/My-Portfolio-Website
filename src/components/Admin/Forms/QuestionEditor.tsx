import React from 'react';
import { 
  FormQuestion, 
  QuestionType, 
  QuestionOption, 
  FormSection, 
  ConditionalLogic 
} from '../../../types/form';
import { 
  Type, 
  AlignLeft, 
  CheckCircle2, 
  CheckSquare, 
  ChevronDown, 
  Sliders, 
  Star, 
  Calendar, 
  Clock, 
  Hash, 
  Mail, 
  Phone, 
  Globe, 
  UploadCloud, 
  Heading, 
  FileText, 
  Trash2, 
  Copy, 
  Plus, 
  X, 
  Settings2, 
  GitFork,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface QuestionEditorProps {
  key?: React.Key;
  question: FormQuestion;
  index: number;
  totalQuestions: number;
  allQuestions: FormQuestion[];
  sections: FormSection[];
  onUpdate: (updated: FormQuestion) => void;
  onDuplicate: (question: FormQuestion) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  accentColor?: string;
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any; category: string }[] = [
  { type: 'short_answer', label: 'Short Answer', icon: Type, category: 'Text' },
  { type: 'paragraph', label: 'Paragraph / Long Text', icon: AlignLeft, category: 'Text' },
  { type: 'multiple_choice', label: 'Multiple Choice (Single)', icon: CheckCircle2, category: 'Choices' },
  { type: 'checkboxes', label: 'Checkboxes (Multi-select)', icon: CheckSquare, category: 'Choices' },
  { type: 'dropdown', label: 'Dropdown Select', icon: ChevronDown, category: 'Choices' },
  { type: 'linear_scale', label: 'Linear Scale', icon: Sliders, category: 'Rating & Scale' },
  { type: 'star_rating', label: 'Star Rating', icon: Star, category: 'Rating & Scale' },
  { type: 'number', label: 'Number', icon: Hash, category: 'Specialized' },
  { type: 'email', label: 'Email Address', icon: Mail, category: 'Specialized' },
  { type: 'phone', label: 'Phone Number', icon: Phone, category: 'Specialized' },
  { type: 'url', label: 'Website / URL', icon: Globe, category: 'Specialized' },
  { type: 'date', label: 'Date Picker', icon: Calendar, category: 'Date & Time' },
  { type: 'time', label: 'Time Picker', icon: Clock, category: 'Date & Time' },
  { type: 'file_upload', label: 'File Upload', icon: UploadCloud, category: 'Advanced' },
  { type: 'section_header', label: 'Section Header', icon: Heading, category: 'Layout' },
  { type: 'statement', label: 'Information Statement', icon: FileText, category: 'Layout' },
];

export default function QuestionEditor({
  question,
  index,
  totalQuestions,
  allQuestions,
  sections,
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  accentColor = '#00C853',
}: QuestionEditorProps) {
  const [showLogicSettings, setShowLogicSettings] = React.useState(false);
  const [showAdvancedValidation, setShowAdvancedValidation] = React.useState(false);

  // Helper for option updating
  const handleAddOption = () => {
    const options = question.options || [];
    const newOpt: QuestionOption = {
      id: `opt-${Date.now()}-${options.length + 1}`,
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    onUpdate({ ...question, options: [...options, newOpt] });
  };

  const handleUpdateOption = (optIndex: number, label: string) => {
    const options = [...(question.options || [])];
    options[optIndex] = {
      ...options[optIndex],
      label,
      value: label.toLowerCase().replace(/\s+/g, '_'),
    };
    onUpdate({ ...question, options });
  };

  const handleRemoveOption = (optIndex: number) => {
    const options = (question.options || []).filter((_, i) => i !== optIndex);
    onUpdate({ ...question, options });
  };

  // Helper for conditional logic
  const handleAddLogic = () => {
    const eligibleQuestions = allQuestions.filter((q) => q.id !== question.id);
    if (eligibleQuestions.length === 0) return;

    const newRule: ConditionalLogic = {
      id: `rule-${Date.now()}`,
      action: 'show',
      targetQuestionId: eligibleQuestions[0].id,
      operator: 'equals',
      value: '',
    };
    onUpdate({ ...question, logic: [...(question.logic || []), newRule] });
  };

  const handleUpdateLogic = (ruleIndex: number, updatedRule: ConditionalLogic) => {
    const logic = [...(question.logic || [])];
    logic[ruleIndex] = updatedRule;
    onUpdate({ ...question, logic });
  };

  const handleRemoveLogic = (ruleIndex: number) => {
    const logic = (question.logic || []).filter((_, i) => i !== ruleIndex);
    onUpdate({ ...question, logic });
  };

  const hasOptions = ['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type);
  const isRating = question.type === 'star_rating';
  const isScale = question.type === 'linear_scale';
  const isStatic = ['section_header', 'statement'].includes(question.type);

  return (
    <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 transition-all hover:border-white/20 shadow-lg relative group">
      {/* Top Header / Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono text-[11px] font-bold text-zinc-400">
            {index + 1}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {QUESTION_TYPES.find((t) => t.type === question.type)?.label || question.type}
          </span>
          {question.validation.required && !isStatic && (
            <span className="text-red-400 font-mono text-xs" title="Required field">
              *
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalQuestions - 1}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => onDuplicate(question)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Duplicate Question"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete Question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Title & Question Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Title Input */}
        <div className="md:col-span-2 space-y-1">
          <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
            {isStatic ? 'Header / Title' : 'Question Prompt'}
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdate({ ...question, title: e.target.value })}
            placeholder={isStatic ? 'Section Title or Statement...' : 'e.g., What is your primary project objective?'}
            className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-[#00C853] transition-colors"
          />
        </div>

        {/* Question Type Selector */}
        <div className="space-y-1">
          <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
            Field Type
          </label>
          <select
            value={question.type}
            onChange={(e) => {
              const newType = e.target.value as QuestionType;
              let defaultOpts = question.options;
              if (['multiple_choice', 'checkboxes', 'dropdown'].includes(newType) && (!defaultOpts || defaultOpts.length === 0)) {
                defaultOpts = [
                  { id: 'opt-1', label: 'Option 1', value: 'option_1' },
                  { id: 'opt-2', label: 'Option 2', value: 'option_2' },
                ];
              }
              onUpdate({
                ...question,
                type: newType,
                options: defaultOpts,
                scaleMin: newType === 'linear_scale' ? 1 : question.scaleMin,
                scaleMax: newType === 'linear_scale' ? 5 : question.scaleMax,
                maxStars: newType === 'star_rating' ? 5 : question.maxStars,
              });
            }}
            className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-hidden focus:border-[#00C853] transition-colors cursor-pointer"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.type} value={t.type} className="bg-[#141418] text-white py-1">
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description / Subtitle / Helper text */}
      <div className="mb-4">
        <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider mb-1">
          Helper Description or Context (Optional)
        </label>
        <input
          type="text"
          value={question.description || ''}
          onChange={(e) => onUpdate({ ...question, description: e.target.value })}
          placeholder="e.g. Include specific technical sensors, data formats, or deadline requirements"
          className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-xl text-zinc-300 text-xs focus:outline-hidden focus:border-white/20 transition-colors"
        />
      </div>

      {/* Placeholder (for text, email, number, url, phone, paragraph) */}
      {['short_answer', 'paragraph', 'number', 'email', 'phone', 'url'].includes(question.type) && (
        <div className="mb-4">
          <label className="block font-mono text-[10px] uppercase text-zinc-400 tracking-wider mb-1">
            Input Placeholder
          </label>
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
            placeholder="e.g. Type your answer here..."
            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-xl text-zinc-300 text-xs focus:outline-hidden focus:border-white/20 transition-colors"
          />
        </div>
      )}

      {/* Options Manager (Multiple choice, Checkboxes, Dropdown) */}
      {hasOptions && (
        <div className="mb-4 bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Choice Options
            </span>
            <button
              onClick={handleAddOption}
              className="text-[11px] font-mono text-[#00C853] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Option
            </button>
          </div>

          <div className="space-y-2">
            {(question.options || []).map((opt, optIdx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="text-zinc-600 font-mono text-xs select-none">
                  {question.type === 'multiple_choice' ? '○' : question.type === 'checkboxes' ? '□' : `${optIdx + 1}.`}
                </span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                  placeholder={`Option ${optIdx + 1}`}
                  className="flex-grow px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]"
                />
                {(question.options || []).length > 1 && (
                  <button
                    onClick={() => handleRemoveOption(optIdx)}
                    className="p-1 hover:bg-white/10 text-zinc-500 hover:text-red-400 rounded-md transition-colors cursor-pointer"
                    title="Remove Option"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linear Scale Config */}
      {isScale && (
        <div className="mb-4 bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
            Linear Scale Configuration
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">Scale Min</label>
              <select
                value={question.scaleMin || 1}
                onChange={(e) => onUpdate({ ...question, scaleMin: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">Scale Max</label>
              <select
                value={question.scaleMax || 5}
                onChange={(e) => onUpdate({ ...question, scaleMax: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">Min Label (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Strongly Disagree"
                value={question.scaleMinLabel || ''}
                onChange={(e) => onUpdate({ ...question, scaleMinLabel: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">Max Label (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Strongly Agree"
                value={question.scaleMaxLabel || ''}
                onChange={(e) => onUpdate({ ...question, scaleMaxLabel: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Star Rating Config */}
      {isRating && (
        <div className="mb-4 bg-black/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Number of Stars:
          </span>
          <select
            value={question.maxStars || 5}
            onChange={(e) => onUpdate({ ...question, maxStars: Number(e.target.value) })}
            className="px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white font-mono"
          >
            <option value={3}>3 Stars</option>
            <option value={5}>5 Stars (Standard)</option>
            <option value={7}>7 Stars</option>
            <option value={10}>10 Stars</option>
          </select>
        </div>
      )}

      {/* Section Assignment */}
      {sections.length > 1 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Assign to Section / Page:
          </span>
          <select
            value={question.sectionId || sections[0].id}
            onChange={(e) => onUpdate({ ...question, sectionId: e.target.value })}
            className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-zinc-200 font-mono"
          >
            {sections.map((s, sIdx) => (
              <option key={s.id} value={s.id}>
                Section {sIdx + 1}: {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bottom Row Controls: Required Toggle, Conditional Logic, Advanced Validation */}
      {!isStatic && (
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Required switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={question.validation.required}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    validation: { ...question.validation, required: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-[#00C853] rounded cursor-pointer"
              />
              <span className="font-mono text-xs text-zinc-300">Required</span>
            </label>

            {/* Conditional Logic Button */}
            <button
              type="button"
              onClick={() => setShowLogicSettings(!showLogicSettings)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                (question.logic && question.logic.length > 0)
                  ? 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/30'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Logic {(question.logic && question.logic.length > 0) ? `(${question.logic.length})` : ''}</span>
            </button>

            {/* Validation settings button */}
            <button
              type="button"
              onClick={() => setShowAdvancedValidation(!showAdvancedValidation)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* Conditional Logic Sub-panel */}
      {showLogicSettings && (
        <div className="mt-4 bg-black/40 border border-[#00C853]/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-[#00C853]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-white font-bold">
                Conditional Display Rules
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddLogic}
              className="text-xs font-mono text-[#00C853] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Rule
            </button>
          </div>

          <p className="text-[11px] text-zinc-400">
            Control when this question is shown or hidden based on how respondents answer earlier questions.
          </p>

          {(question.logic && question.logic.length > 0) ? (
            <div className="space-y-2">
              {question.logic.map((rule, ruleIdx) => {
                const targetQ = allQuestions.find((q) => q.id === rule.targetQuestionId);
                return (
                  <div key={rule.id} className="flex flex-wrap items-center gap-2 bg-[#121215] p-2.5 rounded-lg border border-white/5 text-xs font-mono">
                    <select
                      value={rule.action}
                      onChange={(e) =>
                        handleUpdateLogic(ruleIdx, { ...rule, action: e.target.value as any })
                      }
                      className="px-2 py-1 bg-black/60 border border-white/10 rounded text-zinc-300"
                    >
                      <option value="show">Show</option>
                      <option value="hide">Hide</option>
                    </select>
                    <span className="text-zinc-500">if</span>
                    <select
                      value={rule.targetQuestionId}
                      onChange={(e) =>
                        handleUpdateLogic(ruleIdx, { ...rule, targetQuestionId: e.target.value })
                      }
                      className="px-2 py-1 bg-black/60 border border-white/10 rounded text-zinc-300 max-w-[160px] truncate"
                    >
                      {allQuestions
                        .filter((q) => q.id !== question.id)
                        .map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title || `Question ${q.id}`}
                          </option>
                        ))}
                    </select>
                    <select
                      value={rule.operator}
                      onChange={(e) =>
                        handleUpdateLogic(ruleIdx, { ...rule, operator: e.target.value as any })
                      }
                      className="px-2 py-1 bg-black/60 border border-white/10 rounded text-zinc-300"
                    >
                      <option value="equals">equals</option>
                      <option value="not_equals">does not equal</option>
                      <option value="contains">contains</option>
                      <option value="is_filled">is filled / answered</option>
                      <option value="is_empty">is empty / skipped</option>
                    </select>

                    {rule.operator !== 'is_filled' && rule.operator !== 'is_empty' && (
                      <input
                        type="text"
                        value={rule.value || ''}
                        onChange={(e) =>
                          handleUpdateLogic(ruleIdx, { ...rule, value: e.target.value })
                        }
                        placeholder="Expected value..."
                        className="px-2 py-1 bg-black/60 border border-white/10 rounded text-zinc-200 text-xs flex-grow min-w-[100px]"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveLogic(ruleIdx)}
                      className="p-1 hover:bg-white/10 text-zinc-500 hover:text-red-400 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] font-mono text-zinc-500 italic py-1">
              No conditional rules attached. This question will always be displayed.
            </div>
          )}
        </div>
      )}

      {/* Advanced Validation Sub-panel */}
      {showAdvancedValidation && (
        <div className="mt-4 bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white font-bold block">
            Custom Validation Limits
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {['short_answer', 'paragraph'].includes(question.type) && (
              <>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">Min Characters</label>
                  <input
                    type="number"
                    min="0"
                    value={question.validation.minLength || ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        validation: {
                          ...question.validation,
                          minLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g. 10"
                    className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">Max Characters</label>
                  <input
                    type="number"
                    min="0"
                    value={question.validation.maxLength || ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        validation: {
                          ...question.validation,
                          maxLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g. 500"
                    className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </>
            )}

            {question.type === 'number' && (
              <>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">Minimum Value</label>
                  <input
                    type="number"
                    value={question.validation.minValue !== undefined ? question.validation.minValue : ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        validation: {
                          ...question.validation,
                          minValue: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g. 0"
                    className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">Maximum Value</label>
                  <input
                    type="number"
                    value={question.validation.maxValue !== undefined ? question.validation.maxValue : ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        validation: {
                          ...question.validation,
                          maxValue: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g. 100"
                    className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
