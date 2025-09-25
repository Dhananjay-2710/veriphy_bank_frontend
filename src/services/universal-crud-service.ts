// =============================================================================
// UNIVERSAL CRUD SERVICE
// =============================================================================
// This service provides comprehensive CRUD operations for all tables with role-based access control

import { supabase } from '../supabase-client';
import { SUPABASE_TABLES } from './supabase-schema-mapping';
import { 
  UserRole, 
  TableName, 
  Operation, 
  hasPermission, 
  getTableOperations 
} from '../types/permissions';

// =============================================================================
// INTERFACES
// =============================================================================

export interface CrudOptions {
  userRole: UserRole;
  userId?: string;
  organizationId?: string;
  departmentId?: string;
  filters?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface CrudResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  error?: string;
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'date' | 'boolean';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// =============================================================================
// VALIDATION RULES FOR EACH TABLE
// =============================================================================

export const TABLE_VALIDATION_RULES: Record<TableName, ValidationRule[]> = {
  organizations: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'slug', required: true, type: 'string', minLength: 2, maxLength: 50, pattern: /^[a-z0-9-]+$/ },
    { field: 'email', type: 'email' },
    { field: 'max_users', type: 'number', min: 1, max: 10000 },
    { field: 'max_loans_per_month', type: 'number', min: 0, max: 1000000 },
  ],
  
  users: [
    { field: 'email', required: true, type: 'email' },
    { field: 'full_name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'role', required: true, type: 'string' },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'mobile', type: 'string', pattern: /^\+?[\d\s-()]+$/ },
  ],
  
  customers: [
    { field: 'full_name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'email', type: 'email' },
    { field: 'mobile', type: 'string', pattern: /^\+?[\d\s-()]+$/ },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'kyc_status', type: 'string' },
  ],
  
  cases: [
    { field: 'case_number', required: true, type: 'string', minLength: 5, maxLength: 50 },
    { field: 'customer_id', required: true, type: 'number' },
    { field: 'product_id', required: true, type: 'number' },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'status', type: 'string' },
    { field: 'priority', type: 'string' },
  ],
  
  documents: [
    { field: 'customer_id', required: true, type: 'number' },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'document_type_id', required: true, type: 'number' },
    { field: 'status', type: 'string' },
  ],
  
  products: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'product_code', required: true, type: 'string', minLength: 2, maxLength: 20 },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'min_amount', type: 'number', min: 0 },
    { field: 'max_amount', type: 'number', min: 0 },
    { field: 'interest_rate', type: 'number', min: 0, max: 100 },
  ],
  
  departments: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'code', required: true, type: 'string', minLength: 2, maxLength: 20 },
    { field: 'organization_id', required: true, type: 'number' },
  ],
  
  tasks: [
    { field: 'title', required: true, type: 'string', minLength: 2, maxLength: 200 },
    { field: 'description', type: 'string', maxLength: 1000 },
    { field: 'assigned_to', type: 'number' },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'status', type: 'string' },
    { field: 'priority', type: 'string' },
  ],
  
  notifications: [
    { field: 'user_id', required: true, type: 'number' },
    { field: 'title', required: true, type: 'string', minLength: 2, maxLength: 200 },
    { field: 'message', required: true, type: 'string', minLength: 2, maxLength: 1000 },
    { field: 'type', type: 'string' },
  ],
  
  document_types: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'code', required: true, type: 'string', minLength: 2, maxLength: 20 },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'is_required', type: 'boolean' },
  ],
  
  roles: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 50 },
    { field: 'display_name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'description', type: 'string', maxLength: 500 },
  ],
  
  permissions: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'display_name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'description', type: 'string', maxLength: 500 },
  ],
  
  task_types: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'code', required: true, type: 'string', minLength: 2, maxLength: 20 },
    { field: 'organization_id', required: true, type: 'number' },
  ],
  
  employment_types: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'code', required: true, type: 'string', minLength: 2, maxLength: 20 },
    { field: 'organization_id', required: true, type: 'number' },
  ],
  
  system_settings: [
    { field: 'key', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'value', type: 'string' },
    { field: 'description', type: 'string', maxLength: 500 },
    { field: 'category', type: 'string' },
  ],
  
  workflow_stages: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'code', required: true, type: 'string', minLength: 2, maxLength: 20 },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'order_index', type: 'number', min: 0 },
  ],
  
  workflow_transitions: [
    { field: 'from_stage_id', required: true, type: 'number' },
    { field: 'to_stage_id', required: true, type: 'number' },
    { field: 'organization_id', required: true, type: 'number' },
  ],
  
  compliance_issues: [
    { field: 'title', required: true, type: 'string', minLength: 2, maxLength: 200 },
    { field: 'description', type: 'string', maxLength: 1000 },
    { field: 'case_id', type: 'number' },
    { field: 'organization_id', required: true, type: 'number' },
    { field: 'severity', type: 'string' },
    { field: 'status', type: 'string' },
  ],
  
  approval_queues: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'description', type: 'string', maxLength: 500 },
    { field: 'organization_id', required: true, type: 'number' },
  ],
  
  feature_flags: [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'is_enabled', type: 'boolean' },
    { field: 'organization_id', type: 'number' },
  ],
};

// =============================================================================
// UNIVERSAL CRUD SERVICE CLASS
// =============================================================================

export class UniversalCrudService {
  
  // =============================================================================
  // VALIDATION METHODS
  // =============================================================================
  
  private static validateData(table: TableName, data: any): string[] {
    const rules = TABLE_VALIDATION_RULES[table] || [];
    const errors: string[] = [];
    
    for (const rule of rules) {
      const value = data[rule.field];
      
      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }
      
      // Skip validation if value is empty and not required
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      // Type validation
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${rule.field} must be a string`);
        continue;
      }
      
      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${rule.field} must be a number`);
        continue;
      }
      
      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${rule.field} must be a boolean`);
        continue;
      }
      
      if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${rule.field} must be a valid email`);
        continue;
      }
      
      // Length validation
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
        }
      }
      
      // Range validation
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${rule.field} must be at most ${rule.max}`);
        }
      }
      
      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(`${rule.field} format is invalid`);
        continue;
      }
      
      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    }
    
    return errors;
  }
  
  // =============================================================================
  // PERMISSION CHECKING
  // =============================================================================
  
  private static checkPermission(
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
    return hasPermission(userRole, table, operation, context);
  }
  
  // =============================================================================
  // QUERY BUILDING
  // =============================================================================
  
  private static buildQuery(
    table: TableName,
    options: CrudOptions
  ) {
    let query = supabase.from(SUPABASE_TABLES[table.toUpperCase() as keyof typeof SUPABASE_TABLES]);
    
    // Apply organization filter if required
    if (options.organizationId) {
      query = query.eq('organization_id', options.organizationId);
    }
    
    // Apply department filter if required
    if (options.departmentId) {
      query = query.eq('department_id', options.departmentId);
    }
    
    // Apply user filter if required (for own records only)
    if (options.userId && ['tasks', 'cases'].includes(table)) {
      query = query.eq('assigned_to', options.userId);
    }
    
    // Apply custom filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }
    
    // Apply sorting
    if (options.sorting) {
      query = query.order(options.sorting.field, { ascending: options.sorting.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (options.pagination) {
      const { page, limit } = options.pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }
    
    return query;
  }
  
  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================
  
  static async create<T = any>(
    table: TableName,
    data: Partial<T>,
    options: CrudOptions
  ): Promise<{ data: T | null; error: string | null }> {
    console.log(`🔨 Creating ${table} record:`, data);
    
    // Check permission
    if (!this.checkPermission(options.userRole, table, 'create', {
      organizationId: options.organizationId,
      departmentId: options.departmentId,
      userId: options.userId
    })) {
      return { data: null, error: 'Insufficient permissions to create this record' };
    }
    
    // Validate data
    const validationErrors = this.validateData(table, data);
    if (validationErrors.length > 0) {
      return { data: null, error: `Validation failed: ${validationErrors.join(', ')}` };
    }
    
    // Add metadata
    const recordData = {
      ...data,
      organization_id: options.organizationId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data: result, error } = await supabase
        .from(SUPABASE_TABLES[table.toUpperCase() as keyof typeof SUPABASE_TABLES])
        .insert(recordData)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error creating ${table}:`, error);
        return { data: null, error: error.message };
      }
      
      console.log(`✅ Created ${table} record:`, result);
      return { data: result, error: null };
    } catch (error) {
      console.error(`❌ Exception creating ${table}:`, error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  static async read<T = any>(
    table: TableName,
    options: CrudOptions
  ): Promise<CrudResult<T>> {
    console.log(`📖 Reading ${table} records with options:`, options);
    
    // Check permission
    if (!this.checkPermission(options.userRole, table, 'read', {
      organizationId: options.organizationId,
      departmentId: options.departmentId,
      userId: options.userId
    })) {
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        hasMore: false,
        error: 'Insufficient permissions to read this table'
      };
    }
    
    try {
      const query = this.buildQuery(table, options);
      const { data, error, count } = await query.select('*', { count: 'exact' });
      
      if (error) {
        console.error(`❌ Error reading ${table}:`, error);
        return {
          data: [],
          total: 0,
          page: options.pagination?.page || 1,
          limit: options.pagination?.limit || 10,
          hasMore: false,
          error: error.message
        };
      }
      
      const total = count || 0;
      const page = options.pagination?.page || 1;
      const limit = options.pagination?.limit || 10;
      const hasMore = (page * limit) < total;
      
      console.log(`✅ Read ${table} records:`, data?.length || 0, 'of', total);
      return {
        data: data || [],
        total,
        page,
        limit,
        hasMore
      };
    } catch (error) {
      console.error(`❌ Exception reading ${table}:`, error);
      return {
        data: [],
        total: 0,
        page: options.pagination?.page || 1,
        limit: options.pagination?.limit || 10,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  static async update<T = any>(
    table: TableName,
    id: string | number,
    data: Partial<T>,
    options: CrudOptions
  ): Promise<{ data: T | null; error: string | null }> {
    console.log(`✏️ Updating ${table} record ${id}:`, data);
    
    // Check permission
    if (!this.checkPermission(options.userRole, table, 'update', {
      organizationId: options.organizationId,
      departmentId: options.departmentId,
      userId: options.userId
    })) {
      return { data: null, error: 'Insufficient permissions to update this record' };
    }
    
    // Validate data
    const validationErrors = this.validateData(table, data);
    if (validationErrors.length > 0) {
      return { data: null, error: `Validation failed: ${validationErrors.join(', ')}` };
    }
    
    // Add metadata
    const recordData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data: result, error } = await supabase
        .from(SUPABASE_TABLES[table.toUpperCase() as keyof typeof SUPABASE_TABLES])
        .update(recordData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error updating ${table}:`, error);
        return { data: null, error: error.message };
      }
      
      console.log(`✅ Updated ${table} record:`, result);
      return { data: result, error: null };
    } catch (error) {
      console.error(`❌ Exception updating ${table}:`, error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  static async delete(
    table: TableName,
    id: string | number,
    options: CrudOptions
  ): Promise<{ success: boolean; error: string | null }> {
    console.log(`🗑️ Deleting ${table} record ${id}`);
    
    // Check permission
    if (!this.checkPermission(options.userRole, table, 'delete', {
      organizationId: options.organizationId,
      departmentId: options.departmentId,
      userId: options.userId
    })) {
      return { success: false, error: 'Insufficient permissions to delete this record' };
    }
    
    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES[table.toUpperCase() as keyof typeof SUPABASE_TABLES])
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`❌ Error deleting ${table}:`, error);
        return { success: false, error: error.message };
      }
      
      console.log(`✅ Deleted ${table} record ${id}`);
      return { success: true, error: null };
    } catch (error) {
      console.error(`❌ Exception deleting ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  static async bulkDelete(
    table: TableName,
    ids: (string | number)[],
    options: CrudOptions
  ): Promise<{ success: boolean; error: string | null; deletedCount: number }> {
    console.log(`🗑️ Bulk deleting ${table} records:`, ids);
    
    // Check permission
    if (!this.checkPermission(options.userRole, table, 'bulk_operations', {
      organizationId: options.organizationId,
      departmentId: options.departmentId,
      userId: options.userId
    })) {
      return { success: false, error: 'Insufficient permissions for bulk operations', deletedCount: 0 };
    }
    
    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES[table.toUpperCase() as keyof typeof SUPABASE_TABLES])
        .delete()
        .in('id', ids);
      
      if (error) {
        console.error(`❌ Error bulk deleting ${table}:`, error);
        return { success: false, error: error.message, deletedCount: 0 };
      }
      
      console.log(`✅ Bulk deleted ${table} records:`, ids.length);
      return { success: true, error: null, deletedCount: ids.length };
    } catch (error) {
      console.error(`❌ Exception bulk deleting ${table}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', deletedCount: 0 };
    }
  }
  
  // =============================================================================
  // UTILITY METHODS
  // =============================================================================
  
  static getTableOperations(userRole: UserRole, table: TableName): Operation[] {
    return getTableOperations(userRole, table);
  }
  
  static canAccessTable(userRole: UserRole, table: TableName): boolean {
    return getTableOperations(userRole, table).length > 0;
  }
  
  static getAccessibleTables(userRole: UserRole): TableName[] {
    return Object.keys(TABLE_VALIDATION_RULES).filter(table => 
      this.canAccessTable(userRole, table as TableName)
    ) as TableName[];
  }
}
