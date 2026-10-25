export type QuestionType =
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'linear_scale'
  | 'star_rating'
  | 'date'
  | 'time'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'file_upload'
  | 'section_header'
  | 'statement';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  customErrorMessage?: string;
}

export interface ConditionalLogic {
  id: string;
  action: 'show' | 'hide';
  targetQuestionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'is_filled' | 'is_empty' | 'greater_than' | 'less_than';
  value?: any;
}

export interface FormQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  options?: QuestionOption[];
  validation: ValidationRule;
  logic?: ConditionalLogic[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  maxStars?: number;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  sectionId?: string;
  defaultValue?: any;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
}

export interface FormAppearance {
  accentColor: string; // e.g. '#00C853'
  themeMode: 'dark' | 'light' | 'card_contrast';
  fontStyle: 'sans' | 'serif' | 'mono';
  logoUrl?: string;
  coverImageUrl?: string;
  submitButtonText: string;
  cardStyle: 'modern' | 'minimal' | 'glass';
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'glow';
}

export interface FormSettings {
  status: 'draft' | 'published' | 'closed' | 'archived';
  responseLimit?: number;
  expiresAt?: string;
  allowMultipleSubmissions: boolean;
  closedMessage?: string;
  successMessageTitle?: string;
  successMessageBody?: string;
  redirectUrl?: string;
  sendEmailNotification?: boolean;
  notificationEmail?: string;
}

export interface Form {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  sections: FormSection[];
  questions: FormQuestion[];
  appearance: FormAppearance;
  settings: FormSettings;
  responsesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  formSlug?: string;
  answers: Record<string, any>; // questionId -> answer value
  respondentMeta?: {
    submittedAt: string;
    userAgent?: string;
    referrer?: string;
  };
  createdAt: string;
}

export interface FormSubmissionPayload {
  formId: string;
  formSlug: string;
  answers: Record<string, any>;
  botTrap?: string; // honeypot
  meta?: {
    submittedAt?: string;
    userAgent?: string;
    referrer?: string;
  };
}
