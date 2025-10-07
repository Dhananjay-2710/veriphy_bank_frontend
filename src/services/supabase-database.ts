import { supabase } from '../supabase-client';
import { AuditLogger } from '../utils/audit-logger';
import { 
  SUPABASE_TABLES, 
  mapCaseToLoanApplication, 
  // mapDocumentStatus, // Not used in this file
  mapTaskPriority,
  mapRoleData,
  mapPermissionData,
  mapAuditLogData,
  mapProductData,
  mapCaseData,
  mapSubProductData,
  mapDocumentTypeData,
  mapFileData,
  mapFolderData,
  mapDocumentAgainstProductData,
  mapDocAgainstSubProductData,
  mapFileSignatureData,
  mapWorkflowStageData,
  mapWorkflowTransitionData,
  mapWorkflowHistoryData,
  mapLoanApplicationData,
  mapLoanProductData,
  mapTaskCategoryData,
  mapComplianceIssueTypeData,
  mapComplianceIssueData,
  mapComplianceIssueCommentData,
  mapComplianceReportData,
  mapReportTemplateData,
  mapScheduledReportData,
  mapReportExecutionData,
  mapFeatureFlagData,
  mapSystemIntegrationData,
  mapSystemSettingData,
  mapOrganizationSettingData,
  mapWorkloadScheduleData,
  mapWorkloadAssignmentData,
  mapApprovalQueueData,
  mapApprovalQueueItemData,
  mapCaseStatusHistoryData,
  mapCaseWorkflowStageData,
  mapAssignCaseSettingData,
  mapAssignPermissionData,
  mapJobData,
  mapJobBatchData,
  mapFailedJobData,
  mapThirdPartyApiLogData,
  mapWebhookData,
  mapAuthAccountData,
  mapSessionData,
  mapUserRoleData,
  mapPasswordResetTokenData,
  mapPersonalAccessTokenData,
  mapAuthAuditLogData,
  mapCacheData,
  mapCacheLockData,
  mapMigrationData,
  mapCacheStatisticsData,
  mapCacheInvalidationLogData
} from './supabase-schema-mapping';

// =============================================================================
// UPDATED DATABASE SERVICE FOR SUPABASE SCHEMA
// =============================================================================

export class SupabaseDatabaseService {
  // =============================================================================
  // ORGANIZATION MANAGEMENT
  // =============================================================================

  static async getOrganizations() {
    console.log('🔍 Fetching organizations from Supabase...');
    console.log('📊 Using table:', SUPABASE_TABLES.ORGANIZATIONS);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATIONS)
      .select(`
        id,
        name,
        code,
        description,
        email,
        phone,
        website,
        logo_url,
        address,
        metadata,
        settings,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching organizations:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    console.log('✅ Organizations fetched successfully:', data?.length || 0, 'organizations');
    console.log('📋 Raw data:', data);

    return data?.map(org => ({
      id: org.id.toString(),
      name: org.name,
      code: org.code,
      description: org.description,
      email: org.email,
      phone: org.phone,
      website: org.website,
      logoUrl: org.logo_url,
      address: org.address,
      metadata: org.metadata,
      settings: org.settings,
      isActive: org.is_active,
      createdAt: org.created_at,
      updatedAt: org.updated_at
    })) || [];
  }

  static async createOrganization(organizationData: {
    name: string;
    code: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoUrl?: string;
    address?: any;
    metadata?: any;
    settings?: any;
  }) {
    console.log('🚀 Creating organization:', organizationData);
    console.log('📊 Using table:', SUPABASE_TABLES.ORGANIZATIONS);
    
    const insertData = {
      name: organizationData.name,
      code: organizationData.code,
      description: organizationData.description,
      email: organizationData.email,
      phone: organizationData.phone,
      website: organizationData.website,
      logo_url: organizationData.logoUrl,
      address: organizationData.address,
      metadata: organizationData.metadata,
      settings: organizationData.settings || '{}',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Insert data:', insertData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATIONS)
      .insert(insertData)
      .select();

    if (error) {
      console.error('❌ Error creating organization:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to create organization: ${error.message}`);
    }

    console.log('✅ Organization created successfully:', data);

    // Create audit log for organization creation
    try {
      await AuditLogger.logOrganizationCreation(
        data?.[0]?.id?.toString() || 'unknown',
        organizationData,
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for organization creation:', auditError);
      // Don't throw here to avoid breaking the main operation
    }

    return data?.[0];
  }

  static async updateOrganization(organizationId: string, updates: {
    name?: string;
    code?: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoUrl?: string;
    address?: any;
    metadata?: any;
    settings?: any;
    isActive?: boolean;
  }) {
    console.log('Updating organization:', organizationId, updates);
    
    // Get the current organization data for audit logging
    const { data: currentData } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATIONS)
      .select('*')
      .eq('id', organizationId)
      .single();
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATIONS)
      .update({
        name: updates.name,
        code: updates.code,
        description: updates.description,
        email: updates.email,
        phone: updates.phone,
        website: updates.website,
        logo_url: updates.logoUrl,
        address: updates.address,
        metadata: updates.metadata,
        settings: updates.settings,
        is_active: updates.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .select();

    if (error) {
      console.error('Error updating organization:', error);
      throw new Error(`Failed to update organization: ${error.message}`);
    }

    // Create audit log for organization update
    try {
      await AuditLogger.logOrganizationUpdate(
        organizationId,
        currentData,
        data?.[0],
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for organization update:', auditError);
      // Don't throw here to avoid breaking the main operation
    }

    return data?.[0];
  }

  static async deleteOrganization(organizationId: string) {
    console.log('Deleting organization:', organizationId);
    
    // Get the current organization data for audit logging
    const { data: currentData } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATIONS)
      .select('*')
      .eq('id', organizationId)
      .single();
    
    if (!currentData) {
      throw new Error('Organization not found');
    }

    try {
      // Step 1: Delete related departments first
      console.log('Deleting related departments...');
      const { error: departmentsError } = await supabase
        .from('departments')
        .delete()
        .eq('organization_id', organizationId);

      if (departmentsError && !departmentsError.message.includes('does not exist')) {
        console.error('Error deleting departments:', departmentsError);
        throw new Error(`Failed to delete departments: ${departmentsError.message}`);
      }

      // Step 2: Delete related users
      console.log('Deleting related users...');
      const { error: usersError } = await supabase
        .from('users')
        .delete()
        .eq('organization_id', organizationId);

      if (usersError && !usersError.message.includes('does not exist')) {
        console.error('Error deleting users:', usersError);
        throw new Error(`Failed to delete users: ${usersError.message}`);
      }

      // Step 3: Delete related customers
      console.log('Deleting related customers...');
      const { error: customersError } = await supabase
        .from('customers')
        .delete()
        .eq('organization_id', organizationId);

      if (customersError && !customersError.message.includes('does not exist')) {
        console.error('Error deleting customers:', customersError);
        throw new Error(`Failed to delete customers: ${customersError.message}`);
      }

      // Step 4: Delete related cases
      console.log('Deleting related cases...');
      const { error: casesError } = await supabase
        .from('cases')
        .delete()
        .eq('organization_id', organizationId);

      if (casesError && !casesError.message.includes('does not exist')) {
        console.error('Error deleting cases:', casesError);
        throw new Error(`Failed to delete cases: ${casesError.message}`);
      }

      // Step 5: Delete related products
      console.log('Deleting related products...');
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('organization_id', organizationId);

      if (productsError && !productsError.message.includes('does not exist')) {
        console.error('Error deleting products:', productsError);
        throw new Error(`Failed to delete products: ${productsError.message}`);
      }

      // Step 6: Finally delete the organization
      console.log('Deleting organization record...');
      const { error } = await supabase
        .from(SUPABASE_TABLES.ORGANIZATIONS)
        .delete()
        .eq('id', organizationId);

      if (error) {
        console.error('Error deleting organization:', error);
        throw new Error(`Failed to delete organization: ${error.message}`);
      }

      console.log('✅ Organization and all related records deleted successfully');

    } catch (error) {
      console.error('Error in cascading delete:', error);
      throw error;
    }

    // Create audit log for organization deletion
    try {
      await AuditLogger.logOrganizationDeletion(
        organizationId,
        currentData,
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for organization deletion:', auditError);
      // Don't throw here to avoid breaking the main operation
    }
  }

  // Real-time subscription for organizations
  static subscribeToOrganizationUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('organization-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.ORGANIZATIONS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // DATABASE DEBUGGING
  // =============================================================================

  static async debugDatabaseTables() {
    console.log('🔍 Debugging database tables...');
    
    // Try to get information about available tables
    const tables = ['departments', 'organizations', 'users', 'customers', 'cases'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        console.log(`🔍 Table "${table}":`, { 
          exists: !error, 
          error: error?.message, 
          dataCount: data?.length || 0,
          sampleData: data?.[0] 
        });
      } catch (err) {
        console.log(`❌ Table "${table}" error:`, err);
      }
    }
  }

  // =============================================================================
  // DEPARTMENT MANAGEMENT
  // =============================================================================

  static async getDepartments(filters?: {
    organizationId?: string;
    departmentType?: string;
    isActive?: boolean;
  }) {
    console.log('🔍 Fetching departments with filters:', filters);
    console.log('🔍 Using table:', SUPABASE_TABLES.DEPARTMENTS);
    console.log('🔍 SUPABASE_TABLES object:', SUPABASE_TABLES);
    
    // First, let's try a simple query to see if the table exists and has data
    console.log('🔍 Testing basic table access...');
    const { data: testData, error: testError } = await supabase
      .from(SUPABASE_TABLES.DEPARTMENTS)
      .select('*')
      .limit(5);
    
    console.log('🔍 Test query result:', { testData, testError });
    
    if (testError) {
      console.error('❌ Error accessing departments table:', testError);
      
      // Try with the exact table name in case there's a mapping issue
      console.log('🔍 Trying with exact table name "departments"...');
      const { data: testData2, error: testError2 } = await supabase
        .from('departments')
        .select('*')
        .limit(5);
      
      console.log('🔍 Direct table query result:', { testData2, testError2 });
      
      if (testError2) {
        console.error('❌ Error accessing departments table directly:', testError2);
        return [];
      }
      
      console.log('🔍 Raw departments data (direct query):', testData2);
      
      // If direct query works, use it
      const { data: directData, error: directError } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          code,
          description,
          department_type,
          parent_department_id,
          manager_id,
          is_active,
          metadata,
          created_at,
          updated_at,
          organization_id
        `)
        .order('created_at', { ascending: false });
        
      if (directError) {
        console.error('❌ Error in direct query:', directError);
        return [];
      }
      
      console.log('🔍 All departments data (direct):', directData);
      
      // Map the data manually since we're using direct query
      return directData?.map(dept => ({
        id: dept.id.toString(),
        name: dept.name,
        code: dept.code,
        description: dept.description,
        departmentType: dept.department_type,
        parentDepartmentId: dept.parent_department_id?.toString(),
        managerId: dept.manager_id?.toString(),
        isActive: dept.is_active,
        metadata: dept.metadata,
        createdAt: dept.created_at,
        updatedAt: dept.updated_at,
        organizationId: dept.organization_id?.toString(),
        parentDepartment: null, // Will be populated later if needed
        manager: null // Will be populated later if needed
      })) || [];
    }
    
    console.log('🔍 Raw departments data (first 5):', testData);
    
    // Use a simple query without foreign key joins to avoid relationship errors
    let query = supabase
      .from(SUPABASE_TABLES.DEPARTMENTS)
      .select(`
        id,
        name,
        code,
        description,
        department_type,
        parent_department_id,
        manager_id,
        is_active,
        metadata,
        created_at,
        updated_at,
        organization_id
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.departmentType) {
      query = query.eq('department_type', filters.departmentType);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    console.log('🔍 Processing departments data:', data);
    
    return data?.map(dept => ({
      id: dept.id.toString(),
      name: dept.name,
      code: dept.code,
      description: dept.description,
      departmentType: dept.department_type,
      parentDepartmentId: dept.parent_department_id?.toString(),
      managerId: dept.manager_id?.toString(),
      isActive: dept.is_active,
      metadata: dept.metadata,
      createdAt: dept.created_at,
      updatedAt: dept.updated_at,
      organizationId: dept.organization_id?.toString(),
      // Note: parentDepartment and manager will be populated separately if needed
      parentDepartment: null,
      manager: null
    })) || [];
  }

  static async createDepartment(departmentData: {
    name: string;
    code: string;
    description: string;
    departmentType: 'sales' | 'credit_ops' | 'compliance' | 'admin' | 'support';
    parentDepartmentId?: string;
    managerId?: string;
    organizationId: string;
  }) {
    console.log('Creating department:', departmentData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DEPARTMENTS)
      .insert({
        name: departmentData.name,
        code: departmentData.code,
        description: departmentData.description,
        department_type: departmentData.departmentType,
        parent_department_id: departmentData.parentDepartmentId ? parseInt(departmentData.parentDepartmentId) : null,
        manager_id: departmentData.managerId ? parseInt(departmentData.managerId) : null,
        organization_id: parseInt(departmentData.organizationId),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating department:', error);
      throw new Error(`Failed to create department: ${error.message}`);
    }

    // Create audit log for department creation
    try {
      await AuditLogger.logDepartmentCreation(
        data?.[0]?.id?.toString() || 'unknown',
        departmentData,
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for department creation:', auditError);
      // Don't throw here to avoid breaking the main operation
    }

    return data?.[0];
  }

  static async updateDepartment(departmentId: string, updates: {
    name?: string;
    code?: string;
    description?: string;
    departmentType?: 'sales' | 'credit_ops' | 'compliance' | 'admin' | 'support';
    parentDepartmentId?: string;
    managerId?: string;
    organizationId?: string;
    isActive?: boolean;
  }) {
    console.log('Updating department:', departmentId, updates);
    
    // Get the current department data for audit logging
    const { data: currentData } = await supabase
      .from(SUPABASE_TABLES.DEPARTMENTS)
      .select('*')
      .eq('id', departmentId)
      .single();
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DEPARTMENTS)
      .update({
        name: updates.name,
        code: updates.code,
        description: updates.description,
        department_type: updates.departmentType,
        parent_department_id: updates.parentDepartmentId ? parseInt(updates.parentDepartmentId) : null,
        manager_id: updates.managerId ? parseInt(updates.managerId) : null,
        organization_id: updates.organizationId ? parseInt(updates.organizationId) : undefined,
        is_active: updates.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', departmentId)
      .select();

    if (error) {
      console.error('Error updating department:', error);
      throw new Error(`Failed to update department: ${error.message}`);
    }

    // Create audit log for department update
    try {
      await AuditLogger.logDepartmentUpdate(
        departmentId,
        currentData,
        data?.[0],
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for department update:', auditError);
      // Don't throw here to avoid breaking the main operation
    }

    return data?.[0];
  }

  static async deleteDepartment(departmentId: string) {
    console.log('Deleting department:', departmentId);
    
    // Get the current department data for audit logging
    const { data: currentData } = await supabase
      .from(SUPABASE_TABLES.DEPARTMENTS)
      .select('*')
      .eq('id', departmentId)
      .single();
    
    if (!currentData) {
      throw new Error('Department not found');
    }

    try {
      // Step 1: Update users to remove department reference
      console.log('Updating users to remove department reference...');
      const { error: usersError } = await supabase
        .from('users')
        .update({ department_id: null })
        .eq('department_id', departmentId);

      if (usersError && !usersError.message.includes('does not exist')) {
        console.error('Error updating users:', usersError);
        throw new Error(`Failed to update users: ${usersError.message}`);
      }

      // Step 2: Update child departments to remove parent reference
      console.log('Updating child departments...');
      const { error: childDeptsError } = await supabase
        .from('departments')
        .update({ parent_department_id: null })
        .eq('parent_department_id', departmentId);

      if (childDeptsError && !childDeptsError.message.includes('does not exist')) {
        console.error('Error updating child departments:', childDeptsError);
        throw new Error(`Failed to update child departments: ${childDeptsError.message}`);
      }

      // Step 3: Delete related tasks
      console.log('Deleting related tasks...');
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('department_id', departmentId);

      if (tasksError && !tasksError.message.includes('does not exist')) {
        console.error('Error deleting tasks:', tasksError);
        throw new Error(`Failed to delete tasks: ${tasksError.message}`);
      }

      // Step 4: Finally delete the department
      console.log('Deleting department record...');
      const { error } = await supabase
        .from(SUPABASE_TABLES.DEPARTMENTS)
        .delete()
        .eq('id', departmentId);

      if (error) {
        console.error('Error deleting department:', error);
        throw new Error(`Failed to delete department: ${error.message}`);
      }

      console.log('✅ Department and all related records deleted successfully');

    } catch (error) {
      console.error('Error in cascading delete:', error);
      throw error;
    }

    // Create audit log for department deletion
    try {
      await AuditLogger.logDepartmentDeletion(
        departmentId,
        currentData,
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for department deletion:', auditError);
      // Don't throw here to avoid breaking the main operation
    }
  }

  // Real-time subscription for departments
  static subscribeToDepartmentUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('department-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.DEPARTMENTS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .select('full_name, role, email, mobile, organization_id, department_id')
      .eq('auth_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: profile?.role || null,
      full_name: profile?.full_name || null,
      mobile: profile?.mobile || null,
      organization_id: profile?.organization_id || null,
      department_id: profile?.department_id || null,
    };
  }

  static async getUsers(organizationId?: number) {
    console.log('🔍 Fetching users from Supabase...');
    console.log('📊 Using table:', SUPABASE_TABLES.USERS);
    console.log('🏢 Organization filter:', organizationId);
    
    let query = supabase
      .from(SUPABASE_TABLES.USERS)
      .select(`
        id,
        full_name,
        email,
        mobile,
        email_verified_at,
        remember_token,
        department_id,
        employment_type_id,
        organization_id,
        status,
        metadata,
        created_at,
        updated_at,
        deleted_at,
        auth_id,
        role,
        password_hash,
        first_name,
        last_name,
        phone,
        is_active,
        last_login_at
      `);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }

    console.log('✅ Users fetched successfully:', data?.length || 0, 'users');
    console.log('📋 Raw data:', data);

    return data?.map(user => ({
      id: user.id.toString(),
      fullName: user.full_name,
      email: user.email,
      mobile: user.mobile,
      emailVerifiedAt: user.email_verified_at,
      rememberToken: user.remember_token,
      departmentId: user.department_id,
      employmentTypeId: user.employment_type_id,
      organizationId: user.organization_id,
      status: user.status,
      metadata: user.metadata,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at,
      authId: user.auth_id,
      role: user.role,
      passwordHash: user.password_hash,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at
    })) || [];
  }

  // =============================================================================
  // CASE MANAGEMENT (MAPPED TO CASES TABLE)
  // =============================================================================

  static async assignCaseToUser(caseId: string, userId: string) {
    console.log('Assigning case', caseId, 'to user', userId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({ 
        assigned_to: parseInt(userId),
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select();

    if (error) {
      console.error('Error assigning case:', error);
      throw new Error(`Failed to assign case: ${error.message}`);
    }

    return data?.[0];
  }

  // Create a new case (for managers)
  static async createCase(caseData: {
    organizationId: number;
    customerId: number;
    productId: number;
    title?: string;
    description?: string;
    priority?: string;
    assignedTo?: number;
    loanType?: string;
    loanAmount?: number;
  }) {
    console.log('Creating new case:', caseData);
    
    // Generate case number
    const caseNumber = `CASE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .insert({
        organization_id: caseData.organizationId,
        case_number: caseNumber,
        customer_id: caseData.customerId,
        product_id: caseData.productId,
        title: caseData.title || '',
        description: caseData.description || '',
        status: 'open',
        priority: caseData.priority || 'medium',
        assigned_to: caseData.assignedTo || null,
        loan_type: caseData.loanType || 'personal_loan',
        loan_amount: caseData.loanAmount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating case:', error);
      throw new Error(`Failed to create case: ${error.message}`);
    }

    return data?.[0];
  }

  // Update case details (for managers)
  static async updateCase(caseId: string, updates: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignedTo?: number;
    loanType?: string;
    loanAmount?: number;
  }) {
    console.log('Updating case:', caseId, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
    if (updates.loanType !== undefined) updateData.loan_type = updates.loanType;
    if (updates.loanAmount !== undefined) updateData.loan_amount = updates.loanAmount;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update(updateData)
      .eq('id', caseId)
      .select();

    if (error) {
      console.error('Error updating case:', error);
      throw new Error(`Failed to update case: ${error.message}`);
    }

    return data?.[0];
  }

  // Delete case (for managers)
  static async deleteCase(caseId: string) {
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

  static async getCases(filters?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    organizationId?: number;
  }) {
    console.log('Fetching cases with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.CASES)
      .select(`
        id,
        case_number,
        customer_id,
        product_id,
        title,
        description,
        status,
        priority,
        created_by,
        assigned_to,
        due_date,
        started_at,
        closed_at,
        tat_compliance,
        metadata,
        created_at,
        updated_at,
        loan_type,
        loan_amount,
        organization_id
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      // Map frontend status to database status
      const statusMap: Record<string, string> = {
        'in-progress': 'in_progress',
        'review': 'pending',
        'approved': 'closed',
        'rejected': 'cancelled',
      };
      query = query.eq('status', statusMap[filters.status] || filters.status);
    }
    if (filters?.assignedTo) {
      // Handle both auth_id (UUID) and direct user ID cases
      const isNumericId = /^\d+$/.test(filters.assignedTo);
      
      if (isNumericId) {
        // Direct database ID
        console.log('Using direct database ID for assignedTo filter:', filters.assignedTo);
        query = query.eq('assigned_to', parseInt(filters.assignedTo));
      } else {
        // Try to find by auth_id (for Supabase Auth users)
        console.log('Looking up user by auth_id for assignedTo filter:', filters.assignedTo);
        const { data: userData, error: authError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', filters.assignedTo)
          .single();
        
        if (authError) {
          console.log('Error finding user by auth_id for assignedTo:', authError.message);
        }
        
        if (userData?.id) {
          query = query.eq('assigned_to', userData.id);
        } else {
          // If no user found, return empty array
          console.log('No user found for assignedTo filter');
          return [];
        }
      }
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cases:', error);
      return [];
    }

    console.log('Found cases:', data?.length || 0);

    if (!data || data.length === 0) {
      console.log('No cases found in database');
      return [];
    }

    return data.map(case_ => {
      return {
        id: case_.id,
        caseNumber: case_.case_number || `CASE-${case_.id}`,
        customer: {
          id: case_.customer_id?.toString() || '',
          userId: case_.customer_id?.toString() || '',
          name: `Customer ${case_.customer_id || 'Unknown'}`,
          phone: '',
          email: '',
          panNumber: '',
          aadhaarNumber: '',
          dateOfBirth: '',
          gender: '',
          age: 0,
          maritalStatus: 'single',
          employment: 'salaried',
          riskProfile: 'low',
          kycStatus: 'pending',
          metadata: {},
          createdAt: case_.created_at,
          updatedAt: case_.updated_at,
        },
        assignedTo: case_.assigned_to?.toString() || '',
        status: mapCaseToLoanApplication(case_).status as "new" | "in-progress" | "review" | "approved" | "rejected",
        priority: mapCaseToLoanApplication(case_).priority as "low" | "medium" | "high",
        loanAmount: case_.loan_amount || 0,
        loanType: case_.loan_type || 'Personal Loan',
        createdAt: case_.created_at,
        updatedAt: case_.updated_at,
        documents: [], // Will be fetched separately
        whatsappMessages: [], // Will be fetched separately
        complianceLog: [], // Will be fetched separately
      };
    });
  }

  // Get customer details for a specific case
  static async getCustomerForCase(customerId: string) {
    console.log('Fetching customer details for ID:', customerId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .select(`
        id,
        user_id,
        pan_number,
        aadhaar_number,
        date_of_birth,
        kyc_status,
        risk_profile,
        monthly_income,
        employment_type,
        users!inner(
          id,
          first_name,
          last_name,
          email,
          mobile
        )
      `)
      .eq('id', customerId)
      .single();

    if (error) {
      console.error('Error fetching customer:', error);
      return null;
    }

    return data;
  }

  static async getCaseById(caseId: string) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .select(`
        id,
        case_number,
        customer_id,
        product_id,
        title,
        description,
        status,
        priority,
        created_by,
        assigned_to,
        due_date,
        started_at,
        closed_at,
        tat_compliance,
        metadata,
        created_at,
        updated_at,
        customers!inner(
          id,
          full_name,
          mobile,
          email,
          dob,
          address,
          kyc_status,
          metadata
        ),
        products!inner(
          id,
          name,
          code,
          description,
          metadata
        )
      `)
      .eq('id', caseId)
      .single();

    if (error) {
      console.error('Error fetching case:', error);
      return null;
    }

    const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers;
    const product = Array.isArray(data.products) ? data.products[0] : data.products;
    
    return {
      id: data.id,
      caseNumber: data.case_number,
      customer: {
        id: customer?.id || '',
        userId: customer?.id || '',
        name: customer?.full_name || '',
        phone: customer?.mobile || '',
        email: customer?.email || '',
        panNumber: customer?.metadata?.pan_number || '',
        aadhaarNumber: customer?.metadata?.aadhaar_number || '',
        dateOfBirth: customer?.dob || '',
        gender: customer?.metadata?.gender || '',
        age: customer?.dob ? Math.floor((Date.now() - new Date(customer.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
        maritalStatus: customer?.metadata?.marital_status || 'single',
        employment: customer?.metadata?.employment_type || 'salaried',
        riskProfile: customer?.metadata?.risk_profile || 'low',
        kycStatus: customer?.kyc_status || 'pending',
        metadata: customer?.metadata || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      assignedTo: data.assigned_to || '',
      status: mapCaseToLoanApplication(data).status as "new" | "in-progress" | "review" | "approved" | "rejected",
      priority: mapCaseToLoanApplication(data).priority as "low" | "medium" | "high",
      loanAmount: data.metadata?.requested_amount || 0,
      loanType: product?.name || 'Personal Loan',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      documents: [], // Will be fetched separately
      whatsappMessages: [], // Will be fetched separately
      complianceLog: [], // Will be fetched separately
    };
  }

  // =============================================================================
  // DOCUMENT MANAGEMENT
  // =============================================================================

  static async getDocuments(caseId?: string) {
    console.log('Fetching documents with caseId:', caseId);
    
    let query = supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .select(`
        id,
        organization_id,
        customer_id,
        document_type_id,
        file_id,
        status,
        uploaded_by,
        submitted_at,
        review_started_at,
        review_completed_at,
        verified_by,
        verified_on,
        expiry_date,
        metadata,
        created_at,
        updated_at,
        document_types!inner(
          id,
          name,
          category,
          description,
          is_required,
          priority
        ),
        customers!inner(
          id,
          full_name,
          email,
          mobile
        ),
        uploaded_user:users!documents_uploaded_by_fkey(
          id,
          full_name,
          email
        ),
        verified_user:users!documents_verified_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .order('submitted_at', { ascending: false });

    // Only filter by customer_id if provided and not empty
    if (caseId && caseId.trim() !== '') {
      query = query.eq('customer_id', caseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    console.log('Raw documents data:', data);

    return data?.map(doc => {
      const docType = Array.isArray(doc.document_types) ? doc.document_types[0] : doc.document_types;
      const customer = Array.isArray(doc.customers) ? doc.customers[0] : doc.customers;
      const uploadedUser = Array.isArray(doc.uploaded_user) ? doc.uploaded_user[0] : doc.uploaded_user;
      const verifiedUser = Array.isArray(doc.verified_user) ? doc.verified_user[0] : doc.verified_user;
      
      return {
        id: doc.id.toString(),
        organizationId: doc.organization_id,
        customerId: doc.customer_id,
        documentTypeId: doc.document_type_id,
        fileId: doc.file_id,
        status: doc.status,
        uploadedBy: doc.uploaded_by,
        submittedAt: doc.submitted_at,
        reviewStartedAt: doc.review_started_at,
        reviewCompletedAt: doc.review_completed_at,
        verifiedBy: doc.verified_by,
        verifiedOn: doc.verified_on,
        expiryDate: doc.expiry_date,
        metadata: doc.metadata,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        // Related data
        documentType: docType ? {
          id: docType.id,
          name: docType.name,
          category: docType.category,
          description: docType.description,
          isRequired: docType.is_required,
          priority: docType.priority
        } : null,
        customer: customer ? {
          id: customer.id,
          fullName: customer.full_name,
          email: customer.email,
          mobile: customer.mobile
        } : null,
        uploadedByUser: uploadedUser ? {
          id: uploadedUser.id,
          fullName: uploadedUser.full_name,
          email: uploadedUser.email
        } : null,
        verifiedByUser: verifiedUser ? {
          id: verifiedUser.id,
          fullName: verifiedUser.full_name,
          email: verifiedUser.email
        } : null
      };
    }) || [];
  }

  static async approveDocument(documentId: string, reviewedBy: string) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .update({
        status: 'verified',
        verified_on: new Date().toISOString(),
        verified_by: parseInt(reviewedBy),
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select();

    if (error) {
      console.error('Error approving document:', error);
      throw error;
    }

    return data?.[0];
  }

  static async rejectDocument(documentId: string, reason: string, reviewedBy: string) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .update({
        status: 'rejected',
        rejection_reason: reason,
        verified_on: new Date().toISOString(),
        verified_by: parseInt(reviewedBy),
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select();

    if (error) {
      console.error('Error rejecting document:', error);
      throw error;
    }

    return data?.[0];
  }

  // =============================================================================
  // DOCUMENT CRUD OPERATIONS
  // =============================================================================

  static async createDocument(documentData: {
    customer_id: string;
    document_type_id: string;
    file_id?: string;
    status?: string;
    uploaded_by?: string;
    submitted_at?: string;
    verified_by?: string;
    verified_on?: string;
    notes?: string;
  }) {
    console.log('Creating document:', documentData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .insert({
        customer_id: documentData.customer_id,
        document_type_id: documentData.document_type_id,
        file_id: documentData.file_id || null,
        status: documentData.status || 'pending',
        uploaded_by: documentData.uploaded_by || null,
        submitted_at: documentData.submitted_at || new Date().toISOString(),
        verified_by: documentData.verified_by || null,
        verified_on: documentData.verified_on || null,
        notes: documentData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating document:', error);
      throw new Error(`Failed to create document: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateDocument(documentId: string, updates: Partial<{
    customer_id: string;
    document_type_id: string;
    file_id: string;
    status: string;
    uploaded_by: string;
    submitted_at: string;
    verified_by: string;
    verified_on: string;
    notes: string;
  }>) {
    console.log('Updating document:', documentId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select();

    if (error) {
      console.error('Error updating document:', error);
      throw new Error(`Failed to update document: ${error.message}`);
    }

    return data?.[0];
  }

  static async deleteDocument(documentId: string) {
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

  // Real-time subscription for documents
  static subscribeToDocumentUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('document-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.DOCUMENTS },
        callback
      )
      .subscribe();
  }

  static async uploadDocument(
    caseId: string,
    documentTypeId: string,
    _fileName: string,
    _filePath: string,
    _fileSize: number,
    _fileType: string
  ) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .insert({
        customer_id: parseInt(caseId),
        document_type_id: parseInt(documentTypeId),
        status: 'pending',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error uploading document:', error);
      throw error;
    }

    return data?.[0];
  }

  static async getDocumentTypes() {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENT_TYPES)
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching document types:', error);
      return [];
    }

    return data || [];
  }

  // =============================================================================
  // WHATSAPP MESSAGES (MAPPED TO NOTIFICATIONS)
  // =============================================================================

  static async getWhatsAppMessages(caseId: string) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.NOTIFICATIONS)
      .select(`
        id,
        type,
        data,
        created_at
      `)
      .eq('type', 'whatsapp_message')
      .eq('data->>case_id', caseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }

    return data?.map(notification => ({
      id: notification.id,
      timestamp: notification.created_at,
      type: notification.data?.type || 'text',
      content: notification.data?.content || '',
      sender: notification.data?.sender || 'system',
      documentId: notification.data?.document_id,
    })) || [];
  }

  static async sendWhatsAppMessage(caseId: string, messageData: {
    content: string;
    type: 'text' | 'document' | 'template';
    sender: 'agent' | 'customer' | 'system';
    customerPhone?: string;
    documentId?: string;
  }) {
    console.log('Sending WhatsApp message:', messageData);
    
    try {
      // Store message in database
      const { data: notificationData, error: notificationError } = await supabase
        .from(SUPABASE_TABLES.NOTIFICATIONS)
        .insert({
          type: 'whatsapp_message',
          data: {
            case_id: caseId,
            content: messageData.content,
            type: messageData.type,
            sender: messageData.sender,
            customer_phone: messageData.customerPhone,
            document_id: messageData.documentId,
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        })
        .select();

      if (notificationError) {
        console.error('Error storing WhatsApp message:', notificationError);
        throw new Error(`Failed to store message: ${notificationError.message}`);
      }

      // In a real implementation, you would integrate with WhatsApp Business API here
      // For now, we'll simulate the API call
      if (messageData.sender === 'agent' && messageData.customerPhone) {
        console.log(`Simulating WhatsApp API call to ${messageData.customerPhone}:`, messageData.content);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Log the message sending for audit purposes
        await this.createAuditLog({
          userId: 'system', // This should be the actual user ID
          action: 'whatsapp_message_sent',
          resourceType: 'case',
          resourceId: caseId,
          details: `WhatsApp message sent to customer: ${messageData.content}`,
          metadata: {
            customer_phone: messageData.customerPhone,
            message_type: messageData.type
          }
        });
      }

      console.log('WhatsApp message sent successfully');
      return notificationData?.[0];
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  static async sendWhatsAppDocument(caseId: string, documentData: {
    documentId: string;
    customerPhone: string;
    message: string;
  }) {
    console.log('Sending WhatsApp document:', documentData);
    
    try {
      // Store document message in database
      const { data: notificationData, error: notificationError } = await supabase
        .from(SUPABASE_TABLES.NOTIFICATIONS)
        .insert({
          type: 'whatsapp_message',
          data: {
            case_id: caseId,
            content: documentData.message,
            type: 'document',
            sender: 'agent',
            customer_phone: documentData.customerPhone,
            document_id: documentData.documentId,
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        })
        .select();

      if (notificationError) {
        console.error('Error storing WhatsApp document message:', notificationError);
        throw new Error(`Failed to store document message: ${notificationError.message}`);
      }

      // In a real implementation, you would integrate with WhatsApp Business API here
      console.log(`Simulating WhatsApp document API call to ${documentData.customerPhone}:`, documentData.message);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the document sending for audit purposes
      await this.createAuditLog({
        userId: 'system', // This should be the actual user ID
        action: 'whatsapp_document_sent',
        resourceType: 'document',
        resourceId: documentData.documentId,
        details: `WhatsApp document sent to customer: ${documentData.message}`,
        metadata: {
          customer_phone: documentData.customerPhone,
          case_id: caseId
        }
      });

      console.log('WhatsApp document sent successfully');
      return notificationData?.[0];
    } catch (error) {
      console.error('Error sending WhatsApp document:', error);
      throw error;
    }
  }

  static subscribeToWhatsAppMessages(caseId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`whatsapp-messages-${caseId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: SUPABASE_TABLES.NOTIFICATIONS,
          filter: `type=eq.whatsapp_message`
        },
        (payload) => {
          // Only process messages for this specific case
          if ((payload.new as any)?.data?.case_id === caseId || (payload.old as any)?.data?.case_id === caseId) {
            callback(payload);
          }
        }
      )
      .subscribe();
  }

  // =============================================================================
  // COMPLIANCE LOGS (MAPPED TO LOGS)
  // =============================================================================

  static async getComplianceLogs(caseId: string) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LOGS)
      .select(`
        id,
        action,
        description,
        metadata,
        created_at,
        users!inner(
          id,
          full_name
        )
      `)
      .eq('entity_type', 'case')
      .eq('entity_id', caseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching compliance logs:', error);
      return [];
    }

    return data?.map(log => {
      const user = Array.isArray(log.users) ? log.users[0] : log.users;
      
      return {
        id: log.id,
        timestamp: log.created_at,
        action: log.action,
        user: user?.full_name || 'System',
        details: log.description,
        type: log.metadata?.log_type || 'info',
      };
    }) || [];
  }

  // =============================================================================
  // DASHBOARD STATISTICS
  // =============================================================================

  static async getDashboardStats(userId: string, role: string) {
    const stats = {
      totalCases: 0,
      activeCases: 0,
      completedToday: 0,
      pendingDocuments: 0,
      overdueTasks: 0,
      approvalRate: 0,
      teamEfficiency: 0,
      totalUsers: 0,
      systemHealth: 99.8,
      securityAlerts: 0,
      revenue: 0,
      complianceScore: 98.5,
    };

    try {
      console.log('Fetching dashboard stats for user:', userId, 'role:', role);

      // Get all cases first (don't filter by user for now to get overall stats)
      const { data: allCases, error: allCasesError } = await supabase
        .from(SUPABASE_TABLES.CASES)
        .select('id, status, created_at, updated_at, assigned_to, metadata');

      if (allCasesError) {
        console.error('Error fetching cases:', allCasesError);
      } else if (allCases) {
        console.log('Found cases:', allCases.length);
        stats.totalCases = allCases.length;
        stats.activeCases = allCases.filter(c => c.status === 'in_progress').length;
        
        const today = new Date().toISOString().split('T')[0];
        stats.completedToday = allCases.filter(c => 
          c.status === 'closed' && c.updated_at?.startsWith(today)
        ).length;

        // Calculate approval rate
        const approved = allCases.filter(c => c.status === 'closed').length;
        stats.approvalRate = allCases.length > 0 ? (approved / allCases.length) * 100 : 0;

        // Calculate revenue from metadata
        stats.revenue = allCases
          .filter(c => c.status === 'closed' && c.metadata?.requested_amount)
          .reduce((sum, c) => sum + (c.metadata.requested_amount || 0), 0);
      }

      // Get user count
      const { data: users, error: usersError } = await supabase
        .from(SUPABASE_TABLES.USERS)
        .select('id')
        .eq('status', 'active');

      if (!usersError && users) {
        stats.totalUsers = users.length;
      }

      // Get pending documents
      const { data: pendingDocs, error: pendingDocsError } = await supabase
        .from(SUPABASE_TABLES.DOCUMENTS)
        .select('id, status')
        .eq('status', 'pending');

      if (!pendingDocsError && pendingDocs) {
        stats.pendingDocuments = pendingDocs.length;
      }

      // Get overdue tasks
      const { data: overdueTasks, error: overdueTasksError } = await supabase
        .from(SUPABASE_TABLES.TASKS)
        .select('id')
        .lt('due_date', new Date().toISOString())
        .in('status', ['open', 'in_progress']);

      if (!overdueTasksError && overdueTasks) {
        stats.overdueTasks = overdueTasks.length;
      }

      // Get security alerts (failed login attempts, etc.)
      const { data: securityLogs, error: securityError } = await supabase
        .from(SUPABASE_TABLES.LOGS)
        .select('id')
        .in('action', ['failed_login', 'suspicious_activity', 'security_violation'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!securityError && securityLogs) {
        stats.securityAlerts = securityLogs.length;
      }


      // Calculate team efficiency (placeholder calculation)
      stats.teamEfficiency = stats.approvalRate > 0 ? Math.min(stats.approvalRate + 10, 100) : 85;

      console.log('Dashboard stats calculated:', stats);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }

    return stats;
  }

  // =============================================================================
  // ADMIN DASHBOARD SPECIFIC METHODS
  // =============================================================================

  static async getAdminDashboardStats() {
    const stats = {
      totalUsers: 0,
      totalCases: 0,
      activeCases: 0,
      completedToday: 0,
      pendingDocuments: 0,
      overdueTasks: 0,
      approvalRate: 0,
      revenue: 0,
      systemHealth: 99.8,
      securityAlerts: 0,
      complianceScore: 98.5,
      teamEfficiency: 95.2,
    };

    try {
      // Get comprehensive stats for admin dashboard
      const [usersResult, casesResult, documentsResult, tasksResult, logsResult] = await Promise.all([
        supabase.from(SUPABASE_TABLES.USERS).select('id, status').eq('status', 'active'),
        supabase.from(SUPABASE_TABLES.CASES).select('id, status, created_at, updated_at, metadata'),
        supabase.from(SUPABASE_TABLES.DOCUMENTS).select('id, status'),
        supabase.from(SUPABASE_TABLES.TASKS).select('id, due_date, status').lt('due_date', new Date().toISOString()).in('status', ['open', 'in_progress']),
        supabase.from(SUPABASE_TABLES.LOGS).select('id').in('action', ['failed_login', 'suspicious_activity']).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (!usersResult.error && usersResult.data) {
        stats.totalUsers = usersResult.data.length;
      }

      if (!casesResult.error && casesResult.data) {
        const cases = casesResult.data;
        stats.totalCases = cases.length;
        stats.activeCases = cases.filter(c => c.status === 'in_progress').length;
        
        const today = new Date().toISOString().split('T')[0];
        stats.completedToday = cases.filter(c => 
          c.status === 'closed' && c.updated_at?.startsWith(today)
        ).length;

        const approved = cases.filter(c => c.status === 'closed').length;
        stats.approvalRate = cases.length > 0 ? (approved / cases.length) * 100 : 0;

        stats.revenue = cases
          .filter(c => c.status === 'closed' && c.metadata?.requested_amount)
          .reduce((sum, c) => sum + (c.metadata.requested_amount || 0), 0);
      }

      if (!documentsResult.error && documentsResult.data) {
        stats.pendingDocuments = documentsResult.data.filter(d => d.status === 'pending').length;
      }

      if (!tasksResult.error && tasksResult.data) {
        stats.overdueTasks = tasksResult.data.length;
      }

      if (!logsResult.error && logsResult.data) {
        stats.securityAlerts = logsResult.data.length;
      }

    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
    }

    return stats;
  }

  static async getDepartmentPerformance() {
    try {
      const { data: departments, error: deptError } = await supabase
        .from(SUPABASE_TABLES.DEPARTMENTS)
        .select(`
          id,
          name,
          users!inner(
            id,
            full_name,
            role
          )
        `);

      if (deptError) {
        console.error('Error fetching departments:', deptError);
        return [];
      }

      const performance = [];

      for (const dept of departments || []) {
        const users = Array.isArray(dept.users) ? dept.users : [dept.users];
        const userIds = users.map((u: any) => u.id);
        
        // Get cases for this department
        const { data: deptCases } = await supabase
          .from(SUPABASE_TABLES.CASES)
          .select('id, status, created_at, metadata')
          .in('assigned_to', userIds);

        const cases = deptCases || [];
        const activeCases = cases.filter(c => c.status === 'in_progress').length;
        const completedCases = cases.filter(c => c.status === 'closed').length;
        const completionRate = cases.length > 0 ? (completedCases / cases.length) * 100 : 0;

        // Calculate revenue
        const revenue = cases
          .filter(c => c.status === 'closed' && c.metadata?.requested_amount)
          .reduce((sum, c) => sum + (c.metadata.requested_amount || 0), 0);

        performance.push({
          department: dept.name,
          members: users.length,
          activeCases,
          completionRate: `${completionRate.toFixed(1)}%`,
          revenue: `₹${(revenue / 10000000).toFixed(1)}Cr`, // Convert to crores
          efficiency: `${(completionRate * 0.95).toFixed(1)}%`, // Slightly lower than completion rate
          topPerformer: users[0]?.full_name || 'N/A'
        });
      }

      return performance;
    } catch (error) {
      console.error('Error fetching department performance:', error);
      return [];
    }
  }

  static async getSystemAlerts() {
    try {
      const { data: alerts, error } = await supabase
        .from(SUPABASE_TABLES.LOGS)
        .select(`
          id,
          action,
          description,
          metadata,
          created_at
        `)
        .in('action', ['failed_login', 'suspicious_activity', 'security_violation', 'system_error', 'performance_issue'])
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching system alerts:', error);
        return [];
      }

      return (alerts || []).map(alert => ({
        id: alert.id,
        type: this.mapAlertType(alert.action),
        severity: this.mapAlertSeverity(alert.action),
        title: this.mapAlertTitle(alert.action),
        description: alert.description || this.mapAlertDescription(alert.action),
        timestamp: alert.created_at,
        status: this.mapAlertStatus(alert.action)
      }));
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      return [];
    }
  }

  static async getRecentActivities() {
    try {
      const { data: activities, error } = await supabase
        .from(SUPABASE_TABLES.LOGS)
        .select(`
          id,
          action,
          description,
          metadata,
          created_at,
          users!inner(
            id,
            full_name
          )
        `)
        .in('action', ['case_created', 'case_updated', 'document_uploaded', 'user_created', 'approval_given', 'compliance_check'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }

      return (activities || []).map(activity => {
        const user = Array.isArray(activity.users) ? activity.users[0] : activity.users;
        return {
          id: activity.id,
          user: user?.full_name || 'System',
          action: this.mapActivityAction(activity.action),
          details: activity.description || this.mapActivityDetails(activity.action),
          timestamp: activity.created_at,
          type: this.mapActivityType(activity.action)
        };
      });
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Helper methods for mapping data
  static mapAlertType(action: string): string {
    const typeMap: Record<string, string> = {
      'failed_login': 'security',
      'suspicious_activity': 'security',
      'security_violation': 'security',
      'system_error': 'performance',
      'performance_issue': 'performance'
    };
    return typeMap[action] || 'system';
  }

  static mapAlertSeverity(action: string): string {
    const severityMap: Record<string, string> = {
      'failed_login': 'medium',
      'suspicious_activity': 'high',
      'security_violation': 'high',
      'system_error': 'medium',
      'performance_issue': 'low'
    };
    return severityMap[action] || 'low';
  }

  static mapAlertTitle(action: string): string {
    const titleMap: Record<string, string> = {
      'failed_login': 'Multiple failed login attempts detected',
      'suspicious_activity': 'Suspicious activity detected',
      'security_violation': 'Security violation occurred',
      'system_error': 'System error reported',
      'performance_issue': 'Performance degradation detected'
    };
    return titleMap[action] || 'System notification';
  }

  static mapAlertDescription(action: string): string {
    const descMap: Record<string, string> = {
      'failed_login': 'Multiple failed login attempts from unknown source',
      'suspicious_activity': 'Unusual system activity patterns detected',
      'security_violation': 'Potential security breach attempt',
      'system_error': 'Internal system error requiring attention',
      'performance_issue': 'System performance below optimal levels'
    };
    return descMap[action] || 'System notification';
  }

  static mapAlertStatus(action: string): string {
    const statusMap: Record<string, string> = {
      'failed_login': 'investigating',
      'suspicious_activity': 'investigating',
      'security_violation': 'action_required',
      'system_error': 'monitoring',
      'performance_issue': 'monitoring'
    };
    return statusMap[action] || 'monitoring';
  }

  static mapActivityAction(action: string): string {
    const actionMap: Record<string, string> = {
      'case_created': 'Created new case',
      'case_updated': 'Updated case',
      'document_uploaded': 'Uploaded document',
      'user_created': 'Created new user account',
      'approval_given': 'Approved loan application',
      'compliance_check': 'Performed compliance check'
    };
    return actionMap[action] || 'System action';
  }

  static mapActivityDetails(action: string): string {
    const detailsMap: Record<string, string> = {
      'case_created': 'New loan application case created',
      'case_updated': 'Case status or details updated',
      'document_uploaded': 'New document uploaded to case',
      'user_created': 'New user account created in system',
      'approval_given': 'Loan application approved for processing',
      'compliance_check': 'Compliance verification completed'
    };
    return detailsMap[action] || 'System activity performed';
  }

  static mapActivityType(action: string): string {
    const typeMap: Record<string, string> = {
      'case_created': 'case_management',
      'case_updated': 'case_management',
      'document_uploaded': 'document_management',
      'user_created': 'user_management',
      'approval_given': 'approval',
      'compliance_check': 'compliance'
    };
    return typeMap[action] || 'system';
  }

  // =============================================================================
  // REAL-TIME SUBSCRIPTIONS FOR ADMIN DASHBOARD
  // =============================================================================

  static subscribeToAdminDashboard(callback: (payload: any) => void) {
    return supabase
      .channel('admin-dashboard-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cases' 
        }, 
        callback
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users' 
        }, 
        callback
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'logs' 
        }, 
        callback
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks' 
        }, 
        callback
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'documents' 
        }, 
        callback
      )
      .subscribe();
  }

  static subscribeToSystemAlerts(callback: (payload: any) => void) {
    return supabase
      .channel('system-alerts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'logs',
          filter: 'action=in.(failed_login,suspicious_activity,security_violation,system_error,performance_issue)'
        }, 
        callback
      )
      .subscribe();
  }

  static subscribeToRecentActivities(callback: (payload: any) => void) {
    return supabase
      .channel('recent-activities')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'logs',
          filter: 'action=in.(case_created,case_updated,document_uploaded,user_created,approval_given,compliance_check)'
        }, 
        callback
      )
      .subscribe();
  }


  // =============================================================================
  // WORKLOAD PLANNING (MAPPED TO TASKS)
  // =============================================================================

  static async getWorkloadTasks(userId: string) {
    // Handle both auth_id (UUID) and direct user ID cases
    let internalUserId: string | null = null;
    
    // Return empty array if no userId provided
    if (!userId || userId.trim() === '') {
      console.log('No userId provided for workload tasks');
      return [];
    }
    
    // Check if userId is a number (database ID) or UUID (auth_id)
    const isNumericId = /^\d+$/.test(userId);
    
    if (isNumericId) {
      // Direct database ID (like super admin)
      console.log('Using direct database ID for workload tasks:', userId);
      internalUserId = userId;
    } else {
      // Try to find by auth_id (for Supabase Auth users)
      console.log('Looking up user by auth_id for workload tasks:', userId);
      const { data: userByAuthId, error: authError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', userId)
        .single();

      if (authError) {
        console.log('Error finding user by auth_id:', authError.message);
      }

      if (userByAuthId?.id) {
        internalUserId = userByAuthId.id.toString();
      }
    }

    if (!internalUserId) {
      console.log('User not found for userId:', userId);
      return [];
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASKS)
      .select(`
        id,
        title,
        description,
        priority,
        status,
        due_date,
        assigned_to,
        created_at,
        metadata
      `)
      .eq('assigned_to', internalUserId)
      .eq('status', 'open')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching workload tasks:', error);
      return [];
    }

    return data?.map(task => ({
      id: task.id,
      time: task.due_date ? new Date(task.due_date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }) : '09:00',
      customer: task.metadata?.customer_name || 'Unknown',
      phone: task.metadata?.customer_phone || '',
      task: task.title,
      priority: mapTaskPriority(task.priority),
      type: 'follow-up' as const,
    })) || [];
  }

  // =============================================================================
  // TASK CRUD OPERATIONS
  // =============================================================================

  static async getTasks(filters?: {
    assigned_to?: string;
    status?: string;
    priority?: string;
    due_date_from?: string;
    due_date_to?: string;
  }) {
    console.log('Fetching tasks with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.TASKS)
      .select(`
        id,
        title,
        description,
        priority,
        status,
        due_date,
        assigned_to,
        created_by,
        case_id,
        customer_id,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.due_date_from) {
      query = query.gte('due_date', filters.due_date_from);
    }
    if (filters?.due_date_to) {
      query = query.lte('due_date', filters.due_date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data || [];
  }

  static async createTask(taskData: {
    title: string;
    description?: string;
    priority: string;
    status?: string;
    due_date?: string;
    assigned_to?: string;
    created_by?: string;
    case_id?: string;
    customer_id?: string;
    metadata?: any;
  }) {
    console.log('Creating task:', taskData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASKS)
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority,
        status: taskData.status || 'open',
        due_date: taskData.due_date || null,
        assigned_to: taskData.assigned_to || null,
        created_by: taskData.created_by || null,
        case_id: taskData.case_id || null,
        customer_id: taskData.customer_id || null,
        metadata: taskData.metadata || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateTask(taskId: string, updates: Partial<{
    title: string;
    description: string;
    priority: string;
    status: string;
    due_date: string;
    assigned_to: string;
    created_by: string;
    case_id: string;
    customer_id: string;
    metadata: any;
  }>) {
    console.log('Updating task:', taskId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASKS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select();

    if (error) {
      console.error('Error updating task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return data?.[0];
  }

  static async deleteTask(taskId: string) {
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

  // Real-time subscription for tasks
  static subscribeToTaskUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('task-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.TASKS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // APPROVAL QUEUE (MAPPED TO CASES)
  // =============================================================================

  static async getApprovalQueue() {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .select(`
        id,
        case_number,
        status,
        priority,
        metadata,
        created_at,
        customers!inner(
          id,
          full_name,
          mobile,
          metadata
        ),
        products!inner(
          id,
          name
        ),
        users!assigned_to(
          id,
          full_name
        )
      `)
      .in('status', ['new', 'in-progress', 'review'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching approval queue:', error);
      return [];
    }

    return data?.map(case_ => {
      const customer = Array.isArray(case_.customers) ? case_.customers[0] : case_.customers;
      const product = Array.isArray(case_.products) ? case_.products[0] : case_.products;
      const user = Array.isArray(case_.users) ? case_.users[0] : case_.users;
      
      return {
        id: case_.id,
        customer: customer?.full_name || '',
        phone: customer?.mobile || '',
        loanType: product?.name || '',
        amount: `₹${((case_.metadata?.requested_amount || 0) / 100000).toFixed(0)}L`,
        risk: customer?.metadata?.risk_profile || 'low',
        completeness: 85, // Calculate based on document completeness
        waitTime: this.calculateWaitTime(case_.created_at),
        flags: [], // Calculate based on missing documents or issues
        priority: case_.priority,
        submittedBy: user?.full_name || 'Unknown',
      };
    }) || [];
  }

  // =============================================================================
  // TEAM OVERSIGHT (MAPPED TO USERS)
  // =============================================================================

  static async getTeamMembers() {
    console.log('Fetching team members...');
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .select(`
        id,
        full_name,
        email,
        mobile,
        role,
        status,
        created_at,
        updated_at,
        metadata
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

    console.log('Found users:', data?.length || 0);

    // If no users found, return empty array
    if (!data || data.length === 0) {
      console.log('No users found in database');
      return [];
    }

    // Get performance data for each team member
    const teamMembers = await Promise.all(
      data.map(async (member) => {
        const { data: cases } = await supabase
          .from(SUPABASE_TABLES.CASES)
          .select('id, status, created_at, updated_at')
          .eq('assigned_to', member.id);

        const activeCases = cases?.filter(c => c.status === 'in_progress').length || 0;
        const completedThisMonth = cases?.filter(c => 
          c.status === 'closed' && 
          new Date(c.updated_at).getMonth() === new Date().getMonth()
        ).length || 0;

        return {
          id: member.id,
          name: member.full_name || 'Unknown User',
          email: member.email || '',
          phone: member.mobile || '',
          role: member.role || 'user',
          status: member.status || 'active',
          created_at: member.created_at,
          cases: activeCases,
          capacity: 10, // Default capacity
          efficiency: '85%', // Calculate based on performance
          specialization: 'Home Loans', // Get from user profile
          completedThisMonth,
          avgProcessingTime: '2.1 days', // Calculate from actual data
          customerSatisfaction: '4.8/5', // Get from feedback
          revenue: '₹2.4Cr', // Calculate from approved loans
        };
      })
    );

    console.log('Team members processed:', teamMembers.length);
    return teamMembers;
  }

  // =============================================================================
  // AUDIT LOGS
  // =============================================================================

  static async getAuditLogs(filters?: {
    searchTerm?: string;
    type?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    console.log('Fetching audit logs with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.LOGS)
      .select(`
        id,
        organization_id,
        user_id,
        action,
        entity_type,
        entity_id,
        description,
        log_type,
        metadata,
        ip_address,
        user_agent,
        created_at,
        updated_at,
        users(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('entity_type', filters.type);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    console.log('Found audit logs:', data?.length || 0);

    // Transform data to match the component's expected format
    const auditLogs = data?.map(log => {
      const user = Array.isArray(log.users) ? log.users[0] : log.users;
      
      // Map entity_type to component's type field
      const typeMap: Record<string, string> = {
        'user': 'user_management',
        'case': 'case_management',
        'document': 'document_access',
        'task': 'task_management',
        'system': 'system',
        'security': 'security',
        'compliance': 'compliance'
      };

      // Map action to severity based on common patterns
      const getSeverity = (action: string): string => {
        if (action.includes('failed') || action.includes('error') || action.includes('violation')) {
          return 'high';
        }
        if (action.includes('warning') || action.includes('suspicious')) {
          return 'medium';
        }
        if (action.includes('login') || action.includes('logout') || action.includes('view')) {
          return 'info';
        }
        return 'info';
      };

      return {
        id: `audit-${log.id}`,
        timestamp: log.created_at,
        user: user?.full_name || 'System',
        action: this.mapAuditAction(log.action),
        details: log.description || this.mapAuditDetails(log.action, log.entity_type, log.entity_id),
        type: typeMap[log.entity_type] || 'system',
        severity: log.log_type === 'error' ? 'high' : log.log_type === 'warning' ? 'medium' : getSeverity(log.action),
        ipAddress: log.ip_address || 'Unknown',
        userAgent: log.user_agent || 'Unknown',
        oldValues: log.metadata?.old_values || null,
        newValues: log.metadata?.new_values || null,
        resourceType: log.entity_type,
        resourceId: log.entity_id,
        sessionId: log.metadata?.session_id || 'Unknown',
        duration: log.metadata?.duration || 0
      };
    }) || [];

    // Apply client-side filtering for search term and severity
    let filteredLogs = auditLogs;

    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.user.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.severity && filters.severity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    return filteredLogs;
  }

  static async getAuditLogStats() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [totalLogsResult, securityEventsResult, userActionsResult, systemEventsResult] = await Promise.all([
        supabase
          .from(SUPABASE_TABLES.LOGS)
          .select('id', { count: 'exact' })
          .gte('created_at', today),
        supabase
          .from(SUPABASE_TABLES.LOGS)
          .select('id', { count: 'exact' })
          .in('action', ['failed_login', 'suspicious_activity', 'security_violation'])
          .gte('created_at', today),
        supabase
          .from(SUPABASE_TABLES.LOGS)
          .select('id', { count: 'exact' })
          .in('entity_type', ['user', 'case', 'document'])
          .gte('created_at', today),
        supabase
          .from(SUPABASE_TABLES.LOGS)
          .select('id', { count: 'exact' })
          .eq('entity_type', 'system')
          .gte('created_at', today)
      ]);

      return {
        totalLogsToday: totalLogsResult.count || 0,
        securityEvents: securityEventsResult.count || 0,
        userActions: userActionsResult.count || 0,
        systemEvents: systemEventsResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching audit log stats:', error);
      return {
        totalLogsToday: 0,
        securityEvents: 0,
        userActions: 0,
        systemEvents: 0
      };
    }
  }

  static subscribeToAuditLogsLegacy(callback: (payload: any) => void) {
    return supabase
      .channel('audit-logs')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: SUPABASE_TABLES.LOGS 
        }, 
        callback
      )
      .subscribe();
  }

  // Helper methods for mapping audit data
  private static mapAuditAction(action: string): string {
    const actionMap: Record<string, string> = {
      'login': 'User Login',
      'logout': 'User Logout',
      'failed_login': 'Failed Login Attempt',
      'user_created': 'User Account Created',
      'user_updated': 'User Account Updated',
      'user_deleted': 'User Account Deleted',
      'case_created': 'Case Created',
      'case_updated': 'Case Status Update',
      'case_deleted': 'Case Deleted',
      'document_uploaded': 'Document Uploaded',
      'document_accessed': 'Document Access',
      'document_verified': 'Document Verified',
      'document_rejected': 'Document Rejected',
      'permission_granted': 'Permission Granted',
      'permission_revoked': 'Permission Revoked',
      'system_backup': 'Data Backup',
      'system_restore': 'System Restore',
      'compliance_check': 'Compliance Check',
      'suspicious_activity': 'Suspicious Activity Detected',
      'security_violation': 'Security Violation',
      'data_export': 'Data Export',
      'data_import': 'Data Import'
    };
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private static mapAuditDetails(action: string, resourceType: string, resourceId: number): string {
    const detailsMap: Record<string, string> = {
      'login': 'User successfully logged into the system',
      'logout': 'User logged out of the system',
      'failed_login': 'Multiple failed login attempts from external IP',
      'user_created': 'Created new user account in the system',
      'user_updated': 'Updated user account information',
      'user_deleted': 'Deleted user account from the system',
      'case_created': 'Created new loan application case',
      'case_updated': 'Updated case status or details',
      'case_deleted': 'Deleted case from the system',
      'document_uploaded': 'Uploaded new document to case',
      'document_accessed': 'Accessed document for review',
      'document_verified': 'Document verification completed',
      'document_rejected': 'Document rejected due to quality issues',
      'permission_granted': 'Granted additional permissions to user',
      'permission_revoked': 'Revoked permissions from user',
      'system_backup': 'Automated daily backup completed successfully',
      'system_restore': 'System restore operation completed',
      'compliance_check': 'Automated compliance verification completed',
      'suspicious_activity': 'Unusual system activity patterns detected',
      'security_violation': 'Potential security breach attempt',
      'data_export': 'Exported data from the system',
      'data_import': 'Imported data into the system'
    };

    const baseDetail = detailsMap[action] || `Action performed: ${action}`;
    
    if (resourceType && resourceId) {
      return `${baseDetail} for ${resourceType} ID: ${resourceId}`;
    }
    
    return baseDetail;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // =============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================================================

  static subscribeToCases(callback: (payload: any) => void) {
    return supabase
      .channel('cases')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CASES },
        callback
      )
      .subscribe();
  }

  static subscribeToDocuments(caseId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`documents-${caseId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: SUPABASE_TABLES.DOCUMENTS, filter: `customer_id=eq.${caseId}` },
        callback
      )
      .subscribe();
  }

  static subscribeToMessages(caseId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages-${caseId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: SUPABASE_TABLES.NOTIFICATIONS, filter: `data->>case_id=eq.${caseId}` },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // ROLES MANAGEMENT
  // =============================================================================

  static async getRoles(filters?: { isActive?: boolean }) {
    console.log('Fetching roles with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.ROLES)
      .select(`
        id,
        name,
        description,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data?.map(role => mapRoleData(role)) || [];
  }

  static async createRole(roleData: {
    name: string;
    description: string;
    permissions: string[];
  }) {
    console.log('Creating role:', roleData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ROLES)
      .insert({
        ...roleData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating role:', error);
      throw new Error(`Failed to create role: ${error.message}`);
    }

    return mapRoleData(data?.[0]);
  }

  static async updateRole(roleId: string, updates: Partial<{
    name: string;
    description: string;
    permissions: string[];
    isActive: boolean;
  }>) {
    console.log('Updating role:', roleId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ROLES)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', roleId)
      .select();

    if (error) {
      console.error('Error updating role:', error);
      throw new Error(`Failed to update role: ${error.message}`);
    }

    return mapRoleData(data?.[0]);
  }

  static async deleteRole(roleId: string) {
    console.log('Deleting role:', roleId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.ROLES)
      .delete()
      .eq('id', roleId);

    if (error) {
      console.error('Error deleting role:', error);
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  static subscribeToRoles(callback: (payload: any) => void) {
    return supabase
      .channel('roles-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.ROLES },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PERMISSIONS MANAGEMENT
  // =============================================================================

  static async getPermissions(filters?: { resource?: string; action?: string; isActive?: boolean }) {
    console.log('Fetching permissions with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.PERMISSIONS)
      .select(`
        id,
        name,
        description,
        resource,
        action,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.resource) {
      query = query.eq('resource', filters.resource);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }

    return data?.map(permission => mapPermissionData(permission)) || [];
  }

  static async createPermission(permissionData: {
    name: string;
    description: string;
    resource: string;
    action: string;
  }) {
    console.log('Creating permission:', permissionData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PERMISSIONS)
      .insert({
        ...permissionData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating permission:', error);
      throw new Error(`Failed to create permission: ${error.message}`);
    }

    return mapPermissionData(data?.[0]);
  }

  static async updatePermission(permissionId: string, updates: Partial<{
    name: string;
    description: string;
    resource: string;
    action: string;
    isActive: boolean;
  }>) {
    console.log('Updating permission:', permissionId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PERMISSIONS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', permissionId)
      .select();

    if (error) {
      console.error('Error updating permission:', error);
      throw new Error(`Failed to update permission: ${error.message}`);
    }

    return mapPermissionData(data?.[0]);
  }

  static async deletePermission(permissionId: string) {
    console.log('Deleting permission:', permissionId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.PERMISSIONS)
      .delete()
      .eq('id', permissionId);

    if (error) {
      console.error('Error deleting permission:', error);
      throw new Error(`Failed to delete permission: ${error.message}`);
    }
  }

  static subscribeToPermissions(callback: (payload: any) => void) {
    return supabase
      .channel('permissions-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.PERMISSIONS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // AUDIT LOGS MANAGEMENT
  // =============================================================================

  static async getAuditLogsDetailed(filters?: {
    userId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    console.log('Fetching detailed audit logs with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.AUDIT_LOG)
      .select(`
        id,
        organization_id,
        user_id,
        action,
        entity_type,
        entity_id,
        description,
        log_type,
        metadata,
        ip_address,
        user_agent,
        created_at,
        updated_at,
        users(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.resourceType) {
      query = query.eq('entity_type', filters.resourceType);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data?.map(log => {
      const user = Array.isArray(log.users) ? log.users[0] : log.users;
      return {
        ...mapAuditLogData(log),
        userName: user?.full_name || 'Unknown User',
        userEmail: user?.email || ''
      };
    }) || [];
  }

  static async createAuditLog(auditLogData: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    console.log('Creating audit log:', auditLogData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.AUDIT_LOG)
      .insert({
        user_id: auditLogData.userId,
        action: auditLogData.action,
        entity_type: auditLogData.resourceType,
        entity_id: auditLogData.resourceId,
        description: auditLogData.details,
        log_type: 'info',
        ip_address: auditLogData.ipAddress,
        user_agent: auditLogData.userAgent,
        metadata: auditLogData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating audit log:', error);
      throw new Error(`Failed to create audit log: ${error.message}`);
    }

    return mapAuditLogData(data?.[0]);
  }

  static subscribeToAuditLogsNew(callback: (payload: any) => void) {
    return supabase
      .channel('audit-logs-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.AUDIT_LOG },
        callback
      )
      .subscribe();
  }

  static subscribeToAuditLogs(callback: (payload: any) => void) {
    return supabase
      .channel('audit-logs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.AUDIT_LOG },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PRODUCTS MANAGEMENT
  // =============================================================================

  static async getProducts(filters?: { category?: string; isActive?: boolean }) {
    console.log('Fetching products with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.PRODUCTS)
      .select(`
        id,
        name,
        code,
        description,
        category,
        interest_rate,
        min_amount,
        max_amount,
        min_tenure,
        max_tenure,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data?.map(product => mapProductData(product)) || [];
  }

  static async createProduct(productData: {
    name: string;
    code: string;
    description: string;
    category: string;
    interestRate: number;
    minAmount: number;
    maxAmount: number;
    minTenure: number;
    maxTenure: number;
    metadata?: any;
  }) {
    console.log('Creating product:', productData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PRODUCTS)
      .insert({
        name: productData.name,
        code: productData.code,
        description: productData.description,
        category: productData.category,
        interest_rate: productData.interestRate,
        min_amount: productData.minAmount,
        max_amount: productData.maxAmount,
        min_tenure: productData.minTenure,
        max_tenure: productData.maxTenure,
        is_active: true,
        metadata: productData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return mapProductData(data?.[0]);
  }

  static async updateProduct(productId: string, updates: Partial<{
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
    metadata: any;
  }>) {
    console.log('Updating product:', productId, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.code) updateData.code = updates.code;
    if (updates.description) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category;
    if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate;
    if (updates.minAmount !== undefined) updateData.min_amount = updates.minAmount;
    if (updates.maxAmount !== undefined) updateData.max_amount = updates.maxAmount;
    if (updates.minTenure !== undefined) updateData.min_tenure = updates.minTenure;
    if (updates.maxTenure !== undefined) updateData.max_tenure = updates.maxTenure;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PRODUCTS)
      .update(updateData)
      .eq('id', productId)
      .select();

    if (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return mapProductData(data?.[0]);
  }

  static async deleteProduct(productId: string) {
    console.log('Deleting product:', productId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.PRODUCTS)
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  static subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel('products-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.PRODUCTS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // SUB PRODUCTS MANAGEMENT
  // =============================================================================

  static async getSubProducts(filters?: { productId?: string }) {
    console.log('Fetching sub products with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.SUB_PRODUCTS)
      .select(`
        id,
        product_id,
        name,
        code,
        description,
        status,
        metadata,
        organization_id,
        created_at,
        updated_at,
        products!inner(
          id,
          name,
          code
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.productId) {
      query = query.eq('product_id', filters.productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sub products:', error);
      return [];
    }

    return data?.map(subProduct => {
      const product = Array.isArray(subProduct.products) ? subProduct.products[0] : subProduct.products;
      return {
        ...mapSubProductData(subProduct),
        productName: product?.name || '',
        productCode: product?.code || ''
      };
    }) || [];
  }

  static async createSubProduct(subProductData: {
    productId: string;
    name: string;
    code: string;
    description: string;
    status?: string;
    metadata?: any;
    organizationId?: number;
  }) {
    console.log('Creating sub product:', subProductData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SUB_PRODUCTS)
      .insert({
        product_id: subProductData.productId,
        name: subProductData.name,
        code: subProductData.code,
        description: subProductData.description,
        status: subProductData.status || 'active',
        metadata: subProductData.metadata,
        organization_id: subProductData.organizationId || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating sub product:', error);
      throw new Error(`Failed to create sub product: ${error.message}`);
    }

    return mapSubProductData(data?.[0]);
  }

  static async updateSubProduct(subProductId: string, updates: Partial<{
    name: string;
    code: string;
    description: string;
    status: string;
    metadata: any;
  }>) {
    console.log('Updating sub product:', subProductId, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.code) updateData.code = updates.code;
    if (updates.description) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SUB_PRODUCTS)
      .update(updateData)
      .eq('id', subProductId)
      .select();

    if (error) {
      console.error('Error updating sub product:', error);
      throw new Error(`Failed to update sub product: ${error.message}`);
    }

    return mapSubProductData(data?.[0]);
  }

  static async deleteSubProduct(subProductId: string) {
    console.log('Deleting sub product:', subProductId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.SUB_PRODUCTS)
      .delete()
      .eq('id', subProductId);

    if (error) {
      console.error('Error deleting sub product:', error);
      throw new Error(`Failed to delete sub product: ${error.message}`);
    }
  }

  static subscribeToSubProducts(callback: (payload: any) => void) {
    return supabase
      .channel('sub-products-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.SUB_PRODUCTS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // DOCUMENT TYPES MANAGEMENT
  // =============================================================================

  static async getDocumentTypesDetailed(filters?: { category?: string; isActive?: boolean; isRequired?: boolean }) {
    console.log('Fetching document types with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.DOCUMENT_TYPES)
      .select(`
        id,
        name,
        category,
        description,
        is_required,
        priority,
        validity_period,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .order('priority', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.isRequired !== undefined) {
      query = query.eq('is_required', filters.isRequired);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching document types:', error);
      return [];
    }

    return data?.map(docType => mapDocumentTypeData(docType)) || [];
  }

  static async createDocumentType(documentTypeData: {
    name: string;
    category: string;
    description: string;
    isRequired: boolean;
    priority: string;
    validityPeriod?: number;
    metadata?: any;
  }) {
    console.log('Creating document type:', documentTypeData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENT_TYPES)
      .insert({
        name: documentTypeData.name,
        category: documentTypeData.category,
        description: documentTypeData.description,
        is_required: documentTypeData.isRequired,
        priority: documentTypeData.priority,
        validity_period: documentTypeData.validityPeriod,
        is_active: true,
        metadata: documentTypeData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating document type:', error);
      throw new Error(`Failed to create document type: ${error.message}`);
    }

    return mapDocumentTypeData(data?.[0]);
  }

  static async updateDocumentType(documentTypeId: string, updates: Partial<{
    name: string;
    category: string;
    description: string;
    isRequired: boolean;
    priority: string;
    validityPeriod: number;
    isActive: boolean;
    metadata: any;
  }>) {
    console.log('Updating document type:', documentTypeId, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.description) updateData.description = updates.description;
    if (updates.isRequired !== undefined) updateData.is_required = updates.isRequired;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.validityPeriod !== undefined) updateData.validity_period = updates.validityPeriod;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENT_TYPES)
      .update(updateData)
      .eq('id', documentTypeId)
      .select();

    if (error) {
      console.error('Error updating document type:', error);
      throw new Error(`Failed to update document type: ${error.message}`);
    }

    return mapDocumentTypeData(data?.[0]);
  }

  static async deleteDocumentType(documentTypeId: string) {
    console.log('Deleting document type:', documentTypeId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENT_TYPES)
      .delete()
      .eq('id', documentTypeId);

    if (error) {
      console.error('Error deleting document type:', error);
      throw new Error(`Failed to delete document type: ${error.message}`);
    }
  }

  static subscribeToDocumentTypes(callback: (payload: any) => void) {
    return supabase
      .channel('document-types-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.DOCUMENT_TYPES },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // FILES MANAGEMENT
  // =============================================================================

  static async getFiles(filters?: { 
    uploaderId?: string; 
    folderId?: string; 
    fileType?: string; 
    isPublic?: boolean 
  }) {
    console.log('Fetching files with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.FILES)
      .select(`
        id,
        file_name,
        original_name,
        file_path,
        file_size,
        mime_type,
        file_type,
        uploader_id,
        folder_id,
        is_public,
        metadata,
        created_at,
        updated_at,
        users!inner(
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.uploaderId) {
      query = query.eq('uploader_id', filters.uploaderId);
    }
    if (filters?.folderId) {
      query = query.eq('folder_id', filters.folderId);
    }
    if (filters?.fileType) {
      query = query.eq('file_type', filters.fileType);
    }
    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching files:', error);
      return [];
    }

    return data?.map(file => {
      const uploader = Array.isArray(file.users) ? file.users[0] : file.users;
      return {
        ...mapFileData(file),
        uploaderName: uploader?.full_name || 'Unknown User'
      };
    }) || [];
  }

  static async uploadFile(fileData: {
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    fileType: string;
    uploaderId: string;
    folderId?: string;
    isPublic?: boolean;
    metadata?: any;
  }) {
    console.log('Uploading file:', fileData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FILES)
      .insert({
        file_name: fileData.fileName,
        original_name: fileData.originalName,
        file_path: fileData.filePath,
        file_size: fileData.fileSize,
        mime_type: fileData.mimeType,
        file_type: fileData.fileType,
        uploader_id: fileData.uploaderId,
        folder_id: fileData.folderId,
        is_public: fileData.isPublic || false,
        metadata: fileData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return mapFileData(data?.[0]);
  }

  static async updateFile(fileId: string, updates: Partial<{
    fileName: string;
    originalName: string;
    isPublic: boolean;
    metadata: any;
  }>) {
    console.log('Updating file:', fileId, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.fileName) updateData.file_name = updates.fileName;
    if (updates.originalName) updateData.original_name = updates.originalName;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FILES)
      .update(updateData)
      .eq('id', fileId)
      .select();

    if (error) {
      console.error('Error updating file:', error);
      throw new Error(`Failed to update file: ${error.message}`);
    }

    return mapFileData(data?.[0]);
  }

  static async deleteFile(fileId: string) {
    console.log('Deleting file:', fileId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.FILES)
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  static subscribeToFiles(callback: (payload: any) => void) {
    return supabase
      .channel('files-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.FILES },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // DOCUMENT MANAGEMENT METHODS
  // =============================================================================

  // Folder Management
  static async getFolders(filters?: { 
    organizationId?: string; 
    parentFolderId?: string | null; 
    isActive?: boolean;
    createdBy?: string;
  }) {
    console.log('Fetching folders with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.FOLDERS)
      .select(`
        id,
        name,
        description,
        parent_folder_id,
        organization_id,
        created_by,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.parentFolderId !== undefined) {
      query = query.eq('parent_folder_id', filters.parentFolderId);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching folders:', error);
      return [];
    }

    return data?.map(mapFolderData) || [];
  }

  static async createFolder(folderData: {
    name: string;
    description?: string;
    parentFolderId?: string;
    organizationId: string;
    createdBy: string;
    metadata?: any;
  }) {
    console.log('Creating folder:', folderData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FOLDERS)
      .insert({
        name: folderData.name,
        description: folderData.description,
        parent_folder_id: folderData.parentFolderId,
        organization_id: folderData.organizationId,
        created_by: folderData.createdBy,
        is_active: true,
        metadata: folderData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }

    return mapFolderData(data?.[0]);
  }

  static async updateFolder(folderId: string, updates: Partial<{
    name?: string;
    description?: string;
    parentFolderId?: string;
    isActive?: boolean;
    metadata?: any;
  }>) {
    console.log('Updating folder:', folderId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FOLDERS)
      .update({
        ...updates,
        parent_folder_id: updates.parentFolderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .select();

    if (error) {
      console.error('Error updating folder:', error);
      throw new Error(`Failed to update folder: ${error.message}`);
    }

    return mapFolderData(data?.[0]);
  }

  static async deleteFolder(folderId: string) {
    console.log('Deleting folder:', folderId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.FOLDERS)
      .delete()
      .eq('id', folderId);

    if (error) {
      console.error('Error deleting folder:', error);
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }

  // Document Against Product Management
  static async getDocumentAgainstProduct(filters?: { 
    productId?: string; 
    documentTypeId?: string; 
    mandatory?: boolean;
  }) {
    console.log('Fetching document against product with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.DOCUMENT_AGAINST_PRODUCT)
      .select(`
        id,
        organization_id,
        product_id,
        document_type_id,
        mandatory,
        notes,
        metadata,
        created_at,
        updated_at,
        products!inner(
          id,
          name,
          code,
          description,
          category,
          interest_rate,
          min_amount,
          max_amount,
          min_tenure,
          max_tenure,
          is_active,
          metadata,
          created_at,
          updated_at
        ),
        document_types!inner(
          id,
          name,
          category,
          description,
          is_required,
          priority,
          is_active,
          metadata,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.productId) {
      query = query.eq('product_id', filters.productId);
    }
    if (filters?.documentTypeId) {
      query = query.eq('document_type_id', filters.documentTypeId);
    }
    if (filters?.mandatory !== undefined) {
      query = query.eq('mandatory', filters.mandatory);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching document against product:', error);
      return [];
    }

    return data?.map(mapDocumentAgainstProductData) || [];
  }

  static async createDocumentAgainstProduct(data: {
    productId: string;
    documentTypeId: string;
    mandatory: boolean;
    notes?: string;
    metadata?: any;
    organizationId?: number;
  }) {
    console.log('Creating document against product:', data);
    
    const { data: result, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENT_AGAINST_PRODUCT)
      .insert({
        organization_id: data.organizationId || 1,
        product_id: data.productId,
        document_type_id: data.documentTypeId,
        mandatory: data.mandatory,
        notes: data.notes,
        metadata: data.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating document against product:', error);
      throw new Error(`Failed to create document against product: ${error.message}`);
    }

    return mapDocumentAgainstProductData(result?.[0]);
  }

  static async updateDocumentAgainstProduct(id: string, updates: Partial<{
    mandatory?: boolean;
    notes?: string;
    metadata?: any;
  }>) {
    console.log('Updating document against product:', id, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENT_AGAINST_PRODUCT)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating document against product:', error);
      throw new Error(`Failed to update document against product: ${error.message}`);
    }

    return mapDocumentAgainstProductData(data?.[0]);
  }

  static async deleteDocumentAgainstProduct(id: string) {
    console.log('Deleting document against product:', id);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENT_AGAINST_PRODUCT)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document against product:', error);
      throw new Error(`Failed to delete document against product: ${error.message}`);
    }
  }

  // Document Against Sub Product Management
  static async getDocAgainstSubProduct(filters?: { 
    subProductId?: string; 
    documentTypeId?: string; 
    mandatory?: boolean;
  }) {
    console.log('Fetching document against sub product with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.DOC_AGAINST_SUB_PRODUCT)
      .select(`
        id,
        organization_id,
        sub_product_id,
        document_type_id,
        mandatory,
        notes,
        metadata,
        created_at,
        updated_at,
        sub_products!inner(
          id,
          product_id,
          name,
          code,
          description,
          status,
          metadata,
          organization_id,
          created_at,
          updated_at
        ),
        document_types!inner(
          id,
          name,
          category,
          description,
          is_required,
          priority,
          is_active,
          metadata,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.subProductId) {
      query = query.eq('sub_product_id', filters.subProductId);
    }
    if (filters?.documentTypeId) {
      query = query.eq('document_type_id', filters.documentTypeId);
    }
    if (filters?.mandatory !== undefined) {
      query = query.eq('mandatory', filters.mandatory);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching document against sub product:', error);
      return [];
    }

    return data?.map(mapDocAgainstSubProductData) || [];
  }

  static async createDocAgainstSubProduct(data: {
    subProductId: string;
    documentTypeId: string;
    mandatory: boolean;
    notes?: string;
    metadata?: any;
    organizationId?: number;
  }) {
    console.log('Creating document against sub product:', data);
    
    const { data: result, error } = await supabase
      .from(SUPABASE_TABLES.DOC_AGAINST_SUB_PRODUCT)
      .insert({
        organization_id: data.organizationId || 1,
        sub_product_id: data.subProductId,
        document_type_id: data.documentTypeId,
        mandatory: data.mandatory,
        notes: data.notes,
        metadata: data.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating document against sub product:', error);
      throw new Error(`Failed to create document against sub product: ${error.message}`);
    }

    return mapDocAgainstSubProductData(result?.[0]);
  }

  static async updateDocAgainstSubProduct(id: string, updates: Partial<{
    mandatory?: boolean;
    notes?: string;
    metadata?: any;
  }>) {
    console.log('Updating document against sub product:', id, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOC_AGAINST_SUB_PRODUCT)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating document against sub product:', error);
      throw new Error(`Failed to update document against sub product: ${error.message}`);
    }

    return mapDocAgainstSubProductData(data?.[0]);
  }

  static async deleteDocAgainstSubProduct(id: string) {
    console.log('Deleting document against sub product:', id);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.DOC_AGAINST_SUB_PRODUCT)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document against sub product:', error);
      throw new Error(`Failed to delete document against sub product: ${error.message}`);
    }
  }

  // File Signature Management
  static async getFileSignatures(filters?: { 
    fileId?: string; 
    userId?: string; 
    signatureType?: 'digital' | 'electronic' | 'wet_signature';
    isVerified?: boolean;
  }) {
    console.log('Fetching file signatures with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.FILE_SIGNATURES)
      .select(`
        id,
        file_id,
        user_id,
        signature_type,
        signature_data,
        signature_method,
        is_verified,
        verified_at,
        verified_by,
        expires_at,
        metadata,
        created_at,
        updated_at,
        files!inner(
          id,
          file_name,
          original_name,
          file_path,
          file_size,
          mime_type,
          file_type,
          uploader_id,
          folder_id,
          is_public,
          metadata,
          created_at,
          updated_at
        ),
        users!inner(
          id,
          full_name,
          name,
          email,
          role,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.fileId) {
      query = query.eq('file_id', filters.fileId);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.signatureType) {
      query = query.eq('signature_type', filters.signatureType);
    }
    if (filters?.isVerified !== undefined) {
      query = query.eq('is_verified', filters.isVerified);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching file signatures:', error);
      return [];
    }

    return data?.map(mapFileSignatureData) || [];
  }

  static async createFileSignature(data: {
    fileId: string;
    userId: string;
    signatureType: 'digital' | 'electronic' | 'wet_signature';
    signatureData: string;
    signatureMethod: 'biometric' | 'pin' | 'password' | 'certificate' | 'other';
    expiresAt?: string;
    metadata?: any;
  }) {
    console.log('Creating file signature:', data);
    
    const { data: result, error } = await supabase
      .from(SUPABASE_TABLES.FILE_SIGNATURES)
      .insert({
        file_id: data.fileId,
        user_id: data.userId,
        signature_type: data.signatureType,
        signature_data: data.signatureData,
        signature_method: data.signatureMethod,
        is_verified: false,
        expires_at: data.expiresAt,
        metadata: data.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating file signature:', error);
      throw new Error(`Failed to create file signature: ${error.message}`);
    }

    return mapFileSignatureData(result?.[0]);
  }

  static async updateFileSignature(id: string, updates: Partial<{
    signatureType?: 'digital' | 'electronic' | 'wet_signature';
    signatureData?: string;
    signatureMethod?: 'biometric' | 'pin' | 'password' | 'certificate' | 'other';
    isVerified?: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    expiresAt?: string;
    metadata?: any;
  }>) {
    console.log('Updating file signature:', id, updates);
    
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.isVerified) {
      updateData.verified_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FILE_SIGNATURES)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating file signature:', error);
      throw new Error(`Failed to update file signature: ${error.message}`);
    }

    return mapFileSignatureData(data?.[0]);
  }

  static async deleteFileSignature(id: string) {
    console.log('Deleting file signature:', id);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.FILE_SIGNATURES)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting file signature:', error);
      throw new Error(`Failed to delete file signature: ${error.message}`);
    }
  }

  // Real-time subscriptions for document management
  static subscribeToFolders(callback: (payload: any) => void) {
    return supabase
      .channel('folders-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.FOLDERS },
        callback
      )
      .subscribe();
  }

  static subscribeToDocumentAgainstProduct(callback: (payload: any) => void) {
    return supabase
      .channel('document-against-product-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.DOCUMENT_AGAINST_PRODUCT },
        callback
      )
      .subscribe();
  }

  static subscribeToDocAgainstSubProduct(callback: (payload: any) => void) {
    return supabase
      .channel('doc-against-sub-product-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.DOC_AGAINST_SUB_PRODUCT },
        callback
      )
      .subscribe();
  }

  static subscribeToFileSignatures(callback: (payload: any) => void) {
    return supabase
      .channel('file-signatures-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.FILE_SIGNATURES },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PHASE 2: CORE BUSINESS LOGIC - LOAN APPLICATIONS
  // =============================================================================

  static async getLoanApplications(filters?: {
    status?: string;
    assignedSalesAgent?: string;
    assignedCreditAnalyst?: string;
    priority?: string;
    organizationId?: string;
    currentStage?: string;
  }) {
    console.log('Fetching loan applications with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.LOAN_APPLICATIONS)
      .select(`
        id,
        application_number,
        customer_id,
        loan_product_id,
        requested_amount,
        requested_tenure,
        purpose,
        status,
        priority,
        assigned_sales_agent,
        assigned_credit_analyst,
        current_stage,
        workflow_data,
        submitted_at,
        approved_at,
        rejected_at,
        disbursed_at,
        created_at,
        updated_at,
        customers!inner(
          id,
          full_name,
          mobile,
          email,
          dob,
          address,
          kyc_status,
          metadata
        ),
        loan_products!inner(
          id,
          name,
          product_code,
          description,
          interest_rate,
          min_amount,
          max_amount,
          tenure_months
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedSalesAgent) {
      query = query.eq('assigned_sales_agent', filters.assignedSalesAgent);
    }
    if (filters?.assignedCreditAnalyst) {
      query = query.eq('assigned_credit_analyst', filters.assignedCreditAnalyst);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.currentStage) {
      query = query.eq('current_stage', filters.currentStage);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching loan applications:', error);
      return [];
    }

    return data?.map(loanApp => {
      const customer = Array.isArray(loanApp.customers) ? loanApp.customers[0] : loanApp.customers;
      const product = Array.isArray(loanApp.loan_products) ? loanApp.loan_products[0] : loanApp.loan_products;
      
      return {
        ...mapLoanApplicationData(loanApp),
        customer: {
          id: customer?.id || '',
          name: customer?.full_name || 'Unknown Customer',
          phone: customer?.mobile || '',
          email: customer?.email || '',
          age: customer?.dob ? Math.floor((Date.now() - new Date(customer.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
          maritalStatus: customer?.metadata?.marital_status || 'single',
          employment: customer?.metadata?.employment_type || 'salaried',
          loanType: product?.name || 'Personal Loan',
          loanAmount: loanApp.requested_amount || 0,
          riskProfile: customer?.metadata?.risk_profile || 'low',
          createdAt: loanApp.created_at,
        },
        loanProduct: {
          id: product?.id || '',
          name: product?.name || '',
          code: product?.product_code || '',
          description: product?.description || '',
          interestRate: product?.interest_rate || 0,
          minAmount: product?.min_amount || 0,
          maxAmount: product?.max_amount || 0,
          tenureMonths: product?.tenure_months || 0,
        }
      };
    }) || [];
  }

  static async getLoanApplicationById(loanApplicationId: string) {
    console.log('Fetching loan application by ID:', loanApplicationId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LOAN_APPLICATIONS)
      .select(`
        id,
        application_number,
        customer_id,
        loan_product_id,
        requested_amount,
        requested_tenure,
        purpose,
        status,
        priority,
        assigned_sales_agent,
        assigned_credit_analyst,
        current_stage,
        workflow_data,
        submitted_at,
        approved_at,
        rejected_at,
        disbursed_at,
        created_at,
        updated_at,
        customers!inner(
          id,
          full_name,
          mobile,
          email,
          dob,
          address,
          kyc_status,
          metadata
        ),
        loan_products!inner(
          id,
          name,
          product_code,
          description,
          interest_rate,
          min_amount,
          max_amount,
          tenure_months
        )
      `)
      .eq('id', loanApplicationId)
      .single();

    if (error) {
      console.error('Error fetching loan application:', error);
      return null;
    }

    const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers;
    const product = Array.isArray(data.loan_products) ? data.loan_products[0] : data.loan_products;
    
    return {
      ...mapLoanApplicationData(data),
      customer: {
        id: customer?.id || '',
        name: customer?.full_name || '',
        phone: customer?.mobile || '',
        email: customer?.email || '',
        age: customer?.dob ? Math.floor((Date.now() - new Date(customer.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
        maritalStatus: customer?.metadata?.marital_status || 'single',
        employment: customer?.metadata?.employment_type || 'salaried',
        loanType: product?.name || '',
        loanAmount: data.requested_amount || 0,
        riskProfile: customer?.metadata?.risk_profile || 'low',
        createdAt: data.created_at,
      },
      loanProduct: {
        id: product?.id || '',
        name: product?.name || '',
        code: product?.product_code || '',
        description: product?.description || '',
        interestRate: product?.interest_rate || 0,
        minAmount: product?.min_amount || 0,
        maxAmount: product?.max_amount || 0,
        tenureMonths: product?.tenure_months || 0,
      }
    };
  }

  static async createLoanApplication(loanApplicationData: {
    organizationId: string;
    customerId: string;
    loanProductId: string;
    requestedAmount: number;
    requestedTenure: number;
    purpose: string;
    assignedSalesAgent?: string;
    currentStage?: string;
    workflowData?: any;
  }) {
    console.log('Creating loan application:', loanApplicationData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LOAN_APPLICATIONS)
      .insert({
        organization_id: loanApplicationData.organizationId,
        application_number: `APP-${Date.now()}`, // Generate unique application number
        customer_id: loanApplicationData.customerId,
        loan_product_id: loanApplicationData.loanProductId,
        requested_amount: loanApplicationData.requestedAmount,
        requested_tenure: loanApplicationData.requestedTenure,
        purpose: loanApplicationData.purpose,
        status: 'draft',
        priority: 'medium',
        assigned_sales_agent: loanApplicationData.assignedSalesAgent,
        current_stage: loanApplicationData.currentStage || 'application',
        workflow_data: loanApplicationData.workflowData || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating loan application:', error);
      throw new Error(`Failed to create loan application: ${error.message}`);
    }

    return mapLoanApplicationData(data?.[0]);
  }

  static async updateLoanApplication(loanApplicationId: string, updates: Partial<{
    status: string;
    priority: string;
    assignedSalesAgent: string;
    assignedCreditAnalyst: string;
    currentStage: string;
    workflowData: any;
    submittedAt: string;
    approvedAt: string;
    rejectedAt: string;
    disbursedAt: string;
  }>) {
    console.log('Updating loan application:', loanApplicationId, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.status) updateData.status = updates.status;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.assignedSalesAgent) updateData.assigned_sales_agent = updates.assignedSalesAgent;
    if (updates.assignedCreditAnalyst) updateData.assigned_credit_analyst = updates.assignedCreditAnalyst;
    if (updates.currentStage) updateData.current_stage = updates.currentStage;
    if (updates.workflowData) updateData.workflow_data = updates.workflowData;
    if (updates.submittedAt) updateData.submitted_at = updates.submittedAt;
    if (updates.approvedAt) updateData.approved_at = updates.approvedAt;
    if (updates.rejectedAt) updateData.rejected_at = updates.rejectedAt;
    if (updates.disbursedAt) updateData.disbursed_at = updates.disbursedAt;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LOAN_APPLICATIONS)
      .update(updateData)
      .eq('id', loanApplicationId)
      .select();

    if (error) {
      console.error('Error updating loan application:', error);
      throw new Error(`Failed to update loan application: ${error.message}`);
    }

    return mapLoanApplicationData(data?.[0]);
  }

  static async deleteLoanApplication(loanApplicationId: string) {
    console.log('Deleting loan application:', loanApplicationId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.LOAN_APPLICATIONS)
      .delete()
      .eq('id', loanApplicationId);

    if (error) {
      console.error('Error deleting loan application:', error);
      throw new Error(`Failed to delete loan application: ${error.message}`);
    }
  }

  static subscribeToLoanApplications(callback: (payload: any) => void) {
    return supabase
      .channel('loan-applications-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.LOAN_APPLICATIONS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PHASE 2: CORE BUSINESS LOGIC - LOAN PRODUCTS
  // =============================================================================

  static async getLoanProducts(filters?: {
    organizationId?: string;
    isActive?: boolean;
    category?: string;
  }) {
    console.log('Fetching loan products with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.LOAN_PRODUCTS)
      .select(`
        id,
        organization_id,
        name,
        description,
        product_code,
        min_amount,
        max_amount,
        interest_rate,
        tenure_months,
        processing_fee,
        required_documents,
        eligibility_criteria,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching loan products:', error);
      return [];
    }

    return data?.map(product => mapLoanProductData(product)) || [];
  }

  static async getLoanProductById(productId: string) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LOAN_PRODUCTS)
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching loan product:', error);
      return null;
    }

    return mapLoanProductData(data);
  }

  static async createLoanProduct(productData: {
    organizationId: string;
    name: string;
    description: string;
    productCode: string;
    minAmount: number;
    maxAmount: number;
    interestRate: number;
    tenureMonths: number;
    processingFee?: number;
    requiredDocuments?: string[];
    eligibilityCriteria?: any;
  }) {
    console.log('Creating loan product:', productData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LOAN_PRODUCTS)
      .insert({
        organization_id: productData.organizationId,
        name: productData.name,
        description: productData.description,
        product_code: productData.productCode,
        min_amount: productData.minAmount,
        max_amount: productData.maxAmount,
        interest_rate: productData.interestRate,
        tenure_months: productData.tenureMonths,
        processing_fee: productData.processingFee || 0,
        required_documents: productData.requiredDocuments || [],
        eligibility_criteria: productData.eligibilityCriteria || {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating loan product:', error);
      throw new Error(`Failed to create loan product: ${error.message}`);
    }

    return mapLoanProductData(data?.[0]);
  }

  static async updateLoanProduct(productId: string, updates: Partial<{
    name: string;
    description: string;
    productCode: string;
    minAmount: number;
    maxAmount: number;
    interestRate: number;
    tenureMonths: number;
    processingFee: number;
    requiredDocuments: string[];
    eligibilityCriteria: any;
    isActive: boolean;
  }>) {
    console.log('Updating loan product:', productId, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.productCode) updateData.product_code = updates.productCode;
    if (updates.minAmount !== undefined) updateData.min_amount = updates.minAmount;
    if (updates.maxAmount !== undefined) updateData.max_amount = updates.maxAmount;
    if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate;
    if (updates.tenureMonths !== undefined) updateData.tenure_months = updates.tenureMonths;
    if (updates.processingFee !== undefined) updateData.processing_fee = updates.processingFee;
    if (updates.requiredDocuments) updateData.required_documents = updates.requiredDocuments;
    if (updates.eligibilityCriteria) updateData.eligibility_criteria = updates.eligibilityCriteria;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LOAN_PRODUCTS)
      .update(updateData)
      .eq('id', productId)
      .select();

    if (error) {
      console.error('Error updating loan product:', error);
      throw new Error(`Failed to update loan product: ${error.message}`);
    }

    return mapLoanProductData(data?.[0]);
  }

  static async deleteLoanProduct(productId: string) {
    console.log('Deleting loan product:', productId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.LOAN_PRODUCTS)
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting loan product:', error);
      throw new Error(`Failed to delete loan product: ${error.message}`);
    }
  }

  static subscribeToLoanProducts(callback: (payload: any) => void) {
    return supabase
      .channel('loan-products-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.LOAN_PRODUCTS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PHASE 2: CORE BUSINESS LOGIC - WORKFLOW STAGES
  // =============================================================================

  static async getWorkflowStages(filters?: {
    organizationId?: string;
    isActive?: boolean;
    departmentType?: string;
  }) {
    console.log('Fetching workflow stages with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.WORKFLOW_STAGES)
      .select(`
        id,
        organization_id,
        name,
        stage_key,
        description,
        department_type,
        order_index,
        is_active,
        created_at,
        updated_at
      `)
      .order('order_index', { ascending: true });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.departmentType) {
      query = query.eq('department_type', filters.departmentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workflow stages:', error);
      return [];
    }

    return data?.map(stage => mapWorkflowStageData(stage)) || [];
  }

  static async createWorkflowStage(stageData: {
    organizationId: string;
    name: string;
    stageKey: string;
    description: string;
    departmentType: string;
    orderIndex: number;
  }) {
    console.log('Creating workflow stage:', stageData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WORKFLOW_STAGES)
      .insert({
        organization_id: stageData.organizationId,
        name: stageData.name,
        stage_key: stageData.stageKey,
        description: stageData.description,
        department_type: stageData.departmentType,
        order_index: stageData.orderIndex,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating workflow stage:', error);
      throw new Error(`Failed to create workflow stage: ${error.message}`);
    }

    return mapWorkflowStageData(data?.[0]);
  }

  static subscribeToWorkflowStages(callback: (payload: any) => void) {
    return supabase
      .channel('workflow-stages-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.WORKFLOW_STAGES },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PHASE 2: CORE BUSINESS LOGIC - WORKFLOW TRANSITIONS
  // =============================================================================

  static async getWorkflowTransitions(filters?: {
    organizationId?: string;
    fromStageId?: string;
    toStageId?: string;
    isActive?: boolean;
  }) {
    console.log('Fetching workflow transitions with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.WORKFLOW_TRANSITIONS)
      .select(`
        id,
        organization_id,
        from_stage_id,
        to_stage_id,
        name,
        conditions,
        actions,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.fromStageId) {
      query = query.eq('from_stage_id', filters.fromStageId);
    }
    if (filters?.toStageId) {
      query = query.eq('to_stage_id', filters.toStageId);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workflow transitions:', error);
      return [];
    }

    return data?.map(transition => mapWorkflowTransitionData(transition)) || [];
  }

  static subscribeToWorkflowTransitions(callback: (payload: any) => void) {
    return supabase
      .channel('workflow-transitions-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.WORKFLOW_TRANSITIONS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PHASE 2: CORE BUSINESS LOGIC - WORKFLOW HISTORY
  // =============================================================================

  static async getWorkflowHistory(filters?: {
    loanApplicationId?: string;
    organizationId?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
  }) {
    console.log('Fetching workflow history with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.WORKFLOW_HISTORY)
      .select(`
        id,
        organization_id,
        loan_application_id,
        from_stage_id,
        to_stage_id,
        transition_id,
        user_id,
        action,
        comments,
        metadata,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.loanApplicationId) {
      query = query.eq('loan_application_id', filters.loanApplicationId);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.fromDate) {
      query = query.gte('created_at', filters.fromDate);
    }
    if (filters?.toDate) {
      query = query.lte('created_at', filters.toDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workflow history:', error);
      return [];
    }

    return data?.map(history => mapWorkflowHistoryData(history)) || [];
  }

  static async createWorkflowHistoryEntry(historyData: {
    organizationId: string;
    loanApplicationId: string;
    fromStageId?: string;
    toStageId?: string;
    transitionId?: string;
    userId: string;
    action: string;
    comments?: string;
    metadata?: any;
  }) {
    console.log('Creating workflow history entry:', historyData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WORKFLOW_HISTORY)
      .insert({
        organization_id: historyData.organizationId,
        loan_application_id: historyData.loanApplicationId,
        from_stage_id: historyData.fromStageId,
        to_stage_id: historyData.toStageId,
        transition_id: historyData.transitionId,
        user_id: historyData.userId,
        action: historyData.action,
        comments: historyData.comments,
        metadata: historyData.metadata || {},
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating workflow history entry:', error);
      throw new Error(`Failed to create workflow history entry: ${error.message}`);
    }

    return mapWorkflowHistoryData(data?.[0]);
  }

  static subscribeToWorkflowHistory(callback: (payload: any) => void) {
    return supabase
      .channel('workflow-history-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.WORKFLOW_HISTORY },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PHASE 4: WORKLOAD PLANNING SYSTEM
  // =============================================================================

  static async getWorkloadSchedules(filters?: {
    userId?: string;
    organizationId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    console.log('Fetching workload schedules with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.WORKLOAD_SCHEDULES)
      .select(`
        id,
        organization_id,
        user_id,
        date,
        planned_hours,
        actual_hours,
        capacity_percentage,
        notes,
        created_at,
        updated_at,
        users!inner(
          id,
          full_name,
          email
        )
      `)
      .order('date', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workload schedules:', error);
      return [];
    }

    return data?.map(item => mapWorkloadScheduleData({
      ...item,
      user: Array.isArray(item.users) ? item.users[0] : item.users,
    })) || [];
  }

  static async createWorkloadSchedule(scheduleData: {
    organizationId: string;
    userId: string;
    date: string;
    plannedHours: number;
    actualHours?: number;
    capacityPercentage?: number;
    notes?: string;
  }) {
    console.log('Creating workload schedule:', scheduleData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WORKLOAD_SCHEDULES)
      .insert({
        organization_id: scheduleData.organizationId,
        user_id: scheduleData.userId,
        date: scheduleData.date,
        planned_hours: scheduleData.plannedHours,
        actual_hours: scheduleData.actualHours || 0,
        capacity_percentage: scheduleData.capacityPercentage || 100,
        notes: scheduleData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating workload schedule:', error);
      throw new Error(`Failed to create workload schedule: ${error.message}`);
    }

    return mapWorkloadScheduleData(data?.[0]);
  }

  static async updateWorkloadSchedule(scheduleId: string, updates: {
    plannedHours?: number;
    actualHours?: number;
    capacityPercentage?: number;
    notes?: string;
  }) {
    console.log('Updating workload schedule:', scheduleId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WORKLOAD_SCHEDULES)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .select();

    if (error) {
      console.error('Error updating workload schedule:', error);
      throw new Error(`Failed to update workload schedule: ${error.message}`);
    }

    return mapWorkloadScheduleData(data?.[0]);
  }

  static async getWorkloadAssignments(filters?: {
    userId?: string;
    organizationId?: string;
    status?: string;
    taskId?: string;
    loanApplicationId?: string;
  }) {
    console.log('Fetching workload assignments with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.WORKLOAD_ASSIGNMENTS)
      .select(`
        id,
        organization_id,
        user_id,
        task_id,
        loan_application_id,
        assigned_hours,
        start_time,
        end_time,
        status,
        created_at,
        updated_at,
        users!inner(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.taskId) {
      query = query.eq('task_id', filters.taskId);
    }
    if (filters?.loanApplicationId) {
      query = query.eq('loan_application_id', filters.loanApplicationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workload assignments:', error);
      return [];
    }

    return data?.map(item => mapWorkloadAssignmentData({
      ...item,
      user: Array.isArray(item.users) ? item.users[0] : item.users,
    })) || [];
  }

  static async createWorkloadAssignment(assignmentData: {
    organizationId: string;
    userId: string;
    taskId?: string;
    loanApplicationId?: string;
    assignedHours?: number;
    startTime?: string;
    endTime?: string;
    status?: string;
  }) {
    console.log('Creating workload assignment:', assignmentData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WORKLOAD_ASSIGNMENTS)
      .insert({
        organization_id: assignmentData.organizationId,
        user_id: assignmentData.userId,
        task_id: assignmentData.taskId,
        loan_application_id: assignmentData.loanApplicationId,
        assigned_hours: assignmentData.assignedHours,
        start_time: assignmentData.startTime,
        end_time: assignmentData.endTime,
        status: assignmentData.status || 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating workload assignment:', error);
      throw new Error(`Failed to create workload assignment: ${error.message}`);
    }

    return mapWorkloadAssignmentData(data?.[0]);
  }

  static async updateWorkloadAssignment(assignmentId: string, updates: {
    assignedHours?: number;
    startTime?: string;
    endTime?: string;
    status?: string;
  }) {
    console.log('Updating workload assignment:', assignmentId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WORKLOAD_ASSIGNMENTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select();

    if (error) {
      console.error('Error updating workload assignment:', error);
      throw new Error(`Failed to update workload assignment: ${error.message}`);
    }

    return mapWorkloadAssignmentData(data?.[0]);
  }

  static subscribeToWorkloadSchedules(callback: (payload: any) => void) {
    return supabase
      .channel('workload-schedules-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.WORKLOAD_SCHEDULES },
        callback
      )
      .subscribe();
  }

  static subscribeToWorkloadAssignments(callback: (payload: any) => void) {
    return supabase
      .channel('workload-assignments-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.WORKLOAD_ASSIGNMENTS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // PHASE 5: APPROVAL QUEUE SYSTEM
  // =============================================================================

  static async getApprovalQueues(filters?: {
    organizationId?: string;
    queueType?: string;
    departmentType?: string;
    isActive?: boolean;
  }) {
    console.log('Fetching approval queues with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.APPROVAL_QUEUES)
      .select(`
        id,
        organization_id,
        name,
        description,
        queue_type,
        department_type,
        priority,
        is_active,
        auto_assign,
        max_concurrent_items,
        sla_hours,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.queueType) {
      query = query.eq('queue_type', filters.queueType);
    }
    if (filters?.departmentType) {
      query = query.eq('department_type', filters.departmentType);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching approval queues:', error);
      return [];
    }

    return data?.map(item => mapApprovalQueueData(item)) || [];
  }

  static async createApprovalQueue(queueData: {
    organizationId: string;
    name: string;
    description?: string;
    queueType: string;
    departmentType: string;
    priority?: string;
    isActive?: boolean;
    autoAssign?: boolean;
    maxConcurrentItems?: number;
    slaHours?: number;
  }) {
    console.log('Creating approval queue:', queueData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.APPROVAL_QUEUES)
      .insert({
        organization_id: queueData.organizationId,
        name: queueData.name,
        description: queueData.description,
        queue_type: queueData.queueType,
        department_type: queueData.departmentType,
        priority: queueData.priority || 'medium',
        is_active: queueData.isActive !== undefined ? queueData.isActive : true,
        auto_assign: queueData.autoAssign || false,
        max_concurrent_items: queueData.maxConcurrentItems || 10,
        sla_hours: queueData.slaHours || 24,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating approval queue:', error);
      throw new Error(`Failed to create approval queue: ${error.message}`);
    }

    return mapApprovalQueueData(data?.[0]);
  }

  static async getApprovalQueueItems(filters?: {
    queueId?: string;
    organizationId?: string;
    status?: string;
    assignedTo?: string;
    itemType?: string;
    priority?: string;
  }) {
    console.log('Fetching approval queue items with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.APPROVAL_QUEUE_ITEMS)
      .select(`
        id,
        organization_id,
        queue_id,
        item_type,
        item_id,
        priority,
        status,
        assigned_to,
        assigned_at,
        started_at,
        completed_at,
        due_date,
        comments,
        decision,
        decision_reason,
        metadata,
        created_at,
        updated_at,
        users!inner(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.queueId) {
      query = query.eq('queue_id', filters.queueId);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters?.itemType) {
      query = query.eq('item_type', filters.itemType);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching approval queue items:', error);
      return [];
    }

    return data?.map(item => mapApprovalQueueItemData({
      ...item,
      user: Array.isArray(item.users) ? item.users[0] : item.users,
    })) || [];
  }

  static async createApprovalQueueItem(itemData: {
    organizationId: string;
    queueId: string;
    itemType: string;
    itemId: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: string;
    comments?: string;
    metadata?: any;
  }) {
    console.log('Creating approval queue item:', itemData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.APPROVAL_QUEUE_ITEMS)
      .insert({
        organization_id: itemData.organizationId,
        queue_id: itemData.queueId,
        item_type: itemData.itemType,
        item_id: itemData.itemId,
        priority: itemData.priority || 'medium',
        assigned_to: itemData.assignedTo,
        due_date: itemData.dueDate,
        comments: itemData.comments,
        metadata: itemData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating approval queue item:', error);
      throw new Error(`Failed to create approval queue item: ${error.message}`);
    }

    return mapApprovalQueueItemData(data?.[0]);
  }

  static async updateApprovalQueueItem(itemId: string, updates: {
    status?: string;
    assignedTo?: string;
    startedAt?: string;
    completedAt?: string;
    comments?: string;
    decision?: string;
    decisionReason?: string;
  }) {
    console.log('Updating approval queue item:', itemId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.APPROVAL_QUEUE_ITEMS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select();

    if (error) {
      console.error('Error updating approval queue item:', error);
      throw new Error(`Failed to update approval queue item: ${error.message}`);
    }

    return mapApprovalQueueItemData(data?.[0]);
  }

  static subscribeToApprovalQueues(callback: (payload: any) => void) {
    return supabase
      .channel('approval-queues-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.APPROVAL_QUEUES },
        callback
      )
      .subscribe();
  }

  static subscribeToApprovalQueueItems(callback: (payload: any) => void) {
    return supabase
      .channel('approval-queue-items-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.APPROVAL_QUEUE_ITEMS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // SYSTEM CONFIGURATION METHODS
  // =============================================================================

  // Feature Flags
  static async getFeatureFlags(organizationId?: string) {
    console.log('Fetching feature flags for organization:', organizationId);
    
    let query = supabase
      .from(SUPABASE_TABLES.FEATURE_FLAGS)
      .select(`
        id,
        organization_id,
        flag_name,
        flag_value,
        description,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feature flags:', error);
      return [];
    }

    return data?.map(mapFeatureFlagData) || [];
  }

  static async createFeatureFlag(flagData: {
    organizationId?: string;
    flagName: string;
    flagValue: boolean;
    description?: string;
  }) {
    console.log('Creating feature flag:', flagData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FEATURE_FLAGS)
      .insert({
        organization_id: flagData.organizationId || null,
        flag_name: flagData.flagName,
        flag_value: flagData.flagValue,
        description: flagData.description,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating feature flag:', error);
      throw new Error(`Failed to create feature flag: ${error.message}`);
    }

    return mapFeatureFlagData(data?.[0]);
  }

  static async updateFeatureFlag(flagId: string, updates: {
    flagValue?: boolean;
    description?: string;
    isActive?: boolean;
  }) {
    console.log('Updating feature flag:', flagId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FEATURE_FLAGS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', flagId)
      .select();

    if (error) {
      console.error('Error updating feature flag:', error);
      throw new Error(`Failed to update feature flag: ${error.message}`);
    }

    return mapFeatureFlagData(data?.[0]);
  }

  static async deleteFeatureFlag(flagId: string) {
    console.log('Deleting feature flag:', flagId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.FEATURE_FLAGS)
      .delete()
      .eq('id', flagId);

    if (error) {
      console.error('Error deleting feature flag:', error);
      throw new Error(`Failed to delete feature flag: ${error.message}`);
    }
  }

  // =============================================================================
  // CUSTOMER ACQUISITION & CASE MANAGEMENT (Salesperson Core Features)
  // =============================================================================



  // Update case status and information
  static async updateCaseStatus(caseId: string, status: string, notes?: string) {
    console.log('🔍 Updating case status:', caseId, status);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select();

    if (error) {
      console.error('Error updating case status:', error);
      throw new Error(`Failed to update case status: ${error.message}`);
    }

    return data?.[0];
  }

  // Assign case to user
  static async assignCase(caseId: string, assignedTo: string) {
    console.log('🔍 Assigning case:', caseId, 'to user:', assignedTo);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({
        assigned_to: assignedTo,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select();

    if (error) {
      console.error('Error assigning case:', error);
      throw new Error(`Failed to assign case: ${error.message}`);
    }

    return data?.[0];
  }

  // Get cases with filtering and customer information
  static async getCasesWithDetails(filters?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    organizationId?: string;
    customerId?: string;
  }) {
    console.log('🔍 Fetching cases with details:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.CASES)
      .select(`
        id,
        case_number,
        customer_id,
        assigned_to,
        loan_type,
        loan_amount,
        status,
        priority,
        notes,
        created_at,
        updated_at,
        customers!inner(
          id,
          user_id,
          full_name,
          pan_number,
          kyc_status,
          risk_profile,
          monthly_income,
          employment_type,
          email,
          mobile,
          phone
        ),
        users(
          id,
          full_name,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cases:', error);
      return [];
    }

    return data?.map(mapCaseData) || [];
  }

  // Get customers with KYC status
  static async getCustomers(filters?: {
    kycStatus?: string;
    organizationId?: string;
  }) {
    console.log('🔍 Fetching customers:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .select(`
        id,
        full_name,
        dob,
        mobile,
        email,
        address,
        external_customer_code,
        kyc_status,
        metadata,
        organization_id,
        created_at,
        updated_at,
        phone,
        pan_number,
        aadhaar_number,
        date_of_birth,
        gender,
        marital_status,
        employment_type,
        risk_profile,
        deleted_at,
        user_id
      `)
      .order('created_at', { ascending: false });

    if (filters?.kycStatus) {
      query = query.eq('kyc_status', filters.kycStatus);
    }
    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    console.log('✅ Customers fetched successfully:', data?.length || 0, 'customers');
    console.log('📋 Raw data:', data);

    return data?.map(customer => ({
      id: customer.id.toString(),
      fullName: customer.full_name,
      dob: customer.dob,
      mobile: customer.mobile,
      email: customer.email,
      address: customer.address,
      externalCustomerCode: customer.external_customer_code,
      kycStatus: customer.kyc_status,
      metadata: customer.metadata,
      organizationId: customer.organization_id?.toString(),
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      phone: customer.phone,
      panNumber: customer.pan_number,
      aadhaarNumber: customer.aadhaar_number,
      dateOfBirth: customer.date_of_birth,
      gender: customer.gender,
      maritalStatus: customer.marital_status,
      employmentType: customer.employment_type,
      riskProfile: customer.risk_profile,
      deletedAt: customer.deleted_at,
      userId: customer.user_id?.toString()
    })) || [];
  }

  // Update customer KYC status
  static async updateCustomerKYC(customerId: string, kycStatus: string, notes?: string) {
    console.log('🔍 Updating customer KYC:', customerId, kycStatus);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .update({
        kyc_status: kycStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select();

    if (error) {
      console.error('Error updating customer KYC:', error);
      throw new Error(`Failed to update customer KYC: ${error.message}`);
    }

    // Log the KYC update
    if (notes) {
      await this.createAuditLog({
        userId: '', // Will be filled from context
        action: 'kyc_status_updated',
        resourceType: 'customer',
        resourceId: customerId,
        details: JSON.stringify({ kycStatus, notes }),
        ipAddress: ''
      });
    }

    return data?.[0];
  }

  // Create customer
  static async createCustomer(customerData: {
    fullName: string;
    email?: string;
    mobile?: string;
    phone?: string;
    address?: string;
    externalCustomerCode?: string;
    kycStatus?: string;
    organizationId?: number;
    panNumber?: string;
    aadhaarNumber?: string;
    dateOfBirth?: string;
    dob?: string;
    gender?: string;
    maritalStatus?: string;
    employmentType?: string;
    riskProfile?: string;
    userId?: number;
  }) {
    console.log('🚀 Creating customer:', customerData);
    console.log('📊 Using table:', SUPABASE_TABLES.CUSTOMERS);
    
    const insertData = {
      full_name: customerData.fullName,
      email: customerData.email,
      mobile: customerData.mobile,
      phone: customerData.phone,
      address: customerData.address,
      external_customer_code: customerData.externalCustomerCode,
      kyc_status: customerData.kycStatus || 'pending',
      organization_id: customerData.organizationId,
      pan_number: customerData.panNumber,
      aadhaar_number: customerData.aadhaarNumber,
      date_of_birth: customerData.dateOfBirth,
      dob: customerData.dob,
      gender: customerData.gender,
      marital_status: customerData.maritalStatus,
      employment_type: customerData.employmentType,
      risk_profile: customerData.riskProfile || 'medium',
      user_id: customerData.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Insert data:', insertData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .insert(insertData)
      .select();

    if (error) {
      console.error('❌ Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    console.log('✅ Customer created successfully:', data);

    // Create audit log for customer creation
    try {
      await AuditLogger.logCustomerCreation(
        data?.[0]?.id?.toString() || 'unknown',
        customerData,
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for customer creation:', auditError);
      // Don't throw here to avoid breaking the main operation
    }

    return data?.[0];
  }

  // Update customer
  static async updateCustomer(customerId: string, updates: {
    fullName?: string;
    email?: string;
    mobile?: string;
    phone?: string;
    address?: string;
    externalCustomerCode?: string;
    kycStatus?: string;
    organizationId?: number;
    panNumber?: string;
    aadhaarNumber?: string;
    dateOfBirth?: string;
    dob?: string;
    gender?: string;
    maritalStatus?: string;
    employmentType?: string;
    riskProfile?: string;
    userId?: number;
  }) {
    console.log('Updating customer:', customerId, updates);
    
    // Get the current customer data for audit logging
    const { data: currentData } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .select('*')
      .eq('id', customerId)
      .single();
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map frontend fields to database fields
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.mobile !== undefined) updateData.mobile = updates.mobile;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.externalCustomerCode !== undefined) updateData.external_customer_code = updates.externalCustomerCode;
    if (updates.kycStatus !== undefined) updateData.kyc_status = updates.kycStatus;
    if (updates.organizationId !== undefined) updateData.organization_id = updates.organizationId;
    if (updates.panNumber !== undefined) updateData.pan_number = updates.panNumber;
    if (updates.aadhaarNumber !== undefined) updateData.aadhaar_number = updates.aadhaarNumber;
    if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth;
    if (updates.dob !== undefined) updateData.dob = updates.dob;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.maritalStatus !== undefined) updateData.marital_status = updates.maritalStatus;
    if (updates.employmentType !== undefined) updateData.employment_type = updates.employmentType;
    if (updates.riskProfile !== undefined) updateData.risk_profile = updates.riskProfile;
    if (updates.userId !== undefined) updateData.user_id = updates.userId;
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .update(updateData)
      .eq('id', customerId)
      .select();

    if (error) {
      console.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    // Create audit log for customer update
    try {
      await AuditLogger.logCustomerUpdate(
        customerId,
        currentData,
        data?.[0],
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for customer update:', auditError);
      // Don't throw here to avoid breaking the main operation
    }

    return data?.[0];
  }

  // Delete customer with cascading delete for related records
  static async deleteCustomer(customerId: string) {
    console.log('Deleting customer:', customerId);
    
    // Get the current customer data for audit logging
    const { data: currentData } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .select('*')
      .eq('id', customerId)
      .single();
    
    if (!currentData) {
      throw new Error('Customer not found');
    }

    try {
      // Step 1: Delete related workflow instances first
      console.log('Deleting related workflow instances...');
      const { error: workflowError } = await supabase
        .from('workflow_instances')
        .delete()
        .eq('case_id', customerId);

      if (workflowError && !workflowError.message.includes('does not exist')) {
        console.error('Error deleting workflow instances:', workflowError);
        throw new Error(`Failed to delete workflow instances: ${workflowError.message}`);
      }

      // Step 2: Delete related cases (loan applications)
      console.log('Deleting related cases...');
      const { error: casesError } = await supabase
        .from('cases')
        .delete()
        .eq('customer_id', customerId);

      if (casesError && !casesError.message.includes('does not exist')) {
        console.error('Error deleting cases:', casesError);
        throw new Error(`Failed to delete cases: ${casesError.message}`);
      }

      // Step 3: Delete related documents
      console.log('Deleting related documents...');
      const { error: documentsError } = await supabase
        .from('documents')
        .delete()
        .eq('customer_id', customerId);

      if (documentsError && !documentsError.message.includes('does not exist')) {
        console.error('Error deleting documents:', documentsError);
        throw new Error(`Failed to delete documents: ${documentsError.message}`);
      }

      // Step 4: Delete related tasks
      console.log('Deleting related tasks...');
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('customer_id', customerId);

      if (tasksError && !tasksError.message.includes('does not exist')) {
        console.error('Error deleting tasks:', tasksError);
        throw new Error(`Failed to delete tasks: ${tasksError.message}`);
      }

      // Step 5: Delete related notifications
      console.log('Deleting related notifications...');
      const { error: notificationsError } = await supabase
        .from('notifications')
        .delete()
        .eq('customer_id', customerId);

      if (notificationsError && !notificationsError.message.includes('does not exist')) {
        console.error('Error deleting notifications:', notificationsError);
        throw new Error(`Failed to delete notifications: ${notificationsError.message}`);
      }

      // Step 6: Finally delete the customer
      console.log('Deleting customer record...');
      const { error } = await supabase
        .from(SUPABASE_TABLES.CUSTOMERS)
        .delete()
        .eq('id', customerId);

      if (error) {
        console.error('Error deleting customer:', error);
        throw new Error(`Failed to delete customer: ${error.message}`);
      }

      console.log('✅ Customer and all related records deleted successfully');

    } catch (error) {
      console.error('Error in cascading delete:', error);
      throw error;
    }

    // Create audit log for customer deletion
    try {
      await AuditLogger.logCustomerDeletion(
        customerId,
        currentData,
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for customer deletion:', auditError);
      // Don't throw here to avoid breaking the main operation
    }
  }

  // System Integrations
  static async getSystemIntegrations(organizationId: string) {
    console.log('Fetching system integrations for organization:', organizationId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_INTEGRATIONS)
      .select(`
        id,
        organization_id,
        integration_name,
        integration_type,
        status,
        configuration,
        credentials,
        last_sync_at,
        error_message,
        created_at,
        updated_at
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching system integrations:', error);
      return [];
    }

    return data?.map(mapSystemIntegrationData) || [];
  }

  static async createSystemIntegration(integrationData: {
    organizationId: string;
    integrationName: string;
    integrationType: string;
    configuration: any;
    credentials?: any;
  }) {
    console.log('Creating system integration:', integrationData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_INTEGRATIONS)
      .insert({
        organization_id: integrationData.organizationId,
        integration_name: integrationData.integrationName,
        integration_type: integrationData.integrationType,
        status: 'inactive',
        configuration: integrationData.configuration,
        credentials: integrationData.credentials,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating system integration:', error);
      throw new Error(`Failed to create system integration: ${error.message}`);
    }

    return mapSystemIntegrationData(data?.[0]);
  }

  static async updateSystemIntegration(integrationId: string, updates: {
    status?: string;
    configuration?: any;
    credentials?: any;
    lastSyncAt?: string;
    errorMessage?: string;
  }) {
    console.log('Updating system integration:', integrationId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_INTEGRATIONS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId)
      .select();

    if (error) {
      console.error('Error updating system integration:', error);
      throw new Error(`Failed to update system integration: ${error.message}`);
    }

    return mapSystemIntegrationData(data?.[0]);
  }

  static async deleteSystemIntegration(integrationId: string) {
    console.log('Deleting system integration:', integrationId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_INTEGRATIONS)
      .delete()
      .eq('id', integrationId);

    if (error) {
      console.error('Error deleting system integration:', error);
      throw new Error(`Failed to delete system integration: ${error.message}`);
    }
  }

  // System Settings
  static async getSystemSettings(category?: string) {
    console.log('Fetching system settings for category:', category);
    
    let query = supabase
      .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
      .select(`
        id,
        key,
        value,
        description,
        category,
        is_encrypted,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching system settings:', error);
      return [];
    }

    return data?.map(mapSystemSettingData) || [];
  }

  // Get Super Admin Dynamic Password
  static async getSuperAdminPassword(): Promise<string> {
    console.log('🔐 Fetching Super Admin dynamic password from system settings...');
    
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
        .select('value')
        .eq('key', 'super_admin_password')
        .eq('category', 'security')
        .single();

      if (error) {
        console.error('❌ Error fetching super admin password:', error);
        // Return a default password if not found
        return 'superadmin123';
      }

      const password = data?.value || 'superadmin123';
      console.log('✅ Super Admin password retrieved successfully');
      return password;
    } catch (error) {
      console.error('❌ Error fetching super admin password:', error);
      return 'superadmin123';
    }
  }

  // Set Super Admin Dynamic Password
  static async setSuperAdminPassword(newPassword: string): Promise<void> {
    console.log('🔐 Setting Super Admin dynamic password...');
    
    try {
      // First, try to update existing setting
      const { data: existingData, error: updateError } = await supabase
        .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
        .update({
          value: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'super_admin_password')
        .eq('category', 'security')
        .select();

      if (updateError || !existingData || existingData.length === 0) {
        // If update failed, create new setting
        console.log('Creating new super admin password setting...');
        const { error: insertError } = await supabase
          .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
          .insert({
            key: 'super_admin_password',
            value: newPassword,
            description: 'Dynamic password for Super Admin login',
            category: 'security',
            is_encrypted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ Error creating super admin password setting:', insertError);
          throw new Error(`Failed to set super admin password: ${insertError.message}`);
        }
      }

      console.log('✅ Super Admin password updated successfully');
      
      // Log the password change for audit purposes
      try {
        await AuditLogger.log({
          userId: AuditLogger.getCurrentUserId(),
          action: 'UPDATE',
          entityType: 'system',
          entityId: null,
          beforeState: null,
          afterState: {
            setting: 'super_admin_password',
            action: 'password_updated'
          },
          metadata: {
            operation: 'super_admin_password_update',
            updatedBy: AuditLogger.getCurrentUserId(),
            timestamp: new Date().toISOString()
          }
        });
      } catch (auditError) {
        console.error('Error creating audit log for password update:', auditError);
      }
      
    } catch (error) {
      console.error('❌ Error setting super admin password:', error);
      throw error;
    }
  }

  static async createSystemSetting(settingData: {
    key: string;
    value?: string;
    description?: string;
    category?: string;
    isEncrypted?: boolean;
  }) {
    console.log('Creating system setting:', settingData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
      .insert({
        key: settingData.key,
        value: settingData.value,
        description: settingData.description,
        category: settingData.category || 'general',
        is_encrypted: settingData.isEncrypted || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating system setting:', error);
      throw new Error(`Failed to create system setting: ${error.message}`);
    }

    return mapSystemSettingData(data?.[0]);
  }

  static async updateSystemSetting(settingId: string, updates: {
    value?: string;
    description?: string;
    category?: string;
    isEncrypted?: boolean;
  }) {
    console.log('Updating system setting:', settingId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', settingId)
      .select();

    if (error) {
      console.error('Error updating system setting:', error);
      throw new Error(`Failed to update system setting: ${error.message}`);
    }

    return mapSystemSettingData(data?.[0]);
  }

  static async deleteSystemSetting(settingId: string) {
    console.log('Deleting system setting:', settingId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.SYSTEM_SETTINGS)
      .delete()
      .eq('id', settingId);

    if (error) {
      console.error('Error deleting system setting:', error);
      throw new Error(`Failed to delete system setting: ${error.message}`);
    }
  }

  // Organization Settings
  static async getOrganizationSettings(organizationId: string, category?: string) {
    console.log('Fetching organization settings for organization:', organizationId, 'category:', category);
    
    let query = supabase
      .from(SUPABASE_TABLES.ORGANIZATION_SETTINGS)
      .select(`
        id,
        organization_id,
        key,
        value,
        description,
        category,
        is_encrypted,
        created_at,
        updated_at
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching organization settings:', error);
      return [];
    }

    return data?.map(mapOrganizationSettingData) || [];
  }

  static async createOrganizationSetting(settingData: {
    organizationId: string;
    key: string;
    value?: string;
    description?: string;
    category?: string;
    isEncrypted?: boolean;
  }) {
    console.log('Creating organization setting:', settingData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATION_SETTINGS)
      .insert({
        organization_id: settingData.organizationId,
        key: settingData.key,
        value: settingData.value,
        description: settingData.description,
        category: settingData.category || 'general',
        is_encrypted: settingData.isEncrypted || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating organization setting:', error);
      throw new Error(`Failed to create organization setting: ${error.message}`);
    }

    return mapOrganizationSettingData(data?.[0]);
  }

  static async updateOrganizationSetting(settingId: string, updates: {
    value?: string;
    description?: string;
    category?: string;
    isEncrypted?: boolean;
  }) {
    console.log('Updating organization setting:', settingId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATION_SETTINGS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', settingId)
      .select();

    if (error) {
      console.error('Error updating organization setting:', error);
      throw new Error(`Failed to update organization setting: ${error.message}`);
    }

    return mapOrganizationSettingData(data?.[0]);
  }

  static async deleteOrganizationSetting(settingId: string) {
    console.log('Deleting organization setting:', settingId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATION_SETTINGS)
      .delete()
      .eq('id', settingId);

    if (error) {
      console.error('Error deleting organization setting:', error);
      throw new Error(`Failed to delete organization setting: ${error.message}`);
    }
  }

  // Real-time subscriptions for system configuration
  static subscribeToFeatureFlags(callback: (payload: any) => void) {
    return supabase
      .channel('feature-flags-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.FEATURE_FLAGS },
        callback
      )
      .subscribe();
  }

  static subscribeToSystemIntegrations(callback: (payload: any) => void) {
    return supabase
      .channel('system-integrations-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.SYSTEM_INTEGRATIONS },
        callback
      )
      .subscribe();
  }

  static subscribeToSystemSettings(callback: (payload: any) => void) {
    return supabase
      .channel('system-settings-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.SYSTEM_SETTINGS },
        callback
      )
      .subscribe();
  }

  static subscribeToOrganizationSettings(callback: (payload: any) => void) {
    return supabase
      .channel('organization-settings-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.ORGANIZATION_SETTINGS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // COMPLIANCE MANAGEMENT METHODS
  // =============================================================================

  static async getComplianceIssueTypes(filters?: { category?: string; isActive?: boolean }) {
    console.log('Fetching compliance issue types with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.COMPLIANCE_ISSUE_TYPES)
      .select(`
        id,
        name,
        description,
        category,
        severity,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching compliance issue types:', error);
      return [];
    }

    return data?.map(mapComplianceIssueTypeData) || [];
  }

  static async getComplianceIssues(filters?: {
    status?: string;
    severity?: string;
    priority?: string;
    assignedTo?: string;
    caseId?: string;
    customerId?: string;
  }) {
    console.log('Fetching compliance issues with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.COMPLIANCE_ISSUES)
      .select(`
        id,
        issue_type_id,
        case_id,
        customer_id,
        title,
        description,
        status,
        severity,
        priority,
        assigned_to,
        reported_by,
        reported_at,
        resolved_at,
        due_date,
        resolution,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters?.caseId) {
      query = query.eq('case_id', filters.caseId);
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching compliance issues:', error);
      return [];
    }

    return data?.map(mapComplianceIssueData) || [];
  }

  static async getComplianceIssueComments(issueId: string) {
    console.log('Fetching compliance issue comments for issue:', issueId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.COMPLIANCE_ISSUE_COMMENTS)
      .select(`
        id,
        issue_id,
        user_id,
        comment,
        is_internal,
        metadata,
        created_at,
        updated_at
      `)
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching compliance issue comments:', error);
      return [];
    }

    return data?.map(mapComplianceIssueCommentData) || [];
  }

  static async getComplianceReports(filters?: {
    reportType?: string;
    status?: string;
    generatedBy?: string;
  }) {
    console.log('Fetching compliance reports with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.COMPLIANCE_REPORTS)
      .select(`
        id,
        template_id,
        name,
        description,
        report_type,
        status,
        generated_by,
        generated_at,
        data,
        file_path,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.reportType) {
      query = query.eq('report_type', filters.reportType);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.generatedBy) {
      query = query.eq('generated_by', filters.generatedBy);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching compliance reports:', error);
      return [];
    }

    return data?.map(mapComplianceReportData) || [];
  }

  static async getReportTemplates(filters?: { reportType?: string; isActive?: boolean }) {
    console.log('Fetching report templates with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.REPORT_TEMPLATES)
      .select(`
        id,
        name,
        description,
        report_type,
        query,
        parameters,
        is_active,
        created_by,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.reportType) {
      query = query.eq('report_type', filters.reportType);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching report templates:', error);
      return [];
    }

    return data?.map(mapReportTemplateData) || [];
  }

  static async getScheduledReports(filters?: { isActive?: boolean }) {
    console.log('Fetching scheduled reports with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.SCHEDULED_REPORTS)
      .select(`
        id,
        template_id,
        name,
        description,
        schedule,
        is_active,
        last_run_at,
        next_run_at,
        created_by,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scheduled reports:', error);
      return [];
    }

    return data?.map(mapScheduledReportData) || [];
  }

  static async getReportExecutions(filters?: {
    scheduledReportId?: string;
    templateId?: string;
    status?: string;
  }) {
    console.log('Fetching report executions with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.REPORT_EXECUTIONS)
      .select(`
        id,
        scheduled_report_id,
        template_id,
        status,
        started_at,
        completed_at,
        error_message,
        report_id,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.scheduledReportId) {
      query = query.eq('scheduled_report_id', filters.scheduledReportId);
    }
    if (filters?.templateId) {
      query = query.eq('template_id', filters.templateId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching report executions:', error);
      return [];
    }

    return data?.map(mapReportExecutionData) || [];
  }

  // Real-time subscriptions for compliance management
  static subscribeToComplianceIssues(callback: (payload: any) => void) {
    return supabase
      .channel('compliance-issues-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.COMPLIANCE_ISSUES },
        callback
      )
      .subscribe();
  }

  static subscribeToComplianceReports(callback: (payload: any) => void) {
    return supabase
      .channel('compliance-reports-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.COMPLIANCE_REPORTS },
        callback
      )
      .subscribe();
  }

  static subscribeToReportExecutions(callback: (payload: any) => void) {
    return supabase
      .channel('report-executions-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.REPORT_EXECUTIONS },
        callback
      )
      .subscribe();
  }

  // Approval Queue and Case Management Methods
  static async approveCase(caseId: string, approvalData: {
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  }) {
    console.log('Approving case:', caseId, approvalData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({
        status: 'approved',
        approved_by: approvalData.approvedBy,
        approved_at: approvalData.approvedAt,
        approval_notes: approvalData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select();

    if (error) {
      console.error('Error approving case:', error);
      throw new Error(`Failed to approve case: ${error.message}`);
    }

    // Create audit log
    await this.createAuditLog({
      userId: approvalData.approvedBy,
      action: 'case_approved',
      resourceType: 'case',
      resourceId: caseId,
      details: `Case approved with notes: ${approvalData.notes || 'No notes'}`,
      metadata: { approvalData }
    });

    return data?.[0];
  }

  static async rejectCase(caseId: string, rejectionData: {
    rejectedBy: string;
    rejectedAt: string;
    reason: string;
  }) {
    console.log('Rejecting case:', caseId, rejectionData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({
        status: 'rejected',
        rejected_by: rejectionData.rejectedBy,
        rejected_at: rejectionData.rejectedAt,
        rejection_reason: rejectionData.reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select();

    if (error) {
      console.error('Error rejecting case:', error);
      throw new Error(`Failed to reject case: ${error.message}`);
    }

    // Create audit log
    await this.createAuditLog({
      userId: rejectionData.rejectedBy,
      action: 'case_rejected',
      resourceType: 'case',
      resourceId: caseId,
      details: `Case rejected: ${rejectionData.reason}`,
      metadata: { rejectionData }
    });

    return data?.[0];
  }

  // Compliance Issue Management
  static async resolveComplianceIssue(issueId: string, resolutionData: {
    resolvedBy: string;
    resolvedAt: string;
    resolutionNotes: string;
  }) {
    console.log('Resolving compliance issue:', issueId, resolutionData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.COMPLIANCE_ISSUES)
      .update({
        status: 'resolved',
        resolved_by: resolutionData.resolvedBy,
        resolved_at: resolutionData.resolvedAt,
        resolution_notes: resolutionData.resolutionNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select();

    if (error) {
      console.error('Error resolving compliance issue:', error);
      throw new Error(`Failed to resolve compliance issue: ${error.message}`);
    }

    // Create audit log
    await this.createAuditLog({
      userId: resolutionData.resolvedBy,
      action: 'compliance_issue_resolved',
      resourceType: 'compliance_issue',
      resourceId: issueId,
      details: `Compliance issue resolved: ${resolutionData.resolutionNotes}`,
      metadata: { resolutionData }
    });

    return data?.[0];
  }

  static async escalateComplianceIssue(issueId: string, escalationData: {
    escalatedBy: string;
    escalatedAt: string;
    escalationReason: string;
  }) {
    console.log('Escalating compliance issue:', issueId, escalationData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.COMPLIANCE_ISSUES)
      .update({
        status: 'escalated',
        escalated_by: escalationData.escalatedBy,
        escalated_at: escalationData.escalatedAt,
        escalation_reason: escalationData.escalationReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select();

    if (error) {
      console.error('Error escalating compliance issue:', error);
      throw new Error(`Failed to escalate compliance issue: ${error.message}`);
    }

    // Create audit log
    await this.createAuditLog({
      userId: escalationData.escalatedBy,
      action: 'compliance_issue_escalated',
      resourceType: 'compliance_issue',
      resourceId: issueId,
      details: `Compliance issue escalated: ${escalationData.escalationReason}`,
      metadata: { escalationData }
    });

    return data?.[0];
  }

  // Pending Reviews Management
  static async getPendingReviews(filters?: {
    reviewType?: string;
    sortBy?: string;
  }) {
    console.log('Fetching pending reviews with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.CASES)
      .select(`
        id,
        case_number,
        customer_name,
        customer_phone,
        loan_type,
        loan_amount,
        status,
        priority,
        assigned_to,
        submitted_at,
        created_at,
        updated_at
      `)
      .in('status', ['new', 'in-progress', 'review']);

    if (filters?.reviewType) {
      query = query.eq('review_type', filters.reviewType);
    }

    // Apply sorting
    if (filters?.sortBy === 'priority') {
      query = query.order('priority', { ascending: false });
    } else if (filters?.sortBy === 'time') {
      query = query.order('submitted_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }

    // Transform data to match expected format
    return data?.map(item => ({
      id: item.id,
      caseId: item.id,
      customer: item.customer_name,
      phone: item.customer_phone,
      loanType: item.loan_type,
      amount: `₹${item.loan_amount}L`,
      reviewType: 'final_approval',
      priority: item.priority || 'medium',
      submittedBy: 'System',
      submittedAt: item.submitted_at || item.created_at,
      waitTime: this.calculateWaitTime(item.submitted_at || item.created_at),
      documentsComplete: 95,
      creditScore: 720,
      riskRating: 'medium',
      reviewNotes: 'Ready for review'
    })) || [];
  }

  static async approveReview(reviewId: string, approvalData: {
    approvedBy: string;
    approvedAt: string;
    approvalNotes: string;
  }) {
    console.log('Approving review:', reviewId, approvalData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({
        status: 'approved',
        approved_by: approvalData.approvedBy,
        approved_at: approvalData.approvedAt,
        approval_notes: approvalData.approvalNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select();

    if (error) {
      console.error('Error approving review:', error);
      throw new Error(`Failed to approve review: ${error.message}`);
    }

    // Create audit log
    await this.createAuditLog({
      userId: approvalData.approvedBy,
      action: 'review_approved',
      resourceType: 'case',
      resourceId: reviewId,
      details: `Review approved: ${approvalData.approvalNotes}`,
      metadata: { approvalData }
    });

    return data?.[0];
  }

  static async rejectReview(reviewId: string, rejectionData: {
    rejectedBy: string;
    rejectedAt: string;
    rejectionReason: string;
  }) {
    console.log('Rejecting review:', reviewId, rejectionData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({
        status: 'rejected',
        rejected_by: rejectionData.rejectedBy,
        rejected_at: rejectionData.rejectedAt,
        rejection_reason: rejectionData.rejectionReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select();

    if (error) {
      console.error('Error rejecting review:', error);
      throw new Error(`Failed to reject review: ${error.message}`);
    }

    // Create audit log
    await this.createAuditLog({
      userId: rejectionData.rejectedBy,
      action: 'review_rejected',
      resourceType: 'case',
      resourceId: reviewId,
      details: `Review rejected: ${rejectionData.rejectionReason}`,
      metadata: { rejectionData }
    });

    return data?.[0];
  }

  static async requestAdditionalInfo(reviewId: string, requestData: {
    requestedBy: string;
    requestedAt: string;
    infoRequest: string;
  }) {
    console.log('Requesting additional info for review:', reviewId, requestData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASES)
      .update({
        status: 'additional_info_required',
        info_requested_by: requestData.requestedBy,
        info_requested_at: requestData.requestedAt,
        info_request: requestData.infoRequest,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select();

    if (error) {
      console.error('Error requesting additional info:', error);
      throw new Error(`Failed to request additional info: ${error.message}`);
    }

    // Create audit log
    await this.createAuditLog({
      userId: requestData.requestedBy,
      action: 'additional_info_requested',
      resourceType: 'case',
      resourceId: reviewId,
      details: `Additional info requested: ${requestData.infoRequest}`,
      metadata: { requestData }
    });

    return data?.[0];
  }

  // Compliance Reports and Analytics
  static async getComplianceMetrics(period: string) {
    console.log('Fetching compliance metrics for period:', period);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    try {
      // Get compliance statistics
      const [totalCases, amlPassed, kycCompleted, docVerified] = await Promise.all([
        supabase.from(SUPABASE_TABLES.CASES).select('id', { count: 'exact' }).gte('created_at', startDate.toISOString()),
        supabase.from(SUPABASE_TABLES.COMPLIANCE_ISSUES).select('id', { count: 'exact' }).eq('type', 'aml').eq('status', 'resolved').gte('created_at', startDate.toISOString()),
        supabase.from(SUPABASE_TABLES.CASES).select('id', { count: 'exact' }).eq('kyc_status', 'completed').gte('created_at', startDate.toISOString()),
        supabase.from(SUPABASE_TABLES.DOCUMENTS).select('id', { count: 'exact' }).eq('verification_status', 'verified').gte('created_at', startDate.toISOString())
      ]);

      const total = totalCases.count || 0;
      const amlCount = amlPassed.count || 0;
      const kycCount = kycCompleted.count || 0;
      const docCount = docVerified.count || 0;

      return [
        {
          label: 'Overall Compliance Score',
          value: `${((amlCount + kycCount + docCount) / (total * 3) * 100).toFixed(1)}%`,
          change: '+0.3%',
          trend: 'up',
          target: '98%',
          status: 'excellent'
        },
        {
          label: 'AML Screening Pass Rate',
          value: total > 0 ? `${(amlCount / total * 100).toFixed(1)}%` : '100%',
          change: '0%',
          trend: 'stable',
          target: '100%',
          status: 'excellent'
        },
        {
          label: 'KYC Completion Rate',
          value: total > 0 ? `${(kycCount / total * 100).toFixed(1)}%` : '97.8%',
          change: '+1.2%',
          trend: 'up',
          target: '95%',
          status: 'good'
        },
        {
          label: 'Document Verification Rate',
          value: total > 0 ? `${(docCount / total * 100).toFixed(1)}%` : '96.2%',
          change: '-0.5%',
          trend: 'down',
          target: '95%',
          status: 'good'
        }
      ];
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
      return [];
    }
  }

  static async getComplianceAlerts(period: string) {
    console.log('Fetching compliance alerts for period:', period);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.COMPLIANCE_ISSUES)
      .select(`
        id,
        case_id,
        type,
        severity,
        description,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching compliance alerts:', error);
      return [];
    }

    return data?.map(issue => ({
      id: issue.id,
      type: issue.type,
      severity: issue.severity,
      title: `${issue.type.replace('_', ' ').toUpperCase()} Issue`,
      description: issue.description,
      timestamp: issue.created_at,
      status: issue.status,
      caseId: issue.case_id
    })) || [];
  }

  static async getComplianceBreakdown(period: string) {
    console.log('Fetching compliance breakdown for period:', period);
    
    // This would typically involve complex queries, but for now we'll return mock data
    return [
      {
        category: 'Identity Verification',
        total: 1247,
        compliant: 1235,
        rate: '99.0%',
        issues: 12,
        trend: 'stable'
      },
      {
        category: 'Financial Documentation',
        total: 1247,
        compliant: 1198,
        rate: '96.1%',
        issues: 49,
        trend: 'improving'
      },
      {
        category: 'AML Screening',
        total: 1247,
        compliant: 1247,
        rate: '100%',
        issues: 0,
        trend: 'stable'
      },
      {
        category: 'Credit Assessment',
        total: 1247,
        compliant: 1189,
        rate: '95.3%',
        issues: 58,
        trend: 'declining'
      },
      {
        category: 'Regulatory Compliance',
        total: 1247,
        compliant: 1223,
        rate: '98.1%',
        issues: 24,
        trend: 'improving'
      }
    ];
  }

  static async generateComplianceReport(reportData: {
    reportType: string;
    period: string;
    generatedBy: string;
  }) {
    console.log('Generating compliance report:', reportData);
    
    const reportId = `compliance-${reportData.reportType}-${Date.now()}`;
    
    // Generate report data based on type
    let reportContent: any = {
      reportId,
      type: reportData.reportType,
      period: reportData.period,
      generatedBy: reportData.generatedBy,
      generatedAt: new Date().toISOString(),
      data: {}
    };

    switch (reportData.reportType) {
      case 'overview':
        reportContent.data = {
          metrics: await this.getComplianceMetrics(reportData.period),
          alerts: await this.getComplianceAlerts(reportData.period),
          breakdown: await this.getComplianceBreakdown(reportData.period)
        };
        break;
      case 'aml':
        reportContent.data = {
          alerts: await this.getComplianceAlerts(reportData.period),
          metrics: await this.getComplianceMetrics(reportData.period)
        };
        break;
      case 'kyc':
        reportContent.data = {
          metrics: await this.getComplianceMetrics(reportData.period),
          breakdown: await this.getComplianceBreakdown(reportData.period)
        };
        break;
      default:
        reportContent.data = {
          metrics: await this.getComplianceMetrics(reportData.period),
          alerts: await this.getComplianceAlerts(reportData.period),
          breakdown: await this.getComplianceBreakdown(reportData.period)
        };
    }

    // Save report execution record
    await supabase.from(SUPABASE_TABLES.REPORT_EXECUTIONS).insert({
      report_type: reportData.reportType,
      parameters: { period: reportData.period },
      generated_by: reportData.generatedBy,
      status: 'completed',
      result_data: reportContent,
      created_at: new Date().toISOString()
    });

    return reportContent;
  }

  // System Settings Management
  static async getSystemHealth() {
    console.log('Fetching system health status...');
    
    // This would typically check actual system metrics
    // For now, return mock health data
    return [
      { service: 'API Gateway', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' },
      { service: 'Database', status: 'healthy', uptime: '99.8%', lastCheck: '1 min ago' },
      { service: 'WhatsApp Integration', status: 'healthy', uptime: '100%', lastCheck: '30 sec ago' },
      { service: 'Document Storage', status: 'warning', uptime: '99.7%', lastCheck: '5 min ago' },
      { service: 'Authentication', status: 'healthy', uptime: '100%', lastCheck: '1 min ago' },
      { service: 'Compliance Engine', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' }
    ];
  }

  // Helper method to calculate wait time
  private static calculateWaitTime(submittedAt: string): string {
    const now = new Date();
    const submitted = new Date(submittedAt);
    const diffMs = now.getTime() - submitted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  }

  // Real-time subscriptions
  static subscribeToApprovalQueueUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('approval-queue-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CASES },
        callback
      )
      .subscribe();
  }

  static subscribeToComplianceUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('compliance-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.COMPLIANCE_ISSUES },
        callback
      )
      .subscribe();
  }

  static subscribeToPendingReviewsUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('pending-reviews-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CASES },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // CORE BUSINESS TABLES - MISSING INTEGRATIONS
  // =============================================================================




  // Employment Types Management
  static async getEmploymentTypes(filters?: { isActive?: boolean }) {
    console.log('Fetching employment types with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.EMPLOYMENT_TYPES)
      .select(`
        id,
        name,
        code,
        description,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true });

    // Apply filters
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching employment types:', error);
      return [];
    }

    return data?.map(employmentType => ({
      id: employmentType.id,
      name: employmentType.name,
      code: employmentType.code,
      description: employmentType.description,
      isActive: employmentType.is_active,
      metadata: employmentType.metadata,
      createdAt: employmentType.created_at,
      updatedAt: employmentType.updated_at,
    })) || [];
  }

  static async createEmploymentType(employmentTypeData: any) {
    console.log('Creating employment type:', employmentTypeData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.EMPLOYMENT_TYPES)
      .insert({
        ...employmentTypeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating employment type:', error);
      throw new Error(`Failed to create employment type: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateEmploymentType(employmentTypeId: string, updates: Partial<{
    name: string;
    code: string;
    description: string;
    isActive: boolean;
    metadata: any;
  }>) {
    console.log('Updating employment type:', employmentTypeId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.EMPLOYMENT_TYPES)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', employmentTypeId)
      .select();

    if (error) {
      console.error('Error updating employment type:', error);
      throw new Error(`Failed to update employment type: ${error.message}`);
    }

    return data?.[0];
  }

  static async deleteEmploymentType(employmentTypeId: string) {
    console.log('Deleting employment type:', employmentTypeId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.EMPLOYMENT_TYPES)
      .delete()
      .eq('id', employmentTypeId);

    if (error) {
      console.error('Error deleting employment type:', error);
      throw new Error(`Failed to delete employment type: ${error.message}`);
    }
  }

  // Task Types Management
  static async getTaskTypes(filters?: { 
    category?: string; 
    isActive?: boolean;
  }) {
    console.log('Fetching task types with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.TASK_TYPES)
      .select(`
        id,
        name,
        code,
        description,
        category,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching task types:', error);
      return [];
    }

    return data?.map(taskType => ({
      id: taskType.id,
      name: taskType.name,
      code: taskType.code,
      description: taskType.description,
      category: taskType.category,
      isActive: taskType.is_active,
      metadata: taskType.metadata,
      createdAt: taskType.created_at,
      updatedAt: taskType.updated_at,
    })) || [];
  }

  static async createTaskType(taskTypeData: any) {
    console.log('Creating task type:', taskTypeData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASK_TYPES)
      .insert({
        ...taskTypeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating task type:', error);
      throw new Error(`Failed to create task type: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateTaskType(taskTypeId: string, updates: Partial<{
    name: string;
    code: string;
    description: string;
    category: string;
    isActive: boolean;
    metadata: any;
  }>) {
    console.log('Updating task type:', taskTypeId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASK_TYPES)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskTypeId)
      .select();

    if (error) {
      console.error('Error updating task type:', error);
      throw new Error(`Failed to update task type: ${error.message}`);
    }

    return data?.[0];
  }

  static async deleteTaskType(taskTypeId: string) {
    console.log('Deleting task type:', taskTypeId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.TASK_TYPES)
      .delete()
      .eq('id', taskTypeId);

    if (error) {
      console.error('Error deleting task type:', error);
      throw new Error(`Failed to delete task type: ${error.message}`);
    }
  }

  // Task SLA Policies Management
  static async getTaskSlaPolicies(filters?: { 
    taskTypeId?: string; 
    departmentId?: string; 
    priority?: string;
    isActive?: boolean;
  }) {
    console.log('Fetching task SLA policies with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.TASK_SLA_POLICIES)
      .select(`
        id,
        name,
        description,
        task_type_id,
        department_id,
        priority,
        sla_hours,
        escalation_hours,
        is_active,
        metadata,
        created_at,
        updated_at,
        task_types!inner(
          id,
          name,
          code
        ),
        departments!left(
          id,
          name,
          code
        )
      `)
      .order('priority', { ascending: true });

    // Apply filters
    if (filters?.taskTypeId) {
      query = query.eq('task_type_id', filters.taskTypeId);
    }
    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching task SLA policies:', error);
      return [];
    }

    return data?.map(policy => ({
      id: policy.id,
      name: policy.name,
      description: policy.description,
      taskTypeId: policy.task_type_id,
      departmentId: policy.department_id,
      priority: policy.priority,
      slaHours: policy.sla_hours,
      escalationHours: policy.escalation_hours,
      isActive: policy.is_active,
      metadata: policy.metadata,
      createdAt: policy.created_at,
      updatedAt: policy.updated_at,
      taskType: Array.isArray(policy.task_types) ? policy.task_types[0] : policy.task_types,
      department: Array.isArray(policy.departments) ? policy.departments[0] : policy.departments,
    })) || [];
  }

  static async createTaskSlaPolicy(policyData: any) {
    console.log('Creating task SLA policy:', policyData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASK_SLA_POLICIES)
      .insert({
        ...policyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating task SLA policy:', error);
      throw new Error(`Failed to create task SLA policy: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateTaskSlaPolicy(policyId: string, updates: Partial<{
    name: string;
    description: string;
    taskTypeId: string;
    departmentId: string;
    priority: string;
    slaHours: number;
    escalationHours: number;
    isActive: boolean;
    metadata: any;
  }>) {
    console.log('Updating task SLA policy:', policyId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASK_SLA_POLICIES)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', policyId)
      .select();

    if (error) {
      console.error('Error updating task SLA policy:', error);
      throw new Error(`Failed to update task SLA policy: ${error.message}`);
    }

    return data?.[0];
  }

  static async deleteTaskSlaPolicy(policyId: string) {
    console.log('Deleting task SLA policy:', policyId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.TASK_SLA_POLICIES)
      .delete()
      .eq('id', policyId);

    if (error) {
      console.error('Error deleting task SLA policy:', error);
      throw new Error(`Failed to delete task SLA policy: ${error.message}`);
    }
  }

  // Real-time subscriptions for core business tables
  static subscribeToCustomersUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('customers-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CUSTOMERS },
        callback
      )
      .subscribe();
  }

  static subscribeToSubProductsUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('sub-products-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.SUB_PRODUCTS },
        callback
      )
      .subscribe();
  }

  static subscribeToDepartmentsUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('departments-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.DEPARTMENTS },
        callback
      )
      .subscribe();
  }

  static subscribeToEmploymentTypesUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('employment-types-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.EMPLOYMENT_TYPES },
        callback
      )
      .subscribe();
  }

  static subscribeToTaskTypesUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('task-types-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.TASK_TYPES },
        callback
      )
      .subscribe();
  }

  static subscribeToTaskSlaPoliciesUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('task-sla-policies-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.TASK_SLA_POLICIES },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // WORKFLOW & CASE MANAGEMENT METHODS
  // =============================================================================

  // Case Status History Methods
  static async getCaseStatusHistory(caseId?: string, filters?: { status?: string; changed_by?: string }) {
    console.log('Fetching case status history with filters:', { caseId, filters });
    
    let query = supabase
      .from(SUPABASE_TABLES.CASE_STATUS_HISTORY)
      .select(`
        id,
        case_id,
        status,
        previous_status,
        changed_by,
        changed_at,
        reason,
        notes,
        metadata,
        created_at,
        updated_at,
        cases!inner(
          id,
          case_number,
          status,
          priority,
          created_at
        ),
        users!inner(
          id,
          full_name,
          email,
          role
        )
      `)
      .order('changed_at', { ascending: false });

    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.changed_by) {
      query = query.eq('changed_by', filters.changed_by);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching case status history:', error);
      return [];
    }

    return data?.map(item => mapCaseStatusHistoryData(item)) || [];
  }

  static async createCaseStatusHistory(historyData: {
    case_id: string;
    status: string;
    previous_status?: string;
    changed_by: string;
    reason?: string;
    notes?: string;
    metadata?: any;
  }) {
    console.log('Creating case status history:', historyData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASE_STATUS_HISTORY)
      .insert({
        ...historyData,
        changed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating case status history:', error);
      throw new Error(`Failed to create case status history: ${error.message}`);
    }

    return data?.[0];
  }

  // Case Workflow Stage Methods
  static async getCaseWorkflowStages(caseId?: string, filters?: { stage_name?: string; is_active?: boolean }) {
    console.log('Fetching case workflow stages with filters:', { caseId, filters });
    
    let query = supabase
      .from(SUPABASE_TABLES.CASE_WORKFLOW_STAGE)
      .select(`
        id,
        case_id,
        stage_name,
        stage_order,
        is_active,
        started_at,
        completed_at,
        assigned_to,
        stage_data,
        created_at,
        updated_at,
        cases!inner(
          id,
          case_number,
          status,
          priority,
          created_at
        ),
        users!inner(
          id,
          full_name,
          email,
          role
        )
      `)
      .order('stage_order', { ascending: true });

    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    if (filters?.stage_name) {
      query = query.eq('stage_name', filters.stage_name);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching case workflow stages:', error);
      return [];
    }

    return data?.map(item => mapCaseWorkflowStageData(item)) || [];
  }

  static async createCaseWorkflowStage(stageData: {
    case_id: string;
    stage_name: string;
    stage_order: number;
    assigned_to?: string;
    stage_data?: any;
  }) {
    console.log('Creating case workflow stage:', stageData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASE_WORKFLOW_STAGE)
      .insert({
        ...stageData,
        is_active: true,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating case workflow stage:', error);
      throw new Error(`Failed to create case workflow stage: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateCaseWorkflowStage(stageId: string, updates: {
    stage_name?: string;
    is_active?: boolean;
    completed_at?: string;
    assigned_to?: string;
    stage_data?: any;
  }) {
    console.log('Updating case workflow stage:', stageId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CASE_WORKFLOW_STAGE)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', stageId)
      .select();

    if (error) {
      console.error('Error updating case workflow stage:', error);
      throw new Error(`Failed to update case workflow stage: ${error.message}`);
    }

    return data?.[0];
  }

  // Assign Case Setting Methods
  static async getAssignCaseSettings(filters?: { setting_name?: string; is_active?: boolean }) {
    console.log('Fetching assign case settings with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.ASSIGN_CASE_SETTING)
      .select(`
        id,
        setting_name,
        setting_value,
        description,
        is_active,
        priority,
        conditions,
        created_at,
        updated_at
      `)
      .order('priority', { ascending: true });

    if (filters?.setting_name) {
      query = query.eq('setting_name', filters.setting_name);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assign case settings:', error);
      return [];
    }

    return data?.map(item => mapAssignCaseSettingData(item)) || [];
  }

  static async createAssignCaseSetting(settingData: {
    setting_name: string;
    setting_value: string;
    description?: string;
    priority?: number;
    conditions?: any;
  }) {
    console.log('Creating assign case setting:', settingData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ASSIGN_CASE_SETTING)
      .insert({
        ...settingData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating assign case setting:', error);
      throw new Error(`Failed to create assign case setting: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateAssignCaseSetting(settingId: string, updates: {
    setting_name?: string;
    setting_value?: string;
    description?: string;
    is_active?: boolean;
    priority?: number;
    conditions?: any;
  }) {
    console.log('Updating assign case setting:', settingId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ASSIGN_CASE_SETTING)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', settingId)
      .select();

    if (error) {
      console.error('Error updating assign case setting:', error);
      throw new Error(`Failed to update assign case setting: ${error.message}`);
    }

    return data?.[0];
  }

  // Assign Permission Methods
  static async getAssignPermissions(filters?: { role_id?: string; permission_id?: string }) {
    console.log('Fetching assign permissions with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.ASSIGN_PERMISSION)
      .select(`
        id,
        role_id,
        permission_id,
        can_assign,
        can_reassign,
        can_approve,
        can_reject,
        conditions,
        created_at,
        updated_at,
        roles!inner(
          id,
          name,
          description,
          is_active
        ),
        permissions!inner(
          id,
          name,
          description,
          resource,
          action
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.role_id) {
      query = query.eq('role_id', filters.role_id);
    }

    if (filters?.permission_id) {
      query = query.eq('permission_id', filters.permission_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assign permissions:', error);
      return [];
    }

    return data?.map(item => mapAssignPermissionData(item)) || [];
  }

  static async createAssignPermission(permissionData: {
    role_id: string;
    permission_id: string;
    can_assign?: boolean;
    can_reassign?: boolean;
    can_approve?: boolean;
    can_reject?: boolean;
    conditions?: any;
  }) {
    console.log('Creating assign permission:', permissionData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ASSIGN_PERMISSION)
      .insert({
        ...permissionData,
        can_assign: permissionData.can_assign || false,
        can_reassign: permissionData.can_reassign || false,
        can_approve: permissionData.can_approve || false,
        can_reject: permissionData.can_reject || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating assign permission:', error);
      throw new Error(`Failed to create assign permission: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateAssignPermission(permissionId: string, updates: {
    can_assign?: boolean;
    can_reassign?: boolean;
    can_approve?: boolean;
    can_reject?: boolean;
    conditions?: any;
  }) {
    console.log('Updating assign permission:', permissionId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ASSIGN_PERMISSION)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', permissionId)
      .select();

    if (error) {
      console.error('Error updating assign permission:', error);
      throw new Error(`Failed to update assign permission: ${error.message}`);
    }

    return data?.[0];
  }

  // Real-time subscriptions for workflow tables
  static subscribeToCaseStatusHistoryUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('case-status-history-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CASE_STATUS_HISTORY },
        callback
      )
      .subscribe();
  }

  static subscribeToCaseWorkflowStageUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('case-workflow-stage-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CASE_WORKFLOW_STAGE },
        callback
      )
      .subscribe();
  }

  static subscribeToAssignCaseSettingUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('assign-case-setting-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.ASSIGN_CASE_SETTING },
        callback
      )
      .subscribe();
  }

  static subscribeToAssignPermissionUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('assign-permission-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.ASSIGN_PERMISSION },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // BACKGROUND PROCESSING METHODS
  // =============================================================================

  // Job Management
  static async getJobs(filters?: { 
    organizationId?: string; 
    status?: string; 
    jobType?: string; 
    priority?: string;
    limit?: number;
  }) {
    console.log('Fetching jobs with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.JOBS)
      .select(`
        id,
        organization_id,
        job_type,
        job_name,
        payload,
        status,
        priority,
        attempts,
        max_attempts,
        available_at,
        started_at,
        completed_at,
        failed_at,
        error_message,
        error_details,
        batch_id,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.jobType) {
      query = query.eq('job_type', filters.jobType);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return data?.map(mapJobData) || [];
  }

  static async createJob(jobData: {
    organizationId: string;
    jobType: string;
    jobName: string;
    payload: any;
    priority?: string;
    maxAttempts?: number;
    availableAt?: string;
    batchId?: string;
    metadata?: any;
  }) {
    console.log('Creating job:', jobData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.JOBS)
      .insert({
        organization_id: jobData.organizationId,
        job_type: jobData.jobType,
        job_name: jobData.jobName,
        payload: jobData.payload,
        status: 'pending',
        priority: jobData.priority || 'normal',
        attempts: 0,
        max_attempts: jobData.maxAttempts || 3,
        available_at: jobData.availableAt || new Date().toISOString(),
        batch_id: jobData.batchId,
        metadata: jobData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating job:', error);
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return data?.[0] ? mapJobData(data[0]) : null;
  }

  static async updateJobStatus(jobId: string, status: string, updates?: {
    startedAt?: string;
    completedAt?: string;
    failedAt?: string;
    errorMessage?: string;
    errorDetails?: any;
    attempts?: number;
  }) {
    console.log('Updating job status:', jobId, status, updates);
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (updates?.startedAt) updateData.started_at = updates.startedAt;
    if (updates?.completedAt) updateData.completed_at = updates.completedAt;
    if (updates?.failedAt) updateData.failed_at = updates.failedAt;
    if (updates?.errorMessage) updateData.error_message = updates.errorMessage;
    if (updates?.errorDetails) updateData.error_details = updates.errorDetails;
    if (updates?.attempts !== undefined) updateData.attempts = updates.attempts;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.JOBS)
      .update(updateData)
      .eq('id', jobId)
      .select();

    if (error) {
      console.error('Error updating job status:', error);
      throw new Error(`Failed to update job status: ${error.message}`);
    }

    return data?.[0] ? mapJobData(data[0]) : null;
  }

  static async deleteJob(jobId: string) {
    console.log('Deleting job:', jobId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.JOBS)
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  // Job Batch Management
  static async getJobBatches(filters?: { 
    organizationId?: string; 
    status?: string;
    limit?: number;
  }) {
    console.log('Fetching job batches with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.JOB_BATCHES)
      .select(`
        id,
        organization_id,
        batch_name,
        total_jobs,
        pending_jobs,
        processed_jobs,
        failed_jobs,
        status,
        progress,
        started_at,
        completed_at,
        cancelled_at,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching job batches:', error);
      return [];
    }

    return data?.map(mapJobBatchData) || [];
  }

  static async createJobBatch(batchData: {
    organizationId: string;
    batchName: string;
    totalJobs: number;
    metadata?: any;
  }) {
    console.log('Creating job batch:', batchData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.JOB_BATCHES)
      .insert({
        organization_id: batchData.organizationId,
        batch_name: batchData.batchName,
        total_jobs: batchData.totalJobs,
        pending_jobs: batchData.totalJobs,
        processed_jobs: 0,
        failed_jobs: 0,
        status: 'pending',
        progress: 0,
        metadata: batchData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating job batch:', error);
      throw new Error(`Failed to create job batch: ${error.message}`);
    }

    return data?.[0] ? mapJobBatchData(data[0]) : null;
  }

  static async updateJobBatch(batchId: string, updates: {
    status?: string;
    progress?: number;
    pendingJobs?: number;
    processedJobs?: number;
    failedJobs?: number;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  }) {
    console.log('Updating job batch:', batchId, updates);
    
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.JOB_BATCHES)
      .update(updateData)
      .eq('id', batchId)
      .select();

    if (error) {
      console.error('Error updating job batch:', error);
      throw new Error(`Failed to update job batch: ${error.message}`);
    }

    return data?.[0] ? mapJobBatchData(data[0]) : null;
  }

  // Failed Jobs Management
  static async getFailedJobs(filters?: { 
    organizationId?: string; 
    isResolved?: boolean;
    jobType?: string;
    limit?: number;
  }) {
    console.log('Fetching failed jobs with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.FAILED_JOBS)
      .select(`
        id,
        job_id,
        organization_id,
        job_type,
        job_name,
        payload,
        error_message,
        error_details,
        stack_trace,
        failed_at,
        retry_count,
        max_retries,
        is_resolved,
        resolved_at,
        resolved_by,
        resolution,
        metadata,
        created_at,
        updated_at
      `)
      .order('failed_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.isResolved !== undefined) {
      query = query.eq('is_resolved', filters.isResolved);
    }
    if (filters?.jobType) {
      query = query.eq('job_type', filters.jobType);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching failed jobs:', error);
      return [];
    }

    return data?.map(mapFailedJobData) || [];
  }

  static async createFailedJob(failedJobData: {
    jobId: string;
    organizationId: string;
    jobType: string;
    jobName: string;
    payload: any;
    errorMessage: string;
    errorDetails?: any;
    stackTrace?: string;
    retryCount?: number;
    maxRetries?: number;
    metadata?: any;
  }) {
    console.log('Creating failed job record:', failedJobData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FAILED_JOBS)
      .insert({
        job_id: failedJobData.jobId,
        organization_id: failedJobData.organizationId,
        job_type: failedJobData.jobType,
        job_name: failedJobData.jobName,
        payload: failedJobData.payload,
        error_message: failedJobData.errorMessage,
        error_details: failedJobData.errorDetails,
        stack_trace: failedJobData.stackTrace,
        failed_at: new Date().toISOString(),
        retry_count: failedJobData.retryCount || 0,
        max_retries: failedJobData.maxRetries || 3,
        is_resolved: false,
        metadata: failedJobData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating failed job record:', error);
      throw new Error(`Failed to create failed job record: ${error.message}`);
    }

    return data?.[0] ? mapFailedJobData(data[0]) : null;
  }

  static async resolveFailedJob(failedJobId: string, resolution: string, resolvedBy: string) {
    console.log('Resolving failed job:', failedJobId, resolution);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.FAILED_JOBS)
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        resolution,
        updated_at: new Date().toISOString()
      })
      .eq('id', failedJobId)
      .select();

    if (error) {
      console.error('Error resolving failed job:', error);
      throw new Error(`Failed to resolve failed job: ${error.message}`);
    }

    return data?.[0] ? mapFailedJobData(data[0]) : null;
  }

  // Third Party API Log Management
  static async getThirdPartyApiLogs(filters?: { 
    organizationId?: string; 
    integrationId?: string;
    status?: string;
    isSuccess?: boolean;
    limit?: number;
  }) {
    console.log('Fetching third party API logs with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.THIRD_PARTY_API_LOG)
      .select(`
        id,
        organization_id,
        integration_id,
        api_name,
        endpoint,
        method,
        request_payload,
        response_payload,
        status_code,
        response_time,
        status,
        error_message,
        retry_count,
        is_success,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.integrationId) {
      query = query.eq('integration_id', filters.integrationId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.isSuccess !== undefined) {
      query = query.eq('is_success', filters.isSuccess);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching third party API logs:', error);
      return [];
    }

    return data?.map(mapThirdPartyApiLogData) || [];
  }

  static async createThirdPartyApiLog(logData: {
    organizationId: string;
    integrationId?: string;
    apiName: string;
    endpoint: string;
    method: string;
    requestPayload?: any;
    responsePayload?: any;
    statusCode?: number;
    responseTime?: number;
    status: string;
    errorMessage?: string;
    retryCount?: number;
    isSuccess: boolean;
    metadata?: any;
  }) {
    console.log('Creating third party API log:', logData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.THIRD_PARTY_API_LOG)
      .insert({
        organization_id: logData.organizationId,
        integration_id: logData.integrationId,
        api_name: logData.apiName,
        endpoint: logData.endpoint,
        method: logData.method,
        request_payload: logData.requestPayload,
        response_payload: logData.responsePayload,
        status_code: logData.statusCode,
        response_time: logData.responseTime,
        status: logData.status,
        error_message: logData.errorMessage,
        retry_count: logData.retryCount || 0,
        is_success: logData.isSuccess,
        metadata: logData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating third party API log:', error);
      throw new Error(`Failed to create third party API log: ${error.message}`);
    }

    return data?.[0] ? mapThirdPartyApiLogData(data[0]) : null;
  }

  // Webhook Management
  static async getWebhooks(filters?: { 
    organizationId?: string; 
    status?: string;
    isActive?: boolean;
    eventType?: string;
    limit?: number;
  }) {
    console.log('Fetching webhooks with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.WEBHOOKS)
      .select(`
        id,
        organization_id,
        webhook_name,
        webhook_url,
        event_type,
        status,
        is_active,
        secret,
        headers,
        retry_count,
        max_retries,
        timeout,
        last_triggered_at,
        last_success_at,
        last_failure_at,
        failure_count,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching webhooks:', error);
      return [];
    }

    return data?.map(mapWebhookData) || [];
  }

  static async createWebhook(webhookData: {
    organizationId: string;
    webhookName: string;
    webhookUrl: string;
    eventType: string;
    secret?: string;
    headers?: any;
    maxRetries?: number;
    timeout?: number;
    metadata?: any;
  }) {
    console.log('Creating webhook:', webhookData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WEBHOOKS)
      .insert({
        organization_id: webhookData.organizationId,
        webhook_name: webhookData.webhookName,
        webhook_url: webhookData.webhookUrl,
        event_type: webhookData.eventType,
        status: 'active',
        is_active: true,
        secret: webhookData.secret,
        headers: webhookData.headers,
        retry_count: 0,
        max_retries: webhookData.maxRetries || 3,
        timeout: webhookData.timeout || 30,
        failure_count: 0,
        metadata: webhookData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating webhook:', error);
      throw new Error(`Failed to create webhook: ${error.message}`);
    }

    return data?.[0] ? mapWebhookData(data[0]) : null;
  }

  static async updateWebhook(webhookId: string, updates: {
    webhookName?: string;
    webhookUrl?: string;
    eventType?: string;
    status?: string;
    isActive?: boolean;
    secret?: string;
    headers?: any;
    maxRetries?: number;
    timeout?: number;
    lastTriggeredAt?: string;
    lastSuccessAt?: string;
    lastFailureAt?: string;
    failureCount?: number;
    metadata?: any;
  }) {
    console.log('Updating webhook:', webhookId, updates);
    
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WEBHOOKS)
      .update(updateData)
      .eq('id', webhookId)
      .select();

    if (error) {
      console.error('Error updating webhook:', error);
      throw new Error(`Failed to update webhook: ${error.message}`);
    }

    return data?.[0] ? mapWebhookData(data[0]) : null;
  }

  static async deleteWebhook(webhookId: string) {
    console.log('Deleting webhook:', webhookId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.WEBHOOKS)
      .delete()
      .eq('id', webhookId);

    if (error) {
      console.error('Error deleting webhook:', error);
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  }

  // Real-time subscriptions for background processing
  static subscribeToJobUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('job-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.JOBS },
        callback
      )
      .subscribe();
  }

  static subscribeToJobBatchUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('job-batch-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.JOB_BATCHES },
        callback
      )
      .subscribe();
  }

  static subscribeToFailedJobUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('failed-job-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.FAILED_JOBS },
        callback
      )
      .subscribe();
  }

  static subscribeToWebhookUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('webhook-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.WEBHOOKS },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // AUTHENTICATION & SYSTEM MANAGEMENT
  // =============================================================================

  // Auth Accounts Management
  static async getAuthAccounts(userId?: string) {
    console.log('Fetching auth accounts for user:', userId);
    
    let query = supabase
      .from(SUPABASE_TABLES.AUTH_ACCOUNTS)
      .select(`
        id,
        user_id,
        provider,
        provider_account_id,
        email,
        email_verified,
        phone_verified,
        two_factor_enabled,
        failed_login_attempts,
        locked_until,
        last_login_at,
        last_login_ip,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching auth accounts:', error);
      return [];
    }

    return data?.map(mapAuthAccountData) || [];
  }

  static async createAuthAccount(accountData: any) {
    console.log('Creating auth account:', accountData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.AUTH_ACCOUNTS)
      .insert({
        ...accountData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating auth account:', error);
      throw new Error(`Failed to create auth account: ${error.message}`);
    }

    return data?.[0] ? mapAuthAccountData(data[0]) : null;
  }

  static async updateAuthAccount(accountId: string, updates: any) {
    console.log('Updating auth account:', accountId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.AUTH_ACCOUNTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .select();

    if (error) {
      console.error('Error updating auth account:', error);
      throw new Error(`Failed to update auth account: ${error.message}`);
    }

    return data?.[0] ? mapAuthAccountData(data[0]) : null;
  }

  // Sessions Management
  static async getSessions(userId?: string) {
    console.log('Fetching sessions for user:', userId);
    
    let query = supabase
      .from(SUPABASE_TABLES.SESSIONS)
      .select(`
        id,
        user_id,
        session_token,
        refresh_token,
        ip_address,
        user_agent,
        device_info,
        location_info,
        login_at,
        last_activity_at,
        expires_at,
        logout_at,
        is_active,
        is_remembered,
        metadata,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data?.map(mapSessionData) || [];
  }

  static async createSession(sessionData: any) {
    console.log('Creating session:', sessionData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SESSIONS)
      .insert({
        ...sessionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating session:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data?.[0] ? mapSessionData(data[0]) : null;
  }

  static async updateSession(sessionId: string, updates: any) {
    console.log('Updating session:', sessionId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SESSIONS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select();

    if (error) {
      console.error('Error updating session:', error);
      throw new Error(`Failed to update session: ${error.message}`);
    }

    return data?.[0] ? mapSessionData(data[0]) : null;
  }

  static async deleteSession(sessionId: string) {
    console.log('Deleting session:', sessionId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.SESSIONS)
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  // User Roles Management
  static async getUserRoles(userId?: string, organizationId?: string) {
    console.log('Fetching user roles for user:', userId, 'organization:', organizationId);
    
    let query = supabase
      .from(SUPABASE_TABLES.USER_ROLES)
      .select(`
        id,
        user_id,
        role_id,
        organization_id,
        department_id,
        assigned_by,
        assigned_at,
        revoked_at,
        revoked_by,
        is_active,
        is_primary,
        metadata,
        created_at,
        updated_at,
        roles!inner(
          id,
          name,
          description,
          permissions,
          is_active
        ),
        users!inner(
          id,
          full_name,
          email,
          role,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data?.map(mapUserRoleData) || [];
  }

  static async assignUserRole(roleData: any) {
    console.log('Assigning user role:', roleData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USER_ROLES)
      .insert({
        ...roleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error assigning user role:', error);
      throw new Error(`Failed to assign user role: ${error.message}`);
    }

    return data?.[0] ? mapUserRoleData(data[0]) : null;
  }

  static async revokeUserRole(userRoleId: string, revokedBy: string) {
    console.log('Revoking user role:', userRoleId, 'by:', revokedBy);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USER_ROLES)
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: revokedBy,
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userRoleId)
      .select();

    if (error) {
      console.error('Error revoking user role:', error);
      throw new Error(`Failed to revoke user role: ${error.message}`);
    }

    return data?.[0] ? mapUserRoleData(data[0]) : null;
  }

  // Password Reset Tokens Management
  static async createPasswordResetToken(tokenData: any) {
    console.log('Creating password reset token:', tokenData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PASSWORD_RESET_TOKENS)
      .insert({
        ...tokenData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating password reset token:', error);
      throw new Error(`Failed to create password reset token: ${error.message}`);
    }

    return data?.[0] ? mapPasswordResetTokenData(data[0]) : null;
  }

  static async validatePasswordResetToken(token: string) {
    console.log('Validating password reset token:', token);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PASSWORD_RESET_TOKENS)
      .select('*')
      .eq('token', token)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error validating password reset token:', error);
      return null;
    }

    return data ? mapPasswordResetTokenData(data) : null;
  }

  static async markPasswordResetTokenAsUsed(tokenId: string) {
    console.log('Marking password reset token as used:', tokenId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PASSWORD_RESET_TOKENS)
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenId)
      .select();

    if (error) {
      console.error('Error marking password reset token as used:', error);
      throw new Error(`Failed to mark token as used: ${error.message}`);
    }

    return data?.[0] ? mapPasswordResetTokenData(data[0]) : null;
  }

  // Personal Access Tokens Management
  static async getPersonalAccessTokens(userId: string) {
    console.log('Fetching personal access tokens for user:', userId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PERSONAL_ACCESS_TOKENS)
      .select(`
        id,
        user_id,
        name,
        token_hash,
        token_preview,
        scopes,
        last_used_at,
        last_used_ip,
        last_used_user_agent,
        expires_at,
        revoked_at,
        revoked_by,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching personal access tokens:', error);
      return [];
    }

    return data?.map(mapPersonalAccessTokenData) || [];
  }

  static async createPersonalAccessToken(tokenData: any) {
    console.log('Creating personal access token:', tokenData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PERSONAL_ACCESS_TOKENS)
      .insert({
        ...tokenData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating personal access token:', error);
      throw new Error(`Failed to create personal access token: ${error.message}`);
    }

    return data?.[0] ? mapPersonalAccessTokenData(data[0]) : null;
  }

  static async revokePersonalAccessToken(tokenId: string, revokedBy: string) {
    console.log('Revoking personal access token:', tokenId, 'by:', revokedBy);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PERSONAL_ACCESS_TOKENS)
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: revokedBy,
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenId)
      .select();

    if (error) {
      console.error('Error revoking personal access token:', error);
      throw new Error(`Failed to revoke personal access token: ${error.message}`);
    }

    return data?.[0] ? mapPersonalAccessTokenData(data[0]) : null;
  }

  // Auth Audit Log Management
  static async logAuthEvent(eventData: any) {
    console.log('Logging auth event:', eventData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.AUTH_AUDIT_LOG)
      .insert({
        ...eventData,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error logging auth event:', error);
      throw new Error(`Failed to log auth event: ${error.message}`);
    }

    return data?.[0] ? mapAuthAuditLogData(data[0]) : null;
  }

  static async getAuthAuditLogs(userId?: string, eventType?: string, limit: number = 100) {
    console.log('Fetching auth audit logs for user:', userId, 'event type:', eventType);
    
    let query = supabase
      .from(SUPABASE_TABLES.AUTH_AUDIT_LOG)
      .select(`
        id,
        user_id,
        session_id,
        event_type,
        event_description,
        ip_address,
        user_agent,
        device_info,
        location_info,
        success,
        failure_reason,
        metadata,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching auth audit logs:', error);
      return [];
    }

    return data?.map(mapAuthAuditLogData) || [];
  }

  // Real-time subscriptions for authentication tables
  static subscribeToAuthAccountUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('auth-accounts-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.AUTH_ACCOUNTS },
        callback
      )
      .subscribe();
  }

  static subscribeToSessionUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('sessions-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.SESSIONS },
        callback
      )
      .subscribe();
  }

  static subscribeToUserRoleUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('user-roles-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.USER_ROLES },
        callback
      )
      .subscribe();
  }

  static subscribeToPersonalAccessTokenUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('personal-access-tokens-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.PERSONAL_ACCESS_TOKENS },
        callback
      )
      .subscribe();
  }

  static subscribeToAuthAuditLogUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('auth-audit-log-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.AUTH_AUDIT_LOG },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // TASK CATEGORY MANAGEMENT METHODS
  // =============================================================================

  static async getTaskCategories(filters?: { 
    isActive?: boolean; 
    searchTerm?: string;
  }) {
    console.log('Fetching task categories with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.TASK_CATEGORIES)
      .select(`
        id,
        name,
        description,
        color,
        icon,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true });

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching task categories:', error);
      return [];
    }

    return data?.map(mapTaskCategoryData) || [];
  }

  static async getTaskCategoryById(categoryId: string) {
    console.log('Fetching task category by ID:', categoryId);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASK_CATEGORIES)
      .select(`
        id,
        name,
        description,
        color,
        icon,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .eq('id', categoryId)
      .single();

    if (error) {
      console.error('Error fetching task category:', error);
      return null;
    }

    return mapTaskCategoryData(data);
  }

  static async createTaskCategory(categoryData: {
    name: string;
    description: string;
    color: string;
    icon: string;
    isActive?: boolean;
    metadata?: any;
  }) {
    console.log('Creating task category:', categoryData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASK_CATEGORIES)
      .insert({
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        icon: categoryData.icon,
        is_active: categoryData.isActive ?? true,
        metadata: categoryData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating task category:', error);
      throw new Error(`Failed to create task category: ${error.message}`);
    }

    return mapTaskCategoryData(data?.[0]);
  }

  static async updateTaskCategory(categoryId: string, updates: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
    isActive: boolean;
    metadata: any;
  }>) {
    console.log('Updating task category:', categoryId, updates);
    
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Map frontend field names to database field names
    if (updates.isActive !== undefined) {
      updateData.is_active = updates.isActive;
      delete updateData.isActive;
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TASK_CATEGORIES)
      .update(updateData)
      .eq('id', categoryId)
      .select();

    if (error) {
      console.error('Error updating task category:', error);
      throw new Error(`Failed to update task category: ${error.message}`);
    }

    return mapTaskCategoryData(data?.[0]);
  }

  static async deleteTaskCategory(categoryId: string) {
    console.log('Deleting task category:', categoryId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.TASK_CATEGORIES)
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting task category:', error);
      throw new Error(`Failed to delete task category: ${error.message}`);
    }
  }

  static subscribeToTaskCategories(callback: (payload: any) => void) {
    return supabase
      .channel('task-categories-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.TASK_CATEGORIES },
        callback
      )
      .subscribe();
  }

  // =============================================================================
  // CACHING & PERFORMANCE METHODS
  // =============================================================================

  // Cache Management
  static async getCacheEntry(organizationId: string, cacheKey: string) {
    console.log('Getting cache entry:', { organizationId, cacheKey });
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CACHE)
      .select('*')
      .eq('organization_id', organizationId)
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error getting cache entry:', error);
      return null;
    }

    // Update access count and accessed_at
    await supabase
      .from(SUPABASE_TABLES.CACHE)
      .update({
        accessed_at: new Date().toISOString(),
        access_count: (data.access_count || 0) + 1
      })
      .eq('id', data.id);

    return mapCacheData(data);
  }

  static async setCacheEntry(
    organizationId: string, 
    cacheKey: string, 
    cacheValue: any, 
    options: {
      cacheType?: string;
      tags?: string[];
      ttlSeconds?: number;
      isCompressed?: boolean;
      compressionType?: string;
      metadata?: any;
    } = {}
  ) {
    console.log('Setting cache entry:', { organizationId, cacheKey, options });
    
    const {
      cacheType = 'general',
      tags = [],
      ttlSeconds = 3600, // 1 hour default
      isCompressed = false,
      compressionType = null,
      metadata = {}
    } = options;

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    const cacheValueJson = typeof cacheValue === 'string' ? JSON.parse(cacheValue) : cacheValue;
    const sizeBytes = JSON.stringify(cacheValueJson).length;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CACHE)
      .upsert({
        organization_id: organizationId,
        cache_key: cacheKey,
        cache_value: cacheValueJson,
        cache_type: cacheType,
        tags: tags,
        expires_at: expiresAt,
        size_bytes: sizeBytes,
        is_compressed: isCompressed,
        compression_type: compressionType,
        metadata: metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        accessed_at: new Date().toISOString(),
        access_count: 0
      })
      .select();

    if (error) {
      console.error('Error setting cache entry:', error);
      throw new Error(`Failed to set cache entry: ${error.message}`);
    }

    return mapCacheData(data[0]);
  }

  static async deleteCacheEntry(organizationId: string, cacheKey: string) {
    console.log('Deleting cache entry:', { organizationId, cacheKey });
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.CACHE)
      .delete()
      .eq('organization_id', organizationId)
      .eq('cache_key', cacheKey);

    if (error) {
      console.error('Error deleting cache entry:', error);
      throw new Error(`Failed to delete cache entry: ${error.message}`);
    }
  }

  static async invalidateCacheByTags(organizationId: string, tags: string[], invalidatedBy: string = 'system') {
    console.log('Invalidating cache by tags:', { organizationId, tags, invalidatedBy });
    
    const { data, error } = await supabase.rpc('invalidate_cache_by_tags', {
      p_organization_id: organizationId,
      p_tags: tags,
      p_invalidated_by: invalidatedBy
    });

    if (error) {
      console.error('Error invalidating cache by tags:', error);
      throw new Error(`Failed to invalidate cache by tags: ${error.message}`);
    }

    return data;
  }

  static async clearExpiredCache() {
    console.log('Clearing expired cache entries');
    
    const { data, error } = await supabase.rpc('cleanup_expired_cache');

    if (error) {
      console.error('Error clearing expired cache:', error);
      throw new Error(`Failed to clear expired cache: ${error.message}`);
    }

    return data;
  }

  static async getCacheStatistics(organizationId?: string, cacheType?: string, days: number = 7) {
    console.log('Getting cache statistics:', { organizationId, cacheType, days });
    
    let query = supabase
      .from(SUPABASE_TABLES.CACHE_STATISTICS)
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (cacheType) {
      query = query.eq('cache_type', cacheType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting cache statistics:', error);
      return [];
    }

    return data?.map(mapCacheStatisticsData) || [];
  }

  static async getCacheHitRatio(organizationId?: string, cacheType?: string, days: number = 7) {
    console.log('Getting cache hit ratio:', { organizationId, cacheType, days });
    
    const { data, error } = await supabase.rpc('get_cache_hit_ratio', {
      p_organization_id: organizationId,
      p_cache_type: cacheType,
      p_days: days
    });

    if (error) {
      console.error('Error getting cache hit ratio:', error);
      return [];
    }

    return data || [];
  }

  // Cache Lock Management
  static async acquireCacheLock(
    organizationId: string, 
    lockKey: string, 
    lockedBy: string, 
    ttlSeconds: number = 300, // 5 minutes default
    lockType: string = 'exclusive'
  ) {
    console.log('Acquiring cache lock:', { organizationId, lockKey, lockedBy, ttlSeconds, lockType });
    
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CACHE_LOCKS)
      .upsert({
        organization_id: organizationId,
        lock_key: lockKey,
        lock_type: lockType,
        locked_by: lockedBy,
        expires_at: expiresAt,
        acquired_count: 1,
        metadata: {}
      })
      .select();

    if (error) {
      console.error('Error acquiring cache lock:', error);
      throw new Error(`Failed to acquire cache lock: ${error.message}`);
    }

    return mapCacheLockData(data[0]);
  }

  static async releaseCacheLock(organizationId: string, lockKey: string, lockedBy: string) {
    console.log('Releasing cache lock:', { organizationId, lockKey, lockedBy });
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.CACHE_LOCKS)
      .delete()
      .eq('organization_id', organizationId)
      .eq('lock_key', lockKey)
      .eq('locked_by', lockedBy);

    if (error) {
      console.error('Error releasing cache lock:', error);
      throw new Error(`Failed to release cache lock: ${error.message}`);
    }
  }

  static async clearExpiredCacheLocks() {
    console.log('Clearing expired cache locks');
    
    const { data, error } = await supabase.rpc('cleanup_expired_cache_locks');

    if (error) {
      console.error('Error clearing expired cache locks:', error);
      throw new Error(`Failed to clear expired cache locks: ${error.message}`);
    }

    return data;
  }

  // Migration Management
  static async getMigrations() {
    console.log('Getting migrations');
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MIGRATIONS)
      .select('*')
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Error getting migrations:', error);
      return [];
    }

    return data?.map(mapMigrationData) || [];
  }

  static async getMigrationByName(migrationName: string) {
    console.log('Getting migration by name:', migrationName);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MIGRATIONS)
      .select('*')
      .eq('migration_name', migrationName)
      .single();

    if (error) {
      console.error('Error getting migration by name:', error);
      return null;
    }

    return mapMigrationData(data);
  }

  static async createMigration(migrationData: {
    migrationName: string;
    migrationVersion: string;
    migrationType: string;
    description?: string;
    sqlContent: string;
    checksum: string;
    appliedBy: string;
    executionTimeMs?: number;
    status?: string;
    dependencies?: string[];
    metadata?: any;
  }) {
    console.log('Creating migration:', migrationData.migrationName);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MIGRATIONS)
      .insert({
        migration_name: migrationData.migrationName,
        migration_version: migrationData.migrationVersion,
        migration_type: migrationData.migrationType,
        description: migrationData.description,
        sql_content: migrationData.sqlContent,
        checksum: migrationData.checksum,
        applied_by: migrationData.appliedBy,
        execution_time_ms: migrationData.executionTimeMs || 0,
        status: migrationData.status || 'success',
        dependencies: migrationData.dependencies || [],
        metadata: migrationData.metadata || {},
        applied_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating migration:', error);
      throw new Error(`Failed to create migration: ${error.message}`);
    }

    return mapMigrationData(data[0]);
  }

  // Cache Invalidation Logs
  static async getCacheInvalidationLogs(organizationId?: string, limit: number = 100) {
    console.log('Getting cache invalidation logs:', { organizationId, limit });
    
    let query = supabase
      .from(SUPABASE_TABLES.CACHE_INVALIDATION_LOGS)
      .select('*')
      .order('invalidated_at', { ascending: false })
      .limit(limit);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting cache invalidation logs:', error);
      return [];
    }

    return data?.map(mapCacheInvalidationLogData) || [];
  }

  // Real-time subscriptions for caching tables
  static subscribeToCacheUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('cache-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CACHE },
        callback
      )
      .subscribe();
  }

  static subscribeToCacheLockUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('cache-locks-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CACHE_LOCKS },
        callback
      )
      .subscribe();
  }

  static subscribeToMigrationUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('migrations-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.MIGRATIONS },
        callback
      )
      .subscribe();
  }

  static subscribeToCacheStatisticsUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('cache-statistics-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CACHE_STATISTICS },
        callback
      )
      .subscribe();
  }

  static subscribeToCacheInvalidationLogUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('cache-invalidation-logs-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.CACHE_INVALIDATION_LOGS },
        callback
      )
      .subscribe();
  }



  // Update user status (activate, deactivate, suspend)
  static async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended') {
    console.log('Updating user status:', userId, status);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user status:', error);
      throw new Error(`Failed to update user status: ${error.message}`);
    }

    return data?.[0];
  }

  // Bulk update user statuses
  static async bulkUpdateUserStatus(userIds: string[], status: 'active' | 'inactive' | 'suspended') {
    console.log('Bulk updating user status:', userIds, status);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select();

    if (error) {
      console.error('Error bulk updating user status:', error);
      throw new Error(`Failed to bulk update user status: ${error.message}`);
    }

    return data;
  }

  // Delete users (soft delete by updating status)
  static async deleteUsers(userIds: string[]) {
    console.log('Deleting users:', userIds);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select();

    if (error) {
      console.error('Error deleting users:', error);
      throw new Error(`Failed to delete users: ${error.message}`);
    }

    return data;
  }

  // Reset user password (this would typically trigger an email)
  static async resetUserPassword(userId: string) {
    console.log('Resetting password for user:', userId);
    
    // In a real implementation, this would:
    // 1. Generate a password reset token
    // 2. Send email with reset link
    // 3. Log the action
    
    // For now, we'll just log it in audit logs
    try {
      await this.logUserAction(userId, 'PASSWORD_RESET', 'user', userId, null, {
        action: 'password_reset_requested',
        timestamp: new Date().toISOString()
      });
      
      return { success: true, message: 'Password reset initiated' };
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw new Error(`Failed to reset password: ${error}`);
    }
  }

  // Create new user
  static async createUser(userData: {
    fullName: string;
    email: string;
    mobile?: string;
    role: string;
    departmentId?: number;
    organizationId?: number;
    employmentTypeId?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    passwordHash?: string;
  }) {
    console.log('🚀 Creating new user:', userData);
    console.log('📊 Using table:', SUPABASE_TABLES.USERS);
    
    const insertData = {
      full_name: userData.fullName,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      department_id: userData.departmentId,
      organization_id: userData.organizationId,
      employment_type_id: userData.employmentTypeId,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      password_hash: userData.passwordHash || 'default123',
      status: 'active',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Insert data:', insertData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .insert(insertData)
      .select();

    if (error) {
      console.error('❌ Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    console.log('✅ User created successfully:', data);

    // Create audit log for user creation
    try {
      await AuditLogger.logUserCreation(
        data?.[0]?.id?.toString() || 'unknown',
        userData,
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for user creation:', auditError);
      // Don't throw here to avoid breaking the main operation
    }

    return data?.[0];
  }

  // Update user details
  static async updateUser(userId: string, updates: {
    fullName?: string;
    email?: string;
    mobile?: string;
    role?: string;
    departmentId?: number;
    organizationId?: number;
    employmentTypeId?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: string;
    isActive?: boolean;
    passwordHash?: string;
  }) {
    console.log('Updating user:', userId, updates);
    
    // Get the current user data for audit logging
    const { data: currentData } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map frontend fields to database fields
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.mobile !== undefined) updateData.mobile = updates.mobile;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.departmentId !== undefined) updateData.department_id = updates.departmentId;
    if (updates.organizationId !== undefined) updateData.organization_id = updates.organizationId;
    if (updates.employmentTypeId !== undefined) updateData.employment_type_id = updates.employmentTypeId;
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.passwordHash !== undefined) updateData.password_hash = updates.passwordHash;
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    // Create audit log for user update
    try {
      await AuditLogger.logUserUpdate(
        userId,
        currentData,
        data?.[0],
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for user update:', auditError);
      // Don't throw here to avoid breaking the main operation
    }

    return data?.[0];
  }

  // Delete user (soft delete)
  static async deleteUser(userId: string) {
    console.log('Deleting user:', userId);
    
    // Get the current user data for audit logging
    const { data: currentData } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    // Create audit log for user deletion
    try {
      await AuditLogger.logUserDeletion(
        userId,
        currentData,
        AuditLogger.getCurrentUserId()
      );
    } catch (auditError) {
      console.error('Error creating audit log for user deletion:', auditError);
      // Don't throw here to avoid breaking the main operation
    }
  }

  // Get user by ID (for both auth_id and direct id)
  static async getUserById(userId: string) {
    console.log('Getting user by ID:', userId);
    
    // Return null if no userId provided
    if (!userId || userId.trim() === '') {
      console.log('No userId provided for getUserById');
      return null;
    }
    
    // Check if this is a numeric ID (database-only user) or UUID (Supabase Auth user)
    const isNumericId = /^\d+$/.test(userId);
    
    let query = supabase
      .from(SUPABASE_TABLES.USERS)
      .select(`
        id,
        email,
        full_name,
        mobile,
        role,
        status,
        last_login_at,
        created_at,
        updated_at,
        email_verified_at,
        employment_type_id,
        metadata,
        auth_id,
        department_id,
        organization_id,
        departments(
          id,
          name,
          code
        ),
        organizations(
          id,
          name,
          code
        )
      `);
    
    if (isNumericId) {
      // Direct database ID lookup
      query = query.eq('id', userId);
    } else {
      // Auth ID lookup first, then fallback to direct ID
      query = query.eq('auth_id', userId);
    }

    const { data, error } = await query.single();

    if (error && !isNumericId) {
      // If auth_id lookup failed, try direct ID lookup
      console.log('Auth ID lookup failed, trying direct ID lookup');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from(SUPABASE_TABLES.USERS)
        .select(`
          id,
          email,
          full_name,
          mobile,
          role,
          status,
          last_login_at,
          created_at,
          updated_at,
          email_verified_at,
          employment_type_id,
          metadata,
          auth_id,
          department_id,
          organization_id,
          departments(
            id,
            name,
            code
          ),
          organizations(
            id,
            name,
            code
          )
        `)
        .eq('id', userId)
        .single();
      
      if (fallbackError) {
        console.error('Error getting user by ID:', fallbackError);
        return null;
      }
      
      return fallbackData;
    }

    if (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }

    return data;
  }

  // Send notification to users
  static async sendNotificationToUsers(userIds: string[], notification: {
    title: string;
    message: string;
    type?: string;
  }) {
    console.log('Sending notification to users:', userIds, notification);
    
    try {
      // Create notification records for each user
      const notifications = userIds.map(userId => ({
        notifiable_type: 'user',
        notifiable_id: userId,
        data: {
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info'
        },
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.NOTIFICATIONS)
        .insert(notifications)
        .select();

      if (error) {
        console.error('Error sending notifications:', error);
        throw new Error(`Failed to send notifications: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error sending notification to users:', error);
      throw error;
    }
  }

  // Real-time subscription for user updates
  static subscribeToUserUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('user-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.USERS },
        callback
      )
      .subscribe();
  }

  // Log user action for audit purposes
  static async logUserAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    oldValues: any = null,
    newValues: any = null
  ) {
    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES.AUDIT_LOG)
        .insert({
          user_id: userId,
          action,
          entity_type: resourceType,
          entity_id: resourceId,
          description: `${action} operation on ${resourceType}${resourceId ? ` #${resourceId}` : ''}`,
          log_type: 'info',
          ip_address: null, // Would be captured from request
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
          metadata: { 
            old_values: oldValues, 
            new_values: newValues
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging user action:', error);
      }
    } catch (error) {
      console.error('Error in logUserAction:', error);
    }
  }

  // =============================================================================
  // ANALYTICS AND REPORTING METHODS FOR SUPER ADMIN
  // =============================================================================

  // Get performance metrics for analytics dashboard
  static async getPerformanceMetrics(period: string = 'month') {
    console.log('Fetching performance metrics for period:', period);
    
    try {
      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get total cases and revenue data
      const { data: casesData, error: casesError } = await supabase
        .from(SUPABASE_TABLES.CASES)
        .select(`
          id,
          status,
          loan_amount,
          product_id,
          created_at,
          updated_at,
          products(name, type)
        `)
        .gte('created_at', startDate.toISOString());

      if (casesError) {
        console.error('Error fetching cases data:', casesError);
        return [];
      }

      // Calculate metrics
      const totalCases = casesData?.length || 0;
      const totalRevenue = casesData?.reduce((sum: number, case_: any) => sum + (case_.loan_amount || 0), 0) || 0;
      const approvedCases = casesData?.filter((c: any) => c.status === 'approved').length || 0;
      const pendingCases = casesData?.filter((c: any) => c.status === 'new').length || 0;
      const rejectedCases = casesData?.filter((c: any) => c.status === 'rejected').length || 0;
      const inProgressCases = casesData?.filter((c: any) => c.status === 'in_progress').length || 0;

      // Calculate average processing time (simplified)
      const completedCases = casesData?.filter((c: any) => c.status === 'approved' || c.status === 'rejected') || [];
      const avgProcessingTime = completedCases.length > 0 
        ? completedCases.reduce((sum: number, case_: any) => {
            const created = new Date(case_.created_at);
            const updated = new Date(case_.updated_at);
            return sum + (updated.getTime() - created.getTime());
          }, 0) / completedCases.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      // Group by product type
      const productBreakdown: { [key: string]: number } = {};
      casesData?.forEach((case_: any) => {
        const productName = case_.products?.name || 'Other';
        productBreakdown[productName] = (productBreakdown[productName] || 0) + (case_.loan_amount || 0);
      });

      return [
        {
          label: 'Total Revenue',
          value: `₹${(totalRevenue / 10000000).toFixed(1)}Cr`,
          change: '+12.5%', // This would need historical comparison
          trend: 'up',
          period: `This ${period}`,
          breakdown: Object.entries(productBreakdown).reduce((acc: any, [key, value]) => {
            acc[key] = `₹${(value / 10000000).toFixed(1)}Cr`;
            return acc;
          }, {})
        },
        {
          label: 'Applications Processed',
          value: totalCases.toString(),
          change: '+8.3%',
          trend: 'up',
          period: `This ${period}`,
          breakdown: {
            'Approved': `${approvedCases} (${((approvedCases / totalCases) * 100).toFixed(1)}%)`,
            'In Progress': `${inProgressCases} (${((inProgressCases / totalCases) * 100).toFixed(1)}%)`,
            'Rejected': `${rejectedCases} (${((rejectedCases / totalCases) * 100).toFixed(1)}%)`,
            'Pending': `${pendingCases} (${((pendingCases / totalCases) * 100).toFixed(1)}%)`
          }
        },
        {
          label: 'Average Processing Time',
          value: `${avgProcessingTime.toFixed(1)} days`,
          change: '-15.2%',
          trend: 'down',
          period: `This ${period}`,
          breakdown: {
            'All Cases': `${avgProcessingTime.toFixed(1)} days`,
            'Fast Track': `${(avgProcessingTime * 0.7).toFixed(1)} days`,
            'Standard': `${(avgProcessingTime * 1.2).toFixed(1)} days`,
            'Complex': `${(avgProcessingTime * 1.8).toFixed(1)} days`
          }
        },
        {
          label: 'Approval Rate',
          value: `${((approvedCases / totalCases) * 100).toFixed(1)}%`,
          change: '+2.1%',
          trend: 'up',
          period: `This ${period}`,
          breakdown: {
            'Approved': `${approvedCases} cases`,
            'Total': `${totalCases} cases`,
            'Success Rate': `${((approvedCases / totalCases) * 100).toFixed(1)}%`,
            'Industry Avg': '68.5%'
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }
  }

  // Get department analytics
  static async getDepartmentAnalytics(period: string = 'month') {
    console.log('Fetching department analytics for period:', period);
    
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get cases with department info
      const { data: casesData, error: casesError } = await supabase
        .from(SUPABASE_TABLES.CASES)
        .select(`
          id,
          status,
          loan_amount,
          created_at,
          updated_at,
          assigned_to,
          users!inner(
            department_id,
            departments(name)
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (casesError) {
        console.error('Error fetching department analytics:', casesError);
        return [];
      }

      // Group by department
      const departmentMap: { [key: string]: any } = {};
      
      casesData?.forEach((case_: any) => {
        const deptName = case_.users?.departments?.name || 'Unassigned';
        
        if (!departmentMap[deptName]) {
          departmentMap[deptName] = {
            totalCases: 0,
            completedCases: 0,
            revenue: 0,
            processingTimes: []
          };
        }
        
        departmentMap[deptName].totalCases++;
        departmentMap[deptName].revenue += case_.loan_amount || 0;
        
        if (case_.status === 'approved' || case_.status === 'rejected') {
          departmentMap[deptName].completedCases++;
          const created = new Date(case_.created_at);
          const updated = new Date(case_.updated_at);
          const processingTime = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          departmentMap[deptName].processingTimes.push(processingTime);
        }
      });

      // Convert to analytics format
      return Object.entries(departmentMap).map(([deptName, data]: [string, any]) => ({
        department: deptName,
        metrics: {
          totalCases: data.totalCases,
          completedCases: data.completedCases,
          revenue: `₹${(data.revenue / 10000000).toFixed(1)}Cr`,
          efficiency: `${((data.completedCases / data.totalCases) * 100).toFixed(0)}%`,
          avgProcessingTime: data.processingTimes.length > 0 
            ? `${(data.processingTimes.reduce((a: number, b: number) => a + b, 0) / data.processingTimes.length).toFixed(1)} days`
            : 'N/A',
          customerSatisfaction: `${(4.2 + Math.random() * 0.6).toFixed(1)}/5` // Simulated
        }
      }));
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      return [];
    }
  }

  // Get top performers
  static async getTopPerformers(period: string = 'month') {
    console.log('Fetching top performers for period:', period);
    
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get cases with user info
      const { data: casesData, error: casesError } = await supabase
        .from(SUPABASE_TABLES.CASES)
        .select(`
          id,
          status,
          loan_amount,
          created_at,
          updated_at,
          assigned_to,
          users!inner(
            id,
            full_name,
            role
          )
        `)
        .gte('created_at', startDate.toISOString())
        .not('assigned_to', 'is', null);

      if (casesError) {
        console.error('Error fetching top performers:', casesError);
        return [];
      }

      // Group by user
      const userMap: { [key: string]: any } = {};
      
      casesData?.forEach((case_: any) => {
        const userId = case_.assigned_to;
        const user = case_.users;
        
        if (!userMap[userId]) {
          userMap[userId] = {
            name: user.full_name,
            role: user.role,
            cases: 0,
            revenue: 0,
            completedCases: 0
          };
        }
        
        userMap[userId].cases++;
        userMap[userId].revenue += case_.loan_amount || 0;
        
        if (case_.status === 'approved') {
          userMap[userId].completedCases++;
        }
      });

      // Convert to top performers format and sort by revenue
      const performers = Object.values(userMap).map((user: any) => ({
        name: user.name,
        role: user.role.replace('_', ' ').toUpperCase(),
        cases: user.cases,
        revenue: `₹${(user.revenue / 10000000).toFixed(1)}Cr`,
        efficiency: `${((user.completedCases / user.cases) * 100).toFixed(0)}%`
      }));

      // Sort by revenue (convert back to number for sorting)
      performers.sort((a, b) => {
        const aRevenue = parseFloat(a.revenue.replace('₹', '').replace('Cr', ''));
        const bRevenue = parseFloat(b.revenue.replace('₹', '').replace('Cr', ''));
        return bRevenue - aRevenue;
      });

      return performers.slice(0, 10); // Top 10 performers
    } catch (error) {
      console.error('Error fetching top performers:', error);
      return [];
    }
  }

  // =============================================================================
  // ENHANCED AUDIT LOGS FOR SUPER ADMIN
  // =============================================================================

  // Enhanced audit logs with comprehensive filtering - REAL DATA ONLY
  static async getAuditLogsEnhanced(filters?: {
    searchTerm?: string;
    action?: string;
    severity?: string;
    category?: string;
    period?: string;
    userId?: string;
    resourceType?: string;
    limit?: number;
    offset?: number;
  }) {
    console.log('Fetching enhanced audit logs with filters:', filters);
    
    try {
      // Calculate date range based on period
      let startDate = new Date();
      if (filters?.period) {
        switch (filters.period) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          default:
            startDate.setHours(0, 0, 0, 0);
        }
      }

      let query = supabase
        .from(SUPABASE_TABLES.AUDIT_LOG)
        .select(`
          id,
          organization_id,
          user_id,
          action,
          entity_type,
          entity_id,
          description,
          log_type,
          metadata,
          ip_address,
          user_agent,
          created_at,
          updated_at,
          users(full_name)
        `)
        .order('created_at', { ascending: false });

      // Apply date filter
      if (filters?.period) {
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply other filters
      if (filters?.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.resourceType) {
        query = query.eq('entity_type', filters.resourceType);
      }

      if (filters?.searchTerm) {
        query = query.or(`action.ilike.%${filters.searchTerm}%,entity_type.ilike.%${filters.searchTerm}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      // Transform and enrich the data
      return data?.map(log => ({
        id: log.id?.toString(),
        user_id: log.user_id?.toString(),
        action: log.action,
        resource_type: log.entity_type,
        resource_id: log.entity_id?.toString(),
        old_values: null, // Not available in simplified schema
        new_values: null, // Not available in simplified schema
        description: log.description || `${log.action} operation on ${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}`,
        log_type: log.log_type || this.getLogType(log.action),
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        duration: log.metadata?.duration || 0,
        created_at: log.created_at,
        updated_at: log.updated_at,
        organization_id: log.organization_id,
        user_name: Array.isArray(log.users) ? log.users[0]?.full_name : (log.users as any)?.full_name || 'Unknown',
        severity: this.calculateSeverity(log.action, log.entity_type),
        category: this.categorizeAction(log.action, log.entity_type)
      })) || [];
    } catch (error) {
      console.error('Error fetching enhanced audit logs:', error);
      throw error;
    }
  }

  // Enhanced audit log statistics - REAL DATA ONLY
  static async getAuditLogStatsEnhanced(period: string = 'today') {
    console.log('Fetching audit log statistics for period:', period);
    
    try {
      // Calculate date range
      let startDate = new Date();
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
      }

      // Get all logs for the period
      const { data: logs, error } = await supabase
        .from(SUPABASE_TABLES.AUDIT_LOG)
        .select(`
          id,
          organization_id,
          user_id,
          action,
          entity_type,
          created_at,
          users(full_name)
        `)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching audit log stats:', error);
        throw new Error(`Failed to fetch audit log statistics: ${error.message}`);
      }

      const totalLogsToday = logs?.length || 0;
      
      // Calculate categories
      const securityEvents = logs?.filter(log => 
        ['LOGIN', 'LOGOUT', 'DELETE', 'PASSWORD_RESET'].includes(log.action)
      ).length || 0;
      
      const userActions = logs?.filter(log => 
        ['CREATE', 'UPDATE', 'VIEW'].includes(log.action)
      ).length || 0;
      
      const systemEvents = logs?.filter(log => 
        ['BACKUP', 'SYSTEM_UPDATE', 'MAINTENANCE'].includes(log.action)
      ).length || 0;

      const criticalAlerts = logs?.filter(log => 
        ['DELETE', 'PASSWORD_RESET', 'PERMISSION_CHANGE'].includes(log.action)
      ).length || 0;

      // Top users by activity
      const userActivityMap: { [key: string]: number } = {};
      logs?.forEach(log => {
        const userName = Array.isArray(log.users) ? log.users[0]?.full_name : (log.users as any)?.full_name || 'Unknown';
        userActivityMap[userName] = (userActivityMap[userName] || 0) + 1;
      });

      const topUsers = Object.entries(userActivityMap)
        .map(([user_name, action_count]) => ({ user_name, action_count }))
        .sort((a, b) => b.action_count - a.action_count)
        .slice(0, 5);

      // Action breakdown
      const actionBreakdown: { [key: string]: number } = {};
      logs?.forEach(log => {
        actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
      });

      return {
        totalLogsToday,
        securityEvents,
        userActions,
        systemEvents,
        criticalAlerts,
        topUsers,
        actionBreakdown
      };
    } catch (error) {
      console.error('Error fetching audit log statistics:', error);
      throw error;
    }
  }


  // Helper method to calculate severity based on action and resource
  private static calculateSeverity(action: string, resourceType: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical actions
    if (['DELETE', 'PASSWORD_RESET', 'PERMISSION_CHANGE'].includes(action)) {
      return 'critical';
    }
    
    // High severity actions
    if (['CREATE', 'UPDATE'].includes(action) && ['user', 'permission', 'role'].includes(resourceType)) {
      return 'high';
    }
    
    // Medium severity actions
    if (['CREATE', 'UPDATE', 'LOGIN'].includes(action)) {
      return 'medium';
    }
    
    // Default to low
    return 'low';
  }

  // Helper method to categorize actions
  private static categorizeAction(action: string, resourceType: string): 'security' | 'user' | 'system' | 'data' {
    // Security-related actions
    if (['LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'PERMISSION_CHANGE'].includes(action)) {
      return 'security';
    }
    
    // System-related actions
    if (['BACKUP', 'SYSTEM_UPDATE', 'MAINTENANCE'].includes(action) || resourceType === 'system') {
      return 'system';
    }
    
    // Data-related actions
    if (['CREATE', 'UPDATE', 'DELETE'].includes(action) && ['case', 'document', 'customer'].includes(resourceType)) {
      return 'data';
    }
    
    // Default to user actions
    return 'user';
  }

  // =============================================================================
  // DATABASE MANAGEMENT METHODS FOR SUPER ADMIN
  // =============================================================================

  // Get all table names and their row counts
  static async getDatabaseTables() {
    console.log('🔍 Fetching database table information...');
    
    try {
      const tables = Object.values(SUPABASE_TABLES);
      const tableInfo = [];

      // Core tables that should exist (basic ones)
      const coreTables = [
        'organizations', 'users', 'customers', 'cases', 'documents', 
        'tasks', 'logs', 'notifications', 'departments', 'roles', 
        'permissions', 'products', 'system_settings'
      ];

      for (const tableName of tables) {
        try {
          // Get row count for each table
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (!error) {
            tableInfo.push({
              name: tableName,
              rowCount: count || 0,
              status: 'active',
              isCore: coreTables.includes(tableName)
            });
          } else {
            // Check if it's a 404 (table doesn't exist) vs other errors
            const isTableMissing = error.message.includes('relation') && error.message.includes('does not exist');
            
            tableInfo.push({
              name: tableName,
              rowCount: 0,
              status: isTableMissing ? 'missing' : 'error',
              error: isTableMissing ? 'Table does not exist' : error.message,
              isCore: coreTables.includes(tableName)
            });
          }
        } catch (err) {
          tableInfo.push({
            name: tableName,
            rowCount: 0,
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
            isCore: coreTables.includes(tableName)
          });
        }
      }

      // Sort tables: core tables first, then by name
      tableInfo.sort((a, b) => {
        if (a.isCore && !b.isCore) return -1;
        if (!a.isCore && b.isCore) return 1;
        return a.name.localeCompare(b.name);
      });

      console.log('✅ Successfully fetched table information:', tableInfo.length, 'tables');
      console.log('📊 Table Status Summary:', {
        active: tableInfo.filter(t => t.status === 'active').length,
        missing: tableInfo.filter(t => t.status === 'missing').length,
        error: tableInfo.filter(t => t.status === 'error').length
      });
      
      return tableInfo;
    } catch (error) {
      console.error('❌ Error fetching database tables:', error);
      throw new Error('Failed to fetch database tables');
    }
  }

  // Get table schema information
  static async getTableSchema(tableName: string) {
    console.log('🔍 Fetching schema for table:', tableName);
    
    try {
      // This is a simplified approach - in production you might want to use introspection
      // For now, we'll return basic column information from a sample query
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        throw new Error(`Failed to fetch schema for table ${tableName}: ${error.message}`);
      }

      const columns = data && data.length > 0 
        ? Object.keys(data[0]).map(key => ({
            name: key,
            type: typeof data[0][key],
            nullable: true // We can't determine this easily with current setup
          }))
        : [];

      console.log('✅ Successfully fetched schema for table:', tableName);
      return {
        tableName,
        columns,
        sampleData: data
      };
    } catch (error) {
      console.error('❌ Error fetching table schema:', error);
      throw new Error(`Failed to fetch schema for table ${tableName}`);
    }
  }

  // Get table data with pagination
  static async getTableData(
    tableName: string, 
    page = 0, 
    limit = 50, 
    filters?: Record<string, any>,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    console.log('🔍 Fetching data for table:', tableName, { page, limit, filters, sortBy, sortOrder });
    
    try {
      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'string') {
              query = query.ilike(key, `%${value}%`);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch data from table ${tableName}: ${error.message}`);
      }

      console.log('✅ Successfully fetched table data:', data?.length, 'rows');
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('❌ Error fetching table data:', error);
      throw new Error(`Failed to fetch data from table ${tableName}`);
    }
  }

  // Insert new record
  static async insertTableRecord(tableName: string, recordData: Record<string, any>) {
    console.log('🔍 Inserting new record into table:', tableName, recordData);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(recordData)
        .select();

      if (error) {
        throw new Error(`Failed to insert record into table ${tableName}: ${error.message}`);
      }

      console.log('✅ Successfully inserted record into table:', tableName);
      return data?.[0];
    } catch (error) {
      console.error('❌ Error inserting table record:', error);
      throw new Error(`Failed to insert record into table ${tableName}`);
    }
  }

  // Update existing record
  static async updateTableRecord(tableName: string, recordId: string | number, updates: Record<string, any>) {
    console.log('🔍 Updating record in table:', tableName, { recordId, updates });
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .select();

      if (error) {
        throw new Error(`Failed to update record in table ${tableName}: ${error.message}`);
      }

      console.log('✅ Successfully updated record in table:', tableName);
      return data?.[0];
    } catch (error) {
      console.error('❌ Error updating table record:', error);
      throw new Error(`Failed to update record in table ${tableName}`);
    }
  }

  // Delete record
  static async deleteTableRecord(tableName: string, recordId: string | number) {
    console.log('🔍 Deleting record from table:', tableName, { recordId });
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', recordId);

      if (error) {
        throw new Error(`Failed to delete record from table ${tableName}: ${error.message}`);
      }

      console.log('✅ Successfully deleted record from table:', tableName);
    } catch (error) {
      console.error('❌ Error deleting table record:', error);
      throw new Error(`Failed to delete record from table ${tableName}`);
    }
  }

  // Execute custom SQL query (for advanced operations)
  static async executeCustomQuery(query: string) {
    console.log('🔍 Executing custom query:', query);
    
    try {
      const { data, error } = await supabase.rpc('execute_sql', { query_text: query });

      if (error) {
        throw new Error(`Failed to execute custom query: ${error.message}`);
      }

      console.log('✅ Successfully executed custom query');
      return data;
    } catch (error) {
      console.error('❌ Error executing custom query:', error);
      throw new Error('Failed to execute custom query');
    }
  }

  // Get database statistics
  static async getDatabaseStats() {
    console.log('🔍 Fetching database statistics...');
    
    try {
      const tableStats = await this.getDatabaseTables();
      const totalTables = tableStats.length;
      const totalRecords = tableStats.reduce((sum, table) => sum + table.rowCount, 0);
      const healthyTables = tableStats.filter(table => table.status === 'active').length;
      const missingTables = tableStats.filter(table => table.status === 'missing').length;
      const errorTables = tableStats.filter(table => table.status === 'error').length;
      const coreTables = tableStats.filter(table => table.isCore);
      const coreHealthyTables = coreTables.filter(table => table.status === 'active').length;

      console.log('✅ Successfully fetched database statistics');
      return {
        totalTables,
        totalRecords,
        healthyTables,
        missingTables,
        errorTables,
        healthScore: Math.round((healthyTables / totalTables) * 100),
        coreHealthScore: Math.round((coreHealthyTables / coreTables.length) * 100),
        tableStats
      };
    } catch (error) {
      console.error('❌ Error fetching database statistics:', error);
      throw new Error('Failed to fetch database statistics');
    }
  }

  // Get SQL script to create missing tables
  static getMissingTableCreationScript(missingTableNames: string[]): string {
    const sqlStatements: Record<string, string> = {
      // Compliance tables
      'compliance_issue_types': `
        CREATE TABLE IF NOT EXISTS compliance_issue_types (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          category VARCHAR(50),
          severity VARCHAR(20) DEFAULT 'medium',
          is_active BOOLEAN DEFAULT true,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,
      
      'compliance_issues': `
        CREATE TABLE IF NOT EXISTS compliance_issues (
          id BIGSERIAL PRIMARY KEY,
          issue_type_id BIGINT REFERENCES compliance_issue_types(id),
          case_id BIGINT REFERENCES cases(id),
          customer_id BIGINT REFERENCES customers(id),
          title VARCHAR(200) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'open',
          severity VARCHAR(20) DEFAULT 'medium',
          priority VARCHAR(20) DEFAULT 'medium',
          assigned_to BIGINT REFERENCES users(id),
          reported_by BIGINT REFERENCES users(id),
          reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP WITH TIME ZONE,
          due_date TIMESTAMP WITH TIME ZONE,
          resolution TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

      'compliance_issue_comments': `
        CREATE TABLE IF NOT EXISTS compliance_issue_comments (
          id BIGSERIAL PRIMARY KEY,
          issue_id BIGINT REFERENCES compliance_issues(id),
          user_id BIGINT REFERENCES users(id),
          comment TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT false,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

      'compliance_reports': `
        CREATE TABLE IF NOT EXISTS compliance_reports (
          id BIGSERIAL PRIMARY KEY,
          template_id BIGINT REFERENCES report_templates(id),
          name VARCHAR(200) NOT NULL,
          description TEXT,
          report_type VARCHAR(50),
          status VARCHAR(20) DEFAULT 'draft',
          generated_by BIGINT REFERENCES users(id),
          generated_at TIMESTAMP WITH TIME ZONE,
          data JSONB,
          file_path TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

      'report_templates': `
        CREATE TABLE IF NOT EXISTS report_templates (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          report_type VARCHAR(50),
          query TEXT,
          parameters JSONB,
          is_active BOOLEAN DEFAULT true,
          created_by BIGINT REFERENCES users(id),
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

      // Approval Queue tables
      'approval_queues': `
        CREATE TABLE IF NOT EXISTS approval_queues (
          id BIGSERIAL PRIMARY KEY,
          organization_id BIGINT REFERENCES organizations(id),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          queue_type VARCHAR(50),
          department_type VARCHAR(50),
          priority INTEGER DEFAULT 1,
          is_active BOOLEAN DEFAULT true,
          auto_assign BOOLEAN DEFAULT false,
          max_concurrent_items INTEGER DEFAULT 10,
          sla_hours INTEGER DEFAULT 24,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

      'approval_queue_items': `
        CREATE TABLE IF NOT EXISTS approval_queue_items (
          id BIGSERIAL PRIMARY KEY,
          organization_id BIGINT REFERENCES organizations(id),
          queue_id BIGINT REFERENCES approval_queues(id),
          item_type VARCHAR(50),
          item_id BIGINT,
          priority VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(20) DEFAULT 'pending',
          assigned_to BIGINT REFERENCES users(id),
          assigned_at TIMESTAMP WITH TIME ZONE,
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          due_date TIMESTAMP WITH TIME ZONE,
          comments TEXT,
          decision VARCHAR(50),
          decision_reason TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

      // Workflow tables
      'workflow_stages': `
        CREATE TABLE IF NOT EXISTS workflow_stages (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          stage_order INTEGER,
          is_active BOOLEAN DEFAULT true,
          is_initial BOOLEAN DEFAULT false,
          is_final BOOLEAN DEFAULT false,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

      'workflow_transitions': `
        CREATE TABLE IF NOT EXISTS workflow_transitions (
          id BIGSERIAL PRIMARY KEY,
          from_stage_id BIGINT REFERENCES workflow_stages(id),
          to_stage_id BIGINT REFERENCES workflow_stages(id),
          name VARCHAR(100),
          description TEXT,
          conditions JSONB,
          is_active BOOLEAN DEFAULT true,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,

      'workflow_history': `
        CREATE TABLE IF NOT EXISTS workflow_history (
          id BIGSERIAL PRIMARY KEY,
          entity_type VARCHAR(50),
          entity_id BIGINT,
          from_stage_id BIGINT REFERENCES workflow_stages(id),
          to_stage_id BIGINT REFERENCES workflow_stages(id),
          transition_id BIGINT REFERENCES workflow_transitions(id),
          user_id BIGINT REFERENCES users(id),
          comments TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`
    };

    const scripts = missingTableNames
      .map(tableName => sqlStatements[tableName])
      .filter(Boolean);

    return scripts.join('\n\n');
  }

  // Clear all data from a table (dangerous operation)
  static async clearTable(tableName: string) {
    console.log('⚠️ CLEARING ALL DATA FROM TABLE:', tableName);
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('id', 0); // This will delete all rows

      if (error) {
        throw new Error(`Failed to clear table ${tableName}: ${error.message}`);
      }

      console.log('✅ Successfully cleared table:', tableName);
    } catch (error) {
      console.error('❌ Error clearing table:', error);
      throw new Error(`Failed to clear table ${tableName}`);
    }
  }

  // Log new audit entry
  static async logAuditAction(
    userId: string,
    action: string,
    entityType: string,
    entityId?: string | number,
    ipAddress?: string,
    sessionId?: string,
    organizationId?: number
  ) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.AUDIT_LOG)
        .insert({
          organization_id: organizationId || null,
          user_id: parseInt(userId),
          action: action.toUpperCase(),
          entity_type: entityType,
          entity_id: entityId ? parseInt(entityId.toString()) : null,
          ip_address: ipAddress || null,
          user_agent: 'System',
          metadata: { session_id: sessionId || `sess_${Date.now()}`, duration: null },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error logging audit action:', error);
        return null;
      }

      console.log('Audit action logged successfully:', data?.[0]);
      return data?.[0];
    } catch (error) {
      console.error('Error logging audit action:', error);
      return null;
    }
  }

  // Helper method to determine log type based on action
  private static getLogType(action: string): string {
    const errorActions = ['DELETE', 'REJECT', 'FAIL'];
    const warningActions = ['UPDATE', 'MODIFY', 'CHANGE'];
    const successActions = ['CREATE', 'APPROVE', 'COMPLETE', 'VERIFY'];
    
    if (errorActions.some(a => action.toUpperCase().includes(a))) {
      return 'error';
    }
    if (warningActions.some(a => action.toUpperCase().includes(a))) {
      return 'warning';
    }
    if (successActions.some(a => action.toUpperCase().includes(a))) {
      return 'success';
    }
    return 'info';
  }
  // =============================================================================
  // WORKFLOW MANAGEMENT METHODS
  // =============================================================================

  // Create workflow instance
  static async createWorkflowInstance(instance: any) {
    console.log('Creating workflow instance:', instance);
    
    const { data, error } = await supabase
      .from('workflow_instances')
      .insert({
        id: instance.id,
        workflow_id: instance.workflowId,
        case_id: instance.caseId,
        current_step: instance.currentStep,
        status: instance.status,
        started_at: instance.startedAt,
        completed_at: instance.completedAt,
        data: instance.data,
        history: instance.history
      })
      .select();

    if (error) {
      console.error('Error creating workflow instance:', error);
      throw new Error(`Failed to create workflow instance: ${error.message}`);
    }

    return data?.[0];
  }

  // Get workflow instances for a case
  static async getWorkflowInstancesForCase(caseId: string) {
    console.log('Getting workflow instances for case:', caseId);
    
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('case_id', caseId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error getting workflow instances:', error);
      return [];
    }

    return data || [];
  }

  // Update workflow instance
  static async updateWorkflowInstance(instanceId: string, updates: any) {
    console.log('Updating workflow instance:', instanceId, updates);
    
    const { data, error } = await supabase
      .from('workflow_instances')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', instanceId)
      .select();

    if (error) {
      console.error('Error updating workflow instance:', error);
      throw new Error(`Failed to update workflow instance: ${error.message}`);
    }

    return data?.[0];
  }

  // Get active workflow instances
  static async getActiveWorkflowInstances() {
    console.log('Getting active workflow instances');
    
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('status', 'active')
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error getting active workflow instances:', error);
      return [];
    }

    return data || [];
  }

  // Get cases without workflows
  static async getCasesWithoutWorkflows() {
    console.log('Getting cases without workflows');
    
    const { data, error } = await supabase
      .from('cases')
      .select(`
        id,
        case_number,
        customer_id,
        product_id,
        assigned_to,
        loan_amount,
        priority,
        status,
        created_at
      `)
      .not('id', 'in', `(
        SELECT DISTINCT case_id 
        FROM workflow_instances 
        WHERE status = 'active'
      )`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting cases without workflows:', error);
      return [];
    }

    return data || [];
  }

  // =============================================================================
  // NOTIFICATION MANAGEMENT METHODS
  // =============================================================================

  // Create notification
  static async createNotification(notification: any) {
    console.log('Creating notification:', notification);
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipient: notification.recipient,
        recipient_type: notification.recipientType,
        case_id: notification.caseId,
        data: notification.data,
        priority: notification.priority,
        status: notification.status || 'pending',
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data?.[0];
  }

  // Get notifications for user
  static async getNotificationsForUser(userId: string, limit: number = 50) {
    console.log('Getting notifications for user:', userId);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`recipient.eq.${userId},recipient_type.eq.role`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting notifications:', error);
      return [];
    }

    return data || [];
  }

  // Update notification
  static async updateNotification(notificationId: string, updates: any) {
    console.log('Updating notification:', notificationId, updates);
    
    const { data, error } = await supabase
      .from('notifications')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('Error updating notification:', error);
      throw new Error(`Failed to update notification: ${error.message}`);
    }

    return data?.[0];
  }

  // Delete notification
  static async deleteNotification(notificationId: string) {
    console.log('Deleting notification:', notificationId);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  // Real-time subscription for notifications
  static subscribeToNotificationUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('notification-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        callback
      )
      .subscribe();
  }

  // Get notification statistics
  static async getNotificationStats(userId: string) {
    console.log('Getting notification stats for user:', userId);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('type, priority, read_at')
      .or(`recipient.eq.${userId},recipient_type.eq.role`);

    if (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, unread: 0, byType: {}, byPriority: {} };
    }

    const notifications = data || [];
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read_at).length;
    
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, unread, byType, byPriority };
  }

  // Subscribe to notifications
  static subscribeToNotifications(callback: (payload: any) => void) {
    return supabase
      .channel('notifications-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: SUPABASE_TABLES.NOTIFICATIONS },
        callback
      )
      .subscribe();
  }
}

export default SupabaseDatabaseService;
