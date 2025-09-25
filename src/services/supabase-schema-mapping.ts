// =============================================================================
// SUPABASE SCHEMA MAPPING
// =============================================================================
// This file maps our frontend expectations to the actual Supabase schema

export const SUPABASE_TABLES = {
  // Core tables that exist in Supabase
  ORGANIZATIONS: 'organizations',
  USERS: 'users', 
  CUSTOMERS: 'customers',
  CASES: 'cases',
  DOCUMENTS: 'documents',
  DOCUMENT_TYPES: 'document_types',
  PRODUCTS: 'products',
  SUB_PRODUCTS: 'sub_products',
  TASKS: 'tasks',
  TASK_TYPES: 'task_types',
  DEPARTMENTS: 'departments',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  AUDIT_LOG: 'logs',
  FILES: 'files',
  FOLDERS: 'folders',
  NOTIFICATIONS: 'notifications',
  LOGS: 'logs',
  
  // Document Management Tables
  DOCUMENT_AGAINST_PRODUCT: 'document_against_product',
  DOC_AGAINST_SUB_PRODUCT: 'doc_against_sub_product',
  FILE_SIGNATURES: 'file_signatures',
  
  // Phase 2: Core Business Logic Tables
  LOAN_APPLICATIONS: 'loan_applications',
  LOAN_PRODUCTS: 'loan_products',
  WORKFLOW_STAGES: 'workflow_stages',
  WORKFLOW_TRANSITIONS: 'workflow_transitions',
  WORKFLOW_HISTORY: 'workflow_history',
  
  // Phase 3: Task Management System Tables
  TASK_CATEGORIES: 'task_categories',
  TASK_DEPENDENCIES: 'task_dependencies',
  TASK_COMMENTS: 'task_comments',
  TASK_ATTACHMENTS: 'task_attachments',
  
  // Core Business Tables
  EMPLOYMENT_TYPES: 'employment_types',
  TASK_SLA_POLICIES: 'task_sla_policies',
  
  // Phase 4: Workload Planning Tables
  WORKLOAD_SCHEDULES: 'workload_schedules',
  WORKLOAD_ASSIGNMENTS: 'workload_assignments',
  
  // Phase 5: Approval Queue System Tables
  APPROVAL_QUEUES: 'approval_queues',
  APPROVAL_QUEUE_ITEMS: 'approval_queue_items',
  
  // Workflow & Case Management Tables
  CASE_STATUS_HISTORY: 'case_status_history',
  CASE_WORKFLOW_STAGE: 'case_workflow_stage',
  ASSIGN_CASE_SETTING: 'assign_case_setting',
  ASSIGN_PERMISSION: 'assign_permission',
  
  // Phase 6: Compliance Management Tables
  COMPLIANCE_ISSUE_TYPES: 'compliance_issue_types',
  COMPLIANCE_ISSUES: 'compliance_issues',
  COMPLIANCE_ISSUE_COMMENTS: 'compliance_issue_comments',
  COMPLIANCE_REPORTS: 'compliance_reports',
  REPORT_TEMPLATES: 'report_templates',
  SCHEDULED_REPORTS: 'scheduled_reports',
  REPORT_EXECUTIONS: 'report_executions',
  
  // System Configuration Tables
  FEATURE_FLAGS: 'feature_flags',
  SYSTEM_INTEGRATIONS: 'system_integrations',
  SYSTEM_SETTINGS: 'system_settings',
  ORGANIZATION_SETTINGS: 'organization_settings',
  
  // Background Processing Tables
  JOBS: 'jobs',
  JOB_BATCHES: 'job_batches',
  FAILED_JOBS: 'failed_jobs',
  THIRD_PARTY_API_LOG: 'third_party_api_log',
  WEBHOOKS: 'webhooks',
  
  // Authentication & System Tables
  AUTH_ACCOUNTS: 'auth_accounts',
  SESSIONS: 'sessions',
  USER_ROLES: 'user_roles',
  PASSWORD_RESET_TOKENS: 'password_reset_tokens',
  PERSONAL_ACCESS_TOKENS: 'personal_access_tokens',
  AUTH_AUDIT_LOG: 'auth_audit_log',
  API_RATE_LIMITS: 'api_rate_limits',
  
  // Caching & Performance Tables
  CACHE: 'cache',
  CACHE_LOCKS: 'cache_locks',
  MIGRATIONS: 'migrations',
  CACHE_STATISTICS: 'cache_statistics',
  CACHE_INVALIDATION_LOGS: 'cache_invalidation_logs',
  
  // Tables that don't exist in Supabase but we need
  // We'll create these or use alternatives
  WHATSAPP_MESSAGES: 'notifications', // Map to notifications table
  COMPLIANCE_LOGS: 'logs', // Map to logs table
  TEAM_MEMBERS: 'users', // Map to users table
} as const;

// =============================================================================
// SCHEMA MAPPING FUNCTIONS
// =============================================================================

export function mapCaseToLoanApplication(caseData: any) {
  return {
    id: caseData.id,
    application_number: caseData.case_number,
    customer_id: caseData.customer_id,
    loan_product_id: caseData.product_id,
    requested_amount: caseData.metadata?.requested_amount || 0,
    requested_tenure: caseData.metadata?.requested_tenure || 12,
    purpose: caseData.description || '',
    status: mapCaseStatus(caseData.status),
    priority: mapCasePriority(caseData.priority),
    current_stage: caseData.metadata?.current_stage || 'application',
    assigned_sales_agent: caseData.assigned_to,
    assigned_credit_analyst: caseData.metadata?.assigned_credit_analyst,
    workflow_data: caseData.metadata,
    submitted_at: caseData.created_at,
    approved_at: caseData.metadata?.approved_at,
    rejected_at: caseData.metadata?.rejected_at,
    created_at: caseData.created_at,
    updated_at: caseData.updated_at,
  };
}

export function mapCaseStatus(status: string) {
  const statusMap: Record<string, string> = {
    'open': 'in-progress',
    'in_progress': 'in-progress', 
    'pending': 'review',
    'closed': 'approved',
    'cancelled': 'rejected',
  };
  return statusMap[status] || 'new';
}

export function mapCasePriority(priority: string) {
  const priorityMap: Record<string, string> = {
    'low': 'low',
    'normal': 'medium',
    'high': 'high',
    'urgent': 'high',
  };
  return priorityMap[priority] || 'medium';
}

export function mapDocumentStatus(status: string) {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'submitted': 'received',
    'verified': 'verified',
    'rejected': 'rejected',
  };
  return statusMap[status] || 'pending';
}

export function mapTaskStatus(status: string) {
  const statusMap: Record<string, string> = {
    'open': 'pending',
    'in_progress': 'in-progress',
    'completed': 'completed',
    'cancelled': 'cancelled',
  };
  return statusMap[status] || 'pending';
}

export function mapTaskPriority(priority: string) {
  const priorityMap: Record<string, string> = {
    'low': 'low',
    'normal': 'medium',
    'high': 'high',
    'urgent': 'high',
  };
  return priorityMap[priority] || 'medium';
}

// =============================================================================
// NEW TABLE MAPPING FUNCTIONS
// =============================================================================

export function mapRoleData(roleData: any) {
  return {
    id: roleData.id,
    name: roleData.name,
    description: roleData.description,
    permissions: roleData.permissions || [],
    isActive: roleData.is_active || true,
    createdAt: roleData.created_at,
    updatedAt: roleData.updated_at,
  };
}

export function mapPermissionData(permissionData: any) {
  return {
    id: permissionData.id,
    name: permissionData.name,
    description: permissionData.description,
    resource: permissionData.resource,
    action: permissionData.action,
    isActive: permissionData.is_active || true,
    createdAt: permissionData.created_at,
    updatedAt: permissionData.updated_at,
  };
}

export function mapAuditLogData(auditLogData: any) {
  return {
    id: auditLogData.id,
    organizationId: auditLogData.organization_id,
    userId: auditLogData.user_id,
    action: auditLogData.action,
    resourceType: auditLogData.entity_type, // maps entity_type to resourceType
    resourceId: auditLogData.entity_id, // maps entity_id to resourceId
    details: auditLogData.description, // maps description to details
    logType: auditLogData.log_type || 'info', // log_type as direct column
    ipAddress: auditLogData.ip_address || 'Unknown', // ip_address as direct column
    userAgent: auditLogData.user_agent || 'Unknown', // user_agent as direct column
    metadata: auditLogData.metadata,
    createdAt: auditLogData.created_at,
    updatedAt: auditLogData.updated_at,
  };
}

export function mapProductData(productData: any) {
  return {
    id: productData.id,
    name: productData.name,
    code: productData.code,
    description: productData.description,
    category: productData.category,
    interestRate: productData.interest_rate,
    minAmount: productData.min_amount,
    maxAmount: productData.max_amount,
    minTenure: productData.min_tenure,
    maxTenure: productData.max_tenure,
    isActive: productData.is_active || true,
    metadata: productData.metadata,
    createdAt: productData.created_at,
    updatedAt: productData.updated_at,
  };
}

export function mapSubProductData(subProductData: any) {
  return {
    id: subProductData.id,
    productId: subProductData.product_id,
    name: subProductData.name,
    code: subProductData.code,
    description: subProductData.description,
    interestRate: subProductData.interest_rate,
    minAmount: subProductData.min_amount,
    maxAmount: subProductData.max_amount,
    minTenure: subProductData.min_tenure,
    maxTenure: subProductData.max_tenure,
    isActive: subProductData.is_active || true,
    metadata: subProductData.metadata,
    createdAt: subProductData.created_at,
    updatedAt: subProductData.updated_at,
  };
}

export function mapDocumentTypeData(documentTypeData: any) {
  return {
    id: documentTypeData.id,
    name: documentTypeData.name,
    category: documentTypeData.category,
    description: documentTypeData.description,
    isRequired: documentTypeData.is_required || false,
    priority: documentTypeData.priority,
    validityPeriod: documentTypeData.validity_period,
    isActive: documentTypeData.is_active || true,
    metadata: documentTypeData.metadata,
    createdAt: documentTypeData.created_at,
    updatedAt: documentTypeData.updated_at,
  };
}

export function mapFileData(fileData: any) {
  return {
    id: fileData.id,
    fileName: fileData.file_name,
    originalName: fileData.original_name,
    filePath: fileData.file_path,
    fileSize: fileData.file_size,
    mimeType: fileData.mime_type,
    fileType: fileData.file_type,
    uploaderId: fileData.uploader_id,
    folderId: fileData.folder_id,
    isPublic: fileData.is_public || false,
    metadata: fileData.metadata,
    createdAt: fileData.created_at,
    updatedAt: fileData.updated_at,
  };
}

export function mapFolderData(folderData: any) {
  return {
    id: folderData.id,
    name: folderData.name,
    description: folderData.description,
    parentFolderId: folderData.parent_folder_id,
    organizationId: folderData.organization_id,
    createdBy: folderData.created_by,
    isActive: folderData.is_active || true,
    metadata: folderData.metadata,
    createdAt: folderData.created_at,
    updatedAt: folderData.updated_at,
  };
}

export function mapDocumentAgainstProductData(data: any) {
  return {
    id: data.id,
    productId: data.product_id,
    documentTypeId: data.document_type_id,
    isRequired: data.is_required || false,
    priority: data.priority || 'medium',
    validityPeriod: data.validity_period,
    isActive: data.is_active || true,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    product: data.products ? mapProductData(data.products) : undefined,
    documentType: data.document_types ? mapDocumentTypeData(data.document_types) : undefined,
  };
}

export function mapDocAgainstSubProductData(data: any) {
  return {
    id: data.id,
    subProductId: data.sub_product_id,
    documentTypeId: data.document_type_id,
    isRequired: data.is_required || false,
    priority: data.priority || 'medium',
    validityPeriod: data.validity_period,
    isActive: data.is_active || true,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    subProduct: data.sub_products ? mapSubProductData(data.sub_products) : undefined,
    documentType: data.document_types ? mapDocumentTypeData(data.document_types) : undefined,
  };
}

export function mapFileSignatureData(data: any) {
  return {
    id: data.id,
    fileId: data.file_id,
    userId: data.user_id,
    signatureType: data.signature_type || 'electronic',
    signatureData: data.signature_data,
    signatureMethod: data.signature_method || 'password',
    isVerified: data.is_verified || false,
    verifiedAt: data.verified_at,
    verifiedBy: data.verified_by,
    expiresAt: data.expires_at,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    file: data.files ? mapFileData(data.files) : undefined,
    user: data.users ? {
      id: data.users.id,
      name: data.users.full_name || data.users.name,
      email: data.users.email,
      role: data.users.role as 'salesperson' | 'manager' | 'credit-ops' | 'admin',
      avatar: data.users.avatar
    } : undefined,
  };
}

// =============================================================================
// TASK MANAGEMENT MAPPING FUNCTIONS
// =============================================================================

export function mapTaskCategoryData(taskCategoryData: any) {
  return {
    id: taskCategoryData.id,
    name: taskCategoryData.name,
    description: taskCategoryData.description,
    color: taskCategoryData.color,
    icon: taskCategoryData.icon,
    isActive: taskCategoryData.is_active || true,
    metadata: taskCategoryData.metadata,
    createdAt: taskCategoryData.created_at,
    updatedAt: taskCategoryData.updated_at,
  };
}

export function mapTaskDependencyData(taskDependencyData: any) {
  return {
    id: taskDependencyData.id,
    taskId: taskDependencyData.task_id,
    dependsOnTaskId: taskDependencyData.depends_on_task_id,
    dependencyType: taskDependencyData.dependency_type,
    lagTime: taskDependencyData.lag_time,
    isActive: taskDependencyData.is_active || true,
    createdAt: taskDependencyData.created_at,
    updatedAt: taskDependencyData.updated_at,
  };
}

export function mapTaskCommentData(taskCommentData: any) {
  return {
    id: taskCommentData.id,
    taskId: taskCommentData.task_id,
    userId: taskCommentData.user_id,
    comment: taskCommentData.comment,
    isInternal: taskCommentData.is_internal || false,
    metadata: taskCommentData.metadata,
    createdAt: taskCommentData.created_at,
    updatedAt: taskCommentData.updated_at,
  };
}

export function mapTaskAttachmentData(taskAttachmentData: any) {
  return {
    id: taskAttachmentData.id,
    taskId: taskAttachmentData.task_id,
    fileId: taskAttachmentData.file_id,
    fileName: taskAttachmentData.file_name,
    filePath: taskAttachmentData.file_path,
    fileSize: taskAttachmentData.file_size,
    mimeType: taskAttachmentData.mime_type,
    uploadedBy: taskAttachmentData.uploaded_by,
    isActive: taskAttachmentData.is_active || true,
    metadata: taskAttachmentData.metadata,
    createdAt: taskAttachmentData.created_at,
    updatedAt: taskAttachmentData.updated_at,
  };
}

// =============================================================================
// WORKFLOW MAPPING FUNCTIONS
// =============================================================================

export function mapWorkflowStageData(workflowStageData: any) {
  return {
    id: workflowStageData.id,
    name: workflowStageData.name,
    description: workflowStageData.description,
    stageOrder: workflowStageData.stage_order,
    isActive: workflowStageData.is_active || true,
    isInitial: workflowStageData.is_initial || false,
    isFinal: workflowStageData.is_final || false,
    metadata: workflowStageData.metadata,
    createdAt: workflowStageData.created_at,
    updatedAt: workflowStageData.updated_at,
  };
}

export function mapWorkflowTransitionData(workflowTransitionData: any) {
  return {
    id: workflowTransitionData.id,
    fromStageId: workflowTransitionData.from_stage_id,
    toStageId: workflowTransitionData.to_stage_id,
    name: workflowTransitionData.name,
    description: workflowTransitionData.description,
    conditions: workflowTransitionData.conditions,
    isActive: workflowTransitionData.is_active || true,
    metadata: workflowTransitionData.metadata,
    createdAt: workflowTransitionData.created_at,
    updatedAt: workflowTransitionData.updated_at,
  };
}

export function mapWorkflowHistoryData(workflowHistoryData: any) {
  return {
    id: workflowHistoryData.id,
    entityType: workflowHistoryData.entity_type,
    entityId: workflowHistoryData.entity_id,
    fromStageId: workflowHistoryData.from_stage_id,
    toStageId: workflowHistoryData.to_stage_id,
    transitionId: workflowHistoryData.transition_id,
    userId: workflowHistoryData.user_id,
    comments: workflowHistoryData.comments,
    metadata: workflowHistoryData.metadata,
    createdAt: workflowHistoryData.created_at,
  };
}

// =============================================================================
// LOAN MANAGEMENT MAPPING FUNCTIONS
// =============================================================================

export function mapLoanApplicationData(loanApplicationData: any) {
  return {
    id: loanApplicationData.id,
    applicationNumber: loanApplicationData.application_number,
    customerId: loanApplicationData.customer_id,
    loanProductId: loanApplicationData.loan_product_id,
    requestedAmount: loanApplicationData.requested_amount,
    requestedTenure: loanApplicationData.requested_tenure,
    purpose: loanApplicationData.purpose,
    status: loanApplicationData.status,
    priority: loanApplicationData.priority,
    currentStage: loanApplicationData.current_stage,
    assignedSalesAgent: loanApplicationData.assigned_sales_agent,
    assignedCreditAnalyst: loanApplicationData.assigned_credit_analyst,
    workflowData: loanApplicationData.workflow_data,
    submittedAt: loanApplicationData.submitted_at,
    approvedAt: loanApplicationData.approved_at,
    rejectedAt: loanApplicationData.rejected_at,
    disbursedAt: loanApplicationData.disbursed_at,
    closedAt: loanApplicationData.closed_at,
    metadata: loanApplicationData.metadata,
    createdAt: loanApplicationData.created_at,
    updatedAt: loanApplicationData.updated_at,
  };
}

export function mapLoanProductData(loanProductData: any) {
  return {
    id: loanProductData.id,
    name: loanProductData.name,
    code: loanProductData.code,
    description: loanProductData.description,
    category: loanProductData.category,
    interestRate: loanProductData.interest_rate,
    minAmount: loanProductData.min_amount,
    maxAmount: loanProductData.max_amount,
    minTenure: loanProductData.min_tenure,
    maxTenure: loanProductData.max_tenure,
    processingFee: loanProductData.processing_fee,
    prepaymentCharges: loanProductData.prepayment_charges,
    isActive: loanProductData.is_active || true,
    metadata: loanProductData.metadata,
    createdAt: loanProductData.created_at,
    updatedAt: loanProductData.updated_at,
  };
}

// =============================================================================
// COMPLIANCE MANAGEMENT MAPPING FUNCTIONS
// =============================================================================

export function mapComplianceIssueTypeData(issueTypeData: any) {
  return {
    id: issueTypeData.id,
    name: issueTypeData.name,
    description: issueTypeData.description,
    category: issueTypeData.category,
    severity: issueTypeData.severity,
    isActive: issueTypeData.is_active || true,
    metadata: issueTypeData.metadata,
    createdAt: issueTypeData.created_at,
    updatedAt: issueTypeData.updated_at,
  };
}

export function mapComplianceIssueData(issueData: any) {
  return {
    id: issueData.id,
    issueTypeId: issueData.issue_type_id,
    caseId: issueData.case_id,
    customerId: issueData.customer_id,
    title: issueData.title,
    description: issueData.description,
    status: issueData.status,
    severity: issueData.severity,
    priority: issueData.priority,
    assignedTo: issueData.assigned_to,
    reportedBy: issueData.reported_by,
    reportedAt: issueData.reported_at,
    resolvedAt: issueData.resolved_at,
    dueDate: issueData.due_date,
    resolution: issueData.resolution,
    metadata: issueData.metadata,
    createdAt: issueData.created_at,
    updatedAt: issueData.updated_at,
  };
}

export function mapComplianceIssueCommentData(commentData: any) {
  return {
    id: commentData.id,
    issueId: commentData.issue_id,
    userId: commentData.user_id,
    comment: commentData.comment,
    isInternal: commentData.is_internal || false,
    metadata: commentData.metadata,
    createdAt: commentData.created_at,
    updatedAt: commentData.updated_at,
  };
}

export function mapComplianceReportData(reportData: any) {
  return {
    id: reportData.id,
    templateId: reportData.template_id,
    name: reportData.name,
    description: reportData.description,
    reportType: reportData.report_type,
    status: reportData.status,
    generatedBy: reportData.generated_by,
    generatedAt: reportData.generated_at,
    data: reportData.data,
    filePath: reportData.file_path,
    metadata: reportData.metadata,
    createdAt: reportData.created_at,
    updatedAt: reportData.updated_at,
  };
}

export function mapReportTemplateData(templateData: any) {
  return {
    id: templateData.id,
    name: templateData.name,
    description: templateData.description,
    reportType: templateData.report_type,
    query: templateData.query,
    parameters: templateData.parameters,
    isActive: templateData.is_active || true,
    createdBy: templateData.created_by,
    metadata: templateData.metadata,
    createdAt: templateData.created_at,
    updatedAt: templateData.updated_at,
  };
}

export function mapScheduledReportData(scheduledReportData: any) {
  return {
    id: scheduledReportData.id,
    templateId: scheduledReportData.template_id,
    name: scheduledReportData.name,
    description: scheduledReportData.description,
    schedule: scheduledReportData.schedule,
    isActive: scheduledReportData.is_active || true,
    lastRunAt: scheduledReportData.last_run_at,
    nextRunAt: scheduledReportData.next_run_at,
    createdBy: scheduledReportData.created_by,
    metadata: scheduledReportData.metadata,
    createdAt: scheduledReportData.created_at,
    updatedAt: scheduledReportData.updated_at,
  };
}

export function mapReportExecutionData(executionData: any) {
  return {
    id: executionData.id,
    scheduledReportId: executionData.scheduled_report_id,
    templateId: executionData.template_id,
    status: executionData.status,
    startedAt: executionData.started_at,
    completedAt: executionData.completed_at,
    errorMessage: executionData.error_message,
    reportId: executionData.report_id,
    metadata: executionData.metadata,
    createdAt: executionData.created_at,
    updatedAt: executionData.updated_at,
  };
}

// =============================================================================
// SAMPLE DATA GENERATORS
// =============================================================================


export function generateSampleCustomers() {
  const customers = [];
  const names = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Singh', 'Vikram Gupta',
    'Anita Reddy', 'Suresh Kumar', 'Meera Joshi', 'Rahul Verma', 'Kavya Nair',
    'Arjun Singh', 'Deepika Rao', 'Rohit Agarwal', 'Shilpa Mehta', 'Kiran Desai'
  ];
  
  for (let i = 0; i < names.length; i++) {
    customers.push({
      id: i + 1,
      user_id: i + 1, // This will be updated to use actual user IDs
      pan_number: `ABCDE${Math.floor(Math.random() * 9000) + 1000}F`,
      aadhaar_number: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
      date_of_birth: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
      marital_status: ['single', 'married', 'divorced', 'widowed'][Math.floor(Math.random() * 4)],
      employment_type: ['salaried', 'self-employed', 'retired', 'unemployed'][Math.floor(Math.random() * 4)],
      risk_profile: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
      kyc_status: ['pending', 'in-progress', 'verified', 'rejected', 'expired'][Math.floor(Math.random() * 5)],
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  return customers;
}

export function generateSampleCases() {
  const cases = [];
  const statuses = ['new', 'in-progress', 'review', 'approved', 'rejected', 'on-hold'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  for (let i = 0; i < 20; i++) {
    const customerId = Math.floor(Math.random() * 15) + 1;
    const productId = Math.floor(Math.random() * 4) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    cases.push({
      id: i + 1,
      case_number: `CASE${String(i + 1).padStart(6, '0')}`,
      customer_id: customerId,
      assigned_to: Math.floor(Math.random() * 5) + 1,
      loan_type: `Product ${productId}`,
      loan_amount: Math.floor(Math.random() * 5000000) + 100000,
      status: status,
      priority: priority,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  return cases;
}

export function generateSampleTasks() {
  const tasks = [];
  const taskTypes = ['Document Collection', 'Verification', 'Approval', 'Follow-up', 'Disbursement'];
  const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  for (let i = 0; i < 30; i++) {
    const caseId = Math.floor(Math.random() * 20) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    
    tasks.push({
      id: i + 1,
      case_id: caseId,
      title: `${taskType} - Case ${caseId}`,
      description: `Task for case ${caseId}: ${taskType}`,
      status: status,
      priority: priority,
      assigned_to: Math.floor(Math.random() * 5) + 1,
      created_by: Math.floor(Math.random() * 5) + 1,
      due_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      started_at: status !== 'pending' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : null,
      completed_at: status === 'completed' ? new Date(Date.now() - Math.random() * 1 * 24 * 60 * 60 * 1000).toISOString() : null,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  return tasks;
}

export function generateSampleDocuments() {
  const documents = [];
  const statuses = ['pending', 'received', 'verified', 'rejected', 'expired'];
  
  for (let i = 0; i < 50; i++) {
    const caseId = Math.floor(Math.random() * 20) + 1;
    const documentTypeId = Math.floor(Math.random() * 5) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    documents.push({
      id: i + 1,
      case_id: caseId,
      document_type_id: documentTypeId,
      file_name: `document_${i + 1}.pdf`,
      file_path: `/documents/case_${caseId}/document_${i + 1}.pdf`,
      file_size: Math.floor(Math.random() * 5000000) + 100000,
      file_type: 'pdf',
      status: status,
      uploaded_at: status !== 'pending' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : null,
      verified_at: status === 'verified' ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString() : null,
      reviewed_at: status === 'verified' || status === 'rejected' ? new Date(Date.now() - Math.random() * 1 * 24 * 60 * 60 * 1000).toISOString() : null,
      reviewed_by: status === 'verified' || status === 'rejected' ? Math.floor(Math.random() * 5) + 1 : null,
      rejection_reason: status === 'rejected' ? 'Document quality is poor' : null,
      notes: status === 'verified' ? 'Document verified successfully' : null,
      created_at: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  return documents;
}


export function generateSampleLogs(userIds: string[] = []) {
  const logs = [];
  const actions = ['login', 'logout', 'case_created', 'case_updated', 'document_uploaded', 'document_verified', 'task_assigned', 'task_completed'];
  const entityTypes = ['user', 'case', 'document', 'task', 'customer'];
  
  for (let i = 0; i < 100; i++) {
    const randomUserId = userIds.length > 0 
      ? userIds[Math.floor(Math.random() * userIds.length)]
      : Math.floor(Math.random() * 5) + 1;
      
    logs.push({
      id: i + 1,
      organization_id: 1,
      user_id: randomUserId,
      action: actions[Math.floor(Math.random() * actions.length)],
      entity_type: entityTypes[Math.floor(Math.random() * entityTypes.length)],
      entity_id: Math.floor(Math.random() * 50) + 1,
      description: `Action performed: ${actions[Math.floor(Math.random() * actions.length)]}`,
      metadata: {
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: `session_${i + 1}`,
      },
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  return logs;
}

// =============================================================================
// WORKLOAD PLANNING MAPPING FUNCTIONS
// =============================================================================

export function mapWorkloadScheduleData(workloadScheduleData: any) {
  return {
    id: workloadScheduleData.id,
    organizationId: workloadScheduleData.organization_id,
    userId: workloadScheduleData.user_id,
    date: workloadScheduleData.date,
    plannedHours: workloadScheduleData.planned_hours,
    actualHours: workloadScheduleData.actual_hours,
    capacityPercentage: workloadScheduleData.capacity_percentage,
    notes: workloadScheduleData.notes,
    createdAt: workloadScheduleData.created_at,
    updatedAt: workloadScheduleData.updated_at,
  };
}

export function mapWorkloadAssignmentData(workloadAssignmentData: any) {
  return {
    id: workloadAssignmentData.id,
    organizationId: workloadAssignmentData.organization_id,
    userId: workloadAssignmentData.user_id,
    taskId: workloadAssignmentData.task_id,
    loanApplicationId: workloadAssignmentData.loan_application_id,
    assignedHours: workloadAssignmentData.assigned_hours,
    startTime: workloadAssignmentData.start_time,
    endTime: workloadAssignmentData.end_time,
    status: workloadAssignmentData.status,
    createdAt: workloadAssignmentData.created_at,
    updatedAt: workloadAssignmentData.updated_at,
  };
}

// =============================================================================
// APPROVAL QUEUE MAPPING FUNCTIONS
// =============================================================================

export function mapApprovalQueueData(approvalQueueData: any) {
  return {
    id: approvalQueueData.id,
    organizationId: approvalQueueData.organization_id,
    name: approvalQueueData.name,
    description: approvalQueueData.description,
    queueType: approvalQueueData.queue_type,
    departmentType: approvalQueueData.department_type,
    priority: approvalQueueData.priority,
    isActive: approvalQueueData.is_active,
    autoAssign: approvalQueueData.auto_assign,
    maxConcurrentItems: approvalQueueData.max_concurrent_items,
    slaHours: approvalQueueData.sla_hours,
    createdAt: approvalQueueData.created_at,
    updatedAt: approvalQueueData.updated_at,
  };
}

export function mapApprovalQueueItemData(approvalQueueItemData: any) {
  return {
    id: approvalQueueItemData.id,
    organizationId: approvalQueueItemData.organization_id,
    queueId: approvalQueueItemData.queue_id,
    itemType: approvalQueueItemData.item_type,
    itemId: approvalQueueItemData.item_id,
    priority: approvalQueueItemData.priority,
    status: approvalQueueItemData.status,
    assignedTo: approvalQueueItemData.assigned_to,
    assignedAt: approvalQueueItemData.assigned_at,
    startedAt: approvalQueueItemData.started_at,
    completedAt: approvalQueueItemData.completed_at,
    dueDate: approvalQueueItemData.due_date,
    comments: approvalQueueItemData.comments,
    decision: approvalQueueItemData.decision,
    decisionReason: approvalQueueItemData.decision_reason,
    metadata: approvalQueueItemData.metadata,
    createdAt: approvalQueueItemData.created_at,
    updatedAt: approvalQueueItemData.updated_at,
  };
}

// =============================================================================
// SYSTEM CONFIGURATION MAPPING FUNCTIONS
// =============================================================================

export function mapFeatureFlagData(featureFlagData: any) {
  return {
    id: featureFlagData.id,
    organizationId: featureFlagData.organization_id,
    flagName: featureFlagData.flag_name,
    flagValue: featureFlagData.flag_value,
    description: featureFlagData.description,
    isActive: featureFlagData.is_active || true,
    createdAt: featureFlagData.created_at,
    updatedAt: featureFlagData.updated_at,
  };
}

export function mapSystemIntegrationData(integrationData: any) {
  return {
    id: integrationData.id,
    organizationId: integrationData.organization_id,
    integrationName: integrationData.integration_name,
    integrationType: integrationData.integration_type,
    status: integrationData.status || 'inactive',
    configuration: integrationData.configuration || {},
    credentials: integrationData.credentials,
    lastSyncAt: integrationData.last_sync_at,
    errorMessage: integrationData.error_message,
    createdAt: integrationData.created_at,
    updatedAt: integrationData.updated_at,
  };
}

export function mapSystemSettingData(settingData: any) {
  return {
    id: settingData.id,
    key: settingData.key,
    value: settingData.value,
    description: settingData.description,
    category: settingData.category || 'general',
    isEncrypted: settingData.is_encrypted || false,
    createdAt: settingData.created_at,
    updatedAt: settingData.updated_at,
  };
}

export function mapOrganizationSettingData(settingData: any) {
  return {
    id: settingData.id,
    organizationId: settingData.organization_id,
    key: settingData.key,
    value: settingData.value,
    description: settingData.description,
    category: settingData.category || 'general',
    isEncrypted: settingData.is_encrypted || false,
    createdAt: settingData.created_at,
    updatedAt: settingData.updated_at,
  };
}

// =============================================================================
// USER MANAGEMENT AND SESSION MAPPING FUNCTIONS
// =============================================================================

export function mapUserProfileData(userProfileData: any) {
  return {
    id: userProfileData.id,
    userId: userProfileData.user_id,
    firstName: userProfileData.first_name,
    lastName: userProfileData.last_name,
    middleName: userProfileData.middle_name,
    phoneNumber: userProfileData.phone_number,
    dateOfBirth: userProfileData.date_of_birth,
    gender: userProfileData.gender,
    address: userProfileData.address,
    city: userProfileData.city,
    state: userProfileData.state,
    country: userProfileData.country,
    postalCode: userProfileData.postal_code,
    profilePicture: userProfileData.profile_picture,
    bio: userProfileData.bio,
    preferences: userProfileData.preferences,
    isActive: userProfileData.is_active || true,
    lastLoginAt: userProfileData.last_login_at,
    createdAt: userProfileData.created_at,
    updatedAt: userProfileData.updated_at,
  };
}

export function mapUserActivityLogData(activityLogData: any) {
  return {
    id: activityLogData.id,
    userId: activityLogData.user_id,
    organizationId: activityLogData.organization_id,
    activityType: activityLogData.activity_type,
    activityDescription: activityLogData.activity_description,
    resourceType: activityLogData.resource_type,
    resourceId: activityLogData.resource_id,
    ipAddress: activityLogData.ip_address,
    userAgent: activityLogData.user_agent,
    sessionId: activityLogData.session_id,
    metadata: activityLogData.metadata,
    createdAt: activityLogData.created_at,
  };
}

export function mapOrganizationMemberData(organizationMemberData: any) {
  return {
    id: organizationMemberData.id,
    organizationId: organizationMemberData.organization_id,
    userId: organizationMemberData.user_id,
    roleId: organizationMemberData.role_id,
    departmentId: organizationMemberData.department_id,
    status: organizationMemberData.status,
    joinedAt: organizationMemberData.joined_at,
    leftAt: organizationMemberData.left_at,
    isActive: organizationMemberData.is_active || true,
    permissions: organizationMemberData.permissions,
    metadata: organizationMemberData.metadata,
    createdAt: organizationMemberData.created_at,
    updatedAt: organizationMemberData.updated_at,
  };
}

export function mapUserSessionData(userSessionData: any) {
  return {
    id: userSessionData.id,
    userId: userSessionData.user_id,
    organizationId: userSessionData.organization_id,
    sessionToken: userSessionData.session_token,
    refreshToken: userSessionData.refresh_token,
    ipAddress: userSessionData.ip_address,
    userAgent: userSessionData.user_agent,
    deviceInfo: userSessionData.device_info,
    loginAt: userSessionData.login_at,
    lastActivityAt: userSessionData.last_activity_at,
    expiresAt: userSessionData.expires_at,
    logoutAt: userSessionData.logout_at,
    isActive: userSessionData.is_active || true,
    metadata: userSessionData.metadata,
    createdAt: userSessionData.created_at,
    updatedAt: userSessionData.updated_at,
  };
}

// =============================================================================
// CORE BUSINESS TABLE MAPPING FUNCTIONS
// =============================================================================

export function mapEmploymentTypeData(employmentTypeData: any) {
  return {
    id: employmentTypeData.id,
    name: employmentTypeData.name,
    code: employmentTypeData.code,
    description: employmentTypeData.description,
    isActive: employmentTypeData.is_active || true,
    metadata: employmentTypeData.metadata,
    createdAt: employmentTypeData.created_at,
    updatedAt: employmentTypeData.updated_at,
  };
}

export function mapTaskTypeData(taskTypeData: any) {
  return {
    id: taskTypeData.id,
    name: taskTypeData.name,
    code: taskTypeData.code,
    description: taskTypeData.description,
    category: taskTypeData.category,
    isActive: taskTypeData.is_active || true,
    metadata: taskTypeData.metadata,
    createdAt: taskTypeData.created_at,
    updatedAt: taskTypeData.updated_at,
  };
}

export function mapTaskSlaPolicyData(taskSlaPolicyData: any) {
  return {
    id: taskSlaPolicyData.id,
    name: taskSlaPolicyData.name,
    description: taskSlaPolicyData.description,
    taskTypeId: taskSlaPolicyData.task_type_id,
    departmentId: taskSlaPolicyData.department_id,
    priority: taskSlaPolicyData.priority,
    slaHours: taskSlaPolicyData.sla_hours,
    escalationHours: taskSlaPolicyData.escalation_hours,
    isActive: taskSlaPolicyData.is_active || true,
    metadata: taskSlaPolicyData.metadata,
    createdAt: taskSlaPolicyData.created_at,
    updatedAt: taskSlaPolicyData.updated_at,
  };
}

export function mapDepartmentData(departmentData: any) {
  return {
    id: departmentData.id,
    name: departmentData.name,
    code: departmentData.code,
    description: departmentData.description,
    departmentType: departmentData.department_type,
    parentDepartmentId: departmentData.parent_department_id,
    managerId: departmentData.manager_id,
    isActive: departmentData.is_active || true,
    metadata: departmentData.metadata,
    createdAt: departmentData.created_at,
    updatedAt: departmentData.updated_at,
  };
}

// =============================================================================
// WORKFLOW & CASE MANAGEMENT MAPPING FUNCTIONS
// =============================================================================

export function mapCaseStatusHistoryData(historyData: any) {
  return {
    id: historyData.id,
    case_id: historyData.case_id,
    status: historyData.status,
    previous_status: historyData.previous_status,
    changed_by: historyData.changed_by,
    changed_at: historyData.changed_at,
    reason: historyData.reason,
    notes: historyData.notes,
    metadata: historyData.metadata,
    created_at: historyData.created_at,
    updated_at: historyData.updated_at,
    case: historyData.cases ? {
      id: historyData.cases.id,
      caseNumber: historyData.cases.case_number || historyData.cases.application_number,
      customer: {
        id: historyData.cases.customer_id,
        userId: historyData.cases.customer_id,
        name: 'Customer',
        phone: '',
        email: '',
        panNumber: '',
        aadhaarNumber: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: 'single' as const,
        employment: 'salaried' as const,
        riskProfile: 'medium' as const,
        kycStatus: 'pending' as const,
        age: 0,
        createdAt: historyData.cases.created_at,
        updatedAt: historyData.cases.updated_at
      },
      assignedTo: historyData.cases.assigned_sales_agent || '',
      status: historyData.cases.status,
      documents: [],
      whatsappMessages: [],
      complianceLog: [],
      createdAt: historyData.cases.created_at,
      updatedAt: historyData.cases.updated_at,
      priority: historyData.cases.priority || 'medium' as const,
      loanAmount: historyData.cases.requested_amount,
      loanType: historyData.cases.purpose
    } : undefined,
    user: historyData.users ? {
      id: historyData.users.id,
      name: historyData.users.full_name || historyData.users.name,
      email: historyData.users.email,
      role: historyData.users.role as 'salesperson' | 'manager' | 'credit-ops' | 'admin',
      avatar: historyData.users.avatar
    } : undefined,
  };
}

export function mapCaseWorkflowStageData(stageData: any) {
  return {
    id: stageData.id,
    case_id: stageData.case_id,
    stage_name: stageData.stage_name,
    stage_order: stageData.stage_order,
    is_active: stageData.is_active || false,
    started_at: stageData.started_at,
    completed_at: stageData.completed_at,
    assigned_to: stageData.assigned_to,
    stage_data: stageData.stage_data,
    created_at: stageData.created_at,
    updated_at: stageData.updated_at,
    case: stageData.cases ? {
      id: stageData.cases.id,
      caseNumber: stageData.cases.case_number || stageData.cases.application_number,
      customer: {
        id: stageData.cases.customer_id,
        userId: stageData.cases.customer_id,
        name: 'Customer',
        phone: '',
        email: '',
        panNumber: '',
        aadhaarNumber: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: 'single' as const,
        employment: 'salaried' as const,
        riskProfile: 'medium' as const,
        kycStatus: 'pending' as const,
        age: 0,
        createdAt: stageData.cases.created_at,
        updatedAt: stageData.cases.updated_at
      },
      assignedTo: stageData.cases.assigned_sales_agent || '',
      status: stageData.cases.status,
      documents: [],
      whatsappMessages: [],
      complianceLog: [],
      createdAt: stageData.cases.created_at,
      updatedAt: stageData.cases.updated_at,
      priority: stageData.cases.priority || 'medium' as const,
      loanAmount: stageData.cases.requested_amount,
      loanType: stageData.cases.purpose
    } : undefined,
    user: stageData.users ? {
      id: stageData.users.id,
      name: stageData.users.full_name || stageData.users.name,
      email: stageData.users.email,
      role: stageData.users.role as 'salesperson' | 'manager' | 'credit-ops' | 'admin',
      avatar: stageData.users.avatar
    } : undefined,
  };
}

export function mapAssignCaseSettingData(settingData: any) {
  return {
    id: settingData.id,
    setting_name: settingData.setting_name,
    setting_value: settingData.setting_value,
    description: settingData.description,
    is_active: settingData.is_active || true,
    priority: settingData.priority || 0,
    conditions: settingData.conditions,
    created_at: settingData.created_at,
    updated_at: settingData.updated_at,
  };
}

export function mapAssignPermissionData(permissionData: any) {
  return {
    id: permissionData.id,
    role_id: permissionData.role_id,
    permission_id: permissionData.permission_id,
    can_assign: permissionData.can_assign || false,
    can_reassign: permissionData.can_reassign || false,
    can_approve: permissionData.can_approve || false,
    can_reject: permissionData.can_reject || false,
    conditions: permissionData.conditions,
    created_at: permissionData.created_at,
    updated_at: permissionData.updated_at,
    role: permissionData.roles ? mapRoleData(permissionData.roles) : undefined,
    permission: permissionData.permissions ? mapPermissionData(permissionData.permissions) : undefined,
  };
}

// =============================================================================
// BACKGROUND PROCESSING MAPPING FUNCTIONS
// =============================================================================

export function mapJobData(jobData: any) {
  return {
    id: jobData.id,
    organizationId: jobData.organization_id,
    jobType: jobData.job_type,
    jobName: jobData.job_name,
    payload: jobData.payload,
    status: jobData.status,
    priority: jobData.priority || 'normal',
    attempts: jobData.attempts || 0,
    maxAttempts: jobData.max_attempts || 3,
    availableAt: jobData.available_at,
    startedAt: jobData.started_at,
    completedAt: jobData.completed_at,
    failedAt: jobData.failed_at,
    errorMessage: jobData.error_message,
    errorDetails: jobData.error_details,
    batchId: jobData.batch_id,
    metadata: jobData.metadata,
    createdAt: jobData.created_at,
    updatedAt: jobData.updated_at,
  };
}

export function mapJobBatchData(batchData: any) {
  return {
    id: batchData.id,
    organizationId: batchData.organization_id,
    batchName: batchData.batch_name,
    totalJobs: batchData.total_jobs,
    pendingJobs: batchData.pending_jobs,
    processedJobs: batchData.processed_jobs,
    failedJobs: batchData.failed_jobs,
    status: batchData.status,
    progress: batchData.progress || 0,
    startedAt: batchData.started_at,
    completedAt: batchData.completed_at,
    cancelledAt: batchData.cancelled_at,
    metadata: batchData.metadata,
    createdAt: batchData.created_at,
    updatedAt: batchData.updated_at,
  };
}

export function mapFailedJobData(failedJobData: any) {
  return {
    id: failedJobData.id,
    jobId: failedJobData.job_id,
    organizationId: failedJobData.organization_id,
    jobType: failedJobData.job_type,
    jobName: failedJobData.job_name,
    payload: failedJobData.payload,
    errorMessage: failedJobData.error_message,
    errorDetails: failedJobData.error_details,
    stackTrace: failedJobData.stack_trace,
    failedAt: failedJobData.failed_at,
    retryCount: failedJobData.retry_count || 0,
    maxRetries: failedJobData.max_retries || 3,
    isResolved: failedJobData.is_resolved || false,
    resolvedAt: failedJobData.resolved_at,
    resolvedBy: failedJobData.resolved_by,
    resolution: failedJobData.resolution,
    metadata: failedJobData.metadata,
    createdAt: failedJobData.created_at,
    updatedAt: failedJobData.updated_at,
  };
}

export function mapThirdPartyApiLogData(apiLogData: any) {
  return {
    id: apiLogData.id,
    organizationId: apiLogData.organization_id,
    integrationId: apiLogData.integration_id,
    apiName: apiLogData.api_name,
    endpoint: apiLogData.endpoint,
    method: apiLogData.method,
    requestPayload: apiLogData.request_payload,
    responsePayload: apiLogData.response_payload,
    statusCode: apiLogData.status_code,
    responseTime: apiLogData.response_time,
    status: apiLogData.status,
    errorMessage: apiLogData.error_message,
    retryCount: apiLogData.retry_count || 0,
    isSuccess: apiLogData.is_success || false,
    metadata: apiLogData.metadata,
    createdAt: apiLogData.created_at,
    updatedAt: apiLogData.updated_at,
  };
}

export function mapWebhookData(webhookData: any) {
  return {
    id: webhookData.id,
    organizationId: webhookData.organization_id,
    webhookName: webhookData.webhook_name,
    webhookUrl: webhookData.webhook_url,
    eventType: webhookData.event_type,
    status: webhookData.status,
    isActive: webhookData.is_active || true,
    secret: webhookData.secret,
    headers: webhookData.headers,
    retryCount: webhookData.retry_count || 0,
    maxRetries: webhookData.max_retries || 3,
    timeout: webhookData.timeout || 30,
    lastTriggeredAt: webhookData.last_triggered_at,
    lastSuccessAt: webhookData.last_success_at,
    lastFailureAt: webhookData.last_failure_at,
    failureCount: webhookData.failure_count || 0,
    metadata: webhookData.metadata,
    createdAt: webhookData.created_at,
    updatedAt: webhookData.updated_at,
  };
}

// =============================================================================
// AUTHENTICATION & SYSTEM MAPPING FUNCTIONS
// =============================================================================

export function mapAuthAccountData(authAccountData: any) {
  return {
    id: authAccountData.id,
    userId: authAccountData.user_id,
    provider: authAccountData.provider || 'email',
    providerAccountId: authAccountData.provider_account_id,
    email: authAccountData.email,
    passwordHash: authAccountData.password_hash,
    salt: authAccountData.salt,
    emailVerified: authAccountData.email_verified || false,
    emailVerifiedAt: authAccountData.email_verified_at,
    phoneVerified: authAccountData.phone_verified || false,
    phoneVerifiedAt: authAccountData.phone_verified_at,
    twoFactorEnabled: authAccountData.two_factor_enabled || false,
    twoFactorSecret: authAccountData.two_factor_secret,
    backupCodes: authAccountData.backup_codes || [],
    failedLoginAttempts: authAccountData.failed_login_attempts || 0,
    lockedUntil: authAccountData.locked_until,
    lastLoginAt: authAccountData.last_login_at,
    lastLoginIp: authAccountData.last_login_ip,
    lastLoginUserAgent: authAccountData.last_login_user_agent,
    isActive: authAccountData.is_active || true,
    metadata: authAccountData.metadata || {},
    createdAt: authAccountData.created_at,
    updatedAt: authAccountData.updated_at,
  };
}

export function mapSessionData(sessionData: any) {
  return {
    id: sessionData.id,
    userId: sessionData.user_id,
    sessionToken: sessionData.session_token,
    refreshToken: sessionData.refresh_token,
    ipAddress: sessionData.ip_address,
    userAgent: sessionData.user_agent,
    deviceInfo: sessionData.device_info || {},
    locationInfo: sessionData.location_info || {},
    loginAt: sessionData.login_at,
    lastActivityAt: sessionData.last_activity_at,
    expiresAt: sessionData.expires_at,
    logoutAt: sessionData.logout_at,
    isActive: sessionData.is_active || true,
    isRemembered: sessionData.is_remembered || false,
    metadata: sessionData.metadata || {},
    createdAt: sessionData.created_at,
    updatedAt: sessionData.updated_at,
  };
}

export function mapUserRoleData(userRoleData: any) {
  return {
    id: userRoleData.id,
    userId: userRoleData.user_id,
    roleId: userRoleData.role_id,
    organizationId: userRoleData.organization_id,
    departmentId: userRoleData.department_id,
    assignedBy: userRoleData.assigned_by,
    assignedAt: userRoleData.assigned_at,
    revokedAt: userRoleData.revoked_at,
    revokedBy: userRoleData.revoked_by,
    isActive: userRoleData.is_active || true,
    isPrimary: userRoleData.is_primary || false,
    metadata: userRoleData.metadata || {},
    createdAt: userRoleData.created_at,
    updatedAt: userRoleData.updated_at,
    role: userRoleData.roles ? mapRoleData(userRoleData.roles) : undefined,
    user: userRoleData.users ? {
      id: userRoleData.users.id,
      name: userRoleData.users.full_name || userRoleData.users.name,
      email: userRoleData.users.email,
      role: userRoleData.users.role as 'salesperson' | 'manager' | 'credit-ops' | 'admin',
      avatar: userRoleData.users.avatar
    } : undefined,
  };
}

export function mapPasswordResetTokenData(tokenData: any) {
  return {
    id: tokenData.id,
    userId: tokenData.user_id,
    token: tokenData.token,
    tokenHash: tokenData.token_hash,
    expiresAt: tokenData.expires_at,
    usedAt: tokenData.used_at,
    ipAddress: tokenData.ip_address,
    userAgent: tokenData.user_agent,
    isUsed: tokenData.is_used || false,
    createdAt: tokenData.created_at,
    updatedAt: tokenData.updated_at,
  };
}

export function mapPersonalAccessTokenData(tokenData: any) {
  return {
    id: tokenData.id,
    userId: tokenData.user_id,
    name: tokenData.name,
    tokenHash: tokenData.token_hash,
    tokenPreview: tokenData.token_preview,
    scopes: tokenData.scopes || [],
    lastUsedAt: tokenData.last_used_at,
    lastUsedIp: tokenData.last_used_ip,
    lastUsedUserAgent: tokenData.last_used_user_agent,
    expiresAt: tokenData.expires_at,
    revokedAt: tokenData.revoked_at,
    revokedBy: tokenData.revoked_by,
    isActive: tokenData.is_active || true,
    metadata: tokenData.metadata || {},
    createdAt: tokenData.created_at,
    updatedAt: tokenData.updated_at,
  };
}

export function mapAuthAuditLogData(auditLogData: any) {
  return {
    id: auditLogData.id,
    userId: auditLogData.user_id,
    sessionId: auditLogData.session_id,
    eventType: auditLogData.event_type,
    eventDescription: auditLogData.event_description,
    ipAddress: auditLogData.ip_address,
    userAgent: auditLogData.user_agent,
    deviceInfo: auditLogData.device_info || {},
    locationInfo: auditLogData.location_info || {},
    success: auditLogData.success,
    failureReason: auditLogData.failure_reason,
    metadata: auditLogData.metadata || {},
    createdAt: auditLogData.created_at,
  };
}

export function mapApiRateLimitData(rateLimitData: any) {
  return {
    id: rateLimitData.id,
    userId: rateLimitData.user_id,
    tokenId: rateLimitData.token_id,
    endpoint: rateLimitData.endpoint,
    requestsCount: rateLimitData.requests_count || 0,
    windowStart: rateLimitData.window_start,
    windowDuration: rateLimitData.window_duration,
    maxRequests: rateLimitData.max_requests || 1000,
    isBlocked: rateLimitData.is_blocked || false,
    blockedUntil: rateLimitData.blocked_until,
    metadata: rateLimitData.metadata || {},
    createdAt: rateLimitData.created_at,
    updatedAt: rateLimitData.updated_at,
  };
}

// =============================================================================
// CACHING & PERFORMANCE MAPPING FUNCTIONS
// =============================================================================

export function mapCacheData(cacheData: any) {
  return {
    id: cacheData.id,
    organizationId: cacheData.organization_id,
    cacheKey: cacheData.cache_key,
    cacheValue: cacheData.cache_value,
    cacheType: cacheData.cache_type || 'general',
    tags: cacheData.tags || [],
    expiresAt: cacheData.expires_at,
    createdAt: cacheData.created_at,
    updatedAt: cacheData.updated_at,
    accessedAt: cacheData.accessed_at,
    accessCount: cacheData.access_count || 0,
    sizeBytes: cacheData.size_bytes || 0,
    isCompressed: cacheData.is_compressed || false,
    compressionType: cacheData.compression_type,
    metadata: cacheData.metadata || {},
  };
}

export function mapCacheLockData(lockData: any) {
  return {
    id: lockData.id,
    organizationId: lockData.organization_id,
    lockKey: lockData.lock_key,
    lockType: lockData.lock_type || 'exclusive',
    lockedBy: lockData.locked_by,
    lockedAt: lockData.locked_at,
    expiresAt: lockData.expires_at,
    acquiredCount: lockData.acquired_count || 1,
    metadata: lockData.metadata || {},
  };
}

export function mapMigrationData(migrationData: any) {
  return {
    id: migrationData.id,
    migrationName: migrationData.migration_name,
    migrationVersion: migrationData.migration_version,
    migrationType: migrationData.migration_type || 'schema',
    description: migrationData.description,
    sqlContent: migrationData.sql_content,
    checksum: migrationData.checksum,
    appliedAt: migrationData.applied_at,
    appliedBy: migrationData.applied_by,
    executionTimeMs: migrationData.execution_time_ms || 0,
    status: migrationData.status || 'success',
    errorMessage: migrationData.error_message,
    rollbackSql: migrationData.rollback_sql,
    rollbackAppliedAt: migrationData.rollback_applied_at,
    rollbackAppliedBy: migrationData.rollback_applied_by,
    dependencies: migrationData.dependencies || [],
    metadata: migrationData.metadata || {},
  };
}

// =============================================================================
// CUSTOMER & CASE MANAGEMENT MAPPING FUNCTIONS
// =============================================================================

export function mapCaseData(caseData: any) {
  return {
    id: caseData.id?.toString(),
    caseNumber: caseData.case_number,
    customerId: caseData.customer_id?.toString(),
    assignedTo: caseData.assigned_to?.toString(),
    loanType: caseData.loan_type,
    loanAmount: caseData.loan_amount,
    status: caseData.status,
    priority: caseData.priority,
    notes: caseData.notes,
    createdAt: caseData.created_at,
    updatedAt: caseData.updated_at,
    customer: caseData.customers ? {
      id: caseData.customers.id?.toString(),
      userId: caseData.customers.user_id?.toString(),
      name: caseData.customers.users ? 
        `${caseData.customers.users.first_name} ${caseData.customers.users.last_name}` : 
        'Unknown Customer',
      email: caseData.customers.users?.email,
      phone: caseData.customers.users?.phone,
      panNumber: caseData.customers.pan_number,
      kycStatus: caseData.customers.kyc_status,
      riskProfile: caseData.customers.risk_profile,
      monthlyIncome: caseData.customers.monthly_income
    } : null,
    assignedUser: caseData.users ? {
      id: caseData.users.id?.toString(),
      name: `${caseData.users.first_name} ${caseData.users.last_name}`,
      firstName: caseData.users.first_name,
      lastName: caseData.users.last_name
    } : null
  };
}

export function mapCustomerData(customerData: any) {
  return {
    id: customerData.id?.toString(),
    userId: customerData.user_id?.toString(),
    panNumber: customerData.pan_number,
    aadhaarNumber: customerData.aadhaar_number,
    dateOfBirth: customerData.date_of_birth,
    kycStatus: customerData.kyc_status,
    riskProfile: customerData.risk_profile,
    monthlyIncome: customerData.monthly_income,
    employmentType: customerData.employment_type,
    createdAt: customerData.created_at,
    updatedAt: customerData.updated_at,
    user: customerData.users ? {
      id: customerData.users.id?.toString(),
      firstName: customerData.users.first_name,
      lastName: customerData.users.last_name,
      name: `${customerData.users.first_name} ${customerData.users.last_name}`,
      email: customerData.users.email,
      phone: customerData.users.phone,
      organizationId: customerData.users.organization_id?.toString()
    } : null
  };
}

export function mapCacheStatisticsData(statsData: any) {
  return {
    id: statsData.id,
    organizationId: statsData.organization_id,
    cacheType: statsData.cache_type,
    date: statsData.date,
    totalRequests: statsData.total_requests || 0,
    cacheHits: statsData.cache_hits || 0,
    cacheMisses: statsData.cache_misses || 0,
    totalSizeBytes: statsData.total_size_bytes || 0,
    averageResponseTimeMs: parseFloat(statsData.average_response_time_ms) || 0,
    peakMemoryUsageBytes: statsData.peak_memory_usage_bytes || 0,
    evictionCount: statsData.eviction_count || 0,
    errorCount: statsData.error_count || 0,
    createdAt: statsData.created_at,
    updatedAt: statsData.updated_at,
  };
}

export function mapCacheInvalidationLogData(logData: any) {
  return {
    id: logData.id,
    organizationId: logData.organization_id,
    cacheKey: logData.cache_key,
    invalidationType: logData.invalidation_type,
    invalidationReason: logData.invalidation_reason,
    invalidatedBy: logData.invalidated_by,
    invalidatedAt: logData.invalidated_at,
    affectedTags: logData.affected_tags || [],
    cacheSizeBefore: logData.cache_size_before || 0,
    cacheSizeAfter: logData.cache_size_after || 0,
    metadata: logData.metadata || {},
  };
}
