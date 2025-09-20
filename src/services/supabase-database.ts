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
  mapWorkflowStageData,
  mapWorkflowTransitionData,
  mapWorkflowHistoryData,
  mapLoanApplicationData,
  mapLoanProductData,
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
  mapApprovalQueueItemData
} from './supabase-schema-mapping';

// =============================================================================
// UPDATED DATABASE SERVICE FOR SUPABASE SCHEMA
// =============================================================================

export class SupabaseDatabaseService {
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
          name: customer?.full_name || 'Unknown Customer',
          phone: customer?.mobile || '',
          email: customer?.email || '',
          age: customer?.dob ? Math.floor((Date.now() - new Date(customer.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
          maritalStatus: customer?.metadata?.marital_status || 'single',
          employment: customer?.metadata?.employment_type || 'salaried',
          loanType: product?.name || 'Personal Loan',
          loanAmount: case_.metadata?.requested_amount || 0,
          riskProfile: customer?.metadata?.risk_profile || 'low',
          createdAt: case_.created_at,
        },
        assignedTo: case_.assigned_to || '',
        status: mapCaseToLoanApplication(case_).status as "new" | "in-progress" | "review" | "approved" | "rejected",
        priority: mapCaseToLoanApplication(case_).priority as "low" | "medium" | "high",
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
        name: customer?.full_name || '',
        phone: customer?.mobile || '',
        email: customer?.email || '',
        age: customer?.dob ? Math.floor((Date.now() - new Date(customer.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
        maritalStatus: customer?.metadata?.marital_status || 'single',
        employment: customer?.metadata?.employment_type || 'salaried',
        loanType: product?.name || '',
        loanAmount: data.metadata?.requested_amount || 0,
        riskProfile: customer?.metadata?.risk_profile || 'low',
        createdAt: data.created_at,
      },
      assignedTo: data.assigned_to || '',
      status: mapCaseToLoanApplication(data).status as "new" | "in-progress" | "review" | "approved" | "rejected",
      priority: mapCaseToLoanApplication(data).priority as "low" | "medium" | "high",
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

  static subscribeToDepartmentUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('department-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'departments' 
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
      .subscribe();
  }

  // =============================================================================
  // WORKLOAD PLANNING (MAPPED TO TASKS)
  // =============================================================================

  static async getWorkloadTasks(userId: string, _date?: string) {
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

  static async getTeamMembers(_organizationId?: number) {
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
      action: 'case_approved',
      entity_type: 'case',
      entity_id: caseId,
      user_id: approvalData.approvedBy,
      details: `Case approved with notes: ${approvalData.notes || 'No notes'}`,
      severity: 'info',
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
      action: 'case_rejected',
      entity_type: 'case',
      entity_id: caseId,
      user_id: rejectionData.rejectedBy,
      details: `Case rejected: ${rejectionData.reason}`,
      severity: 'medium',
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
      action: 'compliance_issue_resolved',
      entity_type: 'compliance_issue',
      entity_id: issueId,
      user_id: resolutionData.resolvedBy,
      details: `Compliance issue resolved: ${resolutionData.resolutionNotes}`,
      severity: 'info',
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
      action: 'compliance_issue_escalated',
      entity_type: 'compliance_issue',
      entity_id: issueId,
      user_id: escalationData.escalatedBy,
      details: `Compliance issue escalated: ${escalationData.escalationReason}`,
      severity: 'high',
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
      action: 'review_approved',
      entity_type: 'case',
      entity_id: reviewId,
      user_id: approvalData.approvedBy,
      details: `Review approved: ${approvalData.approvalNotes}`,
      severity: 'info',
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
      action: 'review_rejected',
      entity_type: 'case',
      entity_id: reviewId,
      user_id: rejectionData.rejectedBy,
      details: `Review rejected: ${rejectionData.rejectionReason}`,
      severity: 'medium',
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
      action: 'additional_info_requested',
      entity_type: 'case',
      entity_id: reviewId,
      user_id: requestData.requestedBy,
      details: `Additional info requested: ${requestData.infoRequest}`,
      severity: 'info',
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
}

export default SupabaseDatabaseService;
