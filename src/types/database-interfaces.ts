// =============================================================================
// PERMANENT DATABASE INTERFACES - BASED ON ACTUAL SUPABASE SCHEMA
// =============================================================================

// =============================================================================
// ENUM TYPES - EXACT VALUES FROM DATABASE
// =============================================================================

export type CaseStatus = 'open' | 'in_progress' | 'closed' | 'rejected';
export type CasePriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'high' | 'normal' | 'low';
export type DocStatus = 'verified' | 'pending' | 'rejected';
export type KYCStatus = 'verified' | 'pending' | 'rejected';
export type UserStatus = 'active' | 'inactive';
export type FileType = 'csv' | 'doc' | 'docx' | 'jpeg' | 'jpg' | 'pdf' | 'png' | 'txt' | 'xls' | 'xlsx';
export type WebhookStatus = 'failed' | 'pending' | 'processed';

// =============================================================================
// CORE USER INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface User {
  id: number; // Changed from string to number to match database
  full_name: string; // Changed from name to full_name
  email: string;
  mobile: string; // Changed from phone to mobile
  email_verified_at?: string;
  remember_token?: string;
  department_id?: number;
  employment_type_id?: number;
  organization_id?: number;
  status: UserStatus; // Using actual enum values
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  auth_id?: string; // Supabase auth ID
  role: string; // Role stored as string
  password_hash?: string; // For database-only users
  first_name?: string; // Optional fields
  last_name?: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: string;
}

// =============================================================================
// CUSTOMER INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Customer {
  id: number;
  user_id?: number; // Optional user relationship
  full_name: string; // Changed from name to full_name
  phone?: string; // Phone number field
  email?: string;
  pan_number?: string;
  aadhaar_number?: string;
  dob?: string; // Date of birth, not date_of_birth
  gender?: string;
  marital_status?: string;
  employment?: string;
  risk_profile?: string;
  kyc_status: KYCStatus; // Using actual enum values
  age?: number;
  organization_id?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// CASE INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Case {
  id: number;
  organization_id: number;
  customer_id?: number;
  product_id?: number;
  case_number: string; // Required field
  assigned_to?: number; // User ID who is assigned
  status: CaseStatus; // Using actual enum values
  priority: CasePriority; // Using actual enum values
  loan_amount?: number;
  loan_type?: string;
  created_at: string;
  updated_at: string;
  // Related data (populated by joins)
  customer?: Customer;
  assigned_user?: User;
  product?: Product;
}

// =============================================================================
// DOCUMENT INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Document {
  id: number;
  organization_id: number;
  customer_id: number; // Documents belong to customers, not cases
  document_type_id: number;
  file_id?: number; // Optional file reference
  uploaded_by: number; // User ID who uploaded
  status: DocStatus; // Using actual enum values
  submitted_at: string;
  review_started_at?: string;
  review_completed_at?: string;
  verified_by?: number; // User ID who verified
  verified_on?: string;
  expiry_date?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  // Related data (populated by joins)
  uploaded_user?: User;
  verified_user?: User;
  document_type?: DocumentType;
  file?: File;
}

// =============================================================================
// TASK INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Task {
  id: number;
  organization_id?: number;
  title: string;
  description?: string;
  assigned_to?: number; // User ID
  status: TaskStatus; // Using actual enum values
  priority: TaskPriority; // Using actual enum values
  due_date?: string;
  completed_at?: string;
  created_by?: number; // User ID
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Related data (populated by joins)
  assigned_user?: User;
  created_user?: User;
}

// =============================================================================
// ORGANIZATION INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Organization {
  id: number;
  name: string;
  code?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// DEPARTMENT INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Department {
  id: number;
  name: string;
  description?: string;
  metadata?: any;
  organization_id?: number;
  created_at?: string;
  updated_at?: string;
  code?: string;
  department_type?: string;
  parent_department_id?: number;
  manager_id?: number;
  is_active?: boolean;
}

// =============================================================================
// PRODUCT INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Product {
  id: number;
  organization_id: number;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  interest_rate?: number;
  min_amount?: number;
  max_amount?: number;
  min_tenure?: number;
  max_tenure?: number;
  is_active?: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// DOCUMENT TYPE INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface DocumentType {
  id: number;
  name: string;
  category?: string;
  description?: string;
  is_required?: boolean;
  priority?: string;
  validity_period?: number;
  is_active?: boolean;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// FILE INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface File {
  id: number;
  organization_id?: number;
  file_name: string;
  original_name?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  file_type: FileType; // Using actual enum values
  uploader_id?: number;
  folder_id?: number;
  is_public?: boolean;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// AUDIT LOG INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface AuditLog {
  id: number;
  user_id?: number;
  organization_id?: number;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// NOTIFICATION INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Notification {
  id: number;
  user_id: number;
  organization_id?: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean; // Changed from read to is_read
  read_at?: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// SYSTEM SETTINGS INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface SystemSetting {
  id: number;
  key: string;
  value?: string;
  description?: string;
  category?: string;
  is_encrypted?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// WEBHOOK INTERFACE - MATCHING ACTUAL DATABASE
// =============================================================================

export interface Webhook {
  id: number;
  organization_id?: number;
  webhook_name?: string;
  webhook_url?: string;
  event_type?: string;
  status: WebhookStatus; // Using actual enum values
  is_active?: boolean;
  secret?: string;
  headers?: any;
  retry_count?: number;
  max_retries?: number;
  timeout?: number;
  last_triggered_at?: string;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// AGGREGATE INTERFACES FOR DASHBOARDS
// =============================================================================

export interface DashboardMetrics {
  active_users: number;
  open_cases: number;
  in_progress_cases: number;
  closed_cases: number;
  open_tasks: number;
  pending_documents: number;
  daily_audit_logs: number;
}

export interface CaseWithRelations extends Case {
  customer: Customer;
  assigned_user: User;
  product: Product;
  documents: Document[];
}

export interface DocumentWithRelations extends Document {
  uploaded_user: User;
  verified_user?: User;
  document_type: DocumentType;
  file?: File;
  customer: Customer;
}

export interface TaskWithRelations extends Task {
  assigned_user?: User;
  created_user?: User;
}

// =============================================================================
// QUERY FILTER INTERFACES
// =============================================================================

export interface CaseFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  assigned_to?: number;
  organization_id?: number;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface DocumentFilters {
  status?: DocStatus;
  customer_id?: number;
  document_type_id?: number;
  uploaded_by?: number;
  verified_by?: number;
  organization_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  created_by?: number;
  organization_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface UserFilters {
  status?: UserStatus;
  role?: string;
  department_id?: number;
  organization_id?: number;
  is_active?: boolean;
}

// =============================================================================
// API RESPONSE INTERFACES
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// =============================================================================
// FORM INTERFACES
// =============================================================================

export interface CreateCaseForm {
  customer_id: number;
  product_id?: number;
  case_number: string;
  assigned_to?: number;
  status: CaseStatus;
  priority: CasePriority;
  loan_amount?: number;
  loan_type?: string;
}

export interface UpdateCaseForm {
  status?: CaseStatus;
  priority?: CasePriority;
  assigned_to?: number;
  loan_amount?: number;
  loan_type?: string;
}

export interface CreateDocumentForm {
  customer_id: number;
  document_type_id: number;
  file_id?: number;
  uploaded_by: number;
  status: DocStatus;
  expiry_date?: string;
}

export interface UpdateDocumentForm {
  status?: DocStatus;
  verified_by?: number;
  verified_on?: string;
  expiry_date?: string;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  assigned_to?: number;
  priority: TaskPriority;
  due_date?: string;
  created_by?: number;
}

export interface UpdateTaskForm {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  due_date?: string;
  completed_at?: string;
}

// =============================================================================
// EXPORT ALL INTERFACES
// =============================================================================

export * from './index'; // Re-export existing interfaces for backward compatibility
