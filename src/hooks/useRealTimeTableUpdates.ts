// =============================================================================
// REAL-TIME TABLE UPDATES HOOK
// =============================================================================
// This hook provides real-time updates for all table operations

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase-client';
import { SUPABASE_TABLES } from '../services/supabase-schema-mapping';
import { TableName } from '../types/permissions';

// =============================================================================
// INTERFACES
// =============================================================================

export interface TableUpdateEvent {
  table: TableName;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
  oldRecord?: any;
  timestamp: string;
}

export interface RealTimeSubscription {
  table: TableName;
  channel: any;
  isActive: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

export function useRealTimeTableUpdates(
  tables: TableName[],
  onUpdate: (event: TableUpdateEvent) => void,
  options: {
    enabled?: boolean;
    debounceMs?: number;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    enabled = true,
    debounceMs = 100,
    onError
  } = options;
  
  const subscriptionsRef = useRef<Map<TableName, RealTimeSubscription>>(new Map());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<TableUpdateEvent[]>([]);
  
  // =============================================================================
  // DEBOUNCED UPDATE PROCESSOR
  // =============================================================================
  
  const processPendingUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.length === 0) return;
    
    const updates = [...pendingUpdatesRef.current];
    pendingUpdatesRef.current = [];
    
    // Process updates in order
    updates.forEach(update => {
      try {
        onUpdate(update);
      } catch (error) {
        console.error('Error processing table update:', error);
        onError?.(error as Error);
      }
    });
  }, [onUpdate, onError]);
  
  const debouncedProcessUpdates = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(processPendingUpdates, debounceMs);
  }, [processPendingUpdates, debounceMs]);
  
  // =============================================================================
  // SUBSCRIPTION MANAGEMENT
  // =============================================================================
  
  const createSubscription = useCallback((table: TableName) => {
    const tableName = SUPABASE_TABLES[table.toUpperCase() as keyof typeof SUPABASE_TABLES];
    if (!tableName) {
      console.warn(`Table ${table} not found in SUPABASE_TABLES`);
      return null;
    }
    
    const channel = supabase
      .channel(`${table}-updates`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        (payload) => {
          console.log(`📡 Real-time update for ${table}:`, payload);
          
          const event: TableUpdateEvent = {
            table,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            record: payload.new || payload.old,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };
          
          pendingUpdatesRef.current.push(event);
          debouncedProcessUpdates();
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for ${table}:`, status);
        
        if (status === 'SUBSCRIBED') {
          const subscription = subscriptionsRef.current.get(table);
          if (subscription) {
            subscription.isActive = true;
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Subscription error for ${table}`);
          onError?.(new Error(`Failed to subscribe to ${table} updates`));
        }
      });
    
    return channel;
  }, [debouncedProcessUpdates, onError]);
  
  const subscribeToTable = useCallback((table: TableName) => {
    if (subscriptionsRef.current.has(table)) {
      console.log(`Already subscribed to ${table}`);
      return;
    }
    
    const channel = createSubscription(table);
    if (channel) {
      subscriptionsRef.current.set(table, {
        table,
        channel,
        isActive: false
      });
    }
  }, [createSubscription]);
  
  const unsubscribeFromTable = useCallback((table: TableName) => {
    const subscription = subscriptionsRef.current.get(table);
    if (subscription) {
      console.log(`Unsubscribing from ${table}`);
      supabase.removeChannel(subscription.channel);
      subscriptionsRef.current.delete(table);
    }
  }, []);
  
  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  useEffect(() => {
    if (!enabled) return;
    
    // Subscribe to all tables
    tables.forEach(table => {
      subscribeToTable(table);
    });
    
    // Cleanup function
    return () => {
      tables.forEach(table => {
        unsubscribeFromTable(table);
      });
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [enabled, tables, subscribeToTable, unsubscribeFromTable]);
  
  // =============================================================================
  // PUBLIC API
  // =============================================================================
  
  const getSubscriptionStatus = useCallback((table: TableName) => {
    const subscription = subscriptionsRef.current.get(table);
    return subscription ? {
      isActive: subscription.isActive,
      table: subscription.table
    } : null;
  }, []);
  
  const getAllSubscriptionStatuses = useCallback(() => {
    const statuses: Record<TableName, boolean> = {} as Record<TableName, boolean>;
    subscriptionsRef.current.forEach((subscription, table) => {
      statuses[table] = subscription.isActive;
    });
    return statuses;
  }, []);
  
  const reconnect = useCallback(() => {
    console.log('🔄 Reconnecting all subscriptions...');
    
    // Unsubscribe from all
    subscriptionsRef.current.forEach((subscription) => {
      supabase.removeChannel(subscription.channel);
    });
    subscriptionsRef.current.clear();
    
    // Re-subscribe to all
    tables.forEach(table => {
      subscribeToTable(table);
    });
  }, [tables, subscribeToTable]);
  
  return {
    getSubscriptionStatus,
    getAllSubscriptionStatuses,
    reconnect,
    isEnabled: enabled
  };
}

// =============================================================================
// UTILITY HOOKS FOR SPECIFIC TABLES
// =============================================================================

export function useRealTimeCasesUpdates(onUpdate: (event: TableUpdateEvent) => void) {
  return useRealTimeTableUpdates(['cases'], onUpdate, {
    enabled: true,
    debounceMs: 200
  });
}

export function useRealTimeUsersUpdates(onUpdate: (event: TableUpdateEvent) => void) {
  return useRealTimeTableUpdates(['users'], onUpdate, {
    enabled: true,
    debounceMs: 100
  });
}

export function useRealTimeTasksUpdates(onUpdate: (event: TableUpdateEvent) => void) {
  return useRealTimeTableUpdates(['tasks'], onUpdate, {
    enabled: true,
    debounceMs: 150
  });
}

export function useRealTimeNotificationsUpdates(onUpdate: (event: TableUpdateEvent) => void) {
  return useRealTimeTableUpdates(['notifications'], onUpdate, {
    enabled: true,
    debounceMs: 50
  });
}

export function useRealTimeAllTablesUpdates(onUpdate: (event: TableUpdateEvent) => void) {
  const allTables: TableName[] = [
    'organizations',
    'users',
    'customers',
    'cases',
    'documents',
    'products',
    'departments',
    'tasks',
    'notifications',
    'document_types',
    'roles',
    'permissions',
    'task_types',
    'employment_types',
    'system_settings',
    'workflow_stages',
    'workflow_transitions',
    'compliance_issues',
    'approval_queues',
    'feature_flags'
  ];
  
  return useRealTimeTableUpdates(allTables, onUpdate, {
    enabled: true,
    debounceMs: 100
  });
}
