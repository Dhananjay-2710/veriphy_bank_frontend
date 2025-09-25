import { SupabaseDatabaseService } from './supabase-database';

export interface Notification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient: string; // user ID or role
  recipientType: 'user' | 'role' | 'email' | 'sms';
  caseId?: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}

export type NotificationType = 
  | 'application_received'
  | 'documents_required'
  | 'loan_approved'
  | 'loan_rejected'
  | 'sla_violation'
  | 'case_assigned'
  | 'case_updated'
  | 'document_uploaded'
  | 'compliance_issue'
  | 'system_alert'
  | 'task_assigned'
  | 'task_overdue'
  | 'approval_required'
  | 'escalation'
  | 'reminder';

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
}

export class NotificationService {
  private static templates: Map<NotificationType, NotificationTemplate> = new Map();

  // Initialize notification templates
  static initializeTemplates() {
    const templates: NotificationTemplate[] = [
      {
        type: 'application_received',
        title: 'Loan Application Received',
        message: 'Your loan application #{caseNumber} has been received and is under review. We will contact you within 24 hours.',
        priority: 'medium',
        channels: ['email', 'sms', 'in_app']
      },
      {
        type: 'documents_required',
        title: 'Additional Documents Required',
        message: 'Please upload the following documents for your loan application #{caseNumber}: {requiredDocuments}',
        priority: 'high',
        channels: ['email', 'sms', 'in_app']
      },
      {
        type: 'loan_approved',
        title: 'Congratulations! Loan Approved',
        message: 'Your loan application #{caseNumber} has been approved for ₹{loanAmount}. Disbursement will be processed within 2-3 business days.',
        priority: 'high',
        channels: ['email', 'sms', 'in_app']
      },
      {
        type: 'loan_rejected',
        title: 'Loan Application Update',
        message: 'We regret to inform you that your loan application #{caseNumber} could not be approved at this time. Please contact us for more information.',
        priority: 'medium',
        channels: ['email', 'sms', 'in_app']
      },
      {
        type: 'sla_violation',
        title: 'SLA Violation Alert',
        message: 'Case #{caseNumber} has exceeded SLA for {stepName}. Please take immediate action.',
        priority: 'urgent',
        channels: ['email', 'in_app']
      },
      {
        type: 'case_assigned',
        title: 'New Case Assigned',
        message: 'A new case #{caseNumber} has been assigned to you for {customerName}.',
        priority: 'medium',
        channels: ['email', 'in_app']
      },
      {
        type: 'case_updated',
        title: 'Case Status Updated',
        message: 'Case #{caseNumber} status has been updated to {newStatus}.',
        priority: 'low',
        channels: ['in_app']
      },
      {
        type: 'document_uploaded',
        title: 'Document Uploaded',
        message: 'New document uploaded for case #{caseNumber}. Please review.',
        priority: 'medium',
        channels: ['in_app']
      },
      {
        type: 'compliance_issue',
        title: 'Compliance Issue Detected',
        message: 'A compliance issue has been detected in case #{caseNumber}. Immediate attention required.',
        priority: 'urgent',
        channels: ['email', 'in_app']
      },
      {
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'A new task "{taskTitle}" has been assigned to you.',
        priority: 'medium',
        channels: ['email', 'in_app']
      },
      {
        type: 'task_overdue',
        title: 'Task Overdue',
        message: 'Task "{taskTitle}" is overdue. Please complete it as soon as possible.',
        priority: 'high',
        channels: ['email', 'in_app']
      },
      {
        type: 'approval_required',
        title: 'Approval Required',
        message: 'Your approval is required for case #{caseNumber}.',
        priority: 'high',
        channels: ['email', 'in_app']
      },
      {
        type: 'escalation',
        title: 'Case Escalated',
        message: 'Case #{caseNumber} has been escalated to you for review.',
        priority: 'urgent',
        channels: ['email', 'in_app']
      },
      {
        type: 'reminder',
        title: 'Reminder',
        message: '{message}',
        priority: 'low',
        channels: ['email', 'in_app']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.type, template);
    });
  }

  // Send a notification
  static async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const template = this.templates.get(notification.type);
    if (!template) {
      throw new Error(`Notification template for type ${notification.type} not found`);
    }

    // Process message with data
    let processedMessage = template.message;
    if (notification.data) {
      Object.entries(notification.data).forEach(([key, value]) => {
        processedMessage = processedMessage.replace(`{${key}}`, String(value));
      });
    }

    const fullNotification: Notification = {
      ...notification,
      title: notification.title || template.title,
      message: processedMessage,
      priority: notification.priority || template.priority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save to database
    const notificationId = await this.saveNotification(fullNotification);

    // Send through appropriate channels
    await this.sendThroughChannels(fullNotification, template.channels);

    return notificationId;
  }

  // Save notification to database
  private static async saveNotification(notification: Notification): Promise<string> {
    try {
      const result = await SupabaseDatabaseService.createNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipient: notification.recipient,
        recipient_type: notification.recipientType,
        case_id: notification.caseId,
        data: notification.data,
        priority: notification.priority,
        status: notification.status
      });

      return result.id;
    } catch (error) {
      console.error('Error saving notification:', error);
      throw error;
    }
  }

  // Send notification through specified channels
  private static async sendThroughChannels(notification: Notification, channels: string[]): Promise<void> {
    const promises = channels.map(channel => {
      switch (channel) {
        case 'email':
          return this.sendEmail(notification);
        case 'sms':
          return this.sendSMS(notification);
        case 'push':
          return this.sendPush(notification);
        case 'in_app':
          return this.sendInApp(notification);
        default:
          console.warn(`Unknown notification channel: ${channel}`);
          return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  // Send email notification
  private static async sendEmail(notification: Notification): Promise<void> {
    try {
      // Get recipient email
      const recipientEmail = await this.getRecipientEmail(notification);
      if (!recipientEmail) {
        console.warn('No email found for recipient:', notification.recipient);
        return;
      }

      // In a real implementation, you would integrate with an email service like SendGrid, AWS SES, etc.
      console.log(`📧 Email sent to ${recipientEmail}:`, {
        subject: notification.title,
        body: notification.message
      });

      // Update notification status
      await this.updateNotificationStatus(notification.id!, 'sent');
    } catch (error) {
      console.error('Error sending email:', error);
      await this.updateNotificationStatus(notification.id!, 'failed');
    }
  }

  // Send SMS notification
  private static async sendSMS(notification: Notification): Promise<void> {
    try {
      // Get recipient phone number
      const recipientPhone = await this.getRecipientPhone(notification);
      if (!recipientPhone) {
        console.warn('No phone number found for recipient:', notification.recipient);
        return;
      }

      // In a real implementation, you would integrate with an SMS service like Twilio, AWS SNS, etc.
      console.log(`📱 SMS sent to ${recipientPhone}:`, notification.message);

      // Update notification status
      await this.updateNotificationStatus(notification.id!, 'sent');
    } catch (error) {
      console.error('Error sending SMS:', error);
      await this.updateNotificationStatus(notification.id!, 'failed');
    }
  }

  // Send push notification
  private static async sendPush(notification: Notification): Promise<void> {
    try {
      // In a real implementation, you would integrate with a push notification service
      console.log(`🔔 Push notification sent:`, {
        title: notification.title,
        body: notification.message
      });

      // Update notification status
      await this.updateNotificationStatus(notification.id!, 'sent');
    } catch (error) {
      console.error('Error sending push notification:', error);
      await this.updateNotificationStatus(notification.id!, 'failed');
    }
  }

  // Send in-app notification
  private static async sendInApp(notification: Notification): Promise<void> {
    try {
      // In-app notifications are handled by the real-time subscription system
      console.log(`🔔 In-app notification created:`, {
        title: notification.title,
        body: notification.message
      });

      // Update notification status
      await this.updateNotificationStatus(notification.id!, 'sent');
    } catch (error) {
      console.error('Error creating in-app notification:', error);
      await this.updateNotificationStatus(notification.id!, 'failed');
    }
  }

  // Get recipient email
  private static async getRecipientEmail(notification: Notification): Promise<string | null> {
    try {
      if (notification.recipientType === 'email') {
        return notification.recipient;
      }

      // Get user email from database
      const user = await SupabaseDatabaseService.getUserById(notification.recipient);
      return user?.email || null;
    } catch (error) {
      console.error('Error getting recipient email:', error);
      return null;
    }
  }

  // Get recipient phone number
  private static async getRecipientPhone(notification: Notification): Promise<string | null> {
    try {
      if (notification.recipientType === 'sms') {
        return notification.recipient;
      }

      // Get user phone from database
      const user = await SupabaseDatabaseService.getUserById(notification.recipient);
      return user?.mobile || null;
    } catch (error) {
      console.error('Error getting recipient phone:', error);
      return null;
    }
  }

  // Update notification status
  private static async updateNotificationStatus(notificationId: string, status: Notification['status']): Promise<void> {
    try {
      await SupabaseDatabaseService.updateNotification(notificationId, { status });
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  }

  // Get notifications for a user
  static async getNotificationsForUser(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      return await SupabaseDatabaseService.getNotificationsForUser(userId, limit);
    } catch (error) {
      console.error('Error getting notifications for user:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await SupabaseDatabaseService.updateNotification(notificationId, {
        read_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      return await SupabaseDatabaseService.getNotificationStats(userId);
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, unread: 0, byType: {}, byPriority: {} };
    }
  }

  // Send bulk notifications
  static async sendBulkNotifications(notifications: Omit<Notification, 'id' | 'createdAt' | 'status'>[]): Promise<string[]> {
    const results = await Promise.allSettled(
      notifications.map(notification => this.sendNotification(notification))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<string>).value);
  }

  // Schedule notification for later
  static async scheduleNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>, delayMinutes: number): Promise<string> {
    const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    // In a real implementation, you would use a job queue like Bull, Agenda, or AWS SQS
    setTimeout(async () => {
      await this.sendNotification(notification);
    }, delayMinutes * 60 * 1000);

    return `scheduled_${Date.now()}`;
  }

  // Send notification with case data
  static async sendNotificationWithCaseData(
    type: NotificationType, 
    caseId: string, 
    recipient: string, 
    additionalData: Record<string, any> = {}
  ): Promise<string> {
    console.log('Sending notification with case data:', { type, caseId, recipient });

    // Get case data
    const caseData = await SupabaseDatabaseService.getCaseById(caseId);
    if (!caseData) {
      throw new Error(`Case not found: ${caseId}`);
    }

    // Get customer data
    const customerData = await SupabaseDatabaseService.getCustomerById(caseData.customer_id);
    
    // Prepare notification data
    const notificationData = {
      caseId,
      caseNumber: caseData.case_number,
      customerName: customerData?.full_name || 'Unknown Customer',
      loanAmount: caseData.loan_amount || 0,
      ...additionalData
    };

    // Get template and format message
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`No template found for notification type: ${type}`);
    }

    const formattedMessage = this.formatMessage(template.message, notificationData);
    const formattedTitle = this.formatMessage(template.title, notificationData);

    return this.sendNotification({
      type,
      title: formattedTitle,
      message: formattedMessage,
      recipient,
      recipientType: 'user',
      caseId,
      data: notificationData,
      priority: template.priority
    });
  }

  // Format message with data
  private static formatMessage(message: string, data: Record<string, any>): string {
    let formattedMessage = message;
    
    // Replace placeholders with actual data
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'g'), data[key] || '');
    });

    return formattedMessage;
  }
}

// Initialize templates when the module loads
NotificationService.initializeTemplates();
