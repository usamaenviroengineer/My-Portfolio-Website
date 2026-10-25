import React, { useState, useEffect } from 'react';
import { Form } from '../types/form';
import { 
  getAllFormsAdmin, 
  deleteForm, 
  duplicateForm, 
  setFormStatus 
} from '../services/formService';
import FormsDashboard from './Admin/Forms/FormsDashboard';
import FormBuilder from './Admin/Forms/FormBuilder';
import FormResponsesView from './Admin/Forms/FormResponsesView';
import { 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';

interface FormsManagementPanelProps {
  onOpenLiveForm?: (slug: string) => void;
}

export default function FormsManagementPanel({ onOpenLiveForm }: FormsManagementPanelProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'builder' | 'responses'>('dashboard');
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await getAllFormsAdmin();
      setForms(data);
    } catch (err) {
      console.error('Failed to load forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  // Create new blank form
  const handleCreateNew = () => {
    const newId = `form-${Date.now()}`;
    const newForm: Form = {
      id: newId,
      title: 'Untitled Form',
      slug: `form-${Date.now().toString(36)}`,
      description: 'Please complete the questionnaire below.',
      status: 'draft',
      sections: [
        { id: `sec-${Date.now()}`, title: 'General Information', description: 'Core details' },
      ],
      questions: [
        {
          id: `q-name-${Date.now()}`,
          type: 'short_answer',
          title: 'Full Name',
          placeholder: 'e.g. John Doe',
          validation: { required: true },
        },
        {
          id: `q-email-${Date.now()}`,
          type: 'email',
          title: 'Email Address',
          placeholder: 'john@example.com',
          validation: { required: true },
        },
      ],
      appearance: {
        accentColor: '#00C853',
        themeMode: 'dark',
        fontStyle: 'sans',
        submitButtonText: 'Submit Response',
        cardStyle: 'modern',
        showProgressBar: true,
        showQuestionNumbers: true,
        backgroundPattern: 'grid',
      },
      settings: {
        status: 'draft',
        allowMultipleSubmissions: true,
        successMessageTitle: 'Response Submitted!',
        successMessageBody: 'Thank you for submitting your response. Your details have been recorded safely.',
      },
      responsesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentForm(newForm);
    setActiveView('builder');
  };

  // Edit existing form
  const handleEditForm = (form: Form) => {
    setCurrentForm({ ...form });
    setActiveView('builder');
  };

  // View responses
  const handleViewResponses = (form: Form) => {
    setCurrentForm({ ...form });
    setActiveView('responses');
  };

  // Duplicate form
  const handleDuplicate = async (formId: string) => {
    setActionLoading(true);
    const res = await duplicateForm(formId);
    setActionLoading(false);
    if (res.success && res.form) {
      showToast('success', `Created duplicate: "${res.form.title}"`);
      loadForms();
    } else {
      showToast('error', res.error || 'Failed to duplicate form');
    }
  };

  // Delete form confirm
  const confirmDelete = async () => {
    if (!formToDelete) return;
    setActionLoading(true);
    const res = await deleteForm(formToDelete.id);
    setActionLoading(false);
    if (res.success) {
      showToast('success', `Deleted form "${formToDelete.title}"`);
      setFormToDelete(null);
      loadForms();
    } else {
      showToast('error', res.error || 'Failed to delete form');
    }
  };

  // Toggle status
  const handleToggleStatus = async (
    formId: string, 
    newStatus: 'draft' | 'published' | 'closed' | 'archived'
  ) => {
    setActionLoading(true);
    const res = await setFormStatus(formId, newStatus);
    setActionLoading(false);
    if (res.success) {
      showToast('success', `Form status set to ${newStatus}`);
      loadForms();
    } else {
      showToast('error', 'Failed to update status');
    }
  };

  // Handle open live public form
  const handleOpenLiveForm = (slug: string) => {
    if (onOpenLiveForm) {
      onOpenLiveForm(slug);
    } else {
      window.open(`/forms/${slug}`, '_blank');
    }
  };

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
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {formToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Delete Form?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{formToDelete.title}"</strong> and all of its collected responses? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setFormToDelete(null)}
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

      {/* VIEW: DASHBOARD */}
      {activeView === 'dashboard' && (
        <FormsDashboard
          forms={forms}
          loading={loading}
          onCreateNew={handleCreateNew}
          onEditForm={handleEditForm}
          onViewResponses={handleViewResponses}
          onDuplicateForm={handleDuplicate}
          onDeleteForm={(f) => setFormToDelete(f)}
          onToggleStatus={handleToggleStatus}
          onRefresh={loadForms}
          onOpenLiveForm={handleOpenLiveForm}
        />
      )}

      {/* VIEW: BUILDER */}
      {activeView === 'builder' && currentForm && (
        <FormBuilder
          initialForm={currentForm}
          onBack={() => {
            setActiveView('dashboard');
            loadForms();
          }}
          onSaved={(savedForm) => {
            setCurrentForm(savedForm);
            loadForms();
          }}
        />
      )}

      {/* VIEW: RESPONSES */}
      {activeView === 'responses' && currentForm && (
        <FormResponsesView
          form={currentForm}
          onBack={() => {
            setActiveView('dashboard');
            loadForms();
          }}
          onRefreshForm={loadForms}
        />
      )}
    </div>
  );
}
