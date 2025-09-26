import { useState, useEffect, useCallback, useRef } from 'react';
import { WhatsAppMessage } from '../types';
import { WhatsAppService } from '../services/whatsapp-service';
import { WhatsAppApiService } from '../services/whatsapp-api-service';
import { SupabaseDatabaseService } from '../services/supabase-database';

// =============================================================================
// WHATSAPP MESSAGES HOOK - REAL-TIME SYNCHRONIZATION
// =============================================================================

interface UseWhatsAppMessagesOptions {
  caseId: string;
  customerPhone: string;
  enablePolling?: boolean;
  pollingInterval?: number;
  enableWebSocket?: boolean;
  autoRefresh?: boolean;
  enableLiveMode?: boolean;
}

interface UseWhatsAppMessagesReturn {
  messages: WhatsAppMessage[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  sendMessage: (content: string, type?: 'text' | 'document' | 'template', metadata?: any) => Promise<void>;
  isConnected: boolean;
  connectionStatus: string;
}

export function useWhatsAppMessages(options: UseWhatsAppMessagesOptions): UseWhatsAppMessagesReturn {
  const {
    caseId,
    customerPhone,
    enablePolling = true,
    pollingInterval = 5000,
    enableWebSocket = true,
    autoRefresh = false,
    enableLiveMode = true
  } = options;

  // Only use live mode services when enabled
  const useLiveFeatures = enableLiveMode;

  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const subscriptionRef = useRef<(() => void) | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);

  // =============================================================================
  // MAIN DATA FETCHING
  // =============================================================================

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📨 Fetching WhatsApp messages for case ${caseId}`);

      // Try API first, fallback to Supabase
      let fetchedMessages: WhatsAppMessage[] = [];

      try {
        const apiResponse = await WhatsAppApiService.getMessages({
          customerPhone,
          caseId,
          limit: 100
        });

        if (apiResponse.success && apiResponse.data) {
          fetchedMessages = apiResponse.data;
          console.log(`✅ Fetched ${fetchedMessages.length} messages via API`);
        } else {
          throw new Error('API fetch failed, falling back to Supabase');
        }
      } catch (apiError) {
        console.log('🔄 Falling back to Supabase for messages');
        fetchedMessages = await SupabaseDatabaseService.getWhatsAppMessages(caseId);
        console.log(`✅ Fetched ${fetchedMessages.length} messages via Supabase`);
      }

      // Update state with fetched messages
      setMessages(fetchedMessages);

      // Update last message time for change detection
      const latestMessage = fetchedMessages[fetchedMessages.length - 1];
      if (latestMessage) {
        lastMessageTimeRef.current = latestMessage.timestamp;
      }

    } catch (err) {
      console.error('❌ Error fetching WhatsApp messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [caseId, customerPhone]);

  // =============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================================================

  const setupRealTimeConnection = useCallback(async () => {
    console.log('🔌 Setting up real-time WhatsApp connection...');
    setConnectionStatus('connecting');

    try {
      // Set up WebSocket subscription if enabled
      if (enableWebSocket && useLiveFeatures) {
        const cleanup = WhatsAppService.subscribeToWhatsAppUpdates(caseId, (payload) => {
          console.log('📨 Real-time WhatsApp update received:', payload);
          
          // Refetch messages on update
          fetchMessages();
          
          // Update connection status
          setIsConnected(true);
          setConnectionStatus('connected');
        });

        subscriptionRef.current = cleanup;
      }

      // Set up polling if enabled as backup
      if (enablePolling) {
        const startPolling = () => {
          pollingRef.current = setInterval(async () => {
            try {
              // Check for new messages since last fetch
              const currentMessages = await SupabaseDatabaseService.getWhatsAppMessages(caseId);
              const latestMessage = currentMessages[currentMessages.length - 1];
              
              // Only refetch if new messages detected
              if (latestMessage && 
                  (!lastMessageTimeRef.current || 
                   latestMessage.timestamp > lastMessageTimeRef.current)) {
                console.log('🔄 New messages detected, refetching...');
                await fetchMessages();
              }
            } catch (err) {
              console.error('❌ Polling error:', err);
              setConnectionStatus('polling-failed');
            }
          }, pollingInterval);
        };

        startPolling();
      }

      // Set up global event listener for WhatsApp updates
      const handleCustomEvent = (event: CustomEvent) => {
        if (event.detail?.caseId === caseId) {
          console.log('📨 Custom event received for case:', caseId);
          fetchMessages();
        }
      };

      window.addEventListener('whatsapp-message-updated', handleCustomEvent as EventListener);
      
      // Cleanup function
      return () => {
        window.removeEventListener('whatsapp-message-updated', handleCustomEvent as EventListener);
      };

    } catch (error) {
      console.error('❌ Error setting up real-time connection:', error);
      setConnectionStatus('failed');
      setError('Failed to establish real-time connection');
    }
  }, [caseId, enableWebSocket, enablePolling, pollingInterval, fetchMessages]);

  // =============================================================================
  // MESSAGE OPERATIONS
  // =============================================================================

  const sendMessage = useCallback(async (
    content: string, 
    type: 'text' | 'document' | 'template' = 'text',
    metadata?: any
  ) => {
    try {
      setError(null);
      console.log(`📤 Sending WhatsApp message: ${content.substring(0, 50)}...`);

      // Send via WhatsApp service (has WebSocket fallback)
      await WhatsAppService.sendMessage(caseId, {
        content,
        customerPhone,
        type,
        templateId: metadata?.templateId,
        documentUrl: metadata?.documentUrl
      });

      // Trigger immediate refetch
      await fetchMessages();

    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [caseId, customerPhone, fetchMessages]);

  // =============================================================================
  // CLEANUP AND REFETCH
  // =============================================================================

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    fetchMessages();
  }, [fetchMessages]);

  // =============================================================================
  // COMPONENT LIFECYCLE
  // =============================================================================

  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Set up real-time connection
    setupRealTimeConnection();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WhatsApp messages hook...');
      
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchMessages, setupRealTimeConnection]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered');
      fetchMessages();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchMessages]);

  // =============================================================================
  // CONNECTION STATUS TRACKING
  // =============================================================================

  useEffect(() => {
    const checkConnection = async () => {
      const apiStatus = WhatsAppApiService.getConnectionStatus();
      const wsConnected = WhatsAppService && isConnected;
      
      if (apiStatus.configured && wsConnected) {
        setConnectionStatus('connected');
        setIsConnected(true);
      } else if (apiStatus.configured && !wsConnected) {
        setConnectionStatus('polling');
        setIsConnected(false);
      } else {
        setConnectionStatus('disconnected');
        setIsConnected(false);
      }
    };

    const interval = setInterval(checkConnection, 5000);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, [isConnected]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    messages,
    loading,
    error,
    refetch,
    sendMessage,
    isConnected,
    connectionStatus
  };
}

// =============================================================================
// SPECIALIZED HOOKS FOR DIFFERENT USE CASES
// =============================================================================

/**
 * Hook for cases where WebSocket connection is not available
 * Uses polling fallback only
 */
export function useWhatsAppMessagesPolling(options: Omit<UseWhatsAppMessagesOptions, 'enableWebSocket' | 'enablePolling'>) {
  return useWhatsAppMessages({
    ...options,
    enableWebSocket: false,
    enablePolling: true
  });
}

/**
 * Hook for high-frequency message updates
 * Uses shorter polling interval
 */
export function useWhatsAppMessagesLive(options: Omit<UseWhatsAppMessagesOptions, 'pollingInterval'>) {
  return useWhatsAppMessages({
    ...options,
    pollingInterval: 2000, // Every 2 seconds
    enableWebSocket: true,
    enablePolling: true
  });
}

/**
 * Hook for basic message fetching without real-time updates
 */
export function useWhatsAppMessagesStatic(options: { caseId: string; customerPhone: string }) {
  return useWhatsAppMessages({
    ...options,
    enableWebSocket: false,
    enablePolling: false
  });
}

export default useWhatsAppMessages;
