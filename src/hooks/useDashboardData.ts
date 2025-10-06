import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SupabaseDatabaseService } from '../services/supabase-database';
import { 
  Case, 
  Document, 
  User, 
  Role, 
  Permission, 
  Product, 
  DocumentType, 
  File, 
  Folder,
  DocumentAgainstProduct,
  DocAgainstSubProduct,
  FileSignature,
  SystemSetting,
  OrganizationSetting,
  Customer,
  SubProduct,
  Department,
  EmploymentType,
  TaskType,
  TaskSlaPolicy,
  CaseStatusHistory,
  CaseWorkflowStage,
  AssignCaseSetting,
  AssignPermission,
  CacheEntry,
  Migration,
  CacheStatistics,
  CacheInvalidationLog,
  CacheHitRatio,
  LoanApplication,
  TaskCategory
} from '../types';

// Dashboard Stats Hook
export function useDashboardStats(userId: string, role: string) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (!isInitialized) {
        setLoading(true);
      }
      setError(null);
      const result = await SupabaseDatabaseService.getDashboardStats(userId, role);
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [userId, role, isInitialized]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, error, refetch };
}

// Admin Dashboard Stats Hook
export function useAdminDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getAdminDashboardStats();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, error, refetch };
}

// Department Performance Hook
export function useDepartmentPerformance() {
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getDepartmentPerformance();
      setPerformance(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch department performance');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { performance, loading, error, refetch };
}

// System Alerts Hook
export function useSystemAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getSystemAlerts();
      setAlerts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { alerts, loading, error, refetch };
}

// Recent Activities Hook
export function useRecentActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getRecentActivities();
      setActivities(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent activities');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { activities, loading, error, refetch };
}

// Cases Hook
export function useCases(filters?: { assignedTo?: string; status?: string; priority?: string; organizationId?: number; showAll?: boolean }) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      if (!isInitialized) {
        setLoading(true);
      }
      setError(null);
      
      // If showAll is true, don't apply assignedTo filter (for managers to see all cases)
      const effectiveFilters = filters?.showAll ? { ...filters, assignedTo: undefined } : filters;
      
      const result = await SupabaseDatabaseService.getCases(effectiveFilters);
      setCases(result as unknown as Case[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [filters, isInitialized]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription (only after initial load)
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = SupabaseDatabaseService.subscribeToCases((payload) => {
      console.log('Case real-time update:', payload);
      // Only refetch if the update is relevant to current filters
      if (!filters || payload.new || payload.old) {
        // Debounce the refetch to prevent excessive API calls
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, 500); // 500ms debounce
      }
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [isInitialized, fetchData, filters]);

  return { cases, loading, error, refetch };
}

// Documents Hook
export function useDocuments(caseId: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getDocuments(caseId);
      setDocuments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { documents, loading, error, refetch };
}

// Tasks Hook
export function useTasks(userId: string, date?: string) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getWorkloadTasks(userId);
      setTasks(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [userId, date]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { tasks, loading, error, refetch };
}

// Team Members Hook
export function useTeamMembers(organizationId?: number) {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (!isInitialized) {
        setLoading(true);
      }
      setError(null);
      const result = await SupabaseDatabaseService.getTeamMembers();
      setTeamMembers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [organizationId, isInitialized]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { teamMembers, loading, error, refetch };
}

// Audit Logs Hook
export function useAuditLogs(filters?: { searchTerm?: string; type?: string; severity?: string; limit?: number }) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable filters reference using useMemo to prevent infinite loops
  const stableFilters = useMemo(() => filters, [
    filters?.searchTerm,
    filters?.type, 
    filters?.severity,
    filters?.limit
  ]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getAuditLogs(stableFilters);
      setAuditLogs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription (only once, not dependent on fetchData)
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToAuditLogs((payload) => {
      console.log('Audit log real-time update:', payload);
      // Use a timeout to prevent rapid successive calls
      setTimeout(() => {
        fetchData();
      }, 100);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent recreation

  return { auditLogs, loading, error, refetch };
}

// Roles Hook
export function useRoles(filters?: { isActive?: boolean }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getRoles(filters);
      setRoles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { roles, loading, error, refetch };
}

// Permissions Hook
export function usePermissions(filters?: { resource?: string; action?: string; isActive?: boolean }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getPermissions(filters);
      setPermissions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { permissions, loading, error, refetch };
}

// Products Hook
export function useProducts(filters?: { category?: string; isActive?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getProducts(filters);
      setProducts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { products, loading, error, refetch };
}

// Document Types Hook
export function useDocumentTypes(filters?: { category?: string; isActive?: boolean; isRequired?: boolean }) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getDocumentTypesDetailed(filters);
      setDocumentTypes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document types');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { documentTypes, loading, error, refetch };
}

// Files Hook
export function useFiles(filters?: { caseId?: string; category?: string; uploadedBy?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Map the filters to match the expected parameters
      const mappedFilters = filters ? {
        uploaderId: filters.uploadedBy,
        fileType: filters.category,
        // Note: caseId and isPublic are not directly mappable with current parameters
      } : undefined;
      const result = await SupabaseDatabaseService.getFiles(mappedFilters);
      setFiles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { files, loading, error, refetch };
}

// Compliance Issues Hook
export function useComplianceIssues(filters?: { status?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getComplianceIssues(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance issues');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToComplianceUpdates((payload) => {
      console.log('Compliance issues real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Approval Queue Hook
export function useApprovalQueue() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getApprovalQueue();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approval queue');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToApprovalQueueUpdates((payload) => {
      console.log('Approval queue real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Pending Reviews Hook
export function usePendingReviews(filters?: { reviewType?: string; sortBy?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getPendingReviews(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToPendingReviewsUpdates((payload) => {
      console.log('Pending reviews real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Compliance Metrics Hook
export function useComplianceMetrics(period: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getComplianceMetrics(period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance metrics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Compliance Alerts Hook
export function useComplianceAlerts(period: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getComplianceAlerts(period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance alerts');
    } finally {
      setLoading(false);
    }
  }, [period]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Compliance Breakdown Hook
export function useComplianceBreakdown(period: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getComplianceBreakdown(period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance breakdown');
    } finally {
      setLoading(false);
    }
  }, [period]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// System Health Hook
export function useSystemHealth() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getSystemHealth();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// System Settings Hook
export function useSystemSettings(category?: string) {
  const [data, setData] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getSystemSettings(category);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system settings');
    } finally {
      setLoading(false);
    }
  }, [category]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Organization Settings Hook
export function useOrganizationSettings(organizationId: string, category?: string) {
  const [data, setData] = useState<OrganizationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getOrganizationSettings(organizationId, category);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organization settings');
    } finally {
      setLoading(false);
    }
  }, [organizationId, category]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToOrganizationSettings((payload) => {
      console.log('Organization setting real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// WhatsApp Messages Hook
export function useWhatsAppMessages(caseId: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getWhatsAppMessages(caseId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch WhatsApp messages');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToWhatsAppMessages(caseId, (payload) => {
      console.log('WhatsApp message update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, caseId]);

  return { data, loading, error, refetch };
}

// Individual Case Hook
export function useCase(caseId: string) {
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getCaseById(caseId);
      setCase(result as Case | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (caseId) {
      fetchData();
    }
  }, [fetchData, caseId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!caseId) return;
    
    const subscription = SupabaseDatabaseService.subscribeToCases((payload: any) => {
      console.log('Case real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, caseId]);

  return { case: case_, loading, error, refetch };
}

// Compliance Logs Hook for specific case
export function useComplianceLogs(caseId: string) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getComplianceLogs(caseId);
      setLogs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance logs');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (caseId) {
      fetchData();
    }
  }, [fetchData, caseId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!caseId) return;
    
    const subscription = SupabaseDatabaseService.subscribeToComplianceUpdates((payload: any) => {
      console.log('Compliance log real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, caseId]);

  return { logs, loading, error, refetch };
}

// Real-time Documents Hook
export function useRealtimeDocuments(caseId: string, callback: (payload: any) => void) {
  useEffect(() => {
    if (!caseId) return;

    const subscription = SupabaseDatabaseService.subscribeToDocuments(caseId, callback);

    return () => {
      subscription.unsubscribe();
    };
  }, [caseId, callback]);
}

// Workload Tasks Hook (alias for useTasks)
export function useWorkloadTasks(userId: string, date?: string) {
  return useTasks(userId, date);
}

// Workload Schedules Hook
export function useWorkloadSchedules(filters?: { organizationId?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getWorkloadSchedules(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workload schedules');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Workload Assignments Hook
export function useWorkloadAssignments(filters?: { organizationId?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getWorkloadAssignments(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workload assignments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Approval Queues Hook
export function useApprovalQueues(filters?: { organizationId?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getApprovalQueues(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approval queues');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Approval Queue Items Hook
export function useApprovalQueueItems(filters?: { organizationId?: string; queueId?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getApprovalQueueItems(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approval queue items');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Real-time Admin Dashboard Hook
export function useRealtimeAdminDashboard(callback: (payload: any) => void) {
  useEffect(() => {
    // For now, use a simple interval-based approach
    // In a real implementation, this would use Supabase real-time subscriptions
    const interval = setInterval(() => {
      // Trigger callback periodically for now
      // callback({ type: 'admin_dashboard_update', timestamp: new Date().toISOString() });
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [callback]);
}

// Report Templates Hook
export function useReportTemplates(filters?: { category?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getReportTemplates(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report templates');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Compliance Reports Hook
export function useComplianceReports(filters?: { period?: string; status?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getComplianceReports(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Compliance Issue Types Hook
export function useComplianceIssueTypes(filters?: { category?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getComplianceIssueTypes(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance issue types');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// System Integrations Hook
export function useSystemIntegrations(filters?: { organizationId?: string; status?: string; type?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getSystemIntegrations(filters?.organizationId || '');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system integrations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Feature Flags Hook
export function useFeatureFlags(filters?: { organizationId?: string; category?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getFeatureFlags(filters?.organizationId || '');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feature flags');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// =============================================================================
// CORE BUSINESS TABLES HOOKS - MISSING INTEGRATIONS
// =============================================================================

// Loan Applications Hook
export function useLoanApplications(filters?: { 
  organizationId?: string; 
  status?: string; 
  priority?: string;
  customerId?: string;
  assignedSalesAgent?: string;
  assignedCreditAnalyst?: string;
}) {
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getLoanApplications(filters);
      setLoanApplications(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loan applications");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToLoanApplications((payload) => {
      console.log("Loan application real-time update:", payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { loanApplications, loading, error, refetch };
}

// Individual Loan Application Hook
export function useLoanApplication(loanApplicationId: string) {
  const [loanApplication, setLoanApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getLoanApplicationById(loanApplicationId);
      setLoanApplication(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loan application");
    } finally {
      setLoading(false);
    }
  }, [loanApplicationId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (loanApplicationId) {
      fetchData();
    }
  }, [fetchData, loanApplicationId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!loanApplicationId) return;
    
    const subscription = SupabaseDatabaseService.subscribeToLoanApplications((payload: any) => {
      console.log("Loan application real-time update:", payload);
      if (payload.new?.id === loanApplicationId || payload.old?.id === loanApplicationId) {
        fetchData(); // Refetch on specific loan application change
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, loanApplicationId]);

  return { loanApplication, loading, error, refetch };
}

// Task Categories Hook
export function useTaskCategories(filters?: { 
  isActive?: boolean; 
  searchTerm?: string;
}) {
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getTaskCategories(filters);
      setTaskCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch task categories");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToTaskCategories((payload) => {
      console.log("Task category real-time update:", payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { taskCategories, loading, error, refetch };
}

// Individual Task Category Hook
export function useTaskCategory(categoryId: string) {
  const [taskCategory, setTaskCategory] = useState<TaskCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getTaskCategoryById(categoryId);
      setTaskCategory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch task category");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, [fetchData, categoryId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!categoryId) return;
    
    const subscription = SupabaseDatabaseService.subscribeToTaskCategories((payload: any) => {
      console.log("Task category real-time update:", payload);
      if (payload.new?.id === categoryId || payload.old?.id === categoryId) {
        fetchData(); // Refetch on specific task category change
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, categoryId]);

  return { taskCategory, loading, error, refetch };
}

// Customers Hook
export function useCustomers(filters?: { 
  organizationId?: string; 
  isActive?: boolean; 
  employmentType?: string;
  riskProfile?: string;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getCustomers(filters);
      setCustomers(result as unknown as Customer[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToCustomersUpdates((payload) => {
      console.log("Customer real-time update:", payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { customers, loading, error, refetch };
}

// Sub Products Hook
export function useSubProducts(filters?: { productId?: string; isActive?: boolean }) {
  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getSubProducts(filters);
      setSubProducts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sub products");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToSubProductsUpdates((payload) => {
      console.log("Sub product real-time update:", payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { subProducts, loading, error, refetch };
}

// Departments Hook
export function useDepartments(filters?: { 
  departmentType?: string; 
  isActive?: boolean; 
  parentDepartmentId?: string;
}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getDepartments(filters);
      setDepartments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToDepartmentsUpdates((payload) => {
      console.log("Department real-time update:", payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { departments, loading, error, refetch };
}

// Employment Types Hook
export function useEmploymentTypes(filters?: { isActive?: boolean }) {
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getEmploymentTypes(filters);
      setEmploymentTypes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employment types");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToEmploymentTypesUpdates((payload) => {
      console.log("Employment type real-time update:", payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { employmentTypes, loading, error, refetch };
}

// Task Types Hook
export function useTaskTypes(filters?: { 
  category?: string; 
  isActive?: boolean;
}) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getTaskTypes(filters);
      setTaskTypes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch task types");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToTaskTypesUpdates((payload) => {
      console.log("Task type real-time update:", payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { taskTypes, loading, error, refetch };
}

// Task SLA Policies Hook
export function useTaskSlaPolicies(filters?: { 
  taskTypeId?: string; 
  departmentId?: string; 
  priority?: string;
  isActive?: boolean;
}) {
  const [taskSlaPolicies, setTaskSlaPolicies] = useState<TaskSlaPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getTaskSlaPolicies(filters);
      setTaskSlaPolicies(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch task SLA policies");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToTaskSlaPoliciesUpdates((payload) => {
      console.log("Task SLA policy real-time update:", payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { taskSlaPolicies, loading, error, refetch };
}

// =============================================================================
// WORKFLOW & CASE MANAGEMENT HOOKS
// =============================================================================

export function useCaseStatusHistory(caseId?: string, filters?: { status?: string; changed_by?: string }) {
  const [history, setHistory] = useState<CaseStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getCaseStatusHistory(caseId, filters);
      setHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case status history');
    } finally {
      setLoading(false);
    }
  }, [caseId, filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToCaseStatusHistoryUpdates((payload) => {
      console.log('Case status history real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { history, loading, error, refetch };
}

export function useCaseWorkflowStages(caseId?: string, filters?: { stage_name?: string; is_active?: boolean }) {
  const [stages, setStages] = useState<CaseWorkflowStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getCaseWorkflowStages(caseId, filters);
      setStages(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case workflow stages');
    } finally {
      setLoading(false);
    }
  }, [caseId, filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToCaseWorkflowStageUpdates((payload) => {
      console.log('Case workflow stages real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { stages, loading, error, refetch };
}

export function useAssignCaseSettings(filters?: { setting_name?: string; is_active?: boolean }) {
  const [settings, setSettings] = useState<AssignCaseSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getAssignCaseSettings(filters);
      setSettings(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assign case settings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToAssignCaseSettingUpdates((payload) => {
      console.log('Assign case settings real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { settings, loading, error, refetch };
}

export function useAssignPermissions(filters?: { role_id?: string; permission_id?: string }) {
  const [permissions, setPermissions] = useState<AssignPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getAssignPermissions(filters);
      setPermissions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assign permissions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToAssignPermissionUpdates((payload) => {
      console.log('Assign permissions real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { permissions, loading, error, refetch };
}

// =============================================================================
// DOCUMENT MANAGEMENT HOOKS
// =============================================================================

export function useFoldersData(filters?: { 
  organizationId?: string; 
  parentFolderId?: string | null; 
  isActive?: boolean;
  createdBy?: string;
}) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getFolders(filters);
      setFolders(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToFolders((payload) => {
      console.log('Folders real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { folders, loading, error, refetch };
}

export function useDocumentAgainstProductData(filters?: { 
  productId?: string; 
  documentTypeId?: string; 
  isRequired?: boolean;
  isActive?: boolean;
}) {
  const [documentAgainstProduct, setDocumentAgainstProduct] = useState<DocumentAgainstProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getDocumentAgainstProduct(filters);
      setDocumentAgainstProduct(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document against product data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToDocumentAgainstProduct((payload) => {
      console.log('Document against product real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { documentAgainstProduct, loading, error, refetch };
}

export function useDocAgainstSubProductData(filters?: { 
  subProductId?: string; 
  documentTypeId?: string; 
  isRequired?: boolean;
  isActive?: boolean;
}) {
  const [docAgainstSubProduct, setDocAgainstSubProduct] = useState<DocAgainstSubProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getDocAgainstSubProduct(filters);
      setDocAgainstSubProduct(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document against sub product data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToDocAgainstSubProduct((payload) => {
      console.log('Document against sub product real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { docAgainstSubProduct, loading, error, refetch };
}

export function useFileSignaturesData(filters?: { 
  fileId?: string; 
  userId?: string; 
  signatureType?: 'digital' | 'electronic' | 'wet_signature';
  isVerified?: boolean;
}) {
  const [fileSignatures, setFileSignatures] = useState<FileSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getFileSignatures(filters);
      setFileSignatures(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file signatures data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToFileSignatures((payload) => {
      console.log('File signatures real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { fileSignatures, loading, error, refetch };
}

// =============================================================================
// BACKGROUND PROCESSING HOOKS
// =============================================================================

// Jobs Hook
export function useJobs(filters?: { 
  organizationId?: string; 
  status?: string; 
  jobType?: string; 
  priority?: string;
  limit?: number;
}) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getJobs(filters);
      setJobs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToJobUpdates((payload) => {
      console.log('Job real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { jobs, loading, error, refetch };
}

// Job Batches Hook
export function useJobBatches(filters?: { 
  organizationId?: string; 
  status?: string;
  limit?: number;
}) {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getJobBatches(filters);
      setBatches(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job batches');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToJobBatchUpdates((payload) => {
      console.log('Job batch real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { batches, loading, error, refetch };
}

// Failed Jobs Hook
export function useFailedJobs(filters?: { 
  organizationId?: string; 
  isResolved?: boolean;
  jobType?: string;
  limit?: number;
}) {
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getFailedJobs(filters);
      setFailedJobs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch failed jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToFailedJobUpdates((payload) => {
      console.log('Failed job real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { failedJobs, loading, error, refetch };
}

// Third Party API Logs Hook
export function useThirdPartyApiLogs(filters?: { 
  organizationId?: string; 
  integrationId?: string;
  status?: string;
  isSuccess?: boolean;
  limit?: number;
}) {
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getThirdPartyApiLogs(filters);
      setApiLogs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch third party API logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { apiLogs, loading, error, refetch };
}

// Webhooks Hook
export function useWebhooks(filters?: { 
  organizationId?: string; 
  status?: string;
  isActive?: boolean;
  eventType?: string;
  limit?: number;
}) {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getWebhooks(filters);
      setWebhooks(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToWebhookUpdates((payload) => {
      console.log('Webhook real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { webhooks, loading, error, refetch };
}

// =============================================================================
// AUTHENTICATION & SYSTEM HOOKS
// =============================================================================

export function useAuthAccounts(userId?: string) {
  const [authAccounts, setAuthAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getAuthAccounts(userId);
      setAuthAccounts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auth accounts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToAuthAccountUpdates((payload) => {
      console.log('Auth accounts real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { authAccounts, loading, error, refetch };
}

export function useSessions(userId?: string) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getSessions(userId);
      setSessions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToSessionUpdates((payload) => {
      console.log('Sessions real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { sessions, loading, error, refetch };
}

export function useUserRoles(userId?: string, organizationId?: string) {
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getUserRoles(userId, organizationId);
      setUserRoles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user roles');
    } finally {
      setLoading(false);
    }
  }, [userId, organizationId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToUserRoleUpdates((payload) => {
      console.log('User roles real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { userRoles, loading, error, refetch };
}

export function usePersonalAccessTokens(userId: string) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getPersonalAccessTokens(userId);
      setTokens(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch personal access tokens');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [fetchData, userId]);

  // Set up real-time subscription
  useEffect(() => {
    if (userId) {
      const subscription = SupabaseDatabaseService.subscribeToPersonalAccessTokenUpdates((payload) => {
        console.log('Personal access tokens real-time update:', payload);
        fetchData(); // Refetch on any change
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [fetchData, userId]);

  return { tokens, loading, error, refetch };
}

export function useAuthAuditLogs(userId?: string, eventType?: string, limit: number = 100) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getAuthAuditLogs(userId, eventType, limit);
      setAuditLogs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auth audit logs');
    } finally {
      setLoading(false);
    }
  }, [userId, eventType, limit]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToAuthAuditLogUpdates((payload) => {
      console.log('Auth audit logs real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { auditLogs, loading, error, refetch };
}

// Authentication utility hooks
export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createResetToken = useCallback(async (userId: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate a secure token (in production, use a proper token generator)
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const tokenHash = btoa(token); // Simple encoding for demo
      
      const tokenData = {
        user_id: userId,
        token: token,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        ip_address: null, // Will be set when used
        user_agent: null
      };

      const result = await SupabaseDatabaseService.createPasswordResetToken(tokenData);
      
      // Log the auth event
      await SupabaseDatabaseService.logAuthEvent({
        user_id: userId,
        event_type: 'password_reset_requested',
        event_description: 'Password reset token created',
        success: true,
        metadata: { email, token_id: result?.id }
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create password reset token');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateToken = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      return await SupabaseDatabaseService.validatePasswordResetToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate token');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markTokenAsUsed = useCallback(async (tokenId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await SupabaseDatabaseService.markPasswordResetTokenAsUsed(tokenId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark token as used');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createResetToken, validateToken, markTokenAsUsed, loading, error };
}

export function usePersonalAccessTokenManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createToken = useCallback(async (userId: string, tokenData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await SupabaseDatabaseService.createPersonalAccessToken({
        ...tokenData,
        user_id: userId
      });

      // Log the auth event
      await SupabaseDatabaseService.logAuthEvent({
        user_id: userId,
        event_type: 'personal_access_token_created',
        event_description: 'Personal access token created',
        success: true,
        metadata: { token_name: tokenData.name, token_id: result?.id }
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create personal access token');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeToken = useCallback(async (tokenId: string, revokedBy: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await SupabaseDatabaseService.revokePersonalAccessToken(tokenId, revokedBy);

      // Log the auth event
      await SupabaseDatabaseService.logAuthEvent({
        user_id: revokedBy,
        event_type: 'personal_access_token_revoked',
        event_description: 'Personal access token revoked',
        success: true,
        metadata: { token_id: tokenId }
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke personal access token');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createToken, revokeToken, loading, error };
}

export function useSessionManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (sessionData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await SupabaseDatabaseService.createSession(sessionData);

      // Log the auth event
      await SupabaseDatabaseService.logAuthEvent({
        user_id: sessionData.user_id,
        session_id: result?.id,
        event_type: 'session_created',
        event_description: 'User session created',
        success: true,
        ip_address: sessionData.ip_address,
        user_agent: sessionData.user_agent,
        metadata: { session_token: sessionData.session_token }
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);
      return await SupabaseDatabaseService.updateSession(sessionId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await SupabaseDatabaseService.deleteSession(sessionId);

      // Log the auth event
      await SupabaseDatabaseService.logAuthEvent({
        session_id: sessionId,
        event_type: 'session_terminated',
        event_description: 'User session terminated',
        success: true,
        metadata: { session_id: sessionId }
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSession, updateSession, deleteSession, loading, error };
}

// =============================================================================
// CACHING & PERFORMANCE HOOKS
// =============================================================================

export function useCacheEntry(organizationId: string, cacheKey: string) {
  const [data, setData] = useState<CacheEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getCacheEntry(organizationId, cacheKey);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache entry');
    } finally {
      setLoading(false);
    }
  }, [organizationId, cacheKey]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToCacheUpdates((payload) => {
      console.log('Cache real-time update:', payload);
      if (payload.new?.organization_id === organizationId && payload.new?.cache_key === cacheKey) {
        fetchData(); // Refetch on specific cache entry change
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, organizationId, cacheKey]);

  return { data, loading, error, refetch };
}

export function useCacheStatistics(organizationId?: string, cacheType?: string, days: number = 7) {
  const [data, setData] = useState<CacheStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getCacheStatistics(organizationId, cacheType, days);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache statistics');
    } finally {
      setLoading(false);
    }
  }, [organizationId, cacheType, days]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToCacheStatisticsUpdates((payload) => {
      console.log('Cache statistics real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function useCacheHitRatio(organizationId?: string, cacheType?: string, days: number = 7) {
  const [data, setData] = useState<CacheHitRatio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getCacheHitRatio(organizationId, cacheType, days);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache hit ratio');
    } finally {
      setLoading(false);
    }
  }, [organizationId, cacheType, days]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function useMigrations() {
  const [data, setData] = useState<Migration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getMigrations();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch migrations');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToMigrationUpdates((payload) => {
      console.log('Migration real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function useCacheInvalidationLogs(organizationId?: string, limit: number = 100) {
  const [data, setData] = useState<CacheInvalidationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getCacheInvalidationLogs(organizationId, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache invalidation logs');
    } finally {
      setLoading(false);
    }
  }, [organizationId, limit]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToCacheInvalidationLogUpdates((payload) => {
      console.log('Cache invalidation log real-time update:', payload);
      fetchData(); // Refetch on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// =============================================================================
// ADVANCED USER MANAGEMENT HOOKS
// =============================================================================

// Hook for advanced user management with real-time updates
export function useAdvancedUserManagement(filters?: {
  searchTerm?: string;
  role?: string;
  status?: string;
  organizationId?: number;
  departmentId?: number;
  limit?: number;
  offset?: number;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create stable filter object using useMemo
  const stableFilters = useMemo(() => filters || {}, [
    filters?.searchTerm,
    filters?.role,
    filters?.status,
    filters?.organizationId,
    filters?.departmentId,
    filters?.limit,
    filters?.offset
  ]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getAllUsersForSuperAdmin(stableFilters);
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  const fetchUserStats = useCallback(async () => {
    try {
      const stats = await SupabaseDatabaseService.getUserStatisticsForSuperAdmin();
      setUserStats(stats);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchUsers();
    fetchUserStats();
  }, [fetchUsers, fetchUserStats]);

  // Bulk actions
  const bulkUpdateStatus = useCallback(async (userIds: string[], status: 'active' | 'inactive' | 'suspended') => {
    try {
      await SupabaseDatabaseService.bulkUpdateUserStatus(userIds, status);
      await fetchUsers(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [fetchUsers]);

  const bulkDeleteUsers = useCallback(async (userIds: string[]) => {
    try {
      await SupabaseDatabaseService.deleteUsers(userIds);
      await fetchUsers(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [fetchUsers]);

  const resetUserPassword = useCallback(async (userId: string) => {
    try {
      const result = await SupabaseDatabaseService.resetUserPassword(userId);
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Error resetting user password:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const updateUserStatus = useCallback(async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      await SupabaseDatabaseService.updateUserStatus(userId, status);
      await fetchUsers(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [fetchUsers]);

  const sendNotificationToUsers = useCallback(async (userIds: string[], notification: {
    title: string;
    message: string;
    type?: string;
  }) => {
    try {
      await SupabaseDatabaseService.sendNotificationToUsers(userIds, notification);
      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const createUser = useCallback(async (userData: {
    email: string;
    full_name: string;
    mobile?: string;
    role: string;
    department_id?: number;
    organization_id?: number;
    employment_type?: string;
  }) => {
    try {
      await SupabaseDatabaseService.createUser(userData);
      await fetchUsers(); // Refresh data
      await fetchUserStats(); // Refresh stats
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [fetchUsers, fetchUserStats]);

  const updateUser = useCallback(async (userId: string, updates: {
    full_name?: string;
    mobile?: string;
    role?: string;
    department_id?: number;
    organization_id?: number;
    employment_type?: string;
    status?: string;
  }) => {
    try {
      await SupabaseDatabaseService.updateUser(userId, updates);
      await fetchUsers(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [fetchUsers, fetchUserStats]);

  // Set up real-time subscription for user updates
  useEffect(() => {
    let subscription: any;
    
    const setupSubscription = () => {
      subscription = SupabaseDatabaseService.subscribeToUserUpdates((payload) => {
        console.log('User real-time update:', payload);
        // Add a small delay to prevent rapid successive calls
        setTimeout(() => {
          fetchUsers();
          fetchUserStats();
        }, 500);
      });
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array to avoid re-creating subscription

  return {
    users,
    userStats,
    loading,
    error,
    refetch,
    actions: {
      bulkUpdateStatus,
      bulkDeleteUsers,
      resetUserPassword,
      updateUserStatus,
      sendNotificationToUsers,
      createUser,
      updateUser
    }
  };
}

// Hook for getting user statistics only
export function useUserStatistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseService.getUserStatisticsForSuperAdmin();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up real-time subscription
  useEffect(() => {
    let subscription: any;
    
    const setupSubscription = () => {
      subscription = SupabaseDatabaseService.subscribeToUserUpdates((payload) => {
        console.log('User stats real-time update:', payload);
        setTimeout(() => {
          fetchStats();
        }, 500);
      });
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { stats, loading, error, refetch };
}