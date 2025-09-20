export interface User {
  id: string;
  name: string;
  email: string;
  role: 'salesperson' | 'manager' | 'credit-ops' | 'admin';
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  age: number;
  maritalStatus: 'single' | 'married';
  employment: 'salaried' | 'self-employed' | 'retired';
  loanType: string;
  loanAmount: number;
  riskProfile: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'received' | 'verified' | 'rejected';
  required: boolean;
  uploadedAt?: string;
  verifiedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  fileUrl?: string;
  notes?: string;
  category: 'identity' | 'financial' | 'business' | 'property' | 'employment' | 'other';
  priority: 'high' | 'medium' | 'low';
  expiryDate?: string;
  fileSize?: number;
  fileType?: string;
}

export interface WhatsAppMessage {
  id: string;
  timestamp: string;
  type: 'text' | 'document' | 'system';
  content: string;
  sender: 'customer' | 'system' | 'agent';
  documentId?: string;
}

export interface ComplianceLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Case {
  id: string;
  caseNumber: string;
  customer: Customer;
  assignedTo: string;
  status: 'new' | 'in-progress' | 'review' | 'approved' | 'rejected';
  documents: Document[];
  whatsappMessages: WhatsAppMessage[];
  complianceLog: ComplianceLog[];
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface KPI {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
}

// =============================================================================
// NEW TABLE INTERFACES
// =============================================================================

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  metadata?: any;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SubProduct {
  id: string;
  productId: string;
  name: string;
  code: string;
  description: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentType {
  id: string;
  name: string;
  category: 'identity' | 'financial' | 'business' | 'property' | 'employment' | 'other';
  description: string;
  isRequired: boolean;
  priority: 'high' | 'medium' | 'low';
  validityPeriod?: number;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  uploaderId: string;
  folderId?: string;
  isPublic: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// TASK MANAGEMENT INTERFACES
// =============================================================================

export interface TaskCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagTime?: number; // in hours
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// WORKFLOW INTERFACES
// =============================================================================

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  stageOrder: number;
  isActive: boolean;
  isInitial: boolean;
  isFinal: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTransition {
  id: string;
  fromStageId: string;
  toStageId: string;
  name: string;
  description: string;
  conditions?: any;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowHistory {
  id: string;
  entityType: string;
  entityId: string;
  fromStageId?: string;
  toStageId: string;
  transitionId?: string;
  userId: string;
  comments?: string;
  metadata?: any;
  createdAt: string;
}

// =============================================================================
// LOAN MANAGEMENT INTERFACES
// =============================================================================

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  customerId: string;
  loanProductId: string;
  requestedAmount: number;
  requestedTenure: number;
  purpose: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  currentStage: string;
  assignedSalesAgent?: string;
  assignedCreditAnalyst?: string;
  workflowData?: any;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  processingFee: number;
  prepaymentCharges: number;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// COMPLIANCE MANAGEMENT INTERFACES
// =============================================================================

export interface ComplianceIssueType {
  id: string;
  name: string;
  description: string;
  category: 'regulatory' | 'operational' | 'financial' | 'documentation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceIssue {
  id: string;
  issueTypeId: string;
  caseId?: string;
  customerId?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  dueDate?: string;
  resolution?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceIssueComment {
  id: string;
  issueId: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  id: string;
  templateId?: string;
  name: string;
  description: string;
  reportType: 'compliance_summary' | 'issue_analysis' | 'regulatory_report' | 'audit_trail' | 'custom';
  status: 'draft' | 'generating' | 'completed' | 'failed';
  generatedBy: string;
  generatedAt?: string;
  data?: any;
  filePath?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  reportType: 'compliance_summary' | 'issue_analysis' | 'regulatory_report' | 'audit_trail' | 'custom';
  query: string;
  parameters?: any;
  isActive: boolean;
  createdBy: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  description: string;
  schedule: string; // Cron expression
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdBy: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExecution {
  id: string;
  scheduledReportId?: string;
  templateId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  reportId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// WORKLOAD PLANNING INTERFACES
// =============================================================================

export interface WorkloadSchedule {
  id: string;
  organizationId: string;
  userId: string;
  date: string;
  plannedHours: number;
  actualHours: number;
  capacityPercentage: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkloadAssignment {
  id: string;
  organizationId: string;
  userId: string;
  taskId?: string;
  loanApplicationId?: string;
  assignedHours?: number;
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// APPROVAL QUEUE INTERFACES
// =============================================================================

export interface ApprovalQueue {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  queueType: 'loan_approval' | 'document_verification' | 'compliance_review';
  departmentType: 'sales' | 'credit_ops' | 'compliance' | 'admin';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  autoAssign: boolean;
  maxConcurrentItems: number;
  slaHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalQueueItem {
  id: string;
  organizationId: string;
  queueId: string;
  itemType: 'loan_application' | 'document' | 'compliance_issue';
  itemId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_review' | 'approved' | 'rejected' | 'escalated';
  assignedTo?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  comments?: string;
  decision?: 'approved' | 'rejected' | 'escalated' | 'returned';
  decisionReason?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// USER MANAGEMENT AND SESSION INTERFACES
// =============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  profilePicture?: string;
  bio?: string;
  preferences?: any;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  organizationId?: string;
  activityType: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'download' | 'upload' | 'approve' | 'reject' | 'assign' | 'complete';
  activityDescription: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: any;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  roleId?: string;
  departmentId?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated';
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  permissions?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  organizationId?: string;
  sessionToken: string;
  refreshToken?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  loginAt: string;
  lastActivityAt?: string;
  expiresAt: string;
  logoutAt?: string;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// SYSTEM CONFIGURATION INTERFACES
// =============================================================================

export interface FeatureFlag {
  id: string;
  organizationId?: string; // NULL for global flags
  flagName: string;
  flagValue: boolean;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemIntegration {
  id: string;
  organizationId: string;
  integrationName: string;
  integrationType: 'whatsapp' | 'email' | 'sms' | 'crm' | 'erp' | 'payment_gateway' | 'credit_bureau' | 'other';
  status: 'active' | 'inactive' | 'error' | 'pending';
  configuration: any; // JSONB
  credentials?: any; // JSONB - encrypted
  lastSyncAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  category: 'general' | 'security' | 'notifications' | 'integrations' | 'billing' | 'compliance' | 'other';
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSetting {
  id: string;
  organizationId: string;
  key: string;
  value?: string;
  description?: string;
  category: 'general' | 'security' | 'notifications' | 'integrations' | 'billing' | 'compliance' | 'workflow' | 'other';
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}