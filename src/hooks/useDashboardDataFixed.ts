// =============================================================================
// PERMANENT DASHBOARD DATA HOOKS - FIXED FOR ACTUAL SCHEMA
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { SupabaseDatabaseServiceFixed } from '../services/supabase-database-fixed';
import type {
  User,
  Customer,
  Case,
  Document,
  Task,
  DashboardMetrics,
  CaseFilters,
  DocumentFilters,
  TaskFilters,
  UserFilters,
  CaseWithRelations,
  DocumentWithRelations,
  TaskWithRelations
} from '../types/database-interfaces';

// =============================================================================
// DASHBOARD METRICS HOOK
// =============================================================================

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    active_users: 0,
    open_cases: 0,
    in_progress_cases: 0,
    closed_cases: 0,
    open_tasks: 0,
    pending_documents: 0,
    daily_audit_logs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseServiceFixed.getDashboardMetrics();
      setMetrics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Set up real-time subscription for metrics updates
  useEffect(() => {
    const subscriptions = [
      SupabaseDatabaseServiceFixed.subscribeToCaseUpdates(() => {
        console.log('Case updated, refreshing metrics');
        fetchMetrics();
      }),
      SupabaseDatabaseServiceFixed.subscribeToDocumentUpdates(() => {
        console.log('Document updated, refreshing metrics');
        fetchMetrics();
      }),
      SupabaseDatabaseServiceFixed.subscribeToTaskUpdates(() => {
        console.log('Task updated, refreshing metrics');
        fetchMetrics();
      }),
      SupabaseDatabaseServiceFixed.subscribeToUserUpdates(() => {
        console.log('User updated, refreshing metrics');
        fetchMetrics();
      })
    ];

    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch };
}

// =============================================================================
// USERS HOOK
// =============================================================================

export function useUsers(filters?: UserFilters) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseServiceFixed.getUsers(filters);
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseServiceFixed.subscribeToUserUpdates((payload) => {
      console.log('User real-time update:', payload);
      fetchUsers();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUsers]);

  return { users, loading, error, refetch };
}

// =============================================================================
// CASES HOOK
// =============================================================================

export function useCases(filters?: CaseFilters) {
  const [cases, setCases] = useState<CaseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseServiceFixed.getCases(filters);
      setCases(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseServiceFixed.subscribeToCaseUpdates((payload) => {
      console.log('Case real-time update:', payload);
      fetchCases();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCases]);

  return { cases, loading, error, refetch };
}

// =============================================================================
// SINGLE CASE HOOK
// =============================================================================

export function useCase(caseId: string | number | null) {
  const [case_, setCase] = useState<CaseWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = useCallback(async () => {
    if (!caseId) {
      setCase(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseServiceFixed.getCaseById(caseId);
      setCase(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const refetch = useCallback(() => {
    fetchCase();
  }, [fetchCase]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  return { case: case_, loading, error, refetch };
}

// =============================================================================
// DOCUMENTS HOOK
// =============================================================================

export function useDocuments(filters?: DocumentFilters) {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseServiceFixed.getDocuments(filters);
      setDocuments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseServiceFixed.subscribeToDocumentUpdates((payload) => {
      console.log('Document real-time update:', payload);
      fetchDocuments();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchDocuments]);

  return { documents, loading, error, refetch };
}

// =============================================================================
// TASKS HOOK
// =============================================================================

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseServiceFixed.getTasks(filters);
      setTasks(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseServiceFixed.subscribeToTaskUpdates((payload) => {
      console.log('Task real-time update:', payload);
      fetchTasks();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTasks]);

  return { tasks, loading, error, refetch };
}

// =============================================================================
// USER WORKLOAD HOOK
// =============================================================================

export function useUserWorkload(userId: string | number | null) {
  const [workload, setWorkload] = useState<{
    cases: CaseWithRelations[];
    tasks: TaskWithRelations[];
    documents: DocumentWithRelations[];
  }>({
    cases: [],
    tasks: [],
    documents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkload = useCallback(async () => {
    if (!userId) {
      setWorkload({ cases: [], tasks: [], documents: [] });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [cases, tasks, documents] = await Promise.all([
        SupabaseDatabaseServiceFixed.getCases({ assigned_to: typeof userId === 'string' ? parseInt(userId) : userId }),
        SupabaseDatabaseServiceFixed.getTasks({ assigned_to: typeof userId === 'string' ? parseInt(userId) : userId }),
        SupabaseDatabaseServiceFixed.getDocuments({ uploaded_by: typeof userId === 'string' ? parseInt(userId) : userId })
      ]);

      setWorkload({ cases, tasks, documents });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workload');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(() => {
    fetchWorkload();
  }, [fetchWorkload]);

  useEffect(() => {
    fetchWorkload();
  }, [fetchWorkload]);

  return { workload, loading, error, refetch };
}

// =============================================================================
// APPROVAL QUEUE HOOK
// =============================================================================

export function useApprovalQueue(userId?: string | number) {
  const [approvalQueue, setApprovalQueue] = useState<CaseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovalQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get cases that need approval (open and in_progress status)
      const result = await SupabaseDatabaseServiceFixed.getCases({
        status: 'open' // Only open cases need approval
      });
      
      setApprovalQueue(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approval queue');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchApprovalQueue();
  }, [fetchApprovalQueue]);

  useEffect(() => {
    fetchApprovalQueue();
  }, [fetchApprovalQueue]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseServiceFixed.subscribeToCaseUpdates((payload) => {
      console.log('Approval queue case update:', payload);
      fetchApprovalQueue();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchApprovalQueue]);

  return { approvalQueue, loading, error, refetch };
}

// =============================================================================
// COMPLIANCE ISSUES HOOK
// =============================================================================

export function useComplianceIssues() {
  const [complianceIssues, setComplianceIssues] = useState<CaseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplianceIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get cases that might have compliance issues
      // For now, we'll use cases with 'rejected' status as compliance issues
      const result = await SupabaseDatabaseServiceFixed.getCases({
        status: 'rejected'
      });
      
      setComplianceIssues(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance issues');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchComplianceIssues();
  }, [fetchComplianceIssues]);

  useEffect(() => {
    fetchComplianceIssues();
  }, [fetchComplianceIssues]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseServiceFixed.subscribeToCaseUpdates((payload) => {
      console.log('Compliance issues case update:', payload);
      fetchComplianceIssues();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchComplianceIssues]);

  return { complianceIssues, loading, error, refetch };
}

// =============================================================================
// PENDING REVIEWS HOOK
// =============================================================================

export function usePendingReviews() {
  const [pendingReviews, setPendingReviews] = useState<DocumentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get documents that are pending review
      const result = await SupabaseDatabaseServiceFixed.getDocuments({
        status: 'pending'
      });
      
      setPendingReviews(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  useEffect(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseServiceFixed.subscribeToDocumentUpdates((payload) => {
      console.log('Pending reviews document update:', payload);
      fetchPendingReviews();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPendingReviews]);

  return { pendingReviews, loading, error, refetch };
}

// =============================================================================
// DASHBOARD STATS HOOK (for Super Admin)
// =============================================================================

export function useDashboardStats(userId?: string | number, userRole?: string) {
  const [stats, setStats] = useState<DashboardMetrics>({
    active_users: 0,
    open_cases: 0,
    in_progress_cases: 0,
    closed_cases: 0,
    open_tasks: 0,
    pending_documents: 0,
    daily_audit_logs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SupabaseDatabaseServiceFixed.getDashboardMetrics();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
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

  // Set up real-time subscriptions for all relevant tables
  useEffect(() => {
    const subscriptions = [
      SupabaseDatabaseServiceFixed.subscribeToCaseUpdates(() => {
        console.log('Dashboard stats case update');
        fetchStats();
      }),
      SupabaseDatabaseServiceFixed.subscribeToDocumentUpdates(() => {
        console.log('Dashboard stats document update');
        fetchStats();
      }),
      SupabaseDatabaseServiceFixed.subscribeToTaskUpdates(() => {
        console.log('Dashboard stats task update');
        fetchStats();
      }),
      SupabaseDatabaseServiceFixed.subscribeToUserUpdates(() => {
        console.log('Dashboard stats user update');
        fetchStats();
      })
    ];

    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [fetchStats]);

  return { stats, loading, error, refetch };
}

// =============================================================================
// EXPORT ALL HOOKS
// =============================================================================

export * from './useDashboardData'; // Re-export existing hooks for backward compatibility
