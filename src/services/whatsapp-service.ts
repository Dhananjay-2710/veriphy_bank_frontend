import { supabase } from '../supabase-client';
import { WhatsAppMessage } from '../types';
import { SupabaseDatabaseService } from './supabase-database';

// =============================================================================
// WHATSAPP WEBSOCKET & REAL-TIME SERVICE
// =============================================================================

interface WhatsAppMessageData {
  id: string;
  messageId: string;
  caseId: string;
  content: string;
  type: 'text' | 'document' | 'template';
  sender: 'agent' | 'customer' | 'system';
  customerPhone: string;
  documentId?: string;
  timestamp: string;
  metadata?: any;
}

interface WhatsAppWebhookPayload {
  event: 'message' | 'message_status' | 'delivery_report';
  data: {
    messageId: string;
    caseId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    content?: string;
    customerPhone?: string;
  };
}

export class WhatsAppService {
  private static wsConnection: WebSocket | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectInterval = 5000;
  private static isConnected = false;
  private static messageHandlers: Map<string, (payload: WhatsAppWebhookPayload) => void> = new Map();
  
  // =============================================================================
  // WEBSOCKET CONNECTION MANAGEMENT
  // =============================================================================

  /**
   * Initialize WebSocket connection for real-time WhatsApp updates
   */
  static async initializeConnection(apiKey: string, webSocketUrl: string) {
    console.log('🔌 Initializing WhatsApp WebSocket connection...');
    
    try {
      this.wsConnection = new WebSocket(`${webSocketUrl}?api_key=${apiKey}`);
      
      this.wsConnection.onopen = () => {
        console.log('✅ WhatsApp WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const payload: WhatsAppWebhookPayload = JSON.parse(event.data);
          console.log('📨 WhatsApp WebSocket message received:', payload);
          this.handleWebSocketMessage(payload);
        } catch (error) {
          console.error('❌ Error parsing WhatsApp WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log('🔌 WhatsApp WebSocket disconnected');
        this.isConnected = false;
        this.handleReconnection();
      };

      this.wsConnection.onerror = (error) => {
        console.error('❌ WhatsApp WebSocket error:', error);
        this.handleReconnection();
      };

    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp WebSocket:', error);
      this.handleReconnection();
    }
  }

  /**
   * Handle WebSocket reconnection with exponential backoff
   */
  private static handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached for WhatsApp WebSocket');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    setTimeout(async () => {
      if (this.wsConnection?.readyState !== WebSocket.OPEN) {
        // Get API key from Supabase if needed
        const { data: settings } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'whatsapp_api_key');
        
        const apiKey = settings?.[0]?.value || process.env.VITE_WHATSAPP_API_KEY;
        const webSocketUrl = process.env.VITE_WHATSAPP_WEBSOCKET_URL;
        
        if (apiKey && webSocketUrl) {
          await this.initializeConnection(apiKey, webSocketUrl);
        }
      }
    }, delay);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private static handleWebSocketMessage(payload: WhatsAppWebhookPayload) {
    const { event, data } = payload;
    
    switch (event) {
      case 'message':
        this.handleNewMessage(data);
        break;
      case 'message_status':
        this.handleMessageStatusUpdate(data);
        break;
      case 'delivery_report':
        this.handleDeliveryReport(data);
        break;
      default:
        console.log('🔍 Unknown WhatsApp WebSocket event:', event);
    }

    // Notify all registered handlers
    this.messageHandlers.forEach((handler, handlerId) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`❌ Error in WhatsApp handler ${handlerId}:`, error);
      }
    });
  }

  // =============================================================================
  // MESSAGE HANDLING
  // =============================================================================

  /**
   * Handle new incoming WhatsApp message
   */
  private static async handleNewMessage(data: WhatsAppWebhookPayload['data']) {
    console.log('📥 New WhatsApp message:', data);
    
    try {
      // Store the message in Supabase
      await SupabaseDatabaseService.sendWhatsAppMessage(data.caseId, {
        content: data.content || 'New message',
        type: 'text',
        sender: 'customer',
        customerPhone: data.customerPhone || ''
      });

      // Notify components of new message
      this.notifyMessageUpdate(data.caseId);

    } catch (error) {
      console.error('❌ Error handling new WhatsApp message:', error);
    }
  }

  /**
   * Handle message status updates (sent, delivered, read)
   */
  private static async handleMessageStatusUpdate(data: WhatsAppWebhookPayload['data']) {
    console.log('📊 Message status update:', data);
    
    try {
      // Update message status in database
      await supabase
        .from('notifications')
        .update({ 
          data: {
            ...data,
            status: data.status,
            status_updated_at: data.timestamp
          }
        })
        .eq('data->>messageId', data.messageId);

      this.notifyMessageUpdate(data.caseId);

    } catch (error) {
      console.error('❌ Error updating message status:', error);
    }
  }

  /**
   * Handle delivery reports
   */
  private static async handleDeliveryReport(data: WhatsAppWebhookPayload['data']) {
    console.log('📦 Delivery report:', data);
    // Could trigger notifications for failed deliveries
    this.notifyMessageUpdate(data.caseId);
  }

  /**
   * Notify components of messages updates
   */
  private static notifyMessageUpdate(caseId: string) {
    // This will trigger Supabase subscriptions to pick up the database changes
    window.dispatchEvent(new CustomEvent('whatsapp-message-updated', { 
      detail: { caseId } 
    }));
  }

  // =============================================================================
  // CLIENT METHODS
  // =============================================================================

  /**
   * Send a WhatsApp message
   */
  static async sendMessage(
    caseId: string, 
    messageData: {
      content: string;
      customerPhone: string;
      type?: 'text' | 'document' | 'template';
      templateId?: string;
      documentUrl?: string;
    }
  ) {
    console.log('📤 Sending WhatsApp message:', messageData);

    try {
      // Store in database first
      const stored = await SupabaseDatabaseService.sendWhatsAppMessage(caseId, {
        content: messageData.content,
        type: messageData.type || 'text',
        sender: 'agent',
        customerPhone: messageData.customerPhone
      });

      // Send via WebSocket if connected
      if (this.isConnected && this.wsConnection) {
        this.wsConnection.send(JSON.stringify({
          action: 'send_message',
          data: {
            caseId,
            customerPhone: messageData.customerPhone,
            content: messageData.content,
            type: messageData.type,
            templateId: messageData.templateId,
            documentUrl: messageData.documentUrl,
            messageId: stored?.id
          }
        }));
      } else {
        console.warn('⚠️ WhatsApp WebSocket not connected, falling back to API call');
        return await this.sendMessageViaAPI(messageData);
      }

      return stored;

    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send message via direct API call (fallback)
   */
  private static async sendMessageViaAPI(messageData: any) {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Subscribe to WhatsApp updates for a specific case
   */
  static subscribeToWhatsAppUpdates(
    caseId: string, 
    callback: (payload: WhatsAppWebhookPayload) => void
  ) {
    const handlerId = `case-${caseId}-${Date.now()}`;
    this.messageHandlers.set(handlerId, callback);

    // Register for Supabase real-time updates as well
    const subscription = SupabaseDatabaseService.subscribeToWhatsAppMessages(caseId, (payload) => {
      console.log('📨 Supabase WhatsApp subscription update:', payload);
      // Transform Supabase payload to match our interface
      const formattedPayload: WhatsAppWebhookPayload = {
        event: 'message',
        data: {
          messageId: payload.new?.id || payload.old?.id,
          caseId,
          status: 'delivered',
          timestamp: payload.new?.created_at || new Date().toISOString(),
          content: payload.new?.data?.content,
          customerPhone: payload.new?.data?.customerPhone
        }
      };
      callback(formattedPayload);
    });

    // Return cleanup function
    return () => {
      this.messageHandlers.delete(handlerId);
      subscription.unsubscribe();
    };
  }

  // =============================================================================
  // POLLING FALLBACK
  // =============================================================================

  /**
   * Enable polling as fallback when WebSocket is not available
   */
  static enablePolling(caseId: string, intervalMs: number = 5000) {
    console.log('🔄 Enabling WhatsApp polling for case:', caseId);

    const poll = async () => {
      try {
        const { data } = await SupabaseDatabaseService.getWhatsAppMessages(caseId);
        // Check for new messages and notify
        this.notifyMessageUpdate(caseId);
      } catch (error) {
        console.error('❌ Error polling WhatsApp messages:', error);
      }
    };

    const pollInterval = setInterval(poll, intervalMs);
    return () => clearInterval(pollInterval);
  }

  /**
   * Disconnect and cleanup
   */
  static disconnect() {
    console.log('🔌 Disconnecting WhatsApp service...');
    
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    
    this.messageHandlers.clear();
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }
}

// =============================================================================
// AUTO-INITIALIZE SERVICE
// =============================================================================

// Initialize the service when imported
export const initializeWhatsAppService = async () => {
  try {
    // Get configuration from environment or Supabase
    const apiKey = process.env.VITE_WHATSAPP_API_KEY || 
      (await supabase.from('system_settings').select('value').eq('key', 'whatsapp_api_key')).data?.[0]?.value;
    
    const webSocketUrl = process.env.VITE_WHATSAPP_WEBSOCKET_URL ||
      (await supabase.from('system_settings').select('value').eq('key', 'whatsapp_websocket_url')).data?.[0]?.value;

    if (apiKey && webSocketUrl) {
      await WhatsAppService.initializeConnection(apiKey, webSocketUrl);
    } else {
      console.warn('⚠️ WhatsApp API key or WebSocket URL not configured, using polling fallback');
    }
  } catch (error) {
    console.error('❌ Failed to initialize WhatsApp service:', error);
  }
};

export default WhatsAppService;
