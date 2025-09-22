import { supabase } from '../supabase-client';
import { 
  SUPABASE_TABLES, 
  mapCaseToLoanApplication, 
  mapDocumentStatus, 
  mapTaskPriority,
  mapRoleData,
  mapPermissionData,
  mapAuditLogData,
  mapProductData,
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
        uuid,
        name,
        slug,
        domain,
        logo_url,
        description,
        address,
        contact_info,
        settings,
        status,
        subscription_plan,
        trial_ends_at,
        subscription_ends_at,
        max_users,
        max_loans_per_month,
        features,
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
      uuid: org.uuid,
      name: org.name,
      slug: org.slug,
      domain: org.domain,
      logoUrl: org.logo_url,
      description: org.description,
      address: org.address,
      contactInfo: org.contact_info,
      settings: org.settings,
      status: org.status,
      subscriptionPlan: org.subscription_plan,
      trialEndsAt: org.trial_ends_at,
      subscriptionEndsAt: org.subscription_ends_at,
      maxUsers: org.max_users,
      maxLoansPerMonth: org.max_loans_per_month,
      features: org.features,
      createdAt: org.created_at,
      updatedAt: org.updated_at
    })) || [];
  }

  static async createOrganization(organizationData: {
    name: string;
    slug: string;
    domain?: string;
    description?: string;
    address?: any;
    contactInfo?: any;
    maxUsers: number;
    maxLoansPerMonth: number;
    subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  }) {
    console.log('🚀 Creating organization:', organizationData);
    console.log('📊 Using table:', SUPABASE_TABLES.ORGANIZATIONS);
    
    const insertData = {
      name: organizationData.name,
      slug: organizationData.slug,
      domain: organizationData.domain,
      description: organizationData.description,
      address: organizationData.address,
      contact_info: organizationData.contactInfo,
      max_users: organizationData.maxUsers,
      max_loans_per_month: organizationData.maxLoansPerMonth,
      subscription_plan: organizationData.subscriptionPlan,
      status: 'trial',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
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
    return data?.[0];
  }

  static async updateOrganization(organizationId: string, updates: {
    name?: string;
    slug?: string;
    domain?: string;
    description?: string;
    address?: any;
    contactInfo?: any;
    maxUsers?: number;
    maxLoansPerMonth?: number;
    subscriptionPlan?: 'trial' | 'basic' | 'premium' | 'enterprise';
    status?: 'trial' | 'active' | 'suspended' | 'cancelled';
  }) {
    console.log('Updating organization:', organizationId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATIONS)
      .update({
        ...updates,
        contact_info: updates.contactInfo,
        max_users: updates.maxUsers,
        max_loans_per_month: updates.maxLoansPerMonth,
        subscription_plan: updates.subscriptionPlan,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .select();

    if (error) {
      console.error('Error updating organization:', error);
      throw new Error(`Failed to update organization: ${error.message}`);
    }

    return data?.[0];
  }

  static async deleteOrganization(organizationId: string) {
    console.log('Deleting organization:', organizationId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.ORGANIZATIONS)
      .delete()
      .eq('id', organizationId);

    if (error) {
      console.error('Error deleting organization:', error);
      throw new Error(`Failed to delete organization: ${error.message}`);
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
  // DEPARTMENT MANAGEMENT
  // =============================================================================

  static async getDepartments(filters?: {
    organizationId?: string;
    departmentType?: string;
    isActive?: boolean;
  }) {
    console.log('Fetching departments with filters:', filters);
    
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
        organization_id,
        parent_department:parent_department_id(
          id,
          name,
          code
        ),
        manager:manager_id(
          id,
          full_name,
          email
        )
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
      parentDepartment: dept.parent_department ? {
        id: dept.parent_department.id.toString(),
        name: dept.parent_department.name,
        code: dept.parent_department.code
      } : undefined,
      manager: dept.manager ? {
        id: dept.manager.id.toString(),
        full_name: dept.manager.full_name,
        email: dept.manager.email
      } : undefined
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

    return data?.[0];
  }

  static async deleteDepartment(departmentId: string) {
    console.log('Deleting department:', departmentId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.DEPARTMENTS)
      .delete()
      .eq('id', departmentId);

    if (error) {
      console.error('Error deleting department:', error);
      throw new Error(`Failed to delete department: ${error.message}`);
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
    let query = supabase
      .from(SUPABASE_TABLES.USERS)
      .select(`
        id,
        email,
        full_name,
        mobile,
        role,
        status,
        organization_id,
        department_id,
        created_at,
        updated_at
      `);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  }

  static async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended') {
    console.log('Updating user status:', { userId, status });
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user status:', error);
      throw new Error(`Failed to update user status: ${error.message}`);
    }

    console.log('User status updated successfully:', data);
    return data;
  }

  static async activateUser(userId: string) {
    return this.updateUserStatus(userId, 'active');
  }

  static async suspendUser(userId: string) {
    return this.updateUserStatus(userId, 'suspended');
  }

  static async deactivateUser(userId: string) {
    return this.updateUserStatus(userId, 'inactive');
  }

  static async createUser(userData: {
    full_name: string;
    email: string;
    mobile?: string;
    role: string;
    organization_id?: number;
    department_id?: number;
  }) {
    console.log('Creating new user:', userData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .insert({
        ...userData,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    console.log('User created successfully:', data);
    return data;
  }

  static async updateUser(userId: string, updates: {
    full_name?: string;
    email?: string;
    mobile?: string;
    role?: string;
    department_id?: number;
  }) {
    console.log('Updating user:', userId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    console.log('User updated successfully:', data);
    return data;
  }

  static async deleteUser(userId: string) {
    console.log('Deleting user:', userId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    console.log('User deleted successfully');
  }

  // =============================================================================
  // CASE MANAGEMENT (MAPPED TO CASES TABLE)
  // =============================================================================

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
        customers(
          id,
          full_name,
          mobile,
          email,
          dob,
          address,
          kyc_status,
          metadata
        ),
        products(
          id,
          name,
          code,
          description,
          metadata
        )
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
      // First get the user's internal ID from their auth_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', filters.assignedTo)
        .single();
      
      if (userData?.id) {
        query = query.eq('assigned_to', userData.id);
      } else {
        // If no user found, return empty array
        console.log('No user found for assignedTo filter');
        return [];
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
      const customer = Array.isArray(case_.customers) ? case_.customers[0] : case_.customers;
      const product = Array.isArray(case_.products) ? case_.products[0] : case_.products;
      
      return {
        id: case_.id,
        caseNumber: case_.case_number || `CASE-${case_.id}`,
        customer: {
          id: customer?.id || '',
          userId: customer?.id || '',
          name: customer?.full_name || 'Unknown Customer',
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
          createdAt: case_.created_at,
          updatedAt: case_.updated_at,
        },
        assignedTo: case_.assigned_to || '',
        status: mapCaseToLoanApplication(case_).status as "new" | "in-progress" | "review" | "approved" | "rejected",
        priority: mapCaseToLoanApplication(case_).priority as "low" | "medium" | "high",
        loanAmount: case_.metadata?.requested_amount || 0,
        loanType: product?.name || 'Personal Loan',
        createdAt: case_.created_at,
        updatedAt: case_.updated_at,
        documents: [], // Will be fetched separately
        whatsappMessages: [], // Will be fetched separately
        complianceLog: [], // Will be fetched separately
      };
    });
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

  static async getDocuments(caseId: string) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .select(`
        id,
        document_type_id,
        file_name,
        file_path,
        file_size,
        file_type,
        mime_type,
        status,
        uploaded_at,
        verified_at,
        reviewed_at,
        reviewed_by,
        rejection_reason,
        notes,
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
        )
      `)
      .eq('loan_application_id', caseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data?.map(doc => {
      const docType = Array.isArray(doc.document_types) ? doc.document_types[0] : doc.document_types;
      
      return {
        id: doc.id.toString(),
        name: docType?.name || doc.file_name || '',
        type: docType?.category || 'other',
        status: mapDocumentStatus(doc.status) as "rejected" | "verified" | "pending" | "received",
        required: docType?.is_required || false,
        uploadedAt: doc.uploaded_at,
        verifiedAt: doc.verified_at,
        reviewedAt: doc.reviewed_at,
        reviewedBy: doc.reviewed_by ? doc.reviewed_by.toString() : undefined,
        rejectionReason: doc.rejection_reason,
        fileUrl: doc.file_path,
        notes: doc.notes,
        category: (docType?.category as 'identity' | 'financial' | 'business' | 'property' | 'employment' | 'other') || 'other',
        priority: (docType?.priority as 'high' | 'medium' | 'low') || 'medium',
        fileSize: doc.file_size ? Math.round(doc.file_size / 1024 / 1024 * 100) / 100 : undefined, // Convert bytes to MB
        fileType: doc.file_type,
      };
    }) || [];
  }

  static async approveDocument(documentId: string, reviewedBy: string) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .update({
        status: 'verified',
        reviewed_at: new Date().toISOString(),
        reviewed_by: parseInt(reviewedBy),
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
        reviewed_at: new Date().toISOString(),
        reviewed_by: parseInt(reviewedBy),
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

  static async uploadDocument(
    caseId: string,
    documentTypeId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    fileType: string
  ) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENTS)
      .insert({
        loan_application_id: parseInt(caseId),
        document_type_id: parseInt(documentTypeId),
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        file_type: fileType,
        status: 'received',
        uploaded_at: new Date().toISOString(),
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
    // First get the user's internal ID from their auth_id
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (!userData?.id) {
      console.log('User not found for auth_id:', userId);
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
      .eq('assigned_to', userData.id)
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
      .in('status', ['pending', 'in_progress'])
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
        user_id,
        action,
        entity_type,
        entity_id,
        description,
        metadata,
        created_at,
        users!inner(
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
        severity: getSeverity(log.action),
        ipAddress: log.metadata?.ip_address || 'Unknown',
        userAgent: log.metadata?.user_agent || 'Unknown',
        oldValues: null,
        newValues: null,
        resourceType: log.entity_type,
        resourceId: log.entity_id
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
        permissions,
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
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent,
        metadata,
        created_at,
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
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
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
        ...auditLogData,
        created_at: new Date().toISOString()
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

  static async getSubProducts(filters?: { productId?: string; isActive?: boolean }) {
    console.log('Fetching sub products with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.SUB_PRODUCTS)
      .select(`
        id,
        product_id,
        name,
        code,
        description,
        interest_rate,
        min_amount,
        max_amount,
        min_tenure,
        max_tenure,
        is_active,
        metadata,
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
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
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
    interestRate: number;
    minAmount: number;
    maxAmount: number;
    minTenure: number;
    maxTenure: number;
    metadata?: any;
  }) {
    console.log('Creating sub product:', subProductData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SUB_PRODUCTS)
      .insert({
        product_id: subProductData.productId,
        name: subProductData.name,
        code: subProductData.code,
        description: subProductData.description,
        interest_rate: subProductData.interestRate,
        min_amount: subProductData.minAmount,
        max_amount: subProductData.maxAmount,
        min_tenure: subProductData.minTenure,
        max_tenure: subProductData.maxTenure,
        is_active: true,
        metadata: subProductData.metadata,
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
    interestRate: number;
    minAmount: number;
    maxAmount: number;
    minTenure: number;
    maxTenure: number;
    isActive: boolean;
    metadata: any;
  }>) {
    console.log('Updating sub product:', subProductId, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.code) updateData.code = updates.code;
    if (updates.description) updateData.description = updates.description;
    if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate;
    if (updates.minAmount !== undefined) updateData.min_amount = updates.minAmount;
    if (updates.maxAmount !== undefined) updateData.max_amount = updates.maxAmount;
    if (updates.minTenure !== undefined) updateData.min_tenure = updates.minTenure;
    if (updates.maxTenure !== undefined) updateData.max_tenure = updates.maxTenure;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
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
    isRequired?: boolean;
    isActive?: boolean;
  }) {
    console.log('Fetching document against product with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.DOCUMENT_AGAINST_PRODUCT)
      .select(`
        id,
        product_id,
        document_type_id,
        is_required,
        priority,
        validity_period,
        is_active,
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
          validity_period,
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
    if (filters?.isRequired !== undefined) {
      query = query.eq('is_required', filters.isRequired);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
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
    isRequired: boolean;
    priority: 'high' | 'medium' | 'low';
    validityPeriod?: number;
    metadata?: any;
  }) {
    console.log('Creating document against product:', data);
    
    const { data: result, error } = await supabase
      .from(SUPABASE_TABLES.DOCUMENT_AGAINST_PRODUCT)
      .insert({
        product_id: data.productId,
        document_type_id: data.documentTypeId,
        is_required: data.isRequired,
        priority: data.priority,
        validity_period: data.validityPeriod,
        is_active: true,
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
    isRequired?: boolean;
    priority?: 'high' | 'medium' | 'low';
    validityPeriod?: number;
    isActive?: boolean;
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
    isRequired?: boolean;
    isActive?: boolean;
  }) {
    console.log('Fetching document against sub product with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.DOC_AGAINST_SUB_PRODUCT)
      .select(`
        id,
        sub_product_id,
        document_type_id,
        is_required,
        priority,
        validity_period,
        is_active,
        metadata,
        created_at,
        updated_at,
        sub_products!inner(
          id,
          product_id,
          name,
          code,
          description,
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
          validity_period,
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
    if (filters?.isRequired !== undefined) {
      query = query.eq('is_required', filters.isRequired);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
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
    isRequired: boolean;
    priority: 'high' | 'medium' | 'low';
    validityPeriod?: number;
    metadata?: any;
  }) {
    console.log('Creating document against sub product:', data);
    
    const { data: result, error } = await supabase
      .from(SUPABASE_TABLES.DOC_AGAINST_SUB_PRODUCT)
      .insert({
        sub_product_id: data.subProductId,
        document_type_id: data.documentTypeId,
        is_required: data.isRequired,
        priority: data.priority,
        validity_period: data.validityPeriod,
        is_active: true,
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
    isRequired?: boolean;
    priority?: 'high' | 'medium' | 'low';
    validityPeriod?: number;
    isActive?: boolean;
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
      .in('status', ['pending_review', 'under_review', 'awaiting_approval']);

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

  // Customers Management
  static async getCustomers(filters?: { 
    organizationId?: string; 
    isActive?: boolean; 
    employmentType?: string;
    riskProfile?: string;
  }) {
    console.log('Fetching customers with filters:', filters);
    
    let query = supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .select(`
        id,
        user_id,
        full_name,
        mobile,
        email,
        pan_number,
        aadhaar_number,
        date_of_birth,
        gender,
        marital_status,
        employment_type,
        risk_profile,
        kyc_status,
        metadata,
        created_at,
        updated_at,
        users!inner(
          id,
          full_name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.employmentType) {
      query = query.eq('employment_type', filters.employmentType);
    }
    if (filters?.riskProfile) {
      query = query.eq('risk_profile', filters.riskProfile);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return data?.map(customer => ({
      id: customer.id,
      userId: customer.user_id,
      name: customer.full_name,
      phone: customer.mobile,
      email: customer.email,
      panNumber: customer.pan_number,
      aadhaarNumber: customer.aadhaar_number,
      dateOfBirth: customer.date_of_birth,
      gender: customer.gender,
      maritalStatus: customer.marital_status,
      employment: customer.employment_type,
      riskProfile: customer.risk_profile,
      kycStatus: customer.kyc_status,
      age: customer.date_of_birth ? 
        Math.floor((Date.now() - new Date(customer.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
      metadata: customer.metadata,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      user: Array.isArray(customer.users) ? customer.users[0] : customer.users,
    })) || [];
  }

  static async createCustomer(customerData: any) {
    console.log('Creating customer:', customerData);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .insert({
        ...customerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return data?.[0];
  }

  static async updateCustomer(customerId: string, updates: any) {
    console.log('Updating customer:', customerId, updates);
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select();

    if (error) {
      console.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    return data?.[0];
  }

  static async deleteCustomer(customerId: string) {
    console.log('Deleting customer:', customerId);
    
    const { error } = await supabase
      .from(SUPABASE_TABLES.CUSTOMERS)
      .delete()
      .eq('id', customerId);

    if (error) {
      console.error('Error deleting customer:', error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }


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
}

export default SupabaseDatabaseService;
