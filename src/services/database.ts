import { supabase } from '../supabase-client';

// =============================================================================
// DATABASE SERVICE LAYER
// =============================================================================

export class DatabaseService {
  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('full_name, role, email, mobile')
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
    };
  }

  static async getUsers(organizationId?: string) {
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        mobile,
        role,
        is_active,
        last_login_at,
        created_at
      `)
      .eq('is_active', true);

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

  // =============================================================================
  // CASE MANAGEMENT
  // =============================================================================

  static async getCases(filters?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    organizationId?: string;
  }) {
    let query = supabase
      .from('loan_applications')
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
        current_stage,
        assigned_sales_agent,
        assigned_credit_analyst,
        workflow_data,
        submitted_at,
        approved_at,
        rejected_at,
        created_at,
        updated_at,
        customers(
          id,
          first_name,
          last_name,
          email,
          phone,
          monthly_income,
          risk_profile,
          kyc_status
        ),
        loan_products(
          id,
          name,
          product_code,
          min_amount,
          max_amount,
          interest_rate
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_sales_agent', filters.assignedTo);
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

    return data?.map(case_ => {
      const customer = Array.isArray(case_.customers) ? case_.customers[0] : case_.customers;
      const loanProduct = Array.isArray(case_.loan_products) ? case_.loan_products[0] : case_.loan_products;
      
      return {
        id: case_.id,
        caseNumber: case_.application_number,
        customer: {
          id: customer?.id || '',
          name: `${customer?.first_name || ''} ${customer?.last_name || ''}`,
          phone: customer?.phone || '',
          email: customer?.email || '',
          age: 0, // Calculate from date of birth if available
          maritalStatus: 'single' as const,
          employment: 'salaried' as const,
          loanType: loanProduct?.name || '',
          loanAmount: case_.requested_amount,
          riskProfile: (customer?.risk_profile as 'low' | 'medium' | 'high') || 'low',
          createdAt: case_.created_at,
        },
        assignedTo: case_.assigned_sales_agent || '',
        status: case_.status as 'new' | 'in-progress' | 'review' | 'approved' | 'rejected',
        priority: case_.priority as 'low' | 'medium' | 'high',
        createdAt: case_.created_at,
        updatedAt: case_.updated_at,
        documents: [], // Will be fetched separately
        whatsappMessages: [], // Will be fetched separately
        complianceLog: [], // Will be fetched separately
      };
    }) || [];
  }

  static async getCaseById(caseId: string) {
    const { data, error } = await supabase
      .from('loan_applications')
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
        current_stage,
        assigned_sales_agent,
        assigned_credit_analyst,
        workflow_data,
        submitted_at,
        approved_at,
        rejected_at,
        created_at,
        updated_at,
        customers(
          id,
          first_name,
          last_name,
          email,
          phone,
          monthly_income,
          risk_profile,
          kyc_status
        ),
        loan_products(
          id,
          name,
          product_code,
          min_amount,
          max_amount,
          interest_rate
        )
      `)
      .eq('id', caseId)
      .single();

    if (error) {
      console.error('Error fetching case:', error);
      return null;
    }

    const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers;
    const loanProduct = Array.isArray(data.loan_products) ? data.loan_products[0] : data.loan_products;
    
    return {
      id: data.id,
      caseNumber: data.application_number,
      customer: {
        id: customer?.id || '',
        name: `${customer?.first_name || ''} ${customer?.last_name || ''}`,
        phone: customer?.phone || '',
        email: customer?.email || '',
        age: 0,
        maritalStatus: 'single' as const,
        employment: 'salaried' as const,
        loanType: loanProduct?.name || '',
        loanAmount: data.requested_amount,
        riskProfile: (customer?.risk_profile as 'low' | 'medium' | 'high') || 'low',
        createdAt: data.created_at,
      },
      assignedTo: data.assigned_sales_agent || '',
      status: data.status as 'new' | 'in-progress' | 'review' | 'approved' | 'rejected',
      priority: data.priority as 'low' | 'medium' | 'high',
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
      .from('documents')
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
        document_types(
          id,
          name,
          category,
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
        id: doc.id,
        name: docType?.name || '',
        type: docType?.category || '',
        status: doc.status as 'pending' | 'received' | 'verified' | 'rejected',
        required: docType?.is_required || false,
        uploadedAt: doc.uploaded_at,
        verifiedAt: doc.verified_at,
        reviewedAt: doc.reviewed_at,
        reviewedBy: doc.reviewed_by,
        rejectionReason: doc.rejection_reason,
        fileUrl: doc.file_path,
        notes: doc.notes,
        category: (docType?.category as 'identity' | 'financial' | 'business' | 'property' | 'employment' | 'other') || 'other',
        priority: (docType?.priority as 'high' | 'medium' | 'low') || 'low',
        fileSize: doc.file_size,
        fileType: doc.file_type,
      };
    }) || [];
  }

  // =============================================================================
  // WHATSAPP MESSAGES
  // =============================================================================

  static async getWhatsAppMessages(caseId: string) {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select(`
        id,
        message_id,
        type,
        content,
        sender,
        direction,
        document_id,
        metadata,
        timestamp
      `)
      .eq('conversation_id', caseId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }

    return data?.map(msg => ({
      id: msg.id,
      timestamp: msg.timestamp,
      type: msg.type as 'text' | 'document' | 'system',
      content: msg.content,
      sender: msg.sender as 'customer' | 'system' | 'agent',
      documentId: msg.document_id,
    })) || [];
  }

  // =============================================================================
  // COMPLIANCE LOGS
  // =============================================================================

  static async getComplianceLogs(caseId: string) {
    const { data, error } = await supabase
      .from('compliance_logs')
      .select(`
        id,
        action,
        user_id,
        details,
        log_type,
        created_at,
        users(
          id,
          full_name
        )
      `)
      .eq('loan_application_id', caseId)
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
        details: log.details,
        type: log.log_type as 'info' | 'warning' | 'success' | 'error',
      };
    }) || [];
  }

  // =============================================================================
  // DASHBOARD STATISTICS
  // =============================================================================

  static async getDashboardStats(userId: string, _role: string) {
    const stats = {
      totalCases: 0,
      activeCases: 0,
      completedToday: 0,
      pendingDocuments: 0,
      overdueTasks: 0,
      approvalRate: 0,
      teamEfficiency: 0,
    };

    try {
      // Get basic case counts
      const { data: cases, error: casesError } = await supabase
        .from('loan_applications')
        .select('id, status, created_at, updated_at')
        .eq('assigned_sales_agent', userId);

      if (!casesError && cases) {
        stats.totalCases = cases.length;
        stats.activeCases = cases.filter(c => c.status === 'in-progress').length;
        
        const today = new Date().toISOString().split('T')[0];
        stats.completedToday = cases.filter(c => 
          c.status === 'approved' && c.updated_at?.startsWith(today)
        ).length;
      }

      // Get document counts
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('id, status')
        .eq('status', 'pending');

      if (!docsError && documents) {
        stats.pendingDocuments = documents.length;
      }

      // Get approval rate
      const { data: allCases, error: allCasesError } = await supabase
        .from('loan_applications')
        .select('id, status');

      if (!allCasesError && allCases) {
        const approved = allCases.filter(c => c.status === 'approved').length;
        stats.approvalRate = allCases.length > 0 ? (approved / allCases.length) * 100 : 0;
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }

    return stats;
  }

  // =============================================================================
  // WORKLOAD PLANNING
  // =============================================================================

  static async getWorkloadTasks(userId: string, _date?: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        priority,
        status,
        due_date,
        assigned_to,
        created_at,
        customers(
          id,
          first_name,
          last_name,
          phone
        )
      `)
      .eq('assigned_to', userId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching workload tasks:', error);
      return [];
    }

    return data?.map(task => {
      const customer = Array.isArray(task.customers) ? task.customers[0] : task.customers;
      
      return {
        id: task.id,
        time: task.due_date ? new Date(task.due_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) : '09:00',
        customer: customer ? `${customer?.first_name || ''} ${customer?.last_name || ''}` : 'Unknown',
        phone: customer?.phone || '',
        task: task.title,
        priority: task.priority as 'high' | 'medium' | 'low',
        type: 'follow-up' as const,
      };
    }) || [];
  }

  // =============================================================================
  // APPROVAL QUEUE
  // =============================================================================

  static async getApprovalQueue() {
    const { data, error } = await supabase
      .from('loan_applications')
      .select(`
        id,
        application_number,
        status,
        priority,
        requested_amount,
        created_at,
        customers(
          id,
          first_name,
          last_name,
          phone,
          risk_profile
        ),
        loan_products(
          id,
          name
        ),
        users!assigned_sales_agent(
          id,
          full_name
        )
      `)
      .in('status', ['submitted', 'under_review'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching approval queue:', error);
      return [];
    }

    return data?.map(case_ => {
      const customer = Array.isArray(case_.customers) ? case_.customers[0] : case_.customers;
      const loanProduct = Array.isArray(case_.loan_products) ? case_.loan_products[0] : case_.loan_products;
      const user = Array.isArray(case_.users) ? case_.users[0] : case_.users;
      
      return {
        id: case_.id,
        customer: `${customer?.first_name || ''} ${customer?.last_name || ''}`,
        phone: customer?.phone || '',
        loanType: loanProduct?.name || '',
        amount: `₹${(case_.requested_amount / 100000).toFixed(0)}L`,
        risk: customer?.risk_profile || 'low',
        completeness: 85, // Calculate based on document completeness
        waitTime: this.calculateWaitTime(case_.created_at),
        flags: [], // Calculate based on missing documents or issues
        priority: case_.priority,
        submittedBy: user?.full_name || 'Unknown',
      };
    }) || [];
  }

  // =============================================================================
  // TEAM OVERSIGHT
  // =============================================================================

  static async getTeamMembers(_organizationId?: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        is_active,
        last_login_at,
        created_at
      `)
      .eq('is_active', true)
      .in('role', ['sales_agent', 'sales_manager', 'credit_analyst', 'credit_manager']);

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

    // Get performance data for each team member
    const teamMembers = await Promise.all(
      (data || []).map(async (member) => {
        const { data: cases } = await supabase
          .from('loan_applications')
          .select('id, status, created_at, updated_at')
          .eq('assigned_sales_agent', member.id);

        const activeCases = cases?.filter(c => c.status === 'in-progress').length || 0;
        const completedThisMonth = cases?.filter(c => 
          c.status === 'approved' && 
          new Date(c.updated_at).getMonth() === new Date().getMonth()
        ).length || 0;

        return {
          id: member.id,
          name: member.full_name,
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

    return teamMembers;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private static calculateWaitTime(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than 1 hour';
    if (diffHours < 24) return `${diffHours} hours`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }

  // =============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================================================

  static subscribeToCases(callback: (payload: any) => void) {
    return supabase
      .channel('cases')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'loan_applications' },
        callback
      )
      .subscribe();
  }

  static subscribeToDocuments(caseId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`documents-${caseId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'documents', filter: `loan_application_id=eq.${caseId}` },
        callback
      )
      .subscribe();
  }

  static subscribeToMessages(caseId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages-${caseId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_messages', filter: `conversation_id=eq.${caseId}` },
        callback
      )
      .subscribe();
  }
}

export default DatabaseService;
