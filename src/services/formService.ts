import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Form, FormQuestion, FormResponse, FormSubmissionPayload, ConditionalLogic } from '../types/form';

const LOCAL_STORAGE_FORMS_KEY = 'usama_portfolio_forms_v1';
const LOCAL_STORAGE_RESPONSES_KEY = 'usama_portfolio_form_responses_v1';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Initial Starter Templates for Usama's Environmental Engineering & AI Consulting
export const STARTER_FORMS: Form[] = [
  {
    id: 'form-consultation-inquiry',
    title: 'Client Project Inquiry & Scope Assessment',
    slug: 'consultation-inquiry',
    description: 'Provide details about your environmental engineering, air quality modeling, or AI workflow requirements.',
    status: 'published',
    sections: [
      { id: 'sec-1', title: 'Contact & Organization', description: 'Tell us a bit about who you are' },
      { id: 'sec-2', title: 'Technical Requirements', description: 'Specify the scope of your environmental or AI project' },
      { id: 'sec-3', title: 'Timeline & Budget', description: 'Expected delivery and resource allocation' },
    ],
    questions: [
      {
        id: 'q-name',
        sectionId: 'sec-1',
        type: 'short_answer',
        title: 'Full Name',
        placeholder: 'e.g. Dr. Sarah Jenkins',
        validation: { required: true, minLength: 2 },
      },
      {
        id: 'q-email',
        sectionId: 'sec-1',
        type: 'email',
        title: 'Work Email Address',
        placeholder: 'sarah@organization.org',
        validation: { required: true },
      },
      {
        id: 'q-org',
        sectionId: 'sec-1',
        type: 'short_answer',
        title: 'Company / Organization / University',
        placeholder: 'e.g. CleanAir Research Institute',
        validation: { required: true },
      },
      {
        id: 'q-services',
        sectionId: 'sec-2',
        type: 'checkboxes',
        title: 'Areas of Interest (Select all that apply)',
        options: [
          { id: 'opt-1', label: 'Air Quality Monitoring & Predictive Modeling', value: 'air_quality' },
          { id: 'opt-2', label: 'Biochar & Carbon Sequestration Systems', value: 'biochar' },
          { id: 'opt-3', label: 'IoT Sensor Networks & Embedded Hardware', value: 'iot' },
          { id: 'opt-4', label: 'Machine Learning & Predictive AI Pipelines', value: 'ml_ai' },
          { id: 'opt-5', label: 'Custom Web & Data Analytics Dashboards', value: 'web_dashboards' },
        ],
        validation: { required: true },
      },
      {
        id: 'q-project-details',
        sectionId: 'sec-2',
        type: 'paragraph',
        title: 'Project Overview & Objectives',
        description: 'Describe the main challenges, desired deliverables, and current system architecture.',
        placeholder: 'Describe your vision or current bottlenecks in detail...',
        validation: { required: true, minLength: 20 },
      },
      {
        id: 'q-urgency',
        sectionId: 'sec-3',
        type: 'dropdown',
        title: 'Expected Project Timeline',
        options: [
          { id: 'u-1', label: 'Immediate (< 2 weeks)', value: 'immediate' },
          { id: 'u-2', label: 'Standard (1 - 2 months)', value: 'standard' },
          { id: 'u-3', label: 'Long-term / Ongoing Collaboration', value: 'long_term' },
          { id: 'u-4', label: 'Exploratory / Feasibility Stage', value: 'exploratory' },
        ],
        validation: { required: true },
      },
      {
        id: 'q-urgency-rating',
        sectionId: 'sec-3',
        type: 'linear_scale',
        title: 'Priority Level (1: Low to 5: Critical)',
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: 'Low priority',
        scaleMaxLabel: 'Mission critical',
        validation: { required: false },
      },
    ],
    appearance: {
      accentColor: '#00C853',
      themeMode: 'dark',
      fontStyle: 'sans',
      submitButtonText: 'Submit Consultation Request',
      cardStyle: 'modern',
      showProgressBar: true,
      showQuestionNumbers: true,
      backgroundPattern: 'grid',
    },
    settings: {
      status: 'published',
      allowMultipleSubmissions: true,
      successMessageTitle: 'Inquiry Received Successfully!',
      successMessageBody: 'Thank you for contacting Usama Rasheed. Your project scope has been logged and you will receive a response within 24-48 hours.',
      closedMessage: 'This inquiry form is currently not accepting new responses.',
    },
    responsesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'form-feedback-assessment',
    title: 'Client Project Feedback & Experience Review',
    slug: 'client-feedback',
    description: 'Help us improve our delivery quality by rating your consulting and engineering experience.',
    status: 'published',
    sections: [
      { id: 'f-sec-1', title: 'Experience Rating', description: 'Overall project satisfaction' },
    ],
    questions: [
      {
        id: 'q-client-name',
        sectionId: 'f-sec-1',
        type: 'short_answer',
        title: 'Your Name (Optional)',
        placeholder: 'John Doe',
        validation: { required: false },
      },
      {
        id: 'q-satisfaction',
        sectionId: 'f-sec-1',
        type: 'star_rating',
        title: 'Overall Satisfaction with Deliverables',
        maxStars: 5,
        validation: { required: true },
      },
      {
        id: 'q-technical-depth',
        sectionId: 'f-sec-1',
        type: 'linear_scale',
        title: 'Technical Depth & Solution Precision',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Below expectations',
        scaleMaxLabel: 'Exceptional mastery',
        validation: { required: true },
      },
      {
        id: 'q-recommend',
        sectionId: 'f-sec-1',
        type: 'multiple_choice',
        title: 'Would you recommend Usama Rasheed to industry peers?',
        options: [
          { id: 'r-yes', label: 'Definitely yes', value: 'yes' },
          { id: 'r-maybe', label: 'Likely / neutral', value: 'maybe' },
          { id: 'r-no', label: 'No', value: 'no' },
        ],
        validation: { required: true },
      },
      {
        id: 'q-testimonials',
        sectionId: 'f-sec-1',
        type: 'paragraph',
        title: 'Comments or Testimonial',
        placeholder: 'What stood out most during the collaboration?',
        validation: { required: false },
      },
    ],
    appearance: {
      accentColor: '#10B981',
      themeMode: 'dark',
      fontStyle: 'sans',
      submitButtonText: 'Send Feedback',
      cardStyle: 'modern',
      showProgressBar: true,
      showQuestionNumbers: true,
      backgroundPattern: 'dots',
    },
    settings: {
      status: 'published',
      allowMultipleSubmissions: true,
      successMessageTitle: 'Thank You for Your Feedback!',
      successMessageBody: 'Your insights help continuously refine our engineering frameworks and deliverables.',
    },
    responsesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to get local forms
function getLocalForms(): Form[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FORMS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_FORMS_KEY, JSON.stringify(STARTER_FORMS));
      return STARTER_FORMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading local forms:', err);
    return STARTER_FORMS;
  }
}

function saveLocalForms(forms: Form[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_FORMS_KEY, JSON.stringify(forms));
  } catch (err) {
    console.warn('Error saving local forms:', err);
  }
}

// Helper to get local responses
function getLocalResponses(formId?: string): FormResponse[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESPONSES_KEY);
    const list: FormResponse[] = raw ? JSON.parse(raw) : [];
    if (formId) {
      return list.filter((r) => r.formId === formId);
    }
    return list;
  } catch (err) {
    console.warn('Error reading local responses:', err);
    return [];
  }
}

function saveLocalResponse(response: FormResponse): void {
  try {
    const list = getLocalResponses();
    list.unshift(response);
    localStorage.setItem(LOCAL_STORAGE_RESPONSES_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Error saving local response:', err);
  }
}

/**
 * Admin: Get all forms with response counts
 */
export async function getAllFormsAdmin(): Promise<Form[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database columns to Form interface
        const forms: Form[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description || '',
          status: row.status,
          sections: row.sections || [],
          questions: row.questions || [],
          appearance: row.appearance || {},
          settings: row.settings || {},
          responsesCount: row.responses_count || 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        saveLocalForms(forms);
        return forms;
      }
    } catch (err) {
      console.warn('Supabase forms query failed, falling back to local storage:', err);
    }
  }

  return getLocalForms();
}

/**
 * Admin: Get single form by ID
 */
export async function getFormByIdAdmin(formId: string): Promise<Form | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          status: data.status,
          sections: data.sections || [],
          questions: data.questions || [],
          appearance: data.appearance || {},
          settings: data.settings || {},
          responsesCount: data.responses_count || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn('Error loading form from Supabase:', err);
    }
  }

  const local = getLocalForms();
  return local.find((f) => f.id === formId) || null;
}

/**
 * Public Responder: Get published form by Slug
 */
export async function getPublishedFormBySlug(slug: string): Promise<Form | null> {
  const cleanSlug = slug.toLowerCase().trim();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', cleanSlug)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          status: data.status,
          sections: data.sections || [],
          questions: data.questions || [],
          appearance: data.appearance || {},
          settings: data.settings || {},
          responsesCount: data.responses_count || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn('Error retrieving published form from Supabase:', err);
    }
  }

  const local = getLocalForms();
  return local.find((f) => f.slug.toLowerCase() === cleanSlug) || null;
}

/**
 * Admin: Save or update Form
 */
export async function saveForm(form: Form): Promise<{ success: boolean; form?: Form; error?: string }> {
  const cleanSlug = slugify(form.slug || form.title);
  const now = new Date().toISOString();
  
  const formToPersist: Form = {
    ...form,
    slug: cleanSlug,
    updatedAt: now,
    createdAt: form.createdAt || now,
    responsesCount: form.responsesCount || 0,
  };

  let supabaseSucceeded = false;

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: formToPersist.id,
        title: formToPersist.title,
        slug: formToPersist.slug,
        description: formToPersist.description,
        status: formToPersist.status,
        sections: formToPersist.sections,
        questions: formToPersist.questions,
        appearance: formToPersist.appearance,
        settings: formToPersist.settings,
        responses_count: formToPersist.responsesCount,
        created_at: formToPersist.createdAt,
        updated_at: formToPersist.updatedAt,
      };

      const { error } = await supabase
        .from('forms')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase forms upsert warning:', error.message);
      } else {
        supabaseSucceeded = true;
      }
    } catch (err: any) {
      console.warn('Supabase upsert exception:', err);
    }
  }

  // Always keep local storage synchronized
  const localList = getLocalForms();
  const existingIdx = localList.findIndex((f) => f.id === formToPersist.id);
  if (existingIdx >= 0) {
    localList[existingIdx] = formToPersist;
  } else {
    localList.unshift(formToPersist);
  }
  saveLocalForms(localList);

  return { success: true, form: formToPersist };
}

/**
 * Admin: Delete Form
 */
export async function deleteForm(formId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('form_responses').delete().eq('form_id', formId);
      const { error } = await supabase.from('forms').delete().eq('id', formId);
      if (error) {
        console.warn('Supabase delete error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  }

  const localList = getLocalForms().filter((f) => f.id !== formId);
  saveLocalForms(localList);

  // Clean local responses too
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESPONSES_KEY);
    if (raw) {
      const allResponses: FormResponse[] = JSON.parse(raw);
      const filtered = allResponses.filter((r) => r.formId !== formId);
      localStorage.setItem(LOCAL_STORAGE_RESPONSES_KEY, JSON.stringify(filtered));
    }
  } catch {}

  return { success: true };
}

/**
 * Admin: Duplicate Form
 */
export async function duplicateForm(formId: string): Promise<{ success: boolean; form?: Form; error?: string }> {
  const original = await getFormByIdAdmin(formId);
  if (!original) {
    return { success: false, error: 'Form not found' };
  }

  const newId = `form-${Date.now()}`;
  const newSlug = `${original.slug}-copy-${Math.random().toString(36).substring(2, 6)}`;
  
  const cloned: Form = {
    ...original,
    id: newId,
    title: `${original.title} (Copy)`,
    slug: newSlug,
    status: 'draft',
    responsesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveForm(cloned);
}

/**
 * Admin: Toggle or Set Form Status
 */
export async function setFormStatus(
  formId: string, 
  status: 'draft' | 'published' | 'closed' | 'archived'
): Promise<{ success: boolean; error?: string }> {
  const form = await getFormByIdAdmin(formId);
  if (!form) return { success: false, error: 'Form not found' };

  form.status = status;
  form.settings.status = status;
  return saveForm(form);
}

/**
 * Public: Submit response to a form
 */
export async function submitFormResponse(
  payload: FormSubmissionPayload
): Promise<{ success: boolean; responseId?: string; error?: string }> {
  // Anti-spam honeypot verification
  if (payload.botTrap && payload.botTrap.trim().length > 0) {
    // Silently return success to mislead spambot
    return { success: true, responseId: 'spambot-rejected' };
  }

  const responseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  // Try stored procedure first if Supabase is active
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('submit_form_response_secure', {
        p_response_id: responseId,
        p_form_slug: payload.formSlug,
        p_answers: payload.answers,
        p_meta: payload.meta || { submittedAt: now },
      });

      if (!rpcError && rpcData) {
        if (rpcData.success) {
          return { success: true, responseId };
        } else {
          return { success: false, error: rpcData.error || 'Submission declined.' };
        }
      }
    } catch (rpcErr) {
      console.warn('RPC submission failed, attempting direct table insert:', rpcErr);
    }

    // Direct insert fallback if RPC was not created yet
    try {
      const { error: insertError } = await supabase
        .from('form_responses')
        .insert({
          id: responseId,
          form_id: payload.formId,
          form_slug: payload.formSlug,
          answers: payload.answers,
          respondent_meta: payload.meta || { submittedAt: now },
          created_at: now,
        });

      if (!insertError) {
        // Increment count
        await supabase
          .from('forms')
          .update({ responses_count: (payload as any).currentCount ? (payload as any).currentCount + 1 : 1 })
          .eq('id', payload.formId);

        return { success: true, responseId };
      }
    } catch (directErr) {
      console.warn('Direct insert failed, using local storage fallback:', directErr);
    }
  }

  // Local storage fallback
  const localResponse: FormResponse = {
    id: responseId,
    formId: payload.formId,
    formSlug: payload.formSlug,
    answers: payload.answers,
    respondentMeta: {
      submittedAt: payload.meta?.submittedAt || now,
      userAgent: payload.meta?.userAgent,
      referrer: payload.meta?.referrer,
    },
    createdAt: now,
  };
  saveLocalResponse(localResponse);

  // Update local form response count
  const localForms = getLocalForms();
  const form = localForms.find((f) => f.id === payload.formId || f.slug === payload.formSlug);
  if (form) {
    form.responsesCount = (form.responsesCount || 0) + 1;
    saveLocalForms(localForms);
  }

  return { success: true, responseId };
}

/**
 * Admin: Get all responses for a form
 */
export async function getFormResponsesAdmin(formId: string): Promise<FormResponse[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          formId: row.form_id,
          formSlug: row.form_slug,
          answers: row.answers || {},
          respondentMeta: row.respondent_meta || {},
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn('Error loading form responses from Supabase:', err);
    }
  }

  return getLocalResponses(formId);
}

/**
 * Admin: Delete single response
 */
export async function deleteFormResponseAdmin(
  responseId: string, 
  formId: string
): Promise<{ success: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('form_responses').delete().eq('id', responseId);
    } catch (err) {
      console.warn('Failed to delete response in Supabase:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESPONSES_KEY);
    if (raw) {
      const list: FormResponse[] = JSON.parse(raw);
      const filtered = list.filter((r) => r.id !== responseId);
      localStorage.setItem(LOCAL_STORAGE_RESPONSES_KEY, JSON.stringify(filtered));
    }
  } catch {}

  // Update form count
  const localForms = getLocalForms();
  const form = localForms.find((f) => f.id === formId);
  if (form && form.responsesCount && form.responsesCount > 0) {
    form.responsesCount -= 1;
    saveLocalForms(localForms);
  }

  return { success: true };
}

/**
 * Admin: Clear all responses for a form
 */
export async function clearAllFormResponsesAdmin(formId: string): Promise<{ success: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('form_responses').delete().eq('form_id', formId);
      await supabase.from('forms').update({ responses_count: 0 }).eq('id', formId);
    } catch (err) {
      console.warn('Failed to clear responses in Supabase:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESPONSES_KEY);
    if (raw) {
      const list: FormResponse[] = JSON.parse(raw);
      const filtered = list.filter((r) => r.formId !== formId);
      localStorage.setItem(LOCAL_STORAGE_RESPONSES_KEY, JSON.stringify(filtered));
    }
  } catch {}

  const localForms = getLocalForms();
  const form = localForms.find((f) => f.id === formId);
  if (form) {
    form.responsesCount = 0;
    saveLocalForms(localForms);
  }

  return { success: true };
}

/**
 * Admin: Export responses to clean CSV
 */
export function exportResponsesToCSV(form: Form, responses: FormResponse[]): void {
  if (responses.length === 0) {
    alert('No responses available to export.');
    return;
  }

  const questions = form.questions.filter(
    (q) => q.type !== 'section_header' && q.type !== 'statement'
  );

  // Headers
  const headers = ['Submission ID', 'Submitted At', ...questions.map((q) => q.title || q.id)];

  const csvRows = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',')];

  // Rows
  for (const resp of responses) {
    const submittedDate = new Date(resp.createdAt).toLocaleString('en-US');
    const rowValues = [
      resp.id,
      submittedDate,
      ...questions.map((q) => {
        const val = resp.answers[q.id];
        if (val === undefined || val === null) return '';
        if (Array.isArray(val)) return val.join('; ');
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      }),
    ];

    csvRows.push(rowValues.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  }

  // Prepend UTF-8 BOM so Excel displays characters correctly
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${form.slug}-responses-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Evaluates whether a question should be shown based on conditional logic
 */
export function shouldShowQuestion(
  question: FormQuestion, 
  answers: Record<string, any>
): boolean {
  if (!question.logic || question.logic.length === 0) {
    return true;
  }

  // If ANY logic rule matches
  for (const rule of question.logic) {
    const targetVal = answers[rule.targetQuestionId];
    let conditionMet = false;

    switch (rule.operator) {
      case 'is_filled':
        conditionMet = targetVal !== undefined && targetVal !== null && targetVal !== '' && (!Array.isArray(targetVal) || targetVal.length > 0);
        break;
      case 'is_empty':
        conditionMet = targetVal === undefined || targetVal === null || targetVal === '' || (Array.isArray(targetVal) && targetVal.length === 0);
        break;
      case 'equals':
        conditionMet = String(targetVal) === String(rule.value);
        break;
      case 'not_equals':
        conditionMet = String(targetVal) !== String(rule.value);
        break;
      case 'contains':
        if (Array.isArray(targetVal)) {
          conditionMet = targetVal.includes(rule.value);
        } else if (typeof targetVal === 'string') {
          conditionMet = targetVal.toLowerCase().includes(String(rule.value).toLowerCase());
        }
        break;
      case 'greater_than':
        conditionMet = Number(targetVal) > Number(rule.value);
        break;
      case 'less_than':
        conditionMet = Number(targetVal) < Number(rule.value);
        break;
    }

    if (rule.action === 'show') {
      if (!conditionMet) return false;
    } else if (rule.action === 'hide') {
      if (conditionMet) return false;
    }
  }

  return true;
}
