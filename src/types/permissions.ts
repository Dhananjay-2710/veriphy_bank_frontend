// =============================================================================
// ROLE-BASED PERMISSIONS SYSTEM
// =============================================================================

export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'manager' 
  | 'salesperson' 
  | 'credit_ops' 
  | 'compliance' 
  | 'auditor';

export type TableName = 
  | 'organizations'
  | 'users'
  | 'customers'
  | 'cases'
  | 'documents'
  | 'products'
  | 'departments'
  | 'tasks'
  | 'notifications'
  | 'document_types'
  | 'roles'
  | 'permissions'
  | 'task_types'
  | 'employment_types'
  | 'system_settings'
  | 'workflow_stages'
  | 'workflow_transitions'
  | 'compliance_issues'
  | 'approval_queues'
  | 'feature_flags';

export type Operation = 'create' | 'read' | 'update' | 'delete' | 'bulk_operations';

export interface TablePermission {
  table: TableName;
  operations: Operation[];
  conditions?: {
    organizationId?: boolean;
    departmentId?: boolean;
    userId?: boolean;
  };
  restrictions?: {
    ownRecordsOnly?: boolean;
    departmentOnly?: boolean;
    organizationOnly?: boolean;
  };
}

// =============================================================================
// ROLE-BASED PERMISSIONS MATRIX
// =============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, TablePermission[]> = {
  super_admin: [
    // Full access to all tables
    { table: 'organizations', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'users', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'customers', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'cases', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'documents', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'products', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'departments', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'tasks', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'notifications', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'document_types', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'roles', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'permissions', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'task_types', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'employment_types', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'system_settings', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'workflow_stages', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'workflow_transitions', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'compliance_issues', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'approval_queues', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
    { table: 'feature_flags', operations: ['create', 'read', 'update', 'delete', 'bulk_operations'] },
  ],

  admin: [
    // Full access within organization
    { table: 'users', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'customers', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'cases', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'documents', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'products', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'departments', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'tasks', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'notifications', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'document_types', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'task_types', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'employment_types', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'workflow_stages', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'workflow_transitions', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'compliance_issues', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'approval_queues', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'feature_flags', operations: ['read', 'update'], conditions: { organizationId: true } },
    // Read-only access to system tables
    { table: 'organizations', operations: ['read'] },
    { table: 'roles', operations: ['read'] },
    { table: 'permissions', operations: ['read'] },
    { table: 'system_settings', operations: ['read'] },
  ],

  manager: [
    // Department-level access
    { table: 'users', operations: ['read', 'update'], conditions: { departmentId: true } },
    { table: 'customers', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'cases', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'documents', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'products', operations: ['read'], conditions: { organizationId: true } },
    { table: 'departments', operations: ['read'], conditions: { organizationId: true } },
    { table: 'tasks', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'notifications', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'document_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'task_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'employment_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_stages', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_transitions', operations: ['read'], conditions: { organizationId: true } },
    { table: 'compliance_issues', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'approval_queues', operations: ['read', 'update'], conditions: { organizationId: true } },
    // Read-only access to system tables
    { table: 'organizations', operations: ['read'] },
    { table: 'roles', operations: ['read'] },
    { table: 'permissions', operations: ['read'] },
    { table: 'system_settings', operations: ['read'] },
    { table: 'feature_flags', operations: ['read'] },
  ],

  salesperson: [
    // Limited access for sales operations
    { table: 'customers', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'cases', operations: ['create', 'read', 'update'], conditions: { organizationId: true }, restrictions: { ownRecordsOnly: true } },
    { table: 'documents', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'products', operations: ['read'], conditions: { organizationId: true } },
    { table: 'departments', operations: ['read'], conditions: { organizationId: true } },
    { table: 'tasks', operations: ['create', 'read', 'update'], conditions: { organizationId: true }, restrictions: { ownRecordsOnly: true } },
    { table: 'notifications', operations: ['read', 'update'], conditions: { userId: true } },
    { table: 'document_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'task_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'employment_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_stages', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_transitions', operations: ['read'], conditions: { organizationId: true } },
    { table: 'compliance_issues', operations: ['read'], conditions: { organizationId: true } },
    { table: 'approval_queues', operations: ['read'], conditions: { organizationId: true } },
    // Read-only access to system tables
    { table: 'organizations', operations: ['read'] },
    { table: 'users', operations: ['read'], conditions: { organizationId: true } },
    { table: 'roles', operations: ['read'] },
    { table: 'permissions', operations: ['read'] },
    { table: 'system_settings', operations: ['read'] },
    { table: 'feature_flags', operations: ['read'] },
  ],

  credit_ops: [
    // Credit operations specific access
    { table: 'customers', operations: ['read', 'update'], conditions: { organizationId: true } },
    { table: 'cases', operations: ['read', 'update'], conditions: { organizationId: true } },
    { table: 'documents', operations: ['read', 'update'], conditions: { organizationId: true } },
    { table: 'products', operations: ['read'], conditions: { organizationId: true } },
    { table: 'departments', operations: ['read'], conditions: { organizationId: true } },
    { table: 'tasks', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'notifications', operations: ['read', 'update'], conditions: { userId: true } },
    { table: 'document_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'task_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'employment_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_stages', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_transitions', operations: ['read'], conditions: { organizationId: true } },
    { table: 'compliance_issues', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'approval_queues', operations: ['read', 'update'], conditions: { organizationId: true } },
    // Read-only access to system tables
    { table: 'organizations', operations: ['read'] },
    { table: 'users', operations: ['read'], conditions: { organizationId: true } },
    { table: 'roles', operations: ['read'] },
    { table: 'permissions', operations: ['read'] },
    { table: 'system_settings', operations: ['read'] },
    { table: 'feature_flags', operations: ['read'] },
  ],

  compliance: [
    // Compliance specific access
    { table: 'customers', operations: ['read'], conditions: { organizationId: true } },
    { table: 'cases', operations: ['read'], conditions: { organizationId: true } },
    { table: 'documents', operations: ['read', 'update'], conditions: { organizationId: true } },
    { table: 'products', operations: ['read'], conditions: { organizationId: true } },
    { table: 'departments', operations: ['read'], conditions: { organizationId: true } },
    { table: 'tasks', operations: ['create', 'read', 'update'], conditions: { organizationId: true } },
    { table: 'notifications', operations: ['read', 'update'], conditions: { userId: true } },
    { table: 'document_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'task_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'employment_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_stages', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_transitions', operations: ['read'], conditions: { organizationId: true } },
    { table: 'compliance_issues', operations: ['create', 'read', 'update', 'delete'], conditions: { organizationId: true } },
    { table: 'approval_queues', operations: ['read', 'update'], conditions: { organizationId: true } },
    // Read-only access to system tables
    { table: 'organizations', operations: ['read'] },
    { table: 'users', operations: ['read'], conditions: { organizationId: true } },
    { table: 'roles', operations: ['read'] },
    { table: 'permissions', operations: ['read'] },
    { table: 'system_settings', operations: ['read'] },
    { table: 'feature_flags', operations: ['read'] },
  ],

  auditor: [
    // Read-only access for auditing
    { table: 'customers', operations: ['read'], conditions: { organizationId: true } },
    { table: 'cases', operations: ['read'], conditions: { organizationId: true } },
    { table: 'documents', operations: ['read'], conditions: { organizationId: true } },
    { table: 'products', operations: ['read'], conditions: { organizationId: true } },
    { table: 'departments', operations: ['read'], conditions: { organizationId: true } },
    { table: 'tasks', operations: ['read'], conditions: { organizationId: true } },
    { table: 'notifications', operations: ['read'], conditions: { organizationId: true } },
    { table: 'document_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'task_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'employment_types', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_stages', operations: ['read'], conditions: { organizationId: true } },
    { table: 'workflow_transitions', operations: ['read'], conditions: { organizationId: true } },
    { table: 'compliance_issues', operations: ['read'], conditions: { organizationId: true } },
    { table: 'approval_queues', operations: ['read'], conditions: { organizationId: true } },
    // Read-only access to system tables
    { table: 'organizations', operations: ['read'] },
    { table: 'users', operations: ['read'], conditions: { organizationId: true } },
    { table: 'roles', operations: ['read'] },
    { table: 'permissions', operations: ['read'] },
    { table: 'system_settings', operations: ['read'] },
    { table: 'feature_flags', operations: ['read'] },
  ],
};

// =============================================================================
// PERMISSION UTILITY FUNCTIONS
// =============================================================================

export function hasPermission(
  userRole: UserRole,
  table: TableName,
  operation: Operation,
  context?: {
    organizationId?: string;
    departmentId?: string;
    userId?: string;
    recordUserId?: string;
  }
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const tablePermission = rolePermissions.find(p => p.table === table);
  
  if (!tablePermission) return false;
  if (!tablePermission.operations.includes(operation)) return false;
  
  // Check conditions
  if (tablePermission.conditions) {
    if (tablePermission.conditions.organizationId && !context?.organizationId) return false;
    if (tablePermission.conditions.departmentId && !context?.departmentId) return false;
    if (tablePermission.conditions.userId && !context?.userId) return false;
  }
  
  // Check restrictions
  if (tablePermission.restrictions) {
    if (tablePermission.restrictions.ownRecordsOnly && context?.recordUserId !== context?.userId) return false;
    if (tablePermission.restrictions.departmentOnly && context?.departmentId !== context?.departmentId) return false;
    if (tablePermission.restrictions.organizationOnly && context?.organizationId !== context?.organizationId) return false;
  }
  
  return true;
}

export function getAccessibleTables(userRole: UserRole): TableName[] {
  return ROLE_PERMISSIONS[userRole].map(p => p.table);
}

export function getTableOperations(userRole: UserRole, table: TableName): Operation[] {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const tablePermission = rolePermissions.find(p => p.table === table);
  return tablePermission?.operations || [];
}
