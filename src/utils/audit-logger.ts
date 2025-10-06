/**
 * Comprehensive Audit Logger for Super Admin Operations
 * Automatically logs all CRUD operations to the audit_logs table
 */

import { supabase } from '../supabase-client';

export interface AuditLogData {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'IMPORT';
  entityType: 'user' | 'customer' | 'organization' | 'department' | 'case' | 'document' | 'dashboard' | 'report' | 'system';
  entityId?: string | null;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
  sessionId?: string;
  duration?: number;
  metadata?: any;
}

export class AuditLogger {
  /**
   * Create an audit log entry
   */
  static async log(auditData: AuditLogData): Promise<void> {
    try {
      console.log('🔍 Creating audit log:', auditData);
      
      const { error } = await supabase
        .from('logs')
        .insert({
          organization_id: null, // Default organization for now
          user_id: parseInt(auditData.userId) || null,
          action: auditData.action,
          entity_type: auditData.entityType,
          entity_id: auditData.entityId ? parseInt(auditData.entityId) : null,
          description: auditData.beforeState || auditData.afterState ? 
            `Before: ${JSON.stringify(auditData.beforeState || {})} | After: ${JSON.stringify(auditData.afterState || {})}` : 
            `${auditData.action} on ${auditData.entityType}`,
          log_type: 'info',
          metadata: {
            before_state: auditData.beforeState,
            after_state: auditData.afterState,
            session_id: auditData.sessionId || `sess_${Date.now()}`,
            duration: auditData.duration,
            ...auditData.metadata
          },
          ip_address: auditData.ipAddress || '127.0.0.1',
          user_agent: auditData.metadata?.userAgent || 'Browser',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error creating audit log:', error);
        // Don't throw here to avoid breaking the main operation
      } else {
        console.log('✅ Audit log created successfully');
      }
    } catch (error) {
      console.error('❌ Audit logging failed:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Log user creation
   */
  static async logUserCreation(userId: string, userData: any, createdBy: string): Promise<void> {
    await this.log({
      userId: createdBy,
      action: 'CREATE',
      entityType: 'user',
      entityId: userId,
      beforeState: null,
      afterState: {
        full_name: userData.fullName,
        email: userData.email,
        role: userData.role,
        status: 'active',
        created_at: new Date().toISOString()
      },
      metadata: {
        operation: 'user_creation',
        createdBy,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log user update
   */
  static async logUserUpdate(userId: string, oldData: any, newData: any, updatedBy: string): Promise<void> {
    await this.log({
      userId: updatedBy,
      action: 'UPDATE',
      entityType: 'user',
      entityId: userId,
      beforeState: oldData,
      afterState: newData,
      metadata: {
        operation: 'user_update',
        updatedBy,
        timestamp: new Date().toISOString(),
        changedFields: this.getChangedFields(oldData, newData)
      }
    });
  }

  /**
   * Log user deletion
   */
  static async logUserDeletion(userId: string, userData: any, deletedBy: string): Promise<void> {
    await this.log({
      userId: deletedBy,
      action: 'DELETE',
      entityType: 'user',
      entityId: userId,
      beforeState: userData,
      afterState: null,
      metadata: {
        operation: 'user_deletion',
        deletedBy,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log customer creation
   */
  static async logCustomerCreation(customerId: string, customerData: any, createdBy: string): Promise<void> {
    await this.log({
      userId: createdBy,
      action: 'CREATE',
      entityType: 'customer',
      entityId: customerId,
      beforeState: null,
      afterState: {
        full_name: customerData.fullName,
        email: customerData.email,
        mobile: customerData.mobile,
        created_at: new Date().toISOString()
      },
      metadata: {
        operation: 'customer_creation',
        createdBy,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log customer update
   */
  static async logCustomerUpdate(customerId: string, oldData: any, newData: any, updatedBy: string): Promise<void> {
    await this.log({
      userId: updatedBy,
      action: 'UPDATE',
      entityType: 'customer',
      entityId: customerId,
      beforeState: oldData,
      afterState: newData,
      metadata: {
        operation: 'customer_update',
        updatedBy,
        timestamp: new Date().toISOString(),
        changedFields: this.getChangedFields(oldData, newData)
      }
    });
  }

  /**
   * Log customer deletion
   */
  static async logCustomerDeletion(customerId: string, customerData: any, deletedBy: string): Promise<void> {
    await this.log({
      userId: deletedBy,
      action: 'DELETE',
      entityType: 'customer',
      entityId: customerId,
      beforeState: customerData,
      afterState: null,
      metadata: {
        operation: 'customer_deletion',
        deletedBy,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log organization creation
   */
  static async logOrganizationCreation(organizationId: string, organizationData: any, createdBy: string): Promise<void> {
    await this.log({
      userId: createdBy,
      action: 'CREATE',
      entityType: 'organization',
      entityId: organizationId,
      beforeState: null,
      afterState: {
        name: organizationData.name,
        code: organizationData.code,
        description: organizationData.description,
        created_at: new Date().toISOString()
      },
      metadata: {
        operation: 'organization_creation',
        createdBy,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log organization update
   */
  static async logOrganizationUpdate(organizationId: string, oldData: any, newData: any, updatedBy: string): Promise<void> {
    await this.log({
      userId: updatedBy,
      action: 'UPDATE',
      entityType: 'organization',
      entityId: organizationId,
      beforeState: oldData,
      afterState: newData,
      metadata: {
        operation: 'organization_update',
        updatedBy,
        timestamp: new Date().toISOString(),
        changedFields: this.getChangedFields(oldData, newData)
      }
    });
  }

  /**
   * Log organization deletion
   */
  static async logOrganizationDeletion(organizationId: string, organizationData: any, deletedBy: string): Promise<void> {
    await this.log({
      userId: deletedBy,
      action: 'DELETE',
      entityType: 'organization',
      entityId: organizationId,
      beforeState: organizationData,
      afterState: null,
      metadata: {
        operation: 'organization_deletion',
        deletedBy,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log department creation
   */
  static async logDepartmentCreation(departmentId: string, departmentData: any, createdBy: string): Promise<void> {
    await this.log({
      userId: createdBy,
      action: 'CREATE',
      entityType: 'department',
      entityId: departmentId,
      beforeState: null,
      afterState: {
        name: departmentData.name,
        code: departmentData.code,
        department_type: departmentData.departmentType,
        created_at: new Date().toISOString()
      },
      metadata: {
        operation: 'department_creation',
        createdBy,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log department update
   */
  static async logDepartmentUpdate(departmentId: string, oldData: any, newData: any, updatedBy: string): Promise<void> {
    await this.log({
      userId: updatedBy,
      action: 'UPDATE',
      entityType: 'department',
      entityId: departmentId,
      beforeState: oldData,
      afterState: newData,
      metadata: {
        operation: 'department_update',
        updatedBy,
        timestamp: new Date().toISOString(),
        changedFields: this.getChangedFields(oldData, newData)
      }
    });
  }

  /**
   * Log department deletion
   */
  static async logDepartmentDeletion(departmentId: string, departmentData: any, deletedBy: string): Promise<void> {
    await this.log({
      userId: deletedBy,
      action: 'DELETE',
      entityType: 'department',
      entityId: departmentId,
      beforeState: departmentData,
      afterState: null,
      metadata: {
        operation: 'department_deletion',
        deletedBy,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log dashboard view
   */
  static async logDashboardView(page: string, userId: string): Promise<void> {
    await this.log({
      userId,
      action: 'VIEW',
      entityType: 'dashboard',
      entityId: null,
      beforeState: null,
      afterState: {
        page,
        viewed_at: new Date().toISOString()
      },
      metadata: {
        operation: 'dashboard_view',
        page,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log user login
   */
  static async logUserLogin(userId: string, loginData: any): Promise<void> {
    await this.log({
      userId,
      action: 'LOGIN',
      entityType: 'user',
      entityId: userId,
      beforeState: null,
      afterState: {
        login_time: new Date().toISOString(),
        ip_address: loginData.ipAddress,
        user_agent: loginData.userAgent
      },
      metadata: {
        operation: 'user_login',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log user logout
   */
  static async logUserLogout(userId: string, logoutData: any): Promise<void> {
    await this.log({
      userId,
      action: 'LOGOUT',
      entityType: 'user',
      entityId: userId,
      beforeState: {
        last_activity: logoutData.lastActivity
      },
      afterState: {
        logout_time: new Date().toISOString()
      },
      metadata: {
        operation: 'user_logout',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get changed fields between old and new data
   */
  private static getChangedFields(oldData: any, newData: any): string[] {
    if (!oldData || !newData) return [];
    
    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    
    for (const key of allKeys) {
      if (oldData[key] !== newData[key]) {
        changedFields.push(key);
      }
    }
    
    return changedFields;
  }

  /**
   * Get current user ID from context (you'll need to implement this based on your auth system)
   */
  static getCurrentUserId(): string {
    // This should be replaced with actual user ID from your auth context
    // For now, returning a default value
    return '40'; // Default super admin user ID
  }

  /**
   * Get client IP address (simplified version)
   */
  static getClientIP(): string {
    // In a real application, you'd get this from the request headers
    // For now, returning a mock IP
    return '192.168.1.100';
  }
}
