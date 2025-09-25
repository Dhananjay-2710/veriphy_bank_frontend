// =============================================================================
// PERMANENT SUPABASE DATABASE SERVICE - FIXED FOR ACTUAL SCHEMA
// =============================================================================

import { supabase } from '../supabase-client';
import type {
  User,
  Customer,
  Case,
  Document,
  Task,
  Organization,
  Department,
  Product,
  DocumentType,
  File,
  AuditLog,
  Notification,
  SystemSetting,
  Webhook,
  DashboardMetrics,
  CaseWithRelations,
  DocumentWithRelations,
  TaskWithRelations,
  CaseFilters,
  DocumentFilters,
  TaskFilters,
  UserFilters,
  CreateCaseForm,
  UpdateCaseForm,
  CreateDocumentForm,
  UpdateDocumentForm,
  CreateTaskForm,
  UpdateTaskForm,
  CaseStatus,
  TaskStatus,
  DocStatus,
  UserStatus
} from '../types/database-interfaces';

// =============================================================================
// CONSTANTS - MATCHING ACTUAL TABLE NAMES
// =============================================================================

export const SUPABASE_TABLES = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  CASES: 'cases',
  DOCUMENTS: 'documents',
  TASKS: 'tasks',
  ORGANIZATIONS: 'organizations',
  DEPARTMENTS: 'departments',
  PRODUCTS: 'products',
  DOCUMENT_TYPES: 'document_types',
  FILES: 'files',
  AUDIT_LOG: 'audit_log', // Note: singular, not plural
  NOTIFICATIONS: 'notifications',
  SYSTEM_SETTINGS: 'system_settings',
  WEBHOOKS: 'webhooks'
} as const;

// =============================================================================
// PERMANENT DATABASE SERVICE CLASS
// =============================================================================

export class SupabaseDatabaseServiceFixed {
  
  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================
  
  static async getUsers(filters?: UserFilters): Promise<User[]> {
    console.log('Fetching users with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.USERS)
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }
    if (filters?.department_id) {
      query = query.eq('department_id', filters.department_id);
    }
    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  }

  static async getUserById(userId: string | number): Promise<User | null> {
    console.log('Fetching user by ID:', userId);
    
    // Handle both string and number IDs
    const id = typeof userId === 'string' ? parseInt(userId) : userId;
    
    if (isNaN(id)) {
      console.error('Invalid user ID:', userId);
      return null;
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return data;
  }

  static async createUser(userData: Partial<User>): Promise<User | null> {
    console.log('Creating user:', userData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .insert({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  static async updateUser(userId: number, updates: Partial<User>): Promise<User | null> {
    console.log('Updating user:', userId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  static async deleteUser(userId: number): Promise<void> {
    console.log('Deleting user:', userId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // =============================================================================
  // CASE MANAGEMENT
  // =============================================================================
  
  static async getCases(filters?: CaseFilters): Promise<CaseWithRelations[]> {
    console.log('Fetching cases with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.CASES)
      .select(`
        *,
        customer:customers(*),
        assigned_user:users!cases_assigned_to_fkey(*),
        product:products(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cases:', error);
      return [];
    }

    // Get documents for each case
    const casesWithDocuments = await Promise.all(
      (data || []).map(async (case_) => {
        const documents = await this.getDocumentsByCustomer(case_.customer_id);
        return {
          ...case_,
          documents
        };
      })
    );

    return casesWithDocuments;
  }

  static async getCaseById(caseId: string | number): Promise<CaseWithRelations | null> {
    console.log('Fetching case by ID:', caseId);
    
    const id = typeof caseId === 'string' ? parseInt(caseId) : caseId;
    
    if (isNaN(id)) {
      console.error('Invalid case ID:', caseId);
      return null;
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .select(`
        *,
        customer:customers(*),
        assigned_user:users!cases_assigned_to_fkey(*),
        product:products(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching case by ID:', error);
      return null;
    }

    if (!data) return null;

    // Get documents for this case
    const documents = await this.getDocumentsByCustomer(data.customer_id);
    
    return {
      ...data,
      documents
    };
  }

  static async createCase(caseData: CreateCaseForm): Promise<Case | null> {
    console.log('Creating case:', caseData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .insert({
        ...caseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating case:', error);
      throw new Error(`Failed to create case: ${error.message}`);
    }

    return data;
  }

  static async updateCase(caseId: number, updates: UpdateCaseForm): Promise<Case | null> {
    console.log('Updating case:', caseId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating case:', error);
      throw new Error(`Failed to update case: ${error.message}`);
    }

    return data;
  }

  static async deleteCase(caseId: number): Promise<void> {
    console.log('Deleting case:', caseId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .delete()
      .eq('id', caseId);

    if (error) {
      console.error('Error deleting case:', error);
      throw new Error(`Failed to delete case: ${error.message}`);
    }
  }

  // =============================================================================
  // DOCUMENT MANAGEMENT
  // =============================================================================
  
  static async getDocuments(filters?: DocumentFilters): Promise<DocumentWithRelations[]> {
    console.log('Fetching documents with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .select(`
        *,
        uploaded_user:users!documents_uploaded_by_fkey(*),
        verified_user:users!documents_verified_by_fkey(*),
        document_type:document_types(*),
        file:files(*),
        customer:customers(*)
      `)
      .order('submitted_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters?.document_type_id) {
      query = query.eq('document_type_id', filters.document_type_id);
    }
    if (filters?.uploaded_by) {
      query = query.eq('uploaded_by', filters.uploaded_by);
    }
    if (filters?.verified_by) {
      query = query.eq('verified_by', filters.verified_by);
    }
    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data || [];
  }

  static async getDocumentsByCustomer(customerId: number): Promise<Document[]> {
    console.log('Fetching documents by customer ID:', customerId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .select('*')
      .eq('customer_id', customerId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents by customer:', error);
      return [];
    }

    return data || [];
  }

  static async createDocument(documentData: CreateDocumentForm): Promise<Document | null> {
    console.log('Creating document:', documentData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .insert({
        ...documentData,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw new Error(`Failed to create document: ${error.message}`);
    }

    return data;
  }

  static async updateDocument(documentId: number, updates: UpdateDocumentForm): Promise<Document | null> {
    console.log('Updating document:', documentId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      throw new Error(`Failed to update document: ${error.message}`);
    }

    return data;
  }

  static async deleteDocument(documentId: number): Promise<void> {
    console.log('Deleting document:', documentId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  // =============================================================================
  // TASK MANAGEMENT
  // =============================================================================
  
  static async getTasks(filters?: TaskFilters): Promise<TaskWithRelations[]> {
    console.log('Fetching tasks with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.TASKS)
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey(*),
        created_user:users!tasks_created_by_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data || [];
  }

  static async createTask(taskData: CreateTaskForm): Promise<Task | null> {
    console.log('Creating task:', taskData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASKS)
      .insert({
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return data;
  }

  static async updateTask(taskId: number, updates: UpdateTaskForm): Promise<Task | null> {
    console.log('Updating task:', taskId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASKS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return data;
  }

  static async deleteTask(taskId: number): Promise<void> {
    console.log('Deleting task:', taskId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.TASKS)
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  // =============================================================================
  // DASHBOARD METRICS
  // =============================================================================
  
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    console.log('Fetching dashboard metrics');
    
    try {
      // Get all metrics in parallel
      const [
        activeUsersResult,
        openCasesResult,
        inProgressCasesResult,
        closedCasesResult,
        openTasksResult,
        pendingDocumentsResult,
        dailyAuditLogsResult
      ] = await Promise.all([
        supabase
          .from(SUPABASE_TABLES.USERS)
          .select('id', { count: 'exact' })
          .eq('is_active', true),
        
        supabase
          .from(SUPABASE_TABLES.CASES)
          .select('id', { count: 'exact' })
          .eq('status', 'open'),
        
        supabase
          .from(SUPABASE_TABLES.CASES)
          .select('id', { count: 'exact' })
          .eq('status', 'in_progress'),
        
        supabase
          .from(SUPABASE_TABLES.CASES)
          .select('id', { count: 'exact' })
          .eq('status', 'closed'),
        
        supabase
          .from(SUPABASE_TABLES.TASKS)
          .select('id', { count: 'exact' })
          .eq('status', 'open'),
        
        supabase
          .from(SUPABASE_TABLES.DOCUMENTS)
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),
        
        supabase
          .from(SUPABASE_TABLES.AUDIT_LOG)
          .select('id', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        active_users: activeUsersResult.count || 0,
        open_cases: openCasesResult.count || 0,
        in_progress_cases: inProgressCasesResult.count || 0,
        closed_cases: closedCasesResult.count || 0,
        open_tasks: openTasksResult.count || 0,
        pending_documents: pendingDocumentsResult.count || 0,
        daily_audit_logs: dailyAuditLogsResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {
        active_users: 0,
        open_cases: 0,
        in_progress_cases: 0,
        closed_cases: 0,
        open_tasks: 0,
        pending_documents: 0,
        daily_audit_logs: 0
      };
    }
  }

  // =============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================================================
  
  static subscribeToCaseUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('case-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CASES },
        callback
      )
      .subscribe();
  }

  static subscribeToDocumentUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('document-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.DOCUMENTS },
        callback
      )
      .subscribe();
  }

  static subscribeToTaskUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('task-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.TASKS },
        callback
      )
      .subscribe();
  }

  static subscribeToUserUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('user-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.USERS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // AUDIT LOGGING
  // =============================================================================
  
  static async logAuditEvent(event: {
    user_id?: number;
    organization_id?: number;
    action: string;
    resource_type?: string;
    resource_id?: string;
    details?: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: any;
  }): Promise<void> {
    console.log('Logging audit event:', event);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.AUDIT_LOG)
      .insert({
        ...event,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging audit event:', error);
      // Don't throw here as audit logging shouldn't break the main flow
    }
  }

  // =============================================================================
  // SYSTEM SETTINGS
  // =============================================================================
  
  static async getSystemSettings(): Promise<SystemSetting[]> {
    console.log('Fetching system settings');
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching system settings:', error);
      return [];
    }

    return data || [];
  }

  static async getSystemSetting(key: string): Promise<string | null> {
    console.log('Fetching system setting:', key);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
      .select('value')
      .eq('key', key)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching system setting:', error);
      return null;
    }

    return data?.value || null;
  }

  static async setSystemSetting(key: string, value: string, description?: string, category?: string): Promise<void> {
    console.log('Setting system setting:', key, value);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
      .upsert({
        key,
        value,
        description,
        category: category || 'general',
        is_active: true,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error setting system setting:', error);
      throw new Error(`Failed to set system setting: ${error.message}`);
    }
  }
}

// Export the fixed service as the default
export default SupabaseDatabaseServiceFixed;
