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
  AUDIT_LOG: 'audit_log',
  FILES: 'files',
  FOLDERS: 'folders',
  NOTIFICATIONS: 'notifications',
  LOGS: 'logs',
  
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
  
  // Phase 4: Workload Planning Tables
  WORKLOAD_SCHEDULES: 'workload_schedules',
  WORKLOAD_ASSIGNMENTS: 'workload_assignments',
  
  // Phase 5: Approval Queue System Tables
  APPROVAL_QUEUES: 'approval_queues',
  APPROVAL_QUEUE_ITEMS: 'approval_queue_items',
  
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
    userId: auditLogData.user_id,
    action: auditLogData.action,
    resourceType: auditLogData.resource_type,
    resourceId: auditLogData.resource_id,
    details: auditLogData.details,
    ipAddress: auditLogData.ip_address,
    userAgent: auditLogData.user_agent,
    metadata: auditLogData.metadata,
    createdAt: auditLogData.created_at,
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
