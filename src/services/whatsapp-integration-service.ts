import { WhatsAppService } from './whatsapp-service';
import { WhatsAppApiService } from './whatsapp-api-service';
import { supabase } from '../supabase-client';

// =============================================================================
// WHATSAPP INTEGRATION INITIALIZATION SERVICE
// =============================================================================

export class WhatsAppIntegrationService {
  private static initialized = false;
  private static configValid = false;

  /**
   * Initialize the entire WhatsApp integration
   * Call this on app startup or when user logs in
   */
  static async initializeIntegration(): Promise<{
    success: boolean;
    message: string;
    services: {
      websocket: boolean;
      api: boolean;
      supabase: boolean;
    };
  }> {
    console.log('🚀 Initializing WhatsApp Integration Service...');

    const results = {
      success: false,
      message: '',
      services: {
        websocket: false,
        api: false,
        supabase: false
      }
    };

    try {
      // 1. Validate Supabase connection
      console.log('📊 Validating Supabase connection...');
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .limit(1);
        
        if (error) throw error;
        
        results.services.supabase = true;
        console.log('✅ Supabase connection validated');
      } catch (error) {
        console.error('❌ Supabase validation failed:', error);
        results.message += 'Supabase connection failed. ';
      }

      // 2. Initialize API service
      console.log('🔧 Initializing WhatsApp API service...');
      try {
        const apiInitialized = await WhatsAppApiService.initialize();
        results.services.api = apiInitialized;
        
        if (apiInitialized) {
          console.log('✅ WhatsApp API service initialized');
        } else {
          console.warn('⚠️ WhatsApp API service using fallback mode');
        }
      } catch (error) {
        console.error('❌ WhatsApp API initialization failed:', error);
        results.message += 'API service failed. ';
      }

      // 3. Initialize WebSocket service
      console.log('🔌 Initializing WhatsApp WebSocket service...');
      try {
        const { data: settings } = await supabase
          .from('system_settings')
          .select('value')
          .in('key', ['whatsapp_api_key', 'whatsapp_websocket_url']);
        
        const apiKey = settings?.find(s => s.key === 'whatsapp_api_key')?.value;
        const webSocketUrl = settings?.find(s => s.key === 'whatsapp_websocket_url')?.value;
        
        if (apiKey && webSocketUrl) {
          await WhatsAppService.initializeConnection(apiKey, webSocketUrl);
          results.services.websocket = true;
          console.log('✅ WhatsApp WebSocket service initialized');
        } else {
          console.warn('⚠️ WebSocket configuration incomplete, using polling fallback');
          results.services.websocket = false;
        }
      } catch (error) {
        console.error('❌ WhatsApp WebSocket initialization failed:', error);
        results.message += 'WebSocket service failed. ';
      }

      // 4. Store user-specific settings if available
      try {
        await this.configureForCurrentUser();
        console.log('✅ User-specific settings applied');
      } catch (error) {
        console.warn('⚠️ Could not apply user-specific settings:', error);
      }

      // 5. Determine overall success
      results.success = results.services.supabase && (results.services.api || results.services.websocket);
      
      if (results.success) {
        results.message = 'WhatsApp integration initialized successfully';
        this.initialized = true;
        this.configValid = true;
      } else {
        results.message = 'WhatsApp integration partially initialized. ' + results.message;
        // Still mark as initialized but with warnings
        this.initialized = true;
        this.configValid = false;
      }

      console.log('🎯 WhatsApp Integration Summary:', results);
      return results;

    } catch (error) {
      console.error('❌ Critical error initializing WhatsApp integration:', error);
      results.success = false;
      results.message = 'Failed to initialize WhatsApp integration: ' + (error instanceof Error ? error.message : 'Unknown error');
      return results;
    }
  }

  /**
   * Check if WebSocket connection is available and establish it
   */
  static async establishWebSocketConnection(): Promise<boolean> {
    console.log('🔌 Establishing WebSocket connection...');

    try {
      // Get configuration
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .in('key', ['whatsapp_api_key', 'whatsapp_websocket_url'])
        .order('key');

      const apiKey = settings?.find(s => s.key === 'whatsapp_api_key')?.value;
      const webSocketUrl = settings?.find(s => s.key === 'whatsapp_websocket_url')?.value;

      if (!apiKey || !webSocketUrl) {
        console.warn('⚠️ WebSocket configuration missing');
        return false;
      }

      // Initialize connection
      await WhatsAppService.initializeConnection(apiKey, webSocketUrl);
      
      console.log('✅ WebSocket connection established');
      return true;

    } catch (error) {
      console.error('❌ Failed to establish WebSocket connection:', error);
      return false;
    }
  }

  /**
   * Configure WhatsApp API settings
   */
  static async configureApiSettings(config: {
    apiUrl: string;
    apiKey: string;
    businessAccountId?: string;
    webhookUrl?: string;
    webSocketUrl?: string;
  }): Promise<boolean> {
    console.log('🔧 Configuring WhatsApp API settings...');

    try {
      const settingsToStore = [
        { key: 'whatsapp_api_url', value: config.apiUrl, description: 'WhatsApp API Base URL', category: 'integration' },
        { key: 'whatsapp_api_key', value: config.apiKey, description: 'WhatsApp API Key', category: 'integration' },
        { key: 'whatsapp_business_account_id', value: config.businessAccountId || '', description: 'WhatsApp Business Account ID', category: 'integration' },
        { key: 'whatsapp_webhook_url', value: config.webhookUrl || '', description: 'WhatsApp Webhook URL', category: 'integration' },
        { key: 'whatsapp_websocket_url', value: config.webSocketUrl || '', description: 'WhatsApp WebSocket URL', category: 'integration' }
      ];

      // Store all settings
      for (const setting of settingsToStore) {
        await supabase
          .from('system_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            description: setting.description,
            category: setting.category
          });
      }

      console.log('✅ WhatsApp API settings configured');
      
      // Re-initialize services with new settings
      await this.initializeIntegration();
      
      return true;

    } catch (error) {
      console.error('❌ Error configuring WhatsApp API settings:', error);
      return false;
    }
  }

  /**
   * Get integration status
   */
  static getIntegrationStatus(): {
    initialized: boolean;
    configValid: boolean;
    websocketConnected: boolean;
    apiConfigured: boolean;
  } {
    const websocketConnected = WhatsAppService && 
      typeof (WhatsAppService as any).isConnected === 'boolean' ? 
      (WhatsAppService as any).isConnected : false;
    
    const apiConfigured = WhatsAppApiService.getConnectionStatus().configured;

    return {
      initialized: this.initialized,
      configValid: this.configValid,
      websocketConnected,
      apiConfigured
    };
  }

  /**
   * Disconnect and cleanup
   */
  static disconnect(): void {
    console.log('🔌 Disconnecting WhatsApp services...');
    
    // Disconnect services
    WhatsAppService.disconnect();
    
    // Reset state
    this.initialized = false;
    this.configValid = false;
    
    console.log('✅ WhatsApp services disconnected');
  }

  /**
   * Check pending webhooks/messages that need processing
   */
  static async processPendingMessages(): Promise<void> {
    console.log('📨 Processing pending WhatsApp messages...');

    try {
      // Get messages marked as 'pending' that might need resending
      const { data: pendingMessages } = await supabase
        .from('notifications')
        .select('id, data')
        .eq('type', 'whatsapp_message')
        .eq('data->>status', 'pending')
        .order('created_at', { ascending: true })
        .limit(10);

      if (pendingMessages && pendingMessages.length > 0) {
        console.log(`📬 Found ${pendingMessages.length} pending messages`);
        
        // Process each pending message
        for (const message of pendingMessages) {
          try {
            console.log(`📤 Processing pending message ${message.id}...`);
            
            // Attempt to send via API or mark as retry later
            // This could be expanded based on business needs
            await supabase
              .from('notifications')
              .update({
                data: {
                  ...message.data,
                  status: 'retry_pending',
                  retryCount: ((message.data as any)?.retryCount || 0) + 1,
                  lastAttempt: new Date().toISOString()
                }
              })
              .eq('id', message.id);
            
          } catch (messageError) {
            console.error(`❌ Error processing message ${message.id}:`, messageError);
          }
        }
      }

    } catch (error) {
      console.error('❌ Error processing pending messages:', error);
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Configure settings specific to current user
   */
  private static async configureForCurrentUser(): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('👤 No authenticated user, skipping user-specific configuration');
        return;
      }

      // Get user's organization settings for WhatsApp
      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('auth_id', user.id)
        .single();

      if (userData?.organization_id) {
        // Check if organization has specific WhatsApp settings
        const { data: orgSettings } = await supabase
          .from('organizations')
          .select('settings')
          .eq('id', userData.organization_id)
          .single();

        if (orgSettings?.settings?.whatsapp) {
          console.log('🔧 Applying organization-specific WhatsApp settings');
          // Apply organization WhatsApp preferences
          // This could include templates, business hours, etc.
        }
      }

    } catch (error) {
      console.error('❌ Error configuring for current user:', error);
      throw error;
    }
  }
}

// Auto-initialize on module load (optional)
export const initializeWhatsAppIntegration = WhatsAppIntegrationService.initializeIntegration;

export default WhatsAppIntegrationService;
