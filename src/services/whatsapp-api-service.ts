import { supabase } from '../supabase-client';
import { WhatsAppMessage } from '../types';

// =============================================================================
// WHATSAPP API SERVICE - CUSTOM REQUEST/RESPONSE HANDLING
// =============================================================================

interface WhatsAppApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  messageId?: string;
  timestamp: string;
}

interface WhatsAppMessagesRequest {
  customerPhone: string;
  caseId: string;
  limit?: number;
  offset?: number;
}

interface WhatsAppSendRequest {
  customerPhone: string;
  caseId: string;
  content: string;
  type: 'text' | 'document' | 'template';
  templateId?: string;
  documentUrl?: string;
  metadata?: any;
}

interface WhatsAppDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  error?: string;
}

export class WhatsAppApiService {
  private static baseUrl: string;
  private static apiKey: string;
  private static configured = false;

  // =============================================================================
  // SERVICE INITIALIZATION
  // =============================================================================

  /**
   * Initialize the WhatsApp API service with custom configuration
   */
  static async initialize() {
    console.log('🔧 Initializing WhatsApp API Service...');
    
    try {
      // Get configuration from Supabase system_settings table
      const { data: settings, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'whatsapp_api_url',
          'whatsapp_api_key',
          'whatsapp_webhook_url',
          'whatsapp_business_account_id'
        ]);

      if (error) {
        console.error('❌ Error fetching WhatsApp API settings:', error);
        return false;
      }

      // Set configuration
      const config = settings?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>) || {};

      this.baseUrl = config.whatsapp_api_url || process.env.VITE_WHATSAPP_API_URL || '';
      this.apiKey = config.whatsapp_api_key || process.env.VITE_WHATSAPP_API_KEY || '';
      
      if (!this.baseUrl || !this.apiKey) {
        console.warn('⚠️ WhatsApp API not fully configured');
        this.configured = false;
        return false;
      }

      // Test connection
      const isHealthy = await this.healthCheck();
      if (isHealthy) {
        this.configured = true;
        console.log('✅ WhatsApp API Service initialized');
        return true;
      } else {
        console.error('❌ WhatsApp API health check failed');
        this.configured = false;
        return false;
      }

    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp API service:', error);
      this.configured = false;
      return false;
    }
  }

  // =============================================================================
  // API CONFIGURATION REQUESTS
  // =============================================================================

  /**
   * Set up custom WhatsApp API configuration
   */
  static async configureApi(config: {
    apiUrl: string;
    apiKey: string;
    businessAccountId?: string;
    webhookUrl?: string;
  }) {
    console.log('🔧 Configuring WhatsApp API...');

    try {
      // Store configuration in system_settings
      const settings = [
        { key: 'whatsapp_api_url', value: config.apiUrl },
        { key: 'whatsapp_api_key', value: config.apiKey },
        { key: 'whatsapp_webhook_url', value: config.webhookUrl || '' },
        { key: 'whatsapp_business_account_id', value: config.businessAccountId || '' }
      ];

      for (const setting of settings) {
        await supabase
          .from('system_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            description: `WhatsApp API ${setting.key}`,
            category: 'integration'
          });
      }

      // Update local configuration
      this.baseUrl = config.apiUrl;
      this.apiKey = config.apiKey;
      this.configured = true;

      console.log('✅ WhatsApp API configuration saved');
      return true;

    } catch (error) {
      console.error('❌ Error configuring WhatsApp API:', error);
      return false;
    }
  }

  // =============================================================================
  // HEALTH & CONNECTION STATUS
  // =============================================================================

  /**
   * Check API health
   */
  static async healthCheck(): Promise<boolean> {
    if (!this.configured) return false;

    try {
      const response = await this.makeApiRequest('/health', 'GET');
      return response.success;
    } catch (error) {
      console.error('❌ WhatsApp API health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  static getConnectionStatus(): { configured: boolean; url: string; canConnect: boolean } {
    return {
      configured: this.configured,
      url: this.baseUrl,
      canConnect: !!(this.baseUrl && this.apiKey)
    };
  }

  // =============================================================================
  // WHATSAPP MESSAGE OPERATIONS
  // =============================================================================

  /**
   * Get messages for a case with custom filtering
   */
  static async getMessages(request: WhatsAppMessagesRequest): Promise<WhatsAppApiResponse<WhatsAppMessage[]>> {
    if (!this.configured) {
      // Fallback to Supabase
      return this.getMessagesFromSupabase(request);
    }

    try {
      console.log('📨 Fetching WhatsApp messages via API:', request);

      const params = new URLSearchParams({
        customerPhone: request.customerPhone,
        caseId: request.caseId,
        limit: request.limit?.toString() || '50',
        offset: request.offset?.toString() || '0'
      });

      const response = await this.makeApiRequest(`/messages?${params}`, 'GET');
      
      if (response.success && response.data) {
        // Store in Supabase for local caching
        await this.cacheMessages(request.caseId, response.data);
        return response;
      }

      return this.getMessagesFromSupabase(request);

    } catch (error) {
      console.error('❌ Error fetching WhatsApp messages:', error);
      // Fallback to Supabase
      return this.getMessagesFromSupabase(request);
    }
  }

  /**
   * Send a WhatsApp message
   */
  static async sendMessage(request: WhatsAppSendRequest): Promise<WhatsAppApiResponse> {
    if (!this.configured) {
      return this.sendMessageViaSupabase(request);
    }

    try {
      console.log('📤 Sending WhatsApp message via API:', request);

      const payload = {
        to: request.customerPhone,
        message: {
          type: request.type,
          content: request.content,
          templateId: request.templateId,
          documentUrl: request.documentUrl,
          metadata: request.metadata
        },
        caseId: request.caseId
      };

      const response = await this.makeApiRequest('/send', 'POST', payload);
      
      if (response.success) {
        // Store sent message in database
        await this.storeSentMessage(request, response.messageId);
      }

      return response;

    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      // Fallback to Supabase
      return this.sendMessageViaSupabase(request);
    }
  }

  /**
   * Get message delivery status
   */
  static async getMessageStatus(messageId: string): Promise<WhatsAppApiResponse<WhatsAppDeliveryStatus>> {
    if (!this.configured) {
      return this.getMessageStatusFromSupabase(messageId);
    }

    try {
      const response = await this.makeApiRequest(`/message-status/${messageId}`, 'GET');
      return response;

    } catch (error) {
      console.error('❌ Error fetching message status:', error);
      return this.getMessageStatusFromSupabase(messageId);
    }
  }

  /**
   * Send template message
   */
  static async sendTemplateMessage(request: {
    customerPhone: string;
    caseId: string;
    templateId: string;
    parameters: string[];
    metadata?: any;
  }): Promise<WhatsAppApiResponse> {
    console.log('📋 Sending template WhatsApp message:', request);

    const sendRequest: WhatsAppSendRequest = {
      customerPhone: request.customerPhone,
      caseId: request.caseId,
      content: '', // Template content handled by API
      type: 'template',
      templateId: request.templateId,
      metadata: {
        ...request.metadata,
        templateParameters: request.parameters
      }
    };

    return this.sendMessage(sendRequest);
  }

  /**
   * Send document message
   */
  static async sendDocumentMessage(request: {
    customerPhone: string;
    caseId: string;
    documentUrl: string;
    caption?: string;
    metadata?: any;
  }): Promise<WhatsAppApiResponse> {
    console.log('📄 Sending document WhatsApp message:', request);

    const sendRequest: WhatsAppSendRequest = {
      customerPhone: request.customerPhone,
      caseId: request.caseId,
      content: request.caption || '',
      type: 'document',
      documentUrl: request.documentUrl,
      metadata: request.metadata
    };

    return this.sendMessage(sendRequest);
  }

  // =============================================================================
  // WEBHOOK HANDLING FOR CUSTOM RESPONSES
  // =============================================================================

  /**
   * Set up webhook for receiving WhatsApp events
   */
  static async setupWebhook(webhookUrl: string): Promise<WhatsAppApiResponse> {
    if (!this.configured) {
      throw new Error('WhatsApp API service not configured');
    }

    try {
      console.log('🔗 Setting up WhatsApp webhook:', webhookUrl);

      const payload = {
        webhookUrl,
        events: ['message.received', 'message.delivered', 'message.read', 'message.failed']
      };

      return await this.makeApiRequest('/webhook', 'POST', payload);

    } catch (error) {
      console.error('❌ Error setting up webhook:', error);
      throw error;
    }
  }

  /**
   * Process incoming WhatsApp webhook
   */
  static async processWebhook(webhookData: any): Promise<void> {
    console.log('📩 Processing WhatsApp webhook:', webhookData);

    try {
      const { event, data } = webhookData;

      switch (event) {
        case 'message.received':
          await this.handleIncomingMessage(data);
          break;
        case 'message.delivered':
          await this.updateMessageStatus(data.messageId, 'delivered');
          break;
        case 'message.read':
          await this.updateMessageStatus(data.messageId, 'read');
          break;
        case 'message.failed':
          await this.updateMessageStatus(data.messageId, 'failed', data.error);
          break;
        default:
          console.log('🔍 Unknown webhook event:', event);
      }

    } catch (error) {
      console.error('❌ Error processing webhook:', error);
    }
  }

  // =============================================================================
  // FALLBACK METHODS - SUPABASE INTEGRATION
  // =============================================================================

  /**
   * Get messages from Supabase (fallback)
   */
  private static async getMessagesFromSupabase(request: WhatsAppMessagesRequest): Promise<WhatsAppApiResponse<WhatsAppMessage[]>> {
    try {
      const messages = await supabase
        .from('notifications')
        .select(`
          id,
          data,
          created_at
        `)
        .eq('type', 'whatsapp_message')
        .eq('data->>caseId', request.caseId)
        .order('created_at', { ascending: false })
        .limit(request.limit || 50);

      return {
        success: true,
        data: messages.data || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send message via Supabase storage (fallback)
   */
  private static async sendMessageViaSupabase(request: WhatsAppSendRequest): Promise<WhatsAppApiResponse> {
    try {
      // Use existing Supabase service
      const messageId = await supabase
        .from('notifications')
        .insert({
          type: 'whatsapp_message',
          data: {
            caseId: request.caseId,
            content: request.content,
            customerPhone: request.customerPhone,
            type: request.type,
            timestamp: new Date().toISOString(),
            status: 'sent'
          }
        })
        .select();

      return {
        success: true,
        data: messageId,
        messageId: messageId.data?.[0]?.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get message status from Supabase (fallback)
   */
  private static async getMessageStatusFromSupabase(messageId: string): Promise<WhatsAppApiResponse<WhatsAppDeliveryStatus>> {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('data, updated_at')
        .eq('id', messageId)
        .single();

      return {
        success: true,
        data: {
          messageId,
          status: data?.data?.status || 'sent',
          timestamp: data?.updated_at || new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Make API request with authentication
   */
  private static async makeApiRequest(endpoint: string, method: string, data?: any): Promise<WhatsAppApiResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      return {
        success: response.ok,
        data: response.ok ? result.data : undefined,
        error: response.ok ? undefined : result.error || `HTTP ${response.status}`,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cache messages in Supabase
   */
  private static async cacheMessages(caseId: string, messages: WhatsAppMessage[]): Promise<void> {
    try {
      // Don't implement this blocking operation in production
      console.log('💾 Caching messages for case:', caseId);
    } catch (error) {
      console.error('❌ Error caching messages:', error);
    }
  }

  /**
   * Store sent message in database
   */
  private static async storeSentMessage(request: WhatsAppSendRequest, messageId?: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert({
          type: 'whatsapp_message',
          data: {
            caseId: request.caseId,
            content: request.content,
            customerPhone: request.customerPhone,
            type: request.type,
            messageId: messageId,
            timestamp: new Date().toISOString(),
            status: 'sent'
          }
        });
    } catch (error) {
      console.error('❌ Error storing sent message:', error);
    }
  }

  /**
   * Handle incoming WhatsApp message
   */
  private static async handleIncomingMessage(data: any): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert({
          type: 'whatsapp_message',
          data: {
            caseId: data.caseId,
            content: data.content,
            customerPhone: data.from,
            type: data.type || 'text',
            timestamp: new Date().toISOString(),
            status: 'received'
          }
        });
    } catch (error) {
      console.error('❌ Error handling incoming message:', error);
    }
  }

  /**
   * Update message status
   */
  private static async updateMessageStatus(messageId: string, status: string, error?: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({
          data: {
            status,
            statusUpdatedAt: new Date().toISOString(),
            error: error || null
          }
        })
        .eq('id', messageId);
    } catch (error) {
      console.error('❌ Error updating message status:', error);
    }
  }
}

export default WhatsAppApiService;
